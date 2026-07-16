/* ============================================================
   usuarios.js — System user management (admin)
   ============================================================ */

const PageUsuarios = (() => {
  let allUsuarios = [];

  const roles = ['Gerente', 'Almacenero', 'Residente'];

  function renderTable(list) {
    const tbody = document.getElementById('usr-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h3>Sin usuarios</h3></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(u => {
      const initials = (u.nombreCompleto || u.username || '?').split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase();
      const rolCls = { Gerente: 'badge--warning', Almacenero: 'badge--info', Residente: 'badge--neutral' };
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--brand-primary-light),var(--brand-accent));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8125rem;color:white;flex-shrink:0">${initials}</div>
              <div>
                <div style="font-weight:600">${u.nombreCompleto}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">@${u.username}</div>
              </div>
            </div>
          </td>
          <td><span class="badge ${rolCls[u.rol] || 'badge--neutral'}">${u.rol}</span></td>
          <td>
            ${u.estado
              ? `<span><span class="status-dot status-dot--active"></span>Activo</span>`
              : `<span><span class="status-dot status-dot--inactive"></span>Inactivo</span>`
            }
          </td>
          <td>
            <div class="cell-actions">
              <button class="btn btn--${u.estado ? 'danger' : 'success'} btn--sm" onclick="PageUsuarios.toggleEstado(${u.idUsuario}, ${!u.estado})">
                ${u.estado ? 'Suspender' : 'Activar'}
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  async function toggleEstado(id, activo) {
    try {
      await API.patch(`/api/usuarios/${id}/estado?activo=${activo}`);
      showToast('success', activo ? 'Usuario activado' : 'Usuario suspendido');
      await render();
    } catch (e) { showToast('error', 'Error', e.message); }
  }

  async function openCreate() {
    Modal.open('👤 Nuevo Usuario del Sistema', `
      <div class="form-group">
        <label class="form-label" for="usr-nombre">Nombre Completo</label>
        <input id="usr-nombre" class="form-input" type="text" placeholder="Juan Pérez García" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="usr-username">Usuario</label>
          <input id="usr-username" class="form-input" type="text" placeholder="jperez" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="usr-rol">Rol</label>
          <select id="usr-rol" class="form-select">
            ${roles.map(r => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="usr-pass">Contraseña</label>
        <input id="usr-pass" class="form-input" type="password" placeholder="Mínimo 8 caracteres" required minlength="6" />
      </div>`,
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-save-usr">Crear Usuario</button>`);
    document.getElementById('btn-save-usr').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-usr');
      btn.disabled = true; btn.textContent = 'Creando…';
      try {
        await API.post('/api/usuarios', {
          nombreCompleto: document.getElementById('usr-nombre').value.trim(),
          username:       document.getElementById('usr-username').value.trim(),
          rol:            document.getElementById('usr-rol').value,
          password:       document.getElementById('usr-pass').value,
        });
        Modal.close(); showToast('success', 'Usuario creado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Crear Usuario'; }
    });
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info"><h1>Usuarios del Sistema</h1><p>Gestión de accesos y roles</p></div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PageUsuarios.openCreate()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Usuario
          </button>
        </div>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody id="usr-tbody"><tr><td colspan="4"><div class="spinner"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;

    try { allUsuarios = await API.get('/api/usuarios'); }
    catch (e) { showToast('error', 'Error', e.message); }

    if (getCurrentPage() !== 'usuarios') return;

    renderTable(allUsuarios);
  }

  return { render, openCreate, toggleEstado };
})();
