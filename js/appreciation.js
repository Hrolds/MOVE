// ==========================================================================
// MOVE BAGUIO CHAPTER — CERTIFICATE OF APPRECIATION STUDIO
// Prestigious Honors Engine for Resource Speakers, Facilitators & Partners
// ==========================================================================

const APPREC_VERSIONS_KEY = 'move_appreciation_versions_v1';
const APPREC_AUTOSAVE_KEY = 'move_appreciation_autosave_v1';

const appreciationState = {
  activityId: 'ACT-KITCHEN-2',
  headerRepublic: 'Republic of the Philippines',
  headerCity: 'City Government of Baguio',
  headerChapter: 'Men Opposed to Violence Against Women Everywhere (MOVE)',
  headerSub: 'City Hall Chapter • Baguio City, Philippines',
  awardTitle: 'CERTIFICATE OF APPRECIATION',
  subtitle: 'is warmly and proudly presented to',
  honorific: 'HON.',
  recipientName: 'BENJAMIN B. MAGALONG',
  recipientPosition: 'City Mayor',
  recipientOffice: 'City Government of Baguio',
  citationPreset: 'speaker',
  citationText: 'for generously sharing his invaluable time, exemplary expertise, and profound insights as the distinguished Guest Speaker during the capacity-building seminar entitled “{activity},” held on {date} at {venue}.',
  dateVenueLine: 'Given this 20th day of October 2026 at the CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City, Philippines.',
  
  // Signatory Layout: 1 (Single Centered), 2 (Dual Left/Right), 3 (Triple)
  sigMode: 2,
  sig1: {
    enabled: true,
    name: 'MARIO D. GANGA JR.',
    title: 'MOVE Chapter President',
    office: 'City Government of Baguio',
    signatureImage: '',
    imageWidth: 150,
    imageHeight: 56
  },
  sig2: {
    enabled: true,
    name: 'HON. FAUSTINO A. OLOWAN',
    title: 'City Vice Mayor',
    office: 'City Government of Baguio',
    signatureImage: '',
    imageWidth: 150,
    imageHeight: 56
  },
  sig3: {
    enabled: false,
    name: 'FLORENTINO N. DELA CRUZ JR.',
    title: 'MOVE Vice President',
    office: 'City Government of Baguio',
    signatureImage: '',
    imageWidth: 150,
    imageHeight: 56
  },

  // Framing & Visual Design
  borderPreset: 'double_gold_navy',
  borderStyle: 'double_gold_navy', // double_gold_navy | ornate_gold | royal_blue_gold | emerald_bronze | burgundy_gold | platinum_charcoal | minimal_navy
  cornerStyle: 'baroque',           // baroque | geometric | none
  fontFamily: 'cinzel',             // cinzel | playfair | montserrat
  goldSealEnabled: true,
  goldSealPosition: 'bottom-left',   // bottom-left | bottom-center | bottom-right
  watermarkEnabled: true,
  watermarkOpacity: 12,
  watermarkSize: 320,
  watermarkImage: 'MOVE%20BAGUIO%20LOGO.png',
  watermarkLayer: 'behind', // behind | washout | infront | bottom-behind
  customWatermarkDataUrl: '',

  // Adjustable Typography Font Sizes (px)
  headerRepublicFontSize: 11,
  headerCityFontSize: 13,
  headerChapterFontSize: 14,
  headerSubFontSize: 10,
  awardTitleFontSize: 30, // px (20 - 46)
  subtitleFontSize: 13,   // px (9 - 24)
  recipientFontSize: 28,  // px (18 - 52)
  recipientPositionFontSize: 12, // px (8 - 24)
  citationFontSize: 12,   // px (9 - 20)
  dateFontSize: 11,       // px (8 - 22)
  recipientAlign: 'center', // center | left | right
  citationAlign: 'center',  // center | left | right | justify
  dateAlign: 'center',

  // Print paper size (A4 default, Letter, Legal, A3, A5 option)
  paperSize: 'a4',

  // Inserted Custom Photos / Badges
  insertedPhotos: [], // Array of { id, name, src, width, height, shape: 'gold_frame'|'circle'|'rounded'|'square', x, y }

  // Per-Element Typography & Formatting (Word Docs Style)
  elementStyles: {
    headerRepublic: { fontSize: 11, fontFamily: 'inherit', bold: true, italic: false, underline: false, align: 'center' },
    headerCity: { fontSize: 13, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    headerChapter: { fontSize: 14, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    headerSub: { fontSize: 10, fontFamily: 'inherit', bold: false, italic: false, underline: false, align: 'center' },
    headerText: { fontSize: 12, fontFamily: 'inherit', bold: false, italic: false, underline: false, align: 'center' },
    awardTitle: { fontSize: 30, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    subtitle: { fontSize: 13, fontFamily: 'inherit', bold: false, italic: true, underline: false, align: 'center' },
    recipient: { fontSize: 28, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    recipientPosition: { fontSize: 12, fontFamily: 'inherit', bold: true, italic: false, underline: false, align: 'center' },
    citation: { fontSize: 12, fontFamily: 'inherit', bold: false, italic: false, underline: false, align: 'center' },
    dateVenueLine: { fontSize: 11, fontFamily: 'inherit', bold: false, italic: true, underline: false, align: 'center' },
    sig1_name: { fontSize: 12, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    sig1_title: { fontSize: 10.5, fontFamily: 'inherit', bold: true, italic: false, underline: false, align: 'center' },
    sig1_office: { fontSize: 9.5, fontFamily: 'inherit', bold: false, italic: false, underline: false, align: 'center' },
    sig2_name: { fontSize: 12, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    sig2_title: { fontSize: 10.5, fontFamily: 'inherit', bold: true, italic: false, underline: false, align: 'center' },
    sig2_office: { fontSize: 9.5, fontFamily: 'inherit', bold: false, italic: false, underline: false, align: 'center' },
    sig3_name: { fontSize: 12, fontFamily: 'cinzel', bold: true, italic: false, underline: false, align: 'center' },
    sig3_title: { fontSize: 10.5, fontFamily: 'inherit', bold: true, italic: false, underline: false, align: 'center' },
    sig3_office: { fontSize: 9.5, fontFamily: 'inherit', bold: false, italic: false, underline: false, align: 'center' }
  },

  // Movable Elements Offsets (Edit Mode)
  offsets: {
    leftLogo: { x: 0, y: 0 },
    rightLogo: { x: 0, y: 0 },
    headerText: { x: 0, y: 0 },
    awardTitle: { x: 0, y: 0 },
    subtitle: { x: 0, y: 0 },
    recipient: { x: 0, y: 0 },
    citation: { x: 0, y: 0 },
    dateVenueLine: { x: 0, y: 0 },
    signatories: { x: 0, y: 0 },
    goldSeal: { x: 0, y: 0 },
    watermark: { x: 0, y: 0 }
  },
  activeMoveElementKey: 'recipient',

  isDesignerMode: false,
  zoom: 100,
  zoomMode: 'fit',
  activeVersionId: 'preset_speaker'
};

// --- PRESET CITATIONS & TEMPLATES ---
const APPREC_PRESETS = {
  speaker: {
    id: 'preset_speaker',
    name: 'Resource Speaker / Keynote Lecturer',
    isBuiltIn: true,
    awardTitle: 'CERTIFICATE OF APPRECIATION',
    subtitle: 'is warmly and proudly presented to',
    citation: 'for generously sharing his/her invaluable time, exemplary expertise, and profound insights as the distinguished Resource Speaker during the capacity-building activity entitled “{activity},” held on {date} at {venue}.'
  },
  facilitator: {
    id: 'preset_facilitator',
    name: 'Event Facilitator & Moderator',
    isBuiltIn: true,
    awardTitle: 'CERTIFICATE OF APPRECIATION',
    subtitle: 'is gratefully and sincerely conferred upon',
    citation: 'in sincere appreciation of their outstanding dedication, dynamic facilitation, and exceptional service in successfully moderating the workshop activity entitled “{activity},” conducted on {date} at {venue}.'
  },
  partner: {
    id: 'preset_partner',
    name: 'Partner Agency & Stakeholder',
    isBuiltIn: true,
    awardTitle: 'CERTIFICATE OF APPRECIATION',
    subtitle: 'is gratefully and honorably presented to',
    citation: 'in grateful recognition of their steadfast partnership, invaluable support, and enduring commitment to the advocacies of MOVE Baguio Chapter, significantly contributing to the success of “{activity},” held on {date} at {venue}.'
  },
  officer: {
    id: 'preset_officer',
    name: 'Outstanding MOVE Officer Award',
    isBuiltIn: true,
    awardTitle: 'CERTIFICATE OF COMMENDATION',
    subtitle: 'is proudly and honorably awarded to',
    citation: 'in proud recognition of their exemplary leadership, selfless devotion to public service, and outstanding contributions as an Executive Officer of the MOVE Baguio City Hall Chapter during the calendar year 2026.'
  },
  sponsor: {
    id: 'preset_sponsor',
    name: 'Generous Donor & Program Sponsor',
    isBuiltIn: true,
    awardTitle: 'CERTIFICATE OF APPRECIATION',
    subtitle: 'is warmly and gratefully presented to',
    citation: 'in heartfelt gratitude for their generous patronage and invaluable sponsorship in support of the Men Opposed to Violence Against Women Everywhere (MOVE) advocacy program and “{activity},” held on {date} at {venue}.'
  }
};

// --- 1-CLICK BORDER PRESETS (DEDICATED FOR CERTIFICATE OF APPRECIATION) ---
const APPREC_BORDER_PRESETS = {
  double_gold_navy: {
    key: 'double_gold_navy',
    name: 'Double Gold & Midnight Navy',
    desc: 'Official MOVE Baguio Signature Double Frame',
    outerBorder: 'border: 8px double #d97706;',
    innerBorder: 'border: 2px solid #091b38;',
    titleColor: '#091b38',
    accentColor: '#b45309',
    cornerStyle: 'baroque',
    bg: '#fffdfa'
  },
  ornate_gold: {
    key: 'ornate_gold',
    name: 'Ornate Florentine Gold',
    desc: 'Prestigious Filigree for Keynote & VIP Honors',
    outerBorder: 'border: 10px double #b45309;',
    innerBorder: 'border: 2px dashed #d97706;',
    titleColor: '#78350f',
    accentColor: '#d97706',
    cornerStyle: 'baroque',
    bg: '#fffef7'
  },
  royal_blue_gold: {
    key: 'royal_blue_gold',
    name: 'Royal Blue & Radiant Gold',
    desc: 'Distinguished Executive & Civic Recognition',
    outerBorder: 'border: 9px solid #1e3a8a;',
    innerBorder: 'border: 3px double #f59e0b;',
    titleColor: '#1e3a8a',
    accentColor: '#d97706',
    cornerStyle: 'geometric',
    bg: '#fafcff'
  },
  emerald_bronze: {
    key: 'emerald_bronze',
    name: 'Emerald Green & Antique Bronze',
    desc: 'Advocacy, Community Action & Environmental Impact',
    outerBorder: 'border: 9px double #065f46;',
    innerBorder: 'border: 2px solid #b45309;',
    titleColor: '#064e3b',
    accentColor: '#059669',
    cornerStyle: 'baroque',
    bg: '#fbfdfc'
  },
  burgundy_gold: {
    key: 'burgundy_gold',
    name: 'Imperial Burgundy & Gilded Gold',
    desc: 'Distinguished Leadership & Outstanding Service',
    outerBorder: 'border: 9px double #831843;',
    innerBorder: 'border: 2px solid #d97706;',
    titleColor: '#701a75',
    accentColor: '#be185d',
    cornerStyle: 'baroque',
    bg: '#fffbfa'
  },
  platinum_charcoal: {
    key: 'platinum_charcoal',
    name: 'Modern Platinum & Deep Charcoal',
    desc: 'Contemporary Corporate & Institutional Honors',
    outerBorder: 'border: 8px solid #334155;',
    innerBorder: 'border: 2px solid #94a3b8;',
    titleColor: '#0f172a',
    accentColor: '#475569',
    cornerStyle: 'geometric',
    bg: '#f8fafc'
  },
  minimal_navy: {
    key: 'minimal_navy',
    name: 'Executive Minimalist Navy',
    desc: 'Clean Modern Pinstripe Frame',
    outerBorder: 'border: 6px solid #091b38;',
    innerBorder: 'border: 1px solid #cbd5e1;',
    titleColor: '#091b38',
    accentColor: '#0284c7',
    cornerStyle: 'none',
    bg: '#ffffff'
  }
};

function setApprecBorderPreset(presetKey) {
  const p = APPREC_BORDER_PRESETS[presetKey];
  if (!p) return;
  appreciationState.borderPreset = presetKey;
  appreciationState.borderStyle = presetKey;
  if (p.cornerStyle) appreciationState.cornerStyle = p.cornerStyle;
  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  pushApprecHistoryState();
  showToast(`Applied Border Preset: "${p.name}"`, 'fa-palette');
}

// --- VERSIONS & PRESETS STORAGE ---
function getSavedApprecVersions() {
  try {
    const raw = localStorage.getItem(APPREC_VERSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved appreciation versions:', e);
  }
  return [];
}

function saveApprecVersionsList(list) {
  localStorage.setItem(APPREC_VERSIONS_KEY, JSON.stringify(list));
}

function getAllApprecVersions() {
  const builtIn = Object.values(APPREC_PRESETS).map(p => ({
    id: p.id,
    name: p.name + ' [Preset]',
    isBuiltIn: true,
    data: {
      awardTitle: p.awardTitle,
      subtitle: p.subtitle,
      citationText: p.citation
    }
  }));
  const saved = getSavedApprecVersions();
  return [...builtIn, ...saved];
}

function populateAppreciationVersionsDropdown() {
  const sel = document.getElementById('appreciationVersionSelect');
  if (!sel) return;
  sel.innerHTML = '';

  const all = getAllApprecVersions();
  all.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.name;
    if (v.id === appreciationState.activeVersionId) opt.selected = true;
    sel.appendChild(opt);
  });

  const delBtn = document.getElementById('appreciationBtnDeleteVersion');
  if (delBtn) {
    const isCustom = !appreciationState.activeVersionId.startsWith('preset_');
    delBtn.classList.toggle('hidden', !isCustom);
  }
}

function handleAppreciationVersionChange(versionId) {
  if (!versionId) return;
  appreciationState.activeVersionId = versionId;

  if (versionId.startsWith('preset_')) {
    const presetKey = versionId.replace('preset_', '');
    loadAppreciationPreset(presetKey);
    return;
  }

  const savedList = getSavedApprecVersions();
  const found = savedList.find(v => v.id === versionId);
  if (found && found.data) {
    Object.assign(appreciationState, JSON.parse(JSON.stringify(found.data)));
    syncAppreciationInputsFromState();
    renderAppreciationPreview();
    populateAppreciationVersionsDropdown();
    showToast(`Loaded version "${found.name}"`, 'fa-folder-open');
  }
}

function saveCurrentAppreciationVersion() {
  const defaultName = `${appreciationState.awardTitle} - ${appreciationState.recipientName || 'Snapshot'}`;
  const versionName = prompt('Enter a title for this Certificate of Appreciation version / preset:', defaultName);
  if (!versionName || !versionName.trim()) return;

  const savedList = getSavedApprecVersions();
  const newId = 'ver_apprec_' + Date.now();
  const snapshotData = JSON.parse(JSON.stringify(appreciationState));

  savedList.unshift({
    id: newId,
    name: versionName.trim(),
    createdAt: new Date().toISOString(),
    isBuiltIn: false,
    data: snapshotData
  });

  saveApprecVersionsList(savedList);
  appreciationState.activeVersionId = newId;
  populateAppreciationVersionsDropdown();
  showToast(`Saved version "${versionName.trim()}"!`, 'fa-floppy-disk');
}

function deleteCurrentAppreciationVersion() {
  if (appreciationState.activeVersionId.startsWith('preset_')) {
    showToast('Built-in presets cannot be deleted.', 'fa-circle-exclamation');
    return;
  }

  const savedList = getSavedApprecVersions();
  const found = savedList.find(v => v.id === appreciationState.activeVersionId);
  const name = found ? found.name : 'this version';
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  const updated = savedList.filter(v => v.id !== appreciationState.activeVersionId);
  saveApprecVersionsList(updated);
  appreciationState.activeVersionId = 'preset_speaker';
  loadAppreciationPreset('speaker');
  showToast(`Deleted version "${name}".`, 'fa-trash');
}

function loadAppreciationPreset(presetKey) {
  const p = APPREC_PRESETS[presetKey];
  if (!p) return;

  appreciationState.activeVersionId = p.id;
  appreciationState.citationPreset = presetKey;
  appreciationState.awardTitle = p.awardTitle;
  appreciationState.subtitle = p.subtitle;
  appreciationState.citationText = p.citation;

  // Tailor default signatories based on preset
  if (presetKey === 'officer') {
    appreciationState.sigMode = 2;
    appreciationState.sig1.name = 'MARIO D. GANGA JR.';
    appreciationState.sig1.title = 'MOVE Chapter President';
    appreciationState.sig2.name = 'HON. BENJAMIN B. MAGALONG';
    appreciationState.sig2.title = 'City Mayor';
  } else if (presetKey === 'speaker') {
    appreciationState.sigMode = 2;
    appreciationState.sig1.name = 'MARIO D. GANGA JR.';
    appreciationState.sig1.title = 'MOVE Chapter President';
    appreciationState.sig2.name = 'HON. BENJAMIN B. MAGALONG';
    appreciationState.sig2.title = 'City Mayor';
  }

  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  populateAppreciationVersionsDropdown();
  showToast(`Applied preset: ${p.name}`, 'fa-wand-magic-sparkles');
}

function resetAppreciationToDefault() {
  loadAppreciationPreset('speaker');
}

// --- ACTIVITIES SYNC ---
function populateAppreciationActivityDropdown() {
  const sel = document.getElementById('appreciationActivitySelect');
  if (!sel) return;
  sel.innerHTML = '';

  if (typeof activitiesList !== 'undefined' && activitiesList.length > 0) {
    activitiesList.forEach(act => {
      const opt = document.createElement('option');
      opt.value = act.id;
      opt.textContent = `${act.date} - ${act.title}`;
      if (act.id === appreciationState.activityId) opt.selected = true;
      sel.appendChild(opt);
    });
  } else {
    const opt = document.createElement('option');
    opt.value = 'ACT-KITCHEN-2';
    opt.textContent = 'October 20, 2026 - Men in the Kitchen 2';
    sel.appendChild(opt);
  }
}

function handleAppreciationActivityChange(actId) {
  appreciationState.activityId = actId;
  const act = typeof activitiesList !== 'undefined' ? activitiesList.find(a => a.id === actId) : null;
  if (act) {
    appreciationState.dateVenueLine = `Given this ${act.date} at ${act.venue || 'Baguio City, Philippines'}.`;
    const lineInput = document.getElementById('appreciationDateVenueLine');
    if (lineInput) lineInput.value = appreciationState.dateVenueLine;
  }
  renderAppreciationPreview();
}

// --- SIGNATORIES INTEGRATION (SHARED DB) ---
function populateAppreciationSigDropdowns() {
  const allSigs = typeof getAllSignatoriesList === 'function' ? getAllSignatoriesList() : [];
  [1, 2, 3].forEach(num => {
    const sel = document.getElementById(`apprecSelectOfficerSig${num}`);
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '';

    const defOpt = document.createElement('option');
    defOpt.value = 'custom';
    defOpt.textContent = '--- Select from Signatory Database ---';
    sel.appendChild(defOpt);

    const officialGroup = document.createElement('optgroup');
    officialGroup.label = 'Official MOVE Officers & City Leaders';
    allSigs.filter(s => !s.isCustom && s.key !== 'custom').forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.key;
      opt.textContent = s.label;
      officialGroup.appendChild(opt);
    });
    sel.appendChild(officialGroup);

    const customSigs = allSigs.filter(s => s.isCustom);
    if (customSigs.length > 0) {
      const customGroup = document.createElement('optgroup');
      customGroup.label = `Custom / Saved Database (${customSigs.length})`;
      customSigs.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.key;
        opt.textContent = c.label || `${c.name} (${c.title || 'Signatory'})`;
        customGroup.appendChild(opt);
      });
      sel.appendChild(customGroup);
    }

    if (currentVal) sel.value = currentVal;
  });
}

function handleApprecPickSignatory(sigNum, key) {
  if (!key || key === 'custom') return;
  const allSigs = typeof getAllSignatoriesList === 'function' ? getAllSignatoriesList() : [];
  const target = allSigs.find(s => s.key === key);
  if (!target) return;

  const sig = appreciationState[`sig${sigNum}`];
  sig.name = target.name;
  sig.title = target.title;
  sig.office = target.office || '';
  if (target.signatureImage) sig.signatureImage = target.signatureImage;

  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  showToast(`Assigned ${target.name} as Signatory ${sigNum}`, 'fa-user-check');
}

function saveApprecInputsToSignatoriesDb(sigNum) {
  const sig = appreciationState[`sig${sigNum}`];
  const name = (sig.name || '').trim().toUpperCase();
  const title = (sig.title || '').trim();
  const office = (sig.office || '').trim();
  const sigImg = sig.signatureImage || '';

  if (!name) {
    showToast(`Signatory ${sigNum} name is empty.`, 'fa-circle-exclamation');
    return;
  }

  const customList = typeof getCustomSignatories === 'function' ? getCustomSignatories() : [];
  const existing = customList.find(c => c.name.toUpperCase() === name);
  if (existing) {
    if (!confirm(`"${name}" is already in the database. Update details?`)) return;
    existing.title = title;
    existing.office = office;
    if (sigImg) existing.signatureImage = sigImg;
    existing.label = `${name} (${title || office || 'Signatory'})`;
  } else {
    customList.unshift({
      key: 'custom_' + Date.now(),
      label: `${name} (${title || office || 'Signatory'})`,
      name: name,
      title: title,
      office: office,
      signatureImage: sigImg,
      isCustom: true,
      createdAt: new Date().toISOString()
    });
  }

  if (typeof saveCustomSignatories === 'function') saveCustomSignatories(customList);
  if (typeof populateSignatoryOfficerDropdowns === 'function') populateSignatoryOfficerDropdowns();
  populateAppreciationSigDropdowns();
  showToast(`Saved "${name}" to Signatories Database!`, 'fa-database');
}

function setAppreciationSigMode(mode) {
  appreciationState.sigMode = mode;
  [1, 2, 3].forEach(m => {
    const btn = document.getElementById(`btnApprecSigMode${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] border transition bg-move-navy-900 text-white border-move-navy-900';
      } else {
        btn.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] border transition bg-white text-slate-700 border-slate-300 hover:bg-move-navy-900 hover:text-white';
      }
    }
  });

  const b1 = document.getElementById('apprecSig1Box');
  const b2 = document.getElementById('apprecSig2Box');
  const b3 = document.getElementById('apprecSig3Box');
  const l1 = document.getElementById('lblApprecSig1Role');
  const l2 = document.getElementById('lblApprecSig2Role');

  if (mode === 1) {
    if (b1) b1.classList.remove('hidden');
    if (b2) b2.classList.add('hidden');
    if (b3) b3.classList.add('hidden');
    if (l1) l1.textContent = 'Signatory (Sole / Centered Signatory)';
    appreciationState.sig1.enabled = true;
    appreciationState.sig2.enabled = false;
    appreciationState.sig3.enabled = false;
  } else if (mode === 2) {
    if (b1) b1.classList.remove('hidden');
    if (b2) b2.classList.remove('hidden');
    if (b3) b3.classList.add('hidden');
    if (l1) l1.textContent = 'Signatory 1 (Left / Primary)';
    if (l2) l2.textContent = 'Signatory 2 (Right / Secondary)';
    appreciationState.sig1.enabled = true;
    appreciationState.sig2.enabled = true;
    appreciationState.sig3.enabled = false;
  } else {
    if (b1) b1.classList.remove('hidden');
    if (b2) b2.classList.remove('hidden');
    if (b3) b3.classList.remove('hidden');
    if (l1) l1.textContent = 'Signatory 1 (Left Signatory)';
    if (l2) l2.textContent = 'Signatory 2 (Right Signatory)';
    appreciationState.sig1.enabled = true;
    appreciationState.sig2.enabled = true;
    appreciationState.sig3.enabled = true;
  }

  renderAppreciationPreview();
}

function handleApprecSigUpdate(sigNum) {
  const sig = appreciationState[`sig${sigNum}`];
  const nameEl = document.getElementById(`apprecInputSig${sigNum}Name`);
  const titleEl = document.getElementById(`apprecInputSig${sigNum}Title`);
  const officeEl = document.getElementById(`apprecInputSig${sigNum}Office`);

  if (nameEl) sig.name = nameEl.value.toUpperCase();
  if (titleEl) sig.title = titleEl.value;
  if (officeEl) sig.office = officeEl.value;

  renderAppreciationPreview();
}

function handleApprecSigImageUpload(e, sigNum) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    appreciationState[`sig${sigNum}`].signatureImage = evt.target.result;
    renderAppreciationPreview();
    showToast(`Signature image attached to Signatory ${sigNum}`, 'fa-signature');
  };
  reader.readAsDataURL(file);
}

function useOfficialApprecSig(sigNum) {
  appreciationState[`sig${sigNum}`].signatureImage = 'signature%20(15).png';
  renderAppreciationPreview();
  showToast(`Official signature applied to Signatory ${sigNum}`, 'fa-signature');
}

function removeApprecSigImage(sigNum) {
  appreciationState[`sig${sigNum}`].signatureImage = '';
  renderAppreciationPreview();
  showToast(`Signature image removed from Signatory ${sigNum}`, 'fa-trash');
}

// --- DESIGNER / EDIT MODE TOGGLE ---
function toggleApprecEditMode() {
  appreciationState.isDesignerMode = !appreciationState.isDesignerMode;
  const btn = document.getElementById('btnToggleApprecEdit');
  const bannerBtn = document.getElementById('btnApprecBannerEditToggle');
  const bannerLbl = document.getElementById('lblApprecBannerEditToggle');
  const lbl = document.getElementById('lblApprecEditMode');
  const icon = document.getElementById('iconApprecEditBtn');
  const canvas = document.getElementById('appreciationSheetCanvas');
  const nudgeBar = document.getElementById('apprecNudgeBar');

  if (appreciationState.isDesignerMode) {
    if (canvas) canvas.classList.add('cert-edit-active', 'apprec-edit-active');
    if (nudgeBar) nudgeBar.classList.remove('hidden');
    if (btn) {
      btn.className = 'px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition bg-move-navy-900 hover:bg-move-navy-950 text-white shadow-sm border border-amber-400 whitespace-nowrap';
    }
    if (lbl) lbl.textContent = 'Exit Designer Mode';
    if (bannerLbl) bannerLbl.textContent = 'Close Toolbar';
    if (bannerBtn) {
      bannerBtn.className = 'px-2.5 py-1 bg-move-navy-900 hover:bg-slate-800 text-amber-300 border border-amber-400 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs';
    }
    if (icon) icon.className = 'fa-solid fa-check text-emerald-400';
    showToast('Designer Mode Enabled: Drag any logo, text or photo to move freely, or use the Word formatting ribbon!', 'fa-arrows-up-down-left-right');
  } else {
    if (canvas) canvas.classList.remove('cert-edit-active', 'apprec-edit-active');
    if (nudgeBar) nudgeBar.classList.add('hidden');
    if (btn) {
      btn.className = 'px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition bg-amber-500 hover:bg-amber-600 text-white shadow-sm whitespace-nowrap';
    }
    if (lbl) lbl.textContent = 'Enable Designer / Edit Mode';
    if (bannerLbl) bannerLbl.textContent = 'Designer & Formatting';
    if (bannerBtn) {
      bannerBtn.className = 'px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-2xs';
    }
    if (icon) icon.className = 'fa-solid fa-pen-ruler';
  }
  renderAppreciationPreview();
  updateApprecMoveUi();
}

// --- WORD-STYLE ADJUSTABLE TYPOGRAPHY & FORMATTING ENGINE ---
function getApprecElementStyle(key) {
  if (!appreciationState.elementStyles) appreciationState.elementStyles = {};
  if (!appreciationState.elementStyles[key]) {
    const defaultSizes = {
      awardTitle: 30,
      subtitle: 13,
      recipient: 28,
      recipientPosition: 12,
      citation: 12,
      dateVenueLine: 11,
      headerRepublic: 11,
      headerCity: 13,
      headerChapter: 14,
      headerSub: 10,
      headerText: 12,
      sig1_name: 12, sig1_title: 10.5, sig1_office: 9.5,
      sig2_name: 12, sig2_title: 10.5, sig2_office: 9.5,
      sig3_name: 12, sig3_title: 10.5, sig3_office: 9.5
    };
    const defaultFonts = {
      awardTitle: 'cinzel',
      headerCity: 'cinzel',
      headerChapter: 'cinzel',
      recipient: 'cinzel',
      sig1_name: 'cinzel',
      sig2_name: 'cinzel',
      sig3_name: 'cinzel'
    };
    const defaultBolds = {
      awardTitle: true,
      recipient: true,
      recipientPosition: true,
      headerRepublic: true,
      headerCity: true,
      headerChapter: true,
      sig1_name: true, sig1_title: true,
      sig2_name: true, sig2_title: true,
      sig3_name: true, sig3_title: true
    };
    const defaultItalics = {
      subtitle: true,
      dateVenueLine: true
    };

    appreciationState.elementStyles[key] = {
      fontSize: defaultSizes[key] || 14,
      fontFamily: defaultFonts[key] || 'inherit',
      bold: defaultBolds[key] !== undefined ? defaultBolds[key] : false,
      italic: defaultItalics[key] !== undefined ? defaultItalics[key] : false,
      underline: false,
      align: 'center'
    };
  }
  return appreciationState.elementStyles[key];
}

function getApprecInlineTextStyle(key, fallbackFontSize, fallbackAlign, fallbackBold, fallbackItalic) {
  const st = getApprecElementStyle(key);
  const size = st.fontSize || fallbackFontSize || 14;
  const align = st.align || fallbackAlign || 'center';
  const bold = st.bold !== undefined ? st.bold : fallbackBold;
  const italic = st.italic !== undefined ? st.italic : fallbackItalic;
  const underline = !!st.underline;

  let familyCss = '';
  if (st.fontFamily && st.fontFamily !== 'inherit') {
    if (st.fontFamily === 'cinzel') familyCss = "font-family: 'Cinzel', serif;";
    else if (st.fontFamily === 'playfair') familyCss = "font-family: 'Playfair Display', serif;";
    else if (st.fontFamily === 'montserrat') familyCss = "font-family: 'Montserrat', sans-serif;";
    else if (st.fontFamily === 'times') familyCss = "font-family: 'Times New Roman', serif;";
    else if (st.fontFamily === 'arial') familyCss = "font-family: Arial, sans-serif;";
    else if (st.fontFamily === 'georgia') familyCss = "font-family: 'Georgia', serif;";
  }

  return `font-size: ${size}px; text-align: ${align}; font-weight: ${bold ? '900' : 'normal'}; font-style: ${italic ? 'italic' : 'normal'}; text-decoration: ${underline ? 'underline' : 'none'}; ${familyCss}`;
}

function setApprecActiveFontSize(size) {
  const val = parseInt(size, 10);
  if (isNaN(val)) return;
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const st = getApprecElementStyle(key);
  st.fontSize = val;

  if (key === 'awardTitle') appreciationState.awardTitleFontSize = val;
  else if (key === 'recipient') appreciationState.recipientFontSize = val;
  else if (key === 'citation') appreciationState.citationFontSize = val;
  else if (key === 'subtitle') appreciationState.subtitleFontSize = val;
  else if (key === 'recipientPosition') appreciationState.recipientPositionFontSize = val;
  else if (key === 'dateVenueLine' || key === 'date') appreciationState.dateFontSize = val;
  else if (key === 'headerRepublic') appreciationState.headerRepublicFontSize = val;
  else if (key === 'headerCity') appreciationState.headerCityFontSize = val;
  else if (key === 'headerChapter') appreciationState.headerChapterFontSize = val;
  else if (key === 'headerSub') appreciationState.headerSubFontSize = val;
  else if (key === 'headerText') {
    // Proportional scaling for all 4 header lines
    const ratio = val / 12;
    const r1 = Math.round(11 * ratio);
    const r2 = Math.round(13 * ratio);
    const r3 = Math.round(14 * ratio);
    const r4 = Math.round(10 * ratio);
    getApprecElementStyle('headerRepublic').fontSize = r1;
    getApprecElementStyle('headerCity').fontSize = r2;
    getApprecElementStyle('headerChapter').fontSize = r3;
    getApprecElementStyle('headerSub').fontSize = r4;
    appreciationState.headerRepublicFontSize = r1;
    appreciationState.headerCityFontSize = r2;
    appreciationState.headerChapterFontSize = r3;
    appreciationState.headerSubFontSize = r4;
  }

  syncApprecTypographyUi();
  renderAppreciationPreview();
  pushApprecHistoryState();
}

function changeApprecActiveFontSize(delta) {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const st = getApprecElementStyle(key);
  const cur = st.fontSize || 14;
  const newVal = Math.max(6, Math.min(72, cur + delta));
  setApprecActiveFontSize(newVal);
}

function setApprecActiveFontFamily(ff) {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const st = getApprecElementStyle(key);
  st.fontFamily = ff;
  renderAppreciationPreview();
  syncApprecTypographyUi();
  pushApprecHistoryState();
}

function toggleApprecActiveStyle(styleType) {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const st = getApprecElementStyle(key);
  if (styleType === 'bold') st.bold = !st.bold;
  else if (styleType === 'italic') st.italic = !st.italic;
  else if (styleType === 'underline') st.underline = !st.underline;
  renderAppreciationPreview();
  syncApprecTypographyUi();
  pushApprecHistoryState();
}

function setApprecActiveTextAlign(align) {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const st = getApprecElementStyle(key);
  st.align = align;
  if (key === 'recipient') appreciationState.recipientAlign = align;
  else if (key === 'citation') appreciationState.citationAlign = align;
  else if (key === 'dateVenueLine' || key === 'date') appreciationState.dateAlign = align;

  renderAppreciationPreview();
  syncApprecTypographyUi();
  pushApprecHistoryState();
}

function setApprecFontSize(field, size) {
  const val = parseInt(size, 10);
  if (isNaN(val)) return;
  const st = getApprecElementStyle(field);
  st.fontSize = val;

  if (field === 'awardTitle') appreciationState.awardTitleFontSize = val;
  else if (field === 'recipient') appreciationState.recipientFontSize = val;
  else if (field === 'citation') appreciationState.citationFontSize = val;
  else if (field === 'subtitle') appreciationState.subtitleFontSize = val;
  else if (field === 'recipientPosition') appreciationState.recipientPositionFontSize = val;
  else if (field === 'dateVenueLine' || field === 'date') appreciationState.dateFontSize = val;
  else if (field === 'headerRepublic') appreciationState.headerRepublicFontSize = val;
  else if (field === 'headerCity') appreciationState.headerCityFontSize = val;
  else if (field === 'headerChapter') appreciationState.headerChapterFontSize = val;
  else if (field === 'headerSub') appreciationState.headerSubFontSize = val;
  else if (field === 'headerText') {
    const ratio = val / 12;
    getApprecElementStyle('headerRepublic').fontSize = Math.round(11 * ratio);
    getApprecElementStyle('headerCity').fontSize = Math.round(13 * ratio);
    getApprecElementStyle('headerChapter').fontSize = Math.round(14 * ratio);
    getApprecElementStyle('headerSub').fontSize = Math.round(10 * ratio);
  }

  if (appreciationState.activeMoveElementKey === field) {
    const wfs = document.getElementById('apprecWordFontSizeSelect');
    if (wfs) wfs.value = val;
  }

  syncApprecTypographyUi();
  renderAppreciationPreview();
  pushApprecHistoryState();
}

function changeApprecFontSize(field, delta) {
  const st = getApprecElementStyle(field);
  const cur = st.fontSize || 14;
  const newVal = Math.max(6, Math.min(72, cur + delta));
  setApprecFontSize(field, newVal);
}

function setApprecTextAlign(field, align) {
  const st = getApprecElementStyle(field);
  st.align = align;
  if (field === 'recipient') appreciationState.recipientAlign = align;
  else if (field === 'citation') appreciationState.citationAlign = align;
  else if (field === 'dateVenueLine' || field === 'date') appreciationState.dateAlign = align;
  syncApprecTypographyUi();
  renderAppreciationPreview();
  pushApprecHistoryState();
}

function syncApprecTypographyUi() {
  const s = appreciationState;
  const key = s.activeMoveElementKey || 'recipient';
  const st = getApprecElementStyle(key);

  const wfs = document.getElementById('apprecWordFontSizeSelect');
  if (wfs && wfs !== document.activeElement) wfs.value = st.fontSize || 14;

  const wff = document.getElementById('apprecWordFontFamilySelect');
  if (wff) wff.value = st.fontFamily || 'inherit';

  const btnB = document.getElementById('btnApprecWordBold');
  if (btnB) {
    btnB.classList.toggle('bg-amber-500', !!st.bold);
    btnB.classList.toggle('text-white', !!st.bold);
  }

  const btnI = document.getElementById('btnApprecWordItalic');
  if (btnI) {
    btnI.classList.toggle('bg-amber-500', !!st.italic);
    btnI.classList.toggle('text-white', !!st.italic);
  }

  const btnU = document.getElementById('btnApprecWordUnderline');
  if (btnU) {
    btnU.classList.toggle('bg-amber-500', !!st.underline);
    btnU.classList.toggle('text-white', !!st.underline);
  }

  ['left', 'center', 'right', 'justify'].forEach(a => {
    const btn = document.getElementById(`btnApprecWordAlign-${a}`);
    if (btn) {
      const isMatch = (st.align || 'center') === a;
      btn.classList.toggle('bg-move-navy-900', isMatch);
      btn.classList.toggle('text-white', isMatch);
    }
  });

  // Sidebar Controls Sync (Card 1.5)
  const syncRangeAndVal = (inputId, labelId, val, unit = 'px') => {
    const el = document.getElementById(inputId);
    const lbl = document.getElementById(labelId);
    if (el && el !== document.activeElement) el.value = val;
    if (lbl) lbl.textContent = `${val}${unit}`;
  };

  syncRangeAndVal('apprecRecipientFontSize', 'apprecRecipientFontSizeVal', getApprecElementStyle('recipient').fontSize || 28);
  syncRangeAndVal('apprecTitleFontSize', 'apprecTitleFontSizeVal', getApprecElementStyle('awardTitle').fontSize || 30);
  syncRangeAndVal('apprecCitationFontSize', 'apprecCitationFontSizeVal', getApprecElementStyle('citation').fontSize || 12);
  syncRangeAndVal('apprecSubtitleFontSize', 'apprecSubtitleFontSizeVal', getApprecElementStyle('subtitle').fontSize || 13);
  syncRangeAndVal('apprecRecipientPosFontSize', 'apprecRecipientPosFontSizeVal', getApprecElementStyle('recipientPosition').fontSize || 12);
  syncRangeAndVal('apprecDateFontSize', 'apprecDateFontSizeVal', getApprecElementStyle('dateVenueLine').fontSize || 11);
  syncRangeAndVal('apprecHeaderRepFontSize', 'apprecHeaderRepFontSizeVal', getApprecElementStyle('headerRepublic').fontSize || 11);
  syncRangeAndVal('apprecHeaderCityFontSize', 'apprecHeaderCityFontSizeVal', getApprecElementStyle('headerCity').fontSize || 13);
  syncRangeAndVal('apprecHeaderChapFontSize', 'apprecHeaderChapFontSizeVal', getApprecElementStyle('headerChapter').fontSize || 14);
  syncRangeAndVal('apprecHeaderSubFontSize', 'apprecHeaderSubFontSizeVal', getApprecElementStyle('headerSub').fontSize || 10);
}

// --- OBJECT ALIGNMENT ENGINE (FOR ALL OBJECTS: LOGOS, TEXT, PHOTOS, SEALS) ---
function alignApprecObject(alignType) {
  const key = appreciationState.activeMoveElementKey || 'recipient';

  // If it is an inserted photo
  if (key.startsWith('photo_')) {
    const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
    if (photo) {
      if (alignType === 'left') photo.x = -240;
      else if (alignType === 'center') photo.x = 0;
      else if (alignType === 'right') photo.x = 240;
      else if (alignType === 'top') photo.y = -180;
      else if (alignType === 'middle') photo.y = 0;
      else if (alignType === 'bottom') photo.y = 160;
      renderAppreciationPreview();
      updateApprecMoveUi();
      pushApprecHistoryState();
      showToast(`Aligned "${photo.name}" to ${alignType}`, 'fa-crosshairs');
      return;
    }
  }

  // Standard certificate elements
  const off = getApprecOffset(key);
  if (alignType === 'left') {
    off.x = -160;
  } else if (alignType === 'center') {
    off.x = 0;
  } else if (alignType === 'right') {
    off.x = 160;
  } else if (alignType === 'top') {
    off.y = -40;
  } else if (alignType === 'middle') {
    off.y = 0;
  } else if (alignType === 'bottom') {
    off.y = 40;
  }

  renderAppreciationPreview();
  updateApprecMoveUi();
  pushApprecHistoryState();
  showToast(`Aligned "${key}" to ${alignType}`, 'fa-crosshairs');
}

// --- INSERT CUSTOM PHOTO / BADGE ENGINE ---
function openApprecPhotoUpload() {
  const inp = document.getElementById('apprecInsertPhotoInput');
  if (inp) inp.click();
}

function handleApprecPhotoUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    const photoId = 'photo_' + Date.now();
    const photoName = (file.name.replace(/\.[^/.]+$/, '') || 'Photo').slice(0, 20);

    if (!appreciationState.insertedPhotos) appreciationState.insertedPhotos = [];
    appreciationState.insertedPhotos.push({
      id: photoId,
      name: photoName,
      src: dataUrl,
      width: 110,
      height: 110,
      shape: 'gold_frame',
      x: 0,
      y: 0
    });

    appreciationState.activeMoveElementKey = photoId;
    renderAppreciationPreview();
    updateApprecMoveUi();
    pushApprecHistoryState();
    showToast(`Inserted "${photoName}"! Drag it anywhere or use Alignment buttons.`, 'fa-image');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function removeApprecPhoto(photoId) {
  if (!appreciationState.insertedPhotos) return;
  const idx = appreciationState.insertedPhotos.findIndex(p => p.id === photoId);
  if (idx !== -1) {
    const name = appreciationState.insertedPhotos[idx].name;
    appreciationState.insertedPhotos.splice(idx, 1);
    appreciationState.activeMoveElementKey = 'recipient';
    renderAppreciationPreview();
    updateApprecMoveUi();
    pushApprecHistoryState();
    showToast(`Removed "${name}" from certificate`, 'fa-trash');
  }
}

function removeApprecActivePhoto() {
  const key = appreciationState.activeMoveElementKey;
  if (key && key.startsWith('photo_')) {
    removeApprecPhoto(key);
  }
}

function setApprecPhotoShape(shape) {
  const key = appreciationState.activeMoveElementKey;
  if (!key || !key.startsWith('photo_')) return;
  const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
  if (photo) {
    photo.shape = shape;
    renderAppreciationPreview();
    pushApprecHistoryState();
    showToast(`Photo shape set to ${shape}`, 'fa-shapes');
  }
}

function setApprecPhotoSize(size) {
  const val = parseInt(size, 10);
  if (isNaN(val)) return;
  const key = appreciationState.activeMoveElementKey;
  if (!key || !key.startsWith('photo_')) return;
  const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
  if (photo) {
    photo.width = val;
    photo.height = val;
    const lbl = document.getElementById('apprecPhotoSizeVal');
    if (lbl) lbl.textContent = `${val}px`;
    renderAppreciationPreview();
    pushApprecHistoryState();
  }
}

// --- MOVABLE ELEMENTS (DRAG & DROP + NUDGING ENGINE) ---
function getApprecOffset(key) {
  if (!appreciationState.offsets) appreciationState.offsets = {};
  if (!appreciationState.offsets[key]) appreciationState.offsets[key] = { x: 0, y: 0 };
  return appreciationState.offsets[key];
}

function getApprecOffsetStyle(key) {
  const off = getApprecOffset(key);
  if (off.x === 0 && off.y === 0) return '';
  return `transform: translate(${off.x}px, ${off.y}px);`;
}

function getApprecDragAttrs(key) {
  return `data-apprec-element="${key}"`;
}

let isDraggingApprecElement = false;
let activeDragApprecKey = null;
let apprecDragStartX = 0;
let apprecDragStartY = 0;
let apprecDragInitX = 0;
let apprecDragInitY = 0;

function bindAppreciationDragListeners() {
  const stage = document.getElementById('appreciationPreviewStage');
  if (!stage || stage._dragBound) return;
  stage._dragBound = true;

  stage.addEventListener('mousedown', (e) => {
    if (!appreciationState.isDesignerMode) return;
    if (e.target.closest('.cert-remove-badge')) return;
    if (e.target.isContentEditable && document.activeElement === e.target) return;

    const targetEl = e.target.closest('[data-apprec-element]');
    if (!targetEl) return;

    activeDragApprecKey = targetEl.getAttribute('data-apprec-element');
    appreciationState.activeMoveElementKey = activeDragApprecKey;
    isDraggingApprecElement = true;
    apprecDragStartX = e.clientX;
    apprecDragStartY = e.clientY;

    if (activeDragApprecKey.startsWith('photo_')) {
      const photo = (appreciationState.insertedPhotos || []).find(p => p.id === activeDragApprecKey);
      apprecDragInitX = photo ? (photo.x || 0) : 0;
      apprecDragInitY = photo ? (photo.y || 0) : 0;
    } else {
      const off = getApprecOffset(activeDragApprecKey);
      apprecDragInitX = off.x || 0;
      apprecDragInitY = off.y || 0;
    }

    stage.querySelectorAll('[data-apprec-element]').forEach(el => el.classList.remove('is-selected-element'));
    targetEl.classList.add('is-selected-element', 'is-dragging');

    updateApprecMoveUi();
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingApprecElement || !activeDragApprecKey || !appreciationState.isDesignerMode) return;
    const scale = appreciationState.currentScale || 1.0;
    const dx = Math.round((e.clientX - apprecDragStartX) / scale);
    const dy = Math.round((e.clientY - apprecDragStartY) / scale);

    if (activeDragApprecKey.startsWith('photo_')) {
      const photo = (appreciationState.insertedPhotos || []).find(p => p.id === activeDragApprecKey);
      if (photo) {
        photo.x = apprecDragInitX + dx;
        photo.y = apprecDragInitY + dy;
        const targetEl = stage.querySelector(`[data-apprec-element="${activeDragApprecKey}"]`);
        if (targetEl) targetEl.style.transform = `translate(${photo.x}px, ${photo.y}px)`;
      }
    } else {
      const off = getApprecOffset(activeDragApprecKey);
      off.x = apprecDragInitX + dx;
      off.y = apprecDragInitY + dy;
      const targetEl = stage.querySelector(`[data-apprec-element="${activeDragApprecKey}"]`);
      if (targetEl) targetEl.style.transform = `translate(${off.x}px, ${off.y}px)`;
    }
    updateApprecMoveUi();
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingApprecElement && activeDragApprecKey) {
      const targetEl = stage.querySelector(`[data-apprec-element="${activeDragApprecKey}"]`);
      if (targetEl) targetEl.classList.remove('is-dragging');

      pushApprecHistoryState();
      isDraggingApprecElement = false;
    }
  });
}

function nudgeApprecElement(dx, dy) {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  if (key.startsWith('photo_')) {
    const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
    if (photo) {
      photo.x += dx;
      photo.y += dy;
    }
  } else {
    const off = getApprecOffset(key);
    off.x += dx;
    off.y += dy;
  }
  renderAppreciationPreview();
  updateApprecMoveUi();
  pushApprecHistoryState();
}

function syncApprecOffsetFromInputs() {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const ix = parseInt(document.getElementById('apprecInputOffsetX')?.value || '0', 10) || 0;
  const iy = parseInt(document.getElementById('apprecInputOffsetY')?.value || '0', 10) || 0;

  if (key.startsWith('photo_')) {
    const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
    if (photo) {
      photo.x = ix;
      photo.y = iy;
    }
  } else {
    const off = getApprecOffset(key);
    off.x = ix;
    off.y = iy;
  }
  renderAppreciationPreview();
  updateApprecMoveUi();
  pushApprecHistoryState();
}

function resetApprecElementPosition() {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  if (key.startsWith('photo_')) {
    const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
    if (photo) {
      photo.x = 0;
      photo.y = 0;
    }
  } else {
    const off = getApprecOffset(key);
    off.x = 0;
    off.y = 0;
  }
  renderAppreciationPreview();
  updateApprecMoveUi();
  pushApprecHistoryState();
  showToast(`Reset ${key} position to (0,0)`, 'fa-arrows-to-dot');
}

function resetAllApprecPositions() {
  if (appreciationState.offsets) {
    Object.keys(appreciationState.offsets).forEach(k => {
      appreciationState.offsets[k] = { x: 0, y: 0 };
    });
  }
  if (appreciationState.insertedPhotos) {
    appreciationState.insertedPhotos.forEach(p => {
      p.x = 0;
      p.y = 0;
    });
  }
  renderAppreciationPreview();
  updateApprecMoveUi();
  pushApprecHistoryState();
  showToast('All element positions reset to (0,0)', 'fa-rotate-left');
}

function handleApprecNudgeTargetChange(key) {
  appreciationState.activeMoveElementKey = key;
  updateApprecMoveUi();
  const stage = document.getElementById('appreciationPreviewStage');
  if (stage) {
    stage.querySelectorAll('[data-apprec-element]').forEach(el => el.classList.remove('is-selected-element'));
    const el = stage.querySelector(`[data-apprec-element="${key}"]`);
    if (el) el.classList.add('is-selected-element');
  }
}

function updateApprecMoveUi() {
  const key = appreciationState.activeMoveElementKey || 'recipient';
  const sel = document.getElementById('apprecMoveElementTargetSelect');

  if (sel) {
    const standardOptions = [
      { val: 'recipient', label: 'Recipient Name' },
      { val: 'recipientPosition', label: 'Recipient Position & Office' },
      { val: 'awardTitle', label: 'Award Title' },
      { val: 'subtitle', label: 'Presentation Subtitle' },
      { val: 'citation', label: 'Citation Paragraph' },
      { val: 'dateVenueLine', label: 'Date & Venue Line' },
      { val: 'headerRepublic', label: 'Header: Republic of the Philippines' },
      { val: 'headerCity', label: 'Header: City Government of Baguio' },
      { val: 'headerChapter', label: 'Header: MOVE Chapter Title' },
      { val: 'headerSub', label: 'Header: Chapter Subline' },
      { val: 'headerText', label: 'Header Block (All 4 Lines)' },
      { val: 'leftLogo', label: 'Left Logo (City Hall)' },
      { val: 'rightLogo', label: 'Right Logo (MOVE Baguio)' },
      { val: 'signatories', label: 'Signatures Block' },
      { val: 'sig1_name', label: 'Signatory 1: Name' },
      { val: 'sig1_title', label: 'Signatory 1: Title' },
      { val: 'sig2_name', label: 'Signatory 2: Name' },
      { val: 'sig2_title', label: 'Signatory 2: Title' },
      { val: 'sig3_name', label: 'Signatory 3: Name' },
      { val: 'sig3_title', label: 'Signatory 3: Title' },
      { val: 'goldSeal', label: 'Official Gold Seal' },
      { val: 'watermark', label: 'Watermark Emblem' }
    ];

    const photoOptions = (appreciationState.insertedPhotos || []).map(p => ({
      val: p.id,
      label: `🖼️ [Photo] ${p.name}`
    }));

    const allOpts = [...standardOptions, ...photoOptions];
    sel.innerHTML = allOpts.map(o => `<option value="${o.val}" ${o.val === key ? 'selected' : ''}>${o.label}</option>`).join('');
  }

  // Update position coordinates
  let curX = 0, curY = 0;
  if (key.startsWith('photo_')) {
    const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
    if (photo) {
      curX = photo.x || 0;
      curY = photo.y || 0;
    }
  } else {
    const off = getApprecOffset(key);
    curX = off.x;
    curY = off.y;
  }

  const lbl = document.getElementById('lblApprecActiveOffset');
  const ix = document.getElementById('apprecInputOffsetX');
  const iy = document.getElementById('apprecInputOffsetY');
  if (lbl) lbl.textContent = `${curX}, ${curY}`;
  if (ix && ix !== document.activeElement) ix.value = curX;
  if (iy && iy !== document.activeElement) iy.value = curY;

  // Toggle between Word Text Ribbon and Photo Options
  const isPhoto = key.startsWith('photo_');
  const photoControls = document.getElementById('apprecRibbonPhotoControls');
  const textControls = document.getElementById('apprecRibbonTextControls');
  if (photoControls) photoControls.classList.toggle('hidden', !isPhoto);
  if (textControls) textControls.classList.toggle('hidden', isPhoto);

  if (isPhoto) {
    const photo = (appreciationState.insertedPhotos || []).find(p => p.id === key);
    if (photo) {
      const ps = document.getElementById('apprecPhotoSize');
      const psVal = document.getElementById('apprecPhotoSizeVal');
      if (ps) ps.value = photo.width || 100;
      if (psVal) psVal.textContent = `${photo.width || 100}px`;
    }
  } else {
    const st = getApprecElementStyle(key);
    const wfs = document.getElementById('apprecWordFontSizeSelect');
    if (wfs && wfs !== document.activeElement) wfs.value = st.fontSize || 28;

    const wff = document.getElementById('apprecWordFontFamilySelect');
    if (wff) wff.value = st.fontFamily || 'inherit';

    const btnB = document.getElementById('btnApprecWordBold');
    if (btnB) {
      btnB.classList.toggle('bg-amber-500', !!st.bold);
      btnB.classList.toggle('text-white', !!st.bold);
    }

    const btnI = document.getElementById('btnApprecWordItalic');
    if (btnI) {
      btnI.classList.toggle('bg-amber-500', !!st.italic);
      btnI.classList.toggle('text-white', !!st.italic);
    }

    const btnU = document.getElementById('btnApprecWordUnderline');
    if (btnU) {
      btnU.classList.toggle('bg-amber-500', !!st.underline);
      btnU.classList.toggle('text-white', !!st.underline);
    }

    ['left', 'center', 'right', 'justify'].forEach(a => {
      const btn = document.getElementById(`btnApprecWordAlign-${a}`);
      if (btn) {
        const isMatch = (st.align || 'center') === a;
        btn.classList.toggle('bg-move-navy-900', isMatch);
        btn.classList.toggle('text-white', isMatch);
      }
    });
  }

  syncApprecTypographyUi();
}

// --- PAPER SIZE HANDLER ---
function handleApprecPaperSizeChange(size) {
  appreciationState.paperSize = size || 'a4';
  const paperLabels = {
    a4: 'A4 Landscape (297 \u00d7 210 mm)',
    letter: 'US Letter Landscape (11 \u00d7 8.5 in)',
    legal: 'US Legal Landscape (14 \u00d7 8.5 in)',
    a3: 'A3 Landscape (420 \u00d7 297 mm)',
    a5: 'A5 Landscape (210 \u00d7 148 mm)'
  };
  const label = paperLabels[size] || size;
  const sel = document.getElementById('apprecPrintPaperSizeSelect');
  if (sel && sel.value !== size) sel.value = size;
  showToast(`Print paper size set to ${label} (Default is A4)`, 'fa-file-lines');
  pushApprecHistoryState();
}

// --- UNDO / REDO HISTORY ENGINE FOR APPRECIATION ---
const apprecHistory = [];
let apprecHistoryIdx = -1;

function pushApprecHistoryState() {
  const snap = JSON.stringify(appreciationState);
  if (apprecHistoryIdx >= 0 && apprecHistory[apprecHistoryIdx] === snap) return;
  if (apprecHistoryIdx < apprecHistory.length - 1) {
    apprecHistory.splice(apprecHistoryIdx + 1);
  }
  apprecHistory.push(snap);
  if (apprecHistory.length > 25) apprecHistory.shift();
  apprecHistoryIdx = apprecHistory.length - 1;
  updateApprecUndoRedoButtons();
}

function undoApprecState() {
  if (apprecHistoryIdx > 0) {
    apprecHistoryIdx--;
    const parsed = JSON.parse(apprecHistory[apprecHistoryIdx]);
    Object.assign(appreciationState, parsed);
    syncAppreciationInputsFromState();
    renderAppreciationPreview();
    updateApprecUndoRedoButtons();
    showToast('Undo performed (Appreciation)', 'fa-rotate-left');
  }
}

function redoApprecState() {
  if (apprecHistoryIdx < apprecHistory.length - 1) {
    apprecHistoryIdx++;
    const parsed = JSON.parse(apprecHistory[apprecHistoryIdx]);
    Object.assign(appreciationState, parsed);
    syncAppreciationInputsFromState();
    renderAppreciationPreview();
    updateApprecUndoRedoButtons();
    showToast('Redo performed (Appreciation)', 'fa-rotate-right');
  }
}

function updateApprecUndoRedoButtons() {
  const btnUndo = document.getElementById('btnApprecUndo');
  const btnRedo = document.getElementById('btnApprecRedo');
  if (btnUndo) {
    btnUndo.disabled = apprecHistoryIdx <= 0;
    btnUndo.classList.toggle('opacity-50', apprecHistoryIdx <= 0);
    btnUndo.classList.toggle('cursor-not-allowed', apprecHistoryIdx <= 0);
  }
  if (btnRedo) {
    btnRedo.disabled = apprecHistoryIdx >= apprecHistory.length - 1;
    btnRedo.classList.toggle('opacity-50', apprecHistoryIdx >= apprecHistory.length - 1);
    btnRedo.classList.toggle('cursor-not-allowed', apprecHistoryIdx >= apprecHistory.length - 1);
  }
}

// --- WATERMARK CHANGING FEATURES ---
function setApprecWatermarkPreset(imgSrc) {
  appreciationState.watermarkImage = imgSrc;
  appreciationState.customWatermarkDataUrl = '';
  appreciationState.watermarkEnabled = true;
  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  pushApprecHistoryState();
  showToast('Appreciation watermark changed!', 'fa-image');
}

function setApprecWatermarkLayer(layer) {
  appreciationState.watermarkLayer = layer;
  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  pushApprecHistoryState();
}

function handleApprecWatermarkUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    appreciationState.customWatermarkDataUrl = e.target.result;
    appreciationState.watermarkEnabled = true;
    syncAppreciationInputsFromState();
    renderAppreciationPreview();
    pushApprecHistoryState();
    showToast('Custom watermark image loaded!', 'fa-upload');
  };
  reader.readAsDataURL(file);
}

function resetApprecWatermark() {
  appreciationState.customWatermarkDataUrl = '';
  appreciationState.watermarkImage = 'MOVE%20BAGUIO%20LOGO.png';
  appreciationState.watermarkOpacity = 12;
  appreciationState.watermarkSize = 320;
  appreciationState.watermarkLayer = 'behind';
  appreciationState.watermarkEnabled = true;
  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  pushApprecHistoryState();
  showToast('Watermark reset to official MOVE Baguio seal.', 'fa-rotate-left');
}

function setApprecSignatureCountMode(count) {
  appreciationState.sigMode = count;
  if (count === 1) {
    appreciationState.sig1.enabled = true;
    appreciationState.sig2.enabled = false;
    appreciationState.sig3.enabled = false;
  } else if (count === 2) {
    appreciationState.sig1.enabled = true;
    appreciationState.sig2.enabled = true;
    appreciationState.sig3.enabled = false;
  } else if (count === 3) {
    appreciationState.sig1.enabled = true;
    appreciationState.sig2.enabled = true;
    appreciationState.sig3.enabled = true;
  }
  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  pushApprecHistoryState();
}

// --- FIELD & STYLE UPDATES ---
function handleAppreciationFieldChange(field, val) {
  appreciationState[field] = val;
  renderAppreciationPreview();
  pushApprecHistoryState();
}

function handleAppreciationStyleChange(field, val) {
  appreciationState[field] = val;
  if (field === 'watermarkOpacity') {
    const el = document.getElementById('apprecWatermarkOpacityVal');
    if (el) el.textContent = `${val}%`;
  }
  if (field === 'watermarkSize') {
    const el = document.getElementById('apprecWatermarkSizeVal');
    if (el) el.textContent = `${val}px`;
  }
  renderAppreciationPreview();
  pushApprecHistoryState();
}

function formatAppreciationRecipientUppercase() {
  const input = document.getElementById('appreciationRecipientName');
  if (input) {
    input.value = input.value.toUpperCase();
    appreciationState.recipientName = input.value;
    renderAppreciationPreview();
    pushApprecHistoryState();
  }
}

function insertAppreciationTag(tag) {
  const ta = document.getElementById('appreciationCitationText');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const cur = ta.value;
  ta.value = cur.substring(0, start) + tag + cur.substring(end);
  appreciationState.citationText = ta.value;
  ta.focus();
  ta.setSelectionRange(start + tag.length, start + tag.length);
  renderAppreciationPreview();
  pushApprecHistoryState();
}

// --- STUDIO TAB CONTROLS ---
function switchApprecControlTab(tab) {
  const tabs = ['content', 'sigs', 'design'];
  tabs.forEach(t => {
    const btn = document.getElementById('tabBtnApprec-' + t);
    const panel = document.getElementById('tabPanelApprec-' + t);
    const isActive = (t === tab);
    if (panel) panel.classList.toggle('hidden', !isActive);
    if (btn) {
      if (isActive) {
        btn.className = 'flex-1 py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 bg-move-navy-900 text-white shadow-sm';
      } else {
        btn.className = 'flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100';
      }
    }
  });
}

// --- SMART AUTO-FIT & ZOOM ENGINE ---
function setApprecZoomMode(mode) {
  appreciationState.zoomMode = mode;
  if (typeof mode === 'number') {
    appreciationState.zoom = mode;
  }
  updateApprecZoomUi();
  updateApprecAutoFit();
}

function setAppreciationZoom(pct) {
  setApprecZoomMode(pct);
}

function updateApprecZoomUi() {
  const cur = appreciationState.zoomMode || 'fit';
  ['fit', '75', '100', '120'].forEach(k => {
    const btn = document.getElementById('btnApprecZoom' + (k === 'fit' ? 'Fit' : k));
    if (btn) {
      const isMatch = (cur === k || (typeof cur === 'number' && String(cur) === k));
      if (isMatch) {
        btn.className = 'px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black transition flex items-center gap-1 shadow-2xs';
      } else {
        btn.className = 'px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition';
      }
    }
  });
}

function updateApprecAutoFit() {
  const stage = document.getElementById('appreciationPreviewStage');
  const container = document.getElementById('apprecStageContainer');
  const sheet = document.getElementById('appreciationSheetCanvas');
  if (!stage || !container || !sheet) return;

  const mode = appreciationState.zoomMode || 'fit';
  let scale = 1.0;

  if (mode === 'fit') {
    // 297mm in pixels at 96 DPI is ~1122.52px
    const targetWidth = 1122.52;
    const availWidth = container.clientWidth - 28; // container padding buffer
    if (availWidth > 150) {
      scale = Math.min(1.0, availWidth / targetWidth);
    } else {
      scale = 0.65;
    }
  } else if (typeof mode === 'number') {
    scale = mode / 100;
  } else if (mode === '75') {
    scale = 0.75;
  } else if (mode === '100') {
    scale = 1.0;
  } else if (mode === '120') {
    scale = 1.2;
  }

  appreciationState.currentScale = scale;
  stage.style.transform = `scale(${scale})`;
  stage.style.transformOrigin = 'top center';

  // Sizing container height to match scaled sheet perfectly with no vertical overflow or dead space
  const sheetHeight = 793.7; // 210mm in pixels at 96 DPI
  const scaledHeight = Math.round(sheetHeight * scale);
  container.style.height = `${scaledHeight + 32}px`;
  container.style.minHeight = `${scaledHeight + 32}px`;
}

// --- SYNC INPUT CONTROLS ---
function syncAppreciationInputsFromState() {
  const s = appreciationState;

  const titleEl = document.getElementById('appreciationAwardTitle');
  if (titleEl && titleEl !== document.activeElement) titleEl.value = s.awardTitle;

  const subEl = document.getElementById('appreciationSubtitle');
  if (subEl && subEl !== document.activeElement) subEl.value = s.subtitle;

  const honEl = document.getElementById('appreciationHonorific');
  if (honEl && honEl !== document.activeElement) honEl.value = s.honorific || '';

  const nameEl = document.getElementById('appreciationRecipientName');
  if (nameEl && nameEl !== document.activeElement) nameEl.value = s.recipientName || '';

  const posEl = document.getElementById('appreciationRecipientPosition');
  if (posEl && posEl !== document.activeElement) posEl.value = s.recipientPosition || '';

  const offEl = document.getElementById('appreciationRecipientOffice');
  if (offEl && offEl !== document.activeElement) offEl.value = s.recipientOffice || '';

  const citEl = document.getElementById('appreciationCitationText');
  if (citEl && citEl !== document.activeElement) citEl.value = s.citationText || '';

  const dateLineEl = document.getElementById('appreciationDateVenueLine');
  if (dateLineEl && dateLineEl !== document.activeElement) dateLineEl.value = s.dateVenueLine || '';

  // Signatories
  [1, 2, 3].forEach(n => {
    const sig = s[`sig${n}`];
    const sn = document.getElementById(`apprecInputSig${n}Name`);
    if (sn && sn !== document.activeElement) sn.value = sig.name || '';
    const st = document.getElementById(`apprecInputSig${n}Title`);
    if (st && st !== document.activeElement) st.value = sig.title || '';
    const so = document.getElementById(`apprecInputSig${n}Office`);
    if (so && so !== document.activeElement) so.value = sig.office || '';

    const sel = document.getElementById(`apprecSelectOfficerSig${n}`);
    if (sel) {
      const allSigs = typeof getAllSignatoriesList === 'function' ? getAllSignatoriesList() : [];
      const match = allSigs.find(o => o.name.trim().toUpperCase() === (sig.name || '').trim().toUpperCase());
      sel.value = match ? match.key : 'custom';
    }
  });

  // Styles
  const bSel = document.getElementById('apprecBorderStyle');
  if (bSel) bSel.value = s.borderPreset || s.borderStyle;

  const cSel = document.getElementById('apprecCornerStyle');
  if (cSel) cSel.value = s.cornerStyle;

  const fSel = document.getElementById('apprecFontFamily');
  if (fSel) fSel.value = s.fontFamily;

  const gsChk = document.getElementById('apprecGoldSealEnabled');
  if (gsChk) gsChk.checked = !!s.goldSealEnabled;

  const gsPos = document.getElementById('apprecGoldSealPosition');
  if (gsPos) gsPos.value = s.goldSealPosition;

  // Paper Size Select
  const pSel = document.getElementById('apprecPrintPaperSizeSelect');
  if (pSel) pSel.value = s.paperSize || 'a4';

  // Watermark Inputs
  const wmChk = document.getElementById('apprecWatermarkEnabled');
  if (wmChk) wmChk.checked = !!s.watermarkEnabled;

  const wmOp = document.getElementById('apprecWatermarkOpacity');
  if (wmOp) wmOp.value = s.watermarkOpacity;
  const wmOpVal = document.getElementById('apprecWatermarkOpacityVal');
  if (wmOpVal) wmOpVal.textContent = `${s.watermarkOpacity}%`;

  const wmSz = document.getElementById('apprecWatermarkSize');
  if (wmSz) wmSz.value = s.watermarkSize || 320;
  const wmSzVal = document.getElementById('apprecWatermarkSizeVal');
  if (wmSzVal) wmSzVal.textContent = `${s.watermarkSize || 320}px`;

  const wmLayer = document.getElementById('apprecWatermarkLayer');
  if (wmLayer) wmLayer.value = s.watermarkLayer || 'behind';

  // Highlight active watermark thumbnail preset
  const curImg = s.customWatermarkDataUrl || s.watermarkImage || '';
  ['move', 'city', 'kitchen', 'breathe'].forEach(k => {
    const btn = document.getElementById(`btnApprecWmPreset-${k}`);
    if (btn) {
      let isMatch = false;
      if (k === 'move' && curImg.includes('MOVE%20BAGUIO%20LOGO')) isMatch = true;
      else if (k === 'city' && curImg.includes('CITY%20HALL%20LOGO')) isMatch = true;
      else if (k === 'kitchen' && curImg.includes('MEN%20IN%20THE%20KITCHEN%202%20LOGO')) isMatch = true;
      else if (k === 'breathe' && curImg.includes('BREATHE_BAGUIO')) isMatch = true;
      btn.classList.toggle('ring-2', isMatch);
      btn.classList.toggle('ring-amber-500', isMatch);
      btn.classList.toggle('border-amber-500', isMatch);
    }
  });

  // Highlight active border preset card
  const curBorder = s.borderPreset || s.borderStyle || 'double_gold_navy';
  Object.keys(APPREC_BORDER_PRESETS).forEach(k => {
    const btn = document.getElementById(`btnApprecBorderPreset-${k}`);
    if (btn) {
      const isMatch = (curBorder === k);
      btn.classList.toggle('ring-2', isMatch);
      btn.classList.toggle('ring-amber-500', isMatch);
      btn.classList.toggle('border-amber-500', isMatch);
      btn.classList.toggle('bg-amber-50/60', isMatch);
    }
  });

  // Highlight signature mode buttons
  [1, 2, 3].forEach(m => {
    const btn = document.getElementById(`stageBtnApprecSig${m}`);
    if (btn) {
      if (s.sigMode === m) {
        btn.className = 'px-2 py-0.5 rounded-md border bg-amber-600 text-white font-bold transition';
      } else {
        btn.className = 'px-2 py-0.5 rounded-md border bg-white text-slate-700 font-bold hover:bg-slate-100 transition';
      }
    }
  });

  syncApprecTypographyUi();
  updateApprecUndoRedoButtons();
}

// --- RENDER LIVE APPRECIATION PREVIEW CANVAS ---
function renderAppreciationPreview() {
  const stage = document.getElementById('appreciationPreviewStage');
  if (!stage) return;

  const s = appreciationState;
  const act = typeof activitiesList !== 'undefined' ? activitiesList.find(a => a.id === s.activityId) : null;
  const actTitle = act ? act.title : 'Men in the Kitchen 2: Love Served in the Kitchen';
  const actDate = act ? act.date : 'October 20, 2026';
  const actVenue = act ? (act.venue || 'CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City') : 'Baguio City, Philippines';

  // Dynamic tags replacement
  let renderedCitation = s.citationText
    .replace(/{activity}/g, `“${actTitle}”`)
    .replace(/{date}/g, actDate)
    .replace(/{venue}/g, actVenue)
    .replace(/{name}/g, `${s.honorific ? s.honorific + ' ' : ''}${s.recipientName}`)
    .replace(/{position}/g, s.recipientPosition)
    .replace(/{office}/g, s.recipientOffice);

  // Border & Accent Color Palette from APPREC_BORDER_PRESETS
  const presetKey = s.borderPreset || s.borderStyle || 'double_gold_navy';
  const preset = APPREC_BORDER_PRESETS[presetKey] || APPREC_BORDER_PRESETS.double_gold_navy;
  let outerBorderCss = preset.outerBorder;
  let innerBorderCss = preset.innerBorder;
  let titleColor = preset.titleColor;
  let canvasBg = preset.bg || '#fffdfa';

  // Corner Ornaments SVG
  const cornerFlourish = s.cornerStyle === 'baroque' ? `
    <svg class="w-14 h-14 text-amber-600/80 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
      <path d="M0,0 L40,0 C35,15 25,25 0,35 Z M0,0 L0,40 C15,35 25,25 35,0 Z M12,12 C18,18 24,14 26,8 C22,6 16,6 12,12 Z M2,50 C12,45 22,35 28,20 C18,22 8,30 2,50 Z"/>
    </svg>
  ` : (s.cornerStyle === 'geometric' ? `
    <div class="w-8 h-8 border-t-2 border-l-2 border-amber-500 m-2"></div>
  ` : '');

  // Gold Ribbon Medallion Seal
  const goldMedallion = s.goldSealEnabled ? `
    <div class="absolute z-10 flex flex-col items-center select-none drop-shadow-md ${
      s.goldSealPosition === 'bottom-left' ? 'bottom-8 left-12' : 
      (s.goldSealPosition === 'bottom-center' ? 'bottom-8 left-1/2 -translate-x-1/2' : 'bottom-8 right-12')
    }" ${getApprecDragAttrs('goldSeal')} style="${getApprecOffsetStyle('goldSeal')}">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center border-2 border-amber-200">
        <div class="w-full h-full rounded-full border border-dashed border-amber-100 flex flex-col items-center justify-center text-center p-1 bg-gradient-to-br from-amber-400 to-amber-600">
          <i class="fa-solid fa-star text-white text-[10px] mb-0.5"></i>
          <span class="text-[7.5px] font-black uppercase text-amber-950 tracking-tighter leading-tight font-cinzel">OFFICIAL<br>SEAL</span>
          <span class="text-[6px] font-bold text-white tracking-widest mt-0.5">MOVE</span>
        </div>
      </div>
      <!-- Ribbon Tails -->
      <div class="flex -mt-2 gap-1">
        <div class="w-3.5 h-6 bg-gradient-to-b from-amber-600 to-amber-800 clip-ribbon-left shadow-xs"></div>
        <div class="w-3.5 h-6 bg-gradient-to-b from-amber-600 to-amber-800 clip-ribbon-right shadow-xs"></div>
      </div>
    </div>
  ` : '';

  // Watermark (Dynamic Preset/Upload, Layering & Sizing)
  let watermarkHtml = '';
  if (s.watermarkEnabled) {
    const watermarkImgSrc = s.customWatermarkDataUrl || s.watermarkImage || 'MOVE%20BAGUIO%20LOGO.png';
    const wmSize = s.watermarkSize || 320;
    const wmOpacity = (s.watermarkOpacity !== undefined ? s.watermarkOpacity : 12) / 100;
    const layerClass = s.watermarkLayer === 'infront' ? 'wm-layer-infront' :
                      (s.watermarkLayer === 'washout' ? 'wm-layer-washout' :
                      (s.watermarkLayer === 'bottom-behind' ? 'wm-layer-bottom-behind' : 'wm-layer-behind'));

    watermarkHtml = `
      <div class="cert-watermark-overlay ${layerClass} select-none">
        <div class="cert-watermark-box" ${getApprecDragAttrs('watermark')} style="width: ${wmSize}px; height: ${wmSize}px; opacity: ${wmOpacity}; ${getApprecOffsetStyle('watermark')}">
          <img src="${watermarkImgSrc}" alt="Watermark" class="w-full h-full object-contain pointer-events-none select-none">
        </div>
      </div>
    `;
  }

  // Build Signatures Block
  let signaturesBlock = '';
  const renderSingleSigBlock = (sig, slotNum) => {
    if (!sig || !sig.enabled) return '';
    return `
      <div class="flex flex-col items-center text-center px-4 min-w-[200px] relative z-10">
        <div class="h-16 flex items-end justify-center mb-1 relative w-full">
          ${sig.signatureImage ? `
            <img src="${sig.signatureImage}" alt="Signature"
                 style="width: ${sig.imageWidth || 150}px; height: ${sig.imageHeight || 56}px;"
                 class="object-contain pointer-events-none drop-shadow-xs">
          ` : `
            <div class="text-[10px] text-slate-300 italic mb-2 select-none">[Official Signature Space]</div>
          `}
        </div>
        <div class="w-52 border-b-2 border-slate-900 mb-1"></div>
        <h5 class="tracking-wider uppercase inline-edit-apprec text-move-navy-950"
            style="${getApprecInlineTextStyle('sig' + slotNum + '_name', 12, 'center', true, false)}"
            data-slot="${slotNum}" data-field="name" contenteditable="true" spellcheck="false" title="Click to edit signatory name or adjust font size">${sig.name || 'SIGNATORY NAME'}</h5>
        <p class="leading-tight inline-edit-apprec text-slate-700"
           style="${getApprecInlineTextStyle('sig' + slotNum + '_title', 10.5, 'center', true, false)}"
           data-slot="${slotNum}" data-field="title" contenteditable="true" spellcheck="false" title="Click to edit position or adjust font size">${sig.title || 'Official Designation'}</p>
        ${sig.office ? `<p class="leading-tight inline-edit-apprec text-slate-500" style="${getApprecInlineTextStyle('sig' + slotNum + '_office', 9.5, 'center', false, false)}" data-slot="${slotNum}" data-field="office" contenteditable="true" spellcheck="false" title="Click to edit agency/office">${sig.office}</p>` : ''}
      </div>
    `;
  };

  if (s.sigMode === 1) {
    signaturesBlock = `
      <div class="flex justify-center w-full pt-4">
        ${renderSingleSigBlock(s.sig1, 1)}
      </div>
    `;
  } else if (s.sigMode === 2) {
    signaturesBlock = `
      <div class="flex items-end justify-between w-full px-6 pt-4">
        ${renderSingleSigBlock(s.sig1, 1)}
        ${renderSingleSigBlock(s.sig2, 2)}
      </div>
    `;
  } else {
    signaturesBlock = `
      <div class="flex items-end justify-between w-full px-2 pt-4">
        ${renderSingleSigBlock(s.sig1, 1)}
        ${renderSingleSigBlock(s.sig3, 3)}
        ${renderSingleSigBlock(s.sig2, 2)}
      </div>
    `;
  }

  // Full A4 Landscape Frame HTML
  const sheetHtml = `
    <div id="appreciationSheetCanvas"
         class="appreciation-landscape-sheet shadow-2xl relative select-text transition-all overflow-hidden ${s.isDesignerMode ? 'cert-edit-active apprec-edit-active' : ''}"
         style="width: 297mm; height: 210mm; min-height: 210mm; max-height: 210mm; box-sizing: border-box; background-color: ${canvasBg}; ${outerBorderCss}; font-family: ${s.fontFamily === 'cinzel' ? "'Cinzel', serif" : (s.fontFamily === 'playfair' ? "'Playfair Display', serif" : "'Montserrat', sans-serif")}; padding: 10mm 14mm;">

      <!-- Inner Decorative Border -->
      <div class="w-full h-full relative flex flex-col justify-between" style="${innerBorderCss}; padding: 8mm 10mm; box-sizing: border-box;">
        
        <!-- Corner Ornaments -->
        ${s.cornerStyle !== 'none' ? `
          <div class="absolute top-1 left-1">${cornerFlourish}</div>
          <div class="absolute top-1 right-1 -scale-x-100">${cornerFlourish}</div>
          <div class="absolute bottom-1 left-1 -scale-y-100">${cornerFlourish}</div>
          <div class="absolute bottom-1 right-1 -scale-x-100 -scale-y-100">${cornerFlourish}</div>
        ` : ''}

        <!-- Watermark -->
        ${watermarkHtml}

        <!-- Gold Ribbon Medallion -->
        ${goldMedallion}

        <!-- Inserted Custom Photos / Badges -->
        ${(() => {
          let html = '';
          if (s.insertedPhotos && s.insertedPhotos.length > 0) {
            s.insertedPhotos.forEach(p => {
              const isSelected = (s.activeMoveElementKey === p.id);
              const shapeClass = p.shape === 'circle' ? 'shape-circle' :
                                (p.shape === 'rounded' ? 'shape-rounded' :
                                (p.shape === 'square' ? 'shape-square' : 'shape-gold_frame'));
              const removeBtn = s.isDesignerMode ? `
                <button type="button" onclick="event.stopPropagation(); removeApprecPhoto('${p.id}')"
                        title="Delete ${p.name}"
                        class="cert-remove-badge absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black flex items-center justify-center shadow-md z-50 cursor-pointer leading-none">&times;</button>
              ` : '';
              html += `
                <div class="apprec-inserted-photo apprec-removable-item ${shapeClass} ${isSelected ? 'is-selected-element' : ''}"
                     data-apprec-element="${p.id}"
                     style="width: ${p.width || 100}px; height: ${p.height || 100}px; left: calc(50% - ${(p.width || 100) / 2}px); top: calc(50% - ${(p.height || 100) / 2}px); transform: translate(${p.x || 0}px, ${p.y || 0}px);"
                     title="${p.name} (Drag to reposition)">
                  ${removeBtn}
                  <img src="${p.src}" alt="${p.name}">
                </div>
              `;
            });
          }
          return html;
        })()}

        <!-- 1. HEADER SECTION (Official Seal & Header) -->
        <div class="relative z-10 flex items-center justify-between px-4 pb-2 border-b border-amber-200/50">
          <div class="w-16 h-16 flex items-center justify-center shrink-0" ${getApprecDragAttrs('leftLogo')} style="${getApprecOffsetStyle('leftLogo')}">
            <img src="CITY%20HALL%20LOGO.png" alt="City Government of Baguio" class="w-16 h-16 object-contain drop-shadow-xs pointer-events-none">
          </div>
          <div class="text-center space-y-0.5 flex-1 px-4" ${getApprecDragAttrs('headerText')} style="${getApprecOffsetStyle('headerText')}">
            <p class="tracking-wider uppercase inline-edit-apprec text-slate-600 drop-shadow-xs"
               data-apprec-field="headerRepublic" contenteditable="true" spellcheck="false" title="Click to edit or adjust font size for Republic header"
               style="${getApprecInlineTextStyle('headerRepublic', s.headerRepublicFontSize || 11, 'center', true, false)}">${s.headerRepublic || 'Republic of the Philippines'}</p>
            <h4 class="tracking-wider uppercase inline-edit-apprec text-move-navy-950 drop-shadow-xs"
               data-apprec-field="headerCity" contenteditable="true" spellcheck="false" title="Click to edit or adjust font size for City Government header"
               style="${getApprecInlineTextStyle('headerCity', s.headerCityFontSize || 13, 'center', true, false)}">${s.headerCity || 'City Government of Baguio'}</h4>
            <h3 class="tracking-wide uppercase inline-edit-apprec text-amber-800 drop-shadow-xs"
               data-apprec-field="headerChapter" contenteditable="true" spellcheck="false" title="Click to edit or adjust font size for Chapter title"
               style="${getApprecInlineTextStyle('headerChapter', s.headerChapterFontSize || 14, 'center', true, false)}">${s.headerChapter || 'Men Opposed to Violence Against Women Everywhere (MOVE)'}</h3>
            <p class="tracking-tight inline-edit-apprec text-slate-500 drop-shadow-xs"
               data-apprec-field="headerSub" contenteditable="true" spellcheck="false" title="Click to edit or adjust font size for Chapter subline"
               style="${getApprecInlineTextStyle('headerSub', s.headerSubFontSize || 10, 'center', false, false)}">${s.headerSub || 'City Hall Chapter • Baguio City, Philippines'}</p>
          </div>
          <div class="w-16 h-16 flex items-center justify-center shrink-0" ${getApprecDragAttrs('rightLogo')} style="${getApprecOffsetStyle('rightLogo')}">
            <img src="MOVE%20BAGUIO%20LOGO.png" alt="MOVE Baguio Chapter" class="w-16 h-16 object-contain drop-shadow-xs pointer-events-none">
          </div>
        </div>

        <!-- 2. TITLE & RECIPIENT HERO SECTION -->
        <div class="relative z-10 text-center space-y-2.5 pt-2 flex-1 flex flex-col justify-center">
          <!-- Award Title -->
          <div class="space-y-1" ${getApprecDragAttrs('awardTitle')} style="${getApprecOffsetStyle('awardTitle')}">
            <h1 class="tracking-wider uppercase inline-edit-apprec drop-shadow-xs"
                style="color: ${titleColor}; ${getApprecInlineTextStyle('awardTitle', s.awardTitleFontSize || 30, 'center', true, false)}"
                data-apprec-field="awardTitle" contenteditable="true" spellcheck="false" title="Click to edit award title">${s.awardTitle}</h1>
            <div class="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <!-- Presentation Subtitle -->
          <p class="inline-edit-apprec"
             ${getApprecDragAttrs('subtitle')} style="${getApprecOffsetStyle('subtitle')} ${getApprecInlineTextStyle('subtitle', s.subtitleFontSize || 13, 'center', false, true)}"
             data-apprec-field="subtitle" contenteditable="true" spellcheck="false" title="Click to edit subtitle">${s.subtitle}</p>

          <!-- Recipient Name Block -->
          <div class="space-y-0.5 py-0.5" ${getApprecDragAttrs('recipient')} style="${getApprecOffsetStyle('recipient')} ${getApprecInlineTextStyle('recipient', s.recipientFontSize || 28, s.recipientAlign || 'center', true, false)}">
            <h2 class="tracking-widest text-move-navy-950 uppercase inline-edit-apprec"
                data-apprec-field="recipientName" contenteditable="true" spellcheck="false" title="Click to edit recipient name">
              ${s.honorific ? `<span class="text-lg font-bold text-amber-700 mr-1.5">${s.honorific}</span>` : ''}${s.recipientName}
            </h2>
            <div class="w-80 h-0.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 mx-auto"></div>
            ${(s.recipientPosition || s.recipientOffice) ? `
              <p class="inline-edit-apprec text-slate-700"
                 style="${getApprecInlineTextStyle('recipientPosition', s.recipientPositionFontSize || 12, s.recipientAlign || 'center', true, false)}"
                 data-apprec-field="recipientPosition" contenteditable="true" spellcheck="false" title="Click to edit position & office">
                ${s.recipientPosition}${s.recipientOffice ? ' • ' + s.recipientOffice : ''}
              </p>
            ` : ''}
          </div>

          <!-- Citation Paragraph -->
          <div class="max-w-3xl mx-auto px-6 py-1" ${getApprecDragAttrs('citation')} style="${getApprecOffsetStyle('citation')}">
            <p class="leading-relaxed text-slate-700 inline-edit-apprec"
               style="${getApprecInlineTextStyle('citation', s.citationFontSize || 12, s.citationAlign || 'center', false, false)}"
               data-apprec-field="citationText" contenteditable="true" spellcheck="false" title="Click to edit citation paragraph">
              ${renderedCitation}
            </p>
          </div>

          <!-- Conferred Date Line -->
          <p class="inline-edit-apprec"
             ${getApprecDragAttrs('dateVenueLine')} style="${getApprecOffsetStyle('dateVenueLine')} ${getApprecInlineTextStyle('dateVenueLine', s.dateFontSize || 11, s.dateAlign || 'center', false, true)}"
             data-apprec-field="dateVenueLine" contenteditable="true" spellcheck="false" title="Click to edit date line">${s.dateVenueLine}</p>
        </div>

        <!-- 3. EXECUTIVE SIGNATURES SECTION -->
        <div class="relative z-10 pt-2 border-t border-amber-200/40" ${getApprecDragAttrs('signatories')} style="${getApprecOffsetStyle('signatories')}">
          ${signaturesBlock}
        </div>

      </div>
    </div>
  `;

  stage.innerHTML = sheetHtml;
  bindAppreciationInlineEditing();
  bindAppreciationDragListeners();
  updateApprecMoveUi();
  requestAnimationFrame(() => updateApprecAutoFit());
}

// --- DIRECT INLINE EDITING BINDINGS ---
function bindAppreciationInlineEditing() {
  const stage = document.getElementById('appreciationPreviewStage');
  if (!stage) return;

  // Global field inline edits & automatic Ribbon targeting on focus/click
  stage.querySelectorAll('.inline-edit-apprec').forEach(el => {
    // When clicked or focused, immediately select as active move element to sync Word Ribbon
    el.addEventListener('focus', function() {
      const field = this.getAttribute('data-apprec-field');
      const slotNum = this.getAttribute('data-slot');
      const sigField = this.getAttribute('data-field');
      const targetKey = field || (slotNum ? `sig${slotNum}_${sigField}` : null);
      if (targetKey) {
        appreciationState.activeMoveElementKey = targetKey;
        updateApprecMoveUi();
        syncApprecTypographyUi();
      }
    });

    el.addEventListener('click', function(e) {
      if (!appreciationState.isDesignerMode) return;
      const field = this.getAttribute('data-apprec-field');
      const slotNum = this.getAttribute('data-slot');
      const sigField = this.getAttribute('data-field');
      const targetKey = field || (slotNum ? `sig${slotNum}_${sigField}` : null);
      if (targetKey) {
        appreciationState.activeMoveElementKey = targetKey;
        updateApprecMoveUi();
        syncApprecTypographyUi();
      }
    });
  });

  // Global field inline blur saves
  stage.querySelectorAll('[data-apprec-field]').forEach(el => {
    el.addEventListener('blur', function() {
      const field = this.getAttribute('data-apprec-field');
      const text = this.innerText.trim();
      if (field === 'recipientName') {
        appreciationState.recipientName = text;
        const input = document.getElementById('appreciationRecipientName');
        if (input) input.value = text;
      } else if (field === 'awardTitle') {
        appreciationState.awardTitle = text;
        const input = document.getElementById('appreciationAwardTitle');
        if (input) input.value = text;
      } else if (field === 'subtitle') {
        appreciationState.subtitle = text;
        const input = document.getElementById('appreciationSubtitle');
        if (input) input.value = text;
      } else if (field === 'dateVenueLine') {
        appreciationState.dateVenueLine = text;
        const input = document.getElementById('appreciationDateVenueLine');
        if (input) input.value = text;
      } else if (field === 'citationText') {
        appreciationState.citationText = text;
        const input = document.getElementById('appreciationCitationText');
        if (input) input.value = text;
      } else if (field === 'headerRepublic') {
        appreciationState.headerRepublic = text;
      } else if (field === 'headerCity') {
        appreciationState.headerCity = text;
      } else if (field === 'headerChapter') {
        appreciationState.headerChapter = text;
      } else if (field === 'headerSub') {
        appreciationState.headerSub = text;
      } else if (field === 'recipientPosition') {
        if (text.includes('•')) {
          const parts = text.split('•');
          appreciationState.recipientPosition = parts[0].trim();
          appreciationState.recipientOffice = parts[1].trim();
        } else {
          appreciationState.recipientPosition = text;
        }
        const pInp = document.getElementById('appreciationRecipientPosition');
        const oInp = document.getElementById('appreciationRecipientOffice');
        if (pInp) pInp.value = appreciationState.recipientPosition;
        if (oInp) oInp.value = appreciationState.recipientOffice;
      }
    });
  });

  // Signatory inline edits
  stage.querySelectorAll('[data-slot]').forEach(el => {
    el.addEventListener('blur', function() {
      const slotNum = this.getAttribute('data-slot');
      const field = this.getAttribute('data-field');
      const text = this.innerText.trim();
      const sig = appreciationState[`sig${slotNum}`];
      if (sig && field) {
        sig[field] = text;
        const input = document.getElementById(`apprecInputSig${slotNum}${field.charAt(0).toUpperCase() + field.slice(1)}`);
        if (input) input.value = text;
      }
    });
  });
}

// --- PRINTING ENGINE (DYNAMIC PAPER SIZE SELECTION) ---
function printAppreciationCertificate() {
  const printBox = document.getElementById('appreciationPrintContainer');
  if (!printBox) return;

  const canvas = document.getElementById('appreciationSheetCanvas');
  if (!canvas) return;

  const clone = canvas.cloneNode(true);
  clone.classList.remove('cert-edit-active', 'apprec-edit-active');
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  clone.querySelectorAll('.is-selected-element').forEach(el => el.classList.remove('is-selected-element'));

  const size = appreciationState.paperSize || 'a4';
  const paperSpecs = {
    a4: { rule: 'A4 landscape', width: '297mm', height: '210mm' },
    letter: { rule: 'letter landscape', width: '11in', height: '8.5in' },
    legal: { rule: 'legal landscape', width: '14in', height: '8.5in' },
    a3: { rule: 'A3 landscape', width: '420mm', height: '297mm' },
    a5: { rule: 'A5 landscape', width: '210mm', height: '148mm' }
  };
  const spec = paperSpecs[size] || paperSpecs.a4;

  clone.style.width = spec.width;
  clone.style.height = spec.height;
  clone.style.maxWidth = spec.width;
  clone.style.maxHeight = spec.height;

  printBox.innerHTML = `
    <div class="appreciation-print-page" style="width: ${spec.width}; height: ${spec.height};">
      ${clone.outerHTML}
    </div>
  `;

  if (typeof setPrintPageRule === 'function') setPrintPageRule(spec.rule);
  document.body.classList.add('printing-appreciation');
  showToast(`Preparing print for ${appreciationState.recipientName || 'Award'} (${spec.rule})...`, 'fa-print');

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-appreciation');
      printBox.innerHTML = '';
    }, 1000);
  }, 250);
}

// --- WORD (.DOCX) EXPORT ---
async function exportAppreciationDocx() {
  const s = appreciationState;
  const act = typeof activitiesList !== 'undefined' ? activitiesList.find(a => a.id === s.activityId) : null;
  const actTitle = act ? act.title : 'Men in the Kitchen 2';
  const actDate = act ? act.date : 'October 20, 2026';
  const actVenue = act ? (act.venue || 'Baguio City') : 'Baguio City';

  const payload = {
    awardTitle: s.awardTitle,
    subtitle: s.subtitle,
    honorific: s.honorific,
    recipientName: s.recipientName,
    recipientPosition: s.recipientPosition,
    recipientOffice: s.recipientOffice,
    citationText: s.citationText
      .replace(/{activity}/g, `“${actTitle}”`)
      .replace(/{date}/g, actDate)
      .replace(/{venue}/g, actVenue)
      .replace(/{name}/g, `${s.honorific ? s.honorific + ' ' : ''}${s.recipientName}`),
    dateVenueLine: s.dateVenueLine,
    sigMode: s.sigMode,
    sig1: s.sig1,
    sig2: s.sig2,
    sig3: s.sig3
  };

  showToast('Generating official Word (.docx) document...', 'fa-file-word');

  try {
    const res = await fetch('http://127.0.0.1:8765/api/export-appreciation-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const blob = await res.blob();
      const filename = `Certificate_of_Appreciation_${(s.recipientName || 'Recipient').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
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
    console.warn('Sync server docx generation not reached, falling back to client-side Word document:', err);
  }

  // Pure Client-side High-Fidelity Word (.docx / XML WordML) Fallback
  generateClientSideAppreciationDocx(payload);
}

function generateClientSideAppreciationDocx(data) {
  const safeName = (data.recipientName || 'Recipient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Certificate_of_Appreciation_${safeName}.doc`;

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${data.awardTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 29.7cm 21.0cm landscape;
          margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          mso-page-orientation: landscape;
        }
        body {
          font-family: 'Cinzel', 'Times New Roman', serif;
          margin: 0;
          padding: 0;
          color: #091b38;
          text-align: center;
          background: #ffffff;
        }
        .outer-frame {
          border: 6pt double #d97706;
          padding: 16pt;
        }
        .inner-frame {
          border: 1.5pt solid #091b38;
          padding: 24pt 32pt;
        }
        .header-title {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          color: #334155;
          margin-bottom: 2pt;
        }
        .header-sub {
          font-size: 13pt;
          font-weight: bold;
          color: #091b38;
          margin-bottom: 2pt;
        }
        .header-chapter {
          font-size: 14pt;
          font-weight: bold;
          color: #b45309;
          margin-bottom: 16pt;
        }
        .award-title {
          font-size: 26pt;
          font-weight: bold;
          letter-spacing: 2pt;
          color: #091b38;
          margin: 14pt 0 6pt 0;
        }
        .award-subtitle {
          font-size: 11pt;
          font-style: italic;
          color: #475569;
          margin-bottom: 12pt;
        }
        .recipient-name {
          font-size: 24pt;
          font-weight: bold;
          letter-spacing: 1.5pt;
          color: #091b38;
          text-transform: uppercase;
          border-bottom: 2pt solid #d97706;
          display: inline-block;
          padding-bottom: 4pt;
          margin-bottom: 4pt;
        }
        .recipient-title {
          font-size: 11pt;
          font-weight: bold;
          color: #64748b;
          margin-bottom: 16pt;
        }
        .citation-body {
          font-size: 12pt;
          line-height: 1.6;
          color: #334155;
          margin: 16pt auto;
          max-width: 650pt;
          font-family: Arial, sans-serif;
        }
        .date-line {
          font-size: 10.5pt;
          font-style: italic;
          color: #64748b;
          margin: 14pt 0 24pt 0;
        }
        table.sig-table {
          width: 100%;
          margin-top: 24pt;
          border-collapse: collapse;
        }
        td.sig-col {
          text-align: center;
          vertical-align: bottom;
          padding: 0 16pt;
        }
        .sig-line {
          border-bottom: 1.5pt solid #091b38;
          width: 200pt;
          margin: 0 auto 4pt auto;
        }
        .sig-name {
          font-size: 11pt;
          font-weight: bold;
          color: #091b38;
        }
        .sig-title {
          font-size: 9.5pt;
          color: #475569;
        }
      </style>
    </head>
    <body>
      <div class="outer-frame">
        <div class="inner-frame">
          <div class="header-title">Republic of the Philippines</div>
          <div class="header-sub">City Government of Baguio</div>
          <div class="header-chapter">Men Opposed to Violence Against Women Everywhere (MOVE)</div>

          <div class="award-title">${data.awardTitle}</div>
          <div class="award-subtitle">${data.subtitle}</div>

          <div class="recipient-name">${data.honorific ? data.honorific + ' ' : ''}${data.recipientName}</div>
          ${(data.recipientPosition || data.recipientOffice) ? `
            <div class="recipient-title">${data.recipientPosition}${data.recipientOffice ? ' • ' + data.recipientOffice : ''}</div>
          ` : ''}

          <div class="citation-body">${data.citationText}</div>
          <div class="date-line">${data.dateVenueLine}</div>

          <table class="sig-table">
            <tr>
              ${data.sigMode === 1 ? `
                <td class="sig-col">
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.sig1.name || ''}</div>
                  <div class="sig-title">${data.sig1.title || ''}</div>
                </td>
              ` : (data.sigMode === 2 ? `
                <td class="sig-col" style="width: 50%;">
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.sig1.name || ''}</div>
                  <div class="sig-title">${data.sig1.title || ''}</div>
                </td>
                <td class="sig-col" style="width: 50%;">
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.sig2.name || ''}</div>
                  <div class="sig-title">${data.sig2.title || ''}</div>
                </td>
              ` : `
                <td class="sig-col" style="width: 33%;">
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.sig1.name || ''}</div>
                  <div class="sig-title">${data.sig1.title || ''}</div>
                </td>
                <td class="sig-col" style="width: 33%;">
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.sig3.name || ''}</div>
                  <div class="sig-title">${data.sig3.title || ''}</div>
                </td>
                <td class="sig-col" style="width: 33%;">
                  <div class="sig-line"></div>
                  <div class="sig-name">${data.sig2.name || ''}</div>
                  <div class="sig-title">${data.sig2.title || ''}</div>
                </td>
              `)}
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Word document exported successfully!', 'fa-check');
}

// --- INITIALIZATION ---
function initAppreciationStudio() {
  populateAppreciationActivityDropdown();
  populateAppreciationVersionsDropdown();
  populateAppreciationSigDropdowns();
  syncAppreciationInputsFromState();
  renderAppreciationPreview();
  if (apprecHistory.length === 0) pushApprecHistoryState();

  if (!window._apprecResizeAttached) {
    window.addEventListener('resize', () => {
      const p = document.getElementById('pageAppreciation');
      if (p && !p.classList.contains('hidden')) updateApprecAutoFit();
    });
    window._apprecResizeAttached = true;
  }
  requestAnimationFrame(() => updateApprecAutoFit());
}

// Global Keyboard listener for Appreciation Studio Undo (Ctrl+Z) and Redo (Ctrl+Y or Ctrl+Shift+Z)
window.addEventListener('keydown', (e) => {
  const page = document.getElementById('pageAppreciation');
  if (!page || page.classList.contains('hidden')) return;
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redoApprecState();
    } else {
      undoApprecState();
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    e.preventDefault();
    redoApprecState();
  }
});

// Global exports
window.initAppreciationStudio = initAppreciationStudio;
window.renderAppreciationPreview = renderAppreciationPreview;
window.populateAppreciationSigDropdowns = populateAppreciationSigDropdowns;
window.loadAppreciationPreset = loadAppreciationPreset;
window.saveCurrentAppreciationVersion = saveCurrentAppreciationVersion;
window.deleteCurrentAppreciationVersion = deleteCurrentAppreciationVersion;
window.handleAppreciationVersionChange = handleAppreciationVersionChange;
window.handleAppreciationActivityChange = handleAppreciationActivityChange;
window.handleApprecPickSignatory = handleApprecPickSignatory;
window.saveApprecInputsToSignatoriesDb = saveApprecInputsToSignatoriesDb;
window.setAppreciationSigMode = setAppreciationSigMode;
window.setApprecSignatureCountMode = setApprecSignatureCountMode;
window.handleApprecSigUpdate = handleApprecSigUpdate;
window.handleApprecSigImageUpload = handleApprecSigImageUpload;
window.useOfficialApprecSig = useOfficialApprecSig;
window.removeApprecSigImage = removeApprecSigImage;
window.handleAppreciationFieldChange = handleAppreciationFieldChange;
window.handleAppreciationStyleChange = handleAppreciationStyleChange;
window.formatAppreciationRecipientUppercase = formatAppreciationRecipientUppercase;
window.insertAppreciationTag = insertAppreciationTag;
window.setAppreciationZoom = setAppreciationZoom;
window.setApprecZoomMode = setApprecZoomMode;
window.updateApprecAutoFit = updateApprecAutoFit;
window.switchApprecControlTab = switchApprecControlTab;
window.printAppreciationCertificate = printAppreciationCertificate;
window.exportAppreciationDocx = exportAppreciationDocx;
window.resetAppreciationToDefault = resetAppreciationToDefault;
window.toggleApprecEditMode = toggleApprecEditMode;
window.undoApprecState = undoApprecState;
window.redoApprecState = redoApprecState;
window.setApprecWatermarkPreset = setApprecWatermarkPreset;
window.setApprecWatermarkLayer = setApprecWatermarkLayer;
window.handleApprecWatermarkUpload = handleApprecWatermarkUpload;
window.resetApprecWatermark = resetApprecWatermark;
window.setApprecBorderPreset = setApprecBorderPreset;
window.setApprecFontSize = setApprecFontSize;
window.changeApprecFontSize = changeApprecFontSize;
window.setApprecTextAlign = setApprecTextAlign;
window.syncApprecTypographyUi = syncApprecTypographyUi;
window.nudgeApprecElement = nudgeApprecElement;
window.syncApprecOffsetFromInputs = syncApprecOffsetFromInputs;
window.resetApprecElementPosition = resetApprecElementPosition;
window.resetAllApprecPositions = resetAllApprecPositions;
window.handleApprecNudgeTargetChange = handleApprecNudgeTargetChange;
window.updateApprecMoveUi = updateApprecMoveUi;
window.handleApprecPaperSizeChange = handleApprecPaperSizeChange;
window.setApprecActiveFontSize = setApprecActiveFontSize;
window.changeApprecActiveFontSize = changeApprecActiveFontSize;
window.setApprecActiveFontFamily = setApprecActiveFontFamily;
window.toggleApprecActiveStyle = toggleApprecActiveStyle;
window.setApprecActiveTextAlign = setApprecActiveTextAlign;
window.alignApprecObject = alignApprecObject;
window.openApprecPhotoUpload = openApprecPhotoUpload;
window.handleApprecPhotoUpload = handleApprecPhotoUpload;
window.removeApprecPhoto = removeApprecPhoto;
window.removeApprecActivePhoto = removeApprecActivePhoto;
window.setApprecPhotoShape = setApprecPhotoShape;
window.setApprecPhotoSize = setApprecPhotoSize;
