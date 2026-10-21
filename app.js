const questions = [
  {id:1,group:"Convenient bicycle parking",title:"Is there sufficient bicycle parking for residents?",help:"Consider the number of spaces compared with observed demand.",action:"Measure parking demand and occupancy, then assess whether additional bicycle spaces are needed.",priority:"Medium",deadline:30},
  {id:2,group:"Convenient bicycle parking",title:"Is bicycle parking convenient to reach and use?",help:"Think about access routes, location, layout and signs.",action:"Review the parking layout, access route, positioning and signs; prepare practical improvements.",priority:"Medium",deadline:60},
  {id:3,group:"Security",title:"Can residents lock their bicycles securely?",help:"Check whether suitable, usable locking points are available.",action:"Review rack design and add suitable locking points if necessary.",priority:"High",deadline:60},
  {id:4,group:"Security",title:"Is the parking area sufficiently lit and maintained?",help:"Look for lighting gaps, damage and maintenance issues.",action:"Inspect the area, prioritise maintenance faults and schedule repairs or lighting improvements.",priority:"High",deadline:30},
  {id:5,group:"Weather protection & accessibility",title:"Is covered bicycle parking available where appropriate?",help:"Consider local need, available space and feasibility.",action:"Assess resident demand, available space and feasibility before selecting covered parking options.",priority:"Low",deadline:90},
  {id:6,group:"Weather protection & accessibility",title:"Can residents with different needs use the parking and access routes?",help:"Identify practical barriers in routes and parking arrangements.",action:"Conduct an access review and plan to remove practical barriers within the provider’s control.",priority:"High",deadline:60},
  {id:7,group:"Bicycle maintenance",title:"Can residents access a pump and basic repair tools?",help:"An approved equivalent repair service may also meet the need.",action:"Compare a basic pump-and-tool kit with a shared repair point, based on demand and budget.",priority:"Medium",deadline:60},
  {id:8,group:"Bicycle maintenance",title:"Is there a clear process for reporting damaged facilities?",help:"Residents should know where to report problems and what happens next.",action:"Create a visible fault-reporting route and assign responsibility for follow-up.",priority:"Medium",deadline:30},
  {id:9,group:"Resident information",title:"Are residents informed about available bicycle facilities?",help:"Check welcome packs, noticeboards, website pages and other channels.",action:"Create a bicycle-facilities guide for the website, welcome pack or noticeboard.",priority:"Low",deadline:30},
  {id:10,group:"Resident information",title:"Does the provider encourage residents to use the facilities?",help:"Consider relevant communication, activities or seasonal information.",action:"Prepare a useful seasonal cycling information campaign or small resident activity.",priority:"Low",deadline:60},
  {id:11,group:"Additional cycling support",title:"Are additional services available where residents need them?",help:"Examples include shared bicycles, cargo bikes or a repair partnership.",action:"Survey resident demand for shared bicycles, cargo bikes or a repair partnership before choosing a service.",priority:"Low",deadline:90},
  {id:12,group:"Additional cycling support",title:"Does the provider collect resident feedback about cycling facilities?",help:"Feedback should be collected and reviewed in a clear way.",action:"Introduce a short resident feedback form and define when responses will be reviewed.",priority:"Low",deadline:60},
  {id:13,group:"Management & improvement",title:"Is a person or team responsible for bicycle facilities?",help:"Responsibilities and a contact route should be documented.",action:"Assign a responsible role and publish contact and reporting information.",priority:"Medium",deadline:30},
  {id:14,group:"Management & improvement",title:"Does the provider review facilities and plan improvements?",help:"Look for a documented inspection and follow-up process.",action:"Create a scheduled inspection checklist and a regular improvement review.",priority:"Low",deadline:90}
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
function generatePlan(){
  const d=scoreData(), container=document.getElementById("generatedActions");
  container.innerHTML="";
  const gaps=questions.filter(q=>answers[q.id]!==undefined && answers[q.id]<2);
  if(d.complete<14){
    const missing=questions.filter(q=>answers[q.id]===undefined).map(q=>`Q${q.id}`).join(", ");
    container.innerHTML=`<div class="generated-action"><strong>Complete the assessment first</strong><p>Still unanswered: ${missing}. Blank answers are not counted as zero.</p></div>`;
  }
  if(d.complete===14 && gaps.length===0){
    container.innerHTML='<div class="generated-action"><strong>No automatic actions suggested</strong><p>All answers meet expectations in this demo. A reviewer may still identify separate issues from evidence.</p></div>';
  } else {
    gaps.forEach(q=>{
      const priority=answers[q.id]===0?q.priority:"Low";
      const div=document.createElement("div");div.className="generated-action";
      div.innerHTML=`<strong>Q${q.id} · ${escapeHtml(q.title)} <span class="priority ${priority.toLowerCase()}">${priority.toUpperCase()}</span></strong><p>${escapeHtml(q.action)} Suggested target: within ${q.deadline} days. Cost: quote or assessment required.</p>`;
      container.appendChild(div);
    });
  }
  if(d.complete===14) showToast(`Action plan generated for ${document.getElementById("propertyName").value || "your property"}. This is a demo only.`);
  document.getElementById("resultPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
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
