/* ============================================================
   materiales.js — Full CRUD for materials with live search
   ============================================================ */

const PageMateriales = (() => {
  let allMateriales = [];

  function stockBadge(m) {
    if (m.stockActual <= 0) return `<span class="badge badge--danger">Sin stock</span>`;
    if (m.stockActual <= m.stockMinimo) return `<span class="badge badge--warning">Stock bajo</span>`;
    return `<span class="badge badge--success">OK</span>`;
  }

  function renderTable(list) {
    const tbody = document.getElementById('materiales-tbody');
    if (!tbody) return;
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg><h3>Sin materiales</h3><p>Agrega el primer material al catálogo.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(m => `
      <tr>
        <td><span class="badge badge--neutral">${m.codigoSku}</span></td>
        <td style="font-weight:500">${m.nombre}</td>
        <td>${m.categoria}</td>
        <td>${m.unidadMedida}</td>
        <td style="font-weight:700;color:${m.stockActual <= m.stockMinimo ? 'var(--color-warning)' : 'var(--text-primary)'}">${formatNum(m.stockActual)}</td>
        <td style="color:var(--text-muted)">${formatNum(m.stockMinimo)}</td>
        <td>${stockBadge(m)}</td>
        <td>
          <div class="cell-actions">
            <button class="btn btn--ghost btn--sm" onclick="PageMateriales.openEdit(${m.idMaterial})" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn--ghost btn--sm" style="color:var(--color-danger)" onclick="PageMateriales.eliminar(${m.idMaterial})" title="Eliminar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
  }

  function getFormHTML(m = {}) {
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="m-sku">Código SKU</label>
          <input id="m-sku" class="form-input" type="text" value="${m.codigoSku || ''}" placeholder="Ej: CEM-001" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="m-categoria">Categoría</label>
          <input id="m-categoria" class="form-input" type="text" value="${m.categoria || ''}" placeholder="Ej: Construcción" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="m-nombre">Nombre del Material</label>
        <input id="m-nombre" class="form-input" type="text" value="${m.nombre || ''}" placeholder="Ej: Cemento Sol 42.5kg" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="m-unidad">Unidad de Medida</label>
          <input id="m-unidad" class="form-input" type="text" value="${m.unidadMedida || ''}" placeholder="Bolsa, m, kg…" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="m-actual">Stock Actual</label>
          <input id="m-actual" class="form-input" type="number" min="0" step="0.01" value="${m.stockActual ?? 0}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="m-minimo">Stock Mínimo</label>
          <input id="m-minimo" class="form-input" type="number" min="0" step="0.01" value="${m.stockMinimo ?? 0}" required />
        </div>
      </div>`;
  }

  function getFormData() {
    return {
      codigoSku:    document.getElementById('m-sku').value.trim(),
      nombre:       document.getElementById('m-nombre').value.trim(),
      categoria:    document.getElementById('m-categoria').value.trim(),
      unidadMedida: document.getElementById('m-unidad').value.trim(),
      stockActual:  parseFloat(document.getElementById('m-actual').value) || 0,
      stockMinimo:  parseFloat(document.getElementById('m-minimo').value) || 0,
    };
  }

  async function openCreate() {
    Modal.open(
      '➕ Nuevo Material',
      getFormHTML(),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-save-mat">Guardar Material</button>`
    );
    document.getElementById('btn-save-mat').addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-mat');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.post('/api/materiales', getFormData());
        Modal.close();
        showToast('success', 'Material creado', 'El material fue agregado al catálogo.');
        await render();
      } catch (e) {
        showToast('error', 'Error', e.message);
        btn.disabled = false; btn.textContent = 'Guardar Material';
      }
    });
  }

  async function openEdit(id) {
    const m = allMateriales.find(x => x.idMaterial === id);
    if (!m) return;
    Modal.open(
      '✏️ Editar Material',
      getFormHTML(m),
      `<button class="btn btn--secondary" onclick="Modal.close()">Cancelar</button>
       <button class="btn btn--primary" id="btn-update-mat">Actualizar</button>`
    );
    document.getElementById('btn-update-mat').addEventListener('click', async () => {
      const btn = document.getElementById('btn-update-mat');
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        await API.put(`/api/materiales/${id}`, { ...getFormData(), idMaterial: id });
        Modal.close();
        showToast('success', 'Material actualizado');
        await render();
      } catch (e) {
        showToast('error', 'Error', e.message);
        btn.disabled = false; btn.textContent = 'Actualizar';
      }
    });
  }

  async function eliminar(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.')) return;
    try {
      await API.del(`/api/materiales/${id}`);
      showToast('success', 'Material eliminado');
      await render();
    } catch (e) {
      showToast('error', 'Error al eliminar', e.message);
    }
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info">
          <h1>Materiales</h1>
          <p>Catálogo de materiales, herramientas y EPPs</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn--primary" onclick="PageMateriales.openCreate()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Material
          </button>
        </div>
      </div>
      <div class="filters-bar">
        <div class="search-bar" style="max-width:320px;flex:1">
          <div class="search-bar__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <input id="search-mat" class="form-input" type="search" placeholder="Buscar por nombre o SKU…" />
        </div>
        <button class="filter-chip active" data-filter="all">Todos</button>
        <button class="filter-chip" data-filter="alerta">⚠ Bajo mínimo</button>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU</th><th>Nombre</th><th>Categoría</th>
                <th>Unidad</th><th>Stock Actual</th><th>Stock Mínimo</th>
                <th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody id="materiales-tbody"><tr><td colspan="8"><div class="spinner"></div></td></tr></tbody>
          </table>
        </div>
      </div>`;

    try {
      allMateriales = await API.get('/api/materiales');
    } catch (e) {
      showToast('error', 'Error al cargar materiales', e.message);
      allMateriales = [];
    }

    if (getCurrentPage() !== 'materiales') return;

    renderTable(allMateriales);

    // Search
    let searchTimeout;
    document.getElementById('search-mat').addEventListener('input', e => {
      clearTimeout(searchTimeout);
      const q = e.target.value.trim().toLowerCase();
      searchTimeout = setTimeout(() => {
        const filtered = q ? allMateriales.filter(m =>
          m.nombre.toLowerCase().includes(q) || m.codigoSku.toLowerCase().includes(q)
        ) : allMateriales;
        renderTable(filtered);
      }, 200);
    });

    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.filter;
        renderTable(f === 'alerta'
          ? allMateriales.filter(m => m.stockActual <= m.stockMinimo)
          : allMateriales);
      });
    });
  }

  return { render, openCreate, openEdit, eliminar };
})();
