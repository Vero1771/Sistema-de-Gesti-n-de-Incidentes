const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../config/auth');

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE_EMAIL',
        message: 'El email ya está registrado'
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      nombre,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos'
      });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    });
  }
};

module.exports = { register, login, getMe };