// ============================================================
// main.js — Farewell Website (MOCK MODE — no Firebase)
// Three.js + GSAP + local mock data
// ============================================================

// ── Mock Data ─────────────────────────────────────────────────
const MOCK_SETTINGS = {
  department: 'AI & Data Science',
  batch_year: '2026',
  autograph_open: true,
};

const MOCK_SENIORS = [
  { id: 's1', name: 'Amira Hassan', department: 'AI & Data Science', year: '2026', code: 'AMR001', photo_url: 'https://i.pravatar.cc/200?img=1' },
  { id: 's2', name: 'Bilal Qureshi', department: 'AI & Data Science', year: '2026', code: 'BLQ002', photo_url: 'https://i.pravatar.cc/200?img=3' },
  { id: 's3', name: 'Celia Nour', department: 'AI & Data Science', year: '2026', code: 'CLN003', photo_url: 'https://i.pravatar.cc/200?img=5' },
  { id: 's4', name: 'Dania Farouk', department: 'AI & Data Science', year: '2026', code: 'DNF004', photo_url: 'https://i.pravatar.cc/200?img=9' },
  { id: 's5', name: 'Elan Malik', department: 'AI & Data Science', year: '2026', code: 'ELM005', photo_url: 'https://i.pravatar.cc/200?img=12' },
  { id: 's6', name: 'Fatima Al-Zahra', department: 'AI & Data Science', year: '2026', code: 'FTZ006', photo_url: 'https://i.pravatar.cc/200?img=16' },
  { id: 's7', name: 'Ghayath Idris', department: 'AI & Data Science', year: '2026', code: 'GHI007', photo_url: 'https://i.pravatar.cc/200?img=20' },
  { id: 's8', name: 'Hana Saleh', department: 'AI & Data Science', year: '2026', code: 'HNS008', photo_url: 'https://i.pravatar.cc/200?img=25' },
  { id: 's9', name: 'Ibrahim Yusuf', department: 'AI & Data Science', year: '2026', code: 'IBY009', photo_url: 'https://i.pravatar.cc/200?img=33' },
  { id: 's10', name: 'Jana Mahmoud', department: 'AI & Data Science', year: '2026', code: 'JNM010', photo_url: 'https://i.pravatar.cc/200?img=44' },
  { id: 's11', name: 'Kareem Ziad', department: 'AI & Data Science', year: '2026', code: 'KRZ011', photo_url: 'https://i.pravatar.cc/200?img=50' },
  { id: 's12', name: 'Layla Badawi', department: 'AI & Data Science', year: '2026', code: 'LYB012', photo_url: 'https://i.pravatar.cc/200?img=57' },
];

const MOCK_MEMORIES = [
  { id: 'm1', target: 'all', photo_url: 'https://picsum.photos/seed/farewell1/600/450', caption: 'Our first day together — a journey begins.' },
  { id: 'm2', target: 'all', photo_url: 'https://picsum.photos/seed/farewell2/600/450', caption: 'Late nights in the lab, worth every moment.' },
  { id: 'm3', target: 'all', photo_url: 'https://picsum.photos/seed/farewell3/600/450', caption: 'The annual department picnic, 2023.' },
  { id: 'm4', target: 'all', photo_url: 'https://picsum.photos/seed/farewell4/600/450', caption: '' },
  { id: 'm5', target: 'all', photo_url: 'https://picsum.photos/seed/farewell5/600/450', caption: 'Graduation rehearsal — almost there!' },
  { id: 'm6', target: 'all', photo_url: 'https://picsum.photos/seed/farewell6/600/450', caption: 'The team that made it all possible.' },
];

// Messages stored in memory (sessionStorage for persistence across reload)
function getSavedMessages() {
  try { return JSON.parse(sessionStorage.getItem('mock_messages') || '[]'); } catch { return []; }
}
function saveMessage(msg) {
  const msgs = getSavedMessages();
  msgs.push({ ...msg, id: 'msg_' + Date.now(), timestamp: new Date().toISOString() });
  sessionStorage.setItem('mock_messages', JSON.stringify(msgs));
}

// Mock DB functions matching Firestore API surface
const mockDB = {
  async getSettings() { return adminGetSettings(); },
  async getSeniorByCode(code) { return adminGetSeniors().find(s => s.code === code.toUpperCase()) || null; },
  async getAllSeniors() { return adminGetSeniors(); },
  async getMemoriesFor(id) { return adminGetMemories().filter(m => m.target === 'all' || m.target === id); },
  async getMessagesFor(id) { return getSavedMessages().filter(m => m.to_senior_id === id); },
  async getMessagesSentBy(id) { return getSavedMessages().filter(m => m.from_senior_id === id); },
  async addMessage(data) { saveMessage(data); },
  listenAutographOpen(cb) { cb(adminGetSettings().autograph_open); /* no real-time in mock */ },
};

// ── State ────────────────────────────────────────────────────
let currentSenior = null;
let allSeniors = [];
let messages = [];
let bookPageIndex = 0;
let isMobile = window.innerWidth < 768;
let messagedSet = new Set();
let autographOpen = false;
let threeCtx = null;

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function showToast(msg, type = 'info', duration = 4000) {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'error' ? '✕' : type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 450);
  }, duration);
}

