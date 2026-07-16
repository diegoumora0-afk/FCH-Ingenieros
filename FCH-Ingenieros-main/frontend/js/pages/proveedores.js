/* ============================================================
   proveedores.js — Supplier CRUD
   ============================================================ */

const PageProveedores = (() => {
  let allProveedores = [];

  function renderTable(list) {
    const tbody = document.getElementById('prov-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg><h3>Sin proveedores</h3><p>Registra el primer proveedor.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(p => `
      <tr>
        <td><span class="badge badge--neutral">${p.ruc}</span></td>
        <td style="font-weight:500">${p.razonSocial}</td>
        <td style="color:var(--text-secondary)">${p.contacto || '—'}</td>
        <td>
          <button class="btn btn--ghost btn--sm" onclick="PageProveedores.openEdit(${p.idProveedor})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
        </td>
      </tr>`).join('');
  }

  function getFormHTML(p = {}) {
    return `
      <div class="form-group">
        <label class="form-label" for="pv-ruc">RUC</label>
        <input id="pv-ruc" class="form-input" type="text" maxlength="11" value="${p.ruc || ''}" placeholder="20123456789" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="pv-razon">Razón Social</label>
        <input id="pv-razon" class="form-input" type="text" value="${p.razonSocial || ''}" placeholder="Empresa S.A.C." required />
      </div>
      <div class="form-group">
        <label class="form-label" for="pv-contacto">Contacto</label>
        <input id="pv-contacto" class="form-input" type="text" value="${p.contacto || ''}" placeholder="Teléfono o email" />
      </div>`;
  }

  function getFormData() {
    return {
      ruc:        document.getElementById('pv-ruc').value.trim(),
      razonSocial:document.getElementById('pv-razon').value.trim(),
      contacto:   document.getElementById('pv-contacto').value.trim() || null,
    };
  }

  async function openCreate() {
    Modal.open('🚚 Nuevo Proveedor', getFormHTML(),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-save-pv">Guardar Proveedor</button>`);
    document.getElementById('btn-save-pv').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-pv');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.post('/api/proveedores', getFormData());
        Modal.close(); showToast('success', 'Proveedor creado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Guardar Proveedor'; }
    });
  }

  async function openEdit(id) {
    const p = allProveedores.find(x => x.idProveedor === id);
    if (!p) return;
    Modal.open('✏️ Editar Proveedor', getFormHTML(p),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-update-pv">Actualizar</button>`);
    document.getElementById('btn-update-pv').addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-pv');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.put(`/api/proveedores/${id}`, { ...getFormData(), idProveedor: id });
        Modal.close(); showToast('success', 'Proveedor actualizado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Actualizar'; }
    });
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info"><h1>Proveedores</h1><p>Empresas que surten materiales al almacén</p></div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PageProveedores.openCreate()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Proveedor
          </button>
        </div>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>RUC</th><th>Razón Social</th><th>Contacto</th><th>Acciones</th></tr></thead>
            <tbody id="prov-tbody"><tr><td colspan="4"><div class="spinner"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;

    try { allProveedores = await API.get('/api/proveedores'); }
    catch (e) { showToast('error', 'Error', e.message); }

    if (getCurrentPage() !== 'proveedores') return;

    renderTable(allProveedores);
  }

  return { render, openCreate, openEdit };
})();
