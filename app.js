(() => {
"use strict";

const STORAGE_KEY = "bfnDemoStateV2";
const PROFILE_KEY = "bfnProviderProfileV1";

const questions = [
  {area:"Cycling access",title:"Are everyday destinations easy to reach by bicycle?",help:"Consider shops, schools, services and public transport.",actions:["Map everyday destinations and identify missing cycling links.","Coordinate with the municipality on safe connections to key destinations."]},
  {area:"Cycling access",title:"Are routes to public transport convenient and safe?",help:"Consider stations, bus stops, crossings and last-mile connections.",actions:["Audit cycling routes to nearby public transport stops.","Prioritise missing links and safer crossings with the municipality."]},
  {area:"Cycling access",title:"Are cycling routes continuous and easy to navigate?",help:"Look for gaps, confusing junctions and route barriers.",actions:["Map route gaps and confusing junctions.","Install clear wayfinding to local destinations and cycle routes."]},
  {area:"Bicycle parking",title:"Is there enough bicycle parking near entrances?",help:"Think about capacity, location, weather protection and everyday convenience.",actions:["Survey parking demand and add secure stands near entrances.","Provide covered bicycle parking close to building entrances."]},
  {area:"Bicycle parking",title:"Is secure bicycle storage available to residents?",help:"Consider access control, lighting, space and perceived safety.",actions:["Review secure storage access and resident demand.","Upgrade storage security, lighting and access where needed."]},
  {area:"Bicycle parking",title:"Is bicycle parking accessible for different bicycle types?",help:"Consider cargo bikes, e-bikes, child seats and adapted cycles.",actions:["Check parking layout for cargo bikes and adapted cycles.","Create a mix of standard and larger bicycle spaces."]},
  {area:"Safety and comfort",title:"Do residents feel safe cycling in and around the area?",help:"Use resident feedback, audits and known conflict points.",actions:["Run a resident safety survey and evening route audit.","Work with the municipality to address identified conflict points."]},
  {area:"Safety and comfort",title:"Are walking and cycling routes well lit?",help:"Consider entrances, paths, parking and winter conditions.",actions:["Audit lighting on paths and at bicycle parking.","Improve lighting at dark routes, entrances and storage areas."]},
  {area:"Safety and comfort",title:"Are crossings and junctions easy to use?",help:"Consider visibility, speed, priority and accessibility.",actions:["Identify difficult crossings and document barriers.","Raise priority crossing improvements with the responsible road owner."]},
  {area:"Safety and comfort",title:"Are cycling routes maintained throughout the year?",help:"Consider snow clearance, leaves, surface quality and drainage.",actions:["Agree on a seasonal maintenance checklist with responsible teams.","Track surface defects, drainage and winter maintenance issues."]},
  {area:"Services and support",title:"Can residents access basic bicycle repair facilities?",help:"Consider pumps, tools, repair partners and service information.",actions:["Install a shared pump and basic repair stand.","Partner with a local bicycle repair service for resident support."]},
  {area:"Services and support",title:"Are residents informed about cycling options and routes?",help:"Consider welcome packs, noticeboards, maps and digital channels.",actions:["Create a simple cycling information page and resident guide.","Share local route maps and practical cycling information."]},
  {area:"Services and support",title:"Are residents encouraged to share feedback on cycling?",help:"Consider surveys, meetings, tenant forums and follow-up.",actions:["Add cycling questions to resident feedback channels.","Hold a resident walk-and-cycle audit and publish actions."]},
  {area:"Services and support",title:"Is there a plan to monitor cycling improvements?",help:"Consider responsibilities, targets, budget and review dates.",actions:["Assign an owner and simple indicators for each improvement.","Set an annual review of cycling facilities and resident feedback."]}
];

const $ = id => document.getElementById(id);
let state = loadState();
let profile = loadProfile();
let activeTab = "provider";
let toastTimer;

function defaultState() {
  return {propertyName:"",answers:{},notes:{},planItems:[],workflowStatus:"Not started",reviewFeedback:"",reviewerName:"Energicentrum reviewer",lastUpdated:null};
}
function loadState() {
  try { return {...defaultState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {})}; }
  catch { return defaultState(); }
}
function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); }
  catch { return null; }
}
function persist() {
  state.lastUpdated = new Date().toISOString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast("Browser storage is unavailable; changes may not persist."); }
  updateDashboardStatuses();
}
function persistProfile() {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); return true; }
  catch { showToast("Could not save profile in this browser."); return false; }
}
function showToast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}
function openDialog(dialog) { if (!dialog.open) dialog.showModal(); }
function closeDialog(dialog) { if (dialog.open) dialog.close(); }

