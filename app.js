const questions = [
  {id:1,group:"Convenient bicycle parking",title:"Is there sufficient bicycle parking for residents?",help:"Consider the number of spaces compared with observed demand.",action:"Measure parking demand and occupancy, then assess whether additional bicycle spaces are needed.",toolkit:"Parking occupancy count sheet, resident survey, floor/site plan",cost:"SEK 0–2,000",priority:"Medium",deadline:30},
  {id:2,group:"Convenient bicycle parking",title:"Is bicycle parking convenient to reach and use?",help:"Think about access routes, location, layout and signs.",action:"Review the parking layout, access route, positioning and signs; prepare practical improvements.",toolkit:"Wayfinding signs, floor markings, simple access audit checklist",cost:"SEK 500–5,000",priority:"Medium",deadline:60},
  {id:3,group:"Security",title:"Can residents lock their bicycles securely?",help:"Check whether suitable, usable locking points are available.",action:"Review rack design and add suitable locking points if necessary.",toolkit:"Sheffield-style stands or equivalent secure racks; installation quote",cost:"SEK 1,500–4,000 per stand installed (indicative)",priority:"High",deadline:60},
  {id:4,group:"Security",title:"Is the parking area sufficiently lit and maintained?",help:"Look for lighting gaps, damage and maintenance issues.",action:"Inspect the area, prioritise maintenance faults and schedule repairs or lighting improvements.",toolkit:"Inspection checklist, LED lighting review, maintenance work order",cost:"SEK 500–5,000 for minor fixes; lighting requires quote",priority:"High",deadline:30},
  {id:5,group:"Weather protection & accessibility",title:"Is covered bicycle parking available where appropriate?",help:"Consider local need, available space and feasibility.",action:"Assess resident demand, available space and feasibility before selecting covered parking options.",toolkit:"Covered rack / shelter options, site feasibility check, supplier quote",cost:"SEK 20,000–100,000+ per shelter (site-dependent estimate)",priority:"Low",deadline:90},
  {id:6,group:"Weather protection & accessibility",title:"Can residents with different needs use the parking and access routes?",help:"Identify practical barriers in routes and parking arrangements.",action:"Conduct an access review and plan to remove practical barriers within the provider’s control.",toolkit:"Accessibility checklist, route measurements, minor surfacing/signage fixes",cost:"SEK 0–10,000 for audit/minor fixes; construction needs quote",priority:"High",deadline:60},
  {id:7,group:"Bicycle maintenance",title:"Can residents access a pump and basic repair tools?",help:"An approved equivalent repair service may also meet the need.",action:"Compare a basic pump-and-tool kit with a shared repair point, based on demand and budget.",toolkit:"Public bike pump, basic repair tools, mounting post and simple instructions",cost:"SEK 1,500–6,000 for a basic shared kit (indicative)",priority:"Medium",deadline:60},
  {id:8,group:"Bicycle maintenance",title:"Is there a clear process for reporting damaged facilities?",help:"Residents should know where to report problems and what happens next.",action:"Create a visible fault-reporting route and assign responsibility for follow-up.",toolkit:"QR code / web form, noticeboard sign, response-time checklist",cost:"SEK 0–1,500 using existing digital tools",priority:"Medium",deadline:30},
  {id:9,group:"Resident information",title:"Are residents informed about available bicycle facilities?",help:"Check welcome packs, noticeboards, website pages and other channels.",action:"Create a bicycle-facilities guide for the website, welcome pack or noticeboard.",toolkit:"One-page resident guide, map, welcome-pack insert or noticeboard poster",cost:"SEK 0–2,000 using existing channels",priority:"Low",deadline:30},
  {id:10,group:"Resident information",title:"Does the provider encourage residents to use the facilities?",help:"Consider relevant communication, activities or seasonal information.",action:"Prepare a useful seasonal cycling information campaign or small resident activity.",toolkit:"Seasonal email/poster template, short resident event checklist",cost:"SEK 0–5,000 depending on event and printing",priority:"Low",deadline:60},
  {id:11,group:"Additional cycling support",title:"Are additional services available where residents need them?",help:"Examples include shared bicycles, cargo bikes or a repair partnership.",action:"Survey resident demand for shared bicycles, cargo bikes or a repair partnership before choosing a service.",toolkit:"Resident survey, local bike-shop partnership brief, shared-bike pilot checklist",cost:"SEK 0–3,000 for research; service cost requires quote",priority:"Low",deadline:90},
  {id:12,group:"Additional cycling support",title:"Does the provider collect resident feedback about cycling facilities?",help:"Feedback should be collected and reviewed in a clear way.",action:"Introduce a short resident feedback form and define when responses will be reviewed.",toolkit:"Short online survey, QR code, annual feedback review template",cost:"SEK 0–1,000 using existing tools",priority:"Low",deadline:60},
  {id:13,group:"Management & improvement",title:"Is a person or team responsible for bicycle facilities?",help:"Responsibilities and a contact route should be documented.",action:"Assign a responsible role and publish contact and reporting information.",toolkit:"Responsibility matrix, contact card, maintenance escalation flow",cost:"SEK 0–1,000 staff time/materials",priority:"Medium",deadline:30},
  {id:14,group:"Management & improvement",title:"Does the provider review facilities and plan improvements?",help:"Look for a documented inspection and follow-up process.",action:"Create a scheduled inspection checklist and a regular improvement review.",toolkit:"Quarterly inspection checklist, action tracker, annual review meeting",cost:"SEK 0–2,000 using existing tools",priority:"Low",deadline:90}
];
const answers = {};
const evidence = {};
const dialog = document.getElementById("assessmentDialog");
const list = document.getElementById("questionList");
const toast = document.getElementById("toast");
let toastTimer;

