// src/controllers/sensorController.js - Controlador para gestión de sensores
const { prisma } = require('../config/database');
const crypto = require('crypto');

function generarApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Include para traer relaciones en queries
const sensorInclude = {
  sitio: { select: { id_sitio: true, nombre: true, zona: true, referencia_ubicacion: true, latitud: true, longitud: true } },
  campana_sensor: {
    include: { campana: { select: { id_campana: true, nombre: true, zona: true, estado: true, fecha_inicio: true, fecha_fin: true } } }
  }
};

const sensorController = {
  obtenerTodos: async (req, res) => {
    try {
      const sensores = await prisma.sensores.findMany({
        include: sensorInclude,
        orderBy: { created_at: 'desc' }
      });
      // Aplanar campañas
      const data = sensores.map(s => ({
        ...s,
        campanas: s.campana_sensor.map(cs => cs.campana),
        campana_sensor: undefined
      }));
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener sensores:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const sensor = await prisma.sensores.findUnique({
        where: { id_sensor: id },
        include: sensorInclude
      });
      if (!sensor) return res.status(404).json({ success: false, message: `Sensor ${id} no encontrado` });
      const data = {
        ...sensor,
        campanas: sensor.campana_sensor.map(cs => cs.campana),
        campana_sensor: undefined
      };
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear sensor (auto-genera API Key)
  crear: async (req, res) => {
    try {
      const { id_sensor, nombre_sensor, is_movil, description, id_sitio, zona, latitud, longitud, altitud } = req.body;

      if (!id_sensor || !nombre_sensor) {
        return res.status(400).json({ success: false, message: 'Campos requeridos: id_sensor, nombre_sensor' });
      }

      // Estacionarios requieren sitio
      if (!is_movil && !id_sitio) {
        return res.status(400).json({ success: false, message: 'Sensores estacionarios requieren id_sitio' });
      }

      const sensorExistente = await prisma.sensores.findUnique({ where: { id_sensor } });
      if (sensorExistente) {
        return res.status(409).json({ success: false, message: `El sensor ${id_sensor} ya existe` });
      }

      // Si es estacionario, obtener zona y coordenadas del sitio
      let zonaSensor = zona || null;
      let latSensor = latitud ? parseFloat(latitud) : null;
      let lonSensor = longitud ? parseFloat(longitud) : null;
      let altSensor = altitud ? parseFloat(altitud) : null;

      if (!is_movil && id_sitio) {
        const sitio = await prisma.sitios.findUnique({ where: { id_sitio: parseInt(id_sitio) } });
        if (!sitio) return res.status(400).json({ success: false, message: 'Sitio no encontrado' });
        zonaSensor = sitio.zona;
        // Heredar ubicación del sitio si el sensor no tiene propia
        if (!latSensor && sitio.latitud) latSensor = parseFloat(sitio.latitud);
        if (!lonSensor && sitio.longitud) lonSensor = parseFloat(sitio.longitud);
        if (!altSensor && sitio.altitud) altSensor = parseFloat(sitio.altitud);
      }

      const apiKeyPlain = generarApiKey();
      const apiKeyHash = hashApiKey(apiKeyPlain);

      const resultado = await prisma.$transaction(async (tx) => {
        const nuevoSensor = await tx.sensores.create({
          data: {
            id_sensor,
            nombre_sensor,
            is_movil: is_movil || false,
            description: description || null,
            id_sitio: (!is_movil && id_sitio) ? parseInt(id_sitio) : null,
            zona: zonaSensor,
            latitud: latSensor,
            longitud: lonSensor,
            altitud: altSensor,
            estado: 'Inactivo'
          }
        });

        const nuevaApiKey = await tx.api_keys.create({
          data: {
            key_name: `Key-${id_sensor}`,
            api_key: apiKeyHash,
            id_sensor,
            descripcion: `API Key auto-generada para sensor ${nombre_sensor}`,
            created_by: req.usuario.id_usuario,
            esta_activo: true
          }
        });

        return { sensor: nuevoSensor, apiKey: nuevaApiKey };
      });

      res.status(201).json({
        success: true,
        message: 'Sensor creado exitosamente con API Key',
        data: resultado.sensor,
        api_key: {
          id_api_key: resultado.apiKey.id_api_key,
          key_name: resultado.apiKey.key_name,
          api_key_plain: apiKeyPlain,
          mensaje: 'Guarda esta API Key, no se mostrará de nuevo. Úsala en el header X-API-Key del ESP32.'
        }
      });
    } catch (error) {
      console.error('Error al crear sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  regenerarApiKey: async (req, res) => {
    try {
      const { id } = req.params;
      const sensor = await prisma.sensores.findUnique({ where: { id_sensor: id } });
      if (!sensor) return res.status(404).json({ success: false, message: `Sensor ${id} no encontrado` });

      const apiKeyPlain = generarApiKey();
      const apiKeyHash = hashApiKey(apiKeyPlain);

      const resultado = await prisma.$transaction(async (tx) => {
        await tx.api_keys.updateMany({ where: { id_sensor: id }, data: { esta_activo: false } });
        return await tx.api_keys.create({
          data: {
            key_name: `Key-${id}-${Date.now()}`,
            api_key: apiKeyHash,
            id_sensor: id,
            descripcion: `API Key regenerada para sensor ${sensor.nombre_sensor}`,
            created_by: req.usuario.id_usuario,
            esta_activo: true
          }
        });
      });

      res.status(200).json({
        success: true,
        message: 'API Key regenerada. La anterior fue desactivada.',
        api_key: {
          id_api_key: resultado.id_api_key,
          api_key_plain: apiKeyPlain,
          mensaje: 'Guarda esta nueva API Key y actualízala en el ESP32.'
        }
      });
    } catch (error) {
      console.error('Error al regenerar API Key:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre_sensor, is_movil, description, estado, id_sitio, zona, latitud, longitud, altitud } = req.body;

      const sensorExistente = await prisma.sensores.findUnique({ where: { id_sensor: id } });
      if (!sensorExistente) return res.status(404).json({ success: false, message: `Sensor ${id} no encontrado` });

      const sensorActualizado = await prisma.sensores.update({
        where: { id_sensor: id },
        data: {
          ...(nombre_sensor && { nombre_sensor }),
          ...(is_movil !== undefined && { is_movil }),
          ...(description !== undefined && { description }),
          ...(estado && { estado }),
          ...(id_sitio !== undefined && { id_sitio: id_sitio ? parseInt(id_sitio) : null }),
          ...(zona !== undefined && { zona }),
          ...(latitud !== undefined && { latitud: latitud ? parseFloat(latitud) : null }),
          ...(longitud !== undefined && { longitud: longitud ? parseFloat(longitud) : null }),
          ...(altitud !== undefined && { altitud: altitud ? parseFloat(altitud) : null })
        },
        include: sensorInclude
      });

      res.status(200).json({ success: true, message: 'Sensor actualizado', data: sensorActualizado });
    } catch (error) {
      console.error('Error al actualizar sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const sensorExistente = await prisma.sensores.findUnique({ where: { id_sensor: id } });
      if (!sensorExistente) return res.status(404).json({ success: false, message: `Sensor ${id} no encontrado` });

      const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const lecturasRecientes = await prisma.lecturas.count({
        where: { id_sensor: id, lectura_datetime: { gte: hace24Horas } }
      });
      if (lecturasRecientes > 0) {
        return res.status(400).json({ success: false, message: 'No se puede eliminar: tiene lecturas en las últimas 24h. Desactívalo.' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.campana_sensor.deleteMany({ where: { id_sensor: id } });
        await tx.api_keys.deleteMany({ where: { id_sensor: id } });
        await tx.sensores.delete({ where: { id_sensor: id } });
      });

      res.status(200).json({ success: true, message: 'Sensor eliminado' });
    } catch (error) {
      console.error('Error al eliminar sensor:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = sensorController;
