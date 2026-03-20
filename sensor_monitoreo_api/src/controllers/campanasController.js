// src/controllers/campanasController.js - Controlador para gestión de campañas de monitoreo
const { prisma } = require('../config/database');
const { filtroVisibilidad } = require('../middleware/visibilidad');

const campanasController = {
  obtenerTodas: async (req, res) => {
    try {
      const campanas = await prisma.campanas_monitoreo.findMany({
        where: filtroVisibilidad(req),
        include: {
          campana_sensor: {
            include: { sensor: { select: { id_sensor: true, nombre_sensor: true, estado: true } } }
          },
          usuario_creador: { select: { username: true, nombre_completo: true } }
        },
        orderBy: { fecha_inicio: 'desc' }
      });
      // Aplanar sensores para facilitar el consumo en frontend
      const data = campanas.map(c => ({
        ...c,
        sensores: c.campana_sensor.map(cs => cs.sensor),
        campana_sensor: undefined
      }));
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const campana = await prisma.campanas_monitoreo.findUnique({
        where: { id_campana: parseInt(id) },
        include: {
          campana_sensor: {
            include: { sensor: { select: { id_sensor: true, nombre_sensor: true, estado: true } } }
          },
          usuario_creador: { select: { username: true, nombre_completo: true } }
        }
      });
      if (!campana) return res.status(404).json({ success: false, message: 'Campaña no encontrada' });
      const data = {
        ...campana,
        sensores: campana.campana_sensor.map(cs => cs.sensor),
        campana_sensor: undefined
      };
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener campaña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  crear: async (req, res) => {
    try {
      const { nombre, descripcion, zona, fecha_inicio, fecha_fin, sensores_ids, visibilidad } = req.body;
      if (!nombre || !zona || !fecha_inicio) {
        return res.status(400).json({ success: false, message: 'Campos requeridos: nombre, zona, fecha_inicio' });
      }
      const campana = await prisma.campanas_monitoreo.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          zona,
          fecha_inicio: new Date(fecha_inicio),
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
          estado: 'planificada',
          visibilidad: visibilidad || 'publico',
          created_by: req.usuario.id_usuario,
          ...(sensores_ids && sensores_ids.length > 0 && {
            campana_sensor: {
              create: sensores_ids.map(id_sensor => ({ id_sensor }))
            }
          })
        },
        include: {
          campana_sensor: {
            include: { sensor: { select: { id_sensor: true, nombre_sensor: true } } }
          }
        }
      });
      res.status(201).json({
        success: true,
        message: 'Campaña creada exitosamente',
        data: { ...campana, sensores: campana.campana_sensor.map(cs => cs.sensor) }
      });
    } catch (error) {
      console.error('Error al crear campaña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, zona, fecha_inicio, fecha_fin, estado, sensores_ids, visibilidad } = req.body;
      const idCampana = parseInt(id);

      // Actualizar campos básicos
      const campana = await prisma.campanas_monitoreo.update({
        where: { id_campana: idCampana },
        data: {
          ...(nombre && { nombre }),
          ...(descripcion !== undefined && { descripcion }),
          ...(zona && { zona }),
          ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
          ...(fecha_fin !== undefined && { fecha_fin: fecha_fin ? new Date(fecha_fin) : null }),
          ...(estado && { estado }),
          ...(visibilidad && { visibilidad })
        }
      });

      // Si se envían sensores_ids, sincronizar la relación
      if (sensores_ids !== undefined) {
        await prisma.campana_sensor.deleteMany({ where: { id_campana: idCampana } });
        if (sensores_ids.length > 0) {
          await prisma.campana_sensor.createMany({
            data: sensores_ids.map(id_sensor => ({ id_campana: idCampana, id_sensor }))
          });
        }
      }

      res.status(200).json({ success: true, message: 'Campaña actualizada', data: campana });
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.campanas_monitoreo.delete({ where: { id_campana: parseInt(id) } });
      res.status(200).json({ success: true, message: 'Campaña eliminada' });
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Agregar sensor a campaña
  agregarSensor: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_sensor } = req.body;
      if (!id_sensor) return res.status(400).json({ success: false, message: 'id_sensor requerido' });

      const asignacion = await prisma.campana_sensor.create({
        data: { id_campana: parseInt(id), id_sensor }
      });
      res.status(201).json({ success: true, message: 'Sensor agregado a la campaña', data: asignacion });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, message: 'El sensor ya está asignado a esta campaña' });
      }
      console.error('Error al agregar sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Quitar sensor de campaña
  quitarSensor: async (req, res) => {
    try {
      const { id, id_sensor } = req.params;
      await prisma.campana_sensor.deleteMany({
        where: { id_campana: parseInt(id), id_sensor }
      });
      res.status(200).json({ success: true, message: 'Sensor removido de la campaña' });
    } catch (error) {
      console.error('Error al quitar sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = campanasController;
