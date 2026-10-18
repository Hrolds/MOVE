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
  rosterFilter: 'all',
  rosterSearch: '',

  // Activities State
  activities: [],
  currentActivity: null,

  // Attendance State
  attendees: [],

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
      if (v === viewName) {
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
            <span class="text-xs text-slate-400 font-mono">${escapeHtml(act.activity_date || '')}</span>
          </div>

          <h3 class="text-base font-black text-white hover:text-move-gold-400 transition cursor-pointer" onclick="openActivityAttendance(${act.id})">
            ${escapeHtml(act.title)}
          </h3>
          <p class="text-xs text-slate-400 mt-0.5 italic">"${escapeHtml(act.theme || '')}"</p>
          
          <div class="mt-3 text-xs text-slate-300 space-y-1">
            <div><i class="fa-solid fa-location-dot w-4 text-slate-500"></i> ${escapeHtml(act.venue || 'Baguio City')}</div>
            <div><i class="fa-solid fa-user-tie w-4 text-slate-500"></i> ${escapeHtml(act.trainer_name || 'Resource Speaker')}</div>
            ${act.target_notes ? `<div class="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg mt-2 border border-slate-800/80"><strong>Target:</strong> ${escapeHtml(act.target_notes)}</div>` : ''}
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <!-- Attendance Progress -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-400 font-semibold">Attendance:</span>
            <span class="font-bold text-emerald-400">${present} / ${total} Present (${rate}%)</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button onclick="openActivityAttendance(${act.id})" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition text-center flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-clipboard-user"></i> Attendance
            </button>
            <button onclick="launchStudioForSpecificActivity(${act.id})" class="px-3 py-2 rounded-xl bg-move-gold-500 hover:bg-move-gold-600 text-xs font-black text-slate-950 transition text-center flex items-center justify-center gap-1.5 shadow">
              <i class="fa-solid fa-certificate"></i> Certificates
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
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
  appState.currentActivityId = activityId;
  const act = appState.activities.find(a => a.id === activityId);
  if (act) {
    appState.currentActivity = act;
  }
  await loadAttendance(activityId);
  switchView('attendance');
}

