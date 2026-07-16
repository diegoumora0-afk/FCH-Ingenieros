/* ============================================================
   dashboard.js — KPI cards + stock alerts + recent movements
   ============================================================ */

const PageDashboard = (() => {
  let categoryChartInstance = null;
  let alertsChartInstance = null;

  async function render() {
    const main = document.getElementById('main-content');

    let report = {}, alertas = [], movimientos = [];
    try {
      [report, alertas, movimientos] = await Promise.all([
        API.get('/api/reportes/inventario-general'),
        API.get('/api/materiales/stock-minimo'),
        API.get('/api/movimientos'),
      ]);
    } catch (err) {
      main.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>Error al cargar datos</h3><p>${err.message}</p></div>`;
      return;
    }

    if (getCurrentPage() !== 'dashboard') return;

    const totalMateriales = report.totalMateriales ?? 0;
    const totalStock = report.inventario ? report.inventario.reduce((sum, m) => sum + parseFloat(m.stockActual || 0), 0) : 0;
    const bajoMin        = alertas.length;
    const totalMovs      = movimientos.length;
    const recentMovs     = [...movimientos].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)).slice(0, 8);

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header__info">
          <h1>Dashboard</h1>
          <p>Resumen general del almacén — ${new Date().toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-card__header">
            <span class="kpi-card__label">Ítems en Inventario</span>
            <div class="kpi-card__icon kpi-card__icon--blue">
              <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            </div>
          </div>
          <div class="kpi-card__value" id="kpi-items">0</div>
          <div class="kpi-card__sub">materiales registrados</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card__header">
            <span class="kpi-card__label">Stock Físico Total</span>
            <div class="kpi-card__icon kpi-card__icon--green">
              <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
          </div>
          <div class="kpi-card__value" id="kpi-valor">0</div>
          <div class="kpi-card__sub">unidades en almacén</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card__header">
            <span class="kpi-card__label">Alertas Stock</span>
            <div class="kpi-card__icon kpi-card__icon--red">
              <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div class="kpi-card__value" id="kpi-alertas">0</div>
          <div class="kpi-card__sub">bajo stock mínimo</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-card__header">
            <span class="kpi-card__label">Movimientos</span>
            <div class="kpi-card__icon kpi-card__icon--amber">
              <svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
            </div>
          </div>
          <div class="kpi-card__value" id="kpi-movs">0</div>
          <div class="kpi-card__sub">transacciones totales</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="content-grid" style="margin-top: var(--space-lg); margin-bottom: var(--space-lg); grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
        <!-- Gráfico de Categorías -->
        <div class="glass-card">
          <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="margin-right:8px; vertical-align:middle;"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>
            Categorías de Materiales
          </div>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="chart-categorias"></canvas>
          </div>
        </div>

        <!-- Gráfico de Alertas Críticas -->
        <div class="glass-card">
          <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="margin-right:8px; vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Materiales Críticos (Stock vs Mínimo)
          </div>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="chart-alertas"></canvas>
          </div>
        </div>
      </div>

      <!-- Content grid -->
      <div class="content-grid">
        <!-- Alertas de stock -->
        <div class="glass-card">
          <div class="section-title">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
            Alertas de Stock Mínimo
          </div>
          <div id="alertas-list">
            ${bajoMin === 0
              ? `<div class="empty-state" style="padding:var(--space-lg)">
                  <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <h3>¡Sin alertas!</h3><p>Todos los materiales tienen stock suficiente.</p>
                </div>`
              : alertas.slice(0, 8).map(m => {
                  const pct = m.stockMinimo > 0 ? Math.min((m.stockActual / m.stockMinimo) * 100, 100) : 0;
                  const cls = pct <= 0 ? 'critical' : pct < 50 ? 'warning' : 'ok';
                  return `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-glass)">
                    <div>
                      <div style="font-weight:600;font-size:0.875rem">${m.nombre}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted)">${m.codigoSku} • ${m.unidadMedida}</div>
                    </div>
                    <div style="text-align:right">
                      <div style="font-weight:700;font-size:0.875rem;color:var(--color-danger)">${formatNum(m.stockActual,2)}</div>
                      <div style="font-size:0.7rem;color:var(--text-muted)">mín: ${formatNum(m.stockMinimo,2)}</div>
                    </div>
                  </div>`;
                }).join('')
            }
          </div>
        </div>

        <!-- Últimos movimientos -->
        <div class="glass-card">
          <div class="section-title">
            <svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
            Últimos Movimientos
          </div>
          ${recentMovs.length === 0
            ? `<div class="empty-state" style="padding:var(--space-lg)"><h3>Sin movimientos</h3><p>Aún no se han registrado transacciones.</p></div>`
            : recentMovs.map(m => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-glass)">
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="badge ${m.tipoMovimiento === 'ENTRADA' ? 'badge--success' : 'badge--danger'}">${m.tipoMovimiento}</span>
                  <div>
                    <div style="font-size:0.8125rem;color:var(--text-secondary)">${formatDate(m.fechaHora)}</div>
                    ${m.nroGuia ? `<div style="font-size:0.75rem;color:var(--text-muted)">Guía: ${m.nroGuia}</div>` : ''}
                  </div>
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted)">#${m.idMovimiento}</span>
              </div>`).join('')
          }
        </div>
      </div>
    `;

    // Animate counters
    animateCounter(document.getElementById('kpi-items'), totalMateriales);
    animateCounter(document.getElementById('kpi-alertas'), bajoMin);
    animateCounter(document.getElementById('kpi-movs'), totalMovs);
    animateCounter(document.getElementById('kpi-valor'), totalStock);

    // Render interactive charts
    renderCharts(report.inventario || [], alertas);
  }

  function renderCharts(mats, alerts) {
    // 1. Category Chart (Doughnut)
    const categoriesMap = {};
    mats.forEach(m => {
      if (m.categoria) {
        categoriesMap[m.categoria] = (categoriesMap[m.categoria] || 0) + 1;
      }
    });

    const catLabels = Object.keys(categoriesMap);
    const catData = Object.values(categoriesMap);

    const ctxCat = document.getElementById('chart-categorias');
    if (ctxCat && catLabels.length > 0) {
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }
      categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
            ],
            borderColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#94a3b8',
                font: { size: 11, family: 'Outfit, system-ui' },
                boxWidth: 12
              }
            }
          }
        }
      });
    }

    // 2. Critical Alerts Chart (Horizontal Bar Chart)
    const criticalMats = [...alerts]
      .sort((a, b) => (a.stockActual - a.stockMinimo) - (b.stockActual - b.stockMinimo))
      .slice(0, 5);

    const alertLabels = criticalMats.map(m => m.nombre);
    const currentStock = criticalMats.map(m => m.stockActual);
    const minStock = criticalMats.map(m => m.stockMinimo);

    const ctxAlert = document.getElementById('chart-alertas');
    if (ctxAlert && alertLabels.length > 0) {
      if (alertsChartInstance) {
        alertsChartInstance.destroy();
      }
      alertsChartInstance = new Chart(ctxAlert, {
        type: 'bar',
        data: {
          labels: alertLabels,
          datasets: [
            {
              label: 'Stock Actual',
              data: currentStock,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            },
            {
              label: 'Mínimo Requerido',
              data: minStock,
              backgroundColor: 'rgba(148, 163, 184, 0.4)',
              borderColor: 'rgba(148, 163, 184, 0.6)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#e2e8f0', font: { size: 10 } }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#94a3b8',
                font: { size: 11, family: 'Outfit, system-ui' },
                boxWidth: 12
              }
            }
          }
        }
      });
    }
  }

  return { render };
})();
