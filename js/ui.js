const baseRenderUi=window.render;
let frOn=false;
const frBtn=document.createElement('button');
frBtn.type='button';frBtn.id='frBtn';frBtn.className='frbtn hidden';frBtn.textContent='FR';
document.querySelector('.question-meta').insertBefore(frBtn,document.getElementById('counter'));
function frData(){return typeof FR!=='undefined'&&pool[pos]?FR[pool[pos].id]:null}
function applyFr(){
  document.querySelectorAll('#quiz .fr').forEach(x=>x.remove());
  const d=frData();
  if(!d){frBtn.classList.add('hidden');return}
  frBtn.classList.remove('hidden');
  frBtn.textContent=frOn?'EN':'FR';
  frBtn.setAttribute('aria-pressed',frOn);
  if(!frOn)return;
  const add=(parent,text,cls)=>{if(!text)return;const e=document.createElement('div');e.className='fr '+(cls||'');e.textContent=text;parent.append(e)};
  add(document.getElementById('question').parentNode,d.q,'fr-q');
  const qEl=document.getElementById('question'),frQ=qEl.parentNode.querySelector('.fr-q');
  if(frQ)qEl.after(frQ);
  const pq=pool[pos];
  document.querySelectorAll('#answers button.answer').forEach((b,i)=>add(b.children[1],d.a&&d.a[pq.perm?pq.perm[i]:i]));
  const fb=document.getElementById('feedback');
  if(answered&&d.h&&!fb.classList.contains('hidden'))add(fb,'\u{1F4A1} '+d.h,'fr-h');
}
const quizCard=document.querySelector('#quiz>.card');
const endBox=document.createElement('div');endBox.id='endScreen';endBox.className='card hidden';document.getElementById('quiz').append(endBox);
window.render=function(){endBox.classList.add('hidden');quizCard.classList.remove('hidden');baseRenderUi();frOn=false;applyFr()};
window.endScreen=function(){
  const{k,n,missed}=endSummary(stats.history,pool);
  endBox.innerHTML='<h2>Session termin\u00e9e \u{1F389}</h2><div class="stats-grid"><div class="stat"><b>'+k+'</b>bonnes</div><div class="stat"><b>'+(n-k)+'</b>rat\u00e9es</div><div class="stat"><b>'+(n?Math.round(k/n*100):0)+'%</b>r\u00e9ussite</div></div>'
    +(missed.length?'<h3 style="margin-top:14px">Questions rat\u00e9es</h3>'+missed.map(q=>'<div class="stat" style="text-align:left;margin-top:8px"><div>'+esc(q.question)+'</div><div class="muted" style="margin-top:4px">\u2705 '+esc(q.answers[q.right])+'</div></div>').join(''):'<p class="muted" style="margin-top:12px">Aucune erreur, bravo !</p>');
  const btn=(t,cls,f)=>{const b=document.createElement('button');b.className=cls;b.style.cssText='width:100%;margin-top:8px';b.textContent=t;b.onclick=f;endBox.append(b)};
  if(missed.length)btn('Refaire mes erreurs de cette session','primary',()=>{
    window.errOnly=new Set(missed.map(q=>q.id));mode='errors';
    document.querySelectorAll('.mode').forEach(x=>x.classList.toggle('active',x.dataset.mode==='errors'));
    document.getElementById('start').click();
  });
  btn('Retour \u00e0 l\u2019accueil','secondary',()=>showTab('home'));
  btn('Voir les statistiques','secondary',()=>showTab('stats'));
  quizCard.classList.add('hidden');endBox.classList.remove('hidden');
  document.getElementById('bar').style.width='100%';
  window.scrollTo(0,0);
};
frBtn.onclick=()=>{frOn=!frOn;applyFr()};
document.getElementById('validate').addEventListener('click',()=>{if(frOn)setTimeout(applyFr,0)});

const quitBtn=document.getElementById('quit');
const baseShowTab=window.showTab;
window.showTab=function(id){baseShowTab(id);quitBtn.classList.toggle('hidden',id!=='quiz')};

const helpModal=document.getElementById('helpModal');
const setHelp=open=>helpModal.classList.toggle('hidden',!open);
document.getElementById('helpBtn').onclick=()=>setHelp(true);
document.getElementById('helpClose').onclick=()=>setHelp(false);
helpModal.addEventListener('click',e=>{if(e.target===helpModal)setHelp(false)});

document.getElementById('answers').addEventListener('click',e=>{
  const b=e.target.closest('button.answer');
  if(!b||answered||!b.classList.contains('selected'))return;
  e.stopPropagation();
  document.getElementById('validate').click();
},true);

document.addEventListener('keydown',e=>{
  if(e.key==='Escape')setHelp(false);
  const quizOpen=!document.getElementById('quiz').classList.contains('hidden');
  if(!quizOpen||!helpModal.classList.contains('hidden')||e.target.tagName==='SELECT')return;
  if(e.key==='Enter'){
    e.preventDefault();
    const next=document.getElementById('next');
    (answered?next:document.getElementById('validate')).click();
  }else if(!answered&&/^[1-9]$/.test(e.key)){
    const b=document.querySelectorAll('#answers button.answer')[+e.key-1];
    if(b)b.click();
  }
});
