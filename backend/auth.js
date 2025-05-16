const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const SECRET_KEY = process.env.JWT_SECRET || 'secretkey101';
const db = new sqlite3.Database('./taskmanagement.db');

const HARDCODED_ADMIN = {
  email: 'admin@example.com',
  password: 'password123',
  id: 0,
  role: 'admin',
};

const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    if (email === HARDCODED_ADMIN.email && password === HARDCODED_ADMIN.password) {
      const token = jwt.sign({ id: HARDCODED_ADMIN.id, role: HARDCODED_ADMIN.role }, SECRET_KEY, {
        expiresIn: '1h',
      });
      return resolve({ user: HARDCODED_ADMIN, token });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) return reject(new Error('DB error: ' + err.message));
      if (!user) return reject(new Error('User not found'));

      const isValid = await bcryptjs.compare(password, user.password);
      if (!isValid) return reject(new Error('Incorrect password'));

      delete user.password;

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
        expiresIn: '1h',
      });

      resolve({ user, token });
    });
  });
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Access denied. Admins only.' });
};

module.exports = { loginUser, authMiddleware, isAdmin };
