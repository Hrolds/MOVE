// ==========================================================================
// MOVE BAGUIO CHAPTER — CERTIFICATE OF APPEARANCE (CA) ENGINE
// Civil Service / LGU Baguio Attendance & Appearance Accreditation
// Modeled directly after "CA MOVE TEMPLATE.docx"
// ==========================================================================

const caState = {
  selectedActivityId: 'ACT-KITCHEN-2',
  mode: 'group', // 'group' (official roster table) or 'individual' (single employee sheet)
  currentMemberIndex: 0,
  title: 'MEN IN THE KITCHEN 2',
  theme: 'Love Served in the Kitchen',
  date: 'December 9, 2025',
  venue: 'CDRRMO Building, CEO Compound, Lower Rock Quarry, Baguio City',
  purpose: 'This certification is issued to support the non-entry of on the daily time records above date.',
  issueDate: 'Issued this 9th of December 2025, Baguio City.',
  signatoryName: 'BENJAMIN B. MAGALONG',
  signatoryTitle1: 'City Mayor',
  signatoryTitle2: 'LCAT-VAWC Chairperson',
  initials: '/drmo/ctb',
  showSignature: true,
  signatureWidth: 150,
  showCityLogo: true,
  showMoveLogo: true,
  filterPresentOnly: true,
  searchTerm: '',
  selectedMemberIds: new Set(),
  zoom: 100
};

// --- INITIALIZATION ---
function initAppearanceStudio() {
  populateCaActivityDropdown();
  
  // Set default activity if present
  const defaultAct = activitiesList.find(a => a.id === caState.selectedActivityId) || activitiesList[0];
  if (defaultAct) {
    applyCaActivity(defaultAct);
  } else {
    refreshCaParticipants();
  }

  // Populate UI inputs from state
  syncCaInputsFromState();
  renderAppearancePreview();
  renderCaAttendeesList();
}

// --- POPULATE ACTIVITY DROPDOWN ---
function populateCaActivityDropdown() {
  const sel = document.getElementById('caActivitySelect');
  if (!sel) return;
  sel.innerHTML = '';

  activitiesList.forEach(act => {
    const opt = document.createElement('option');
    opt.value = act.id;
    const partCount = act.participants ? act.participants.length : 0;
    const presCount = act.participants ? act.participants.filter(p => p.isPresent).length : 0;
    opt.textContent = `${act.title} (${presCount}/${partCount} present) - ${act.date || ''}`;
    if (act.id === caState.selectedActivityId) opt.selected = true;
    sel.appendChild(opt);
  });
}

// --- APPLY SELECTED ACTIVITY ---
function applyCaActivity(act) {
  if (!act) return;
  caState.selectedActivityId = act.id;
  caState.title = act.title || 'Official MOVE Activity';
  caState.theme = act.shortDescription || (act.id === 'ACT-KITCHEN-2' ? 'Love Served in the Kitchen' : '');
  caState.date = act.date || 'December 9, 2025';
  caState.venue = act.venue || 'Baguio City';
  
  if (act.date) {
    caState.issueDate = `Issued this ${formatCaDateOrd(act.date)}, Baguio City.`;
  }
  
  refreshCaParticipants();
  syncCaInputsFromState();
}

function formatCaDateOrd(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const s = ["th", "st", "nd", "rd"];
      const v = day % 100;
      const ord = s[(v - 20) % 10] || s[v] || s[0];
      const month = d.toLocaleString('en-US', { month: 'long' });
      const year = d.getFullYear();
      return `${day}${ord} of ${month} ${year}`;
    }
  } catch(e) {}
  return dateStr;
}

// --- REFRESH PARTICIPANTS FOR CA ---
function refreshCaParticipants() {
  const act = activitiesList.find(a => a.id === caState.selectedActivityId);
  caState.selectedMemberIds.clear();
  
  if (act && act.participants) {
    act.participants.forEach(p => {
      if (!caState.filterPresentOnly || p.isPresent) {
        caState.selectedMemberIds.add(p.id);
      }
    });
  }
  caState.currentMemberIndex = 0;
}

