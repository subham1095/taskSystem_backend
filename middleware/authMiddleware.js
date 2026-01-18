// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    req.node_id = decoded.node_id;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};
