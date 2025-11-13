// src/controllers/preferenciasSistemaController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const preferenciasSistemaController = {
  // GET /api/preferencias-sistema/:id_usuario
  obtener: async (req, res) => {
    try {
      const { id_usuario } = req.params;

      const preferencias = await prisma.preferencias_sistema.findUnique({
        where: { id_usuario: parseInt(id_usuario) }
      });

      if (!preferencias) {
        // Si no existe, devolver preferencias por defecto
        return res.status(200).json({
          success: true,
          data: {
            id_usuario: parseInt(id_usuario),
            zona_horaria: 'America/Lima',
            formato_fecha: 'DD/MM/YYYY',
            intervalo_actualizacion: 30,
            registros_por_pagina: 20,
            mostrar_graficos: true,
            animaciones_graficos: true
          }
        });
      }

      res.status(200).json({
        success: true,
        data: preferencias
      });
    } catch (error) {
      console.error('Error al obtener preferencias del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // POST /api/preferencias-sistema
  crear: async (req, res) => {
    try {
      const {
        id_usuario,
        zona_horaria,
        formato_fecha,
        intervalo_actualizacion,
        registros_por_pagina,
        mostrar_graficos,
        animaciones_graficos
      } = req.body;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'El id_usuario es requerido'
        });
      }

      // Verificar si ya existe
      const existente = await prisma.preferencias_sistema.findUnique({
        where: { id_usuario: parseInt(id_usuario) }
      });

      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existen preferencias para este usuario. Use PATCH para actualizar.'
        });
      }

      const nuevasPreferencias = await prisma.preferencias_sistema.create({
        data: {
          id_usuario: parseInt(id_usuario),
          zona_horaria,
          formato_fecha,
          intervalo_actualizacion,
          registros_por_pagina,
          mostrar_graficos,
          animaciones_graficos
        }
      });

      res.status(201).json({
        success: true,
        message: 'Preferencias del sistema creadas',
        data: nuevasPreferencias
      });
    } catch (error) {
      console.error('Error al crear preferencias del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // PATCH /api/preferencias-sistema/:id_usuario
  actualizar: async (req, res) => {
    try {
      const { id_usuario } = req.params;
      const datosActualizar = req.body;

      // Verificar si existe
      const existente = await prisma.preferencias_sistema.findUnique({
        where: { id_usuario: parseInt(id_usuario) }
      });

      let preferenciasActualizadas;

      if (!existente) {
        // Si no existe, crear nueva
        preferenciasActualizadas = await prisma.preferencias_sistema.create({
          data: {
            id_usuario: parseInt(id_usuario),
            ...datosActualizar
          }
        });
      } else {
        // Si existe, actualizar
        preferenciasActualizadas = await prisma.preferencias_sistema.update({
          where: { id_usuario: parseInt(id_usuario) },
          data: datosActualizar
        });
      }

      res.status(200).json({
        success: true,
        message: 'Preferencias del sistema actualizadas',
        data: preferenciasActualizadas
      });
    } catch (error) {
      console.error('Error al actualizar preferencias del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = preferenciasSistemaController;
