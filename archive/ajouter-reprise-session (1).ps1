$ErrorActionPreference='Stop'
$p=Join-Path $PSScriptRoot 'index.html'
if(!(Test-Path $p)){throw 'index.html est introuvable dans ce dossier.'}
Copy-Item $p (Join-Path $PSScriptRoot 'index.avant-reprise.html') -Force
$h=Get-Content $p -Raw -Encoding UTF8
if($h -match 'resumeSessionBtn'){Write-Host 'La reprise de session est deja installee.' -ForegroundColor Yellow;exit}
# Add resume button to sync card
$old='<button class="secondary hidden" id="googleLogout" style="width:100%;margin-top:8px">Se deconnecter</button>'
$new=$old+'<button class="primary hidden" id="resumeSessionBtn" style="width:100%;margin-top:8px">Reprendre ma session</button><p class="muted hidden" id="resumeSessionInfo" style="margin-top:8px"></p>'
$h=$h.Replace($old,$new)
# Ensure session survives cloud mapping
$h=$h.Replace('window.stats={answers:remote.answers||{},history:remote.history||[]};','window.stats={answers:remote.answers||{},history:remote.history||[],session:remote.session||null};')
$h=$h.Replace('window.stats={answers:d.answers||{},history:d.history||[]};','window.stats={answers:d.answers||{},history:d.history||[],session:d.session||null};')
# On start, keep exact ordered question IDs and current position
$oldStart="if(mode==='random')pool.sort(()=>Math.random()-.5);if(!pool.length)"
$newStart="if(mode==='random')pool.sort(()=>Math.random()-.5);if(!pool.length)"
$h=$h.Replace($oldStart,$newStart)
$h=$h.Replace("pos=0;showTab('quiz');render()};","pos=0;stats.session={questionIds:pool.map(q=>q.id),pos:0,mode:mode,module:module.value,subtopic:subtopic.value,updatedAt:Date.now()};save();showTab('quiz');render()};")
# Save current position when moving forward; clear at end
$h=$h.Replace("next.onclick=()=>{if(pos+1<pool.length){pos++;render()}else{alert('Session terminée. Consulte tes statistiques.');showTab('stats')}};","next.onclick=()=>{if(pos+1<pool.length){pos++;if(stats.session){stats.session.pos=pos;stats.session.updatedAt=Date.now();save()}render()}else{stats.session=null;save();updateResumeButton();alert('Session terminée. Consulte tes statistiques.');showTab('stats')}};")
# Add resume functions before final script close marker
$marker="resetStats.onclick=()=>{if(confirm('Effacer toutes les statistiques ?')){stats={answers:{},history:[]};save();renderStats()}};fillModules();showTab('home');"
$replacement=@'
resetStats.onclick=()=>{if(confirm('Effacer toutes les statistiques ?')){stats={answers:{},history:[],session:null};save();updateResumeButton();renderStats()}};
const resumeSessionBtn=document.getElementById('resumeSessionBtn'),resumeSessionInfo=document.getElementById('resumeSessionInfo');
function updateResumeButton(){const s=stats.session;if(s&&Array.isArray(s.questionIds)&&s.questionIds.length){resumeSessionBtn.classList.remove('hidden');resumeSessionInfo.classList.remove('hidden');resumeSessionInfo.textContent='Question '+(Number(s.pos||0)+1)+' sur '+s.questionIds.length;}else{resumeSessionBtn.classList.add('hidden');resumeSessionInfo.classList.add('hidden')}}
resumeSessionBtn.onclick=()=>{const s=stats.session;if(!s)return;pool=s.questionIds.map(id=>Q.find(q=>q.id===id)).filter(Boolean);if(!pool.length){stats.session=null;save();updateResumeButton();return}pos=Math.min(Number(s.pos||0),pool.length-1);mode=s.mode||'order';showTab('quiz');render()};
window.updateResumeButton=updateResumeButton;fillModules();showTab('home');updateResumeButton();
'@
if(!$h.Contains($marker)){throw 'La structure du quiz ne correspond pas. Aucun changement publie.'}
$h=$h.Replace($marker,$replacement)
# Refresh resume button after cloud data is loaded
$h=$h.Replace("if(typeof renderStats==='function')renderStats()","if(typeof renderStats==='function')renderStats();if(window.updateResumeButton)window.updateResumeButton()")
$h=$h.Replace("renderStats()}","renderStats();if(window.updateResumeButton)window.updateResumeButton()}")
if($h -notmatch 'resumeSessionBtn'){throw 'La modification a echoue.'}
Set-Content $p $h -Encoding UTF8
Write-Host 'OK : reprise de session ajoutee.' -ForegroundColor Green
Write-Host 'Tu peux maintenant publier avec : firebase deploy --only hosting'
