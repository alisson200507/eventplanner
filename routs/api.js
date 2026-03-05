router.post('/login', async (req, res) => {
  try {
    const { usuario_id, email, password } = req.body;
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ? AND email = ? AND password = ?',
      [usuario_id, email, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
    req.session.usuario = rows[0];
    res.json({ ok: true, usuario: rows[0] });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});