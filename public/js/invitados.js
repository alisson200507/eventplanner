async function renderInvitados() {
  try {
    const [invitados, eventos] = await Promise.all([
      DB.getInvitados(), 
      DB.getEventos()
    ]);
    
    const search = (document.getElementById('searchInvitados')?.value||'').toLowerCase();
    const filterEvento = document.getElementById('filterEventoInvitados')?.value;
    const filterRsvp = document.getElementById('filterRsvp')?.value;
    
    const filtered = invitados.filter(inv => {
      const ms = !search || 
        `${inv.nombre} ${inv.apellido||''}`.toLowerCase().includes(search) || 
        (inv.email||'').toLowerCase().includes(search) || 
        (inv.telefono||'').includes(search);
      const me = !filterEvento || String(inv.evento_id) === filterEvento;
      const mr = !filterRsvp || inv.rsvp === filterRsvp;
      return ms && me && mr;
    });

    const tbody = document.getElementById('invitadosTbody');
    
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:2rem;color:var(--text3)">
            Sin invitados encontrados
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(inv => {
      const ev = eventos.find(e => e.id === inv.evento_id);
      return `
        <tr>
          <td><strong>${inv.nombre} ${inv.apellido||''}</strong></td>
          <td>${inv.email}</td>
          <td>${inv.telefono||'—'}</td>
          <td>${ev ? ev.nombre : '—'}</td>
          <td><span class="rsvp-badge rsvp-${inv.rsvp}">${inv.rsvp}</span></td>
          <td><span class="asistencia-badge ${inv.asistencia}">${asistenciaLabel(inv.asistencia)}</span></td>
          <td>
            <div style="display:flex;gap:4px">
              <button class="btn-icon" onclick="editInvitado(${inv.id})">✏️</button>
              <button class="btn-icon danger" onclick="deleteInvitado(${inv.id})">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');

  } catch(err) {
    console.error('Error renderInvitados:', err);
  }
}

async function editInvitado(id) {
  try {
    const invitados = await DB.getInvitados();
    const inv = invitados.find(i => i.id === id);
    if (!inv) return;

    await populateEventoSelects();

    document.getElementById('invitadoId').value = inv.id;
    document.getElementById('invNombre').value = inv.nombre||'';
    document.getElementById('invApellido').value = inv.apellido||'';
    document.getElementById('invEmail').value = inv.email||'';
    document.getElementById('invTelefono').value = inv.telefono||'';
    document.getElementById('invEvento').value = inv.evento_id||'';
    document.getElementById('invRsvp').value = inv.rsvp||'pendiente';
    document.getElementById('invAsistencia').value = inv.asistencia||'no_registrada';
    document.getElementById('invNotas').value = inv.notas||'';
    document.getElementById('modalInvitadoTitle').textContent = 'Editar Invitado';

    openModal('modalNuevoInvitado');
  } catch(err) {
    console.error('Error editInvitado:', err);
  }
}

async function deleteInvitado(id) {
  if (!confirm('¿Eliminar este invitado?')) return;
  try {
    const res = await DB.eliminarInvitado(id);
    if (res && res.ok) {
      showToast('Invitado eliminado ✓', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showToast('Error al eliminar', 'error');
    }
  } catch(err) {
    showToast('Error de conexión', 'error');
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await populateEventoSelects();
    await renderInvitados();
  } catch(err) {
    console.error('Error al cargar invitados:', err);
  }
});