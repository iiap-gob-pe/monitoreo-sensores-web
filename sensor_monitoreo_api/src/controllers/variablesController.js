// src/controllers/variablesController.js
const { prisma } = require('../config/database');

const variablesController = {
  obtenerTodas: async (req, res) => {
    try {
      const variables = await prisma.variables.findMany({
        orderBy: { id_variable: 'asc' },
        include: { sensor_variable: { select: { id_sensor: true } } }
      });
      const data = variables.map(v => ({
        ...v,
        sensores_count: v.sensor_variable.length,
        sensor_variable: undefined
      }));
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener variables:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const variable = await prisma.variables.findUnique({
        where: { id_variable: parseInt(id) },
        include: {
          sensor_variable: {
            include: { sensor: { select: { id_sensor: true, nombre_sensor: true, estado: true } } }
          }
        }
      });
      if (!variable) return res.status(404).json({ success: false, message: 'Variable no encontrada' });
      res.status(200).json({ success: true, data: variable });
    } catch (error) {
      console.error('Error al obtener variable:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  crear: async (req, res) => {
    try {
      const { codigo, nombre, unidad, descripcion, rango_min, rango_max, color, icono } = req.body;
      if (!codigo || !nombre || !unidad) {
        return res.status(400).json({ success: false, message: 'Campos requeridos: codigo, nombre, unidad' });
      }
      const existente = await prisma.variables.findUnique({ where: { codigo } });
      if (existente) return res.status(409).json({ success: false, message: `La variable "${codigo}" ya existe` });

      const variable = await prisma.variables.create({
        data: {
          codigo: codigo.toLowerCase().replace(/\s+/g, '_'),
          nombre, unidad,
          descripcion: descripcion || null,
          rango_min: rango_min != null ? parseFloat(rango_min) : null,
          rango_max: rango_max != null ? parseFloat(rango_max) : null,
          color: color || null,
          icono: icono || null
        }
      });
      res.status(201).json({ success: true, message: 'Variable creada', data: variable });
    } catch (error) {
      console.error('Error al crear variable:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, unidad, descripcion, rango_min, rango_max, color, icono, estado } = req.body;
      const variable = await prisma.variables.update({
        where: { id_variable: parseInt(id) },
        data: {
          ...(nombre && { nombre }),
          ...(unidad && { unidad }),
          ...(descripcion !== undefined && { descripcion }),
          ...(rango_min !== undefined && { rango_min: rango_min != null ? parseFloat(rango_min) : null }),
          ...(rango_max !== undefined && { rango_max: rango_max != null ? parseFloat(rango_max) : null }),
          ...(color !== undefined && { color }),
          ...(icono !== undefined && { icono }),
          ...(estado && { estado })
        }
      });
      res.status(200).json({ success: true, message: 'Variable actualizada', data: variable });
    } catch (error) {
      console.error('Error al actualizar variable:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const enUso = await prisma.lectura_valores.count({ where: { id_variable: parseInt(id) } });
      if (enUso > 0) {
        return res.status(400).json({ success: false, message: `No se puede eliminar: tiene ${enUso} lecturas asociadas. Desactívala en su lugar.` });
      }
      await prisma.$transaction([
        prisma.sensor_variable.deleteMany({ where: { id_variable: parseInt(id) } }),
        prisma.variables.delete({ where: { id_variable: parseInt(id) } })
      ]);
      res.status(200).json({ success: true, message: 'Variable eliminada' });
    } catch (error) {
      console.error('Error al eliminar variable:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener configuración de variables de un sensor
  obtenerVariablesSensor: async (req, res) => {
    try {
      const { id_sensor } = req.params;
      const config = await prisma.sensor_variable.findMany({
        where: { id_sensor },
        include: { variable: true },
        orderBy: { orden_csv: 'asc' }
      });
      res.status(200).json({ success: true, data: config });
    } catch (error) {
      console.error('Error al obtener variables del sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Asignar/actualizar variables de un sensor (reemplaza toda la config)
  asignarVariablesSensor: async (req, res) => {
    try {
      const { id_sensor } = req.params;
      const { variables } = req.body; // Array de { id_variable, orden_csv }

      if (!Array.isArray(variables)) {
        return res.status(400).json({ success: false, message: 'Se requiere un array de variables con id_variable y orden_csv' });
      }

      // Verificar sensor existe
      const sensor = await prisma.sensores.findUnique({ where: { id_sensor } });
      if (!sensor) return res.status(404).json({ success: false, message: 'Sensor no encontrado' });

      // Reemplazar toda la configuración en transacción
      await prisma.$transaction(async (tx) => {
        await tx.sensor_variable.deleteMany({ where: { id_sensor } });
        if (variables.length > 0) {
          await tx.sensor_variable.createMany({
            data: variables.map(v => ({
              id_sensor,
              id_variable: parseInt(v.id_variable),
              orden_csv: parseInt(v.orden_csv)
            }))
          });
        }
      });

      // Devolver la config actualizada
      const config = await prisma.sensor_variable.findMany({
        where: { id_sensor },
        include: { variable: true },
        orderBy: { orden_csv: 'asc' }
      });

      res.status(200).json({
        success: true,
        message: `${variables.length} variable(s) configurada(s) para el sensor`,
        data: config
      });
    } catch (error) {
      console.error('Error al asignar variables:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Orden CSV duplicado o variable duplicada en el sensor' });
      }
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = variablesController;
