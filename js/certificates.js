// ==========================================================================
// MOVE BAGUIO CHAPTER — CERTIFICATE STUDIO, DESIGNER & SIGNATURE ENGINE
// ==========================================================================

    // ==============================================================================
    // --- CERTIFICATE STUDIO & DESIGNER ENGINE (CLEAN & NON-DESTRUCTIVE) ---
    // ==============================================================================

    const OFFICIAL_MOVE_SIGNATORIES = [
      { key: 'custom', label: '--- Select Official / Or Type Custom Text ---', name: '', title: '', office: '' },

      // Executive Board 2026 – Present (Current Administration - Excel Sheet 'Officer' Row 10-17)
      { key: 'ganga', label: 'Mario D. Ganga Jr. (MOVE Chapter President)', name: 'MARIO D. GANGA JR.', title: 'MOVE Chapter President', office: 'CMO - PDAO' },
      { key: 'delacruz', label: 'Florentino N. Dela Cruz Jr. (Vice President)', name: 'FLORENTINO N. DELA CRUZ JR.', title: 'MOVE Vice President', office: 'CMO - Library' },
      { key: 'guadana', label: 'Ruperto D. Guadaña Jr. (Secretary)', name: 'RUPERTO D. GUADAÑA JR.', title: 'MOVE Chapter Secretary', office: 'Sangguniang Panlungsod' },
      { key: 'delmendo', label: 'Rhey J. Delmendo (Assistant Secretary)', name: 'RHEY J. DELMENDO', title: 'MOVE Assistant Secretary', office: 'City Tourism' },
      { key: 'ragudo', label: 'Regino G. Ragudo (Treasurer)', name: 'REGINO G. RAGUDO', title: 'MOVE Chapter Treasurer', office: 'Sangguniang Panlungsod' },
      { key: 'cabading', label: 'Avelino G. Cabading Jr. (Assistant Treasurer)', name: 'AVELINO G. CABADING JR.', title: 'MOVE Assistant Treasurer', office: 'City Accounting' },
      { key: 'mallorca', label: 'Harold P. Mallorca (Public Relations Officer)', name: 'HAROLD P. MALLORCA', title: 'MOVE Public Relations Officer', office: 'CADMO / CMO' },
      { key: 'sumcad', label: 'Judah F. Sumcad (Assistant P.R.O.)', name: 'JUDAH F. SUMCAD', title: 'MOVE Assistant P.R.O.', office: 'CMO - Library' },

      // City Executive & Advisory Board
      { key: 'magalong', label: 'Hon. Benjamin B. Magalong (City Mayor)', name: 'HON. BENJAMIN B. MAGALONG', title: 'City Mayor', office: 'City Government of Baguio' },
      { key: 'olowan', label: 'Hon. Faustino A. Olowan (City Vice Mayor)', name: 'HON. FAUSTINO A. OLOWAN', title: 'City Vice Mayor', office: 'City Government of Baguio' },

      // Standing Committee Leaders (Excel Sheet 'Committees')
      { key: 'buenavista', label: 'Noriel Anthony Buenavista (Vice-Chair, CMR)', name: 'NORIEL ANTHONY BUENAVISTA', title: 'Vice-Chairperson, Membership & Recruitment', office: 'CMO - Licensing' },
      { key: 'see', label: 'Dexter A. See (Chairperson, CIA)', name: 'DEXTER A. SEE', title: 'Chairperson, Information & Advocacy', office: 'CMO - PIO' },
      { key: 'cosep', label: 'James C. Cosep (Vice-Chair, CIA)', name: 'JAMES C. COSEP', title: 'Vice-Chairperson, Information & Advocacy', office: 'City Planning' },
      { key: 'parillo', label: 'Warren Parillo (CETCB Member)', name: 'WARREN PARILLO', title: 'Member, Education & Training', office: 'City Engineering' },
      { key: 'basali', label: 'Isaac S. Basali (CETCB Member)', name: 'ISAAC S. BASALI', title: 'Member, Education & Training', office: 'City Treasury' },
      { key: 'faustino', label: 'Allan Faustino (CIA Member)', name: 'ALLAN FAUSTINO', title: 'Member, Information & Advocacy', office: 'DepEd Baguio' },
      { key: 'tangalin', label: 'Protacio P. Tangalin Jr. (CIA Member)', name: 'PROTACIO P. TANGALIN JR.', title: 'Member, Information & Advocacy', office: 'Sangguniang Panlungsod' },

      // Term 2025 – 2026 (Previous Administration - Excel Sheet 'Officer' Row 2-9)
      { key: 'ong', label: 'Dan Ricky M. Ong (Immediate Past President)', name: 'DAN RICKY M. ONG', title: 'Immediate Past President', office: 'Sangguniang Panlungsod' },
      { key: 'mangayan', label: 'Jay Dee A. Mangayan (Past Vice President)', name: 'JAY DEE A. MANGAYAN', title: 'Past Vice President', office: 'General Services Office' },
      { key: 'valdez', label: 'Rommel M. Valdez (Past Secretary)', name: 'ROMMEL M. VALDEZ', title: 'Past Secretary', office: 'CEPMO' },
      { key: 'itliong', label: 'Joseph Mary S. Itliong (Past Assistant Secretary)', name: 'JOSEPH MARY S. ITLIONG', title: 'Past Assistant Secretary', office: 'CHRMO' },
      { key: 'avena', label: 'Trojan Avena (Past Treasurer)', name: 'TROJAN AVENA', title: 'Past Treasurer', office: 'MOVE Baguio' },
      { key: 'cortez', label: 'Danny Cortez (Past Assistant Treasurer)', name: 'DANNY CORTEZ', title: 'Past Assistant Treasurer', office: 'CADMO' },
      { key: 'martin', label: 'Jayson Martin (Past P.R.O.)', name: 'JAYSON MARTIN', title: 'Past Public Relations Officer', office: 'OCSWDO' },
      { key: 'bulacan', label: 'Cristobal T. Bulacan (Past Assistant P.R.O.)', name: 'CRISTOBAL T. BULACAN', title: 'Past Assistant P.R.O.', office: 'Civil Registry' }
    ];

    const SIGNATORIES_DB_KEY = 'move_signatories_db_v1';

    function getCustomSignatories() {
      try {
        const raw = localStorage.getItem(SIGNATORIES_DB_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse custom signatories:', e);
      }
      return [];
    }

    function saveCustomSignatories(list) {
      localStorage.setItem(SIGNATORIES_DB_KEY, JSON.stringify(list));
    }

    function getAllSignatoriesList() {
      const custom = getCustomSignatories();
      return [...OFFICIAL_MOVE_SIGNATORIES, ...custom];
    }

    // --- SIGNATORIES DATABASE MANAGEMENT ---
    let tempDbSigImageBase64 = '';

    function openSignatoriesDbModal() {
      const modal = document.getElementById('modalSignatoriesDb');
      if (modal) {
        modal.classList.remove('hidden');
        renderSignatoriesDbList();
      }
    }

    function closeSignatoriesDbModal() {
      const modal = document.getElementById('modalSignatoriesDb');
      if (modal) modal.classList.add('hidden');
      resetSignatoryDbForm();
    }

    function resetSignatoryDbForm() {
      const form = document.getElementById('formAddSignatoryDb');
      if (form) form.reset();
      tempDbSigImageBase64 = '';
      const prev = document.getElementById('sigDbImgPreview');
      if (prev) {
        prev.src = '';
        prev.classList.add('hidden');
      }
    }

    function handleSigDbImageUpload(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        tempDbSigImageBase64 = evt.target.result;
        const prev = document.getElementById('sigDbImgPreview');
        if (prev) {
          prev.src = tempDbSigImageBase64;
          prev.classList.remove('hidden');
        }
      };
      reader.readAsDataURL(file);
    }

    function handleAddSignatoryToDb(e) {
      if (e && e.preventDefault) e.preventDefault();
      const nameInput = document.getElementById('sigDbName');
      const titleInput = document.getElementById('sigDbTitle');
      const officeInput = document.getElementById('sigDbOffice');

      const name = (nameInput ? nameInput.value : '').trim().toUpperCase();
      const title = (titleInput ? titleInput.value : '').trim();
      const office = (officeInput ? officeInput.value : '').trim();

      if (!name) {
        showToast('Please enter the signatory\'s full name.', 'fa-circle-exclamation');
        return;
      }

      const customList = getCustomSignatories();
      const newKey = 'custom_' + Date.now();
      const newEntry = {
        key: newKey,
        label: `${name} (${title || office || 'Custom Signatory'})`,
        name: name,
        title: title,
        office: office,
        signatureImage: tempDbSigImageBase64 || '',
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      customList.unshift(newEntry);
      saveCustomSignatories(customList);
      populateSignatoryOfficerDropdowns();
      renderSignatoriesDbList();
      resetSignatoryDbForm();
      showToast(`Added "${name}" to Signatories Database!`, 'fa-database');
    }

    function handleDeleteSignatoryFromDb(key) {
      const customList = getCustomSignatories();
      const target = customList.find(c => c.key === key);
      const name = target ? target.name : 'Signatory';
      if (!confirm(`Are you sure you want to remove "${name}" from your custom signatories database?`)) return;

      const updated = customList.filter(c => c.key !== key);
      saveCustomSignatories(updated);
      populateSignatoryOfficerDropdowns();
      renderSignatoriesDbList();
      showToast(`Removed "${name}" from Database.`, 'fa-trash');
    }

    function applySignatoryFromDbToSlot(key, sigNum) {
      handlePickSignatoryOfficer(sigNum, key);
      closeSignatoriesDbModal();
    }

    function saveCurrentInputsToSignatoriesDb(sigNum) {
      const t = currentCertTemplate.signatories;
      const name = (t[`sig${sigNum}Name`] || '').trim().toUpperCase();
      const title = (t[`sig${sigNum}Title`] || '').trim();
      const office = (t[`sig${sigNum}Office`] || '').trim();
      const sigImg = t[`sig${sigNum}SignatureImage`] || '';

      if (!name) {
        showToast(`Signatory ${sigNum} name is empty. Type a name before saving to DB.`, 'fa-circle-exclamation');
        return;
      }

      const customList = getCustomSignatories();
      const existing = customList.find(c => c.name.toUpperCase() === name);
      if (existing) {
        if (!confirm(`"${name}" is already in the database. Update its title, office and signature?`)) return;
        existing.title = title;
        existing.office = office;
        if (sigImg) existing.signatureImage = sigImg;
        existing.label = `${name} (${title || office || 'Signatory'})`;
      } else {
        const newKey = 'custom_' + Date.now();
        customList.unshift({
          key: newKey,
          label: `${name} (${title || office || 'Signatory'})`,
          name: name,
          title: title,
          office: office,
          signatureImage: sigImg,
          isCustom: true,
          createdAt: new Date().toISOString()
        });
      }

      saveCustomSignatories(customList);
      populateSignatoryOfficerDropdowns();
      showToast(`Saved "${name}" to Signatories Database!`, 'fa-database');
    }

    function renderSignatoriesDbList() {
      const container = document.getElementById('signatoriesDbListContainer');
      if (!container) return;
      const customList = getCustomSignatories();

      if (customList.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <i class="fa-solid fa-folder-open text-2xl text-slate-300 mb-2"></i>
            <p class="text-xs font-semibold">No custom signatories added yet.</p>
            <p class="text-[11px] text-slate-400">Use the form above to register guest speakers, department heads, or VIP signatories.</p>
          </div>
        `;
      } else {
        container.innerHTML = customList.map(sig => `
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-move-orange-300 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-move-navy-50 text-move-navy-800 flex items-center justify-center font-bold text-sm shrink-0 border border-move-navy-200">
                <i class="fa-solid fa-signature"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-extrabold text-xs text-move-navy-900">${sig.name}</h4>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Custom DB</span>
                </div>
                <p class="text-[11px] text-slate-600 font-medium">${sig.title || 'Official Signatory'}${sig.office ? ' • ' + sig.office : ''}</p>
                ${sig.signatureImage ? '<span class="text-[10px] text-move-orange-600 font-semibold flex items-center gap-1 mt-0.5"><i class="fa-solid fa-check"></i> Signature Image Attached</span>' : '<span class="text-[10px] text-slate-400">No signature image</span>'}
              </div>
            </div>
            <div class="flex items-center gap-1.5 self-end md:self-auto shrink-0">
              <button type="button" onclick="applySignatoryFromDbToSlot('${sig.key}', 1)" class="px-2 py-1 rounded bg-slate-100 hover:bg-move-navy-900 hover:text-white text-[10px] font-bold text-slate-700 transition" title="Apply as Signatory 1">Apply Sig 1</button>
              <button type="button" onclick="applySignatoryFromDbToSlot('${sig.key}', 2)" class="px-2 py-1 rounded bg-slate-100 hover:bg-move-navy-900 hover:text-white text-[10px] font-bold text-slate-700 transition" title="Apply as Signatory 2">Apply Sig 2</button>
              <button type="button" onclick="applySignatoryFromDbToSlot('${sig.key}', 3)" class="px-2 py-1 rounded bg-slate-100 hover:bg-move-navy-900 hover:text-white text-[10px] font-bold text-slate-700 transition" title="Apply as Signatory 3">Apply Sig 3</button>
              <button type="button" onclick="handleDeleteSignatoryFromDb('${sig.key}')" class="p-1.5 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition ml-1" title="Delete from Database">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        `).join('');
      }

      const officialBadge = document.getElementById('lblOfficialLeadersCount');
      if (officialBadge) officialBadge.textContent = OFFICIAL_MOVE_SIGNATORIES.filter(o => o.key !== 'custom').length;
      const customBadge = document.getElementById('lblCustomSignatoriesCount');
      if (customBadge) customBadge.textContent = customList.length;
    }

    // Expose Signatory DB utilities on window
    window.openSignatoriesDbModal = openSignatoriesDbModal;
    window.closeSignatoriesDbModal = closeSignatoriesDbModal;
    window.renderSignatoriesDbList = renderSignatoriesDbList;
    window.handleAddSignatoryToDb = handleAddSignatoryToDb;
    window.handleDeleteSignatoryFromDb = handleDeleteSignatoryFromDb;
    window.handleSigDbImageUpload = handleSigDbImageUpload;
    window.saveCurrentInputsToSignatoriesDb = saveCurrentInputsToSignatoriesDb;
    window.applySignatoryFromDbToSlot = applySignatoryFromDbToSlot;
    window.getAllSignatoriesList = getAllSignatoriesList;
    window.getCustomSignatories = getCustomSignatories;
    window.saveCustomSignatories = saveCustomSignatories;
    window.populateSignatoryOfficerDropdowns = populateSignatoryOfficerDropdowns;

    const DEFAULT_CERT_TEMPLATES = {
      'move_official_2026': {
        id: 'move_official_2026',
        name: 'Official MOVE Standard (2026)',
        isBuiltIn: true,
        theme: {
          outerBorderColor: '#091b38',
          innerBorderColor: '#f97316',
          borderStyle: 'double',
          borderWidth: 8,
          backgroundColor: '#ffffff',
          cornerOrnament: 'none',
          cornerColor: '#f97316'
        },
        header: {
          republicText: 'Republic of the Philippines',
          cityText: 'City Government of Baguio',
          chapterText: 'Men Opposed to Violence Against Women Everywhere (MOVE)',
          subText: 'City Hall Chapter • Baguio City, Philippines',
          showLeftLogo: true,
          leftLogo: 'CITY%20HALL%20LOGO.png',
          leftLogoWidth: 76,
          showRightLogo: true,
          rightLogo: 'MOVE%20BAGUIO%20LOGO.png',
          rightLogoWidth: 76,
          watermarkLogo: 'MOVE%20BAGUIO%20LOGO.png',
          watermarkOpacity: 10,
          watermarkEnabled: false,
          goldSeal: false,
          goldSealPosition: 'bottom-center'
        },
        title: {
          type: 'participation',
          customTitle: 'CERTIFICATE OF PARTICIPATION',
          fontFamily: 'cinzel',
          color: '#091b38',
          accentColor: '#f97316',
          fontSize: 28,
          introText: 'This certificate is proudly awarded to'
        },
        recipient: {
          fontFamily: 'cinzel',
          fontSize: 34,
          color: '#091b38',
          underline: true,
          underlineColor: '#f97316',
          subtitleColor: '#ea580c',
          customName: '',
          customSubtitle: ''
        },
        citation: {
          leadText: 'for actively participating and successfully completing the capacity-building seminar on',
          customEventTitle: '',
          detailTemplate: 'Conducted on {date} at {venue} with an equivalent duration of {duration}.',
          fontSize: 13,
          color: '#334155'
        },
        signatories: {
          sig1Enabled: true,
          sig1Name: 'MARIO D. GANGA JR.',
          sig1Title: 'MOVE Chapter President',
          sig1Office: '',
          sig1SignatureImage: '',
          sig2Enabled: true,
          sig2Name: 'HON. BENJAMIN B. MAGALONG',
          sig2Title: 'City Mayor',
          sig2Office: '',
          sig2SignatureImage: '',
          sig3Enabled: false,
          sig3Name: 'HON. FAUSTINO A. OLOWAN',
          sig3Title: 'City Vice Mayor',
          sig3Office: '',
          sig3SignatureImage: '',
          showQrSerial: false
        },
        offsets: {
          header: { x: 0, y: 0 },
          title: { x: 0, y: 0 },
          recipient: { x: 0, y: 0 },
          citation: { x: 0, y: 0 },
          signatories: { x: 0, y: 0 },
          leftLogo: { x: 0, y: 0 },
          rightLogo: { x: 0, y: 0 },
          goldSeal: { x: 0, y: 0 },
          watermark: { x: 0, y: 0 }
        }
      },
      'pine_recognition': {
        id: 'pine_recognition',
        name: 'Baguio Pine & Gold (Recognition)',
        isBuiltIn: true,
        theme: {
          outerBorderColor: '#064e3b',
          innerBorderColor: '#d97706',
          borderStyle: 'double',
          borderWidth: 8,
          backgroundColor: '#f0fdf4',
          cornerOrnament: 'none',
          cornerColor: '#059669'
        },
        header: {
          republicText: 'Republic of the Philippines',
          cityText: 'City Government of Baguio',
          chapterText: 'Men Opposed to Violence Against Women Everywhere (MOVE)',
          subText: 'City Hall Chapter • Baguio City, Philippines',
          showLeftLogo: true,
          leftLogo: 'CITY%20HALL%20LOGO.png',
          leftLogoWidth: 76,
          showRightLogo: true,
          rightLogo: 'MOVE%20BAGUIO%20LOGO.png',
          rightLogoWidth: 76,
          watermarkLogo: 'MOVE%20BAGUIO%20LOGO.png',
          watermarkOpacity: 10,
          watermarkEnabled: false,
          goldSeal: false,
          goldSealPosition: 'bottom-center'
        },
        title: {
          type: 'recognition',
          customTitle: 'CERTIFICATE OF RECOGNITION',
          fontFamily: 'cinzel',
          color: '#064e3b',
          accentColor: '#d97706',
          fontSize: 28,
          introText: 'This certificate is hereby presented to'
        },
        recipient: {
          fontFamily: 'cinzel',
          fontSize: 34,
          color: '#064e3b',
          underline: true,
          underlineColor: '#059669',
          subtitleColor: '#047857',
          customName: '',
          customSubtitle: ''
        },
        citation: {
          leadText: 'in recognition of exemplary leadership and active participation during the',
          customEventTitle: '',
          detailTemplate: 'Given this {date} at {venue} ({duration}).',
          fontSize: 13,
          color: '#064e3b'
        },
        signatories: {
          sig1Enabled: true,
          sig1Name: 'MARIO D. GANGA JR.',
          sig1Title: 'MOVE Chapter President',
          sig1Office: '',
          sig1SignatureImage: '',
          sig2Enabled: true,
          sig2Name: 'HON. BENJAMIN B. MAGALONG',
          sig2Title: 'City Mayor',
          sig2Office: '',
          sig2SignatureImage: '',
          sig3Enabled: false,
          sig3Name: 'HON. FAUSTINO A. OLOWAN',
          sig3Title: 'City Vice Mayor',
          sig3Office: '',
          sig3SignatureImage: '',
          showQrSerial: false
        },
        offsets: {
          header: { x: 0, y: 0 },
          title: { x: 0, y: 0 },
          recipient: { x: 0, y: 0 },
          citation: { x: 0, y: 0 },
          signatories: { x: 0, y: 0 },
          leftLogo: { x: 0, y: 0 },
          rightLogo: { x: 0, y: 0 },
          goldSeal: { x: 0, y: 0 },
          watermark: { x: 0, y: 0 }
        }
      },
      'men_in_the_kitchen_2': {
        id: 'men_in_the_kitchen_2',
        name: 'Men in the Kitchen 2 (Love Served in the Kitchen)',
        isBuiltIn: true,
        theme: {
          outerBorderColor: '#451a03',
          innerBorderColor: '#ea580c',
          borderStyle: 'double',
          borderWidth: 8,
          backgroundColor: '#fffbeb',
          cornerOrnament: 'none',
          cornerColor: '#ea580c'
        },
        header: {
          republicText: 'Republic of the Philippines',
          cityText: 'City Government of Baguio',
          chapterText: 'Men Opposed to Violence Against Women Everywhere (MOVE)',
          subText: 'City Hall Chapter • Baguio City, Philippines',
          showLeftLogo: true,
          leftLogo: 'CITY%20HALL%20LOGO.png',
          leftLogoWidth: 74,
          showRightLogo: true,
          rightLogo: 'MOVE%20BAGUIO%20LOGO.png',
          rightLogoWidth: 74,
          showEventLogo: true,
          eventLogo: 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png',
          eventLogoWidth: 86,
          watermarkLogo: 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png',
          watermarkOpacity: 8,
          watermarkEnabled: false,
          goldSeal: false,
          goldSealPosition: 'bottom-center'
        },
        title: {
          type: 'participation',
          customTitle: 'CERTIFICATE OF PARTICIPATION',
          fontFamily: 'cinzel',
          color: '#7c2d12',
          accentColor: '#ea580c',
          fontSize: 28,
          introText: 'This certificate is proudly presented to'
        },
        recipient: {
          fontFamily: 'cinzel',
          fontSize: 34,
          color: '#451a03',
          underline: true,
          underlineColor: '#ea580c',
          subtitleColor: '#c2410c',
          customName: '',
          customSubtitle: ''
        },
        citation: {
          leadText: 'for active participation and culinary fellowship in championing shared household responsibility and VAW-free homes during',
          customEventTitle: 'MEN IN THE KITCHEN 2: LOVE SERVED IN THE KITCHEN',
          detailTemplate: 'Held on {date} at {venue} ({duration}).',
          fontSize: 13,
          color: '#451a03'
        },
        signatories: {
          sig1Enabled: true,
          sig1Name: 'MARIO D. GANGA JR.',
          sig1Title: 'MOVE Chapter President',
          sig1Office: '',
          sig1SignatureImage: '',
          sig2Enabled: true,
          sig2Name: 'HON. BENJAMIN B. MAGALONG',
          sig2Title: 'City Mayor',
          sig2Office: '',
          sig2SignatureImage: '',
          sig3Enabled: false,
          sig3Name: 'HON. FAUSTINO A. OLOWAN',
          sig3Title: 'City Vice Mayor',
          sig3Office: '',
          sig3SignatureImage: '',
          showQrSerial: false
        },
        offsets: {
          header: { x: 0, y: 0 },
          title: { x: 0, y: 0 },
          recipient: { x: 0, y: 0 },
          citation: { x: 0, y: 0 },
          signatories: { x: 0, y: 0 },
          leftLogo: { x: 0, y: 0 },
          rightLogo: { x: 0, y: 0 },
          eventLogo: { x: 0, y: 0 },
          goldSeal: { x: 0, y: 0 },
          watermark: { x: 0, y: 0 }
        }
      }
    };

    const CERT_TEMPLATES_STORAGE_KEY = 'move_cert_templates_v5';
    let allCertTemplates = {};
    let currentCertVersionId = 'move_official_2026';
    let currentCertTemplate = JSON.parse(JSON.stringify(DEFAULT_CERT_TEMPLATES['move_official_2026']));
    let isCertEditMode = false;
    let activeMoveElementKey = 'title';

    // Drag tracking variables
    let isDraggingCertElement = false;
    let activeDragElementKey = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragElemInitX = 0;
    let dragElemInitY = 0;

    // --- UNDO / REDO HISTORY STACK & AUTO-SAVE PERSISTENCE ---
    let certHistoryStack = [];
    let certHistoryIndex = -1;
    const MAX_CERT_HISTORY = 40;
    let certTextHistoryTimer = null;

    function persistActiveTemplateState() {
      if (!currentCertVersionId || !currentCertTemplate || !allCertTemplates) return;
      allCertTemplates[currentCertVersionId] = JSON.parse(JSON.stringify(currentCertTemplate));
      saveTemplatesToStorage();
      const autoLbl = document.getElementById('lblCertAutoSaveStatus');
      if (autoLbl) {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        autoLbl.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-emerald-600"></i> Auto-Saved (${nowStr})`;
      }
    }

    function scheduleTextHistoryPush(actionDesc) {
      persistActiveTemplateState();
      if (certTextHistoryTimer) clearTimeout(certTextHistoryTimer);
      certTextHistoryTimer = setTimeout(() => {
        pushCertHistoryState(actionDesc || 'Edited text');
      }, 450);
    }

    function pushCertHistoryState(actionDesc) {
      if (certHistoryIndex < certHistoryStack.length - 1) {
        certHistoryStack = certHistoryStack.slice(0, certHistoryIndex + 1);
      }
      const snapshot = JSON.parse(JSON.stringify(currentCertTemplate));
      certHistoryStack.push({
        snapshot: snapshot,
        description: actionDesc || 'Edit'
      });
      if (certHistoryStack.length > MAX_CERT_HISTORY) {
        certHistoryStack.shift();
      } else {
        certHistoryIndex++;
      }
      if (actionDesc && actionDesc !== 'Initial State') {
        persistActiveTemplateState();
      }
      updateUndoRedoButtons();
    }

    function undoCertState() {
      if (certHistoryIndex > 0) {
        certHistoryIndex--;
        currentCertTemplate = JSON.parse(JSON.stringify(certHistoryStack[certHistoryIndex].snapshot));
        persistActiveTemplateState();
        syncDesignerInputsFromTemplate();
        renderCertificatePreview();
        updateUndoRedoButtons();
        showToast(`Undo: ${certHistoryStack[certHistoryIndex + 1].description}`, 'fa-rotate-left');
      } else {
        showToast('Nothing to undo', 'fa-info-circle');
      }
    }

    function redoCertState() {
      if (certHistoryIndex < certHistoryStack.length - 1) {
        certHistoryIndex++;
        currentCertTemplate = JSON.parse(JSON.stringify(certHistoryStack[certHistoryIndex].snapshot));
        persistActiveTemplateState();
        syncDesignerInputsFromTemplate();
        renderCertificatePreview();
        updateUndoRedoButtons();
        showToast(`Redo: ${certHistoryStack[certHistoryIndex].description}`, 'fa-rotate-right');
      } else {
        showToast('Nothing to redo', 'fa-info-circle');
      }
    }

    function updateUndoRedoButtons() {
      const btnUndo = document.getElementById('btnCertUndo');
      const btnRedo = document.getElementById('btnCertRedo');

      const canUndo = certHistoryIndex > 0;
      const canRedo = certHistoryIndex < certHistoryStack.length - 1;

      if (btnUndo) {
        btnUndo.disabled = !canUndo;
        btnUndo.className = `px-2.5 py-1.5 rounded-lg bg-white font-bold transition flex items-center gap-1 shadow-2xs text-xs ${canUndo ? 'text-slate-800 hover:bg-slate-200 cursor-pointer opacity-100' : 'text-slate-400 opacity-50 cursor-not-allowed'}`;
      }
      if (btnRedo) {
        btnRedo.disabled = !canRedo;
        btnRedo.className = `px-2.5 py-1.5 rounded-lg bg-white font-bold transition flex items-center gap-1 shadow-2xs text-xs ${canRedo ? 'text-slate-800 hover:bg-slate-200 cursor-pointer opacity-100' : 'text-slate-400 opacity-50 cursor-not-allowed'}`;
      }
    }

    // Keyboard listener for Undo (Ctrl+Z) and Redo (Ctrl+Y or Ctrl+Shift+Z)
    window.addEventListener('keydown', (e) => {
      if (!isCertEditMode) return;
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redoCertState();
        } else {
          undoCertState();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoCertState();
      }
    });

    function populateSignatoryOfficerDropdowns() {
      [1, 2, 3].forEach(num => {
        const sel = document.getElementById('selectQuickOfficerSig' + num);
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '';

        const defaultOpt = document.createElement('option');
        defaultOpt.value = 'custom';
        defaultOpt.textContent = '--- Select Official / Or Custom ---';
        sel.appendChild(defaultOpt);

        const officialGroup = document.createElement('optgroup');
        officialGroup.label = 'Official MOVE Officers & City Leaders';
        OFFICIAL_MOVE_SIGNATORIES.filter(off => off.key !== 'custom').forEach(off => {
          const opt = document.createElement('option');
          opt.value = off.key;
          opt.textContent = off.label;
          officialGroup.appendChild(opt);
        });
        sel.appendChild(officialGroup);

        const custom = getCustomSignatories();
        if (custom.length > 0) {
          const customGroup = document.createElement('optgroup');
          customGroup.label = `Custom / Saved Database (${custom.length})`;
          custom.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.key;
            opt.textContent = c.label || `${c.name} (${c.title || 'Signatory'})`;
            customGroup.appendChild(opt);
          });
          sel.appendChild(customGroup);
        }

        if (currentVal) sel.value = currentVal;
      });

      if (typeof populateAppreciationSigDropdowns === 'function') {
        populateAppreciationSigDropdowns();
      }
    }

    function initCertificateStudio() {
      loadAllCertTemplates();
      populateSignatoryOfficerDropdowns();

      const actSelect = document.getElementById('certActivitySelect');
      if (actSelect) {
        actSelect.innerHTML = '';
        activitiesList.forEach(act => {
          const presentCount = act.participants.filter(p => p.isPresent).length;
          const opt = document.createElement('option');
          opt.value = act.id;
          opt.textContent = `${act.date} - ${act.title} (${presentCount} Present)`;
          actSelect.appendChild(opt);
        });
      }

      certHistoryStack = [];
      certHistoryIndex = -1;
      pushCertHistoryState('Initial State');

      populateCertVersionDropdown();
      syncDesignerInputsFromTemplate();
      handleCertActivityChange();
      initCertDragListeners();
      initCertInlineEditListeners();
    }

    function normalizeTemplateFields(tpl) {
      if (!tpl.header) tpl.header = {};
      if (tpl.header.showLeftLogo === undefined) tpl.header.showLeftLogo = true;
      if (tpl.header.showRightLogo === undefined) tpl.header.showRightLogo = true;
      if (tpl.header.showEventLogo === undefined) tpl.header.showEventLogo = (tpl.id === 'men_in_the_kitchen_2');
      if (!tpl.header.eventLogo) tpl.header.eventLogo = 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png';
      if (!tpl.header.eventLogoWidth) tpl.header.eventLogoWidth = 84;
      if (!tpl.header.watermarkLogo) tpl.header.watermarkLogo = 'MOVE%20BAGUIO%20LOGO.png';
      if (!tpl.header.watermarkLayer) tpl.header.watermarkLayer = 'behind';
      if (!tpl.header.watermarkSize) tpl.header.watermarkSize = 300;
      if (tpl.header.watermarkOpacity === undefined) tpl.header.watermarkOpacity = 12;
      if (tpl.header.republicFontSize === undefined) tpl.header.republicFontSize = 11;
      if (tpl.header.cityFontSize === undefined) tpl.header.cityFontSize = 13;
      if (tpl.header.chapterFontSize === undefined) tpl.header.chapterFontSize = 12;
      if (tpl.header.subFontSize === undefined) tpl.header.subFontSize = 9.5;
      if (!tpl.title) tpl.title = {};
      if (tpl.title.introFontSize === undefined) tpl.title.introFontSize = 12;
      if (!tpl.recipient) tpl.recipient = {};
      if (tpl.recipient.subtitleFontSize === undefined) tpl.recipient.subtitleFontSize = 12;
      if (!tpl.citation) tpl.citation = {};
      if (tpl.citation.eventTitleFontSize === undefined) tpl.citation.eventTitleFontSize = 15;
      if (tpl.citation.detailFontSize === undefined) tpl.citation.detailFontSize = 11.5;
      if (!tpl.offsets) tpl.offsets = {};
      ['header', 'title', 'recipient', 'citation', 'signatories', 'leftLogo', 'rightLogo', 'eventLogo', 'goldSeal', 'watermark', 'sig1', 'sig2', 'sig3', 'sig1Img', 'sig2Img', 'sig3Img'].forEach(k => {
        if (!tpl.offsets[k]) tpl.offsets[k] = { x: 0, y: 0 };
      });
      if (!tpl.theme) tpl.theme = {};
      if (!tpl.theme.cornerOrnament) tpl.theme.cornerOrnament = 'none';
      if (!tpl.theme.borderPreset) {
        if (tpl.theme.borderStyle === 'none') {
          tpl.theme.borderPreset = 'none';
        } else if (tpl.id === 'men_in_the_kitchen_2') {
          tpl.theme.borderPreset = 'kitchen_culinary_artisan';
        } else if (tpl.id === 'gold_appreciation') {
          tpl.theme.borderPreset = 'royal_gold_filigree';
        } else if (tpl.id === 'pine_recognition') {
          tpl.theme.borderPreset = 'baguio_heritage_crest';
        } else {
          tpl.theme.borderPreset = 'move_classic_double';
        }
      }
      if (!tpl.citation) tpl.citation = {};
      if (tpl.citation.customEventTitle === undefined) tpl.citation.customEventTitle = '';
      if (tpl.citation.customDate === undefined) tpl.citation.customDate = '';
      if (tpl.citation.customVenue === undefined) tpl.citation.customVenue = '';
      if (tpl.citation.customDuration === undefined) tpl.citation.customDuration = '';
      if (tpl.citation.detailTemplate === undefined) {
        tpl.citation.detailTemplate = 'Conducted on {date} at {venue} with an equivalent duration of {duration}.';
      }
      if (!tpl.signatories) tpl.signatories = {};
      if (tpl.signatories.sig1Enabled === undefined) tpl.signatories.sig1Enabled = true;
      if (tpl.signatories.sig2Enabled === undefined) tpl.signatories.sig2Enabled = true;
      if (tpl.signatories.sig3Enabled === undefined) tpl.signatories.sig3Enabled = false;
      if (tpl.signatories.showQrSerial === undefined) tpl.signatories.showQrSerial = false;
      if (!tpl.signatories.fontSize) tpl.signatories.fontSize = 13;
      if (!tpl.signatories.titleFontSize) tpl.signatories.titleFontSize = 10;
      if (!tpl.signatories.lineWidth) tpl.signatories.lineWidth = 210;
      if (!tpl.signatories.sigImageSize) tpl.signatories.sigImageSize = 56;
      if (!tpl.signatories.sigImageHeight) tpl.signatories.sigImageHeight = tpl.signatories.sigImageSize || 56;
      if (!tpl.signatories.sigImageWidth) tpl.signatories.sigImageWidth = 150;
      if (!tpl.signatories.sigFitMode) tpl.signatories.sigFitMode = 'fill';
      [1, 2, 3].forEach(n => {
        if (!tpl.signatories[`sig${n}ImageHeight`]) {
          tpl.signatories[`sig${n}ImageHeight`] = tpl.signatories[`sig${n}ImageSize`] || tpl.signatories.sigImageHeight || 56;
        }
        if (!tpl.signatories[`sig${n}ImageWidth`]) {
          tpl.signatories[`sig${n}ImageWidth`] = tpl.signatories.sigImageWidth || 150;
        }
        if (!tpl.signatories[`sig${n}ImageSize`]) {
          tpl.signatories[`sig${n}ImageSize`] = tpl.signatories[`sig${n}ImageHeight`];
        }
      });
      return tpl;
    }

    function loadAllCertTemplates() {
      allCertTemplates = JSON.parse(JSON.stringify(DEFAULT_CERT_TEMPLATES));
      Object.keys(allCertTemplates).forEach(k => {
        allCertTemplates[k] = normalizeTemplateFields(allCertTemplates[k]);
      });
      try {
        const savedRaw = localStorage.getItem(CERT_TEMPLATES_STORAGE_KEY);
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          Object.keys(parsed).forEach(k => {
            if (k === 'ca_official_appearance' || k === 'gold_appreciation') return;
            allCertTemplates[k] = normalizeTemplateFields(parsed[k]);
          });
        }
      } catch (err) {
        console.warn('Could not load saved certificate templates:', err);
      }

      if (!allCertTemplates[currentCertVersionId] || currentCertVersionId === 'ca_official_appearance' || currentCertVersionId === 'gold_appreciation') {
        currentCertVersionId = 'move_official_2026';
      }
      currentCertTemplate = normalizeTemplateFields(JSON.parse(JSON.stringify(allCertTemplates[currentCertVersionId])));
    }

    function saveTemplatesToStorage() {
      try {
        localStorage.setItem(CERT_TEMPLATES_STORAGE_KEY, JSON.stringify(allCertTemplates));
      } catch (err) {
        showToast('Storage quota exceeded! Try using smaller image files.', 'fa-triangle-exclamation');
      }
    }

    function populateCertVersionDropdown() {
      const sel = document.getElementById('certVersionSelect');
      if (!sel) return;
      sel.innerHTML = '';

      Object.values(allCertTemplates).forEach(tpl => {
        const opt = document.createElement('option');
        opt.value = tpl.id;
        opt.textContent = tpl.isBuiltIn ? `★ ${tpl.name}` : `🎨 ${tpl.name} (Custom Version)`;
        if (tpl.id === currentCertVersionId) opt.selected = true;
        sel.appendChild(opt);
      });

      updateVersionStatusBadge();
    }

    function updateVersionStatusBadge() {
      const badge = document.getElementById('badgeCurrentVersionStatus');
      const delBtn = document.getElementById('btnDeleteCertVersion');
      const lblName = document.getElementById('lblPreviewTemplateName');

      if (lblName) lblName.textContent = currentCertTemplate.name;

      if (currentCertTemplate.isBuiltIn) {
        if (badge) {
          badge.textContent = 'Built-in Preset';
          badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black bg-move-navy-100 text-move-navy-800 border border-move-navy-200';
        }
        if (delBtn) delBtn.classList.add('hidden');
      } else {
        if (badge) {
          badge.textContent = 'Saved Custom Version';
          badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300';
        }
        if (delBtn) delBtn.classList.remove('hidden');
      }
    }

    function handleCertVersionChange(versionId) {
      if (!allCertTemplates[versionId]) return;
      currentCertVersionId = versionId;
      currentCertTemplate = normalizeTemplateFields(JSON.parse(JSON.stringify(allCertTemplates[versionId])));
      updateVersionStatusBadge();
      if (currentCertTemplate.docCategory) {
        updateCertDocumentTypeUi(currentCertTemplate.docCategory);
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();

      pushCertHistoryState(`Loaded version "${currentCertTemplate.name}"`);
      showToast(`Loaded version "${currentCertTemplate.name}"`, 'fa-layer-group');
    }

    let currentCertDocType = 'participation';

    function updateCertDocumentTypeUi(type) {
      currentCertDocType = type;
      ['participation', 'appreciation', 'appearance', 'new'].forEach(t => {
        const btn = document.getElementById(`btnDocType-${t}`);
        if (btn) {
          const isActive = (t === type);
          if (isActive) {
            btn.className = 'cert-doc-type-btn p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 bg-white/20 border-amber-400 ring-2 ring-amber-400/50 shadow-sm text-white scale-[1.01]';
          } else {
            btn.className = 'cert-doc-type-btn p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 bg-white/5 hover:bg-white/15 border-white/10 text-white';
          }
        }
      });

      const paperLbl = document.getElementById('certActivePaperSizeLabel');
      const paperBadge = document.getElementById('certActivePaperBadge');
      if (type === 'appearance') {
        if (paperLbl) paperLbl.innerHTML = 'A5 Landscape (210 &times; 148 mm)';
        if (paperBadge) paperBadge.className = 'self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 shadow-2xs';
      } else {
        if (paperLbl) paperLbl.innerHTML = 'A4 Landscape (297 &times; 210 mm)';
        if (paperBadge) paperBadge.className = 'self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-2xs';
      }

      const certTypeSel = document.getElementById('certTypeSelect');
      if (certTypeSel) certTypeSel.value = type;
    }

    function switchCertDocumentType(type) {
      if (type === 'appreciation') {
        if (typeof switchCertStudioMode === 'function') {
          switchCertStudioMode('appreciation');
        } else if (typeof switchNav === 'function') {
          switchNav('appreciation');
        }
        return;
      }
      if (type === 'appearance') {
        if (typeof switchCertStudioMode === 'function') {
          switchCertStudioMode('appearance');
        } else if (typeof switchNav === 'function') {
          switchNav('appearance');
        }
        return;
      }
      if (type === 'new') {
        openCreateNewCertModal();
        return;
      }

      if (typeof switchCertStudioMode === 'function') {
        switchCertStudioMode('participation');
      } else if (typeof switchNav === 'function') {
        switchNav('certificates');
      }
    }

    function openCreateNewCertModal() {
      const modal = document.getElementById('modalCreateNewCertificate');
      const inp = document.getElementById('inputCreateNewCertName');
      if (inp) inp.value = '';
      if (modal) modal.classList.remove('hidden');
    }

    function closeCreateNewCertModal() {
      const modal = document.getElementById('modalCreateNewCertificate');
      if (modal) modal.classList.add('hidden');
    }

    function handleNewCertTypeChange(cat) {
      const rA4 = document.getElementById('radioNewCertSizeA4');
      const rA5 = document.getElementById('radioNewCertSizeA5');
      if (cat === 'appearance') {
        if (rA5) rA5.checked = true;
      } else {
        if (rA4) rA4.checked = true;
      }
    }

    function handleConfirmCreateNewCert(e) {
      if (e && e.preventDefault) e.preventDefault();
      const inp = document.getElementById('inputCreateNewCertName');
      const name = (inp ? inp.value : '').trim();
      if (!name) return;

      const catEl = document.querySelector('input[name="newCertDocCategory"]:checked');
      const cat = catEl ? catEl.value : 'participation';

      const sizeEl = document.querySelector('input[name="newCertPaperSize"]:checked');
      const size = sizeEl ? sizeEl.value : (cat === 'appearance' ? 'A5 landscape' : 'A4 landscape');

      closeCreateNewCertModal();

      if (cat === 'appreciation') {
        switchNav('appreciation');
        setTimeout(() => {
          if (typeof getSavedApprecVersions === 'function') {
            const savedList = getSavedApprecVersions();
            const newId = 'ver_apprec_' + Date.now();
            const snap = JSON.parse(JSON.stringify(appreciationState));
            savedList.unshift({
              id: newId,
              name: name,
              createdAt: new Date().toISOString(),
              isBuiltIn: false,
              data: snap
            });
            if (typeof saveApprecVersionsList === 'function') saveApprecVersionsList(savedList);
            appreciationState.activeVersionId = newId;
            if (typeof populateAppreciationVersionsDropdown === 'function') populateAppreciationVersionsDropdown();
            showToast(`Created Appreciation Certificate template "${name}"!`, 'fa-plus');
          }
        }, 120);
        return;
      }

      if (cat === 'appearance') {
        switchNav('appearance');
        setTimeout(() => {
          if (typeof getSavedCaVersions === 'function' && typeof saveCaVersionsList === 'function') {
            const savedList = getSavedCaVersions();
            const newId = 'ver_ca_' + Date.now();
            const snap = JSON.parse(JSON.stringify(caState));
            savedList.unshift({
              id: newId,
              name: name,
              createdAt: new Date().toISOString(),
              isBuiltIn: false,
              data: snap
            });
            saveCaVersionsList(savedList);
            caState.activeVersionId = newId;
            if (typeof populateCaVersionsDropdown === 'function') populateCaVersionsDropdown();
            showToast(`Created Appearance Certificate template "${name}"!`, 'fa-plus');
          }
        }, 120);
        return;
      }

      // Default: Participation / Custom in Certificate Studio
      const baseSelect = document.getElementById('selectNewCertStartingBase');
      const baseMode = baseSelect ? baseSelect.value : 'clone_current';

      let baseTemplate = null;
      if (baseMode === 'clone_current') {
        baseTemplate = JSON.parse(JSON.stringify(currentCertTemplate));
      } else {
        baseTemplate = JSON.parse(JSON.stringify(DEFAULT_CERT_TEMPLATES['move_official_2026']));
      }

      const newId = 'custom_' + Date.now();
      baseTemplate.id = newId;
      baseTemplate.name = name;
      baseTemplate.docCategory = cat;
      baseTemplate.paperSize = size;
      baseTemplate.isBuiltIn = false;

      allCertTemplates[newId] = baseTemplate;
      currentCertVersionId = newId;
      currentCertTemplate = JSON.parse(JSON.stringify(baseTemplate));

      saveTemplatesToStorage();
      populateCertVersionDropdown();
      updateVersionStatusBadge();
      switchNav('certificates');
      showToast(`Created new certificate template "${name}"!`, 'fa-plus');
    }

    function saveCurrentCertTemplate() {
      persistActiveTemplateState();
      populateCertVersionDropdown();
      showToast(`Saved all changes to "${currentCertTemplate.name}"!`, 'fa-floppy-disk');
    }

    function openModalSaveAsNewTemplate() {
      const modal = document.getElementById('modalSaveCertVersion');
      const inp = document.getElementById('inputNewVersionName');
      if (inp) inp.value = `${currentCertTemplate.name} - Copy`;
      if (modal) modal.classList.remove('hidden');
    }

    function closeModalSaveAsNewTemplate() {
      const modal = document.getElementById('modalSaveCertVersion');
      if (modal) modal.classList.add('hidden');
    }

    function handleConfirmSaveAsNewTemplate(e) {
      e.preventDefault();
      const inp = document.getElementById('inputNewVersionName');
      const vName = (inp ? inp.value : '').trim();
      if (!vName) return;

      const newId = 'custom_' + Date.now();
      const newTpl = JSON.parse(JSON.stringify(currentCertTemplate));
      newTpl.id = newId;
      newTpl.name = vName;
      newTpl.isBuiltIn = false;

      allCertTemplates[newId] = newTpl;
      currentCertVersionId = newId;
      currentCertTemplate = JSON.parse(JSON.stringify(newTpl));

      saveTemplatesToStorage();
      populateCertVersionDropdown();
      closeModalSaveAsNewTemplate();
      updateVersionStatusBadge();
      renderCertificatePreview();

      pushCertHistoryState(`Saved as version "${vName}"`);
      showToast(`Created & saved new version "${vName}"!`, 'fa-circle-check');
    }

    function deleteCurrentCertTemplate() {
      if (currentCertTemplate.isBuiltIn) {
        showToast('Built-in presets cannot be deleted.', 'fa-circle-info');
        return;
      }
      const deletedName = currentCertTemplate.name;
      if (!confirm(`Delete custom certificate version "${deletedName}"?`)) return;

      delete allCertTemplates[currentCertVersionId];
      currentCertVersionId = 'move_official_2026';
      currentCertTemplate = normalizeTemplateFields(JSON.parse(JSON.stringify(allCertTemplates[currentCertVersionId])));
      saveTemplatesToStorage();
      populateCertVersionDropdown();
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();

      pushCertHistoryState('Deleted custom version');
      showToast('Version deleted. Reverted to Official MOVE Standard.', 'fa-trash-can');
    }

    function resetCurrentCertTemplate() {
      if (!confirm('Reset current template back to default layout and positions?')) return;
      const baseId = DEFAULT_CERT_TEMPLATES[currentCertVersionId] ? currentCertVersionId : 'move_official_2026';
      const defaultCopy = JSON.parse(JSON.stringify(DEFAULT_CERT_TEMPLATES[baseId]));
      defaultCopy.id = currentCertVersionId;
      defaultCopy.name = currentCertTemplate.name;
      defaultCopy.isBuiltIn = currentCertTemplate.isBuiltIn;

      currentCertTemplate = normalizeTemplateFields(defaultCopy);
      allCertTemplates[currentCertVersionId] = JSON.parse(JSON.stringify(currentCertTemplate));
      saveTemplatesToStorage();
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Reset to default layout');
      showToast('Template layout reset to default.', 'fa-rotate-left');
    }

    // --- TOGGLE DESIGNER / EDIT MODE ---
    function toggleCertEditMode() {
      isCertEditMode = !isCertEditMode;
      const panel = document.getElementById('certDesignerPanel');
      const btn = document.getElementById('btnToggleCertEdit');
      const lbl = document.getElementById('lblCertEditMode');
      const icon = document.getElementById('iconCertEditBtn');
      const frame = document.getElementById('certificateFrame');

      if (isCertEditMode) {
        if (panel) panel.classList.remove('hidden');
        if (frame) frame.classList.add('cert-edit-active');
        if (btn) {
          btn.className = 'px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition bg-move-navy-900 hover:bg-move-navy-950 text-white shadow-sm border border-move-orange-400';
        }
        if (lbl) lbl.textContent = 'Exit Designer Mode';
        if (icon) icon.className = 'fa-solid fa-check text-emerald-400';

        syncDesignerInputsFromTemplate();
        updateUndoRedoButtons();
        showToast('Edit Mode Active: Click any text to edit inline, or click × on badges/signatures to remove!', 'fa-pen');
      } else {
        if (panel) panel.classList.add('hidden');
        if (frame) frame.classList.remove('cert-edit-active');
        if (btn) {
          btn.className = 'px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition bg-move-orange-500 hover:bg-move-orange-600 text-white shadow-sm';
        }
        if (lbl) lbl.textContent = 'Enable Designer / Edit Mode';
        if (icon) icon.className = 'fa-solid fa-pen-ruler';
      }

      renderCertificatePreview();
    }

    function switchDesignerTab(tabKey) {
      const tabs = ['move', 'images', 'text', 'signatories', 'style'];
      tabs.forEach(t => {
        const btn = document.getElementById('tabBtn-' + t);
        const pane = document.getElementById('paneDesigner-' + t);
        if (btn) {
          if (t === tabKey) btn.classList.add('active');
          else btn.classList.remove('active');
        }
        if (pane) {
          if (t === tabKey) pane.classList.remove('hidden');
          else pane.classList.add('hidden');
        }
      });
    }

    // --- 1-CLICK ON-CANVAS ELEMENT REMOVAL ---
    function quickRemoveCertElement(e, elementKey) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      let desc = '';
      if (elementKey === 'goldSeal') {
        currentCertTemplate.header.goldSeal = false;
        desc = 'Removed Gold Seal';
      } else if (elementKey === 'cornerOrnament') {
        currentCertTemplate.theme.cornerOrnament = 'none';
        desc = 'Removed Corner Emblems';
      } else if (elementKey === 'wholeBorder') {
        currentCertTemplate.theme.borderPreset = 'none';
        currentCertTemplate.theme.borderStyle = 'none';
        desc = 'Removed Whole Certificate Border';
      } else if (elementKey === 'qrSerial') {
        currentCertTemplate.signatories.showQrSerial = false;
        desc = 'Removed QR & Serial No.';
      } else if (elementKey === 'sig1') {
        currentCertTemplate.signatories.sig1Enabled = false;
        desc = 'Removed Signatory 1';
      } else if (elementKey === 'sig2') {
        currentCertTemplate.signatories.sig2Enabled = false;
        desc = 'Removed Signatory 2';
      } else if (elementKey === 'sig3') {
        currentCertTemplate.signatories.sig3Enabled = false;
        desc = 'Removed Signatory 3';
      } else if (elementKey === 'sig1Img') {
        currentCertTemplate.signatories.sig1SignatureImage = '';
        desc = 'Removed Signatory 1 PNG';
      } else if (elementKey === 'sig2Img') {
        currentCertTemplate.signatories.sig2SignatureImage = '';
        desc = 'Removed Signatory 2 PNG';
      } else if (elementKey === 'sig3Img') {
        currentCertTemplate.signatories.sig3SignatureImage = '';
        desc = 'Removed Signatory 3 PNG';
      } else if (elementKey === 'leftLogo') {
        currentCertTemplate.header.showLeftLogo = false;
        desc = 'Removed Left Logo';
      } else if (elementKey === 'rightLogo') {
        currentCertTemplate.header.showRightLogo = false;
        desc = 'Removed Right Logo';
      } else if (elementKey === 'eventLogo') {
        currentCertTemplate.header.showEventLogo = false;
        desc = 'Removed Men in the Kitchen 2 Logo';
      } else if (elementKey === 'watermark') {
        currentCertTemplate.header.watermarkEnabled = false;
        desc = 'Removed Center Watermark';
      }

      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(desc);
      showToast(`${desc} (Press Ctrl+Z to undo)`, 'fa-trash-can');
    }

    function toggleQuickCornerOrnament() {
      if (currentCertTemplate.theme.cornerOrnament && currentCertTemplate.theme.cornerOrnament !== 'none') {
        currentCertTemplate.theme.cornerOrnament = 'none';
        pushCertHistoryState('Removed Corner Emblems');
        showToast('Corner emblems removed', 'fa-eye-slash');
      } else {
        currentCertTemplate.theme.cornerOrnament = 'certificate';
        pushCertHistoryState('Restored Corner Emblems');
        showToast('Corner emblems enabled', 'fa-certificate');
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
    }

    function toggleLogoVisibility(side, isVisible) {
      if (side === 'left') {
        currentCertTemplate.header.showLeftLogo = isVisible;
        pushCertHistoryState(isVisible ? 'Shown Left Logo' : 'Hidden Left Logo');
      } else {
        currentCertTemplate.header.showRightLogo = isVisible;
        pushCertHistoryState(isVisible ? 'Shown Right Logo' : 'Hidden Right Logo');
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
    }

    function toggleEventLogoEnabled(isVisible) {
      currentCertTemplate.header.showEventLogo = !!isVisible;
      if (!currentCertTemplate.header.eventLogo) {
        currentCertTemplate.header.eventLogo = 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png';
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(isVisible ? 'Enabled Men in the Kitchen 2 Logo' : 'Removed Men in the Kitchen 2 Logo');
      showToast(isVisible ? 'Men in the Kitchen 2 logo added to certificate!' : 'Event logo removed', 'fa-utensils');
    }

    // --- INLINE EDITING ENGINE (CLICK & TYPE DIRECTLY ON CANVAS) ---
    function initCertInlineEditListeners() {
      const frame = document.getElementById('certificateFrame');
      if (!frame) return;

      let beforeFocusText = '';

      frame.addEventListener('focusin', (e) => {
        const target = e.target.closest('.cert-inline-editable');
        if (!target) return;
        beforeFocusText = target.innerText.trim();
      });

      frame.addEventListener('input', (e) => {
        const target = e.target.closest('.cert-inline-editable');
        if (!target) return;
        const fieldKey = target.getAttribute('data-cert-field');
        if (!fieldKey) return;

        let updatedVal = target.innerText.trim();
        if (fieldKey === 'citation.customEventTitle') {
          updatedVal = updatedVal.replace(/^["“”]+|["“”]+$/g, '').trim();
        }
        setTemplateField(fieldKey, updatedVal);
        syncSingleDesignerInput(fieldKey, updatedVal);
        persistActiveTemplateState();
      });

      frame.addEventListener('focusout', (e) => {
        const target = e.target.closest('.cert-inline-editable');
        if (!target) return;
        const fieldKey = target.getAttribute('data-cert-field');
        if (!fieldKey) return;

        let afterEditText = target.innerText.trim();
        if (fieldKey === 'citation.customEventTitle') {
          afterEditText = afterEditText.replace(/^["“”]+|["“”]+$/g, '').trim();
        }
        if (afterEditText !== beforeFocusText) {
          setTemplateField(fieldKey, afterEditText);
          syncSingleDesignerInput(fieldKey, afterEditText);
          pushCertHistoryState(`Edited ${fieldKey.split('.').pop()}`);
        }
      });

      frame.addEventListener('keydown', (e) => {
        const target = e.target.closest('.cert-inline-editable');
        if (!target) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          const fieldKey = target.getAttribute('data-cert-field');
          if (fieldKey !== 'citation.detailTemplate') {
            e.preventDefault();
            target.blur();
          }
        } else if (e.key === 'Escape') {
          target.blur();
        }
      });
    }

    function setTemplateField(path, value) {
      const parts = path.split('.');
      let obj = currentCertTemplate;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      persistActiveTemplateState();
    }

    function syncSingleDesignerInput(path, value) {
      const map = {
        'title.customTitle': ['inputCertTitle'],
        'title.introText': ['inputAwardIntro'],
        'citation.leadText': ['inputCitationLead'],
        'citation.customEventTitle': ['inputCitationEventTitle'],
        'citation.detailTemplate': ['inputCitationDetails'],
        'signatories.sig1Name': ['inputSig1Name', 'quickTopSig1Name'],
        'signatories.sig1Title': ['inputSig1Title', 'quickTopSig1Title'],
        'signatories.sig1Office': ['inputSig1Office'],
        'signatories.sig2Name': ['inputSig2Name', 'quickTopSig2Name'],
        'signatories.sig2Title': ['inputSig2Title', 'quickTopSig2Title'],
        'signatories.sig2Office': ['inputSig2Office'],
        'signatories.sig3Name': ['inputSig3Name'],
        'signatories.sig3Title': ['inputSig3Title'],
        'signatories.sig3Office': ['inputSig3Office']
      };
      const ids = map[path] || [];
      ids.forEach(inputId => {
        const el = document.getElementById(inputId);
        if (el && el !== document.activeElement) el.value = value;
      });
    }

    function handleQuickTopSigInput(sigNum, field, val) {
      const s = currentCertTemplate.signatories;
      if (sigNum === 1) {
        if (field === 'name') {
          s.sig1Name = val;
          const el = document.getElementById('inputSig1Name');
          if (el) el.value = val;
        } else if (field === 'title') {
          s.sig1Title = val;
          const el = document.getElementById('inputSig1Title');
          if (el) el.value = val;
        }
      } else if (sigNum === 2) {
        if (field === 'name') {
          s.sig2Name = val;
          const el = document.getElementById('inputSig2Name');
          if (el) el.value = val;
        } else if (field === 'title') {
          s.sig2Title = val;
          const el = document.getElementById('inputSig2Title');
          if (el) el.value = val;
        }
      } else if (sigNum === 3) {
        if (field === 'name') {
          s.sig3Name = val;
          const el = document.getElementById('inputSig3Name');
          if (el) el.value = val;
        } else if (field === 'title') {
          s.sig3Title = val;
          const el = document.getElementById('inputSig3Title');
          if (el) el.value = val;
        }
      }
      renderCertificatePreview();
      scheduleTextHistoryPush(`Edited Signatory ${sigNum} ${field}`);
    }

    function handleSigFontSizeChange(val) {
      const sz = Math.max(8, Math.min(24, parseInt(val) || 13));
      currentCertTemplate.signatories.fontSize = sz;
      const lbl = document.getElementById('lblSigFontSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderSigFontSize');
      if (sld) sld.value = sz;
      const topLbl = document.getElementById('lblTopSigFontSize');
      if (topLbl) topLbl.textContent = sz + 'px';
      const topSld = document.getElementById('topSliderSigFontSize');
      if (topSld) topSld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized signatory text');
    }

    function stepSigFontSize(delta) {
      const cur = parseInt(currentCertTemplate.signatories.fontSize) || 13;
      handleSigFontSizeChange(cur + delta);
    }

    function handleSigTitleFontSizeChange(val) {
      const sz = Math.max(7, Math.min(18, parseInt(val) || 10));
      currentCertTemplate.signatories.titleFontSize = sz;
      const lbl = document.getElementById('lblSigTitleFontSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderSigTitleFontSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized signatory title');
    }

    function handleSigLineWidthChange(val) {
      const w = Math.max(120, Math.min(360, parseInt(val) || 210));
      currentCertTemplate.signatories.lineWidth = w;
      const lbl = document.getElementById('lblSigLineWidth');
      if (lbl) lbl.textContent = w + 'px';
      const sld = document.getElementById('sliderSigLineWidth');
      if (sld) sld.value = w;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized signature line width');
    }

    function handleAllSigImgWidthChange(val) {
      const w = Math.max(30, Math.min(360, parseInt(val) || 150));
      currentCertTemplate.signatories.sigImageWidth = w;
      currentCertTemplate.signatories.sig1ImageWidth = w;
      currentCertTemplate.signatories.sig2ImageWidth = w;
      currentCertTemplate.signatories.sig3ImageWidth = w;

      const lbl = document.getElementById('lblSigImgWidth');
      if (lbl) lbl.textContent = w + 'px';
      const sld = document.getElementById('sliderSigImgWidth');
      if (sld) sld.value = w;

      const topLbl = document.getElementById('lblTopSigImgWidth');
      if (topLbl) topLbl.textContent = w + 'px';
      const topSld = document.getElementById('topSliderSigImgWidth');
      if (topSld) topSld.value = w;

      [1, 2, 3].forEach(n => {
        const s = document.getElementById(`sliderSig${n}ImgWidth`);
        if (s) s.value = w;
        const l = document.getElementById(`lblSig${n}ImgWidth`);
        if (l) l.textContent = w + 'px';
      });

      renderCertificatePreview();
      scheduleTextHistoryPush('Resized signature PNG width');
    }

    function handleAllSigImgHeightChange(val) {
      const h = Math.max(20, Math.min(160, parseInt(val) || 56));
      currentCertTemplate.signatories.sigImageHeight = h;
      currentCertTemplate.signatories.sigImageSize = h;
      currentCertTemplate.signatories.sig1ImageHeight = h;
      currentCertTemplate.signatories.sig2ImageHeight = h;
      currentCertTemplate.signatories.sig3ImageHeight = h;
      currentCertTemplate.signatories.sig1ImageSize = h;
      currentCertTemplate.signatories.sig2ImageSize = h;
      currentCertTemplate.signatories.sig3ImageSize = h;

      const lbl = document.getElementById('lblSigImgHeight');
      if (lbl) lbl.textContent = h + 'px';
      const sld = document.getElementById('sliderSigImgHeight');
      if (sld) sld.value = h;

      const topLbl = document.getElementById('lblTopSigImgHeight');
      if (topLbl) topLbl.textContent = h + 'px';
      const topSld = document.getElementById('topSliderSigImgHeight');
      if (topSld) topSld.value = h;

      // Old element fallback
      const oldLbl = document.getElementById('lblSigImgSize');
      if (oldLbl) oldLbl.textContent = h + 'px';
      const oldSld = document.getElementById('sliderSigImgSize');
      if (oldSld) oldSld.value = h;
      const oldTopLbl = document.getElementById('lblTopSigImgSize');
      if (oldTopLbl) oldTopLbl.textContent = h + 'px';
      const oldTopSld = document.getElementById('topSliderSigImgSize');
      if (oldTopSld) oldTopSld.value = h;

      [1, 2, 3].forEach(n => {
        const s = document.getElementById(`sliderSig${n}ImgHeight`);
        if (s) s.value = h;
        const l = document.getElementById(`lblSig${n}ImgHeight`);
        if (l) l.textContent = h + 'px';

        const sOld = document.getElementById(`sliderSig${n}ImgSize`);
        if (sOld) sOld.value = h;
        const lOld = document.getElementById(`lblSig${n}ImgSize`);
        if (lOld) lOld.textContent = h + 'px';
      });

      renderCertificatePreview();
      scheduleTextHistoryPush('Resized signature PNG height');
    }

    // Backward-compatible alias
    function handleAllSigImgSizeChange(val) {
      handleAllSigImgHeightChange(val);
    }

    function handleSingleSigImgWidthChange(sigNum, val) {
      const w = Math.max(30, Math.min(360, parseInt(val) || 150));
      currentCertTemplate.signatories[`sig${sigNum}ImageWidth`] = w;
      const lbl = document.getElementById(`lblSig${sigNum}ImgWidth`);
      if (lbl) lbl.textContent = w + 'px';
      renderCertificatePreview();
      scheduleTextHistoryPush(`Resized Sig ${sigNum} PNG width`);
    }

    function handleSingleSigImgHeightChange(sigNum, val) {
      const h = Math.max(20, Math.min(160, parseInt(val) || 56));
      currentCertTemplate.signatories[`sig${sigNum}ImageHeight`] = h;
      currentCertTemplate.signatories[`sig${sigNum}ImageSize`] = h;
      const lbl = document.getElementById(`lblSig${sigNum}ImgHeight`);
      if (lbl) lbl.textContent = h + 'px';
      const lblOld = document.getElementById(`lblSig${sigNum}ImgSize`);
      if (lblOld) lblOld.textContent = h + 'px';
      renderCertificatePreview();
      scheduleTextHistoryPush(`Resized Sig ${sigNum} PNG height`);
    }

    // Backward-compatible alias
    function handleSingleSigImgSizeChange(sigNum, val) {
      handleSingleSigImgHeightChange(sigNum, val);
    }

    function handleSigFitModeChange(mode) {
      const fit = (mode === 'contain') ? 'contain' : 'fill';
      currentCertTemplate.signatories.sigFitMode = fit;

      const btnFill = document.getElementById('btnSigFitFill');
      const btnContain = document.getElementById('btnSigFitContain');
      if (btnFill && btnContain) {
        if (fit === 'fill') {
          btnFill.className = 'px-2 py-0.5 rounded transition bg-move-navy-900 text-white';
          btnContain.className = 'px-2 py-0.5 rounded transition text-slate-600 hover:text-move-navy-900';
        } else {
          btnContain.className = 'px-2 py-0.5 rounded transition bg-move-navy-900 text-white';
          btnFill.className = 'px-2 py-0.5 rounded transition text-slate-600 hover:text-move-navy-900';
        }
      }

      renderCertificatePreview();
      scheduleTextHistoryPush(`Changed signature fit mode to ${fit}`);
    }

    function useBuiltInSignatureImage(sigSlot) {
      const defaultSigUrl = 'signature%20(15).png';
      if (sigSlot === 'sig1' || sigSlot === 1) {
        currentCertTemplate.signatories.sig1Enabled = true;
        currentCertTemplate.signatories.sig1SignatureImage = defaultSigUrl;
      } else if (sigSlot === 'sig2' || sigSlot === 2) {
        currentCertTemplate.signatories.sig2Enabled = true;
        currentCertTemplate.signatories.sig2SignatureImage = defaultSigUrl;
      } else if (sigSlot === 'sig3' || sigSlot === 3) {
        currentCertTemplate.signatories.sig3Enabled = true;
        currentCertTemplate.signatories.sig3SignatureImage = defaultSigUrl;
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(`Attached E-Signature PNG (${sigSlot})`);
      showToast('Attached official E-Signature PNG! Use the PNG Size slider to resize.', 'fa-signature');
    }

    // --- DRAG & DROP REPOSITIONING LISTENERS ---
    function initCertDragListeners() {
      const frame = document.getElementById('certificateFrame');
      if (!frame) return;

      frame.addEventListener('mousedown', (e) => {
        if (!isCertEditMode) return;

        // If clicking remove badge or editable text, do not start drag
        if (e.target.closest('.cert-remove-badge') || e.target.closest('.cert-inline-editable')) {
          return;
        }

        const targetEl = e.target.closest('[data-cert-element]');
        if (!targetEl) return;

        activeDragElementKey = targetEl.getAttribute('data-cert-element');
        isDraggingCertElement = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        if (activeDragElementKey.startsWith('photo_')) {
          const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeDragElementKey);
          dragElemInitX = photo ? (photo.x || 0) : 0;
          dragElemInitY = photo ? (photo.y || 0) : 0;
        } else {
          if (!currentCertTemplate.offsets[activeDragElementKey]) {
            currentCertTemplate.offsets[activeDragElementKey] = { x: 0, y: 0 };
          }
          dragElemInitX = currentCertTemplate.offsets[activeDragElementKey].x || 0;
          dragElemInitY = currentCertTemplate.offsets[activeDragElementKey].y || 0;
        }

        frame.querySelectorAll('[data-cert-element]').forEach(el => el.classList.remove('is-selected-element'));
        targetEl.classList.add('is-selected-element', 'is-dragging');

        activeMoveElementKey = activeDragElementKey;
        const sel = document.getElementById('moveElementTargetSelect');
        if (sel) sel.value = activeDragElementKey;
        updateOffsetLabels();

        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingCertElement || !activeDragElementKey || !isCertEditMode) return;
        const dx = Math.round(e.clientX - dragStartX);
        const dy = Math.round(e.clientY - dragStartY);

        if (activeDragElementKey.startsWith('photo_')) {
          const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeDragElementKey);
          if (photo) {
            photo.x = dragElemInitX + dx;
            photo.y = dragElemInitY + dy;
            const targetEl = frame.querySelector(`[data-cert-element="${activeDragElementKey}"]`);
            if (targetEl) {
              targetEl.style.transform = `translate(${photo.x}px, ${photo.y}px)`;
            }
          }
        } else {
          currentCertTemplate.offsets[activeDragElementKey].x = dragElemInitX + dx;
          currentCertTemplate.offsets[activeDragElementKey].y = dragElemInitY + dy;

          const targetEl = frame.querySelector(`[data-cert-element="${activeDragElementKey}"]`);
          if (targetEl) {
            targetEl.style.transform = `translate(${currentCertTemplate.offsets[activeDragElementKey].x}px, ${currentCertTemplate.offsets[activeDragElementKey].y}px)`;
          }
        }
        updateOffsetLabels();
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingCertElement && activeDragElementKey) {
          const targetEl = frame.querySelector(`[data-cert-element="${activeDragElementKey}"]`);
          if (targetEl) targetEl.classList.remove('is-dragging');

          let finalX = 0, finalY = 0;
          if (activeDragElementKey.startsWith('photo_')) {
            const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeDragElementKey);
            finalX = photo ? (photo.x || 0) : 0;
            finalY = photo ? (photo.y || 0) : 0;
          } else {
            finalX = currentCertTemplate.offsets[activeDragElementKey].x;
            finalY = currentCertTemplate.offsets[activeDragElementKey].y;
          }

          if (finalX !== dragElemInitX || finalY !== dragElemInitY) {
            pushCertHistoryState(`Moved ${activeDragElementKey}`);
          }

          isDraggingCertElement = false;
        }
      });
    }

    function handleMoveElementTargetChange(key) {
      activeMoveElementKey = key;
      updateOffsetLabels();

      const frame = document.getElementById('certificateFrame');
      if (frame) {
        frame.querySelectorAll('[data-cert-element]').forEach(el => el.classList.remove('is-selected-element'));
        const el = frame.querySelector(`[data-cert-element="${key}"]`);
        if (el) el.classList.add('is-selected-element');
      }
    }

    function updateOffsetLabels() {
      // Keep select populated with photos
      const sel = document.getElementById('moveElementTargetSelect');
      if (sel && currentCertTemplate.insertedPhotos && currentCertTemplate.insertedPhotos.length > 0) {
        currentCertTemplate.insertedPhotos.forEach(p => {
          if (!sel.querySelector(`option[value="${p.id}"]`)) {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `🖼️ [Photo] ${p.name}`;
            sel.appendChild(opt);
          }
        });
      }

      let curX = 0, curY = 0;
      if (activeMoveElementKey && activeMoveElementKey.startsWith('photo_')) {
        const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeMoveElementKey);
        if (photo) {
          curX = photo.x || 0;
          curY = photo.y || 0;
        }
      } else {
        const offsets = (currentCertTemplate.offsets && currentCertTemplate.offsets[activeMoveElementKey]) || { x: 0, y: 0 };
        curX = offsets.x || 0;
        curY = offsets.y || 0;
      }

      const lbl = document.getElementById('lblActiveElementOffset');
      const ix = document.getElementById('inputOffsetX');
      const iy = document.getElementById('inputOffsetY');

      if (lbl) lbl.textContent = `${curX}, ${curY}`;
      if (ix && ix !== document.activeElement) ix.value = curX;
      if (iy && iy !== document.activeElement) iy.value = curY;
    }

    function nudgeActiveElement(dx, dy) {
      if (activeMoveElementKey && activeMoveElementKey.startsWith('photo_')) {
        const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeMoveElementKey);
        if (photo) {
          photo.x = (photo.x || 0) + dx;
          photo.y = (photo.y || 0) + dy;
          renderCertificatePreview();
          updateOffsetLabels();
          pushCertHistoryState(`Nudged ${photo.name}`);
        }
        return;
      }
      if (!currentCertTemplate.offsets[activeMoveElementKey]) {
        currentCertTemplate.offsets[activeMoveElementKey] = { x: 0, y: 0 };
      }
      currentCertTemplate.offsets[activeMoveElementKey].x += dx;
      currentCertTemplate.offsets[activeMoveElementKey].y += dy;
      renderCertificatePreview();
      updateOffsetLabels();
      pushCertHistoryState(`Nudged ${activeMoveElementKey}`);
    }

    function syncOffsetFromInputs() {
      const ix = parseInt(document.getElementById('inputOffsetX').value) || 0;
      const iy = parseInt(document.getElementById('inputOffsetY').value) || 0;
      if (activeMoveElementKey && activeMoveElementKey.startsWith('photo_')) {
        const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeMoveElementKey);
        if (photo) {
          photo.x = ix;
          photo.y = iy;
          renderCertificatePreview();
          updateOffsetLabels();
          pushCertHistoryState(`Positioned ${photo.name}`);
        }
        return;
      }
      if (!currentCertTemplate.offsets[activeMoveElementKey]) {
        currentCertTemplate.offsets[activeMoveElementKey] = { x: 0, y: 0 };
      }
      currentCertTemplate.offsets[activeMoveElementKey].x = ix;
      currentCertTemplate.offsets[activeMoveElementKey].y = iy;
      renderCertificatePreview();
      updateOffsetLabels();
      pushCertHistoryState(`Positioned ${activeMoveElementKey}`);
    }

    function resetActiveElementPosition() {
      if (activeMoveElementKey && activeMoveElementKey.startsWith('photo_')) {
        const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === activeMoveElementKey);
        if (photo) {
          photo.x = 0;
          photo.y = 0;
          renderCertificatePreview();
          updateOffsetLabels();
          pushCertHistoryState(`Reset ${photo.name} position`);
          showToast(`Reset photo position to (0,0)`, 'fa-arrows-to-dot');
        }
        return;
      }
      if (!currentCertTemplate.offsets[activeMoveElementKey]) return;
      currentCertTemplate.offsets[activeMoveElementKey] = { x: 0, y: 0 };
      renderCertificatePreview();
      updateOffsetLabels();
      pushCertHistoryState(`Reset ${activeMoveElementKey} position`);
      showToast(`Reset ${activeMoveElementKey} position to (0,0)`, 'fa-arrows-to-dot');
    }

    function resetAllElementPositions() {
      if (currentCertTemplate.offsets) {
        Object.keys(currentCertTemplate.offsets).forEach(k => {
          currentCertTemplate.offsets[k] = { x: 0, y: 0 };
        });
      }
      if (currentCertTemplate.insertedPhotos) {
        currentCertTemplate.insertedPhotos.forEach(p => {
          p.x = 0;
          p.y = 0;
        });
      }
      renderCertificatePreview();
      updateOffsetLabels();
      pushCertHistoryState('Reset all positions');
      showToast('All element positions reset to (0,0)!', 'fa-rotate-left');
    }

    // --- ALL-OBJECT CANVAS ALIGNMENT ENGINE (FOR TEXT, LOGOS, PHOTOS & SEALS) ---
    function alignCertObject(alignType) {
      const key = activeMoveElementKey || 'title';

      if (key.startsWith('photo_')) {
        const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === key);
        if (photo) {
          if (alignType === 'left') photo.x = -240;
          else if (alignType === 'center') photo.x = 0;
          else if (alignType === 'right') photo.x = 240;
          else if (alignType === 'top') photo.y = -180;
          else if (alignType === 'middle') photo.y = 0;
          else if (alignType === 'bottom') photo.y = 160;
          renderCertificatePreview();
          updateOffsetLabels();
          pushCertHistoryState(`Aligned photo to ${alignType}`);
          showToast(`Aligned photo to ${alignType}`, 'fa-crosshairs');
          return;
        }
      }

      if (!currentCertTemplate.offsets) currentCertTemplate.offsets = {};
      if (!currentCertTemplate.offsets[key]) currentCertTemplate.offsets[key] = { x: 0, y: 0 };
      const off = currentCertTemplate.offsets[key];

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

      renderCertificatePreview();
      updateOffsetLabels();
      pushCertHistoryState(`Aligned ${key} to ${alignType}`);
      showToast(`Aligned "${key}" to ${alignType}`, 'fa-crosshairs');
    }

    // --- INSERT CUSTOM PHOTO / BADGE ENGINE ---
    function openCertPhotoUpload() {
      const inp = document.getElementById('certInsertPhotoInput');
      if (inp) inp.click();
    }

    function handleCertPhotoUpload(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        const photoId = 'photo_' + Date.now();
        const photoName = (file.name.replace(/\.[^/.]+$/, '') || 'Photo').slice(0, 20);

        if (!currentCertTemplate.insertedPhotos) currentCertTemplate.insertedPhotos = [];
        currentCertTemplate.insertedPhotos.push({
          id: photoId,
          name: photoName,
          src: dataUrl,
          width: 110,
          height: 110,
          shape: 'gold_frame',
          x: 0,
          y: 0
        });

        activeMoveElementKey = photoId;
        renderCertificatePreview();
        updateOffsetLabels();
        pushCertHistoryState(`Inserted ${photoName}`);
        showToast(`Inserted "${photoName}"! Drag it anywhere or use Alignment buttons.`, 'fa-image');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }

    function removeCertPhoto(photoId) {
      if (!currentCertTemplate.insertedPhotos) return;
      const idx = currentCertTemplate.insertedPhotos.findIndex(p => p.id === photoId);
      if (idx !== -1) {
        const name = currentCertTemplate.insertedPhotos[idx].name;
        currentCertTemplate.insertedPhotos.splice(idx, 1);
        activeMoveElementKey = 'title';
        renderCertificatePreview();
        updateOffsetLabels();
        pushCertHistoryState(`Removed ${name}`);
        showToast(`Removed "${name}" from certificate`, 'fa-trash');
      }
    }

    function setCertPhotoShape(shape) {
      const key = activeMoveElementKey;
      if (!key || !key.startsWith('photo_')) return;
      const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === key);
      if (photo) {
        photo.shape = shape;
        renderCertificatePreview();
        pushCertHistoryState(`Changed photo shape to ${shape}`);
        showToast(`Photo shape set to ${shape}`, 'fa-shapes');
      }
    }

    function setCertPhotoSize(size) {
      const val = parseInt(size, 10);
      if (isNaN(val)) return;
      const key = activeMoveElementKey;
      if (!key || !key.startsWith('photo_')) return;
      const photo = (currentCertTemplate.insertedPhotos || []).find(p => p.id === key);
      if (photo) {
        photo.width = val;
        photo.height = val;
        renderCertificatePreview();
        pushCertHistoryState(`Changed photo size to ${val}px`);
      }
    }

    // --- IMAGE UPLOAD & ATTACHMENT HANDLERS ---
    function handleImageUpload(event, slot) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const dataUrl = e.target.result;
        if (slot === 'leftLogo') {
          currentCertTemplate.header.showLeftLogo = true;
          currentCertTemplate.header.leftLogo = dataUrl;
          const th = document.getElementById('thumbLeftLogo');
          if (th) th.src = dataUrl;
        } else if (slot === 'rightLogo') {
          currentCertTemplate.header.showRightLogo = true;
          currentCertTemplate.header.rightLogo = dataUrl;
          const th = document.getElementById('thumbRightLogo');
          if (th) th.src = dataUrl;
        } else if (slot === 'eventLogo') {
          currentCertTemplate.header.showEventLogo = true;
          currentCertTemplate.header.eventLogo = dataUrl;
          const th = document.getElementById('thumbEventLogo');
          if (th) th.src = dataUrl;
        } else if (slot === 'watermark') {
          currentCertTemplate.header.watermarkLogo = dataUrl;
          currentCertTemplate.header.watermarkEnabled = true;
          const chk = document.getElementById('chkEnableWatermark');
          if (chk) chk.checked = true;
          const th = document.getElementById('thumbWatermark');
          if (th) th.src = dataUrl;
        } else if (slot === 'sig1') {
          currentCertTemplate.signatories.sig1Enabled = true;
          currentCertTemplate.signatories.sig1SignatureImage = dataUrl;
        } else if (slot === 'sig2') {
          currentCertTemplate.signatories.sig2Enabled = true;
          currentCertTemplate.signatories.sig2SignatureImage = dataUrl;
        } else if (slot === 'sig3') {
          currentCertTemplate.signatories.sig3Enabled = true;
          currentCertTemplate.signatories.sig3SignatureImage = dataUrl;
        }
        // Reset file input value so the same file can be re-selected anytime
        event.target.value = '';
        syncDesignerInputsFromTemplate();
        renderCertificatePreview();
        pushCertHistoryState(`Attached image (${slot})`);
        showToast('Custom image attached to certificate!', 'fa-image');
      };
      reader.readAsDataURL(file);
    }

    function resetImageSlot(slot) {
      if (slot === 'leftLogo') {
        currentCertTemplate.header.showLeftLogo = true;
        currentCertTemplate.header.leftLogo = 'CITY%20HALL%20LOGO.png';
        currentCertTemplate.header.leftLogoWidth = 76;
        const th = document.getElementById('thumbLeftLogo');
        if (th) th.src = 'CITY%20HALL%20LOGO.png';
      } else if (slot === 'rightLogo') {
        currentCertTemplate.header.showRightLogo = true;
        currentCertTemplate.header.rightLogo = 'MOVE%20BAGUIO%20LOGO.png';
        currentCertTemplate.header.rightLogoWidth = 76;
        const th = document.getElementById('thumbRightLogo');
        if (th) th.src = 'MOVE%20BAGUIO%20LOGO.png';
      } else if (slot === 'eventLogo') {
        currentCertTemplate.header.showEventLogo = true;
        currentCertTemplate.header.eventLogo = 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png';
        currentCertTemplate.header.eventLogoWidth = 84;
        const th = document.getElementById('thumbEventLogo');
        if (th) th.src = 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png';
      } else if (slot === 'watermark') {
        currentCertTemplate.header.watermarkLogo = 'MOVE%20BAGUIO%20LOGO.png';
        currentCertTemplate.header.watermarkOpacity = 12;
        currentCertTemplate.header.watermarkSize = 300;
        currentCertTemplate.header.watermarkLayer = 'behind';
        const th = document.getElementById('thumbWatermark');
        if (th) th.src = 'MOVE%20BAGUIO%20LOGO.png';
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(`Reset ${slot}`);
      showToast('Logo reset to official default.', 'fa-rotate-left');
    }

    function handleImageSizeChange(slot, val) {
      const px = parseInt(val) || 76;
      if (slot === 'leftLogo') currentCertTemplate.header.leftLogoWidth = px;
      if (slot === 'rightLogo') currentCertTemplate.header.rightLogoWidth = px;
      if (slot === 'eventLogo') currentCertTemplate.header.eventLogoWidth = px;
      renderCertificatePreview();
      scheduleTextHistoryPush(`Resized ${slot}`);
    }

    function toggleWatermarkEnabled(val) {
      currentCertTemplate.header.watermarkEnabled = !!val;
      if (val && !currentCertTemplate.header.watermarkLayer) {
        currentCertTemplate.header.watermarkLayer = 'behind';
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(val ? 'Enabled watermark' : 'Disabled watermark');
      showToast(val ? `Watermark enabled (${getWatermarkLayerLabel(currentCertTemplate.header.watermarkLayer)})` : 'Watermark hidden', 'fa-image');
    }

    function getWatermarkLayerLabel(layerKey) {
      const labels = {
        'behind': 'Behind Text',
        'infront': 'In Front of Text',
        'washout': 'Washout Behind Text',
        'inline-top': 'Top & Bottom (In Line)',
        'bottom-behind': 'Lower Center Behind Text'
      };
      return labels[layerKey] || 'Behind Text';
    }

    function handleWatermarkLayerChange(layerMode) {
      currentCertTemplate.header.watermarkLayer = layerMode || 'behind';
      currentCertTemplate.header.watermarkEnabled = true;
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(`Watermark wrap: ${getWatermarkLayerLabel(layerMode)}`);
      showToast(`Watermark layout set to: ${getWatermarkLayerLabel(layerMode)}`, 'fa-layer-group');
    }

    function setWatermarkPresetLogo(logoUrl) {
      currentCertTemplate.header.watermarkLogo = logoUrl;
      currentCertTemplate.header.watermarkEnabled = true;
      if (!currentCertTemplate.header.watermarkLayer) {
        currentCertTemplate.header.watermarkLayer = 'behind';
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Changed watermark preset image');
      showToast('Updated center watermark image!', 'fa-image');
    }

    function handleWatermarkOpacityChange(val) {
      const op = parseInt(val) || 12;
      currentCertTemplate.header.watermarkOpacity = op;
      const lbl = document.getElementById('lblWatermarkOpacity');
      if (lbl) lbl.textContent = op + '%';
      renderCertificatePreview();
      scheduleTextHistoryPush('Adjusted watermark opacity');
    }

    function handleWatermarkSizeChange(val) {
      const sz = parseInt(val) || 300;
      currentCertTemplate.header.watermarkSize = sz;
      const lbl = document.getElementById('lblWatermarkSize');
      if (lbl) lbl.textContent = sz + 'px';
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized watermark');
    }

    function removeSignatureImage(sigSlot) {
      if (sigSlot === 'sig1') currentCertTemplate.signatories.sig1SignatureImage = '';
      if (sigSlot === 'sig2') currentCertTemplate.signatories.sig2SignatureImage = '';
      if (sigSlot === 'sig3') currentCertTemplate.signatories.sig3SignatureImage = '';
      renderCertificatePreview();
      pushCertHistoryState(`Removed ${sigSlot} signature image`);
      showToast('Digital signature image removed.', 'fa-eraser');
    }

    function toggleGoldSealEnabled(val) {
      currentCertTemplate.header.goldSeal = !!val;
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(val ? 'Enabled gold seal' : 'Removed gold seal');
    }

    function handleGoldSealPosChange(val) {
      currentCertTemplate.header.goldSealPosition = val;
      renderCertificatePreview();
      pushCertHistoryState('Moved gold seal position');
    }

    // --- TEXT & TYPOGRAPHY HANDLERS ---
    function handleCertTitleInput(val) {
      currentCertTemplate.title.customTitle = val;
      renderCertificatePreview();
      scheduleTextHistoryPush('Edited certificate title');
    }

    function handleTitleFontChange(val) {
      currentCertTemplate.title.fontFamily = val;
      renderCertificatePreview();
      pushCertHistoryState('Changed title font');
    }

    function handleTitleSizeChange(val) {
      currentCertTemplate.title.fontSize = parseInt(val) || 28;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized certificate title');
    }

    function handleHeaderLineFontSizeChange(field, val) {
      if (!currentCertTemplate.header) currentCertTemplate.header = {};
      const sz = parseFloat(val) || 11;
      currentCertTemplate.header[field] = sz;
      const lbl1 = document.getElementById('lbl' + field.charAt(0).toUpperCase() + field.slice(1));
      if (lbl1) lbl1.textContent = sz + 'px';
      const shortMap = { republicFontSize: 'lblRepSize', cityFontSize: 'lblCitySize', chapterFontSize: 'lblChapSize', subFontSize: 'lblSubSize' };
      const lbl2 = document.getElementById(shortMap[field]);
      if (lbl2) lbl2.textContent = sz + 'px';
      const sldMap = { republicFontSize: 'sliderRepSize', cityFontSize: 'sliderCitySize', chapterFontSize: 'sliderChapSize', subFontSize: 'sliderSubSize' };
      const sld = document.getElementById(sldMap[field]);
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush(`Resized header ${field}`);
    }

    function handleAwardIntroInput(val) {
      currentCertTemplate.title.introText = val;
      renderCertificatePreview();
      scheduleTextHistoryPush('Edited award intro line');
    }

    function handleAwardIntroSizeChange(val) {
      if (!currentCertTemplate.title) currentCertTemplate.title = {};
      const sz = parseInt(val, 10) || 12;
      currentCertTemplate.title.introFontSize = sz;
      const lbl = document.getElementById('lblAwardIntroSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderAwardIntroSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized award intro');
    }

    function handleRecipientFontChange(val) {
      currentCertTemplate.recipient.fontFamily = val;
      renderCertificatePreview();
      pushCertHistoryState('Changed recipient font');
    }

    function handleRecipientSizeChange(val) {
      const sz = parseInt(val) || 34;
      currentCertTemplate.recipient.fontSize = sz;
      const lbl = document.getElementById('lblRecipientSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderRecipientSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized recipient name');
    }

    function handleRecipientSubtitleSizeChange(val) {
      if (!currentCertTemplate.recipient) currentCertTemplate.recipient = {};
      const sz = parseInt(val, 10) || 12;
      currentCertTemplate.recipient.subtitleFontSize = sz;
      const lbl = document.getElementById('lblRecipientSubtitleSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderRecSubtitleSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized recipient subtitle');
    }

    function handleEventTitleFontSizeChange(val) {
      if (!currentCertTemplate.citation) currentCertTemplate.citation = {};
      const sz = parseInt(val, 10) || 15;
      currentCertTemplate.citation.eventTitleFontSize = sz;
      const lbl = document.getElementById('lblEventTitleFontSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderEventTitleSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized event title');
    }

    function handleDetailFontSizeChange(val) {
      if (!currentCertTemplate.citation) currentCertTemplate.citation = {};
      const sz = parseFloat(val) || 11.5;
      currentCertTemplate.citation.detailFontSize = sz;
      const lbl = document.getElementById('lblDetailFontSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderDetailFontSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized detail text');
    }

    function handleSignatoryOfficeFontSizeChange(val) {
      if (!currentCertTemplate.signatories) currentCertTemplate.signatories = {};
      const sz = parseInt(val, 10) || 9;
      currentCertTemplate.signatories.officeFontSize = sz;
      const lbl = document.getElementById('lblSigOfficeFontSize');
      if (lbl) lbl.textContent = sz + 'px';
      const sld = document.getElementById('sliderSigOfficeFontSize');
      if (sld) sld.value = sz;
      renderCertificatePreview();
      scheduleTextHistoryPush('Resized signatory office');
    }

    function handleRecipientUnderlineChange(val) {
      currentCertTemplate.recipient.underline = val;
      renderCertificatePreview();
      pushCertHistoryState('Toggled recipient underline');
    }

    function handleCitationLeadInput(val) {
      currentCertTemplate.citation.leadText = val;
      renderCertificatePreview();
      scheduleTextHistoryPush('Edited citation lead text');
    }

    function handleCitationEventTitleInput(val) {
      if (!currentCertTemplate.citation) currentCertTemplate.citation = {};
      currentCertTemplate.citation.customEventTitle = val;
      renderCertificatePreview();
      scheduleTextHistoryPush('Edited event title');
    }

    function handleCitationCustomMetaInput(field, val) {
      if (!currentCertTemplate.citation) currentCertTemplate.citation = {};
      if (field === 'date') currentCertTemplate.citation.customDate = val;
      else if (field === 'venue') currentCertTemplate.citation.customVenue = val;
      else if (field === 'duration') currentCertTemplate.citation.customDuration = val;

      // Ensure {date}, {venue}, or {duration} token exists in detailTemplate if the user previously overwrote it with plain text
      const token = `{${field}}`;
      let tplStr = currentCertTemplate.citation.detailTemplate || '';
      if (!new RegExp(`\\{${field}\\}`, 'i').test(tplStr)) {
        const actId = document.getElementById('certActivitySelect') ? document.getElementById('certActivitySelect').value : null;
        const act = activitiesList.find(a => a.id === actId) || activitiesList[0];
        if (act && act[field] && tplStr.includes(act[field])) {
          tplStr = tplStr.replace(act[field], token);
          currentCertTemplate.citation.detailTemplate = tplStr;
          const inpDet = document.getElementById('inputCitationDetails');
          if (inpDet && inpDet !== document.activeElement) inpDet.value = tplStr;
        } else if (!tplStr.trim()) {
          tplStr = 'Conducted on {date} at {venue} with an equivalent duration of {duration}.';
          currentCertTemplate.citation.detailTemplate = tplStr;
          const inpDet = document.getElementById('inputCitationDetails');
          if (inpDet && inpDet !== document.activeElement) inpDet.value = tplStr;
        }
      }

      renderCertificatePreview();
      scheduleTextHistoryPush(`Edited custom ${field}`);
    }

    function resetCitationEventMeta() {
      if (!currentCertTemplate.citation) currentCertTemplate.citation = {};
      currentCertTemplate.citation.customEventTitle = '';
      currentCertTemplate.citation.customDate = '';
      currentCertTemplate.citation.customVenue = '';
      currentCertTemplate.citation.customDuration = '';
      currentCertTemplate.citation.detailTemplate = 'Conducted on {date} at {venue} with an equivalent duration of {duration}.';
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Reset Event/Date/Venue to Activity Defaults');
      showToast('Restored Event Title, Date, Venue & Duration to selected Activity defaults!', 'fa-rotate-left');
    }

    function insertCitationPlaceholder(token) {
      const inp = document.getElementById('inputCitationDetails');
      if (!inp) return;
      const start = inp.selectionStart !== undefined ? inp.selectionStart : inp.value.length;
      const end = inp.selectionEnd !== undefined ? inp.selectionEnd : inp.value.length;
      const text = inp.value || '';
      const updated = text.slice(0, start) + token + text.slice(end);
      inp.value = updated;
      currentCertTemplate.citation.detailTemplate = updated;
      inp.focus();
      inp.setSelectionRange(start + token.length, start + token.length);
      renderCertificatePreview();
      pushCertHistoryState(`Inserted ${token} placeholder`);
    }

    function handleCitationDetailsInput(val) {
      currentCertTemplate.citation.detailTemplate = val;
      renderCertificatePreview();
      scheduleTextHistoryPush('Edited venue & date line');
    }

    // --- SIGNATORIES & SIGNATURE COUNT / PRESET HANDLERS ---
    function setSignatureCountMode(count) {
      const s = currentCertTemplate.signatories;
      if (count === 1) {
        s.sig1Enabled = true;
        s.sig2Enabled = false;
        s.sig3Enabled = false;
      } else if (count === 2) {
        s.sig1Enabled = true;
        s.sig2Enabled = true;
        s.sig3Enabled = false;
      } else if (count === 3) {
        s.sig1Enabled = true;
        s.sig2Enabled = true;
        s.sig3Enabled = true;
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(`Set ${count} signature${count > 1 ? 's' : ''}`);
      showToast(`Displaying ${count} signature${count > 1 ? 's' : ''} on certificate`, 'fa-signature');
    }

    function handleQuickSigPresetChange(presetKey) {
      const s = currentCertTemplate.signatories;
      const findOff = (k) => getAllSignatoriesList().find(o => o.key === k);

      if (presetKey.startsWith('single_')) {
        const offKey = presetKey.replace('single_', '');
        const off = findOff(offKey);
        s.sig1Enabled = true;
        s.sig2Enabled = false;
        s.sig3Enabled = false;
        if (off) {
          s.sig1Name = off.name;
          s.sig1Title = off.title;
          s.sig1Office = off.office;
          if (off.signatureImage) s.sig1SignatureImage = off.signatureImage;
        }
      } else if (presetKey === 'dual_ganga_magalong' || presetKey === 'dual_ong_magalong') {
        const o1 = findOff('ganga') || findOff('ong');
        const o2 = findOff('magalong');
        s.sig1Enabled = true; s.sig2Enabled = true; s.sig3Enabled = false;
        if (o1) { s.sig1Name = o1.name; s.sig1Title = o1.title; s.sig1Office = o1.office; if (o1.signatureImage) s.sig1SignatureImage = o1.signatureImage; }
        if (o2) { s.sig2Name = o2.name; s.sig2Title = o2.title; s.sig2Office = o2.office; if (o2.signatureImage) s.sig2SignatureImage = o2.signatureImage; }
      } else if (presetKey === 'dual_ganga_olowan' || presetKey === 'dual_ong_olowan') {
        const o1 = findOff('ganga') || findOff('ong');
        const o2 = findOff('olowan');
        s.sig1Enabled = true; s.sig2Enabled = true; s.sig3Enabled = false;
        if (o1) { s.sig1Name = o1.name; s.sig1Title = o1.title; s.sig1Office = o1.office; if (o1.signatureImage) s.sig1SignatureImage = o1.signatureImage; }
        if (o2) { s.sig2Name = o2.name; s.sig2Title = o2.title; s.sig2Office = o2.office; if (o2.signatureImage) s.sig2SignatureImage = o2.signatureImage; }
      } else if (presetKey === 'dual_delacruz_ganga') {
        const o1 = findOff('delacruz');
        const o2 = findOff('ganga');
        s.sig1Enabled = true; s.sig2Enabled = true; s.sig3Enabled = false;
        if (o1) { s.sig1Name = o1.name; s.sig1Title = o1.title; s.sig1Office = o1.office; if (o1.signatureImage) s.sig1SignatureImage = o1.signatureImage; }
        if (o2) { s.sig2Name = o2.name; s.sig2Title = o2.title; s.sig2Office = o2.office; if (o2.signatureImage) s.sig2SignatureImage = o2.signatureImage; }
      } else if (presetKey === 'dual_olowan_magalong') {
        const o1 = findOff('olowan');
        const o2 = findOff('magalong');
        s.sig1Enabled = true; s.sig2Enabled = true; s.sig3Enabled = false;
        if (o1) { s.sig1Name = o1.name; s.sig1Title = o1.title; s.sig1Office = o1.office; if (o1.signatureImage) s.sig1SignatureImage = o1.signatureImage; }
        if (o2) { s.sig2Name = o2.name; s.sig2Title = o2.title; s.sig2Office = o2.office; if (o2.signatureImage) s.sig2SignatureImage = o2.signatureImage; }
      } else if (presetKey === 'triple_all') {
        const o1 = findOff('ganga') || findOff('ong');
        const o3 = findOff('olowan');
        const o2 = findOff('magalong');
        s.sig1Enabled = true; s.sig2Enabled = true; s.sig3Enabled = true;
        if (o1) { s.sig1Name = o1.name; s.sig1Title = o1.title; s.sig1Office = o1.office; if (o1.signatureImage) s.sig1SignatureImage = o1.signatureImage; }
        if (o3) { s.sig3Name = o3.name; s.sig3Title = o3.title; s.sig3Office = o3.office; if (o3.signatureImage) s.sig3SignatureImage = o3.signatureImage; }
        if (o2) { s.sig2Name = o2.name; s.sig2Title = o2.title; s.sig2Office = o2.office; if (o2.signatureImage) s.sig2SignatureImage = o2.signatureImage; }
      }

      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Updated signatory preset');
      showToast('Updated certificate signatory selection!', 'fa-signature');
    }

    function handlePickSignatoryOfficer(sigNum, officerKey) {
      if (!officerKey || officerKey === 'custom') return;
      const off = getAllSignatoriesList().find(o => o.key === officerKey);
      if (!off) return;

      const s = currentCertTemplate.signatories;
      if (sigNum === 1) {
        s.sig1Enabled = true;
        s.sig1Name = off.name;
        s.sig1Title = off.title;
        s.sig1Office = off.office || '';
        if (off.signatureImage) s.sig1SignatureImage = off.signatureImage;
      } else if (sigNum === 2) {
        s.sig2Enabled = true;
        s.sig2Name = off.name;
        s.sig2Title = off.title;
        s.sig2Office = off.office || '';
        if (off.signatureImage) s.sig2SignatureImage = off.signatureImage;
      } else if (sigNum === 3) {
        s.sig3Enabled = true;
        s.sig3Name = off.name;
        s.sig3Title = off.title;
        s.sig3Office = off.office || '';
        if (off.signatureImage) s.sig3SignatureImage = off.signatureImage;
      }

      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(`Picked ${off.name} for Signatory ${sigNum}`);
      showToast(`Assigned ${off.name} as Signatory ${sigNum}`, 'fa-user-check');
    }

    function toggleSigEnabled(sigNum, isChecked) {
      const s = currentCertTemplate.signatories;
      if (sigNum === 1) s.sig1Enabled = !!isChecked;
      if (sigNum === 2) s.sig2Enabled = !!isChecked;
      if (sigNum === 3) s.sig3Enabled = !!isChecked;

      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(`${isChecked ? 'Enabled' : 'Removed'} Signatory ${sigNum}`);
    }

    function toggleQrSerialEnabled(isChecked) {
      currentCertTemplate.signatories.showQrSerial = !!isChecked;
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState(isChecked ? 'Enabled QR & Serial No.' : 'Removed QR & Serial No.');
    }

    function handleSigUpdate() {
      const i1n = document.getElementById('inputSig1Name');
      const i1t = document.getElementById('inputSig1Title');
      const i1o = document.getElementById('inputSig1Office');
      if (i1n) currentCertTemplate.signatories.sig1Name = i1n.value;
      if (i1t) currentCertTemplate.signatories.sig1Title = i1t.value;
      if (i1o) currentCertTemplate.signatories.sig1Office = i1o.value;

      const i2n = document.getElementById('inputSig2Name');
      const i2t = document.getElementById('inputSig2Title');
      const i2o = document.getElementById('inputSig2Office');
      if (i2n) currentCertTemplate.signatories.sig2Name = i2n.value;
      if (i2t) currentCertTemplate.signatories.sig2Title = i2t.value;
      if (i2o) currentCertTemplate.signatories.sig2Office = i2o.value;

      const i3n = document.getElementById('inputSig3Name');
      const i3t = document.getElementById('inputSig3Title');
      const i3o = document.getElementById('inputSig3Office');
      if (i3n) currentCertTemplate.signatories.sig3Name = i3n.value;
      if (i3t) currentCertTemplate.signatories.sig3Title = i3t.value;
      if (i3o) currentCertTemplate.signatories.sig3Office = i3o.value;

      const qs1n = document.getElementById('quickTopSig1Name');
      if (qs1n && qs1n !== document.activeElement) qs1n.value = currentCertTemplate.signatories.sig1Name;
      const qs1t = document.getElementById('quickTopSig1Title');
      if (qs1t && qs1t !== document.activeElement) qs1t.value = currentCertTemplate.signatories.sig1Title;
      const qs2n = document.getElementById('quickTopSig2Name');
      if (qs2n && qs2n !== document.activeElement) qs2n.value = currentCertTemplate.signatories.sig2Name;
      const qs2t = document.getElementById('quickTopSig2Title');
      if (qs2t && qs2t !== document.activeElement) qs2t.value = currentCertTemplate.signatories.sig2Title;

      renderCertificatePreview();
      scheduleTextHistoryPush('Edited signatory details');
    }

    function toggleSig3Enabled(val) {
      toggleSigEnabled(3, val);
    }

    // --- WHOLE-CERTIFICATE BORDER PRESETS & STYLE HANDLERS ---
    const WHOLE_BORDER_PRESET_LABELS = {
      'move_classic_double': 'MOVE Classic Double Frame',
      'royal_gold_filigree': 'Royal Gold Filigree Frame',
      'diploma_architectural': 'Official Diploma Architectural',
      'modern_ribbon_corner': 'Modern Geometric Ribbon',
      'kitchen_culinary_artisan': 'Culinary Artisan Frame (MITK2)',
      'baguio_heritage_crest': 'Baguio Pine & Heritage Frame',
      'minimal_executive': 'Minimalist Executive Line',
      'none': 'No Border (Frameless)'
    };

    function handleWholeBorderPresetChange(presetKey) {
      if (!currentCertTemplate.theme) currentCertTemplate.theme = {};
      currentCertTemplate.theme.borderPreset = presetKey || 'move_classic_double';

      if (presetKey === 'none') {
        currentCertTemplate.theme.borderStyle = 'none';
      } else if (presetKey === 'move_classic_double') {
        currentCertTemplate.theme.borderStyle = 'double';
        currentCertTemplate.theme.borderWidth = 8;
      } else if (presetKey === 'royal_gold_filigree') {
        currentCertTemplate.theme.borderStyle = 'double';
        currentCertTemplate.theme.borderWidth = 10;
      } else if (presetKey === 'diploma_architectural') {
        currentCertTemplate.theme.borderStyle = 'solid';
        currentCertTemplate.theme.borderWidth = 6;
      } else if (presetKey === 'modern_ribbon_corner') {
        currentCertTemplate.theme.borderStyle = 'solid';
        currentCertTemplate.theme.borderWidth = 4;
      } else if (presetKey === 'kitchen_culinary_artisan') {
        currentCertTemplate.theme.borderStyle = 'double';
        currentCertTemplate.theme.borderWidth = 8;
      } else if (presetKey === 'baguio_heritage_crest') {
        currentCertTemplate.theme.borderStyle = 'double';
        currentCertTemplate.theme.borderWidth = 8;
      } else if (presetKey === 'minimal_executive') {
        currentCertTemplate.theme.borderStyle = 'solid';
        currentCertTemplate.theme.borderWidth = 2;
      }

      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      const label = WHOLE_BORDER_PRESET_LABELS[presetKey] || 'Whole Border Preset';
      pushCertHistoryState(`Whole Border: ${label}`);
      showToast(`Applied border preset: ${label}`, 'fa-border-all');
    }

    function handleBorderStyleChange(val) {
      currentCertTemplate.theme.borderStyle = val;
      if (val === 'none') {
        currentCertTemplate.theme.borderPreset = 'none';
      } else if (currentCertTemplate.theme.borderPreset === 'none') {
        currentCertTemplate.theme.borderPreset = 'move_classic_double';
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Changed border style');
    }

    function handleBorderWidthChange(val) {
      currentCertTemplate.theme.borderWidth = parseInt(val) || 8;
      renderCertificatePreview();
      scheduleTextHistoryPush('Adjusted border thickness');
    }

    function handleOuterBorderColorChange(val) {
      currentCertTemplate.theme.outerBorderColor = val;
      const lbl = document.getElementById('lblOuterBorderColor');
      if (lbl) lbl.textContent = val;
      renderCertificatePreview();
      pushCertHistoryState('Changed border color');
    }

    function handleInnerBorderColorChange(val) {
      currentCertTemplate.theme.innerBorderColor = val;
      const lbl = document.getElementById('lblInnerBorderColor');
      if (lbl) lbl.textContent = val;
      renderCertificatePreview();
      pushCertHistoryState('Changed inner accent color');
    }

    function handleBgToneChange(val) {
      currentCertTemplate.theme.backgroundColor = val;
      renderCertificatePreview();
      pushCertHistoryState('Changed background tone');
    }

    function handleCornerOrnamentChange(val) {
      currentCertTemplate.theme.cornerOrnament = val;
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Changed corner ornament');
    }

    function handleCornerColorChange(val) {
      currentCertTemplate.theme.cornerColor = val;
      renderCertificatePreview();
      pushCertHistoryState('Changed corner color');
    }

    function handleCertTypeSelectChange(typeKey) {
      const typeTitles = {
        participation: 'CERTIFICATE OF PARTICIPATION',
        appreciation: 'CERTIFICATE OF APPRECIATION',
        recognition: 'CERTIFICATE OF RECOGNITION',
        membership: 'CERTIFICATE OF MEMBERSHIP',
        custom: currentCertTemplate.title.customTitle || 'CERTIFICATE OF COMMENDATION'
      };
      if (typeKey !== 'custom') {
        currentCertTemplate.title.customTitle = typeTitles[typeKey];
      }
      currentCertTemplate.title.type = typeKey;
      const inp = document.getElementById('inputCertTitle');
      if (inp) inp.value = currentCertTemplate.title.customTitle;
      renderCertificatePreview();
      pushCertHistoryState('Changed certificate type');
    }

    function handleQuickThemeChange(themeKey) {
      if (themeKey === 'move_official') {
        currentCertTemplate.theme.outerBorderColor = '#091b38';
        currentCertTemplate.theme.innerBorderColor = '#f97316';
        currentCertTemplate.theme.backgroundColor = '#ffffff';
        currentCertTemplate.theme.cornerColor = '#f97316';
        currentCertTemplate.title.color = '#091b38';
        currentCertTemplate.recipient.color = '#091b38';
        currentCertTemplate.recipient.underlineColor = '#f97316';
        currentCertTemplate.recipient.subtitleColor = '#ea580c';
      } else if (themeKey === 'gold_navy') {
        currentCertTemplate.theme.outerBorderColor = '#78350f';
        currentCertTemplate.theme.innerBorderColor = '#d97706';
        currentCertTemplate.theme.backgroundColor = '#fefce8';
        currentCertTemplate.theme.cornerColor = '#d97706';
        currentCertTemplate.title.color = '#78350f';
        currentCertTemplate.recipient.color = '#78350f';
        currentCertTemplate.recipient.underlineColor = '#d97706';
        currentCertTemplate.recipient.subtitleColor = '#b45309';
      } else if (themeKey === 'men_in_the_kitchen_2') {
        currentCertTemplate.theme.outerBorderColor = '#451a03';
        currentCertTemplate.theme.innerBorderColor = '#ea580c';
        currentCertTemplate.theme.backgroundColor = '#fffbeb';
        currentCertTemplate.theme.cornerColor = '#ea580c';
        currentCertTemplate.title.color = '#7c2d12';
        currentCertTemplate.title.accentColor = '#ea580c';
        currentCertTemplate.recipient.color = '#451a03';
        currentCertTemplate.recipient.underlineColor = '#ea580c';
        currentCertTemplate.recipient.subtitleColor = '#c2410c';
        currentCertTemplate.header.showEventLogo = true;
        currentCertTemplate.header.eventLogo = 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png';
        currentCertTemplate.header.eventLogoWidth = 86;
      } else if (themeKey === 'pine_green') {
        currentCertTemplate.theme.outerBorderColor = '#064e3b';
        currentCertTemplate.theme.innerBorderColor = '#d97706';
        currentCertTemplate.theme.backgroundColor = '#f0fdf4';
        currentCertTemplate.theme.cornerColor = '#059669';
        currentCertTemplate.title.color = '#064e3b';
        currentCertTemplate.recipient.color = '#064e3b';
        currentCertTemplate.recipient.underlineColor = '#059669';
        currentCertTemplate.recipient.subtitleColor = '#047857';
      }
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
      pushCertHistoryState('Changed theme palette');
    }

    function syncDesignerInputsFromTemplate() {
      const t = normalizeTemplateFields(currentCertTemplate);
      if (!t) return;

      // Header Lines Font Sizes
      const sldRep = document.getElementById('sliderRepSize');
      if (sldRep) sldRep.value = t.header.republicFontSize || 11;
      const lblRep = document.getElementById('lblRepSize');
      if (lblRep) lblRep.textContent = (t.header.republicFontSize || 11) + 'px';

      const sldCity = document.getElementById('sliderCitySize');
      if (sldCity) sldCity.value = t.header.cityFontSize || 13;
      const lblCity = document.getElementById('lblCitySize');
      if (lblCity) lblCity.textContent = (t.header.cityFontSize || 13) + 'px';

      const sldChap = document.getElementById('sliderChapSize');
      if (sldChap) sldChap.value = t.header.chapterFontSize || 12;
      const lblChap = document.getElementById('lblChapSize');
      if (lblChap) lblChap.textContent = (t.header.chapterFontSize || 12) + 'px';

      const sldSub = document.getElementById('sliderSubSize');
      if (sldSub) sldSub.value = t.header.subFontSize || 9.5;
      const lblSub = document.getElementById('lblSubSize');
      if (lblSub) lblSub.textContent = (t.header.subFontSize || 9.5) + 'px';

      const inpTitle = document.getElementById('inputCertTitle');
      if (inpTitle && inpTitle !== document.activeElement) inpTitle.value = t.title.customTitle !== undefined ? t.title.customTitle : '';

      const selTitleFont = document.getElementById('selectTitleFontFamily');
      if (selTitleFont) selTitleFont.value = t.title.fontFamily || 'cinzel';

      const sldTitleSize = document.getElementById('sliderTitleFontSize');
      if (sldTitleSize) sldTitleSize.value = t.title.fontSize || 28;

      const inpIntro = document.getElementById('inputAwardIntro');
      if (inpIntro && inpIntro !== document.activeElement) inpIntro.value = t.title.introText !== undefined ? t.title.introText : '';

      const sldIntroSize = document.getElementById('sliderAwardIntroSize');
      if (sldIntroSize) sldIntroSize.value = t.title.introFontSize || 12;
      const lblIntroSize = document.getElementById('lblAwardIntroSize');
      if (lblIntroSize) lblIntroSize.textContent = (t.title.introFontSize || 12) + 'px';

      const selRecFont = document.getElementById('selectRecipientFont');
      if (selRecFont) selRecFont.value = t.recipient.fontFamily || 'cinzel';

      const sldRecSize = document.getElementById('sliderRecipientSize');
      if (sldRecSize) sldRecSize.value = t.recipient.fontSize || 34;
      const lblRecSize = document.getElementById('lblRecipientSize');
      if (lblRecSize) lblRecSize.textContent = (t.recipient.fontSize || 34) + 'px';

      const sldRecSubSize = document.getElementById('sliderRecSubtitleSize');
      if (sldRecSubSize) sldRecSubSize.value = t.recipient.subtitleFontSize || 12;
      const lblRecSubSize = document.getElementById('lblRecipientSubtitleSize');
      if (lblRecSubSize) lblRecSubSize.textContent = (t.recipient.subtitleFontSize || 12) + 'px';

      const chkRecUnderline = document.getElementById('chkRecipientUnderline');
      if (chkRecUnderline) chkRecUnderline.checked = !!t.recipient.underline;

      const inpLead = document.getElementById('inputCitationLead');
      if (inpLead && inpLead !== document.activeElement) inpLead.value = t.citation.leadText !== undefined ? t.citation.leadText : '';

      const actId = document.getElementById('certActivitySelect') ? document.getElementById('certActivitySelect').value : null;
      const act = (typeof activitiesList !== 'undefined' && activitiesList) ? (activitiesList.find(a => a.id === actId) || activitiesList[0]) : null;

      const inpEvtTitle = document.getElementById('inputCitationEventTitle');
      if (inpEvtTitle && inpEvtTitle !== document.activeElement) {
        inpEvtTitle.value = t.citation.customEventTitle || '';
        if (act && act.title) inpEvtTitle.placeholder = `Default: ${act.title}`;
      }

      const inpCitDate = document.getElementById('inputCitationDate');
      if (inpCitDate && inpCitDate !== document.activeElement) {
        inpCitDate.value = t.citation.customDate || '';
        if (act && act.date) inpCitDate.placeholder = act.date;
      }

      const inpCitDur = document.getElementById('inputCitationDuration');
      if (inpCitDur && inpCitDur !== document.activeElement) {
        inpCitDur.value = t.citation.customDuration || '';
        if (act && act.duration) inpCitDur.placeholder = act.duration;
      }

      const inpCitVenue = document.getElementById('inputCitationVenue');
      if (inpCitVenue && inpCitVenue !== document.activeElement) {
        inpCitVenue.value = t.citation.customVenue || '';
        if (act && act.venue) inpCitVenue.placeholder = act.venue;
      }

      const inpDet = document.getElementById('inputCitationDetails');
      if (inpDet && inpDet !== document.activeElement) {
        inpDet.value = t.citation.detailTemplate !== undefined ? t.citation.detailTemplate : '';
      }

      const sldEvtTitleSize = document.getElementById('sliderEventTitleSize');
      if (sldEvtTitleSize) sldEvtTitleSize.value = t.citation.eventTitleFontSize || 15;
      const lblEvtTitleSize = document.getElementById('lblEventTitleFontSize');
      if (lblEvtTitleSize) lblEvtTitleSize.textContent = (t.citation.eventTitleFontSize || 15) + 'px';

      const sldDetSize = document.getElementById('sliderDetailFontSize');
      if (sldDetSize) sldDetSize.value = t.citation.detailFontSize || 11.5;
      const lblDetSize = document.getElementById('lblDetailFontSize');
      if (lblDetSize) lblDetSize.textContent = (t.citation.detailFontSize || 11.5) + 'px';

      // Signatories checkboxes & inputs
      const chkS1 = document.getElementById('chkSig1Enable');
      if (chkS1) chkS1.checked = t.signatories.sig1Enabled !== false;
      const c1 = document.getElementById('sig1InputsContainer');
      if (c1) {
        if (t.signatories.sig1Enabled !== false) c1.classList.remove('hidden');
        else c1.classList.add('hidden');
      }

      const s1n = document.getElementById('inputSig1Name');
      if (s1n && s1n !== document.activeElement) s1n.value = t.signatories.sig1Name !== undefined ? t.signatories.sig1Name : '';
      const qs1n = document.getElementById('quickTopSig1Name');
      if (qs1n && qs1n !== document.activeElement) qs1n.value = t.signatories.sig1Name !== undefined ? t.signatories.sig1Name : '';

      const s1t = document.getElementById('inputSig1Title');
      if (s1t && s1t !== document.activeElement) s1t.value = t.signatories.sig1Title !== undefined ? t.signatories.sig1Title : '';
      const qs1t = document.getElementById('quickTopSig1Title');
      if (qs1t && qs1t !== document.activeElement) qs1t.value = t.signatories.sig1Title !== undefined ? t.signatories.sig1Title : '';

      const s1o = document.getElementById('inputSig1Office');
      if (s1o && s1o !== document.activeElement) s1o.value = t.signatories.sig1Office || '';

      const sigFontSz = t.signatories.fontSize || 13;
      const sldSigSz = document.getElementById('sliderSigFontSize');
      if (sldSigSz) sldSigSz.value = sigFontSz;
      const lblSigSz = document.getElementById('lblSigFontSize');
      if (lblSigSz) lblSigSz.textContent = sigFontSz + 'px';
      const topSldSigSz = document.getElementById('topSliderSigFontSize');
      if (topSldSigSz) topSldSigSz.value = sigFontSz;
      const topLblSigSz = document.getElementById('lblTopSigFontSize');
      if (topLblSigSz) topLblSigSz.textContent = sigFontSz + 'px';

      const sigTitleSz = t.signatories.titleFontSize || Math.max(9, sigFontSz - 3);
      const sldSigTitleSz = document.getElementById('sliderSigTitleFontSize');
      if (sldSigTitleSz) sldSigTitleSz.value = sigTitleSz;
      const lblSigTitleSz = document.getElementById('lblSigTitleFontSize');
      if (lblSigTitleSz) lblSigTitleSz.textContent = sigTitleSz + 'px';

      const sigOfficeSz = t.signatories.officeFontSize || 9;
      const sldSigOffSz = document.getElementById('sliderSigOfficeFontSize');
      if (sldSigOffSz) sldSigOffSz.value = sigOfficeSz;
      const lblSigOffSz = document.getElementById('lblSigOfficeFontSize');
      if (lblSigOffSz) lblSigOffSz.textContent = sigOfficeSz + 'px';

      const sigLineW = t.signatories.lineWidth || 210;
      const sldSigLineW = document.getElementById('sliderSigLineWidth');
      if (sldSigLineW) sldSigLineW.value = sigLineW;
      const lblSigLineW = document.getElementById('lblSigLineWidth');
      if (lblSigLineW) lblSigLineW.textContent = sigLineW + 'px';

      const sigImgW = t.signatories.sigImageWidth || 150;
      const sldSigImgW = document.getElementById('sliderSigImgWidth');
      if (sldSigImgW) sldSigImgW.value = sigImgW;
      const lblSigImgW = document.getElementById('lblSigImgWidth');
      if (lblSigImgW) lblSigImgW.textContent = sigImgW + 'px';
      const topSldSigImgW = document.getElementById('topSliderSigImgWidth');
      if (topSldSigImgW) topSldSigImgW.value = sigImgW;
      const topLblSigImgW = document.getElementById('lblTopSigImgWidth');
      if (topLblSigImgW) topLblSigImgW.textContent = sigImgW + 'px';

      const sigImgH = t.signatories.sigImageHeight || t.signatories.sigImageSize || 56;
      const sldSigImgH = document.getElementById('sliderSigImgHeight');
      if (sldSigImgH) sldSigImgH.value = sigImgH;
      const lblSigImgH = document.getElementById('lblSigImgHeight');
      if (lblSigImgH) lblSigImgH.textContent = sigImgH + 'px';
      const topSldSigImgH = document.getElementById('topSliderSigImgHeight');
      if (topSldSigImgH) topSldSigImgH.value = sigImgH;
      const topLblSigImgH = document.getElementById('lblTopSigImgHeight');
      if (topLblSigImgH) topLblSigImgH.textContent = sigImgH + 'px';

      // Fallback for legacy size elements
      const sldSigImgSz = document.getElementById('sliderSigImgSize');
      if (sldSigImgSz) sldSigImgSz.value = sigImgH;
      const lblSigImgSz = document.getElementById('lblSigImgSize');
      if (lblSigImgSz) lblSigImgSz.textContent = sigImgH + 'px';
      const topSldSigImgSz = document.getElementById('topSliderSigImgSize');
      if (topSldSigImgSz) topSldSigImgSz.value = sigImgH;
      const topLblSigImgSz = document.getElementById('lblTopSigImgSize');
      if (topLblSigImgSz) topLblSigImgSz.textContent = sigImgH + 'px';

      const sigFit = t.signatories.sigFitMode || 'fill';
      const btnFill = document.getElementById('btnSigFitFill');
      const btnContain = document.getElementById('btnSigFitContain');
      if (btnFill && btnContain) {
        if (sigFit === 'fill') {
          btnFill.className = 'px-2 py-0.5 rounded transition bg-move-navy-900 text-white';
          btnContain.className = 'px-2 py-0.5 rounded transition text-slate-600 hover:text-move-navy-900';
        } else {
          btnContain.className = 'px-2 py-0.5 rounded transition bg-move-navy-900 text-white';
          btnFill.className = 'px-2 py-0.5 rounded transition text-slate-600 hover:text-move-navy-900';
        }
      }

      [1, 2, 3].forEach(n => {
        const indW = t.signatories[`sig${n}ImageWidth`] || sigImgW;
        const sW = document.getElementById(`sliderSig${n}ImgWidth`);
        if (sW) sW.value = indW;
        const lW = document.getElementById(`lblSig${n}ImgWidth`);
        if (lW) lW.textContent = indW + 'px';

        const indH = t.signatories[`sig${n}ImageHeight`] || t.signatories[`sig${n}ImageSize`] || sigImgH;
        const sH = document.getElementById(`sliderSig${n}ImgHeight`);
        if (sH) sH.value = indH;
        const lH = document.getElementById(`lblSig${n}ImgHeight`);
        if (lH) lH.textContent = indH + 'px';

        const sOld = document.getElementById(`sliderSig${n}ImgSize`);
        if (sOld) sOld.value = indH;
        const lOld = document.getElementById(`lblSig${n}ImgSize`);
        if (lOld) lOld.textContent = indH + 'px';

        const selOff = document.getElementById(`selectQuickOfficerSig${n}`);
        if (selOff) {
          const curName = (t.signatories[`sig${n}Name`] || '').trim().toUpperCase();
          const matchOff = getAllSignatoriesList().find(o => o.name.trim().toUpperCase() === curName);
          selOff.value = matchOff ? matchOff.key : 'custom';
        }
      });

      const chkS2 = document.getElementById('chkSig2Enable');
      if (chkS2) chkS2.checked = t.signatories.sig2Enabled !== false;
      const c2 = document.getElementById('sig2InputsContainer');
      if (c2) {
        if (t.signatories.sig2Enabled !== false) c2.classList.remove('hidden');
        else c2.classList.add('hidden');
      }

      const s2n = document.getElementById('inputSig2Name');
      if (s2n && s2n !== document.activeElement) s2n.value = t.signatories.sig2Name !== undefined ? t.signatories.sig2Name : '';
      const qs2n = document.getElementById('quickTopSig2Name');
      if (qs2n && qs2n !== document.activeElement) qs2n.value = t.signatories.sig2Name !== undefined ? t.signatories.sig2Name : '';

      const s2t = document.getElementById('inputSig2Title');
      if (s2t && s2t !== document.activeElement) s2t.value = t.signatories.sig2Title !== undefined ? t.signatories.sig2Title : '';
      const qs2t = document.getElementById('quickTopSig2Title');
      if (qs2t && qs2t !== document.activeElement) qs2t.value = t.signatories.sig2Title !== undefined ? t.signatories.sig2Title : '';

      const s2o = document.getElementById('inputSig2Office');
      if (s2o && s2o !== document.activeElement) s2o.value = t.signatories.sig2Office || '';

      const q2nw = document.getElementById('quickTopSig2NameWrap');
      const q2tw = document.getElementById('quickTopSig2TitleWrap');
      if (q2nw && q2tw) {
        if (t.signatories.sig2Enabled !== false) {
          q2nw.classList.remove('opacity-40');
          q2tw.classList.remove('opacity-40');
        } else {
          q2nw.classList.add('opacity-40');
          q2tw.classList.add('opacity-40');
        }
      }

      const chkS3 = document.getElementById('chkSig3Enable');
      if (chkS3) chkS3.checked = !!t.signatories.sig3Enabled;
      const c3 = document.getElementById('sig3InputsContainer');
      if (c3) {
        if (t.signatories.sig3Enabled) c3.classList.remove('hidden');
        else c3.classList.add('hidden');
      }

      const s3n = document.getElementById('inputSig3Name');
      if (s3n && s3n !== document.activeElement) s3n.value = t.signatories.sig3Name !== undefined ? t.signatories.sig3Name : '';
      const s3t = document.getElementById('inputSig3Title');
      if (s3t && s3t !== document.activeElement) s3t.value = t.signatories.sig3Title !== undefined ? t.signatories.sig3Title : '';
      const s3o = document.getElementById('inputSig3Office');
      if (s3o && s3o !== document.activeElement) s3o.value = t.signatories.sig3Office || '';

      const chkQr = document.getElementById('chkShowQrSerial');
      if (chkQr) chkQr.checked = !!t.signatories.showQrSerial;

      // Active signature count highlight
      const activeSigCount = (t.signatories.sig1Enabled !== false ? 1 : 0) +
                             (t.signatories.sig2Enabled !== false ? 1 : 0) +
                             (t.signatories.sig3Enabled ? 1 : 0);
      [1, 2, 3].forEach(n => {
        const b = document.getElementById('btnSigMode' + n);
        if (b) {
          if (n === activeSigCount) {
            b.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] border transition bg-move-navy-900 text-white border-move-navy-900 shadow-2xs';
          } else {
            b.className = 'py-1.5 px-2 rounded-lg font-bold text-[11px] border transition bg-white text-slate-700 border-slate-300 hover:bg-move-navy-900 hover:text-white';
          }
        }
        const tb = document.getElementById('topBtnSigCount' + n);
        if (tb) {
          if (n === activeSigCount) {
            tb.className = 'px-2 py-0.5 rounded-md transition bg-move-navy-900 text-white shadow-2xs';
          } else {
            tb.className = 'px-2 py-0.5 rounded-md transition text-slate-600 hover:bg-slate-200';
          }
        }
      });

      // Stage & Quick toggle buttons state
      const stSig1 = document.getElementById('stageBtnSig1');
      const stSig2 = document.getElementById('stageBtnSig2');
      if (stSig1) {
        stSig1.className = `px-2 py-0.5 rounded-md border font-bold transition ${activeSigCount === 1 ? 'bg-move-navy-900 text-white border-move-navy-900' : 'bg-white text-slate-700 hover:bg-slate-100'}`;
      }
      if (stSig2) {
        stSig2.className = `px-2 py-0.5 rounded-md border font-bold transition ${activeSigCount === 2 ? 'bg-move-navy-900 text-white border-move-navy-900' : 'bg-white text-slate-700 hover:bg-slate-100'}`;
      }

      const activePill = 'bg-emerald-600 text-white border-emerald-600';
      const inactivePill = 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100';

      const qGold = document.getElementById('btnQuickToggleGoldSeal');
      const stSeal = document.getElementById('stageBtnSeal');
      if (qGold) qGold.className = `px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${t.header.goldSeal ? activePill : inactivePill}`;
      if (stSeal) stSeal.className = `px-2 py-0.5 rounded-md border font-semibold transition ${t.header.goldSeal ? activePill : inactivePill}`;

      const hasCorners = t.theme.cornerOrnament && t.theme.cornerOrnament !== 'none';
      const qCorner = document.getElementById('btnQuickToggleCorner');
      const stCorner = document.getElementById('stageBtnCorner');
      if (qCorner) qCorner.className = `px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${hasCorners ? activePill : inactivePill}`;
      if (stCorner) stCorner.className = `px-2 py-0.5 rounded-md border font-semibold transition ${hasCorners ? activePill : inactivePill}`;

      const qQr = document.getElementById('btnQuickToggleQr');
      const stQr = document.getElementById('stageBtnQr');
      if (qQr) qQr.className = `px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${t.signatories.showQrSerial ? activePill : inactivePill}`;
      if (stQr) stQr.className = `px-2 py-0.5 rounded-md border font-semibold transition ${t.signatories.showQrSerial ? activePill : inactivePill}`;

      // Images & Watermark
      const qEvt = document.getElementById('btnQuickToggleEventLogo');
      const stEvt = document.getElementById('stageBtnEventLogo');
      if (qEvt) qEvt.className = `px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${t.header.showEventLogo ? activePill : inactivePill}`;
      if (stEvt) stEvt.className = `px-2 py-0.5 rounded-md border font-bold transition flex items-center gap-1 ${t.header.showEventLogo ? activePill : inactivePill}`;

      const chkLeft = document.getElementById('chkShowLeftLogo');
      if (chkLeft) chkLeft.checked = t.header.showLeftLogo !== false;
      const chkRight = document.getElementById('chkShowRightLogo');
      if (chkRight) chkRight.checked = t.header.showRightLogo !== false;
      const chkEvt = document.getElementById('chkShowEventLogo');
      if (chkEvt) chkEvt.checked = !!t.header.showEventLogo;

      const thEvt = document.getElementById('thumbEventLogo');
      if (thEvt) thEvt.src = t.header.eventLogo || 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png';
      const sldEvt = document.getElementById('sizeEventLogoSlider');
      if (sldEvt) sldEvt.value = t.header.eventLogoWidth || 84;

      const thLeft = document.getElementById('thumbLeftLogo');
      if (thLeft) thLeft.src = t.header.leftLogo || 'CITY%20HALL%20LOGO.png';
      const sldLeft = document.getElementById('sizeLeftLogoSlider');
      if (sldLeft) sldLeft.value = t.header.leftLogoWidth || 76;

      const thRight = document.getElementById('thumbRightLogo');
      if (thRight) thRight.src = t.header.rightLogo || 'MOVE%20BAGUIO%20LOGO.png';
      const sldRight = document.getElementById('sizeRightLogoSlider');
      if (sldRight) sldRight.value = t.header.rightLogoWidth || 76;

      const chkWm = document.getElementById('chkEnableWatermark');
      if (chkWm) chkWm.checked = !!t.header.watermarkEnabled;
      const thWm = document.getElementById('thumbWatermark');
      if (thWm) thWm.src = t.header.watermarkLogo || 'MOVE%20BAGUIO%20LOGO.png';

      const wmOp = t.header.watermarkOpacity !== undefined ? t.header.watermarkOpacity : 12;
      const sldWmOp = document.getElementById('sliderWatermarkOpacity');
      if (sldWmOp) sldWmOp.value = wmOp;
      const lblWmOp = document.getElementById('lblWatermarkOpacity');
      if (lblWmOp) lblWmOp.textContent = wmOp + '%';

      const wmSz = t.header.watermarkSize || 300;
      const sldWmSz = document.getElementById('sliderWatermarkSize');
      if (sldWmSz) sldWmSz.value = wmSz;
      const lblWmSz = document.getElementById('lblWatermarkSize');
      if (lblWmSz) lblWmSz.textContent = wmSz + 'px';

      const wmLayer = t.header.watermarkLayer || 'behind';
      const selWmLayer = document.getElementById('selectWatermarkLayer');
      if (selWmLayer) selWmLayer.value = wmLayer;
      const stSelWmLayer = document.getElementById('stageSelectWatermarkLayer');
      if (stSelWmLayer) {
        stSelWmLayer.value = wmLayer;
        if (t.header.watermarkEnabled) stSelWmLayer.classList.remove('hidden');
        else stSelWmLayer.classList.add('hidden');
      }

      ['behind', 'infront', 'washout', 'inline-top'].forEach(mode => {
        const b = document.getElementById('btnWmLayer-' + mode);
        if (b) {
          if (wmLayer === mode) {
            b.className = 'py-1 px-1.5 rounded border font-bold transition flex items-center justify-center gap-1 bg-move-navy-900 text-white border-move-navy-900 shadow-2xs';
          } else {
            b.className = 'py-1 px-1.5 rounded border font-bold transition flex items-center justify-center gap-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-100';
          }
        }
      });

      const qWm = document.getElementById('btnQuickToggleWatermark');
      const stWm = document.getElementById('stageBtnWatermark');
      if (qWm) qWm.className = `px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${t.header.watermarkEnabled ? activePill : inactivePill}`;
      if (stWm) stWm.className = `px-2 py-0.5 rounded-md border font-semibold transition flex items-center gap-1 ${t.header.watermarkEnabled ? activePill : inactivePill}`;

      const chkSeal = document.getElementById('chkEnableGoldSeal');
      if (chkSeal) chkSeal.checked = !!t.header.goldSeal;
      const selSealPos = document.getElementById('selectGoldSealPos');
      if (selSealPos) selSealPos.value = t.header.goldSealPosition || 'bottom-center';

      // Border & Theme
      const borderPreset = t.theme.borderPreset || (t.theme.borderStyle === 'none' ? 'none' : 'move_classic_double');
      const topSelWholeBorder = document.getElementById('certWholeBorderPresetSelect');
      if (topSelWholeBorder) topSelWholeBorder.value = borderPreset;
      const selWholeBorder = document.getElementById('selectWholeBorderPreset');
      if (selWholeBorder) selWholeBorder.value = borderPreset;

      const selBorder = document.getElementById('selectBorderStyle');
      if (selBorder) selBorder.value = t.theme.borderStyle || 'double';
      const sldBorderW = document.getElementById('sliderBorderWidth');
      if (sldBorderW) sldBorderW.value = t.theme.borderWidth || 8;

      const pkOut = document.getElementById('pickerOuterBorder');
      if (pkOut) pkOut.value = t.theme.outerBorderColor || '#091b38';
      const lblOut = document.getElementById('lblOuterBorderColor');
      if (lblOut) lblOut.textContent = t.theme.outerBorderColor || '#091b38';

      const pkIn = document.getElementById('pickerInnerBorder');
      if (pkIn) pkIn.value = t.theme.innerBorderColor || '#f97316';
      const lblIn = document.getElementById('lblInnerBorderColor');
      if (lblIn) lblIn.textContent = t.theme.innerBorderColor || '#f97316';

      const selBg = document.getElementById('selectBgTone');
      if (selBg) selBg.value = t.theme.backgroundColor || '#ffffff';

      const selCorner = document.getElementById('selectCornerOrnament');
      if (selCorner) selCorner.value = t.theme.cornerOrnament || 'none';
      const pkCorner = document.getElementById('pickerCornerColor');
      if (pkCorner) pkCorner.value = t.theme.cornerColor || '#f97316';

      updateOffsetLabels();
    }

    // --- WHOLE-CERTIFICATE DECORATIVE PERIMETER BORDER OVERLAY ---
    function buildWholeCertBorderOverlayHtml(t, getRemoveBtnHtml) {
      const preset = t.theme.borderPreset || (t.theme.borderStyle === 'none' ? 'none' : 'move_classic_double');
      if (preset === 'none' || t.theme.borderStyle === 'none') return '';

      const outerC = t.theme.outerBorderColor || '#091b38';
      const innerC = t.theme.innerBorderColor || '#f97316';
      const rmBtn = getRemoveBtnHtml ? getRemoveBtnHtml('wholeBorder', 'Whole Certificate Border') : '';

      if (preset === 'move_classic_double') {
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[10px] border-2" style="border-color: ${innerC};"></div>
            <div class="absolute inset-[15px] border" style="border-color: ${outerC}; opacity: 0.25;"></div>
            <!-- Corner L-Brackets -->
            <div class="absolute top-[6px] left-[6px] w-7 h-7 border-t-4 border-l-4" style="border-color: ${innerC};"></div>
            <div class="absolute top-[6px] right-[6px] w-7 h-7 border-t-4 border-r-4" style="border-color: ${innerC};"></div>
            <div class="absolute bottom-[6px] left-[6px] w-7 h-7 border-b-4 border-l-4" style="border-color: ${innerC};"></div>
            <div class="absolute bottom-[6px] right-[6px] w-7 h-7 border-b-4 border-r-4" style="border-color: ${innerC};"></div>
            <!-- Midpoint Diamond Accents -->
            <div class="absolute top-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border" style="background-color: ${innerC}; border-color: ${outerC};"></div>
            <div class="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border" style="background-color: ${innerC}; border-color: ${outerC};"></div>
          </div>
        `;
      }

      if (preset === 'royal_gold_filigree') {
        const cornerSvg = (rot) => `
          <svg viewBox="0 0 60 60" class="w-12 h-12" style="transform: rotate(${rot}deg);">
            <path d="M2,2 L52,2 L52,6 L6,6 L6,52 L2,52 Z" fill="${innerC}"/>
            <path d="M10,10 L42,10 C30,18 18,30 10,42 Z" fill="none" stroke="${outerC}" stroke-width="1.8"/>
            <circle cx="16" cy="16" r="3.5" fill="${innerC}"/>
            <path d="M10,24 Q24,24 24,10" fill="none" stroke="${innerC}" stroke-width="1.5"/>
          </svg>
        `;
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[8px] border-2" style="border-color: ${innerC};"></div>
            <div class="absolute inset-[13px] border border-dashed" style="border-color: ${innerC}; opacity: 0.75;"></div>
            <div class="absolute inset-[18px] border" style="border-color: ${outerC}; opacity: 0.45;"></div>
            <div class="absolute top-[7px] left-[7px]">${cornerSvg(0)}</div>
            <div class="absolute top-[7px] right-[7px]">${cornerSvg(90)}</div>
            <div class="absolute bottom-[7px] right-[7px]">${cornerSvg(180)}</div>
            <div class="absolute bottom-[7px] left-[7px]">${cornerSvg(270)}</div>
            <div class="absolute top-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1">
              <span class="w-2 h-2 rotate-45 inline-block" style="background-color: ${outerC};"></span>
              <span class="w-3 h-3 rotate-45 inline-block border" style="background-color: ${innerC}; border-color: ${outerC};"></span>
              <span class="w-2 h-2 rotate-45 inline-block" style="background-color: ${outerC};"></span>
            </div>
            <div class="absolute bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1">
              <span class="w-2 h-2 rotate-45 inline-block" style="background-color: ${outerC};"></span>
              <span class="w-3 h-3 rotate-45 inline-block border" style="background-color: ${innerC}; border-color: ${outerC};"></span>
              <span class="w-2 h-2 rotate-45 inline-block" style="background-color: ${outerC};"></span>
            </div>
          </div>
        `;
      }

      if (preset === 'diploma_architectural') {
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[9px] border-[3px]" style="border-color: ${outerC};"></div>
            <div class="absolute inset-[15px] border-[1.5px]" style="border-color: ${innerC};"></div>
            <!-- Architectural Stepped Corner Boxes -->
            <div class="absolute top-[9px] left-[9px] w-6 h-6 border-2" style="border-color: ${outerC}; background-color: ${innerC}22;"></div>
            <div class="absolute top-[9px] right-[9px] w-6 h-6 border-2" style="border-color: ${outerC}; background-color: ${innerC}22;"></div>
            <div class="absolute bottom-[9px] left-[9px] w-6 h-6 border-2" style="border-color: ${outerC}; background-color: ${innerC}22;"></div>
            <div class="absolute bottom-[9px] right-[9px] w-6 h-6 border-2" style="border-color: ${outerC}; background-color: ${innerC}22;"></div>
            <div class="absolute top-[15px] left-[15px] w-3.5 h-3.5 border" style="border-color: ${innerC};"></div>
            <div class="absolute top-[15px] right-[15px] w-3.5 h-3.5 border" style="border-color: ${innerC};"></div>
            <div class="absolute bottom-[15px] left-[15px] w-3.5 h-3.5 border" style="border-color: ${innerC};"></div>
            <div class="absolute bottom-[15px] right-[15px] w-3.5 h-3.5 border" style="border-color: ${innerC};"></div>
          </div>
        `;
      }

      if (preset === 'modern_ribbon_corner') {
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none overflow-hidden">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[10px] border-2" style="border-color: ${outerC}45;"></div>
            <div class="absolute inset-[15px] border" style="border-color: ${innerC}80;"></div>
            <!-- Top-Left & Bottom-Right Geometric Ribbons -->
            <svg viewBox="0 0 100 100" class="absolute top-0 left-0 w-24 h-24">
              <polygon points="0,0 85,0 0,85" fill="${outerC}"/>
              <polygon points="0,65 65,0 88,0 0,88" fill="${innerC}"/>
              <polygon points="0,0 45,0 0,45" fill="${outerC}"/>
            </svg>
            <svg viewBox="0 0 100 100" class="absolute top-0 right-0 w-20 h-20" style="transform: scaleX(-1);">
              <polygon points="0,0 70,0 0,70" fill="${outerC}" opacity="0.9"/>
              <polygon points="0,50 50,0 72,0 0,72" fill="${innerC}"/>
            </svg>
            <svg viewBox="0 0 100 100" class="absolute bottom-0 left-0 w-20 h-20" style="transform: scaleY(-1);">
              <polygon points="0,0 70,0 0,70" fill="${outerC}" opacity="0.9"/>
              <polygon points="0,50 50,0 72,0 0,72" fill="${innerC}"/>
            </svg>
            <svg viewBox="0 0 100 100" class="absolute bottom-0 right-0 w-24 h-24" style="transform: scale(-1, -1);">
              <polygon points="0,0 85,0 0,85" fill="${outerC}"/>
              <polygon points="0,65 65,0 88,0 0,88" fill="${innerC}"/>
              <polygon points="0,0 45,0 0,45" fill="${outerC}"/>
            </svg>
          </div>
        `;
      }

      if (preset === 'kitchen_culinary_artisan') {
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[8px] border-2" style="border-color: ${innerC};"></div>
            <div class="absolute inset-[13px] border-[3px] border-double" style="border-color: ${outerC};"></div>
            <!-- Warm Artisan Corner Brackets & Studs -->
            <div class="absolute top-[6px] left-[6px] w-9 h-9 border-t-4 border-l-4 rounded-tl-sm" style="border-color: ${outerC};"></div>
            <div class="absolute top-[6px] right-[6px] w-9 h-9 border-t-4 border-r-4 rounded-tr-sm" style="border-color: ${outerC};"></div>
            <div class="absolute bottom-[6px] left-[6px] w-9 h-9 border-b-4 border-l-4 rounded-bl-sm" style="border-color: ${outerC};"></div>
            <div class="absolute bottom-[6px] right-[6px] w-9 h-9 border-b-4 border-r-4 rounded-br-sm" style="border-color: ${outerC};"></div>
            <div class="absolute top-[16px] left-[16px] w-2.5 h-2.5 rotate-45" style="background-color: ${innerC};"></div>
            <div class="absolute top-[16px] right-[16px] w-2.5 h-2.5 rotate-45" style="background-color: ${innerC};"></div>
            <div class="absolute bottom-[16px] left-[16px] w-2.5 h-2.5 rotate-45" style="background-color: ${innerC};"></div>
            <div class="absolute bottom-[16px] right-[16px] w-2.5 h-2.5 rotate-45" style="background-color: ${innerC};"></div>
            <!-- Top & Bottom Artisan Center Rules -->
            <div class="absolute top-[6px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2">
              <span class="w-8 h-0.5 inline-block" style="background-color: ${innerC};"></span>
              <span class="w-2.5 h-2.5 rotate-45 inline-block" style="background-color: ${outerC};"></span>
              <span class="w-8 h-0.5 inline-block" style="background-color: ${innerC};"></span>
            </div>
            <div class="absolute bottom-[6px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2">
              <span class="w-8 h-0.5 inline-block" style="background-color: ${innerC};"></span>
              <span class="w-2.5 h-2.5 rotate-45 inline-block" style="background-color: ${outerC};"></span>
              <span class="w-8 h-0.5 inline-block" style="background-color: ${innerC};"></span>
            </div>
          </div>
        `;
      }

      if (preset === 'baguio_heritage_crest') {
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[8px] border-2" style="border-color: ${outerC};"></div>
            <div class="absolute inset-[12px] border-2 border-dashed" style="border-color: ${innerC};"></div>
            <div class="absolute inset-[17px] border" style="border-color: ${outerC}; opacity: 0.65;"></div>
            <!-- Cordillera Diamond Corner Motifs -->
            <div class="absolute top-[7px] left-[7px] w-6 h-6 flex items-center justify-center" style="background-color: ${outerC};">
              <div class="w-3 h-3 rotate-45" style="background-color: ${innerC};"></div>
            </div>
            <div class="absolute top-[7px] right-[7px] w-6 h-6 flex items-center justify-center" style="background-color: ${outerC};">
              <div class="w-3 h-3 rotate-45" style="background-color: ${innerC};"></div>
            </div>
            <div class="absolute bottom-[7px] left-[7px] w-6 h-6 flex items-center justify-center" style="background-color: ${outerC};">
              <div class="w-3 h-3 rotate-45" style="background-color: ${innerC};"></div>
            </div>
            <div class="absolute bottom-[7px] right-[7px] w-6 h-6 flex items-center justify-center" style="background-color: ${outerC};">
              <div class="w-3 h-3 rotate-45" style="background-color: ${innerC};"></div>
            </div>
          </div>
        `;
      }

      if (preset === 'minimal_executive') {
        return `
          <div class="cert-removable-item absolute inset-0 pointer-events-none z-[5] select-none">
            ${rmBtn ? `<div class="pointer-events-auto absolute top-2 right-2 z-50">${rmBtn}</div>` : ''}
            <div class="absolute inset-[14px] border" style="border-color: ${outerC};"></div>
            <div class="absolute inset-[18px] border" style="border-color: ${innerC}; opacity: 0.55;"></div>
          </div>
        `;
      }

      return '';
    }

    // --- BUILD CERTIFICATE INNER HTML (SINGLE MASTER BORDER, NO CLUTTER) ---
    function buildCertificateInnerHtml(recipient, act, serialNo, tpl, isPrint) {
      const t = normalizeTemplateFields(tpl || currentCertTemplate);
      const offsets = t.offsets || {};

      function getOffsetStyle(key) {
        if (!offsets[key]) return '';
        const x = offsets[key].x || 0;
        const y = offsets[key].y || 0;
        if (x === 0 && y === 0) return '';
        return `transform: translate(${x}px, ${y}px);`;
      }

      function getDragAttrs(key) {
        if (isPrint) return '';
        return `data-cert-element="${key}"`;
      }

      function getEditableAttrs(fieldKey) {
        if (isPrint) return '';
        return `contenteditable="true" data-cert-field="${fieldKey}" spellcheck="false" class="cert-inline-editable" title="Click directly to customize text"`;
      }

      function getRemoveBtnHtml(elementKey, label) {
        if (isPrint) return '';
        return `<button type="button" onclick="quickRemoveCertElement(event, '${elementKey}')" title="Remove ${label}" class="cert-remove-badge absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black items-center justify-center shadow-md z-50 cursor-pointer leading-none">&times;</button>`;
      }

      const fontClassTitle = t.title.fontFamily === 'cinzel' ? 'font-cinzel' : (t.title.fontFamily === 'playfair' ? 'font-serif-title' : 'font-sans');
      const fontClassRec = t.recipient.fontFamily === 'cinzel' ? 'font-cinzel' : (t.recipient.fontFamily === 'playfair' ? 'font-serif-title' : 'font-sans');

      const effectiveEventTitle = (t.citation.customEventTitle !== undefined && t.citation.customEventTitle.trim() !== '')
        ? t.citation.customEventTitle
        : (act.title || 'Orientation on RA 9262 & Role of Men in VAW-Free Communities');
      const effectiveDate = (t.citation.customDate !== undefined && t.citation.customDate.trim() !== '')
        ? t.citation.customDate
        : (act.date || 'October 15, 2026');
      const effectiveVenue = (t.citation.customVenue !== undefined && t.citation.customVenue.trim() !== '')
        ? t.citation.customVenue
        : (act.venue || 'Baguio City Hall');
      const effectiveDuration = (t.citation.customDuration !== undefined && t.citation.customDuration.trim() !== '')
        ? t.citation.customDuration
        : (act.duration || '8 Hours');

      let detailText = t.citation.detailTemplate !== undefined
        ? t.citation.detailTemplate
        : 'Conducted on {date} at {venue} with an equivalent duration of {duration}.';
      detailText = detailText.replace(/\{date\}/gi, `<strong>${effectiveDate}</strong>`)
                             .replace(/\{venue\}/gi, effectiveVenue)
                             .replace(/\{duration\}/gi, `<strong>${effectiveDuration}</strong>`);

      // Whole-certificate perimeter border preset overlay
      const wholeBorderOverlayHtml = buildWholeCertBorderOverlayHtml(t, getRemoveBtnHtml);

      // Corner ornaments (removable)
      let cornerOrnamentHtml = '';
      if (t.theme.cornerOrnament === 'certificate' || t.theme.cornerOrnament === 'star') {
        const iconCls = t.theme.cornerOrnament === 'certificate' ? 'fa-certificate' : 'fa-star';
        cornerOrnamentHtml = `
          <div class="cert-removable-item absolute top-3.5 left-3.5 text-lg z-20" style="color: ${t.theme.cornerColor};">
            <i class="fa-solid ${iconCls}"></i>
            ${getRemoveBtnHtml('cornerOrnament', 'Corner Emblems')}
          </div>
          <div class="cert-removable-item absolute top-3.5 right-3.5 text-lg z-20" style="color: ${t.theme.cornerColor};">
            <i class="fa-solid ${iconCls}"></i>
            ${getRemoveBtnHtml('cornerOrnament', 'Corner Emblems')}
          </div>
          <div class="cert-removable-item absolute bottom-3.5 left-3.5 text-lg z-20" style="color: ${t.theme.cornerColor};">
            <i class="fa-solid ${iconCls}"></i>
            ${getRemoveBtnHtml('cornerOrnament', 'Corner Emblems')}
          </div>
          <div class="cert-removable-item absolute bottom-3.5 right-3.5 text-lg z-20" style="color: ${t.theme.cornerColor};">
            <i class="fa-solid ${iconCls}"></i>
            ${getRemoveBtnHtml('cornerOrnament', 'Corner Emblems')}
          </div>
        `;
      }

      // Center background watermark (Word-Style Layering: Behind Text, In Front of Text, Washout, Top & Bottom, Lower Center)
      let watermarkHtml = '';
      let watermarkInlineTopHtml = '';
      if (t.header.watermarkEnabled && t.header.watermarkLogo) {
        const wmLayer = t.header.watermarkLayer || 'behind';
        const wmSize = t.header.watermarkSize || 300;
        const wmOpacity = (t.header.watermarkOpacity !== undefined ? t.header.watermarkOpacity : 12) / 100;

        if (wmLayer === 'inline-top') {
          // Word-Style "Top and Bottom" / "In Line with Text" (placed cleanly above the Certificate Title without overlapping text)
          const inlineHeight = Math.min(130, Math.round(wmSize * 0.42));
          watermarkInlineTopHtml = `
            <div class="flex items-center justify-center pt-2 relative z-10 select-none">
              <div class="cert-watermark-box cert-removable-item"
                   style="width: ${wmSize}px; height: ${inlineHeight}px; opacity: ${wmOpacity}; ${getOffsetStyle('watermark')}"
                   ${getDragAttrs('watermark')}>
                ${getRemoveBtnHtml('watermark', 'Watermark')}
                <img src="${t.header.watermarkLogo}" alt="Watermark" class="w-full h-full object-contain pointer-events-none select-none">
              </div>
            </div>
          `;
        } else {
          // Floating Layer Modes: 'behind' (z-0), 'washout' (z-0 multiply), 'bottom-behind' (z-0 lower), or 'infront' (z-30)
          const layerClass = wmLayer === 'infront' ? 'wm-layer-infront' :
                            (wmLayer === 'washout' ? 'wm-layer-washout' :
                            (wmLayer === 'bottom-behind' ? 'wm-layer-bottom-behind' : 'wm-layer-behind'));
          watermarkHtml = `
            <div class="cert-watermark-overlay ${layerClass} select-none">
              <div class="cert-watermark-box cert-removable-item"
                   style="width: ${wmSize}px; height: ${wmSize}px; opacity: ${wmOpacity}; ${getOffsetStyle('watermark')}"
                   ${getDragAttrs('watermark')}>
                ${getRemoveBtnHtml('watermark', 'Watermark')}
                <img src="${t.header.watermarkLogo}" alt="Watermark" class="w-full h-full object-contain pointer-events-none select-none">
              </div>
            </div>
          `;
        }
      }

      // Gold seal badge (removable)
      let goldSealHtml = '';
      if (t.header.goldSeal) {
        let posClass = 'bottom-6 left-1/2 -translate-x-1/2';
        if (t.header.goldSealPosition === 'bottom-left') posClass = 'bottom-6 left-12';
        if (t.header.goldSealPosition === 'bottom-right') posClass = 'bottom-6 right-12';

        goldSealHtml = `
          <div class="cert-removable-item absolute ${posClass} z-20" style="${getOffsetStyle('goldSeal')}" ${getDragAttrs('goldSeal')}>
            ${getRemoveBtnHtml('goldSeal', 'Gold Seal')}
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-md flex items-center justify-center border-2 border-amber-300">
              <div class="w-full h-full rounded-full border border-amber-700/40 flex flex-col items-center justify-center text-center p-1 bg-amber-500/10">
                <i class="fa-solid fa-award text-amber-900 text-lg sm:text-xl"></i>
                <span class="text-[7px] font-black uppercase tracking-tighter text-amber-950 font-cinzel leading-none mt-0.5">SEAL OF MOVE</span>
              </div>
            </div>
          </div>
        `;
      }

      const recDisplayName = t.recipient.customName || recipient.name || 'JUAN M. DELA CRUZ';
      const recDisplaySub = t.recipient.customSubtitle || `${recipient.office || 'CBAO'} • ${recipient.position || 'Civil Service Personnel'}`;

      if (t.docCategory === 'appearance' || (t.title && t.title.type === 'appearance')) {
        const gender = (recipient && recipient.gender) ? recipient.gender : 'M';
        const honorific = gender === 'F' ? 'MS. ' : 'MR. ';
        const sigName = (t.signatories && t.signatories.sig1Name) || 'BENJAMIN B. MAGALONG';
        const sigTitle1 = (t.signatories && t.signatories.sig1Title) || 'City Mayor';
        const sigTitle2 = (t.signatories && t.signatories.sig1Office) || 'LCAT-VAWC Chairperson';
        const sigImg = (t.signatories && t.signatories.sig1SignatureImage) || 'signature%20(15).png';
        const initials = (t.citation && t.citation.initials) || '/drmo/ctb';
        const purposeText = (t.citation && t.citation.purposeText) || 'This certification is issued upon the request of the above-named individual for whatever lawful purpose it may serve.';
        const issueDateText = (t.citation && t.citation.issueDateText) || `Issued this ${effectiveDate}, Baguio City, Philippines.`;
        const breathePos = (t.citation && t.citation.breatheBaguioPosition) || 'footer';

        return `
          ${watermarkHtml}

          <!-- CA Header Section (Logos & Official Subtext) -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-700 relative z-10 w-full"
               style="${getOffsetStyle('header')}" ${getDragAttrs('header')}>
            <div class="cert-removable-item flex items-center justify-center shrink-0 relative"
                 style="width: ${t.header.leftLogoWidth || 54}px; height: ${t.header.leftLogoWidth || 54}px; ${getOffsetStyle('leftLogo')}"
                 ${getDragAttrs('leftLogo')}>
              ${getRemoveBtnHtml('leftLogo', 'City Hall Logo')}
              <img src="${t.header.leftLogo || 'CITY%20HALL%20LOGO.png'}" alt="City Government of Baguio" class="w-full h-full object-contain pointer-events-none select-none">
            </div>

            <div class="text-center px-2 flex-1 leading-tight">
              <div class="font-bold uppercase tracking-wider text-slate-800"
                   style="font-size: ${t.header.republicFontSize || 9.5}px;"
                   ${getEditableAttrs('header.republicText')}>
                ${t.header.republicText || 'Republic of the Philippines'}
              </div>
              <div class="font-black uppercase tracking-tight text-slate-900 mt-0.5"
                   style="font-size: ${t.header.cityFontSize || 12}px;"
                   ${getEditableAttrs('header.cityText')}>
                ${t.header.cityText || 'CITY GOVERNMENT OF BAGUIO'}
              </div>
              <div class="font-extrabold uppercase tracking-wide text-move-orange-600 mt-0.5"
                   style="font-size: ${t.header.chapterFontSize || 10}px;"
                   ${getEditableAttrs('header.chapterText')}>
                ${t.header.chapterText || 'Men Opposed to Violence Against Women Everywhere'}
              </div>
              <div class="text-slate-500 font-semibold tracking-wider uppercase mt-0.5"
                   style="font-size: ${t.header.subFontSize || 8.5}px;"
                   ${getEditableAttrs('header.subText')}>
                ${t.header.subText || 'Baguio City Chapter • Local Committee on Anti-VAWC'}
              </div>
            </div>

            <div class="cert-removable-item flex items-center justify-center shrink-0 relative"
                 style="width: ${t.header.rightLogoWidth || 54}px; height: ${t.header.rightLogoWidth || 54}px; ${getOffsetStyle('rightLogo')}"
                 ${getDragAttrs('rightLogo')}>
              ${getRemoveBtnHtml('rightLogo', 'MOVE Logo')}
              <img src="${t.header.rightLogo || 'MOVE%20BAGUIO%20LOGO.png'}" alt="MOVE Baguio Chapter" class="w-full h-full object-contain pointer-events-none select-none">
            </div>
          </div>

          <!-- Document Title -->
          <div class="text-center my-3 relative z-10" style="${getOffsetStyle('title')}" ${getDragAttrs('title')}>
            <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-wider uppercase font-cinzel inline-block"
                style="letter-spacing: 2px;"
                ${getEditableAttrs('title.customTitle')}>
              ${t.title.customTitle || 'CERTIFICATE OF APPEARANCE'}
            </h1>
          </div>

          <!-- Certification Body -->
          <div class="space-y-2.5 px-3 sm:px-6 relative z-10 text-[11.5px] leading-relaxed text-slate-900 font-sans text-justify"
               style="${getOffsetStyle('citation')}" ${getDragAttrs('citation')}>
            <p style="text-indent: 28px;">
              <span ${getEditableAttrs('citation.leadText')}>${t.citation.leadText || 'This is to certify that'}</span>
              <strong>${honorific}<span ${getEditableAttrs('recipient.customName')}>${recDisplayName}</span></strong>,
              holding the position of <strong>${recipient.position || 'OFFICIAL POSITION TITLE'}</strong>
              under <strong>${recipient.office || 'DEPARTMENT / OFFICE'}</strong>,
              was duly verified to have attended and participated in the activity entitled
              “<strong><span ${getEditableAttrs('citation.customEventTitle')}>${effectiveEventTitle}</span></strong>,”
              held on ${effectiveDate}, at ${effectiveVenue}.
            </p>

            <p style="text-indent: 28px;" ${getEditableAttrs('citation.purposeText')}>
              ${purposeText}
            </p>

            <p class="text-left pt-1" ${getEditableAttrs('citation.issueDateText')}>
              ${issueDateText}
            </p>
          </div>

          <!-- Signatory & Municipal Footer -->
          <div class="pt-3 border-t border-slate-300 relative z-10 flex items-end justify-between px-4 sm:px-8"
               style="${getOffsetStyle('signatories')}" ${getDragAttrs('signatories')}>
            <!-- Initials & Campaign Branding -->
            <div class="flex items-center gap-3">
              <span class="text-[9.5px] font-mono text-slate-500 lowercase tracking-wider inline-block"
                    ${getEditableAttrs('citation.initials')}>
                ${initials}
              </span>
              ${(breathePos === 'footer' || breathePos === 'bottom-left') ? `
                <img src="BREATHE_BAGUIO.png" alt="#breathe BAGUIO" style="width: 85px;" class="object-contain pointer-events-none select-none">
              ` : ''}
            </div>

            <!-- Mayor Signatory Block -->
            <div class="text-center relative min-w-[200px]">
              ${sigImg ? `
                <div class="absolute left-1/2 -translate-x-1/2 -top-10 pointer-events-none select-none z-10">
                  <img src="${sigImg}" alt="Mayor Signature" style="width: 130px; max-height: 48px;" class="object-contain">
                </div>
              ` : ''}
              <div class="font-bold text-xs uppercase text-slate-900 border-b border-slate-900 pb-0.5 inline-block min-w-[190px]"
                   ${getEditableAttrs('signatories.sig1Name')}>
                ${sigName}
              </div>
              <div class="text-[10px] font-semibold text-slate-700 mt-0.5" ${getEditableAttrs('signatories.sig1Title')}>
                ${sigTitle1}
              </div>
              <div class="text-[9.5px] text-slate-500" ${getEditableAttrs('signatories.sig1Office')}>
                ${sigTitle2}
              </div>
            </div>

            <!-- Optional Right Campaign Emblem -->
            ${breathePos === 'bottom-right' ? `
              <div class="flex items-center justify-end">
                <img src="BREATHE_BAGUIO.png" alt="#breathe BAGUIO" style="width: 85px;" class="object-contain pointer-events-none select-none">
              </div>
            ` : '<div class="w-8"></div>'}
          </div>
        `;
      }

      // Build Signatories & QR Footer dynamically (Single-line non-wrapping names & customizable sizes)
      const sigNameSize = t.signatories.fontSize || 13;
      const sigTitleSize = t.signatories.titleFontSize || Math.max(9, sigNameSize - 3);
      const sigLineWidth = t.signatories.lineWidth || 210;
      const defaultSigImgSize = t.signatories.sigImageSize || 56;
      const footerItems = [];

      function buildSignatoryBlockHtml(num, sigImg, sigName, sigTitle, sigOffice) {
        const hasOffice = sigOffice && sigOffice.trim().length > 0;
        const sigImgHeight = t.signatories[`sig${num}ImageHeight`] || t.signatories[`sig${num}ImageSize`] || t.signatories.sigImageHeight || defaultSigImgSize;
        const sigImgWidth = t.signatories[`sig${num}ImageWidth`] || t.signatories.sigImageWidth || 150;
        const fitMode = t.signatories.sigFitMode || 'fill';
        const topOffsetPx = Math.round(sigImgHeight * 0.72);
        return `
          <div class="cert-removable-item text-center relative px-2" style="${getOffsetStyle('sig' + num)}" ${getDragAttrs('sig' + num)}>
            ${getRemoveBtnHtml('sig' + num, 'Signatory ' + num)}
            ${sigImg ? `
              <div class="cert-removable-item absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center pointer-events-auto"
                   style="top: -${topOffsetPx}px; width: ${sigImgWidth}px; height: ${sigImgHeight}px; ${getOffsetStyle('sig' + num + 'Img')}"
                   ${getDragAttrs('sig' + num + 'Img')}>
                ${getRemoveBtnHtml('sig' + num + 'Img', 'Signature ' + num + ' PNG')}
                <img src="${sigImg}"
                     alt="Signature ${num}"
                     style="width: ${sigImgWidth}px !important; height: ${sigImgHeight}px !important; object-fit: ${fitMode}; max-width: none !important; max-height: none !important; display: block;"
                     class="pointer-events-none mx-auto select-none">
              </div>
            ` : ''}
            <div class="px-3 border-b-2 mx-auto pb-1 font-bold inline-block whitespace-nowrap"
                 style="min-width: ${sigLineWidth}px; font-size: ${sigNameSize}px; border-color: ${t.theme.outerBorderColor || '#091b38'}; color: ${t.theme.outerBorderColor || '#091b38'};"
                 ${getEditableAttrs('signatories.sig' + num + 'Name')}>
              ${sigName}
            </div>
            <div class="font-bold mt-1 uppercase tracking-wider block whitespace-nowrap"
                 style="font-size: ${sigTitleSize}px; color: ${t.theme.innerBorderColor || '#f97316'};"
                 ${getEditableAttrs('signatories.sig' + num + 'Title')}>
              ${sigTitle}
            </div>
            ${hasOffice ? `
            <div class="text-slate-500 block whitespace-nowrap" style="font-size: ${t.signatories.officeFontSize || 9}px;" ${getEditableAttrs('signatories.sig' + num + 'Office')}>
              ${sigOffice}
            </div>` : ''}
          </div>
        `;
      }

      if (t.signatories.sig1Enabled !== false) {
        footerItems.push(buildSignatoryBlockHtml(
          1,
          t.signatories.sig1SignatureImage,
          t.signatories.sig1Name !== undefined ? t.signatories.sig1Name : 'MARIO D. GANGA JR.',
          t.signatories.sig1Title !== undefined ? t.signatories.sig1Title : 'MOVE Chapter President',
          t.signatories.sig1Office || ''
        ));
      }

      if (t.signatories.showQrSerial) {
        footerItems.push(`
          <div class="cert-removable-item flex flex-col items-center text-center relative px-2">
            ${getRemoveBtnHtml('qrSerial', 'QR & Serial No.')}
            <div class="w-11 h-11 p-1 rounded-lg border flex items-center justify-center text-white shadow-2xs"
                 style="background-color: ${t.theme.outerBorderColor || '#091b38'}; border-color: ${t.theme.innerBorderColor || '#f97316'};">
              <i class="fa-solid fa-qrcode text-2xl"></i>
            </div>
            <div class="text-[8px] font-mono text-slate-500 mt-1 font-bold">${serialNo}</div>
          </div>
        `);
      }

      if (t.signatories.sig3Enabled) {
        footerItems.push(buildSignatoryBlockHtml(
          3,
          t.signatories.sig3SignatureImage,
          t.signatories.sig3Name !== undefined ? t.signatories.sig3Name : 'HON. FAUSTINO A. OLOWAN',
          t.signatories.sig3Title !== undefined ? t.signatories.sig3Title : 'City Vice Mayor',
          t.signatories.sig3Office || ''
        ));
      }

      if (t.signatories.sig2Enabled !== false) {
        footerItems.push(buildSignatoryBlockHtml(
          2,
          t.signatories.sig2SignatureImage,
          t.signatories.sig2Name !== undefined ? t.signatories.sig2Name : 'HON. BENJAMIN B. MAGALONG',
          t.signatories.sig2Title !== undefined ? t.signatories.sig2Title : 'City Mayor',
          t.signatories.sig2Office || ''
        ));
      }

      let footerJustifyClass = 'justify-between px-4 sm:px-8';
      if (footerItems.length === 1) {
        footerJustifyClass = 'justify-center px-4';
      } else if (footerItems.length === 2 && !t.signatories.showQrSerial) {
        footerJustifyClass = 'justify-around px-6 sm:px-12';
      }

      return `
        ${wholeBorderOverlayHtml}
        ${cornerOrnamentHtml}
        ${watermarkHtml}
        ${goldSealHtml}

        <!-- Header Section -->
        <div class="text-center pt-2 sm:pt-4 px-4 relative z-10" style="${getOffsetStyle('header')}" ${getDragAttrs('header')}>
          <div class="flex items-center justify-center gap-4 sm:gap-8">
            <!-- Left Logo (Clean, No Border Box) -->
            ${t.header.showLeftLogo !== false ? `
            <div class="cert-removable-item flex items-center justify-center shrink-0 relative"
                 style="width: ${t.header.leftLogoWidth || 76}px; height: ${t.header.leftLogoWidth || 76}px; ${getOffsetStyle('leftLogo')}"
                 ${getDragAttrs('leftLogo')}>
              ${getRemoveBtnHtml('leftLogo', 'Left Logo')}
              <img src="${t.header.leftLogo || 'CITY%20HALL%20LOGO.png'}" alt="Left Logo" class="w-full h-full object-contain pointer-events-none">
            </div>` : ''}

            <!-- Header Texts -->
            <div class="text-center">
              <div class="font-bold tracking-widest text-slate-500 uppercase"
                   style="font-size: ${t.header.republicFontSize || 11}px;"
                   ${getEditableAttrs('header.republicText')}>${t.header.republicText !== undefined ? t.header.republicText : 'Republic of the Philippines'}</div>
              <div class="font-black tracking-widest uppercase"
                   style="font-size: ${t.header.cityFontSize || 13}px; color: ${t.theme.outerBorderColor || '#091b38'};"
                   ${getEditableAttrs('header.cityText')}>${t.header.cityText !== undefined ? t.header.cityText : 'City Government of Baguio'}</div>
              <div class="font-black tracking-wider uppercase mt-0.5"
                   style="font-size: ${t.header.chapterFontSize || 12}px; color: ${t.theme.innerBorderColor || '#f97316'};"
                   ${getEditableAttrs('header.chapterText')}>${t.header.chapterText !== undefined ? t.header.chapterText : 'Men Opposed to Violence Against Women Everywhere (MOVE)'}</div>
              <div class="text-slate-400 font-semibold"
                   style="font-size: ${t.header.subFontSize || 9.5}px;"
                   ${getEditableAttrs('header.subText')}>${t.header.subText !== undefined ? t.header.subText : 'City Hall Chapter • Baguio City, Philippines'}</div>
            </div>

            <!-- Right Logo (Clean, No Orange Border Box) -->
            ${t.header.showRightLogo !== false ? `
            <div class="cert-removable-item flex items-center justify-center shrink-0 relative"
                 style="width: ${t.header.rightLogoWidth || 76}px; height: ${t.header.rightLogoWidth || 76}px; ${getOffsetStyle('rightLogo')}"
                 ${getDragAttrs('rightLogo')}>
              ${getRemoveBtnHtml('rightLogo', 'Right Logo')}
              <img src="${t.header.rightLogo || 'MOVE%20BAGUIO%20LOGO.png'}" alt="Right Logo" class="w-full h-full object-contain pointer-events-none">
            </div>` : ''}

            <!-- Event Emblem / Men in the Kitchen 2 Logo (Clean, No Border Box, Draggable & Removable) -->
            ${t.header.showEventLogo ? `
            <div class="cert-removable-item flex items-center justify-center shrink-0 relative"
                 style="width: ${t.header.eventLogoWidth || 84}px; height: ${t.header.eventLogoWidth || 84}px; ${getOffsetStyle('eventLogo')}"
                 ${getDragAttrs('eventLogo')}>
              ${getRemoveBtnHtml('eventLogo', 'Event Logo')}
              <img src="${t.header.eventLogo || 'MEN%20IN%20THE%20KITCHEN%202%20LOGO.png'}" alt="Men in the Kitchen 2 Logo" class="w-full h-full object-contain pointer-events-none">
            </div>` : ''}
          </div>

          ${watermarkInlineTopHtml}

          <!-- Title & Intro -->
          <div class="pt-3 sm:pt-4 relative" style="${getOffsetStyle('title')}" ${getDragAttrs('title')}>
            <h2 class="${fontClassTitle} font-black tracking-wider uppercase inline-block"
                style="font-size: ${t.title.fontSize || 28}px; color: ${t.title.color || t.theme.outerBorderColor || '#091b38'};"
                ${getEditableAttrs('title.customTitle')}>
              ${t.title.customTitle !== undefined ? t.title.customTitle : 'CERTIFICATE OF PARTICIPATION'}
            </h2>
            <div class="w-40 h-1 mx-auto mt-1" style="background: linear-gradient(to right, transparent, ${t.title.accentColor || t.theme.innerBorderColor || '#f97316'}, transparent);"></div>
            <p class="italic text-slate-500 mt-1.5 font-serif-title"
               style="font-size: ${t.title.introFontSize || 12}px;"
               ${getEditableAttrs('title.introText')}>
              ${t.title.introText !== undefined ? t.title.introText : 'This certificate is proudly awarded to'}
            </p>
          </div>
        </div>

        <!-- Recipient Section -->
        <div class="text-center my-2 sm:my-3 px-4 relative z-10" style="${getOffsetStyle('recipient')}" ${getDragAttrs('recipient')}>
          <div class="${fontClassRec} font-black tracking-wide inline-block"
               style="font-size: ${t.recipient.fontSize || 34}px; color: ${t.recipient.color || '#091b38'}; ${t.recipient.underline ? `text-decoration: underline; text-decoration-color: ${t.recipient.underlineColor || '#f97316'}; text-underline-offset: 8px; text-decoration-thickness: 2.5px;` : ''}"
               ${getEditableAttrs('recipient.customName')}>
            ${recDisplayName}
          </div>
          <div class="font-bold pt-2 uppercase tracking-wider block"
               style="font-size: ${t.recipient.subtitleFontSize || 12}px; color: ${t.recipient.subtitleColor || '#ea580c'};"
               ${getEditableAttrs('recipient.customSubtitle')}>
            ${recDisplaySub}
          </div>
        </div>

        <!-- Citation Body Paragraph -->
        <div class="text-center max-w-2xl mx-auto space-y-1.5 px-4 sm:px-6 text-xs sm:text-[13px] leading-relaxed font-serif-title relative z-10"
             style="color: ${t.citation.color || '#334155'}; font-size: ${t.citation.fontSize || 13}px; ${getOffsetStyle('citation')}"
             ${getDragAttrs('citation')}>
          <p ${getEditableAttrs('citation.leadText')}>
            ${t.citation.leadText !== undefined ? t.citation.leadText : 'for actively participating and successfully completing the capacity-building seminar on'}
          </p>
          <p class="font-black uppercase font-sans tracking-tight"
             style="font-size: ${t.citation.eventTitleFontSize || 15}px; color: ${t.theme.outerBorderColor || '#091b38'};"
             ${getEditableAttrs('citation.customEventTitle')}>
            "${effectiveEventTitle}"
          </p>
          <p class="text-slate-600 leading-normal"
             style="font-size: ${t.citation.detailFontSize || 11.5}px;"
             ${getEditableAttrs('citation.detailTemplate')}>
            ${detailText}
          </p>
        </div>

        <!-- Signatures & Verification Footer -->
        <div class="pt-4 sm:pt-6 border-t border-slate-200 pb-2 sm:pb-4 flex items-end ${footerJustifyClass} relative z-10"
             style="${getOffsetStyle('signatories')}" ${getDragAttrs('signatories')}>
          ${footerItems.join('')}
        </div>

        <!-- Inserted Custom Photos / Badges -->
        ${(() => {
          let html = '';
          if (t.insertedPhotos && t.insertedPhotos.length > 0) {
            t.insertedPhotos.forEach(p => {
              const shapeClass = p.shape === 'circle' ? 'shape-circle' : (p.shape === 'rounded' ? 'shape-rounded' : (p.shape === 'square' ? 'shape-square' : 'shape-gold_frame'));
              html += `
                <div class="cert-inserted-photo ${shapeClass} absolute z-25 cursor-move"
                     data-cert-element="${p.id}"
                     style="left: calc(50% - ${(p.width || 110) / 2}px); top: calc(50% - ${(p.height || 110) / 2}px); width: ${p.width || 110}px; height: ${p.height || 110}px; transform: translate(${p.x || 0}px, ${p.y || 0}px);">
                  <img src="${p.src}" alt="${p.name}" class="w-full h-full object-cover pointer-events-none select-none">
                  ${!isPrint ? `<button type="button" onclick="removeCertPhoto('${p.id}')" title="Delete Photo" class="cert-remove-badge">&times;</button>` : ''}
                </div>
              `;
            });
          }
          return html;
        })()}
      `;
    }

    function renderCertificatePreview() {
      const actId = document.getElementById('certActivitySelect') ? document.getElementById('certActivitySelect').value : null;
      const act = activitiesList.find(a => a.id === actId) || activitiesList[0] || {
        id: 'ACT-001',
        title: 'Orientation on RA 9262 & Role of Men in VAW-Free Communities',
        date: 'October 15, 2026',
        venue: 'Baguio City Hall Multi-Purpose Hall',
        duration: '8 Hours',
        participants: []
      };

      const presentList = (act.participants || []).filter(p => p.isPresent);
      const recipient = presentList[certCurrentRecipientIndex] || { name: 'JUAN M. DELA CRUZ', office: 'CBAO', position: 'Administrative Aide' };

      const serialNo = `MOVE-2026-${(act.id || 'ACT-001').replace('ACT-', '')}-${String(certCurrentRecipientIndex + 1).padStart(4, '0')}`;

      const attendeeLbl = document.getElementById('lblPreviewAttendeeSummary');
      if (attendeeLbl) attendeeLbl.textContent = `${currentCertTemplate.recipient.customName || recipient.name} (${recipient.office || 'City Hall'})`;

      const frame = document.getElementById('certificateFrame');
      if (!frame) return;

      const t = currentCertTemplate;

      // Dynamic Paper Aspect Ratio (A5 Landscape for Appearance, A4 Landscape for Participation & Appreciation)
      const isAppearance = (t.docCategory === 'appearance' || (t.title && t.title.type === 'appearance'));
      if (isAppearance) {
        frame.style.aspectRatio = '210/148';
        frame.style.maxWidth = '48rem';
        frame.style.padding = '1.25rem 1.75rem';
      } else {
        frame.style.aspectRatio = '297/210';
        frame.style.maxWidth = '56rem';
        frame.style.padding = '1.5rem 2.5rem';
      }

      // Apply master border and background directly on #certificateFrame
      frame.style.border = (t.theme.borderStyle === 'none') ? 'none' : `${t.theme.borderWidth || 8}px ${t.theme.borderStyle || 'double'} ${t.theme.outerBorderColor || '#091b38'}`;
      frame.style.backgroundColor = t.theme.backgroundColor || '#ffffff';

      // Insert clean inner contents directly into #certificateFrame
      frame.innerHTML = buildCertificateInnerHtml(recipient, act, serialNo, currentCertTemplate, false);

      if (isCertEditMode) {
        frame.classList.add('cert-edit-active');
        if (activeMoveElementKey) {
          const el = frame.querySelector(`[data-cert-element="${activeMoveElementKey}"]`);
          if (el) el.classList.add('is-selected-element');
        }
      } else {
        frame.classList.remove('cert-edit-active');
      }
    }

    function handleCertActivityChange() {
      const actSelect = document.getElementById('certActivitySelect');
      if (!actSelect) return;
      const actId = actSelect.value;
      const act = activitiesList.find(a => a.id === actId);
      if (!act) return;

      const presentList = act.participants.filter(p => p.isPresent);
      const recSelect = document.getElementById('certRecipientSelect');
      if (recSelect) {
        recSelect.innerHTML = '';
        presentList.forEach((p, idx) => {
          const opt = document.createElement('option');
          opt.value = idx;
          opt.textContent = `${idx + 1}. ${p.name} (${p.office})`;
          recSelect.appendChild(opt);
        });
      }

      const batchBtnText = document.getElementById('btnBatchPrintText');
      if (batchBtnText) batchBtnText.textContent = `Batch Print All Present (${presentList.length})`;

      certCurrentRecipientIndex = 0;
      syncDesignerInputsFromTemplate();
      renderCertificatePreview();
    }

    function handleCertRecipientChange() {
      const sel = document.getElementById('certRecipientSelect');
      certCurrentRecipientIndex = parseInt(sel ? sel.value : 0) || 0;
      renderCertificatePreview();
    }

    function navigateCertRecipient(delta) {
      const actSelect = document.getElementById('certActivitySelect');
      if (!actSelect) return;
      const actId = actSelect.value;
      const act = activitiesList.find(a => a.id === actId);
      if (!act) return;

      const presentList = act.participants.filter(p => p.isPresent);
      if (presentList.length === 0) return;

      certCurrentRecipientIndex = (certCurrentRecipientIndex + delta + presentList.length) % presentList.length;
      const sel = document.getElementById('certRecipientSelect');
      if (sel) sel.value = certCurrentRecipientIndex;
      renderCertificatePreview();
    }

    function handleCertPaperSizeChange(size) {
      currentCertTemplate.paperSize = size || 'a4';
      const paperLabels = {
        a4: 'A4 Landscape (297 \u00d7 210 mm)',
        letter: 'US Letter Landscape (11 \u00d7 8.5 in)',
        legal: 'US Legal Landscape (14 \u00d7 8.5 in)',
        a3: 'A3 Landscape (420 \u00d7 297 mm)',
        a5: 'A5 Landscape (210 \u00d7 148 mm)'
      };
      const label = paperLabels[size] || size;
      const badge = document.getElementById('certActivePaperSizeLabel');
      if (badge) badge.textContent = label;
      const sel = document.getElementById('certPrintPaperSizeSelect');
      if (sel && sel.value !== size) sel.value = size;
      showToast(`Print paper size set to ${label} (Default is A4)`, 'fa-file-lines');
      pushCertHistoryState(`Paper size set to ${size}`);
    }

    function printSingleCurrentCertificate() {
      const actSelect = document.getElementById('certActivitySelect');
      const actId = actSelect ? actSelect.value : null;
      const act = activitiesList.find(a => a.id === actId) || activitiesList[0];
      if (!act) return;

      const presentList = act.participants.filter(p => p.isPresent);
      const p = presentList[certCurrentRecipientIndex] || { name: 'JUAN M. DELA CRUZ', office: 'CBAO', position: 'Administrative Aide' };
      const serialNo = `MOVE-2026-${act.id.replace('ACT-', '')}-${String(certCurrentRecipientIndex + 1).padStart(4, '0')}`;

      const t = currentCertTemplate;
      const isApp = (t.docCategory === 'appearance' || (t.title && t.title.type === 'appearance'));
      const chosenSize = t.paperSize || (document.getElementById('certPrintPaperSizeSelect') ? document.getElementById('certPrintPaperSizeSelect').value : (isApp ? 'a5' : 'a4'));
      const paperSpecs = {
        a4: { rule: 'A4 landscape', width: '297mm', height: '210mm' },
        letter: { rule: 'letter landscape', width: '11in', height: '8.5in' },
        legal: { rule: 'legal landscape', width: '14in', height: '8.5in' },
        a3: { rule: 'A3 landscape', width: '420mm', height: '297mm' },
        a5: { rule: 'A5 landscape', width: '210mm', height: '148mm' }
      };
      const spec = paperSpecs[chosenSize] || (isApp ? paperSpecs.a5 : paperSpecs.a4);
      const paperSize = spec.rule;
      const sheetWidth = spec.width;
      const sheetHeight = spec.height;
      const sheetPad = (chosenSize === 'a5' || isApp) ? 'p-5' : 'p-8';
      const outerStyle = `${t.theme.borderStyle === 'none' ? 'border: none;' : `border: ${t.theme.borderWidth || 8}px ${t.theme.borderStyle || 'double'} ${t.theme.outerBorderColor || '#091b38'};`} background-color: ${t.theme.backgroundColor || '#ffffff'};`;

      const printBox = document.getElementById('batchPrintContainer');
      printBox.innerHTML = '';

      const sheet = document.createElement('div');
      sheet.className = 'cert-print-page flex items-center justify-center bg-white';
      sheet.innerHTML = `
        <div class="w-full h-full ${sheetPad} flex flex-col justify-between relative select-none" style="width: ${sheetWidth}; height: ${sheetHeight}; max-width: ${sheetWidth}; max-height: ${sheetHeight}; box-sizing: border-box; overflow: hidden; ${outerStyle}">
          ${buildCertificateInnerHtml(p, act, serialNo, currentCertTemplate, true)}
        </div>
      `;
      printBox.appendChild(sheet);

      if (typeof setPrintPageRule === 'function') setPrintPageRule(paperSize);
      document.body.classList.add('printing-cert');
      showToast(`Printing certificate for ${currentCertTemplate.recipient.customName || p.name}...`, 'fa-print');
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove('printing-cert');
          printBox.innerHTML = '';
        }, 1000);
      }, 250);
    }

    function batchPrintCertificates() {
      const actSelect = document.getElementById('certActivitySelect');
      const actId = actSelect ? actSelect.value : null;
      const act = activitiesList.find(a => a.id === actId) || activitiesList[0];
      if (!act) return;

      const presentList = act.participants.filter(p => p.isPresent);
      if (presentList.length === 0) {
        showToast('No present attendees found for this activity.', 'fa-circle-exclamation');
        return;
      }

      const t = currentCertTemplate;
      const isApp = (t.docCategory === 'appearance' || (t.title && t.title.type === 'appearance'));
      const chosenSize = t.paperSize || (document.getElementById('certPrintPaperSizeSelect') ? document.getElementById('certPrintPaperSizeSelect').value : (isApp ? 'a5' : 'a4'));
      const paperSpecs = {
        a4: { rule: 'A4 landscape', width: '297mm', height: '210mm' },
        letter: { rule: 'letter landscape', width: '11in', height: '8.5in' },
        legal: { rule: 'legal landscape', width: '14in', height: '8.5in' },
        a3: { rule: 'A3 landscape', width: '420mm', height: '297mm' },
        a5: { rule: 'A5 landscape', width: '210mm', height: '148mm' }
      };
      const spec = paperSpecs[chosenSize] || (isApp ? paperSpecs.a5 : paperSpecs.a4);
      const paperSize = spec.rule;
      const sheetWidth = spec.width;
      const sheetHeight = spec.height;
      const sheetPad = (chosenSize === 'a5' || isApp) ? 'p-5' : 'p-8';
      const outerStyle = `${t.theme.borderStyle === 'none' ? 'border: none;' : `border: ${t.theme.borderWidth || 8}px ${t.theme.borderStyle || 'double'} ${t.theme.outerBorderColor || '#091b38'};`} background-color: ${t.theme.backgroundColor || '#ffffff'};`;

      const printBox = document.getElementById('batchPrintContainer');
      printBox.innerHTML = '';

      presentList.forEach((p, idx) => {
        const serialNo = `MOVE-2026-${act.id.replace('ACT-', '')}-${String(idx + 1).padStart(4, '0')}`;
        const sheet = document.createElement('div');
        sheet.className = 'cert-print-page flex items-center justify-center bg-white';
        sheet.innerHTML = `
          <div class="w-full h-full ${sheetPad} flex flex-col justify-between relative select-none" style="width: ${sheetWidth}; height: ${sheetHeight}; max-width: ${sheetWidth}; max-height: ${sheetHeight}; box-sizing: border-box; overflow: hidden; ${outerStyle}">
            ${buildCertificateInnerHtml(p, act, serialNo, currentCertTemplate, true)}
          </div>
        `;
        printBox.appendChild(sheet);
      });

      if (typeof setPrintPageRule === 'function') setPrintPageRule(paperSize);
      document.body.classList.add('printing-cert');
      showToast(`Generating ${presentList.length} customized certificates using "${currentCertTemplate.name}"...`, 'fa-print');
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove('printing-cert');
          printBox.innerHTML = '';
        }, 1000);
      }, 350);
    }

    // Global exports for Certificate Studio
    window.switchCertDocumentType = switchCertDocumentType;
    window.handleCertPaperSizeChange = handleCertPaperSizeChange;
    window.openCreateNewCertModal = openCreateNewCertModal;
    window.closeCreateNewCertModal = closeCreateNewCertModal;
    window.handleNewCertTypeChange = handleNewCertTypeChange;
    window.handleConfirmCreateNewCert = handleConfirmCreateNewCert;
    window.handleCertTypeSelectChange = handleCertTypeSelectChange;
    window.initCertificateStudio = initCertificateStudio;
    window.renderCertificatePreview = renderCertificatePreview;
    window.alignCertObject = alignCertObject;
    window.openCertPhotoUpload = openCertPhotoUpload;
    window.handleCertPhotoUpload = handleCertPhotoUpload;
    window.removeCertPhoto = removeCertPhoto;
    window.setCertPhotoShape = setCertPhotoShape;
    window.setCertPhotoSize = setCertPhotoSize;
    window.handleHeaderLineFontSizeChange = handleHeaderLineFontSizeChange;
    window.handleAwardIntroSizeChange = handleAwardIntroSizeChange;
    window.handleRecipientSubtitleSizeChange = handleRecipientSubtitleSizeChange;
    window.handleEventTitleFontSizeChange = handleEventTitleFontSizeChange;
    window.handleDetailFontSizeChange = handleDetailFontSizeChange;
    window.handleSignatoryOfficeFontSizeChange = handleSignatoryOfficeFontSizeChange;


