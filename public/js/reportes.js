let asistChartInstance = null, pvRChartInstance = null;

async function renderReportes() {
  try {
    const [eventos, invitados, presupuestos] = await Promise.all([
      DB.getEventos(), DB.getInvitados(), DB.getPresupuestos()
    ]);

    const concluidos = eventos.filter(e => e.estado === 'concluido');
    const proximos = eventos.filter(e => e.estado === 'proximo' || e.estado === 'en_curso');
    const totalPres = presupuestos.reduce((s, p) => s + parseFloat(p.presupuesto || 0), 0);

    document.getElementById('repConcluidos').textContent = concluidos.length;
    document.getElementById('repProximos').textContent = proximos.length;
    document.getElementById('repPresupuesto').textContent = '$' + totalPres.toLocaleString();

    const labels = eventos.slice(0, 6).map(e => e.nombre.length > 12 ? e.nombre.substring(0, 12) + '...' : e.nombre);

    // Gráfica asistencia
    const ctx1 = document.getElementById('asistenciaChart').getContext('2d');
    if (asistChartInstance) asistChartInstance.destroy();
    asistChartInstance = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Asistieron',
            data: eventos.slice(0, 6).map(e => invitados.filter(i => i.evento_id === e.id && i.asistencia === 'asistio').length),
            backgroundColor: '#2ecc71',
            borderRadius: 6
          },
          {
            label: 'Pendientes',
            data: eventos.slice(0, 6).map(e => invitados.filter(i => i.evento_id === e.id && i.rsvp === 'pendiente').length),
            backgroundColor: '#f39c12',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#4a6d8c', font: { family: 'DM Sans' } } }
        },
        scales: {
          x: { ticks: { color: '#4a6d8c' }, grid: { color: '#e8f4ff' } },
          y: { ticks: { color: '#4a6d8c' }, grid: { color: '#e8f4ff' }, beginAtZero: true }
        }
      }
    });

    // Gráfica presupuesto vs real
    const ctx2 = document.getElementById('presupVsRealChart').getContext('2d');
    if (pvRChartInstance) pvRChartInstance.destroy();
    pvRChartInstance = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Presupuesto',
            data: eventos.slice(0, 6).map(e =>
              presupuestos
                .filter(p => p.evento_id === e.id)
                .reduce((s, p) => s + parseFloat(p.presupuesto || 0), 0)
            ),
            backgroundColor: '#0077b6',
            borderRadius: 6
          },
          {
            label: 'Gastado',
            data: eventos.slice(0, 6).map(e =>
              presupuestos
                .filter(p => p.evento_id === e.id)
                .reduce((s, p) => s + parseFloat(p.gastado || 0), 0)
            ),
            backgroundColor: '#e74c3c',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#4a6d8c', font: { family: 'DM Sans' } } }
        },
        scales: {
          x: { ticks: { color: '#4a6d8c' }, grid: { color: '#e8f4ff' } },
          y: {
            ticks: {
              color: '#4a6d8c',
              callback: v => '$' + v.toLocaleString()
            },
            grid: { color: '#e8f4ff' },
            beginAtZero: true
          }
        }
      }
    });

    // Resumen presupuestos en dashboard
    const resumenEl = document.getElementById('dashChart');
    if (resumenEl) {
      const cats = {};
      presupuestos.forEach(p => {
        cats[p.categoria] = (cats[p.categoria] || 0) + parseFloat(p.gastado || 0);
      });
      const ctxD = resumenEl.getContext('2d');
      const colors = ['#0077b6','#00b4d8','#2ecc71','#e74c3c','#f39c12','#9b59b6'];
      new Chart(ctxD, {
        type: 'doughnut',
        data: {
          labels: Object.keys(cats),
          datasets: [{ data: Object.values(cats), backgroundColor: colors, borderWidth: 0 }]
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
    }

  } catch(err) {
    console.error('Error renderReportes:', err);
  }
}

async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const [eventos, presupuestos] = await Promise.all([DB.getEventos(), DB.getPresupuestos()]);
  doc.setFontSize(20); doc.setTextColor(0, 119, 182);
  doc.text('EventPlanner — Reporte General', 14, 20);
  doc.setFontSize(10); doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);
  let y = 40;
  doc.setFontSize(14); doc.setTextColor(50);
  doc.text('Eventos', 14, y); y += 8;
  eventos.forEach(e => {
    doc.setFontSize(10); doc.setTextColor(30);
    doc.text(`• ${e.nombre} — ${e.fecha?.substring(0, 10)} — ${e.lugar || ''}`, 16, y);
    y += 6; if (y > 270) { doc.addPage(); y = 20; }
  });
  y += 6;
  doc.setFontSize(14); doc.setTextColor(50);
  doc.text('Presupuestos', 14, y); y += 8;
  presupuestos.forEach(p => {
    const ev = eventos.find(e => e.id === p.evento_id);
    doc.setFontSize(10); doc.setTextColor(30);
    doc.text(`• ${p.categoria} (${ev ? ev.nombre : '?'}) — $${parseFloat(p.presupuesto).toLocaleString()} / $${parseFloat(p.gastado).toLocaleString()}`, 16, y);
    y += 6; if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save('EventPlanner_Reporte.pdf');
  showToast('PDF descargado ✓', 'success');
}

document.addEventListener('DOMContentLoaded', renderReportes);