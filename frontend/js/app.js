// ==========================================================================
// MOVE BAGUIO CHAPTER — UNIFIED HRIS & CERTIFICATE STUDIO ENGINE
// SQLite REST API Integration & Component Controller
// ==========================================================================

const API_BASE = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : "http://127.0.0.1:8765";

// --- GLOBAL APPLICATION STATE ---
const appState = {
  activeView: 'roster',
  currentActivityId: 1,
  
  // Roster State
  roster: [],
  fullRoster: [],
  rosterFilter: 'all',
  rosterSearch: '',

  // Activities State
  activities: [],
  currentActivity: null,

  // Attendance State
  attendees: [],
  attendanceSearch: '',
  attendanceStatusFilter: 'all',

  // Activity Sub-Tabs & Facilitators State
  currentActivitySubTab: 'attendees', // 'attendees' or 'facilitators'
  facilitators: [],
  eligibleFacilitators: [],
  facilitatorSearch: '',
  certRecipientPool: 'attendees', // 'attendees' or 'facilitators'

  // Certificate Studio State (Gated: ONLY IS_PRESENT = 1)
  currentTemplate: 'participation', // 'participation', 'appearance', 'appreciation'
  eligibleAttendees: [],
  currentCertIndex: 0,
  signatories: [],
  sig1Id: 3, // Default: Mario D. Ganga Jr.
  sig2Id: 1, // Default: Hon. Benjamin B. Magalong
  sig3Id: null,
  showSignatures: true,
  showLogos: true,
  showWatermark: true,
  watermarkLogo: '/MOVE BAGUIO LOGO.png',
  watermarkOpacity: 12,
  watermarkSize: 320,
  caSignatoryChoice: 'sig2_right',
  sigDisplayMode: 'both',
  sigSize: 44, // Default signature height in pixels
  sig1Size: 44,
  sig2Size: 48,
  sigSizeIndependent: false,
  sigYOffset: 0,
  customCertFields: {
    title: '',
    theme: '',
    date: '',
    venue: '',
    hours: ''
  }
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  await checkServerHealth();
  await loadSignatories();
  await loadActivities();
  await loadRoster();
  
  // Initialize E-Signature preferences & UI
  initSigPreferences();

  // Pre-load attendance for default activity (ID 1)
  if (appState.activities.length > 0) {
    appState.currentActivityId = appState.activities[0].id;
    appState.currentActivity = appState.activities[0];
    await loadAttendance(appState.currentActivityId);
  }
});

// --- SERVER HEALTH CHECK ---
async function checkServerHealth() {
  const banner = document.getElementById("serverOfflineBanner");
  try {
    const res = await fetch(`${API_BASE}/api/status`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.status === 'online') {
      if (banner) banner.classList.add("hidden");
      return true;
    }
  } catch (e) {
    if (banner) banner.classList.remove("hidden");
    return false;
  }
}

// --- NAVIGATION CONTROLLER ---
function switchView(viewName) {
  appState.activeView = viewName;
  const views = ['roster', 'activities', 'attendance', 'studio'];
  
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const tab = document.getElementById(`navTab-${v}`);
    if (el) el.classList.toggle('hidden', v !== viewName);
    if (tab) {
      const isActive = (v === viewName) || (viewName === 'attendance' && v === 'activities');
      if (isActive) {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 bg-move-orange-500 text-white shadow";
      } else {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800";
      }
    }
  });

  if (viewName === 'roster') loadRoster();
  if (viewName === 'activities') loadActivities();
  if (viewName === 'attendance') loadAttendance(appState.currentActivityId);
  if (viewName === 'studio') loadEligibleCertificates(appState.currentActivityId);
}

// ==========================================================================
// 1. MOVE ROSTER & SELECTIVE STATUS CONTROLLER
// ==========================================================================

async function loadRoster() {
  try {
    const res = await fetch(`${API_BASE}/api/move-roster?status=${appState.rosterFilter}&q=${encodeURIComponent(appState.rosterSearch)}`);
    const data = await res.json();
    if (data.success) {
      appState.roster = data.roster;
      renderRosterTable();
      updateRosterCounts();
    }
  } catch (err) {
    console.error("Failed to load MOVE roster:", err);
  }
}

async function updateRosterCounts() {
  try {
    const res = await fetch(`${API_BASE}/api/move-roster?status=all`);
    const data = await res.json();
    if (data.success) {
      const all = data.roster;
      appState.fullRoster = all;
      document.getElementById("count-all").textContent = all.length;
      document.getElementById("count-member").textContent = all.filter(r => r.is_member).length;
      document.getElementById("count-officer").textContent = all.filter(r => r.is_officer).length;
      document.getElementById("count-committee").textContent = all.filter(r => r.is_committee).length;
      document.getElementById("count-participant").textContent = all.filter(r => r.is_participant).length;
    }
  } catch (err) {
    console.warn("Count update failed:", err);
  }
}

function filterRosterByStatus(status) {
  appState.rosterFilter = status;
  const statuses = ['all', 'member', 'officer', 'committee', 'participant'];
  statuses.forEach(s => {
    const btn = document.getElementById(`rosterFilter-${s}`);
    if (btn) {
      if (s === status) {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-800 text-white";
      } else {
        btn.className = "px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white hover:bg-slate-800";
      }
    }
  });
  loadRoster();
}

function onRosterSearch(val) {
  appState.rosterSearch = val;
  loadRoster();
}

function renderRosterTable() {
  const tbody = document.getElementById("rosterTableBody");
  if (!tbody) return;

  if (appState.roster.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500">No personnel found matching the filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.roster.map((r, idx) => {
    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-white">${escapeHtml(r.full_name)}</div>
          <div class="text-[10px] text-slate-400">${escapeHtml(r.role_title || 'Member')}</div>
        </td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(r.position || '-')}</td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(r.office || '-')}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.gender === 'F' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'}">
            ${r.gender || 'M'}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(r.civil_status || 'Married')}</td>
        <td class="py-3 px-4">
          <div class="flex items-center justify-center gap-1.5">
            <!-- Member Status Toggle -->
            <button onclick="toggleRosterStatus(${r.id}, 'is_member', ${r.is_member})" title="Toggle Member" 
              class="px-2 py-0.5 rounded text-[10px] font-bold transition border ${r.is_member ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800/50 text-slate-500 border-slate-700/50'}">
              ${r.is_member ? '✓ Member' : 'Member'}
            </button>

            <!-- Officer Status Toggle -->
            <button onclick="toggleRosterStatus(${r.id}, 'is_officer', ${r.is_officer})" title="Toggle Officer"
              class="px-2 py-0.5 rounded text-[10px] font-bold transition border ${r.is_officer ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/50 text-slate-500 border-slate-700/50'}">
              ${r.is_officer ? '★ Officer' : 'Officer'}
            </button>

            <!-- Committee Status Toggle -->
            <button onclick="toggleRosterStatus(${r.id}, 'is_committee', ${r.is_committee})" title="Toggle Committee"
              class="px-2 py-0.5 rounded text-[10px] font-bold transition border ${r.is_committee ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800/50 text-slate-500 border-slate-700/50'}">
              ${r.is_committee ? '◈ Committee' : 'Committee'}
            </button>

            <!-- Participant Status Toggle -->
            <button onclick="toggleRosterStatus(${r.id}, 'is_participant', ${r.is_participant})" title="Toggle Participant"
              class="px-2 py-0.5 rounded text-[10px] font-bold transition border ${r.is_participant ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800/50 text-slate-500 border-slate-700/50'}">
              ${r.is_participant ? '● Participant' : 'Participant'}
            </button>
          </div>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="deleteRosterMember(${r.id})" class="text-slate-500 hover:text-rose-400 p-1.5 transition" title="Delete Person">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function toggleRosterStatus(id, field, currentValue) {
  const newValue = currentValue ? 0 : 1;
  try {
    const res = await fetch(`${API_BASE}/api/move-roster/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: field, value: newValue })
    });
    const data = await res.json();
    if (data.success) {
      loadRoster();
    }
  } catch (err) {
    alert("Error updating status: " + err);
  }
}

async function submitAddMember(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById("addMemberName").value.trim().toUpperCase(),
    position: document.getElementById("addMemberPosition").value.trim(),
    office: document.getElementById("addMemberOffice").value.trim(),
    gender: document.getElementById("addMemberGender").value,
    civil_status: document.getElementById("addMemberCivil").value,
    contact_number: document.getElementById("addMemberContact").value.trim(),
    is_member: document.getElementById("addStatusMember").checked,
    is_officer: document.getElementById("addStatusOfficer").checked,
    is_committee: document.getElementById("addStatusCommittee").checked,
    is_participant: document.getElementById("addStatusParticipant").checked
  };

  try {
    const res = await fetch(`${API_BASE}/api/move-roster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modalAddMember");
      document.getElementById("formAddMember").reset();
      loadRoster();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Error saving member: " + err);
  }
}

async function deleteRosterMember(id) {
  if (!confirm("Are you sure you want to remove this person from the MOVE roster?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/move-roster/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) loadRoster();
  } catch (err) {
    alert("Delete failed: " + err);
  }
}

// ==========================================================================
// 2. MUNICIPAL SEARCH POOL (748 PERSONNEL)
// ==========================================================================

let poolSearchTimeout = null;
function onSearchPool(q) {
  clearTimeout(poolSearchTimeout);
  poolSearchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/search-pool?q=${encodeURIComponent(q)}&limit=30`);
      const data = await res.json();
      if (data.success) {
        renderPoolTable(data.employees);
      }
    } catch (err) {
      console.error("Pool search failed:", err);
    }
  }, 250);
}

function renderPoolTable(employees) {
  const tbody = document.getElementById("poolTableBody");
  if (!tbody) return;

  if (employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500">No matching employees found in pool.</td></tr>`;
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    return `
      <tr class="hover:bg-slate-800/50">
        <td class="py-2.5 px-3 font-bold text-white">${escapeHtml(emp.full_name)}</td>
        <td class="py-2.5 px-3 text-slate-300">${escapeHtml(emp.position || '-')}</td>
        <td class="py-2.5 px-3 text-slate-300">${escapeHtml(emp.office || '-')}</td>
        <td class="py-2.5 px-3 text-slate-400 text-[10px]">${escapeHtml(emp.appointment || 'PERMANENT')}</td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="copyPoolToMove(${emp.id})" class="px-2.5 py-1 rounded-lg bg-move-orange-500 hover:bg-move-orange-600 text-white text-[10px] font-bold shadow transition">
            + Copy to MOVE
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function copyPoolToMove(employeeId) {
  try {
    const res = await fetch(`${API_BASE}/api/search-pool/copy-to-move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeId })
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      loadRoster();
    }
  } catch (err) {
    alert("Error copying employee: " + err);
  }
}

// ==========================================================================
// 3. ACTIVITIES CONTROLLER
// ==========================================================================

async function loadActivities() {
  try {
    const res = await fetch(`${API_BASE}/api/activities`);
    const data = await res.json();
    if (data.success) {
      appState.activities = data.activities;
      renderActivitiesGrid();
    }
  } catch (err) {
    console.error("Failed to load activities:", err);
  }
}

