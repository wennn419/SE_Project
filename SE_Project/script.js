
  // ===== THEME =====
  (function() {
    const saved = localStorage.getItem('ft_theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      document.getElementById('theme-toggle').textContent = '☀️';
    }
  })();
  function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    document.getElementById('theme-toggle').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('ft_theme', isLight ? 'light' : 'dark');
  }

  // ===== PASSWORD HASHING =====
  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ===== STATE =====
  let users       = JSON.parse(localStorage.getItem('ft_users') || '[]');
  let currentUser = null;
  let workouts    = [];
  let editingId   = null;
  let weekFilter  = 'all';

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // ===== EXERCISE DATA (from Iteration2) =====
  const CAT_LABELS = {
    strength: 'Strength',
    cardio:   'Cardio',
    hiit:     'HIIT',
    yoga:     'Yoga & Stretch',
    other:    'Sports & Other'
  };

  const EXERCISES = {
    strength: [
      { name: 'Bench Press',    icon: '🏋️' },
      { name: 'Deadlift',       icon: '💪' },
      { name: 'Squats',         icon: '🦵' },
      { name: 'Pull-ups',       icon: '🙌' },
      { name: 'Shoulder Press', icon: '🔝' },
      { name: 'Dumbbell Row',   icon: '🧎' },
    ],
    cardio: [
      { name: 'Running',    icon: '🏃' },
      { name: 'Cycling',    icon: '🚴' },
      { name: 'Swimming',   icon: '🏊' },
      { name: 'Jump Rope',  icon: '🏅' },
      { name: 'Elliptical', icon: '🔄' },
      { name: 'Rowing',     icon: '🚣' },
    ],
    hiit: [
      { name: 'Burpees',           icon: '🔥' },
      { name: 'Box Jumps',         icon: '📦' },
      { name: 'Kettlebell',        icon: '🔔' },
      { name: 'Battle Ropes',      icon: '🪢' },
      { name: 'Mountain Climbers', icon: '⛰️' },
      { name: 'Sprint Intervals',  icon: '⚡' },
    ],
    yoga: [
      { name: 'Vinyasa Flow', icon: '🧘' },
      { name: 'Yin Yoga',     icon: '☯️' },
      { name: 'Power Yoga',   icon: '✨' },
      { name: 'Stretching',   icon: '🤸' },
      { name: 'Meditation',   icon: '🌿' },
      { name: 'Pilates',      icon: '🩰' },
    ],
    other: [
      { name: 'Basketball', icon: '🏀' },
      { name: 'Football',   icon: '⚽' },
      { name: 'Tennis',     icon: '🎾' },
      { name: 'Hiking',     icon: '🥾' },
      { name: 'Dance',      icon: '💃' },
      { name: 'Boxing',     icon: '🥊' },
    ],
  };

  // Modal state (Iteration2)
  let modalDayIndex   = 0;
  let selectedExercise = null;
  let selectedCat     = 'strength';

  // ===== DATE HELPERS =====
  function getWeekDates(offset) {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + (offset || 0) * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  function getWeekOffset() {
    if (weekFilter === 'last') return -1;
    return 0;
  }

  function toDateOnly(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isThisWeek(isoDate) {
    const dates = getWeekDates(0);
    const d = toDateOnly(new Date(isoDate.replace(/-/g, '/')));
    return d >= toDateOnly(dates[0]) && d <= toDateOnly(dates[6]);
  }

  function isLastWeek(isoDate) {
    const dates = getWeekDates(-1);
    const d = toDateOnly(new Date(isoDate.replace(/-/g, '/')));
    return d >= toDateOnly(dates[0]) && d <= toDateOnly(dates[6]);
  }

  function getTodayDayIndex() {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }

  function getDateForDayIndex(dayIndex) {
    const offset = weekFilter === 'last' ? -1 : 0;
    const dates = getWeekDates(offset);
    return dates[dayIndex];
  }

  function formatDateLabel(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[date.getMonth()] + ' ' + d + ', ' + date.getFullYear();
  }

  function getTodayDateStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ===== INIT =====
  window.onload = function () {
    const savedEmail = localStorage.getItem('ft_session');
    if (savedEmail) {
      const user = users.find(u => u.email === savedEmail);
      if (user) { loginUser(user); return; }
    }
    showPage('auth');
  };

  // ===== AUTH =====
  function switchTab(tab) {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const btns         = document.querySelectorAll('.tabs button');
    if (tab === 'login') {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      btns[0].classList.add('active'); btns[1].classList.remove('active');
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      btns[0].classList.remove('active'); btns[1].classList.add('active');
    }
  }

  async function login() {
    const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const errEl    = document.getElementById('login-error');
    errEl.classList.remove('show');
    if (!email || !password) { errEl.textContent = 'Please enter email and password.'; errEl.classList.add('show'); return; }
    if (!isValidEmail(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return; }
    const user = users.find(u => u.email === email);
    if (!user) { errEl.textContent = 'No account found with this email.'; errEl.classList.add('show'); return; }
    const hashed = await hashPassword(password);
    if (user.password !== hashed) { errEl.textContent = 'Incorrect password.'; errEl.classList.add('show'); return; }
    localStorage.setItem('ft_session', email);
    loginUser(user);
  }

  async function register() {
    const name     = document.getElementById('registerUsername').value.trim();
    const email    = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const errEl    = document.getElementById('reg-error');
    errEl.classList.remove('show');
    if (!name || !email || !password || !confirm) { errEl.textContent = 'Please fill in all fields.'; errEl.classList.add('show'); return; }
    if (!isValidEmail(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return; }
    if (password !== confirm)  { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); return; }
    if (password.length < 6)   { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
    if (users.find(u => u.email === email)) { errEl.textContent = 'An account with this email already exists.'; errEl.classList.add('show'); return; }
    const hashed = await hashPassword(password);
    const user = { name, email, password: hashed };
    users.push(user);
    localStorage.setItem('ft_users', JSON.stringify(users));
    localStorage.setItem('ft_session', email);
    loginUser(user);
  }

  function loginUser(user) {
    currentUser = user;
    workouts    = JSON.parse(localStorage.getItem('ft_workouts_' + user.email) || '[]');

    // Sidebar
    document.getElementById('sidebar').classList.add('visible');
    document.getElementById('main-content').classList.add('with-sidebar');
    document.getElementById('user-chip').style.display = 'flex';
    document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('user-name-label').textContent = user.name;
    document.getElementById('logout-btn').classList.add('show-btn');
    document.body.classList.add('logged-in');

    buildNav();
    showPage('home');
  }

  function doLogout() {
    localStorage.removeItem('ft_session');
    currentUser = null; workouts = [];
    document.getElementById('sidebar').classList.remove('visible');
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
    document.getElementById('sidebar-toggle').classList.remove('active');
    document.getElementById('main-content').classList.remove('with-sidebar');
    document.getElementById('user-chip').style.display = 'none';
    document.getElementById('logout-btn').classList.remove('show-btn');
    document.getElementById('nav-links').innerHTML = '';
    document.body.classList.remove('logged-in');
    showPage('auth');
  }

  function togglePassword(id, eye) {
    const input = document.getElementById(id);
    if (input.type === 'password') { input.type = 'text'; eye.textContent = '🙈'; }
    else                           { input.type = 'password'; eye.textContent = '👁️'; }
  }

  // Forgot Password
  function openForgotPassword() {
    document.getElementById('forgotModal').classList.add('open');
    document.getElementById('emailStep').style.display = 'block';
    document.getElementById('resetStep').style.display = 'none';
    document.getElementById('forgotEmail').value = '';
    document.getElementById('forgot-email-error').classList.remove('show');
  }
  function closeForgotPassword() { document.getElementById('forgotModal').classList.remove('open'); }
  function verifyForgotEmail() {
    const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
    const errEl = document.getElementById('forgot-email-error');
    errEl.classList.remove('show');
    if (!email) { errEl.textContent = 'Please enter your email.'; errEl.classList.add('show'); return; }
    if (!isValidEmail(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return; }
    if (!users.find(u => u.email === email)) { errEl.textContent = 'No account found with this email.'; errEl.classList.add('show'); return; }
    document.getElementById('emailStep').style.display = 'none';
    document.getElementById('resetStep').style.display = 'block';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('forgot-reset-error').classList.remove('show');
  }
  async function resetPassword() {
    const email   = document.getElementById('forgotEmail').value.trim().toLowerCase();
    const newPw   = document.getElementById('newPassword').value;
    const confPw  = document.getElementById('confirmNewPassword').value;
    const errEl   = document.getElementById('forgot-reset-error');
    errEl.classList.remove('show');
    if (!newPw || !confPw)  { errEl.textContent = 'Please fill in both fields.'; errEl.classList.add('show'); return; }
    if (newPw !== confPw)   { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); return; }
    if (newPw.length < 6)   { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
    const user = users.find(u => u.email === email);
    if (user) {
      user.password = await hashPassword(newPw);
      localStorage.setItem('ft_users', JSON.stringify(users));
    }
    closeForgotPassword();
    alert('Password reset successfully! Please log in.');
  }

  // ===== SIDEBAR TOGGLE (mobile) =====
  function isMobile() { return window.innerWidth <= 768; }

  function toggleSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      toggleBtn.classList.remove('active');
      toggleBtn.textContent = '☰';
    } else {
      sidebar.classList.add('open');
      overlay.classList.add('open');
      toggleBtn.classList.add('active');
      toggleBtn.textContent = '✕';
    }
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
    const toggleBtn = document.getElementById('sidebar-toggle');
    toggleBtn.classList.remove('active');
    toggleBtn.textContent = '☰';
  }

  // ===== NAVIGATION =====
  const NAV_ITEMS = [
    { key: 'home',     label: 'Home',     icon: '🏠' },
    { key: 'schedule', label: 'Schedule', icon: '📅' },
    { key: 'report',   label: 'Report',   icon: '📊' },
  ];

  function buildNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.dataset.page = item.key;
      btn.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
      btn.addEventListener('click', () => showPage(item.key));
      nav.appendChild(btn);
    });
  }

  function showPage(key) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const page = document.getElementById('page-' + key);
    if (page) page.classList.add('active');
    const navBtn = document.querySelector(`.nav-btn[data-page="${key}"]`);
    if (navBtn) navBtn.classList.add('active');
    if (key === 'home')     renderHome();
    if (key === 'schedule') renderSchedule();
    if (key === 'report')   renderReport();
    // Auto-close sidebar on mobile after nav
    if (isMobile()) closeSidebar();
  }

  // Handle window resize — restore sidebar on desktop, clean up on mobile
  window.addEventListener('resize', () => {
    if (!currentUser) return;
    if (!isMobile()) {
      // On desktop: ensure sidebar is always visible, no overlay
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('open');
      document.getElementById('sidebar-toggle').classList.remove('active');
      document.getElementById('sidebar-toggle').textContent = '☰';
    }
  });

  // ===== SAVE =====
  function saveWorkouts() {
    localStorage.setItem('ft_workouts_' + currentUser.email, JSON.stringify(workouts));
  }

  // ===== STREAK & HISTORY (from Iteration2) =====
  function calcStreak() {
    const h = JSON.parse(localStorage.getItem('ft_history_' + currentUser.email) || '[]');
    if (h.length === 0) return 0;
    // Deduplicate dates before computing streak
    const uniqueDates = [...new Set(h.map(x => x.date))]
      .map(d => new Date(d.replace(/-/g, '/')))
      .sort((a, b) => b - a);
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const newest = new Date(uniqueDates[0]); newest.setHours(0,0,0,0);
    if (newest < yesterday) return 0;
    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const a = new Date(uniqueDates[i]); a.setHours(0,0,0,0);
      const b = new Date(uniqueDates[i+1]); b.setHours(0,0,0,0);
      const diff = (a - b) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) { streak++; } else { break; }
    }
    return streak;
  }

  function saveHistory() {
    const today = getTodayDateStr();
    const h = JSON.parse(localStorage.getItem('ft_history_' + currentUser.email) || '[]');
    const existing = h.find(x => x.date === today);
    const count = workouts.filter(w => w.done).length;
    if (count === 0) {
      // Remove today's entry if count dropped to zero
      const idx = h.findIndex(x => x.date === today);
      if (idx !== -1) h.splice(idx, 1);
    } else if (existing) {
      existing.count = count;
    } else {
      h.unshift({ date: today, count });
    }
    localStorage.setItem('ft_history_' + currentUser.email, JSON.stringify(h));
  }

  function renderHistory() {
    if (!currentUser) return;
    const h = JSON.parse(localStorage.getItem('ft_history_' + currentUser.email) || '[]');
    const el = document.getElementById('history-log');
    if (!el) return;
    if (h.length === 0) {
      el.innerHTML = '<div class="empty-state">No history yet. Complete all workouts in a day to record a session!</div>';
    } else {
      el.innerHTML = h.map(x =>
        `<div class="weight-item"><span class="wi-date">${x.date}</span><span class="wi-val">${x.count} workout${x.count !== 1 ? 's' : ''} completed</span></div>`
      ).join('');
    }
  }

  // ===== HOME =====
  function renderHome() {
    const hour = new Date().getHours();
    let greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    document.getElementById('greeting-time').textContent = greeting;
    document.getElementById('greeting-name').textContent = 'Welcome back, ' + currentUser.name.split(' ')[0] + '!';

    const done      = workouts.filter(w => w.done);
    const total     = workouts.length;
    const totalMins = done.reduce((s, w) => s + w.duration, 0);
    const pct       = total > 0 ? Math.round(done.length / total * 100) : 0;

    document.getElementById('home-stat-done').textContent  = done.length;
    document.getElementById('home-stat-mins').textContent  = totalMins;
    document.getElementById('home-stat-total').textContent = total;
    document.getElementById('home-pct').textContent = pct + '%';
    document.getElementById('home-pb').style.width  = pct + '%';
    document.getElementById('greeting-sub').textContent = `${done.length} of ${total} workout${total !== 1 ? 's' : ''} completed this period.`;

    // Streak (real day-streak from history)
    const streakEl = document.getElementById('home-streak-area');
    const streak = calcStreak();
    if (streak > 0) {
      streakEl.innerHTML = `<div class="streak-banner"><div class="sb-icon">🔥</div><div class="sb-text"><div class="sb-title">${streak}-day streak! Keep it up!</div><div class="sb-sub">${done.length} workout${done.length !== 1 ? 's' : ''} completed this period.</div></div></div>`;
    } else if (done.length > 0) {
      streakEl.innerHTML = `<div class="streak-banner"><div class="sb-icon">💪</div><div class="sb-text"><div class="sb-title">${done.length} workout${done.length !== 1 ? 's' : ''} completed!</div><div class="sb-sub">Keep up the great work.</div></div></div>`;
    } else {
      streakEl.innerHTML = '';
    }

    // Today's workouts
    const todayIdx = getTodayDayIndex();
    const todayWorkouts = workouts.filter(w => w.dayIndex === todayIdx);
    const todayListEl = document.getElementById('home-today-list');
    if (todayWorkouts.length === 0) {
      todayListEl.innerHTML = '<div class="empty-state">No workouts scheduled for today.</div>';
    } else {
      todayListEl.innerHTML = `
        <div class="today-card">
          <div class="today-card-header">
            <span class="tch-day">${DAYS[todayIdx]} · ${formatDateLabel(new Date())}</span>
            <span class="tch-count">${todayWorkouts.filter(w=>w.done).length}/${todayWorkouts.length} done</span>
          </div>
          ${todayWorkouts.map(w => `
            <div class="today-workout-item${w.done ? ' done' : ''}">
              <div class="twi-dot"></div>
              <span class="twi-name">${w.icon ? w.icon + ' ' : ''}${w.name}</span>
              <span class="twi-dur">${w.duration}m</span>
            </div>
          `).join('')}
        </div>`;
    }
  }

  // ===== SCHEDULE =====
  function setWeekFilter(val, e) {
    weekFilter = val;
    document.querySelectorAll('#week-filter .filter-btn').forEach(b => b.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');
    renderSchedule();
  }

  function renderSchedule() {
    const dayFilter = document.getElementById('day-filter').value;
    let filtered = [...workouts];

    if (weekFilter === 'this') filtered = filtered.filter(w => isThisWeek(w.addedDate || getTodayDateStr()));
    if (weekFilter === 'last') filtered = filtered.filter(w => isLastWeek(w.addedDate || getTodayDateStr()));

    const done  = filtered.filter(w => w.done).length;
    const total = filtered.length;
    const mins  = filtered.reduce((s, w) => s + w.duration, 0);
    const statBar = document.getElementById('schedule-stat-bar');
    if (total > 0) {
      statBar.style.display = 'flex';
      document.getElementById('stat-done').textContent  = done;
      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-mins').textContent  = mins;
    } else {
      statBar.style.display = 'none';
    }

    const listEl = document.getElementById('workout-list');
    listEl.innerHTML = '';

    let hasAny = false;
    DAYS.forEach((day, i) => {
      if (dayFilter !== 'all' && parseInt(dayFilter) !== i) return;
      const dws = filtered.filter(w => w.dayIndex === i);
      if (!dws.length) return;
      hasAny = true;
      const label = document.createElement('div');
      label.className = 'section-label';
      const dayDate = getDateForDayIndex(i);
      label.textContent = day + ' · ' + formatDateLabel(dayDate);
      listEl.appendChild(label);
      dws.forEach(w => listEl.appendChild(buildCard(w)));
    });

    if (!hasAny) {
      listEl.innerHTML = '<div class="empty-state">No workouts found. Add one to get started!</div>';
    }
  }

  function buildCard(w) {
    const div = document.createElement('div');
    div.className = 'workout-card' + (w.done ? ' done' : '');
    div.innerHTML = `
      <button class="check-btn" onclick="toggleDone('${w.id}')">${w.done ? '✓' : ''}</button>
      <div class="workout-info">
        <div class="workout-name">${w.icon ? w.icon + ' ' : ''}${w.name}</div>
        <div class="workout-meta">${DAYS[w.dayIndex]} · ${w.duration} min</div>
      </div>
      ${w.cat ? `<span class="workout-cat-badge">${CAT_LABELS[w.cat] || w.cat}</span>` : ''}
      ${w.done ? `<span class="done-badge">DONE</span>` : `<span class="progress-badge">IN PROGRESS</span>`}
      <div class="workout-actions">
        <button class="action-btn" onclick="openEditModal('${w.id}')" title="Edit">✏️</button>
        <button class="action-btn delete" onclick="deleteWorkout('${w.id}')" title="Delete">🗑️</button>
      </div>
    `;
    return div;
  }

  function toggleDone(id) {
    const w = workouts.find(x => x.id === id);
    if (w) {
      w.done = !w.done;
      saveWorkouts();
      saveHistory(); // Always sync history so streak stays accurate
      renderSchedule(); renderHome();
    }
  }

    function deleteWorkout(id) {
        workouts = workouts.filter(x => x.id !== id);
        saveWorkouts();
        saveHistory();
        renderSchedule();
        renderHome();
    }

  // ===== MODAL (Iteration2 rich logic) =====
  function openAddModal(prefillDayIndex) {
    editingId = null;
    modalDayIndex = prefillDayIndex !== undefined ? prefillDayIndex : getTodayDayIndex();
    selectedExercise = null;
    selectedCat = 'strength';

    document.getElementById('modal-title').textContent    = 'Add Workout';
    document.getElementById('modal-subtitle').textContent = '';
    document.getElementById('modal-day-select').value     = modalDayIndex;
    document.getElementById('custom-name').value          = '';
    document.getElementById('duration-input').value       = 30;
    document.getElementById('duration-input').classList.remove('error');
    document.getElementById('duration-hint').textContent  = '';
    document.getElementById('modal-add').textContent      = 'Add Workout';
    document.getElementById('modal-add').disabled         = true;

    renderCatTabs();
    renderExercises();
    document.getElementById('modal-backdrop').classList.add('open');
  }

  function openEditModal(id) {
    const w = workouts.find(x => x.id === id);
    if (!w) return;
    editingId = id;
    modalDayIndex    = w.dayIndex;
    selectedCat      = w.cat || 'strength';
    selectedExercise = { name: w.name, icon: w.icon || '🏃' };

    const isPreset = Object.values(EXERCISES).flat().some(e => e.name === w.name);
    document.getElementById('modal-title').textContent    = 'Edit Workout';
    document.getElementById('modal-subtitle').textContent = '';
    document.getElementById('modal-day-select').value     = w.dayIndex;
    document.getElementById('custom-name').value          = isPreset ? '' : w.name;
    document.getElementById('duration-input').value       = w.duration;
    document.getElementById('duration-input').classList.remove('error');
    document.getElementById('duration-hint').textContent  = '';
    document.getElementById('modal-add').textContent      = 'Save Changes';
    document.getElementById('modal-add').disabled         = false;

    renderCatTabs();
    renderExercises();
    document.getElementById('modal-backdrop').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
    editingId = null;
  }

  function renderCatTabs() {
    const wrap = document.getElementById('cat-tabs');
    wrap.innerHTML = '';
    Object.keys(CAT_LABELS).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-tab' + (cat === selectedCat ? ' active' : '');
      btn.textContent = CAT_LABELS[cat];
      btn.addEventListener('click', () => {
        selectedCat = cat; selectedExercise = null;
        renderCatTabs(); renderExercises(); checkAdd();
      });
      wrap.appendChild(btn);
    });
  }

  function renderExercises() {
    const g = document.getElementById('exercise-grid');
    g.innerHTML = '';
    EXERCISES[selectedCat].forEach(ex => {
      const opt = document.createElement('div');
      opt.className = 'exercise-option' + (selectedExercise && selectedExercise.name === ex.name ? ' selected' : '');
      opt.innerHTML = `<span style="font-size:15px;margin-right:6px;line-height:1">${ex.icon}</span>${ex.name}`;
      opt.addEventListener('click', () => {
        selectedExercise = ex;
        document.getElementById('custom-name').value = '';
        renderExercises(); checkAdd();
      });
      g.appendChild(opt);
    });
  }

  function validateDuration() {
    const input = document.getElementById('duration-input');
    const hint  = document.getElementById('duration-hint');
    const val   = parseInt(input.value);
    input.classList.remove('error');
    if (input.value === '' || isNaN(val)) {
      hint.textContent = 'Please enter a duration.';
      input.classList.add('error'); return false;
    }
    if (val < 1)   { hint.textContent = 'Minimum is 1 minute.'; input.classList.add('error'); return false; }
    if (val > 300) { hint.textContent = 'Maximum is 300 minutes.'; input.classList.add('error'); return false; }
    hint.textContent = '';
    return true;
  }

  function checkAdd() {
    const hasExercise = selectedExercise || document.getElementById('custom-name').value.trim();
    const durOk = validateDuration();
    document.getElementById('modal-add').disabled = !(hasExercise && durOk);
  }

  document.getElementById('duration-input').addEventListener('input', () => {
    validateDuration(); checkAdd();
  });

  document.getElementById('custom-name').addEventListener('input', () => {
    if (document.getElementById('custom-name').value.trim()) selectedExercise = null;
    renderExercises(); checkAdd();
  });

  document.getElementById('modal-add').addEventListener('click', () => {
    if (!validateDuration()) return;
    const customVal = document.getElementById('custom-name').value.trim();
    const name      = customVal || (selectedExercise ? selectedExercise.name : '');
    const icon      = customVal ? '🏆' : (selectedExercise ? selectedExercise.icon : '🏃');
    const duration  = parseInt(document.getElementById('duration-input').value);
    const dayIndex  = parseInt(document.getElementById('modal-day-select').value);

    if (!name) return;

    if (editingId) {
      const w = workouts.find(x => x.id === editingId);
      if (w) { w.dayIndex = dayIndex; w.name = name; w.icon = icon; w.duration = duration; w.cat = selectedCat; }
    } else {
      workouts.push({
        id: Date.now().toString(),
        dayIndex: dayIndex,
        name, icon, duration,
        cat: selectedCat,
        done: false,
        addedDate: getTodayDateStr()
      });
    }
    saveWorkouts(); closeModal(); renderSchedule();
  });

  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // ===== REPORT =====
  function renderReport() {
    const done      = workouts.filter(w => w.done);
    const total     = workouts.length;
    const totalMins = done.reduce((s, w) => s + w.duration, 0);
    const streak    = calcStreak();
    const h         = JSON.parse(localStorage.getItem('ft_history_' + currentUser.email) || '[]');
    document.getElementById('report-grid').innerHTML = `
      <div class="report-card"><div class="rc-num" style="color:var(--green)">${done.length}</div><div class="rc-label">Workouts Completed</div></div>
      <div class="report-card"><div class="rc-num" style="color:var(--accent)">${totalMins}</div><div class="rc-label">Total Minutes</div></div>
      <div class="report-card"><div class="rc-num">${total}</div><div class="rc-label">Total Scheduled</div></div>
      <div class="report-card"><div class="rc-num" style="color:var(--amber)">${total > 0 ? Math.round(done.length/total*100) : 0}%</div><div class="rc-label">Completion Rate</div></div>
      <div class="report-card"><div class="rc-num" style="color:var(--text)">${h.length}</div><div class="rc-label">Sessions Logged</div></div>
      <div class="report-card"><div class="rc-num" style="color:var(--amber)">${streak}🔥</div><div class="rc-label">Day Streak</div></div>
    `;
    const listEl = document.getElementById('report-list');
    if (done.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No completed workouts yet. Mark some as done!</div>';
    } else {
      listEl.innerHTML = '';
      done.forEach(w => {
        const item = document.createElement('div');
        item.className = 'report-item';
        item.innerHTML = `
          <div class="report-day">${DAYS[w.dayIndex].slice(0,3)}</div>
          <div class="report-name">${w.icon ? w.icon + ' ' : ''}${w.name}</div>
          <div class="report-mins">${w.duration} min</div>
          <div class="done-badge">DONE</div>
        `;
        listEl.appendChild(item);
      });
    }
    renderWeightLog();
    renderHistory();
  }

  function logWeight() {
    const input = document.getElementById('weight-input');
    const val = parseFloat(input.value);
    const errEl = document.getElementById('weight-error');

    if (isNaN(val)) {
        errEl.textContent = 'Please enter a weight.';
        errEl.classList.add('show');
        return;
    }

    if (val < 20 || val > 300) {
        errEl.textContent = 'Weight must be between 20 and 300 kg.';
        errEl.classList.add('show');
        return;
    }

    errEl.classList.remove('show');

    const log = JSON.parse(
        localStorage.getItem('ft_weight_' + currentUser.email) || '[]'
    );

    log.unshift({
        date: getTodayDateStr(),
        weight: val
    });

    localStorage.setItem(
        'ft_weight_' + currentUser.email,
        JSON.stringify(log)
    );

    input.value = '';
    renderWeightLog();
}

  function renderWeightLog() {
    if (!currentUser) return;
    const log = JSON.parse(localStorage.getItem('ft_weight_' + currentUser.email) || '[]');
    const el  = document.getElementById('weight-log');
    if (log.length === 0) { el.innerHTML = '<div class="empty-state">No weight logged yet.</div>'; return; }
    el.innerHTML = '';
    log.forEach(x => {
      const item = document.createElement('div');
      item.className = 'weight-item';
      item.innerHTML = `<span class="wi-date">${x.date}</span><span class="wi-val">${x.weight} kg</span>`;
      el.appendChild(item);
    });
  }
