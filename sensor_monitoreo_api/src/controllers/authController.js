// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validar campos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Buscar usuario
      const usuario = await prisma.usuarios.findUnique({
        where: { username }
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar estado
      if (usuario.estado !== 'activo') {
        return res.status(403).json({
          success: false,
          message: 'Usuario inactivo. Contacta al administrador.'
        });
      }

      // Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.password_hash);

      if (!passwordValido) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          username: usuario.username,
          rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Actualizar último acceso
      await prisma.usuarios.update({
        where: { id_usuario: usuario.id_usuario },
        data: { ultimo_acceso: new Date() }
      });

      // Registrar log
      await prisma.logs_actividad.create({
        data: {
          id_usuario: usuario.id_usuario,
          username: usuario.username,
          accion: 'login',
          detalles: 'Inicio de sesión exitoso',
          ip_address: req.ip || req.connection.remoteAddress
        }
      });

      // Responder con token y datos del usuario
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          username: usuario.username,
          email: usuario.email,
          nombre_completo: usuario.nombre_completo,
          rol: usuario.rol
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  },

  // Verificar token (para saber si el usuario sigue autenticado)
  verificar: async (req, res) => {
    try {
      // El middleware ya verificó el token y agregó req.usuario
      res.status(200).json({
        success: true,
        usuario: req.usuario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar token',
        error: error.message
      });
    }
  },

  // Logout (opcional - el JWT se invalida en el frontend)
  logout: async (req, res) => {
    try {
      // Registrar log
      await prisma.logs_actividad.create({
        data: {
          id_usuario: req.usuario.id_usuario,
          username: req.usuario.username,
          accion: 'logout',
          detalles: 'Cierre de sesión',
          ip_address: req.ip || req.connection.remoteAddress
        }
      });

      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión',
        error: error.message
      });
    }
  }
};

module.exports = authController;