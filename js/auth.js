import{app}from"./firebase-config.js";
import{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
const auth=getAuth(app),provider=new GoogleAuthProvider();
const status=document.getElementById('googleStatusStable');
const login=document.getElementById('googleLoginStable');
const logout=document.getElementById('googleLogoutStable');
login.addEventListener('click',async()=>{status.textContent='Connexion en cours...';try{await signInWithPopup(auth,provider)}catch(e){status.textContent='Connexion impossible : '+e.code}});
logout.addEventListener('click',()=>signOut(auth));
onAuthStateChanged(auth,user=>{if(user){status.textContent='Connecte : '+(user.email||'compte Google');login.classList.add('hidden');logout.classList.remove('hidden')}else{status.textContent='Tu peux utiliser le quiz sans connexion.';login.classList.remove('hidden');logout.classList.add('hidden')}});
