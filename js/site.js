(() => {
  const data = window.ASHFALL_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const affinityText = c => (c.affinities || ["Unknown"]).join(" / ");
  const brText = c => typeof c.br === "number" ? `BR ${c.br}` : (c.br ?? "Unknown");
  const potentialText = c => typeof c.potential === "number" ? `P ${c.potential}` : (c.potential ?? "Unknown");
  function card(c, group, yearLabel="") {
    const label = group === "students" ? `${yearLabel} · Student` : c.role;
    const image = c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)} portrait" loading="lazy">` : "";
    return `<article class="character-card tarot-card" tabindex="0" role="button" data-group="${group}" data-name="${esc(c.name)}" aria-label="Open dossier for ${esc(c.name)}">
      <div class="tarot-frame"><div class="portrait">${image}<span class="sigil">✧</span><span class="portrait-caption">${esc(c.name)}</span></div>
      <div class="card-info"><div class="card-label">${esc(label)}</div><h3>${esc(c.name)}</h3><p>${esc(c.role || "Student")}</p>
      <div class="card-meta"><span><b>${esc(brText(c))}</b></span><span><b>${esc(potentialText(c))}</b></span></div><div class="card-affinities">${esc(affinityText(c))}</div></div></div></article>`;
  }
  const studentGrid = $("#student-grid");
  function renderStudents(year="all") {
    const list = data.students.filter(c => year === "all" || String(c.year) === year);
    studentGrid.innerHTML = list.map(c => card(c,"students",["","First Year","Second Year","Third Year"][c.year])).join("");
    document.querySelectorAll(".filter-button").forEach(b => b.classList.toggle("active", b.dataset.year === year));
  }
  renderStudents();
  $("#faculty-grid").innerHTML = data.faculty.map(c => card(c,"faculty")).join("");
  $("#hell-grid").innerHTML = data.hell.filter(c => c.name !== "Eshrael").map(c => card(c,"hell")).join("");
  document.querySelectorAll(".filter-button").forEach(b => b.addEventListener("click",()=>renderStudents(b.dataset.year)));

  const dialog = $("#dossier");
  let activeCharacter = null;
  let activeStateIndex = 0;
  function renderState(c, stateIndex=0) {
    const states = Array.isArray(c.states) && c.states.length ? c.states : null;
    const state = states ? states[stateIndex] : null;
    activeStateIndex = stateIndex;
    $("#dialog-role").textContent = state?.role ?? c.role ?? "";
    $("#dialog-personality").textContent = state?.description ?? state?.personality ?? c.personality ?? "Biography pending.";
    const fields = [
      ["Age",state?.age ?? c.age ?? "Not listed"],["Appearance",state?.appearance ?? c.appearance ?? "Portrait and appearance pending"],
      ["Core Affinities",state?.affinities ? state.affinities.join(" / ") : affinityText(c)],["Blood Rank",state?.br !== undefined ? (typeof state.br==="number"?`BR ${state.br}`:state.br) : brText(c)],
      ["Potential",state?.potential !== undefined ? (typeof state.potential==="number"?`P ${state.potential}`:state.potential) : potentialText(c)]
    ];
    $("#dialog-details").innerHTML = fields.map(([k,v])=>`<div class="detail"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
    const image = state?.image ?? c.image;
    $("#dialog-image").innerHTML = image ? `<img src="${esc(image)}" alt="${esc(c.name)} — ${esc(state?.label ?? "portrait")}">` : `<span>PORTRAIT PLACEHOLDER · ${esc(c.name.toUpperCase())}</span>`;
    const switcher = $("#state-switcher");
    if (states && states.length > 1) {
      switcher.hidden = false;
      switcher.innerHTML = states.map((s,i)=>`<button type="button" class="state-tab ${i===stateIndex?"active":""}" data-state-index="${i}" aria-pressed="${i===stateIndex}">${esc(s.label || `State ${i+1}`)}</button>`).join("");
    } else { switcher.hidden = true; switcher.innerHTML = ""; }
  }
  function openDossier(group,name) {
    const c = data[group].find(x => x.name === name);
    if (!c) return;
    activeCharacter = c;
    $("#dialog-kicker").textContent = group === "students" ? `YEAR ${c.year} STUDENT` : group === "faculty" ? "ACADEMY FACULTY" : "HELL'S ELITE";
    $("#dialog-name").textContent = c.name;
    renderState(c,0);
    dialog.showModal();
  }
  document.addEventListener("click",e=>{
    const tab=e.target.closest(".state-tab");
    if(tab && activeCharacter){renderState(activeCharacter,Number(tab.dataset.stateIndex));return;}
    const c=e.target.closest(".character-card");
    if(c) openDossier(c.dataset.group,c.dataset.name);
  });
  document.addEventListener("keydown",e=>{
    const c=e.target.closest?.(".character-card");
    if(c && (e.key==="Enter"||e.key===" ")){e.preventDefault();openDossier(c.dataset.group,c.dataset.name);}
  });
  $(".dialog-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});

  // Hold-to-break seal: pointer events support mouse, touch, and pen.
  const seal=$("#scourge-seal"), record=$("#scourge-record"), instruction=$("#seal-instruction"), judgement=$("#scourge");
  let holdTimer=null, holdStart=0, completed=false, pointerHeld=false, rafId=null;
  const HOLD_MS=2600;
  function updateHold() {
    if(!pointerHeld || completed) return;
    const progress=Math.min(1,(performance.now()-holdStart)/HOLD_MS);
    seal.style.setProperty("--hold-progress",progress);
    if(progress>=1){completeSeal();return;}
    rafId=requestAnimationFrame(updateHold);
  }
  function startHold(e) {
    if(completed || pointerHeld) return;
    pointerHeld=true; holdStart=performance.now();
    seal.classList.add("is-holding");
    instruction.textContent="THE SEAL IS FRACTURING…";
    try{seal.setPointerCapture(e.pointerId);}catch(_){}
    rafId=requestAnimationFrame(updateHold);
  }
  function cancelHold() {
    if(!pointerHeld || completed) return;
    pointerHeld=false;cancelAnimationFrame(rafId);clearTimeout(holdTimer);
    seal.classList.remove("is-holding");seal.style.setProperty("--hold-progress",0);
    instruction.textContent="THE BINDING HOLDS. PRESS AND HOLD AGAIN.";
  }
  function completeSeal() {
    pointerHeld=false;completed=true;cancelAnimationFrame(rafId);
    seal.classList.remove("is-holding");
    judgement.classList.add("bindings-torn");
    seal.disabled=true;
    instruction.textContent="THE BINDINGS HAVE BEEN SHATTERED.";
    seal.setAttribute("aria-label","The bindings are broken; Eshrael's tarot is revealed");
    window.setTimeout(()=>{
      seal.classList.add("seal-fading");
      record.classList.remove("is-bound");
      record.classList.add("is-released");
      instruction.textContent="THE SEALED RECORD IS OPEN.";
      $("#scourge-quote").textContent="A name once buried beneath the weight of Heaven.";
      window.setTimeout(()=>record.classList.add("is-revealed"),520);
    },760);
  }
  seal.addEventListener("pointerdown",startHold);
  seal.addEventListener("pointerup",cancelHold);
  seal.addEventListener("pointercancel",cancelHold);
  seal.addEventListener("lostpointercapture",cancelHold);
  seal.addEventListener("contextmenu",e=>e.preventDefault());

  // Ceremonial countdown. The cycle is presented as an atmospheric clock;
  // it does not claim to be synchronized to the story's live calendar.
  const count=$("#count-number"), caption=$("#count-caption"), countdown=$("#gate-countdown");
  let remaining=90;
  if(countdown){
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!reduce){
      let last=performance.now(), elapsed=0;
      function tick(now){
        elapsed+=(now-last);last=now;
        if(elapsed>=60 && remaining>0){remaining--;count.textContent=String(remaining).padStart(2,"0");elapsed=0;}
        if(remaining===0){countdown.classList.add("gates-open");caption.textContent="THE GATES ARE OPEN";return;}
        requestAnimationFrame(tick);
      }
      // Begin only when the countdown enters the viewport.
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(x=>x.isIntersecting)){observer.disconnect();last=performance.now();requestAnimationFrame(tick);}
      },{threshold:.35});
      observer.observe(countdown);
    } else {caption.textContent="THE GATES AWAIT THEIR HOUR";}
  }
  const menu=$(".menu-toggle"),nav=$(".main-nav");
  menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");}));
})();