function renderQuestions(){
  list.innerHTML = "";
  let previousGroup = "";
  questions.forEach(q=>{
    if(q.group !== previousGroup){
      const heading=document.createElement("div");
      heading.className="question-group-heading";
      heading.innerHTML=`<div class="eyebrow">${q.group}</div>`;
      list.appendChild(heading);
      previousGroup=q.group;
    }
    const item=document.createElement("section");
    item.className="question-group";
    item.innerHTML=`<h4>Q${q.id}. ${q.title}</h4><p>${q.help}</p><div class="question-controls" role="group" aria-label="Score question ${q.id}">
      <button class="score-option" data-score="0" aria-pressed="${answers[q.id]===0}">0 · Needs work</button>
      <button class="score-option" data-score="1" aria-pressed="${answers[q.id]===1}">1 · Partly meets</button>
      <button class="score-option" data-score="2" aria-pressed="${answers[q.id]===2}">2 · Meets expectations</button>
    </div><input class="evidence-input" type="text" maxlength="240" placeholder="Evidence notes (optional)" aria-label="Evidence notes for question ${q.id}" value="${escapeHtml(evidence[q.id]||"")}">`;
    item.querySelectorAll(".score-option").forEach(btn=>btn.addEventListener("click",()=>{
      answers[q.id]=Number(btn.dataset.score); item.querySelectorAll(".score-option").forEach(b=>b.setAttribute("aria-pressed",String(b===btn))); updateProgress(); saveDemoState();
    }));
    item.querySelector(".evidence-input").addEventListener("input",e=>{evidence[q.id]=e.target.value;saveDemoState();});
    list.appendChild(item);
  });
  updateProgress();
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function scoreData(){
  const values=Object.values(answers), total=values.reduce((sum,v)=>sum+v,0), complete=values.length;
  const pct=Math.round(total/28*100);
  const stars=complete===14?(pct<20?1:pct<40?2:pct<60?3:pct<80?4:5):0;
  return {total,complete,pct,stars};
}
function updateProgress(){
  const d=scoreData(), pct=Math.round(d.complete/14*100);
  document.getElementById("progressText").textContent=`${d.complete} of 14 answered`;
  document.getElementById("progressPercent").textContent=`${pct}%`;
  document.getElementById("progressBar").style.width=`${pct}%`;
  const result=document.getElementById("resultRating");
  const summary=document.getElementById("resultSummary");
  document.getElementById("resultScore").innerHTML=`${d.total}<small> / 28</small>`;
  if(d.complete===14){result.textContent=`${"★".repeat(d.stars)}${"☆".repeat(5-d.stars)} · ${d.stars} star${d.stars===1?"":"s"}`;summary.textContent=`${d.total} of 28 points · ${d.pct}% provisional score. Awaiting administrator review.`;}
  else{result.textContent="Not yet rated";summary.textContent=`${d.complete} answers complete. Answer all questions to calculate a provisional rating.`;}
}
let planItems = [];
let workflowStatus = "Draft";
let activeRole = "provider";
let overallReviewText = "";
const demoStoreKey = "bikeFriendlyGotlandDemoV2";

function makeConsolidatedPlan(){
  const groups = new Map();
  questions.filter(q => answers[q.id] < 2).forEach(q => {
    if(!groups.has(q.group)) groups.set(q.group, []);
    groups.get(q.group).push(q);
  });
  planItems = [...groups.entries()].map(([group, qs], idx) => {
    const worst = Math.min(...qs.map(q => answers[q.id]));
    const priorities = qs.map(q => answers[q.id] === 0 ? q.priority : answers[q.id] === 1 ? "Medium" : "Low");
    const priority = priorities.includes("High") ? "High" : priorities.includes("Medium") ? "Medium" : "Low";
    return {
      id: idx + 1,
      title: `${group}: improvement package`,
      sourceQuestions: qs.map(q => q.id),
      action: qs.map(q => `Q${q.id}: ${q.action}`).join("\n\n"),
      toolkit: [...new Set(qs.map(q => q.toolkit))].join("; "),
      cost: qs.map(q => `Q${q.id}: ${q.cost}`).join("; "),
      priority: worst === 0 ? priority : (priority === "High" ? "High" : "Low"),
      deadline: Math.min(...qs.map(q => q.deadline)),
      status: "Suggested",
      reviewNote: ""
    };
  });
  if(!planItems.length) planItems = [{id:1,title:"Maintain and monitor current cycling facilities",sourceQuestions:questions.map(q=>q.id),action:"Continue regular inspections, review resident feedback and document maintenance so the current standard is maintained.",toolkit:"Quarterly inspection checklist; maintenance log; resident feedback form",cost:"SEK 0–2,000 per year (indicative; staff time may be additional)",priority:"Low",deadline:90,status:"Suggested",reviewNote:""}];
}
function generatePlan(){
  const d=scoreData(), container=document.getElementById("generatedActions");
  if(d.complete<14){
    container.innerHTML="";
    const missing=questions.filter(q=>answers[q.id]===undefined).map(q=>`Q${q.id}`).join(", ");
    container.innerHTML=`<div class="generated-action"><strong>Complete the assessment first</strong><p>Still unanswered: ${missing}. Blank answers are not counted as zero.</p></div>`;
    return;
  }
  makeConsolidatedPlan(); workflowStatus="Draft"; activeRole="provider"; overallReviewText="";
  renderPlanItems(); renderWorkflow(); saveDemoState();
  showToast(`One consolidated draft plan created for ${document.getElementById("propertyName").value || "your property"}.`);
  document.getElementById("resultPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function renderPlanItems(){
 const container=document.getElementById("generatedActions"); container.innerHTML="";
 if(!planItems.length){container.innerHTML='<div class="generated-action"><strong>No plan yet</strong><p>Answer all 14 questions, then select Generate action plan.</p></div>';return;}
 planItems.forEach((a,i)=>{
  const div=document.createElement("div");div.className="generated-action editable-action";
  const linked=(a.sourceQuestions||[]).map(id=>`Q${id}`).join(", ");
  div.innerHTML=`<div class="action-plan-title"><span class="priority ${a.priority.toLowerCase()}">${escapeHtml(a.priority)} PRIORITY</span><strong>${escapeHtml(a.title)}</strong></div><p class="source-questions">Combined from assessment: ${linked}</p><div class="action-edit-grid"><label>Action title<input data-field="title" data-index="${i}" value="${escapeHtml(a.title)}"></label><label>Priority<select data-field="priority" data-index="${i}"><option ${a.priority==='High'?'selected':''}>High</option><option ${a.priority==='Medium'?'selected':''}>Medium</option><option ${a.priority==='Low'?'selected':''}>Low</option></select></label><label class="wide">Recommended action<textarea data-field="action" data-index="${i}" rows="4">${escapeHtml(a.action)}</textarea></label><label class="wide">Practical toolkit / how to do it<textarea data-field="toolkit" data-index="${i}" rows="3">${escapeHtml(a.toolkit)}</textarea></label><label class="wide">Indicative cost breakdown (SEK)<textarea data-field="cost" data-index="${i}" rows="2">${escapeHtml(a.cost)}</textarea></label><label>Target in days<input type="number" min="1" max="730" data-field="deadline" data-index="${i}" value="${a.deadline}"></label><label>Reviewer / implementation note<textarea data-field="reviewNote" data-index="${i}" rows="2" placeholder="Notes from Energicentrum or provider">${escapeHtml(a.reviewNote||"")}</textarea></label></div><p class="cost-caveat">Costs are indicative estimates from the prototype, not supplier quotes. Confirm quantities, VAT, installation, site conditions and procurement costs.</p>`;
  div.querySelectorAll("[data-field]").forEach(input=>input.addEventListener("change",()=>{const field=input.dataset.field;planItems[Number(input.dataset.index)][field]=input.value;saveDemoState();renderWorkflow();}));
  container.appendChild(div);
 });
}
function saveDemoState(){
 try{localStorage.setItem(demoStoreKey,JSON.stringify({propertyName:document.getElementById("propertyName").value,answers,evidence,planItems,workflowStatus,overallReviewText,activeRole,updatedAt:new Date().toISOString()}));}catch(e){}
}
function loadDemoState(){
 try{const d=JSON.parse(localStorage.getItem(demoStoreKey)||"null");if(!d)return;
  if(d.propertyName)document.getElementById("propertyName").value=d.propertyName;
  Object.assign(answers,d.answers||{});Object.assign(evidence,d.evidence||{});planItems=d.planItems||[];workflowStatus=d.workflowStatus||"Draft";overallReviewText=d.overallReviewText||"";activeRole=d.activeRole||"provider";
 }catch(e){}
}
function renderWorkflow(){
 const el=document.getElementById("workflowPanel"); if(!el)return;
 const submitted=["Submitted for review","Under Energicentrum review","Returned for changes","Approved","Published"].includes(workflowStatus);
 const isApproved=["Approved","Published"].includes(workflowStatus);
 const tabs=`<div class="role-tabs" aria-label="Demo role navigation"><button class="${activeRole==='provider'?'active':''}" id="roleProvider">Housing provider</button><button class="${activeRole==='reviewer'?'active':''}" id="roleReviewer">Energicentrum reviewer</button><button class="${activeRole==='approved'?'active':''}" id="roleApproved">Provider · approved plan</button></div>`;
 let body='';
 if(activeRole==='provider'){
  body=`<div class="workflow-head"><div><span class="card-kicker">HOUSING PROVIDER WORKSPACE</span><h3>${escapeHtml(document.getElementById("propertyName").value||"My property")}</h3><p>Review your consolidated draft before sending it to Energicentrum.</p></div><span class="status-pill">${escapeHtml(workflowStatus)}</span></div><div class="workflow-summary"><b>${planItems.length}</b><span>combined action packages</span><b>${scoreData().total}/28</b><span>provisional score</span></div><p class="workflow-note">Actions are grouped by improvement area, and each package lists the assessment questions that triggered it. Edit your draft above, then submit for review.</p><div class="workflow-buttons"><button class="button" id="submitPlan" ${planItems.length?'':'disabled'}>Submit plan to Energicentrum ↗</button><button class="button button-outline" id="exportPlan">Download plan JSON</button></div>${workflowStatus==='Returned for changes'?`<div class="review-feedback"><b>Energicentrum feedback</b><p>${escapeHtml(overallReviewText||'Please review the action notes and resubmit.')}</p></div>`:''}<p class="workflow-note">Demo mode: state is saved in this browser only. It is not shared with a separate Energicentrum account.</p>`;
 } else if(activeRole==='reviewer'){
  body=`<div class="workflow-head"><div><span class="card-kicker">ENERGICENTRUM · REVIEW QUEUE</span><h3>Review submitted action plan</h3><p>${escapeHtml(document.getElementById("propertyName").value||"My property")} · ${scoreData().total}/28 provisional points</p></div><span class="status-pill">${escapeHtml(workflowStatus)}</span></div>${!submitted?'<div class="review-feedback"><b>No submission in queue yet</b><p>Go to the Housing provider tab and submit the generated plan first. For this clickable demo, you can still preview the review actions below.</p></div>':''}<div class="reviewer-fields"><label>Overall review feedback<textarea id="overallReview" rows="3" placeholder="Explain approval, requested changes, or evidence still needed">${escapeHtml(overallReviewText)}</textarea></label></div><p class="workflow-note">Review each editable action above. Your edits, costs, toolkit suggestions and notes form the proposed final plan.</p><div class="workflow-buttons"><button class="button" id="approvePlan" ${submitted?"":"disabled"}>Approve plan ✓</button><button class="button button-outline" id="returnPlan" ${submitted?"":"disabled"}>Return to provider for changes</button><button class="button button-outline" id="exportPlan">Download review JSON</button></div><p class="workflow-note">Prototype limitation: reviewer permissions are simulated; this is not a secure administrator account.</p>`;
 } else {
  body=`<div class="workflow-head"><div><span class="card-kicker">HOUSING PROVIDER · FINAL PLAN</span><h3>${isApproved?'Energicentrum-approved action plan':'Approved plan preview'}</h3><p>${escapeHtml(document.getElementById("propertyName").value||"My property")}</p></div><span class="status-pill">${escapeHtml(workflowStatus)}</span></div>${isApproved?`<div class="approval-banner"><strong>✓ Approved by Energicentrum (demo)</strong><p>${escapeHtml(overallReviewText||'The action plan has been approved in this prototype.')}</p></div>`:'<div class="review-feedback"><b>Not approved yet</b><p>Submit the draft and use the Energicentrum reviewer tab to approve it. This screen will then show the approved version.</p></div>'}<div class="provider-final-actions">${planItems.map((a,i)=>`<article class="final-action"><div class="final-action-top"><span class="priority ${String(a.priority).toLowerCase()}">${escapeHtml(a.priority)} PRIORITY</span><span class="final-action-deadline">Target: ${escapeHtml(a.deadline)} days</span></div><h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.action).replace(/\n/g,'<br>')}</p><div><b>Toolkit / how to implement</b><p>${escapeHtml(a.toolkit)}</p></div><div><b>Indicative cost (SEK)</b><p>${escapeHtml(a.cost)}</p></div>${a.reviewNote?`<div><b>Review / implementation note</b><p>${escapeHtml(a.reviewNote)}</p></div>`:''}<label class="progress-select">Implementation status<select data-progress="${i}"><option ${a.implementationStatus==='Not started'||!a.implementationStatus?'selected':''}>Not started</option><option ${a.implementationStatus==='In progress'?'selected':''}>In progress</option><option ${a.implementationStatus==='Completed'?'selected':''}>Completed</option><option ${a.implementationStatus==='Needs support'?'selected':''}>Needs support</option></select></label></article>`).join('')}</div><div class="workflow-buttons"><button class="button button-outline" id="exportPlan">Download final plan JSON</button></div><p class="workflow-note">This final-plan view is intended for the housing provider. It is not a householder portal. Demo approval does not constitute official Energicentrum approval.</p>`;
 }
 el.innerHTML=`${tabs}<div class="workflow-role-content">${body}</div>`;
 document.getElementById("roleProvider").onclick=()=>{activeRole='provider';renderWorkflow();saveDemoState();};
 document.getElementById("roleReviewer").onclick=()=>{activeRole='reviewer';workflowStatus=workflowStatus==='Submitted for review'?'Under Energicentrum review':workflowStatus;renderWorkflow();saveDemoState();};
 document.getElementById("roleApproved").onclick=()=>{activeRole='approved';renderWorkflow();saveDemoState();};
 const feedback=document.getElementById('overallReview');if(feedback)feedback.addEventListener('input',()=>{overallReviewText=feedback.value;saveDemoState();});
 const submit=document.getElementById('submitPlan');if(submit)submit.onclick=()=>{workflowStatus='Submitted for review';activeRole='reviewer';renderWorkflow();saveDemoState();showToast('Submitted in the local demo. Switches to Energicentrum review.');};
 const approve=document.getElementById('approvePlan');if(approve)approve.onclick=()=>{overallReviewText=document.getElementById('overallReview')?.value||overallReviewText;workflowStatus='Approved';activeRole='approved';renderWorkflow();saveDemoState();showToast('Plan approved in the clickable demo.');};
 const ret=document.getElementById('returnPlan');if(ret)ret.onclick=()=>{overallReviewText=document.getElementById('overallReview')?.value||'';workflowStatus='Returned for changes';activeRole='provider';renderWorkflow();saveDemoState();showToast('Plan returned to the housing provider in the demo.');};
 const exp=document.getElementById('exportPlan');if(exp)exp.onclick=()=>{const packet={propertyName:document.getElementById('propertyName').value,score:scoreData(),answers,evidence,actions:planItems,status:workflowStatus,reviewerFeedback:overallReviewText,createdAt:new Date().toISOString(),prototypeNotice:'Local clickable demonstration only. Not transmitted to Energicentrum.'};const blob=new Blob([JSON.stringify(packet,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='bike-friendly-action-plan.json';a.click();URL.revokeObjectURL(url);};
 el.querySelectorAll('[data-progress]').forEach(sel=>{sel.value=sel.dataset.value||'Not started';sel.addEventListener('change',()=>{const i=Number(sel.dataset.progress);planItems[i].implementationStatus=sel.value;saveDemoState();showToast('Implementation progress updated in this browser.');});});
}
function openAssessment(){if(!dialog.open)dialog.showModal();}
function showToast(message){toast.textContent=message;toast.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("visible"),3200);}
["startTop","startHero","startAssessment","startBottom","openAssessment"].forEach(id=>document.getElementById(id).addEventListener("click",openAssessment));
document.getElementById("closeDialog").addEventListener("click",()=>dialog.close());
document.getElementById("showPlan").addEventListener("click",generatePlan);
document.getElementById("propertyName").addEventListener("input",()=>saveDemoState());
document.getElementById("resetAssessment").addEventListener("click",()=>{Object.keys(answers).forEach(k=>delete answers[k]);Object.keys(evidence).forEach(k=>delete evidence[k]);planItems=[];workflowStatus="Draft";activeRole="provider";overallReviewText="";renderQuestions();renderPlanItems();renderWorkflow();updateProgress();saveDemoState();showToast("Assessment reset.");});
document.getElementById("menuToggle").addEventListener("click",()=>{const nav=document.getElementById("nav"),isOpen=nav.classList.toggle("open");document.getElementById("menuToggle").setAttribute("aria-expanded",String(isOpen));});
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));
loadDemoState();
renderQuestions();
if(planItems.length){renderPlanItems();renderWorkflow();} else {renderWorkflow();}
