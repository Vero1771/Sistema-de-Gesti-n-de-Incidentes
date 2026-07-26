const { verifyToken } = require('../config/auth');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token inválido o expirado'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    if (!user.activo) {
      return res.status(403).json({
        success: false,
        error: 'USER_INACTIVE',
        message: 'Usuario inactivo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Error en la autenticación'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'No tienes permiso para realizar esta acción'
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };