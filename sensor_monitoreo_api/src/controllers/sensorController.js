// src/controllers/sensorController.js - Controlador para gestión de sensores
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sensorController = {
  // Obtener todos los sensores
  obtenerTodos: async (req, res) => {
    try {
      const sensores = await prisma.sensores.findMany({
        orderBy: {
          created_at: 'desc'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Sensores obtenidos exitosamente',
        data: sensores
      });
    } catch (error) {
      console.error('Error al obtener sensores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener sensor por ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const sensor = await prisma.sensores.findUnique({
        where: { id_sensor: id }
      });

      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: `Sensor ${id} no encontrado`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sensor obtenido exitosamente',
        data: sensor
      });
    } catch (error) {
      console.error('Error al obtener sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Crear nuevo sensor
  crear: async (req, res) => {
    try {
      const {
        id_sensor,
        nombre_sensor,
        zona,
        is_movil,
        description
      } = req.body;

      // Validar campos requeridos
      if (!id_sensor || !nombre_sensor) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: id_sensor, nombre_sensor'
        });
      }

      // Verificar que el sensor no exista
      const sensorExistente = await prisma.sensores.findUnique({
        where: { id_sensor }
      });

      if (sensorExistente) {
        return res.status(409).json({
          success: false,
          message: `El sensor ${id_sensor} ya existe`
        });
      }

      // Crear el sensor
      const nuevoSensor = await prisma.sensores.create({
        data: {
          id_sensor,
          nombre_sensor,
          zona: zona || 'Urbana',
          is_movil: is_movil || false,
          description: description || null,
          estado: 'Inactivo'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Sensor creado exitosamente',
        data: nuevoSensor
      });
    } catch (error) {
      console.error('Error al crear sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Actualizar sensor
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombre_sensor,
        zona,
        is_movil,
        description,
        estado
      } = req.body;

      // Verificar que el sensor existe
      const sensorExistente = await prisma.sensores.findUnique({
        where: { id_sensor: id }
      });

      if (!sensorExistente) {
        return res.status(404).json({
          success: false,
          message: `Sensor ${id} no encontrado`
        });
      }

      // Actualizar el sensor
      const sensorActualizado = await prisma.sensores.update({
        where: { id_sensor: id },
        data: {
          ...(nombre_sensor && { nombre_sensor }),
          ...(zona && { zona }),
          ...(is_movil !== undefined && { is_movil }),
          ...(description !== undefined && { description }),
          ...(estado && { estado }),
          updated_at: new Date()
        }
      });

      res.status(200).json({
        success: true,
        message: 'Sensor actualizado exitosamente',
        data: sensorActualizado
      });
    } catch (error) {
      console.error('Error al actualizar sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Eliminar sensor
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el sensor existe
      const sensorExistente = await prisma.sensores.findUnique({
        where: { id_sensor: id }
      });

      if (!sensorExistente) {
        return res.status(404).json({
          success: false,
          message: `Sensor ${id} no encontrado`
        });
      }

      // Verificar si el sensor tiene lecturas recientes (últimas 24 horas)
      const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const lecturasRecientes = await prisma.lecturas.count({
        where: {
          id_sensor: id,
          lectura_datetime: {
            gte: hace24Horas
          }
        }
      });

      if (lecturasRecientes > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el sensor porque tiene lecturas recientes (últimas 24 horas). Desactívalo en su lugar.'
        });
      }

      // Eliminar sensor (las lecturas y alertas se eliminarán en cascada si está configurado en Prisma)
      await prisma.sensores.delete({
        where: { id_sensor: id }
      });

      res.status(200).json({
        success: true,
        message: 'Sensor eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = sensorController;