// ==========================================================================
// MOVE BAGUIO CHAPTER — CORE APPLICATION, ORG CHART, MEMBERS & ROSTER ENGINE
// ==========================================================================

    // MOVE Registered Members & Officers Database
    let moveMembersList = (INITIAL_DATA.move_members || []).map((m, idx) => {
      return {
        ...m,
        id: m.id || ('move_m_' + (idx + 1)),
        origNo: idx + 1,
        gender: m.sex || 'M',
        cell: m.contactNumber || '',
        appointment: m.moveRole || 'Registered Member'
      };
    });

    // Registry Mode: 'move' (50 registered members) or 'pool' (748 generic personnel)
    let currentMemberRegistryMode = 'move';
    let allMembers = [...moveMembersList];

    function setMemberRegistryMode(mode) {
      currentMemberRegistryMode = mode;
      const btnMove = document.getElementById('btnMemberModeMove');
      const btnPool = document.getElementById('btnMemberModePool');
      const badge = document.getElementById('memberRegistryBadgeLabel');

      if (mode === 'move') {
        allMembers = [...moveMembersList];
        if (btnMove) {
          btnMove.className = 'px-3.5 py-1.5 rounded-lg bg-move-navy-900 text-white shadow-xs flex items-center gap-2 transition';
          btnMove.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>MOVE Registered Members &amp; Officers (50)</span>';
        }
        if (btnPool) {
          btnPool.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-move-navy-900 flex items-center gap-2 transition';
        }
        if (badge) {
          badge.textContent = "Active: Sheet 'Members' (Verified DB)";
        }
        showToast("Switched to Official MOVE Members Registry (50)", "fa-users-gear");
      } else {
        allMembers = RAW_MEMBERS.permanent.concat(RAW_MEMBERS.casual);
        if (btnPool) {
          btnPool.className = 'px-3.5 py-1.5 rounded-lg bg-move-navy-900 text-white shadow-xs flex items-center gap-2 transition';
        }
        if (btnMove) {
          btnMove.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-move-navy-900 flex items-center gap-2 transition';
          btnMove.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-300"></span><span>MOVE Registered Members &amp; Officers (50)</span>';
        }
        if (badge) {
          badge.textContent = "Active: Personnel Pool (748 Candidates)";
        }
        showToast("Switched to City Hall Personnel Pool (748)", "fa-database");
      }

      // Re-populate offices for the active list
      populateMemberOffices();
      memberCurrentPage = 1;
      applyMemberFilters();
    }

    // Current State
    let currentUser = {
      username: 'admin',
      name: 'Admin Harold Mallorca',
      role: 'Administrator',
      initial: 'H'
    };
    let activeNav = 'dashboard';
    let isSyncServerOnline = false;
    const LOCAL_SYNC_URL = 'http://127.0.0.1:8765';

    // Pagination for Members table
    let memberCurrentPage = 1;
    const memberPageSize = 25;
    let filteredMembers = [...allMembers];

    // Attendance Modal state
    let activeAttendanceActivityId = null;
    let attendanceFilterMode = 'all'; // 'all', 'present', 'absent'

    // Certificate Studio state
    let certCurrentRecipientIndex = 0;

    // Roster Engine State (50-candidate auto balancer)
    let rosterFilterState = {
      minAge: 30,
      maxAge: 40,
      maxTrainings: 24,
      targetQuota: 50,
      maxPerOffice: 4,
      priority: 'lowest_trainings',
      includeCasual: false,
      selectedOffices: new Set()
    };
    let rosterSelectedList = [];
    let officeSortMode = 'az';
    let officePillMode = 'both'; // 'roster', 'both', 'pool'
    let allUniqueOffices = [];

    // --- INITIALIZATION ---
    window.addEventListener('DOMContentLoaded', () => {
      initUniqueOffices();
      checkSyncServerStatus();
      loadStateFromStorage();
      renderDashboard();
      renderOrgStructure();
      initMemberFilters();
      renderMembersTable();
      renderActivitiesTable();
      initCertificateStudio();
      initRosterEngine();
      if (typeof initAppearanceStudio === 'function') initAppearanceStudio();
      if (typeof initAppreciationStudio === 'function') initAppreciationStudio();
      checkLoginSession();
    });

    function checkLoginSession() {
      const savedUser = sessionStorage.getItem('move_current_user') || localStorage.getItem('move_current_user');
      if (savedUser) {
        try {
          currentUser = JSON.parse(savedUser);
          document.getElementById('userNameDisplay').textContent = currentUser.name;
          document.getElementById('userRoleDisplay').textContent = currentUser.role;
          document.getElementById('userAvatarInitial').textContent = currentUser.initial || 'U';
          document.getElementById('viewLogin').classList.add('hidden');
          document.getElementById('viewApp').classList.remove('hidden');
        } catch(e) {}
      }
    }

    function handleLoginSubmit(ev) {
      ev.preventDefault();
      const u = document.getElementById('loginUsername').value.trim();
      const p = document.getElementById('loginPassword').value.trim();
      const remember = document.getElementById('rememberMeCheckbox').checked;

      currentUser = {
        username: u,
        name: u === 'admin' ? 'Admin Harold Mallorca' : (u.toUpperCase() + ' (MOVE)'),
        role: u === 'admin' ? 'Administrator' : 'Chapter Officer',
        initial: (u.charAt(0) || 'U').toUpperCase()
      };

      const str = JSON.stringify(currentUser);
      if (remember) {
        localStorage.setItem('move_current_user', str);
      }
      sessionStorage.setItem('move_current_user', str);

      document.getElementById('userNameDisplay').textContent = currentUser.name;
      document.getElementById('userRoleDisplay').textContent = currentUser.role;
      document.getElementById('userAvatarInitial').textContent = currentUser.initial;

      document.getElementById('viewLogin').classList.add('hidden');
      document.getElementById('viewApp').classList.remove('hidden');
      showToast(`Signed in successfully as ${currentUser.role}`, 'fa-circle-check');
    }

    function instantLogin(role) {
      if (role === 'admin') {
        document.getElementById('loginUsername').value = 'admin';
        document.getElementById('loginPassword').value = 'move2026';
      } else if (role === 'officer') {
        document.getElementById('loginUsername').value = 'officer.ramos';
        document.getElementById('loginPassword').value = 'move2026';
      } else {
        document.getElementById('loginUsername').value = 'guest.viewer';
        document.getElementById('loginPassword').value = 'guest123';
      }
      document.getElementById('formLogin').dispatchEvent(new Event('submit'));
    }

    function handleLogout() {
      sessionStorage.removeItem('move_current_user');
      localStorage.removeItem('move_current_user');
      document.getElementById('viewApp').classList.add('hidden');
      document.getElementById('viewLogin').classList.remove('hidden');
      showToast('Signed out from system', 'fa-right-from-bracket');
    }

    function togglePasswordVisibility() {
      const p = document.getElementById('loginPassword');
      const icon = document.getElementById('eyeIcon');
      if (p.type === 'password') {
        p.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
      } else {
        p.type = 'password';
        icon.className = 'fa-regular fa-eye';
      }
    }

    function togglePasswordTip() {
      showToast('Default credentials: admin / move2026', 'fa-key');
    }

    function toggleSidebarMobile() {
      const sb = document.getElementById('sidebar');
      sb.classList.toggle('hidden');
    }

    // --- NAVIGATION SWITCHER ---
    function switchNav(nav) {
      activeNav = nav;
      const pages = ['dashboard', 'org', 'members', 'activities', 'certificates', 'appearance', 'appreciation', 'roster'];
      pages.forEach(p => {
        const el = document.getElementById('page' + capitalize(p));
        const btn = document.getElementById('navBtn-' + p);
        if (el) el.classList.toggle('hidden', p !== nav);
        if (btn) {
          if (p === nav) {
            btn.className = 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition bg-gradient-to-r from-move-orange-500 to-move-orange-600 text-white shadow-md';
          } else {
            btn.className = 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-move-navy-800 transition';
          }
        }
      });

      const titles = {
        dashboard: ['Executive Dashboard', 'Overview of membership statistics, activities, and department representation'],
        org: ['Organizational Governance', 'MOVE Baguio Chapter Executive Committee & Focal Persons Directory'],
        members: ['Membership Registry', 'Comprehensive employee database with official Google Form intake fields'],
        activities: ['Activities & Trainings', 'Master training logs and live participant attendance tracker'],
        certificates: ['Certificate Studio', 'Automated certificate generation engine for verified present attendees'],
        appearance: ['Certificate of Appearance', 'Civil Service DTR attendance accreditation & appearance certification'],
        appreciation: ['Certificate of Appreciation', 'Honors, guest speaker, facilitator & partner commendation awards'],
        roster: ['50-Participant Balancing Engine', 'Dynamic candidate pool filter with office quota balancer & auto-arrange']
      };

      document.getElementById('topbarTitle').textContent = titles[nav][0];
      document.getElementById('topbarSubtitle').textContent = titles[nav][1];

      if (nav === 'certificates') renderCertificatePreview();
      if (nav === 'appearance' && typeof initAppearanceStudio === 'function') initAppearanceStudio();
      if (nav === 'appreciation' && typeof initAppreciationStudio === 'function') initAppreciationStudio();
      if (nav === 'dashboard') renderDashboard();
    }

    function capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // --- UNIQUE OFFICES SETUP ---
    function initUniqueOffices() {
      const offSet = new Set();
      allMembers.forEach(e => { if (e.office) offSet.add(e.office); });
      allUniqueOffices = Array.from(offSet).sort((a, b) => a.localeCompare(b));
    }

    // --- DASHBOARD RENDERER ---
    function renderDashboard() {
      const total = allMembers.length;
      const insideCount = allMembers.filter(e => e.isInsideCityHall).length;
      const insidePct = ((insideCount / total) * 100).toFixed(1);

      document.getElementById('statTotalMembers').textContent = total;
      document.getElementById('statInsideCityHall').innerHTML = `${insideCount} <span class="text-xs font-bold text-emerald-600">(${insidePct}%)</span>`;

      let totalAttendees = 0;
      let totalPresent = 0;
      activitiesList.forEach(act => {
        if (act.participants) {
          totalAttendees += act.participants.length;
          totalPresent += act.participants.filter(p => p.isPresent).length;
        }
      });
      const avgRate = totalAttendees > 0 ? ((totalPresent / totalAttendees) * 100).toFixed(1) : '100.0';
      document.getElementById('statAvgAttendance').textContent = `${avgRate}%`;

      // Department Representation Bars
      const deptCounts = {};
      allMembers.forEach(e => {
        if (e.office) deptCounts[e.office] = (deptCounts[e.office] || 0) + 1;
      });
      const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
      const maxDeptCount = sortedDepts.length > 0 ? sortedDepts[0][1] : 1;

      const barsContainer = document.getElementById('dashboardDeptBars');
      barsContainer.innerHTML = '';
      sortedDepts.slice(0, 8).forEach(([dept, cnt]) => {
        const pct = ((cnt / maxDeptCount) * 100).toFixed(0);
        const sharePct = ((cnt / total) * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'space-y-1';
        row.innerHTML = `
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-move-navy-900 font-bold">${dept}</span>
            <span class="text-slate-500 font-medium">${cnt} members (${sharePct}%)</span>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="bg-gradient-to-r from-move-navy-800 to-move-orange-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        `;
        barsContainer.appendChild(row);
      });

      // Age Brackets
      const ageBrackets = { 'Under 30': 0, '30 - 40': 0, '41 - 50': 0, '51 & Above': 0 };
      allMembers.forEach(e => {
        const a = e.age;
        if (a) {
          if (a < 30) ageBrackets['Under 30']++;
          else if (a <= 40) ageBrackets['30 - 40']++;
          else if (a <= 50) ageBrackets['41 - 50']++;
          else ageBrackets['51 & Above']++;
        }
      });

      const ageContainer = document.getElementById('dashboardAgeBrackets');
      ageContainer.innerHTML = '';
      Object.entries(ageBrackets).forEach(([bName, bCnt]) => {
        const bPct = ((bCnt / total) * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between text-xs py-1 border-b border-slate-50';
        div.innerHTML = `
          <span class="font-medium text-slate-700">${bName}</span>
          <span class="font-bold text-move-navy-900">${bCnt} <span class="text-slate-400 font-normal">(${bPct}%)</span></span>
        `;
        ageContainer.appendChild(div);
      });

      // Recent Activities Table
      const actTable = document.getElementById('dashboardRecentActivitiesTable');
      actTable.innerHTML = '';
      activitiesList.forEach((act) => {
        const pres = act.participants.filter(p => p.isPresent).length;
        const tot = act.participants.length;
        const rate = tot > 0 ? ((pres / tot) * 100).toFixed(0) : 0;
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition cursor-pointer';
        tr.title = 'Double-click to edit training details, or click to view attendance';
        tr.ondblclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openModalEditActivity(act.id, false);
        };
        tr.onclick = () => openModalAttendance(act.id);
        tr.innerHTML = `
          <td class="py-2.5 px-3 font-semibold text-slate-700">${act.date}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-move-orange-50 text-move-orange-600 border border-move-orange-200">${act.activityType}</span></td>
          <td class="py-2.5 px-3 font-bold text-move-navy-900 max-w-xs truncate">${act.title}</td>
          <td class="py-2.5 px-3 text-slate-600 truncate max-w-xs">${act.speaker}</td>
          <td class="py-2.5 px-3 text-center">
            <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${pres === tot ? 'bg-emerald-100 text-emerald-800' : 'bg-move-navy-100 text-move-navy-800'}">${pres} / ${tot} (${rate}%)</span>
          </td>
          <td class="py-2.5 px-3 text-right">
            <button class="px-2.5 py-1 bg-move-orange-50 hover:bg-move-orange-100 text-move-orange-600 rounded-lg font-bold text-[11px] transition">
              Take Attendance &rarr;
            </button>
          </td>
        `;
        actTable.appendChild(tr);
      });
    }

    // --- ORGANIZATIONAL STRUCTURE RENDERER ---
    let orgCurrentViewMode = 'tree'; // 'tree', 'timeline', 'committees'
    let orgTreeCurrentTerm = 'term_2026';
    let orgTreeZoomLevel = 1.0;
    let activeTimelineTerm = 'term_2026';
    let activePhotoTargetName = '';
    let activePhotoTargetRole = '';
    let tempPhotoDataUrl = null;

    function setOrgViewMode(mode) {
      orgCurrentViewMode = mode;
      
      const btnTree = document.getElementById('btnOrgModeTree');
      const btnTimeline = document.getElementById('btnOrgModeTimeline');
      const btnComm = document.getElementById('btnOrgModeCommittees');
      const zoomControls = document.getElementById('treeZoomControls');

      const secTree = document.getElementById('orgViewSectionTree');
      const secTimeline = document.getElementById('orgViewSectionTimeline');
      const secComm = document.getElementById('orgViewSectionCommittees');

      [btnTree, btnTimeline, btnComm].forEach(b => {
        if (b) {
          b.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-move-navy-900 flex items-center gap-2 transition font-bold';
        }
      });

      if (secTree) secTree.classList.add('hidden');
      if (secTimeline) secTimeline.classList.add('hidden');
      if (secComm) secComm.classList.add('hidden');

      if (mode === 'tree') {
        if (btnTree) btnTree.className = 'px-3.5 py-1.5 rounded-lg bg-move-navy-900 text-white shadow-xs flex items-center gap-2 transition font-bold';
        if (secTree) secTree.classList.remove('hidden');
        if (zoomControls) zoomControls.classList.remove('hidden');
        renderOrgChartTree();
      } else if (mode === 'timeline') {
        if (btnTimeline) btnTimeline.className = 'px-3.5 py-1.5 rounded-lg bg-move-navy-900 text-white shadow-xs flex items-center gap-2 transition font-bold';
        if (secTimeline) secTimeline.classList.remove('hidden');
        if (zoomControls) zoomControls.classList.add('hidden');
        selectTimelineTerm(activeTimelineTerm);
      } else if (mode === 'committees') {
        if (btnComm) btnComm.className = 'px-3.5 py-1.5 rounded-lg bg-move-navy-900 text-white shadow-xs flex items-center gap-2 transition font-bold';
        if (secComm) secComm.classList.remove('hidden');
        if (zoomControls) zoomControls.classList.remove('hidden');
        renderCommitteesTree();
      }
    }

    function selectOrgTreeTerm(termId) {
      orgTreeCurrentTerm = termId;
      const tab2026 = document.getElementById('tabTreeTerm2026');
      const tab2025 = document.getElementById('tabTreeTerm2025');

      if (termId === 'term_2026') {
        if (tab2026) tab2026.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 bg-white text-move-navy-900 shadow-xs font-black';
        if (tab2025) tab2025.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 text-slate-300 hover:text-white font-bold';
      } else {
        if (tab2026) tab2026.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 text-slate-300 hover:text-white font-bold';
        if (tab2025) tab2025.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 bg-white text-move-navy-900 shadow-xs font-black';
      }

      renderOrgChartTree();
    }

    function zoomOrgTree(delta) {
      orgTreeZoomLevel = Math.min(1.5, Math.max(0.6, orgTreeZoomLevel + delta));
      const display = document.getElementById('treeZoomDisplay');
      if (display) display.textContent = `${Math.round(orgTreeZoomLevel * 100)}%`;
      
      const target = orgCurrentViewMode === 'committees' 
        ? document.getElementById('orgCommitteesTreeHierarchy')
        : document.getElementById('orgTreeHierarchy');
        
      if (target) {
        target.style.transform = `scale(${orgTreeZoomLevel})`;
      }
    }

    function resetOrgTreeZoom() {
      orgTreeZoomLevel = 1.0;
      const display = document.getElementById('treeZoomDisplay');
      if (display) display.textContent = '100%';
      const t1 = document.getElementById('orgTreeHierarchy');
      const t2 = document.getElementById('orgCommitteesTreeHierarchy');
      if (t1) t1.style.transform = 'scale(1)';
      if (t2) t2.style.transform = 'scale(1)';
    }

    // PHOTO STORAGE HELPERS
    function getOfficerPhotoKey(name) {
      return 'move_officer_photo_' + (name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    function getOfficerPhoto(name) {
      try {
        return localStorage.getItem(getOfficerPhotoKey(name)) || null;
      } catch(e) {
        return null;
      }
    }

    function renderAvatarNodeHtml(name, role, office, ringBorderClass, sizePx, crownBadge = false, isFemale = false) {
      const photo = getOfficerPhoto(name);
      const photoKey = getOfficerPhotoKey(name);
      
      let avatarContent = '';
      if (photo) {
        avatarContent = `<img src="${photo}" class="w-full h-full object-cover rounded-full" alt="${name}">`;
      } else {
        // Vector silhouette avatar matching Magnific reference style
        avatarContent = `
          <div class="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <svg class="w-full h-full p-2.5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        `;
      }

      const badgeHtml = crownBadge 
        ? `<div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-sm border-2 border-white z-10"><i class="fa-solid fa-crown text-[9px]"></i></div>`
        : '';

      return `
        <div class="tree-node-card group" onclick="openPhotoUploadModal('${name.replace(/'/g, "\'")}', '${role.replace(/'/g, "\'")}', '${ringBorderClass}')" title="Click to upload/change photo for ${name}">
          <div class="relative">
            <div class="tree-avatar-circle ${ringBorderClass}" style="width: ${sizePx}px; height: ${sizePx}px;">
              <div class="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
                ${avatarContent}
              </div>
              <div class="tree-camera-badge" title="Upload Photo">
                <i class="fa-solid fa-camera"></i>
              </div>
            </div>
            ${badgeHtml}
          </div>
          <div class="mt-2 text-center max-w-[130px]">
            <div class="text-xs font-black text-move-navy-900 group-hover:text-move-orange-600 transition leading-snug tracking-tight">${name}</div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">${role}</div>
            ${office ? `<div class="text-[9px] text-move-orange-600 font-semibold truncate mt-0.5">${office}</div>` : ''}
          </div>
        </div>
      `;
    }

    function renderOrgChartTree() {
      const container = document.getElementById('orgTreeHierarchy');
      if (!container) return;

      const timelineList = officersData.timeline || [];
      const termData = timelineList.find(t => t.id === orgTreeCurrentTerm) || timelineList[0];
      if (!termData) return;

      const board = termData.board || [];
      const pres = board.find(b => b.role.toLowerCase().includes('president') && !b.role.toLowerCase().includes('vice'));
      const vp = board.find(b => b.role.toLowerCase().includes('vice president'));
      
      const sec = board.find(b => b.role.toLowerCase() === 'secretary');
      const asstSec = board.find(b => b.role.toLowerCase().includes('assistant secretary'));

      const tres = board.find(b => b.role.toLowerCase() === 'treasurer');
      const asstTres = board.find(b => b.role.toLowerCase().includes('assistant treasurer') || b.role.toLowerCase().includes('assistant tresurer'));

      const pro = board.find(b => b.role.toLowerCase().includes('public relations officer') && !b.role.toLowerCase().includes('assistant'));
      const asstPro = board.find(b => b.role.toLowerCase().includes('assistant public relations officer'));

      const presName = pres ? pres.name : 'Dan Ricky M. Ong';
      const vpName = vp ? vp.name : 'Jay Dee A. Mangayan';

      const secName = sec ? sec.name : 'Secretary';
      const asstSecName = asstSec ? asstSec.name : 'Asst. Secretary';

      const tresName = tres ? tres.name : 'Treasurer';
      const asstTresName = asstTres ? asstTres.name : 'Asst. Treasurer';

      const proName = pro ? pro.name : 'P.R.O.';
      const asstProName = asstPro ? asstPro.name : 'Asst. P.R.O.';

      container.innerHTML = `
        <ul>
          <li>
            <!-- TIER 1: PRESIDENT (GOLD/AMBER RING) -->
            ${renderAvatarNodeHtml(presName, 'Chapter President', 'MOVE Baguio', 'border-4 border-amber-500', 88, true)}
            
            <ul>
              <li>
                <!-- TIER 2: VICE PRESIDENT (ORANGE RING) -->
                ${renderAvatarNodeHtml(vpName, 'Vice President', 'MOVE Baguio', 'border-4 border-orange-500', 78)}

                <ul>
                  <!-- PILLAR 1: SECRETARIAT & RECORDS (INDIGO RING) -->
                  <li>
                    ${renderAvatarNodeHtml(secName, 'Secretary', 'Secretariat', 'border-4 border-indigo-500', 68)}
                    <ul>
                      <li>
                        ${renderAvatarNodeHtml(asstSecName, 'Asst. Secretary', 'Secretariat', 'border-4 border-indigo-400', 58)}
                      </li>
                    </ul>
                  </li>

                  <!-- PILLAR 2: FINANCE & TREASURY (SKY BLUE RING) -->
                  <li>
                    ${renderAvatarNodeHtml(tresName, 'Treasurer', 'Treasury & Finance', 'border-4 border-sky-500', 68)}
                    <ul>
                      <li>
                        ${renderAvatarNodeHtml(asstTresName, 'Asst. Treasurer', 'Treasury & Finance', 'border-4 border-sky-400', 58)}
                      </li>
                    </ul>
                  </li>

                  <!-- PILLAR 3: PUBLIC RELATIONS & MEDIA (EMERALD GREEN RING) -->
                  <li>
                    ${renderAvatarNodeHtml(proName, 'Public Relations Officer', 'Advocacy & Media', 'border-4 border-emerald-500', 68)}
                    <ul>
                      <li>
                        ${renderAvatarNodeHtml(asstProName, 'Asst. P.R.O.', 'Advocacy & Media', 'border-4 border-emerald-400', 58)}
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `;
    }

    function renderCommitteesTree() {
      const container = document.getElementById('orgCommitteesTreeHierarchy');
      if (!container) return;

      const comms = officersData.committees || [];
      const c1 = comms[0]; // Membership & Recruitment
      const c2 = comms[1]; // Education & Training
      const c3 = comms[2]; // Information & Advocacy

      const c1Chair = c1 ? c1.chair : 'Mario D. Ganga Jr.';
      const c1Vice = c1 ? c1.viceChair : 'Noriel Anthony Buenavista';
      const c1Members = c1 ? c1.members : [];

      const c2Chair = c2 ? c2.chair : 'Rhey Delmendo';
      const c2Members = c2 ? c2.members : [];

      const c3Chair = c3 ? c3.chair : 'Dexter See';
      const c3Vice = c3 ? c3.viceChair : 'James Cosep';
      const c3Members = c3 ? c3.members : [];

      container.innerHTML = `
        <ul>
          <li>
            <!-- HERO: CHAPTER PRESIDENT -->
            ${renderAvatarNodeHtml('MARIO D. GANGA JR.', 'Chapter President', 'MOVE Baguio', 'border-4 border-amber-500', 88, true)}

            <ul>
              <!-- COMMITTEE 1: MEMBERSHIP & RECRUITMENT -->
              <li>
                <div class="px-2 py-1 mb-2 bg-orange-100 text-orange-800 text-[10px] font-black rounded uppercase tracking-wider">
                  Membership & Recruitment
                </div>
                ${renderAvatarNodeHtml(c1Chair, 'Chairperson', 'CMR Committee', 'border-4 border-orange-500', 74)}
                <ul>
                  ${c1Vice ? `
                  <li>
                    ${renderAvatarNodeHtml(c1Vice, 'Vice-Chairperson', 'CMR Committee', 'border-4 border-orange-400', 64)}
                    <ul>
                      ${c1Members.map(m => `
                        <li>${renderAvatarNodeHtml(m, 'Member', 'CMR Committee', 'border-3 border-orange-300', 54)}</li>
                      `).join('')}
                    </ul>
                  </li>` : `
                    ${c1Members.map(m => `
                      <li>${renderAvatarNodeHtml(m, 'Member', 'CMR Committee', 'border-3 border-orange-300', 54)}</li>
                    `).join('')}
                  `}
                </ul>
              </li>

              <!-- COMMITTEE 2: EDUCATION, TRAINING & CAPACITY BUILDING -->
              <li>
                <div class="px-2 py-1 mb-2 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded uppercase tracking-wider">
                  Education & Training
                </div>
                ${renderAvatarNodeHtml(c2Chair, 'Chairperson', 'CETCB Committee', 'border-4 border-indigo-500', 74)}
                <ul>
                  ${c2Members.map(m => `
                    <li>${renderAvatarNodeHtml(m, 'Member', 'CETCB Committee', 'border-3 border-indigo-300', 54)}</li>
                  `).join('')}
                </ul>
              </li>

              <!-- COMMITTEE 3: INFORMATION & ADVOCACY -->
              <li>
                <div class="px-2 py-1 mb-2 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase tracking-wider">
                  Information & Advocacy
                </div>
                ${renderAvatarNodeHtml(c3Chair, 'Chairperson', 'CIA Committee', 'border-4 border-emerald-500', 74)}
                <ul>
                  ${c3Vice ? `
                  <li>
                    ${renderAvatarNodeHtml(c3Vice, 'Vice-Chairperson', 'CIA Committee', 'border-4 border-emerald-400', 64)}
                    <ul>
                      ${c3Members.map(m => `
                        <li>${renderAvatarNodeHtml(m, 'Member', 'CIA Committee', 'border-3 border-emerald-300', 54)}</li>
                      `).join('')}
                    </ul>
                  </li>` : `
                    ${c3Members.map(m => `
                      <li>${renderAvatarNodeHtml(m, 'Member', 'CIA Committee', 'border-3 border-emerald-300', 54)}</li>
                    `).join('')}
                  `}
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `;
    }

    // PHOTO UPLOAD MODAL LOGIC
    function openPhotoUploadModal(name, role, ringClass = 'border-4 border-amber-500') {
      activePhotoTargetName = name;
      activePhotoTargetRole = role;
      tempPhotoDataUrl = null;

      document.getElementById('photoModalName').textContent = name;
      document.getElementById('photoModalRole').textContent = role;

      const ringEl = document.getElementById('photoModalRing');
      if (ringEl) {
        ringEl.className = `w-24 h-24 rounded-full p-1 bg-white shadow-xl relative transition-transform ${ringClass}`;
      }

      const existingPhoto = getOfficerPhoto(name);
      const imgEl = document.getElementById('photoModalPreviewImg');
      const svgEl = document.getElementById('photoModalDefaultSvg');

      if (existingPhoto) {
        imgEl.src = existingPhoto;
        imgEl.classList.remove('hidden');
        svgEl.classList.add('hidden');
        tempPhotoDataUrl = existingPhoto;
      } else {
        imgEl.src = '';
        imgEl.classList.add('hidden');
        svgEl.classList.remove('hidden');
      }

      document.getElementById('photoFileInput').value = '';
      document.getElementById('photoUrlInput').value = '';
      document.getElementById('modalOfficerPhoto').classList.remove('hidden');
    }

    function closeOfficerPhotoModal() {
      document.getElementById('modalOfficerPhoto').classList.add('hidden');
      tempPhotoDataUrl = null;
    }

    function handlePhotoFileSelected(ev) {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        tempPhotoDataUrl = e.target.result;
        const imgEl = document.getElementById('photoModalPreviewImg');
        const svgEl = document.getElementById('photoModalDefaultSvg');
        imgEl.src = tempPhotoDataUrl;
        imgEl.classList.remove('hidden');
        svgEl.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }

    function handlePhotoUrlInput(ev) {
      const url = ev.target.value.trim();
      if (!url) return;
      tempPhotoDataUrl = url;
      const imgEl = document.getElementById('photoModalPreviewImg');
      const svgEl = document.getElementById('photoModalDefaultSvg');
      imgEl.src = tempPhotoDataUrl;
      imgEl.classList.remove('hidden');
      svgEl.classList.add('hidden');
    }

    function saveOfficerPhoto() {
      if (!activePhotoTargetName) return;
      if (!tempPhotoDataUrl) {
        showToast('Please select an image file or enter an image URL first.', 'error');
        return;
      }

      try {
        localStorage.setItem(getOfficerPhotoKey(activePhotoTargetName), tempPhotoDataUrl);
        showToast(`Photo saved successfully for ${activePhotoTargetName}!`);
      } catch(err) {
        showToast('Image file too large for browser storage. Please try a smaller photo.', 'error');
      }

      closeOfficerPhotoModal();
      renderOrgChartTree();
      renderCommitteesTree();
    }

    function removeOfficerPhoto() {
      if (!activePhotoTargetName) return;
      try {
        localStorage.removeItem(getOfficerPhotoKey(activePhotoTargetName));
        showToast(`Photo removed. Reset to default vector avatar for ${activePhotoTargetName}.`);
      } catch(e) {}

      closeOfficerPhotoModal();
      renderOrgChartTree();
      renderCommitteesTree();
    }

    // TIMELINE TAB LOGIC
    function selectTimelineTerm(termId) {
      activeTimelineTerm = termId;
      
      const tab2026 = document.getElementById('tab_term_2026');
      const tab2025 = document.getElementById('tab_term_2025');
      const tabAll = document.getElementById('tab_term_all');

      [tab2026, tab2025, tabAll].forEach(t => {
        if (t) {
          t.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 text-slate-600 hover:text-move-navy-900';
        }
      });

      if (termId === 'term_2026' && tab2026) {
        tab2026.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 bg-white text-move-navy-900 shadow-xs border border-slate-200 font-bold';
      } else if (termId === 'term_2025' && tab2025) {
        tab2025.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 bg-white text-move-navy-900 shadow-xs border border-slate-200 font-bold';
      } else if (termId === 'all' && tabAll) {
        tabAll.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-2 bg-white text-move-navy-900 shadow-xs border border-slate-200 font-bold';
      }

      renderTimelineOfficers(termId);
    }

    function renderTimelineOfficers(termId) {
      const container = document.getElementById('orgTimelineContainer');
      if (!container) return;
      container.innerHTML = '';

      const timelineList = officersData.timeline || [];
      const termsToRender = termId === 'all' 
        ? timelineList 
        : timelineList.filter(t => t.id === termId);

      termsToRender.forEach((t, idx) => {
        const termCard = document.createElement('div');
        termCard.className = 'bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4';
        
        const pres = t.board.find(b => b.role.toLowerCase().includes('president') && !b.role.toLowerCase().includes('vice'));
        const vp = t.board.find(b => b.role.toLowerCase().includes('vice president'));
        const others = t.board.filter(b => b !== pres && b !== vp);

        termCard.innerHTML = `
          <!-- Term Header Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-xl ${t.isActive ? 'bg-move-orange-500 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center font-black text-sm shadow-xs">
                ${t.term.slice(0, 4)}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h5 class="text-base font-black text-move-navy-900">${t.term}</h5>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                    ${t.badge}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">Date Effective: <strong>${t.dateEffective}</strong> &bull; ${t.description}</p>
              </div>
            </div>
            <div class="text-[11px] text-slate-400">
              <i class="fa-solid fa-calendar-check text-move-orange-500 mr-1"></i> Recorded in Excel Database (Sheet: Officer)
            </div>
          </div>

          <!-- Top Leadership (President & Vice President) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${pres ? `
            <div class="p-4 rounded-xl border-2 border-move-orange-400 bg-gradient-to-br from-move-orange-50/50 to-white shadow-xs flex items-center gap-4 cursor-pointer" onclick="openPhotoUploadModal('${pres.name.replace(/'/g, "\'")}', '${pres.role.replace(/'/g, "\'")}')">
              <div class="w-14 h-14 rounded-2xl bg-move-orange-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0 overflow-hidden relative">
                ${getOfficerPhoto(pres.name) ? `<img src="${getOfficerPhoto(pres.name)}" class="w-full h-full object-cover">` : `<i class="fa-solid ${pres.avatar || 'fa-user-shield'}"></i>`}
              </div>
              <div class="min-w-0">
                <span class="px-2 py-0.5 rounded bg-move-orange-100 text-move-orange-800 text-[10px] font-black uppercase tracking-wider">
                  ${pres.role}
                </span>
                <div class="text-base font-black text-move-navy-900 truncate mt-1">${pres.name}</div>
                <div class="text-xs text-slate-500 truncate font-semibold">${pres.office}</div>
              </div>
            </div>` : ''}

            ${vp ? `
            <div class="p-4 rounded-xl border border-move-navy-200 bg-gradient-to-br from-slate-50 to-white shadow-xs flex items-center gap-4 cursor-pointer" onclick="openPhotoUploadModal('${vp.name.replace(/'/g, "\'")}', '${vp.role.replace(/'/g, "\'")}')">
              <div class="w-14 h-14 rounded-2xl bg-move-navy-900 text-white flex items-center justify-center text-2xl shadow-sm shrink-0 overflow-hidden relative">
                ${getOfficerPhoto(vp.name) ? `<img src="${getOfficerPhoto(vp.name)}" class="w-full h-full object-cover">` : `<i class="fa-solid ${vp.avatar || 'fa-user-check'}"></i>`}
              </div>
              <div class="min-w-0">
                <span class="px-2 py-0.5 rounded bg-move-navy-100 text-move-navy-800 text-[10px] font-black uppercase tracking-wider">
                  ${vp.role}
                </span>
                <div class="text-base font-black text-move-navy-900 truncate mt-1">${vp.name}</div>
                <div class="text-xs text-slate-500 truncate font-semibold">${vp.office}</div>
              </div>
            </div>` : ''}
          </div>

          <!-- Executive Officers Grid -->
          <div class="space-y-2 pt-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Executive Secretariat, Treasury & Advocacy Officers</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${others.map(o => `
                <div class="p-3 rounded-xl border border-slate-200 bg-white hover:border-move-orange-300 hover:shadow-xs transition flex items-center gap-3 cursor-pointer" onclick="openPhotoUploadModal('${o.name.replace(/'/g, "\'")}', '${o.role.replace(/'/g, "\'")}')">
                  <div class="w-10 h-10 rounded-xl bg-move-navy-50 text-move-navy-900 flex items-center justify-center text-base shrink-0 overflow-hidden">
                    ${getOfficerPhoto(o.name) ? `<img src="${getOfficerPhoto(o.name)}" class="w-full h-full object-cover">` : `<i class="fa-solid ${o.avatar || 'fa-user'}"></i>`}
                  </div>
                  <div class="min-w-0">
                    <div class="text-[10px] font-bold text-move-orange-600 uppercase tracking-wider">${o.role}</div>
                    <div class="text-xs font-bold text-move-navy-900 truncate">${o.name}</div>
                    <div class="text-[10px] text-slate-400 truncate">${o.office}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        container.appendChild(termCard);
      });
    }

    function renderOrgStructure() {
      // 1. Advisory Board (Mayor & Vice Mayor)
      const advGrid = document.getElementById('orgAdvisoryGrid');
      if (advGrid) {
        advGrid.innerHTML = '';
        (officersData.advisory || []).forEach(off => {
          const card = document.createElement('div');
          card.className = 'bg-white p-4 rounded-2xl border border-move-orange-200/80 shadow-sm flex items-center gap-4';
          card.innerHTML = `
            <div class="w-13 h-13 rounded-2xl bg-move-orange-50 border border-move-orange-200 flex items-center justify-center text-move-orange-500 text-2xl shrink-0 p-3">
              <i class="fa-solid ${off.avatar || 'fa-user-tie'}"></i>
            </div>
            <div class="min-w-0">
              <div class="text-[10px] font-black uppercase tracking-wider text-move-orange-600">${off.role}</div>
              <div class="text-base font-black text-move-navy-900 truncate">${off.name}</div>
              <div class="text-xs text-slate-600 truncate font-semibold">${off.title} &bull; ${off.office}</div>
              <div class="text-[10px] text-slate-400 mt-0.5"><i class="fa-solid fa-envelope text-[9px] text-move-orange-500 mr-1"></i>${off.contact}</div>
            </div>
          `;
          advGrid.appendChild(card);
        });
      }

      // 2. Standing Functional Committees Cards (from Official Slide)
      const commGrid = document.getElementById('orgCommitteesGrid');
      if (commGrid) {
        commGrid.innerHTML = '';
        (officersData.committees || []).forEach(c => {
          const card = document.createElement('div');
          card.className = 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between';
          
          let membersHtml = '';
          if (c.members && c.members.length > 0) {
            membersHtml = c.members.map(m => `
              <li class="flex items-center gap-2 text-xs font-bold text-move-navy-900">
                <span class="w-1.5 h-1.5 rounded-full bg-move-orange-500"></span>
                <span>${m}</span>
              </li>
            `).join('');
          }

          card.innerHTML = `
            <div>
              <div class="bg-gradient-to-r from-move-navy-900 to-move-navy-800 p-4 border-b-4 border-move-orange-500">
                <div class="bg-move-orange-500 text-white font-black text-xs uppercase px-3 py-2 rounded-lg tracking-wider shadow-xs leading-snug">
                  ${c.name}
                </div>
              </div>

              <div class="p-4 space-y-4">
                <div class="p-3 rounded-xl bg-orange-50/60 border border-move-orange-200 space-y-1">
                  <div class="text-[10px] font-black uppercase tracking-wider text-move-orange-700 flex items-center gap-1.5">
                    <i class="fa-solid fa-crown text-[10px]"></i>
                    <span>Chairperson</span>
                  </div>
                  <div class="text-sm font-black text-move-navy-900">${c.chair}</div>
                </div>

                ${c.viceChair ? `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div class="text-[10px] font-black uppercase tracking-wider text-move-navy-800 flex items-center gap-1.5">
                    <i class="fa-solid fa-award text-[10px] text-move-orange-500"></i>
                    <span>Vice-Chairperson</span>
                  </div>
                  <div class="text-sm font-black text-move-navy-900">${c.viceChair}</div>
                </div>` : ''}

                <div class="space-y-2 pt-1">
                  <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Committee Members
                  </div>
                  <ul class="space-y-1.5 pl-1">
                    ${membersHtml}
                  </ul>
                </div>
              </div>
            </div>

            <div class="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 rounded-b-2xl">
              <i class="fa-solid fa-bullseye text-move-orange-500 mr-1"></i>
              ${c.desc}
            </div>
          `;
          commGrid.appendChild(card);
        });
      }

      // 3. Render Tree (Default view)
      renderOrgChartTree();
      renderCommitteesTree();

      // 4. Department Coordinators
      renderCoordinatorsList(officersData.coordinators || []);
    }

    function renderCoordinatorsList(list) {
      const grid = document.getElementById('orgCoordinatorsGrid');
      grid.innerHTML = '';
      list.forEach(coord => {
        const card = document.createElement('div');
        card.className = 'p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-move-orange-300 hover:shadow-xs transition space-y-1';
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 bg-move-navy-900 text-white font-extrabold text-[10px] rounded">${coord.office}</span>
            <span class="text-[10px] text-slate-400"><i class="fa-solid fa-phone text-[9px] text-move-orange-500"></i> ${coord.phone}</span>
          </div>
          <div class="text-xs font-bold text-move-navy-900 truncate">${coord.name}</div>
          <div class="text-[10px] text-slate-500 truncate">${coord.position}</div>
        `;
        grid.appendChild(card);
      });
    }

    function filterCoordinators() {
      const query = document.getElementById('searchCoordInput').value.toLowerCase();
      const filtered = officersData.coordinators.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.office.toLowerCase().includes(query) ||
        c.position.toLowerCase().includes(query)
      );
      renderCoordinatorsList(filtered);
    }

    function printOrgStructure() {
      window.print();
    }

    // --- MEMBERS REGISTRY RENDERER ---
    function initMemberFilters() {
      const offSelect = document.getElementById('memberFilterOffice');
      const formOffSelect = document.getElementById('memFormOffice');
      
      allUniqueOffices.forEach(off => {
        const opt = document.createElement('option');
        opt.value = off;
        opt.textContent = off;
        offSelect.appendChild(opt);

        const opt2 = document.createElement('option');
        opt2.value = off;
        opt2.textContent = off;
        formOffSelect.appendChild(opt2);
      });
    }

    function applyMemberFilters() {
      const q = document.getElementById('memberSearchInput').value.toLowerCase().trim();
      const off = document.getElementById('memberFilterOffice').value;
      const cityHall = document.getElementById('memberFilterCityHall').value;
      const appt = document.getElementById('memberFilterAppointment').value;

      filteredMembers = allMembers.filter(m => {
        if (q) {
          const matchName = (m.name || '').toLowerCase().includes(q);
          const matchPos = (m.position || '').toLowerCase().includes(q);
          const matchCell = (m.cell || '').toLowerCase().includes(q);
          const matchOff = (m.office || '').toLowerCase().includes(q);
          if (!matchName && !matchPos && !matchCell && !matchOff) return false;
        }
        if (off !== 'ALL' && m.office !== off) return false;
        if (cityHall === 'YES' && !m.isInsideCityHall) return false;
        if (cityHall === 'NO' && m.isInsideCityHall) return false;
        if (appt !== 'ALL') {
          const isPerm = (m.appointment || '').toUpperCase().includes('PERM');
          if (appt === 'PERMANENT' && !isPerm) return false;
          if (appt === 'CASUAL' && isPerm) return false;
        }
        return true;
      });

      memberCurrentPage = 1;
      renderMembersTable();
    }

    function renderMembersTable() {
      const tbody = document.getElementById('membersTableBody');
      tbody.innerHTML = '';

      const total = filteredMembers.length;
      const start = (memberCurrentPage - 1) * memberPageSize;
      const end = Math.min(start + memberPageSize, total);
      const pageSlice = filteredMembers.slice(start, end);

      if (pageSlice.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-slate-400">No members match the current filter criteria.</td></tr>`;
        return;
      }

      pageSlice.forEach((m, idx) => {
        const isPerm = (m.appointment || '').toUpperCase().includes('PERM');
        const isOfficer = m.moveRole && (m.moveRole.includes('President') || m.moveRole.includes('Secretary') || m.moveRole.includes('Treasurer') || m.moveRole.includes('Officer') || m.moveRole.includes('Chair'));
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

        // Badge styling depending on mode
        let roleBadgeHtml = '';
        if (currentMemberRegistryMode === 'move') {
          roleBadgeHtml = `<span class="text-[9px] px-2 py-0.5 rounded font-black tracking-wide ${isOfficer ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-move-navy-100 text-move-navy-800'}">
            ${m.moveRole || 'Member'}
          </span>`;
        } else {
          roleBadgeHtml = `<span class="text-[9px] px-1.5 py-0.2 rounded font-black ${isPerm ? 'bg-move-navy-100 text-move-navy-800' : 'bg-move-orange-100 text-move-orange-600'}">
            ${isPerm ? 'PERM' : 'CASUAL'}
          </span>`;
        }

        const phoneDisplay = (m.cell || m.contactNumber) ? `
          <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <i class="fa-solid fa-phone text-[9px] text-move-orange-500"></i>
            <span>${m.cell || m.contactNumber}</span>
          </div>
        ` : '';

        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center text-slate-400 font-medium">${start + idx + 1}</td>
          <td class="py-2.5 px-3">
            <div class="font-bold text-move-navy-900 flex items-center gap-1.5 flex-wrap">
              <span>${m.name}</span>
              ${roleBadgeHtml}
            </div>
            ${phoneDisplay}
          </td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${m.office}</span></td>
          <td class="py-2.5 px-3 text-slate-600 max-w-xs truncate" title="${m.position}">${m.position}</td>
          <td class="py-2.5 px-3 text-center font-semibold text-slate-700">${m.age || '-'}</td>
          <td class="py-2.5 px-3 text-center text-slate-600">${m.gender || m.sex || 'M'}</td>
          <td class="py-2.5 px-3 text-center text-slate-600">${m.civilStatus || 'Married'}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="toggleMemberLocation('${m.id}')" title="Click to toggle Inside City Hall"
                    class="px-2.5 py-1 rounded-full text-[10px] font-black transition ${m.isInsideCityHall ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
              <i class="fa-solid ${m.isInsideCityHall ? 'fa-building-circle-check text-emerald-600' : 'fa-building-circle-xmark text-slate-400'} mr-1"></i>
              ${m.isInsideCityHall ? 'YES' : 'NO'}
            </button>
          </td>
          <td class="py-2.5 px-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="viewMemberProfile('${m.id}')" title="View Detailed Member Dossier"
                      class="w-7 h-7 rounded-lg bg-move-navy-50 text-move-navy-900 hover:bg-move-navy-900 hover:text-white transition flex items-center justify-center text-xs">
                <i class="fa-solid fa-id-card"></i>
              </button>
              <button onclick="editMemberProfile('${m.id}')" title="Edit Member Record"
                      class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-move-orange-500 hover:text-white transition flex items-center justify-center text-xs">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function changeMemberPage(delta) {
      const maxPages = Math.ceil(filteredMembers.length / memberPageSize) || 1;
      memberCurrentPage = Math.max(1, Math.min(memberCurrentPage + delta, maxPages));
      renderMembersTable();
    }

    function toggleMemberLocation(id) {
      const mem = allMembers.find(e => e.id === id);
      if (mem) {
        mem.isInsideCityHall = !mem.isInsideCityHall;
        renderMembersTable();
        renderDashboard();
        saveStateToStorage();
        showToast(`${mem.name}: City Hall location toggled to ${mem.isInsideCityHall ? 'YES' : 'NO'}`, 'fa-building');
      }
    }

    function viewMemberProfile(id) {
      const m = allMembers.find(e => e.id === id);
      if (!m) return;

      const cont = document.getElementById('memberProfileContent');
      const isOfficer = m.moveRole && (m.moveRole.includes('President') || m.moveRole.includes('Secretary') || m.moveRole.includes('Treasurer') || m.moveRole.includes('Officer') || m.moveRole.includes('Chair'));

      cont.innerHTML = `
        <!-- Header Card -->
        <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-move-navy-900 to-move-navy-800 text-white rounded-2xl shadow-sm border border-move-orange-500/20">
          <div class="w-14 h-14 rounded-2xl bg-move-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            ${m.name.charAt(0)}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-base font-black text-white truncate">${m.name}</h4>
              ${m.moveRole ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isOfficer ? 'bg-amber-400 text-move-navy-950' : 'bg-white/20 text-white'}">
                  ${m.moveRole}
                </span>
              ` : ''}
            </div>
            <div class="text-xs text-move-orange-300 font-bold truncate mt-0.5">${m.position}</div>
            <div class="text-[11px] text-slate-300 truncate">${m.office} &bull; Inside City Hall: <strong class="${m.isInsideCityHall ? 'text-emerald-400' : 'text-amber-300'}">${m.isInsideCityHall ? 'YES' : 'NO'}</strong></div>
          </div>
        </div>

        <!-- Demographics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Age</span>
            <span class="font-black text-slate-800 text-sm">${m.age || '-'} yrs</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
            <span class="font-black text-slate-800 text-sm">${m.gender || m.sex || 'Male'}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Civil Status</span>
            <span class="font-black text-slate-800 text-sm">${m.civilStatus || 'Married'}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
            <span class="font-black text-xs ${m.isInsideCityHall ? 'text-emerald-700' : 'text-amber-700'}">${m.isInsideCityHall ? 'Inside City Hall' : 'Field Office'}</span>
          </div>
        </div>

        <!-- Contact & Address Details (Google Form Data) -->
        <div class="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
          <div class="font-bold text-move-navy-900 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span><i class="fa-solid fa-address-book text-move-orange-500 mr-1.5"></i>Contact &amp; Mailing Information</span>
            <span class="text-[10px] text-slate-400 font-semibold">Google Form Registry</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span class="text-slate-400 block">Mobile Phone:</span>
              <strong class="text-slate-800 font-mono text-xs">${m.cell || m.contactNumber || 'Not specified'}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Email Address:</span>
              <strong class="text-slate-800">${m.email || 'Not specified'}</strong>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-400 block">Residential Address:</span>
              <span class="text-slate-700">${m.address || 'Baguio City'}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="text-slate-400 block">Preferred Mailing Address:</span>
              <span class="text-slate-700">${m.mailingAddress || m.office || 'Baguio City Hall'}</span>
            </div>
          </div>
        </div>

        <!-- Gender Trainings & Capacity Building (Google Form Data) -->
        <div class="p-3.5 bg-orange-50/50 rounded-xl border border-move-orange-200 space-y-1.5 text-xs">
          <div class="font-bold text-move-navy-900 flex items-center justify-between border-b border-move-orange-200/50 pb-1">
            <span><i class="fa-solid fa-certificate text-move-orange-500 mr-1.5"></i>Gender-Related Trainings / Seminars</span>
            <span class="text-[10px] text-move-orange-600 font-bold">${m.dateEffective || 'Recorded'}</span>
          </div>
          <p class="text-[11px] text-slate-700 leading-relaxed font-medium">
            ${m.trainings || 'Orientation on Men Opposed to Violence Everywhere (MOVE) &amp; Anti-VAWC Laws'}
          </p>
          <div class="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
            <span>Conducted By: <strong>${m.conductedBy || 'LCAT - VAWC'}</strong></span>
            <span>Recorded in Excel Database</span>
          </div>
        </div>
      `;

      document.getElementById('modalMemberProfile').classList.remove('hidden');
    }

    function closeModalMemberProfile() {
      document.getElementById('modalMemberProfile').classList.add('hidden');
    }

    function printMemberDossier() {
      window.print();
    }

    // --- ADD MEMBER MODAL (GOOGLE FORM) ---
    function openModalAddMember() {
      document.getElementById('modalMemberForm').classList.remove('hidden');
    }

    function closeModalMemberForm() {
      document.getElementById('modalMemberForm').classList.add('hidden');
    }

    function handleMemberFormSubmit(ev) {
      ev.preventDefault();
      const fn = document.getElementById('memFormFirstName').value.trim();
      const mn = document.getElementById('memFormMiddleName').value.trim();
      const ln = document.getElementById('memFormLastName').value.trim();
      const fullName = `${ln.toUpperCase()}, ${fn.toUpperCase()}${mn ? ' ' + mn.toUpperCase() : ''}`;

      const newMember = {
        id: 'CUSTOM_' + Date.now(),
        name: fullName,
        office: document.getElementById('memFormOffice').value,
        position: document.getElementById('memFormPosition').value.trim(),
        age: parseInt(document.getElementById('memFormAge').value) || 30,
        gender: document.getElementById('memFormSex').value.charAt(0).toUpperCase(),
        civilStatus: document.getElementById('memFormCivilStatus').value,
        cell: document.getElementById('memFormCell').value.trim(),
        appointment: document.getElementById('memFormAppointment').value,
        isInsideCityHall: document.getElementById('memFormInsideCityHall').value === 'true',
        address: `${document.getElementById('memFormStreet').value} ${document.getElementById('memFormBarangay').value}, ${document.getElementById('memFormCity').value}`,
        genderTrainings: [{
          title: 'MOVE Membership Induction & Anti-VAW Orientation',
          agency: 'City Government of Baguio',
          date: new Date().toISOString().split('T')[0]
        }]
      };

      allMembers.unshift(newMember);
      applyMemberFilters();
      renderDashboard();
      saveStateToStorage();
      closeModalMemberForm();
      showToast(`Member ${fullName} registered successfully!`, 'fa-user-check');
    }

    // --- ACTIVITIES & ATTENDANCE RENDERER ---
    function renderActivitiesTable() {
      const tbody = document.getElementById('activitiesTableBody');
      tbody.innerHTML = '';

      activitiesList.forEach((act, idx) => {
        const pres = act.participants.filter(p => p.isPresent).length;
        const tot = act.participants.length;
        const rate = tot > 0 ? ((pres / tot) * 100).toFixed(0) : 0;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition cursor-pointer';
        tr.title = 'Double-click to edit training details, or click to view attendance';
        tr.ondblclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openModalEditActivity(act.id, false);
        };
        tr.onclick = (e) => {
          if (!e.target.closest('button')) openModalAttendance(act.id);
        };
        tr.innerHTML = `
          <td class="py-3 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
          <td class="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">${act.date}</td>
          <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-move-orange-50 text-move-orange-600 border border-move-orange-200">${act.activityType}</span></td>
          <td class="py-3 px-3 font-bold text-move-navy-900 max-w-xs truncate" title="${act.title}">${act.title}</td>
          <td class="py-3 px-3 text-slate-600 max-w-xs truncate" title="${act.purpose}">${act.purpose}</td>
          <td class="py-3 px-3 text-slate-700 font-medium truncate max-w-xs">${act.speaker}</td>
          <td class="py-3 px-3 text-center text-slate-600">${act.duration}</td>
          <td class="py-3 px-3 text-center">
            <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${pres === tot ? 'bg-emerald-100 text-emerald-800' : 'bg-move-navy-100 text-move-navy-800'}">
              ${pres} / ${tot} Present (${rate}%)
            </span>
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">
            <button onclick="event.stopPropagation(); openModalEditActivity('${act.id}', false)" class="px-2.5 py-1 mr-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition" title="Edit Training Details">
              <i class="fa-solid fa-pen-to-square mr-1 text-slate-500"></i>Edit
            </button>
            <button onclick="openModalAttendance('${act.id}')" class="px-3 py-1 bg-move-orange-50 hover:bg-move-orange-100 text-move-orange-600 font-bold rounded-lg text-xs transition">
              Attendance &rarr;
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      document.getElementById('badgeNavActivityCount').textContent = activitiesList.length;
    }

    // --- ATTENDANCE MODAL LOGIC ---
    function openModalAttendance(activityId) {
      activeAttendanceActivityId = activityId;
      const act = activitiesList.find(a => a.id === activityId);
      if (!act) return;

      document.getElementById('modalAttTitle').textContent = act.title;
      document.getElementById('modalAttDate').textContent = act.date;
      document.getElementById('modalAttTypeBadge').textContent = act.activityType;
      document.getElementById('modalAttSpeaker').innerHTML = `
        <i class="fa-solid fa-microphone text-move-orange-400"></i>
        <span>${act.speaker} &bull; ${act.duration} &bull; ${act.venue}</span>
      `;

      attendanceFilterMode = 'all';
      renderModalAttendanceTable();
      document.getElementById('modalAttendance').classList.remove('hidden');
    }

    function closeModalAttendance() {
      document.getElementById('modalAttendance').classList.add('hidden');
      renderActivitiesTable();
      renderDashboard();
    }

    function setAttendanceFilter(mode) {
      attendanceFilterMode = mode;
      renderModalAttendanceTable();
    }

    function renderModalAttendanceTable() {
      const act = activitiesList.find(a => a.id === activeAttendanceActivityId);
      if (!act) return;

      const pres = act.participants.filter(p => p.isPresent).length;
      const tot = act.participants.length;
      const abs = tot - pres;
      const rate = tot > 0 ? ((pres / tot) * 100).toFixed(1) : '0.0';

      document.getElementById('modalAttRateBadge').textContent = `${pres} / ${tot} Present (${rate}%)`;
      document.getElementById('modalAttCntAll').textContent = tot;
      document.getElementById('modalAttCntPresent').textContent = pres;
      document.getElementById('modalAttCntAbsent').textContent = abs;
      document.getElementById('btnModalGenerateCertText').textContent = `Generate Certificates for Present Attendees (${pres})`;

      const tbody = document.getElementById('modalAttendanceTableBody');
      tbody.innerHTML = '';

      let list = act.participants;
      if (attendanceFilterMode === 'present') list = list.filter(p => p.isPresent);
      if (attendanceFilterMode === 'absent') list = list.filter(p => !p.isPresent);

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-slate-400">No participants match this attendance filter.</td></tr>`;
        return;
      }

      list.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.className = `hover:bg-slate-50 transition ${p.isPresent ? 'bg-white' : 'bg-rose-50/20'}`;
        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
          <td class="py-2.5 px-3 font-bold text-move-navy-900">${p.name}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${p.office}</span></td>
          <td class="py-2.5 px-3 text-slate-600 truncate max-w-xs">${p.position}</td>
          <td class="py-2.5 px-3 text-center text-slate-700 font-semibold">${p.age || '-'}</td>
          <td class="py-2.5 px-3 text-center text-slate-600">${p.gender || 'M'}</td>
          <td class="py-2.5 px-3 text-center text-slate-600">${p.civilStatus || 'Married'}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="toggleParticipantPresence('${p.id}')"
                    class="w-28 py-1 rounded-lg text-xs font-black transition shadow-2xs ${p.isPresent ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-600'}">
              ${p.isPresent ? '✓ YES (Present)' : '✗ NO (Absent)'}
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function toggleParticipantPresence(participantId) {
      const act = activitiesList.find(a => a.id === activeAttendanceActivityId);
      if (!act) return;
      const p = act.participants.find(x => x.id === participantId);
      if (p) {
        p.isPresent = !p.isPresent;
        renderModalAttendanceTable();
        saveStateToStorage();
      }
    }

    function bulkToggleAttendance(status) {
      const act = activitiesList.find(a => a.id === activeAttendanceActivityId);
      if (!act) return;
      act.participants.forEach(p => { p.isPresent = status; });
      renderModalAttendanceTable();
      saveStateToStorage();
      showToast(`All participants marked as ${status ? 'PRESENT' : 'ABSENT'}`, 'fa-circle-check');
    }

    function generateCertificatesFromActiveModal() {
      const actId = activeAttendanceActivityId;
      closeModalAttendance();
      switchNav('certificates');
      document.getElementById('certActivitySelect').value = actId;
      handleCertActivityChange();
    }

    // --- ACTIVITY TYPE HISTORY MANAGER ---
    const DEFAULT_ACTIVITY_TYPES = [
      "Orientation Seminar",
      "Capacity Building Workshop",
      "General Assembly",
      "Community Outreach",
      "Advocacy & Culinary Event",
      "Leadership Training",
      "Gender Sensitivity Training",
      "Skills & Livelihood Workshop",
      "Forum & Panel Discussion"
    ];

    function getActivityTypeHistory() {
      try {
        const saved = localStorage.getItem('move_activity_type_history');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) return arr;
        }
      } catch (e) {}
      return [...DEFAULT_ACTIVITY_TYPES];
    }

    function saveActivityTypeToHistory(type) {
      if (!type || !type.trim()) return;
      const t = type.trim();
      const history = getActivityTypeHistory();
      if (!history.some(x => x.toLowerCase() === t.toLowerCase())) {
        history.push(t);
        try {
          localStorage.setItem('move_activity_type_history', JSON.stringify(history));
        } catch (e) {}
      }
      populateActivityTypeDatalist();
    }

    function populateActivityTypeDatalist() {
      const datalist = document.getElementById('listActivityTypes');
      if (!datalist) return;
      
      const typesSet = new Set(DEFAULT_ACTIVITY_TYPES);
      getActivityTypeHistory().forEach(t => typesSet.add(t));
      if (typeof activitiesList !== 'undefined' && Array.isArray(activitiesList)) {
        activitiesList.forEach(a => {
          if (a.activityType && a.activityType.trim()) typesSet.add(a.activityType.trim());
        });
      }
      
      datalist.innerHTML = '';
      typesSet.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        datalist.appendChild(opt);
      });
    }

    // --- ADD ACTIVITY MODAL ---
    function openModalAddActivity() {
      populateActivityTypeDatalist();
      const titleEl = document.getElementById('newActTitle');
      const shortDescEl = document.getElementById('newActShortDesc');
      const typeEl = document.getElementById('newActType');
      const purposeEl = document.getElementById('newActPurpose');
      const speakerEl = document.getElementById('newActSpeaker');
      const durationEl = document.getElementById('newActDuration');
      const venueEl = document.getElementById('newActVenue');

      if (titleEl) titleEl.value = '';
      if (shortDescEl) shortDescEl.value = '';
      if (typeEl) typeEl.value = '';
      if (purposeEl) purposeEl.value = '';
      if (speakerEl) speakerEl.value = '';
      if (durationEl) durationEl.value = '8 Hours (1 Day)';
      if (venueEl) venueEl.value = 'Baguio Convention and Cultural Center';

      document.getElementById('newActDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('modalAddActivity').classList.remove('hidden');
    }

    function closeModalAddActivity() {
      document.getElementById('modalAddActivity').classList.add('hidden');
    }

    function handleNewActivitySubmit(ev) {
      ev.preventDefault();
      const title = document.getElementById('newActTitle').value.trim();
      const shortDesc = document.getElementById('newActShortDesc') ? document.getElementById('newActShortDesc').value.trim() : '';
      const date = document.getElementById('newActDate').value;
      const type = document.getElementById('newActType').value.trim() || 'Orientation Seminar';
      const purpose = document.getElementById('newActPurpose').value.trim();
      const speaker = document.getElementById('newActSpeaker').value.trim();
      const duration = document.getElementById('newActDuration').value.trim();
      const venue = document.getElementById('newActVenue').value.trim();

      saveActivityTypeToHistory(type);

      const participants = rosterSelectedList.map(p => ({
        id: p.id,
        origNo: p.origNo,
        name: p.name,
        office: p.office,
        position: p.position,
        age: p.age,
        gender: p.gender,
        civilStatus: p.civilStatus,
        isPresent: true,
        isInsideCityHall: p.isInsideCityHall,
        cell: p.cell
      }));

      const newAct = {
        id: 'ACT-' + Date.now(),
        date: date,
        activityType: type,
        title: title,
        shortDescription: shortDesc,
        purpose: purpose,
        speaker: speaker,
        duration: duration,
        venue: venue,
        participants: participants
      };

      activitiesList.unshift(newAct);
      renderActivitiesTable();
      renderDashboard();
      initCertificateStudio();
      if (typeof initAppearanceStudio === 'function') initAppearanceStudio();
      if (typeof initAppreciationStudio === 'function') initAppreciationStudio();
      saveStateToStorage();
      closeModalAddActivity();
      showToast(`Activity "${title}" created with ${participants.length} participants!`, 'fa-calendar-check');
    }

    // --- EDIT ACTIVITY / TRAINING MODAL LOGIC ---
    function openModalEditActivity(activityId, keepAttendanceOpen = false) {
      if (!activityId) return;
      const act = activitiesList.find(a => a.id === activityId);
      if (!act) return;

      populateActivityTypeDatalist();

      if (!keepAttendanceOpen) {
        closeModalAttendance();
      }

      const idField = document.getElementById('editActId');
      const titleField = document.getElementById('editActTitle');
      const shortDescField = document.getElementById('editActShortDesc');
      const dateField = document.getElementById('editActDate');
      const typeField = document.getElementById('editActType');
      const purposeField = document.getElementById('editActPurpose');
      const speakerField = document.getElementById('editActSpeaker');
      const durationField = document.getElementById('editActDuration');
      const venueField = document.getElementById('editActVenue');

      if (idField) idField.value = act.id;
      if (titleField) titleField.value = act.title || '';
      if (shortDescField) shortDescField.value = act.shortDescription || '';
      if (dateField) dateField.value = act.date || '';
      if (typeField) typeField.value = act.activityType || '';
      if (purposeField) purposeField.value = act.purpose || '';
      if (speakerField) speakerField.value = act.speaker || '';
      if (durationField) durationField.value = act.duration || '';
      if (venueField) venueField.value = act.venue || '';

      const modal = document.getElementById('modalEditActivity');
      if (modal) modal.classList.remove('hidden');
    }

    function closeModalEditActivity() {
      const modal = document.getElementById('modalEditActivity');
      if (modal) modal.classList.add('hidden');
    }

    function handleEditActivitySubmit(ev) {
      ev.preventDefault();
      const id = document.getElementById('editActId').value;
      const act = activitiesList.find(a => a.id === id);
      if (!act) return;

      const type = document.getElementById('editActType').value.trim() || 'Orientation Seminar';
      saveActivityTypeToHistory(type);

      act.title = document.getElementById('editActTitle').value.trim();
      if (document.getElementById('editActShortDesc')) {
        act.shortDescription = document.getElementById('editActShortDesc').value.trim();
      }
      act.date = document.getElementById('editActDate').value.trim();
      act.activityType = type;
      act.purpose = document.getElementById('editActPurpose').value.trim();
      act.speaker = document.getElementById('editActSpeaker').value.trim();
      act.duration = document.getElementById('editActDuration').value.trim();
      act.venue = document.getElementById('editActVenue').value.trim();

      saveStateToStorage();
      renderActivitiesTable();
      renderDashboard();

      // If Attendance modal is currently open for this activity, update its header live
      if (typeof activeAttendanceActivityId !== 'undefined' && activeAttendanceActivityId === id) {
        const titleEl = document.getElementById('modalAttTitle');
        const dateEl = document.getElementById('modalAttDate');
        const typeEl = document.getElementById('modalAttTypeBadge');
        const speakerEl = document.getElementById('modalAttSpeaker');

        if (titleEl) titleEl.textContent = act.title;
        if (dateEl) dateEl.textContent = act.date;
        if (typeEl) typeEl.textContent = act.activityType;
        if (speakerEl) {
          speakerEl.innerHTML = `
            <i class="fa-solid fa-microphone text-move-orange-400"></i>
            <span>${act.speaker} &bull; ${act.duration} &bull; ${act.venue}</span>
          `;
        }
      }

      // Sync Certificate Studio dropdown & live preview
      const certActSelect = document.getElementById('certActivitySelect');
      if (certActSelect) {
        const curVal = certActSelect.value;
        certActSelect.innerHTML = '';
        activitiesList.forEach(a => {
          const presCount = (a.participants || []).filter(p => p.isPresent).length;
          const opt = document.createElement('option');
          opt.value = a.id;
          opt.textContent = `${a.date} - ${a.title} (${presCount} Present)`;
          if (a.id === curVal) opt.selected = true;
          certActSelect.appendChild(opt);
        });
        if (curVal === id && typeof renderCertificatePreview === 'function') {
          renderCertificatePreview();
        }
      }

      // Sync Certificate of Appearance dropdown & preview if active
      if (typeof initAppearanceStudio === 'function') {
        initAppearanceStudio();
      }
      if (typeof initAppreciationStudio === 'function') {
        initAppreciationStudio();
      }

      closeModalEditActivity();
      showToast(`Training "${act.title}" updated successfully!`, 'fa-circle-check');
    }

    


    // --- ROSTER ENGINE (50-PARTICIPANT BALANCING) ---
    function initRosterEngine() {
      rosterFilterState.selectedOffices = new Set(allUniqueOffices);
      updateRosterEngine();
    }

    function updateRosterEngine() {
      rosterFilterState.minAge = parseInt(document.getElementById('minAgeInput').value) || 20;
      rosterFilterState.maxAge = parseInt(document.getElementById('maxAgeInput').value) || 65;
      rosterFilterState.maxTrainings = parseInt(document.getElementById('maxTrainingsInput').value) || 999;
      rosterFilterState.targetQuota = parseInt(document.getElementById('targetQuotaInput').value) || 50;
      rosterFilterState.maxPerOffice = parseInt(document.getElementById('maxPerOfficeInput').value) || 4;
      rosterFilterState.includeCasual = document.getElementById('includeCasualCheckbox').checked;

      document.getElementById('rosterAgeDisplay').textContent = `${rosterFilterState.minAge} - ${rosterFilterState.maxAge}`;
      document.getElementById('rosterTrDisplay').textContent = rosterFilterState.maxTrainings >= 150 ? 'Any' : `< ${rosterFilterState.maxTrainings + 1}`;

      let pool = [...RAW_MEMBERS.permanent];
      if (rosterFilterState.includeCasual) pool = pool.concat(RAW_MEMBERS.casual);

      let matchingPool = pool.filter(e => {
        if (e.age === null || e.age < rosterFilterState.minAge || e.age > rosterFilterState.maxAge) return false;
        if ((e.trainings || 0) > rosterFilterState.maxTrainings) return false;
        if (!rosterFilterState.selectedOffices.has(e.office)) return false;
        return true;
      });

      matchingPool.sort((a, b) => (a.trainings || 0) - (b.trainings || 0) || (a.age || 0) - (b.age || 0));

      const offCounts = {};
      rosterSelectedList = [];
      matchingPool.forEach(e => {
        const off = e.office || 'UNKNOWN';
        if ((offCounts[off] || 0) < rosterFilterState.maxPerOffice && rosterSelectedList.length < rosterFilterState.targetQuota) {
          offCounts[off] = (offCounts[off] || 0) + 1;
          rosterSelectedList.push(e);
        }
      });

      if (rosterSelectedList.length < rosterFilterState.targetQuota) {
        matchingPool.forEach(e => {
          if (!rosterSelectedList.includes(e) && rosterSelectedList.length < rosterFilterState.targetQuota) {
            rosterSelectedList.push(e);
          }
        });
      }

      document.getElementById('metricSelectedCount').textContent = rosterSelectedList.length;
      const repOffices = new Set(rosterSelectedList.map(e => e.office));
      document.getElementById('rosterOfficeCountDisplay').textContent = `${repOffices.size} Offices Represented`;

      renderOfficePills(matchingPool);
      renderRosterTable();
    }

    function renderOfficePills(matchingPool) {
      const container = document.getElementById('officePillsContainer');
      container.innerHTML = '';

      const poolCounts = {};
      if (matchingPool) {
        matchingPool.forEach(e => { poolCounts[e.office] = (poolCounts[e.office] || 0) + 1; });
      }

      const rosterCounts = {};
      rosterSelectedList.forEach(e => { rosterCounts[e.office] = (rosterCounts[e.office] || 0) + 1; });

      allUniqueOffices.forEach(off => {
        const isSelected = rosterFilterState.selectedOffices.has(off);
        const pCnt = poolCounts[off] || 0;
        const rCnt = rosterCounts[off] || 0;

        let badgeContent = '';
        if (officePillMode === 'roster') {
          badgeContent = rCnt > 0 ? `${rCnt}` : '';
        } else if (officePillMode === 'pool') {
          badgeContent = pCnt > 0 ? `${pCnt}` : '';
        } else {
          badgeContent = (rCnt === pCnt && pCnt > 0) ? `${rCnt}` : (pCnt > 0 ? `${rCnt}/${pCnt}` : '');
        }

        const pill = document.createElement('button');
        pill.className = `px-2 py-0.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition ${isSelected ? 'bg-move-navy-900 text-white border-move-navy-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`;
        pill.innerHTML = `
          <span>${off}</span>
          ${badgeContent ? `<span class="text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-move-orange-500 text-white' : 'bg-slate-100 text-slate-700'}">${badgeContent}</span>` : ''}
        `;
        pill.onclick = (e) => {
          e.stopPropagation();
          if (rosterFilterState.selectedOffices.has(off)) rosterFilterState.selectedOffices.delete(off);
          else rosterFilterState.selectedOffices.add(off);
          updateRosterEngine();
        };
        pill.ondblclick = (e) => {
          e.stopPropagation();
          toggleOfficeFilterSort();
        };
        container.appendChild(pill);
      });
    }

    function setOfficePillMode(mode) {
      officePillMode = mode;
      const bR = document.getElementById('pillModeRosterBtn');
      const bB = document.getElementById('pillModeBothBtn');
      const bP = document.getElementById('pillModePoolBtn');
      const act = 'px-2 py-0.5 rounded bg-white text-move-orange-600 shadow-xs font-bold transition';
      const inact = 'px-2 py-0.5 rounded text-slate-600 hover:text-slate-900 transition font-semibold';
      if (bR) bR.className = mode === 'roster' ? act : inact;
      if (bB) bB.className = mode === 'both' ? act : inact;
      if (bP) bP.className = mode === 'pool' ? act : inact;
      updateRosterEngine();
    }

    function toggleOfficeFilterSort() {
      const ind = document.getElementById('officeSortIndicator');
      if (officeSortMode === 'az') {
        officeSortMode = 'za';
        allUniqueOffices.sort((a, b) => b.localeCompare(a));
        ind.textContent = 'Z → A';
      } else {
        officeSortMode = 'az';
        allUniqueOffices.sort((a, b) => a.localeCompare(b));
        ind.textContent = 'A → Z';
      }
      updateRosterEngine();
      showToast(`Offices arranged: ${officeSortMode.toUpperCase()}`, 'fa-arrow-down-a-z');
    }

    function selectAllOfficesRoster(select) {
      if (select) rosterFilterState.selectedOffices = new Set(allUniqueOffices);
      else rosterFilterState.selectedOffices.clear();
      updateRosterEngine();
    }

    function syncAgeFromSlider() {
      let minA = parseInt(document.getElementById('minAgeRange').value);
      let maxA = parseInt(document.getElementById('maxAgeRange').value);
      if (minA > maxA) [minA, maxA] = [maxA, minA];
      document.getElementById('minAgeInput').value = minA;
      document.getElementById('maxAgeInput').value = maxA;
      updateRosterEngine();
    }

    function syncAgeFromInput() {
      let minA = parseInt(document.getElementById('minAgeInput').value) || 20;
      let maxA = parseInt(document.getElementById('maxAgeInput').value) || 65;
      if (minA > maxA) [minA, maxA] = [maxA, minA];
      document.getElementById('minAgeRange').value = minA;
      document.getElementById('maxAgeRange').value = maxA;
      updateRosterEngine();
    }

    function syncTrainingsFromSlider() {
      const val = parseInt(document.getElementById('maxTrainingsRange').value);
      document.getElementById('maxTrainingsInput').value = val;
      updateRosterEngine();
    }

    function syncTrainingsFromInput() {
      const val = parseInt(document.getElementById('maxTrainingsInput').value) || 0;
      document.getElementById('maxTrainingsRange').value = Math.min(val, 150);
      updateRosterEngine();
    }

    function renderRosterTable() {
      const tbody = document.getElementById('rosterTableBody');
      tbody.innerHTML = '';
      rosterSelectedList.forEach((e, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center text-slate-400 font-bold">${idx + 1}</td>
          <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">${e.origNo || '-'}</td>
          <td class="py-2.5 px-3 font-bold text-move-navy-900">${e.name}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${e.office}</span></td>
          <td class="py-2.5 px-3 text-slate-600 truncate max-w-xs">${e.position}</td>
          <td class="py-2.5 px-3 text-center font-semibold text-slate-700">${e.age}</td>
          <td class="py-2.5 px-3 text-center font-bold text-move-orange-600">${e.trainings || 0}</td>
          <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600">${e.cell || '-'}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Auto-Filtered</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    function enrollRosterIntoActivity() {
      openModalAddActivity();
      document.getElementById('newActTitle').value = 'Capacity Training on Gender Sensitivity & RA 9262';
      showToast('Enrollment form populated with current 50 selected roster candidates!', 'fa-user-check');
    }

    // --- DATA EXPORTS ---
    function exportMembersToExcel() {
      if (typeof XLSX === 'undefined') return;
      const data = filteredMembers.map((m, idx) => ({
        "No.": idx + 1,
        "Full Name": m.name,
        "Department": m.office,
        "Position": m.position,
        "Appointment": m.appointment,
        "Age": m.age,
        "Gender": m.gender,
        "Civil Status": m.civilStatus,
        "Inside City Hall?": m.isInsideCityHall ? 'YES' : 'NO',
        "Contact Number": m.cell,
        "Current Address": m.address || 'Baguio City'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "MOVE Members Registry");
      XLSX.writeFile(wb, "MOVE_Baguio_Members_Registry.xlsx");
      showToast('Exported members registry to Excel (.xlsx)', 'fa-file-excel');
    }

    function exportMembersToCSV() {
      if (typeof XLSX === 'undefined') return;
      const data = filteredMembers.map((m, idx) => ({
        "No": idx + 1,
        "Full Name": m.name,
        "Department": m.office,
        "Position": m.position,
        "Inside City Hall": m.isInsideCityHall ? 'YES' : 'NO',
        "Contact": m.cell
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MOVE_Baguio_Members.csv';
      a.click();
      showToast('Exported members registry to CSV', 'fa-file-csv');
    }

    function exportRosterToExcel() {
      if (typeof XLSX === 'undefined') return;
      const rosterData = rosterSelectedList.map((e, idx) => ({
        "No.": idx + 1,
        "Original #": e.origNo || '',
        "Full Name": e.name,
        "Office": e.office,
        "Position": e.position,
        "Age": e.age,
        "Trainings": e.trainings || 0,
        "Contact": e.cell || '',
        "Civil Status": e.civilStatus || ''
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rosterData);
      XLSX.utils.book_append_sheet(wb, ws, "Selected Roster");
      XLSX.writeFile(wb, "MOVE_50_Participant_Roster.xlsx");
      showToast('Exported 50-participant roster to Excel (.xlsx)', 'fa-file-excel');
    }

    // --- SYNC WITH LOCAL PYTHON SERVER (sync_server.py) ---
    async function checkSyncServerStatus() {
      const badge = document.getElementById('syncServerBadge');
      try {
        const res = await fetch(`${LOCAL_SYNC_URL}/api/status`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          isSyncServerOnline = true;
          if (badge) {
            badge.className = 'text-[10px] font-bold px-2 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center justify-between';
            badge.innerHTML = '<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Local Sync Online</span></div><span class="text-[9px] text-slate-400">Port 8765</span>';
          }
          return true;
        }
      } catch(e) {
        isSyncServerOnline = false;
        if (badge) {
          badge.className = 'text-[10px] font-bold px-2 py-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/80 flex items-center justify-between';
          badge.innerHTML = '<div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span><span>Standalone Browser</span></div><span class="text-[9px] text-slate-400">Offline</span>';
        }
      }
      return false;
    }

    async function saveAllToExcelDatabase() {
      showToast('Syncing changes to ALL MALES MARIED WITH TRAINING.xls...', 'fa-spinner fa-spin');
      const payload = {
        sheetName: 'Selected_Participants',
        participants: rosterSelectedList.map(e => ({
          origNo: e.origNo,
          name: e.name,
          office: e.office,
          position: e.position,
          age: e.age,
          gender: e.gender,
          trainings: e.trainings || 0,
          cell: e.cell,
          civilStatus: e.civilStatus,
          statusLabel: 'MOVE Selected Roster'
        })),
        includeOfficeSummary: true
      };

      try {
        const res = await fetch(`${LOCAL_SYNC_URL}/api/save-sheet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Database synced directly to ALL MALES MARIED WITH TRAINING.xls!`, 'fa-circle-check');
          return;
        }
      } catch(e) {
        console.warn('Sync server offline, falling back to client-side backup save:', e);
      }

      exportRosterToExcel();
      showToast('Saved locally in browser and exported XLSX copy.', 'fa-circle-check');
    }

    // --- LOCAL STORAGE PERSISTENCE ---
    function saveStateToStorage() {
      try {
        localStorage.setItem('move_activities_store', JSON.stringify(activitiesList));
        localStorage.setItem('move_custom_members', JSON.stringify(allMembers.filter(m => String(m.id).startsWith('CUSTOM_'))));
      } catch(e) {}
    }

    function loadStateFromStorage() {
      try {
        const storedActs = localStorage.getItem('move_activities_store');
        if (storedActs) {
          activitiesList = JSON.parse(storedActs);
          const k2 = activitiesList.find(a => a.id === 'ACT-KITCHEN-2');
          if (k2) {
            k2.title = 'Men in the Kitchen 2';
            k2.shortDescription = 'Love Served in the Kitchen';
            k2.date = 'October 20, 2026';
            k2.venue = 'CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City';
          }
        }
        const storedCustom = localStorage.getItem('move_custom_members');
        if (storedCustom) {
          const customList = JSON.parse(storedCustom);
          customList.forEach(cm => {
            if (!allMembers.some(x => x.id === cm.id)) allMembers.unshift(cm);
          });
        }
      } catch(e) {}
    }

    // --- TOAST NOTIFICATION ---
    function showToast(msg, iconClass) {
      const toast = document.getElementById('toastNotice');
      const msgEl = document.getElementById('toastMsg');
      const iconEl = document.getElementById('toastIcon');
      if (!toast) return;

      msgEl.textContent = msg;
      iconEl.className = `fa-solid ${iconClass || 'fa-circle-check'} text-move-orange-400`;
      toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
      toast.classList.add('opacity-100', 'translate-y-0');

      clearTimeout(window._toastTimeout);
      window._toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
      }, 3200);
    }
