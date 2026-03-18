// src/controllers/sitiosController.js - Controlador para gestión de sitios
const { prisma } = require('../config/database');

const sitiosController = {
  obtenerTodos: async (req, res) => {
    try {
      const sitios = await prisma.sitios.findMany({
        include: { sensores: { select: { id_sensor: true, nombre_sensor: true, estado: true } } },
        orderBy: { created_at: 'desc' }
      });
      res.status(200).json({ success: true, data: sitios });
    } catch (error) {
      console.error('Error al obtener sitios:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const sitio = await prisma.sitios.findUnique({
        where: { id_sitio: parseInt(id) },
        include: { sensores: { select: { id_sensor: true, nombre_sensor: true, estado: true } } }
      });
      if (!sitio) return res.status(404).json({ success: false, message: 'Sitio no encontrado' });
      res.status(200).json({ success: true, data: sitio });
    } catch (error) {
      console.error('Error al obtener sitio:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  crear: async (req, res) => {
    try {
      const { nombre, descripcion, referencia_ubicacion, latitud, longitud, altitud, zona } = req.body;
      if (!nombre || !zona || !latitud || !longitud) {
        return res.status(400).json({ success: false, message: 'Campos requeridos: nombre, zona, latitud, longitud' });
      }
      const sitio = await prisma.sitios.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          referencia_ubicacion: referencia_ubicacion || null,
          latitud: latitud ? parseFloat(latitud) : null,
          longitud: longitud ? parseFloat(longitud) : null,
          altitud: altitud ? parseFloat(altitud) : null,
          zona
        }
      });
      res.status(201).json({ success: true, message: 'Sitio creado exitosamente', data: sitio });
    } catch (error) {
      console.error('Error al crear sitio:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, referencia_ubicacion, latitud, longitud, altitud, zona, estado } = req.body;
      const sitio = await prisma.sitios.update({
        where: { id_sitio: parseInt(id) },
        data: {
          ...(nombre && { nombre }),
          ...(descripcion !== undefined && { descripcion }),
          ...(referencia_ubicacion !== undefined && { referencia_ubicacion }),
          ...(latitud !== undefined && { latitud: latitud ? parseFloat(latitud) : null }),
          ...(longitud !== undefined && { longitud: longitud ? parseFloat(longitud) : null }),
          ...(altitud !== undefined && { altitud: altitud ? parseFloat(altitud) : null }),
          ...(zona && { zona }),
          ...(estado && { estado })
        }
      });
      res.status(200).json({ success: true, message: 'Sitio actualizado', data: sitio });
    } catch (error) {
      console.error('Error al actualizar sitio:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const sensoresAsociados = await prisma.sensores.count({ where: { id_sitio: parseInt(id) } });
      if (sensoresAsociados > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar: tiene ${sensoresAsociados} sensor(es) asociado(s). Reasígnalos primero.`
        });
      }
      await prisma.sitios.delete({ where: { id_sitio: parseInt(id) } });
      res.status(200).json({ success: true, message: 'Sitio eliminado' });
    } catch (error) {
      console.error('Error al eliminar sitio:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = sitiosController;
