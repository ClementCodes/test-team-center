$ErrorActionPreference='Stop'
$p=Join-Path $PSScriptRoot 'index.html'
if(!(Test-Path $p)){throw 'ERREUR : index.html est introuvable dans ce dossier.'}
$h=Get-Content $p -Raw -Encoding UTF8
if($h -match 'id="googleLoginStable"'){Write-Host 'La connexion Google est deja ajoutee.' -ForegroundColor Yellow;exit 0}
if($h -notmatch 'const Q=\['){throw 'ERREUR : ce fichier ne semble pas etre le quiz fonctionnel.'}
Copy-Item $p (Join-Path $PSScriptRoot 'index.stable-avant-google.html') -Force
$target='<section id="home"><div class="card"><h2>Que veux-tu réviser ?</h2>'
if(-not $h.Contains($target)){throw 'ERREUR : emplacement d insertion introuvable. Aucun fichier modifie.'}
$card='<section id="home"><div class="card"><h3>Compte</h3><p class="muted" id="googleStatusStable">Tu peux utiliser le quiz sans connexion.</p><button class="primary" id="googleLoginStable">Se connecter avec Google</button><button class="secondary hidden" id="googleLogoutStable" style="width:100%;margin-top:8px">Se deconnecter</button></div><div class="card"><h2>Que veux-tu réviser ?</h2>'
$h=$h.Replace($target,$card)
$js=@'
<script type="module">
import{initializeApp}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
const app=initializeApp({apiKey:"AIzaSyAmDFtqz6syFQX0N0eGj0ymYoGuxoyKQHE",authDomain:"team-center-test-93116.firebaseapp.com",projectId:"team-center-test-93116",appId:"1:143119967965:web:6752ecbd406077a6435d34"});
const auth=getAuth(app),provider=new GoogleAuthProvider();
const status=document.getElementById('googleStatusStable');
const login=document.getElementById('googleLoginStable');
const logout=document.getElementById('googleLogoutStable');
login.addEventListener('click',async()=>{status.textContent='Connexion en cours...';try{await signInWithPopup(auth,provider)}catch(e){status.textContent='Connexion impossible : '+e.code}});
logout.addEventListener('click',()=>signOut(auth));
onAuthStateChanged(auth,user=>{if(user){status.textContent='Connecte : '+(user.email||'compte Google');login.classList.add('hidden');logout.classList.remove('hidden')}else{status.textContent='Tu peux utiliser le quiz sans connexion.';login.classList.remove('hidden');logout.classList.add('hidden')}});
</script>
'@
if(-not $h.Contains('</body></html>')){throw 'ERREUR : fin du fichier introuvable. Aucun fichier modifie.'}
$h=$h.Replace('</body></html>',$js+'</body></html>')
if(($h -notmatch 'id="googleLoginStable"') -or ($h -notmatch 'const Q=\[')){throw 'ERREUR : controle final refuse. Sauvegarde conservee.'}
Set-Content $p $h -Encoding UTF8
Write-Host 'OK : connexion Google ajoutee sans modifier le moteur du quiz.' -ForegroundColor Green
Write-Host 'Sauvegarde : index.stable-avant-google.html'
