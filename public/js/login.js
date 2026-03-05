async function doLogin() {
  const userId = parseInt(document.getElementById('loginUser').value);
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!userId) { showToast('Selecciona un organizador', 'error'); return; }
  if (!email) { showToast('Ingresa tu correo', 'error'); return; }
  if (!password) { showToast('Ingresa tu contraseña', 'error'); return; }

  const btn = document.querySelector('.btn-primary.full');
  btn.textContent = 'Verificando...';
  btn.disabled = true;

  try {
    const res = await DB.login(userId, email, password);
    if (!res || res.error) {
      showToast('Correo o contraseña incorrectos', 'error');
      document.getElementById('loginPassword').value = '';
      btn.textContent = 'Iniciar sesión';
      btn.disabled = false;
      return;
    }
    DB.saveSession(res.usuario);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showToast('Error de conexión', 'error');
    btn.textContent = 'Iniciar sesión';
    btn.disabled = false;
  }
}

async function cargarUsuarios() {
  try {
    const usuarios = await DB.getUsuarios();
    const select = document.getElementById('loginUser');
    select.innerHTML = '<option value="">Seleccionar organizador...</option>';
    if (usuarios) {
      usuarios.forEach(u => {
        select.innerHTML += `<option value="${u.id}">${u.nombre} — ${u.rol}</option>`;
      });
    }
  } catch (err) {
    const select = document.getElementById('loginUser');
    select.innerHTML = `
      <option value="">Seleccionar organizador...</option>
      <option value="1">Mari — Organizador General</option>
      <option value="2">Carlos — Organizador Evento</option>
      <option value="3">Ana — Organizador Personal</option>`;
  }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.className = 'toast', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
});