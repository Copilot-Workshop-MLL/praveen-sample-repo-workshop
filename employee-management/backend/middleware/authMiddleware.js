const { verifyToken } = require('../utils/jwtUtils');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
