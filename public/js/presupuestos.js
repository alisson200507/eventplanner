let presChartInstance = null;

async function renderPresupuestos() {
  try {
    const [presupuestos, eventos] = await Promise.all([DB.getPresupuestos(), DB.getEventos()]);
    const filterEvento = document.getElementById('filterEventoPresupuesto')?.value;
    const filtered = filterEvento ? presupuestos.filter(p => String(p.evento_id) === filterEvento) : presupuestos;
    
    const tbody = document.getElementById('presupuestoTbody');
    tbody.innerHTML = filtered.length === 0
      ? `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text3)">Sin partidas</td></tr>`
      : filtered.map(p => {
          const ev = eventos.find(e => e.id === p.evento_id);
          const pres = parseFloat(p.presupuesto || 0);
          const gast = parseFloat(p.gastado || 0);
          const diff = pres - gast;
          return `<tr>
            <td><strong>${p.categoria}</strong></td>
            <td>${ev ? ev.nombre : '—'}</td>
            <td class="monto">$${pres.toLocaleString()}</td>
            <td class="monto ${gast > pres ? 'over' : 'ok'}">$${gast.toLocaleString()}</td>
            <td class="${diff >= 0 ? 'diff-pos' : 'diff-neg'}">$${Math.abs(diff).toLocaleString()} ${diff >= 0 ? '✓' : '↑'}</td>
            <td style="color:var(--text3);font-size:.82rem">${p.notas || '—'}</td>
            <td><div style="display:flex;gap:4px">
              <button class="btn-icon" onclick="editPresupuesto(${p.id})">✏️</button>
              <button class="btn-icon danger" onclick="deletePresupuesto(${p.id})">🗑️</button>
            </div></td>
          </tr>`;
        }).join('');

    // Gráfica
    const cats = {};
    filtered.forEach(p => {
      cats[p.categoria] = (cats[p.categoria] || 0) + parseFloat(p.presupuesto || 0);
    });

    const ctx = document.getElementById('presupuestoChart').getContext('2d');
    if (presChartInstance) presChartInstance.destroy();

    if (Object.keys(cats).length === 0) return;

    const colors = ['#0077b6','#00b4d8','#2ecc71','#e74c3c','#f39c12','#9b59b6'];
    presChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(cats),
        datasets: [{
          data: Object.values(cats),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#4a6d8c', font: { family: 'DM Sans', size: 12 }, boxWidth: 14 }
          }
        }
      }
    });
  } catch(err) {
    console.error('Error renderPresupuestos:', err);
  }
}

async function editPresupuesto(id) {
  try {
    const presupuestos = await DB.getPresupuestos();
    const p = presupuestos.find(x => x.id === id);
    if (!p) return;
    await populateEventoSelects();
    document.getElementById('presupuestoId').value = p.id;
    document.getElementById('presEvento').value = p.evento_id;
    document.getElementById('presCategoria').value = p.categoria || '';
    document.getElementById('presPresupuesto').value = p.presupuesto || '';
    document.getElementById('presGastado').value = p.gastado || '';
    document.getElementById('presProveedor').value = p.proveedor || '';
    document.getElementById('presNotas').value = p.notas || '';
    document.getElementById('modalPresTitle').textContent = 'Editar Partida';
    openModal('modalNuevoPresupuesto');
  } catch(err) {
    console.error('Error editPresupuesto:', err);
  }
}

async function deletePresupuesto(id) {
  if (!confirm('¿Eliminar esta partida?')) return;
  try {
    const res = await DB.eliminarPresupuesto(id);
    if (res && res.ok) {
      showToast('Partida eliminada ✓', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showToast('Error al eliminar', 'error');
    }
  } catch(err) {
    showToast('Error de conexión', 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await populateEventoSelects();
  renderPresupuestos();
});