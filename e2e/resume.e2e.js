// Browser test (uses the Chrome installed on the machine): the session position survives reloads, hard reloads and tab switches.
// Usage: npm run e2e            (local files)
//        npm run e2e -- <url>   (e.g. the deployed site)
const http=require('http'),fs=require('fs'),path=require('path');
const{chromium}=require('playwright-core');
const root=path.join(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json'};

function serve(){return new Promise(res=>{const s=http.createServer((req,r)=>{const p=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/\/$/,'/index.html'));if(!p.startsWith(root)||!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(r)});s.listen(0,()=>res(s))})}

let failed=0;
const check=(name,got,want)=>{const ok=got===want;if(!ok)failed++;console.log((ok?'\u2714 ':'\u2716 ')+name+(ok?'':' (attendu "'+want+'", obtenu "'+got+'")'))};

(async()=>{
  const server=process.argv[2]?null:await serve();
  const url=process.argv[2]||'http://localhost:'+server.address().port+'/';
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const ctx=await browser.newContext();
  const errors=[];
  const open=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url,{waitUntil:'networkidle'});return p};
  const counter=p=>p.textContent('#counter').then(t=>t.trim());
  const start=async p=>{await p.click('#start');await p.waitForSelector('#quiz:not(.hidden)')};
  const hardReload=p=>p.reload({waitUntil:'networkidle'});
  const hide=p=>p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));delete document.visibilityState});
  try{
    let p=await open();
    await start(p);
    await p.click('#answers button.answer >> nth=0');await p.click('#validate');await p.click('#next');
    check('question 2 atteinte',await counter(p),'2 / 353');

    await hardReload(p);await hardReload(p);await hide(p);await hardReload(p);
    const box=await p.evaluate(()=>document.getElementById('googleLogoutStable').nextElementSibling.textContent);
    check('bouton Reprendre visible apr\u00e8s 3 rechargements',/Reprendre la session en cours/.test(box),true);
    await start(p);
    check('Commencer reprend \u00e0 la question 2',await counter(p),'2 / 353');

    await p.close();p=await open();await start(p);
    check('nouvel onglet reprend \u00e0 la question 2',await counter(p),'2 / 353');

    // Start another sub-topic: the first session must go to "paused" and survive reloads in the stats tab.
    await p.click('#quit');
    const sub=await p.$$eval('#subtopic option',o=>o[1].value);
    await p.selectOption('#subtopic',sub);await start(p);
    await p.click('#answers button.answer >> nth=0');await p.click('#validate');
    await hardReload(p);await hardReload(p);
    await p.click('.tabs button[data-tab=stats]');
    const statsText=await p.textContent('#sessStats');
    check('stats : session en cours conserv\u00e9e',/Session en cours/.test(statsText),true);
    check('stats : session en pause conserv\u00e9e',/Sessions en pause/.test(statsText)&&/Question 2\/353/.test(statsText),true);

    await p.close();p=await open();await p.click('.tabs button[data-tab=stats]');
    check('stats conserv\u00e9es dans un nouvel onglet',/Sessions en pause/.test(await p.textContent('#sessStats')),true);
    check('aucune erreur JavaScript',errors.join(' | '),'');
  }finally{await browser.close();if(server)server.close()}
  process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