// --- SYNC STATE TO/FROM INPUTS ---
function syncCaInputsFromState() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : '';
  };
  const setChecked = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };

  setVal('caActTitle', caState.title);
  setVal('caActTheme', caState.theme);
  setVal('caActDate', caState.date);
  setVal('caActVenue', caState.venue);
  setVal('caPurposeText', caState.purpose);
  setVal('caIssueDate', caState.issueDate);
  setVal('caSignatoryName', caState.signatoryName);
  setVal('caSignatoryTitle1', caState.signatoryTitle1);
  setVal('caSignatoryTitle2', caState.signatoryTitle2);
  setVal('caInitials', caState.initials);
  setVal('caSigWidth', caState.signatureWidth);
  const wLabel = document.getElementById('caSigWidthVal');
  if (wLabel) wLabel.textContent = `${caState.signatureWidth}px`;

  setChecked('caShowSignature', caState.showSignature);
  setChecked('caShowCityLogo', caState.showCityLogo);
  setChecked('caShowMoveLogo', caState.showMoveLogo);
  setChecked('caFilterPresentOnly', caState.filterPresentOnly);

  // Update mode tabs
  const tabGroup = document.getElementById('caTabGroup');
  const tabInd = document.getElementById('caTabIndividual');
  if (tabGroup && tabInd) {
    if (caState.mode === 'group') {
      tabGroup.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-xl transition bg-move-navy-900 text-white shadow-sm flex items-center justify-center gap-1.5';
      tabInd.className = 'flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition text-slate-600 hover:text-move-navy-900 hover:bg-slate-100 flex items-center justify-center gap-1.5';
    } else {
      tabGroup.className = 'flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition text-slate-600 hover:text-move-navy-900 hover:bg-slate-100 flex items-center justify-center gap-1.5';
      tabInd.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-xl transition bg-move-navy-900 text-white shadow-sm flex items-center justify-center gap-1.5';
    }
  }

  // Toggle individual navigator visibility
  const indNav = document.getElementById('caIndividualNav');
  if (indNav) indNav.classList.toggle('hidden', caState.mode !== 'individual');
}

function handleCaInputChange(field, val) {
  caState[field] = val;
  if (field === 'signatureWidth') {
    const wLabel = document.getElementById('caSigWidthVal');
    if (wLabel) wLabel.textContent = `${val}px`;
  }
  renderAppearancePreview();
}

function handleCaActivityChange(actId) {
  const act = activitiesList.find(a => a.id === actId);
  if (act) {
    applyCaActivity(act);
    renderAppearancePreview();
    renderCaAttendeesList();
  }
}

function setCaMode(mode) {
  caState.mode = mode;
  syncCaInputsFromState();
  renderAppearancePreview();
  renderCaAttendeesList();
}

function setCaFilterPresentOnly(checked) {
  caState.filterPresentOnly = checked;
  refreshCaParticipants();
  renderAppearancePreview();
  renderCaAttendeesList();
}

// --- GET ACTIVE PARTICIPANTS ---
function getActiveCaParticipants() {
  const act = activitiesList.find(a => a.id === caState.selectedActivityId);
  if (!act || !act.participants) return [];
  
  return act.participants.filter(p => {
    if (caState.filterPresentOnly && !p.isPresent) return false;
    return caState.selectedMemberIds.has(p.id);
  });
}

function getAllActivityParticipants() {
  const act = activitiesList.find(a => a.id === caState.selectedActivityId);
  if (!act || !act.participants) return [];
  return act.participants;
}

