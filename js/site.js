(() => {
  const data = window.ASHFALL_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const affinityText = c => (c.affinities || ["Unknown"]).join(" / ");
  const brText = c => typeof c.br === "number" ? `BR ${c.br}` : (c.br ?? "Unknown");
  const potentialText = c => typeof c.potential === "number" ? `P ${c.potential}` : (c.potential ?? "Unknown");
  function card(c, group) {
    const src = c.tarotImage || c.image;
    const image = src ? `<img src="${esc(src)}" alt="" loading="lazy" class="roster-art${c.tarotImage ? " baked-tarot-art" : ""}">` : "";
    return `<article class="character-card tarot-card" tabindex="0" role="button" data-group="${group}" data-name="${esc(c.name)}" aria-label="Open dossier for ${esc(c.name)}">
      <div class="tarot-frame">
        <div class="portrait"><span class="sigil" aria-hidden="true">✧</span>${image}</div>
        <div class="tarot-nameplate"><h3>${esc(c.name)}</h3></div>
        <div class="tarot-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      </div></article>`;
  }
  document.addEventListener("load",e=>{
    const img=e.target;
    if(img instanceof HTMLImageElement && img.classList.contains("roster-art")){
      const card=img.closest(".tarot-card");
      if(card){card.classList.add("art-loaded");if(img.classList.contains("baked-tarot-art"))card.classList.add("artwork-framed");}
    }
  },true);
  document.addEventListener("error",e=>{
    const img=e.target;
    if(img instanceof HTMLImageElement && img.classList.contains("roster-art"))img.hidden=true;
    if(img instanceof HTMLImageElement && img.closest("#dialog-image")){
      const holder=img.closest("#dialog-image");holder.textContent="PORTRAIT PLACEHOLDER";
    }
  },true);
  const studentGrid = $("#student-grid");
  function renderStudents(year="all") {
    const list = data.students.filter(c => year === "all" || String(c.year) === year);
    studentGrid.innerHTML = list.map(c => card(c,"students")).join("");
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

  // Hold-to-break seal: quiet reset on release, radiant release on completion.
  const seal=$("#scourge-seal"), record=$("#scourge-record"), instruction=$("#seal-instruction"), judgement=$("#scourge");
  const scourgeTrigger=$("#scourge-dossier-trigger");
  const scourgeCharacter=data.hell.find(c=>c.name==="Eshrael");
  const scourgeArt=$("#scourge-revealed-art");
  if(scourgeCharacter?.image && scourgeArt) scourgeArt.innerHTML=`<img src="${esc(scourgeCharacter.image)}" alt="" loading="lazy">`;
  scourgeTrigger?.addEventListener("click",()=>{if(record.classList.contains("is-revealed"))openDossier("hell","Eshrael");});
  let completed=false, pointerHeld=false, rafId=null;
  const HOLD_MS=3000;
  function updateHold(){
    if(!pointerHeld||completed)return;
    const progress=Math.min(1,(performance.now()-holdStart)/HOLD_MS);
    seal.style.setProperty("--hold-progress",progress);
    judgement.style.setProperty("--radiance",progress);
    if(progress>=1){completeSeal();return;}
    rafId=requestAnimationFrame(updateHold);
  }
  let holdStart=0;
  let sealAudio=null;
  function getSealAudio(){
    if(sealAudio)return sealAudio;
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return null;
    try{sealAudio=new AudioContextClass();if(sealAudio.state==="suspended")sealAudio.resume();return sealAudio;}catch(_){return null;}
  }
  function playSealBreak(){
    const ctx=getSealAudio();if(!ctx)return;
    const now=ctx.currentTime;
    const master=ctx.createGain();
    master.gain.setValueAtTime(.0001,now);
    master.gain.exponentialRampToValueAtTime(.34,now+.025);
    master.gain.exponentialRampToValueAtTime(.0001,now+1.65);
    master.connect(ctx.destination);
    [392,587.33,783.99,1174.66].forEach((hz,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type=i===0?"triangle":"sine";
      osc.frequency.setValueAtTime(hz,now);
      osc.frequency.exponentialRampToValueAtTime(hz*(i%2 ? .72 : .86),now+1.25);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.12/(i+1),now+.018);
      gain.gain.exponentialRampToValueAtTime(.0001,now+1.5);
      osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+1.55);
    });
    const length=Math.floor(ctx.sampleRate*.42);
    const buffer=ctx.createBuffer(1,length,ctx.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<length;i++)samples[i]=(Math.random()*2-1)*(1-i/length);
    const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),snap=ctx.createGain();
    noise.buffer=buffer;filter.type="highpass";
    filter.frequency.setValueAtTime(1500,now);
    filter.frequency.exponentialRampToValueAtTime(420,now+.32);
    snap.gain.setValueAtTime(.0001,now);
    snap.gain.exponentialRampToValueAtTime(.5,now+.008);
    snap.gain.exponentialRampToValueAtTime(.0001,now+.38);
    noise.connect(filter);filter.connect(snap);snap.connect(master);
    noise.start(now);noise.stop(now+.42);
  }
  function startHold(e){
    if(completed||pointerHeld)return;
    getSealAudio();
    pointerHeld=true;holdStart=performance.now();
    seal.classList.add("is-holding");
    try{seal.setPointerCapture(e.pointerId)}catch(_){}
    rafId=requestAnimationFrame(updateHold);
  }
  function cancelHold(){
    if(!pointerHeld||completed)return;
    pointerHeld=false;cancelAnimationFrame(rafId);
    seal.classList.remove("is-holding");
    seal.style.setProperty("--hold-progress",0);
    judgement.style.setProperty("--radiance",0);
  }
  function completeSeal(){
    pointerHeld=false;completed=true;cancelAnimationFrame(rafId);
    seal.classList.remove("is-holding");
    seal.classList.add("seal-cracked");
    judgement.classList.add("bindings-broken","radiance-burst","flash-release");
    playSealBreak();
    seal.disabled=true;
    const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Swap the entire record during the bright plateau, before the flash recedes.
    window.setTimeout(()=>{
      seal.classList.add("seal-fading");
      record.classList.remove("is-bound");
      record.classList.add("is-released","is-revealed");
      instruction.textContent=" ";
      $("#scourge-quote").textContent="Even in chains, the Scourge remains a name the world fears.";
      const unveiledRecord=$("#scourge-revealed-record");
      if(unveiledRecord){
        unveiledRecord.hidden=false;
        judgement.classList.add("record-unveiled");
      }
      window.setTimeout(()=>{if(scourgeTrigger)scourgeTrigger.disabled=false;},reduceMotion?0:1150);
    },reduceMotion?0:250);
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