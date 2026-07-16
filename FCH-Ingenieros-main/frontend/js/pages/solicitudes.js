/* ============================================================
   solicitudes.js — Material requests with approve/reject actions
   ============================================================ */

const PageSolicitudes = (() => {
  let allSolicitudes = [], personalList = [], materiales = [];

  function estadoBadge(estado) {
    const map = {
      Pendiente: 'badge--warning',
      Aprobada:  'badge--success',
      Rechazada: 'badge--danger',
    };
    return `<span class="badge ${map[estado] || 'badge--neutral'}">${estado}</span>`;
  }

  function renderTable(list) {
    const tbody = document.getElementById('sol-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><h3>Sin solicitudes</h3><p>No hay solicitudes en este estado.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(s => {
      const pers = personalList.find(p => p.idPersonal === s.idPersonal);
      const nombre = pers ? `${pers.nombres} ${pers.apellidos}` : `ID ${s.idPersonal}`;
      const isPending = s.estadoSolicitud === 'Pendiente';
      return `
        <tr>
          <td style="font-weight:600">#${s.idSolicitud}</td>
          <td style="color:var(--text-secondary);font-size:0.8125rem">${formatDate(s.fechaSolicitud)}</td>
          <td style="font-weight:500">${nombre}</td>
          <td style="color:var(--text-muted)">${s.sectorObra || '—'}</td>
          <td>${estadoBadge(s.estadoSolicitud)}</td>
          <td>
            <div class="cell-actions">
              ${isPending ? `
                <button class="btn btn--success btn--sm" onclick="PageSolicitudes.aprobar(${s.idSolicitud})" title="Aprobar">✓ Aprobar</button>
                <button class="btn btn--danger btn--sm" onclick="PageSolicitudes.rechazar(${s.idSolicitud})" title="Rechazar">✕ Rechazar</button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  async function aprobar(id) {
    try {
      await API.put(`/api/solicitudes/${id}/aprobar`);
      showToast('success', 'Solicitud aprobada', `La solicitud #${id} fue aprobada.`);
      await render();
    } catch (e) { showToast('error', 'Error', e.message); }
  }

  async function rechazar(id) {
    try {
      await API.put(`/api/solicitudes/${id}/rechazar`);
      showToast('warning', 'Solicitud rechazada', `La solicitud #${id} fue rechazada.`);
      await render();
    } catch (e) { showToast('error', 'Error', e.message); }
  }

  async function openNew() {
    Modal.open(
      '📋 Nueva Solicitud',
      `<div class="form-group">
        <label class="form-label" for="sol-personal">Personal Solicitante</label>
        <select id="sol-personal" class="form-select" required>
          <option value="">— Seleccionar personal —</option>
          ${personalList.map(p => `<option value="${p.idPersonal}">${p.nombres} ${p.apellidos} (${p.cargo})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="sol-sector">Sector de Obra</label>
        <input id="sol-sector" class="form-input" type="text" placeholder="Ej: Sector A - Manzana 12" />
      </div>`,
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-save-sol">Crear Solicitud</button>`
    );
    document.getElementById('btn-save-sol').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-sol');
      const idPersonal = parseInt(document.getElementById('sol-personal').value);
      if (!idPersonal) { showToast('warning', 'Selecciona el personal'); return; }
      btn.disabled = true; btn.textContent = 'Creando…';
      try {
        await API.post('/api/solicitudes', {
          idPersonal,
          sectorObra: document.getElementById('sol-sector').value.trim() || null,
        });
        Modal.close();
        showToast('success', 'Solicitud creada', 'Se creó en estado Pendiente.');
        await render();
      } catch (e) {
        showToast('error', 'Error', e.message);
        btn.disabled = false; btn.textContent = 'Crear Solicitud';
      }
    });
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info">
          <h1>Solicitudes de Material</h1>
          <p>Pedidos de materiales del personal de obra</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PageSolicitudes.openNew()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva Solicitud
          </button>
        </div>
      </div>
      <div class="filters-bar">
        <button class="filter-chip active" data-fsol="">Todas</button>
        <button class="filter-chip" data-fsol="Pendiente">⏳ Pendientes</button>
        <button class="filter-chip" data-fsol="Aprobada">✅ Aprobadas</button>
        <button class="filter-chip" data-fsol="Rechazada">❌ Rechazadas</button>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>#</th><th>Fecha</th><th>Personal</th><th>Sector</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody id="sol-tbody"><tr><td colspan="6"><div class="spinner"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;

    try {
      [allSolicitudes, personalList] = await Promise.all([
        API.get('/api/solicitudes'),
        API.get('/api/personal'),
      ]);
    } catch (e) { showToast('error', 'Error', e.message); }

    if (getCurrentPage() !== 'solicitudes') return;

    allSolicitudes = allSolicitudes.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
    renderTable(allSolicitudes);

    document.querySelectorAll('[data-fsol]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-fsol]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.fsol;
        renderTable(f ? allSolicitudes.filter(s => s.estadoSolicitud === f) : allSolicitudes);
      });
    });
  }

  return { render, openNew, aprobar, rechazar };
})();
