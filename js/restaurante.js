import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, deleteDoc} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL  } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { verAutenticacion } from "./firebase.js";

const db = getFirestore();
const storage = getStorage();
var operacion;
var idRestauranteGolbal;

window.onload = function () {
    verAutenticacion();
    cargarRestaurantes();
}

function cargarRestaurantes(){

    let contenido="<table class='table mt-2'>";

    contenido+="<thead>";
    contenido+="<tr>";

    contenido+="<th>Id</th>";
    contenido+="<th>Nombre</th>";
    contenido+="<th>Direccion</th>";
    contenido+="<th>Foto</th>";
    contenido+="<th>Menu</th>";
    contenido+="<th>Rating</th>";
    contenido+="<th>Opciones</th>";

    contenido+="</tr>";
    contenido+="</thead>";

    contenido+="<tbody>";
    
    const q = query(collection(db, "restaurante"), where("visible", "==", true));
    getDocs(q).then(querySnapshot =>{

        querySnapshot.forEach(rpta => {
            //console.log(rpta.id, " => ", rpta.data());
            const fila=rpta.data();
            contenido+="<tr>";
            contenido+="<td>"+rpta.id+"</td>";
            contenido+="<td>"+fila.nombre+"</td>";
            contenido+="<td>"+fila.direccion+"</td>";
            contenido+="<td><img src=" + fila.foto + " width=\"100\" height=\"100\" /></td>";
            contenido+="<td><a href='"+ fila.menu + "' target='_blank'>Ver</a></td>";
            contenido+="<td>"+ calularRating(fila.rating) +"</td>";
            contenido+="<td>";
            contenido+="<input type='button' class='btn btn-primary' value='Editar' onclick='abrirModal(\""+rpta.id+"\")' data-toggle='modal' data-target='#exampleModal' />";
            contenido+="<input type='button' value='Eliminar' class='btn btn-danger' onclick='eliminar(\""+rpta.id+"\")' />";
            contenido+="</td>";
            contenido+="</tr>";

        });

        contenido+="</tbody>";
        contenido+="</table>";
        document.getElementById("divRestaurante").innerHTML=contenido;

    }).catch((error) => {
        console.log(error);
    });
}

function calularRating(rating){
    let contenido = "<div>";
    for(let i = 1; i <= 5; i++) {
        if(rating >= i)
            contenido += "<span class=\"fa fa-star checked\"></span>";
        else    
            contenido += "<span class=\"fa fa-star \"></span>";
    }
    contenido += "</div>";
    return contenido;
}

window.abrirModal = function abrirModal(idRestaurante) {
    limpiarDatos();
    if(idRestaurante == 0) {
        operacion = 1;
        document.getElementById("lblTitulo").innerHTML = "Agregar restaurante";
    } else {
        operacion = 2;
        document.getElementById("lblTitulo").innerHTML = "Editar restaurante";
        idRestauranteGolbal = idRestaurante;
        cargarDatos(idRestaurante);
    }

}

function cargarDatos(idRestaurante) {

    const docRef = doc(db, "restaurante", idRestaurante);
    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
            
            const data = docSnap.data();
            document.getElementById("txtnombre").value = data.nombre;
            document.getElementById("txtdireccion").value = data.direccion;
            document.getElementById("imgFoto").src = data.foto;
            document.getElementById("iframePreview").src = data.menu;

        } else {
            alert("No se puede encontrar el restaurante");
        }
    }).catch((error) => {
        alert("Ocurrio un error" + error.message);
    });

}

// limpiar el modal
function limpiarDatos() {
    document.getElementById("txtnombre").value = "";
    document.getElementById("txtdireccion").value = "";
    document.getElementById("imgFoto").src = 'asset/img/nouser.jpg';
    document.getElementById("iframePreview").src = "";

    document.getElementById("alertaErrorCrearRestaurante").style.display = "none";
    document.getElementById("alertaErrorCrearRestaurante").innerHTML = "";
}

window.subirImage = function subirImage(e) {
    const file = e.files[0];
    let reader = new FileReader();
    reader.onloadend= function() {
        document.getElementById("imgFoto").src = reader.result;
    }
    reader.readAsDataURL(file);
}

window.subirArchivo = function subirArchivo(e) {
    const file = e.files[0];
    let reader = new FileReader();
    reader.onloadend= function() {
        document.getElementById("iframePreview").src = reader.result;
    }
    reader.readAsDataURL(file);
}

window.descargarArchivo = function descargarArchivo() {
    const linkSource = document.getElementById("iframePreview").src;
    const downloadLink = document.createElement("a");
    const filename = "menuSoprte.pdf";
    downloadLink.href= linkSource;
    downloadLink.download = filename;
    downloadLink.target = "_black";
    downloadLink.click();
}

window.operar = function operar() {
    if(operacion == 1) {
        guardar();
    } else {
        editar();
    }
}

