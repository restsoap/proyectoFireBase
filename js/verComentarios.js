import { getFirestore, doc, getDoc, setDoc, collection, updateDoc, onSnapshot, query, where, orderBy, limit  } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

import { verAutenticacion } from "./firebase.js";

const db = getFirestore();

window.onload = function () {
    verAutenticacion();

    const idRestarunte = "Tkk5evwU60tu3ZRCwoAk";    
    //const q = query(collection(db, "restaurante/" + idRestarunte + "/comentario"), where("rating", "==", 5));
    //const q = query(collection(db, "restaurante/" + idRestarunte + "/comentario"),  where("rating", ">=", 3),orderBy("rating", "asc"), limit(100));

    const q = query(collection(db, "restaurante/" + idRestarunte + "/comentario"), orderBy("rating", "asc"));

    const subscribe = onSnapshot(q, (querySnapshot) =>{
           
        let contenido="<table class='table mt-2'>";

        contenido+="<thead>";
        contenido+="<tr>";
    
        contenido+="<th>Foto</th>";
        contenido+="<th>Nombre</th>";
        contenido+="<th>Comentario</th>";
        contenido+="<th>Rating</th>";
    
        contenido+="</tr>";
        contenido+="</thead>";
    
        contenido+="<tbody>";
       
        querySnapshot.forEach(rpta=>{
        var fila=rpta.data();
        
                contenido+="<tr>";
                contenido+="<td><img src=" +  fila.usuario.foto + " width=\"100\" height=\"100\" /></td>";
                contenido+="<td>"+ fila.usuario.displayName + "</td>";
                contenido+="<td>"+ fila.comentario +"</td>";
                contenido+="<td>"+ calularRating(fila.rating) +"</td>";
                contenido+="</tr>";
        });

         contenido+="</tbody>";
         contenido+="</table>";
         document.getElementById("divRestaurante").innerHTML=contenido;

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
