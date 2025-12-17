const teamsTableBody = document.querySelector("#teams-table tbody");
const managersTableBody = document.querySelector("#managers-table tbody");
const palmaresList = document.querySelector("#palmares-list");
const stageSelect = document.querySelector("#stage-select");
const stageDetails = document.querySelector("#stage-details");
const stageProgress = document.querySelector("#stage-progress");

const points = (team) => team.wins * 3 + team.draws;
const diff = (team) => team.gf - team.gs;

const sortByStandings = (a, b) => {
  const pa = points(a);
  const pb = points(b);
  if (pb !== pa) return pb - pa;
  const da = diff(a);
  const db = diff(b);
  if (db !== da) return db - da;
  return b.gf - a.gf;
};

const renderTable = (rows, targetBody) => {
  const fragment = document.createDocumentFragment();
  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    const rank = document.createElement("td");
    rank.textContent = idx + 1;
    tr.appendChild(rank);

    const name = document.createElement("td");
    name.className = "team-name";
    name.textContent = row.name ?? row.teamName ?? "—";
    tr.appendChild(name);

    const w = document.createElement("td");
    w.className = "numeric";
    w.textContent = row.wins;
    tr.appendChild(w);

    const d = document.createElement("td");
    d.className = "numeric";
    d.textContent = row.draws;
    tr.appendChild(d);

    const l = document.createElement("td");
    l.className = "numeric";
    l.textContent = row.losses;
    tr.appendChild(l);

    const gf = document.createElement("td");
    gf.className = "numeric";
    gf.textContent = row.gf;
    tr.appendChild(gf);

    const gs = document.createElement("td");
    gs.className = "numeric";
    gs.textContent = row.gs;
    tr.appendChild(gs);

    const dr = document.createElement("td");
    dr.className = `numeric delta ${diff(row) >= 0 ? "positive" : "negative"}`;
    dr.textContent = diff(row);
    tr.appendChild(dr);

    const pt = document.createElement("td");
    pt.className = "numeric";
    pt.textContent = points(row);
    tr.appendChild(pt);

    fragment.appendChild(tr);
  });
  targetBody.innerHTML = "";
  targetBody.appendChild(fragment);
};

const renderPalmares = (entries) => {
  palmaresList.innerHTML = "";
  entries.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="eyebrow">Edizione ${item.year}</div>
      <h3 style="margin:6px 0 4px;">${item.winner}</h3>
      <p style="margin:0;color:var(--muted);">Fantallenatore: <strong>${item.manager}</strong></p>
    `;
    palmaresList.appendChild(card);
  });
};

const renderStages = (stages, message) => {
  stageSelect.innerHTML = "";
  renderProgress(stages);
  stages.forEach((stage, idx) => {
    const opt = document.createElement("option");
    opt.value = stage.id;
    opt.textContent = stage.label;
    stageSelect.appendChild(opt);
    if (idx === 0) renderStageDetails(stage, message);
  });
  stageSelect.addEventListener("change", (ev) => {
    const stage = stages.find((s) => s.id === ev.target.value);
    renderStageDetails(stage, message);
  });
};

const renderStageDetails = (stage, message) => {
  stageDetails.innerHTML = `
    <div><strong>${stage.label}</strong></div>
    <div>${stage.description}</div>
    <div style="color:var(--muted);">Partite massime in turno: ${stage.maxMatches}</div>
    <div style="color:var(--accent); font-weight:600; margin-top:6px;">${message}</div>
  `;
};

const renderProgress = (stages) => {
  stageProgress.innerHTML = "";
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  stages.forEach((stage, idx) => {
    const node = document.createElement("div");
    node.className = "progress-node";
    node.innerHTML = `
      <div class="dot"></div>
      <div class="label">${stage.label}</div>
      <div class="sub">Max ${stage.maxMatches} partite</div>
    `;
    if (idx === stages.length - 1) node.classList.add("last");
    bar.appendChild(node);
  });
  stageProgress.appendChild(bar);
};

const hydrateTables = (data) => {
  const teams = data.worldCupTeams.map((t) => ({ ...t })).sort(sortByStandings);
  const managers = data.fantallenatori
    .map((m) => ({ name: m.name, teamName: m.teamName, ...m }))
    .sort(sortByStandings);

  renderTable(teams, teamsTableBody);
  renderTable(
    managers.map((m) => ({ ...m, name: `${m.name} · ${m.teamName}` })),
    managersTableBody
  );
  renderPalmares(data.palmares || []);
  renderStages(data.stages || [], data.messages?.fantallenatoriCap || "");
};

const loadData = async () => {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Impossibile caricare data.json");
    const data = await res.json();
    hydrateTables(data);
  } catch (err) {
    stageDetails.textContent = err.message;
    console.error(err);
  }
};

document.addEventListener("DOMContentLoaded", loadData);
