async function doLogin() {
  const userId = parseInt(document.getElementById('loginUser').value);
  if (!userId) { showToast('Selecciona un organizador', 'error'); return; }
  
  const boxes = document.querySelectorAll('.pin-box');
  const pin = Array.from(boxes).map(b => b.value).join('');
  if (pin.length < 4) { showToast('Ingresa tu PIN de 4 dígitos', 'error'); return; }

  const btn = document.querySelector('.btn-primary.full');
  btn.textContent = 'Verificando...';
  btn.disabled = true;

  try {
    const res = await DB.login(userId, pin);
    if (!res || res.error) {
      showToast('PIN incorrecto', 'error');
      boxes.forEach(b => { b.value = ''; b.style.borderColor = 'var(--rose)'; });
      setTimeout(() => boxes.forEach(b => b.style.borderColor = ''), 1500);
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
    // Si falla pone usuarios por defecto
    const select = document.getElementById('loginUser');
    select.innerHTML = `
      <option value="">Seleccionar organizador...</option>
      <option value="1">Mari — Organizador General</option>
      <option value="2">Carlos — Organizador Evento</option>
      <option value="3">Ana — Organizador Personal</option>
    `;
  }
}

function setupPinInputs() {
  const boxes = document.querySelectorAll('.pin-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      if (box.value.length === 1 && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
    });
  });
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.className = 'toast', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
  setupPinInputs();
});