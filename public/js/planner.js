async function doLogout() {
  await DB.logout();
  window.location.href = 'login.html';
}

function toggleMenu() { 
  document.getElementById('navLinks').classList.toggle('open'); 
}

function openModal(id) {
  if (id === 'modalNuevoEvento') resetModalEvento();
  if (id === 'modalNuevoInvitado') { populateEventoSelects(); resetModalInvitado(); }
  if (id === 'modalNuevoPresupuesto') { populateEventoSelects(); resetModalPresupuesto(); }
  document.getElementById(id).classList.add('open');
}

function closeModal(id) { 
  document.getElementById(id).classList.remove('open'); 
}

function closeModalOutside(e, id) { 
  if (e.target === document.getElementById(id)) closeModal(id); 
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.className = 'toast', 3000);
}

async function populateEventoSelects() {
  try {
    const eventos = await DB.getEventos();
    const opts = eventos.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
    ['invEvento','presEvento'].forEach(id => { 
      const el = document.getElementById(id); 
      if (el) el.innerHTML = opts; 
    });
    ['filterEventoInvitados','filterEventoPresupuesto'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<option value="">Todos los eventos</option>' + opts;
    });
  } catch(err) {
    console.error('Error cargando eventos:', err);
  }
}

function formatFecha(d) { 
  if (!d) return '—'; 
  const dt = new Date(d); 
  return dt.toLocaleDateString('es-SV', { day: 'numeric', month: 'short' }); 
}

function formatFechaLong(d) { 
  if (!d) return '—'; 
  const dt = new Date(d); 
  return dt.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' }); 
}

function estadoLabel(e) { 
  return { proximo:'Próximo', en_curso:'En curso', concluido:'Concluido', cancelado:'Cancelado' }[e] || e; 
}

function asistenciaLabel(a) { 
  return { asistio:'Asistió', no_asistio:'No asistió', no_registrada:'Sin registro' }[a] || a; 
}

