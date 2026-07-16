/* ============================================================
   personal.js — Field personnel (obra workers) CRUD
   ============================================================ */

const PagePersonal = (() => {
  let allPersonal = [];

  function renderTable(list) {
    const tbody = document.getElementById('pers-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg><h3>Sin personal registrado</h3><p>Agrega el primer trabajador.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(p => {
      const initials = `${p.nombres[0]}${p.apellidos[0]}`.toUpperCase();
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--brand-primary-light),var(--brand-accent));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8125rem;color:white;flex-shrink:0">${initials}</div>
              <div>
                <div style="font-weight:600">${p.nombres} ${p.apellidos}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">DNI: ${p.dni}</div>
              </div>
            </div>
          </td>
          <td><span class="badge badge--info">${p.cargo}</span></td>
          <td>
            <button class="btn btn--ghost btn--sm" onclick="PagePersonal.openEdit(${p.idPersonal})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  function getFormHTML(p = {}) {
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="pe-nombres">Nombres</label>
          <input id="pe-nombres" class="form-input" type="text" value="${p.nombres || ''}" placeholder="Juan Alberto" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="pe-apellidos">Apellidos</label>
          <input id="pe-apellidos" class="form-input" type="text" value="${p.apellidos || ''}" placeholder="Pérez García" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="pe-dni">DNI</label>
          <input id="pe-dni" class="form-input" type="text" maxlength="8" value="${p.dni || ''}" placeholder="12345678" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="pe-cargo">Cargo</label>
          <input id="pe-cargo" class="form-input" type="text" value="${p.cargo || ''}" placeholder="Maestro de Obra" required />
        </div>
      </div>`;
  }

  function getFormData() {
    return {
      nombres:   document.getElementById('pe-nombres').value.trim(),
      apellidos: document.getElementById('pe-apellidos').value.trim(),
      dni:       document.getElementById('pe-dni').value.trim(),
      cargo:     document.getElementById('pe-cargo').value.trim(),
    };
  }

  async function openCreate() {
    Modal.open('👷 Nuevo Personal', getFormHTML(),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-save-pe">Guardar Personal</button>`);
    document.getElementById('btn-save-pe').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-pe');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.post('/api/personal', getFormData());
        Modal.close(); showToast('success', 'Personal registrado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Guardar Personal'; }
    });
  }

  async function openEdit(id) {
    const p = allPersonal.find(x => x.idPersonal === id);
    if (!p) return;
    Modal.open('✏️ Editar Personal', getFormHTML(p),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-update-pe">Actualizar</button>`);
    document.getElementById('btn-update-pe').addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-pe');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.put(`/api/personal/${id}`, { ...getFormData(), idPersonal: id });
        Modal.close(); showToast('success', 'Personal actualizado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Actualizar'; }
    });
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info"><h1>Personal de Obra</h1><p>Trabajadores de campo y residentes</p></div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PagePersonal.openCreate()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Personal
          </button>
        </div>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>Trabajador</th><th>Cargo</th><th>Acciones</th></tr></thead>
            <tbody id="pers-tbody"><tr><td colspan="3"><div class="spinner"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;

    try { allPersonal = await API.get('/api/personal'); }
    catch (e) { showToast('error', 'Error', e.message); }

    if (getCurrentPage() !== 'personal') return;

    renderTable(allPersonal);
  }

  return { render, openCreate, openEdit };
})();
