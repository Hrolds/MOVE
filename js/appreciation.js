// ==========================================================================
// MOVE BAGUIO CHAPTER — CERTIFICATE OF APPRECIATION STUDIO
// Prestigious Honors Engine for Resource Speakers, Facilitators & Partners
// ==========================================================================

const APPREC_VERSIONS_KEY = 'move_appreciation_versions_v1';
const APPREC_AUTOSAVE_KEY = 'move_appreciation_autosave_v1';

const appreciationState = {
  activityId: 'ACT-KITCHEN-2',
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
    name: 'DAN RICKY M. ONG',
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
  borderStyle: 'double_gold_navy', // double_gold_navy | ornate_gold | royal_blue_gold | minimal_navy
  cornerStyle: 'baroque',           // baroque | geometric | none
  fontFamily: 'cinzel',             // cinzel | playfair | montserrat
  goldSealEnabled: true,
  goldSealPosition: 'bottom-left',   // bottom-left | bottom-center | bottom-right
  watermarkEnabled: true,
  watermarkOpacity: 12,
  zoom: 100,
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
    appreciationState.sig1.name = 'DAN RICKY M. ONG';
    appreciationState.sig1.title = 'MOVE Chapter President';
    appreciationState.sig2.name = 'HON. BENJAMIN B. MAGALONG';
    appreciationState.sig2.title = 'City Mayor';
  } else if (presetKey === 'speaker') {
    appreciationState.sigMode = 2;
    appreciationState.sig1.name = 'DAN RICKY M. ONG';
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

// --- FIELD & STYLE UPDATES ---
function handleAppreciationFieldChange(field, val) {
  appreciationState[field] = val;
  renderAppreciationPreview();
}

function handleAppreciationStyleChange(field, val) {
  appreciationState[field] = val;
  renderAppreciationPreview();
}

function formatAppreciationRecipientUppercase() {
  const input = document.getElementById('appreciationRecipientName');
  if (input) {
    input.value = input.value.toUpperCase();
    appreciationState.recipientName = input.value;
    renderAppreciationPreview();
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
}

function setAppreciationZoom(pct) {
  appreciationState.zoom = pct;
  const stage = document.getElementById('appreciationPreviewStage');
  if (stage) stage.style.transform = `scale(${pct / 100})`;
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
  if (bSel) bSel.value = s.borderStyle;

  const cSel = document.getElementById('apprecCornerStyle');
  if (cSel) cSel.value = s.cornerStyle;

  const fSel = document.getElementById('apprecFontFamily');
  if (fSel) fSel.value = s.fontFamily;

  const gsChk = document.getElementById('apprecGoldSealEnabled');
  if (gsChk) gsChk.checked = !!s.goldSealEnabled;

  const gsPos = document.getElementById('apprecGoldSealPosition');
  if (gsPos) gsPos.value = s.goldSealPosition;

  const wmChk = document.getElementById('apprecWatermarkEnabled');
  if (wmChk) wmChk.checked = !!s.watermarkEnabled;

  const wmOp = document.getElementById('apprecWatermarkOpacity');
  if (wmOp) wmOp.value = s.watermarkOpacity;
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

  // Border & Accent Color Palette
  let outerBorderCss = 'border: 8px double #d97706;'; // Prestigious Gold & Navy
  let innerBorderCss = 'border: 2px solid #091b38;';
  let titleColor = '#091b38';
  let accentColor = '#b45309';

  if (s.borderStyle === 'ornate_gold') {
    outerBorderCss = 'border: 10px double #b45309;';
    innerBorderCss = 'border: 2px dashed #d97706;';
    titleColor = '#78350f';
    accentColor = '#d97706';
  } else if (s.borderStyle === 'royal_blue_gold') {
    outerBorderCss = 'border: 9px solid #1e3a8a;';
    innerBorderCss = 'border: 3px double #f59e0b;';
    titleColor = '#1e3a8a';
    accentColor = '#d97706';
  } else if (s.borderStyle === 'minimal_navy') {
    outerBorderCss = 'border: 6px solid #091b38;';
    innerBorderCss = 'border: 1px solid #cbd5e1;';
    titleColor = '#091b38';
    accentColor = '#0284c7';
  }

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
    <div class="absolute z-10 flex flex-col items-center select-none pointer-events-none drop-shadow-md ${
      s.goldSealPosition === 'bottom-left' ? 'bottom-8 left-12' : 
      (s.goldSealPosition === 'bottom-center' ? 'bottom-8 left-1/2 -translate-x-1/2' : 'bottom-8 right-12')
    }">
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

  // Watermark
  const watermarkHtml = s.watermarkEnabled ? `
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
      <img src="MOVE%20BAGUIO%20LOGO.png" alt="Watermark"
           style="opacity: ${s.watermarkOpacity / 100}; filter: grayscale(20%); width: 340px; transform: scale(1.1);"
           class="max-w-none">
    </div>
  ` : '';

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
        <h5 class="font-cinzel font-black text-xs text-move-navy-950 tracking-wider uppercase inline-edit-apprec"
            data-slot="${slotNum}" data-field="name" contenteditable="true" spellcheck="false" title="Click to edit name directly">${sig.name || 'SIGNATORY NAME'}</h5>
        <p class="text-[10.5px] font-semibold text-slate-700 leading-tight inline-edit-apprec"
           data-slot="${slotNum}" data-field="title" contenteditable="true" spellcheck="false" title="Click to edit position">${sig.title || 'Official Designation'}</p>
        ${sig.office ? `<p class="text-[9.5px] text-slate-500 leading-tight inline-edit-apprec" data-slot="${slotNum}" data-field="office" contenteditable="true" spellcheck="false">${sig.office}</p>` : ''}
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
         class="appreciation-landscape-sheet shadow-2xl relative select-text transition-all bg-[#fffdfa] overflow-hidden"
         style="width: 297mm; height: 210mm; min-height: 210mm; max-height: 210mm; box-sizing: border-box; ${outerBorderCss}; font-family: ${s.fontFamily === 'cinzel' ? "'Cinzel', serif" : (s.fontFamily === 'playfair' ? "'Playfair Display', serif" : "'Montserrat', sans-serif")}; padding: 10mm 14mm;">

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

        <!-- 1. HEADER SECTION (Official Seal & Header) -->
        <div class="relative z-10 flex items-center justify-between px-4 pb-2 border-b border-amber-200/50">
          <div class="w-16 h-16 flex items-center justify-center shrink-0">
            <img src="CITY%20HALL%20LOGO.png" alt="City Government of Baguio" class="w-16 h-16 object-contain drop-shadow-xs">
          </div>
          <div class="text-center space-y-0.5 flex-1 px-4">
            <p class="text-[10.5px] font-semibold text-slate-600 tracking-wider uppercase font-sans">Republic of the Philippines</p>
            <h4 class="text-xs font-black text-move-navy-950 tracking-wider uppercase font-cinzel">City Government of Baguio</h4>
            <h3 class="text-sm font-black text-amber-800 tracking-wide uppercase font-cinzel">Men Opposed to Violence Against Women Everywhere (MOVE)</h3>
            <p class="text-[10px] text-slate-500 font-sans tracking-tight">City Hall Chapter • Baguio City, Philippines</p>
          </div>
          <div class="w-16 h-16 flex items-center justify-center shrink-0">
            <img src="MOVE%20BAGUIO%20LOGO.png" alt="MOVE Baguio Chapter" class="w-16 h-16 object-contain drop-shadow-xs">
          </div>
        </div>

        <!-- 2. TITLE & RECIPIENT HERO SECTION -->
        <div class="relative z-10 text-center space-y-2.5 pt-2 flex-1 flex flex-col justify-center">
          <!-- Award Title -->
          <div class="space-y-1">
            <h1 class="text-3xl font-black font-cinzel tracking-wider uppercase inline-edit-apprec drop-shadow-xs"
                style="color: ${titleColor};"
                data-apprec-field="awardTitle" contenteditable="true" spellcheck="false" title="Click to edit award title">${s.awardTitle}</h1>
            <div class="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          </div>

          <!-- Presentation Subtitle -->
          <p class="text-xs italic text-slate-600 font-sans inline-edit-apprec"
             data-apprec-field="subtitle" contenteditable="true" spellcheck="false" title="Click to edit subtitle">${s.subtitle}</p>

          <!-- Recipient Name Block -->
          <div class="space-y-0.5 py-0.5">
            <h2 class="text-2xl font-black font-cinzel tracking-widest text-move-navy-950 uppercase inline-edit-apprec"
                data-apprec-field="recipientName" contenteditable="true" spellcheck="false" title="Click to edit recipient name">
              ${s.honorific ? `<span class="text-lg font-bold text-amber-700 mr-1.5">${s.honorific}</span>` : ''}${s.recipientName}
            </h2>
            <div class="w-80 h-0.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 mx-auto"></div>
            ${(s.recipientPosition || s.recipientOffice) ? `
              <p class="text-xs font-semibold text-slate-700 inline-edit-apprec"
                 data-apprec-field="recipientPosition" contenteditable="true" spellcheck="false" title="Click to edit position & office">
                ${s.recipientPosition}${s.recipientOffice ? ' • ' + s.recipientOffice : ''}
              </p>
            ` : ''}
          </div>

          <!-- Citation Paragraph -->
          <div class="max-w-3xl mx-auto px-6 py-1">
            <p class="text-[12px] leading-relaxed text-slate-700 font-sans text-center inline-edit-apprec"
               data-apprec-field="citationText" contenteditable="true" spellcheck="false" title="Click to edit citation paragraph">
              ${renderedCitation}
            </p>
          </div>

          <!-- Conferred Date Line -->
          <p class="text-[10.5px] text-slate-600 italic font-sans inline-edit-apprec"
             data-apprec-field="dateVenueLine" contenteditable="true" spellcheck="false" title="Click to edit date line">${s.dateVenueLine}</p>
        </div>

        <!-- 3. EXECUTIVE SIGNATURES SECTION -->
        <div class="relative z-10 pt-2 border-t border-amber-200/40">
          ${signaturesBlock}
        </div>

      </div>
    </div>
  `;

  stage.innerHTML = sheetHtml;
  bindAppreciationInlineEditing();
}

// --- DIRECT INLINE EDITING BINDINGS ---
function bindAppreciationInlineEditing() {
  const stage = document.getElementById('appreciationPreviewStage');
  if (!stage) return;

  // Global field inline edits
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

// --- PRINTING ENGINE (ISOLATED A4 LANDSCAPE) ---
function printAppreciationCertificate() {
  const printBox = document.getElementById('appreciationPrintContainer');
  if (!printBox) return;

  const canvas = document.getElementById('appreciationSheetCanvas');
  if (!canvas) return;

  printBox.innerHTML = `
    <div class="appreciation-print-page">
      ${canvas.outerHTML}
    </div>
  `;

  if (typeof setPrintPageRule === 'function') setPrintPageRule('A4 landscape');
  document.body.classList.add('printing-appreciation');
  showToast(`Preparing print for ${appreciationState.recipientName || 'Award'} (A4 Landscape)...`, 'fa-print');

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
}

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
window.handleApprecSigUpdate = handleApprecSigUpdate;
window.handleApprecSigImageUpload = handleApprecSigImageUpload;
window.useOfficialApprecSig = useOfficialApprecSig;
window.removeApprecSigImage = removeApprecSigImage;
window.handleAppreciationFieldChange = handleAppreciationFieldChange;
window.handleAppreciationStyleChange = handleAppreciationStyleChange;
window.formatAppreciationRecipientUppercase = formatAppreciationRecipientUppercase;
window.insertAppreciationTag = insertAppreciationTag;
window.setAppreciationZoom = setAppreciationZoom;
window.printAppreciationCertificate = printAppreciationCertificate;
window.exportAppreciationDocx = exportAppreciationDocx;
window.resetAppreciationToDefault = resetAppreciationToDefault;
