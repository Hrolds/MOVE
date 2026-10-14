// ==========================================================================
// MOVE BAGUIO CHAPTER — CERTIFICATE OF APPEARANCE (CA) ENGINE
// Civil Service / LGU Baguio Attendance & Appearance Accreditation
// Modeled directly after "CA MOVE TEMPLATE.docx"
// ==========================================================================

const caState = {
  selectedActivityId: 'ACT-KITCHEN-2',
  mode: 'individual', // Default to INDIVIDUAL employee certificate
  currentMemberIndex: 0,
  honorificMode: 'auto', // 'auto' (Mr./Ms. by gender), 'mr', 'ms', 'none'
  attendanceBasis: 'was duly verified to have attended and participated in the activity entitled',
  title: 'Men in the Kitchen 2',
  theme: 'Love Served in the Kitchen',
  date: 'October 20, 2026',
  venue: 'CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City',
  purpose: 'This certification is issued upon the request of the above-named individual for whatever lawful purpose it may serve.',
  issueDate: 'Issued this 20th day of October 2026, Baguio City, Philippines.',
  documentTitle: 'CERTIFICATE OF APPEARANCE',
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
  zoom: 100,

  // Editable Context & Template
  mainContextMode: 'current', // 'current' (single employee) or 'template' (applies to all)
  mainTemplate: 'This is to certify that <strong>{honorific}{name}</strong>, holding the position of <strong>{position}</strong> under <strong>{office}</strong>, was duly verified to have attended and participated in the activity entitled “<strong>{activity}</strong>,” {date}, {venue}.',
  customMemberTexts: {}, // memberId -> custom text/HTML

  // Spacing & Typography controls (compact & formal defaults for A5 Landscape)
  lineSpacing: 1.35,       // Line height multiplier
  paragraphSpacing: 7,    // Margin bottom in px between main blocks
  fontSize: 11,           // Font size in px (proportional for A5 landscape slip)
  textIndent: 24,         // Text indent in px

  // Word Docs Style Layout, Spacing & Alignments
  titleSpacingAfter: 8,    // Space after CERTIFICATE OF APPEARANCE title in px
  titleAlign: 'center',    // 'center' | 'left' | 'right'
  mainTextAlign: 'both',   // 'both' (justify) | 'left' | 'center'
  signatureAlign: 'center', // 'center' | 'right' | 'left' (Centered by default per user request)
  purposeAlign: 'both',
  activeVersionId: 'ver_executive_centered'
};

// --- DOCUMENT VERSIONS & PRESETS MANAGER (WORD DOCS STYLE) ---
const CA_VERSIONS_KEY = 'move_ca_versions_v1';
const CA_AUTOSAVE_KEY = 'move_ca_autosave_v1';

function getBuiltInCaVersions() {
  return [
    {
      id: 'ver_executive_centered',
      name: 'Executive Centered Signature (A5 Slip)',
      isBuiltIn: true,
      data: {
        documentTitle: 'CERTIFICATE OF APPEARANCE',
        titleSpacingAfter: 8,
        titleAlign: 'center',
        mainTextAlign: 'both',
        signatureAlign: 'center',
        lineSpacing: 1.35,
        paragraphSpacing: 7,
        fontSize: 11,
        textIndent: 24
      }
    },
    {
      id: 'ver_formal_right',
      name: 'Formal Baguio LGU (Right Signature)',
      isBuiltIn: true,
      data: {
        documentTitle: 'CERTIFICATE OF APPEARANCE',
        titleSpacingAfter: 8,
        titleAlign: 'center',
        mainTextAlign: 'both',
        signatureAlign: 'right',
        lineSpacing: 1.35,
        paragraphSpacing: 7,
        fontSize: 11,
        textIndent: 24
      }
    },
    {
      id: 'ver_compact_formal',
      name: 'Compact Formal Layout (1.25x)',
      isBuiltIn: true,
      data: {
        documentTitle: 'CERTIFICATE OF APPEARANCE',
        titleSpacingAfter: 5,
        titleAlign: 'center',
        mainTextAlign: 'both',
        signatureAlign: 'center',
        lineSpacing: 1.25,
        paragraphSpacing: 5,
        fontSize: 10.5,
        textIndent: 20
      }
    }
  ];
}

function getSavedCaVersions() {
  try {
    const raw = localStorage.getItem(CA_VERSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved CA versions:', e);
  }
  return [];
}

function getAllCaVersions() {
  const builtIn = getBuiltInCaVersions();
  const saved = getSavedCaVersions();
  return [...builtIn, ...saved];
}

function populateCaVersionsDropdown() {
  const sel = document.getElementById('caVersionSelect');
  if (!sel) return;
  sel.innerHTML = '';

  const all = getAllCaVersions();
  all.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name + (v.isBuiltIn ? ' [Preset]' : '');
    if (v.id === caState.activeVersionId) opt.selected = true;
    sel.appendChild(opt);
  });

  const delBtn = document.getElementById('caBtnDeleteVersion');
  const curVer = all.find(v => v.id === caState.activeVersionId);
  if (delBtn) {
    delBtn.classList.toggle('hidden', !curVer || !!curVer.isBuiltIn);
  }
}

function loadCaVersion(versionId) {
  const all = getAllCaVersions();
  const ver = all.find(v => v.id === versionId);
  if (!ver || !ver.data) return;

  caState.activeVersionId = versionId;
  const d = ver.data;
  if (d.documentTitle !== undefined) caState.documentTitle = d.documentTitle;
  if (d.titleSpacingAfter !== undefined) caState.titleSpacingAfter = d.titleSpacingAfter;
  if (d.titleAlign !== undefined) caState.titleAlign = d.titleAlign;
  if (d.mainTextAlign !== undefined) caState.mainTextAlign = d.mainTextAlign;
  if (d.signatureAlign !== undefined) caState.signatureAlign = d.signatureAlign;
  if (d.lineSpacing !== undefined) caState.lineSpacing = d.lineSpacing;
  if (d.paragraphSpacing !== undefined) caState.paragraphSpacing = d.paragraphSpacing;
  if (d.fontSize !== undefined) caState.fontSize = d.fontSize;
  if (d.textIndent !== undefined) caState.textIndent = d.textIndent;
  if (d.purpose !== undefined) caState.purpose = d.purpose;
  if (d.mainTemplate !== undefined) caState.mainTemplate = d.mainTemplate;
  if (d.signatoryName !== undefined) caState.signatoryName = d.signatoryName;
  if (d.signatoryTitle1 !== undefined) caState.signatoryTitle1 = d.signatoryTitle1;
  if (d.signatoryTitle2 !== undefined) caState.signatoryTitle2 = d.signatoryTitle2;
  if (d.initials !== undefined) caState.initials = d.initials;
  if (d.showSignature !== undefined) caState.showSignature = d.showSignature;
  if (d.signatureWidth !== undefined) caState.signatureWidth = d.signatureWidth;

  syncCaInputsFromState();
  syncCaAlignmentButtons();
  populateCaVersionsDropdown();
  renderAppearancePreview();
  autosaveCaSession();
  showToast(`Loaded version: ${ver.name}`, 'fa-check');
}

