// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDRaiFPEW2xssiYuTa-KAL2N8BgCTY8sw",
  authDomain: "miappf-3151b.firebaseapp.com",
  projectId: "miappf-3151b",
  storageBucket: "miappf-3151b.appspot.com",
  messagingSenderId: "255942460134",
  appId: "1:255942460134:web:c8bac13424bf1ad3e3b127",
  measurementId: "G-GEBS80S1LB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

window.salir = function salir() {
      const auth = getAuth();
      signOut(auth).then(() =>{
            document.location.href = "/";
      }).catch((err) =>{
          alert("Se produce error al cerrar la sesion");
          console.log(err);
      });
      
}


export function verAutenticacion(){
    const auth = getAuth();
    onAuthStateChanged(auth, (user) =>{
        if(user) {
          /*Al iniciar sesion
          console.log("Inicio sesion");  
          console.log(user);*/

          console.log(user);
          if(document.getElementById("divRedes"))
            document.getElementById("divRedes").style.visibility = "hidden";

          if(document.getElementById("divInicioSesion"))        
            document.getElementById("divInicioSesion").style.visibility = "hidden";          


          if(user.photoURL != null)
            document.getElementById("imgFotoUsuario").src= user.photoURL;
          else
            document.getElementById("imgFotoUsuario").src= "asset/img/nouser.jpg";

          if(user.displayName != null)
              document.getElementById("lblNombreUsuario").innerHTML = user.displayName;
          else if (user.email != null)    
              document.getElementById("lblNombreUsuario").innerHTML = user.email;
          else if (user.reloadUserInfo.screenName != null)    
              document.getElementById("lblNombreUsuario").innerHTML = user.reloadUserInfo.screenName;              
          else
              document.getElementById("lblNombreUsuario").innerHTML = ""; 

          document.getElementById("barraMenuId").style.visibility = "visible";
          document.getElementById("divDatosUsu").style.visibility = "visible";



        } else {
         /** 
          * Al cerrar sesion
          * 
         */
          document.getElementById("barraMenuId").style.visibility = "hidden";
          document.getElementById("divDatosUsu").style.visibility = "hidden";

          if(document.getElementById("divRedes"))
            document.getElementById("divRedes").style.visibility = "visible";

          if(document.getElementById("divInicioSesion"))  
            document.getElementById("divInicioSesion").style.visibility = "visible";
        }
    });
}