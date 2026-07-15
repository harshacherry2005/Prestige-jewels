const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'prestige-jewelry-secret-key-12345';

// Authenticate any user
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Authenticate admin user
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
    }
  });
};

module.exports = { auth, adminAuth, JWT_SECRET };