function toRoman(n) {
  if (n <= 0) return '—';
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function setLoadingBar(pct) { $('loading-bar').style.width = pct + '%'; }
function showLoadingOverlay(show) {
  const el = $('loading-overlay');
  if (show) { el.classList.add('active'); setLoadingBar(0); }
  else { el.classList.remove('active'); }
}

// ── THREE.JS SCENE ───────────────────────────────────────────
function getParticleCount() {
  const w = window.innerWidth;
  if (w < 768) return 300;
  if (w < 1200) return 600;
  return 1000;
}

function initThreeJS() {
  const canvas = $('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const ambientLight = new THREE.AmbientLight(0x1a0f05, 0.4);
  scene.add(ambientLight);
  const pointLight1 = new THREE.PointLight(0xd4853a, 1.8, 80);
  pointLight1.position.set(20, 20, 10);
  scene.add(pointLight1);
  const pointLight2 = new THREE.PointLight(0xc9a84c, 1.2, 60);
  pointLight2.position.set(-20, -10, 15);
  scene.add(pointLight2);

  let particleGroup = new THREE.Group();
  scene.add(particleGroup);
  let particleMeshes = [];

  function buildParticles() {
    particleMeshes.forEach(m => { m.geometry.dispose(); m.material.dispose(); particleGroup.remove(m); });
    particleMeshes = [];
    const count = getParticleCount();
    const geos = [
      new THREE.DodecahedronGeometry(0.18, 0),
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.TetrahedronGeometry(0.2, 0),
    ];
    const mat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.8, roughness: 0.2, emissive: 0xd4853a, emissiveIntensity: 0.25 });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geos[i % geos.length], mat.clone());
      mesh.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 80);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.userData.speed = {
        x: (Math.random() - 0.5) * 0.003, y: (Math.random() - 0.5) * 0.003,
        rx: (Math.random() - 0.5) * 0.006, ry: (Math.random() - 0.5) * 0.006,
      };
      particleGroup.add(mesh);
      particleMeshes.push(mesh);
    }
    geos.forEach(g => g.dispose());
  }
  buildParticles();

  let bgColorTarget = { r: 0.05, g: 0.04, b: 0.03 };
  const clock = new THREE.Clock();
  let animFrameId = null;
  let converging = false;

  function animate() {
    animFrameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    particleMeshes.forEach(m => {
      if (converging) {
        m.position.x += (0 - m.position.x) * 0.04;
        m.position.y += (0 - m.position.y) * 0.04;
        m.position.z += (5 - m.position.z) * 0.03;
      } else {
        m.position.x += m.userData.speed.x;
        m.position.y += m.userData.speed.y;
        m.rotation.x += m.userData.speed.rx;
        m.rotation.y += m.userData.speed.ry;
        if (Math.abs(m.position.x) > 52) m.userData.speed.x *= -1;
        if (Math.abs(m.position.y) > 52) m.userData.speed.y *= -1;
      }
    });
    pointLight1.position.x = 20 * Math.cos(t * 0.15);
    pointLight1.position.z = 10 + 8 * Math.sin(t * 0.12);
    camera.position.x += (Math.sin(t * 0.05) * 2 - camera.position.x) * 0.01;
    camera.position.y += (Math.cos(t * 0.07) * 1 - camera.position.y) * 0.01;
    renderer.setClearColor(new THREE.Color(bgColorTarget.r, bgColorTarget.g, bgColorTarget.b), 1);
    renderer.render(scene, camera);
  }
  animate();

  const onResize = debounce(() => {
    isMobile = window.innerWidth < 768;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    buildParticles();
  }, 250);
  window.addEventListener('resize', onResize);

  threeCtx = {
    startConverge() { converging = true; },
    setScrollColor(p) {
      // warm black → amber-dark as user scrolls memories
      bgColorTarget.r = 0.05 + p * 0.08;
      bgColorTarget.g = 0.04 + p * 0.05;
      bgColorTarget.b = 0.03 + p * 0.01;
    },
    zoomIn() {
      let fov = camera.fov;
      const iv = setInterval(() => {
        fov -= 0.6; camera.fov = Math.max(30, fov); camera.updateProjectionMatrix();
        if (camera.fov <= 30) clearInterval(iv);
      }, 16);
    },
  };
}

