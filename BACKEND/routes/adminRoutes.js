const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET || 'cartcrush_super_secret_key_2026',
      { expiresIn: '1d' }
    );
    return res.json({ success: true, message: 'Login successful', token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;