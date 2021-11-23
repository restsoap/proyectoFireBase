import {
  getAuth, updateProfile, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { getStorage, uploadBytesResumable, getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js";
import { verAutenticacion } from "./firebase.js";

const db = getFirestore();
const storage = getStorage();
var usarActual;
var fotoActualizada = null;

window.onload = function () {
  verAutenticacion();
  PrecargarData();
}

function PrecargarData() {

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {

      const uid = user.uid;

      const docRef = doc(db, "usuario", uid);

      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          document.getElementById("txtDisplayNameUpd").value = docSnap.data().displayName;
          document.getElementById("txtnombre").value = docSnap.data().nombre;
          document.getElementById("txtapellido").value = docSnap.data().apellido;
          document.getElementById("txtemail").value = docSnap.data().email;
          document.getElementById("txttelefono").value = docSnap.data().telefono;
          document.getElementById("txtprovider").value = docSnap.data().provedor;
          document.getElementById("imgFoto").src = docSnap.data().imgFoto;

        } else {
          console.log("El usuario no existe")
        }

      }).catch((error) => {
        document.getElementById("alertErrorLogueo").style.display = "block";
        document.getElementById("alertErrorLogueo").innerHTML = error.message;
      });
    } else {
      console.log('El usuario está desconectado');
    }
  });

}


window.cambiarFoto = function cambiarFoto(archivo) {

  document.getElementById("buttonEditPerfil").disabled = true;
  const file = archivo.files[0];
  const reader = new FileReader();
  reader.onloadend = function () {
    document.getElementById("progressUploadPhoto").style.visibility = "visible";

    document.getElementById("imgFoto").src = reader.result;
    const auth = getAuth();
    const imageRef = ref(storage, 'fotoPerfil/' + auth.currentUser.uid);
    const uploadTask = uploadBytesResumable(imageRef, file);
    uploadTask.on('state_changed',
      (snapshot) => {

        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);
      },
      (error) => {
        document.getElementById("buttonEditPerfil").disabled = false;
        document.getElementById("progressUploadPhoto").style.visibility = "hidden";
        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = error.message;
      },
      () => {
        document.getElementById("buttonEditPerfil").disabled = false;
        document.getElementById("progressUploadPhoto").style.visibility = "hidden";
        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          fotoActualizada = downloadURL;
        });
      }
    );

  }
  reader.readAsDataURL(file);
}

window.editarPerfil = function editarPerfil() {

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;

      const displayName = document.getElementById("txtDisplayNameUpd").value;
      const nombre = document.getElementById("txtnombre").value;
      const apellido = document.getElementById("txtapellido").value;
      const email = document.getElementById("txtemail").value;
      const telefono = document.getElementById("txttelefono").value;
      const provedor = document.getElementById("txtprovider").value;
      let imgFoto = document.getElementById("imgFoto").src;


      if (displayName == "") {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un display Name";
        return;
      }
      if (email == "") {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un email";
        return;
      }
      if (nombre == "") {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un nombre";
        return;
      }
      if (apellido == "") {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un apellido";
        return;
      }
      if (imgFoto.includes('asset/img/nouser.jpg')) {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe seleccionar una foto";
        return;
      }
      if (telefono == "") {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = "Debe ingresar un telefono";
        return;
      }

      if (fotoActualizada != null)
        imgFoto = fotoActualizada;

      updateDoc(doc(db, "usuario", uid), {
        nombre: nombre,
        apellido: apellido,
        email: email,
        displayName: displayName,
        telefono: telefono,
        provedor: provedor,
        imgFoto: imgFoto,
      }).then(() => {
        console.log("entro");
        editarAutorizacion(displayName, imgFoto);
      }).catch((error) => {
        document.getElementById("alertaActulizacionRegistro").style.display = "block";
        document.getElementById("alertaActulizacionRegistro").innerHTML = error.message;
      });

    } else {
      // User is signed out
      // ...
    }
  });

}

function editarAutorizacion(displayName, photoURL) {

  const auth = getAuth();
  updateProfile(auth.currentUser, {
    displayName: displayName,
    photoURL: photoURL
  }).then(() => {
    alert("Usuario editado correctamente");
    document.location.href = "/";
  }).catch((error) => {
    const errorMessage = error.message;
    document.getElementById("alertaActulizacionRegistro").style.display = "block";
    document.getElementById("alertaActulizacionRegistro").innerHTML = errorMessage;
  });
}