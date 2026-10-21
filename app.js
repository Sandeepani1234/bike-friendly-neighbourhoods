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
      answers[q.id]=Number(btn.dataset.score); item.querySelectorAll(".score-option").forEach(b=>b.setAttribute("aria-pressed",String(b===btn))); updateProgress();
    }));
    item.querySelector(".evidence-input").addEventListener("input",e=>evidence[q.id]=e.target.value);
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
function generatePlan(){
  const d=scoreData(), container=document.getElementById("generatedActions");
  container.innerHTML="";
  if(d.complete<14){
    const missing=questions.filter(q=>answers[q.id]===undefined).map(q=>`Q${q.id}`).join(", ");
    container.innerHTML=`<div class="generated-action"><strong>Complete the assessment first</strong><p>Still unanswered: ${missing}. Blank answers are not counted as zero.</p></div>`;
    return;
  }
  planItems=questions.filter(q=>answers[q.id]<2).map(q=>({id:q.id,title:`Q${q.id} · ${q.title}`,action:q.action,toolkit:q.toolkit,cost:q.cost,priority:answers[q.id]===0?q.priority:"Low",deadline:q.deadline,status:"Suggested",reviewNote:""}));
  if(!planItems.length) planItems=[{id:0,title:"Maintain current cycling facilities",action:"Continue inspections and collect resident feedback to maintain the current standard.",toolkit:"Quarterly inspection checklist and resident feedback form",cost:"SEK 0–2,000 per year (indicative)",priority:"Low",deadline:90,status:"Suggested",reviewNote:""}];
  workflowStatus="Draft";
  renderPlanItems(); renderWorkflow();
  showToast(`Suggested action plan created for ${document.getElementById("propertyName").value || "your property"}.`);
  document.getElementById("resultPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function renderPlanItems(){
 const container=document.getElementById("generatedActions"); container.innerHTML="";
 planItems.forEach((a,i)=>{
  const div=document.createElement("div");div.className="generated-action editable-action";
  div.innerHTML=`<div class="action-edit-grid"><label>Action title<input data-field="title" data-index="${i}" value="${escapeHtml(a.title)}"></label><label>Priority<select data-field="priority" data-index="${i}"><option ${a.priority==='High'?'selected':''}>High</option><option ${a.priority==='Medium'?'selected':''}>Medium</option><option ${a.priority==='Low'?'selected':''}>Low</option></select></label><label class="wide">Recommended action<textarea data-field="action" data-index="${i}" rows="2">${escapeHtml(a.action)}</textarea></label><label class="wide">Practical toolkit suggestion<textarea data-field="toolkit" data-index="${i}" rows="2">${escapeHtml(a.toolkit)}</textarea></label><label>Indicative cost (SEK)<input data-field="cost" data-index="${i}" value="${escapeHtml(a.cost)}"></label><label>Target in days<input type="number" min="1" max="730" data-field="deadline" data-index="${i}" value="${a.deadline}"></label><label class="wide">Reviewer note<textarea data-field="reviewNote" data-index="${i}" rows="2" placeholder="Energicentrum can add review comments">${escapeHtml(a.reviewNote||"")}</textarea></label></div><p class="cost-caveat">Cost ranges are indicative planning estimates, not supplier quotes. Confirm VAT, installation, site conditions and procurement costs.</p>`;
  div.querySelectorAll("[data-field]").forEach(input=>input.addEventListener("change",()=>{const field=input.dataset.field;planItems[Number(input.dataset.index)][field]=input.value;renderWorkflow();}));
  container.appendChild(div);
 });
}
function renderWorkflow(){
 const el=document.getElementById("workflowPanel"); if(!el)return;
 el.innerHTML=`<div class="workflow-head"><div><span class="card-kicker">REVIEW WORKFLOW · DEMO</span><h3>Action plan handover</h3><p>Current status: <b>${escapeHtml(workflowStatus)}</b></p></div><span class="status-pill">${escapeHtml(workflowStatus)}</span></div><p class="workflow-note">In this static prototype, submission and reviewer actions are saved only in this browser. They do not send data to Energicentrum or other users.</p><div class="workflow-buttons"><button class="button" id="submitPlan">Submit for Energicentrum review</button><button class="button button-outline" id="reviewPlan">Reviewer view</button><button class="button button-outline" id="approvePlan">Approve plan (demo)</button><button class="button button-outline" id="returnPlan">Return for changes</button><button class="button button-outline" id="exportPlan">Download plan JSON</button></div><div id="reviewerFields" class="reviewer-fields" ${workflowStatus==='Submitted for review'||workflowStatus==='Under Energicentrum review'||workflowStatus==='Returned for changes'?'':'hidden'}><label>Overall reviewer feedback<textarea id="overallReview" rows="3" placeholder="Add feedback for the housing provider"></textarea></label></div>`;
 document.getElementById("submitPlan").onclick=()=>{workflowStatus="Submitted for review";renderWorkflow();showToast("Demo status updated. No external submission was sent.");};
 document.getElementById("reviewPlan").onclick=()=>{workflowStatus="Under Energicentrum review";renderWorkflow();showToast("Reviewer view enabled in this browser demo.");};
 document.getElementById("approvePlan").onclick=()=>{workflowStatus="Approved (demo only)";renderWorkflow();showToast("Demo approval recorded locally only.");};
 document.getElementById("returnPlan").onclick=()=>{workflowStatus="Returned for changes";renderWorkflow();showToast("Demo plan returned for changes.");};
 document.getElementById("exportPlan").onclick=()=>{const packet={propertyName:document.getElementById("propertyName").value,score:scoreData(),answers,evidence,actions:planItems,status:workflowStatus,reviewerFeedback:document.getElementById("overallReview")?.value||"",createdAt:new Date().toISOString(),prototypeNotice:"Export only; not transmitted to Energicentrum."};const blob=new Blob([JSON.stringify(packet,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="bike-friendly-action-plan.json";a.click();URL.revokeObjectURL(url);};
}
function openAssessment(){if(!dialog.open)dialog.showModal();}
function showToast(message){toast.textContent=message;toast.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("visible"),3200);}
["startTop","startHero","startAssessment","startBottom","openAssessment"].forEach(id=>document.getElementById(id).addEventListener("click",openAssessment));
document.getElementById("closeDialog").addEventListener("click",()=>dialog.close());
document.getElementById("showPlan").addEventListener("click",generatePlan);
document.getElementById("resetAssessment").addEventListener("click",()=>{Object.keys(answers).forEach(k=>delete answers[k]);Object.keys(evidence).forEach(k=>delete evidence[k]);renderQuestions();document.getElementById("generatedActions").innerHTML="";updateProgress();showToast("Assessment reset.");});
document.getElementById("menuToggle").addEventListener("click",()=>{const nav=document.getElementById("nav"),isOpen=nav.classList.toggle("open");document.getElementById("menuToggle").setAttribute("aria-expanded",String(isOpen));});
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));
renderQuestions();
