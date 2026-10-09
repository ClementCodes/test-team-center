$ErrorActionPreference='Stop'
$p=Join-Path $PSScriptRoot 'index.html'
if(!(Test-Path $p)){throw 'Place index.html dans le meme dossier que ce script.'}
Copy-Item $p (Join-Path $PSScriptRoot 'index.avant-firebase.html') -Force
$h=Get-Content $p -Raw -Encoding UTF8
if($h -match 'team-center-test-93116.firebaseapp.com'){Write-Host 'Firebase est deja integre.' -ForegroundColor Yellow;exit}
$card='<div class="card" id="accountCard"><h3>Synchronisation</h3><p class="muted" id="accountStatus">Connexion Firebase en cours...</p><button class="primary" id="googleLogin">Se connecter avec Google</button><button class="secondary hidden" id="googleLogout" style="width:100%;margin-top:8px">Se deconnecter</button></div>'
$h=$h.Replace('<section id="home"><div class="card"><h2>Que veux-tu réviser ?</h2>','<section id="home">'+$card+'<div class="card"><h2>Que veux-tu réviser ?</h2>')
$h=$h.Replace('let storageOk=true;let stats={answers:{},history:[]};try{const raw=window.localStorage.getItem(KEY);if(raw)stats=JSON.parse(raw)}catch(e){storageOk=false}','let storageOk=true;window.stats={answers:{},history:[]};try{const raw=window.localStorage.getItem(KEY);if(raw)window.stats=JSON.parse(raw)}catch(e){storageOk=false}')
$h=$h.Replace('function save(){if(storageOk){try{window.localStorage.setItem(KEY,JSON.stringify(stats))}catch(e){storageOk=false}}}','function save(){if(storageOk){try{window.localStorage.setItem(KEY,JSON.stringify(stats))}catch(e){storageOk=false}}if(window.firebaseSaveStats)window.firebaseSaveStats(stats)}')
$js=@'
<script type="module">
import{initializeApp}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";import{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";import{getFirestore,doc,getDoc,setDoc}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
const cfg={apiKey:"AIzaSyAmDFtqz6syFQX0N0eGj0ymYoGuxoyKQHE",authDomain:"team-center-test-93116.firebaseapp.com",projectId:"team-center-test-93116",storageBucket:"team-center-test-93116.firebasestorage.app",messagingSenderId:"143119967965",appId:"1:143119967965:web:6752ecbd406077a6435d34"};const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider(),status=document.getElementById('accountStatus'),login=document.getElementById('googleLogin'),logout=document.getElementById('googleLogout');let user=null,timer=null;
login.onclick=async()=>{try{await signInWithPopup(auth,provider)}catch(e){status.textContent='Connexion impossible : '+e.message}};logout.onclick=()=>signOut(auth);
async function load(u){const r=doc(db,'users',u.uid,'quiz','state'),s=await getDoc(r);if(s.exists()){const d=s.data();window.stats={answers:d.answers||{},history:d.history||[]};localStorage.setItem('tcQuizStatsV1',JSON.stringify(window.stats))}else await setDoc(r,window.stats);renderStats()}
window.firebaseSaveStats=v=>{if(!user)return;clearTimeout(timer);timer=setTimeout(async()=>{try{await setDoc(doc(db,'users',user.uid,'quiz','state'),v);status.textContent='Synchronise avec '+user.email}catch(e){status.textContent='Synchronisation en attente'}},300)};
onAuthStateChanged(auth,async u=>{user=u;if(u){login.classList.add('hidden');logout.classList.remove('hidden');status.textContent='Chargement...';try{await load(u);status.textContent='Synchronise avec '+u.email}catch(e){status.textContent='Erreur : '+e.message}}else{login.classList.remove('hidden');logout.classList.add('hidden');status.textContent='Connecte-toi pour synchroniser tes appareils.'}});
</script>
'@
$h=$h.Replace('</body></html>',$js+'</body></html>')
if($h -notmatch 'team-center-test-93116.firebaseapp.com'){throw 'Integration impossible. Sauvegarde conservee.'}
Set-Content $p $h -Encoding UTF8
Write-Host 'OK : Firebase est integre dans index.html' -ForegroundColor Green