function renderActivitiesGrid() {
  const grid = document.getElementById("activitiesGrid");
  if (!grid) return;

  grid.innerHTML = appState.activities.map(act => {
    const total = act.total_attendees || 0;
    const present = act.present_count || 0;
    const rate = total > 0 ? ((present / total) * 100).toFixed(0) : 0;

    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold text-move-gold-400 bg-move-gold-500/10 px-2 py-0.5 rounded border border-move-gold-500/20">
              ${escapeHtml(act.duration_hours || '8 Hours')}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-mono">${escapeHtml(act.activity_date || '')}</span>
              <button onclick="openModalEditActivity(${act.id})" class="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-move-gold-400 text-[11px] font-bold border border-slate-700 transition flex items-center gap-1 shadow-xs" title="Edit Activity (Venue, Date, Trainer, Details)">
                <i class="fa-solid fa-pen-to-square text-[10px] text-move-gold-400"></i> Edit
              </button>
            </div>
          </div>

          <h3 class="text-base font-black text-white hover:text-move-gold-400 transition cursor-pointer" onclick="openModalEditActivity(${act.id})" title="Click to edit activity details">
            ${escapeHtml(act.title)}
          </h3>
          <p class="text-xs text-slate-400 mt-0.5 italic cursor-pointer hover:text-slate-300 transition" onclick="openModalEditActivity(${act.id})" title="Click to edit theme">
            "${escapeHtml(act.theme || '')}"
          </p>
          
          <div class="mt-3 text-xs text-slate-300 space-y-1">
            <div class="cursor-pointer hover:text-move-gold-400 transition" onclick="openModalEditActivity(${act.id})" title="Click to edit venue">
              <i class="fa-solid fa-location-dot w-4 text-slate-500"></i> ${escapeHtml(act.venue || 'Baguio City')}
            </div>
            <div class="cursor-pointer hover:text-move-gold-400 transition" onclick="openModalEditActivity(${act.id})" title="Click to edit trainer">
              <i class="fa-solid fa-user-tie w-4 text-slate-500"></i> ${escapeHtml(act.trainer_name || 'Resource Speaker')}${act.trainer_position ? ` <span class="text-slate-400">(${escapeHtml(act.trainer_position)})</span>` : ''}
            </div>
            ${act.target_notes ? `<div class="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg mt-2 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition" onclick="openModalEditActivity(${act.id})" title="Click to edit target notes"><strong>Target:</strong> ${escapeHtml(act.target_notes)}</div>` : ''}
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <!-- Attendance Progress -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-semibold">Attendance:</span>
            <span class="font-bold text-emerald-400">${present} / ${total} Present (${rate}%)</span>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <button onclick="openModalEditActivity(${act.id})" class="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition text-center flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm" title="Edit Venue, Date, Trainer, and Details">
              <i class="fa-solid fa-pen-to-square text-move-gold-400"></i> Edit
            </button>
            <button onclick="openActivityAttendance(${act.id})" class="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition text-center flex items-center justify-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-clipboard-user text-emerald-400"></i> Attendance
            </button>
            <button onclick="launchStudioForSpecificActivity(${act.id})" class="px-2.5 py-2 rounded-xl bg-move-gold-500 hover:bg-move-gold-600 text-xs font-black text-slate-950 transition text-center flex items-center justify-center gap-1.5 shadow">
              <i class="fa-solid fa-certificate"></i> Certificates
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function openModalEditActivity(activityId) {
  let actId = activityId ? Number(activityId) : Number(appState.currentActivityId);
  if (!appState.activities || appState.activities.length === 0) {
    await loadActivities();
  }
  let act = appState.activities.find(a => Number(a.id) === actId);
  if (!act && appState.activities.length > 0) {
    act = appState.activities[0];
  }
  if (!act) {
    alert("Activity not found.");
    return;
  }

  document.getElementById("actEditId").value = act.id;
  document.getElementById("actEditTitle").value = act.title || "";
  document.getElementById("actEditTheme").value = act.theme || "";
  document.getElementById("actEditDate").value = act.activity_date || "";
  document.getElementById("actEditHours").value = act.duration_hours || "8 Hours";
  document.getElementById("actEditVenue").value = act.venue || "";
  document.getElementById("actEditTrainer").value = act.trainer_name || "";
  document.getElementById("actEditTrainerPos").value = act.trainer_position || "";
  document.getElementById("actEditTargetNotes").value = act.target_notes || "";

  openModal("modalEditActivity");
}

async function submitEditActivity(e) {
  e.preventDefault();
  const actId = parseInt(document.getElementById("actEditId").value, 10);
  if (!actId) return;

  const payload = {
    title: document.getElementById("actEditTitle").value.trim(),
    theme: document.getElementById("actEditTheme").value.trim(),
    activity_date: document.getElementById("actEditDate").value.trim(),
    duration_hours: document.getElementById("actEditHours").value.trim() || "8 Hours",
    venue: document.getElementById("actEditVenue").value.trim(),
    trainer_name: document.getElementById("actEditTrainer").value.trim(),
    trainer_position: document.getElementById("actEditTrainerPos").value.trim(),
    target_notes: document.getElementById("actEditTargetNotes").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modalEditActivity");
      await loadActivities();

      // If the currently active activity was edited, update attendance view & studio
      if (appState.currentActivityId === actId) {
        const updatedAct = appState.activities.find(a => a.id === actId);
        if (updatedAct) {
          appState.currentActivity = updatedAct;
          const titleEl = document.getElementById("attendanceActivityTitle");
          const metaEl = document.getElementById("attendanceActivityMeta");
          if (titleEl) titleEl.textContent = updatedAct.title;
          if (metaEl) {
            metaEl.innerHTML = `
              <i class="fa-regular fa-calendar mr-1"></i> ${escapeHtml(updatedAct.activity_date || '')} &bull; 
              <i class="fa-solid fa-location-dot mr-1"></i> ${escapeHtml(updatedAct.venue || 'Baguio City')}
            `;
          }

          // Update studio inputs if in studio view
          const certTitleInput = document.getElementById("certInputTitle");
          const certThemeInput = document.getElementById("certInputTheme");
          const certDateInput = document.getElementById("certInputDate");
          const certHoursInput = document.getElementById("certInputHours");
          const certVenueInput = document.getElementById("certInputVenue");
          if (certTitleInput) certTitleInput.value = updatedAct.title || "";
          if (certThemeInput) certThemeInput.value = updatedAct.theme || "";
          if (certDateInput) certDateInput.value = updatedAct.activity_date || "";
          if (certHoursInput) certHoursInput.value = updatedAct.duration_hours || "8 Hours";
          if (certVenueInput) certVenueInput.value = updatedAct.venue || "";

          appState.customCertFields = {
            title: updatedAct.title || "",
            theme: updatedAct.theme || "",
            date: updatedAct.activity_date || "",
            hours: updatedAct.duration_hours || "8 Hours",
            venue: updatedAct.venue || ""
          };
          renderCertificateCanvas();
        }
      }
    } else {
      alert("Failed to update activity: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error updating activity:", err);
    alert("Network error updating activity: " + err);
  }
}

async function deleteCurrentEditActivity() {
  const actId = parseInt(document.getElementById("actEditId").value, 10);
  if (!actId) return;

  const act = appState.activities.find(a => a.id === actId);
  const title = act ? act.title : `Activity #${actId}`;
  if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently remove the activity and all its enrolled attendees.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modalEditActivity");
      await loadActivities();
      if (appState.activities.length > 0) {
        appState.currentActivityId = appState.activities[0].id;
        appState.currentActivity = appState.activities[0];
      } else {
        appState.currentActivityId = null;
        appState.currentActivity = null;
      }
      switchView("activities");
    } else {
      alert("Failed to delete activity: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting activity:", err);
    alert("Network error deleting activity: " + err);
  }
}

async function saveStudioActivityDetails() {
  const actId = appState.currentActivityId;
  if (!actId) {
    alert("No activity selected.");
    return;
  }

  const btn = document.getElementById("btnSaveStudioActivity");
  if (btn) btn.disabled = true;

  const act = appState.activities.find(a => a.id === actId) || {};
  const payload = {
    title: document.getElementById("certInputTitle").value.trim() || act.title,
    theme: document.getElementById("certInputTheme").value.trim(),
    activity_date: document.getElementById("certInputDate").value.trim(),
    duration_hours: document.getElementById("certInputHours").value.trim() || "8 Hours",
    venue: document.getElementById("certInputVenue").value.trim(),
    trainer_name: act.trainer_name || "",
    trainer_position: act.trainer_position || "",
    target_notes: act.target_notes || ""
  };

  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      await loadActivities();
      if (btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> Saved to Database!`;
        btn.classList.add("text-emerald-400", "border-emerald-500/50");
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove("text-emerald-400", "border-emerald-500/50");
          btn.disabled = false;
        }, 2000);
      }
    } else {
      alert("Error saving activity details: " + (data.message || "Failed"));
      if (btn) btn.disabled = false;
    }
  } catch (err) {
    console.error("Failed to save activity details:", err);
    alert("Network error: " + err);
    if (btn) btn.disabled = false;
  }
}

async function submitCreateActivity(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById("actNewTitle").value.trim(),
    theme: document.getElementById("actNewTheme").value.trim(),
    activity_date: document.getElementById("actNewDate").value.trim(),
    duration_hours: document.getElementById("actNewHours").value.trim(),
    venue: document.getElementById("actNewVenue").value.trim(),
    trainer_name: document.getElementById("actNewTrainer").value.trim(),
    trainer_position: document.getElementById("actNewTrainerPos").value.trim(),
    target_notes: document.getElementById("actNewTargetNotes").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modalCreateActivity");
      document.getElementById("formCreateActivity").reset();
      await loadActivities();
      openActivityAttendance(data.id);
    }
  } catch (err) {
    alert("Error creating activity: " + err);
  }
}

// ==========================================================================
// 4. ATTENDANCE CHECKLIST CONTROLLER (GATING MECHANISM)
// ==========================================================================

async function openActivityAttendance(activityId) {
  const actId = Number(activityId);
  appState.currentActivityId = actId;
  const act = appState.activities.find(a => Number(a.id) === actId);
  if (act) {
    appState.currentActivity = act;
  }
  await loadAttendance(actId);
  switchView('attendance');
}

async function loadAttendance(activityId) {
  const actId = activityId ? Number(activityId) : (Number(appState.currentActivityId) || 1);
  appState.currentActivityId = actId;
  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}/attendees`);
    const data = await res.json();
    if (data.success) {
      appState.attendees = data.attendees;
      appState.attendanceSearch = '';
      appState.attendanceStatusFilter = 'all';
      const attInput = document.getElementById("attendanceSearchInput");
      if (attInput) attInput.value = '';
      const attClear = document.getElementById("btnClearAttendanceSearch");
      if (attClear) attClear.classList.add("hidden");
      const attFilter = document.getElementById("attendanceStatusFilter");
      if (attFilter) attFilter.value = 'all';

      const act = appState.activities.find(a => Number(a.id) === actId) || {
        title: "Men in the Kitchen 2",
        activity_date: "October 20, 2026",
        venue: "CDRRMO Building, Lower Rock Quarry"
      };

      const titleEl = document.getElementById("attendanceActivityTitle");
      const metaEl = document.getElementById("attendanceActivityMeta");
      if (titleEl) titleEl.textContent = act.title;
      if (metaEl) {
        metaEl.innerHTML = `
          <i class="fa-regular fa-calendar mr-1"></i> ${escapeHtml(act.activity_date || '')} &bull; 
          <i class="fa-solid fa-location-dot mr-1"></i> ${escapeHtml(act.venue || 'Baguio City')}
        `;
      }

      renderAttendanceTable();
      await loadFacilitators(actId);
      switchActivitySubTab(appState.currentActivitySubTab || 'attendees');
    }
  } catch (err) {
    console.error("Attendance load error:", err);
  }
}

function onAttendanceSearch(val) {
  appState.attendanceSearch = val;
  const clearBtn = document.getElementById("btnClearAttendanceSearch");
  if (clearBtn) {
    clearBtn.classList.toggle("hidden", !(val && val.trim().length > 0));
  }
  renderAttendanceTable();
}

function clearAttendanceSearch() {
  appState.attendanceSearch = '';
  appState.attendanceStatusFilter = 'all';
  const input = document.getElementById("attendanceSearchInput");
  const clearBtn = document.getElementById("btnClearAttendanceSearch");
  const statusFilter = document.getElementById("attendanceStatusFilter");
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.add("hidden");
  if (statusFilter) statusFilter.value = 'all';
  renderAttendanceTable();
  if (input && typeof input.focus === 'function') input.focus();
}

function onAttendanceStatusFilter(status) {
  appState.attendanceStatusFilter = status;
  renderAttendanceTable();
}

function renderAttendanceTable() {
  const tbody = document.getElementById("attendanceTableBody");
  if (!tbody) return;

  const total = appState.attendees.length;
  const present = appState.attendees.filter(a => a.is_present).length;
  const absent = total - present;

  document.getElementById("statTotalAttendees").textContent = total;
  document.getElementById("statPresentCount").textContent = present;
  document.getElementById("statAbsentCount").textContent = absent;
  document.getElementById("btnPresentCertCount").textContent = present;
  const badgeAtt = document.getElementById("badgeAttendeeCount");
  if (badgeAtt) badgeAtt.textContent = total;

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500">No attendees enrolled yet. Click "Enroll All MOVE Participants" or "Add Attendee".</td></tr>`;
    const countEl = document.getElementById("attendanceFilteredCount");
    if (countEl) countEl.textContent = "0 enrolled attendees";
    return;
  }

  // Filter attendees by search text and verification status
  const q = (appState.attendanceSearch || "").trim().toLowerCase();
  const statusFilter = appState.attendanceStatusFilter || "all";

  let filtered = appState.attendees;

  if (statusFilter === "present") {
    filtered = filtered.filter(a => a.is_present);
  } else if (statusFilter === "absent") {
    filtered = filtered.filter(a => !a.is_present);
  }

  if (q) {
    filtered = filtered.filter(a => 
      (a.full_name && a.full_name.toLowerCase().includes(q)) ||
      (a.position && a.position.toLowerCase().includes(q)) ||
      (a.office && a.office.toLowerCase().includes(q))
    );
  }

  const countEl = document.getElementById("attendanceFilteredCount");
  if (countEl) {
    if (q || statusFilter !== "all") {
      countEl.innerHTML = `<span class="text-move-gold-400 font-bold">${filtered.length}</span> of ${total} attendees found`;
    } else {
      countEl.textContent = `${total} enrolled attendees`;
    }
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-slate-500">
          No attendees match "${escapeHtml(q)}".
          <button type="button" onclick="clearAttendanceSearch()" class="text-move-gold-400 underline font-bold ml-1.5 hover:text-white transition">
            Clear search
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((att, idx) => {
    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${idx + 1}</td>
        <td class="py-3 px-4 font-bold text-white">${escapeHtml(att.full_name)}</td>
        <td class="py-3 px-4 text-slate-300">
          <div class="flex items-center justify-between gap-1 group">
            <span class="font-medium text-slate-200">${escapeHtml(att.position || '-')}</span>
            <button onclick="openModalEditAttendee(${att.id})" class="text-amber-400/80 hover:text-amber-300 transition p-1 rounded" title="Edit Attendee Position Title">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
          </div>
        </td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(att.office || '-')}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${att.gender === 'F' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'}">
            ${att.gender || 'M'}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(att.civil_status || 'Married')}</td>
        
        <!-- Attendance Toggle Button (The Gating Mechanism) -->
        <td class="py-3 px-4 text-center">
          <button onclick="toggleAttendeeAttendance(${att.id}, ${att.is_present})" 
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto border shadow-sm ${att.is_present ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'}">
            ${att.is_present ? '<i class="fa-solid fa-check"></i> PRESENT' : '<i class="fa-solid fa-xmark"></i> ABSENT'}
          </button>
        </td>

        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${att.is_present ? `
              <button onclick="launchStudioForAttendee(${att.id})" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-move-gold-400 hover:text-white text-[11px] font-bold border border-slate-700 transition flex items-center gap-1 shadow-xs" title="Generate Participation / Appearance Certificate for this Attendee">
                <i class="fa-solid fa-graduation-cap text-xs"></i> Cert
              </button>
            ` : `
              <button disabled class="px-2 py-1 rounded-lg bg-slate-900 text-slate-600 text-[11px] font-bold border border-slate-800 cursor-not-allowed opacity-50 flex items-center gap-1" title="Mark as Present to generate certificates">
                <i class="fa-solid fa-lock text-xs"></i>
              </button>
            `}
            <button onclick="openModalEditAttendee(${att.id})" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-bold border border-amber-500/30 transition flex items-center gap-1 shadow-xs" title="Edit Attendee Position, Office and Details">
              <i class="fa-solid fa-pen-to-square text-xs text-amber-400"></i> Edit
            </button>
            <button onclick="removeAttendee(${att.id})" class="text-slate-500 hover:text-rose-400 p-1.5 transition" title="Remove Attendee">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function toggleAttendeeAttendance(attendeeId, currentPresent) {
  const newPresent = currentPresent ? 0 : 1;
  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/attendees/${attendeeId}/present`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_present: newPresent })
    });
    const data = await res.json();
    if (data.success) {
      loadAttendance(appState.currentActivityId);
    }
  } catch (err) {
    alert("Error updating attendance: " + err);
  }
}

async function batchSetAttendance(setPresent) {
  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/batch-attendance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_present: setPresent })
    });
    const data = await res.json();
    if (data.success) {
      loadAttendance(appState.currentActivityId);
    }
  } catch (err) {
    alert("Batch update failed: " + err);
  }
}

async function bulkEnrollMoveRoster() {
  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/bulk-enroll-move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_filter: "participant" })
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      loadAttendance(appState.currentActivityId);
    }
  } catch (err) {
    alert("Bulk enrollment failed: " + err);
  }
}

async function submitAddAttendee(e) {
  e.preventDefault();
  const fullName = document.getElementById("attNewName").value.trim().toUpperCase();
  if (!fullName) {
    alert("Please enter attendee full name.");
    return;
  }

  // Pre-submission duplicate check
  const existing = (appState.attendees || []).find(
    a => (a.full_name || "").trim().toUpperCase() === fullName
  );
  if (existing) {
    const status = existing.is_present ? "Present (Checked In)" : "Absent";
    alert(`"${fullName}" is already enrolled in this activity's attendance checklist with status: ${status}.\n\nDuplicate enrollments are blocked to maintain attendance integrity.`);
    checkDuplicateAttendeeInput(fullName);
    return;
  }

  const payload = {
    full_name: fullName,
    position: document.getElementById("attNewPosition").value.trim(),
    office: document.getElementById("attNewOffice").value.trim(),
    gender: document.getElementById("attNewGender").value,
    civil_status: document.getElementById("attNewCivil").value,
    is_present: document.getElementById("attNewIsPresent").checked
  };

  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/attendees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modalAddAttendee");
      document.getElementById("formAddAttendee").reset();
      checkDuplicateAttendeeInput("");
      loadAttendance(appState.currentActivityId);
    } else {
      alert(data.message || "Failed to enroll attendee.");
      if (data.duplicate) {
        checkDuplicateAttendeeInput(fullName);
      }
    }
  } catch (err) {
    alert("Error adding attendee: " + err);
  }
}

async function removeAttendee(attendeeId) {
  if (!confirm("Remove this attendee from the activity?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/attendees/${attendeeId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) loadAttendance(appState.currentActivityId);
  } catch (err) {
    alert("Remove failed: " + err);
  }
}

// ==========================================================================
// 4b. FACILITATORS, TRAINERS & RESOURCE SPEAKERS CONTROLLER
// ==========================================================================

function switchActivitySubTab(subTab) {
  appState.currentActivitySubTab = subTab;
  const btnAtt = document.getElementById("subTabBtnAttendees");
  const btnFac = document.getElementById("subTabBtnFacilitators");
  const containerAtt = document.getElementById("containerAttendeesTable");
  const containerFac = document.getElementById("containerFacilitatorsTable");
  const hintText = document.getElementById("subTabHintText");

  if (subTab === 'facilitators') {
    if (btnAtt) {
      btnAtt.className = "px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 transition";
    }
    if (btnFac) {
      btnFac.className = "px-4 py-2.5 text-xs font-bold border-b-2 border-indigo-500 text-indigo-400 flex items-center gap-2 transition";
    }
    if (containerAtt) containerAtt.classList.add("hidden");
    if (containerFac) containerFac.classList.remove("hidden");
    if (hintText) hintText.textContent = "Showing trainers, resource speakers, and event facilitators";
    renderFacilitatorsTable();
  } else {
    if (btnAtt) {
      btnAtt.className = "px-4 py-2.5 text-xs font-bold border-b-2 border-move-gold-500 text-move-gold-400 flex items-center gap-2 transition";
    }
    if (btnFac) {
      btnFac.className = "px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2 transition";
    }
    if (containerAtt) containerAtt.classList.remove("hidden");
    if (containerFac) containerFac.classList.add("hidden");
    if (hintText) hintText.textContent = "Showing attendee checklist for certificate gating";
    renderAttendanceTable();
  }
}

async function loadFacilitators(activityId) {
  const actId = activityId ? Number(activityId) : (Number(appState.currentActivityId) || 1);
  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}/facilitators`);
    const data = await res.json();
    if (data.success) {
      appState.facilitators = data.facilitators || [];
      const badge = document.getElementById("badgeFacilitatorCount");
      if (badge) badge.textContent = appState.facilitators.length;
      renderFacilitatorsTable();
    }
  } catch (err) {
    console.error("Facilitators load error:", err);
  }
}

function renderFacilitatorsTable() {
  const tbody = document.getElementById("facilitatorsTableBody");
  if (!tbody) return;

  const total = appState.facilitators.length;
  const presentCount = appState.facilitators.filter(f => f.is_present).length;
  const badge = document.getElementById("badgeFacilitatorCount");
  if (badge) badge.textContent = total;
  const btnFacCertCount = document.getElementById("btnFacilitatorCertCount");
  if (btnFacCertCount) btnFacCertCount.textContent = presentCount;

  const q = (appState.facilitatorSearch || "").trim().toLowerCase();
  let filtered = appState.facilitators;
  if (q) {
    filtered = filtered.filter(f => 
      (f.full_name && f.full_name.toLowerCase().includes(q)) ||
      (f.role_title && f.role_title.toLowerCase().includes(q)) ||
      (f.position && f.position.toLowerCase().includes(q)) ||
      (f.office && f.office.toLowerCase().includes(q))
    );
  }

  const countEl = document.getElementById("facilitatorFilteredCount");
  if (countEl) {
    if (q) {
      countEl.innerHTML = `<span class="text-indigo-400 font-bold">${filtered.length}</span> of ${total} found`;
    } else {
      countEl.textContent = `${total} enrolled`;
    }
  }

  if (total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-10 text-slate-400">
          <div class="max-w-md mx-auto space-y-3">
            <i class="fa-solid fa-chalkboard-user text-3xl text-slate-600 block"></i>
            <p class="text-xs text-slate-400 font-medium">No facilitators or trainers assigned to this event yet.</p>
            <button onclick="openModal('modalAddFacilitator')" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md">
              <i class="fa-solid fa-plus"></i> Add Event Facilitator / Trainer
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-slate-500">
          No facilitators match "${escapeHtml(q)}".
          <button type="button" onclick="clearFacilitatorSearch()" class="text-indigo-400 underline font-bold ml-1.5 hover:text-white transition">
            Clear search
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((fac, idx) => {
    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${idx + 1}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-white text-xs">${escapeHtml(fac.full_name)}</div>
          ${fac.notes ? `<div class="text-[10px] text-slate-400 font-normal italic">${escapeHtml(fac.notes)}</div>` : ''}
        </td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ${escapeHtml(fac.role_title || 'Facilitator')}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-300">
          <div class="flex items-center justify-between gap-1 group">
            <span class="font-medium text-slate-200">${escapeHtml(fac.position || '-')}</span>
            <button onclick="openModalEditFacilitator(${fac.id})" class="text-amber-400/80 hover:text-amber-300 transition p-1 rounded" title="Edit Facilitator Position Title">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
          </div>
        </td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(fac.office || '-')}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${fac.gender === 'F' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'}">
            ${fac.gender || 'M'}
          </span>
        </td>
        
        <!-- Facilitator Attendance Toggle Button -->
        <td class="py-3 px-4 text-center">
          <button onclick="toggleFacilitatorAttendance(${fac.id}, ${fac.is_present})" 
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto border shadow-sm ${fac.is_present ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'}">
            ${fac.is_present ? '<i class="fa-solid fa-check"></i> PRESENT' : '<i class="fa-solid fa-xmark"></i> ABSENT'}
          </button>
        </td>

        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${fac.is_present ? `
              <button onclick="launchStudioForFacilitator(${fac.id})" class="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white text-[11px] font-bold border border-indigo-500/40 transition flex items-center gap-1 shadow-xs" title="Award Certificate of Appreciation to this Facilitator">
                <i class="fa-solid fa-award text-xs text-move-gold-400"></i> Appreciation Cert
              </button>
            ` : `
              <button disabled class="px-2 py-1 rounded-lg bg-slate-900 text-slate-600 text-[11px] font-bold border border-slate-800 cursor-not-allowed opacity-50 flex items-center gap-1" title="Mark Facilitator as Present to award Certificate of Appreciation">
                <i class="fa-solid fa-lock text-xs"></i>
              </button>
            `}
            <button onclick="openModalEditFacilitator(${fac.id})" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-bold border border-amber-500/30 transition flex items-center gap-1 shadow-xs" title="Edit Facilitator Position and Details">
              <i class="fa-solid fa-pen-to-square text-xs text-amber-400"></i> Edit
            </button>
            <button onclick="removeFacilitator(${fac.id})" class="text-slate-500 hover:text-rose-400 p-1.5 transition" title="Remove Facilitator">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function onFacilitatorSearch(val) {
  appState.facilitatorSearch = val;
  const clearBtn = document.getElementById("btnClearFacilitatorSearch");
  if (clearBtn) clearBtn.classList.toggle("hidden", !(val && val.trim().length > 0));
  renderFacilitatorsTable();
}

function clearFacilitatorSearch() {
  appState.facilitatorSearch = '';
  const input = document.getElementById("facilitatorSearchInput");
  const clearBtn = document.getElementById("btnClearFacilitatorSearch");
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.add("hidden");
  renderFacilitatorsTable();
  if (input) input.focus();
}

async function toggleFacilitatorAttendance(facId, currentStatus) {
  const newStatus = currentStatus ? 0 : 1;
  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/facilitators/${facId}/present`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_present: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      const fac = appState.facilitators.find(f => f.id === facId);
      if (fac) {
        fac.is_present = newStatus;
        fac.check_in_time = data.check_in_time;
      }
      renderFacilitatorsTable();
    }
  } catch (err) {
    alert("Facilitator attendance toggle failed: " + err);
  }
}

