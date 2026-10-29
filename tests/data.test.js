const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const load=(file,name)=>JSON.parse(JSON.stringify(vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8')+';'+name)));
const Q=load('data/questions.js','Q');
const FR=load('data/teamcenter_fr.js','FR');

test('questions : identifiants uniques', ()=>{
  assert.ok(Q.length>0);
  assert.equal(new Set(Q.map(q=>q.id)).size,Q.length);
});

test('questions : champs obligatoires et bonne réponse valide', ()=>{
  for(const q of Q){
    for(const f of['module','subtopic','question'])assert.ok(typeof q[f]==='string'&&q[f].trim(),`question ${q.id} : ${f} manquant`);
    assert.ok(Array.isArray(q.answers)&&q.answers.length>=2,`question ${q.id} : moins de 2 réponses`);
    assert.ok(q.answers.every(a=>typeof a==='string'&&a.trim()),`question ${q.id} : réponse vide`);
    assert.ok(Number.isInteger(q.right)&&q.right>=0&&q.right<q.answers.length,`question ${q.id} : index de bonne réponse invalide`);
  }
});

test('traduction FR : chaque question est traduite', ()=>{
  assert.deepEqual(Q.filter(q=>!FR[q.id]).map(q=>q.id),[]);
});

test('traduction FR : pas d’entrée orpheline', ()=>{
  const ids=new Set(Q.map(q=>String(q.id)));
  assert.deepEqual(Object.keys(FR).filter(k=>!ids.has(k)),[]);
});

test('traduction FR : même nombre de réponses, textes non vides', ()=>{
  for(const q of Q){
    const f=FR[q.id];if(!f)continue;
    assert.ok(f.q&&f.q.trim(),`FR ${q.id} : question vide`);
    assert.equal((f.a||[]).length,q.answers.length,`FR ${q.id} : nombre de réponses différent`);
    assert.ok(f.a.every(a=>typeof a==='string'&&a.trim()),`FR ${q.id} : réponse vide`);
  }
});

test('traduction FR : pas d’accents cassés', ()=>{
  const bad=Object.entries(FR).filter(([,f])=>/\uFFFD|Ã©|Ã¨|[a-zà-ÿ]\?[a-zà-ÿ]/i.test(JSON.stringify(f))).map(([k])=>k);
  assert.deepEqual(bad,[]);
});
