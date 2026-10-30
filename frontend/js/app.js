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
  rosterPage: 1,
  rosterPageSize: 10,

  // HRIS Comparison State
  hrisCompare: {
    loaded: false,
    metrics: {},
    data: [],
    activeTab: 'differences',
    search: '',
    selectedIds: new Set(),
    diffMapByMemberId: {}
  },

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
  watermarkYOffset: 0,
  recipientYOffset: 0,
  headerSpacing: 0,
  logoDistance: 0,
  certZoom: 100,
  isFocusMode: false,
  nameFontSize: 26,
  bodyFontSize: 12,
  titleFontSize: 28,
  headerFontSize: 10,
  certSettings: {
    header_line_1: 'Republic of the Philippines • City Government of Baguio',
    header_line_2: 'Men Opposed to Violence Against Women Everywhere (MOVE)',
    header_line_3: 'Baguio City, Philippines',
    participation_title: 'CERTIFICATE OF PARTICIPATION',
    participation_intro: 'is presented to',
    appreciation_title: 'CERTIFICATE OF APPRECIATION',
    appreciation_intro: 'is presented to',
    appearance_title: 'CERTIFICATE OF APPEARANCE',
    appearance_intro: 'This is to certify that',
    participation_citation: 'for {his/her} active participation and completion of the capacity-building seminar entitled',
    appearance_citation: 'was duly verified to have rendered invaluable service as Resource Speaker / Facilitator in',
    ca_template_formula: 'This is to certify that {title_prefix} {full_name}, {position} of {office}, was duly verified to have attended and participated in the activity entitled “{activity_title}: {activity_theme},” held on {activity_date}, at the {activity_venue}.',
    header_spacing: 0,
    logo_distance: 0
  },
  caSignatoryChoice: 'sig2_right',
  templateSigLayout: {
    participation: 'both',
    appreciation: 'both',
    appearance: 'sig2_right'
  },
  showSigName: true,
  showSigTitle: true,
  showSigOffice: false,
  showSigLine: true,
  customSig1: null,
  customSig2: null,
  caPrintMode: 'dual', // 'dual' (2x A5 Landscape Top & Bottom on A4) or 'single' (1x A5 Landscape on A4)
  caDualBehavior: 'pair', // 'pair' (Current + Next Person) or 'duplicate' (2 Copies of Same Person)
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
  
  // Initialize E-Signature preferences, Layout & Certificate Headers
  initSigPreferences();
  initLayoutPreferences();
  await loadCertificateSettings();

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
        tab.className = "nav-tab-active px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 bg-move-orange-500 text-white shadow";
      } else {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800";
      }
    }
  });

  if (viewName === 'roster') loadRoster();
  if (viewName === 'activities') loadActivities();
  if (viewName === 'attendance') loadAttendance(appState.currentActivityId);
  if (viewName === 'studio') {
    loadEligibleCertificates(appState.currentActivityId);
    setTimeout(() => {
      autoFitStudioCanvas();
    }, 120);
  }
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
      if (!appState.hrisCompare.loaded) {
        fetchHrisBackgroundAudit();
      }
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
      populateSignatorySelects();
      document.getElementById("count-all").textContent = all.length;
      document.getElementById("count-member").textContent = all.filter(r => r.is_member).length;
      document.getElementById("count-officer").textContent = all.filter(r => r.is_officer).length;
      document.getElementById("count-committee").textContent = all.filter(r => r.is_committee).length;
      document.getElementById("count-participant").textContent = all.filter(r => r.is_participant).length;
      const totalBadge = document.getElementById("navPanelTotalBadge");
      if (totalBadge) totalBadge.textContent = all.length;
    }
  } catch (err) {
    console.warn("Count update failed:", err);
  }
}

function filterRosterByStatus(status) {
  appState.rosterFilter = status;
  appState.rosterPage = 1;
  const statuses = [
    { key: 'all', label: 'Manage Personnel', icon: 'fa-users-gear' },
    { key: 'member', label: 'Members (Cadre)', icon: 'fa-shield-halved' },
    { key: 'officer', label: 'Officers', icon: 'fa-star' },
    { key: 'committee', label: 'Committees', icon: 'fa-diagram-project' },
    { key: 'participant', label: 'Participants', icon: 'fa-user-check' }
  ];

  statuses.forEach(s => {
    const btn = document.getElementById(`rosterFilter-${s.key}`);
    if (btn) {
      if (s.key === status) {
        btn.className = "w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border bg-move-orange-500 text-white shadow-md border-move-orange-400/50";
      } else {
        btn.className = "w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between border border-transparent text-slate-300 hover:text-white hover:bg-slate-800/80";
      }
    }
  });

  const activeObj = statuses.find(s => s.key === status) || statuses[0];
  const lblCat = document.getElementById("lblActiveNavCategory");
  if (lblCat) {
    lblCat.innerHTML = `<i class="fa-solid ${activeObj.icon} text-move-orange-400"></i> ${escapeHtml(activeObj.label)}`;
  }
  const lblCount = document.getElementById("lblActiveNavCount");
  if (lblCount) {
    lblCount.textContent = status === 'all' ? 'Full Directory & Status Manager — All updates made here' : `Directory of ${activeObj.label}`;
  }

  const thStatus = document.getElementById("thSelectiveStatus");
  if (thStatus) {
    thStatus.classList.toggle("hidden", status !== "all");
  }

  loadRoster();
}

function onRosterSearch(val) {
  appState.rosterSearch = val;
  appState.rosterPage = 1;
  loadRoster();
}

// ============================================================================
// Baguio City Office Code & Full Name Directory
// ============================================================================
const BAGUIO_OFFICE_MAP = {
  "ACCTG": "City Accounting Office",
  "BAC": "Procurement Support Services Unit",
  "BARANGAY": "Liga ng mga Barangay",
  "BUDGET": "City Budget Office",
  "CBO": "City Budget Office",
  "CADMO": "City Administrator's Office",
  "CASSO": "City Assessors Office",
  "CBAO": "City Buildings and Architecture Office",
  "CDRRMO": "City Disaster Risk Reduction Management Office",
  "CEO": "City Engineering Office",
  "CEPMO": "City Environment and Parks Management Office",
  "CHRMO": "City Human Resource Management Office",
  "CMO": "City Mayor's Office",
  "COA": "City Auditor's Office",
  "CTO": "City Treasury Office",
  "DEPED": "Department of Education",
  "GSO": "General Services Office",
  "HSO": "Health Services Office",
  "CHSO": "City Health Services Office",
  "LCR": "City Civil Registry",
  "LEGAL": "City Legal Office",
  "MAHARLIKA": "Maharlika Livelihood Center",
  "MTCC": "Municipal Trial Court in Cities",
  "OCSWDO": "City Social Welfare and Development Office",
  "CSWDO": "City Social Welfare and Development Office",
  "PLANNING": "City Planning, Development and Sustainability Office",
  "CPDSO": "City Planning, Development and Sustainability Office",
  "PROSEC": "City Prosecutor's Office",
  "RD": "Registry of Deeds",
  "RTC": "Regional Trial Court",
  "SP": "Sangguniang Panlungsod",
  "TOURISM": "Tourism, Culture and Arts Office",
  "VET": "City Veterinary and Agriculture Office",
  "CVAO": "City Veterinary and Agriculture Office"
};

function getOfficeDetails(str, hrisDiff = null) {
  if (!str && !hrisDiff?.hris_office_code) {
    return { code: "LGU", fullName: "City Government of Baguio" };
  }

  const raw = (str || "").trim();
  const rawUpper = raw.toUpperCase();
  let code = "";
  let baseName = raw.replace(/\s*\([^)]*\)\s*/g, "").trim();

  // If raw is directly an office code key (e.g. "CEPMO" or "CPDSO")
  if (BAGUIO_OFFICE_MAP[rawUpper]) {
    code = rawUpper;
  } else {
    // Check parenthesis first: e.g. "City Assessors Office (CASSO)"
    const m = raw.match(/\(([^)]+)\)/);
    if (m) code = m[1].trim().toUpperCase();
  }

  if (!code && hrisDiff && hrisDiff.hris_office_code) {
    code = hrisDiff.hris_office_code.trim().toUpperCase();
  }

  if (code && code.includes("-")) {
    const parent = code.split("-")[0];
    if (BAGUIO_OFFICE_MAP[parent]) code = parent;
  }
  if (code === "PLANNING") code = "CPDSO";
  if (code === "VET") code = "CVAO";
  if (code === "HSO") code = "CHSO";

  if (!code) {
    for (const [c, fn] of Object.entries(BAGUIO_OFFICE_MAP)) {
      if (baseName.toLowerCase().includes(fn.toLowerCase()) || fn.toLowerCase().includes(baseName.toLowerCase())) {
        code = (c === "PLANNING" ? "CPDSO" : (c === "VET" ? "CVAO" : (c === "HSO" ? "CHSO" : c)));
        break;
      }
    }
  }

  let fullName = BAGUIO_OFFICE_MAP[code] || baseName;
  if (code === "CPDSO" || code === "PLANNING" || baseName.toLowerCase().includes("planning")) {
    fullName = "City Planning, Development and Sustainability Office";
    code = "CPDSO";
  } else if (code === "CEPMO" || baseName.toLowerCase().includes("environment and parks")) {
    fullName = "City Environment and Parks Management Office";
    code = "CEPMO";
  }

  return { code: code || raw || "LGU", fullName: fullName || raw || "City Government of Baguio" };
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/[\s,]+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

