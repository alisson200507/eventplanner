let dashChartInstance = null;

async function renderDashboard() {
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

  const sorted = [...proximos].sort((a,b) => new Date(a.fecha)-new Date(b.fecha)).slice(0,5);
  document.getElementById('proximosEventos').innerHTML = sorted.length === 0 ? emptyState('📅','No hay eventos próximos') :
    sorted.map(e => `<div class="evento-item" onclick="window.location.href='evento.html'">
      <div class="evento-dot dot-${e.estado}"></div>
      <div class="evento-info"><div class="evento-name">${e.nombre}</div><div class="evento-meta">${e.lugar}</div></div>
      <div class="evento-fecha">${formatFecha(e.fecha)}</div>
    </div>`).join('');

  const pendientes = invitados.filter(i => i.rsvp === 'pendiente').slice(0,5);
  document.getElementById('pendientesCount').textContent = invitados.filter(i => i.rsvp === 'pendiente').length;
  document.getElementById('invitadosPendientes').innerHTML = pendientes.length === 0
    ? '<p style="color:var(--text3);font-size:0.85rem">Sin pendientes ✓</p>'
    : pendientes.map(inv => {
        const ev = eventos.find(e => e.id === inv.evento_id);
        return `<div class="inv-mini-item"><div class="inv-avatar-sm">${(inv.nombre[0]||'?').toUpperCase()}</div>
          <div><div class="inv-mini-name">${inv.nombre} ${inv.apellido||''}</div>
          <div class="inv-mini-event">${ev ? ev.nombre : '—'}</div></div></div>`;
      }).join('');

  const cats = {};
  presupuestos.forEach(p => { cats[p.categoria] = (cats[p.categoria]||0) + parseFloat(p.gastado||0); });
  const ctx = document.getElementById('dashChart').getContext('2d');
  if (dashChartInstance) dashChartInstance.destroy();
  const colors = ['#d4a843','#4a9eff','#5cb882','#e85d7a','#a78bfa','#fb923c'];
  dashChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: colors, borderWidth: 0 }] },
    options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: '#a09890', font: { family: 'DM Sans', size: 12 }, boxWidth: 12 } } }, cutout: '65%' }
  });

  const calEl = document.getElementById('calMonth');
  if (calEl && !calEl.textContent) calEl.textContent = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', renderDashboard);