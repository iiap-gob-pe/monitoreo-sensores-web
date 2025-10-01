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
        },
        include: {
          _count: {
            select: {
              lecturas: true,
              alertas: {
                where: {
                  is_resolved: false
                }
              }
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Sensores obtenidos exitosamente',
        data: sensores,
        total: sensores.length
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
        where: {
          id_sensor: id
        },
        include: {
          sensor_umbral: true,
          _count: {
            select: {
              lecturas: true,
              alertas: {
                where: {
                  is_resolved: false
                }
              }
            }
          }
        }
      });

      if (!sensor) {                                                    
        return res.status(404).json({
          success: false,
          message: `Sensor con ID ${id} no encontrado`
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
      const { id_sensor, nombre_sensor, zona, is_movil, description } = req.body;

      // Validar campos requeridos
      if (!id_sensor || !nombre_sensor || !zona) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: id_sensor, nombre_sensor, zona'
        });
      }

      // Validar zona
      if (!['Urbana', 'Rural'].includes(zona)) {
        return res.status(400).json({
          success: false,
          message: 'La zona debe ser "Urbana" o "Rural"'
        });
      }

      // Verificar si ya existe un sensor con ese ID
      const sensorExistente = await prisma.sensores.findUnique({
        where: { id_sensor }
      });

      if (sensorExistente) {
        return res.status(409).json({
          success: false,
          message: `Ya existe un sensor con ID ${id_sensor}`
        });
      }

      const nuevoSensor = await prisma.sensores.create({
        data: {
          id_sensor,
          nombre_sensor,
          zona,
          is_movil: is_movil || false,
          description
        }
      });

      // Crear umbrales por defecto
      const umbralesDefault = zona === 'Urbana' ? [
        { parametro_nombre: 'Temperatura', min_umbral: 5.0, max_umbral: 35.0 },
        { parametro_nombre: 'Humedad', min_umbral: 20.0, max_umbral: 80.0 },
        { parametro_nombre: 'co2', min_umbral: 300.0, max_umbral: 1000.0 },
        { parametro_nombre: 'co', min_umbral: 0.0, max_umbral: 9.0 }
      ] : [
        { parametro_nombre: 'Temperatura', min_umbral: 0.0, max_umbral: 40.0 },
        { parametro_nombre: 'Humedad', min_umbral: 10.0, max_umbral: 90.0 },
        { parametro_nombre: 'co2', min_umbral: 300.0, max_umbral: 800.0 },
        { parametro_nombre: 'co', min_umbral: 0.0, max_umbral: 5.0 }
      ];

      await prisma.sensor_umbral.createMany({
        data: umbralesDefault.map(umbral => ({
          id_sensor,
          ...umbral
        }))
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
      const { nombre_sensor, zona, is_movil, description, estado } = req.body;

      const sensor = await prisma.sensores.findUnique({
        where: { id_sensor: id }
      });

      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: `Sensor con ID ${id} no encontrado`
        });
      }

      const sensorActualizado = await prisma.sensores.update({
        where: { id_sensor: id },
        data: {
          ...(nombre_sensor && { nombre_sensor }),
          ...(zona && { zona }),
          ...(typeof is_movil !== 'undefined' && { is_movil }),
          ...(description && { description }),
          ...(estado && { estado })
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

      const sensor = await prisma.sensores.findUnique({
        where: { id_sensor: id }
      });

      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: `Sensor con ID ${id} no encontrado`
        });
      }

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
  },


  
  // Actualizar último visto (para ESP32)
  actualizarUltimoVisto: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.sensores.update({
        where: { id_sensor: id },
        data: { last_seen: new Date() }
      });

      res.status(200).json({
        success: true,
        message: 'Último visto actualizado'
      });
    } catch (error) {
      console.error('Error al actualizar último visto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = sensorController;