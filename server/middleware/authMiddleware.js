const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwttokenforlastmiledeliverytracker');

      // Fetch user from DB
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User matching token no longer exists.' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'User account has been deactivated.' });
      }

      // Attach user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