async function removeFacilitator(facId) {
  const fac = appState.facilitators.find(f => f.id === facId);
  const name = fac ? fac.full_name : 'this facilitator';
  if (!confirm(`Remove "${name}" from this activity's facilitators?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/facilitators/${facId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      await loadFacilitators(appState.currentActivityId);
    } else {
      alert("Failed to remove facilitator: " + (data.message || "Error"));
    }
  } catch (err) {
    alert("Error removing facilitator: " + err);
  }
}

function checkDuplicateFacilitatorInput(nameVal) {
  const name = (nameVal || "").trim().toUpperCase();
  const warningEl = document.getElementById("facDuplicateWarning");
  const warningText = document.getElementById("facDuplicateWarningText");
  const submitBtn = document.getElementById("btnSubmitAddFacilitator");
  const nameInput = document.getElementById("facNewName");

  if (!name) {
    if (warningEl) warningEl.classList.add("hidden");
    if (submitBtn) submitBtn.disabled = false;
    if (nameInput) {
      nameInput.classList.remove("border-rose-500", "focus:border-rose-500", "ring-2", "ring-rose-500/30");
      nameInput.classList.add("border-slate-700", "focus:border-indigo-500");
    }
    return false;
  }

  const existing = (appState.facilitators || []).find(
    f => (f.full_name || "").trim().toUpperCase() === name
  );

  if (existing) {
    if (warningEl) {
      warningEl.classList.remove("hidden");
      if (warningText) {
        const status = existing.is_present ? "Present (Checked In)" : "Absent";
        warningText.innerHTML = `<strong>${escapeHtml(existing.full_name)}</strong> is already assigned as <strong>${escapeHtml(existing.role_title || 'Facilitator')}</strong> in this activity (Status: ${status}).<br>Duplicate enrollments are blocked.`;
      }
    }
    if (nameInput) {
      nameInput.classList.remove("border-slate-700", "focus:border-indigo-500");
      nameInput.classList.add("border-rose-500", "focus:border-rose-500", "ring-2", "ring-rose-500/30");
    }
    if (submitBtn) submitBtn.disabled = true;
    return true;
  } else {
    if (warningEl) warningEl.classList.add("hidden");
    if (nameInput) {
      nameInput.classList.remove("border-rose-500", "focus:border-rose-500", "ring-2", "ring-rose-500/30");
      nameInput.classList.add("border-slate-700", "focus:border-indigo-500");
    }
    if (submitBtn) submitBtn.disabled = false;
    return false;
  }
}

async function submitAddFacilitator(e) {
  e.preventDefault();
  const fullName = document.getElementById("facNewName").value.trim().toUpperCase();
  if (!fullName) {
    alert("Please enter facilitator full name.");
    return;
  }

  const existing = (appState.facilitators || []).find(
    f => (f.full_name || "").trim().toUpperCase() === fullName
  );
  if (existing) {
    alert(`"${fullName}" is already enrolled as a facilitator in this activity.\n\nDuplicate enrollments are not allowed.`);
    checkDuplicateFacilitatorInput(fullName);
    return;
  }

  const payload = {
    full_name: fullName,
    role_title: document.getElementById("facNewRole").value.trim() || "Facilitator",
    position: document.getElementById("facNewPosition").value.trim(),
    office: document.getElementById("facNewOffice").value.trim(),
    gender: document.getElementById("facNewGender").value,
    civil_status: document.getElementById("facNewCivil").value,
    is_present: document.getElementById("facNewIsPresent").checked
  };

  try {
    const res = await fetch(`${API_BASE}/api/activities/${appState.currentActivityId}/facilitators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal("modalAddFacilitator");
      document.getElementById("formAddFacilitator").reset();
      checkDuplicateFacilitatorInput("");
      await loadFacilitators(appState.currentActivityId);
      switchActivitySubTab('facilitators');
    } else {
      alert(data.message || "Failed to enroll facilitator.");
      if (data.duplicate) {
        checkDuplicateFacilitatorInput(fullName);
      }
    }
  } catch (err) {
    alert("Error adding facilitator: " + err);
  }
}

