const express = require('express');
const jwt = require('jsonwebtoken');
const Models = require('../models');

const router = express.Router();
const Node = Models.Node;

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';

/**
 * Authenticate / Login Node
 * Only registered & active nodes can get token
 */
router.post('/node/login', async (req, res) => {
  const { node_id } = req.body;

  if (!node_id) {
    return res.status(400).json({ error: 'node_id is required' });
  }

  // ✅ Check node exists and is active
  const node = await Node.findOne({
    node_id,
    status: 'active'
  });

  if (!node) {
    return res.status(401).json({
      error: 'Invalid or inactive node'
    });
  }
  console.log(node_id,"node_id");
  

  // ✅ Issue JWT bound to node identity
  const token = jwt.sign(
    { node_id },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    node_id,
    token
  });
});

module.exports = router;
