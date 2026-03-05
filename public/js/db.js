const DB = {

  getSession() {
    try { return JSON.parse(localStorage.getItem('ep_session') || 'null'); } catch { return null; }
  },
  saveSession(user) { localStorage.setItem('ep_session', JSON.stringify(user)); },
  clearSession() { localStorage.removeItem('ep_session'); },

  async request(method, url, body = null) {
    try {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(url, opts);
      const data = await res.json();
      console.log(`${method} ${url}:`, data);
      return data;
    } catch(err) {
      console.error(`Error ${method} ${url}:`, err);
      return null;
    }
  },

  async getUsuarios() { return this.request('GET', '/api/usuarios'); },
  async login(usuario_id) {
    return this.request('POST', '/api/login', { usuario_id });
  },
  async logout() { await this.request('POST', '/api/logout'); this.clearSession(); },
  async getMe() { return this.request('GET', '/api/me'); },

  async getEventos() { return await this.request('GET', '/api/eventos') || []; },
  async crearEvento(data) { return this.request('POST', '/api/eventos', data); },
  async actualizarEvento(id, data) { return this.request('PUT', `/api/eventos/${id}`, data); },
  async eliminarEvento(id) { return this.request('DELETE', `/api/eventos/${id}`); },

  async getInvitados() { return await this.request('GET', '/api/invitados') || []; },
  async crearInvitado(data) { return this.request('POST', '/api/invitados', data); },
  async actualizarInvitado(id, data) { return this.request('PUT', `/api/invitados/${id}`, data); },
  async eliminarInvitado(id) { return this.request('DELETE', `/api/invitados/${id}`); },

  async getPresupuestos() { return await this.request('GET', '/api/presupuestos') || []; },
  async crearPresupuesto(data) { return this.request('POST', '/api/presupuestos', data); },
  async actualizarPresupuesto(id, data) { return this.request('PUT', `/api/presupuestos/${id}`, data); },
  async eliminarPresupuesto(id) { return this.request('DELETE', `/api/presupuestos/${id}`); },

  async crearUsuario(data) { return this.request('POST', '/api/usuarios', data); },
  async actualizarUsuario(id, data) { return this.request('PUT', `/api/usuarios/${id}`, data); },
  async eliminarUsuario(id) { return this.request('DELETE', `/api/usuarios/${id}`); },
  async actualizarPerfil(data) { return this.request('PUT', '/api/perfil', data); }
};