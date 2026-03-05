const express = require('express');
const router = express.Router();
const db = require('../configuracion/db');

router.post('/login', async (req, res) => {
  try {
    const { usuario_id } = req.body;
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [usuario_id]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.session.usuario = rows[0];
    res.json({ ok: true, usuario: rows[0] });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ error: 'No autorizado' });
  res.json(req.session.usuario);
});

router.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nombre, rol, avatar, email FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/usuarios', async (req, res) => {
  try {
    const { nombre, email, password, avatar, rol, pin } = req.body;
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, rol, pin, email, password, avatar) VALUES (?,?,?,?,?,?)',
      [nombre, rol, pin || '1234', email || null, password || null, avatar || nombre[0]?.toUpperCase() || 'U']
    );
    res.json({ ok: true, id: result.insertId });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/usuarios/:id', async (req, res) => {
  try {
    const { nombre, email, password, avatar, rol } = req.body;
    if (password) {
      await db.execute(
        'UPDATE usuarios SET nombre=?, email=?, password=?, avatar=?, rol=? WHERE id=?',
        [nombre, email, password, avatar, rol, req.params.id]
      );
    } else {
      await db.execute(
        'UPDATE usuarios SET nombre=?, email=?, avatar=?, rol=? WHERE id=?',
        [nombre, email, avatar, rol, req.params.id]
      );
    }
    res.json({ ok: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/usuarios/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/eventos', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT e.*, u.nombre AS organizador_nombre
      FROM eventos e
      LEFT JOIN usuarios u ON e.organizador_id = u.id
      ORDER BY e.fecha ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/eventos', async (req, res) => {
  try {
    const { nombre, fecha, hora, lugar, direccion, notas_lugar, capacidad, presupuesto, organizador_id, estado, descripcion } = req.body;
    const [result] = await db.execute(
      'INSERT INTO eventos (nombre, fecha, hora, lugar, direccion, notas_lugar, capacidad, presupuesto, organizador_id, estado, descripcion) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [nombre, fecha, hora || null, lugar, direccion || null, notas_lugar || null, capacidad || 0, presupuesto || 0, organizador_id || 1, estado || 'proximo', descripcion || null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/eventos/:id', async (req, res) => {
  try {
    const { nombre, fecha, hora, lugar, direccion, notas_lugar, capacidad, presupuesto, organizador_id, estado, descripcion } = req.body;
    await db.execute(
      'UPDATE eventos SET nombre=?, fecha=?, hora=?, lugar=?, direccion=?, notas_lugar=?, capacidad=?, presupuesto=?, organizador_id=?, estado=?, descripcion=? WHERE id=?',
      [nombre, fecha, hora || null, lugar, direccion || null, notas_lugar || null, capacidad || 0, presupuesto || 0, organizador_id || 1, estado || 'proximo', descripcion || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/eventos/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM eventos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/invitados', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT i.*, e.nombre AS evento_nombre
      FROM invitados i
      LEFT JOIN eventos e ON i.evento_id = e.id
      ORDER BY i.nombre ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/invitados', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, evento_id, rsvp, asistencia, notas } = req.body;
    const [result] = await db.execute(
      'INSERT INTO invitados (nombre, apellido, email, telefono, evento_id, rsvp, asistencia, notas) VALUES (?,?,?,?,?,?,?,?)',
      [nombre, apellido || '', email, telefono || null, evento_id, rsvp || 'pendiente', asistencia || 'no_registrada', notas || null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/invitados/:id', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, evento_id, rsvp, asistencia, notas } = req.body;
    await db.execute(
      'UPDATE invitados SET nombre=?, apellido=?, email=?, telefono=?, evento_id=?, rsvp=?, asistencia=?, notas=? WHERE id=?',
      [nombre, apellido || '', email, telefono || null, evento_id, rsvp || 'pendiente', asistencia || 'no_registrada', notas || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/invitados/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM invitados WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/presupuestos', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, e.nombre AS evento_nombre
      FROM presupuestos p
      LEFT JOIN eventos e ON p.evento_id = e.id
      ORDER BY p.evento_id, p.categoria
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/presupuestos', async (req, res) => {
  try {
    const { evento_id, categoria, presupuesto, gastado, proveedor, notas } = req.body;
    const [result] = await db.execute(
      'INSERT INTO presupuestos (evento_id, categoria, presupuesto, gastado, proveedor, notas) VALUES (?,?,?,?,?,?)',
      [evento_id, categoria, presupuesto || 0, gastado || 0, proveedor || null, notas || null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/presupuestos/:id', async (req, res) => {
  try {
    const { evento_id, categoria, presupuesto, gastado, proveedor, notas } = req.body;
    await db.execute(
      'UPDATE presupuestos SET evento_id=?, categoria=?, presupuesto=?, gastado=?, proveedor=?, notas=? WHERE id=?',
      [evento_id, categoria, presupuesto || 0, gastado || 0, proveedor || null, notas || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/presupuestos/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM presupuestos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/perfil', async (req, res) => {
  try {
    if (!req.session.usuario) return res.status(401).json({ error: 'No autorizado' });
    const { email, passActual, passNueva } = req.body;
    const userId = req.session.usuario.id;
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND password = ?',
      [userId, passActual]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    if (passNueva) {
      await db.execute(
        'UPDATE usuarios SET email = ?, password = ? WHERE id = ?',
        [email, passNueva, userId]
      );
    } else {
      await db.execute('UPDATE usuarios SET email = ? WHERE id = ?', [email, userId]);
    }
    req.session.usuario.email = email;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;