// ── ENTRY SCREEN ─────────────────────────────────────────────
async function initEntryScreen() {
  const settings = await mockDB.getSettings();
  $('entry-site-title').textContent = "ALvida'2026";
  $('entry-dept-year').textContent = `${settings.department} · Class of ${settings.batch_year}`;

  const input = $('entry-code-input');
  const errMsg = $('entry-error');
  const btn = $('btn-enter');

  const submit = async () => {
    const code = input.value.trim().toUpperCase();
    if (!code || code.length < 3) { shakeInput(); errMsg.textContent = 'Please enter your code.'; return; }
    btn.disabled = true;
    btn.textContent = 'Verifying…';
    errMsg.textContent = '';

    await new Promise(r => setTimeout(r, 600)); // simulate network

    // Admin shortcut — works in any case (code is already uppercased)
    if (code === ADMIN_PASSWORD.toUpperCase()) {
      showAdminPanel();
      return;
    }

    const senior = await mockDB.getSeniorByCode(code);
    if (!senior) {
      shakeInput();
      errMsg.textContent = 'Code not recognized. Try again.';
      input.classList.add('error');
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Begin My Journey`;
      return;
    }
    currentSenior = senior;
    await onValidCode(senior);
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  input.addEventListener('input', () => { input.classList.remove('error'); errMsg.textContent = ''; });

  function shakeInput() {
    input.classList.remove('shake', 'error');
    void input.offsetWidth;
    input.classList.add('shake', 'error');
  }
}

async function onValidCode(senior) {
  threeCtx.startConverge();
  threeCtx.zoomIn();

  const reveal = $('name-reveal');
  $('name-reveal-text').textContent = senior.name;
  gsap.to(reveal, { opacity: 1, duration: 1, delay: 0.3 });
  gsap.to(reveal, { opacity: 0, duration: 0.8, delay: 2.2, onComplete: () => { reveal.style.display = 'none'; } });

  await new Promise(r => setTimeout(r, 2600));
  gsap.to($('section-entry'), { opacity: 0, duration: 0.8, onComplete: () => { $('section-entry').classList.add('hidden'); } });

  await new Promise(r => setTimeout(r, 800));
  $('site-wrapper').hidden = false;
  populateLanding(senior);

  await Promise.all([
    loadMemories(senior.id),
    loadAutographWall(senior),
    loadMessages(senior.id),
  ]);
  mockDB.listenAutographOpen(open => {
    autographOpen = open;
    $('wall-closed-overlay').hidden = open;
  });
  setupScrollAnimations();
}

// ── SECTION 2: LANDING ───────────────────────────────────────
function populateLanding(senior) {
  $('landing-name').textContent = senior.name;
  $('landing-class').textContent = `Class of ${senior.year} · ${senior.department}`;
  const photo = $('landing-photo');
  photo.src = senior.photo_url || '';
  photo.alt = senior.name;

  gsap.from('#section-landing .profile-photo-wrap', { opacity: 0, scale: 0.7, duration: 1, ease: 'back.out(1.5)' });
  gsap.from('#landing-name', { opacity: 0, y: 30, duration: 0.9, delay: 0.3 });
  gsap.from('#landing-class', { opacity: 0, y: 20, duration: 0.8, delay: 0.5 });
  gsap.from('.scroll-indicator', { opacity: 0, y: 10, duration: 0.8, delay: 0.9 });
}

// ── SECTION 3: MEMORIES ──────────────────────────────────────
async function loadMemories(seniorId) {
  const grid = $('memories-grid');
  grid.innerHTML = '<p class="no-memories-msg">Loading memories…</p>';
  const all = await mockDB.getMemoriesFor(seniorId);
  if (!all.length) { grid.innerHTML = '<p class="no-memories-msg">No memories added yet.</p>'; return; }
  grid.innerHTML = '';
  all.forEach(mem => {
    const card = document.createElement('article');
    card.className = 'memory-card arabesque-corners';
    card.innerHTML = `
      <svg class="corner tl" style="position:absolute;top:-2px;left:-2px;width:24px;height:24px;opacity:0.5" viewBox="0 0 48 48"><use href="#corner-ornament"/></svg>
      <svg class="corner tr" style="position:absolute;top:-2px;right:-2px;width:24px;height:24px;opacity:0.5;transform:rotate(90deg)" viewBox="0 0 48 48"><use href="#corner-ornament"/></svg>
      <svg class="corner bl" style="position:absolute;bottom:-2px;left:-2px;width:24px;height:24px;opacity:0.5;transform:rotate(270deg)" viewBox="0 0 48 48"><use href="#corner-ornament"/></svg>
      <svg class="corner br" style="position:absolute;bottom:-2px;right:-2px;width:24px;height:24px;opacity:0.5;transform:rotate(180deg)" viewBox="0 0 48 48"><use href="#corner-ornament"/></svg>
      <img class="memory-card-img" data-src="${mem.photo_url}" src="" alt="${mem.caption || 'Memory'}" loading="lazy"/>
      ${mem.caption ? `<p class="memory-card-caption">${mem.caption}</p>` : ''}
    `;
    grid.appendChild(card);
  });
  lazyLoadImages();
}

function lazyLoadImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const img = en.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => obs.observe(img));
}

function setupScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.memory-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, z: -60, rotateX: 6 },
      {
        opacity: 1, z: 0, rotateX: 0,
        duration: 0.9, delay: (i % 3) * 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: card, start: 'top 88%', toggleActions: 'play none none reverse',
          onEnter: () => card.classList.add('visible')
        },
      }
    );
  });
  ScrollTrigger.create({
    trigger: '#section-memories', start: 'top bottom', end: 'bottom top',
    onUpdate: self => threeCtx && threeCtx.setScrollColor(self.progress),
  });
  if (!isMobile) {
    document.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.03)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }
}

// ── SECTION 4: AUTOGRAPH WALL ─────────────────────────────────
async function loadAutographWall(senior) {
  allSeniors = await mockDB.getAllSeniors();
  const sent = await mockDB.getMessagesSentBy(senior.id);
  sent.forEach(m => messagedSet.add(m.to_senior_id));
  renderWall(senior);
}

function renderWall(senior) {
  const wall = $('seniors-wall');
  wall.innerHTML = '';
  allSeniors.forEach(s => {
    const isSelf = s.id === senior.id;
    const messaged = messagedSet.has(s.id);
    const card = document.createElement('div');
    card.className = `wall-senior-card${isSelf ? ' is-self' : ''}${messaged ? ' messaged' : ''}`;
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="wall-photo-wrap">
        <img data-src="${s.photo_url}" src="" alt="${s.name}" loading="lazy"/>
      </div>
      <span class="wall-senior-name">${s.name}</span>
    `;
    if (!isSelf) {
      card.addEventListener('click', () => openMessageModal(s));
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', e => { if (e.key === 'Enter') openMessageModal(s); });
    }
    wall.appendChild(card);
  });
  lazyLoadImages();
}