function renderRosterTable() {
  const tbody = document.getElementById("rosterTableBody");
  if (!tbody) return;

  const items = appState.roster || [];
  const total = items.length;
  const colSpanCount = 6;

  // Update total count indicator
  const countLabel = document.getElementById("rosterTotalCountLabel");
  if (countLabel) {
    countLabel.textContent = `Showing all ${total} personnel`;
  }

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="${colSpanCount}" class="text-center py-12 text-slate-500">No personnel found matching the filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((r, idx) => {
    const globalIdx = idx + 1;
    const hrisDiff = appState.hrisCompare?.diffMapByMemberId?.[r.id];
    const hasHrisDiff = Boolean(hrisDiff && hrisDiff.is_outdated);
    const officeInfo = getOfficeDetails(r.office, hrisDiff);

    return `
      <tr onclick="openModalEditMember(${r.id})" class="hover:bg-slate-800/60 transition cursor-pointer group border-b border-slate-800/40">
        <td class="py-3 px-3 text-slate-500 font-mono text-[11px] text-center w-10">${globalIdx}</td>
        
        <!-- 1. Full Name (Clickable Row opens Member Profile) -->
        <td class="py-3 px-4 min-w-[220px]">
          <div class="flex items-center gap-2.5">
            <div class="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-700/80 bg-slate-950 flex items-center justify-center">
              <img src="/api/move-roster/${r.id}/photo" alt="${escapeHtml(r.full_name)}" loading="lazy" class="w-full h-full object-cover"
                onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';">
              <div class="w-full h-full ${r.gender === 'F' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'} items-center justify-center font-bold text-xs hidden">
                ${escapeHtml(getInitials(r.full_name))}
              </div>
            </div>
            <div class="min-w-0">
              <div class="font-bold text-white text-xs group-hover:text-move-orange-400 transition flex items-center gap-1.5">
                <span class="truncate">${escapeHtml(r.full_name)}</span>
                ${hasHrisDiff ? `
                  <button type="button" onclick="event.stopPropagation(); openHrisCompareModal(${r.id})" class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-md ${hrisDiff.is_inactive ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} hover:scale-105 transition" title="HRIS Diff: ${escapeHtml(hrisDiff.is_inactive ? hrisDiff.hris_status : 'Click to sync')}">
                    <i class="fa-solid fa-arrows-rotate text-[8px]"></i>
                    <span>${hrisDiff.is_inactive ? escapeHtml(hrisDiff.hris_status) : 'Diff'}</span>
                  </button>
                ` : ((!hasHrisDiff && hrisDiff?.is_matched) ? `
                  <span class="text-emerald-400 text-[10px]" title="In Sync with HRIS">
                    <i class="fa-solid fa-circle-check"></i>
                  </span>
                ` : '')}
              </div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                <i class="fa-solid fa-id-badge text-[9px] text-slate-500"></i>
                <span>ID: <strong class="text-slate-300">${r.hris_id ? '#' + r.hris_id : (hrisDiff?.hris_id ? '#' + hrisDiff.hris_id : 'Not Linked')}</strong></span>
              </div>
            </div>
          </div>
        </td>

        <!-- 2. Civil Status -->
        <td class="py-3 px-3 min-w-[120px]">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${r.civil_status === 'Single' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : (r.civil_status === 'Married' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700')}">
            ${escapeHtml(r.civil_status || 'Married')}
          </span>
        </td>

        <!-- 3. Move Position -->
        <td class="py-3 px-4 min-w-[180px]">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-move-orange-400 shrink-0"></span>
            <span class="font-semibold text-slate-200 text-xs">${escapeHtml(r.role_title || 'Member (Cadre)')}</span>
          </div>
        </td>

        <!-- 4. Office (use office code) -->
        <td class="py-3 px-3 min-w-[110px]">
          <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 text-amber-300 border border-amber-500/30 shadow-2xs group-hover:border-amber-400/60 transition inline-block text-center" title="${escapeHtml(officeInfo.fullName)}">
            ${escapeHtml(officeInfo.code)}
          </span>
        </td>

        <!-- 5. Actions -->
        <td class="py-3 px-3 text-right whitespace-nowrap w-28" onclick="event.stopPropagation()">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="event.stopPropagation(); openModalEditMember(${r.id})" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1 shadow-xs" title="View Profile">
              <i class="fa-solid fa-id-badge text-move-orange-400 text-xs"></i> View
            </button>
            <button onclick="event.stopPropagation(); openModalEditMember(${r.id})" class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition" title="Edit Profile Details">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button onclick="event.stopPropagation(); deleteRosterMember(${r.id})" class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 border border-slate-700/60 transition" title="Delete Person">
              <i class="fa-regular fa-trash-can text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderRosterPagination() {}
function changeRosterPage() {}

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
    showToast("Error updating status: : " + err, "error");
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
    showToast("Error saving member: : " + err, "error");
  }
}


// Backward compatibility alias: openPersonnelProfileModal opens the unified member profile modal
function openPersonnelProfileModal(id) {
  openModalEditMember(id);
}

// ============================================================================
// EDIT MEMBER PROFILE (STUDIO DESIGN CONTROLLER)
// ============================================================================
let currentEditMemberId = null;

function syncEditHeroName(val) {
  const nameEl = document.getElementById("editHeroName");
  const avatarEl = document.getElementById("editHeroAvatar");
  const fallbackEl = document.getElementById("editHeroAvatarFallback");
  const trimmed = (val || "").trim().toUpperCase();
  if (nameEl) nameEl.textContent = trimmed || "PERSONNEL NAME";
  const initials = getInitials(trimmed);
  if (avatarEl) avatarEl.textContent = initials;
  if (fallbackEl) fallbackEl.textContent = initials;
}

function syncEditToggleWithPills() {
  const isOfficer = document.getElementById("editToggleOfficer")?.checked;
  const isMember = document.getElementById("editToggleMember")?.checked;

  const btnActive = document.getElementById("btnEditPillActive");
  const btnOfficer = document.getElementById("btnEditPillOfficer");
  const statusText = document.getElementById("editHeroStatusText");

  if (btnActive) {
    if (isMember) {
      btnActive.className = "px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition shadow-2xs";
    } else {
      btnActive.className = "px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition";
    }
  }

  if (btnOfficer) {
    if (isOfficer) {
      btnOfficer.className = "px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 transition shadow-2xs";
    } else {
      btnOfficer.className = "px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition";
    }
  }

  if (statusText) {
    statusText.textContent = isOfficer ? "Executive Officer" : (isMember ? "Active Member" : "Participant");
  }
}

function toggleRoleStatusPill(type) {
  const chkMember = document.getElementById("editToggleMember");
  const chkOfficer = document.getElementById("editToggleOfficer");

  if (type === 'active' && chkMember) {
    chkMember.checked = !chkMember.checked;
  } else if (type === 'officer' && chkOfficer) {
    chkOfficer.checked = !chkOfficer.checked;
  }
  syncEditToggleWithPills();
}

async function syncCurrentEditWithHris() {
  const memberId = document.getElementById("editMemberId")?.value;
  if (!memberId) return;

  const btnSync = document.getElementById("btnEditSyncHris");
  const originalHtml = btnSync ? btnSync.innerHTML : "";
  if (btnSync) {
    btnSync.disabled = true;
    btnSync.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin text-teal-400"></i><span>Syncing...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/hris/sync-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: memberId,
        update_position: true,
        update_office: true
      })
    });
    const data = await res.json();
    if (data.success && data.member) {
      const updated = data.member;
      const posInput = document.getElementById("editMemberPosition");
      const offInput = document.getElementById("editMemberOffice");
      if (posInput) posInput.value = updated.position || "";
      if (offInput) offInput.value = updated.office || "";

      // Flash verification check animation
      const checkEl = document.getElementById("editPosVerifiedCheck");
      if (checkEl) {
        checkEl.className = "absolute right-2.5 top-2.5 text-emerald-400 text-xs animate-bounce";
        setTimeout(() => { if (checkEl) checkEl.className = "absolute right-2.5 top-2.5 text-emerald-400 text-xs"; }, 1500);
      }

      showToast(`HRIS sync complete for ${updated.full_name}! Position & Office updated.`, "success");
      await loadRoster();
      await updateRosterCounts();
    } else {
      showToast("Could not sync with HRIS: " + (data.message || "No match found"), "warning");
    }
  } catch (err) {
    showToast("HRIS Sync error: " + err, "error");
  } finally {
    if (btnSync) {
      btnSync.disabled = false;
      btnSync.innerHTML = originalHtml;
    }
  }
}

function openModalEditMember(id) {
  const member = (appState.roster || []).find(r => Number(r.id) === Number(id)) ||
                 (appState.fullRoster || []).find(r => Number(r.id) === Number(id));
  if (!member) {
    showToast("Member record not found.", "error");
    return;
  }
  currentEditMemberId = member.id;

  const hrisDiff = appState.hrisCompare?.diffMapByMemberId?.[member.id] ||
                   (appState.hrisCompare?.comparison || []).find(c => Number(c.id) === Number(member.id));

  // Populate hero card
  const heroName = document.getElementById("editHeroName");
  const heroAvatar = document.getElementById("editHeroAvatar");
  const heroFallback = document.getElementById("editHeroAvatarFallback");
  const heroPhoto = document.getElementById("editHeroPhoto");
  const heroIdBadge = document.getElementById("editHeroIdBadge");
  const heroHrisTag = document.getElementById("editHeroHrisTag");

  if (heroName) heroName.textContent = member.full_name || "PERSONNEL NAME";
  
  const initials = getInitials(member.full_name);
  if (heroAvatar) heroAvatar.textContent = initials;
  if (heroFallback) {
    heroFallback.textContent = initials;
    if (member.gender === 'F') {
      heroFallback.className = "w-full h-full bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-base";
    } else {
      heroFallback.className = "w-full h-full bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white font-black text-base";
    }
  }

  // Load portrait photo from SFTP endpoint with fallback
  if (heroPhoto) {
    heroPhoto.classList.add("hidden");
    if (heroFallback) heroFallback.classList.remove("hidden");
    heroPhoto.src = `/api/move-roster/${member.id}/photo?_t=${Date.now()}`;
  }

  const displayId = member.hris_id ? String(member.hris_id).padStart(3, '0') : String(member.id).padStart(3, '0');
  if (heroIdBadge) {
    heroIdBadge.textContent = `ID: #${displayId}`;
  }

  if (heroHrisTag) {
    if (member.hris_id) {
      heroHrisTag.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30";
      heroHrisTag.textContent = "HRIS Synced";
    } else {
      heroHrisTag.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700";
      heroHrisTag.textContent = "Manual Roster";
    }
  }

  // Populate form fields
  const idInput = document.getElementById("editMemberId");
  const nameInput = document.getElementById("editMemberName");
  const roleInput = document.getElementById("editMemberRole");
  const posInput = document.getElementById("editMemberPosition");
  const offInput = document.getElementById("editMemberOffice");
  const genInput = document.getElementById("editMemberGender");
  const civInput = document.getElementById("editMemberCivil");
  const conInput = document.getElementById("editMemberContact");
  const notesInput = document.getElementById("editMemberNotes");

  if (idInput) idInput.value = member.id;
  if (nameInput) nameInput.value = member.full_name || "";
  if (roleInput) roleInput.value = member.role_title || "Member (Cadre)";
  if (posInput) posInput.value = member.position || "";
  if (offInput) offInput.value = member.office || "";
  if (genInput) genInput.value = member.gender === 'F' ? 'F' : 'M';
  if (civInput) civInput.value = member.civil_status || "Married";
  if (conInput) conInput.value = member.contact_number || "";
  if (notesInput) notesInput.value = member.notes || "";

  // Switches
  const tOfficer = document.getElementById("editToggleOfficer");
  const tMember = document.getElementById("editToggleMember");
  const tCommittee = document.getElementById("editToggleCommittee");
  const tParticipant = document.getElementById("editToggleParticipant");

  if (tOfficer) tOfficer.checked = Boolean(member.is_officer);
  if (tMember) tMember.checked = Boolean(member.is_member);
  if (tCommittee) tCommittee.checked = Boolean(member.is_committee);
  if (tParticipant) tParticipant.checked = Boolean(member.is_participant);

  syncEditToggleWithPills();

  // Timeline
  const tlHris = document.getElementById("editTimelineHrisText");
  const tlSync = document.getElementById("editTimelineSyncText");
  if (tlHris) {
    tlHris.textContent = member.hris_id ? `ID #${member.hris_id} • ${member.hris_status || 'ACTIVE'}` : "Not linked to HRIS";
  }
  if (tlSync) {
    tlSync.textContent = (hrisDiff && !hrisDiff.is_outdated) ? "In Sync with HRIS Database" : (member.hris_id ? "Sync Available" : "Manual Record");
  }

  openModal("modalEditMember");

  setTimeout(() => {
    if (nameInput) {
      nameInput.focus();
    }
  }, 100);
}

async function submitEditMember(e) {
  e.preventDefault();
  const id = document.getElementById("editMemberId").value;
  const fullName = document.getElementById("editMemberName").value.trim().toUpperCase();
  const roleTitle = document.getElementById("editMemberRole").value.trim();
  const position = document.getElementById("editMemberPosition").value.trim();
  const office = document.getElementById("editMemberOffice").value.trim();
  const gender = document.getElementById("editMemberGender").value;
  const civilStatus = document.getElementById("editMemberCivil").value;
  const contactNumber = document.getElementById("editMemberContact").value.trim();
  const notes = document.getElementById("editMemberNotes").value.trim();

  const isOfficer = document.getElementById("editToggleOfficer")?.checked ? 1 : 0;
  const isMember = document.getElementById("editToggleMember")?.checked ? 1 : 0;
  const isCommittee = document.getElementById("editToggleCommittee")?.checked ? 1 : 0;
  const isParticipant = document.getElementById("editToggleParticipant")?.checked ? 1 : 0;

  if (!fullName) {
    showToast("Please enter full name.", "warning");
    return;
  }

  const btnSubmit = document.getElementById("btnSubmitEditMember");
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Saving...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/move-roster/${id}`, {
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
        notes: notes,
        is_officer: isOfficer,
        is_member: isMember,
        is_committee: isCommittee,
        is_participant: isParticipant
      })
    });

    const data = await res.json();
    if (data.success) {
      closeModal("modalEditMember");
      showToast(`Member profile for ${fullName} updated successfully!`, "success");
      await loadRoster();
      await updateRosterCounts();
    } else {
      showToast("Failed to update member: " + (data.message || "Error"), "error");
    }
  } catch (err) {
    showToast("Error updating member: " + err, "error");
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Update Profile</span>`;
    }
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
// 1.5 HRIS API LIVE COMPARISON & SYNCHRONIZATION CONTROLLER
// ==========================================================================

async function fetchHrisBackgroundAudit() {
  try {
    const res = await fetch(`${API_BASE}/api/hris/compare?force=0`);
    const data = await res.json();
    if (data.success) {
      appState.hrisCompare.data = data.comparison || [];
      appState.hrisCompare.metrics = data.metrics || {};
      appState.hrisCompare.loaded = true;

      const diffMap = {};
      (data.comparison || []).forEach(item => {
        if (item.id) {
          diffMap[item.id] = item;
        }
      });
      appState.hrisCompare.diffMapByMemberId = diffMap;

      updateHrisMetricBadges(data.metrics || {});

      // Refresh roster table so HRIS indicator badges appear
      if (appState.activeView === 'roster') {
        renderRosterTable();
      }
    }
  } catch (err) {
    console.warn("Background HRIS audit error:", err);
  }
}

function openHrisCompareModal(focusMemberId = null) {
  const modal = document.getElementById("modalHrisCompare");
  if (!modal) return;
  modal.classList.remove("hidden");

  const searchInput = document.getElementById("hrisCompareSearchInput");

  if (focusMemberId) {
    const targetItem = (appState.hrisCompare.data || []).find(x => Number(x.id) === Number(focusMemberId));
    if (targetItem) {
      if (searchInput) searchInput.value = targetItem.full_name;
      appState.hrisCompare.search = targetItem.full_name;
      appState.hrisCompare.activeTab = 'all';
    } else {
      if (searchInput) searchInput.value = "";
      appState.hrisCompare.search = "";
    }
  } else {
    if (searchInput) searchInput.value = "";
    appState.hrisCompare.search = "";
  }

  if (!appState.hrisCompare.loaded) {
    loadHrisComparison(false);
  } else {
    updateHrisMetricBadges(appState.hrisCompare.metrics);
    filterHrisCompareTab(appState.hrisCompare.activeTab || 'differences');
  }
}

function closeHrisCompareModal() {
  const modal = document.getElementById("modalHrisCompare");
  if (modal) modal.classList.add("hidden");
}

async function reScanHrisCompare() {
  const btn = document.getElementById("btnRescanHris");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-blue-400"></i><span>Scanning HRIS...</span>`;
  }

  try {
    await loadHrisComparison(true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function loadHrisComparison(force = false) {
  const tbody = document.getElementById("hrisCompareTableBody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-400">
          <div class="flex flex-col items-center justify-center gap-2">
            <i class="fa-solid fa-spinner fa-spin text-2xl text-blue-400"></i>
            <span class="text-xs font-semibold text-slate-300">Reconciling MOVE Roster with Central City HRIS API...</span>
            <span class="text-[11px] text-slate-500 font-mono">Host: 192.168.3.43:5000</span>
          </div>
        </td>
      </tr>
    `;
  }

  try {
    const res = await fetch(`${API_BASE}/api/hris/compare?force=${force ? '1' : '0'}`);
    const data = await res.json();
    if (data.success) {
      appState.hrisCompare.data = data.comparison || [];
      appState.hrisCompare.metrics = data.metrics || {};
      appState.hrisCompare.loaded = true;

      const diffMap = {};
      (data.comparison || []).forEach(item => {
        if (item.id) {
          diffMap[item.id] = item;
        }
      });
      appState.hrisCompare.diffMapByMemberId = diffMap;

      updateHrisMetricBadges(data.metrics || {});
      renderHrisCompareTable();

      // Also trigger roster table update so badges reflect latest state
      if (appState.activeView === 'roster') {
        renderRosterTable();
      }
    } else {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-10 text-rose-400 text-xs">
              <i class="fa-solid fa-circle-exclamation text-base mb-1"></i>
              <div>Failed to load comparison: ${escapeHtml(data.error || "Unknown error")}</div>
            </td>
          </tr>
        `;
      }
    }
  } catch (err) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-10 text-rose-400 text-xs">
            <i class="fa-solid fa-triangle-exclamation text-base mb-1"></i>
            <div>Network error connecting to MOVE HRIS proxy: ${escapeHtml(String(err))}</div>
          </td>
        </tr>
      `;
    }
  }
}

function updateHrisMetricBadges(metrics = {}) {
  const mDiff = document.getElementById("metricHrisDiff");
  const mInSync = document.getElementById("metricHrisInSync");
  const mInactive = document.getElementById("metricHrisInactive");
  const mNotFound = document.getElementById("metricHrisNotFound");
  const mTotal = document.getElementById("metricHrisTotal");
  const btnAllCount = document.getElementById("btnHrisAllOutdatedCountText");
  const toolbarBadge = document.getElementById("badgeToolbarHrisCount");
  const navBadgeText = document.getElementById("badgeHrisDiffCountText");

  const diffCount = metrics.diff_count ?? 0;
  const inSyncCount = metrics.in_sync_count ?? 0;
  const inactiveCount = metrics.inactive_count ?? 0;
  const notFoundCount = metrics.not_found_count ?? 0;
  const totalCount = metrics.total_roster ?? 0;

  if (mDiff) mDiff.textContent = diffCount;
  if (mInSync) mInSync.textContent = inSyncCount;
  if (mInactive) mInactive.textContent = inactiveCount;
  if (mNotFound) mNotFound.textContent = notFoundCount;
  if (mTotal) mTotal.textContent = totalCount;
  if (btnAllCount) btnAllCount.textContent = diffCount;

  if (toolbarBadge) {
    if (diffCount > 0) {
      toolbarBadge.textContent = diffCount;
      toolbarBadge.classList.remove("hidden");
    } else {
      toolbarBadge.classList.add("hidden");
    }
  }

  if (navBadgeText) {
    navBadgeText.textContent = diffCount > 0 ? `${diffCount} Diff` : "In Sync";
  }
}

function filterHrisCompareTab(tabKey) {
  appState.hrisCompare.activeTab = tabKey;

  const tabs = [
    { key: 'differences', activeClass: 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/40 font-bold' },
    { key: 'in_sync', activeClass: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/40 font-bold' },
    { key: 'inactive', activeClass: 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/40 font-bold' },
    { key: 'not_found', activeClass: 'bg-purple-500/20 border-purple-500/50 text-purple-300 ring-1 ring-purple-500/40 font-bold' },
    { key: 'all', activeClass: 'bg-blue-500/20 border-blue-500/50 text-blue-300 ring-1 ring-blue-500/40 font-bold' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(`tabHris-${t.key}`);
    if (btn) {
      if (t.key === tabKey) {
        btn.className = `hris-tab-btn px-3 py-2 rounded-2xl ${t.activeClass} flex flex-col items-start transition`;
      } else {
        btn.className = `hris-tab-btn px-3 py-2 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 font-semibold flex flex-col items-start transition hover:border-slate-700`;
      }
    }
  });

  renderHrisCompareTable();
}

function onHrisCompareSearch(val) {
  appState.hrisCompare.search = (val || "").trim().toLowerCase();
  renderHrisCompareTable();
}

function renderHrisCompareTable() {
  const tbody = document.getElementById("hrisCompareTableBody");
  if (!tbody) return;

  const items = appState.hrisCompare.data || [];
  const tab = appState.hrisCompare.activeTab || 'differences';
  const query = appState.hrisCompare.search || "";

  // 1. Tab filtering
  let filtered = items.filter(m => {
    if (tab === 'differences') return m.is_outdated && !m.is_inactive;
    if (tab === 'in_sync') return m.is_matched && !m.is_outdated && !m.is_inactive;
    if (tab === 'inactive') return m.is_inactive;
    if (tab === 'not_found') return !m.is_matched;
    return true; // 'all'
  });

  // 2. Search query filtering
  if (query) {
    filtered = filtered.filter(m => {
      const name = (m.full_name || "").toLowerCase();
      const currPos = (m.current_position || "").toLowerCase();
      const currOff = (m.current_office || "").toLowerCase();
      const hrisPos = (m.hris_position || "").toLowerCase();
      const hrisOff = (m.hris_office_formatted || m.hris_office_code || "").toLowerCase();
      const hrisId = String(m.hris_id || "");
      const status = (m.hris_status || "").toLowerCase();
      return name.includes(query) || currPos.includes(query) || currOff.includes(query) ||
             hrisPos.includes(query) || hrisOff.includes(query) || hrisId.includes(query) || status.includes(query);
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-10 text-slate-500 font-medium text-xs">
          <i class="fa-solid fa-folder-open text-xl mb-1 text-slate-600 block"></i>
          <span>No personnel records match this tab and filter.</span>
        </td>
      </tr>
    `;
    updateHrisSelectedUi();
    return;
  }

  tbody.innerHTML = filtered.map((m, idx) => {
    const isSelected = appState.hrisCompare.selectedIds.has(m.id);

    // Status diff pill presentation
    let diffPill = "";
    if (!m.is_matched) {
      diffPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap"><i class="fa-solid fa-question mr-1"></i>Not in HRIS</span>`;
    } else if (m.is_inactive) {
      diffPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap"><i class="fa-solid fa-user-xmark mr-1"></i>${escapeHtml(m.hris_status)}</span>`;
    } else if (m.is_outdated) {
      if (m.has_position_diff && m.has_office_diff) {
        diffPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Title &amp; Office</span>`;
      } else if (m.has_position_diff) {
        diffPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap"><i class="fa-solid fa-bolt mr-1"></i>Position Diff</span>`;
      } else {
        diffPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap"><i class="fa-solid fa-building mr-1"></i>Office Transfer</span>`;
      }
    } else {
      diffPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap"><i class="fa-solid fa-check mr-1"></i>In Sync</span>`;
    }

    // Action button presentation
    let actionHtml = "";
    if (m.is_matched && m.is_outdated && !m.is_inactive) {
      actionHtml = `
        <button type="button" onclick="syncSingleHrisMember(${m.id})" class="px-2.5 py-1 rounded-lg bg-move-orange-500 hover:bg-move-orange-600 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs ml-auto whitespace-nowrap">
          <i class="fa-solid fa-arrows-rotate text-[10px]"></i> Apply
        </button>
      `;
    } else if (m.is_inactive) {
      actionHtml = `
        <button type="button" onclick="syncSingleHrisMember(${m.id})" class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-bold transition flex items-center gap-1 ml-auto whitespace-nowrap" title="Sync details and flag inactive in MOVE">
          <i class="fa-solid fa-user-pen text-[9px]"></i> Sync &amp; Flag
        </button>
      `;
    } else if (m.is_matched) {
      actionHtml = `<span class="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1 whitespace-nowrap"><i class="fa-solid fa-circle-check"></i> Clean</span>`;
    } else {
      actionHtml = `<span class="text-[11px] text-slate-500 italic flex items-center justify-end">Unlinked</span>`;
    }

    return `
      <tr class="hover:bg-slate-800/40 transition">
        <!-- 0. Selection Checkbox -->
        <td class="py-2.5 px-3 text-center">
          <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleHrisMemberSelect(${m.id}, this.checked)" class="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer">
        </td>

        <!-- 1. Index -->
        <td class="py-2.5 px-2 text-slate-500 font-mono text-[11px] text-center">${idx + 1}</td>

        <!-- 2. Personnel Full Name & Role -->
        <td class="py-2.5 px-3 whitespace-nowrap">
          <div class="font-bold text-white text-xs">${escapeHtml(m.full_name)}</div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] font-semibold text-move-orange-400">${escapeHtml(m.move_role || 'Member (Cadre)')}</span>
            ${m.is_matched 
              ? `<span class="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1 rounded border border-slate-700">HRIS #${m.hris_id}</span>` 
              : `<span class="text-[9px] font-mono text-rose-400/90 bg-rose-950/40 px-1 rounded border border-rose-800/40">Unmatched</span>`
            }
          </div>
        </td>

        <!-- 3. Current in MOVE (Position & Office) -->
        <td class="py-2.5 px-3">
          <div class="${m.has_position_diff ? 'line-through text-slate-400 decoration-rose-500/60' : 'text-slate-200'} font-medium text-xs">
            ${escapeHtml(m.current_position || '-')}
          </div>
          <div class="${m.has_office_diff ? 'line-through text-slate-400 decoration-rose-500/60' : 'text-slate-400'} text-[11px] mt-0.5">
            ${escapeHtml(m.current_office || '-')}
          </div>
        </td>

        <!-- 4. Official in HRIS API (Position & Standardized Office) -->
        <td class="py-2.5 px-3">
          ${m.is_matched ? `
            <div class="${m.has_position_diff ? 'text-amber-300 font-bold' : 'text-slate-200'} font-medium text-xs flex items-center gap-1.5">
              <span>${escapeHtml(m.hris_position || '-')}</span>
              ${m.has_position_diff ? '<i class="fa-solid fa-arrow-trend-up text-[10px] text-amber-400" title="Updated Position"></i>' : ''}
            </div>
            <div class="${m.has_office_diff ? 'text-amber-300 font-bold' : 'text-slate-400'} text-[11px] mt-0.5 flex items-center gap-1.5">
              <span>${escapeHtml(m.hris_office_formatted || m.hris_office_code || '-')}</span>
              ${m.has_office_diff ? '<i class="fa-solid fa-building-circle-arrow-right text-[10px] text-cyan-400" title="Updated Office"></i>' : ''}
            </div>
            <div class="mt-1">
              <span class="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${m.is_inactive ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                ${escapeHtml(m.hris_status)} ${m.hris_appointment ? '• ' + escapeHtml(m.hris_appointment) : ''}
              </span>
            </div>
          ` : `
            <!-- Inline HRIS Linker for Unmatched Personnel -->
            <div class="space-y-1">
              <div class="text-[11px] text-slate-400">Match by exact HRIS Employee ID:</div>
              <div class="flex items-center gap-1.5">
                <input type="number" id="inputManualHris_${m.id}" placeholder="HRIS ID #" class="w-24 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono">
                <button type="button" onclick="submitManualHrisLink(${m.id})" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1">
                  <i class="fa-solid fa-link text-[10px]"></i> Link
                </button>
              </div>
            </div>
          `}
        </td>

        <!-- 5. Status Diff Pill -->
        <td class="py-2.5 px-3 text-center">
          ${diffPill}
        </td>

        <!-- 6. Action Button -->
        <td class="py-2.5 px-3 text-right">
          ${actionHtml}
        </td>
      </tr>
    `;
  }).join("");

  updateHrisSelectedUi();
}

function toggleHrisMemberSelect(id, checked) {
  if (checked) {
    appState.hrisCompare.selectedIds.add(id);
  } else {
    appState.hrisCompare.selectedIds.delete(id);
  }
  updateHrisSelectedUi();
}

function toggleHrisSelectAll(checked) {
  const items = appState.hrisCompare.data || [];
  const tab = appState.hrisCompare.activeTab || 'differences';
  const query = appState.hrisCompare.search || "";

  // Filter same as table
  let visible = items.filter(m => {
    if (tab === 'differences') return m.is_outdated && !m.is_inactive;
    if (tab === 'in_sync') return m.is_matched && !m.is_outdated && !m.is_inactive;
    if (tab === 'inactive') return m.is_inactive;
    if (tab === 'not_found') return !m.is_matched;
    return true;
  });

  if (query) {
    visible = visible.filter(m => {
      const name = (m.full_name || "").toLowerCase();
      const currPos = (m.current_position || "").toLowerCase();
      const currOff = (m.current_office || "").toLowerCase();
      const hrisPos = (m.hris_position || "").toLowerCase();
      const hrisOff = (m.hris_office_formatted || m.hris_office_code || "").toLowerCase();
      const hrisId = String(m.hris_id || "");
      const status = (m.hris_status || "").toLowerCase();
      return name.includes(query) || currPos.includes(query) || currOff.includes(query) ||
             hrisPos.includes(query) || hrisOff.includes(query) || hrisId.includes(query) || status.includes(query);
    });
  }

  visible.forEach(m => {
    if (checked) {
      appState.hrisCompare.selectedIds.add(m.id);
    } else {
      appState.hrisCompare.selectedIds.delete(m.id);
    }
  });

  renderHrisCompareTable();
}

function selectAllHrisOutdated(select = true) {
  if (select) {
    appState.hrisCompare.selectedIds.clear();
    (appState.hrisCompare.data || []).forEach(m => {
      if (m.is_outdated && !m.is_inactive) {
        appState.hrisCompare.selectedIds.add(m.id);
      }
    });
  } else {
    appState.hrisCompare.selectedIds.clear();
  }
  renderHrisCompareTable();
}

function updateHrisSelectedUi() {
  const count = appState.hrisCompare.selectedIds.size;
  const lbl = document.getElementById("lblHrisSelectedCount");
  const btnCount = document.getElementById("btnHrisSelectedCountText");
  const btnUpdate = document.getElementById("btnHrisUpdateSelected");
  const chkAll = document.getElementById("chkHrisSelectAll");

  if (lbl) lbl.textContent = count;
  if (btnCount) btnCount.textContent = count;
  if (btnUpdate) btnUpdate.disabled = (count === 0);

  if (chkAll) {
    const totalVisible = document.querySelectorAll("#hrisCompareTableBody input[type='checkbox']").length;
    chkAll.checked = (totalVisible > 0 && count >= totalVisible);
  }
}

async function syncSingleHrisMember(memberId) {
  const chkPos = document.getElementById("chkHrisSyncPosition");
  const chkOff = document.getElementById("chkHrisSyncOffice");
  const updatePos = chkPos ? chkPos.checked : true;
  const updateOff = chkOff ? chkOff.checked : true;

  if (!updatePos && !updateOff) {
    showToast("Please select at least one field to sync (Position Title or Office / Dept).", "warning");
    return;
  }

  const member = (appState.hrisCompare.data || []).find(m => Number(m.id) === Number(memberId));
  const memberName = member ? member.full_name : `ID #${memberId}`;

  try {
    const res = await fetch(`${API_BASE}/api/hris/sync-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: memberId,
        update_position: updatePos,
        update_office: updateOff
      })
    });
    const data = await res.json();
    if (data.success) {
      appState.hrisCompare.selectedIds.delete(memberId);
      await loadHrisComparison(false);
      await loadRoster();
    } else {
      showToast("Sync failed: " + (data.error || "Unknown error"), "error");
    }
  } catch (err) {
    showToast("Error synchronizing personnel: : " + err, "error");
  }
}

async function syncSelectedHrisMembers() {
  const ids = Array.from(appState.hrisCompare.selectedIds);
  if (ids.length === 0) {
    showToast("No personnel selected. Check the box next to personnel you want to update.", "warning");
    return;
  }

  const chkPos = document.getElementById("chkHrisSyncPosition");
  const chkOff = document.getElementById("chkHrisSyncOffice");
  const updatePos = chkPos ? chkPos.checked : true;
  const updateOff = chkOff ? chkOff.checked : true;

  if (!updatePos && !updateOff) {
    showToast("Please select at least one field to sync (Position Title or Office / Dept).", "warning");
    return;
  }

  if (!confirm(`Apply official HRIS updates to ${ids.length} selected personnel?\n\nAdvocacy roles, membership flags, and contact details will remain completely intact.`)) {
    return;
  }

  const btn = document.getElementById("btnHrisUpdateSelected");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Updating...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/hris/sync-roster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: ids,
        update_position: updatePos,
        update_office: updateOff
      })
    });
    const data = await res.json();
    if (data.success) {
      appState.hrisCompare.selectedIds.clear();
      showToast(`Successfully synchronized ${data.updated_count} personnel records with Central City HRIS!`, "success");
      await loadHrisComparison(false);
      await loadRoster();
    } else {
      showToast("Batch sync failed: " + (data.error || "Unknown error"), "error");
    }
  } catch (err) {
    showToast("Error during batch sync: : " + err, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function syncAllOutdatedHrisMembers() {
  const chkPos = document.getElementById("chkHrisSyncPosition");
  const chkOff = document.getElementById("chkHrisSyncOffice");
  const updatePos = chkPos ? chkPos.checked : true;
  const updateOff = chkOff ? chkOff.checked : true;

  if (!updatePos && !updateOff) {
    showToast("Please select at least one field to sync (Position Title or Office / Dept).", "warning");
    return;
  }

  const outdatedCount = appState.hrisCompare.metrics?.diff_count || 0;
  if (outdatedCount === 0) {
    showToast("All matched active personnel are already completely in sync with City HRIS!", "info");
    return;
  }

  if (!confirm(`Synchronize all ${outdatedCount} active personnel whose government positions or offices have changed in Central City HRIS?\n\nAdvocacy roles and MOVE membership remain untouched.`)) {
    return;
  }

  const btn = document.getElementById("btnHrisUpdateAll");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Updating All...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/hris/sync-roster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        all_outdated: true,
        update_position: updatePos,
        update_office: updateOff
      })
    });
    const data = await res.json();
    if (data.success) {
      appState.hrisCompare.selectedIds.clear();
      showToast(`Successfully synchronized all ${data.updated_count} outdated personnel with official City HRIS records!`, "success");
      await loadHrisComparison(false);
      await loadRoster();
    } else {
      showToast("Update all failed: " + (data.error || "Unknown error"), "error");
    }
  } catch (err) {
    showToast("Error updating all outdated personnel: : " + err, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function submitManualHrisLink(memberId) {
  const input = document.getElementById(`inputManualHris_${memberId}`);
  if (!input) return;

  const hrisId = parseInt(input.value.trim(), 10);
  if (isNaN(hrisId) || hrisId <= 0) {
    showToast("Please enter a valid numeric City HRIS Employee ID.", "warning");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/hris/link-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        hris_id: hrisId,
        apply_sync: true
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Successfully linked and updated from HRIS Employee #${hrisId}!`, "success");
      await loadHrisComparison(false);
      await loadRoster();
    } else {
      showToast("Failed to link HRIS ID: " + (data.error || "Employee not found in HRIS"), "error");
    }
  } catch (err) {
    showToast("Error linking HRIS ID: : " + err, "error");
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
      const res = await fetch(`${API_BASE}/api/search-pool?q=${encodeURIComponent(q)}&limit=10`);
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

  const list = (employees || []).slice(0, 10);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500">No matching employees found in pool.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(emp => {
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
    showToast("Error copying employee: : " + err, "error");
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
          <!-- Attendance Progress with Visual Bar -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-semibold">Attendance:</span>
              <span class="font-bold text-emerald-400">${present} / ${total} Present (${rate}%)</span>
            </div>
            <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300" style="width: ${rate}%;"></div>
            </div>
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
      showToast("Failed to update activity: " + (data.message || "Unknown error"), "error");
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
      showToast("Failed to delete activity: " + (data.message || "Unknown error"), "error");
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
      showToast("Error saving activity details: " + (data.message || "Failed"), "error");
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
    showToast("Error creating activity: : " + err, "error");
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
    showToast("Error updating attendance: : " + err, "error");
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
    showToast("Please enter attendee full name.", "warning");
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
      showToast(data.message || "Failed to enroll attendee.", "error");
      if (data.duplicate) {
        checkDuplicateAttendeeInput(fullName);
      }
    }
  } catch (err) {
    showToast("Error adding attendee: : " + err, "error");
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
    showToast("Error removing facilitator: : " + err, "error");
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
    showToast("Please enter facilitator full name.", "warning");
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
      showToast(data.message || "Failed to enroll facilitator.", "error");
      if (data.duplicate) {
        checkDuplicateFacilitatorInput(fullName);
      }
    }
  } catch (err) {
    showToast("Error adding facilitator: : " + err, "error");
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
    showToast("Please enter attendee full name.", "warning");
    return;
  }
  if (!position) {
    showToast("Please enter attendee position title.", "warning");
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
      showToast("Failed to update attendee: " + (data.message || "Error"), "error");
    }
  } catch (err) {
    showToast("Error updating attendee: : " + err, "error");
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
    showToast("Please enter facilitator full name.", "warning");
    return;
  }
  if (!position) {
    showToast("Please enter facilitator position title.", "warning");
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
      showToast("Failed to update facilitator: " + (data.message || "Error"), "error");
    }
  } catch (err) {
    showToast("Error updating facilitator: : " + err, "error");
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
    html += filteredRoster.slice(0, 10).map(r => {
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
        html += filteredRoster.slice(0, 10).map(r => {
          const isEnrolled = enrolledFacNames.has((r.full_name || '').trim().toUpperCase());
          const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] ${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')}` : `${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')}`;
          return `<option value="${r.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
        }).join("");
        html += `</optgroup>`;
      }
      if (poolMatches.length > 0) {
        html += `<optgroup label="City Municipal Employee Pool (${poolMatches.length})">`;
        html += poolMatches.slice(0, 10).map(p => {
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
        const res = await fetch(`${API_BASE}/api/search-pool?q=${encodeURIComponent(q)}&limit=10`);
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

  // All 3 certificate templates are fully accessible and clickable for both Attendees & Facilitators
  if (tabPart) tabPart.classList.remove("hidden");
  if (tabApprec) tabApprec.classList.remove("hidden");
  if (tabAppear) tabAppear.classList.remove("hidden");
  if (ruleHint) {
    ruleHint.textContent = isFac 
      ? "Viewing Facilitators / Resource Speakers (Appreciation / CA / Participation)" 
      : "Viewing Activity Attendees (Participation / CA / Appreciation)";
  }

  // Update template tab active styling
  const templates = ['participation', 'appreciation', 'appearance'];
  templates.forEach(t => {
    const tab = document.getElementById(`studioTab-${t}`);
    if (tab) {
      if (t === appState.currentTemplate) {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-black transition bg-move-gold-500 text-slate-950 shadow flex items-center gap-1.5 cursor-pointer";
      } else {
        tab.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer";
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
    showToast("Error updating attendance: : " + err, "error");
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
      updateCertHeaderInputs();
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
  appState.currentTemplate = templateName;
  updateStudioTemplateAvailability();
  updateCertHeaderInputs();
  syncSignatoryChooserUI();
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
      sigYOffset: appState.sigYOffset,
      sig1Id: appState.sig1Id,
      sig2Id: appState.sig2Id,
      templateSigLayout: appState.templateSigLayout,
      caSignatoryChoice: appState.caSignatoryChoice,
      showSigName: appState.showSigName,
      showSigTitle: appState.showSigTitle,
      showSigOffice: appState.showSigOffice,
      showSigLine: appState.showSigLine,
      showSignatures: appState.showSignatures
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
      if (prefs.sig1Id !== undefined) appState.sig1Id = prefs.sig1Id;
      if (prefs.sig2Id !== undefined) appState.sig2Id = prefs.sig2Id;
      if (prefs.templateSigLayout) appState.templateSigLayout = Object.assign({}, appState.templateSigLayout, prefs.templateSigLayout);
      if (prefs.caSignatoryChoice) appState.caSignatoryChoice = prefs.caSignatoryChoice;
      if (prefs.showSigName !== undefined) appState.showSigName = prefs.showSigName;
      if (prefs.showSigTitle !== undefined) appState.showSigTitle = prefs.showSigTitle;
      if (prefs.showSigOffice !== undefined) appState.showSigOffice = prefs.showSigOffice;
      if (prefs.showSigLine !== undefined) appState.showSigLine = prefs.showSigLine;
      if (prefs.showSignatures !== undefined) appState.showSignatures = prefs.showSignatures;
    }
  } catch (e) {}
  updateSigSizeUI();
  syncSignatoryChooserUI();
}

function toggleSignatures(checked) {
  appState.showSignatures = checked;
  const grp = document.getElementById("sigSizeControlsWrapper");
  if (grp) grp.classList.toggle("opacity-40", !checked);
  const chkSide = document.getElementById("certToggleSignatures") || document.getElementById("certToggleSigImages");
  if (chkSide) chkSide.checked = checked;
  const chkQuick = document.getElementById("stageQuickChkEsig");
  if (chkQuick) chkQuick.checked = checked;
  saveSigPreferences();
  renderCertificateCanvas();
}

function toggleSigDetail(key, checked) {
  if (key === 'name') appState.showSigName = Boolean(checked);
  else if (key === 'title') appState.showSigTitle = Boolean(checked);
  else if (key === 'office') appState.showSigOffice = Boolean(checked);
  else if (key === 'line') appState.showSigLine = Boolean(checked);
  syncSignatoryChooserUI();
  saveSigPreferences();
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

// --- WATERMARK & RECIPIENT LAYOUT CONTROLLER ---
function onWatermarkYOffsetChange(val) {
  appState.watermarkYOffset = parseInt(val, 10);
  updateWatermarkUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function nudgeWatermarkYOffset(delta) {
  appState.watermarkYOffset = Math.max(-150, Math.min(150, (appState.watermarkYOffset || 0) + delta));
  updateWatermarkUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function setWatermarkYOffset(val) {
  appState.watermarkYOffset = parseInt(val, 10);
  updateWatermarkUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function onWatermarkSizeChange(val) {
  appState.watermarkSize = parseInt(val, 10);
  updateWatermarkUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function onRecipientYOffsetChange(val) {
  appState.recipientYOffset = parseInt(val, 10);
  updateRecipientYOffsetUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function nudgeRecipientYOffset(delta) {
  appState.recipientYOffset = Math.max(-80, Math.min(80, (appState.recipientYOffset || 0) + delta));
  updateRecipientYOffsetUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function setRecipientYOffset(val) {
  appState.recipientYOffset = parseInt(val, 10);
  updateRecipientYOffsetUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function updateWatermarkUI() {
  const y = appState.watermarkYOffset || 0;
  const s = appState.watermarkSize || 320;
  
  const lblY = document.getElementById("lblWatermarkYOffset");
  if (lblY) lblY.textContent = `${y > 0 ? '+' : ''}${y}px`;
  const sliderY = document.getElementById("certWatermarkYOffsetSlider");
  if (sliderY) sliderY.value = y;

  const lblS = document.getElementById("lblWatermarkSize");
  if (lblS) lblS.textContent = `${s}px`;
  const sliderS = document.getElementById("certWatermarkSizeSlider");
  if (sliderS) sliderS.value = s;
}

function updateRecipientYOffsetUI() {
  const y = appState.recipientYOffset || 0;
  const lbl = document.getElementById("lblRecipientYOffset");
  if (lbl) lbl.textContent = `${y > 0 ? '+' : ''}${y}px`;
  const slider = document.getElementById("certRecipientYOffsetSlider");
  if (slider) slider.value = y;
}

// --- TYPOGRAPHY & FONT RESIZING CONTROLLER ---
function onNameFontSizeChange(val) {
  appState.nameFontSize = parseInt(val, 10);
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function setNameFontSize(val) {
  appState.nameFontSize = parseInt(val, 10);
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function adjustNameFontSize(delta) {
  appState.nameFontSize = Math.max(16, Math.min(48, (appState.nameFontSize || 26) + delta));
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function onBodyFontSizeChange(val) {
  appState.bodyFontSize = parseFloat(val);
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function getAppearanceCitation(attendee) {
  const cs = appState.certSettings || {};
  if (cs.appearance_citation && cs.appearance_citation.trim() !== '') {
    return cs.appearance_citation.trim();
  }
  return appState.certRecipientPool === 'facilitators'
    ? 'rendered invaluable service as Resource Speaker / Facilitator in'
    : 'attended and actively participated in';
}

function setBodyFontSizePreset(size) {
  appState.bodyFontSize = size;
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function openModalEditAttendeeFromStudio(recipientIdx = null) {
  const recipients = getActiveCertRecipients();
  const idx = (recipientIdx !== null) ? recipientIdx : appState.currentCertIndex;
  const person = recipients[idx];
  if (!person) return;
  if (appState.certRecipientPool === 'facilitators') {
    openModalEditFacilitator(person.id);
  } else {
    openModalEditAttendee(person.id);
  }
}

async function onCanvasAttendeeFieldBlur(field, val, recipientIdx = null) {
  const recipients = getActiveCertRecipients();
  const idx = (recipientIdx !== null) ? recipientIdx : appState.currentCertIndex;
  const person = recipients[idx];
  if (!person) return;

  const cleanVal = (val || '').trim();
  if (!cleanVal) return;

  const isFac = appState.certRecipientPool === 'facilitators';
  const actId = appState.currentActivityId || 1;
  const personId = person.id;

  if (field === 'full_name') {
    person.full_name = cleanVal.toUpperCase();
  } else if (field === 'position') {
    person.position = cleanVal;
    if (person.role_title !== undefined) person.role_title = cleanVal;
  } else if (field === 'role_title') {
    person.role_title = cleanVal;
    person.position = cleanVal;
  } else if (field === 'office') {
    person.office = cleanVal;
  }

  renderRecipientDropdown();
  renderCertificateCanvas();

  try {
    const endpoint = isFac 
      ? `${API_BASE}/api/activities/${actId}/facilitators/${personId}` 
      : `${API_BASE}/api/activities/${actId}/attendees/${personId}`;

    const payload = {
      full_name: person.full_name,
      position: person.position || cleanVal,
      office: person.office || 'City Government of Baguio',
      gender: person.gender || 'M',
      civil_status: person.civil_status || 'Married',
      contact_number: person.contact_number || '',
      notes: person.notes || ''
    };
    if (isFac) {
      payload.role_title = person.role_title || cleanVal;
    }

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification(`Saved: ${field.replace('_', ' ').toUpperCase()} updated!`);
    }
  } catch (err) {
    console.warn("Failed to auto-save canvas recipient edit:", err);
  }
}

async function saveStudioActivityField(field, val) {
  const actId = appState.currentActivityId;
  const cleanVal = (val || '').trim();
  if (!cleanVal || !actId) return;

  if (!appState.customCertFields) appState.customCertFields = {};
  appState.customCertFields[field] = cleanVal;
  const currAct = (appState.activities || []).find(a => a.id === actId);
  if (currAct) currAct[field] = cleanVal;

  const inpId = field === 'title' ? 'certInputTitle' : (field === 'theme' ? 'certInputTheme' : (field === 'date' ? 'certInputDate' : (field === 'venue' ? 'certInputVenue' : null)));
  if (inpId) {
    const inp = document.getElementById(inpId);
    if (inp) inp.value = cleanVal;
  }

  try {
    const payload = {};
    if (currAct) {
      payload.title = currAct.title;
      payload.theme = currAct.theme;
      payload.date = currAct.date;
      payload.venue = currAct.venue;
      payload.hours = currAct.hours;
    }
    payload[field] = cleanVal;

    const res = await fetch(`${API_BASE}/api/activities/${actId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification(`Saved: Activity ${field.toUpperCase()} updated!`);
    }
  } catch (e) {
    console.warn("Failed to auto-save activity field:", e);
  }
}

function adjustBodyFontSize(delta) {
  const current = appState.bodyFontSize || 12;
  const next = Math.max(8, Math.min(26, Math.round((current + delta) * 10) / 10));
  appState.bodyFontSize = next;
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function onTitleFontSizeChange(val) {
  appState.titleFontSize = parseInt(val, 10);
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function adjustTitleFontSize(delta) {
  const current = appState.titleFontSize || 28;
  const next = Math.max(18, Math.min(48, current + delta));
  appState.titleFontSize = next;
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function onHeaderFontSizeChange(val) {
  appState.headerFontSize = parseFloat(val);
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function adjustHeaderFontSize(delta) {
  const current = appState.headerFontSize || 10;
  const next = Math.max(8, Math.min(20, Math.round((current + delta) * 10) / 10));
  appState.headerFontSize = next;
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function resetFontSizes() {
  appState.headerFontSize = 10;
  appState.nameFontSize = 26;
  appState.bodyFontSize = 12;
  appState.titleFontSize = 28;
  updateTypographyUI();
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function updateTypographyUI() {
  const n = appState.nameFontSize || 26;
  const b = appState.bodyFontSize || 12;
  const t = appState.titleFontSize || 28;
  const h = appState.headerFontSize || 10;

  const lblH = document.getElementById("lblHeaderFontSize");
  if (lblH) lblH.textContent = `${h}px`;
  const sliderH = document.getElementById("certHeaderFontSizeSlider");
  if (sliderH) sliderH.value = h;

  const lblN = document.getElementById("lblNameFontSize");
  if (lblN) lblN.textContent = `${n}px`;
  const sliderN = document.getElementById("certNameFontSizeSlider");
  if (sliderN) sliderN.value = n;

  const lblB = document.getElementById("lblBodyFontSize");
  if (lblB) lblB.textContent = `${b}px`;
  const sliderB = document.getElementById("certBodyFontSizeSlider");
  if (sliderB) sliderB.value = b;
  const quickB = document.getElementById("stageQuickBodySizeLabel");
  if (quickB) quickB.textContent = `${b}px`;
  const quickN = document.getElementById("stageQuickNameSizeLabel");
  if (quickN) quickN.textContent = `${n}px`;

  const lblT = document.getElementById("lblTitleFontSize");
  if (lblT) lblT.textContent = `${t}px`;
  const sliderT = document.getElementById("certTitleFontSizeSlider");
  if (sliderT) sliderT.value = t;
}

function saveLayoutPreferences() {
  try {
    localStorage.setItem("move_cert_layout_prefs", JSON.stringify({
      watermarkYOffset: appState.watermarkYOffset,
      watermarkSize: appState.watermarkSize,
      recipientYOffset: appState.recipientYOffset,
      nameFontSize: appState.nameFontSize,
      bodyFontSize: appState.bodyFontSize,
      titleFontSize: appState.titleFontSize,
      headerFontSize: appState.headerFontSize,
      caPrintMode: appState.caPrintMode,
      caDualBehavior: appState.caDualBehavior
    }));
  } catch (e) {}
}

function initLayoutPreferences() {
  try {
    const raw = localStorage.getItem("move_cert_layout_prefs");
    if (raw) {
      const prefs = JSON.parse(raw);
      if (prefs.watermarkYOffset !== undefined) appState.watermarkYOffset = prefs.watermarkYOffset;
      if (prefs.watermarkSize !== undefined) appState.watermarkSize = prefs.watermarkSize;
      if (prefs.recipientYOffset !== undefined) appState.recipientYOffset = prefs.recipientYOffset;
      if (prefs.nameFontSize !== undefined) appState.nameFontSize = prefs.nameFontSize;
      if (prefs.bodyFontSize !== undefined) appState.bodyFontSize = prefs.bodyFontSize;
      if (prefs.titleFontSize !== undefined) appState.titleFontSize = prefs.titleFontSize;
      if (prefs.headerFontSize !== undefined) appState.headerFontSize = prefs.headerFontSize;
      if (prefs.caPrintMode) appState.caPrintMode = prefs.caPrintMode;
      if (prefs.caDualBehavior) appState.caDualBehavior = prefs.caDualBehavior;
    }
  } catch (e) {}
  updateWatermarkUI();
  updateRecipientYOffsetUI();
  updateTypographyUI();
}



function getActiveSignatoryLayout() {
  const tpl = appState.currentTemplate || 'participation';
  if (appState.templateSigLayout && appState.templateSigLayout[tpl]) {
    return appState.templateSigLayout[tpl];
  }
  return tpl === 'appearance' ? (appState.caSignatoryChoice || 'sig2_right') : 'both';
}

function onCaSignatoryChoiceChange(val) {
  const tpl = appState.currentTemplate || 'participation';
  appState.caSignatoryChoice = val;
  if (!appState.templateSigLayout) {
    appState.templateSigLayout = { participation: 'both', appreciation: 'both', appearance: 'sig2_right' };
  }
  appState.templateSigLayout[tpl] = val;
  syncSignatoryChooserUI();
  saveSigPreferences();
  renderCertificateCanvas();
}

function setCaPrintMode(mode) {
  appState.caPrintMode = (mode === 'single') ? 'single' : 'dual';
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function setCaDualBehavior(behavior) {
  appState.caDualBehavior = (behavior === 'duplicate') ? 'duplicate' : 'pair';
  saveLayoutPreferences();
  renderCertificateCanvas();
}

function updateCaPrintModeUI() {
  const toolbar = document.getElementById("caPrintModeToolbar");
  const btnSingle = document.getElementById("btnCaModeSingle");
  const btnDual = document.getElementById("btnCaModeDual");
  const behaviorSel = document.getElementById("caDualBehaviorSelect");
  const topBadge = document.getElementById("caTopSlipBadge");
  const bottomWrapper = document.getElementById("caDualBottomPreviewWrapper");

  const isCA = appState.currentTemplate === 'appearance';
  const isDual = appState.caPrintMode === 'dual';

  if (toolbar) toolbar.classList.toggle("hidden", !isCA);

  if (btnSingle && btnDual) {
    if (isDual) {
      btnDual.className = "px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 bg-emerald-500 text-slate-950 shadow";
      btnSingle.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
    } else {
      btnSingle.className = "px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 bg-emerald-500 text-slate-950 shadow";
      btnDual.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
    }
  }

  if (behaviorSel) {
    behaviorSel.value = appState.caDualBehavior || 'pair';
    behaviorSel.classList.toggle("hidden", !isDual);
  }

  const recipients = getActiveCertRecipients();
  if (!isCA || !isDual || recipients.length === 0) {
    if (topBadge) topBadge.classList.add("hidden");
    if (bottomWrapper) bottomWrapper.classList.add("hidden");
    return;
  }

  if (topBadge) topBadge.classList.remove("hidden");
  if (bottomWrapper) bottomWrapper.classList.remove("hidden");
}

function onSigDisplayModeChange(val) {
  appState.sigDisplayMode = val;
  renderCertificateCanvas();
}

// --- CERTIFICATE HEADERS, TITLES & PRESENTATION CONTROLLER ---
async function loadCertificateSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/certificate-settings`);
    const data = await res.json();
    if (data.success && data.settings) {
      appState.certSettings = Object.assign({}, appState.certSettings, data.settings);
      localStorage.setItem("move_cert_header_settings", JSON.stringify(appState.certSettings));
    }
  } catch (e) {
    console.warn("Could not load certificate settings from server, using fallback:", e);
    try {
      const raw = localStorage.getItem("move_cert_header_settings");
      if (raw) {
        const saved = JSON.parse(raw);
        appState.certSettings = Object.assign({}, appState.certSettings, saved);
      }
    } catch (_) {}
  }
  updateCertHeaderInputs();
  renderCertificateCanvas();
}

function getActiveCertTitleKey() {
  if (appState.currentTemplate === 'appreciation') return 'appreciation_title';
  if (appState.currentTemplate === 'appearance') return 'appearance_title';
  return 'participation_title';
}

function getActiveCertIntroKey() {
  if (appState.currentTemplate === 'appreciation') return 'appreciation_intro';
  if (appState.currentTemplate === 'appearance') return 'appearance_intro';
  return 'participation_intro';
}

function getGenderPronoun(attendee) {
  const g = String(attendee?.gender || '').trim().toUpperCase();
  if (g === 'F' || g === 'FEMALE') return 'her';
  return 'his';
}

function updateCertHeaderInputs() {
  const h1 = document.getElementById("certHdr1Input");
  const h2 = document.getElementById("certHdr2Input");
  const h3 = document.getElementById("certHdr3Input");
  const title = document.getElementById("certTitleInput");
  const intro = document.getElementById("certIntroInput");
  const ctx = document.getElementById("lblActiveTitleContext");

  const cs = appState.certSettings || {};

  if (h1 && cs.header_line_1 !== undefined) h1.value = cs.header_line_1;
  if (h2 && cs.header_line_2 !== undefined) h2.value = cs.header_line_2;
  if (h3 && cs.header_line_3 !== undefined) h3.value = cs.header_line_3;

  const titleKey = getActiveCertTitleKey();
  const introKey = getActiveCertIntroKey();

  if (title) title.value = cs[titleKey] || '';
  if (intro) intro.value = cs[introKey] || '';

  const citInp = document.getElementById("certCitationInput");
  const citLbl = document.getElementById("lblCitationContext");
  const citTip = document.getElementById("lblCitationTip");
  if (citInp) {
    if (appState.currentTemplate === 'appearance') {
      citInp.value = cs.appearance_citation || 'was duly verified to have rendered invaluable service as Resource Speaker / Facilitator in';
      if (citLbl) citLbl.textContent = 'Appearance Certification Clause';
      if (citTip) citTip.textContent = 'Tip: This phrase appears right before "the activity entitled:". Click to edit and save.';
    } else {
      citInp.value = cs.participation_citation || 'for {his/her} active participation and completion of the capacity-building seminar entitled';
      if (citLbl) citLbl.innerHTML = 'Participation Citation (<span class="text-move-gold-400 font-mono font-semibold">{his/her}</span>)';
      if (citTip) citTip.innerHTML = 'Tip: <code class="text-move-gold-400 font-mono">{his/her}</code> automatically adjusts to "his" or "her" based on recipient gender.';
    }
  }

  // Populate CA Template Formula Textarea
  const caInp = document.getElementById("certCaTemplateInput");
  if (caInp) {
    caInp.value = cs.ca_template_formula || DEFAULT_CA_TEMPLATE_FORMULA;
  }

  // Populate Header Spacing & Logo Distance Sliders
  if (cs.header_spacing !== undefined) appState.headerSpacing = parseInt(cs.header_spacing, 10) || 0;
  if (cs.logo_distance !== undefined) appState.logoDistance = parseInt(cs.logo_distance, 10) || 0;

  const hSpacingSlider = document.getElementById("certHeaderSpacingSlider");
  const lblHSpacing = document.getElementById("lblHeaderSpacing");
  if (hSpacingSlider) hSpacingSlider.value = appState.headerSpacing || 0;
  if (lblHSpacing) lblHSpacing.textContent = `${appState.headerSpacing > 0 ? '+' : ''}${appState.headerSpacing || 0}px`;

  const lDistSlider = document.getElementById("certLogoDistanceSlider");
  const lblLDist = document.getElementById("lblLogoDistance");
  if (lDistSlider) lDistSlider.value = appState.logoDistance || 0;
  if (lblLDist) lblLDist.textContent = `${appState.logoDistance > 0 ? '+' : ''}${appState.logoDistance || 0}px`;

  updateCaFormulaLivePreview();

  if (ctx) {
    ctx.textContent = appState.currentTemplate === 'appreciation' ? 'APPRECIATION' : (appState.currentTemplate === 'appearance' ? 'APPEARANCE' : 'PARTICIPATION');
  }
}

let _sidebarDebounceTimer = null;
function onSidebarCertFieldInput(field, val) {
  let key = field;
  if (field === 'active_title') key = getActiveCertTitleKey();
  if (field === 'active_intro') key = getActiveCertIntroKey();
  if (field === 'active_citation' || field === 'participation_citation') {
    key = appState.currentTemplate === 'appearance' ? 'appearance_citation' : 'participation_citation';
  }

  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings[key] = val;
  renderCertificateCanvas();

  if (_sidebarDebounceTimer) clearTimeout(_sidebarDebounceTimer);
  _sidebarDebounceTimer = setTimeout(() => {
    saveCertField(field, true);
  }, 700);
}

let _certDebounceTimer = null;

function onCanvasCertFieldInput(field, val, el) {
  let key = field;
  if (field === 'active_title') key = getActiveCertTitleKey();
  if (field === 'active_intro') key = getActiveCertIntroKey();

  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings[key] = val;
  updateCertHeaderInputs();

  // Debounced auto-save after 700ms of pausing typing
  if (_certDebounceTimer) clearTimeout(_certDebounceTimer);
  _certDebounceTimer = setTimeout(() => {
    saveCanvasCertField(key, val, el);
  }, 700);
}

async function saveCanvasCertField(field, val, el) {
  let key = field;
  if (field === 'active_title') key = getActiveCertTitleKey();
  if (field === 'active_intro') key = getActiveCertIntroKey();

  const cleanVal = (val || '').trim();
  if (!cleanVal) return;
  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings[key] = cleanVal;
  localStorage.setItem("move_cert_header_settings", JSON.stringify(appState.certSettings));
  updateCertHeaderInputs();
  highlightSidebarSaveStatus(key);

  try {
    const payload = {};
    payload[key] = cleanVal;
    const res = await fetch(`${API_BASE}/api/certificate-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      const fieldNiceName = key.replace(/_/g, ' ').toUpperCase();
      showToastNotification(`Saved: ${fieldNiceName} saved to database!`);
      if (el) showCanvasSaveIndicator(el, `Saved: ${fieldNiceName}`);
    }
  } catch (err) {
    console.error("Failed to save canvas cert field:", err);
  }
}

async function saveCertField(fieldKey, isDebounce = false) {
  let key = fieldKey;
  if (fieldKey === 'active_title') key = getActiveCertTitleKey();
  if (fieldKey === 'active_intro') key = getActiveCertIntroKey();

  let inpId = "certHdr1Input";
  let statusId = "hdr1SaveStatus";
  let labelName = "Header Line 1";

  if (fieldKey === 'header_line_1') { 
    inpId = "certHdr1Input"; 
    statusId = "hdr1SaveStatus"; 
    labelName = "Header Line 1"; 
  } else if (fieldKey === 'header_line_2') { 
    inpId = "certHdr2Input"; 
    statusId = "hdr2SaveStatus"; 
    labelName = "Header Line 2"; 
  } else if (fieldKey === 'header_line_3') { 
    inpId = "certHdr3Input"; 
    statusId = "hdr3SaveStatus"; 
    labelName = "Header Line 3"; 
  } else if (fieldKey === 'active_title' || key.includes('title')) { 
    inpId = "certTitleInput"; 
    statusId = "titleSaveStatus"; 
    labelName = "Certificate Title"; 
  } else if (fieldKey === 'active_intro' || key.includes('intro')) { 
    inpId = "certIntroInput"; 
    statusId = "introSaveStatus"; 
    labelName = "Presentation Intro Line"; 
  } else if (fieldKey === 'participation_citation' || fieldKey === 'appearance_citation' || fieldKey === 'active_citation') {
    inpId = "certCitationInput";
    statusId = "citationSaveStatus";
    if (appState.currentTemplate === 'appearance') {
      key = 'appearance_citation';
      labelName = "Appearance Certification Clause";
    } else {
      key = 'participation_citation';
      labelName = "Participation Citation";
    }
  } else if (fieldKey === 'ca_template_formula') {
    inpId = "certCaTemplateInput";
    statusId = "caTemplateSaveStatus";
    labelName = "CA Body Paragraph Formula";
    key = "ca_template_formula";
  } else if (fieldKey === 'header_spacing') {
    inpId = "certHeaderSpacingSlider";
    statusId = null;
    labelName = "Header Vertical Spacing";
    key = "header_spacing";
  } else if (fieldKey === 'logo_distance') {
    inpId = "certLogoDistanceSlider";
    statusId = null;
    labelName = "Header Logo Distance";
    key = "logo_distance";
  }

  const inp = document.getElementById(inpId);
  const val = (inp ? inp.value : (appState.certSettings ? appState.certSettings[key] : "")).trim();
  const statusSpan = statusId ? document.getElementById(statusId) : null;

  if (!val && fieldKey !== 'header_spacing' && fieldKey !== 'logo_distance') {
    if (!isDebounce) showToast(`${labelName} cannot be empty.`, 'warning');
    return;
  }

  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings[key] = val;
  localStorage.setItem("move_cert_header_settings", JSON.stringify(appState.certSettings));
  renderCertificateCanvas();

  try {
    const payload = {};
    payload[key] = val;
    const res = await fetch(`${API_BASE}/api/certificate-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      if (statusSpan) {
        statusSpan.classList.remove("hidden");
        setTimeout(() => statusSpan.classList.add("hidden"), 2500);
      }
      showToast(`Saved: ${labelName} saved to database!`, 'success');
    } else {
      showToast("Error saving: " + (data.message || "Unknown error"), 'error');
    }
  } catch (err) {
    showToast("Error saving certificate setting: " + err, 'error');
  }
}

async function saveAllCertificateSettings() {
  const h1 = (document.getElementById("certHdr1Input")?.value || "").trim();
  const h2 = (document.getElementById("certHdr2Input")?.value || "").trim();
  const h3 = (document.getElementById("certHdr3Input")?.value || "").trim();
  const title = (document.getElementById("certTitleInput")?.value || "").trim();
  const intro = (document.getElementById("certIntroInput")?.value || "").trim();
  const cit = (document.getElementById("certCitationInput")?.value || "").trim();

  if (!appState.certSettings) appState.certSettings = {};
  if (cit) appState.certSettings.participation_citation = cit;
  if (h1) appState.certSettings.header_line_1 = h1;
  if (h2) appState.certSettings.header_line_2 = h2;
  if (h3) appState.certSettings.header_line_3 = h3;

  const titleKey = getActiveCertTitleKey();
  const introKey = getActiveCertIntroKey();
  if (title) appState.certSettings[titleKey] = title;
  if (intro) appState.certSettings[introKey] = intro;

  localStorage.setItem("move_cert_header_settings", JSON.stringify(appState.certSettings));

  try {
    const res = await fetch(`${API_BASE}/api/certificate-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appState.certSettings)
    });
    const data = await res.json();
    if (data.success) {
      const statusSpan = document.getElementById("certHdrSaveStatus");
      if (statusSpan) {
        statusSpan.classList.remove("hidden");
        setTimeout(() => statusSpan.classList.add("hidden"), 2500);
      }
      showToastNotification("Saved: Certificate headers, title, and intro text saved to database!");
      renderCertificateCanvas();
    } else {
      alert("Error saving certificate settings: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    showToast("Error communicating with server: : " + err, "error");
  }
}

async function resetCertificateSettings() {
  const confirmReset = confirm("Reset certificate headers, titles, and intro text to official defaults?");
  if (!confirmReset) return;

  try {
    const res = await fetch(`${API_BASE}/api/certificate-settings/reset`, { method: "POST" });
    const data = await res.json();
    if (data.success && data.settings) {
      appState.certSettings = data.settings;
      localStorage.setItem("move_cert_header_settings", JSON.stringify(appState.certSettings));
      updateCertHeaderInputs();
      renderCertificateCanvas();
      showToastNotification("Reset: Certificate headers and titles restored to official defaults!");
    }
  } catch (err) {
    showToast("Error resetting certificate settings: : " + err, "error");
  }
}

function getActiveSigObj(slotNum) {
  const rawId = (slotNum === 1) ? appState.sig1Id : appState.sig2Id;
  const customCache = (slotNum === 1) ? appState.customSig1 : appState.customSig2;

  if (typeof rawId === 'string' && rawId.startsWith('roster_')) {
    if (customCache && customCache.id === rawId) return customCache;
    const rId = parseInt(rawId.replace('roster_', ''), 10);
    const pool = (appState.fullRoster && appState.fullRoster.length > 0) ? appState.fullRoster : (appState.roster || []);
    const person = pool.find(r => r.id === rId);
    if (person) {
      const obj = {
        id: rawId,
        name: person.full_name,
        title: person.position || (person.is_officer ? 'MOVE Chapter Officer' : 'MOVE Member'),
        office: person.office || 'City Government of Baguio',
        signature_image: null
      };
      if (slotNum === 1) appState.customSig1 = obj;
      else appState.customSig2 = obj;
      return obj;
    }
  }

  const numId = parseInt(rawId, 10);
  const found = appState.signatories.find(s => s.id === numId);
  if (found) return found;

  if (slotNum === 1) {
    return { id: 3, name: "MARIO D. GANGA JR.", title: "MOVE Chapter President", office: "City Mayor's Office", signature_image: "GANGA.png" };
  }
  return { id: 1, name: "HON. BENJAMIN B. MAGALONG", title: "City Mayor & Honorary Chapter Adviser", office: "City Mayor's Office", signature_image: "signature (15).png" };
}

function buildSingleSignatoryItemHtml(slotNum, sigObj, showImg, isCA = false) {
  const showName = appState.showSigName !== false;
  const showTitle = appState.showSigTitle !== false;
  const showOffice = appState.showSigOffice === true;
  const showLine = appState.showSigLine !== false;

  const borderClass = showLine ? "border-t border-slate-800 pt-1" : "pt-1";
  const titleColorClass = isCA ? "text-slate-600 font-medium" : "text-slate-500 font-semibold";

  return `
    <div class="text-center flex flex-col items-center">
      ${getSigImgHtml(slotNum, sigObj, showImg)}
      ${showName ? `
        <h5 contenteditable="true" onblur="onCanvasSigNameBlur(${slotNum}, this.innerText)" class="cert-editable font-bold text-xs uppercase text-slate-900 ${borderClass} min-w-[12rem] px-2 cursor-text" title="Click to edit signatory name">${escapeHtml(sigObj.name || '')}</h5>
      ` : (showLine ? `<div class="border-t border-slate-800 w-48 pt-1"></div>` : '')}
      ${showTitle ? `
        <p contenteditable="true" oninput="onCanvasSigTitleInput(${slotNum}, this.innerText)" onblur="onCanvasSigTitleBlur(${slotNum}, this.innerText)" class="cert-editable text-[10px] ${titleColorClass} cursor-text" title="Click to edit position title (auto-saves to database)">${escapeHtml(sigObj.title || '')}</p>
      ` : ''}
      ${showOffice && sigObj.office ? `
        <p class="text-[9px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">${escapeHtml(sigObj.office)}</p>
      ` : ''}
    </div>
  `;
}

function buildSignatoryFooterHtml(sig1, sig2, showSig1Img, showSig2Img, isCA = false) {
  const layout = getActiveSignatoryLayout();
  const topBorder = isCA ? "border-slate-300" : "border-slate-200";

  if (layout === 'sig1_right' || layout === 'sig1') {
    return `
      <div class="flex items-end justify-end pt-4 border-t ${topBorder} text-xs relative z-10">
        ${buildSingleSignatoryItemHtml(1, sig1, showSig1Img, isCA)}
      </div>
    `;
  } else if (layout === 'sig1_center') {
    return `
      <div class="flex flex-col items-center pt-4 border-t ${topBorder} text-xs relative z-10">
        ${buildSingleSignatoryItemHtml(1, sig1, showSig1Img, isCA)}
      </div>
    `;
  } else if (layout === 'sig2_center') {
    return `
      <div class="flex flex-col items-center pt-4 border-t ${topBorder} text-xs relative z-10">
        ${buildSingleSignatoryItemHtml(2, sig2, showSig2Img, isCA)}
      </div>
    `;
  } else if (layout === 'sig2_right' || layout === 'sig2') {
    return `
      <div class="flex items-end justify-end pt-4 border-t ${topBorder} text-xs relative z-10">
        ${buildSingleSignatoryItemHtml(2, sig2, showSig2Img, isCA)}
      </div>
    `;
  } else {
    // Default: 'both' (Dual Signatories: Signatory 1 Left & Signatory 2 Right)
    return `
      <div class="grid grid-cols-2 gap-8 pt-4 border-t ${topBorder} text-center relative z-10">
        ${buildSingleSignatoryItemHtml(1, sig1, showSig1Img, isCA)}
        ${buildSingleSignatoryItemHtml(2, sig2, showSig2Img, isCA)}
      </div>
    `;
  }
}

// ==========================================================================
// STUDIO ACCORDIONS, VIEWPORT ZOOM & CA FORMULA ENGINE
// ==========================================================================

const DEFAULT_CA_TEMPLATE_FORMULA = "This is to certify that {title_prefix} {full_name}, {position} of {office}, was duly verified to have attended and participated in the activity entitled “{activity_title}: {activity_theme},” held on {activity_date}, at the {activity_venue}.";

// 1. Studio Accordion Controller
function toggleStudioAccordion(name) {
  const body = document.getElementById(`acc-body-${name}`);
  const icon = document.getElementById(`acc-icon-${name}`);
  if (!body) return;
  const isCollapsed = body.classList.toggle('collapsed');
  if (icon) {
    icon.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
  }
}

function expandAllStudioAccordions() {
  ['content', 'signatories', 'typography', 'watermark'].forEach(name => {
    const body = document.getElementById(`acc-body-${name}`);
    const icon = document.getElementById(`acc-icon-${name}`);
    if (body) body.classList.remove('collapsed');
    if (icon) icon.style.transform = 'rotate(0deg)';
  });
}

function collapseAllStudioAccordions() {
  ['content', 'signatories', 'typography', 'watermark'].forEach(name => {
    const body = document.getElementById(`acc-body-${name}`);
    const icon = document.getElementById(`acc-icon-${name}`);
    if (body) body.classList.add('collapsed');
    if (icon) icon.style.transform = 'rotate(-90deg)';
  });
}

// 2. Studio In-App Viewport Zoom Controller
function applyStudioCanvasZoom() {
  const stage = document.getElementById("certViewportStage");
  const display = document.getElementById("certZoomDisplay");
  if (!stage) return;
  const zoom = appState.certZoom || 100;
  const scale = zoom / 100;
  stage.style.transform = `scale(${scale})`;
  if (display) {
    display.textContent = `${Math.round(zoom)}%`;
  }
}

function setStudioCanvasZoom(val) {
  appState.certZoom = Math.max(30, Math.min(200, Number(val)));
  applyStudioCanvasZoom();
}

function adjustStudioCanvasZoom(delta) {
  setStudioCanvasZoom((appState.certZoom || 100) + delta);
}

function autoFitStudioCanvas() {
  const container = document.querySelector(".cert-viewport-container");
  const canvas = document.getElementById("certStageCanvas");
  if (!container || !canvas) return;

  const containerWidth = container.clientWidth - 20;
  const canvasWidth = 850;
  if (containerWidth > 0) {
    const idealZoom = Math.min(100, Math.max(40, Math.round((containerWidth / canvasWidth) * 100)));
    setStudioCanvasZoom(idealZoom);
    showToast(`Canvas view fitted to ${idealZoom}%`, 'info', 1800);
  }
}

function toggleStudioFocusMode() {
  const sidebar = document.getElementById("studioControlsSidebar");
  const canvasCol = document.getElementById("studioCanvasArea");
  const focusBtn = document.getElementById("certZoomFocusBtn");
  if (!sidebar || !canvasCol) return;

  appState.isFocusMode = !appState.isFocusMode;
  if (appState.isFocusMode) {
    sidebar.classList.add("hidden");
    canvasCol.classList.remove("lg:col-span-8");
    canvasCol.classList.add("lg:col-span-12");
    if (focusBtn) {
      focusBtn.innerHTML = '<i class="fa-solid fa-compress text-[9px]"></i>';
      focusBtn.classList.add("bg-move-gold-500", "text-slate-950");
      focusBtn.classList.remove("bg-slate-800", "text-slate-300");
    }
    showToast("Focus Mode Activated (Controls hidden)", "info", 2000);
  } else {
    sidebar.classList.remove("hidden");
    canvasCol.classList.remove("lg:col-span-12");
    canvasCol.classList.add("lg:col-span-8");
    if (focusBtn) {
      focusBtn.innerHTML = '<i class="fa-solid fa-expand text-[9px]"></i>';
      focusBtn.classList.remove("bg-move-gold-500", "text-slate-950");
      focusBtn.classList.add("bg-slate-800", "text-slate-300");
    }
    showToast("Standard Two-Column View Restored", "info", 1500);
  }
  setTimeout(() => {
    if (appState.isFocusMode) {
      setStudioCanvasZoom(100);
    } else {
      autoFitStudioCanvas();
    }
  }, 100);
}

// 3. Header Top Spacing & Logo Distance Controllers
function onHeaderSpacingChange(val) {
  appState.headerSpacing = parseInt(val, 10) || 0;
  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings.header_spacing = appState.headerSpacing;
  const lbl = document.getElementById("lblHeaderSpacing");
  if (lbl) lbl.textContent = `${appState.headerSpacing > 0 ? '+' : ''}${appState.headerSpacing}px`;
  renderCertificateCanvas();
}

function nudgeHeaderSpacing(delta) {
  const cur = appState.headerSpacing || 0;
  const next = Math.max(-30, Math.min(50, cur + delta));
  const slider = document.getElementById("certHeaderSpacingSlider");
  if (slider) slider.value = next;
  onHeaderSpacingChange(next);
}

function setHeaderSpacing(val) {
  const slider = document.getElementById("certHeaderSpacingSlider");
  if (slider) slider.value = val;
  onHeaderSpacingChange(val);
}

function onLogoDistanceChange(val) {
  appState.logoDistance = parseInt(val, 10) || 0;
  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings.logo_distance = appState.logoDistance;
  const lbl = document.getElementById("lblLogoDistance");
  if (lbl) lbl.textContent = `${appState.logoDistance > 0 ? '+' : ''}${appState.logoDistance}px`;
  renderCertificateCanvas();
}

function nudgeLogoDistance(delta) {
  const cur = appState.logoDistance || 0;
  const next = Math.max(-20, Math.min(60, cur + delta));
  const slider = document.getElementById("certLogoDistanceSlider");
  if (slider) slider.value = next;
  onLogoDistanceChange(next);
}

function setLogoDistance(val) {
  const slider = document.getElementById("certLogoDistanceSlider");
  if (slider) slider.value = val;
  onLogoDistanceChange(val);
}

// 4. CA Body Paragraph Formula Engine
function compileCaParagraphHtml(formula, attendee, act, isEditable = false, attendeeIdx = 0) {
  const str = (formula && formula.trim()) ? formula : DEFAULT_CA_TEMPLATE_FORMULA;
  const sex = String(attendee?.gender || attendee?.sex || '').trim().toUpperCase();
  const prefix = (sex === 'F' || sex === 'FEMALE') ? 'MS.' : 'MR.';
  const pos = attendee?.role_title || attendee?.position || 'Employee / Participant';
  const off = attendee?.office || 'City Government of Baguio';
  const pron = (sex === 'F' || sex === 'FEMALE') ? 'her' : 'his';

  let html = escapeHtml(str);

  if (isEditable) {
    const editName = `<strong contenteditable="true" onblur="onCanvasAttendeeFieldBlur('full_name', this.innerText, ${attendeeIdx})" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable uppercase font-bold text-slate-950 cursor-text px-1 rounded hover:bg-amber-100/60 transition" style="font-size: ${Math.round((appState.nameFontSize || 26) * 0.72)}px;" title="Click to edit recipient name (auto-saves)">${escapeHtml(attendee?.full_name || '')}</strong>`;
    const editPos = `<strong contenteditable="true" onblur="onCanvasAttendeeFieldBlur('position', this.innerText, ${attendeeIdx})" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-bold text-slate-950 cursor-text px-1 rounded hover:bg-amber-100/60 transition" title="Click to edit position (auto-saves)">${escapeHtml(pos)}</strong>`;
    const editOff = `<strong contenteditable="true" onblur="onCanvasAttendeeFieldBlur('office', this.innerText, ${attendeeIdx})" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-bold text-slate-950 cursor-text px-1 rounded hover:bg-amber-100/60 transition" title="Click to edit office (auto-saves)">${escapeHtml(off)}</strong>`;
    const editTitle = `<strong contenteditable="true" onblur="saveStudioActivityField('title', this.innerText)" class="cert-editable font-bold cursor-text px-1 rounded hover:bg-amber-100/60 transition" title="Click to edit activity title">${escapeHtml(act?.title || '')}</strong>`;
    const editTheme = `<strong contenteditable="true" onblur="saveStudioActivityField('theme', this.innerText)" class="cert-editable font-bold cursor-text px-1 rounded hover:bg-amber-100/60 transition" title="Click to edit activity theme">${escapeHtml(act?.theme || '')}</strong>`;
    const editDate = `<strong contenteditable="true" onblur="saveStudioActivityField('date', this.innerText)" class="cert-editable font-bold cursor-text px-1 rounded hover:bg-amber-100/60 transition" title="Click to edit date">${escapeHtml(act?.date || '')}</strong>`;
    const editVenue = `<strong contenteditable="true" onblur="saveStudioActivityField('venue', this.innerText)" class="cert-editable font-bold cursor-text px-1 rounded hover:bg-amber-100/60 transition" title="Click to edit venue">${escapeHtml(act?.venue || '')}</strong>`;

    html = html
      .replace(/\{title_prefix\}/g, `<span class="font-bold text-slate-950">${prefix}</span>`)
      .replace(/\{full_name\}/g, editName)
      .replace(/\{position\}/g, editPos)
      .replace(/\{office\}/g, editOff)
      .replace(/\{activity_title\}/g, editTitle)
      .replace(/\{activity_theme\}/g, editTheme)
      .replace(/\{activity_date\}/g, editDate)
      .replace(/\{activity_venue\}/g, editVenue)
      .replace(/\{his\/her\}/gi, pron);
  } else {
    html = html
      .replace(/\{title_prefix\}/g, `<strong>${prefix}</strong>`)
      .replace(/\{full_name\}/g, `<strong>${escapeHtml(attendee?.full_name || '')}</strong>`)
      .replace(/\{position\}/g, `<strong>${escapeHtml(pos)}</strong>`)
      .replace(/\{office\}/g, `<strong>${escapeHtml(off)}</strong>`)
      .replace(/\{activity_title\}/g, `<strong>${escapeHtml(act?.title || '')}</strong>`)
      .replace(/\{activity_theme\}/g, `<strong>${escapeHtml(act?.theme || '')}</strong>`)
      .replace(/\{activity_date\}/g, `<strong>${escapeHtml(act?.date || '')}</strong>`)
      .replace(/\{activity_venue\}/g, `<strong>${escapeHtml(act?.venue || '')}</strong>`)
      .replace(/\{his\/her\}/gi, pron);
  }

  return html;
}

function insertCaToken(token) {
  const textarea = document.getElementById("certCaTemplateInput");
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  textarea.value = val.substring(0, start) + token + val.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + token.length;
  textarea.focus();
  onCaTemplateFormulaInput(textarea.value);
}

function onCaTemplateFormulaInput(val) {
  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings.ca_template_formula = val;
  updateCaFormulaLivePreview();
  renderCertificateCanvas();
}

async function saveCaTemplateFormula() {
  const val = document.getElementById("certCaTemplateInput")?.value?.trim() || "";
  if (!appState.certSettings) appState.certSettings = {};
  appState.certSettings.ca_template_formula = val;
  await saveCertField('ca_template_formula');
  const status = document.getElementById("caTemplateSaveStatus");
  if (status) {
    status.classList.remove("hidden");
    setTimeout(() => status.classList.add("hidden"), 2000);
  }
}

function resetCaTemplateFormula() {
  const textarea = document.getElementById("certCaTemplateInput");
  if (textarea) textarea.value = DEFAULT_CA_TEMPLATE_FORMULA;
  onCaTemplateFormulaInput(DEFAULT_CA_TEMPLATE_FORMULA);
  showToast("CA formula reset to official standard format", "info");
}

function updateCaFormulaLivePreview() {
  const previewEl = document.getElementById("caFormulaLivePreview");
  if (!previewEl) return;
  const recipients = getActiveCertRecipients();
  const attendee = (recipients && recipients[appState.currentCertIndex]) || {
    full_name: "DIAZEN, MICHAEL M.",
    position: "ENGINEER II (SANITARY ENGINEER)",
    office: "CEPMO",
    gender: "M"
  };
  const act = appState.customCertFields || {
    title: "Men in the Kitchen 2",
    theme: "Love Served in the Kitchen",
    date: "October 20, 2026",
    venue: "CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City"
  };
  const formula = appState.certSettings?.ca_template_formula || DEFAULT_CA_TEMPLATE_FORMULA;
  previewEl.innerHTML = compileCaParagraphHtml(formula, attendee, act, false, 0);
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
  const sig1 = getActiveSigObj(1);
  const sig2 = getActiveSigObj(2);

  const showSig1Img = appState.showSignatures && 
                      (appState.sigDisplayMode === 'both' || appState.sigDisplayMode === 'sig1_only') && 
                      Boolean(sig1.signature_image);

  const showSig2Img = appState.showSignatures && 
                      (appState.sigDisplayMode === 'both' || appState.sigDisplayMode === 'sig2_only') && 
                      Boolean(sig2.signature_image);

  const watermarkHtml = appState.showWatermark ? `
    <div class="group/watermark cert-watermark-overlay absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
      <!-- Quick on-canvas watermark position pill (hidden during print) -->
      <div class="no-print absolute top-3 right-4 opacity-0 group-hover/watermark:opacity-100 transition-all duration-150 bg-slate-950/90 text-white rounded-md px-2 py-0.5 text-[9px] font-mono flex items-center gap-1.5 shadow-lg z-30 border border-slate-700 pointer-events-auto">
        <span class="text-slate-400">Watermark:</span>
        <button type="button" onclick="nudgeWatermarkYOffset(-6)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer" title="Move watermark higher">↑ Up</button>
        <span class="text-move-gold-400 font-semibold">${appState.watermarkYOffset > 0 ? '+' : ''}${appState.watermarkYOffset || 0}px</span>
        <button type="button" onclick="nudgeWatermarkYOffset(6)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer" title="Move watermark lower">↓ Down</button>
        ${appState.watermarkYOffset !== 0 ? `<button type="button" onclick="setWatermarkYOffset(0)" class="text-slate-400 hover:text-rose-400 ml-1 text-[8px]" title="Reset Center">✕</button>` : ''}
      </div>
      <img src="${escapeHtml(appState.watermarkLogo || '/MOVE BAGUIO LOGO.png')}" 
           alt="Watermark" 
           class="object-contain pointer-events-none select-none max-w-[65%] max-h-[80%] transition-transform duration-100"
           style="width: ${appState.watermarkSize || 320}px; height: ${appState.watermarkSize || 320}px; opacity: ${(appState.watermarkOpacity !== undefined ? appState.watermarkOpacity : 12) / 100}; filter: grayscale(10%); transform: translateY(${appState.watermarkYOffset || 0}px);">
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
      <div class="text-center relative z-10" style="transform: translateY(${appState.headerSpacing || 0}px); transition: transform 0.1s ease;">
        ${appState.showLogos ? `
          <div class="absolute top-0 flex items-center" style="left: ${appState.logoDistance || 0}px;">
            <img src="/CITY HALL LOGO.png" class="w-14 h-14 object-contain">
          </div>
          <div class="absolute top-0 flex items-center" style="right: ${appState.logoDistance || 0}px;">
            <img src="/MOVE BAGUIO LOGO.png" class="w-14 h-14 object-contain">
          </div>
        ` : ''}

        <p contenteditable="true" oninput="onCanvasCertFieldInput('header_line_1', this.innerText, this)" onblur="saveCanvasCertField('header_line_1', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable tracking-widest uppercase font-bold text-slate-500 cursor-text transition-all" style="font-size: ${appState.headerFontSize || 10}px; line-height: 1.2;" title="Click to edit Header Line 1 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_1 || 'Republic of the Philippines • City Government of Baguio')}</p>
        <h4 contenteditable="true" oninput="onCanvasCertFieldInput('header_line_2', this.innerText, this)" onblur="saveCanvasCertField('header_line_2', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-extrabold uppercase text-slate-800 tracking-wider mt-0.5 cursor-text transition-all" style="font-size: ${(appState.headerFontSize || 10) + 1}px; line-height: 1.2;" title="Click to edit Header Line 2 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_2 || 'Men Opposed to Violence Against Women Everywhere (MOVE)')}</h4>
        <p contenteditable="true" oninput="onCanvasCertFieldInput('header_line_3', this.innerText, this)" onblur="saveCanvasCertField('header_line_3', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable text-slate-500 font-semibold uppercase mt-0.5 cursor-text transition-all" style="font-size: ${Math.max(8, (appState.headerFontSize || 10) - 1)}px; line-height: 1.2;" title="Click to edit Header Line 3 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_3 || 'Baguio City, Philippines')}</p>
        
        <h2 contenteditable="true" oninput="onCanvasCertFieldInput('participation_title', this.innerText, this)" onblur="saveCanvasCertField('participation_title', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-cinzel font-black text-[#0f1f3d] tracking-wider mt-3 transition-all cursor-text" style="font-size: ${appState.titleFontSize || 28}px; line-height: 1.1;" title="Click to edit Certificate Title (auto-saves to database)">
          ${escapeHtml(appState.certSettings?.participation_title || 'CERTIFICATE OF PARTICIPATION')}
        </h2>
        <p contenteditable="true" oninput="onCanvasCertFieldInput('participation_intro', this.innerText, this)" onblur="saveCanvasCertField('participation_intro', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable text-[11px] italic font-serif text-slate-600 mt-0.5 cursor-text" title="Click to edit Presentation Intro (auto-saves to database)">
          ${escapeHtml(appState.certSettings?.participation_intro || 'is presented to')}
        </p>
      </div>

      <!-- Recipient Block -->
      <div class="group/recip text-center my-auto py-2 relative z-10 transition-transform duration-100" style="transform: translateY(${appState.recipientYOffset || 0}px);">
        <!-- Quick on-canvas text nudge & font size pill on hover (hidden during print) -->
        <div class="no-print absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/recip:opacity-100 transition-all duration-150 bg-slate-950/90 text-white rounded-md px-2.5 py-1 text-[9px] font-mono flex items-center gap-2 shadow-xl z-30 border border-slate-700 pointer-events-auto backdrop-blur-sm">
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Position:</span>
            <button type="button" onclick="nudgeRecipientYOffset(-4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer bg-slate-800 rounded" title="Move text higher">↑</button>
            <span class="text-move-gold-400 font-semibold">${appState.recipientYOffset > 0 ? '+' : ''}${appState.recipientYOffset || 0}px</span>
            <button type="button" onclick="nudgeRecipientYOffset(4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer bg-slate-800 rounded" title="Move text lower">↓</button>
            ${appState.recipientYOffset !== 0 ? `<button type="button" onclick="setRecipientYOffset(0)" class="text-slate-400 hover:text-rose-400 ml-0.5 text-[8px]" title="Reset Center">✕</button>` : ''}
          </div>
          <span class="text-slate-600">|</span>
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Name Font:</span>
            <button type="button" onclick="adjustNameFontSize(-2)" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded" title="Make name font smaller">A-</button>
            <span class="text-move-gold-400 font-semibold">${appState.nameFontSize || 26}px</span>
            <button type="button" onclick="adjustNameFontSize(2)" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded" title="Make name font larger">A+</button>
          </div>
        </div>
        <h3 contenteditable="true" class="cert-editable font-cinzel font-black text-[#d97706] tracking-wide inline-block border-b-2 border-slate-300 pb-1 px-4 uppercase transition-all" style="font-size: ${appState.nameFontSize || 26}px; line-height: 1.2;">
          ${escapeHtml(attendee.full_name)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mt-1">
          ${escapeHtml(attendee.position || '')} &bull; <strong class="text-slate-800">${escapeHtml(attendee.office || '')}</strong>
        </p>

        <p class="text-slate-700 max-w-xl mx-auto mt-3 leading-relaxed transition-all" style="font-size: ${appState.bodyFontSize || 12}px; line-height: 1.45;">
          <span contenteditable="true" oninput="onCanvasCertFieldInput('participation_citation', this.innerText)" onblur="saveCanvasCertField('participation_citation', this.innerText)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable cursor-text" title="Click to edit seminar citation (auto-saves to database)">${escapeHtml(
            (appState.certSettings?.participation_citation || 'for {his/her} active participation and completion of the capacity-building seminar entitled')
              .replace(/\{his\/her\)\}/gi, getGenderPronoun(attendee))
              .replace(/\{his\/her\}/gi, getGenderPronoun(attendee))
              .replace(/\{his\/hers\}/gi, getGenderPronoun(attendee))
              .replace(/\{pronoun\}/gi, getGenderPronoun(attendee))
          )}</span>
          <strong class="text-slate-900 block font-bold text-xs sm:text-sm mt-0.5">“${escapeHtml(act.title)}: ${escapeHtml(act.theme)}”</strong>
          held on ${escapeHtml(act.date)} at ${escapeHtml(act.venue)}.
        </p>
      </div>

      <!-- Signatories Footer -->
      ${buildSignatoryFooterHtml(sig1, sig2, showSig1Img, showSig2Img, false)}
    `;
  }

  // ==========================================
  // TEMPLATE 2: APPEARANCE / CA (DTR SLIP)
  // ==========================================
  else if (appState.currentTemplate === 'appearance') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-12 flex flex-col justify-between border-4 border-slate-300 transition-all";
    
    // Determine Signatory layout for Certificate of Appearance
    const caSignatoryBlock = buildSignatoryFooterHtml(sig1, sig2, showSig1Img, showSig2Img, true);

    canvas.innerHTML = `
      ${watermarkHtml}

      <!-- CA Header -->
      <div class="relative z-10 text-center border-b pb-4" style="transform: translateY(${appState.headerSpacing || 0}px); transition: transform 0.1s ease;">
        ${appState.showLogos ? `
          <div class="absolute top-0" style="left: ${appState.logoDistance || 0}px;">
            <img src="/CITY HALL LOGO.png" class="w-12 h-12 object-contain">
          </div>
          <div class="absolute top-0" style="right: ${appState.logoDistance || 0}px;">
            <img src="/MOVE BAGUIO LOGO.png" class="w-12 h-12 object-contain">
          </div>
        ` : ''}

        <p contenteditable="true" oninput="onCanvasCertFieldInput('header_line_1', this.innerText, this)" onblur="saveCanvasCertField('header_line_1', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable uppercase tracking-widest text-slate-500 cursor-text transition-all" style="font-size: ${appState.headerFontSize || 10}px; line-height: 1.2;" title="Click to edit Header Line 1 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_1 || 'Republic of the Philippines • City Government of Baguio')}</p>
        <h4 contenteditable="true" oninput="onCanvasCertFieldInput('header_line_2', this.innerText, this)" onblur="saveCanvasCertField('header_line_2', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-bold uppercase text-slate-800 cursor-text transition-all" style="font-size: ${(appState.headerFontSize || 10) + 1}px; line-height: 1.2;" title="Click to edit Header Line 2 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_2 || 'Men Opposed to Violence Against Women Everywhere (MOVE)')}</h4>
        <p contenteditable="true" oninput="onCanvasCertFieldInput('header_line_3', this.innerText, this)" onblur="saveCanvasCertField('header_line_3', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-semibold text-slate-600 cursor-text transition-all" style="font-size: ${Math.max(8, (appState.headerFontSize || 10) - 1)}px; line-height: 1.2;" title="Click to edit Header Line 3 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_3 || 'Baguio City, Philippines')}</p>
        
        <h2 contenteditable="true" oninput="onCanvasCertFieldInput('appearance_title', this.innerText, this)" onblur="saveCanvasCertField('appearance_title', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-sans font-black text-slate-950 tracking-wider mt-2 uppercase cursor-text transition-all" style="font-size: ${appState.titleFontSize || 28}px; line-height: 1.1;" title="Click to edit Certificate Title (auto-saves to database)">
          ${escapeHtml(appState.certSettings?.appearance_title || 'CERTIFICATE OF APPEARANCE')}
        </h2>
      </div>

      <!-- Formal Body (Compiled via CA Formula Engine) -->
      <div class="group/recip my-auto py-3 space-y-2 leading-relaxed text-justify text-slate-800 relative z-10 transition-transform duration-100" style="transform: translateY(${appState.recipientYOffset || 0}px); font-size: ${appState.bodyFontSize || 12}px;">
        <!-- Quick on-canvas body nudge & font size pill on hover (hidden during print) -->
        <div class="no-print absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/recip:opacity-100 transition-all duration-150 bg-slate-950/90 text-white rounded-md px-2.5 py-1 text-[9px] font-mono flex items-center gap-2 shadow-xl z-30 border border-slate-700 pointer-events-auto backdrop-blur-sm">
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Position:</span>
            <button type="button" onclick="nudgeRecipientYOffset(-4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer bg-slate-800 rounded" title="Move body higher">↑</button>
            <span class="text-move-gold-400 font-semibold">${appState.recipientYOffset > 0 ? '+' : ''}${appState.recipientYOffset || 0}px</span>
            <button type="button" onclick="nudgeRecipientYOffset(4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer bg-slate-800 rounded" title="Move body lower">↓</button>
            ${appState.recipientYOffset !== 0 ? `<button type="button" onclick="setRecipientYOffset(0)" class="text-slate-400 hover:text-rose-400 ml-0.5 text-[8px]" title="Reset Center">✕</button>` : ''}
          </div>
          <span class="text-slate-600">|</span>
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Body Font:</span>
            <button type="button" onclick="adjustBodyFontSize(-0.5)" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded" title="Make body text smaller">A-</button>
            <span class="text-move-gold-400 font-semibold">${appState.bodyFontSize || 12}px</span>
            <button type="button" onclick="adjustBodyFontSize(0.5)" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded" title="Make body text larger">A+</button>
          </div>
          <span class="text-slate-600">|</span>
          <button type="button" onclick="openModalEditAttendeeFromStudio(${appState.currentCertIndex})" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded text-move-gold-400 flex items-center gap-1" title="Open full edit form">
            <i class="fa-solid fa-pen-to-square text-[9px]"></i> Edit Details
          </button>
        </div>
        <div class="leading-relaxed text-justify transition-all">
          ${compileCaParagraphHtml(appState.certSettings?.ca_template_formula, attendee, act, true, appState.currentCertIndex)}
        </div>
      </div>

      <!-- Accrediting Signatory -->
      ${caSignatoryBlock}
    `;

    // If Dual Mode (Top & Bottom A5 Landscape on A4) is active, populate the Bottom A5 preview canvas
    const bottomCanvas = document.getElementById("certStageCanvasBottom");
    if (bottomCanvas && appState.caPrintMode === 'dual' && recipients.length > 0) {
      const isDuplicate = (appState.caDualBehavior === 'duplicate') || (recipients.length === 1);
      const bottomIdx = isDuplicate ? appState.currentCertIndex : ((appState.currentCertIndex + 1) % recipients.length);
      const bottomAttendee = recipients[bottomIdx] || attendee;

      const topLbl = document.getElementById("caTopSlipRecipientLabel");
      const botLbl = document.getElementById("caBottomSlipRecipientLabel");
      if (topLbl) topLbl.textContent = `Slip #1 (Top): ${attendee.full_name}`;
      if (botLbl) {
        botLbl.textContent = isDuplicate
          ? `Slip #2 (Bottom — Duplicate Copy): ${bottomAttendee.full_name}`
          : `Slip #2 (Bottom — Recipient #${bottomIdx + 1}): ${bottomAttendee.full_name}`;
      }

      bottomCanvas.className = canvas.className;
      bottomCanvas.innerHTML = `
        ${watermarkHtml}

        <!-- CA Header -->
        <div class="relative z-10 text-center border-b pb-4" style="transform: translateY(${appState.headerSpacing || 0}px); transition: transform 0.1s ease;">
          ${appState.showLogos ? `
            <div class="absolute top-0" style="left: ${appState.logoDistance || 0}px;">
              <img src="/CITY HALL LOGO.png" class="w-12 h-12 object-contain">
            </div>
            <div class="absolute top-0" style="right: ${appState.logoDistance || 0}px;">
              <img src="/MOVE BAGUIO LOGO.png" class="w-12 h-12 object-contain">
            </div>
          ` : ''}

          <p class="uppercase tracking-widest text-slate-500 transition-all" style="font-size: ${appState.headerFontSize || 10}px; line-height: 1.2;">${escapeHtml(appState.certSettings?.header_line_1 || 'Republic of the Philippines • City Government of Baguio')}</p>
          <h4 class="font-bold uppercase text-slate-800 transition-all" style="font-size: ${(appState.headerFontSize || 10) + 1}px; line-height: 1.2;">${escapeHtml(appState.certSettings?.header_line_2 || 'Men Opposed to Violence Against Women Everywhere (MOVE)')}</h4>
          <p class="font-semibold text-slate-600 transition-all" style="font-size: ${Math.max(8, (appState.headerFontSize || 10) - 1)}px; line-height: 1.2;">${escapeHtml(appState.certSettings?.header_line_3 || 'Baguio City, Philippines')}</p>
          
          <h2 class="font-sans font-black text-slate-950 tracking-wider mt-2 uppercase transition-all" style="font-size: ${appState.titleFontSize || 28}px; line-height: 1.1;">
            ${escapeHtml(appState.certSettings?.appearance_title || 'CERTIFICATE OF APPEARANCE')}
          </h2>
        </div>

        <!-- Formal Body (Bottom Slip) -->
        <div class="group/recipbot my-auto py-3 space-y-2 leading-relaxed text-justify text-slate-800 relative z-10 transition-transform duration-100" style="transform: translateY(${appState.recipientYOffset || 0}px); font-size: ${appState.bodyFontSize || 12}px;">
          <div class="no-print absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/recipbot:opacity-100 transition-all duration-150 bg-slate-950/90 text-white rounded-md px-2.5 py-1 text-[9px] font-mono flex items-center gap-2 shadow-xl z-30 border border-slate-700 pointer-events-auto backdrop-blur-sm">
            <span class="text-emerald-400 font-bold">Bottom Slip:</span>
            <button type="button" onclick="openModalEditAttendeeFromStudio(${bottomIdx})" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded text-move-gold-400 flex items-center gap-1" title="Open full edit form">
              <i class="fa-solid fa-pen-to-square text-[9px]"></i> Edit Details
            </button>
          </div>
          <div class="leading-relaxed text-justify transition-all">
            ${compileCaParagraphHtml(appState.certSettings?.ca_template_formula, bottomAttendee, act, true, bottomIdx)}
          </div>
        </div>

        <!-- Accrediting Signatory -->
        ${caSignatoryBlock}
      `;
    }
  }

  // ==========================================
  // TEMPLATE 3: APPRECIATION (VIP HONORS)
  // ==========================================
  else if (appState.currentTemplate === 'appreciation') {
    canvas.className = "cert-canvas-container w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 rounded-sm shadow-2xl overflow-hidden relative p-8 sm:p-10 flex flex-col justify-between border-[14px] border-double border-[#0f1f3d] transition-all";

    canvas.innerHTML = `
      ${watermarkHtml}

      <!-- Certificate Header -->
      <div class="text-center relative z-10" style="transform: translateY(${appState.headerSpacing || 0}px); transition: transform 0.1s ease;">
        ${appState.showLogos ? `
          <div class="absolute top-0 flex items-center" style="left: ${appState.logoDistance || 0}px;">
            <img src="/CITY HALL LOGO.png" class="w-14 h-14 object-contain">
          </div>
          <div class="absolute top-0 flex items-center" style="right: ${appState.logoDistance || 0}px;">
            <img src="/MOVE BAGUIO LOGO.png" class="w-14 h-14 object-contain">
          </div>
        ` : ''}

        <p contenteditable="true" oninput="onCanvasCertFieldInput('header_line_1', this.innerText, this)" onblur="saveCanvasCertField('header_line_1', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable tracking-widest uppercase font-bold text-slate-500 cursor-text transition-all" style="font-size: ${appState.headerFontSize || 10}px; line-height: 1.2;" title="Click to edit Header Line 1 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_1 || 'Republic of the Philippines • City Government of Baguio')}</p>
        <h4 contenteditable="true" oninput="onCanvasCertFieldInput('header_line_2', this.innerText, this)" onblur="saveCanvasCertField('header_line_2', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-extrabold uppercase text-slate-800 tracking-wider mt-0.5 cursor-text transition-all" style="font-size: ${(appState.headerFontSize || 10) + 1}px; line-height: 1.2;" title="Click to edit Header Line 2 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_2 || 'Men Opposed to Violence Against Women Everywhere (MOVE)')}</h4>
        <p contenteditable="true" oninput="onCanvasCertFieldInput('header_line_3', this.innerText, this)" onblur="saveCanvasCertField('header_line_3', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable text-slate-500 font-semibold uppercase mt-0.5 cursor-text transition-all" style="font-size: ${Math.max(8, (appState.headerFontSize || 10) - 1)}px; line-height: 1.2;" title="Click to edit Header Line 3 (auto-saves to database)">${escapeHtml(appState.certSettings?.header_line_3 || 'Baguio City, Philippines')}</p>
        
        <h2 contenteditable="true" oninput="onCanvasCertFieldInput('appreciation_title', this.innerText, this)" onblur="saveCanvasCertField('appreciation_title', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable font-cinzel font-black text-[#d97706] tracking-wider mt-3 transition-all cursor-text" style="font-size: ${appState.titleFontSize || 28}px; line-height: 1.1;" title="Click to edit Certificate Title (auto-saves to database)">
          ${escapeHtml(appState.certSettings?.appreciation_title || 'CERTIFICATE OF APPRECIATION')}
        </h2>
        <p contenteditable="true" oninput="onCanvasCertFieldInput('appreciation_intro', this.innerText, this)" onblur="saveCanvasCertField('appreciation_intro', this.innerText, this)" onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}" class="cert-editable text-[11px] italic font-serif text-slate-600 mt-0.5 cursor-text" title="Click to edit Presentation Intro (auto-saves to database)">
          ${escapeHtml(appState.certSettings?.appreciation_intro || 'is presented to')}
        </p>
      </div>

      <!-- Recipient Block -->
      <div class="group/recip text-center my-auto py-2 relative z-10 transition-transform duration-100" style="transform: translateY(${appState.recipientYOffset || 0}px);">
        <!-- Quick on-canvas text nudge & font size pill on hover (hidden during print) -->
        <div class="no-print absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/recip:opacity-100 transition-all duration-150 bg-slate-950/90 text-white rounded-md px-2.5 py-1 text-[9px] font-mono flex items-center gap-2 shadow-xl z-30 border border-slate-700 pointer-events-auto backdrop-blur-sm">
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Position:</span>
            <button type="button" onclick="nudgeRecipientYOffset(-4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer bg-slate-800 rounded" title="Move text higher">↑</button>
            <span class="text-move-gold-400 font-semibold">${appState.recipientYOffset > 0 ? '+' : ''}${appState.recipientYOffset || 0}px</span>
            <button type="button" onclick="nudgeRecipientYOffset(4)" class="hover:text-move-gold-400 px-1 font-bold cursor-pointer bg-slate-800 rounded" title="Move text lower">↓</button>
            ${appState.recipientYOffset !== 0 ? `<button type="button" onclick="setRecipientYOffset(0)" class="text-slate-400 hover:text-rose-400 ml-0.5 text-[8px]" title="Reset Center">✕</button>` : ''}
          </div>
          <span class="text-slate-600">|</span>
          <div class="flex items-center gap-1">
            <span class="text-slate-400">Name Font:</span>
            <button type="button" onclick="adjustNameFontSize(-2)" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded" title="Make name font smaller">A-</button>
            <span class="text-move-gold-400 font-semibold">${appState.nameFontSize || 26}px</span>
            <button type="button" onclick="adjustNameFontSize(2)" class="hover:text-move-gold-400 px-1.5 font-bold cursor-pointer bg-slate-800 rounded" title="Make name font larger">A+</button>
          </div>
        </div>
        <h3 contenteditable="true" class="cert-editable font-cinzel font-black text-[#0f1f3d] tracking-wide inline-block border-b-2 border-[#d97706] pb-1 px-4 uppercase transition-all" style="font-size: ${appState.nameFontSize || 26}px; line-height: 1.2;">
          ${escapeHtml(attendee.full_name)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mt-1">
          ${attendee.role_title ? `<strong class="text-amber-800 uppercase font-bold">${escapeHtml(attendee.role_title)}</strong> &bull; ` : (attendee.position ? `${escapeHtml(attendee.position)} &bull; ` : '')}<strong class="text-slate-800">${escapeHtml(attendee.office || 'City Government of Baguio')}</strong>
        </p>

        <p class="text-slate-700 max-w-xl mx-auto mt-3 leading-relaxed transition-all" style="font-size: ${appState.bodyFontSize || 12}px; line-height: 1.45;">
          in grateful recognition and profound appreciation for invaluable expertise, exemplary leadership, and selfless service rendered as
          <strong class="text-slate-900 font-bold">${escapeHtml(attendee.role_title || attendee.position || 'Resource Speaker / Lead Facilitator')}</strong>
          during the capacity-building program entitled
          <strong class="text-slate-900 block font-bold text-xs sm:text-sm mt-0.5">“${escapeHtml(act.title)}”</strong>
          held on ${escapeHtml(act.date)} at ${escapeHtml(act.venue)}.
        </p>
      </div>

      <!-- Signatories Footer -->
      ${buildSignatoryFooterHtml(sig1, sig2, showSig1Img, showSig2Img, false)}
    `;
  }

  updateCaPrintModeUI();
  applyStudioCanvasZoom();
  updateCaFormulaLivePreview();
}

// ==========================================================================
// 6. PRINTING CONTROLLER (HIGH-RESOLUTION A4 LANDSCAPE)
// ==========================================================================

function syncLiveCertEditsBeforePrint() {
  // Ensure any sidebar input edits are synced to appState before printing
  const h1 = document.getElementById("certHdr1Input")?.value?.trim();
  const h2 = document.getElementById("certHdr2Input")?.value?.trim();
  const h3 = document.getElementById("certHdr3Input")?.value?.trim();
  const titleVal = document.getElementById("certTitleInput")?.value?.trim();
  const introVal = document.getElementById("certIntroInput")?.value?.trim();
  const citVal = document.getElementById("certCitationInput")?.value?.trim();

  if (!appState.certSettings) appState.certSettings = {};
  if (h1) appState.certSettings.header_line_1 = h1;
  if (h2) appState.certSettings.header_line_2 = h2;
  if (h3) appState.certSettings.header_line_3 = h3;
  if (titleVal) appState.certSettings[getActiveCertTitleKey()] = titleVal;
  if (introVal) appState.certSettings[getActiveCertIntroKey()] = introVal;
  if (citVal) {
    if (appState.currentTemplate === 'appearance') {
      appState.certSettings.appearance_citation = citVal;
    } else {
      appState.certSettings.participation_citation = citVal;
    }
  }
  localStorage.setItem("move_cert_header_settings", JSON.stringify(appState.certSettings));

  // Sync signatory names, titles, and offices if edited
  const sig1 = getActiveSigObj(1);
  const sig2 = getActiveSigObj(2);
  const s1Name = document.getElementById("certSig1NameInput")?.value?.trim();
  const s2Name = document.getElementById("certSig2NameInput")?.value?.trim();
  const s1Inp = document.getElementById("certSig1TitleInput")?.value?.trim();
  const s2Inp = document.getElementById("certSig2TitleInput")?.value?.trim();
  const s1Off = document.getElementById("certSig1OfficeInput")?.value?.trim();
  const s2Off = document.getElementById("certSig2OfficeInput")?.value?.trim();
  if (sig1) {
    if (s1Name) sig1.name = s1Name;
    if (s1Inp) sig1.title = s1Inp;
    if (s1Off !== undefined) sig1.office = s1Off;
  }
  if (sig2) {
    if (s2Name) sig2.name = s2Name;
    if (s2Inp) sig2.title = s2Inp;
    if (s2Off !== undefined) sig2.office = s2Off;
  }
}

function setDynamicPrintPageOrientation(orientation) {
  let styleEl = document.getElementById("dynamicPrintPageStyle");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "dynamicPrintPageStyle";
    document.head.appendChild(styleEl);
  }
  if (orientation === 'portrait') {
    // A4 Portrait (210mm x 297mm) holds 1 or 2 A5 Landscape (210mm x 148.5mm) slips stacked Top & Bottom
    styleEl.textContent = `@page { size: A4 portrait; margin: 0mm; } @media print { @page { size: A4 portrait; margin: 0mm; } }`;
  } else {
    // A4 Landscape (297mm x 210mm) for Full-Sheet Participation & Appreciation Certificates
    styleEl.textContent = `@page { size: A4 landscape; margin: 0mm; } @media print { @page { size: A4 landscape; margin: 0mm; } }`;
  }
}

function buildCleanCertCloneHtml(canvasEl, sheetClass) {
  if (!canvasEl) return "";
  const clone = canvasEl.cloneNode(true);
  clone.removeAttribute("id");
  clone.querySelectorAll(".no-print, .canvas-inline-saved-pill").forEach(el => el.remove());
  clone.querySelectorAll("[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));
  clone.className = `${canvasEl.className} ${sheetClass}`;
  return clone.outerHTML;
}

function buildPrintableSheetHtml(canvasEl) {
  return `
    <div class="print-page">
      ${buildCleanCertCloneHtml(canvasEl, 'print-cert-sheet')}
    </div>
  `;
}

function buildPrintableA5OnA4SheetHtml(topCertHtml, bottomCertHtml) {
  return `
    <div class="print-page-a4-dual">
      <div class="print-slot-a5 has-cut-line">
        ${topCertHtml || ''}
      </div>
      <div class="print-slot-a5">
        ${bottomCertHtml || ''}
      </div>
    </div>
  `;
}

function triggerA4PrintWhenImagesReady(printBox) {
  const imgs = Array.from(printBox.querySelectorAll("img"));
  const waitPromises = imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
      setTimeout(resolve, 400);
    });
  });
  Promise.all(waitPromises).then(() => {
    setTimeout(() => window.print(), 80);
  });
}

function printSingleCertificate() {
  const canvas = document.getElementById("certStageCanvas");
  const printBox = document.getElementById("printContainer");
  if (!canvas || !printBox) return;

  syncLiveCertEditsBeforePrint();

  // Certificate of Appearance: A5 Landscape (210mm x 148.5mm) printed on A4 (Single Mode or Dual Top & Bottom Mode)
  if (appState.currentTemplate === 'appearance') {
    setDynamicPrintPageOrientation('portrait');
    renderCertificateCanvas();
    const topHtml = buildCleanCertCloneHtml(document.getElementById("certStageCanvas"), 'print-cert-sheet-a5');
    let bottomHtml = "";
    if (appState.caPrintMode === 'dual') {
      const bottomCanvas = document.getElementById("certStageCanvasBottom");
      bottomHtml = bottomCanvas ? buildCleanCertCloneHtml(bottomCanvas, 'print-cert-sheet-a5') : topHtml;
    }
    printBox.innerHTML = buildPrintableA5OnA4SheetHtml(topHtml, bottomHtml);
    triggerA4PrintWhenImagesReady(printBox);
    return;
  }

  // Participation & Appreciation: Full A4 Landscape (297mm x 210mm)
  setDynamicPrintPageOrientation('landscape');
  printBox.innerHTML = buildPrintableSheetHtml(canvas);
  triggerA4PrintWhenImagesReady(printBox);
}

function batchPrintAllCertificates() {
  const printBox = document.getElementById("printContainer");
  const recipients = getActiveCertRecipients();
  if (!printBox || recipients.length === 0) {
    const poolLabel = appState.certRecipientPool === 'facilitators' ? 'facilitators' : 'attendees';
    showToast(`No present ${poolLabel} available to print.`, "warning");
    return;
  }

  syncLiveCertEditsBeforePrint();

  // Backup current recipient index
  const savedIndex = appState.currentCertIndex;
  let pagesHtml = "";

  // Certificate of Appearance: A5 Landscape on A4 Paper (Dual 2-Up Top & Bottom or Single 1-Up)
  if (appState.currentTemplate === 'appearance') {
    setDynamicPrintPageOrientation('portrait');
    if (appState.caPrintMode === 'dual') {
      for (let i = 0; i < recipients.length; i += 2) {
        appState.currentCertIndex = i;
        renderCertificateCanvas();
        const topHtml = buildCleanCertCloneHtml(document.getElementById("certStageCanvas"), 'print-cert-sheet-a5');

        let bottomHtml = "";
        if (i + 1 < recipients.length) {
          appState.currentCertIndex = i + 1;
          renderCertificateCanvas();
          bottomHtml = buildCleanCertCloneHtml(document.getElementById("certStageCanvas"), 'print-cert-sheet-a5');
        }
        pagesHtml += buildPrintableA5OnA4SheetHtml(topHtml, bottomHtml);
      }
    } else {
      for (let i = 0; i < recipients.length; i++) {
        appState.currentCertIndex = i;
        renderCertificateCanvas();
        const topHtml = buildCleanCertCloneHtml(document.getElementById("certStageCanvas"), 'print-cert-sheet-a5');
        pagesHtml += buildPrintableA5OnA4SheetHtml(topHtml, "");
      }
    }
  } else {
    // Participation & Appreciation: Full A4 Landscape
    setDynamicPrintPageOrientation('landscape');
    for (let i = 0; i < recipients.length; i++) {
      appState.currentCertIndex = i;
      renderCertificateCanvas();
      const canvas = document.getElementById("certStageCanvas");
      pagesHtml += buildPrintableSheetHtml(canvas);
    }
  }

  printBox.innerHTML = pagesHtml;

  // Restore active preview
  appState.currentCertIndex = savedIndex;
  renderCertificateCanvas();

  triggerA4PrintWhenImagesReady(printBox);
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

// --- SIGNATORY CHOOSER, DETAILS & SAVING CONTROLLER ---
function onSigSelect(sigNum, val) {
  const isRoster = String(val).startsWith("roster_");
  const parsedVal = isRoster ? String(val) : parseInt(val, 10);

  if (sigNum === 1) {
    appState.sig1Id = parsedVal;
    appState.customSig1 = null;
  } else if (sigNum === 2) {
    appState.sig2Id = parsedVal;
    appState.customSig2 = null;
  }

  updateSignatoryTitleInputs();
  syncSignatoryChooserUI();
  saveSigPreferences();
  renderCertificateCanvas();
}

function updateSignatoryTitleInputs() {
  const sig1 = getActiveSigObj(1);
  const sig2 = getActiveSigObj(2);

  const name1 = document.getElementById("certSig1NameInput");
  const name2 = document.getElementById("certSig2NameInput");
  const inp1 = document.getElementById("certSig1TitleInput");
  const inp2 = document.getElementById("certSig2TitleInput");
  const off1 = document.getElementById("certSig1OfficeInput");
  const off2 = document.getElementById("certSig2OfficeInput");

  if (name1 && sig1) name1.value = sig1.name || "";
  if (name2 && sig2) name2.value = sig2.name || "";
  if (inp1 && sig1) inp1.value = sig1.title || "";
  if (inp2 && sig2) inp2.value = sig2.title || "";
  if (off1 && sig1) off1.value = sig1.office || "";
  if (off2 && sig2) off2.value = sig2.office || "";
}

function onSigNameInputChange(sigNum, val) {
  const sig = getActiveSigObj(sigNum);
  if (sig) {
    sig.name = val;
    syncSignatoryLayoutDynamicLabels();
    renderCertificateCanvas();
  }
}

function onSigTitleInputChange(sigNum, val) {
  const sig = getActiveSigObj(sigNum);
  if (sig) {
    sig.title = val;
    syncSignatoryLayoutDynamicLabels();
    renderCertificateCanvas();
  }
}

function onSigOfficeInputChange(sigNum, val) {
  const sig = getActiveSigObj(sigNum);
  if (sig) {
    sig.office = val;
    renderCertificateCanvas();
  }
}

async function saveSignatoryTitle(sigNum) {
  const sigId = (sigNum === 1) ? appState.sig1Id : appState.sig2Id;
  const sig = getActiveSigObj(sigNum);
  const nameInp = document.getElementById(sigNum === 1 ? "certSig1NameInput" : "certSig2NameInput");
  const inp = document.getElementById(sigNum === 1 ? "certSig1TitleInput" : "certSig2TitleInput");
  const offInp = document.getElementById(sigNum === 1 ? "certSig1OfficeInput" : "certSig2OfficeInput");

  const nameVal = (nameInp ? nameInp.value : (sig ? sig.name : "")).trim();
  const title = (inp ? inp.value : (sig ? sig.title : "")).trim();
  const officeVal = (offInp ? offInp.value : (sig ? sig.office : "")).trim();
  const statusSpan = document.getElementById(sigNum === 1 ? "sig1SaveStatus" : "sig2SaveStatus");

  if (!title) {
    showToast("Signatory position title cannot be empty.", "warning");
    return;
  }

  if (sig) {
    if (nameVal) sig.name = nameVal;
    sig.title = title;
    sig.office = officeVal;
  }

  // If a MOVE Roster member is selected rather than a DB signatory row, persist in local preferences
  if (typeof sigId === 'string' && sigId.startsWith('roster_')) {
    saveSigPreferences();
    populateSignatorySelects();
    renderCertificateCanvas();
    if (statusSpan) {
      statusSpan.classList.remove("hidden");
      setTimeout(() => statusSpan.classList.add("hidden"), 2500);
    }
    showToastNotification(`Saved: ${sig ? sig.name : 'Signatory'} details updated!`);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/signatories/${sigId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameVal || (sig ? sig.name : ""),
        title: title,
        office: officeVal
      })
    });
    const data = await res.json();
    if (data.success) {
      populateSignatorySelects();
      renderCertificateCanvas();

      if (statusSpan) {
        statusSpan.classList.remove("hidden");
        setTimeout(() => statusSpan.classList.add("hidden"), 2500);
      }
      showToastNotification(`Saved: ${sig ? sig.name : 'Signatory'} details updated in database!`);
    } else {
      showToast("Error saving signatory: " + (data.message || "Unknown error"), "error");
    }
  } catch (err) {
    showToast("Failed to save signatory: : " + err, "error");
  }
}

function onCanvasSigTitleInput(sigNum, text) {
  const sig = getActiveSigObj(sigNum);
  if (sig) {
    sig.title = text.trim();
    const inp = document.getElementById(sigNum === 1 ? "certSig1TitleInput" : "certSig2TitleInput");
    if (inp) inp.value = sig.title;
  }
}

async function onCanvasSigTitleBlur(sigNum, text) {
  const sigId = (sigNum === 1) ? appState.sig1Id : appState.sig2Id;
  const cleanTitle = text.trim();
  const sig = getActiveSigObj(sigNum);
  if (!cleanTitle) return;

  if (sig) sig.title = cleanTitle;
  const inp = document.getElementById(sigNum === 1 ? "certSig1TitleInput" : "certSig2TitleInput");
  if (inp) inp.value = cleanTitle;

  if (typeof sigId === 'string' && sigId.startsWith('roster_')) {
    saveSigPreferences();
    showToastNotification(`Saved: ${sig ? sig.name : 'Signatory'} title updated!`);
    return;
  }

  // Auto-save to SQLite database
  try {
    const res = await fetch(`${API_BASE}/api/signatories/${sigId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: cleanTitle })
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification(`Saved: ${sig ? sig.name : 'Signatory'} title updated!`);
    }
  } catch (err) {
    console.warn("Auto-save signatory title failed:", err);
  }
}

async function onCanvasSigNameBlur(sigNum, text) {
  const sigId = (sigNum === 1) ? appState.sig1Id : appState.sig2Id;
  const cleanName = text.trim();
  const sig = getActiveSigObj(sigNum);
  if (!cleanName || (sig && sig.name === cleanName)) return;

  if (sig) sig.name = cleanName;
  const nameInp = document.getElementById(sigNum === 1 ? "certSig1NameInput" : "certSig2NameInput");
  if (nameInp) nameInp.value = cleanName;

  if (typeof sigId === 'string' && sigId.startsWith('roster_')) {
    saveSigPreferences();
    populateSignatorySelects();
    showToastNotification(`Saved: Signatory name updated!`);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/signatories/${sigId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cleanName })
    });
    const data = await res.json();
    if (data.success) {
      populateSignatorySelects();
      showToastNotification(`Saved: Signatory name updated!`);
    }
  } catch (err) {
    console.warn("Auto-save signatory name failed:", err);
  }
}

function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) {
    showToastNotification(message);
    return;
  }
  const toast = document.createElement("div");
  let bgClass = "bg-slate-900/95 text-white border-slate-700";
  let iconHtml = '<i class="fa-solid fa-circle-info text-sky-400 text-sm shrink-0"></i>';
  if (type === 'success') {
    bgClass = "bg-emerald-950/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/50";
    iconHtml = '<i class="fa-solid fa-circle-check text-emerald-400 text-sm shrink-0"></i>';
  } else if (type === 'error') {
    bgClass = "bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-950/50";
    iconHtml = '<i class="fa-solid fa-circle-xmark text-rose-400 text-sm shrink-0"></i>';
  } else if (type === 'warning') {
    bgClass = "bg-amber-950/95 text-amber-100 border-amber-500/50 shadow-amber-950/50";
    iconHtml = '<i class="fa-solid fa-triangle-exclamation text-amber-400 text-sm shrink-0"></i>';
  }
  toast.className = `app-toast-item border ${bgClass}`;
  toast.innerHTML = `
    ${iconHtml}
    <div class="flex-1 leading-snug break-words">${escapeHtml(message)}</div>
    <button type="button" onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white ml-1 text-xs shrink-0 cursor-pointer">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-leave');
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

function showToastNotification(message) {
  showToast(message, 'success', 2800);
}

function showCanvasSaveIndicator(element, text) {
  if (!element) return;
  const parent = element.parentElement || document.body;
  let pill = parent.querySelector(".canvas-inline-saved-pill");
  if (!pill) {
    pill = document.createElement("div");
    pill.className = "canvas-inline-saved-pill no-print absolute bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md shadow-2xl z-50 flex items-center gap-1.5 transition-all duration-200 pointer-events-none border border-emerald-300";
    if (window.getComputedStyle(parent).position === 'static') {
      parent.style.position = "relative";
    }
    parent.appendChild(pill);
  }
  const topPos = Math.max(0, element.offsetTop - 24);
  pill.style.top = `${topPos}px`;
  pill.style.left = "50%";
  pill.style.transform = "translateX(-50%)";
  pill.innerHTML = `<i class="fa-solid fa-check text-[10px]"></i> <span>${escapeHtml(text || 'Saved to Database')}</span>`;
  pill.style.opacity = "1";
  if (pill._hideTimer) clearTimeout(pill._hideTimer);
  pill._hideTimer = setTimeout(() => {
    if (pill) {
      pill.style.opacity = "0";
    }
  }, 2200);
}

function highlightSidebarSaveStatus(key) {
  let statusId = null;
  if (key === 'header_line_1') statusId = 'hdr1SaveStatus';
  else if (key === 'header_line_2') statusId = 'hdr2SaveStatus';
  else if (key === 'header_line_3') statusId = 'hdr3SaveStatus';
  else if (key.includes('title')) statusId = 'titleSaveStatus';
  else if (key.includes('intro')) statusId = 'introSaveStatus';
  else if (key.includes('citation')) statusId = 'citationSaveStatus';

  if (statusId) {
    const s = document.getElementById(statusId);
    if (s) {
      s.classList.remove("hidden");
      setTimeout(() => s.classList.add("hidden"), 3000);
    }
  }
}


function syncSignatoryLayoutDynamicLabels() {
  const sig1 = getActiveSigObj(1);
  const sig2 = getActiveSigObj(2);
  const s1Short = (sig1?.name || 'Signatory 1').split(',')[0];
  const s2Short = (sig2?.name || 'Signatory 2').split(',')[0];

  const layoutSelects = [
    document.getElementById("caSignatoryChoice"),
    document.getElementById("stageQuickSigLayout")
  ];

  layoutSelects.forEach(sel => {
    if (!sel) return;
    Array.from(sel.options).forEach(opt => {
      if (opt.value === 'both') {
        opt.textContent = `👥 Dual Signatories (${s1Short} & ${s2Short})`;
      } else if (opt.value === 'sig2_right') {
        opt.textContent = `👤 Single: ${s2Short} — Right-Aligned`;
      } else if (opt.value === 'sig2_center') {
        opt.textContent = `👤 Single: ${s2Short} — Centered`;
      } else if (opt.value === 'sig1_right') {
        opt.textContent = `👤 Single: ${s1Short} — Right-Aligned`;
      } else if (opt.value === 'sig1_center') {
        opt.textContent = `👤 Single: ${s1Short} — Centered`;
      }
    });
  });
}

function syncSignatoryChooserUI() {
  const activeLayout = getActiveSignatoryLayout();

  const caChoiceSel = document.getElementById("caSignatoryChoice");
  if (caChoiceSel) caChoiceSel.value = activeLayout;

  const quickLayoutSel = document.getElementById("stageQuickSigLayout");
  if (quickLayoutSel) quickLayoutSel.value = activeLayout;

  // Dim or highlight Signatory 1 / Signatory 2 quick pickers based on active layout
  const wrap1 = document.getElementById("stageQuickSig1Wrap");
  const wrap2 = document.getElementById("stageQuickSig2Wrap");
  const usesSig1 = activeLayout === 'both' || activeLayout === 'sig1_right' || activeLayout === 'sig1_center' || activeLayout === 'sig1';
  const usesSig2 = activeLayout === 'both' || activeLayout === 'sig2_right' || activeLayout === 'sig2_center' || activeLayout === 'sig2';
  if (wrap1) wrap1.classList.toggle("opacity-40", !usesSig1);
  if (wrap2) wrap2.classList.toggle("opacity-40", !usesSig2);

  const sel1 = document.getElementById("certSigSelect1");
  const sel2 = document.getElementById("certSigSelect2");
  const qSel1 = document.getElementById("stageQuickSig1Person");
  const qSel2 = document.getElementById("stageQuickSig2Person");

  if (sel1) sel1.value = String(appState.sig1Id);
  if (sel2) sel2.value = String(appState.sig2Id);
  if (qSel1) qSel1.value = String(appState.sig1Id);
  if (qSel2) qSel2.value = String(appState.sig2Id);

  // Sync detail checkboxes
  const chkName = document.getElementById("chkShowSigName");
  const chkTitle = document.getElementById("chkShowSigTitle");
  const chkOffice = document.getElementById("chkShowSigOffice");
  const chkLine = document.getElementById("chkShowSigLine");
  const qChkEsig = document.getElementById("stageQuickChkEsig");
  const qChkTitle = document.getElementById("stageQuickChkTitle");
  const qChkOffice = document.getElementById("stageQuickChkOffice");
  const sideChkEsig = document.getElementById("certToggleSignatures") || document.getElementById("certToggleSigImages");

  if (chkName) chkName.checked = appState.showSigName !== false;
  if (chkTitle) chkTitle.checked = appState.showSigTitle !== false;
  if (chkOffice) chkOffice.checked = appState.showSigOffice === true;
  if (chkLine) chkLine.checked = appState.showSigLine !== false;
  if (qChkEsig) qChkEsig.checked = appState.showSignatures !== false;
  if (sideChkEsig) sideChkEsig.checked = appState.showSignatures !== false;
  if (qChkTitle) qChkTitle.checked = appState.showSigTitle !== false;
  if (qChkOffice) qChkOffice.checked = appState.showSigOffice === true;

  syncSignatoryLayoutDynamicLabels();
}

function populateSignatorySelects() {
  const sel1 = document.getElementById("certSigSelect1");
  const sel2 = document.getElementById("certSigSelect2");
  const qSel1 = document.getElementById("stageQuickSig1Person");
  const qSel2 = document.getElementById("stageQuickSig2Person");

  const officialOptions = appState.signatories.map(s => {
    return `<option value="${s.id}">⭐ ${escapeHtml(s.name)} (${escapeHtml(s.title)})</option>`;
  }).join("");

  // Also allow choosing any Officer or Member from the MOVE Roster as a Signatory
  const rosterPool = (appState.fullRoster && appState.fullRoster.length > 0) ? appState.fullRoster : (appState.roster || []);
  const officialNames = new Set(appState.signatories.map(s => (s.name || '').trim().toUpperCase()));
  const officers = rosterPool.filter(r => r.is_officer && !officialNames.has((r.full_name || '').trim().toUpperCase()));
  const otherMembers = rosterPool.filter(r => !r.is_officer && !officialNames.has((r.full_name || '').trim().toUpperCase()));

  let optionsHtml = `<optgroup label="Official Signatories (With E-Signature Support)">${officialOptions}</optgroup>`;
  if (officers.length > 0) {
    optionsHtml += `<optgroup label="MOVE Chapter Officers">${officers.map(r => `<option value="roster_${r.id}">🎖️ ${escapeHtml(r.full_name)} (${escapeHtml(r.position || 'MOVE Officer')})</option>`).join("")}</optgroup>`;
  }
  if (otherMembers.length > 0) {
    optionsHtml += `<optgroup label="MOVE Roster & Directory">${otherMembers.map(r => `<option value="roster_${r.id}">👤 ${escapeHtml(r.full_name)} (${escapeHtml(r.position || r.office || 'Member')})</option>`).join("")}</optgroup>`;
  }

  [sel1, sel2, qSel1, qSel2].forEach(sel => {
    if (sel) sel.innerHTML = optionsHtml;
  });

  if (sel1) sel1.value = String(appState.sig1Id);
  if (sel2) sel2.value = String(appState.sig2Id);
  if (qSel1) qSel1.value = String(appState.sig1Id);
  if (qSel2) qSel2.value = String(appState.sig2Id);

  updateSignatoryTitleInputs();
  syncSignatoryChooserUI();

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
    html += filteredRoster.slice(0, 10).map(r => {
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
        html += filteredRoster.slice(0, 10).map(r => {
          const isEnrolled = enrolledNames.has((r.full_name || '').trim().toUpperCase());
          const label = isEnrolled ? `⚠️ [ALREADY ENROLLED] ${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')} (${escapeHtml(r.office || '-')})` : `${escapeHtml(r.full_name)} &bull; ${escapeHtml(r.position || 'Member')} (${escapeHtml(r.office || '-')})`;
          return `<option value="${r.id}" ${isEnrolled ? 'class="text-amber-400 font-medium"' : ''}>${label}</option>`;
        }).join("");
        html += `</optgroup>`;
      }
      if (poolMatches.length > 0) {
        html += `<optgroup label="City Municipal Employee Pool (${poolMatches.length})">`;
        html += poolMatches.slice(0, 10).map(p => {
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
        const res = await fetch(`${API_BASE}/api/search-pool?q=${encodeURIComponent(q)}&limit=10`);
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
