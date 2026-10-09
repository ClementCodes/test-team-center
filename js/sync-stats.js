import{getApp}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
const auth=getAuth(getApp()),db=getFirestore(getApp());
const status=document.getElementById('googleStatusStable');
let user=null,timer=null;
const baseSave=window.save;
function merge(a,b){const seen=new Set(),h=[];for(const x of[...(a.history||[]),...(b.history||[])]){const k=x.id+'_'+x.at;if(!seen.has(k)){seen.add(k);h.push(x)}}h.sort((x,y)=>x.at-y.at);const answers={};for(const x of h){const r=answers[x.id]||(answers[x.id]={ok:0,wrong:0});x.ok?r.ok++:r.wrong++}return{answers,history:h}}
async function push(){if(!user)return;try{await setDoc(doc(db,'users',user.uid),{json:JSON.stringify(stats),updatedAt:Date.now()},{merge:true})}catch(e){status.textContent='Synchro impossible : '+(e.code||e.message)}}
async function pull(){if(!user)return;try{const s=await getDoc(doc(db,'users',user.uid));let remote={answers:{},history:[]};if(s.exists())remote=JSON.parse(s.data().json);const m=merge(stats,remote);const changed=m.history.length!==remote.history.length;stats=m;baseSave();renderStats();if(changed)await push();status.textContent='Connecte : '+(user.email||'compte Google')+' - statistiques synchronisees'}catch(e){status.textContent='Synchro impossible : '+(e.code||e.message)}}
window.save=function(){baseSave();clearTimeout(timer);timer=setTimeout(push,1500)};
onAuthStateChanged(auth,u=>{user=u;if(u)pull()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pull()});
