/* ============================================================
   movimientos.js — Entry/Exit registration + history table
   ============================================================ */

const PageMovimientos = (() => {
  let materiales = [], personal = [], proyectos = [], proveedores = [];
  let movItems = []; // detalles del formulario actual

  function renderTable(list) {
    const tbody = document.getElementById('movs-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h3>Sin movimientos</h3></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(m => `
      <tr>
        <td><span class="badge ${m.tipoMovimiento === 'ENTRADA' ? 'badge--success' : 'badge--danger'}">${m.tipoMovimiento}</span></td>
        <td style="color:var(--text-secondary);font-size:0.8125rem">${formatDate(m.fechaHora)}</td>
        <td>${m.nroGuia || '<span style="color:var(--text-muted)">—</span>'}</td>
        <td>${m.observaciones || '<span style="color:var(--text-muted)">—</span>'}</td>
        <td>#${m.idMovimiento}</td>
      </tr>`).join('');
  }

  function addDetail() {
    const idx = movItems.length;
    movItems.push({ idMaterial: '', cantidad: 1 });
    const container = document.getElementById('detalles-container');
    const tipo = document.getElementById('mov-tipo').value;
    const div = document.createElement('div');
    div.className = 'detail-item';
    div.id = `det-${idx}`;
    div.innerHTML = `
      <select class="form-select" id="det-mat-${idx}">
        <option value="">— Seleccionar material —</option>
        ${materiales.map(m => `<option value="${m.idMaterial}">${m.nombre} (Stock: ${formatNum(m.stockActual)})</option>`).join('')}
      </select>
      <input class="form-input" id="det-qty-${idx}" type="number" min="0.01" step="0.01" value="1" style="width:100px" placeholder="Cant." />
      <button class="detail-item__remove" onclick="PageMovimientos.removeDetail(${idx})" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    container.appendChild(div);
    document.getElementById(`det-mat-${idx}`).addEventListener('change', e => { movItems[idx].idMaterial = parseInt(e.target.value); });
    document.getElementById(`det-qty-${idx}`).addEventListener('change', e => { movItems[idx].cantidad = parseFloat(e.target.value); });
  }

  function removeDetail(idx) {
    movItems[idx] = null;
    document.getElementById(`det-${idx}`)?.remove();
  }

  function getMovFormHTML(tipo) {
    const isEntrada = tipo === 'ENTRADA';
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="mov-tipo">Tipo</label>
          <select id="mov-tipo" class="form-select" onchange="PageMovimientos.switchTipo()">
            <option value="ENTRADA" ${isEntrada ? 'selected':''}>📥 ENTRADA</option>
            <option value="SALIDA"  ${!isEntrada ? 'selected':''}>📤 SALIDA</option>
          </select>
        </div>
        <div class="form-group" id="field-guia" style="${isEntrada ? '' : 'display:none'}">
          <label class="form-label" for="mov-guia">Nro. Guía</label>
          <input id="mov-guia" class="form-input" type="text" placeholder="GR-001-00001" />
        </div>
      </div>
      <div id="field-proveedor" style="${isEntrada ? '' : 'display:none'}">
        <div class="form-group">
          <label class="form-label" for="mov-proveedor">Proveedor</label>
          <select id="mov-proveedor" class="form-select">
            <option value="">— Sin proveedor —</option>
            ${proveedores.map(p => `<option value="${p.idProveedor}">${p.razonSocial}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="field-personal" style="${isEntrada ? 'display:none' : ''}">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="mov-personal">Personal</label>
            <select id="mov-personal" class="form-select">
              <option value="">— Sin personal —</option>
              ${personal.map(p => `<option value="${p.idPersonal}">${p.nombres} ${p.apellidos}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="mov-proyecto">Proyecto</label>
            <select id="mov-proyecto" class="form-select">
              <option value="">— Sin proyecto —</option>
              ${proyectos.map(p => `<option value="${p.idProyecto}">${p.nombreProyecto}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="mov-obs">Observaciones</label>
        <textarea id="mov-obs" class="form-input" placeholder="Notas opcionales…" rows="2"></textarea>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm)">
        <div class="section-title" style="margin:0">Materiales</div>
        <button class="btn btn--secondary btn--sm" type="button" onclick="PageMovimientos.addDetail()">+ Agregar material</button>
      </div>
      <div class="detail-items" id="detalles-container"></div>`;
  }

  function switchTipo() {
    const tipo = document.getElementById('mov-tipo').value;
    const isE = tipo === 'ENTRADA';
    document.getElementById('field-guia').style.display      = isE ? '' : 'none';
    document.getElementById('field-proveedor').style.display = isE ? '' : 'none';
    document.getElementById('field-personal').style.display  = isE ? 'none' : '';
  }

  async function openNew() {
    movItems = [];
    Modal.open('📦 Registrar Movimiento', '<div class="spinner"></div>', '');
    document.getElementById('modal').classList.add('modal--lg');
    Modal.setBody(getMovFormHTML('ENTRADA'));
    Modal.setFooter(`
      <button class="btn btn--secondary" onclick="Modal.close();document.getElementById('modal').classList.remove('modal--lg')">Cancelar</button>
      <button class="btn btn--primary" id="btn-save-mov">Registrar</button>`);
    addDetail();

    document.getElementById('btn-save-mov').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-mov');
      const tipo = document.getElementById('mov-tipo').value;
      const detalles = movItems.filter(Boolean).map(d => ({ idMaterial: parseInt(d.idMaterial), cantidad: parseFloat(d.cantidad) }));
      if (!detalles.length || detalles.some(d => !d.idMaterial || !d.cantidad)) {
        showToast('warning', 'Completa los materiales', 'Agrega al menos un material con cantidad.');
        return;
      }
      const payload = {
        tipoMovimiento: tipo,
        observaciones: document.getElementById('mov-obs').value || '',
        detalles,
      };
      if (tipo === 'ENTRADA') {
        payload.nroGuia = document.getElementById('mov-guia').value || null;
        const prov = document.getElementById('mov-proveedor').value;
        if (prov) payload.idProveedor = parseInt(prov);
      } else {
        const pers = document.getElementById('mov-personal').value;
        const proy = document.getElementById('mov-proyecto').value;
        if (pers) payload.idPersonal = parseInt(pers);
        if (proy) payload.idProyecto = parseInt(proy);
      }
      btn.disabled = true; btn.textContent = 'Registrando…';
      try {
        const endpoint = tipo === 'ENTRADA' ? '/api/movimientos/entrada' : '/api/movimientos/salida';
        await API.post(endpoint, payload);
        Modal.close();
        document.getElementById('modal').classList.remove('modal--lg');
        showToast('success', 'Movimiento registrado', `${tipo} registrada correctamente.`);
        await render();
      } catch (e) {
        showToast('error', 'Error al registrar', e.message);
        btn.disabled = false; btn.textContent = 'Registrar';
      }
    });
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info">
          <h1>Movimientos</h1>
          <p>Historial de entradas y salidas del almacén</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PageMovimientos.openNew()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Movimiento
          </button>
        </div>
      </div>
      <div class="filters-bar">
        <button class="filter-chip active" data-fmov="all">Todos</button>
        <button class="filter-chip" data-fmov="ENTRADA">📥 Entradas</button>
        <button class="filter-chip" data-fmov="SALIDA">📤 Salidas</button>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Tipo</th><th>Fecha</th><th>Nro. Guía</th><th>Observaciones</th><th>ID</th></tr>
            </thead>
            <tbody id="movs-tbody"><tr><td colspan="5"><div class="spinner"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;

    let movs = [];
    try {
      [movs, materiales, personal, proyectos, proveedores] = await Promise.all([
        API.get('/api/movimientos'),
        API.get('/api/materiales'),
        API.get('/api/personal'),
        API.get('/api/proyectos'),
        API.get('/api/proveedores'),
      ]);
    } catch (e) { showToast('error', 'Error', e.message); }

    if (getCurrentPage() !== 'movimientos') return;

    movs = movs.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
    renderTable(movs);

    document.querySelectorAll('[data-fmov]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-fmov]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.fmov;
        renderTable(f === 'all' ? movs : movs.filter(m => m.tipoMovimiento === f));
      });
    });
  }

  return { render, openNew, addDetail, removeDetail, switchTipo };
})();
