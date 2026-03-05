let presChartInstance = null;

async function renderPresupuestos() {
  const [presupuestos, eventos] = await Promise.all([DB.getPresupuestos(), DB.getEventos()]);
  const filterEvento = document.getElementById('filterEventoPresupuesto')?.value;
  const filtered = filterEvento ? presupuestos.filter(p => String(p.evento_id) === filterEvento) : presupuestos;
  const tbody = document.getElementById('presupuestoTbody');
  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text3)">Sin partidas</td></tr>`
    : filtered.map(p => {
        const ev = eventos.find(e => e.id === p.evento_id);
        const diff = parseFloat(p.presupuesto||0) - parseFloat(p.gastado||0);
        return `<tr>
          <td><strong>${p.categoria}</strong></td><td>${ev ? ev.nombre : '—'}</td>
          <td class="monto">$${parseFloat(p.presupuesto||0).toLocaleString()}</td>
          <td class="monto ${p.gastado > p.presupuesto ? 'over':'ok'}">$${parseFloat(p.gastado||0).toLocaleString()}</td>
          <td class="${diff >= 0 ? 'diff-pos':'diff-neg'}">$${Math.abs(diff).toLocaleString()} ${diff >= 0 ? '✓':'↑'}</td>
          <td style="color:var(--text3);font-size:.82rem">${p.notas||'—'}</td>
          <td><div style="display:flex;gap:4px">
            <button class="btn-icon" onclick="editPresupuesto(${p.id})">✏️</button>
            <button class="btn-icon danger" onclick="deletePresupuesto(${p.id})">🗑️</button>
          </div></td></tr>`;
      }).join('');
  const cats = {};
  filtered.forEach(p => { cats[p.categoria] = (cats[p.categoria]||0) + parseFloat(p.presupuesto||0); });
  const ctx = document.getElementById('presupuestoChart').getContext('2d');
  if (presChartInstance) presChartInstance.destroy();
  const colors = ['#d4a843','#4a9eff','#5cb882','#e85d7a','#a78bfa','#fb923c'];
  presChartInstance = new Chart(ctx, { type: 'pie', data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: colors, borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#a09890', font: { family: 'DM Sans', size: 11 }, boxWidth: 12 } } } } });
}

async function editPresupuesto(id) {
  const presupuestos = await DB.getPresupuestos();
  const p = presupuestos.find(x => x.id === id);
  if (!p) return;
  await populateEventoSelects();
  document.getElementById('presupuestoId').value = p.id;
  document.getElementById('presEvento').value = p.evento_id;
  document.getElementById('presCategoria').value = p.categoria||'';
  document.getElementById('presPresupuesto').value = p.presupuesto||'';
  document.getElementById('presGastado').value = p.gastado||'';
  document.getElementById('presProveedor').value = p.proveedor||'';
  document.getElementById('presNotas').value = p.notas||'';
  document.getElementById('modalPresTitle').textContent = 'Editar Partida';
  openModal('modalNuevoPresupuesto');
}

async function deletePresupuesto(id) {
  if (!confirm('¿Eliminar esta partida?')) return;
  const res = await DB.eliminarPresupuesto(id);
  if (res?.ok) { renderPresupuestos(); showToast('Partida eliminada','success'); }
  else showToast('Error al eliminar','error');
}

document.addEventListener('DOMContentLoaded', async () => { await populateEventoSelects(); renderPresupuestos(); });