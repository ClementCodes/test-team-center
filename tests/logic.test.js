const test=require('node:test');
const assert=require('node:assert/strict');
const{shuf,lastErrors,sameSession,statsFromH,upsert,endSummary}=require('../js/logic.js');

const seq=vals=>{let i=0;return()=>vals[i++%vals.length]};

test('shuf : la bonne réponse reste la bonne', ()=>{
  const q={id:1,answers:['a','b','c','d'],right:2};
  for(let k=0;k<200;k++){
    const r=shuf(q);
    assert.equal(r.answers[r.right],'c');
    assert.deepEqual([...r.answers].sort(),['a','b','c','d']);
    r.perm.forEach((orig,i)=>assert.equal(r.answers[i],q.answers[orig]));
  }
});

test('shuf : ne modifie pas la question d’origine', ()=>{
  const q={id:1,answers:['a','b','c'],right:0};
  shuf(q,seq([0.9,0.1]));
  assert.deepEqual(q,{id:1,answers:['a','b','c'],right:0});
});

test('shuf : mélange réellement', ()=>{
  const q={answers:['a','b','c','d'],right:0};
  const seen=new Set();for(let k=0;k<200;k++)seen.add(shuf(q).answers.join(''));
  assert.ok(seen.size>5);
});

test('lastErrors : seule la dernière réponse compte', ()=>{
  const e=lastErrors([[1,0,10],[1,1,20],[2,1,10],[2,0,20],[3,0,5]]);
  assert.deepEqual([...e].sort(),[2,3]);
});

test('lastErrors : l’ordre du tableau n’a pas d’importance', ()=>{
  assert.deepEqual([...lastErrors([[1,1,20],[1,0,10]])],[]);
  assert.deepEqual([...lastErrors([[1,0,20],[1,1,10]])],[1]);
});

test('lastErrors : liste vide', ()=>{
  assert.equal(lastErrors([]).size,0);
});

test('sameSession : même module, sous-thème et mode', ()=>{
  const s={ids:[1,2],module:'M',subtopic:'S',mode:'order'};
  assert.equal(sameSession(s,{module:'M',subtopic:'S',mode:'order'}),true);
  assert.equal(sameSession(s,{module:'M',subtopic:'S',mode:'random'}),false);
  assert.equal(sameSession(s,{module:'X',subtopic:'S',mode:'order'}),false);
  assert.equal(sameSession(s,{module:'M',subtopic:'X',mode:'order'}),false);
});

test('sameSession : jamais de reprise en mode erreurs', ()=>{
  assert.equal(sameSession({ids:[1],module:'M',subtopic:'S',mode:'errors'},{module:'M',subtopic:'S',mode:'errors'}),false);
});

test('sameSession : ancienne session sans mode, vide ou absente', ()=>{
  const c={module:'M',subtopic:'S',mode:'random'};
  assert.equal(sameSession({ids:[1],module:'M',subtopic:'S'},c),true);
  assert.equal(sameSession({ids:[],module:'M',subtopic:'S'},c),false);
  assert.equal(sameSession(null,c),false);
});

test('statsFromH : reconstruit les statistiques', ()=>{
  const r=statsFromH([[1,1,10],[1,0,20],[2,0,30]],id=>'mod'+id);
  assert.deepEqual(r.answers,{1:{ok:1,wrong:1},2:{ok:0,wrong:1}});
  assert.deepEqual(r.history[0],{id:1,ok:true,module:'mod1',at:10});
  assert.equal(r.history.length,3);
  assert.deepEqual(statsFromH(undefined,()=>''),{answers:{},history:[]});
});

test('upsert : remplace, trie par date et limite', ()=>{
  let l=[];
  for(let i=0;i<30;i++)l=upsert(l,{id:'s'+i,at:i},25);
  assert.equal(l.length,25);
  assert.equal(l[0].id,'s29');
  l=upsert(l,{id:'s10',at:100},25);
  assert.equal(l.length,25);
  assert.equal(l[0].id,'s10');
  assert.equal(l.filter(x=>x.id==='s10').length,1);
});

test('endSummary : score et questions ratées (dernière réponse)', ()=>{
  const pool=[{id:1},{id:2},{id:3}];
  const h=[{id:1,ok:false},{id:1,ok:true},{id:2,ok:false},{id:3,ok:true}];
  const r=endSummary(h,pool);
  assert.equal(r.k,2);
  assert.equal(r.n,3);
  assert.deepEqual(r.missed.map(q=>q.id),[2]);
});