async function loadAttendance(activityId) {
  const actId = activityId || appState.currentActivityId || 1;
  appState.currentActivityId = actId;
  try {
    const res = await fetch(`${API_BASE}/api/activities/${actId}/attendees`);
    const data = await res.json();
    if (data.success) {
      appState.attendees = data.attendees;
      
      const act = appState.activities.find(a => a.id === actId) || {
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
    }
  } catch (err) {
    console.error("Attendance load error:", err);
  }
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

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500">No attendees enrolled yet. Click "Enroll All MOVE Participants" or "Add Attendee".</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.attendees.map((att, idx) => {
    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${idx + 1}</td>
        <td class="py-3 px-4 font-bold text-white">${escapeHtml(att.full_name)}</td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(att.position || '-')}</td>
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
          <button onclick="removeAttendee(${att.id})" class="text-slate-500 hover:text-rose-400 p-1.5 transition" title="Remove Attendee">
            <i class="fa-regular fa-trash-can"></i>
          </button>
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
  const payload = {
    full_name: document.getElementById("attNewName").value.trim().toUpperCase(),
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
      loadAttendance(appState.currentActivityId);
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
// 5. THE UNIFIED CERTIFICATE STUDIO (GATED: ONLY PRESENT ATTENDEES)
// ==========================================================================

async function launchStudioForActivity() {
  switchView('studio');
}

async function launchStudioForSpecificActivity(activityId) {
  appState.currentActivityId = activityId;
  switchView('studio');
}

async function toggleCurrentRecipientAttendance() {
  if (appState.eligibleAttendees.length === 0) return;
  const att = appState.eligibleAttendees[appState.currentCertIndex];
  if (!att) return;

  const confirmChange = confirm(`Do you want to change attendance for ${att.full_name} to ABSENT?\n\nThis will immediately remove them from the certificate list.`);
  if (!confirmChange) return;

  try {
    const actId = appState.currentActivityId || att.activity_id || 1;
    const res = await fetch(`${API_BASE}/api/activities/${actId}/attendees/${att.id}/present`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_present: 0 })
    });
    const data = await res.json();
    if (data.success) {
      await loadEligibleCertificates(actId);
      loadAttendance(actId);
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
      if (appState.currentCertIndex >= appState.eligibleAttendees.length) {
        appState.currentCertIndex = Math.max(0, appState.eligibleAttendees.length - 1);
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

function renderRecipientDropdown() {
  const select = document.getElementById("studioRecipientSelect");
  const currentSpan = document.getElementById("studioRecipientCurrent");
  const totalSpan = document.getElementById("studioRecipientTotal");
  const batchCount = document.getElementById("batchPrintBtnCount");
  const sidebarCount = document.getElementById("sidebarPresentCount");

  const count = appState.eligibleAttendees.length;
  currentSpan.textContent = count > 0 ? appState.currentCertIndex + 1 : 0;
  totalSpan.textContent = count;
  batchCount.textContent = count;
  if (sidebarCount) sidebarCount.textContent = count;

  if (count === 0) {
    select.innerHTML = `<option value="">No Present Attendees Found</option>`;
    return;
  }

  select.innerHTML = appState.eligibleAttendees.map((att, idx) => {
    return `<option value="${idx}" ${idx === appState.currentCertIndex ? 'selected' : ''}>${idx + 1}. ${escapeHtml(att.full_name)} (${escapeHtml(att.office)})</option>`;
  }).join("");
}

function onSelectRecipientDropdown(val) {
  appState.currentCertIndex = parseInt(val, 10);
  document.getElementById("studioRecipientCurrent").textContent = appState.currentCertIndex + 1;
  renderCertificateCanvas();
}

function prevCertificateRecipient() {
  if (appState.eligibleAttendees.length === 0) return;
  appState.currentCertIndex = (appState.currentCertIndex - 1 + appState.eligibleAttendees.length) % appState.eligibleAttendees.length;
  renderRecipientDropdown();
  renderCertificateCanvas();
}

function nextCertificateRecipient() {
  if (appState.eligibleAttendees.length === 0) return;
  appState.currentCertIndex = (appState.currentCertIndex + 1) % appState.eligibleAttendees.length;
  renderRecipientDropdown();
  renderCertificateCanvas();
}

function switchCertTemplate(templateName) {
  appState.currentTemplate = templateName;
  const templates = ['participation', 'appearance', 'appreciation'];
  
  templates.forEach(t => {
    const tab = document.getElementById(`studioTab-${t}`);
    if (tab) {
      if (t === templateName) {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-black transition bg-move-gold-500 text-slate-950 shadow flex items-center gap-1.5";
      } else {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white flex items-center gap-1.5";
      }
    }
  });

  renderCertificateCanvas();
}

function updateCertField(key, val) {
  appState.customCertFields[key] = val;
  renderCertificateCanvas();
}

function toggleSignatures(checked) {
  appState.showSignatures = checked;
  renderCertificateCanvas();
}

function toggleLogos(checked) {
  appState.showLogos = checked;
  renderCertificateCanvas();
}

// -------------------------------------------------------------
// CERTIFICATE CANVAS RENDERING (1 UNIFIED ENGINE, 3 TEMPLATES)
// -------------------------------------------------------------
function renderCertificateCanvas() {
  const canvas = document.getElementById("certStageCanvas");
  if (!canvas) return;

  if (appState.eligibleAttendees.length === 0) {
    canvas.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-amber-500 mb-3"></i>
        <h3 class="text-base font-bold text-slate-700">No Eligible Attendees to Issue Certificates</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm">
          Certificates are strictly gated! Only participants marked as <strong>Present</strong> in the Attendance Checklist can be issued certificates.
        </p>
        <button onclick="switchView('attendance')" class="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">
          Go to Attendance Checklist
        </button>
      </div>
    `;
    return;
  }

  const attendee = appState.eligibleAttendees[appState.currentCertIndex];
  const act = appState.customCertFields;
  const sig1 = appState.signatories.find(s => s.id === appState.sig1Id) || { name: "MARIO D. GANGA JR.", title: "MOVE Chapter President", signature_image: "GANGA.png" };
  const sig2 = appState.signatories.find(s => s.id === appState.sig2Id) || { name: "HON. BENJAMIN B. MAGALONG", title: "City Mayor, Baguio City", signature_image: "signature (15).png" };

  // ==========================================
  // TEMPLATE 1: PARTICIPATION (A4 LANDSCAPE)
  // ==========================================
  if (appState.currentTemplate === 'participation') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col justify-between border-[12px] border-double border-[#d97706] transition-all";
    
    canvas.innerHTML = `
      <!-- Certificate Header -->
      <div class="text-center relative">
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
      <div class="text-center my-auto py-2">
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
      <div class="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center">
        <!-- Signatory 1 -->
        <div class="flex flex-col items-center">
          ${appState.showSignatures && sig1.signature_image ? `
            <img src="/${sig1.signature_image}" class="h-10 object-contain -mb-3 z-10 pointer-events-none">
          ` : '<div class="h-10"></div>'}
          <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
          <p contenteditable="true" class="cert-editable text-[10px] text-slate-500 font-semibold">${escapeHtml(sig1.title)}</p>
        </div>

        <!-- Signatory 2 -->
        <div class="flex flex-col items-center">
          ${appState.showSignatures && sig2.signature_image ? `
            <img src="/${sig2.signature_image}" class="h-10 object-contain -mb-3 z-10 pointer-events-none">
          ` : '<div class="h-10"></div>'}
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
    
    canvas.innerHTML = `
      <!-- CA Header -->
      <div class="relative text-center border-b pb-4">
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
      <div class="my-auto py-3 space-y-3 text-xs leading-relaxed text-justify text-slate-800">
        <p>
          This is to certify that <strong class="uppercase font-bold text-slate-950 text-sm">${escapeHtml(attendee.full_name)}</strong>, holding the position of 
          <strong>${escapeHtml(attendee.position || 'Employee')}</strong> under the <strong>${escapeHtml(attendee.office || 'City Government of Baguio')}</strong>, 
          was duly verified to have attended and participated in the activity entitled:
        </p>

        <p class="text-center font-bold text-sm text-slate-950 py-1 bg-slate-50 border border-slate-200 rounded">
          “${escapeHtml(act.title)}: ${escapeHtml(act.theme)}”
        </p>

        <p>
          held on <strong>${escapeHtml(act.date)}</strong> at the <strong>${escapeHtml(act.venue)}</strong>.
        </p>

        <p class="text-[11px] text-slate-600 italic">
          This certification is issued upon the request of the above-named individual for Daily Time Record (DTR) support and official appearance accreditation.
        </p>
      </div>

      <!-- Accrediting Signatory -->
      <div class="flex items-end justify-between pt-4 border-t border-slate-300 text-xs">
        <div>
          <p class="text-[9px] text-slate-500">Issued this ${escapeHtml(act.date)}</p>
          <p class="text-[9px] text-slate-400 font-mono">Control Ref: /drmo/ctb</p>
        </div>

        <div class="text-center flex flex-col items-center">
          ${appState.showSignatures && sig2.signature_image ? `
            <img src="/${sig2.signature_image}" class="h-10 object-contain -mb-3 z-10 pointer-events-none">
          ` : '<div class="h-10"></div>'}
          <h5 class="font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig2.name)}</h5>
          <p class="text-[10px] text-slate-600 font-medium">City Mayor &bull; LCAT-VAWC Chairperson</p>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TEMPLATE 3: APPRECIATION (VIP HONORS)
  // ==========================================
  else if (appState.currentTemplate === 'appreciation') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col justify-between border-[14px] border-double border-[#0f1f3d] transition-all";

    canvas.innerHTML = `
      <!-- Certificate Header -->
      <div class="text-center relative">
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
      <div class="text-center my-auto py-2">
        <h3 contenteditable="true" class="cert-editable font-cinzel text-xl sm:text-2xl font-black text-[#0f1f3d] tracking-wide inline-block border-b-2 border-[#d97706] pb-1 px-4 uppercase">
          ${escapeHtml(attendee.full_name)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mt-1">
          ${escapeHtml(attendee.position || '')} &bull; <strong class="text-slate-800">${escapeHtml(attendee.office || '')}</strong>
        </p>

        <p class="text-[11px] sm:text-xs text-slate-700 max-w-xl mx-auto mt-3 leading-relaxed">
          in grateful recognition of exemplary leadership, selfless commitment, and valuable service rendered in support of the capacity-building program entitled
          <strong class="text-slate-900 block font-bold text-xs sm:text-sm mt-0.5">“${escapeHtml(act.title)}”</strong>
          held on ${escapeHtml(act.date)} at ${escapeHtml(act.venue)}.
        </p>
      </div>

      <!-- Dual Signatories Footer -->
      <div class="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center">
        <div class="flex flex-col items-center">
          ${appState.showSignatures && sig1.signature_image ? `
            <img src="/${sig1.signature_image}" class="h-10 object-contain -mb-3 z-10 pointer-events-none">
          ` : '<div class="h-10"></div>'}
          <h5 contenteditable="true" class="cert-editable font-bold text-xs uppercase text-slate-900 border-t border-slate-800 pt-1 w-48">${escapeHtml(sig1.name)}</h5>
          <p contenteditable="true" class="cert-editable text-[10px] text-slate-500 font-semibold">${escapeHtml(sig1.title)}</p>
        </div>

        <div class="flex flex-col items-center">
          ${appState.showSignatures && sig2.signature_image ? `
            <img src="/${sig2.signature_image}" class="h-10 object-contain -mb-3 z-10 pointer-events-none">
          ` : '<div class="h-10"></div>'}
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
  if (!printBox || appState.eligibleAttendees.length === 0) {
    alert("No present attendees available to print.");
    return;
  }

  // Backup current recipient index
  const savedIndex = appState.currentCertIndex;

  let pagesHtml = "";
  for (let i = 0; i < appState.eligibleAttendees.length; i++) {
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
}

function onSigSelect(slot, id) {
  if (slot === 1) appState.sig1Id = parseInt(id, 10);
  if (slot === 2) appState.sig2Id = parseInt(id, 10);
  renderCertificateCanvas();
}

// Quick pick helper when adding an attendee
function onQuickPickMoveAttendee(val) {
  if (!val) return;
  const person = appState.roster.find(r => r.id === parseInt(val, 10));
  if (person) {
    document.getElementById("attNewName").value = person.full_name;
    document.getElementById("attNewPosition").value = person.position || "";
    document.getElementById("attNewOffice").value = person.office || "";
    document.getElementById("attNewGender").value = person.gender || "M";
    document.getElementById("attNewCivil").value = person.civil_status || "Married";
  }
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('hidden');

  if (id === 'modalAddAttendee') {
    const select = document.getElementById("quickPickMoveRoster");
    if (select) {
      select.innerHTML = '<option value="">-- Choose from MOVE Roster or Type Below --</option>' + 
        appState.roster.map(r => `<option value="${r.id}">${escapeHtml(r.full_name)} (${escapeHtml(r.office || '-')})</option>`).join("");
    }
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
