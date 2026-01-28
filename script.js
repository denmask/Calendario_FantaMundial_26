const teamsTableBody = document.querySelector("#teams-table tbody");
const managersTableBody = document.querySelector("#managers-table tbody");
const palmaresList = document.querySelector("#palmares-list");
const stageSelect = document.querySelector("#stage-select");
const stageDetails = document.querySelector("#stage-details");
const stageProgress = document.querySelector("#stage-progress");
const shareAllBtn = document.querySelector("#share-all");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("#toast-message");

let currentData = null;

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

const renderTable = (rows, targetBody, includeTeamName = false) => {
  const fragment = document.createDocumentFragment();

  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");

    const rank = document.createElement("td");
    rank.textContent = idx + 1;
    tr.appendChild(rank);

    const name = document.createElement("td");
    name.className = "team-name";
    name.textContent = row.name ?? "";
    tr.appendChild(name);

    if (includeTeamName) {
      const teamName = document.createElement("td");
      teamName.textContent = row.teamName ?? "";
      tr.appendChild(teamName);
    }

    const w = document.createElement("td");
    w.className = "text-right";
    w.textContent = row.wins;
    tr.appendChild(w);

    const d = document.createElement("td");
    d.className = "text-right";
    d.textContent = row.draws;
    tr.appendChild(d);

    const l = document.createElement("td");
    l.className = "text-right";
    l.textContent = row.losses;
    tr.appendChild(l);

    const gf = document.createElement("td");
    gf.className = "text-right";
    gf.textContent = row.gf;
    tr.appendChild(gf);

    const gs = document.createElement("td");
    gs.className = "text-right";
    gs.textContent = row.gs;
    tr.appendChild(gs);

    const dr = document.createElement("td");
    dr.className = "text-right";
    dr.textContent = diff(row);
    tr.appendChild(dr);

    const pt = document.createElement("td");
    pt.className = "text-right points-cell";
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
    card.className = "palmares-card";
    card.innerHTML = `
      <div class="palmares-year">Edizione ${item.year}</div>
      <div class="palmares-winner">${item.winner}</div>
      <div class="palmares-manager">Fantallenatore: <strong>${item.manager}</strong></div>
    `;
    palmaresList.appendChild(card);
  });
};

const renderStages = (stages, message) => {
  stageSelect.innerHTML = "";
  renderProgress(stages);

  const placeholderOpt = document.createElement("option");
  placeholderOpt.value = "";
  placeholderOpt.textContent = "Seleziona un turno...";
  placeholderOpt.disabled = true;
  placeholderOpt.selected = true;
  stageSelect.appendChild(placeholderOpt);

  stages.forEach((stage) => {
    const opt = document.createElement("option");
    opt.value = stage.id;
    opt.textContent = stage.label;
    stageSelect.appendChild(opt);
  });

  if (stages.length > 0) {
    stageSelect.value = stages[0].id;
    renderStageDetails(stages[0], message);
  }
};

const renderStageDetails = (stage, message) => {
  stageDetails.innerHTML = `
    <div><strong>${stage.label}</strong></div>
    <div>${stage.description}</div>
    <div>Partite massime in turno: <strong>${stage.maxMatches}</strong></div>
    <div style="color: var(--accent-orange); font-weight: 600;">
      ${message || ""}
    </div>
  `;
};

const renderProgress = (stages) => {
  stageProgress.innerHTML = "";
  stages.forEach((stage) => {
    const node = document.createElement("div");
    node.className = "stage-node";
    node.innerHTML = `
      <div class="stage-dot"></div>
      <div class="stage-label">${stage.label}</div>
      <div class="stage-sub">Max ${stage.maxMatches} partite</div>
    `;
    stageProgress.appendChild(node);
  });
};

const showToast = (message) => {
  toastMessage.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
};

/* GENERAZIONE MESSAGGIO WHATSAPP */

const generateCompleteWhatsAppMessage = () => {
  if (!currentData) return "";

  const teams = currentData.worldCupTeams
    .map((t) => ({ ...t }))
    .sort(sortByStandings);

  const managers = currentData.fantallenatori
    .map((m) => ({ ...m }))
    .sort(sortByStandings);

  let message = "";

  // HEADER
  message += "🏆 *FANTAMUNDIAL 2026 - CLASSIFICHE* 🏆\n\n";

  // CLASSIFICA FANTALLENATORI
  message += "📊 *CLASSIFICA FANTALLENATORI*\n";
  managers.forEach((manager, idx) => {
    const rank = idx + 1;
    const pt = points(manager);
    const gd = diff(manager);
    message += `${rank}. ${manager.name} (${manager.teamName}) - ${pt}pt GD: ${gd}\n`;
  });

  // STATISTICHE FANTALLENATORI (prime 5)
  message += "\n📈 *STATISTICHE FANTALLENATORI*\n";
  managers.slice(0, 5).forEach((manager) => {
    message += `• *${manager.name}* (${manager.teamName}) ${manager.wins}V ${manager.draws}P ${manager.losses}S | ${manager.gf} GF - ${manager.gs} GS | ${points(manager)} PT\n`;
  });

  message += "━━━━━━━━━━━━━━━━━━━━━━\n";

  // TOP 15 NAZIONALI
  message += "🌍 *TOP 15 NAZIONALI*\n";
  const topTeams = teams.slice(0, 15);
  topTeams.forEach((team, idx) => {
    const rank = idx + 1;
    const pt = points(team);
    const gd = diff(team);
    message += `${rank}. ${team.name} ${pt}pt GD: ${gd}\n`;
  });

  // QUI RIMUOVO DEL TUTTO LA SEZIONE MARCATORI

  message += "\n━━━━━━━━━━━━━━━━━━━━━━\n";

  // INFO TORNEO
  message += "ℹ️ *INFO TORNEO*\n";
  message += "• 48 nazionali in girone unico\n";
  message += "• 12 fantallenatori in gara\n";
  message += "• Max 7 partite per fantallenatore\n";

  const groupStage =
    currentData.stages && currentData.stages.length > 0
      ? currentData.stages[0].label
      : "Fase a gironi";

  message += `• Fase: ${groupStage}\n`;

  const today = new Date().toLocaleDateString("it-IT");
  message += `📅 Aggiornato: ${today}\n\n`;

  // ALBO D'ORO DAL JSON
  if (currentData.palmares && currentData.palmares.length > 0) {
    message += "🏅 *ALBO D'ORO FANTAMUNDIAL*\n";
    currentData.palmares.forEach((entry) => {
      message += `• ${entry.year}: ${entry.winner} (${entry.manager})\n`;
    });
    message += "\n";
  }

  // FOOTER
  message += "📊 FantaMundial Dashboard";

  return message;
};


const shareOnWhatsApp = () => {
  const message = generateCompleteWhatsAppMessage();
  if (!message) return;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
  showToast("Apertura WhatsApp...");
};

/* HYDRATE UI */

const hydrateTables = (data) => {
  currentData = data;

  const teams = data.worldCupTeams.map((t) => ({ ...t })).sort(sortByStandings);
  const managers = data.fantallenatori
    .map((m) => ({ ...m }))
    .sort(sortByStandings);

  renderTable(teams, teamsTableBody, false);
  renderTable(managers, managersTableBody, true);
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
if (shareAllBtn) {
  shareAllBtn.addEventListener("click", shareOnWhatsApp);
}