function emptyState(icon, msg) { 
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${msg}</p></div>`; 
}

// ── WIZARD ──
let wizardStep = 1;

function resetModalEvento() {
  document.getElementById('eventoId').value = '';
  ['eventoNombre','eventoFecha','eventoHora','eventoCapacidad','eventoLugar',
   'eventoDireccion','eventoNotasLugar','eventoPresupuesto','eventoDescripcion']
  .forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  if(document.getElementById('eventoEstado')) 
    document.getElementById('eventoEstado').value = 'proximo';
  if(document.getElementById('modalEventoTitle')) 
    document.getElementById('modalEventoTitle').textContent = 'Nuevo Evento';
  wizardStep = 1; 
  updateWizard();
}

function resetModalInvitado() {
  document.getElementById('invitadoId').value = '';
  ['invNombre','invApellido','invEmail','invTelefono','invNotas']
  .forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  if(document.getElementById('invRsvp')) 
    document.getElementById('invRsvp').value = 'pendiente';
  if(document.getElementById('invAsistencia')) 
    document.getElementById('invAsistencia').value = 'no_registrada';
  if(document.getElementById('modalInvitadoTitle')) 
    document.getElementById('modalInvitadoTitle').textContent = 'Agregar Invitado';
}

function resetModalPresupuesto() {
  document.getElementById('presupuestoId').value = '';
  ['presCategoria','presPresupuesto','presGastado','presProveedor','presNotas']
  .forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  if(document.getElementById('modalPresTitle')) 
    document.getElementById('modalPresTitle').textContent = 'Nueva Partida';
}

function wizNav(dir) {
  if (dir === 1 && !validateWizStep()) return;
  wizardStep = Math.max(1, Math.min(4, wizardStep + dir));
  if (wizardStep === 4) updateEventSummary();
  updateWizard();
  if (wizardStep === 4) {
    document.getElementById('wizNext').textContent = '✓ Guardar Evento';
    document.getElementById('wizNext').onclick = () => guardarEvento();
  }
}

function validateWizStep() {
  if (wizardStep === 1) {
    if (!document.getElementById('eventoNombre').value.trim()) { 
      showToast('El nombre es requerido','error'); return false; 
    }
    if (!document.getElementById('eventoFecha').value) { 
      showToast('La fecha es requerida','error'); return false; 
    }
  }
  if (wizardStep === 2 && !document.getElementById('eventoLugar').value.trim()) { 
    showToast('El lugar es requerido','error'); return false; 
  }
  return true;
}

function updateWizard() {
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`step${i}-indicator`);
    const step = document.getElementById(`wizStep${i}`);
    if (!ind || !step) continue;
    ind.className = 'step' + (i === wizardStep ? ' active' : i < wizardStep ? ' done' : '');
    step.className = 'wiz-step' + (i === wizardStep ? ' active' : '');
  }
  const back = document.getElementById('wizBack');
  const next = document.getElementById('wizNext');
  if (back) back.style.display = wizardStep > 1 ? 'inline-flex' : 'none';
  if (next && wizardStep < 4) { 
    next.textContent = 'Siguiente →'; 
    next.onclick = () => wizNav(1); 
  }
}

function updateEventSummary() {
  const s = document.getElementById('eventSummary');
  if (!s) return;
  s.innerHTML = `
    <p><strong>Nombre:</strong> ${document.getElementById('eventoNombre').value}</p>
    <p><strong>Fecha:</strong> ${document.getElementById('eventoFecha').value} ${document.getElementById('eventoHora').value}</p>
    <p><strong>Lugar:</strong> ${document.getElementById('eventoLugar').value}</p>
    <p><strong>Presupuesto:</strong> $${parseInt(document.getElementById('eventoPresupuesto').value||0).toLocaleString()}</p>
    <p><strong>Estado:</strong> ${estadoLabel(document.getElementById('eventoEstado').value)}</p>`;
}

async function guardarEvento() {
  const id = document.getElementById('eventoId').value;
  const data = {
    nombre: document.getElementById('eventoNombre').value.trim(),
    fecha: document.getElementById('eventoFecha').value,
    hora: document.getElementById('eventoHora').value || null,
    lugar: document.getElementById('eventoLugar').value.trim(),
    direccion: document.getElementById('eventoDireccion').value.trim(),
    notas_lugar: document.getElementById('eventoNotasLugar').value.trim(),
    capacidad: parseInt(document.getElementById('eventoCapacidad').value) || 0,
    presupuesto: parseInt(document.getElementById('eventoPresupuesto').value) || 0,
    organizador_id: parseInt(document.getElementById('eventoOrganizador').value),
    estado: document.getElementById('eventoEstado').value,
    descripcion: document.getElementById('eventoDescripcion').value.trim()
  };

  try {
    const res = id ? await DB.actualizarEvento(id, data) : await DB.crearEvento(data);
    if (res && res.ok) {
      closeModal('modalNuevoEvento');
      showToast(id ? 'Evento actualizado ✓' : 'Evento creado ✓', 'success');
      // Recargar la página actual
      setTimeout(() => location.reload(), 1000);
    } else { 
      showToast('Error al guardar', 'error'); 
    }
  } catch(err) {
    showToast('Error de conexión', 'error');
    console.error(err);
  }
}

async function guardarInvitado() {
  const nombre = document.getElementById('invNombre').value.trim();
  const email = document.getElementById('invEmail').value.trim();
  const eventoId = document.getElementById('invEvento').value;
  if (!nombre) { showToast('El nombre es requerido','error'); return; }
  if (!email) { showToast('El correo es requerido','error'); return; }
  if (!eventoId) { showToast('Selecciona un evento','error'); return; }

  const id = document.getElementById('invitadoId').value;
  const data = {
    nombre, 
    apellido: document.getElementById('invApellido').value.trim(),
    email, 
    telefono: document.getElementById('invTelefono').value.trim(),
    evento_id: parseInt(eventoId), 
    rsvp: document.getElementById('invRsvp').value,
    asistencia: document.getElementById('invAsistencia').value,
    notas: document.getElementById('invNotas').value.trim()
  };

  try {
    const res = id ? await DB.actualizarInvitado(id, data) : await DB.crearInvitado(data);
    if (res && res.ok) {
      closeModal('modalNuevoInvitado');
      showToast(id ? 'Invitado actualizado ✓' : 'Invitado agregado ✓', 'success');
      setTimeout(() => location.reload(), 1000);
    } else { 
      showToast('Error al guardar','error'); 
    }
  } catch(err) {
    showToast('Error de conexión','error');
    console.error(err);
  }
}

async function guardarPresupuesto() {
  const eventoId = document.getElementById('presEvento').value;
  const categoria = document.getElementById('presCategoria').value.trim();
  if (!eventoId) { showToast('Selecciona un evento','error'); return; }
  if (!categoria) { showToast('La categoría es requerida','error'); return; }

  const id = document.getElementById('presupuestoId').value;
  const data = {
    evento_id: parseInt(eventoId), 
    categoria,
    presupuesto: parseFloat(document.getElementById('presPresupuesto').value) || 0,
    gastado: parseFloat(document.getElementById('presGastado').value) || 0,
    proveedor: document.getElementById('presProveedor').value.trim(),
    notas: document.getElementById('presNotas').value.trim()
  };

  try {
    const res = id ? await DB.actualizarPresupuesto(id, data) : await DB.crearPresupuesto(data);
    if (res && res.ok) {
      closeModal('modalNuevoPresupuesto');
      showToast(id ? 'Partida actualizada ✓' : 'Partida agregada ✓', 'success');
      setTimeout(() => location.reload(), 1000);
    } else { 
      showToast('Error al guardar','error'); 
    }
  } catch(err) {
    showToast('Error de conexión','error');
    console.error(err);
  }
}

// ── CARGAR USUARIO EN NAVBAR ──
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const session = DB.getSession();
    if (session) {
      const av = document.getElementById('userAvatar');
      const un = document.getElementById('userName');
      if (av) av.textContent = session.avatar;
      if (un) un.textContent = session.nombre;
    }
  } catch(err) {
    console.error(err);
  }
});

let calOffset = 0;
function changeMonth(dir) {
  calOffset += dir;
  const d = new Date(); 
  d.setMonth(d.getMonth() + calOffset);
  const el = document.getElementById('calMonth');
  if (el) el.textContent = d.toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });
}