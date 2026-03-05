let dashChartInstance = null;

async function renderDashboard() {
  try {
    const [eventos, invitados, presupuestos] = await Promise.all([
      DB.getEventos(), DB.getInvitados(), DB.getPresupuestos()
    ]);

    const proximos = eventos.filter(e => e.estado === 'proximo' || e.estado === 'en_curso');
    const concluidos = eventos.filter(e => e.estado === 'concluido');
    const presTotal = presupuestos.reduce((s, p) => s + parseFloat(p.presupuesto || 0), 0);

    document.getElementById('statProximos').textContent = proximos.length;
    document.getElementById('statConcluidos').textContent = concluidos.length;
    document.getElementById('statInvitados').textContent = invitados.length;
    document.getElementById('statPresupuesto').textContent = '$' + presTotal.toLocaleString();

    const sorted = [...proximos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 5);
    document.getElementById('proximosEventos').innerHTML = sorted.length === 0
      ? emptyState('📅', 'No hay eventos próximos')
      : sorted.map(e => `
          <div class="evento-item" onclick="window.location.href='eventos.html'">
            <div class="evento-dot dot-${e.estado}"></div>
            <div class="evento-info">
              <div class="evento-name">${e.nombre}</div>
              <div class="evento-meta">${e.lugar || '—'}</div>
            </div>
            <div class="evento-fecha">${formatFecha(e.fecha)}</div>
          </div>`).join('');

    const pendientes = invitados.filter(i => i.rsvp === 'pendiente').slice(0, 5);
    document.getElementById('pendientesCount').textContent = invitados.filter(i => i.rsvp === 'pendiente').length;
    document.getElementById('invitadosPendientes').innerHTML = pendientes.length === 0
      ? '<p style="color:var(--text3);font-size:0.85rem">Sin pendientes ✓</p>'
      : pendientes.map(inv => {
          const ev = eventos.find(e => e.id === inv.evento_id);
          return `<div class="inv-mini-item">
            <div class="inv-avatar-sm">${(inv.nombre[0] || '?').toUpperCase()}</div>
            <div>
              <div class="inv-mini-name">${inv.nombre} ${inv.apellido || ''}</div>
              <div class="inv-mini-event">${ev ? ev.nombre : '—'}</div>
            </div>
          </div>`;
        }).join('');

    const cats = {};
    presupuestos.forEach(p => {
      cats[p.categoria] = (cats[p.categoria] || 0) + parseFloat(p.gastado || 0);
    });

    const ctx = document.getElementById('dashChart').getContext('2d');
    if (dashChartInstance) dashChartInstance.destroy();

    const colors = ['#0077b6', '#00b4d8', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
    dashChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(cats).length > 0 ? Object.keys(cats) : ['Sin datos'],
        datasets: [{
          data: Object.values(cats).length > 0 ? Object.values(cats) : [1],
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#4a6d8c', font: { family: 'DM Sans', size: 12 }, boxWidth: 12 }
          }
        },
        cutout: '65%'
      }
    });

    const calEl = document.getElementById('calMonth');
    if (calEl && !calEl.textContent) {
      calEl.textContent = new Date().toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });
    }

  } catch(err) {
    console.error('Error renderDashboard:', err);
  }
}

document.addEventListener('DOMContentLoaded', renderDashboard);