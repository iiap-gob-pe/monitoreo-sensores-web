// src/controllers/apiLogsController.js - Controlador para consultar logs de API
const { prisma } = require('../config/database');

const apiLogsController = {
  obtenerLogs: async (req, res) => {
    try {
      const {
        endpoint,
        status,
        id_sensor,
        limite = 100,
        desde,
        solo_errores
      } = req.query;

      const where = {};

      if (endpoint) {
        where.endpoint = { contains: endpoint };
      }

      if (status) {
        where.status_code = parseInt(status);
      }

      if (id_sensor) {
        where.id_sensor = id_sensor;
      }

      if (solo_errores === 'true') {
        where.status_code = { gte: 400 };
      }

      if (desde) {
        where.timestamp = { gte: new Date(desde) };
      }

      const logs = await prisma.api_logs.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: Math.min(parseInt(limite), 500)
      });

      // Estadísticas rápidas
      const totalHoy = await prisma.api_logs.count({
        where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
      });

      const erroresHoy = await prisma.api_logs.count({
        where: {
          timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status_code: { gte: 400 }
        }
      });

      const exitososHoy = totalHoy - erroresHoy;

      res.status(200).json({
        success: true,
        data: logs,
        stats: {
          total_hoy: totalHoy,
          exitosos_hoy: exitososHoy,
          errores_hoy: erroresHoy
        }
      });
    } catch (error) {
      console.error('Error al obtener logs:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener endpoints únicos para el filtro
  obtenerEndpoints: async (req, res) => {
    try {
      const endpoints = await prisma.api_logs.groupBy({
        by: ['endpoint'],
        _count: { endpoint: true },
        orderBy: { _count: { endpoint: 'desc' } }
      });

      res.status(200).json({
        success: true,
        data: endpoints.map(e => ({ endpoint: e.endpoint, count: e._count.endpoint }))
      });
    } catch (error) {
      console.error('Error al obtener endpoints:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = apiLogsController;