// ── MESSAGE MODAL ─────────────────────────────────────────────
let currentTarget = null;
let currentUploadedPhoto = null; // store base64 of user upload

function openMessageModal(target) {
  currentTarget = target;
  currentUploadedPhoto = null;

  // Reset UI
  $('modal-photo-preview').src = currentSenior.photo_url || '';
  $('modal-photo-preview').alt = 'Your Photo';
  $('src-profile').classList.add('active');
  $('src-upload').value = ''; // reset file input

  $('modal-name').textContent = target.name;
  $('modal-textarea').value = '';
  $('modal-char-count').textContent = '0 / 500';
  $('modal-char-count').className = 'modal-char-count';
  $('modal-error').textContent = '';

  $('message-modal').classList.add('active');
  setTimeout(() => $('modal-textarea').focus(), 100);
}

function closeModal() { $('message-modal').classList.remove('active'); currentTarget = null; }

function initModal() {
  $('modal-cancel-btn').addEventListener('click', closeModal);
  $('message-modal').addEventListener('click', e => { if (e.target === $('message-modal')) closeModal(); });

  $('modal-textarea').addEventListener('input', () => {
    const len = $('modal-textarea').value.length;
    const counter = $('modal-char-count');
    counter.textContent = `${len} / 500`;
    counter.className = 'modal-char-count' + (len > 450 ? (len >= 500 ? ' max' : ' warning') : '');
  });

  // Photo toggle
  $('src-profile').addEventListener('click', () => {
    $('src-profile').classList.add('active');
    $('modal-photo-preview').src = currentSenior.photo_url || '';
    currentUploadedPhoto = null;
    $('src-upload').value = '';
  });

  $('src-upload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { showToast('Image too large (max 2MB).', 'error'); return; }
      const reader = new FileReader();
      reader.onload = e2 => {
        currentUploadedPhoto = e2.target.result;
        $('modal-photo-preview').src = currentUploadedPhoto;
        $('src-profile').classList.remove('active');
      };
      reader.readAsDataURL(file);
    }
  });

  $('modal-submit-btn').addEventListener('click', submitMessage);
}

async function submitMessage() {
  if (!currentTarget || !currentSenior) return;
  const text = $('modal-textarea').value.trim();
  if (!text) { $('modal-error').textContent = 'Please write something.'; return; }
  if (!autographOpen) { $('modal-error').textContent = 'The autograph wall is currently closed.'; return; }

  const btn = $('modal-submit-btn');
  btn.disabled = true; btn.textContent = 'Sending…';
  $('modal-error').textContent = '';

  await mockDB.addMessage({
    from_senior_id: currentSenior.id,
    from_name: currentSenior.name,
    from_photo_url: currentUploadedPhoto || currentSenior.photo_url || '',
    to_senior_id: currentTarget.id,
    to_name: currentTarget.name,
    message_text: text,
  });

  spawnInkBurst(btn);
  messagedSet.add(currentTarget.id);
  document.querySelectorAll('.wall-senior-card').forEach(card => {
    if (card.querySelector('.wall-senior-name')?.textContent === currentTarget.name) {
      card.classList.add('messaged');
    }
  });
  showToast(`Message sent to ${currentTarget.name}! ✦`, 'success');
  closeModal();
  btn.disabled = false; btn.innerHTML = 'Send Message ✦';
}

function spawnInkBurst(btn) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'ink-burst';
    const angle = (i / 20) * Math.PI * 2, dist = 40 + Math.random() * 60;
    p.style.left = cx + 'px'; p.style.top = cy + 'px';
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    p.style.animationDelay = (Math.random() * 0.15) + 's';
    p.style.width = p.style.height = (3 + Math.random() * 4) + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

// ── SECTION 5: AUTOGRAPH BOOK ─────────────────────────────────
async function loadMessages(seniorId) {
  messages = await mockDB.getMessagesFor(seniorId);
  // Add a few demo messages if none exist
  if (!messages.length) {
    messages = [
      { id: 'demo1', from_senior_id: 's2', from_name: 'Bilal Qureshi', from_photo_url: 'https://i.pravatar.cc/200?img=3', to_senior_id: seniorId, message_text: 'You have always been an inspiration to everyone around you. Wishing you all the success the world has to offer. Go shine bright! ✦', timestamp: '2025-01-01' },
      { id: 'demo2', from_senior_id: 's3', from_name: 'Celia Nour', from_photo_url: 'https://i.pravatar.cc/200?img=5', to_senior_id: seniorId, message_text: 'Remembering all the late nights we spent together in the computer lab. Those memories will stay with me forever. Keep creating amazing things!', timestamp: '2025-01-02' },
      { id: 'demo3', from_senior_id: 's6', from_name: 'Fatima Al-Zahra', from_photo_url: 'https://i.pravatar.cc/200?img=16', to_senior_id: seniorId, message_text: 'Your kindness and humor made every difficult day easier to get through. The world is a better place with you in it. Stay golden! 🌙', timestamp: '2025-01-03' },
    ];
  }
  renderBook();
  setupBookSwipe();
}

