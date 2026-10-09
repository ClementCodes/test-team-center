const quitBtn=document.getElementById('quit');
const baseShowTab=window.showTab;
window.showTab=function(id){baseShowTab(id);quitBtn.classList.toggle('hidden',id!=='quiz')};

const helpModal=document.getElementById('helpModal');
const setHelp=open=>helpModal.classList.toggle('hidden',!open);
document.getElementById('helpBtn').onclick=()=>setHelp(true);
document.getElementById('helpClose').onclick=()=>setHelp(false);
helpModal.addEventListener('click',e=>{if(e.target===helpModal)setHelp(false)});

let lastBtn=null,lastTime=0;
document.getElementById('answers').addEventListener('click',e=>{
  const b=e.target.closest('button.answer');
  if(!b||answered)return;
  const now=Date.now();
  if(b===lastBtn&&now-lastTime<400){lastBtn=null;document.getElementById('validate').click()}
  else{lastBtn=b;lastTime=now}
});

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
