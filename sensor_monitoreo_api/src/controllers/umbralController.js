// src/controllers/umbralController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const umbralController = {
  obtenerTodos: async (req, res) => {
    try {
      const umbrales = await prisma.sensor_umbral.findMany({
        orderBy: [
          { id_sensor: 'asc' },
          { parametro_nombre: 'asc' }
        ]
      });

      res.status(200).json({
        success: true,
        data: umbrales
      });
    } catch (error) {
      console.error('Error al obtener umbrales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  crear: async (req, res) => {
    try {
      const {
        id_sensor,
        parametro_nombre,
        min_umbral,
        max_umbral,
        alerta_habilitar
      } = req.body;

      if (!id_sensor || !parametro_nombre) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: id_sensor, parametro_nombre'
        });
      }

      // Verificar que el sensor existe
      const sensor = await prisma.sensores.findUnique({
        where: { id_sensor }
      });

      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: `Sensor ${id_sensor} no encontrado`
        });
      }

      // Verificar si ya existe un umbral para este sensor y parámetro
      const umbralExistente = await prisma.sensor_umbral.findFirst({
        where: {
          id_sensor,
          parametro_nombre
        }
      });

      if (umbralExistente) {
        return res.status(409).json({
          success: false,
          message: `Ya existe un umbral de ${parametro_nombre} para el sensor ${id_sensor}`
        });
      }

      const nuevoUmbral = await prisma.sensor_umbral.create({
        data: {
          id_sensor,
          parametro_nombre,
          min_umbral: min_umbral !== null ? parseFloat(min_umbral) : null,
          max_umbral: max_umbral !== null ? parseFloat(max_umbral) : null,
          alerta_habilitar: alerta_habilitar !== undefined ? alerta_habilitar : true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Umbral creado exitosamente',
        data: nuevoUmbral
      });
    } catch (error) {
      console.error('Error al crear umbral:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        min_umbral,
        max_umbral,
        alerta_habilitar
      } = req.body;

      const umbral = await prisma.sensor_umbral.findUnique({
        where: { id_sensor_umbral: parseInt(id) }
      });

      if (!umbral) {
        return res.status(404).json({
          success: false,
          message: 'Umbral no encontrado'
        });
      }

      const umbralActualizado = await prisma.sensor_umbral.update({
        where: { id_sensor_umbral: parseInt(id) },
        data: {
          ...(min_umbral !== undefined && { min_umbral: min_umbral !== null ? parseFloat(min_umbral) : null }),
          ...(max_umbral !== undefined && { max_umbral: max_umbral !== null ? parseFloat(max_umbral) : null }),
          ...(alerta_habilitar !== undefined && { alerta_habilitar })
        }
      });

      res.status(200).json({
        success: true,
        message: 'Umbral actualizado exitosamente',
        data: umbralActualizado
      });
    } catch (error) {
      console.error('Error al actualizar umbral:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const umbral = await prisma.sensor_umbral.findUnique({
        where: { id_sensor_umbral: parseInt(id) }
      });

      if (!umbral) {
        return res.status(404).json({
          success: false,
          message: 'Umbral no encontrado'
        });
      }

      await prisma.sensor_umbral.delete({
        where: { id_sensor_umbral: parseInt(id) }
      });

      res.status(200).json({
        success: true,
        message: 'Umbral eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar umbral:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = umbralController;