function renderBook() {
  const total = messages.length;
  isMobile = window.innerWidth < 768;
  const pps = isMobile ? 1 : 2;
  bookPageIndex = Math.max(0, Math.min(bookPageIndex, Math.max(0, total - pps)));

  renderPageContent('page-left-content', 'page-left-num', bookPageIndex, total);
  if (!isMobile) renderPageContent('page-right-content', 'page-right-num', bookPageIndex + 1, total);

  if (total === 0) {
    $('book-page-counter').textContent = 'No messages yet';
  } else if (isMobile) {
    $('book-page-counter').textContent = `Page ${toRoman(bookPageIndex + 1)} of ${toRoman(total)}`;
  } else {
    const s = bookPageIndex + 1, e = Math.min(bookPageIndex + 2, total);
    $('book-page-counter').textContent = `${toRoman(s)}${e > s ? '–' + toRoman(e) : ''} of ${toRoman(total)}`;
  }
  $('book-prev').disabled = bookPageIndex === 0;
  $('book-next').disabled = isMobile ? bookPageIndex >= total - 1 : bookPageIndex >= total - 2;
}

function renderPageContent(contentId, numId, index, total) {
  const el = $(contentId), numEl = $(numId);
  el.innerHTML = '';
  if (index >= total || total === 0) {
    if (index === 0) el.innerHTML = `<div class="page-empty-content" style="flex:1;display:flex;align-items:center;text-align:center"><p>Your story is being written by those who love you.</p></div>`;
    numEl.textContent = '';
    return;
  }
  const msg = messages[index];
  el.innerHTML = `
    <div class="autograph-photo-wrap" style="margin-top:0">
      <img src="${msg.from_photo_url || ''}" alt="${msg.from_name}" loading="lazy"/>
    </div>
    <div class="autograph-to-row" style="margin-top:1rem;margin-bottom:0.5rem">
      <span>From:</span>
      <h2 style="font-size:1.4rem">${msg.from_name}</h2>
    </div>
    <div class="autograph-textarea" style="flex:1;border:none;background:transparent;padding:0;font-size:0.95rem;overflow-y:auto">
      ${msg.message_text.replace(/\n/g, '<br>')}
    </div>
  `;
  numEl.textContent = index + 1;
}

function turnPage(dir) {
  isMobile = window.innerWidth < 768;
  const pps = isMobile ? 1 : 2;
  const total = messages.length;
  if (dir === 'next') {
    if (bookPageIndex + pps >= total) return;
    isMobile ? animateMobileFlip('next', () => { bookPageIndex += 1; renderBook(); })
      : animateDesktopFlip('next', () => { bookPageIndex += 2; renderBook(); });
  } else {
    if (bookPageIndex === 0) return;
    isMobile ? animateMobileFlip('prev', () => { bookPageIndex -= 1; renderBook(); })
      : animateDesktopFlip('prev', () => { bookPageIndex -= 2; renderBook(); });
  }
}

function animateDesktopFlip(dir, cb) {
  const page = dir === 'next' ? $('book-page-left') : $('book-page-right');
  const cls = dir === 'next' ? 'flip-left' : 'flip-right';
  page.classList.add(cls);
  setTimeout(() => { page.classList.remove(cls); cb(); }, 700);
}

function animateMobileFlip(dir, cb) {
  const page = $('book-page-left');
  const out = dir === 'next' ? 'mobile-slide-out-left' : 'mobile-slide-out-right';
  const inn = dir === 'next' ? 'mobile-slide-in-right' : 'mobile-slide-in-left';
  page.classList.add(out);
  setTimeout(() => {
    page.classList.remove(out); cb();
    page.classList.add(inn);
    setTimeout(() => page.classList.remove(inn), 400);
  }, 400);
}

function setupBookSwipe() {
  const spread = $('book-spread');
  let startX = 0;
  spread.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  spread.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 50) return;
    dx < 0 ? turnPage('next') : turnPage('prev');
  }, { passive: true });
}

function initBookNav() {
  $('book-prev').addEventListener('click', () => turnPage('prev'));
  $('book-next').addEventListener('click', () => turnPage('next'));
  window.addEventListener('resize', debounce(() => {
    isMobile = window.innerWidth < 768;
    if (!isMobile) $('book-page-right').style.display = '';
    renderBook();
  }, 300));
}

// ── SECTION 6: PDF DOWNLOAD ───────────────────────────────────
function initPdfDownload() {
  $('btn-download-pdf').addEventListener('click', generatePDF);
}

