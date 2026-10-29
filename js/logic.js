// Pure quiz logic (no DOM, no Firebase). Loaded as a classic script in the browser, required by tests in Node.
function shuf(q,rnd=Math.random){const p=q.answers.map((_,i)=>i);for(let i=p.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]]}return{...q,answers:p.map(i=>q.answers[i]),right:p.indexOf(q.right),perm:p}}
// entries: [id, ok(0/1), at]; returns ids whose most recent answer was wrong.
function lastErrors(entries){const m=new Map();for(const[id,ok,at]of entries){const p=m.get(id),t=at||0;if(!p||t>=p[1])m.set(id,[ok,t])}return new Set([...m].filter(e=>!e[1][0]).map(e=>e[0]))}
function sameSession(s,c){return!!(c.mode!=='errors'&&s&&s.ids&&s.ids.length&&s.module===c.module&&s.subtopic===c.subtopic&&(!s.mode||s.mode===c.mode))}
function statsFromH(h,moduleOf){const answers={},history=[];for(const[id,ok,at]of(h||[])){const r=answers[id]||(answers[id]={ok:0,wrong:0});ok?r.ok++:r.wrong++;history.push({id,ok:!!ok,module:moduleOf(id),at})}return{answers,history}}
function upsert(list,s,max){return[s,...list.filter(x=>x.id!==s.id)].sort((a,b)=>b.at-a.at).slice(0,max)}
// End-of-session summary: last answer per question counts.
function endSummary(history,pool){const res=new Map();history.forEach(x=>res.set(x.id,x.ok));const k=[...res.values()].filter(Boolean).length;return{k,n:res.size,missed:pool.filter(q=>res.get(q.id)===false)}}
if(typeof module!=='undefined'&&module.exports)module.exports={shuf,lastErrors,sameSession,statsFromH,upsert,endSummary};