// ==========================================================================
// 4c. EDIT ATTENDEE & FACILITATOR RECORD DETAILS
// ==========================================================================

function openModalEditAttendee(attId) {
  const att = (appState.attendees || []).find(a => Number(a.id) === Number(attId));
  if (!att) {
    alert("Attendee not found.");
    return;
  }

  const idInput = document.getElementById("editAttId");
  const nameInput = document.getElementById("editAttName");
  const posInput = document.getElementById("editAttPosition");
  const offInput = document.getElementById("editAttOffice");
  const genInput = document.getElementById("editAttGender");
  const civInput = document.getElementById("editAttCivil");
  const conInput = document.getElementById("editAttContact");
  const notesInput = document.getElementById("editAttNotes");

  if (idInput) idInput.value = att.id;
  if (nameInput) nameInput.value = att.full_name || "";
  if (posInput) posInput.value = att.position || "";
  if (offInput) offInput.value = att.office || "";
  if (genInput) genInput.value = att.gender === 'F' ? 'F' : 'M';
  if (civInput) civInput.value = att.civil_status || "Married";
  if (conInput) conInput.value = att.contact_number || "";
  if (notesInput) notesInput.value = att.notes || "";

  openModal("modalEditAttendee");

  setTimeout(() => {
    if (posInput) {
      posInput.focus();
      posInput.select();
    }
  }, 100);
}

async function submitEditAttendee(e) {
  e.preventDefault();
  const attId = document.getElementById("editAttId").value;
  const fullName = document.getElementById("editAttName").value.trim().toUpperCase();
  const position = document.getElementById("editAttPosition").value.trim();
  const office = document.getElementById("editAttOffice").value.trim();
  const gender = document.getElementById("editAttGender").value;
  const civilStatus = document.getElementById("editAttCivil").value;
  const contactNumber = document.getElementById("editAttContact").value.trim();
  const notes = document.getElementById("editAttNotes").value.trim();

  if (!fullName) {
    alert("Please enter attendee full name.");
    return;
  }
  if (!position) {
    alert("Please enter attendee position title.");
    return;
  }

  const actId = appState.currentActivityId || 1;

  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}/attendees/${attId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        position: position,
        office: office,
        gender: gender,
        civil_status: civilStatus,
        contact_number: contactNumber,
        notes: notes
      })
    });

    const data = await res.json();
    if (data.success) {
      closeModal("modalEditAttendee");
      await loadAttendance(actId);
      if (typeof loadEligibleCertificates === "function") {
        await loadEligibleCertificates(actId);
      }
    } else {
      alert("Failed to update attendee: " + (data.message || "Error"));
    }
  } catch (err) {
    alert("Error updating attendee: " + err);
  }
}

function openModalEditFacilitator(facId) {
  const fac = (appState.facilitators || []).find(f => Number(f.id) === Number(facId));
  if (!fac) {
    alert("Facilitator not found.");
    return;
  }

  const idInput = document.getElementById("editFacId");
  const nameInput = document.getElementById("editFacName");
  const roleInput = document.getElementById("editFacRole");
  const posInput = document.getElementById("editFacPosition");
  const offInput = document.getElementById("editFacOffice");
  const genInput = document.getElementById("editFacGender");
  const civInput = document.getElementById("editFacCivil");
  const conInput = document.getElementById("editFacContact");
  const notesInput = document.getElementById("editFacNotes");

  if (idInput) idInput.value = fac.id;
  if (nameInput) nameInput.value = fac.full_name || "";
  if (roleInput) roleInput.value = fac.role_title || "Facilitator";
  if (posInput) posInput.value = fac.position || "";
  if (offInput) offInput.value = fac.office || "";
  if (genInput) genInput.value = fac.gender === 'F' ? 'F' : 'M';
  if (civInput) civInput.value = fac.civil_status || "Married";
  if (conInput) conInput.value = fac.contact_number || "";
  if (notesInput) notesInput.value = fac.notes || "";

  openModal("modalEditFacilitator");

  setTimeout(() => {
    if (posInput) {
      posInput.focus();
      posInput.select();
    }
  }, 100);
}

async function submitEditFacilitator(e) {
  e.preventDefault();
  const facId = document.getElementById("editFacId").value;
  const fullName = document.getElementById("editFacName").value.trim().toUpperCase();
  const roleTitle = document.getElementById("editFacRole").value.trim();
  const position = document.getElementById("editFacPosition").value.trim();
  const office = document.getElementById("editFacOffice").value.trim();
  const gender = document.getElementById("editFacGender").value;
  const civilStatus = document.getElementById("editFacCivil").value;
  const contactNumber = document.getElementById("editFacContact").value.trim();
  const notes = document.getElementById("editFacNotes").value.trim();

  if (!fullName) {
    alert("Please enter facilitator full name.");
    return;
  }
  if (!position) {
    alert("Please enter facilitator position title.");
    return;
  }

  const actId = appState.currentActivityId || 1;

  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}/facilitators/${facId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        role_title: roleTitle,
        position: position,
        office: office,
        gender: gender,
        civil_status: civilStatus,
        contact_number: contactNumber,
        notes: notes
      })
    });

    const data = await res.json();
    if (data.success) {
      closeModal("modalEditFacilitator");
      await loadFacilitators(actId);
      if (typeof loadEligibleCertificates === "function") {
        await loadEligibleCertificates(actId);
      }
    } else {
      alert("Failed to update facilitator: " + (data.message || "Error"));
    }
  } catch (err) {
    alert("Error updating facilitator: " + err);
  }
}

let quickPickFacilitatorPoolCache = [];
let quickPickFacilitatorDebounce = null;

async function initQuickPickFacilitatorModal() {
  const searchInput = document.getElementById("quickFacilitatorSearch");
  const clearBtn = document.getElementById("btnClearQuickFacilitatorSearch");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");

  checkDuplicateFacilitatorInput("");
  await ensureFullRosterLoaded();
  renderQuickPickFacilitatorOptions("", []);

  setTimeout(() => {
    if (searchInput) searchInput.focus();
  }, 100);
}

function renderQuickPickFacilitatorOptions(query, poolMatches = []) {
  const select = document.getElementById("quickPickFacilitator");
  const countEl = document.getElementById("quickFacilitatorMatchCount");
  if (!select) return;

  const roster = appState.fullRoster && appState.fullRoster.length > 0 ? appState.fullRoster : appState.roster;
  const q = (query || "").trim().toLowerCase();
  const enrolledFacNames = new Set((appState.facilitators || []).map(f => (f.full_name || '').trim().toUpperCase()));

  let filteredRoster = roster;
  if (q) {
    filteredRoster = roster.filter(r => 
      (r.full_name && r.full_name.toLowerCase().includes(q)) ||
      (r.office && r.office.toLowerCase().includes(q)) ||
      (r.position && r.position.toLowerCase().includes(q))
    );
  }

  const totalMatches = filteredRoster.length + poolMatches.length;
  if (countEl) {
    countEl.textContent = q ? `${totalMatches} found` : `${roster.length} personnel`;
  }

  let html = '';
  if (!q) {
    html += `<option value="">-- Choose from MOVE Roster (${roster.length}) or Search Above --</option>`;
    html += filteredRoster.map(r => {
      const isEnrolled = enrolledFacNames.has((r.full_name || '').trim().toUpperCase());
      const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] ${escapeHtml(r.full_name)} (${escapeHtml(r.office || '-')})` : `${escapeHtml(r.full_name)} (${escapeHtml(r.office || '-')})`;
      return `<option value="${r.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
    }).join("");
  } else {
    if (totalMatches === 0) {
      html += `<option value="">-- No matching personnel found --</option>`;
    } else {
      html += `<option value="">-- Found ${totalMatches} matching result(s) --</option>`;
      if (filteredRoster.length > 0) {
        html += `<optgroup label="MOVE Chapter Roster (${filteredRoster.length})">`;
        html += filteredRoster.map(r => {
          const isEnrolled = enrolledFacNames.has((r.full_name || '').trim().toUpperCase());
          const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] ${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')}` : `${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')}`;
          return `<option value="${r.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
        }).join("");
        html += `</optgroup>`;
      }
      if (poolMatches.length > 0) {
        html += `<optgroup label="City Municipal Employee Pool (${poolMatches.length})">`;
        html += poolMatches.map(p => {
          const isEnrolled = enrolledFacNames.has((p.full_name || '').trim().toUpperCase());
          const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] [City Pool] ${escapeHtml(p.full_name)}` : `[City Pool] ${escapeHtml(p.full_name)} &bull; ${escapeHtml(p.position || '-')}`;
          return `<option value="pool_${p.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
        }).join("");
        html += `</optgroup>`;
      }
    }
  }

  select.innerHTML = html;
}

