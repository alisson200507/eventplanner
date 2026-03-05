async function cargarPerfil() {
  const session = DB.getSession();
  if (!session) return;
  document.getElementById('perfilAvatar').textContent = session.avatar || '?';
  document.getElementById('perfilNombre').textContent = session.nombre || '';
  document.getElementById('perfilRol').textContent = session.rol || '';
  document.getElementById('perfilEmail').value = session.email || '';
}

async function guardarPerfil() {
  const email = document.getElementById('perfilEmail').value.trim();
  const passActual = document.getElementById('perfilPassActual').value.trim();
  const passNueva = document.getElementById('perfilPassNueva').value.trim();
  const passConfirm = document.getElementById('perfilPassConfirm').value.trim();

  if (!email) { showToast('El correo es requerido', 'error'); return; }
  if (!passActual) { showToast('Ingresa tu contraseña actual', 'error'); return; }
  if (passNueva && passNueva !== passConfirm) {
    showToast('Las contraseñas no coinciden', 'error'); return;
  }

  const btn = document.querySelector('.btn-primary');
  btn.textContent = 'Guardando...';
  btn.disabled = true;

  try {
    const res = await DB.actualizarPerfil({ email, passActual, passNueva });
    if (res && res.ok) {
      showToast('Perfil actualizado ✓', 'success');
      const session = DB.getSession();
      session.email = email;
      DB.saveSession(session);
      document.getElementById('perfilPassActual').value = '';
      document.getElementById('perfilPassNueva').value = '';
      document.getElementById('perfilPassConfirm').value = '';
    } else {
      showToast(res?.error || 'Error al guardar', 'error');
    }
  } catch(err) {
    showToast('Error de conexión', 'error');
  }

  btn.textContent = 'Guardar Cambios';
  btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', cargarPerfil);