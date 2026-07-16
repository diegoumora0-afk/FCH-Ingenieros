/* ============================================================
   app.js — SPA Router, shell init, toast system, modal helpers
   ============================================================ */

// ── Utilities ────────────────────────────────────────────────
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatNum(n, decimals = 2) {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function animateCounter(el, target, duration = 800) {
  const start = performance.now();
  const from = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * ease).toLocaleString('es-PE');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Toast system ─────────────────────────────────────────────
function showToast(type, title, message = '', duration = 4000) {
  const icons = {
    success: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <div class="toast__icon">${icons[type]}</div>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      ${message ? `<div class="toast__message">${message}</div>` : ''}
    </div>
    <button class="toast__close" aria-label="Cerrar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  container.appendChild(toast);
  const remove = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  toast.querySelector('.toast__close').addEventListener('click', remove);
  if (duration > 0) setTimeout(remove, duration);
}

// ── Modal helpers ─────────────────────────────────────────────
const Modal = {
  open(title, bodyHTML, footerHTML = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML;
    document.getElementById('modal-backdrop').classList.add('active');
    // Focus first input
    setTimeout(() => {
      const first = document.querySelector('#modal-body input, #modal-body select, #modal-body textarea');
      if (first) first.focus();
    }, 100);
  },
  close() {
    document.getElementById('modal-backdrop').classList.remove('active');
  },
  setTitle(t) { document.getElementById('modal-title').textContent = t; },
  setBody(html) { document.getElementById('modal-body').innerHTML = html; },
  setFooter(html) { document.getElementById('modal-footer').innerHTML = html; },
};

// ── Router ────────────────────────────────────────────────────
const PAGES = {
  dashboard:   { title: 'Dashboard',    fn: () => PageDashboard.render() },
  materiales:  { title: 'Materiales',   fn: () => PageMateriales.render() },
  movimientos: { title: 'Movimientos',  fn: () => PageMovimientos.render() },
  kardex:      { title: 'Kardex',       fn: () => PageKardex.render() },
  solicitudes: { title: 'Solicitudes',  fn: () => PageSolicitudes.render() },
  proyectos:   { title: 'Proyectos',    fn: () => PageProyectos.render() },
  proveedores: { title: 'Proveedores',  fn: () => PageProveedores.render() },
  personal:    { title: 'Personal',     fn: () => PagePersonal.render() },
  usuarios:    { title: 'Usuarios',     fn: () => PageUsuarios.render() },
};

function getCurrentPage() {
  const hash = location.hash.replace('#/', '');
  return PAGES[hash] ? hash : 'dashboard';
}

function navigate(page) {
  location.hash = `#/${page}`;
}

function activateLink(page) {
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  const link = document.getElementById(`nav-${page}`);
  if (link) link.classList.add('active');
}

let loadPageCount = 0;
async function loadPage(page) {
  loadPageCount++;
  const currentCount = loadPageCount;
  console.log(`[loadPage] #${currentCount} page="${page}" hash="${location.hash}"`);

  const entry = PAGES[page] || PAGES.dashboard;
  document.getElementById('header-title').textContent = entry.title;
  activateLink(page);
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="spinner"></div>';
  try {
    await entry.fn();
    console.log(`[loadPage] #${currentCount} page="${page}" resolved`);
  } catch (err) {
    console.error(err);
    main.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3>Error al cargar la página</h3>
        <p>${err.message}</p>
        <pre style="text-align:left; font-size:0.75rem; color:var(--text-muted); background:var(--bg-glass); padding:10px; border-radius:4px; max-width:100%; overflow:auto; margin-top:10px;">
Calling page: ${page} (#${currentCount})
Stack trace:
${err.stack}</pre>
      </div>`;
  }
}

// ── Shell bootstrap ───────────────────────────────────────────
function showApp(user) {
  document.getElementById('login-screen').classList.add('hidden');
  const shell = document.getElementById('app-shell');
  shell.classList.add('active');
  // Fill user info
  const initials = (user.nombreCompleto || user.username || '?')
    .split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
  document.getElementById('header-avatar').textContent = initials;
  document.getElementById('header-user-name').textContent = user.nombreCompleto || user.username;
  document.getElementById('header-user-role').textContent = user.rol || '';
}

function showLogin() {
  document.getElementById('app-shell').classList.remove('active');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.remove('visible');
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Modal close
  document.getElementById('modal-close-btn').addEventListener('click', () => Modal.close());
  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) Modal.close();
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    Auth.logout();
    showLogin();
  });

  // Unauthorized event from API
  window.addEventListener('wms:unauthorized', showLogin);

  // Login form
  const loginForm = document.getElementById('login-form');
  const loginBtn  = document.getElementById('login-btn');
  const loginErr  = document.getElementById('login-error');
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginBtn.classList.add('loading');
    loginBtn.textContent = '';
    loginErr.classList.remove('visible');
    try {
      const user = await Auth.login(
        document.getElementById('login-username').value.trim(),
        document.getElementById('login-password').value,
      );
      showApp(user);
      if (location.hash === '#/dashboard') {
        loadPage('dashboard');
      } else {
        navigate('dashboard');
      }
    } catch (err) {
      loginErr.textContent = err.message;
      loginErr.classList.add('visible');
    } finally {
      loginBtn.classList.remove('loading');
      loginBtn.textContent = 'Iniciar Sesión';
    }
  });

  // Sidebar navigation
  document.getElementById('sidebar-nav').addEventListener('click', e => {
    const link = e.target.closest('.sidebar__link');
    if (!link) return;
    e.preventDefault();
    const page = link.dataset.page;
    if (page) {
      if (location.hash === `#/${page}`) {
        loadPage(page);
      } else {
        navigate(page);
      }
    }
  });

  // Hash-based routing
  window.addEventListener('hashchange', () => {
    if (Auth.isLoggedIn()) loadPage(getCurrentPage());
  });

  // Bootstrap
  if (Auth.isLoggedIn()) {
    showApp(Auth.getUser());
    loadPage(getCurrentPage());
    // Badge for pending solicitudes
    API.get('/api/solicitudes?estado=Pendiente')
      .then(list => {
        if (list?.length > 0) {
          const badge = document.getElementById('badge-solicitudes');
          badge.textContent = list.length;
          badge.style.display = '';
        }
      }).catch(() => {});
  }
});
