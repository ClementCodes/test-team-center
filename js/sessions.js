import{getApp}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
const auth=getAuth(getApp()),db=getFirestore(getApp());
const MAX=10;
let user=null,timer=null,pending=false,active=null,paused=[],activeId=null;
const logout=document.getElementById('googleLogoutStable');
const box=document.createElement('div');box.className='hidden';logout.after(box);
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const ref=()=>doc(db,'users',user.uid);
const lab=s=>(s.module==='*'?'Tous modules':s.module)+' \u00b7 '+(s.subtopic==='*'?'Tous sous-th\u00e8mes':s.subtopic)+' \u00b7 '+(s.pos+1)+'/'+s.ids.length+' \u00b7 '+new Date(s.at).toLocaleDateString('fr-FR');
function snap(){if(!pool.length)return null;return{id:activeId||newId(),ids:pool.map(q=>q.id),pos,module:document.getElementById('module').value,subtopic:document.getElementById('subtopic').value,at:Date.now(),done:pos===pool.length-1&&answered,progressed:pos>0||answered}}
function clean(s){const{done,progressed,...r}=s;return r}
function addPaused(s){paused=[s,...paused.filter(x=>x.id!==s.id)].sort((a,b)=>b.at-a.at).slice(0,MAX)}
async function persist(){if(!user)return;clearTimeout(timer);pending=false;try{await setDoc(ref(),{session:active,paused},{merge:true})}catch(e){}}
function schedule(){pending=true;clearTimeout(timer);timer=setTimeout(store,1500)}
function store(){pending=false;if(!user||!pool.length)return;const s=snap();if(s.done){active=null;activeId=null}else{activeId=s.id;active=clean(s)}persist();ui()}
function mk(s,fromPaused,prefix){const r=document.createElement('div');r.style.cssText='display:flex;gap:6px;margin-top:8px';const b=document.createElement('button');b.className='secondary';b.style.cssText='flex:1;text-align:left';b.textContent=prefix+lab(s);b.onclick=()=>resume(s,fromPaused);r.append(b);if(fromPaused){const d=document.createElement('button');d.className='secondary';d.textContent='Supprimer';d.onclick=()=>{paused=paused.filter(x=>x.id!==s.id);persist();ui()};r.append(d)}return r}
function ui(){box.textContent='';const showActive=user&&active&&active.ids&&active.ids.length&&active.id!==activeId;if(!user||(!showActive&&!paused.length)){box.className='hidden';return}box.className='';if(showActive)box.append(mk(active,false,'Reprendre la session en cours : '));if(paused.length){const h=document.createElement('p');h.className='muted';h.style.marginTop='12px';h.textContent='Sessions en pause';box.append(h);paused.forEach(s=>box.append(mk(s,true,'')))}}
function resume(s,fromPaused){const list=s.ids.map(id=>Q.find(q=>q.id===id)).filter(Boolean);if(!list.length)return;const before=snap(),oldId=activeId;if(before&&before.progressed&&!before.done&&before.id!==s.id)addPaused(clean(before));if(active&&active.id!==s.id&&active.id!==oldId)addPaused(active);if(fromPaused)paused=paused.filter(x=>x.id!==s.id);pool=list;pos=Math.min(s.pos,list.length-1);activeId=s.id;active={...s};showTab('quiz');window.render();persist();schedule();ui()}
async function load(){if(!user||pending)return;try{const s=await getDoc(ref());const d=s.exists()?s.data():{};active=d.session||null;if(active&&!active.id)active.id='legacy';paused=Array.isArray(d.paused)?d.paused:[];ui()}catch(e){}}
const baseRender=window.render;
window.render=function(){baseRender();schedule()};
const vb=document.getElementById('validate'),baseValidate=vb.onclick;
vb.onclick=function(e){const r=baseValidate.call(this,e);schedule();return r};
const st=document.getElementById('start'),baseStart=st.onclick;
st.onclick=function(e){const before=user?snap():null,prev=pool,oldId=activeId;baseStart.call(this,e);if(!user||!pool.length||pool===prev)return;if(before&&before.progressed&&!before.done)addPaused(clean(before));if(active&&active.id!==oldId)addPaused(active);activeId=null;active=null;persist();schedule();ui()};
onAuthStateChanged(auth,u=>{user=u;active=null;paused=[];ui();if(u)load()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load()});
