async function renderEventos() {
  const eventos = await DB.getEventos();
  const invitados = await DB.getInvitados();
  const search = (document.getElementById('searchEventos')?.value||'').toLowerCase();
  const filtered = eventos.filter(e => e.nombre.toLowerCase().includes(search) || (e.lugar||'').toLowerCase().includes(search));
  const grid = document.getElementById('eventosGrid');
  if (filtered.length === 0) { grid.innerHTML = emptyState('📅','No se encontraron eventos'); return; }
  grid.innerHTML = filtered.map(e => {
    const conf = invitados.filter(i => i.evento_id === e.id && i.rsvp === 'confirmado').length;
    return `<div class="evento-card estado-${e.estado}">
      <div class="evento-card-header"><div class="evento-card-name">${e.nombre}</div>
        <div class="evento-card-actions">
          <button class="btn-icon" onclick="editEvento(${e.id})">✏️</button>
          <button class="btn-icon danger" onclick="deleteEvento(${e.id})">🗑️</button>
        </div></div>
      <div class="estado-badge badge-${e.estado}">${estadoLabel(e.estado)}</div>
      <div class="evento-card-meta">
        <div class="evento-card-meta-row"><span class="meta-icon">📅</span> ${formatFechaLong(e.fecha)}${e.hora ? ' · '+e.hora.substring(0,5) : ''}</div>
        <div class="evento-card-meta-row"><span class="meta-icon">📍</span> ${e.lugar||'—'}</div>
        <div class="evento-card-meta-row"><span class="meta-icon">👥</span> ${conf} confirmados · ${e.capacidad||'?'} cap.</div>
        <div class="evento-card-meta-row"><span class="meta-icon">💰</span> $${parseFloat(e.presupuesto||0).toLocaleString()}</div>
      </div></div>`;
  }).join('');
}

async function editEvento(id) {
  const eventos = await DB.getEventos();
  const e = eventos.find(ev => ev.id === id);
  if (!e) return;
  document.getElementById('eventoId').value = e.id;
  document.getElementById('eventoNombre').value = e.nombre||'';
  document.getElementById('eventoFecha').value = e.fecha ? e.fecha.substring(0,10) : '';
  document.getElementById('eventoHora').value = e.hora ? e.hora.substring(0,5) : '';
  document.getElementById('eventoEstado').value = e.estado||'proximo';
  document.getElementById('eventoCapacidad').value = e.capacidad||'';
  document.getElementById('eventoLugar').value = e.lugar||'';
  document.getElementById('eventoDireccion').value = e.direccion||'';
  document.getElementById('eventoNotasLugar').value = e.notas_lugar||'';
  document.getElementById('eventoPresupuesto').value = e.presupuesto||'';
  document.getElementById('eventoOrganizador').value = e.organizador_id||1;
  document.getElementById('eventoDescripcion').value = e.descripcion||'';
  document.getElementById('modalEventoTitle').textContent = 'Editar Evento';
  wizardStep = 1; updateWizard(); openModal('modalNuevoEvento');
}

async function deleteEvento(id) {
  if (!confirm('¿Eliminar este evento?')) return;
  const res = await DB.eliminarEvento(id);
  if (res?.ok) { renderEventos(); showToast('Evento eliminado','success'); }
  else showToast('Error al eliminar','error');
}

document.addEventListener('DOMContentLoaded', renderEventos);