// --- ATTENDEE SELECTION LIST ---
function renderCaAttendeesList() {
  const container = document.getElementById('caAttendeesList');
  if (!container) return;

  const allParts = getAllActivityParticipants();
  const search = (caState.searchTerm || '').toLowerCase();
  
  const filtered = allParts.filter(p => {
    if (caState.filterPresentOnly && !p.isPresent) return false;
    if (search) {
      const matchName = (p.name || '').toLowerCase().includes(search);
      const matchOff = (p.office || '').toLowerCase().includes(search);
      const matchPos = (p.position || '').toLowerCase().includes(search);
      return matchName || matchOff || matchPos;
    }
    return true;
  });

  const countBadge = document.getElementById('caAttendeesCountBadge');
  if (countBadge) {
    const selectedCount = filtered.filter(p => caState.selectedMemberIds.has(p.id)).length;
    countBadge.textContent = `${selectedCount} of ${filtered.length} selected`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs">
        <i class="fa-solid fa-users-slash text-2xl mb-2 text-slate-300"></i>
        <p>No attendees match current filter</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((p, idx) => {
    const isSelected = caState.selectedMemberIds.has(p.id);
    const isPresent = !!p.isPresent;
    const isCurrentInd = caState.mode === 'individual' && getActiveCaParticipants()[caState.currentMemberIndex]?.id === p.id;

    return `
      <div onclick="selectCaAttendeeRow('${p.id}')"
           class="p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
             isCurrentInd 
               ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' 
               : isSelected 
                 ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100' 
                 : 'bg-white border-dashed border-slate-200 opacity-60 hover:opacity-100'
           }">
        <div class="flex items-center gap-2.5 min-w-0">
          <input type="checkbox" ${isSelected ? 'checked' : ''} 
                 onclick="event.stopPropagation(); toggleCaAttendee('${p.id}', this.checked)"
                 class="rounded text-move-orange-500 focus:ring-move-orange-400 cursor-pointer">
          <div class="min-w-0">
            <div class="text-xs font-bold text-move-navy-900 truncate flex items-center gap-1.5">
              <span>${p.name || 'Unnamed Attendee'}</span>
              ${isPresent ? '<span class="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">Present</span>' : '<span class="text-[9px] px-1 py-0.2 bg-slate-100 text-slate-600 rounded">Abs/Exc</span>'}
            </div>
            <div class="text-[10px] text-slate-500 truncate flex items-center gap-1">
              <span class="font-semibold text-move-orange-600">${p.office || 'N/A'}</span>
              <span>&bull;</span>
              <span class="truncate">${p.position || 'Employee'}</span>
            </div>
          </div>
        </div>
        <div class="shrink-0 text-right pl-2">
          <span class="text-[10px] font-mono text-slate-400">#${idx + 1}</span>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCaAttendee(id, isChecked) {
  if (isChecked) {
    caState.selectedMemberIds.add(id);
  } else {
    caState.selectedMemberIds.delete(id);
  }
  renderAppearancePreview();
  renderCaAttendeesList();
}

function selectCaAttendeeRow(id) {
  if (caState.mode === 'individual') {
    const list = getActiveCaParticipants();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      caState.currentMemberIndex = idx;
      renderAppearancePreview();
      renderCaAttendeesList();
      return;
    }
  }
  // Toggle checkbox if clicked
  const isSelected = caState.selectedMemberIds.has(id);
  toggleCaAttendee(id, !isSelected);
}

function toggleCaSelectAll(selectAll) {
  const allParts = getAllActivityParticipants();
  allParts.forEach(p => {
    if (!caState.filterPresentOnly || p.isPresent) {
      if (selectAll) caState.selectedMemberIds.add(p.id);
      else caState.selectedMemberIds.delete(p.id);
    }
  });
  renderAppearancePreview();
  renderCaAttendeesList();
}

function handleCaSearchInput(val) {
  caState.searchTerm = val;
  renderCaAttendeesList();
}

// --- INDIVIDUAL MODE NAVIGATION ---
function changeCaIndividualMember(delta) {
  const list = getActiveCaParticipants();
  if (list.length === 0) return;
  caState.currentMemberIndex = (caState.currentMemberIndex + delta + list.length) % list.length;
  renderAppearancePreview();
  renderCaAttendeesList();
}

// --- LIVE A4 PORTRAIT PREVIEW RENDERER ---
function renderAppearancePreview() {
  const stage = document.getElementById('caPreviewStage');
  if (!stage) return;

  const participants = getActiveCaParticipants();
  const themeHtml = caState.theme ? ` with the theme “<strong>${escapeHtml(caState.theme)}</strong>”` : '';

  // Update Individual Navigator badge
  const indBadge = document.getElementById('caIndCurrentBadge');
  if (indBadge) {
    if (participants.length > 0) {
      indBadge.textContent = `${caState.currentMemberIndex + 1} of ${participants.length}`;
    } else {
      indBadge.textContent = `0 of 0`;
    }
  }

  let bodyContentHtml = '';

  if (caState.mode === 'group') {
    // --- GROUP ROSTER TABLE MODE ---
    let tableRows = '';
    if (participants.length === 0) {
      tableRows = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 italic text-sm">
            No participants selected. Please select participants from the left attendees panel.
          </td>
        </tr>
      `;
    } else {
      tableRows = participants.map((p, idx) => `
        <tr class="${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} border-b border-slate-200">
          <td class="py-1 px-2 text-center text-[11px] font-mono font-bold text-slate-700">${idx + 1}</td>
          <td class="py-1 px-2 text-[12px] font-bold text-slate-900">${escapeHtml(p.name || '')}</td>
          <td class="py-1 px-2 text-[11px] text-slate-800 leading-tight">${escapeHtml(p.position || '')}</td>
          <td class="py-1 px-2 text-center text-[11px] font-semibold text-slate-800">${escapeHtml(p.office || '')}</td>
          <td class="py-1 px-2 text-center text-[11px] text-slate-700">${escapeHtml(p.role || 'Participant')}</td>
        </tr>
      `).join('');
    }

    bodyContentHtml = `
      <div class="space-y-4">
        <!-- Certification Clause -->
        <p class="text-justify text-[13px] text-slate-900 leading-relaxed indent-8">
          This is to certify that the following employees appeared as <strong>Participant/Facilitator</strong> during the “<strong>${escapeHtml(caState.title)}</strong>”${themeHtml} on <strong>${escapeHtml(caState.date)}</strong> at the <strong>${escapeHtml(caState.venue)}</strong>:
        </p>

        <!-- Official Participants Table -->
        <div class="border border-slate-300 rounded overflow-hidden shadow-xs my-2">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300 text-slate-900 text-[11px] uppercase tracking-wider font-extrabold">
                <th class="py-1.5 px-2 text-center w-10">No.</th>
                <th class="py-1.5 px-2">Full Name</th>
                <th class="py-1.5 px-2">Position Title</th>
                <th class="py-1.5 px-2 text-center w-24">Office</th>
                <th class="py-1.5 px-2 text-center w-28">Role</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    // --- INDIVIDUAL CERTIFICATION MODE ---
    const currMember = participants[caState.currentMemberIndex] || {
      name: 'EMPLOYEE FULL NAME',
      position: 'Official Position Title',
      office: 'DEPARTMENT / OFFICE',
      role: 'Participant'
    };

    bodyContentHtml = `
      <div class="space-y-8 my-6">
        <!-- Main Certification Statement -->
        <p class="text-justify text-[14px] text-slate-900 leading-loose indent-10">
          This is to certify that
        </p>

        <div class="text-center py-4 my-2 border-y-2 border-slate-300 bg-slate-50/50">
          <div class="text-xl font-black uppercase text-move-navy-900 tracking-wide font-cinzel">
            ${escapeHtml(currMember.name || '')}
          </div>
          <div class="text-xs font-bold text-move-orange-600 mt-1 uppercase tracking-wider">
            ${escapeHtml(currMember.position || '')} &bull; <span class="text-slate-800">${escapeHtml(currMember.office || '')}</span>
          </div>
        </div>

        <p class="text-justify text-[13.5px] text-slate-900 leading-relaxed indent-10">
          appeared as <strong>${escapeHtml(currMember.role || 'Participant')}</strong> during the “<strong>${escapeHtml(caState.title)}</strong>”${themeHtml} on <strong>${escapeHtml(caState.date)}</strong> at the <strong>${escapeHtml(caState.venue)}</strong>.
        </p>
      </div>
    `;
  }

  // Signature Block
  const sigImgHtml = caState.showSignature ? `
    <div class="flex justify-end -mb-7 relative z-10 pointer-events-none select-none">
      <img src="signature%20(15).png" alt="Signature" 
           style="width: ${caState.signatureWidth}px; max-height: 80px;" 
           class="object-contain drop-shadow-xs">
    </div>
  ` : `<div class="h-10"></div>`;

  stage.innerHTML = `
    <!-- A4 PORTRAIT SHEET CONTAINER -->
    <div id="caActiveSheet" class="ca-portrait-sheet bg-white text-slate-900 shadow-2xl mx-auto relative select-text"
         style="width: 210mm; min-height: 297mm; padding: 22mm 22mm 18mm 22mm; font-family: 'Arial', sans-serif;">
      
      <!-- ================= HEADER SECTION ================= -->
      <div class="flex items-center justify-between pb-3 border-b-2 border-slate-800">
        <!-- Left Logo: City Hall Seal -->
        <div class="w-20 h-20 flex items-center justify-center shrink-0">
          ${caState.showCityLogo ? `<img src="CITY%20HALL%20LOGO.png" alt="City Government of Baguio" class="w-full h-full object-contain">` : ''}
        </div>

        <!-- Center Header Typography -->
        <div class="text-center px-4 flex-1">
          <div class="text-[12px] font-bold uppercase tracking-wider text-slate-800">
            Republic of the Philippines
          </div>
          <div class="text-[13px] font-black uppercase tracking-tight text-slate-900">
            CITY GOVERNMENT OF BAGUIO
          </div>
          <div class="text-[11px] font-extrabold uppercase tracking-wide text-move-orange-600 mt-0.5">
            Men Opposed to Violence Against Women Everywhere
          </div>
          <div class="text-[9.5px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
            Baguio City Chapter &bull; Local Committee on Anti-VAWC
          </div>
        </div>

        <!-- Right Logo: MOVE Baguio Seal -->
        <div class="w-20 h-20 flex items-center justify-center shrink-0">
          ${caState.showMoveLogo ? `<img src="MOVE%20BAGUIO%20LOGO.png" alt="MOVE Baguio Chapter" class="w-full h-full object-contain">` : ''}
        </div>
      </div>

      <!-- ================= DOCUMENT TITLE ================= -->
      <div class="text-center py-6">
        <h1 class="text-2xl font-black text-slate-900 tracking-wider uppercase font-cinzel"
            style="font-family: 'MS Reference Sans Serif', 'Arial', sans-serif; letter-spacing: 2px;">
          CERTIFICATE OF APPEARANCE
        </h1>
        <div class="w-24 h-0.5 bg-move-orange-500 mx-auto mt-2"></div>
      </div>

      <!-- ================= BODY CONTENT ================= -->
      <div class="flex-1 py-1">
        ${bodyContentHtml}

        <!-- Purpose Clause -->
        <div class="pt-4">
          <p class="text-justify text-[13px] text-slate-900 leading-relaxed indent-8">
            ${escapeHtml(caState.purpose)}
          </p>
        </div>

        <!-- Issuance Line -->
        <div class="pt-5 pb-8">
          <p class="text-[13px] text-slate-900 leading-relaxed">
            ${escapeHtml(caState.issueDate)}
          </p>
        </div>

        <!-- ================= SIGNATORY BLOCK ================= -->
        <div class="pt-4 flex items-end justify-between">
          <!-- Control Initials (DRMO / CTB) -->
          <div class="text-left">
            <span class="text-[11px] font-mono text-slate-500 lowercase tracking-wider">
              ${escapeHtml(caState.initials)}
            </span>
          </div>

          <!-- Official Signatory (Benjamin B. Magalong) -->
          <div class="text-center w-72">
            ${sigImgHtml}
            <div class="text-[14px] font-black uppercase text-slate-900 tracking-wider">
              ${escapeHtml(caState.signatoryName)}
            </div>
            <div class="text-[12px] font-bold text-slate-800">
              ${escapeHtml(caState.signatoryTitle1)}
            </div>
            <div class="text-[11px] text-slate-600 font-semibold">
              ${escapeHtml(caState.signatoryTitle2)}
            </div>
          </div>
        </div>
      </div>

      <!-- ================= FOOTER SECTION ================= -->
      <div class="pt-6 border-t border-slate-300 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <div>Tel. No. (074)-442-89-20</div>
        <div class="text-slate-400 font-cinzel uppercase tracking-wider text-[9px]">Official Public Document &bull; MOVE Baguio Chapter</div>
        <div>website: <a href="http://www.baguio.gov.ph" target="_blank" class="text-move-orange-600 hover:underline">http://www.baguio.gov.ph</a></div>
      </div>

    </div>
  `;
}

// --- ZOOM CONTROLS ---
function setCaZoom(zoomLevel) {
  caState.zoom = zoomLevel;
  const stage = document.getElementById('caPreviewStage');
  if (stage) {
    stage.style.transform = `scale(${zoomLevel / 100})`;
    stage.style.transformOrigin = 'top center';
  }
  const badge = document.getElementById('caZoomVal');
  if (badge) badge.textContent = `${zoomLevel}%`;
}

// --- PRINTING ENGINE (A4 PORTRAIT) ---
function printCertificateOfAppearance() {
  const container = document.getElementById('caPrintContainer');
  if (!container) return;

  const sheet = document.getElementById('caActiveSheet');
  if (!sheet) return;

  // Clone active sheet into dedicated print container
  container.innerHTML = '';
  const clone = sheet.cloneNode(true);
  clone.id = 'caSheetToPrint';
  clone.classList.add('ca-print-page');
  container.appendChild(clone);

  // Set printing class
  document.body.classList.add('printing-ca');

  window.print();

  setTimeout(() => {
    document.body.classList.remove('printing-ca');
  }, 1000);
}

// --- BATCH PRINT ALL INDIVIDUAL CAs ---
function batchPrintAllAppearance() {
  const participants = getActiveCaParticipants();
  if (participants.length === 0) {
    showToast('No participants selected for printing', 'fa-triangle-exclamation');
    return;
  }

  const container = document.getElementById('caPrintContainer');
  if (!container) return;
  container.innerHTML = '';

  const themeHtml = caState.theme ? ` with the theme “<strong>${escapeHtml(caState.theme)}</strong>”` : '';
  const sigImgHtml = caState.showSignature ? `
    <div class="flex justify-end -mb-7 relative z-10 pointer-events-none select-none">
      <img src="signature%20(15).png" alt="Signature" 
           style="width: ${caState.signatureWidth}px; max-height: 80px;" 
           class="object-contain drop-shadow-xs">
    </div>
  ` : `<div class="h-10"></div>`;

  participants.forEach((currMember, idx) => {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'ca-portrait-sheet ca-print-page bg-white text-slate-900 mx-auto select-text';
    pageDiv.style.cssText = 'width: 210mm; min-height: 297mm; padding: 22mm 22mm 18mm 22mm; font-family: Arial, sans-serif; page-break-after: always; display: flex; flex-direction: column; justify-content: space-between;';

    pageDiv.innerHTML = `
      <!-- HEADER -->
      <div class="flex items-center justify-between pb-3 border-b-2 border-slate-800">
        <div class="w-20 h-20 flex items-center justify-center shrink-0">
          ${caState.showCityLogo ? `<img src="CITY%20HALL%20LOGO.png" alt="City Government of Baguio" class="w-full h-full object-contain">` : ''}
        </div>
        <div class="text-center px-4 flex-1">
          <div class="text-[12px] font-bold uppercase tracking-wider text-slate-800">Republic of the Philippines</div>
          <div class="text-[13px] font-black uppercase tracking-tight text-slate-900">CITY GOVERNMENT OF BAGUIO</div>
          <div class="text-[11px] font-extrabold uppercase tracking-wide text-move-orange-600 mt-0.5">Men Opposed to Violence Against Women Everywhere</div>
          <div class="text-[9.5px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Baguio City Chapter &bull; Local Committee on Anti-VAWC</div>
        </div>
        <div class="w-20 h-20 flex items-center justify-center shrink-0">
          ${caState.showMoveLogo ? `<img src="MOVE%20BAGUIO%20LOGO.png" alt="MOVE Baguio Chapter" class="w-full h-full object-contain">` : ''}
        </div>
      </div>

      <!-- TITLE -->
      <div class="text-center py-6">
        <h1 class="text-2xl font-black text-slate-900 tracking-wider uppercase" style="font-family: 'MS Reference Sans Serif', 'Arial', sans-serif; letter-spacing: 2px;">
          CERTIFICATE OF APPEARANCE
        </h1>
        <div class="w-24 h-0.5 bg-move-orange-500 mx-auto mt-2"></div>
      </div>

      <!-- BODY -->
      <div class="flex-1 py-1">
        <div class="space-y-8 my-6">
          <p class="text-justify text-[14px] text-slate-900 leading-loose indent-10">This is to certify that</p>
          <div class="text-center py-4 my-2 border-y-2 border-slate-300 bg-slate-50/50">
            <div class="text-xl font-black uppercase text-move-navy-900 tracking-wide font-cinzel">
              ${escapeHtml(currMember.name || '')}
            </div>
            <div class="text-xs font-bold text-move-orange-600 mt-1 uppercase tracking-wider">
              ${escapeHtml(currMember.position || '')} &bull; <span class="text-slate-800">${escapeHtml(currMember.office || '')}</span>
            </div>
          </div>
          <p class="text-justify text-[13.5px] text-slate-900 leading-relaxed indent-10">
            appeared as <strong>${escapeHtml(currMember.role || 'Participant')}</strong> during the “<strong>${escapeHtml(caState.title)}</strong>”${themeHtml} on <strong>${escapeHtml(caState.date)}</strong> at the <strong>${escapeHtml(caState.venue)}</strong>.
          </p>
        </div>

        <div class="pt-4">
          <p class="text-justify text-[13px] text-slate-900 leading-relaxed indent-8">${escapeHtml(caState.purpose)}</p>
        </div>

        <div class="pt-5 pb-8">
          <p class="text-[13px] text-slate-900 leading-relaxed">${escapeHtml(caState.issueDate)}</p>
        </div>

        <!-- SIGNATORY -->
        <div class="pt-4 flex items-end justify-between">
          <div class="text-left">
            <span class="text-[11px] font-mono text-slate-500 lowercase tracking-wider">${escapeHtml(caState.initials)}</span>
          </div>
          <div class="text-center w-72">
            ${sigImgHtml}
            <div class="text-[14px] font-black uppercase text-slate-900 tracking-wider">${escapeHtml(caState.signatoryName)}</div>
            <div class="text-[12px] font-bold text-slate-800">${escapeHtml(caState.signatoryTitle1)}</div>
            <div class="text-[11px] text-slate-600 font-semibold">${escapeHtml(caState.signatoryTitle2)}</div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="pt-6 border-t border-slate-300 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <div>Tel. No. (074)-442-89-20</div>
        <div class="text-slate-400 font-cinzel uppercase tracking-wider text-[9px]">Official Public Document &bull; MOVE Baguio Chapter</div>
        <div>website: <a href="http://www.baguio.gov.ph" target="_blank" class="text-move-orange-600 hover:underline">http://www.baguio.gov.ph</a></div>
      </div>
    `;

    container.appendChild(pageDiv);
  });

  document.body.classList.add('printing-ca');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-ca');
  }, 1000);
}

// --- EXPORT TO OFFICIAL WORD (.DOCX) ---
async function exportCertificateOfAppearanceDocx() {
  const participants = getActiveCaParticipants();
  
  const payload = {
    activityTitle: caState.title,
    theme: caState.theme,
    date: caState.date,
    venue: caState.venue,
    purpose: caState.purpose,
    issueDate: caState.issueDate,
    signatoryName: caState.signatoryName,
    signatoryTitle1: caState.signatoryTitle1,
    signatoryTitle2: caState.signatoryTitle2,
    initials: caState.initials,
    mode: caState.mode,
    participants: participants,
    individualMember: caState.mode === 'individual' ? participants[caState.currentMemberIndex] : null
  };

  showToast('Generating official Word document...', 'fa-file-word');

  try {
    const res = await fetch('http://127.0.0.1:8765/api/export-ca-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const blob = await res.blob();
      const filename = `Certificate_of_Appearance_${(caState.title || 'MOVE').replace(/[^a-zA-Z0-9_-]/g, '_')}_${caState.mode}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Word document (.docx) exported successfully!', 'fa-check');
      return;
    }
  } catch (err) {
    console.warn('Sync server docx generation not reached, falling back to client document export:', err);
  }

  // Pure client-side HTML-Word document fallback
  generateClientSideDocx(payload);
}

