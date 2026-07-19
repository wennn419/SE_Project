
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

  // Modal state
  let selectedExercise = null;
  let selectedCat     = 'strength';

  // ===== DATE HELPERS =====
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // dayIndex 0=Mon … 6=Sun from a date string
  function dayIndexFromDateStr(ds) {
    const d = new Date(ds.replace(/-/g, '/'));
    const jsDay = d.getDay(); // 0=Sun
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function formatDateLabel(ds) {
    // ds = "YYYY-MM-DD"
    const d = new Date(ds.replace(/-/g, '/'));
    return DAYS[dayIndexFromDateStr(ds)] + ', ' + MONTHS[d.getMonth()] + ' ' + String(d.getDate()).padStart(2,'0') + ', ' + d.getFullYear();
  }

  function getWeekRange(offset) {
    const today = new Date();
    const mon = new Date(today);
    mon.setDate(today.getDate() - ((today.getDay() + 6) % 7) + (offset || 0) * 7);
    mon.setHours(0,0,0,0);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23,59,59,999);
    return { mon, sun };
  }

  function toDateOnly(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function dateObjFromStr(ds) { return new Date(ds.replace(/-/g, '/')); }

  function isInWeek(ds, offset) {
    const { mon, sun } = getWeekRange(offset);
    const d = dateObjFromStr(ds);
    return d >= mon && d <= sun;
  }

  function isoToday() { return getTodayDateStr(); }

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
    // Migrate legacy workouts (dayIndex only, no date) → assign to current week's matching date
    workouts = workouts.map(w => {
      if (!w.date) {
        const weekDates = getWeekRange(0);
        const mon = new Date(weekDates.mon);
        const d = new Date(mon);
        d.setDate(mon.getDate() + (w.dayIndex || 0));
        w.date = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      }
      return w;
    });
    saveWorkouts();

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
    if (input.type === 'password') {
      input.type = 'text'; eye.textContent = '🙈';
      eye.setAttribute('aria-label', 'Hide password'); eye.setAttribute('aria-pressed', 'true');
    } else {
      input.type = 'password'; eye.textContent = '👁️';
      eye.setAttribute('aria-label', 'Show password'); eye.setAttribute('aria-pressed', 'false');
    }
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
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      sidebar.classList.add('open');
      overlay.classList.add('open');
      toggleBtn.classList.add('active');
      toggleBtn.textContent = '✕';
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
    const toggleBtn = document.getElementById('sidebar-toggle');
    toggleBtn.classList.remove('active');
    toggleBtn.textContent = '☰';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  // ===== NAVIGATION =====
  const NAV_ITEMS = [
    { key: 'home',         label: 'Home',         icon: '🏠' },
    { key: 'schedule',     label: 'Schedule',     icon: '📅' },
    { key: 'calendar',     label: 'Calendar',     icon: '📆' },
    { key: 'achievements', label: 'Achievements', icon: '🏆' },
    { key: 'report',       label: 'Report',       icon: '📊' },
  ];

  function buildNav() {
    const nav = document.getElementById('nav-links');
    nav.innerHTML = '';
    NAV_ITEMS.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.dataset.page = item.key;
      btn.innerHTML = `<span class="nav-icon" aria-hidden="true">${item.icon}</span>${item.label}`;
      btn.addEventListener('click', () => showPage(item.key));
      nav.appendChild(btn);
    });
  }

  function showPage(key) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
    const page = document.getElementById('page-' + key);
    if (page) page.classList.add('active');
    const navBtn = document.querySelector(`.nav-btn[data-page="${key}"]`);
    if (navBtn) { navBtn.classList.add('active'); navBtn.setAttribute('aria-current', 'page'); }
    if (key === 'home')         renderHome();
    if (key === 'schedule')     renderSchedule();
    if (key === 'report')       renderReport();
    if (key === 'calendar')     { if (calView === 'week') renderCalWeek(); else renderCalendar(); }
    if (key === 'achievements') renderAchievements();
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

    // Today's workouts by date
    const todayStr = getTodayDateStr();
    const todayWorkouts = workouts.filter(w => w.date === todayStr);
    const todayListEl = document.getElementById('home-today-list');
    if (todayWorkouts.length === 0) {
      todayListEl.innerHTML = '<div class="empty-state">No workouts scheduled for today.</div>';
    } else {
      const d = new Date();
      const dayLabel = DAYS[dayIndexFromDateStr(todayStr)] + ', ' + MONTHS[d.getMonth()] + ' ' + String(d.getDate()).padStart(2,'0');
      todayListEl.innerHTML = `
        <div class="today-card">
          <div class="today-card-header">
            <span class="tch-day">${dayLabel}</span>
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
    const today = getTodayDateStr();
    let filtered = [...workouts];

    if (weekFilter === 'this')     filtered = filtered.filter(w => isInWeek(w.date, 0));
    if (weekFilter === 'last')     filtered = filtered.filter(w => isInWeek(w.date, -1));
    if (weekFilter === 'upcoming') filtered = filtered.filter(w => w.date >= today);

    // Sort by date
    filtered.sort((a, b) => a.date.localeCompare(b.date));

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

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No workouts found. Add one to get started!</div>';
      return;
    }

    // Group by date
    const byDate = {};
    filtered.forEach(w => {
      if (!byDate[w.date]) byDate[w.date] = [];
      byDate[w.date].push(w);
    });

    Object.keys(byDate).sort().forEach(ds => {
      const label = document.createElement('div');
      label.className = 'section-label';
      label.textContent = formatDateLabel(ds);
      listEl.appendChild(label);
      byDate[ds].forEach(w => listEl.appendChild(buildCard(w)));
    });
  }

  function buildCard(w) {
    const div = document.createElement('div');
    div.className = 'workout-card' + (w.done ? ' done' : '');
    div.innerHTML = `
      <button class="check-btn" onclick="toggleDone('${w.id}')">${w.done ? '✓' : ''}</button>
      <div class="workout-info">
        <div class="workout-name">${w.icon ? w.icon + ' ' : ''}${w.name}</div>
        <div class="workout-meta">${w.date} · ${w.duration} min</div>
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

  // ===== MODAL =====
  function openAddModal(prefillDate) {
    editingId = null;
    selectedExercise = null;
    selectedCat = 'strength';

    document.getElementById('modal-title').textContent    = 'Add Workout';
    document.getElementById('modal-subtitle').textContent = '';
    document.getElementById('modal-date-input').value     = prefillDate || getTodayDateStr();
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
    selectedCat      = w.cat || 'strength';
    selectedExercise = { name: w.name, icon: w.icon || '🏃' };

    const isPreset = Object.values(EXERCISES).flat().some(e => e.name === w.name);
    document.getElementById('modal-title').textContent    = 'Edit Workout';
    document.getElementById('modal-subtitle').textContent = '';
    document.getElementById('modal-date-input').value     = w.date || getTodayDateStr();
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
      btn.type = 'button';
      btn.className = 'cat-tab' + (cat === selectedCat ? ' active' : '');
      btn.textContent = CAT_LABELS[cat];
      btn.setAttribute('aria-pressed', cat === selectedCat ? 'true' : 'false');
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
      const selected = !!(selectedExercise && selectedExercise.name === ex.name);
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'exercise-option' + (selected ? ' selected' : '');
      opt.setAttribute('aria-pressed', selected ? 'true' : 'false');
      opt.innerHTML = `<span aria-hidden="true" style="font-size:15px;margin-right:6px;line-height:1">${ex.icon}</span>${ex.name}`;
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
    const name     = customVal || (selectedExercise ? selectedExercise.name : '');
    const icon     = customVal ? '🏆' : (selectedExercise ? selectedExercise.icon : '🏃');
    const duration = parseInt(document.getElementById('duration-input').value);
    const date     = document.getElementById('modal-date-input').value || getTodayDateStr();
    if (!name) return;
    if (editingId) {
      const w = workouts.find(x => x.id === editingId);
      if (w) { w.date = date; w.name = name; w.icon = icon; w.duration = duration; w.cat = selectedCat; }
    } else {
      workouts.push({ id: Date.now().toString(), date, name, icon, duration, cat: selectedCat, done: false });
    }
    saveWorkouts(); closeModal(); renderSchedule();
    if (document.getElementById('page-calendar').classList.contains('active')) { if (calView === 'week') renderCalWeek(); else renderCalendar(); }
  });

  // ===== CALENDAR (Iteration3-enhanced) =====
  let calYear   = new Date().getFullYear();
  let calMonth  = new Date().getMonth();
  let calSelectedDate = null;
  let calView   = 'month'; // 'month' | 'week'
  let calActiveFilter = null; // null = all, or category key

  // Week start (Monday) for week view
  let calWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    d.setHours(0,0,0,0);
    return d;
  })();

  const CAL_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const CAL_DAY_NAMES   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const CAL_DAY_SHORT   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const CAL_CATS = [
    { key:'strength', label:'Strength', icon:'🏋️' },
    { key:'cardio',   label:'Cardio',   icon:'🏃' },
    { key:'hiit',     label:'HIIT',     icon:'🔥' },
    { key:'yoga',     label:'Yoga',     icon:'🧘' },
    { key:'other',    label:'Other',    icon:'⚡' },
  ];

  // Day popup stores (event delegation)
  const calDayStore  = new Map();
  const calWeekStore = new Map();

  function calDayKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function getWorkoutsForDate(ds) { return workouts.filter(w => w.date === ds); }
  function calFilterWks(list) { return calActiveFilter === null ? list : list.filter(w => w.cat === calActiveFilter); }

  function dateStr(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  // ── Navigation ──
  function calPrev() {
    if (calView === 'week') {
      calWeekStart = new Date(calWeekStart);
      calWeekStart.setDate(calWeekStart.getDate() - 7);
      renderCalWeek();
    } else {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
    }
  }
  function calNext() {
    if (calView === 'week') {
      calWeekStart = new Date(calWeekStart);
      calWeekStart.setDate(calWeekStart.getDate() + 7);
      renderCalWeek();
    } else {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    }
  }
  function calGoToday() {
    const t = new Date();
    calYear = t.getFullYear(); calMonth = t.getMonth();
    calWeekStart = new Date(t);
    calWeekStart.setDate(t.getDate() - (t.getDay() + 6) % 7);
    calWeekStart.setHours(0,0,0,0);
    calSelectedDate = getTodayDateStr();
    if (calView === 'week') { renderCalWeek(); }
    else { renderCalendar(); renderCalDetail(calSelectedDate, getWorkoutsForDate(calSelectedDate)); }
  }

  // ── View toggle ──
  document.getElementById('cal-view-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.cal-view-btn');
    if (!btn) return;
    const view = btn.dataset.view;
    if (view === calView) return;
    calView = view;
    document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('cal-month-view-wrap').style.display = view === 'month' ? '' : 'none';
    document.getElementById('cal-detail').style.display = view === 'month' ? '' : 'none';
    const weekWrap = document.getElementById('cal-week-wrap');
    weekWrap.classList.toggle('active', view === 'week');
    if (view === 'week') renderCalWeek();
    else renderCalendar();
  });

  // ── Filter dropdown ──
  function calGetPeriodCounts() {
    let start, end;
    if (calView === 'week') {
      start = new Date(calWeekStart);
      end = new Date(calWeekStart); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    } else {
      start = new Date(calYear, calMonth, 1);
      end = new Date(calYear, calMonth + 1, 0); end.setHours(23,59,59,999);
    }
    const counts = {}; CAL_CATS.forEach(c => counts[c.key] = 0); let total = 0;
    workouts.forEach(w => {
      const d = new Date(w.date.replace(/-/g,'/'));
      if (d >= start && d <= end) {
        if (counts.hasOwnProperty(w.cat)) { counts[w.cat]++; total++; }
      }
    });
    return { counts, total };
  }

  function calRenderFilterMenu() {
    const { counts, total } = calGetPeriodCounts();
    const label = document.getElementById('cal-filter-btn-label');
    const count = document.getElementById('cal-filter-btn-count');
    if (calActiveFilter === null) { label.textContent = 'All workouts'; count.textContent = total; }
    else {
      const c = CAL_CATS.find(x => x.key === calActiveFilter);
      label.textContent = `${c.icon} ${c.label}`; count.textContent = counts[c.key];
    }
    const menu = document.getElementById('cal-filter-menu');
    menu.innerHTML = '';
    const lbl = document.createElement('div'); lbl.className = 'cal-filter-menu-label';
    lbl.textContent = calView === 'week' ? 'Workouts this week' : 'Workouts this month'; menu.appendChild(lbl);
    const allItem = document.createElement('div');
    allItem.className = 'cal-filter-item' + (calActiveFilter === null ? ' selected' : '');
    allItem.innerHTML = `<span class="cal-filter-item-name">All workouts</span><span class="cal-filter-item-count">${total}</span>`;
    allItem.addEventListener('click', () => { calActiveFilter = null; calCloseFilter(); calView === 'week' ? renderCalWeek() : renderCalendar(); });
    menu.appendChild(allItem);
    const div = document.createElement('div'); div.className = 'cal-filter-divider'; menu.appendChild(div);
    CAL_CATS.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'cal-filter-item' + (calActiveFilter === cat.key ? ' selected' : '');
      item.innerHTML = `<span class="cal-filter-item-name">${cat.icon} ${cat.label}</span><span class="cal-filter-item-count">${counts[cat.key]}</span>`;
      item.addEventListener('click', () => { calActiveFilter = cat.key; calCloseFilter(); calView === 'week' ? renderCalWeek() : renderCalendar(); });
      menu.appendChild(item);
    });
  }

  function calToggleFilter() {
    const menu = document.getElementById('cal-filter-menu');
    const btn  = document.getElementById('cal-filter-btn');
    const open = menu.classList.contains('open');
    if (open) { calCloseFilter(); } else { calRenderFilterMenu(); menu.classList.add('open'); btn.classList.add('open'); }
  }
  function calCloseFilter() {
    document.getElementById('cal-filter-menu').classList.remove('open');
    document.getElementById('cal-filter-btn').classList.remove('open');
  }
  document.getElementById('cal-filter-btn').addEventListener('click', e => { e.stopPropagation(); calToggleFilter(); });
  document.getElementById('cal-filter-menu').addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', calCloseFilter);

  // ── Month view ──
  function renderCalendar() {
    document.getElementById('cal-month-label').textContent = CAL_MONTH_NAMES[calMonth] + ' ' + calYear;
    const today = new Date();
    const firstDay = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const startDow = (firstDay.getDay() + 6) % 7;
    const container = document.getElementById('cal-days');
    container.innerHTML = '';
    calDayStore.clear();

    // Empty cells
    for (let i = 0; i < startDow; i++) {
      const cell = document.createElement('div'); cell.className = 'cal-day empty'; container.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = dateStr(calYear, calMonth, d);
      const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
      const rawDws = getWorkoutsForDate(ds);
      const dws = calFilterWks(rawDws);
      const allDone = dws.length > 0 && dws.every(w => w.done);
      const noMatch = rawDws.length > 0 && dws.length === 0;

      const cell = document.createElement('div');
      cell.className = 'cal-day'
        + (isToday ? ' today' : '')
        + (calSelectedDate === ds ? ' selected' : '')
        + (allDone ? ' all-done' : '')
        + (noMatch ? ' no-match' : '');

      const numEl = document.createElement('div'); numEl.className = 'cal-day-num'; numEl.textContent = d; cell.appendChild(numEl);

      if (allDone) {
        const tick = document.createElement('div'); tick.className = 'cal-day-all-done'; tick.textContent = '✓'; tick.style.color = 'var(--green)'; cell.appendChild(tick);
      }

      if (dws.length > 0) {
        const pillsWrap = document.createElement('div'); pillsWrap.className = 'cal-day-pills';
        dws.slice(0, 2).forEach(w => {
          const pill = document.createElement('div');
          pill.className = 'cal-day-pill ' + (w.done ? 'done' : 'undone');
          pill.textContent = (w.icon ? w.icon + ' ' : '') + w.name;
          pillsWrap.appendChild(pill);
        });
        if (dws.length > 2) {
          const more = document.createElement('div'); more.className = 'cal-day-more'; more.textContent = `+${dws.length - 2} more`; pillsWrap.appendChild(more);
        }
        cell.appendChild(pillsWrap);
        cell.dataset.daykey = ds;
        calDayStore.set(ds, { ds, rawDws });
      }

      container.appendChild(cell);
    }

    // Re-render detail if selected
    if (calSelectedDate) renderCalDetail(calSelectedDate, getWorkoutsForDate(calSelectedDate));

    calRenderFilterMenu();
    calRenderSummary();
    calRenderReco();
  }

  // ── Week view ──
  function renderCalWeek() {
    const weekEnd = new Date(calWeekStart); weekEnd.setDate(weekEnd.getDate() + 6);
    const sameMonth = calWeekStart.getMonth() === weekEnd.getMonth();
    const lbl = sameMonth
      ? `${CAL_MONTH_NAMES[calWeekStart.getMonth()]} ${calWeekStart.getDate()}–${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
      : `${CAL_MONTH_NAMES[calWeekStart.getMonth()]} ${calWeekStart.getDate()} – ${CAL_MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
    document.getElementById('cal-month-label').textContent = lbl;

    const wrap = document.getElementById('cal-week-wrap');
    wrap.innerHTML = ''; calWeekStore.clear();
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(calWeekStart); date.setDate(date.getDate() + i);
      const ds = calDayKey(date);
      const isToday = date.toDateString() === today.toDateString();
      const rawDws = getWorkoutsForDate(ds);
      const dws = calFilterWks(rawDws);
      const allDone = dws.length > 0 && dws.every(w => w.done);

      const col = document.createElement('div');
      col.className = 'cal-week-col' + (isToday ? ' today' : '') + (allDone ? ' all-done' : '');

      const head = document.createElement('div'); head.className = 'cal-week-col-head';
      head.innerHTML = `<div class="cal-week-dow">${CAL_DAY_SHORT[i]}</div><div class="cal-week-daynum">${date.getDate()}</div>`;
      col.appendChild(head);

      const body = document.createElement('div'); body.className = 'cal-week-col-body';
      body.dataset.daykey = ds;
      calWeekStore.set(ds, { date, ds, dws: rawDws });

      if (dws.length) {
        dws.forEach(w => {
          const item = document.createElement('div');
          item.className = 'cal-week-workout ' + (w.done ? 'done' : 'undone');
          item.textContent = (w.icon ? w.icon + ' ' : '') + w.name;
          body.appendChild(item);
        });
      } else {
        const empty = document.createElement('div'); empty.className = 'cal-week-empty'; empty.textContent = 'Rest day'; body.appendChild(empty);
      }
      col.appendChild(body);
      wrap.appendChild(col);
    }

    calRenderFilterMenu();
    calRenderSummary();
    calRenderReco();
  }

  // Delegated click on month day cells
  document.getElementById('cal-days').addEventListener('click', e => {
    const cell = e.target.closest('[data-daykey]');
    if (!cell) return;
    const entry = calDayStore.get(cell.dataset.daykey);
    if (!entry) return;
    calSelectedDate = entry.ds;
    renderCalendar();
    renderCalDetail(entry.ds, entry.rawDws);
  });

  // Delegated click on week day columns → open mini modal
  document.getElementById('cal-week-wrap').addEventListener('click', e => {
    const col = e.target.closest('[data-daykey]');
    if (!col) return;
    const entry = calWeekStore.get(col.dataset.daykey);
    if (entry) openCalDayModal(entry.date, entry.ds, entry.dws);
  });

  // ── Calendar day detail panel ──
  function renderCalDetail(ds, dws) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date(ds.replace(/-/g, '/'));
    document.getElementById('cal-detail-title').textContent =
      DAYS[(d.getDay() + 6) % 7] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();

    const actionsEl = document.querySelector('.cal-detail-actions');
    actionsEl.innerHTML = '';
    const sumSpan = document.createElement('span');
    sumSpan.className = 'cal-detail-summary'; sumSpan.id = 'cal-detail-summary';
    if (dws.length > 0) sumSpan.textContent = `${dws.filter(w=>w.done).length} / ${dws.length} done`;
    actionsEl.appendChild(sumSpan);
    const addBtn = document.createElement('button'); addBtn.className = 'cal-add-btn'; addBtn.textContent = '+ Add Workout';
    addBtn.addEventListener('click', () => openAddModal(ds)); actionsEl.appendChild(addBtn);

    const body = document.getElementById('cal-detail-body');
    if (dws.length === 0) {
      body.outerHTML = '<div class="cal-detail-empty" id="cal-detail-body">No workouts on this day. Click "+ Add Workout" to schedule one.</div>';
      return;
    }
    const newBody = document.createElement('div'); newBody.id = 'cal-detail-body';
    dws.forEach(w => {
      const item = document.createElement('div'); item.className = 'cal-detail-item';
      item.innerHTML = `
        <div class="cal-detail-dot" style="background:${w.done ? 'var(--green)' : 'var(--border2)'}"></div>
        <div class="cal-detail-name${w.done ? ' done' : ''}">${w.icon ? w.icon + ' ' : ''}${w.name}</div>
        <div class="cal-detail-dur">${w.duration} min</div>
        <button class="cal-toggle-btn${w.done ? ' done' : ''}" title="${w.done ? 'Mark undone' : 'Mark done'}">${w.done ? '✓ Done' : 'Mark Done'}</button>
      `;
      item.querySelector('.cal-toggle-btn').addEventListener('click', () => {
        w.done = !w.done; saveWorkouts();
        renderCalendar(); renderCalDetail(ds, getWorkoutsForDate(ds)); renderHome();
      });
      newBody.appendChild(item);
    });
    document.getElementById('cal-detail-body').replaceWith(newBody);
  }

  // ── Week-view day modal ──
  function openCalDayModal(date, ds, dws) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dow = DAYS[(date.getDay() + 6) % 7];
    document.getElementById('cal-day-modal-title').textContent = `${dow}'s Workouts`;
    document.getElementById('cal-day-modal-sub').textContent = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    const body = document.getElementById('cal-day-modal-body');
    body.innerHTML = '';
    if (!dws.length) {
      body.innerHTML = '<div class="cal-day-modal-empty">No workouts scheduled for this day.</div>';
    } else {
      dws.forEach(w => {
        const item = document.createElement('div'); item.className = 'cal-day-modal-item';
        item.innerHTML = `
          <div class="cal-day-modal-icon">${w.icon || '🏃'}</div>
          <div class="cal-day-modal-info">
            <div class="cal-day-modal-name">${w.name}</div>
            <div class="cal-day-modal-dur">${w.duration} min</div>
          </div>
          <div class="cal-day-modal-status ${w.done ? 'done' : 'undone'}">${w.done ? 'Done' : 'Scheduled'}</div>
        `;
        body.appendChild(item);
      });
    }
    document.getElementById('cal-day-modal-backdrop').classList.add('open');
  }
  document.getElementById('cal-day-modal-close').addEventListener('click', () => document.getElementById('cal-day-modal-backdrop').classList.remove('open'));
  document.getElementById('cal-day-modal-backdrop').addEventListener('click', e => { if (e.target === document.getElementById('cal-day-modal-backdrop')) document.getElementById('cal-day-modal-backdrop').classList.remove('open'); });

  // ── Monthly Summary ──
  function calGetSummaryMonthYear() {
    if (calView === 'week') return { year: calWeekStart.getFullYear(), month: calWeekStart.getMonth() };
    return { year: calYear, month: calMonth };
  }
  function calRenderSummary() {
    const { year, month } = calGetSummaryMonthYear();
    document.getElementById('cal-summary-period').textContent = `${CAL_MONTH_NAMES[month]} ${year}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0, completed = 0;
    const weekBuckets = [];
    const catCounts = {}; CAL_CATS.forEach(c => catCounts[c.key] = 0);

    workouts.forEach(w => {
      const parts = w.date.split('-'); const y = +parts[0], m = +parts[1] - 1, d = +parts[2];
      if (y !== year || m !== month) return;
      const wi = Math.floor((d - 1) / 7);
      if (!weekBuckets[wi]) weekBuckets[wi] = { completed: 0, scheduled: 0 };
      total++;
      if (w.done) { completed++; weekBuckets[wi].completed++; } else { weekBuckets[wi].scheduled++; }
      if (catCounts.hasOwnProperty(w.cat)) catCounts[w.cat]++;
    });

    const rate = total ? Math.round(completed / total * 100) : 0;
    document.getElementById('cal-summary-stats').innerHTML = `
      <div class="cal-stat-tile"><div class="st-num">${total}</div><div class="st-lbl">Total</div></div>
      <div class="cal-stat-tile"><div class="st-num" style="color:var(--green)">${completed}</div><div class="st-lbl">Done</div></div>
      <div class="cal-stat-tile"><div class="st-num" style="color:var(--accent)">${rate}%</div><div class="st-lbl">Rate</div></div>
    `;

    // SVG chart
    const weekCount = Math.ceil(daysInMonth / 7);
    const svg = document.getElementById('cal-summary-chart');
    const W = 400, H = 120, padB = 20, padT = 8;
    if (!weekBuckets.some(Boolean)) {
      svg.innerHTML = `<text x="200" y="60" text-anchor="middle" font-size="11" fill="#555" font-family="DM Sans, sans-serif">No workouts logged this month yet.</text>`;
    } else {
      const maxVal = Math.max(1, ...Array.from({ length: weekCount }, (_, i) => (weekBuckets[i]?.completed || 0) + (weekBuckets[i]?.scheduled || 0)));
      const slot = W / weekCount, bw = Math.min(44, slot * 0.5), usH = H - padT - padB;
      let bars = '';
      for (let i = 0; i < weekCount; i++) {
        const b = weekBuckets[i] || { completed: 0, scheduled: 0 };
        const cx = slot * i + slot / 2, baseY = H - padB;
        const cH = (b.completed / maxVal) * usH, sH = (b.scheduled / maxVal) * usH;
        if (b.scheduled > 0) bars += `<rect x="${cx - bw/2}" y="${baseY - sH}" width="${bw}" height="${sH}" rx="3" fill="rgba(124,106,247,0.35)"></rect>`;
        if (b.completed > 0) bars += `<rect x="${cx - bw/2}" y="${baseY - sH - cH}" width="${bw}" height="${cH}" rx="3" fill="var(--green)"></rect>`;
        bars += `<text x="${cx}" y="${H - 4}" text-anchor="middle" font-size="10" fill="var(--text3)" font-family="DM Sans,sans-serif">W${i+1}</text>`;
      }
      svg.innerHTML = bars;
    }

    // Breakdown by type
    const max = Math.max(1, ...CAL_CATS.map(c => catCounts[c.key]));
    document.getElementById('cal-summary-breakdown').innerHTML = CAL_CATS.map(cat => {
      const pct = Math.round((catCounts[cat.key] / max) * 100);
      return `<div class="cal-breakdown-row">
        <div class="cal-breakdown-name">${cat.icon} ${cat.label}</div>
        <div class="cal-breakdown-track"><div class="cal-breakdown-fill" style="width:${pct}%"></div></div>
        <div class="cal-breakdown-count">${catCounts[cat.key]}</div>
      </div>`;
    }).join('');
  }

  // ── Recommended For You (BMI-based, no BMI inputs here — calculated on Report page) ──
  const CAL_BMI_RECO = {
    underweight: {
      label: 'Underweight', sub: 'BMI < 18.5',
      exercises: [
        { cat:'strength', name:'Squats',      frequency:'3× / week', duration:'25 min' },
        { cat:'strength', name:'Bench Press', frequency:'2× / week', duration:'20 min' },
        { cat:'strength', name:'Deadlift',    frequency:'2× / week', duration:'20 min' },
      ],
    },
    healthy: {
      label: 'Healthy weight', sub: 'BMI 18.5 – 24.9',
      exercises: [
        { cat:'cardio',   name:'Running',  frequency:'3× / week', duration:'30 min' },
        { cat:'strength', name:'Squats',   frequency:'2× / week', duration:'20 min' },
        { cat:'strength', name:'Pull-ups', frequency:'2× / week', duration:'15 min' },
      ],
    },
    overweight: {
      label: 'Overweight', sub: 'BMI 25 – 29.9',
      exercises: [
        { cat:'cardio', name:'Cycling',          frequency:'3× / week', duration:'30 min' },
        { cat:'cardio', name:'Running',           frequency:'4× / week', duration:'35 min' },
        { cat:'hiit',   name:'Mountain Climbers', frequency:'2× / week', duration:'15 min' },
      ],
    },
    obese: {
      label: 'Obese', sub: 'BMI ≥ 30',
      exercises: [
        { cat:'cardio', name:'Swimming',   frequency:'3× / week', duration:'15 min' },
        { cat:'cardio', name:'Elliptical', frequency:'3× / week', duration:'15 min' },
        { cat:'yoga',   name:'Stretching', frequency:'3× / week', duration:'10 min' },
      ],
    },
  };

  function calRenderReco() {
    const body = document.getElementById('cal-reco-body');
    const sub  = document.getElementById('cal-reco-sub');

    // Read latest BMI from history
    const bmiKey = currentUser ? 'ft_bmi_hist_' + currentUser.email : null;
    let bmi = null, bmiCat = null;
    if (bmiKey) {
      try {
        const hist = JSON.parse(localStorage.getItem(bmiKey) || '[]');
        if (hist.length) {
          const last = hist[hist.length - 1];
          bmi = parseFloat(last.bmi); bmiCat = last.category;
        }
      } catch(e) {}
    }

    if (bmi === null) {
      sub.textContent = 'Based on your BMI';
      body.innerHTML = '<div class="cal-reco-empty">Calculate your BMI on the Report page to get personalised workout recommendations.</div>';
      return;
    }

    let key;
    if      (bmi < 18.5) key = 'underweight';
    else if (bmi < 25)   key = 'healthy';
    else if (bmi < 30)   key = 'overweight';
    else                 key = 'obese';

    const reco = CAL_BMI_RECO[key];
    sub.textContent = `BMI ${bmi.toFixed(1)} · ${reco.label}`;

    const chips = reco.exercises.map(({ cat, name, frequency, duration }) => {
      const ex = (EXERCISES[cat] || []).find(e => e.name === name);
      if (!ex) return '';
      return `<button class="cal-reco-chip" onclick="quickAddExercise('${cat}','${name.replace(/'/g,"\\'")}',${parseInt(duration)})">
        <span class="cal-reco-chip-icon">${ex.icon}</span>
        <span class="cal-reco-chip-info">
          <span class="cal-reco-chip-name">${ex.name}</span>
          <span class="cal-reco-chip-cat">${CAT_LABELS[cat] || cat}</span>
        </span>
        <span class="cal-reco-chip-pills">
          <span class="cal-reco-chip-pill">${frequency}</span>
          <span class="cal-reco-chip-pill">${duration}</span>
        </span>
        <span class="cal-reco-chip-plus">+</span>
      </button>`;
    }).join('');

    body.innerHTML = `<div class="cal-reco-chips">${chips}</div>
      <div class="cal-reco-disclaimer">Tap an exercise to add it to your schedule. BMI is a general screening measure — consult a doctor for personalised advice.</div>`;
  }

  // ===== BMI CALCULATOR =====
  const BMI_RECO = {
    underweight: {
      icon: '🍽️', title: "You're in the underweight range",
      text: 'Your weight is below the typical healthy range for your height. Strength training helps build healthy muscle mass alongside weight gain.',
      exercises: [
        { cat:'strength', name:'Squats',      frequency:'3x / week', duration:'25 min' },
        { cat:'strength', name:'Bench Press', frequency:'2x / week', duration:'20 min' },
        { cat:'strength', name:'Deadlift',    frequency:'2x / week', duration:'20 min' },
      ],
    },
    healthy: {
      icon: '✅', title: "You're in a healthy weight range",
      text: 'Great work — your BMI falls within the healthy range. A balanced mix of cardio and strength helps you maintain it.',
      exercises: [
        { cat:'cardio',   name:'Running',    frequency:'3x / week', duration:'30 min' },
        { cat:'strength', name:'Squats',     frequency:'2x / week', duration:'20 min' },
        { cat:'strength', name:'Pull-ups',   frequency:'2x / week', duration:'15 min' },
      ],
    },
    overweight: {
      icon: '🚶', title: "You're in the overweight range",
      text: 'Your BMI is somewhat above the typical range. Regular cardio paired with some strength work is a solid, sustainable combo.',
      exercises: [
        { cat:'cardio', name:'Cycling',           frequency:'3x / week', duration:'30 min' },
        { cat:'cardio', name:'Running',            frequency:'4x / week', duration:'35 min' },
        { cat:'hiit',   name:'Mountain Climbers',  frequency:'2x / week', duration:'15 min' },
      ],
    },
    obese: {
      icon: '🩺', title: "You're in the obese range",
      text: 'Your BMI is notably above the typical range. Starting with low-impact activity is easier on the joints while building consistency.',
      exercises: [
        { cat:'cardio', name:'Swimming',   frequency:'3x / week', duration:'15 min' },
        { cat:'cardio', name:'Elliptical', frequency:'3x / week', duration:'15 min' },
        { cat:'yoga',   name:'Stretching', frequency:'3x / week', duration:'10 min' },
      ],
    },
  };

  function quickAddExercise(cat, name, duration) {
    const ex = (EXERCISES[cat] || []).find(e => e.name === name);
    if (!ex) return;
    openAddModal();
    selectedCat = cat;
    selectedExercise = ex;
    document.getElementById('custom-name').value = '';
    if (duration) document.getElementById('duration-input').value = duration;
    renderCatTabs();
    renderExercises();
    checkAdd();
  }

  function renderBMIReco(bmi, h) {
    const card = document.getElementById('bmi-reco-card');
    if (bmi == null) { card.style.display = 'none'; return; }

    let key;
    if      (bmi < 18.5) key = 'underweight';
    else if (bmi < 25)   key = 'healthy';
    else if (bmi < 30)   key = 'overweight';
    else                 key = 'obese';

    const reco = BMI_RECO[key];
    document.getElementById('bmi-reco-icon').textContent  = reco.icon;
    document.getElementById('bmi-reco-title').textContent = reco.title;
    document.getElementById('bmi-reco-text').textContent  = reco.text;

    // Healthy weight range for this height (BMI 18.5–24.9)
    const heightM = h / 100;
    const lo = (18.5 * heightM * heightM).toFixed(1);
    const hi = (24.9 * heightM * heightM).toFixed(1);
    document.getElementById('bmi-reco-range').textContent = `Healthy weight for your height: ${lo}–${hi} kg`;

    document.getElementById('bmi-reco-tips').innerHTML = reco.exercises.map(({ cat, name, frequency, duration }) => {
      const ex = (EXERCISES[cat] || []).find(e => e.name === name);
      if (!ex) return '';
      return `<button class="bmi-reco-ex-chip" onclick="quickAddExercise('${cat}','${name.replace(/'/g,"\\'")}',${parseInt(duration)})">
        <span class="bmi-reco-ex-icon">${ex.icon}</span>
        <span class="bmi-reco-ex-info">
          <span class="bmi-reco-ex-name">${ex.name}</span>
          <span class="bmi-reco-ex-cat">${CAT_LABELS[cat] || cat}</span>
        </span>
        <span class="bmi-reco-ex-pills">
          <span class="bmi-reco-ex-pill">${frequency}</span>
          <span class="bmi-reco-ex-pill">${duration}</span>
        </span>
        <span class="bmi-reco-ex-plus">+</span>
      </button>`;
    }).join('');

    card.style.display = 'block';
  }

  function calcBMI() {
    const h = parseFloat(document.getElementById('bmi-height').value);
    const w = parseFloat(document.getElementById('bmi-weight').value);
    const numEl  = document.getElementById('bmi-number');
    const catEl  = document.getElementById('bmi-category');
    const ring   = document.getElementById('bmi-ring-fill');
    const marker = document.getElementById('bmi-bar-marker');

    if (!h || !w || h < 100 || h > 250 || w < 20 || w > 300) {
      numEl.textContent = '—'; catEl.textContent = 'Enter details';
      if (ring)   ring.style.strokeDashoffset = 408;
      if (marker) marker.style.left = '0%';
      renderBMIReco(null);
      return;
    }

    const bmi = w / ((h / 100) ** 2);
    const bmiRounded = Math.round(bmi * 10) / 10;

    let cat, color;
    if      (bmi < 18.5) { cat = 'Underweight';   color = '#8b5cf6'; }
    else if (bmi < 25)   { cat = 'Healthy weight'; color = '#c084fc'; }
    else if (bmi < 30)   { cat = 'Overweight';     color = '#e879a0'; }
    else                 { cat = 'Obese';           color = '#ff6eb0'; }

    numEl.textContent = bmiRounded;
    catEl.textContent = cat;
    catEl.setAttribute('fill', color);

    // Ring: circumference = 2π×65 ≈ 408.4, map BMI 10-40 → 0-100%
    if (ring) {
      const pct = Math.min(1, Math.max(0, (Math.min(bmi, 40) - 10) / 30));
      ring.style.strokeDashoffset = String(408 - (408 * pct));
    }

    // Bar marker: map BMI 10-40 → 0-100%
    if (marker) {
      const barPct = Math.min(100, Math.max(0, (Math.min(bmi, 40) - 10) / 30 * 100));
      marker.style.left = barPct + '%';
    }

    renderBMIReco(bmi, h);

    // Add to BMI history & update goal (Iteration3 features)
    addBMIHistoryEntry(h, w, bmi, cat);
    updateBMIGoalUI(bmi, h, w);
  }

  // ===== BMI HISTORY (Iteration3) =====
  function getBMIHistKey() { return currentUser ? 'ft_bmi_hist_' + currentUser.email : null; }
  function loadBMIHist() {
    const k = getBMIHistKey(); if (!k) return [];
    try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch(e) { return []; }
  }
  function saveBMIHist(arr) {
    const k = getBMIHistKey(); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(arr)); } catch(e) {}
  }

  function addBMIHistoryEntry(h, w, bmi, catLabel) {
    const arr = loadBMIHist();
    arr.push({
      date: new Date().toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }),
      height: h, weight: w,
      bmi: bmi.toFixed(1),
      category: catLabel
    });
    saveBMIHist(arr);
    renderBMIHistory();
  }

  function renderBMIHistory() {
    const arr = loadBMIHist();
    const el = document.getElementById('bmi-history-log');
    if (!el) return;
    if (arr.length === 0) {
      el.innerHTML = '<div class="empty-state">No BMI entries yet. Enter your height and weight above to start tracking.</div>';
      return;
    }
    el.innerHTML = '';
    [...arr].reverse().forEach(entry => {
      const item = document.createElement('div');
      item.className = 'weight-item';
      const catColor = entry.category === 'Healthy weight' ? '#c084fc'
        : entry.category === 'Underweight' ? '#8b5cf6'
        : entry.category === 'Overweight'  ? '#e879a0'
        : '#ff6eb0';
      item.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:3px">
          <div class="wi-date">${entry.date}</div>
          <div class="wi-date2">${entry.height} cm · ${entry.weight} kg</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="wi-val" style="font-size:1.3rem;letter-spacing:-0.03em;color:${catColor}">${entry.bmi}</span>
          <span class="workout-cat-badge" style="text-transform:uppercase;letter-spacing:0.04em">${entry.category}</span>
        </div>`;
      el.appendChild(item);
    });
  }

  function clearBMIHistory() {
    saveBMIHist([]);
    renderBMIHistory();
    updateBMIGoalUI(null, null, null);
  }

  // ===== BMI GOAL (Iteration3) =====
  function getBMIGoalKey() { return currentUser ? 'ft_bmi_goal_' + currentUser.email : null; }
  function loadBMIGoal()   {
    const k = getBMIGoalKey(); if (!k) return null;
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch(e) { return null; }
  }
  function saveBMIGoal(g)  {
    const k = getBMIGoalKey(); if (!k) return;
    try { if (g) localStorage.setItem(k, JSON.stringify(g)); else localStorage.removeItem(k); } catch(e) {}
  }

  function setBMIGoal() {
    const tb = parseFloat(document.getElementById('bmi-goal-input').value);
    const errEl = document.getElementById('bmi-goal-error');
    errEl.classList.remove('show');
    if (!tb || tb <= 0) { errEl.textContent = 'Please enter a valid target BMI.'; errEl.classList.add('show'); return; }
    const arr = loadBMIHist();
    if (arr.length === 0) { errEl.textContent = 'Please calculate your BMI first.'; errEl.classList.add('show'); return; }
    const latest = arr[arr.length - 1];
    const goal = { targetBmi: tb, startBmi: parseFloat(latest.bmi) };
    saveBMIGoal(goal);
    updateBMIGoalUI(parseFloat(latest.bmi), latest.height, latest.weight);
  }

  function clearBMIGoal() {
    saveBMIGoal(null);
    document.getElementById('bmi-goal-input').value = '';
    updateBMIGoalUI(null, null, null);
  }

  function updateBMIGoalUI(currentBmi, h, w) {
    const goal = loadBMIGoal();
    const card = document.getElementById('bmi-goal-card');
    const placeholder = document.getElementById('bmi-goal-placeholder');
    if (!card) return;
    if (!goal) { card.style.display = 'none'; placeholder.style.display = 'block'; return; }
    if (currentBmi == null) {
      // try restoring from latest history entry
      const arr = loadBMIHist();
      if (arr.length === 0) { card.style.display = 'none'; placeholder.textContent = 'Calculate your BMI to start tracking progress toward your goal.'; placeholder.style.display = 'block'; return; }
      const latest = arr[arr.length - 1];
      currentBmi = parseFloat(latest.bmi);
      h = latest.height; w = latest.weight;
    }
    document.getElementById('bmi-goal-current').textContent = currentBmi.toFixed(1);
    document.getElementById('bmi-goal-target').textContent  = goal.targetBmi.toFixed(1);

    const totalDist = Math.abs(goal.startBmi - goal.targetBmi);
    let pct = totalDist === 0 ? 100 : (Math.abs(goal.startBmi - currentBmi) / totalDist) * 100;
    if ((goal.targetBmi < goal.startBmi && currentBmi > goal.startBmi) ||
        (goal.targetBmi > goal.startBmi && currentBmi < goal.startBmi)) pct = 0;
    pct = Math.max(0, Math.min(100, pct));

    document.getElementById('bmi-goal-fill').style.width = pct.toFixed(0) + '%';
    document.getElementById('bmi-goal-pct').textContent   = pct.toFixed(0) + '%';

    const bmiToGo = Math.abs(currentBmi - goal.targetBmi);
    const noteEl  = document.getElementById('bmi-goal-note');
    if (bmiToGo < 0.1) {
      noteEl.textContent = "🎉 You've reached your target BMI!";
    } else {
      const hm = h / 100;
      const wDiff = Math.abs(w - (goal.targetBmi * hm * hm));
      noteEl.textContent = bmiToGo.toFixed(1) + ' BMI to go (≈ ' + wDiff.toFixed(1) + ' kg)';
    }
    card.style.display = 'block';
    placeholder.style.display = 'none';
  }

  // ===== ACHIEVEMENTS — Bronze / Silver / Gold level system =====

  const ACH_LEVELS = {
    bronze: { label:'Bronze', icon:'🥉', color:'var(--bronze)' },
    silver: { label:'Silver', icon:'🥈', color:'var(--silver)' },
    gold:   { label:'Gold',   icon:'🥇', color:'var(--gold)' },
  };

  const ACH_CATEGORIES = {
    milestones:  { label:'Total Workouts',    icon:'🎯', desc:'Based on total workouts completed' },
    consistency: { label:'Days Active',       icon:'📅', desc:'Based on how many days you showed up' },
    endurance:   { label:'Time & Endurance',  icon:'⏱️', desc:'Based on total minutes logged' },
    strength:    { label:'Strength Training', icon:'🏋️', desc:'Based on strength workouts done' },
    cardio:      { label:'Cardio',            icon:'🏃', desc:'Based on cardio workouts done' },
    variety:     { label:'Variety',           icon:'🌟', desc:'Mixing different workout types' },
    bmi:         { label:'BMI & Health',      icon:'⚖️', desc:'Based on BMI from your Health page · syncs automatically' },
  };

  const BADGE_GROUPS = [
    // ── MILESTONES · shield ──
    { id:'warrior',   cat:'milestones', shape:'shield', icon:'⚔️', name:'Warrior',
      levels:{
        bronze:{ desc:'Complete 5 workouts.',   quote:"Five down. The habit has already started forming.",              condition:s=>s.totalDone>=5,  progress:s=>({current:s.totalDone,target:5,  unit:'workouts'}) },
        silver:{ desc:'Complete 20 workouts.',  quote:"20 workouts. That's not luck — that's discipline.",             condition:s=>s.totalDone>=20, progress:s=>({current:s.totalDone,target:20, unit:'workouts'}) },
        gold:  { desc:'Complete 50 workouts.',  quote:"50 workouts. Most people never get here. You did.",             condition:s=>s.totalDone>=50, progress:s=>({current:s.totalDone,target:50, unit:'workouts'}) },
    }},
    { id:'centurion', cat:'milestones', shape:'shield', icon:'🛡️', name:'Centurion',
      levels:{
        bronze:{ desc:'Complete 10 workouts.',  quote:"Ten sessions in. You are building something real.",             condition:s=>s.totalDone>=10,  progress:s=>({current:s.totalDone,target:10,  unit:'workouts'}) },
        silver:{ desc:'Complete 30 workouts.',  quote:"Thirty sessions. That's a month of consistency.",              condition:s=>s.totalDone>=30,  progress:s=>({current:s.totalDone,target:30,  unit:'workouts'}) },
        gold:  { desc:'Complete 100 workouts.', quote:"100 workouts. You are in a category most people only dream of.",condition:s=>s.totalDone>=100, progress:s=>({current:s.totalDone,target:100, unit:'workouts'}) },
    }},
    { id:'legend',    cat:'milestones', shape:'shield', icon:'🏆', name:'Legend',
      levels:{
        bronze:{ desc:'Complete workouts across 3 weeks.',  quote:"Three weeks of effort. Your body is adapting.",     condition:s=>s.weekSpan>=3,  progress:s=>({current:s.weekSpan,target:3,  unit:'weeks'}) },
        silver:{ desc:'Complete workouts across 8 weeks.',  quote:"Two months of showing up. That's legendary.",       condition:s=>s.weekSpan>=8,  progress:s=>({current:s.weekSpan,target:8,  unit:'weeks'}) },
        gold:  { desc:'Complete workouts across 12 weeks.', quote:"Twelve weeks. A full quarter of the year. Remarkable.", condition:s=>s.weekSpan>=12, progress:s=>({current:s.weekSpan,target:12, unit:'weeks'}) },
    }},

    // ── CONSISTENCY · pentagon ──
    { id:'showup',    cat:'consistency', shape:'pentagon', icon:'📅', name:'Show Up',
      levels:{
        bronze:{ desc:'Be active on 5 different days.',  quote:"Showing up is 80% of success. You've already won.",     condition:s=>s.activeDays>=5,  progress:s=>({current:s.activeDays,target:5,  unit:'days'}) },
        silver:{ desc:'Be active on 10 different days.', quote:"Ten days of movement. Consistency is your superpower.", condition:s=>s.activeDays>=10, progress:s=>({current:s.activeDays,target:10, unit:'days'}) },
        gold:  { desc:'Be active on 20 different days.', quote:"Twenty active days. You are the definition of committed.", condition:s=>s.activeDays>=20, progress:s=>({current:s.activeDays,target:20, unit:'days'}) },
    }},
    { id:'grind',     cat:'consistency', shape:'pentagon', icon:'⚡', name:'Daily Grind',
      levels:{
        bronze:{ desc:'Work out on 7 different days.',  quote:"Seven days in. Your routine is taking shape.",            condition:s=>s.activeDays>=7,  progress:s=>({current:s.activeDays,target:7,  unit:'days'}) },
        silver:{ desc:'Work out on 14 different days.', quote:"Fourteen days of grinding. You've built something real.", condition:s=>s.activeDays>=14, progress:s=>({current:s.activeDays,target:14, unit:'days'}) },
        gold:  { desc:'Work out on 30 different days.', quote:"Thirty days. That's a full month of pure dedication.",    condition:s=>s.activeDays>=30, progress:s=>({current:s.activeDays,target:30, unit:'days'}) },
    }},
    { id:'perfect',   cat:'consistency', shape:'pentagon', icon:'🗓️', name:'Perfect Week',
      levels:{
        bronze:{ desc:'Complete workouts on 5 days in one week.', quote:"Five days in a single week. Near perfect.",          condition:s=>s.bestWeek>=5, progress:s=>({current:s.bestWeek,target:5,unit:'days/week'}) },
        silver:{ desc:'Complete workouts on 6 days in one week.', quote:"Six days straight. You're pushing limits.",          condition:s=>s.bestWeek>=6, progress:s=>({current:s.bestWeek,target:6,unit:'days/week'}) },
        gold:  { desc:'Complete workouts every day of a week.',   quote:"All 7 days. A flawless week. Absolutely legendary.", condition:s=>s.bestWeek>=7, progress:s=>({current:s.bestWeek,target:7,unit:'days/week'}) },
    }},

    // ── ENDURANCE · hexagon ──
    { id:'timelord',  cat:'endurance', shape:'hexagon', icon:'⏱️', name:'Time Lord',
      levels:{
        bronze:{ desc:'Log 120 minutes total.',  quote:"Two hours invested in yourself. Time well spent.",             condition:s=>s.totalMins>=120, progress:s=>({current:s.totalMins,target:120, unit:'mins'}) },
        silver:{ desc:'Log 300 minutes total.',  quote:"300 minutes. That's five hours of choosing yourself.",         condition:s=>s.totalMins>=300, progress:s=>({current:s.totalMins,target:300, unit:'mins'}) },
        gold:  { desc:'Log 600 minutes total.',  quote:"600 minutes. Iron discipline forges an iron body.",            condition:s=>s.totalMins>=600, progress:s=>({current:s.totalMins,target:600, unit:'mins'}) },
    }},
    { id:'marathon',  cat:'endurance', shape:'hexagon', icon:'🏅', name:'Marathon',
      levels:{
        bronze:{ desc:'Log 200 minutes total.',  quote:"200 minutes of pure dedication. You're built different.",      condition:s=>s.totalMins>=200,  progress:s=>({current:s.totalMins,target:200,  unit:'mins'}) },
        silver:{ desc:'Log 500 minutes total.',  quote:"500 minutes in. You run on willpower.",                        condition:s=>s.totalMins>=500,  progress:s=>({current:s.totalMins,target:500,  unit:'mins'}) },
        gold:  { desc:'Log 1000 minutes total.', quote:"1000 minutes. That's over 16 hours of sweat and grit.",        condition:s=>s.totalMins>=1000, progress:s=>({current:s.totalMins,target:1000, unit:'mins'}) },
    }},
    { id:'longhaul',  cat:'endurance', shape:'hexagon', icon:'🔋', name:'Long Haul',
      levels:{
        bronze:{ desc:'Complete a single workout of 45+ mins.',  quote:"Staying power. You didn't stop when it got hard.",  condition:s=>s.longestSession>=45,  progress:s=>({current:s.longestSession,target:45,  unit:'mins'}) },
        silver:{ desc:'Complete a single workout of 60+ mins.',  quote:"An hour straight. That's a real training session.", condition:s=>s.longestSession>=60,  progress:s=>({current:s.longestSession,target:60,  unit:'mins'}) },
        gold:  { desc:'Complete a single workout of 90+ mins.',  quote:"Ninety minutes. You are operating on another level.",condition:s=>s.longestSession>=90,  progress:s=>({current:s.longestSession,target:90,  unit:'mins'}) },
    }},

    // ── STRENGTH · diamond ──
    { id:'lifter',    cat:'strength', shape:'diamond', icon:'🏋️', name:'Lifter',
      levels:{
        bronze:{ desc:'Complete 5 strength workouts.',  quote:"Five lifts in. The foundation is set.",                  condition:s=>s.byCat.strength>=5,  progress:s=>({current:s.byCat.strength,target:5,  unit:'sessions'}) },
        silver:{ desc:'Complete 15 strength workouts.', quote:"Strength isn't given. It's earned rep by rep.",          condition:s=>s.byCat.strength>=15, progress:s=>({current:s.byCat.strength,target:15, unit:'sessions'}) },
        gold:  { desc:'Complete 30 strength workouts.', quote:"30 strength sessions. Legends are made of exactly this.",condition:s=>s.byCat.strength>=30, progress:s=>({current:s.byCat.strength,target:30, unit:'sessions'}) },
    }},
    { id:'titan',     cat:'strength', shape:'diamond', icon:'👑', name:'Titan',
      levels:{
        bronze:{ desc:'Complete 8 strength workouts.',  quote:"Eight sessions of iron. Your body is becoming the machine.", condition:s=>s.byCat.strength>=8,  progress:s=>({current:s.byCat.strength,target:8,  unit:'sessions'}) },
        silver:{ desc:'Complete 20 strength workouts.', quote:"Twenty lifts deep. You are immovable.",                     condition:s=>s.byCat.strength>=20, progress:s=>({current:s.byCat.strength,target:20, unit:'sessions'}) },
        gold:  { desc:'Complete 40 strength workouts.', quote:"40 strength sessions. You are built differently — literally.", condition:s=>s.byCat.strength>=40, progress:s=>({current:s.byCat.strength,target:40, unit:'sessions'}) },
    }},
    { id:'powerblock',cat:'strength', shape:'diamond', icon:'⚙️', name:'Power Block',
      levels:{
        bronze:{ desc:'Log 60+ mins of strength training total.',   quote:"An hour under the bar. Foundations take time.",           condition:s=>s.minsByCat.strength>=60,  progress:s=>({current:s.minsByCat.strength,target:60,  unit:'mins'}) },
        silver:{ desc:'Log 180+ mins of strength training total.',  quote:"Three hours of iron. Your muscles remember every minute.",condition:s=>s.minsByCat.strength>=180, progress:s=>({current:s.minsByCat.strength,target:180, unit:'mins'}) },
        gold:  { desc:'Log 400+ mins of strength training total.',  quote:"400 minutes of strength training. You are forged.",       condition:s=>s.minsByCat.strength>=400, progress:s=>({current:s.minsByCat.strength,target:400, unit:'mins'}) },
    }},

    // ── CARDIO · circle ──
    { id:'runner',    cat:'cardio', shape:'circle', icon:'🏃', name:'Runner',
      levels:{
        bronze:{ desc:'Complete 5 cardio workouts.',  quote:"Your lungs are getting stronger with every session.",      condition:s=>s.byCat.cardio>=5,  progress:s=>({current:s.byCat.cardio,target:5,  unit:'sessions'}) },
        silver:{ desc:'Complete 15 cardio workouts.', quote:"Fifteen cardio sessions. You set the pace — nobody else.",condition:s=>s.byCat.cardio>=15, progress:s=>({current:s.byCat.cardio,target:15, unit:'sessions'}) },
        gold:  { desc:'Complete 30 cardio workouts.', quote:"30 cardio sessions. Your endurance is now undeniable.",    condition:s=>s.byCat.cardio>=30, progress:s=>({current:s.byCat.cardio,target:30, unit:'sessions'}) },
    }},
    { id:'pacer',     cat:'cardio', shape:'circle', icon:'🚴', name:'Pacer',
      levels:{
        bronze:{ desc:'Log 60+ mins of cardio total.',  quote:"An hour of cardio banked. Your heart is thanking you.",  condition:s=>s.minsByCat.cardio>=60,  progress:s=>({current:s.minsByCat.cardio,target:60,  unit:'mins'}) },
        silver:{ desc:'Log 200+ mins of cardio total.', quote:"200 minutes of cardio. You move like water — relentless.",condition:s=>s.minsByCat.cardio>=200, progress:s=>({current:s.minsByCat.cardio,target:200, unit:'mins'}) },
        gold:  { desc:'Log 500+ mins of cardio total.', quote:"500 cardio minutes. That's elite endurance territory.",  condition:s=>s.minsByCat.cardio>=500, progress:s=>({current:s.minsByCat.cardio,target:500, unit:'mins'}) },
    }},
    { id:'zonesix',   cat:'cardio', shape:'circle', icon:'🌊', name:'Zone Six',
      levels:{
        bronze:{ desc:'Complete 8 cardio workouts.',  quote:"Eight sessions deep. Your cardiovascular base is building.", condition:s=>s.byCat.cardio>=8,  progress:s=>({current:s.byCat.cardio,target:8,  unit:'sessions'}) },
        silver:{ desc:'Complete 20 cardio workouts.', quote:"Twenty sessions. You've crossed into consistent athlete territory.", condition:s=>s.byCat.cardio>=20, progress:s=>({current:s.byCat.cardio,target:20, unit:'sessions'}) },
        gold:  { desc:'Complete 50 cardio workouts.', quote:"50 cardio sessions. You run on pure determination.",               condition:s=>s.byCat.cardio>=50, progress:s=>({current:s.byCat.cardio,target:50, unit:'sessions'}) },
    }},

    // ── VARIETY · star ──
    { id:'allrounder',cat:'variety', shape:'star', icon:'🌟', name:'All-Rounder',
      levels:{
        bronze:{ desc:'Complete 3 workouts in 3 different categories.',  quote:"Variety is the spice of fitness. Keep exploring.",          condition:s=>Object.entries(s.byCat).filter(([,v])=>v>=3).length>=3, progress:s=>({current:Object.entries(s.byCat).filter(([,v])=>v>=3).length,target:3,unit:'categories'}) },
        silver:{ desc:'Complete 5 workouts in 4 different categories.',  quote:"Four categories with real volume. Impressively versatile.", condition:s=>Object.entries(s.byCat).filter(([,v])=>v>=5).length>=4, progress:s=>({current:Object.entries(s.byCat).filter(([,v])=>v>=5).length,target:4,unit:'categories'}) },
        gold:  { desc:'Complete 5 workouts in all 5 categories.',        quote:"All five categories at real volume. You are the complete athlete.", condition:s=>Object.values(s.byCat).every(v=>v>=5), progress:s=>({current:Object.values(s.byCat).filter(v=>v>=5).length,target:5,unit:'categories'}) },
    }},
    { id:'fire',      cat:'variety', shape:'star', icon:'🔥', name:'On Fire',
      levels:{
        bronze:{ desc:'Complete 5 HIIT workouts.',  quote:"Five HIIT sessions. You didn't just sweat — you burned.",    condition:s=>s.byCat.hiit>=5,  progress:s=>({current:s.byCat.hiit,target:5, unit:'sessions'}) },
        silver:{ desc:'Complete 12 HIIT workouts.', quote:"Twelve HIIT sessions. You don't just train — you explode.", condition:s=>s.byCat.hiit>=12, progress:s=>({current:s.byCat.hiit,target:12,unit:'sessions'}) },
        gold:  { desc:'Complete 25 HIIT workouts.', quote:"25 HIIT sessions. You've mastered intensity. Pure fire.",    condition:s=>s.byCat.hiit>=25, progress:s=>({current:s.byCat.hiit,target:25,unit:'sessions'}) },
    }},
    { id:'zenmaster', cat:'variety', shape:'star', icon:'🧘', name:'Zen Master',
      levels:{
        bronze:{ desc:'Complete 5 yoga or stretch sessions.',  quote:"Flexibility is strength in disguise. Well done.",            condition:s=>s.byCat.yoga>=5,  progress:s=>({current:s.byCat.yoga,target:5, unit:'sessions'}) },
        silver:{ desc:'Complete 12 yoga or stretch sessions.', quote:"Twelve sessions of mindful movement. Your body is grateful.", condition:s=>s.byCat.yoga>=12, progress:s=>({current:s.byCat.yoga,target:12,unit:'sessions'}) },
        gold:  { desc:'Complete 25 yoga or stretch sessions.', quote:"25 sessions. Stillness and strength, perfectly balanced.",    condition:s=>s.byCat.yoga>=25, progress:s=>({current:s.byCat.yoga,target:25,unit:'sessions'}) },
    }},
    { id:'sportlover',cat:'variety', shape:'star', icon:'⚽', name:'Sport Lover',
      levels:{
        bronze:{ desc:'Complete 5 sports or other workouts.',  quote:"Sport is joy in motion. You found yours.",                  condition:s=>s.byCat.other>=5,  progress:s=>({current:s.byCat.other,target:5, unit:'sessions'}) },
        silver:{ desc:'Complete 12 sports or other workouts.', quote:"Twelve sport sessions. You play hard and train harder.",     condition:s=>s.byCat.other>=12, progress:s=>({current:s.byCat.other,target:12,unit:'sessions'}) },
        gold:  { desc:'Complete 25 sports or other workouts.', quote:"25 sessions of sport. You were made to compete.",           condition:s=>s.byCat.other>=25, progress:s=>({current:s.byCat.other,target:25,unit:'sessions'}) },
    }},

    // ── BMI · octagon ──
    { id:'bmi_aware',    cat:'bmi', shape:'octagon', icon:'⚖️', name:'Body Aware',
      levels:{
        bronze:{ desc:'Have your BMI recorded.',             quote:"Knowing where you stand is the first step to moving forward.",      condition:s=>s.bmi!==null,                            progress:s=>({current:s.bmi!==null?1:0,target:1,unit:'check-in'}) },
        silver:{ desc:'Reach a normal BMI (18.5–24.9).',    quote:"A healthy BMI means your body is in good balance. Well done.",     condition:s=>s.bmi!==null&&s.bmi>=18.5&&s.bmi<25,    progress:s=>({current:s.bmi!==null?1:0,target:1,unit:'normal BMI'}) },
        gold:  { desc:'Reach an optimal BMI (18.5–22.9).',  quote:"You are operating in the optimal zone. Your body thanks you.",     condition:s=>s.bmi!==null&&s.bmi>=18.5&&s.bmi<23,    progress:s=>({current:s.bmi!==null?1:0,target:1,unit:'optimal BMI'}) },
    }},
    { id:'bmi_maintain', cat:'bmi', shape:'octagon', icon:'📊', name:'Steady State',
      levels:{
        bronze:{ desc:'Maintain normal BMI for 2 check-ins.',  quote:"Two healthy check-ins. Consistency is everything.",              condition:s=>s.bmiMonths>=2, progress:s=>({current:s.bmiMonths,target:2,unit:'check-ins'}) },
        silver:{ desc:'Maintain normal BMI for 4 check-ins.',  quote:"Four check-ins in the healthy zone. Your lifestyle is shifting.",condition:s=>s.bmiMonths>=4, progress:s=>({current:s.bmiMonths,target:4,unit:'check-ins'}) },
        gold:  { desc:'Maintain normal BMI for 8 check-ins.',  quote:"Eight check-ins. Half a year of discipline. Remarkable.",       condition:s=>s.bmiMonths>=8, progress:s=>({current:s.bmiMonths,target:8,unit:'check-ins'}) },
    }},
    { id:'bmi_streak',   cat:'bmi', shape:'octagon', icon:'🔥', name:'BMI Streak',
      levels:{
        bronze:{ desc:'Stay in normal BMI range 2 times in a row.', quote:"Your first streak. Keep the momentum going.",             condition:s=>s.bmiStreak>=2, progress:s=>({current:s.bmiStreak,target:2,unit:'in a row'}) },
        silver:{ desc:'Stay in normal BMI range 4 times in a row.', quote:"Four consecutive check-ins. Your body is locked in.",     condition:s=>s.bmiStreak>=4, progress:s=>({current:s.bmiStreak,target:4,unit:'in a row'}) },
        gold:  { desc:'Stay in normal BMI range 8 times in a row.', quote:"Eight straight check-ins. That's not willpower — that's a lifestyle.", condition:s=>s.bmiStreak>=8, progress:s=>({current:s.bmiStreak,target:8,unit:'in a row'}) },
    }},
    { id:'bmi_active',   cat:'bmi', shape:'octagon', icon:'💪', name:'Fit & Active',
      levels:{
        bronze:{ desc:'Normal BMI + 10 workouts done.',  quote:"A healthy body in motion. You've got both sides covered.",              condition:s=>s.bmi!==null&&s.bmi>=18.5&&s.bmi<25&&s.totalDone>=10, progress:s=>({current:Math.min(s.totalDone,10),target:10,unit:'workouts'}) },
        silver:{ desc:'Normal BMI + 25 workouts done.',  quote:"Fitness and health working together. That's the winning combination.",  condition:s=>s.bmi!==null&&s.bmi>=18.5&&s.bmi<25&&s.totalDone>=25, progress:s=>({current:Math.min(s.totalDone,25),target:25,unit:'workouts'}) },
        gold:  { desc:'Normal BMI + 50 workouts done.',  quote:"50 workouts at a healthy BMI. You are the definition of fit.",          condition:s=>s.bmi!==null&&s.bmi>=18.5&&s.bmi<25&&s.totalDone>=50, progress:s=>({current:Math.min(s.totalDone,50),target:50,unit:'workouts'}) },
    }},
  ];

  // ── SVG shape builders (level-aware, adapted to dark theme palette) ──
  const ACH_LEVEL_FILLS = {
    bronze: { f:'#CD7F32', hi:'rgba(255,235,180,0.35)', bd:'#A0622A' },
    silver: { f:'#909090', hi:'rgba(255,255,255,0.22)', bd:'#666' },
    gold:   { f:'#C8960C', hi:'rgba(255,240,150,0.35)', bd:'#9A7008' },
    locked: { f:'var(--surface2)', hi:'rgba(255,255,255,0.06)', bd:'var(--border2)' },
  };
  function achHexPts(cx,cy,r){return Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i-90);return`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`}).join(' ');}
  function achPolyPts(cx,cy,r,n,s){return Array.from({length:n},(_,i)=>{const a=Math.PI/180*(360/n*i+s);return`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`}).join(' ');}
  function achStarPts(cx,cy,r1,r2,p){return Array.from({length:p*2},(_,i)=>{const r=i%2===0?r1:r2;const a=Math.PI/180*(360/(p*2)*i-90);return`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`}).join(' ');}

  function achShieldSVG({f,hi,bd},w=80){const h=Math.round(w*86/80);return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><path d="M40 4 L74 18 L74 48 Q74 72 40 83 Q6 72 6 48 L6 18 Z" fill="${f}" stroke="${bd}" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 11 L67 23 L67 47 Q67 67 40 76 Q13 67 13 47 L13 23 Z" fill="none" stroke="${hi}" stroke-width="1.5" stroke-linejoin="round"/><line x1="24" y1="44" x2="56" y2="44" stroke="${hi}" stroke-width="1" stroke-linecap="round"/></svg>`}
  function achHexagonSVG({f,hi,bd},w=80){const h=Math.round(w*86/80),cx=40,cy=43,r=34,ri=26;return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><polygon points="${achHexPts(cx,cy,r)}" fill="${f}" stroke="${bd}" stroke-width="2.5" stroke-linejoin="round"/><polygon points="${achHexPts(cx,cy,ri)}" fill="none" stroke="${hi}" stroke-width="1.5" stroke-linejoin="round"/></svg>`}
  function achPentagonSVG({f,hi,bd},w=80){const h=Math.round(w*86/80),cx=40,cy=45,r=34,ri=25;return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><polygon points="${achPolyPts(cx,cy,r,5,-90)}" fill="${f}" stroke="${bd}" stroke-width="2.5" stroke-linejoin="round"/><polygon points="${achPolyPts(cx,cy,ri,5,-90)}" fill="none" stroke="${hi}" stroke-width="1.5" stroke-linejoin="round"/></svg>`}
  function achDiamondSVG({f,hi,bd},w=80){const h=Math.round(w*86/80);return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><path d="M40 5 L75 43 L40 81 L5 43 Z" fill="${f}" stroke="${bd}" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 15 L65 43 L40 71 L15 43 Z" fill="none" stroke="${hi}" stroke-width="1.5" stroke-linejoin="round"/><line x1="25" y1="43" x2="55" y2="43" stroke="${hi}" stroke-width="1" stroke-linecap="round"/><line x1="40" y1="28" x2="40" y2="58" stroke="${hi}" stroke-width="1" stroke-linecap="round"/></svg>`}
  function achCircleSVG({f,hi,bd},w=80){const h=Math.round(w*86/80);return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><circle cx="40" cy="43" r="34" fill="${f}" stroke="${bd}" stroke-width="2.5"/><circle cx="40" cy="43" r="26" fill="none" stroke="${hi}" stroke-width="1.5"/><circle cx="40" cy="43" r="4" fill="${hi}"/></svg>`}
  function achStarSVG({f,hi,bd},w=80){const h=Math.round(w*86/80);return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><polygon points="${achStarPts(40,43,34,14,8)}" fill="${f}" stroke="${bd}" stroke-width="2" stroke-linejoin="round"/><polygon points="${achStarPts(40,43,26,10,8)}" fill="none" stroke="${hi}" stroke-width="1.5" stroke-linejoin="round"/></svg>`}
  function achOctagonSVG({f,hi,bd},w=80){const h=Math.round(w*86/80),cx=40,cy=43,outer=34,inner=26;return`<svg class="badge-shape" viewBox="0 0 80 86" width="${w}" height="${h}"><polygon points="${achPolyPts(cx,cy,outer,8,-22.5)}" fill="${f}" stroke="${bd}" stroke-width="2.5" stroke-linejoin="round"/><polygon points="${achPolyPts(cx,cy,inner,8,-22.5)}" fill="none" stroke="${hi}" stroke-width="1.5" stroke-linejoin="round"/></svg>`}
  const ACH_SHAPE_FNS = { shield:achShieldSVG, hexagon:achHexagonSVG, pentagon:achPentagonSVG, diamond:achDiamondSVG, circle:achCircleSVG, star:achStarSVG, octagon:achOctagonSVG };
  function buildAchBadgeSVG(shape, levelKey, w=80){ return (ACH_SHAPE_FNS[shape]||achShieldSVG)(ACH_LEVEL_FILLS[levelKey]||ACH_LEVEL_FILLS.locked, w); }

  function buildAchProgressRing(pct, w=80){
    const h=Math.round(w*86/80),cx=w/2,cy=h/2,r=(w/2)-4,c=2*Math.PI*r,offset=c-(pct/100)*c;
    return `<svg class="badge-ring-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="transform:rotate(-90deg)">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="3.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
    </svg>`;
  }

  // ── Level helpers ──
  function getAchCurrentLevel(group, stats) {
    if (group.levels.gold.condition(stats))   return 'gold';
    if (group.levels.silver.condition(stats)) return 'silver';
    if (group.levels.bronze.condition(stats)) return 'bronze';
    return null;
  }
  function getAchNextLevel(lvl) {
    if (!lvl)           return 'bronze';
    if (lvl==='bronze') return 'silver';
    if (lvl==='silver') return 'gold';
    return null;
  }

  // ── BMI data from localStorage ──
  function readAchBMIData() {
    try {
      const key = currentUser ? 'ft_bmi_hist_' + currentUser.email : null;
      if (!key) return { bmi: null, bmiMonths: 0, bmiStreak: 0 };
      const raw = localStorage.getItem(key);
      if (!raw) return { bmi: null, bmiMonths: 0, bmiStreak: 0 };
      const history = JSON.parse(raw);
      if (!history.length) return { bmi: null, bmiMonths: 0, bmiStreak: 0 };
      const bmi = parseFloat(history[history.length - 1].bmi);
      const bmiMonths = history.filter(e => e.category === 'Normal' || e.category === 'Healthy weight').length;
      let bmiStreak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].category === 'Normal' || history[i].category === 'Healthy weight') bmiStreak++;
        else break;
      }
      return { bmi, bmiMonths, bmiStreak };
    } catch(e) { return { bmi: null, bmiMonths: 0, bmiStreak: 0 }; }
  }

  function getAchStats() {
    const done = workouts.filter(w => w.done);
    const daysSet = new Set(done.map(w => w.date));
    const byCat = { strength:0, cardio:0, hiit:0, yoga:0, other:0 };
    const minsByCat = { strength:0, cardio:0, hiit:0, yoga:0, other:0 };
    let longestSession = 0;
    const weekSet = new Set();
    const weekDayMap = {};
    done.forEach((w,i) => {
      const cat = w.cat || 'other';
      byCat[cat] = (byCat[cat]||0) + 1;
      minsByCat[cat] = (minsByCat[cat]||0) + (w.duration||0);
      if ((w.duration||0) > longestSession) longestSession = w.duration||0;
      const dateKey = w.date || String(i);
      const d = new Date(dateKey.replace(/-/g,'/'));
      const weekNum = Math.floor((d - new Date(2024,0,1)) / (7*24*3600*1000));
      weekSet.add(weekNum);
      if (!weekDayMap[weekNum]) weekDayMap[weekNum] = new Set();
      weekDayMap[weekNum].add(dateKey);
    });
    const { bmi, bmiMonths, bmiStreak } = readAchBMIData();
    return {
      totalDone: done.length,
      totalMins: done.reduce((s,w) => s+w.duration, 0),
      activeDays: daysSet.size,
      byCat, minsByCat, longestSession,
      weekSpan: weekSet.size,
      bestWeek: Math.max(0, ...Object.values(weekDayMap).map(s=>s.size)),
      bmi, bmiMonths, bmiStreak,
    };
  }

  let achActiveFilter = 'all';
  function getAchPrevLevels() {
    return JSON.parse(localStorage.getItem('ft_ach_v3_levels_' + (currentUser?.email || '')) || '{}');
  }
  function getAchUnlockedDates() {
    return JSON.parse(localStorage.getItem('ft_ach_dates_' + (currentUser?.email || '')) || '{}');
  }

  function buildAchCard(group, stats, newlyUpgraded) {
    const lvl    = getAchCurrentLevel(group, stats);
    const nextLv = getAchNextLevel(lvl);
    const isNew  = newlyUpgraded.includes(group.id);
    const unlocked = lvl !== null;

    const displayLvl = nextLv || 'gold';
    const levelData  = group.levels[displayLvl];
    const prog       = levelData.progress(stats);
    const pct        = Math.min(100, Math.round((prog.current/prog.target)*100));

    const card = document.createElement('div');
    card.className = `badge-card ${unlocked ? 'unlocked lv-'+lvl : 'locked'}`;

    // Level dots
    const dotHTML = ['bronze','silver','gold'].map(l => {
      const earned = lvl==='gold' || (lvl==='silver'&&(l==='bronze'||l==='silver')) || (lvl==='bronze'&&l==='bronze');
      return `<div class="level-dot ${earned ? l : ''}"></div>`;
    }).join('');

    card.innerHTML = `
      ${unlocked ? `<div class="level-ribbon ${lvl}">${ACH_LEVELS[lvl].icon} ${ACH_LEVELS[lvl].label}</div>` : '<div class="level-ribbon locked">🔒 Locked</div>'}
      ${isNew ? '<div class="badge-new-tag">New!</div>' : ''}
      <div class="badge-logo-wrap">
        ${buildAchBadgeSVG(group.shape, unlocked ? lvl : 'locked')}
        ${(!unlocked && pct > 0) ? buildAchProgressRing(pct) : ''}
        <div class="badge-emoji">${group.icon}</div>
      </div>
      <div class="badge-name">${group.name}</div>
      <div class="badge-desc">${unlocked ? group.levels[lvl].desc : group.levels.bronze.desc}</div>
      <div class="level-dots">${dotHTML}</div>
      ${unlocked && !nextLv
        ? `<div class="badge-unlocked-tag gold">🥇 Max Level</div>`
        : `<div class="badge-progress-wrap">
             <div class="badge-progress-top">
               <span class="badge-progress-count">${prog.current} / ${prog.target} ${prog.unit}</span>
               <span class="badge-progress-pct">${pct}%</span>
             </div>
             <div class="badge-progress-bg">
               <div class="badge-progress-fill ${unlocked ? displayLvl : 'locked-fill'}" style="width:${pct}%"></div>
             </div>
           </div>`
      }
    `;
    card.addEventListener('click', () => openAchDetail(group, stats, lvl));
    return card;
  }

  function renderAchievements() {
    const stats = getAchStats();
    const achPrevLevels = getAchPrevLevels();
    const newlyUpgraded = [];
    BADGE_GROUPS.forEach(g => {
      const lvl = getAchCurrentLevel(g, stats);
      if (lvl && lvl !== achPrevLevels[g.id]) newlyUpgraded.push(g.id);
    });

    // Summary cards
    const goldCount     = BADGE_GROUPS.filter(g => getAchCurrentLevel(g,stats)==='gold').length;
    const unlockedCount = BADGE_GROUPS.filter(g => getAchCurrentLevel(g,stats)!==null).length;
    document.getElementById('ach-summary').innerHTML = `
      <div class="ach-sum-card">
        <div class="ach-sum-num" style="color:var(--accent)">${unlockedCount}</div>
        <div class="ach-sum-label">Unlocked</div>
      </div>
      <div class="ach-sum-card">
        <div class="ach-sum-num" style="color:var(--gold)">${goldCount}</div>
        <div class="ach-sum-label">Gold</div>
      </div>
      <div class="ach-sum-card">
        <div class="ach-sum-num" style="color:var(--green)">${Math.round((unlockedCount/BADGE_GROUPS.length)*100)}%</div>
        <div class="ach-sum-label">Complete</div>
      </div>
    `;

    // Filter
    let visible = BADGE_GROUPS;
    if (achActiveFilter === 'unlocked')    visible = BADGE_GROUPS.filter(g => getAchCurrentLevel(g,stats) !== null);
    if (achActiveFilter === 'in-progress') visible = BADGE_GROUPS.filter(g => getAchCurrentLevel(g,stats) !== 'gold');
    if (achActiveFilter === 'gold')        visible = BADGE_GROUPS.filter(g => getAchCurrentLevel(g,stats) === 'gold');

    const wrap = document.getElementById('ach-categories-wrap');
    wrap.innerHTML = '';
    if (!visible.length) { wrap.innerHTML = '<div class="ach-empty-state">No badges match this filter.</div>'; return; }

    Object.entries(ACH_CATEGORIES).forEach(([catKey, catMeta]) => {
      const catGroups = visible.filter(g => g.cat === catKey);
      if (!catGroups.length) return;

      const sorted = [
        ...catGroups.filter(g => getAchCurrentLevel(g,stats) !== null),
        ...catGroups.filter(g => getAchCurrentLevel(g,stats) === null),
      ];
      const unlockedInCat = catGroups.filter(g => getAchCurrentLevel(g,stats) !== null).length;

      const section = document.createElement('div');
      section.className = 'ach-category-section';

      // BMI sync panel
      let bmiPanelHTML = '';
      if (catKey === 'bmi') {
        const { bmi, bmiMonths, bmiStreak } = readAchBMIData();
        if (bmi !== null) {
          bmiPanelHTML = `<div class="ach-bmi-panel"><span class="ach-bmi-panel-icon">⚖️</span><strong>Synced from BMI Calculator</strong><span style="color:var(--text3)">·</span> Current BMI: <strong>${parseFloat(bmi).toFixed(1)}</strong> <span style="color:var(--text3)">·</span> Normal check-ins: <strong>${bmiMonths}</strong> <span style="color:var(--text3)">·</span> Current streak: <strong>${bmiStreak}</strong></div>`;
        } else {
          bmiPanelHTML = `<div class="ach-bmi-panel"><span class="ach-bmi-panel-icon">⚖️</span><strong>Synced from BMI Calculator</strong><span style="color:var(--text3)">·</span> No BMI data yet — calculate your BMI on the Report page to unlock these badges.</div>`;
        }
      }

      section.innerHTML = `
        <div class="ach-category-header">
          <span class="ach-cat-icon">${catMeta.icon}</span>
          <div>
            <div class="ach-cat-title">${catMeta.label}</div>
            <div class="ach-cat-desc">${catMeta.desc}</div>
          </div>
          <span class="ach-cat-count">${unlockedInCat} / ${catGroups.length}</span>
        </div>
        ${bmiPanelHTML}
        <div class="badge-grid"></div>
      `;
      const grid = section.querySelector('.badge-grid');
      sorted.forEach(g => grid.appendChild(buildAchCard(g, stats, newlyUpgraded)));
      wrap.appendChild(section);
    });

    // Persist
    const nowLevels = {};
    BADGE_GROUPS.forEach(g => { nowLevels[g.id] = getAchCurrentLevel(g, stats); });
    const achUnlockedDates = getAchUnlockedDates();
    newlyUpgraded.forEach(id => {
      const lvl = nowLevels[id];
      achUnlockedDates[id+'_'+lvl] = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
    });
    localStorage.setItem('ft_ach_v3_levels_' + (currentUser?.email || ''), JSON.stringify(nowLevels));
    localStorage.setItem('ft_ach_dates_' + (currentUser?.email || ''), JSON.stringify(achUnlockedDates));

    if (newlyUpgraded.length) {
      newlyUpgraded.forEach((id, i) => {
        const g = BADGE_GROUPS.find(b => b.id===id);
        const l = nowLevels[id];
        setTimeout(() => showAchToast(g.icon, g.name, ACH_LEVELS[l].icon + ' ' + ACH_LEVELS[l].label), i * 200);
      });
    }
  }

  function openAchDetail(group, stats, lvl) {
    const nextLv    = getAchNextLevel(lvl);
    const showLv    = lvl || 'bronze';
    const levelData = group.levels[showLv];
    const cat       = ACH_CATEGORIES[group.cat];

    // Badge SVG
    document.getElementById('ach-dm-badge-wrap').innerHTML =
      buildAchBadgeSVG(group.shape, lvl || 'locked', 90) +
      `<div class="ach-dm-badge-emoji">${group.icon}</div>`;

    // Level pill
    const pill = document.getElementById('ach-dm-level-pill');
    if (lvl) { pill.textContent = ACH_LEVELS[lvl].icon+' '+ACH_LEVELS[lvl].label; pill.className = 'ach-dm-level-pill '+lvl; }
    else      { pill.textContent = 'Locked'; pill.className = 'ach-dm-level-pill locked'; }

    document.getElementById('ach-dm-cat-label').textContent = cat?.label || '';
    document.getElementById('ach-dm-name').textContent      = group.name;
    document.getElementById('ach-dm-desc').textContent      = levelData.desc;
    document.getElementById('ach-dm-quote').textContent     = '"' + levelData.quote + '"';

    // Level steps
    const steps = document.getElementById('ach-dm-level-steps');
    steps.innerHTML = ['bronze','silver','gold'].map(l => {
      const reached = lvl==='gold' || (lvl==='silver'&&(l==='bronze'||l==='silver')) || (lvl==='bronze'&&l==='bronze');
      const ld = group.levels[l];
      const p  = ld.progress(stats);
      return `<div class="ach-dm-level-step ${reached ? 'reached '+l : ''}">
        <div class="ach-dm-level-step-icon">${ACH_LEVELS[l].icon}</div>
        <div class="ach-dm-level-step-lbl">${ACH_LEVELS[l].label}</div>
        <div class="ach-dm-level-step-val">${p.target} ${p.unit}</div>
      </div>`;
    }).join('');

    const progWrap = document.getElementById('ach-dm-progress-wrap');
    const banner   = document.getElementById('ach-dm-unlocked-banner');
    if (lvl === 'gold') {
      progWrap.style.display = 'none';
      banner.style.display   = 'flex';
      document.getElementById('ach-dm-unlocked-text').textContent =
        'Gold unlocked ' + (getAchUnlockedDates()[group.id+'_gold'] || 'this session') + ' · Max level reached!';
    } else {
      const targetLv = nextLv || 'bronze';
      progWrap.style.display = 'block';
      banner.style.display   = 'none';
      const tp  = group.levels[targetLv].progress(stats);
      const tpct = Math.min(100, Math.round((tp.current/tp.target)*100));
      document.getElementById('ach-dm-prog-label').textContent = `${tp.current} / ${tp.target} ${tp.unit} to ${ACH_LEVELS[targetLv].label}`;
      document.getElementById('ach-dm-prog-pct').textContent   = tpct + '%';
      const fill = document.getElementById('ach-dm-prog-fill');
      fill.style.width = tpct + '%';
    }
    document.getElementById('ach-modal-backdrop').classList.add('open');
  }

  function showAchToast(badgeIcon, badgeName, levelText) {
    const container = document.getElementById('ach-toast-container');
    const item = document.createElement('div');
    item.className = 'ach-toast-item';
    item.innerHTML = `
      <span class="ach-toast-icon">${badgeIcon}</span>
      <div class="ach-toast-text">
        <div class="ach-toast-title">Badge Unlocked</div>
        <div class="ach-toast-body">${badgeName} · ${levelText}</div>
      </div>`;
    container.appendChild(item);
    requestAnimationFrame(() => { requestAnimationFrame(() => { item.classList.add('show'); }); });
    setTimeout(() => {
      item.classList.remove('show');
      item.classList.add('hide');
      setTimeout(() => item.remove(), 300);
    }, 4000);
  }

  document.getElementById('ach-dm-close').addEventListener('click', () =>
    document.getElementById('ach-modal-backdrop').classList.remove('open'));
  document.getElementById('ach-modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('ach-modal-backdrop'))
      document.getElementById('ach-modal-backdrop').classList.remove('open');
  });
  document.getElementById('ach-filter-row').addEventListener('click', e => {
    const pill = e.target.closest('.ach-filter-pill');
    if (!pill) return;
    document.querySelectorAll('.ach-filter-pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
    pill.classList.add('active');
    pill.setAttribute('aria-pressed', 'true');
    achActiveFilter = pill.dataset.filter;
    renderAchievements();
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
      done.slice().sort((a,b) => b.date.localeCompare(a.date)).forEach(w => {
        const item = document.createElement('div');
        item.className = 'report-item';
        item.innerHTML = `
          <div class="report-day">${w.date}</div>
          <div class="report-name">${w.icon ? w.icon + ' ' : ''}${w.name}</div>
          <div class="report-mins">${w.duration} min</div>
          <div class="done-badge">DONE</div>
        `;
        listEl.appendChild(item);
      });
    }
    renderWeightLog();
    renderHistory();
    renderBMIHistory();
    updateBMIGoalUI(null, null, null);
    // Restore goal input if set
    const _g = loadBMIGoal();
    if (_g) document.getElementById('bmi-goal-input').value = _g.targetBmi;
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
  // ===== ACCESSIBILITY: modal focus management + Escape-to-close =====
  (function () {
    const OVERLAY_IDS = ['modal-backdrop', 'forgotModal', 'ach-modal-backdrop', 'cal-day-modal-backdrop'];
    const CLOSE_FNS = {
      'modal-backdrop':        () => closeModal(),
      'forgotModal':           () => closeForgotPassword(),
      'ach-modal-backdrop':    () => document.getElementById('ach-modal-backdrop').classList.remove('open'),
      'cal-day-modal-backdrop':() => document.getElementById('cal-day-modal-backdrop').classList.remove('open'),
    };
    let lastFocused = null;

    function getFocusable(container) {
      return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null);
    }

    function dialogOf(overlay) {
      return overlay.querySelector('[role="dialog"]') || overlay.firstElementChild || overlay;
    }

    OVERLAY_IDS.forEach(id => {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      let wasOpen = overlay.classList.contains('open');
      new MutationObserver(() => {
        const isOpen = overlay.classList.contains('open');
        if (isOpen && !wasOpen) {
          lastFocused = document.activeElement;
          const dialog = dialogOf(overlay);
          const focusables = getFocusable(dialog);
          (focusables[0] || dialog).focus({ preventScroll: true });
        } else if (!isOpen && wasOpen) {
          if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
          lastFocused = null;
        }
        wasOpen = isOpen;
      }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    });

    function topOpenOverlayId() {
      for (let i = OVERLAY_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(OVERLAY_IDS[i]);
        if (el && el.classList.contains('open')) return OVERLAY_IDS[i];
      }
      return null;
    }

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      const id = topOpenOverlayId();
      if (id) { CLOSE_FNS[id](); return; }
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) closeSidebar();
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const id = topOpenOverlayId();
      if (!id) return;
      const dialog = dialogOf(document.getElementById(id));
      const focusables = getFocusable(dialog);
      if (focusables.length === 0) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