function onFilterQuickPickFacilitator(val) {
  const q = (val || "").trim();
  const clearBtn = document.getElementById("btnClearQuickFacilitatorSearch");
  if (clearBtn) clearBtn.classList.toggle("hidden", q.length === 0);

  renderQuickPickFacilitatorOptions(q, []);

  clearTimeout(quickPickFacilitatorDebounce);
  if (q.length >= 2) {
    quickPickFacilitatorDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search-pool?q=${encodeURIComponent(q)}&limit=15`);
        const data = await res.json();
        if (data.success && data.employees) {
          quickPickFacilitatorPoolCache = data.employees;
          renderQuickPickFacilitatorOptions(q, data.employees);
        }
      } catch (err) {
        console.warn("Facilitator quick pick pool search failed:", err);
      }
    }, 200);
  }
}

function clearQuickFacilitatorSearch() {
  const searchInput = document.getElementById("quickFacilitatorSearch");
  const clearBtn = document.getElementById("btnClearQuickFacilitatorSearch");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  quickPickFacilitatorPoolCache = [];
  renderQuickPickFacilitatorOptions("", []);
  if (searchInput) searchInput.focus();
}

function onQuickPickFacilitatorSelect(val) {
  if (!val) return;
  let person = null;
  if (String(val).startsWith("pool_")) {
    const poolId = parseInt(String(val).replace("pool_", ""), 10);
    person = quickPickFacilitatorPoolCache.find(p => p.id === poolId);
  } else {
    const id = parseInt(val, 10);
    const roster = appState.fullRoster && appState.fullRoster.length > 0 ? appState.fullRoster : appState.roster;
    person = roster.find(r => r.id === id);
  }

  if (person) {
    const nameInput = document.getElementById("facNewName");
    const roleInput = document.getElementById("facNewRole");
    const posInput = document.getElementById("facNewPosition");
    const offInput = document.getElementById("facNewOffice");
    const genSelect = document.getElementById("facNewGender");
    const civSelect = document.getElementById("facNewCivil");

    if (nameInput) nameInput.value = person.full_name || "";
    if (roleInput && !roleInput.value) roleInput.value = "Resource Speaker";
    if (posInput) posInput.value = person.position || "";
    if (offInput) offInput.value = person.office || "";
    if (genSelect) genSelect.value = (person.gender === 'F') ? 'F' : 'M';
    if (civSelect) {
      civSelect.value = (person.civil_status && person.civil_status.toLowerCase() === 'single') ? 'Single' : 'Married';
    }

    if (nameInput) {
      checkDuplicateFacilitatorInput(nameInput.value);
      nameInput.classList.add("ring-2", "ring-indigo-400");
      setTimeout(() => nameInput.classList.remove("ring-2", "ring-indigo-400"), 1200);
    }
  }
}

function launchStudioForAttendee(attId) {
  appState.certRecipientPool = 'attendees';
  appState.currentTemplate = 'participation';
  appState.pendingRecipientId = attId;
  switchView('studio');
}

function launchStudioForFacilitator(facId) {
  appState.certRecipientPool = 'facilitators';
  appState.currentTemplate = 'appreciation';
  appState.pendingRecipientId = facId;
  switchView('studio');
}

function launchStudioForFacilitatorsBatch() {
  appState.certRecipientPool = 'facilitators';
  appState.currentTemplate = 'appreciation';
  appState.currentCertIndex = 0;
  appState.pendingRecipientId = null;
  switchView('studio');
}

function toggleStudioRecipientPool(pool) {
  if (pool) {
    appState.certRecipientPool = pool;
  } else {
    appState.certRecipientPool = (appState.certRecipientPool === 'facilitators') ? 'attendees' : 'facilitators';
  }

  updateStudioTemplateAvailability();
  appState.currentCertIndex = 0;
  renderRecipientDropdown();
  renderCertificateCanvas();
}

function updateStudioTemplateAvailability() {
  const tabPart = document.getElementById("studioTab-participation");
  const tabAppear = document.getElementById("studioTab-appearance");
  const tabApprec = document.getElementById("studioTab-appreciation");
  const btnAtt = document.getElementById("btnStudioPoolAttendees");
  const btnFac = document.getElementById("btnStudioPoolFacilitators");
  const ruleHint = document.getElementById("studioRoleRuleHint");
  const isFac = appState.certRecipientPool === 'facilitators';

  // Toggle Pool switcher buttons styling
  if (btnAtt && btnFac) {
    if (isFac) {
      btnAtt.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white flex items-center gap-1.5";
      btnFac.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center gap-1.5";
    } else {
      btnAtt.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition bg-move-gold-500 text-slate-950 flex items-center gap-1.5 shadow-sm";
      btnFac.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white flex items-center gap-1.5";
    }
  }

  // Enforce certificate rules:
  // Attendees: Participation + Appearance ONLY (Appreciation is HIDDEN)
  // Facilitators: Appreciation + Appearance ONLY (Participation is HIDDEN)
  if (isFac) {
    if (tabPart) tabPart.classList.add("hidden");
    if (tabApprec) tabApprec.classList.remove("hidden");
    if (tabAppear) tabAppear.classList.remove("hidden");
    if (ruleHint) ruleHint.textContent = "For Facilitators: Appreciation & CA";

    if (appState.currentTemplate === 'participation') {
      appState.currentTemplate = 'appreciation';
    }
  } else {
    if (tabPart) tabPart.classList.remove("hidden");
    if (tabApprec) tabApprec.classList.add("hidden");
    if (tabAppear) tabAppear.classList.remove("hidden");
    if (ruleHint) ruleHint.textContent = "For Attendees: Participation & CA";

    if (appState.currentTemplate === 'appreciation') {
      appState.currentTemplate = 'participation';
    }
  }

  // Update template tab active styling
  const templates = ['participation', 'appreciation', 'appearance'];
  templates.forEach(t => {
    const tab = document.getElementById(`studioTab-${t}`);
    if (tab) {
      if (t === appState.currentTemplate) {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-black transition bg-move-gold-500 text-slate-950 shadow flex items-center gap-1.5";
      } else {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white flex items-center gap-1.5" + (tab.classList.contains("hidden") ? " hidden" : "");
      }
    }
  });

  const caWrapper = document.getElementById("caSignatorySelectorWrapper");
  if (caWrapper) {
    if (appState.currentTemplate === 'appearance') {
      caWrapper.classList.remove("opacity-50");
      caWrapper.classList.add("ring-1", "ring-move-gold-500/50");
    } else {
      caWrapper.classList.add("opacity-50");
      caWrapper.classList.remove("ring-1", "ring-move-gold-500/50");
    }
  }
}

// ==========================================================================
// 5. THE UNIFIED CERTIFICATE STUDIO (GATED: ONLY PRESENT ATTENDEES)
// ==========================================================================

async function launchStudioForActivity() {
  appState.certRecipientPool = 'attendees';
  appState.currentTemplate = 'participation';
  appState.currentCertIndex = 0;
  appState.pendingRecipientId = null;
  switchView('studio');
}

async function launchStudioForSpecificActivity(activityId) {
  appState.currentActivityId = activityId;
  appState.certRecipientPool = 'attendees';
  appState.currentTemplate = 'participation';
  appState.currentCertIndex = 0;
  appState.pendingRecipientId = null;
  switchView('studio');
}

async function toggleCurrentRecipientAttendance() {
  const recipients = getActiveCertRecipients();
  if (recipients.length === 0) return;
  const person = recipients[appState.currentCertIndex];
  if (!person) return;

  const isFac = appState.certRecipientPool === 'facilitators';
  const roleName = isFac ? 'Facilitator' : 'Attendee';

  const confirmChange = confirm(`Do you want to change attendance for ${person.full_name} (${roleName}) to ABSENT?\n\nThis will immediately remove them from the certificate list.`);
  if (!confirmChange) return;

  try {
    const actId = appState.currentActivityId || person.activity_id || 1;
    const url = isFac 
      ? `${API_BASE}/api/activities/${actId}/facilitators/${person.id}/present`
      : `${API_BASE}/api/activities/${actId}/attendees/${person.id}/present`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_present: 0 })
    });
    const data = await res.json();
    if (data.success) {
      await loadEligibleCertificates(actId);
      if (isFac) {
        await loadFacilitators(actId);
      } else {
        await loadAttendance(actId);
      }
    }
  } catch (err) {
    alert("Error updating attendance: " + err);
  }
}

async function loadEligibleCertificates(activityId) {
  const actId = activityId || appState.currentActivityId || 1;
  appState.currentActivityId = actId;
  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}/eligible-certificates`);
    const data = await res.json();
    if (data.success) {
      const act = data.activity || {};
      appState.currentActivity = act;
      appState.eligibleAttendees = data.eligible_attendees || []; // STRICTLY WHERE IS_PRESENT = 1!
      appState.eligibleFacilitators = data.eligible_facilitators || [];

      const badgeAtt = document.getElementById("studioBadgeAttendeesCount");
      const badgeFac = document.getElementById("studioBadgeFacilitatorsCount");
      if (badgeAtt) badgeAtt.textContent = appState.eligibleAttendees.length;
      if (badgeFac) badgeFac.textContent = appState.eligibleFacilitators.length;

      updateStudioTemplateAvailability();

      const recipients = getActiveCertRecipients();
      if (appState.pendingRecipientId !== undefined && appState.pendingRecipientId !== null) {
        const pId = Number(appState.pendingRecipientId);
        const idx = recipients.findIndex(r => Number(r.id) === pId);
        if (idx !== -1) {
          appState.currentCertIndex = idx;
        } else {
          appState.currentCertIndex = 0;
        }
        appState.pendingRecipientId = null;
      } else if (appState.currentCertIndex >= recipients.length) {
        appState.currentCertIndex = Math.max(0, recipients.length - 1);
      }

      // Populate Inputs with Activity Details
      const titleInput = document.getElementById("certInputTitle");
      const themeInput = document.getElementById("certInputTheme");
      const dateInput = document.getElementById("certInputDate");
      const hoursInput = document.getElementById("certInputHours");
      const venueInput = document.getElementById("certInputVenue");
      if (titleInput) titleInput.value = act.title || "";
      if (themeInput) themeInput.value = act.theme || "";
      if (dateInput) dateInput.value = act.activity_date || "";
      if (hoursInput) hoursInput.value = act.duration_hours || "8 Hours";
      if (venueInput) venueInput.value = act.venue || "";

      appState.customCertFields = {
        title: act.title || "",
        theme: act.theme || "",
        date: act.activity_date || "",
        hours: act.duration_hours || "8 Hours",
        venue: act.venue || ""
      };

      renderRecipientDropdown();
      renderCertificateCanvas();
    }
  } catch (err) {
    console.error("Failed to load eligible certificates:", err);
  }
}

function getActiveCertRecipients() {
  if (appState.certRecipientPool === 'facilitators') {
    return appState.eligibleFacilitators || [];
  }
  return appState.eligibleAttendees || [];
}

function renderRecipientDropdown() {
  const select = document.getElementById("studioRecipientSelect");
  const currentSpan = document.getElementById("studioRecipientCurrent");
  const totalSpan = document.getElementById("studioRecipientTotal");
  const batchCount = document.getElementById("batchPrintBtnCount");
  const sidebarCount = document.getElementById("sidebarPresentCount");
  const badgeAtt = document.getElementById("studioBadgeAttendeesCount");
  const badgeFac = document.getElementById("studioBadgeFacilitatorsCount");
  const sidebarPoolLabel = document.getElementById("sidebarPoolLabel");

  if (badgeAtt) badgeAtt.textContent = (appState.eligibleAttendees || []).length;
  if (badgeFac) badgeFac.textContent = (appState.eligibleFacilitators || []).length;

  const isFac = appState.certRecipientPool === 'facilitators';
  if (sidebarPoolLabel) sidebarPoolLabel.textContent = isFac ? 'Facilitators' : 'Attendees';

  const recipients = getActiveCertRecipients();
  const count = recipients.length;
  if (currentSpan) currentSpan.textContent = count > 0 ? appState.currentCertIndex + 1 : 0;
  if (totalSpan) totalSpan.textContent = count;
  if (batchCount) batchCount.textContent = count;
  if (sidebarCount) sidebarCount.textContent = count;

  if (!select) return;

  if (count === 0) {
    const poolLabel = isFac ? 'Facilitators' : 'Attendees';
    select.innerHTML = `<option value="">No Present ${poolLabel} Found</option>`;
    return;
  }

  select.innerHTML = recipients.map((att, idx) => {
    const subtitle = att.role_title ? att.role_title : (att.position || att.office || '-');
    return `<option value="${idx}" ${idx === appState.currentCertIndex ? 'selected' : ''}>${idx + 1}. ${escapeHtml(att.full_name)} (${escapeHtml(subtitle)})</option>`;
  }).join("");
}

function onSelectRecipientDropdown(val) {
  appState.currentCertIndex = parseInt(val, 10);
  const currentSpan = document.getElementById("studioRecipientCurrent");
  if (currentSpan) currentSpan.textContent = appState.currentCertIndex + 1;
  renderCertificateCanvas();
}

function prevCertificateRecipient() {
  const recipients = getActiveCertRecipients();
  if (recipients.length === 0) return;
  appState.currentCertIndex = (appState.currentCertIndex - 1 + recipients.length) % recipients.length;
  renderRecipientDropdown();
  renderCertificateCanvas();
}

