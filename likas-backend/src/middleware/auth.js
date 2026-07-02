const jwt = require('jsonwebtoken');
const { ACCOUNTS } = require('../data/baseline');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

const extractUser = (req) => {
  return ACCOUNTS.find(a => a.id === req.user.id);
};

module.exports = { verifyToken, extractUser };