function promptSaveNewCaVersion() {
  const defaultTitle = `Version ${new Date().toLocaleDateString()} (${caState.signatureAlign === 'center' ? 'Centered' : 'Right'} Sig)`;
  const name = prompt('Enter a name for this document version / preset:', defaultTitle);
  if (!name || !name.trim()) return;

  const newVer = {
    id: `ver_${Date.now()}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    isBuiltIn: false,
    data: {
      documentTitle: caState.documentTitle,
      titleSpacingAfter: caState.titleSpacingAfter,
      titleAlign: caState.titleAlign,
      mainTextAlign: caState.mainTextAlign,
      signatureAlign: caState.signatureAlign,
      lineSpacing: caState.lineSpacing,
      paragraphSpacing: caState.paragraphSpacing,
      fontSize: caState.fontSize,
      textIndent: caState.textIndent,
      mainTemplate: caState.mainTemplate,
      purpose: caState.purpose,
      issueDate: caState.issueDate,
      signatoryName: caState.signatoryName,
      signatoryTitle1: caState.signatoryTitle1,
      signatoryTitle2: caState.signatoryTitle2,
      initials: caState.initials,
      showSignature: caState.showSignature,
      signatureWidth: caState.signatureWidth
    }
  };

  const saved = getSavedCaVersions();
  saved.push(newVer);
  localStorage.setItem(CA_VERSIONS_KEY, JSON.stringify(saved));
  caState.activeVersionId = newVer.id;
  populateCaVersionsDropdown();
  showToast(`Saved new version: ${newVer.name}`, 'fa-bookmark');
}

function updateCurrentCaVersion() {
  const saved = getSavedCaVersions();
  const idx = saved.findIndex(v => v.id === caState.activeVersionId);
  if (idx === -1) {
    promptSaveNewCaVersion();
    return;
  }

  saved[idx].updatedAt = new Date().toISOString();
  saved[idx].data = {
    documentTitle: caState.documentTitle,
    titleSpacingAfter: caState.titleSpacingAfter,
    titleAlign: caState.titleAlign,
    mainTextAlign: caState.mainTextAlign,
    signatureAlign: caState.signatureAlign,
    lineSpacing: caState.lineSpacing,
    paragraphSpacing: caState.paragraphSpacing,
    fontSize: caState.fontSize,
    textIndent: caState.textIndent,
    mainTemplate: caState.mainTemplate,
    purpose: caState.purpose,
    issueDate: caState.issueDate,
    signatoryName: caState.signatoryName,
    signatoryTitle1: caState.signatoryTitle1,
    signatoryTitle2: caState.signatoryTitle2,
    initials: caState.initials,
    showSignature: caState.showSignature,
    signatureWidth: caState.signatureWidth
  };

  localStorage.setItem(CA_VERSIONS_KEY, JSON.stringify(saved));
  showToast(`Updated version: ${saved[idx].name}`, 'fa-floppy-disk');
}

function deleteCurrentCaVersion() {
  const saved = getSavedCaVersions();
  const idx = saved.findIndex(v => v.id === caState.activeVersionId);
  if (idx === -1) return;

  if (!confirm(`Are you sure you want to delete version "${saved[idx].name}"?`)) return;

  const deletedName = saved[idx].name;
  saved.splice(idx, 1);
  localStorage.setItem(CA_VERSIONS_KEY, JSON.stringify(saved));
  caState.activeVersionId = 'ver_executive_centered';
  loadCaVersion(caState.activeVersionId);
  showToast(`Deleted version: ${deletedName}`, 'fa-trash-can');
}

function autosaveCaSession() {
  try {
    const snapshot = {
      titleSpacingAfter: caState.titleSpacingAfter,
      signatureAlign: caState.signatureAlign,
      mainTextAlign: caState.mainTextAlign,
      titleAlign: caState.titleAlign,
      lineSpacing: caState.lineSpacing,
      paragraphSpacing: caState.paragraphSpacing,
      fontSize: caState.fontSize,
      textIndent: caState.textIndent,
      documentTitle: caState.documentTitle,
      mainTemplate: caState.mainTemplate,
      customMemberTexts: caState.customMemberTexts,
      purpose: caState.purpose,
      issueDate: caState.issueDate,
      signatoryName: caState.signatoryName,
      signatoryTitle1: caState.signatoryTitle1,
      signatoryTitle2: caState.signatoryTitle2,
      initials: caState.initials,
      showSignature: caState.showSignature,
      signatureWidth: caState.signatureWidth,
      activeVersionId: caState.activeVersionId
    };
    localStorage.setItem(CA_AUTOSAVE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    // ignore
  }
}

function restoreAutosavedCaSession() {
  try {
    const raw = localStorage.getItem(CA_AUTOSAVE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.titleSpacingAfter !== undefined) caState.titleSpacingAfter = s.titleSpacingAfter;
    if (s.signatureAlign !== undefined) caState.signatureAlign = s.signatureAlign;
    if (s.mainTextAlign !== undefined) caState.mainTextAlign = s.mainTextAlign;
    if (s.titleAlign !== undefined) caState.titleAlign = s.titleAlign;
    if (s.lineSpacing !== undefined) caState.lineSpacing = s.lineSpacing;
    if (s.paragraphSpacing !== undefined) caState.paragraphSpacing = s.paragraphSpacing;
    if (s.fontSize !== undefined) caState.fontSize = s.fontSize;
    if (s.textIndent !== undefined) caState.textIndent = s.textIndent;
    if (s.documentTitle !== undefined) caState.documentTitle = s.documentTitle;
    if (s.mainTemplate !== undefined) caState.mainTemplate = s.mainTemplate;
    if (s.customMemberTexts) caState.customMemberTexts = s.customMemberTexts;
    if (s.purpose !== undefined) caState.purpose = s.purpose;
    if (s.issueDate !== undefined) caState.issueDate = s.issueDate;
    if (s.signatoryName !== undefined) caState.signatoryName = s.signatoryName;
    if (s.signatoryTitle1 !== undefined) caState.signatoryTitle1 = s.signatoryTitle1;
    if (s.signatoryTitle2 !== undefined) caState.signatoryTitle2 = s.signatoryTitle2;
    if (s.initials !== undefined) caState.initials = s.initials;
    if (s.showSignature !== undefined) caState.showSignature = s.showSignature;
    if (s.signatureWidth !== undefined) caState.signatureWidth = s.signatureWidth;
    if (s.activeVersionId !== undefined) caState.activeVersionId = s.activeVersionId;
  } catch (e) {
    // ignore
  }
}

// --- INITIALIZATION ---
function initAppearanceStudio() {
  populateCaActivityDropdown();
  
  // Restore autosaved session if present
  restoreAutosavedCaSession();

  // Set default activity if present
  const defaultAct = activitiesList.find(a => a.id === caState.selectedActivityId) || activitiesList[0];
  if (defaultAct) {
    applyCaActivity(defaultAct);
  } else {
    refreshCaParticipants();
  }

  // Populate UI inputs from state
  syncCaInputsFromState();
  syncCaAlignmentButtons();
  populateCaVersionsDropdown();
  populateCaEmployeeDropdown();
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

// --- POPULATE EMPLOYEE DROPDOWN FOR INDIVIDUAL SELECTION ---
function populateCaEmployeeDropdown() {
  const sel = document.getElementById('caEmployeeSelect');
  if (!sel) return;
  sel.innerHTML = '';

  const list = getActiveCaParticipants();
  if (list.length === 0) {
    const opt = document.createElement('option');
    opt.value = 0;
    opt.textContent = 'No present attendees';
    sel.appendChild(opt);
    return;
  }

  list.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    const hon = getCaHonorific(p, false);
    opt.textContent = `${idx + 1}. ${hon}${p.name || 'Unnamed'} (${p.office || 'N/A'})`;
    if (idx === caState.currentMemberIndex) opt.selected = true;
    sel.appendChild(opt);
  });
}

function handleCaEmployeeDropdownChange(val) {
  const idx = parseInt(val, 10);
  const list = getActiveCaParticipants();
  if (!isNaN(idx) && idx >= 0 && idx < list.length) {
    caState.currentMemberIndex = idx;
    renderAppearancePreview();
    renderCaAttendeesList();
  }
}

// --- HELPER: FORMAL COMBINED ACTIVITY TITLE & THEME ---
function getCaActivityFullTitle(title, theme) {
  const t = (title || '').trim();
  const th = (theme || '').trim();
  if (!th) return t;
  if (t.toLowerCase().includes(th.toLowerCase())) return t;
  return `${t}: ${th}`;
}

// --- HELPER: FORMAT VENUE CLAUSE ---
function formatCaVenueText(venue) {
  const v = (venue || '').trim();
  if (!v) return '';
  if (/^(at\s+the|at|in\s+the|in)\s+/i.test(v)) return v;
  return `at the ${v}`;
}

// --- HELPER: FORMAT DATE CLAUSE ---
function formatCaDateText(dateStr) {
  const d = (dateStr || '').trim();
  if (!d) return '';
  if (/^held\s+on\s+/i.test(d)) return d;
  return `held on ${d}`;
}

// --- HONORIFIC RESOLUTION (MR. / MS.) ---
function getCaHonorific(member, uppercase = false) {
  if (caState.honorificMode === 'none') return '';
  let hon = 'Mr. ';
  if (caState.honorificMode === 'mr') hon = 'Mr. ';
  else if (caState.honorificMode === 'ms') hon = 'Ms. ';
  else {
    const g = (member && member.gender ? String(member.gender) : 'M').toUpperCase();
    if (g === 'F' || g === 'FEMALE') hon = 'Ms. ';
    else hon = 'Mr. ';
  }
  return uppercase ? hon.toUpperCase() : hon;
}

// --- CONTEXT BUILDERS & INTERACTIVE EDITING ---
function buildCaMainHtml(member) {
  if (!member) {
    const list = getActiveCaParticipants();
    member = list[caState.currentMemberIndex] || {
      name: 'EMPLOYEE FULL NAME',
      position: 'OFFICIAL POSITION TITLE',
      office: 'DEPARTMENT / OFFICE',
      role: 'Participant',
      gender: 'M'
    };
  }

  // If there's an individual text override for this member
  if (caState.customMemberTexts && member.id && caState.customMemberTexts[member.id]) {
    return caState.customMemberTexts[member.id];
  }

  const hon = getCaHonorific(member, true);
  const mName = escapeHtml((member.name || 'EMPLOYEE FULL NAME').toUpperCase());
  const mPos = escapeHtml((member.position || 'OFFICIAL POSITION TITLE').toUpperCase());
  const mOff = escapeHtml((member.office || 'DEPARTMENT / OFFICE').toUpperCase());
  const fullActTitle = escapeHtml(getCaActivityFullTitle(caState.title, caState.theme));
  const dateClause = escapeHtml(formatCaDateText(caState.date));
  const venueClause = escapeHtml(formatCaVenueText(caState.venue));
  const basisClause = escapeHtml(caState.attendanceBasis || 'was duly verified to have attended and participated in the activity entitled');

  let tmpl = caState.mainTemplate || 'This is to certify that <strong>{honorific}{name}</strong>, holding the position of <strong>{position}</strong> under <strong>{office}</strong>, was duly verified to have attended and participated in the activity entitled “<strong>{activity}</strong>,” {date}, {venue}.';

  return tmpl
    .replace(/\{honorific\}/gi, hon)
    .replace(/\{name\}/gi, mName)
    .replace(/\{position\}/gi, mPos)
    .replace(/\{office\}/gi, mOff)
    .replace(/\{basis\}/gi, basisClause)
    .replace(/\{activity\}/gi, fullActTitle)
    .replace(/\{date\}/gi, dateClause)
    .replace(/\{venue\}/gi, venueClause);
}

function buildCaMainPlainText(member) {
  const html = buildCaMainHtml(member);
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function setCaContextEditMode(mode) {
  caState.mainContextMode = mode;
  syncCaContextInput();
}

function syncCaContextInput() {
  const input = document.getElementById('caMainContextInput');
  const btnCurr = document.getElementById('caBtnContextCurrent');
  const btnTmpl = document.getElementById('caBtnContextTemplate');
  const badge = document.getElementById('caContextModeBadge');
  if (!input) return;

  const participants = getActiveCaParticipants();
  const currMember = participants[caState.currentMemberIndex] || null;

  if (caState.mainContextMode === 'current') {
    if (btnCurr) btnCurr.className = 'px-2 py-0.5 rounded bg-move-navy-900 text-white shadow-2xs font-bold transition';
    if (btnTmpl) btnTmpl.className = 'px-2 py-0.5 rounded text-slate-600 hover:text-move-navy-900 transition';
    if (badge) badge.textContent = `Editing text for ${currMember ? currMember.name : 'Active Employee'}`;
    input.value = buildCaMainPlainText(currMember);
  } else {
    if (btnCurr) btnCurr.className = 'px-2 py-0.5 rounded text-slate-600 hover:text-move-navy-900 transition';
    if (btnTmpl) btnTmpl.className = 'px-2 py-0.5 rounded bg-move-navy-900 text-white shadow-2xs font-bold transition';
    if (badge) badge.textContent = 'Editing Master Template (applies to all)';
    input.value = caState.mainTemplate;
  }
}

function handleCaMainContextInput(val) {
  const participants = getActiveCaParticipants();
  const currMember = participants[caState.currentMemberIndex] || null;

  if (caState.mainContextMode === 'current') {
    if (currMember) {
      caState.customMemberTexts[currMember.id] = val;
    }
  } else {
    caState.mainTemplate = val;
  }
  renderAppearancePreview();
}

function insertCaPlaceholder(tag) {
  const input = document.getElementById('caMainContextInput');
  if (!input) return;
  if (caState.mainContextMode !== 'template') {
    setCaContextEditMode('template');
  }
  const start = input.selectionStart || input.value.length;
  const end = input.selectionEnd || input.value.length;
  const oldVal = input.value;
  input.value = oldVal.substring(0, start) + tag + oldVal.substring(end);
  input.selectionStart = input.selectionEnd = start + tag.length;
  input.focus();
  caState.mainTemplate = input.value;
  renderAppearancePreview();
}

function applyMainTextToAllAttendees() {
  const input = document.getElementById('caMainContextInput');
  const participants = getActiveCaParticipants();
  const currMember = participants[caState.currentMemberIndex];
  
  if (input && currMember) {
    let text = input.value;
    const hon = getCaHonorific(currMember, true);
    const mName = (currMember.name || '').toUpperCase();
    const mPos = (currMember.position || '').toUpperCase();
    const mOff = (currMember.office || '').toUpperCase();
    
    if (mName && text.includes(mName)) {
      text = text.replace(new RegExp(hon + mName, 'g'), '{honorific}{name}');
      text = text.replace(new RegExp(mName, 'g'), '{name}');
    }
    if (mPos && text.includes(mPos)) {
      text = text.replace(new RegExp(mPos, 'g'), '{position}');
    }
    if (mOff && text.includes(mOff)) {
      text = text.replace(new RegExp(mOff, 'g'), '{office}');
    }
    
    caState.mainTemplate = text;
    caState.customMemberTexts = {};
    caState.mainContextMode = 'template';
    syncCaContextInput();
    renderAppearancePreview();
    showToast('Applied wording template to all attendees!', 'fa-check');
  }
}

function resetCaContextToDefault() {
  caState.mainTemplate = 'This is to certify that <strong>{honorific}{name}</strong>, holding the position of <strong>{position}</strong> under <strong>{office}</strong>, was duly verified to have attended and participated in the activity entitled “<strong>{activity}</strong>,” {date}, {venue}.';
  caState.customMemberTexts = {};
  caState.lineSpacing = 1.40;
  caState.paragraphSpacing = 14;
  caState.fontSize = 13.5;
  caState.textIndent = 36;
  syncCaInputsFromState();
  syncCaContextInput();
  renderAppearancePreview();
  showToast('Reset to default formal wording & spacing!', 'fa-rotate-left');
}

function handleCaSpacingChange(field, val) {
  caState[field] = val;
  if (field === 'lineSpacing') {
    const elVal = document.getElementById('caLineSpacingVal');
    const elBadge = document.getElementById('caLineSpacingBadge');
    const str = `${Number(val).toFixed(2)}x`;
    if (elVal) elVal.textContent = str;
    if (elBadge) elBadge.textContent = `${str} Spacing`;
  } else if (field === 'paragraphSpacing') {
    const elVal = document.getElementById('caParagraphSpacingVal');
    if (elVal) elVal.textContent = `${val}px`;
  } else if (field === 'fontSize') {
    const elVal = document.getElementById('caFontSizeVal');
    if (elVal) elVal.textContent = `${val}px`;
  } else if (field === 'textIndent') {
    const elVal = document.getElementById('caTextIndentVal');
    if (elVal) elVal.textContent = `${val}px`;
  } else if (field === 'titleSpacingAfter') {
    const elVal = document.getElementById('caTitleSpacingVal');
    if (elVal) elVal.textContent = `${val}px`;
  }
  renderAppearancePreview();
  autosaveCaSession();
}

function setCaLineSpacingPreset(val) {
  const input = document.getElementById('caLineSpacingInput');
  if (input) input.value = val;
  handleCaSpacingChange('lineSpacing', val);
}

function setCaTitleSpacingPreset(val) {
  const input = document.getElementById('caTitleSpacingInput');
  if (input) input.value = val;
  handleCaSpacingChange('titleSpacingAfter', val);
}

function setCaSignatureAlign(align) {
  caState.signatureAlign = align;
  syncCaAlignmentButtons();
  renderAppearancePreview();
  autosaveCaSession();
}

function setCaMainTextAlign(align) {
  caState.mainTextAlign = align;
  syncCaAlignmentButtons();
  renderAppearancePreview();
  autosaveCaSession();
}

function setCaTitleAlign(align) {
  caState.titleAlign = align;
  renderAppearancePreview();
  autosaveCaSession();
}

function syncCaAlignmentButtons() {
  const sAlign = caState.signatureAlign || 'center';
  const activeClass = 'py-1 px-2 rounded-lg transition flex items-center justify-center gap-1.5 bg-move-navy-900 text-white shadow-2xs font-extrabold';
  const inactiveClass = 'py-1 px-2 rounded-lg transition flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold';

  // Card 2 buttons
  const bSL = document.getElementById('btnCaSigAlignLeft');
  const bSC = document.getElementById('btnCaSigAlignCenter');
  const bSR = document.getElementById('btnCaSigAlignRight');
  if (bSL) bSL.className = sAlign === 'left' ? activeClass : inactiveClass;
  if (bSC) bSC.className = sAlign === 'center' ? activeClass : inactiveClass;
  if (bSR) bSR.className = sAlign === 'right' ? activeClass : inactiveClass;

  // Card 4 buttons
  const bSL2 = document.getElementById('btnCaSigAlignLeft2');
  const bSC2 = document.getElementById('btnCaSigAlignCenter2');
  const bSR2 = document.getElementById('btnCaSigAlignRight2');
  if (bSL2) bSL2.className = sAlign === 'left' ? activeClass : inactiveClass;
  if (bSC2) bSC2.className = sAlign === 'center' ? activeClass : inactiveClass;
  if (bSR2) bSR2.className = sAlign === 'right' ? activeClass : inactiveClass;

  // Text alignment
  const tAlign = caState.mainTextAlign || 'both';
  const bTJ = document.getElementById('btnCaAlignJustify');
  const bTL = document.getElementById('btnCaAlignLeft');
  const bTC = document.getElementById('btnCaAlignCenter');
  if (bTJ) bTJ.className = tAlign === 'both' ? activeClass : inactiveClass;
  if (bTL) bTL.className = tAlign === 'left' ? activeClass : inactiveClass;
  if (bTC) bTC.className = tAlign === 'center' ? activeClass : inactiveClass;
}

function handleCaSheetEdit(el, field) {
  if (!el) return;
  const participants = getActiveCaParticipants();
  const currMember = participants[caState.currentMemberIndex];

  if (field === 'mainText') {
    if (currMember) {
      caState.customMemberTexts[currMember.id] = el.innerHTML;
      if (caState.mainContextMode === 'current') {
        const input = document.getElementById('caMainContextInput');
        if (input) input.value = el.innerText || el.textContent;
      }
    }
  } else if (field === 'purpose') {
    caState.purpose = el.innerText || el.textContent;
    const inp = document.getElementById('caPurposeText');
    if (inp) inp.value = caState.purpose;
  } else if (field === 'issueDate') {
    caState.issueDate = el.innerText || el.textContent;
    const inp = document.getElementById('caIssueDate');
    if (inp) inp.value = caState.issueDate;
  } else if (field === 'documentTitle') {
    caState.documentTitle = el.innerText || el.textContent;
  } else if (field === 'signatoryName') {
    caState.signatoryName = el.innerText || el.textContent;
    const inp = document.getElementById('caSignatoryName');
    if (inp) inp.value = caState.signatoryName;
  } else if (field === 'signatoryTitle1') {
    caState.signatoryTitle1 = el.innerText || el.textContent;
    const inp = document.getElementById('caSignatoryTitle1');
    if (inp) inp.value = caState.signatoryTitle1;
  } else if (field === 'signatoryTitle2') {
    caState.signatoryTitle2 = el.innerText || el.textContent;
    const inp = document.getElementById('caSignatoryTitle2');
    if (inp) inp.value = caState.signatoryTitle2;
  } else if (field === 'initials') {
    caState.initials = el.innerText || el.textContent;
    const inp = document.getElementById('caInitials');
    if (inp) inp.value = caState.initials;
  }
}

// --- APPLY SELECTED ACTIVITY ---
function applyCaActivity(act) {
  if (!act) return;
  caState.selectedActivityId = act.id;
  caState.title = act.title || 'Official MOVE Activity';
  caState.theme = act.shortDescription || (act.id === 'ACT-KITCHEN-2' ? 'Love Served in the Kitchen' : '');
  caState.date = act.date || 'October 20, 2026';
  caState.venue = act.venue || 'CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City';
  
  if (act.date) {
    caState.issueDate = `Issued this ${formatCaDateOrd(act.date)}, Baguio City, Philippines.`;
  }
  
  refreshCaParticipants();
  syncCaInputsFromState();
  populateCaEmployeeDropdown();
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
      return `${day}${ord} day of ${month} ${year}`;
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
  setVal('caAttendanceBasis', caState.attendanceBasis);
  setVal('caHonorificSelect', caState.honorificMode);
  setVal('caPurposeText', caState.purpose);
  setVal('caIssueDate', caState.issueDate);
  setVal('caSignatoryName', caState.signatoryName);
  setVal('caSignatoryTitle1', caState.signatoryTitle1);
  setVal('caSignatoryTitle2', caState.signatoryTitle2);
  setVal('caInitials', caState.initials);
  setVal('caSigWidth', caState.signatureWidth);
  const wLabel = document.getElementById('caSigWidthVal');
  if (wLabel) wLabel.textContent = `${caState.signatureWidth}px`;

  // Spacing and Typography Inputs
  setVal('caLineSpacingInput', caState.lineSpacing);
  const elLineVal = document.getElementById('caLineSpacingVal');
  const elLineBadge = document.getElementById('caLineSpacingBadge');
  if (elLineVal) elLineVal.textContent = `${Number(caState.lineSpacing).toFixed(2)}x`;
  if (elLineBadge) elLineBadge.textContent = `${Number(caState.lineSpacing).toFixed(2)}x Spacing`;

  setVal('caParagraphSpacingInput', caState.paragraphSpacing);
  const elParaVal = document.getElementById('caParagraphSpacingVal');
  if (elParaVal) elParaVal.textContent = `${caState.paragraphSpacing}px`;

  setVal('caFontSizeInput', caState.fontSize);
  const elFontVal = document.getElementById('caFontSizeVal');
  if (elFontVal) elFontVal.textContent = `${caState.fontSize}px`;

  setVal('caTextIndentInput', caState.textIndent);
  const elIndentVal = document.getElementById('caTextIndentVal');
  if (elIndentVal) elIndentVal.textContent = `${caState.textIndent}px`;

  setVal('caTitleSpacingInput', caState.titleSpacingAfter);
  const elTitleVal = document.getElementById('caTitleSpacingVal');
  if (elTitleVal) elTitleVal.textContent = `${caState.titleSpacingAfter}px`;

  setChecked('caShowSignature', caState.showSignature);
  setChecked('caShowCityLogo', caState.showCityLogo);
  setChecked('caShowMoveLogo', caState.showMoveLogo);
  setChecked('caFilterPresentOnly', caState.filterPresentOnly);

  syncCaAlignmentButtons();
  populateCaVersionsDropdown();
  syncCaContextInput();

  // Update mode tabs
  const tabGroup = document.getElementById('caTabGroup');
  const tabInd = document.getElementById('caTabIndividual');
  if (tabGroup && tabInd) {
    if (caState.mode === 'group') {
      tabGroup.className = 'py-1.5 px-3.5 text-xs font-bold rounded-xl transition bg-move-navy-900 text-white shadow-sm flex items-center gap-1.5';
      tabInd.className = 'py-1.5 px-3.5 text-xs font-semibold rounded-xl transition text-slate-600 hover:text-move-navy-900 hover:bg-slate-200/60 flex items-center gap-1.5';
    } else {
      tabGroup.className = 'py-1.5 px-3.5 text-xs font-semibold rounded-xl transition text-slate-600 hover:text-move-navy-900 hover:bg-slate-200/60 flex items-center gap-1.5';
      tabInd.className = 'py-1.5 px-3.5 text-xs font-bold rounded-xl transition bg-move-navy-900 text-white shadow-sm flex items-center gap-1.5';
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
  if (field === 'honorificMode') {
    populateCaEmployeeDropdown();
  }
  renderAppearancePreview();
  autosaveCaSession();
}

function handleCaActivityChange(actId) {
  const act = activitiesList.find(a => a.id === actId);
  if (act) {
    applyCaActivity(act);
    populateCaEmployeeDropdown();
    renderAppearancePreview();
    renderCaAttendeesList();
  }
}

function setCaMode(mode) {
  caState.mode = mode;
  syncCaInputsFromState();
  populateCaEmployeeDropdown();
  renderAppearancePreview();
  renderCaAttendeesList();
}

function setCaFilterPresentOnly(checked) {
  caState.filterPresentOnly = checked;
  refreshCaParticipants();
  populateCaEmployeeDropdown();
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
    countBadge.textContent = `${selectedCount} of ${filtered.length} present`;
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

  const activeList = getActiveCaParticipants();
  const currentIndMember = activeList[caState.currentMemberIndex];

  container.innerHTML = filtered.map((p, idx) => {
    const isSelected = caState.selectedMemberIds.has(p.id);
    const isPresent = !!p.isPresent;
    const isCurrentInd = caState.mode === 'individual' && currentIndMember && currentIndMember.id === p.id;
    const hon = getCaHonorific(p);

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
              <span>${hon}${p.name || 'Unnamed Attendee'}</span>
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
  populateCaEmployeeDropdown();
  renderAppearancePreview();
  renderCaAttendeesList();
}

function selectCaAttendeeRow(id) {
  if (caState.mode === 'individual') {
    const list = getActiveCaParticipants();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      caState.currentMemberIndex = idx;
      populateCaEmployeeDropdown();
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
  populateCaEmployeeDropdown();
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
  populateCaEmployeeDropdown();
  renderAppearancePreview();
  renderCaAttendeesList();
}

// --- LIVE A5 LANDSCAPE PREVIEW RENDERER (210mm x 148mm) ---
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
          <td colspan="5" class="py-4 text-center text-slate-400 italic text-xs">
            No participants selected. Please select participants from the left attendees panel.
          </td>
        </tr>
      `;
    } else {
      tableRows = participants.slice(0, 15).map((p, idx) => {
        const hon = getCaHonorific(p, false);
        return `
          <tr class="${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'} border-b border-slate-200">
            <td class="py-0.5 px-2 text-center text-[10px] font-mono font-bold text-slate-700">${idx + 1}</td>
            <td class="py-0.5 px-2 text-[10.5px] font-bold text-slate-900 truncate max-w-[150px]">${hon}${escapeHtml(p.name || '')}</td>
            <td class="py-0.5 px-2 text-[10px] text-slate-800 leading-tight truncate max-w-[160px]">${escapeHtml(p.position || '')}</td>
            <td class="py-0.5 px-2 text-center text-[10px] font-semibold text-slate-800">${escapeHtml(p.office || '')}</td>
            <td class="py-0.5 px-2 text-center text-[10px] text-slate-700">${escapeHtml(p.role || 'Participant')}</td>
          </tr>
        `;
      }).join('');
    }

    const fullActTitle = escapeHtml(getCaActivityFullTitle(caState.title, caState.theme));
    const dateClause = escapeHtml(formatCaDateText(caState.date));
    const venueClause = escapeHtml(formatCaVenueText(caState.venue));

    bodyContentHtml = `
      <div class="space-y-1.5 flex-1">
        <!-- Certification Clause -->
        <p class="text-justify text-slate-900" style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; text-indent: ${caState.textIndent}px; margin-bottom: 4px;">
          This is to certify that the following employees appeared as <strong>Participant/Facilitator</strong> during the “<strong>${fullActTitle}</strong>,” ${dateClause}, ${venueClause}:
        </p>

        <!-- Official Participants Table (Compact for A5) -->
        <div class="border border-slate-300 rounded overflow-hidden shadow-xs my-1">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300 text-slate-900 text-[9.5px] uppercase tracking-wider font-extrabold">
                <th class="py-1 px-2 text-center w-8">No.</th>
                <th class="py-1 px-2">Full Name</th>
                <th class="py-1 px-2">Position Title</th>
                <th class="py-1 px-2 text-center w-20">Office</th>
                <th class="py-1 px-2 text-center w-24">Role</th>
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
    // --- INDIVIDUAL CERTIFICATION MODE (EVERY SINGLE EMPLOYEE) ---
    const currMember = participants[caState.currentMemberIndex] || {
      name: 'EMPLOYEE FULL NAME',
      position: 'OFFICIAL POSITION TITLE',
      office: 'DEPARTMENT / OFFICE',
      role: 'Participant',
      gender: 'M'
    };

    bodyContentHtml = `
      <div class="mb-1.5">
        <!-- Main Formal Certification Flowing Paragraph (Live Editable) -->
        <p id="caMainTextEl" contenteditable="true" spellcheck="false"
           oninput="handleCaSheetEdit(this, 'mainText')"
           style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; text-indent: ${caState.textIndent}px; margin-bottom: ${caState.paragraphSpacing}px;"
           class="text-${caState.mainTextAlign === 'both' ? 'justify' : (caState.mainTextAlign || 'justify')} text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded p-0.5 transition cursor-text select-text"
           title="Click to edit main certification text directly">
          ${buildCaMainHtml(currMember)}
        </p>
      </div>
    `;
  }

  // Signature Block & Alignments
  const sigAlign = caState.signatureAlign || 'center';
  const sigJustify = (sigAlign === 'center') ? 'justify-center' : ((sigAlign === 'left') ? 'justify-start' : 'justify-end');
  const sigImgHtml = caState.showSignature ? `
    <div class="flex ${sigJustify} -mb-5 relative z-10 pointer-events-none select-none">
      <img src="signature%20(15).png" alt="Signature" 
           style="width: ${caState.signatureWidth}px; max-height: 48px;" 
           class="object-contain drop-shadow-xs">
    </div>
  ` : `<div class="h-6"></div>`;

  stage.innerHTML = `
    <!-- A5 LANDSCAPE SHEET CONTAINER (210mm x 148mm) -->
    <div id="caActiveSheet" class="ca-landscape-sheet bg-white text-slate-900 shadow-2xl mx-auto relative select-text"
         style="width: 210mm; height: 148mm; min-height: 148mm; max-height: 148mm; padding: 6mm 10mm 5mm 10mm; font-family: 'Arial', sans-serif; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; box-sizing: border-box;">
      
      <!-- ================= HEADER SECTION ================= -->
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-700">
        <!-- Left Logo: City Hall Seal -->
        <div class="w-12 h-12 flex items-center justify-center shrink-0">
          ${caState.showCityLogo ? `<img src="CITY%20HALL%20LOGO.png" alt="City Government of Baguio" class="w-full h-full object-contain">` : ''}
        </div>

        <!-- Center Header Typography -->
        <div class="text-center px-2 flex-1 leading-tight">
          <div class="text-[9px] font-bold uppercase tracking-wider text-slate-800">
            Republic of the Philippines
          </div>
          <div class="text-[11px] font-black uppercase tracking-tight text-slate-900">
            CITY GOVERNMENT OF BAGUIO
          </div>
          <div class="text-[9.5px] font-extrabold uppercase tracking-wide text-move-orange-600 mt-0.5">
            Men Opposed to Violence Against Women Everywhere
          </div>
          <div class="text-[8px] text-slate-500 font-semibold tracking-wider uppercase">
            Baguio City Chapter &bull; Local Committee on Anti-VAWC
          </div>
        </div>

        <!-- Right Logo: MOVE Baguio Seal -->
        <div class="w-12 h-12 flex items-center justify-center shrink-0">
          ${caState.showMoveLogo ? `<img src="MOVE%20BAGUIO%20LOGO.png" alt="MOVE Baguio Chapter" class="w-full h-full object-contain">` : ''}
        </div>
      </div>

      <!-- ================= DOCUMENT TITLE ================= -->
      <div id="caTitleBlock" class="text-${caState.titleAlign || 'center'}" style="margin-top: 6px; margin-bottom: ${caState.titleSpacingAfter}px;">
        <h1 id="caDocTitleEl" contenteditable="true" spellcheck="false"
            oninput="handleCaSheetEdit(this, 'documentTitle')"
            class="text-base sm:text-lg font-black text-slate-900 tracking-wider uppercase font-cinzel focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded transition cursor-text"
            style="font-family: 'MS Reference Sans Serif', 'Arial', sans-serif; letter-spacing: 1.5px;"
            title="Click to edit document title directly">
          ${escapeHtml(caState.documentTitle || 'CERTIFICATE OF APPEARANCE')}
        </h1>
      </div>

      <!-- ================= BODY CONTENT ================= -->
      <div class="flex-1 flex flex-col justify-center py-0.5">
        ${bodyContentHtml}

        <!-- Purpose Clause (Live Editable) -->
        <div>
          <p id="caPurposeEl" contenteditable="true" spellcheck="false"
             oninput="handleCaSheetEdit(this, 'purpose')"
             style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; text-indent: ${caState.textIndent}px; margin-bottom: ${caState.paragraphSpacing}px;"
             class="text-${caState.mainTextAlign === 'both' ? 'justify' : (caState.mainTextAlign || 'justify')} text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded p-0.5 transition cursor-text select-text"
             title="Click to edit lawful purpose clause directly">
            ${escapeHtml(caState.purpose)}
          </p>
        </div>

        <!-- Issuance Line (Live Editable) -->
        <div>
          <p id="caIssueDateEl" contenteditable="true" spellcheck="false"
             oninput="handleCaSheetEdit(this, 'issueDate')"
             style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; margin-bottom: ${Math.round(caState.paragraphSpacing * 1.2)}px;"
             class="text-left text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded p-0.5 transition cursor-text select-text"
             title="Click to edit issuance line directly">
            ${escapeHtml(caState.issueDate)}
          </p>
        </div>

        <!-- ================= SIGNATORY BLOCK ================= -->
        <div class="pt-1 relative flex ${sigAlign === 'center' ? 'justify-center' : (sigAlign === 'left' ? 'justify-between flex-row-reverse' : 'justify-between')} items-end">
          <!-- Control Initials (DRMO / CTB) -->
          <div class="${sigAlign === 'center' ? 'absolute left-0 bottom-0' : ''} text-left">
            <span id="caInitialsEl" contenteditable="true" spellcheck="false"
                  oninput="handleCaSheetEdit(this, 'initials')"
                  class="text-[9px] font-mono text-slate-500 lowercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded transition cursor-text"
                  title="Click to edit initials">
              ${escapeHtml(caState.initials)}
            </span>
          </div>

          <!-- Official Signatory (Benjamin B. Magalong) -->
          <div class="text-center w-64">
            ${sigImgHtml}
            <div id="caSigNameEl" contenteditable="true" spellcheck="false"
                 oninput="handleCaSheetEdit(this, 'signatoryName')"
                 class="text-[12px] font-black uppercase text-slate-900 tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded transition cursor-text"
                 title="Click to edit signatory name">
              ${escapeHtml(caState.signatoryName)}
            </div>
            <div id="caSigT1El" contenteditable="true" spellcheck="false"
                 oninput="handleCaSheetEdit(this, 'signatoryTitle1')"
                 class="text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded transition cursor-text"
                 title="Click to edit title 1">
              ${escapeHtml(caState.signatoryTitle1)}
            </div>
            <div id="caSigT2El" contenteditable="true" spellcheck="false"
                 oninput="handleCaSheetEdit(this, 'signatoryTitle2')"
                 class="text-[9px] text-slate-600 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400 hover:ring-1 hover:ring-amber-300 rounded transition cursor-text"
                 title="Click to edit title 2">
              ${escapeHtml(caState.signatoryTitle2)}
            </div>
          </div>
        </div>
      </div>

      <!-- ================= FOOTER SECTION ================= -->
      <div class="pt-1.5 border-t border-slate-300 mt-1.5 flex items-center justify-between text-[8px] text-slate-500 font-medium">
        <div>Tel. No. (074)-442-89-20</div>
        <div class="text-slate-400 font-cinzel uppercase tracking-wider text-[8px]">Official Public Document &bull; MOVE Baguio Chapter</div>
        <div>website: <a href="http://www.baguio.gov.ph" target="_blank" class="text-move-orange-600 hover:underline">http://www.baguio.gov.ph</a></div>
      </div>

    </div>
  `;

  syncCaContextInput();
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

// --- PRINT CURRENT CERTIFICATE (A5 LANDSCAPE) ---
function printCertificateOfAppearance() {
  const container = document.getElementById('caPrintContainer');
  if (!container) return;

  const sheet = document.getElementById('caActiveSheet');
  if (!sheet) return;

  if (window.setPrintPageRule) {
    window.setPrintPageRule('A5 landscape');
  }

  // Clone active sheet into dedicated print container
  container.innerHTML = '';
  const clone = sheet.cloneNode(true);
  clone.id = 'caSheetToPrint';
  clone.classList.add('ca-print-page');
  clone.classList.add('ca-landscape-sheet');
  container.appendChild(clone);

  // Set printing class
  document.body.classList.add('printing-ca');

  window.print();

  setTimeout(() => {
    document.body.classList.remove('printing-ca');
  }, 1000);
}

// --- BATCH PRINT ALL PRESENT EMPLOYEES (A5 LANDSCAPE) ---
function batchPrintAllAppearance() {
  const participants = getActiveCaParticipants();
  if (participants.length === 0) {
    showToast('No present participants selected for printing', 'fa-triangle-exclamation');
    return;
  }

  const container = document.getElementById('caPrintContainer');
  if (!container) return;
  container.innerHTML = '';

  if (window.setPrintPageRule) {
    window.setPrintPageRule('A5 landscape');
  }

  const sigAlign = caState.signatureAlign || 'center';
  const sigJustify = (sigAlign === 'center') ? 'justify-center' : ((sigAlign === 'left') ? 'justify-start' : 'justify-end');
  const sigImgHtml = caState.showSignature ? `
    <div class="flex ${sigJustify} -mb-5 relative z-10 pointer-events-none select-none">
      <img src="signature%20(15).png" alt="Signature" 
           style="width: ${caState.signatureWidth}px; max-height: 48px;" 
           class="object-contain drop-shadow-xs">
    </div>
  ` : `<div class="h-6"></div>`;

  participants.forEach((currMember, idx) => {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'ca-landscape-sheet ca-print-page bg-white text-slate-900 mx-auto select-text';
    pageDiv.style.cssText = 'width: 210mm; height: 148mm; min-height: 148mm; max-height: 148mm; padding: 6mm 10mm 5mm 10mm; font-family: Arial, sans-serif; page-break-after: always; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; box-sizing: border-box;';

    pageDiv.innerHTML = `
      <!-- HEADER -->
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-700">
        <div class="w-12 h-12 flex items-center justify-center shrink-0">
          ${caState.showCityLogo ? `<img src="CITY%20HALL%20LOGO.png" alt="City Government of Baguio" class="w-full h-full object-contain">` : ''}
        </div>
        <div class="text-center px-2 flex-1 leading-tight">
          <div class="text-[9px] font-bold uppercase tracking-wider text-slate-800">Republic of the Philippines</div>
          <div class="text-[11px] font-black uppercase tracking-tight text-slate-900">CITY GOVERNMENT OF BAGUIO</div>
          <div class="text-[9.5px] font-extrabold uppercase tracking-wide text-move-orange-600 mt-0.5">Men Opposed to Violence Against Women Everywhere</div>
          <div class="text-[8px] text-slate-500 font-semibold tracking-wider uppercase">Baguio City Chapter &bull; Local Committee on Anti-VAWC</div>
        </div>
        <div class="w-12 h-12 flex items-center justify-center shrink-0">
          ${caState.showMoveLogo ? `<img src="MOVE%20BAGUIO%20LOGO.png" alt="MOVE Baguio Chapter" class="w-full h-full object-contain">` : ''}
        </div>
      </div>

      <!-- TITLE -->
      <div class="text-${caState.titleAlign || 'center'}" style="margin-top: 6px; margin-bottom: ${caState.titleSpacingAfter}px;">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-wider uppercase" style="font-family: 'MS Reference Sans Serif', 'Arial', sans-serif; letter-spacing: 1.5px;">
          ${escapeHtml(caState.documentTitle || 'CERTIFICATE OF APPEARANCE')}
        </h1>
      </div>

      <!-- BODY -->
      <div class="flex-1 flex flex-col justify-center py-0.5">
        <div class="mb-1.5">
          <p class="text-${caState.mainTextAlign === 'both' ? 'justify' : (caState.mainTextAlign || 'justify')} text-slate-900" style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; text-indent: ${caState.textIndent}px; margin-bottom: ${caState.paragraphSpacing}px;">
            ${buildCaMainHtml(currMember)}
          </p>
        </div>

        <div>
          <p class="text-${caState.mainTextAlign === 'both' ? 'justify' : (caState.mainTextAlign || 'justify')} text-slate-900" style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; text-indent: ${caState.textIndent}px; margin-bottom: ${caState.paragraphSpacing}px;">
            ${escapeHtml(caState.purpose)}
          </p>
        </div>

        <div>
          <p class="text-left text-slate-900" style="line-height: ${caState.lineSpacing}; font-size: ${caState.fontSize}px; margin-bottom: ${Math.round(caState.paragraphSpacing * 1.2)}px;">
            ${escapeHtml(caState.issueDate)}
          </p>
        </div>

        <!-- SIGNATORY BLOCK -->
        <div class="pt-1 relative flex ${sigAlign === 'center' ? 'justify-center' : (sigAlign === 'left' ? 'justify-between flex-row-reverse' : 'justify-between')} items-end">
          <div class="${sigAlign === 'center' ? 'absolute left-0 bottom-0' : ''} text-left">
            <span class="text-[9px] font-mono text-slate-500 lowercase tracking-wider">${escapeHtml(caState.initials)}</span>
          </div>
          <div class="text-center w-64">
            ${sigImgHtml}
            <div class="text-[12px] font-black uppercase text-slate-900 tracking-wider">${escapeHtml(caState.signatoryName)}</div>
            <div class="text-[10px] font-bold text-slate-800">${escapeHtml(caState.signatoryTitle1)}</div>
            <div class="text-[9px] text-slate-600 font-semibold">${escapeHtml(caState.signatoryTitle2)}</div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="pt-1.5 border-t border-slate-300 mt-1.5 flex items-center justify-between text-[8px] text-slate-500 font-medium">
        <div>Tel. No. (074)-442-89-20</div>
        <div class="text-slate-400 font-cinzel uppercase tracking-wider text-[8px]">Official Public Document &bull; MOVE Baguio Chapter</div>
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
async function exportCertificateOfAppearanceDocx(exportAll = false) {
  const participants = getActiveCaParticipants();
  const currentMember = participants[caState.currentMemberIndex] || null;

  const payload = {
    activityTitle: caState.title,
    theme: caState.theme,
    date: caState.date,
    venue: caState.venue,
    attendanceBasis: caState.attendanceBasis,
    honorificMode: caState.honorificMode,
    purpose: caState.purpose,
    issueDate: caState.issueDate,
    documentTitle: caState.documentTitle || 'CERTIFICATE OF APPEARANCE',
    signatoryName: caState.signatoryName,
    signatoryTitle1: caState.signatoryTitle1,
    signatoryTitle2: caState.signatoryTitle2,
    initials: caState.initials,
    mode: caState.mode,
    exportAll: !!exportAll,
    participants: participants,
    individualMember: currentMember,
    // Spacing, layout & typography parameters
    lineSpacing: caState.lineSpacing,
    paragraphSpacing: caState.paragraphSpacing,
    fontSize: caState.fontSize,
    textIndent: caState.textIndent,
    titleSpacingAfter: caState.titleSpacingAfter,
    signatureAlign: caState.signatureAlign,
    mainTextAlign: caState.mainTextAlign,
    titleAlign: caState.titleAlign,
    mainTemplate: caState.mainTemplate,
    customMemberTexts: caState.customMemberTexts,
    individualMainText: buildCaMainPlainText(currentMember)
  };

  const statusMsg = exportAll 
    ? `Generating official Word document for all ${participants.length} present employees...` 
    : `Generating official Word document for ${currentMember ? currentMember.name : 'employee'}...`;
  showToast(statusMsg, 'fa-file-word');

  try {
    const res = await fetch('http://127.0.0.1:8765/api/export-ca-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const blob = await res.blob();
      const safeTitle = (caState.title || 'MOVE').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = exportAll
        ? `Certificate_of_Appearance_${safeTitle}_ALL_${participants.length}_EMPLOYEES.docx`
        : `Certificate_of_Appearance_${(currentMember?.name || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;

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
  const filename = data.exportAll 
    ? `Certificate_of_Appearance_${safeTitle}_ALL_EMPLOYEES.doc`
    : `Certificate_of_Appearance_${((data.individualMember || {}).name || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;

  const fullActTitle = escapeHtml(getCaActivityFullTitle(data.activityTitle, data.theme));
  const dateClause = escapeHtml(formatCaDateText(data.date));
  const venueClause = escapeHtml(formatCaVenueText(data.venue));
  const docTitle = escapeHtml(data.documentTitle || 'CERTIFICATE OF APPEARANCE');
  const lSpacing = data.lineSpacing || 1.40;
  const pSpacing = data.paragraphSpacing || 14;
  const fSize = data.fontSize || 13.5;
  const sigAlign = data.signatureAlign || 'center';
  const titleSpace = data.titleSpacingAfter || 20;
  const mainAlign = (data.mainTextAlign === 'both' || !data.mainTextAlign) ? 'justify' : data.mainTextAlign;

  let bodyContent = '';
  if (data.mode === 'group') {
    bodyContent = `
      <div class="Section1">
        <div style="text-align: center; border-bottom: 2pt solid #000; padding-bottom: 10px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 10pt; font-weight: bold;">REPUBLIC OF THE PHILIPPINES</p>
          <p style="margin: 0; font-size: 11pt; font-weight: bold;">CITY GOVERNMENT OF BAGUIO</p>
          <p style="margin: 2px 0 0 0; font-size: 9.5pt; font-weight: bold; color: #ea580c;">MEN OPPOSED TO VIOLENCE AGAINST WOMEN EVERYWHERE</p>
          <p style="margin: 1px 0 0 0; font-size: 8.5pt; color: #555;">Baguio City Chapter &bull; Local Committee on Anti-VAWC</p>
        </div>

        <h1>${docTitle}</h1>

        <p class="certify">
          This is to certify that the following employees appeared as <strong>Participant/Facilitator</strong> during the “<strong>${fullActTitle}</strong>,” ${dateClause}, ${venueClause}:
        </p>

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
                <td style="font-weight: bold;">${getCaHonorific(p, false)}${escapeHtml(p.name || '')}</td>
                <td>${escapeHtml(p.position || '')}</td>
                <td style="text-align: center;">${escapeHtml(p.office || '')}</td>
                <td style="text-align: center;">${escapeHtml(p.role || 'Participant')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p class="purpose">${escapeHtml(data.purpose)}</p>
        <p class="issue">${escapeHtml(data.issueDate)}</p>

        <table style="width: 100%; margin-top: 40px; border: none;">
          <tr>
            <td style="vertical-align: bottom; font-family: monospace; font-size: 9pt; color: #666; width: 25%;">
              ${sigAlign !== 'left' ? escapeHtml(data.initials) : ''}
            </td>
            <td style="text-align: ${sigAlign}; vertical-align: bottom; width: 50%;">
              <p style="margin: 0; font-size: 11pt; font-weight: bold; text-transform: uppercase;">${escapeHtml(data.signatoryName)}</p>
              <p style="margin: 0; font-size: 10pt; font-weight: bold;">${escapeHtml(data.signatoryTitle1)}</p>
              <p style="margin: 0; font-size: 9pt; color: #333;">${escapeHtml(data.signatoryTitle2)}</p>
            </td>
            <td style="vertical-align: bottom; font-family: monospace; font-size: 9pt; color: #666; width: 25%; text-align: right;">
              ${sigAlign === 'left' ? escapeHtml(data.initials) : ''}
            </td>
          </tr>
        </table>

        <div style="margin-top: 40px; border-top: 1pt solid #ccc; padding-top: 8px; font-size: 8.5pt; color: #666;">
          <span>Tel. No. (074)-442-89-20</span>
          <span style="float: right;">website: http://www.baguio.gov.ph</span>
        </div>
      </div>
    `;
  } else {
    const listToRender = data.exportAll ? (data.participants || []) : [data.individualMember || (data.participants && data.participants[0]) || {}];
    bodyContent = listToRender.map((m, i) => {
      const memberHtml = buildCaMainHtml(m);

      return `
        <div class="Section1" ${i > 0 ? 'style="page-break-before: always; margin-top: 30px;"' : ''}>
          <div style="text-align: center; border-bottom: 2pt solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 10pt; font-weight: bold;">REPUBLIC OF THE PHILIPPINES</p>
            <p style="margin: 0; font-size: 11pt; font-weight: bold;">CITY GOVERNMENT OF BAGUIO</p>
            <p style="margin: 2px 0 0 0; font-size: 9.5pt; font-weight: bold; color: #ea580c;">MEN OPPOSED TO VIOLENCE AGAINST WOMEN EVERYWHERE</p>
            <p style="margin: 1px 0 0 0; font-size: 8.5pt; color: #555;">Baguio City Chapter &bull; Local Committee on Anti-VAWC</p>
          </div>

          <h1>${docTitle}</h1>

          <p class="certify">
            ${memberHtml}
          </p>

          <p class="purpose">${escapeHtml(data.purpose)}</p>
          <p class="issue">${escapeHtml(data.issueDate)}</p>

          <table style="width: 100%; margin-top: 40px; border: none;">
            <tr>
              <td style="vertical-align: bottom; font-family: monospace; font-size: 9pt; color: #666; width: 25%;">
                ${sigAlign !== 'left' ? escapeHtml(data.initials) : ''}
              </td>
              <td style="text-align: ${sigAlign}; vertical-align: bottom; width: 50%;">
                <p style="margin: 0; font-size: 11pt; font-weight: bold; text-transform: uppercase;">${escapeHtml(data.signatoryName)}</p>
                <p style="margin: 0; font-size: 10pt; font-weight: bold;">${escapeHtml(data.signatoryTitle1)}</p>
                <p style="margin: 0; font-size: 9pt; color: #333;">${escapeHtml(data.signatoryTitle2)}</p>
              </td>
              <td style="vertical-align: bottom; font-family: monospace; font-size: 9pt; color: #666; width: 25%; text-align: right;">
                ${sigAlign === 'left' ? escapeHtml(data.initials) : ''}
              </td>
            </tr>
          </table>

          <div style="margin-top: 40px; border-top: 1pt solid #ccc; padding-top: 8px; font-size: 8.5pt; color: #666;">
            <span>Tel. No. (074)-442-89-20</span>
            <span style="float: right;">website: http://www.baguio.gov.ph</span>
          </div>
        </div>
      `;
    }).join('');
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
        body { font-family: 'Arial', sans-serif; font-size: ${fSize}pt; line-height: ${lSpacing}; color: #000; }
        h1 { font-family: 'MS Reference Sans Serif', 'Arial', sans-serif; font-size: 18pt; text-align: center; margin-top: 20px; margin-bottom: ${titleSpace}pt; letter-spacing: 1.5pt; }
        p.certify { text-align: ${mainAlign}; text-indent: 36pt; margin-top: ${pSpacing}pt; margin-bottom: ${pSpacing}pt; line-height: ${lSpacing}; }
        p.purpose { text-align: ${mainAlign}; text-indent: 36pt; margin-top: ${pSpacing}pt; margin-bottom: ${pSpacing}pt; line-height: ${lSpacing}; }
        p.issue { margin-top: ${pSpacing}pt; margin-bottom: ${pSpacing * 1.5}pt; line-height: ${lSpacing}; }
      </style>
    </head>
    <body>
      ${bodyContent}
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
