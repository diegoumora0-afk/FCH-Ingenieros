/* ============================================================
   proyectos.js — CRUD for construction projects
   ============================================================ */

const PageProyectos = (() => {
  let allProyectos = [];

  const estadoMap = {
    EN_PROGRESO: { label: 'En Progreso', cls: 'badge--info' },
    FINALIZADO:  { label: 'Finalizado',  cls: 'badge--success' },
    PAUSADO:     { label: 'Pausado',     cls: 'badge--warning' },
    CANCELADO:   { label: 'Cancelado',   cls: 'badge--danger' },
  };

  function estadoBadge(estado) {
    const e = estadoMap[estado] || { label: estado, cls: 'badge--neutral' };
    return `<span class="badge ${e.cls}">${e.label}</span>`;
  }

  function renderCards(list) {
    const cont = document.getElementById('proyectos-grid');
    if (!cont) return;
    if (!list.length) {
      cont.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg><h3>Sin proyectos</h3><p>Registra el primer proyecto de obra.</p></div>`;
      return;
    }
    cont.innerHTML = list.map(p => {
      const e = estadoMap[p.estado] || { label: p.estado, cls: 'badge--neutral' };
      return `
        <div class="kpi-card slide-up" style="cursor:default">
          <div class="kpi-card__header">
            <span class="badge ${e.cls}">${e.label}</span>
            <button class="btn btn--ghost btn--sm btn--icon-only" onclick="PageProyectos.openEdit(${p.idProyecto})" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:4px">${p.nombreProyecto}</div>
          <div style="font-size:0.8125rem;color:var(--text-muted);display:flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${p.ubicacion}
          </div>
        </div>`;
    }).join('');
  }

  function getFormHTML(p = {}) {
    return `
      <div class="form-group">
        <label class="form-label" for="proy-nombre">Nombre del Proyecto</label>
        <input id="proy-nombre" class="form-input" type="text" value="${p.nombreProyecto || ''}" placeholder="Ej: Edificio Los Pinos" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="proy-ubic">Ubicación</label>
        <input id="proy-ubic" class="form-input" type="text" value="${p.ubicacion || ''}" placeholder="Ej: Av. Las Palmas 123, Lima" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="proy-estado">Estado</label>
        <select id="proy-estado" class="form-select">
          ${Object.entries(estadoMap).map(([v, { label }]) =>
            `<option value="${v}" ${p.estado === v ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </div>`;
  }

  function getFormData() {
    return {
      nombreProyecto: document.getElementById('proy-nombre').value.trim(),
      ubicacion:      document.getElementById('proy-ubic').value.trim(),
      estado:         document.getElementById('proy-estado').value,
    };
  }

  async function openCreate() {
    Modal.open('🏗 Nuevo Proyecto', getFormHTML(),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-save-proy">Guardar Proyecto</button>`);
    document.getElementById('btn-save-proy').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-proy');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.post('/api/proyectos', getFormData());
        Modal.close(); showToast('success', 'Proyecto creado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Guardar Proyecto'; }
    });
  }

  async function openEdit(id) {
    const p = allProyectos.find(x => x.idProyecto === id);
    if (!p) return;
    Modal.open('✏️ Editar Proyecto', getFormHTML(p),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-update-proy">Actualizar</button>`);
    document.getElementById('btn-update-proy').addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-proy');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.put(`/api/proyectos/${id}`, { ...getFormData(), idProyecto: id });
        Modal.close(); showToast('success', 'Proyecto actualizado'); await render();
      } catch (e) { showToast('error', 'Error', e.message); btn.disabled = false; btn.textContent = 'Actualizar'; }
    });
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info"><h1>Proyectos</h1><p>Obras y proyectos en gestión</p></div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PageProyectos.openCreate()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Proyecto
          </button>
        </div>
      </div>
      <div class="kpi-grid" id="proyectos-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
        <div class="spinner" style="grid-column:1/-1"></div>
      </div>`;

    try { allProyectos = await API.get('/api/proyectos'); }
    catch (e) { showToast('error', 'Error', e.message); }

    if (getCurrentPage() !== 'proyectos') return;

    renderCards(allProyectos);
  }

  return { render, openCreate, openEdit };
})();
