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
  document.querySelectorAll('#answers button.answer').forEach((b,i)=>add(b.children[1],d.a&&d.a[i]));
  const fb=document.getElementById('feedback');
  if(answered&&d.h&&!fb.classList.contains('hidden'))add(fb,'\u{1F4A1} '+d.h,'fr-h');
}
window.render=function(){baseRenderUi();frOn=false;applyFr()};
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