async function generatePDF() {
  showLoadingOverlay(true);
  await new Promise(r => setTimeout(r, 0));
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    setLoadingBar(10);

    // Cover
    pdf.setFillColor(10, 15, 44);
    pdf.rect(0, 0, W, H, 'F');
    pdf.setDrawColor(201, 168, 76); pdf.setLineWidth(1.2); pdf.rect(8, 8, W - 16, H - 16);
    pdf.setLineWidth(0.4); pdf.rect(12, 12, W - 24, H - 24);

    if (currentSenior.photo_url) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 200;
        const ctx2 = canvas.getContext('2d');
        ctx2.beginPath(); ctx2.arc(100, 100, 100, 0, Math.PI * 2); ctx2.clip();
        const img = new Image(); img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = currentSenior.photo_url; });
        ctx2.drawImage(img, 0, 0, 200, 200);
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', W / 2 - 25, 50, 50, 50);
        pdf.setDrawColor(201, 168, 76); pdf.setLineWidth(0.8); pdf.ellipse(W / 2, 75, 26, 26);
      } catch (e) { }
    }
    pdf.setTextColor(201, 168, 76); pdf.setFontSize(22); pdf.setFont('helvetica', 'bold');
    pdf.text(currentSenior.name, W / 2, 120, { align: 'center' });
    pdf.setFontSize(11); pdf.setTextColor(212, 133, 58);
    pdf.text(`${currentSenior.department} · Class of ${currentSenior.year}`, W / 2, 132, { align: 'center' });
    pdf.setFontSize(14); pdf.setTextColor(245, 240, 232);
    pdf.text('Autograph Book', W / 2, 150, { align: 'center' });
    pdf.setDrawColor(201, 168, 76); pdf.setLineWidth(0.5); pdf.line(W / 2 - 30, 155, W / 2 + 30, 155);

    setLoadingBar(25);
    for (let i = 0; i < messages.length; i++) {
      pdf.addPage();
      const msg = messages[i];
      pdf.setFillColor(242, 232, 213); pdf.rect(0, 0, W, H, 'F');
      pdf.setDrawColor(180, 150, 100); pdf.setLineWidth(0.15);
      for (let y = 35; y < H - 15; y += 8) pdf.line(15, y, W - 15, y);
      pdf.setDrawColor(154, 122, 46); pdf.setLineWidth(0.8); pdf.rect(10, 10, W - 20, H - 20);

      if (msg.from_photo_url) {
        try {
          const c2 = document.createElement('canvas'); c2.width = c2.height = 100;
          const ctx2 = c2.getContext('2d');
          ctx2.beginPath(); ctx2.arc(50, 50, 50, 0, Math.PI * 2); ctx2.clip();
          const img2 = new Image(); img2.crossOrigin = 'anonymous';
          await new Promise((res, rej) => { img2.onload = res; img2.onerror = rej; img2.src = msg.from_photo_url; });
          ctx2.drawImage(img2, 0, 0, 100, 100);
          pdf.addImage(c2.toDataURL('image/jpeg', 0.85), 'JPEG', 15, 18, 20, 20);
        } catch (e) { }
      }
      pdf.setTextColor(154, 122, 46); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
      pdf.text(msg.from_name, 40, 28);
      pdf.setTextColor(44, 26, 10); pdf.setFontSize(11); pdf.setFont('helvetica', 'normal');
      pdf.text(pdf.splitTextToSize(msg.message_text, W - 30), 15, 50);
      pdf.setTextColor(154, 122, 46); pdf.setFontSize(9);
      pdf.text(toRoman(i + 1), W / 2, H - 15, { align: 'center' });
      setLoadingBar(25 + ((i + 1) / messages.length) * 70);
    }

    setLoadingBar(100);
    const safeName = currentSenior.name.replace(/[^a-zA-Z0-9]/g, '_');
    pdf.save(`${safeName}_AutographBook_${currentSenior.year}.pdf`);
    showToast('Your autograph book downloaded! ✦', 'success');
  } catch (e) {
    showToast('PDF generation failed. Please try again.', 'error');
    console.error(e);
  } finally {
    setTimeout(() => showLoadingOverlay(false), 400);
  }
}

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  try { initThreeJS(); } catch (e) { console.error('Three.js failed:', e); }
  await initEntryScreen();
  initModal();
  initBookNav();
  initPdfDownload();
}

init();

// ── ADMIN PANEL ───────────────────────────────────────────────
// Triggered when user types "nihal77" on the entry screen

const ADMIN_PASSWORD = 'nihal77';

// Admin data — mirrors MOCK_* but stored in localStorage for persistence
function adminGetSeniors() {
  try { return JSON.parse(localStorage.getItem('admin_seniors') || 'null') || MOCK_SENIORS.map(s => ({ ...s })); }
  catch { return MOCK_SENIORS.map(s => ({ ...s })); }
}
function adminSaveSeniors(arr) { localStorage.setItem('admin_seniors', JSON.stringify(arr)); }

function adminGetMemories() {
  try { return JSON.parse(localStorage.getItem('admin_memories') || 'null') || MOCK_MEMORIES.map(m => ({ ...m })); }
  catch { return MOCK_MEMORIES.map(m => ({ ...m })); }
}
function adminSaveMemories(arr) { localStorage.setItem('admin_memories', JSON.stringify(arr)); }

function adminGetSettings() {
  try { return JSON.parse(localStorage.getItem('admin_settings') || 'null') || { ...MOCK_SETTINGS }; }
  catch { return { ...MOCK_SETTINGS }; }
}
function adminSaveSettings(obj) { localStorage.setItem('admin_settings', JSON.stringify(obj)); }