function openProviderPortal() {
  if (profile) showDashboard(); else showRegistration();
  openDialog($("providerDialog"));
}
function showRegistration() {
  $("providerRegistrationForm").hidden = false;
  $("providerDashboard").hidden = true;
  $("providerDialogTitle").textContent = profile ? "Edit organisation profile" : "Register your organisation";
  const p = profile || {};
  $("orgName").value = p.organisation || "";
  $("orgType").value = p.organisationType || "Municipal housing company";
  $("orgProperties").value = p.properties || "1–5";
  $("orgContact").value = p.contact || "";
  $("orgEmail").value = p.email || "";
  $("orgPhone").value = p.phone || "";
  $("orgLocation").value = p.municipality || "";
}
function showDashboard() {
  if (!profile) return showRegistration();
  $("providerRegistrationForm").hidden = true;
  $("providerDashboard").hidden = false;
  $("providerDialogTitle").textContent = "Housing provider dashboard";
  $("dashboardOrgName").textContent = profile.organisation;
  $("providerAvatar").textContent = (profile.organisation || "H").trim().charAt(0).toUpperCase();
  $("dashboardOrgDetails").textContent = `${profile.organisationType} · ${profile.municipality} · ${profile.properties} properties`;
  $("dashboardContact").textContent = `${profile.contact} · ${profile.email}${profile.phone ? " · " + profile.phone : ""}`;
  updateDashboardStatuses();
}
function updateDashboardStatuses() {
  if (!$("dashboardAssessmentStatus")) return;
  const answered = Object.keys(state.answers).length;
  $("dashboardAssessmentStatus").textContent = state.planItems.length
    ? `${answered}/14 questions answered · Plan generated`
    : answered ? `${answered}/14 questions answered · Draft in progress`
    : "No assessment started yet.";
  $("dashboardReviewStatus").textContent = state.planItems.length
    ? `Status: ${state.workflowStatus}. ${state.planItems.length} action package(s).`
    : "Complete the assessment to generate an action plan.";
}

