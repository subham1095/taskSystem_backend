const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * Register / Authenticate a node
 */
router.post('/node/login', (req, res) => {
  const { node_id } = req.body;

  if (!node_id) {
    return res.status(400).json({ error: 'node_id required' });
  }

  const token = jwt.sign(
    { node_id },
    'SECRET_KEY',
    { expiresIn: '1h' }
  );

  res.json({ token });
});

module.exports = router;
