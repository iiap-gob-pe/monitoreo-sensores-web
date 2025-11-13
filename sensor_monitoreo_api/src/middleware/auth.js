// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en la BD
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: decoded.id_usuario },
      select: {
        id_usuario: true,
        username: true,
        email: true,
        nombre_completo: true,
        rol: true,
        estado: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (usuario.estado !== 'activo') {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar usuario al request
    req.usuario = usuario;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación',
      error: error.message
    });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        rolRequerido: rolesPermitidos,
        tuRol: req.usuario.rol
      });
    }

    next();
  };
};

// Middleware opcional (permite acceso sin token)
const verificarTokenOpcional = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await prisma.usuarios.findUnique({
        where: { id_usuario: decoded.id_usuario },
        select: {
          id_usuario: true,
          username: true,
          email: true,
          nombre_completo: true,
          rol: true,
          estado: true
        }
      });

      if (usuario && usuario.estado === 'activo') {
        req.usuario = usuario;
      }
    }

    next(); // Continuar sin importar si hay token o no

  } catch (error) {
    next(); // Continuar aunque el token sea inválido
  }
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarTokenOpcional
};