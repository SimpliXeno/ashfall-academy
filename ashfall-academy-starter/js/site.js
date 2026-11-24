(() => {
  const data = window.ASHFALL_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const affinityText = c => (c.affinities || ["Unknown"]).join(" / ");
  function card(c, group, yearLabel="") {
    const label = group === "students" ? `${yearLabel} · Student` : c.role;
    const br = typeof c.br === "number" ? `BR ${c.br}` : c.br;
    const p = typeof c.potential === "number" ? `P ${c.potential}` : c.potential;
    return `<article class="character-card" tabindex="0" role="button" data-group="${group}" data-name="${esc(c.name)}" aria-label="Open dossier for ${esc(c.name)}">
      <div class="portrait"><span class="sigil">✧</span></div>
      <div class="card-info"><div class="card-label">${esc(label)}</div><h3>${esc(c.name)}</h3><p>${esc(c.role || "Student")}</p>
      <div class="card-meta"><span><b>${esc(br)}</b></span><span><b>${esc(p)}</b></span><span>${esc(affinityText(c))}</span></div></div></article>`;
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
  function openDossier(group,name) {
    const c = data[group].find(x => x.name === name);
    if (!c) return;
    const year = c.year ? `Year ${c.year} Student` : c.role;
    $("#dialog-kicker").textContent = group === "students" ? year : group === "faculty" ? "ACADEMY FACULTY" : "HELL'S ELITE";
    $("#dialog-name").textContent = c.name;
    $("#dialog-role").textContent = c.role || "";
    $("#dialog-personality").textContent = c.personality || "Biography pending.";
    const fields = [
      ["Age",c.age ?? "Not listed"],["Appearance",c.appearance ?? "Portrait and appearance pending"],
      ["Core Affinities",affinityText(c)],["Blood Rank",typeof c.br==="number"?`BR ${c.br}`:c.br ?? "Unknown"],
      ["Potential",typeof c.potential==="number"?`P ${c.potential}`:c.potential ?? "Unknown"]
    ];
    $("#dialog-details").innerHTML = fields.map(([k,v])=>`<div class="detail"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
    $("#dialog-image").innerHTML = `<span>PORTRAIT PLACEHOLDER · ${esc(c.name.toUpperCase())}</span>`;
    dialog.showModal();
  }
  document.addEventListener("click",e=>{
    const c=e.target.closest(".character-card");
    if(c) openDossier(c.dataset.group,c.dataset.name);
  });
  document.addEventListener("keydown",e=>{
    const c=e.target.closest?.(".character-card");
    if(c && (e.key==="Enter"||e.key===" ")){e.preventDefault();openDossier(c.dataset.group,c.dataset.name);}
  });
  $(".dialog-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  $("#scourge-reveal").addEventListener("click",()=>{
    const panel=$("#scourge-record"),button=$("#scourge-reveal");
    const opening=panel.hidden;panel.hidden=!opening;button.setAttribute("aria-expanded",String(opening));
    button.innerHTML=opening?'SEAL BROKEN <span>−</span>':'BREAK THE SEAL <span>＋</span>';
  });
  const menu=$(".menu-toggle"),nav=$(".main-nav");
  menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");}));
})();