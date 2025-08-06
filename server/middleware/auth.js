const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: req.t('errors.noTokenProvided')
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: req.t('errors.invalidToken')
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: req.t('errors.accountDeactivated')
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: req.t('errors.invalidToken')
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: req.t('errors.tokenExpired')
      });
    }
    
    res.status(500).json({
      success: false,
      error: req.t('errors.internalServerError')
    });
  }
};

module.exports = auth;