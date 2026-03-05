async function doLogin() {
  const userId = parseInt(document.getElementById('loginUser').value);
  if (!userId) { showToast('Selecciona un organizador', 'error'); return; }

  const btn = document.querySelector('.btn-primary.full');
  btn.textContent = 'Entrando...';
  btn.disabled = true;

  try {
    const res = await DB.login(userId);
    if (!res || res.error) {
      showToast('Error al entrar', 'error');
      btn.textContent = 'Entrar';
      btn.disabled = false;
      return;
    }
    DB.saveSession(res.usuario);
    window.location.href = 'dashboard.html';
  } catch(err) {
    showToast('Error de conexión', 'error');
    btn.textContent = 'Entrar';
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
  } catch(err) {
    document.getElementById('loginUser').innerHTML = `
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

document.addEventListener('DOMContentLoaded', cargarUsuarios);