function nextCertificateRecipient() {
  const recipients = getActiveCertRecipients();
  if (recipients.length === 0) return;
  appState.currentCertIndex = (appState.currentCertIndex + 1) % recipients.length;
  renderRecipientDropdown();
  renderCertificateCanvas();
}

function switchCertTemplate(templateName) {
  // Validate against recipient pool restrictions
  if (appState.certRecipientPool === 'attendees' && templateName === 'appreciation') {
    templateName = 'participation';
  } else if (appState.certRecipientPool === 'facilitators' && templateName === 'participation') {
    templateName = 'appreciation';
  }

  appState.currentTemplate = templateName;
  updateStudioTemplateAvailability();
  renderCertificateCanvas();
}


function updateCertField(key, val) {
  appState.customCertFields[key] = val;
  renderCertificateCanvas();
}

// --- SIGNATURE SIZING & SCALING CONTROLLER ---
function getSigImgHtml(sigNum, sigObj, showImg) {
  const size = (sigNum === 1) 
    ? (appState.sigSizeIndependent ? (appState.sig1Size || appState.sigSize || 44) : (appState.sigSize || 44))
    : (appState.sigSizeIndependent ? (appState.sig2Size || appState.sigSize || 48) : (appState.sigSize || 44));
  const mb = -Math.round(size * 0.28) + (appState.sigYOffset || 0);

  if (!showImg || !sigObj || !sigObj.signature_image) {
    return `<div style="height: ${size}px;" class="transition-all"></div>`;
  }

  return `
    <div class="relative group/sig flex flex-col items-center justify-end" style="height: ${size}px;">
      <!-- On-canvas quick resize controls (hidden during print) -->
      <div class="no-print absolute -top-4 opacity-0 group-hover/sig:opacity-100 transition-all duration-150 bg-slate-950/90 text-white rounded-md px-1.5 py-0.5 text-[9px] font-mono flex items-center gap-1 shadow-lg z-30 border border-slate-700 pointer-events-auto">
        <button type="button" onclick="adjustSigSize(${sigNum}, -4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer transition" title="Decrease signature size (4px)">-</button>
        <span class="text-move-gold-400 font-semibold">${size}px</span>
        <button type="button" onclick="adjustSigSize(${sigNum}, 4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer transition" title="Increase signature size (4px)">+</button>
      </div>
      <img src="/${sigObj.signature_image}" 
           alt="${escapeHtml(sigObj.name)} E-Signature" 
           class="object-contain pointer-events-none transition-all duration-100" 
           style="height: ${size}px; max-height: 110px; margin-bottom: ${mb}px; z-index: 10;">
    </div>
  `;
}

function onSigSizeChange(val) {
  const size = parseInt(val, 10);
  appState.sigSize = size;
  if (!appState.sigSizeIndependent) {
    appState.sig1Size = size;
    appState.sig2Size = size;
  }
  saveSigPreferences();
  updateSigSizeUI();
  renderCertificateCanvas();
}

function onSig1SizeChange(val) {
  appState.sig1Size = parseInt(val, 10);
  saveSigPreferences();
  updateSigSizeUI();
  renderCertificateCanvas();
}

function onSig2SizeChange(val) {
  appState.sig2Size = parseInt(val, 10);
  saveSigPreferences();
  updateSigSizeUI();
  renderCertificateCanvas();
}

function setSigPreset(size) {
  appState.sigSize = size;
  appState.sig1Size = size;
  appState.sig2Size = size;
  saveSigPreferences();
  updateSigSizeUI();
  renderCertificateCanvas();
}

function toggleSigSizeIndependent(checked) {
  appState.sigSizeIndependent = checked;
  const indepBox = document.getElementById("sigIndependentSizeGroup");
  const linkedBox = document.getElementById("sigLinkedSizeGroup");
  if (indepBox) indepBox.classList.toggle("hidden", !checked);
  if (linkedBox) linkedBox.classList.toggle("hidden", checked);
  saveSigPreferences();
  updateSigSizeUI();
  renderCertificateCanvas();
}

function onSigYOffsetChange(val) {
  appState.sigYOffset = parseInt(val, 10);
  const lbl = document.getElementById("lblSigYOffset");
  if (lbl) lbl.textContent = `${appState.sigYOffset > 0 ? '+' : ''}${appState.sigYOffset}px`;
  saveSigPreferences();
  renderCertificateCanvas();
}

function nudgeSigYOffset(delta) {
  appState.sigYOffset = Math.max(-20, Math.min(20, (appState.sigYOffset || 0) + delta));
  const lbl = document.getElementById("lblSigYOffset");
  if (lbl) lbl.textContent = `${appState.sigYOffset > 0 ? '+' : ''}${appState.sigYOffset}px`;
  saveSigPreferences();
  renderCertificateCanvas();
}

function adjustSigSize(sigNum, delta) {
  if (sigNum === 1) {
    appState.sig1Size = Math.max(20, Math.min(110, (appState.sig1Size || appState.sigSize || 44) + delta));
    if (!appState.sigSizeIndependent) {
      appState.sigSize = appState.sig1Size;
      appState.sig2Size = appState.sig1Size;
    }
  } else if (sigNum === 2) {
    appState.sig2Size = Math.max(20, Math.min(110, (appState.sig2Size || appState.sigSize || 44) + delta));
    if (!appState.sigSizeIndependent) {
      appState.sigSize = appState.sig2Size;
      appState.sig1Size = appState.sig2Size;
    }
  } else {
    appState.sigSize = Math.max(20, Math.min(110, (appState.sigSize || 44) + delta));
    appState.sig1Size = appState.sigSize;
    appState.sig2Size = appState.sigSize;
  }
  saveSigPreferences();
  updateSigSizeUI();
  renderCertificateCanvas();
}

function updateSigSizeUI() {
  const s = appState.sigSize || 44;
  const s1 = appState.sig1Size || s;
  const s2 = appState.sig2Size || s;

  const lbl = document.getElementById("lblSigSize");
  if (lbl) lbl.textContent = `${s}px`;
  const slider = document.getElementById("certSigSizeSlider");
  if (slider) slider.value = s;

  const lbl1 = document.getElementById("lblSig1Size");
  if (lbl1) lbl1.textContent = `${s1}px`;
  const slider1 = document.getElementById("certSig1SizeSlider");
  if (slider1) slider1.value = s1;

  const lbl2 = document.getElementById("lblSig2Size");
  if (lbl2) lbl2.textContent = `${s2}px`;
  const slider2 = document.getElementById("certSig2SizeSlider");
  if (slider2) slider2.value = s2;

  const chkIndep = document.getElementById("certToggleSigIndependent");
  if (chkIndep) chkIndep.checked = Boolean(appState.sigSizeIndependent);
  const indepBox = document.getElementById("sigIndependentSizeGroup");
  const linkedBox = document.getElementById("sigLinkedSizeGroup");
  if (indepBox) indepBox.classList.toggle("hidden", !appState.sigSizeIndependent);
  if (linkedBox) linkedBox.classList.toggle("hidden", Boolean(appState.sigSizeIndependent));

  const lblY = document.getElementById("lblSigYOffset");
  if (lblY) lblY.textContent = `${appState.sigYOffset > 0 ? '+' : ''}${appState.sigYOffset || 0}px`;
}

function saveSigPreferences() {
  try {
    localStorage.setItem("move_cert_sig_prefs", JSON.stringify({
      sigSize: appState.sigSize,
      sig1Size: appState.sig1Size,
      sig2Size: appState.sig2Size,
      sigSizeIndependent: appState.sigSizeIndependent,
      sigYOffset: appState.sigYOffset
    }));
  } catch (e) {}
}

function initSigPreferences() {
  try {
    const raw = localStorage.getItem("move_cert_sig_prefs");
    if (raw) {
      const prefs = JSON.parse(raw);
      if (prefs.sigSize) appState.sigSize = prefs.sigSize;
      if (prefs.sig1Size) appState.sig1Size = prefs.sig1Size;
      if (prefs.sig2Size) appState.sig2Size = prefs.sig2Size;
      if (prefs.sigSizeIndependent !== undefined) appState.sigSizeIndependent = prefs.sigSizeIndependent;
      if (prefs.sigYOffset !== undefined) appState.sigYOffset = prefs.sigYOffset;
    }
  } catch (e) {}
  updateSigSizeUI();
}

function toggleSignatures(checked) {
  appState.showSignatures = checked;
  const grp = document.getElementById("sigSizeControlsWrapper");
  if (grp) grp.classList.toggle("opacity-40", !checked);
  renderCertificateCanvas();
}


function toggleLogos(checked) {
  appState.showLogos = checked;
  renderCertificateCanvas();
}

function toggleWatermark(checked) {
  appState.showWatermark = checked;
  const grp = document.getElementById("watermarkSettingsGroup");
  if (grp) grp.classList.toggle("opacity-40", !checked);
  renderCertificateCanvas();
}

function onWatermarkLogoSelect(logoUrl) {
  appState.watermarkLogo = logoUrl;
  renderCertificateCanvas();
}

function onWatermarkOpacityChange(val) {
  appState.watermarkOpacity = parseInt(val, 10);
  const lbl = document.getElementById("lblWatermarkOpacity");
  if (lbl) lbl.textContent = `${appState.watermarkOpacity}%`;
  renderCertificateCanvas();
}

function onCaSignatoryChoiceChange(val) {
  appState.caSignatoryChoice = val;
  renderCertificateCanvas();
}

function onSigDisplayModeChange(val) {
  appState.sigDisplayMode = val;
  renderCertificateCanvas();
}