function renderQuestions() {
  const list = $("questionList");
  list.innerHTML = "";
  questions.forEach((q, i) => {
    const card = document.createElement("article");
    card.className = "question-card";
    const head = document.createElement("div"); head.className = "question-head";
    const num = document.createElement("span"); num.className = "question-number"; num.textContent = String(i+1).padStart(2,"0");
    const copy = document.createElement("div");
    const title = document.createElement("h3"); title.textContent = q.title;
    const help = document.createElement("p"); help.textContent = `${q.area} · ${q.help}`;
    copy.append(title, help); head.append(num, copy); card.append(head);
    const ratings = document.createElement("div"); ratings.className = "rating-options"; ratings.setAttribute("role","radiogroup"); ratings.setAttribute("aria-label",q.title);
    ["1","2","3","4","5"].forEach(n => {
      const label = document.createElement("label");
      const input = document.createElement("input"); input.type = "radio"; input.name = `q${i}`; input.value = n;
      input.checked = Number(state.answers[i]) === Number(n);
      input.addEventListener("change", () => { state.answers[i] = Number(n); persist(); updateScore(); });
      label.append(input, document.createTextNode(`${n} ${["","Poor","Weak","Fair","Good","Excellent"][Number(n)]}`)); ratings.append(label);
    });
    const note = document.createElement("textarea"); note.placeholder = "Evidence notes (optional): observations, resident feedback, plans…"; note.setAttribute("aria-label",`Evidence notes for question ${i+1}`); note.value = state.notes[i] || "";
    note.addEventListener("input", () => { state.notes[i] = note.value; persist(); });
    card.append(ratings, note); list.append(card);
  });
  $("propertyName").value = state.propertyName || "";
  $("propertyName").addEventListener("input", () => { state.propertyName = $("propertyName").value; persist(); });
  updateScore();
}
function updateScore() {
  const vals = Object.values(state.answers).map(Number).filter(n => n >= 1 && n <= 5);
  const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  $("liveScore").textContent = vals.length ? avg.toFixed(1) : "—";
  $("assessmentProgress").style.width = `${(vals.length/questions.length)*100}%`;
  $("progressLabel").textContent = `${vals.length} of ${questions.length} answered`;
}
function openAssessment() {
  $("propertyName").value = state.propertyName || (profile && profile.organisation) || "";
  renderQuestions();
  if (state.planItems.length) {
    $("workflowPanel").hidden = false;
    renderWorkflow();
  }
  openDialog($("assessmentDialog"));
}
function saveDraft() {
  state.propertyName = $("propertyName").value.trim();
  persist();
  $("assessmentMessage").textContent = "Draft saved in this browser.";
  showToast("Assessment draft saved.");
}
function generatePlan() {
  state.propertyName = $("propertyName").value.trim();
  const answered = Object.keys(state.answers).length;
  if (answered < questions.length) {
    const proceed = confirm(`You have answered ${answered} of ${questions.length} questions. Generate a provisional plan using the answers so far?`);
    if (!proceed) return;
  }
  const grouped = {};
  questions.forEach((q,i) => {
    const score = Number(state.answers[i] || 0);
    if (!score || score >= 4) return;
    if (!grouped[q.area]) grouped[q.area] = {area:q.area, scores:[], titles:[], recommendations:[], notes:[]};
    grouped[q.area].scores.push(score);
    grouped[q.area].titles.push(q.title);
    grouped[q.area].recommendations.push(q.actions[score <= 2 ? 0 : 1]);
    if (state.notes[i]) grouped[q.area].notes.push(state.notes[i]);
  });
  state.planItems = Object.values(grouped).map((g,index) => {
    const avg = g.scores.reduce((a,b)=>a+b,0)/g.scores.length;
    const priority = avg <= 2 ? "High" : "Medium";
    return {
      id:`action-${index+1}`, area:g.area, title:`Improve ${g.area.toLowerCase()}`,
      basedOn:g.titles, recommendations:[...new Set(g.recommendations)],
      evidence:g.notes.join(" | "), priority,
      toolkit: g.area === "Bicycle parking" ? "Parking demand checklist and secure storage guide" : g.area === "Safety and comfort" ? "Walk-and-cycle audit checklist" : "Neighbourhood cycling improvement toolkit",
      cost: g.area === "Bicycle parking" ? "25,000–80,000 SEK" : g.area === "Safety and comfort" ? "10,000–60,000 SEK" : g.area === "Cycling access" ? "10,000–50,000 SEK" : "5,000–20,000 SEK",
      targetDate: `${new Date().getFullYear()}-12-31`,
      reviewerRecommendation:"", reviewerFeedback:"", implementationStatus:"Not started"
    };
  });
  if (!state.planItems.length) {
    state.planItems = [{id:"action-1",area:"Continuous improvement",title:"Maintain and monitor cycling facilities",basedOn:["All assessment answers were rated 4 or 5, or no answers were provided."],recommendations:["Maintain a regular review of bicycle parking, route quality and resident feedback.","Record a baseline and revisit the assessment annually."],evidence:"",priority:"Low",toolkit:"Annual neighbourhood review checklist",cost:"5,000–15,000 SEK",targetDate:`${new Date().getFullYear()+1}-06-30`,reviewerRecommendation:"",reviewerFeedback:"",implementationStatus:"Not started"}];
  }
  state.workflowStatus = "Draft";
  state.reviewFeedback = "";
  persist();
  $("workflowPanel").hidden = false;
  renderWorkflow();
  $("assessmentMessage").textContent = "Combined action plan generated. Review the packages below.";
  $("workflowPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderPlanItems(container, mode) {
  container.innerHTML = "";
  if (!state.planItems.length) { container.innerHTML = '<div class="empty-state">No action plan yet. Complete the assessment and generate a plan.</div>'; return; }
  state.planItems.forEach((item, idx) => {
    const article = document.createElement("article"); article.className = "action-item";
    const row = document.createElement("div"); row.className = "action-title-row";
    const titleWrap = document.createElement("div"); const title = document.createElement("h3"); title.textContent = item.title;
    const subtitle = document.createElement("p"); subtitle.textContent = `${item.area} · Based on ${item.basedOn.length} assessment finding(s)`;
    titleWrap.append(title, subtitle);
    const tag = document.createElement("span"); tag.className = `tag ${item.priority.toLowerCase()}`; tag.textContent = `${item.priority} priority`;
    row.append(titleWrap, tag); article.append(row);
    item.recommendations.forEach(rec => { const p = document.createElement("p"); p.textContent = `• ${rec}`; article.append(p); });
    const meta = document.createElement("div"); meta.className = "action-meta";
    [`Indicative cost: ${item.cost}`,`Target: ${item.targetDate}`,`Toolkit: ${item.toolkit}`].forEach(t => {const s=document.createElement("span");s.className="tag";s.textContent=t;meta.append(s);});
    article.append(meta);
    if (item.evidence) {const evidence=document.createElement("p"); evidence.textContent=`Evidence notes: ${item.evidence}`; article.append(evidence);}
    const status = document.createElement("p"); status.textContent = `Implementation status: ${item.implementationStatus}`; article.append(status);
    if (mode === "reviewer") {
      const recLabel = document.createElement("label"); recLabel.className="review-field"; recLabel.textContent="Reviewer recommendation (optional)";
      const recInput = document.createElement("textarea"); recInput.value=item.reviewerRecommendation||""; recInput.placeholder="Suggested changes or improvements…";
      recInput.addEventListener("change",()=>{item.reviewerRecommendation=recInput.value;persist();});
      recLabel.append(recInput); article.append(recLabel);
      const feedbackLabel = document.createElement("label"); feedbackLabel.className="review-field"; feedbackLabel.textContent="Reviewer feedback";
      const feedback = document.createElement("textarea"); feedback.value=item.reviewerFeedback||""; feedback.placeholder="Explain what is approved or what needs changing…";
      feedback.addEventListener("change",()=>{item.reviewerFeedback=feedback.value;persist();});
      feedbackLabel.append(feedback); article.append(feedbackLabel);
      const dateLabel=document.createElement("label");dateLabel.className="review-field";dateLabel.textContent="Target date";
      const date=document.createElement("input");date.type="date";date.value=item.targetDate||"";date.addEventListener("change",()=>{item.targetDate=date.value;persist();});dateLabel.append(date);article.append(dateLabel);
      const priorityLabel=document.createElement("label");priorityLabel.className="review-field";priorityLabel.textContent="Priority";
      const priority=document.createElement("select");["High","Medium","Low"].forEach(p=>{const o=document.createElement("option");o.value=p;o.textContent=p;priority.append(o);});priority.value=item.priority;priority.addEventListener("change",()=>{item.priority=priority.value;persist();renderWorkflow();});priorityLabel.append(priority);article.append(priorityLabel);
    }
    if (mode === "approved") {
      const fb = item.reviewerFeedback || item.reviewerRecommendation || state.reviewFeedback || "No additional reviewer feedback.";
      const p = document.createElement("p"); p.textContent = `Energicentrum feedback: ${fb}`; article.append(p);
      const label=document.createElement("label");label.className="review-field";label.textContent="Implementation status";
      const select=document.createElement("select");["Not started","Planned","In progress","Completed","Blocked"].forEach(s=>{const o=document.createElement("option");o.value=s;o.textContent=s;select.append(o);});select.value=item.implementationStatus;
      select.addEventListener("change",()=>{item.implementationStatus=select.value;persist();});label.append(select);article.append(label);
    }
    container.append(article);
  });
}
function renderWorkflow() {
  $("workflowStatusBadge").textContent = state.workflowStatus;
  const answered = Object.keys(state.answers).length;
  const avg = answered ? Object.values(state.answers).reduce((a,b)=>a+Number(b),0)/answered : 0;
  $("planSummary").innerHTML = "";
  [
    ["Assessment score",answered ? `${avg.toFixed(1)} / 5` : "Not rated"],
    ["Action packages",String(state.planItems.length)],
    ["Workflow status",state.workflowStatus]
  ].forEach(([label,value])=>{const d=document.createElement("div");d.className="summary-stat";const s=document.createElement("span");s.textContent=label;const b=document.createElement("strong");b.textContent=value;d.append(s,b);$("planSummary").append(d);});
  renderPlanItems($("providerTab"),"provider");
  renderPlanItems($("reviewerTab"),"reviewer");
  renderPlanItems($("approvedTab"),"approved");
  $("providerTab").prepend(makeStatusMessage(`Status: ${state.workflowStatus}. ${state.reviewFeedback ? "Reviewer feedback: "+state.reviewFeedback : "Submit the plan to send it into the demo review stage."}`));
  $("reviewerTab").prepend(makeReviewerControls());
  $("approvedTab").prepend(makeStatusMessage(state.workflowStatus === "Approved" ? "This plan has been approved in the demo. The provider can track implementation status below." : state.workflowStatus === "Changes requested" ? `Changes requested. Provider feedback: ${state.reviewFeedback || "See notes on individual actions."}` : `Current status: ${state.workflowStatus}. Approve or return the plan from the reviewer tab.`));
  setActiveTab(activeTab);
}
function makeStatusMessage(text) { const d=document.createElement("div");d.className="status-message";d.textContent=text;return d; }
function makeReviewerControls() {
  const wrap=document.createElement("div");
  const intro=document.createElement("p");intro.className="dialog-intro";intro.textContent="Energicentrum reviewer view · edit recommendations, provide feedback, and approve or return the plan.";wrap.append(intro);
  const label=document.createElement("label");label.className="review-field";label.textContent="Overall reviewer feedback";
  const textarea=document.createElement("textarea");textarea.value=state.reviewFeedback||"";textarea.placeholder="Summarise the review outcome and any changes required…";
  textarea.addEventListener("change",()=>{state.reviewFeedback=textarea.value;persist();});label.append(textarea);wrap.append(label);
  const actions=document.createElement("div");actions.className="review-actions";
  const submit=makeButton("Submit plan to Energicentrum","button button-outline",()=>{
    if (!state.planItems.length) return showToast("Generate an action plan first.");
    state.workflowStatus="Submitted for review";persist();renderWorkflow();showToast("Plan submitted in this browser demo.");
  });
  const approve=makeButton("Approve plan ✓","button",()=>{
    if (!state.planItems.length) return showToast("Generate an action plan first.");
    state.workflowStatus="Approved";persist();renderWorkflow();showToast("Plan approved in the demo.");
  });
  const returnBtn=makeButton("Return for changes","button button-outline",()=>{
    if (!state.planItems.length) return showToast("Generate an action plan first.");
    if (!state.reviewFeedback.trim() && !state.planItems.some(x=>x.reviewerFeedback||x.reviewerRecommendation)) {
      if (!confirm("No reviewer feedback has been entered. Return the plan anyway?")) return;
    }
    state.workflowStatus="Changes requested";persist();renderWorkflow();showToast("Plan returned for changes in the demo.");
  });
  actions.append(submit,approve,returnBtn);wrap.append(actions);return wrap;
}
function makeButton(text, cls, onClick) { const b=document.createElement("button");b.type="button";b.className=cls;b.textContent=text;b.addEventListener("click",onClick);return b; }
function setActiveTab(tab) {
  activeTab=tab;
  document.querySelectorAll(".tab-button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  $("providerTab").hidden=tab!=="provider";$("reviewerTab").hidden=tab!=="reviewer";$("approvedTab").hidden=tab!=="approved";
}
function openWorkflow() {
  openAssessment();
  if (!state.planItems.length) showToast("Complete the assessment and generate an action plan first.");
  else { $("workflowPanel").hidden=false;renderWorkflow();$("workflowPanel").scrollIntoView({behavior:"smooth",block:"start"}); }
}

$("openProviderPortal").addEventListener("click",openProviderPortal);
$("heroRegister").addEventListener("click",openProviderPortal);
$("ctaRegister").addEventListener("click",openProviderPortal);
$("openReviewerPortal").addEventListener("click",()=>{openAssessment();activeTab="reviewer";if(state.planItems.length){$("workflowPanel").hidden=false;renderWorkflow();$("workflowPanel").scrollIntoView({behavior:"smooth",block:"start"});}else showToast("Generate an action plan first to use the reviewer demo.");});
$("closeProviderDialog").addEventListener("click",()=>closeDialog($("providerDialog")));
$("cancelProviderRegistration").addEventListener("click",()=>closeDialog($("providerDialog")));
$("closeProviderDashboard").addEventListener("click",()=>closeDialog($("providerDialog")));
$("editProviderProfile").addEventListener("click",showRegistration);
$("providerRegistrationForm").addEventListener("submit",e=>{
  e.preventDefault();
  profile={organisation:$("orgName").value.trim(),organisationType:$("orgType").value,properties:$("orgProperties").value,contact:$("orgContact").value.trim(),email:$("orgEmail").value.trim(),phone:$("orgPhone").value.trim(),municipality:$("orgLocation").value.trim()};
  if(!persistProfile()) return;
  showDashboard();showToast("Demo organisation profile saved.");
});
$("dashboardStartAssessment").addEventListener("click",()=>{
  if(profile && !state.propertyName) state.propertyName=profile.organisation;
  persist();closeDialog($("providerDialog"));openAssessment();
});
$("dashboardOpenWorkflow").addEventListener("click",()=>{closeDialog($("providerDialog"));openWorkflow();});
$("startAssessment").addEventListener("click",openAssessment);
$("openPlan").addEventListener("click",openWorkflow);
$("closeAssessment").addEventListener("click",()=>closeDialog($("assessmentDialog")));
$("saveAssessment").addEventListener("click",saveDraft);
$("generatePlan").addEventListener("click",generatePlan);
document.querySelectorAll(".tab-button").forEach(b=>b.addEventListener("click",()=>setActiveTab(b.dataset.tab)));
$("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
$("mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
$("assessmentDialog").addEventListener("close",()=>persist());

renderQuestions();
updateDashboardStatuses();
})();