// Pure Client-side Word-compatible HTML export fallback
function generateClientSideDocx(data) {
  const safeTitle = (data.activityTitle || 'MOVE').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Certificate_of_Appearance_${safeTitle}_${data.mode}.doc`;

  let participantsHtml = '';
  if (data.mode === 'group') {
    participantsHtml = `
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt; margin-top: 15px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: left;">
            <th style="width: 40px; text-align: center;">No.</th>
            <th>Full Name</th>
            <th>Position Title</th>
            <th style="width: 100px; text-align: center;">Office</th>
            <th style="width: 100px; text-align: center;">Role</th>
          </tr>
        </thead>
        <tbody>
          ${(data.participants || []).map((p, i) => `
            <tr>
              <td style="text-align: center;">${i + 1}</td>
              <td style="font-weight: bold;">${escapeHtml(p.name || '')}</td>
              <td>${escapeHtml(p.position || '')}</td>
              <td style="text-align: center;">${escapeHtml(p.office || '')}</td>
              <td style="text-align: center;">${escapeHtml(p.role || 'Participant')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    const member = data.individualMember || (data.participants && data.participants[0]) || {};
    participantsHtml = `
      <div style="text-align: center; margin: 25px 0; padding: 15px 0; border-top: 1.5pt solid #000; border-bottom: 1.5pt solid #000;">
        <h2 style="margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase;">${escapeHtml(member.name || '')}</h2>
        <p style="margin: 5px 0 0 0; font-size: 11pt; color: #ea580c; font-weight: bold;">
          ${escapeHtml(member.position || '')} &bull; ${escapeHtml(member.office || '')}
        </p>
      </div>
    `;
  }

  const htmlDoc = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Certificate of Appearance</title>
      <style>
        @page Section1 {
          size: 210mm 297mm;
          margin: 20mm 20mm 20mm 20mm;
          mso-header-margin: 36pt;
          mso-footer-margin: 36pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
        h1 { font-family: 'MS Reference Sans Serif', 'Arial', sans-serif; font-size: 18pt; text-align: center; margin-top: 25px; margin-bottom: 25px; }
        p.certify { text-align: justify; text-indent: 30pt; margin-bottom: 15pt; }
        p.purpose { text-align: justify; text-indent: 30pt; margin-top: 15pt; }
        p.issue { margin-top: 15pt; margin-bottom: 30pt; }
      </style>
    </head>
    <body>
      <div class="Section1">
        <div style="text-align: center; border-bottom: 2pt solid #000; padding-bottom: 10px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 10pt; font-weight: bold;">REPUBLIC OF THE PHILIPPINES</p>
          <p style="margin: 0; font-size: 11pt; font-weight: bold;">CITY GOVERNMENT OF BAGUIO</p>
          <p style="margin: 2px 0 0 0; font-size: 9.5pt; font-weight: bold; color: #ea580c;">MEN OPPOSED TO VIOLENCE AGAINST WOMEN EVERYWHERE</p>
        </div>

        <h1>CERTIFICATE OF APPEARANCE</h1>

        <p class="certify">
          This is to certify that ${data.mode === 'group' ? 'the following employees appeared' : `<strong>${escapeHtml((data.individualMember || {}).name || '')}</strong> appeared`} as <strong>Participant/Facilitator</strong> during the “<strong>${escapeHtml(data.activityTitle)}</strong>”${data.theme ? ` with the theme “<em>${escapeHtml(data.theme)}</em>”` : ''} on <strong>${escapeHtml(data.date)}</strong> at the <strong>${escapeHtml(data.venue)}</strong>:
        </p>

        ${participantsHtml}

        <p class="purpose">${escapeHtml(data.purpose)}</p>

        <p class="issue">${escapeHtml(data.issueDate)}</p>

        <table style="width: 100%; margin-top: 40px; border: none;">
          <tr>
            <td style="vertical-align: bottom; font-family: monospace; font-size: 9pt; color: #666;">
              ${escapeHtml(data.initials)}
            </td>
            <td style="width: 250px; text-align: center; vertical-align: bottom;">
              <p style="margin: 0; font-size: 11pt; font-weight: bold; text-transform: uppercase;">${escapeHtml(data.signatoryName)}</p>
              <p style="margin: 0; font-size: 10pt; font-weight: bold;">${escapeHtml(data.signatoryTitle1)}</p>
              <p style="margin: 0; font-size: 9pt; color: #333;">${escapeHtml(data.signatoryTitle2)}</p>
            </td>
          </tr>
        </table>

        <div style="margin-top: 40px; border-top: 1pt solid #ccc; padding-top: 8px; font-size: 8.5pt; color: #666; display: flex; justify-content: space-between;">
          <span>Tel. No. (074)-442-89-20</span>
          <span style="float: right;">website: http://www.baguio.gov.ph</span>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Word document downloaded successfully!', 'fa-check');
}

// Global helper for escaping
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