// -------------------------------------------------------------
// CERTIFICATE CANVAS RENDERING (1 UNIFIED ENGINE, 3 TEMPLATES)
// -------------------------------------------------------------
function renderCertificateCanvas() {
  const canvas = document.getElementById("certStageCanvas");
  if (!canvas) return;

  const recipients = getActiveCertRecipients();

  if (recipients.length === 0) {
    const poolLabel = appState.certRecipientPool === 'facilitators' ? 'Facilitators' : 'Attendees';
    canvas.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-amber-500 mb-3"></i>
        <h3 class="text-base font-bold text-slate-700">No Eligible ${poolLabel} to Issue Certificates</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm">
          Certificates are strictly gated! Only persons marked as <strong>Present</strong> in the Checklist can be issued certificates.
        </p>
        <button onclick="switchView('attendance')" class="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
          Go to Attendance / Facilitators Checklist
        </button>
      </div>
    `;
    return;
  }

  if (appState.currentCertIndex >= recipients.length) {
    appState.currentCertIndex = Math.max(0, recipients.length - 1);
  }

  const attendee = recipients[appState.currentCertIndex] || recipients[0];
  const act = appState.customCertFields;
  const sig1 = appState.signatories.find(s => s.id === appState.sig1Id) || { name: "MARIO D. GANGA JR.", title: "MOVE Chapter President", signature_image: "GANGA.png" };
  const sig2 = appState.signatories.find(s => s.id === appState.sig2Id) || { name: "HON. BENJAMIN B. MAGALONG", title: "City Mayor & Honorary Chapter Adviser", signature_image: "signature (15).png" };

  const showSig1Img = appState.showSignatures && 
                      (appState.sigDisplayMode === 'both' || appState.sigDisplayMode === 'sig1_only') && 
                      Boolean(sig1.signature_image);

  const showSig2Img = appState.showSignatures && 
                      (appState.sigDisplayMode === 'both' || appState.sigDisplayMode === 'sig2_only') && 
                      Boolean(sig2.signature_image);

  const watermarkHtml = appState.showWatermark ? `
    <div class="cert-watermark-overlay absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
      <img src="${escapeHtml(appState.watermarkLogo || '/MOVE BAGUIO LOGO.png')}" 
           alt="Watermark" 
           class="object-contain pointer-events-none select-none max-w-[52%] max-h-[68%]"
           style="width: ${appState.watermarkSize || 320}px; height: ${appState.watermarkSize || 320}px; opacity: ${(appState.watermarkOpacity !== undefined ? appState.watermarkOpacity : 12) / 100}; filter: grayscale(10%);">
    </div>
  ` : '';

  // ==========================================
  // TEMPLATE 1: PARTICIPATION (A4 LANDSCAPE)
  // ==========================================
  if (appState.currentTemplate === 'participation') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col justify-between border-[12px] border-double border-[#d97706] transition-all";
    
    canvas.innerHTML = `
      ${watermarkHtml}

      <!-- Certificate Header -->
      <div class="text-center relative z-10">
        ${appState.showLogos ? `
          <div class="absolute left-0 top-0 flex items-center">
            <img src="/CITY HALL LOGO.png" class="w-14 h-14 object-contain">
          </div>
          <div class="absolute right-0 top-0 flex items-center">
            <img src="/MOVE BAGUIO LOGO.png" class="w-14 h-14 object-contain">
          </div>
        ` : ''}

        <p class="text-[10px] tracking-widest uppercase font-bold text-slate-500">Republic of the Philippines &bull; City Government of Baguio</p>
        <h4 class="text-[11px] font-extrabold uppercase text-slate-800 tracking-wider">Men Opposed to Violence Against Women Everywhere (MOVE)</h4>
        <p class="text-[9px] text-slate-500 font-semibold uppercase">City Hall Chapter &bull; Baguio City, Philippines</p>
        
        <h2 class="font-cinzel text-2xl sm:text-3xl font-black text-[#0f1f3d] tracking-wider mt-3">
          CERTIFICATE OF PARTICIPATION
        </h2>
        <p class="text-[11px] italic font-serif text-slate-600 mt-0.5">This certification is proudly presented to</p>
      </div>

      <!-- Recipient Block -->
      <div class="text-center my-auto py-2 relative z-10">
        <h3 contenteditable="true" class="cert-editable font-cinzel text-xl sm:text-2xl font-black text-[#d97706] tracking-wide inline-block border-b-2 border-slate-300 pb-1 px-4 uppercase">
          ${escapeHtml(attendee.full_name)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mt-1">
          ${escapeHtml(attendee.position || '')} &bull; <strong class="text-slate-800">${escapeHtml(attendee.office || '')}</strong>
        </p>

        <p class="text-[11px] sm:text-xs text-slate-700 max-w-xl mx-auto mt-3 leading-relaxed">
          for active participation and completion of the capacity-building seminar entitled
          <strong class="text-slate-900 block font-bold text-xs sm:text-sm mt-0.5">“${escapeHtml(act.title)}: ${escapeHtml(act.theme)}”</strong>
          held on ${escapeHtml(act.date)} at ${escapeHtml(act.venue)}.
        </p>
      </div>

      <!-- Signatories Footer -->
      <div class="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center relative z-10">
        <!-- Signatory 1 -->
        <div class="flex flex-col items-center">
          ${getSigImgHtml(1, sig1, showSig1Img)}
          <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
          <p contenteditable="true" class="cert-editable text-[10px] text-slate-500 font-semibold">${escapeHtml(sig1.title)}</p>
        </div>

        <!-- Signatory 2 -->
        <div class="flex flex-col items-center">
          ${getSigImgHtml(2, sig2, showSig2Img)}
          <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig2.name)}</h5>
          <p contenteditable="true" class="cert-editable text-[10px] text-slate-500 font-semibold">${escapeHtml(sig2.title)}</p>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TEMPLATE 2: APPEARANCE / CA (DTR SLIP)
  // ==========================================
  else if (appState.currentTemplate === 'appearance') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-12 flex flex-col justify-between border-4 border-slate-300 transition-all";
    
    // Determine Signatory layout for Certificate of Appearance
    let caSignatoryBlock = '';
    const choice = appState.caSignatoryChoice || 'sig2_right';

    if (choice === 'sig1_right' || choice === 'sig1') {
      caSignatoryBlock = `
        <div class="flex items-end justify-between pt-4 border-t border-slate-300 text-xs relative z-10">
          <div>
            <p class="text-[9px] text-slate-500">Issued this ${escapeHtml(act.date)}</p>
            <p class="text-[9px] text-slate-400 font-mono">Control Ref: /drmo/ctb</p>
          </div>
          <div class="text-center flex flex-col items-center">
            ${getSigImgHtml(1, sig1, showSig1Img)}
            <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
            <p contenteditable="true" class="cert-editable text-[10px] text-slate-600 font-medium">${escapeHtml(sig1.title || 'MOVE Chapter President')}</p>
          </div>
        </div>
      `;
    } else if (choice === 'both') {
      caSignatoryBlock = `
        <div class="pt-4 border-t border-slate-300 relative z-10">
          <div class="flex items-center justify-between text-[9px] text-slate-500 mb-2">
            <span>Issued this ${escapeHtml(act.date)}</span>
            <span class="font-mono text-slate-400">Control Ref: /drmo/ctb</span>
          </div>
          <div class="grid grid-cols-2 gap-8 text-center text-xs">
            <div class="flex flex-col items-center">
              ${getSigImgHtml(1, sig1, showSig1Img)}
              <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
              <p contenteditable="true" class="cert-editable text-[10px] text-slate-600 font-medium">${escapeHtml(sig1.title || 'MOVE Chapter President')}</p>
            </div>
            <div class="flex flex-col items-center">
              ${getSigImgHtml(2, sig2, showSig2Img)}
              <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig2.name)}</h5>
              <p contenteditable="true" class="cert-editable text-[10px] text-slate-600 font-medium">City Mayor &bull; LCAT-VAWC Chairperson</p>
            </div>
          </div>
        </div>
      `;
    } else if (choice === 'sig2_center') {
      caSignatoryBlock = `
        <div class="flex flex-col items-center pt-4 border-t border-slate-300 text-xs relative z-10">
          <div class="w-full flex justify-between text-[9px] text-slate-500 mb-2">
            <span>Issued this ${escapeHtml(act.date)}</span>
            <span class="font-mono text-slate-400">Control Ref: /drmo/ctb</span>
          </div>
          <div class="text-center flex flex-col items-center">
            ${getSigImgHtml(2, sig2, showSig2Img)}
            <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig2.name)}</h5>
            <p contenteditable="true" class="cert-editable text-[10px] text-slate-600 font-medium">City Mayor &bull; LCAT-VAWC Chairperson</p>
          </div>
        </div>
      `;
    } else if (choice === 'sig1_center') {
      caSignatoryBlock = `
        <div class="flex flex-col items-center pt-4 border-t border-slate-300 text-xs relative z-10">
          <div class="w-full flex justify-between text-[9px] text-slate-500 mb-2">
            <span>Issued this ${escapeHtml(act.date)}</span>
            <span class="font-mono text-slate-400">Control Ref: /drmo/ctb</span>
          </div>
          <div class="text-center flex flex-col items-center">
            ${getSigImgHtml(1, sig1, showSig1Img)}
            <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
            <p contenteditable="true" class="cert-editable text-[10px] text-slate-600 font-medium">${escapeHtml(sig1.title || 'MOVE Chapter President')}</p>
          </div>
        </div>
      `;
    } else {
      // Default: sig2_right (Mayor Magalong at bottom-right)
      caSignatoryBlock = `
        <div class="flex items-end justify-between pt-4 border-t border-slate-300 text-xs relative z-10">
          <div>
            <p class="text-[9px] text-slate-500">Issued this ${escapeHtml(act.date)}</p>
            <p class="text-[9px] text-slate-400 font-mono">Control Ref: /drmo/ctb</p>
          </div>
          <div class="text-center flex flex-col items-center">
            ${getSigImgHtml(2, sig2, showSig2Img)}
            <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig2.name)}</h5>
            <p contenteditable="true" class="cert-editable text-[10px] text-slate-600 font-medium">City Mayor &bull; LCAT-VAWC Chairperson</p>
          </div>
        </div>
      `;
    }

    canvas.innerHTML = `
      ${watermarkHtml}

      <!-- CA Header -->
      <div class="relative z-10 text-center border-b pb-4">
        ${appState.showLogos ? `
          <div class="absolute left-0 top-0">
            <img src="/CITY HALL LOGO.png" class="w-12 h-12 object-contain">
          </div>
          <div class="absolute right-0 top-0">
            <img src="/MOVE BAGUIO LOGO.png" class="w-12 h-12 object-contain">
          </div>
        ` : ''}

        <p class="text-[9px] uppercase tracking-widest text-slate-500">Republic of the Philippines</p>
        <h4 class="text-xs font-bold uppercase text-slate-800">City Government of Baguio</h4>
        <p class="text-[10px] font-semibold text-slate-600">Local Committee on Anti-VAWC / MOVE Chapter</p>
        
        <h2 class="font-sans text-xl sm:text-2xl font-black text-slate-950 tracking-wider mt-2 uppercase">
          CERTIFICATE OF APPEARANCE
        </h2>
      </div>

      <!-- Formal Body -->
      <div class="my-auto py-3 space-y-3 text-xs leading-relaxed text-justify text-slate-800 relative z-10">
        <p>
          This is to certify that <strong class="uppercase font-bold text-slate-950 text-sm">${escapeHtml(attendee.full_name)}</strong>, holding the position / assignment of 
          <strong>${escapeHtml(attendee.role_title || attendee.position || 'Employee / Participant')}</strong> under the <strong>${escapeHtml(attendee.office || 'City Government of Baguio')}</strong>, 
          was duly verified to have ${appState.certRecipientPool === 'facilitators' ? 'rendered invaluable service as Resource Speaker / Facilitator in' : 'attended and actively participated in'} the activity entitled:
        </p>

        <p class="text-center font-bold text-sm text-slate-950 py-1 bg-slate-50 border border-slate-200 rounded">
          “${escapeHtml(act.title)}: ${escapeHtml(act.theme)}”
        </p>

        <p>
          held on <strong>${escapeHtml(act.date)}</strong> at the <strong>${escapeHtml(act.venue)}</strong>.
        </p>

        <p class="text-[11px] text-slate-600 italic">
          This certification is issued upon the request of the above-named individual for official appearance accreditation and Daily Time Record (DTR) compliance.
        </p>
      </div>

      <!-- Accrediting Signatory -->
      ${caSignatoryBlock}
    `;
  }

  // ==========================================
  // TEMPLATE 3: APPRECIATION (VIP HONORS)
  // ==========================================
  else if (appState.currentTemplate === 'appreciation') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col justify-between border-[14px] border-double border-[#0f1f3d] transition-all";

    canvas.innerHTML = `
      ${watermarkHtml}

      <!-- Certificate Header -->
      <div class="text-center relative z-10">
        ${appState.showLogos ? `
          <div class="absolute left-0 top-0 flex items-center">
            <img src="/CITY HALL LOGO.png" class="w-14 h-14 object-contain">
          </div>
          <div class="absolute right-0 top-0 flex items-center">
            <img src="/MOVE BAGUIO LOGO.png" class="w-14 h-14 object-contain">
          </div>
        ` : ''}

        <p class="text-[9px] tracking-widest uppercase font-bold text-slate-500">Republic of the Philippines &bull; City Government of Baguio</p>
        <h4 class="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider">Men Opposed to Violence Against Women Everywhere (MOVE)</h4>
        
        <h2 class="font-cinzel text-2xl sm:text-3xl font-black text-[#d97706] tracking-wider mt-3">
          CERTIFICATE OF APPRECIATION
        </h2>
        <p class="text-[11px] italic font-serif text-slate-600 mt-0.5">is proudly and warmly presented to</p>
      </div>

      <!-- Recipient Block -->
      <div class="text-center my-auto py-2 relative z-10">
        <h3 contenteditable="true" class="cert-editable font-cinzel text-xl sm:text-2xl font-black text-[#0f1f3d] tracking-wide inline-block border-b-2 border-[#d97706] pb-1 px-4 uppercase">
          ${escapeHtml(attendee.full_name)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mt-1">
          ${attendee.role_title ? `<strong class="text-amber-800 uppercase font-bold">${escapeHtml(attendee.role_title)}</strong> &bull; ` : (attendee.position ? `${escapeHtml(attendee.position)} &bull; ` : '')}<strong class="text-slate-800">${escapeHtml(attendee.office || 'City Government of Baguio')}</strong>
        </p>

        <p class="text-[11px] sm:text-xs text-slate-700 max-w-xl mx-auto mt-3 leading-relaxed">
          in grateful recognition and profound appreciation for invaluable expertise, exemplary leadership, and selfless service rendered as
          <strong class="text-slate-900 font-bold">${escapeHtml(attendee.role_title || attendee.position || 'Resource Speaker / Lead Facilitator')}</strong>
          during the capacity-building program entitled
          <strong class="text-slate-900 block font-bold text-xs sm:text-sm mt-0.5">“${escapeHtml(act.title)}”</strong>
          held on ${escapeHtml(act.date)} at ${escapeHtml(act.venue)}.
        </p>
      </div>

      <!-- Dual Signatories Footer -->
      <div class="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center relative z-10">
        <div class="flex flex-col items-center">
          ${getSigImgHtml(1, sig1, showSig1Img)}
          <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
          <p contenteditable="true" class="cert-editable text-[10px] text-slate-500 font-semibold">${escapeHtml(sig1.title)}</p>
        </div>

        <div class="flex flex-col items-center">
          ${getSigImgHtml(2, sig2, showSig2Img)}
          <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig2.name)}</h5>
          <p contenteditable="true" class="cert-editable text-[10px] text-slate-500 font-semibold">${escapeHtml(sig2.title)}</p>
        </div>
      </div>
    `;
  }
}

// ==========================================================================
// 6. PRINTING CONTROLLER (HIGH-RESOLUTION A4 LANDSCAPE)
// ==========================================================================

function printSingleCertificate() {
  const canvas = document.getElementById("certStageCanvas");
  const printBox = document.getElementById("printContainer");
  if (!canvas || !printBox) return;

  printBox.innerHTML = `
    <div class="print-page">
      ${canvas.innerHTML}
    </div>
  `;
  window.print();
}