function editar() {
    const nombre = document.getElementById("txtnombre").value;
    const direccion = document.getElementById("txtdireccion").value;
    const promises = [];

    let uploadTask, uploadTaskFile;
    if(document.getElementById("imgFoto").src.includes('data:image/')){
        const foto = document.getElementById("fileImage").files[0];
        const imageRef = ref(storage, 'restaurante/foto/' + idRestauranteGolbal);
        uploadTask = uploadBytesResumable(imageRef, foto);
        promises.push(uploadTask);
    }

    if(document.getElementById("iframePreview").src.includes('data:application/')){
        const archivo = document.getElementById("file").files[0];
        const pdfRef = ref(storage, 'restaurante/menu/' + idRestauranteGolbal);
        uploadTaskFile = uploadBytesResumable(pdfRef, archivo);
        promises.push(uploadTaskFile);
    }
    
    Promise.all(promises).then(values =>{

        let flagSuccess = true;
        values.forEach(rpta =>{
                if(rpta.state !== "success"){
                    flagSuccess = false;
                    return;
                }
        });

        if(flagSuccess) {

            let downloadUrlFoto, downloadUrlPdf;
            let fotoBoolean = false;
            let documentoBoolean = false;
            const promises2 = [];
            if(document.getElementById("imgFoto").src.includes('data:image/')){
                downloadUrlFoto = getDownloadURL(uploadTask.snapshot.ref);
                promises2.push(downloadUrlFoto);
                fotoBoolean = true;
            }
            if(document.getElementById("iframePreview").src.includes('data:application/')){
                downloadUrlPdf = getDownloadURL(uploadTaskFile.snapshot.ref);
                promises2.push(downloadUrlPdf);
                documentoBoolean = true;
            }

            Promise.all(promises2).then(values =>{
                let fotoUrlFinal, documentoUrlFinal;   
                if(fotoBoolean && documentoBoolean) {
                    fotoUrlFinal = values[0];
                    documentoUrlFinal = values[1];
                } else if (fotoBoolean && !documentoBoolean) {
                    fotoUrlFinal = values[0];
                    documentoUrlFinal = document.getElementById("iframePreview").src;
                } else if(!fotoBoolean && documentoBoolean){
                    fotoUrlFinal = document.getElementById("imgFoto").src;
                    documentoUrlFinal = values[0];
                } else {
                    fotoUrlFinal = document.getElementById("imgFoto").src;
                    documentoUrlFinal = document.getElementById("iframePreview").src;
                }

                const restauranteRef = doc(db, "restaurante", idRestauranteGolbal);
                updateDoc(restauranteRef, {
                        nombre: nombre,
                        direccion: direccion,
                        foto: fotoUrlFinal,
                        menu: documentoUrlFinal
                }).then(() =>{
                    alert("Editado correctamente");
                    $("#exampleModal").modal('hide');
                    cargarRestaurantes();
                }).catch(error =>{
                    document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                    document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
                });

            });


        } else {
            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
            document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Error al cargar documentos";
        }

    });
}

function guardar() {

    //Agregar validaciones

    const nombre = document.getElementById("txtnombre").value;
    const direccion = document.getElementById("txtdireccion").value;
    const foto = document.getElementById("fileImage").files[0];
    const archivo = document.getElementById("file").files[0];

    const newRestaurant = doc(collection(db, "restaurante"));
    setDoc(newRestaurant, {
        nombre: nombre,
        direccion: direccion,
        visible: true,
        rating: 5
    }).then(() =>{
        const imageRef = ref(storage, 'restaurante/foto/' + newRestaurant.id);
        const uploadTask = uploadBytesResumable(imageRef, foto);
        /*uploadTask.on('state_changed',
            (snapshot) => {},
            (error) => {
                document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    fotoActualizada = downloadURL;
                });
            }
        );*/

        const pdfRef = ref(storage, 'restaurante/menu/' + newRestaurant.id);
        const uploadTaskFile = uploadBytesResumable(pdfRef, archivo);
        /*uploadTask.on('state_changed',
            (snapshot) => {},
            (error) => {
                document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
            },
            () => {
                getDownloadURL(uploadTaskFile.snapshot.ref).then((downloadURL) => {
                    fdfActualizada = downloadURL;
                });
            }
        );  */   

         //Funciona pero no es buena practia
        /*while(true) {
            if(fotoActualizada != null && fdfActualizada != null) {
                break;
            }
            //Agregar sleep
        }*/

       Promise.all([uploadTask, uploadTaskFile]).then(values =>{

            let flagSuccess = true;
            values.forEach(rpta =>{
                    if(rpta.state !== "success"){
                        flagSuccess = false;
                        return;
                    }
            });

            if(flagSuccess) {
                
                //Mala practica
                /*getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    fotoActualizada = downloadURL;
                    getDownloadURL(uploadTaskFile.snapshot.ref).then((downloadURL) => {
                        fdfActualizada = downloadURL;
                        //Editar
                    });
                });*/

                const downloadUrlFoto = getDownloadURL(uploadTask.snapshot.ref);
                const downloadUrlPdf = getDownloadURL(uploadTaskFile.snapshot.ref);
   
                Promise.all([downloadUrlFoto, downloadUrlPdf]).then(valuesUpload =>{
                            
                        const restauranteRef = doc(db, "restaurante", newRestaurant.id);
                        updateDoc(restauranteRef, {
                            foto: valuesUpload[0],
                            menu: valuesUpload[1]
                        }).then(() =>{
                                alert("Agregado correctamente");
                                $("#exampleModal").modal('hide');
                                cargarRestaurantes();
                        }).catch(error =>{
                            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                            document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
                        });
                });


            } else{
                document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
                document.getElementById("alertaErrorCrearRestaurante").innerHTML = "Ocurrio un error al cargar datos";
            }

        }).catch((error) =>{
            document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
            document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
        });
    

    }).catch(error =>{
        document.getElementById("alertaErrorCrearRestaurante").style.display = "block";
        document.getElementById("alertaErrorCrearRestaurante").innerHTML = error.errorMessage;
    });

}

window.eliminar =  function eliminar(idRestaurante) {

     /*deleteDoc(doc(db, "restaurante", idRestaurante)).then(() =>{
            alert("Eliminado correctamente");
            cargarRestaurantes();
     }).catch((error)=>{
            alert("Ocurrio un error al eliminar");
     });*/
     const restauranteRef = doc(db, "restaurante", idRestaurante);
     updateDoc(restauranteRef, {
         visible:  false
     }).then(() =>{
        alert("Eliminado correctamente");
        cargarRestaurantes();
     }).catch((error)=>{
        alert("Ocurrio un error al eliminar");
    });

}