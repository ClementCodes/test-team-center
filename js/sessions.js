import{getApp}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc}from"https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
const auth=getAuth(getApp()),db=getFirestore(getApp());
const MAX=25;
let user=null,timer=null,pending=false,active=null,paused=[],finished=[],activeId=null,cur=null,loaded=false;
const LS='tcSessionV1';let localS=null;try{localS=JSON.parse(localStorage.getItem(LS))}catch(e){}
const logout=document.getElementById('googleLogoutStable');
const box=document.createElement('div');box.className='hidden';logout.after(box);
const sty=document.createElement('style');sty.textContent='#stats>:not(#sessStats){display:none!important}';document.head.append(sty);
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const qm=new Map(Q.map(q=>[q.id,q]));
const sel=()=>({module:document.getElementById('module').value,subtopic:document.getElementById('subtopic').value,mode});
const same=sameSession;
window.errIds=function(){const e=[];if(user){if(active)e.push(...(active.h||[]));paused.forEach(s=>e.push(...(s.h||[])));finished.forEach(s=>e.push(...(s.h||[])))}stats.history.forEach(x=>e.push([x.id,x.ok?1:0,x.at]));Q.forEach(q=>{const l=last[q.id];if(l)e.push([q.id,l[0],l[1]])});return lastErrors(e)};
const fromH=h=>statsFromH(h,id=>(qm.get(id)||{}).module);
const cnt=s=>{const h=s.h||[],k=h.filter(x=>x[1]).length;return h.length?' \u00b7 '+k+' bonne(s) \u00b7 '+(h.length-k)+' mauvaise(s)':''};
const title=s=>(s.module==='*'?'Tous modules':s.module)+' \u00b7 '+(s.subtopic==='*'?'Tous sous-th\u00e8mes':s.subtopic);
const dt=s=>new Date(s.at).toLocaleDateString('fr-FR');
const lab=s=>title(s)+' \u00b7 '+(s.pos+1)+'/'+s.ids.length+' \u00b7 '+dt(s)+cnt(s);
const ref=()=>doc(db,'users',user.uid);
function snap(){if(!pool.length)return null;const c=cur||sel();return{id:activeId||newId(),ids:pool.map(q=>q.id),pos,module:c.module,subtopic:c.subtopic,mode:c.mode||'order',h:stats.history.map(x=>[x.id,x.ok?1:0,x.at]),at:Date.now(),done:pos===pool.length-1&&answered,progressed:pos>0||answered}}
function clean(s){const{done,progressed,...r}=s;return r}
function addPaused(s){paused=upsert(paused,s,MAX)}
function addFinished(s){finished=upsert(finished,s,MAX)}
function archive(b){if(!b)return;if(b.done)addFinished(clean(b));else if(b.progressed)addPaused(clean(b))}
function saveLocal(){const s=snap();try{if(!s||s.done){localS=null;localStorage.removeItem(LS)}else{activeId=s.id;localS=clean(s);localStorage.setItem(LS,JSON.stringify(localS))}}catch(e){}}
function latest(want,withPaused){const skip=new Set([activeId,...finished.map(f=>f.id)]);const s=pickLatest([user&&active,localS,...(user&&withPaused?paused:[])],want,skip);return s&&[s,paused.some(p=>p.id===s.id)]}
async function persist(){if(!user||!loaded)return;clearTimeout(timer);pending=false;try{await setDoc(ref(),{session:active,paused,finished},{merge:true})}catch(e){}}
function schedule(){pending=true;clearTimeout(timer);timer=setTimeout(store,1500)}
function store(){pending=false;if(!user||!loaded||!pool.length)return;const s=snap();activeId=s.id;if(s.done){addFinished(clean(s));active=null}else active=clean(s);persist();ui()}
function del(kind,id){if(kind==='paused')paused=paused.filter(x=>x.id!==id);else finished=finished.filter(x=>x.id!==id);persist();ui()}
function mk(s,fromPaused,prefix){const r=document.createElement('div');r.style.cssText='display:flex;gap:6px;margin-top:8px';const b=document.createElement('button');b.className='secondary';b.style.cssText='flex:1;text-align:left';b.textContent=prefix+lab(s);b.onclick=()=>resume(s,fromPaused);r.append(b);if(fromPaused){const d=document.createElement('button');d.className='secondary';d.textContent='Supprimer';d.onclick=()=>del('paused',s.id);r.append(d)}return r}
function renderBox(){box.textContent='';const a=latest(null,false);if(!a&&!(user&&paused.length)){box.className='hidden';return}box.className='';if(a)box.append(mk(a[0],a[1],'Reprendre la session en cours : '));if(user&&paused.length){const h=document.createElement('p');h.className='muted';h.style.marginTop='12px';h.textContent='Sessions en pause';box.append(h);paused.forEach(s=>box.append(mk(s,true,'')))}}
function card(o){const h=o.h||[],k=h.filter(x=>x[1]).length,n=h.length,mods={};h.forEach(x=>{const m=(qm.get(x[0])||{}).module||'?',r=mods[m]||(mods[m]=[0,0]);r[1]++;if(x[1])r[0]++});const rows=Object.keys(mods).map(m=>{const r=mods[m];return '<tr><td>'+esc(m)+'</td><td>'+r[0]+'/'+r[1]+'</td><td>'+Math.round(r[0]/r[1]*100)+'%</td></tr>'}).join('');const d=document.createElement('div');d.className='card';d.style.marginTop='12px';d.innerHTML='<h3>'+esc(o.title)+'</h3><p class="muted">'+esc(o.sub)+'</p><div class="stats-grid"><div class="stat"><b>'+k+'</b>bonnes</div><div class="stat"><b>'+(n-k)+'</b>mauvaises</div><div class="stat"><b>'+(n?Math.round(k/n*100):0)+'%</b>r\u00e9ussite</div></div>'+(rows?'<table style="margin-top:10px"><thead><tr><th>Module</th><th>Bonnes</th><th>Score</th></tr></thead><tbody>'+rows+'</tbody></table>':'');(o.actions||[]).forEach(a=>{const b=document.createElement('button');b.className='secondary';b.style.cssText='width:100%;margin-top:8px';b.textContent=a[0];b.onclick=a[1];d.append(b)});return d}
function renderSess(){let c=document.getElementById('sessStats');if(!c){c=document.createElement('div');c.id='sessStats';document.getElementById('stats').append(c)}c.textContent='';const sec=t=>{const p=document.createElement('h3');p.textContent=t;p.style.margin='16px 4px 0';c.append(p)};if(pool.length&&!finished.some(f=>f.id===activeId)){sec('Session en cours');c.append(card({title:title(cur||sel()),sub:'Question '+(pos+1)+'/'+pool.length,h:stats.history.map(x=>[x.id,x.ok?1:0,x.at])}))}if(paused.length){sec('Sessions en pause');paused.forEach(s=>c.append(card({title:title(s),sub:'Question '+(s.pos+1)+'/'+s.ids.length+' \u00b7 '+dt(s),h:s.h,actions:[['Reprendre',()=>resume(s,true)],['Supprimer',()=>del('paused',s.id)]]})))}if(finished.length){sec('Sessions termin\u00e9es');finished.forEach(s=>c.append(card({title:title(s),sub:'Termin\u00e9e \u00b7 '+s.ids.length+' questions \u00b7 '+dt(s),h:s.h,actions:[['Supprimer',()=>del('finished',s.id)]]})))}if(!c.children.length){const p=document.createElement('div');p.className='empty';p.textContent='Aucune session pour le moment.';c.append(p)}}
function ui(){renderBox();renderSess()}
function resume(s,fromPaused){const list=s.ids.map(id=>Q.find(q=>q.id===id)).filter(Boolean);if(!list.length)return;const before=snap(),oldId=activeId;if(before&&before.id!==s.id)archive(before);if(active&&active.id!==s.id&&active.id!==oldId)addPaused(active);if(fromPaused)paused=paused.filter(x=>x.id!==s.id);pool=s.mode==='random'?list.map(shuf):list;pos=Math.min(s.pos,list.length-1);stats=fromH(s.h);save();activeId=s.id;cur={module:s.module,subtopic:s.subtopic,mode:s.mode};active={...s};showTab('quiz');window.render();persist();schedule();ui()}
async function load(){if(!user||(pending&&loaded))return;const u=user;try{const s=await getDoc(ref());if(user!==u)return;const d=s.exists()?s.data():{};let r=d.session||null;if(r&&!r.id)r.id='legacy';paused=Array.isArray(d.paused)?d.paused:[];finished=Array.isArray(d.finished)?d.finished:[];if(!loaded&&pool.length&&activeId&&r&&r.id!==activeId&&r.ids&&r.ids.length)addPaused(r);active=r;const first=!loaded;loaded=true;if(first&&pool.length)schedule();ui()}catch(e){}}
const baseRender=window.render;
window.render=function(){baseRender();saveLocal();schedule()};
const baseStats=window.renderStats;
window.renderStats=function(){baseStats();renderSess()};
const vb=document.getElementById('validate'),baseValidate=vb.onclick;
vb.onclick=function(e){const r=baseValidate.call(this,e);saveLocal();schedule();return r};
const st=document.getElementById('start'),baseStart=st.onclick;
st.onclick=async function(e){const want=sel();
if(pool.length){const s=snap();if(same(s,want)&&!s.done){showTab('quiz');return}}
if(user&&!loaded)await load();
const m=latest(want,true);if(m){resume(m[0],m[1]);return}
const before=snap(),prev=pool,oldId=activeId,prevLocal=localS,c=sel();baseStart.call(this,e);if(!pool.length||pool===prev)return;stats={answers:{},history:[]};save();cur=c;activeId=null;saveLocal();if(!user){ui();return}
archive(before);if(active&&active.id!==oldId&&active.id!==activeId)addPaused(active);
if(prevLocal&&prevLocal.id!==oldId&&!(active&&active.id===prevLocal.id)&&!paused.some(p=>p.id===prevLocal.id)&&!finished.some(f=>f.id===prevLocal.id)&&(prevLocal.pos>0||(prevLocal.h||[]).length))addPaused(prevLocal);
active=null;persist();schedule();ui()};
function flush(){saveLocal();if(pending&&loaded)store()}
onAuthStateChanged(auth,u=>{user=u;loaded=false;active=null;paused=[];finished=[];ui();if(u)load()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load();else flush()});
window.addEventListener('pagehide',flush);
ui();