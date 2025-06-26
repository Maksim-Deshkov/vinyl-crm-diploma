// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../routes/users'); // підключаємо модель User
const secret = process.env.JWT_SECRET || '29834fj239jid23123j23f';

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized: Bearer token required' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized: user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized: invalid or expired token' });
  }
};
