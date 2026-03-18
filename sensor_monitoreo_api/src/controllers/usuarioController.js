// src/controllers/usuarioController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const usuarioController = {
  // Obtener todos los usuarios (solo admin)
  obtenerTodos: async (req, res) => {
    try {
      const usuarios = await prisma.usuarios.findMany({
        select: {
          id_usuario: true,
          username: true,
          email: true,
          nombre_completo: true,
          rol: true,
          estado: true,
          ultimo_acceso: true,
          created_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      res.status(200).json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Crear usuario (solo admin)
  crear: async (req, res) => {
    try {
      const { username, email, password, nombre_completo, rol } = req.body;

      // Validar campos requeridos
      if (!username || !email || !password || !nombre_completo || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Validar rol
      if (!['admin', 'analista'].includes(rol)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser "admin" o "analista"'
        });
      }

      // Verificar si ya existe
      const usuarioExistente = await prisma.usuarios.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: usuarioExistente.username === username 
            ? 'El username ya está en uso' 
            : 'El email ya está registrado'
        });
      }

      // Encriptar password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Crear usuario
      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          username,
          email,
          password_hash,
          nombre_completo,
          rol
        },
        select: {
          id_usuario: true,
          username: true,
          email: true,
          nombre_completo: true,
          rol: true,
          estado: true,
          created_at: true
        }
      });

      // Registrar log
      await prisma.logs_actividad.create({
        data: {
          id_usuario: req.usuario.id_usuario,
          username: req.usuario.username,
          accion: 'crear_usuario',
          tabla_afectada: 'usuarios',
          id_registro: nuevoUsuario.id_usuario.toString(),
          detalles: `Usuario creado: ${nuevoUsuario.username} (${nuevoUsuario.rol})`,
          ip_address: req.ip || req.connection.remoteAddress
        }
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: nuevoUsuario
      });

    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear usuario',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Actualizar usuario (solo admin)
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, nombre_completo, rol, estado, password } = req.body;

      const dataActualizar = {
        ...(email && { email }),
        ...(nombre_completo && { nombre_completo }),
        ...(rol && { rol }),
        ...(estado && { estado }),
        updated_at: new Date()
      };

      // Si se proporciona nueva contraseña
      if (password) {
        const salt = await bcrypt.genSalt(10);
        dataActualizar.password_hash = await bcrypt.hash(password, salt);
      }

      const usuarioActualizado = await prisma.usuarios.update({
        where: { id_usuario: parseInt(id) },
        data: dataActualizar,
        select: {
          id_usuario: true,
          username: true,
          email: true,
          nombre_completo: true,
          rol: true,
          estado: true,
          updated_at: true
        }
      });

      // Registrar log
      await prisma.logs_actividad.create({
        data: {
          id_usuario: req.usuario.id_usuario,
          username: req.usuario.username,
          accion: 'actualizar_usuario',
          tabla_afectada: 'usuarios',
          id_registro: id,
          detalles: `Usuario actualizado: ${usuarioActualizado.username}`,
          ip_address: req.ip || req.connection.remoteAddress
        }
      });

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Eliminar usuario (solo admin)
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      // No permitir eliminar al propio admin
      if (parseInt(id) === req.usuario.id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propio usuario'
        });
      }

      const usuario = await prisma.usuarios.findUnique({
        where: { id_usuario: parseInt(id) }
      });

      await prisma.usuarios.delete({
        where: { id_usuario: parseInt(id) }
      });

      // Registrar log
      await prisma.logs_actividad.create({
        data: {
          id_usuario: req.usuario.id_usuario,
          username: req.usuario.username,
          accion: 'eliminar_usuario',
          tabla_afectada: 'usuarios',
          id_registro: id,
          detalles: `Usuario eliminado: ${usuario.username}`,
          ip_address: req.ip || req.connection.remoteAddress
        }
      });

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Obtener logs de actividad (solo admin)
  obtenerLogs: async (req, res) => {
    try {
      const { limite = 100, id_usuario, accion } = req.query;

      const filtros = {};
      if (id_usuario) filtros.id_usuario = parseInt(id_usuario);
      if (accion) filtros.accion = accion;

      const logs = await prisma.logs_actividad.findMany({
        where: filtros,
        orderBy: {
          created_at: 'desc'
        },
        take: parseInt(limite),
        include: {
          usuario: {
            select: {
              username: true,
              nombre_completo: true,
              rol: true
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        data: logs,
        total: logs.length
      });

    } catch (error) {
      console.error('Error al obtener logs:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener logs',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
};

module.exports = usuarioController;