function batchPrintAllCertificates() {
  const printBox = document.getElementById("printContainer");
  const recipients = getActiveCertRecipients();
  if (!printBox || recipients.length === 0) {
    const poolLabel = appState.certRecipientPool === 'facilitators' ? 'facilitators' : 'attendees';
    alert(`No present ${poolLabel} available to print.`);
    return;
  }

  // Backup current recipient index
  const savedIndex = appState.currentCertIndex;

  let pagesHtml = "";
  for (let i = 0; i < recipients.length; i++) {
    appState.currentCertIndex = i;
    renderCertificateCanvas();
    const canvas = document.getElementById("certStageCanvas");
    pagesHtml += `
      <div class="print-page">
        ${canvas.innerHTML}
      </div>
    `;
  }

  printBox.innerHTML = pagesHtml;

  // Restore active preview
  appState.currentCertIndex = savedIndex;
  renderCertificateCanvas();

  window.print();
}

// ==========================================================================
// 7. SIGNATORIES & UTILITIES
// ==========================================================================

async function loadSignatories() {
  try {
    const res = await fetch(`${API_BASE}/api/signatories`);
    const data = await res.json();
    if (data.success) {
      appState.signatories = data.signatories;
      populateSignatorySelects();
    }
  } catch (err) {
    console.error("Signatories error:", err);
  }
}

function populateSignatorySelects() {
  const sel1 = document.getElementById("certSigSelect1");
  const sel2 = document.getElementById("certSigSelect2");
  if (!sel1 || !sel2) return;

  const options = appState.signatories.map(s => {
    return `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.title)})</option>`;
  }).join("");

  sel1.innerHTML = options;
  sel2.innerHTML = options;

  sel1.value = appState.sig1Id;
  sel2.value = appState.sig2Id;

  // Initialize Certificate of Appearance signatory & display controls
  const caChoiceSel = document.getElementById("caSignatoryChoice");
  if (caChoiceSel) caChoiceSel.value = appState.caSignatoryChoice || "sig2_right";

  const sigDispSel = document.getElementById("certSigDisplayMode");
  if (sigDispSel) sigDispSel.value = appState.sigDisplayMode || "both";

  const wmToggle = document.getElementById("certToggleWatermark");
  if (wmToggle) wmToggle.checked = !!appState.showWatermark;

  const wmLogoSel = document.getElementById("certWatermarkLogoSelect");
  if (wmLogoSel && appState.watermarkLogo) wmLogoSel.value = appState.watermarkLogo;

  const wmOpacityInput = document.getElementById("certWatermarkOpacity");
  if (wmOpacityInput && appState.watermarkOpacity) wmOpacityInput.value = appState.watermarkOpacity;

  const lblWmOpacity = document.getElementById("lblWatermarkOpacity");
  if (lblWmOpacity && appState.watermarkOpacity) lblWmOpacity.textContent = `${appState.watermarkOpacity}%`;
}

function onSigSelect(slot, id) {
  if (slot === 1) appState.sig1Id = parseInt(id, 10);
  if (slot === 2) appState.sig2Id = parseInt(id, 10);
  renderCertificateCanvas();
}

// ==========================================================================
// QUICK PICK ROSTER & SEARCH INTEGRATION (ENROLL ATTENDEE MODAL)
// ==========================================================================

let quickPickPoolCache = [];
let quickPickDebounceTimer = null;

async function ensureFullRosterLoaded() {
  if (appState.fullRoster && appState.fullRoster.length > 0) return appState.fullRoster;
  try {
    const res = await fetch(`${API_BASE}/api/move-roster?status=all`);
    const data = await res.json();
    if (data.success && data.roster) {
      appState.fullRoster = data.roster;
      return appState.fullRoster;
    }
  } catch (e) {
    console.warn("Failed to load full roster:", e);
  }
  return appState.roster || [];
}

async function initQuickPickModal() {
  const searchInput = document.getElementById("quickRosterSearch");
  const clearBtn = document.getElementById("btnClearQuickRosterSearch");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");

  // Reset duplicate warning and state
  checkDuplicateAttendeeInput("");

  await ensureFullRosterLoaded();
  renderQuickPickOptions("", []);

  setTimeout(() => {
    if (searchInput) searchInput.focus();
  }, 100);
}

function renderQuickPickOptions(query, poolMatches = []) {
  const select = document.getElementById("quickPickMoveRoster");
  const countEl = document.getElementById("quickRosterMatchCount");
  if (!select) return;

  const roster = appState.fullRoster && appState.fullRoster.length > 0 ? appState.fullRoster : appState.roster;
  const q = (query || "").trim().toLowerCase();
  const enrolledNames = new Set((appState.attendees || []).map(a => (a.full_name || '').trim().toUpperCase()));

  let filteredRoster = roster;
  if (q) {
    filteredRoster = roster.filter(r => 
      (r.full_name && r.full_name.toLowerCase().includes(q)) ||
      (r.office && r.office.toLowerCase().includes(q)) ||
      (r.position && r.position.toLowerCase().includes(q))
    );
  }

  const totalMatches = filteredRoster.length + poolMatches.length;

  if (countEl) {
    if (!q) {
      countEl.textContent = `${roster.length} personnel`;
    } else {
      countEl.textContent = `${totalMatches} found`;
    }
  }

  let html = '';
  if (!q) {
    html += `<option value="">-- Choose from MOVE Roster (${roster.length}) or Search Above --</option>`;
    html += filteredRoster.map(r => {
      const isEnrolled = enrolledNames.has((r.full_name || '').trim().toUpperCase());
      const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] ${escapeHtml(r.full_name)} (${escapeHtml(r.office || '-')})` : `${escapeHtml(r.full_name)} (${escapeHtml(r.office || '-')})`;
      return `<option value="${r.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
    }).join("");
  } else {
    if (totalMatches === 0) {
      html += `<option value="">-- No matching personnel found in MOVE Roster or Pool --</option>`;
    } else {
      html += `<option value="">-- Found ${totalMatches} matching result(s) (Select below) --</option>`;
      if (filteredRoster.length > 0) {
        html += `<optgroup label="MOVE Chapter Roster (${filteredRoster.length})">`;
        html += filteredRoster.map(r => {
          const isEnrolled = enrolledNames.has((r.full_name || '').trim().toUpperCase());
          const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] ${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')} (${escapeHtml(r.office || '-')})` : `${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')} (${escapeHtml(r.office || '-')})`;
          return `<option value="${r.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
        }).join("");
        html += `</optgroup>`;
      }
      if (poolMatches.length > 0) {
        html += `<optgroup label="City Municipal Employee Pool (${poolMatches.length})">`;
        html += poolMatches.map(p => {
          const isEnrolled = enrolledNames.has((p.full_name || '').trim().toUpperCase());
          const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] [City Pool] ${escapeHtml(p.full_name)} &bull; ${escapeHtml(p.position || '-')} (${escapeHtml(p.office || '-')})` : `[City Pool] ${escapeHtml(p.full_name)} &bull; ${escapeHtml(p.position || '-')} (${escapeHtml(p.office || '-')})`;
          return `<option value="pool_${p.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
        }).join("");
        html += `</optgroup>`;
      }
    }
  }

  select.innerHTML = html;

  // If search resulted in 1 exact MOVE match, automatically select it and populate form
  if (q && filteredRoster.length === 1 && poolMatches.length === 0) {
    select.value = String(filteredRoster[0].id);
    onQuickPickMoveAttendee(select.value, false);
  }
}

function onFilterQuickPickRoster(val) {
  const q = (val || "").trim();
  const clearBtn = document.getElementById("btnClearQuickRosterSearch");
  if (clearBtn) {
    clearBtn.classList.toggle("hidden", q.length === 0);
  }

  // Instant in-memory filter on MOVE roster
  renderQuickPickOptions(q, []);

  // If query is 2+ chars, also search City Municipal Employee Pool (748 pool)
  clearTimeout(quickPickDebounceTimer);
  if (q.length >= 2) {
    quickPickDebounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search-pool?q=${encodeURIComponent(q)}&limit=15`);
        const data = await res.json();
        if (data.success && data.employees) {
          quickPickPoolCache = data.employees;
          const currentVal = document.getElementById("quickRosterSearch")?.value || "";
          if (currentVal.trim().toLowerCase() === q.toLowerCase()) {
            renderQuickPickOptions(q, data.employees);
          }
        }
      } catch (err) {
        console.warn("Pool search in quick pick failed:", err);
      }
    }, 200);
  }
}

function onQuickRosterSearchKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const select = document.getElementById("quickPickMoveRoster");
    if (!select) return;
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (opt.value) {
        select.value = opt.value;
        onQuickPickMoveAttendee(opt.value, true);
        break;
      }
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const select = document.getElementById("quickPickMoveRoster");
    if (select) select.focus();
  }
}

function clearQuickRosterSearch() {
  const searchInput = document.getElementById("quickRosterSearch");
  const clearBtn = document.getElementById("btnClearQuickRosterSearch");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  quickPickPoolCache = [];
  renderQuickPickOptions("", []);
  if (searchInput) searchInput.focus();
}

// Quick pick helper when adding an attendee
function onQuickPickMoveAttendee(val, shouldHighlight = true) {
  if (!val) return;

  let person = null;
  if (String(val).startsWith("pool_")) {
    const poolId = parseInt(String(val).replace("pool_", ""), 10);
    person = quickPickPoolCache.find(p => p.id === poolId);
  } else {
    const id = parseInt(val, 10);
    const roster = appState.fullRoster && appState.fullRoster.length > 0 ? appState.fullRoster : appState.roster;
    person = roster.find(r => r.id === id);
  }

  if (person) {
    const nameInput = document.getElementById("attNewName");
    const posInput = document.getElementById("attNewPosition");
    const offInput = document.getElementById("attNewOffice");
    const genSelect = document.getElementById("attNewGender");
    const civSelect = document.getElementById("attNewCivil");

    if (nameInput) nameInput.value = person.full_name || "";
    if (posInput) posInput.value = person.position || "";
    if (offInput) offInput.value = person.office || "";
    if (genSelect) genSelect.value = (person.gender === 'F') ? 'F' : 'M';
    if (civSelect) {
      civSelect.value = (person.civil_status && person.civil_status.toLowerCase() === 'single') ? 'Single' : 'Married';
    }

    // Immediately trigger live duplicate detection
    if (nameInput) {
      checkDuplicateAttendeeInput(nameInput.value);
    }

    if (shouldHighlight && nameInput) {
      nameInput.classList.add("ring-2", "ring-move-gold-400");
      setTimeout(() => nameInput.classList.remove("ring-2", "ring-move-gold-400"), 1200);
    }
  }
}

// Live duplicate detection for Add Attendee modal
function checkDuplicateAttendeeInput(nameVal) {
  const name = (nameVal || "").trim().toUpperCase();
  const warningEl = document.getElementById("attDuplicateWarning");
  const warningText = document.getElementById("attDuplicateWarningText");
  const submitBtn = document.getElementById("btnSubmitAddAttendee");
  const nameInput = document.getElementById("attNewName");

  if (!name) {
    if (warningEl) warningEl.classList.add("hidden");
    if (submitBtn) submitBtn.disabled = false;
    if (nameInput) {
      nameInput.classList.remove("border-rose-500", "focus:border-rose-500", "ring-2", "ring-rose-500/30");
      nameInput.classList.add("border-slate-700", "focus:border-move-gold-500");
    }
    return false;
  }

  const existing = (appState.attendees || []).find(
    a => (a.full_name || "").trim().toUpperCase() === name
  );

  if (existing) {
    if (warningEl) {
      warningEl.classList.remove("hidden");
      if (warningText) {
        const status = existing.is_present ? "Present (Checked In)" : "Absent";
        warningText.innerHTML = `<strong>${escapeHtml(existing.full_name)}</strong> is already in this activity's attendance checklist with status: <strong>${status}</strong>.<br>Duplicate enrollments are blocked to maintain attendance integrity.`;
      }
    }
    if (nameInput) {
      nameInput.classList.remove("border-slate-700", "focus:border-move-gold-500");
      nameInput.classList.add("border-rose-500", "focus:border-rose-500", "ring-2", "ring-rose-500/30");
    }
    if (submitBtn) submitBtn.disabled = true;
    return true;
  } else {
    if (warningEl) warningEl.classList.add("hidden");
    if (nameInput) {
      nameInput.classList.remove("border-rose-500", "focus:border-rose-500", "ring-2", "ring-rose-500/30");
      nameInput.classList.add("border-slate-700", "focus:border-move-gold-500");
    }
    if (submitBtn) submitBtn.disabled = false;
    return false;
  }
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');

  if (id === 'modalAddAttendee') {
    initQuickPickModal();
  }

  if (id === 'modalAddFacilitator') {
    initQuickPickFacilitatorModal();
  }

  if (id === 'modalSearchPool') {
    onSearchPool('');
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('hidden');
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
