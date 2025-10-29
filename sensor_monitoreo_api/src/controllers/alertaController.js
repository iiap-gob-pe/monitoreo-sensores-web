// src/controllers/alertaController.js - Controlador para gestión de alertas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const alertaController = {
  // Obtener todas las alertas
  obtenerTodas: async (req, res) => {
    try {
      const {
        sensor_id,
        gravedad,
        resueltas,
        limite = 100000,
        pagina = 1
      } = req.query;

      const skip = (parseInt(pagina) - 1) * parseInt(limite);

      const filtros = {
        ...(sensor_id && { id_sensor: sensor_id }),
        ...(gravedad && { gravedad }),
        ...(resueltas !== undefined && { 
          is_resolved: resueltas === 'true' 
        })
      };

      const [alertas, total] = await Promise.all([
        prisma.alertas.findMany({
          where: filtros,
          include: {
            sensor: {
              select: {
                nombre_sensor: true,
                zona: true,
                is_movil: true
              }
            }
          },
          orderBy: {
            se_activo_at: 'desc'
          },
          skip,
          take: parseInt(limite)
        }),
        prisma.alertas.count({ where: filtros })
      ]);

      res.status(200).json({
        success: true,
        message: 'Alertas obtenidas exitosamente',
        data: alertas,
        pagination: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total_paginas: Math.ceil(total / parseInt(limite))
        }
      });

    } catch (error) {
      console.error('Error al obtener alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener alertas activas (no resueltas)
  obtenerActivas: async (req, res) => {
    try {
      const alertasActivas = await prisma.alertas.findMany({
        where: {
          is_resolved: false
        },
        include: {
          sensor: {
            select: {
              nombre_sensor: true,
              zona: true,
              is_movil: true
            }
          }
        },
        orderBy: [
          { gravedad: 'desc' },
          { se_activo_at: 'desc' }
        ]
      });

      // Contar alertas por gravedad
      const conteoGravedad = await prisma.alertas.groupBy({
        by: ['gravedad'],
        where: {
          is_resolved: false
        },
        _count: {
          gravedad: true
        }
      });

      const estadisticas = {
        total: alertasActivas.length,
        por_gravedad: conteoGravedad.reduce((acc, item) => {
          acc[item.gravedad] = item._count.gravedad;
          return acc;
        }, {})
      };

      res.status(200).json({
        success: true,
        message: 'Alertas activas obtenidas exitosamente',
        data: alertasActivas,
        estadisticas
      });

    } catch (error) {
      console.error('Error al obtener alertas activas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener alertas de un sensor específico
  obtenerPorSensor: async (req, res) => {
    try {
      const { id } = req.params;
      const { limite = 20 } = req.query;

      const alertas = await prisma.alertas.findMany({
        where: { id_sensor: id },
        include: {
          sensor: {
            select: {
              nombre_sensor: true,
              zona: true,
              is_movil: true
            }
          }
        },
        orderBy: {
          se_activo_at: 'desc'
        },
        take: parseInt(limite)
      });

      if (alertas.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No se encontraron alertas para el sensor ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Alertas del sensor obtenidas exitosamente',
        data: alertas,
        total: alertas.length
      });

    } catch (error) {
      console.error('Error al obtener alertas del sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Resolver una alerta
  resolver: async (req, res) => {
    try {
      const { id } = req.params;
      const { nota } = req.body;

      const alerta = await prisma.alertas.findUnique({
        where: { id_alerta: parseInt(id) }
      });

      if (!alerta) {
        return res.status(404).json({
          success: false,
          message: `Alerta con ID ${id} no encontrada`
        });
      }

      if (alerta.is_resolved) {
        return res.status(400).json({
          success: false,
          message: 'La alerta ya está resuelta'
        });
      }

      const alertaResuelta = await prisma.alertas.update({
        where: { id_alerta: parseInt(id) },
        data: {
          is_resolved: true,
          resuelto_at: new Date(),
          mensaje: nota ? `${alerta.mensaje} - Nota: ${nota}` : alerta.mensaje
        }
      });

      res.status(200).json({
        success: true,
        message: 'Alerta resuelta exitosamente',
        data: alertaResuelta
      });

    } catch (error) {
      console.error('Error al resolver alerta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Resolver múltiples alertas
  resolverMultiples: async (req, res) => {
    try {
      const { alertas_ids, nota } = req.body;

      if (!Array.isArray(alertas_ids) || alertas_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de IDs de alertas'
        });
      }

      const resultado = await prisma.alertas.updateMany({
        where: {
          id_alerta: { in: alertas_ids.map(id => parseInt(id)) },
          is_resolved: false
        },
        data: {
          is_resolved: true,
          resuelto_at: new Date()
        }
      });

      res.status(200).json({
        success: true,
        message: `${resultado.count} alertas resueltas exitosamente`,
        data: { alertas_resueltas: resultado.count }
      });

    } catch (error) {
      console.error('Error al resolver múltiples alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener estadísticas de alertas
  obtenerEstadisticas: async (req, res) => {
    try {
      const { dias = 30 } = req.query;
      
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

      // Estadísticas generales
      const [totalAlertas, alertasActivas, alertasPorGravedad, alertasPorSensor] = await Promise.all([
        // Total de alertas en el período
        prisma.alertas.count({
          where: {
            se_activo_at: { gte: fechaInicio }
          }
        }),
        
        // Alertas activas
        prisma.alertas.count({
          where: { is_resolved: false }
        }),
        
        // Alertas por gravedad
        prisma.alertas.groupBy({
          by: ['gravedad'],
          where: {
            se_activo_at: { gte: fechaInicio }
          },
          _count: { gravedad: true }
        }),
        
        // Alertas por sensor
        prisma.alertas.groupBy({
          by: ['id_sensor'],
          where: {
            se_activo_at: { gte: fechaInicio }
          },
          _count: { id_sensor: true },
          orderBy: {
            _count: { id_sensor: 'desc' }
          },
          take: 5
        })
      ]);

      // Obtener nombres de sensores para las estadísticas
      const sensoresInfo = await prisma.sensores.findMany({
        where: {
          id_sensor: { in: alertasPorSensor.map(item => item.id_sensor) }
        },
        select: {
          id_sensor: true,
          nombre_sensor: true
        }
      });

      const alertasPorSensorConNombres = alertasPorSensor.map(item => ({
        ...item,
        nombre_sensor: sensoresInfo.find(s => s.id_sensor === item.id_sensor)?.nombre_sensor || item.id_sensor
      }));

      res.status(200).json({
        success: true,
        message: 'Estadísticas de alertas obtenidas exitosamente',
        data: {
          periodo_dias: parseInt(dias),
          resumen: {
            total_alertas: totalAlertas,
            alertas_activas: alertasActivas,
            alertas_resueltas: totalAlertas - alertasActivas
          },
          por_gravedad: alertasPorGravedad.reduce((acc, item) => {
            acc[item.gravedad] = item._count.gravedad;
            return acc;
          }, {}),
          top_sensores: alertasPorSensorConNombres
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Crear alerta manual
  crear: async (req, res) => {
    try {
      const {
        id_sensor,
        alerta_tipo,
        parametro_nombre,
        mensaje,
        gravedad = 'Medio'
      } = req.body;

      // Validar campos requeridos
      if (!id_sensor || !alerta_tipo || !mensaje) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: id_sensor, alerta_tipo, mensaje'
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

      const nuevaAlerta = await prisma.alertas.create({
        data: {
          id_sensor,
          alerta_tipo,
          parametro_nombre,
          mensaje,
          gravedad
        }
      });

      res.status(201).json({
        success: true,
        message: 'Alerta creada exitosamente',
        data: nuevaAlerta
      });

    } catch (error) {
      console.error('Error al crear alerta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = alertaController;