function genCode(name) {
  const initials = name.split(' ').map(w => w[0]?.toUpperCase() || 'X').join('').slice(0, 3).padEnd(3, 'X');
  return initials + String(Math.floor(Math.random() * 900) + 100);
}

// ── File Upload Helper ─────────────────────────────────────────
function attachImageUpload(fileInputId, hiddenInputId, previewId) {
  const fileInput = $(fileInputId);
  const hiddenInput = $(hiddenInputId);
  const previewDiv = $(previewId);
  if (!fileInput || !hiddenInput || !previewDiv) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large. Please use under 2MB.', 'error');
        fileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        hiddenInput.value = ev.target.result;
        previewDiv.style.display = 'block';
        previewDiv.querySelector('img').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      hiddenInput.value = '';
      previewDiv.style.display = 'none';
      previewDiv.querySelector('img').src = '';
    }
  });
}

// ── Show/hide admin ──────────────────────────────────────────
function showAdminPanel() {
  gsap.to($('section-entry'), {
    opacity: 0, duration: 0.6, onComplete: () => {
      $('section-entry').classList.add('hidden');
      $('admin-panel').hidden = false;
      gsap.from('#admin-panel', { opacity: 0, duration: 0.5 });
      initAdminPanel();
    }
  });
}

// ── Tab switching ────────────────────────────────────────────
function initAdminPanel() {
  // Nav tabs
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      $(`admin-tab-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'messages') renderAdminMessages();
    });
  });

  // Logout
  $('admin-logout-btn').addEventListener('click', () => {
    $('admin-panel').hidden = true;
    $('section-entry').classList.remove('hidden');
    gsap.to($('section-entry'), { opacity: 1, duration: 0.5 });
    $('entry-code-input').value = '';
  });

  renderAdminSeniors();
  initAdminSeniorsForm();
  renderAdminMemories();
  initAdminMemoriesForm();
  initAdminSettings();
  renderAdminMessages();

  attachImageUpload('af-photo-file', 'af-photo', 'af-photo-preview');
  attachImageUpload('am-photo-file', 'mf-url', 'am-photo-preview');
}

// ── Seniors Tab ──────────────────────────────────────────────
let editingSeniorId = null;

function renderAdminSeniors() {
  const tbody = $('seniors-tbody');
  const seniors = adminGetSeniors();
  tbody.innerHTML = seniors.length ? '' : '<tr><td colspan="5" style="text-align:center;opacity:0.5;padding:2rem">No seniors yet.</td></tr>';
  seniors.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color:var(--ivory)">${s.name}</strong></td>
      <td>${s.department}</td>
      <td>${s.year}</td>
      <td><span class="admin-code-badge">${s.code}</span></td>
      <td>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button class="admin-edit-btn" data-i="${i}" style="background:transparent;border:1px solid rgba(201,168,76,0.5);color:#c9a84c;padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;font-family:var(--font-display);font-size:0.85rem">Edit</button>
          <button class="admin-delete-btn" data-i="${i}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.admin-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const arr = adminGetSeniors();
      const s = arr[+btn.dataset.i];
      editingSeniorId = s.id;
      $('af-name').value = s.name;
      const settings = adminGetSettings();
      $('af-dept').value = settings.department;
      $('af-dept').disabled = true;
      $('af-year').value = settings.batch_year;
      $('af-year').disabled = true;
      $('af-photo').value = s.photo_url || '';
      if ($('af-photo-file')) $('af-photo-file').value = '';
      if (s.photo_url) {
        $('af-photo-preview').style.display = 'block';
        $('af-photo-preview').querySelector('img').src = s.photo_url;
      } else {
        $('af-photo-preview').style.display = 'none';
        $('af-photo-preview').querySelector('img').src = '';
      }
      $('af-code').value = s.code;
      if ($('form-title-senior')) $('form-title-senior').textContent = "Edit Senior";
      $('admin-senior-form').hidden = false;
    });
  });

  tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const arr = adminGetSeniors(); arr.splice(+btn.dataset.i, 1);
      adminSaveSeniors(arr); renderAdminSeniors();
      showToast('Senior removed.', 'info');
    });
  });
}

function initAdminSeniorsForm() {
  $('admin-add-senior-btn').addEventListener('click', () => {
    editingSeniorId = null;
    $('af-name').value = '';
    $('af-photo').value = '';
    if ($('af-photo-file')) $('af-photo-file').value = '';
    if ($('af-photo-preview')) {
      $('af-photo-preview').style.display = 'none';
      $('af-photo-preview').querySelector('img').src = '';
    }
    $('af-code').value = '';
    if ($('form-title-senior')) $('form-title-senior').textContent = "New Senior";
    const s = adminGetSettings();
    $('af-dept').value = s.department;
    $('af-dept').disabled = true;
    $('af-year').value = s.batch_year;
    $('af-year').disabled = true;
    $('admin-senior-form').hidden = false;
  });
  $('admin-senior-cancel').addEventListener('click', () => { $('admin-senior-form').hidden = true; });
  $('admin-senior-save').addEventListener('click', () => {
    const name = $('af-name').value.trim();
    const s = adminGetSettings();
    const dept = s.department;
    const year = s.batch_year;
    const photo = $('af-photo').value.trim();
    const customCode = $('af-code').value.trim().toUpperCase();
    if (!name || !dept || !year) { showToast('Name, Department and Year are required.', 'error'); return; }
    const arr = adminGetSeniors();
    const finalCode = customCode || genCode(name);

    // Check if code matches ADMIN_PASSWORD
    if (finalCode === ADMIN_PASSWORD.toUpperCase() || finalCode === 'NIHAL77') {
      showToast('Cannot use reserved admin code.', 'error');
      return;
    }
    // Check if code already exists (skip if it's the current senior being edited)
    if (arr.find(s => s.code === finalCode && s.id !== editingSeniorId)) {
      showToast('This exact code already exists. Please use another.', 'error');
      return;
    }

    if (editingSeniorId) {
      const idx = arr.findIndex(s => s.id === editingSeniorId);
      if (idx !== -1) {
        arr[idx] = { ...arr[idx], name, department: dept, year, code: finalCode, photo_url: photo };
        showToast(`${name} updated!`, 'success', 3000);
      }
      editingSeniorId = null;
    } else {
      const newSenior = { id: 'adm_' + Date.now(), name, department: dept, year, code: finalCode, photo_url: photo };
      arr.push(newSenior);
      showToast(`${name} added! Code: ${newSenior.code}`, 'success', 6000);
    }

    adminSaveSeniors(arr);
    $('af-name').value = ''; $('af-dept').value = ''; $('af-year').value = ''; $('af-photo').value = ''; $('af-code').value = '';
    if ($('af-photo-file')) $('af-photo-file').value = '';
    if ($('af-photo-preview')) {
      $('af-photo-preview').style.display = 'none';
      $('af-photo-preview').querySelector('img').src = '';
    }
    $('admin-senior-form').hidden = true;
    renderAdminSeniors();
  });
}

// ── Memories Tab ─────────────────────────────────────────────
function renderAdminMemories() {
  const tbody = $('memories-tbody');
  const mems = adminGetMemories();
  tbody.innerHTML = mems.length ? '' : '<tr><td colspan="4" style="text-align:center;opacity:0.5;padding:2rem">No memories yet.</td></tr>';
  mems.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${m.photo_url}" alt="memory" loading="lazy" /></td>
      <td style="max-width:240px;word-break:break-word">${m.caption || '<em style="opacity:0.4">No caption</em>'}</td>
      <td>${m.target === 'all' ? 'Shared' : m.target}</td>
      <td><button class="admin-delete-btn" data-i="${i}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const arr = adminGetMemories(); arr.splice(+btn.dataset.i, 1);
      adminSaveMemories(arr); renderAdminMemories();
      showToast('Memory removed.', 'info');
    });
  });
}

function initAdminMemoriesForm() {
  // Populate target select with seniors
  const sel = $('mf-target');
  adminGetSeniors().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id; opt.textContent = s.name;
    sel.appendChild(opt);
  });

  $('admin-add-memory-btn').addEventListener('click', () => { $('admin-memory-form').hidden = false; });
  $('admin-memory-cancel').addEventListener('click', () => { $('admin-memory-form').hidden = true; });
  $('admin-memory-save').addEventListener('click', () => {
    const url = $('mf-url').value.trim();
    const caption = $('mf-caption').value.trim();
    if (!url) { showToast('Image needed', 'error'); return; }
    const arr = adminGetMemories();
    arr.push({ id: 'mem_' + Date.now(), url, caption });
    adminSaveMemories(arr);
    $('mf-url').value = ''; $('mf-caption').value = '';
    if ($('am-photo-file')) $('am-photo-file').value = '';
    if ($('am-photo-preview')) {
      $('am-photo-preview').style.display = 'none';
      $('am-photo-preview').querySelector('img').src = '';
    }
    $('admin-memory-form').hidden = true;
    renderAdminMemories();
    showToast('Memory added.', 'success');
  });
}

// ── Settings Tab ─────────────────────────────────────────────
function initAdminSettings() {
  const s = adminGetSettings();
  $('s-dept').value = s.department || '';
  $('s-year').value = s.batch_year || '';
  const toggle = $('s-wall-open');
  toggle.checked = !!s.autograph_open;
  $('s-wall-label').textContent = s.autograph_open ? 'Open' : 'Closed';
  toggle.addEventListener('change', () => {
    $('s-wall-label').textContent = toggle.checked ? 'Open' : 'Closed';
  });
  $('admin-save-settings').addEventListener('click', () => {
    adminSaveSettings({ department: $('s-dept').value.trim(), batch_year: $('s-year').value.trim(), autograph_open: toggle.checked });
    showToast('Settings saved!', 'success');
  });
}

// ── Messages Tab ─────────────────────────────────────────────
function renderAdminMessages() {
  const tbody = $('messages-tbody');
  const msgs = getSavedMessages();
  tbody.innerHTML = msgs.length ? '' : '<tr><td colspan="4" style="text-align:center;opacity:0.5;padding:2rem">No messages yet.</td></tr>';
  msgs.forEach(m => {
    const tr = document.createElement('tr');
    const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : '—';
    tr.innerHTML = `
      <td>${m.from_name}</td>
      <td>${m.to_name}</td>
      <td style="max-width:300px;word-break:break-word">${m.message_text}</td>
      <td style="white-space:nowrap;font-size:0.78rem;opacity:0.6">${time}</td>
    `;
    tbody.appendChild(tr);
  });
}
