const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    // Get vendor from the token
    req.vendor = await Vendor.findById(decoded.id);

    if (!req.vendor) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.vendor.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.vendor.role} is not authorized to access this route`
      });
    }
    next();
  };
};