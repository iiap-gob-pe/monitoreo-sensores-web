// backend/src/controllers/perfilController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const perfilController = {
  // Obtener perfil del usuario actual
  obtenerPerfil: async (req, res) => {
    try {
      const { userId } = req.params;
      const id = parseInt(userId);

      console.log('📊 Obteniendo perfil para userId:', id);

      const usuario = await prisma.usuarios.findUnique({
        where: { id_usuario: id },
        select: {
          id_usuario: true,
          nombre_completo: true,
          email: true,
          username: true,
          rol: true,
          estado: true,
          ultimo_acceso: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      console.log('✅ Perfil encontrado:', usuario);

      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  },

  // Actualizar perfil
  actualizarPerfil: async (req, res) => {
    try {
      const { userId } = req.params;
      const id = parseInt(userId);
      const { nombre, email, username } = req.body;

      console.log('📝 Actualizando perfil:', { id, nombre, email, username });

      // Validaciones
      if (!nombre || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y email son obligatorios'
        });
      }

      // Verificar si el email ya existe (excepto para el usuario actual)
      if (email) {
        const emailExiste = await prisma.usuarios.findFirst({
          where: {
            email: email,
            NOT: {
              id_usuario: id
            }
          }
        });

        if (emailExiste) {
          return res.status(400).json({
            success: false,
            message: 'El email ya está registrado por otro usuario'
          });
        }
      }

      // Actualizar usuario
      const usuarioActualizado = await prisma.usuarios.update({
        where: { id_usuario: id },
        data: {
          nombre_completo: nombre,
          email: email,
          username: username || undefined,
          updated_at: new Date()
        },
        select: {
          id_usuario: true,
          nombre_completo: true,
          email: true,
          username: true,
          rol: true,
          estado: true,
          updated_at: true
        }
      });

      // Registrar en logs de actividad
      await prisma.logs_actividad.create({
        data: {
          id_usuario: id,
          username: usuarioActualizado.username,
          accion: 'Actualizó su perfil',
          tabla_afectada: 'usuarios',
          id_registro: id.toString(),
          detalles: `Actualizó nombre, email o username`
        }
      });

      console.log('✅ Perfil actualizado:', usuarioActualizado);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
  },

  // Obtener historial de actividad
  obtenerHistorialActividad: async (req, res) => {
    try {
      const { userId } = req.params;
      const id = parseInt(userId);
      const limite = parseInt(req.query.limite) || 20;

      console.log('📊 Obteniendo historial para userId:', id, 'límite:', limite);

      const historial = await prisma.logs_actividad.findMany({
        where: { id_usuario: id },
        orderBy: { created_at: 'desc' },
        take: limite,
        select: {
          id_log: true,
          accion: true,
          tabla_afectada: true,
          detalles: true,
          created_at: true
        }
      });

      console.log('✅ Historial obtenido:', historial.length, 'registros');

      // Adaptar formato para el frontend
      const historialFormateado = historial.map(log => ({
        actividad_id: log.id_log,
        tipo_actividad: log.tabla_afectada || 'general',
        descripcion: log.accion,
        fecha_actividad: log.created_at,
        detalles: log.detalles
      }));

      res.json({
        success: true,
        data: historialFormateado
      });
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de actividad',
        error: error.message
      });
    }
  },

  // Cambiar contraseña
cambiarContrasena: async (req, res) => {
    try {
      const { userId } = req.params;
      const id = parseInt(userId);
      const { contrasenaActual, contrasenaNueva } = req.body;

      console.log('🔒 Cambiando contraseña para userId:', id);

      if (!contrasenaActual || !contrasenaNueva) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren ambas contraseñas'
        });
      }

      const usuario = await prisma.usuarios.findUnique({
        where: { id_usuario: id },
        select: { password_hash: true, username: true }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // ✅ Validar contraseña actual con bcrypt
      const bcrypt = require('bcryptjs');
      const validPassword = await bcrypt.compare(contrasenaActual, usuario.password_hash);
      
      if (!validPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'La contraseña actual es incorrecta' 
        });
      }

      // ✅ Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(contrasenaNueva, 10);

      // ✅ Actualizar contraseña en la BD
      await prisma.usuarios.update({
        where: { id_usuario: id },
        data: { 
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      });

      // Registrar en logs
      await prisma.logs_actividad.create({
        data: {
          id_usuario: id,
          username: usuario.username,
          accion: 'Cambió su contraseña',
          tabla_afectada: 'usuarios',
          id_registro: id.toString(),
          detalles: 'Contraseña actualizada exitosamente'
        }
      });

      console.log('✅ Contraseña actualizada con hash bcrypt');

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }
};

module.exports = perfilController;