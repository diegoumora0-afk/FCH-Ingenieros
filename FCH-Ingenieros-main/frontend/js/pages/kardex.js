/* ============================================================
   kardex.js — Inventory ledger filtered by material
   ============================================================ */

const PageKardex = (() => {

  function renderTable(rows) {
    const tbody = document.getElementById('kardex-tbody');
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h3>Sin registros</h3><p>Selecciona un material para ver su historial.</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td style="color:var(--text-secondary);font-size:0.8125rem">${formatDate(r.fechaRegistro)}</td>
        <td>#${r.idMovimiento}</td>
        <td style="font-weight:700">${formatNum(r.saldoInicial)}</td>
        <td style="color:var(--color-success);font-weight:600">${r.ingreso > 0 ? '+' + formatNum(r.ingreso) : '<span style="color:var(--text-muted)">—</span>'}</td>
        <td style="color:var(--color-danger);font-weight:600">${r.salida > 0 ? '-' + formatNum(r.salida) : '<span style="color:var(--text-muted)">—</span>'}</td>
        <td style="font-weight:800;color:var(--brand-accent)">${formatNum(r.saldoFinal)}</td>
      </tr>`).join('');
  }

  async function render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info">
          <h1>Kardex de Inventario</h1>
          <p>Auditoría detallada de cada movimiento por material</p>
        </div>
      </div>
      <div class="glass-card" style="margin-bottom:var(--space-lg)">
        <div class="form-group" style="margin:0">
          <label class="form-label" for="kardex-mat-sel">Seleccionar Material</label>
          <select id="kardex-mat-sel" class="form-select">
            <option value="">— Selecciona un material para ver su historial —</option>
          </select>
        </div>
      </div>
      <div id="kardex-summary" style="display:none" class="kpi-grid" style="margin-bottom:var(--space-lg)">
        <div class="kpi-card">
          <div class="kpi-card__header"><span class="kpi-card__label">Total Entradas</span><div class="kpi-card__icon kpi-card__icon--green"><svg viewBox="0 0 24 24"><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div></div>
          <div class="kpi-card__value" id="kpi-k-entrada">0</div>
          <div class="kpi-card__sub">unidades ingresadas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header"><span class="kpi-card__label">Total Salidas</span><div class="kpi-card__icon kpi-card__icon--red"><svg viewBox="0 0 24 24"><polyline points="8 7 3 12 8 17"/><line x1="3" y1="12" x2="15" y2="12"/></svg></div></div>
          <div class="kpi-card__value" id="kpi-k-salida">0</div>
          <div class="kpi-card__sub">unidades despachadas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header"><span class="kpi-card__label">Saldo Final</span><div class="kpi-card__icon kpi-card__icon--amber"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></div></div>
          <div class="kpi-card__value" id="kpi-k-saldo">0</div>
          <div class="kpi-card__sub">en almacén</div>
        </div>
      </div>
      <div class="glass-card" style="padding:0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Fecha</th><th>Movimiento</th><th>Saldo Inicial</th><th>Ingreso</th><th>Salida</th><th>Saldo Final</th></tr>
            </thead>
            <tbody id="kardex-tbody">
              <tr><td colspan="6"><div class="empty-state"><h3>Elige un material</h3><p>Selecciona un material arriba para ver su historial completo de Kardex.</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>`;

    let mats = [];
    try {
      mats = await API.get('/api/materiales');
    } catch (e) { showToast('error', 'Error', e.message); return; }

    if (getCurrentPage() !== 'kardex') return;

    const sel = document.getElementById('kardex-mat-sel');
    sel.innerHTML = `<option value="">— Selecciona un material —</option>` +
      mats.map(m => `<option value="${m.idMaterial}">${m.nombre} (${m.codigoSku})</option>`).join('');

    sel.addEventListener('change', async () => {
      const id = sel.value;
      if (!id) { renderTable([]); document.getElementById('kardex-summary').style.display = 'none'; return; }
      document.getElementById('kardex-tbody').innerHTML = `<tr><td colspan="6"><div class="spinner"></div></td></tr>`;
      try {
        const rows = await API.get(`/api/kardex/material/${id}`);
        rows.sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));
        renderTable(rows);

        const totalIn  = rows.reduce((s, r) => s + parseFloat(r.ingreso  || 0), 0);
        const totalOut = rows.reduce((s, r) => s + parseFloat(r.salida   || 0), 0);
        const saldo    = rows.length ? parseFloat(rows[rows.length - 1].saldoFinal) : 0;
        document.getElementById('kardex-summary').style.display = 'grid';
        document.getElementById('kpi-k-entrada').textContent = formatNum(totalIn);
        document.getElementById('kpi-k-salida').textContent  = formatNum(totalOut);
        document.getElementById('kpi-k-saldo').textContent   = formatNum(saldo);
      } catch (e) { showToast('error', 'Error al cargar Kardex', e.message); }
    });
  }

  return { render };
})();
