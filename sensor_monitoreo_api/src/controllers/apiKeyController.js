// src/controllers/apiKeyController.js - Controlador para gestión de API Keys
const { prisma } = require('../config/database');
const crypto = require('crypto');

/**
 * Genera una API Key aleatoria segura
 */
function generarApiKeyAleatoria() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Crea un hash SHA256 de la API Key
 */
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Obtener todas las API Keys (solo para admins)
 * GET /api/admin/api-keys
 */
exports.obtenerTodas = async (req, res) => {
  try {
    const apiKeys = await prisma.api_keys.findMany({
      include: {
        usuario_creador: {
          select: {
            id_usuario: true,
            username: true,
            nombre_completo: true
          }
        },
        sensor: {
          select: {
            id_sensor: true,
            nombre_sensor: true,
            zona: true,
            estado: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // No enviar las API Keys hasheadas al frontend por seguridad
    const apiKeysSinHash = apiKeys.map(key => ({
      id_api_key: key.id_api_key,
      key_name: key.key_name,
      id_sensor: key.id_sensor,
      sensor: key.sensor,
      descripcion: key.descripcion,
      esta_activo: key.esta_activo,
      ultima_uso: key.ultima_uso,
      created_at: key.created_at,
      created_by: key.created_by,
      expires_at: key.expires_at,
      usuario_creador: key.usuario_creador
    }));

    res.status(200).json({
      success: true,
      data: apiKeysSinHash,
      total: apiKeysSinHash.length
    });

  } catch (error) {
    console.error('Error al obtener API Keys:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener API Keys',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Crear una nueva API Key
 * POST /api/admin/api-keys
 * Body: { key_name, id_sensor, descripcion, expires_at }
 */
exports.crear = async (req, res) => {
  try {
    const { key_name, id_sensor, descripcion, expires_at } = req.body;
    const userId = req.usuario.id_usuario; // Del middleware auth

    // Validaciones
    if (!key_name || !key_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la API Key es requerido'
      });
    }

    // El id_sensor es opcional ahora
    // if (!id_sensor || !id_sensor.trim()) { ... }

    // Si se proporciona id_sensor, validar que no exista ya una API Key para este sensor
    if (id_sensor && id_sensor.trim()) {
      const apiKeyExistente = await prisma.api_keys.findUnique({
        where: { id_sensor: id_sensor.trim() }
      });

      if (apiKeyExistente) {
        return res.status(400).json({
          success: false,
          message: `Ya existe una API Key para el sensor '${id_sensor}'`
        });
      }
    }

    // Generar API Key aleatoria
    const apiKeyPlain = generarApiKeyAleatoria();
    const apiKeyHash = hashApiKey(apiKeyPlain);

    // Crear en base de datos
    const apiKey = await prisma.api_keys.create({
      data: {
        key_name: key_name.trim(),
        api_key: apiKeyHash,
        id_sensor: id_sensor ? id_sensor.trim() : null,
        descripcion: descripcion || null,
        created_by: userId,
        expires_at: expires_at ? new Date(expires_at) : null,
        esta_activo: true
      },
      include: {
        usuario_creador: {
          select: {
            username: true,
            nombre_completo: true
          }
        }
      }
    });

    // Retornar la API Key en texto plano (SOLO esta vez)
    res.status(201).json({
      success: true,
      message: 'API Key creada exitosamente',
      data: {
        id_api_key: apiKey.id_api_key,
        key_name: apiKey.key_name,
        api_key_plain: apiKeyPlain, // ⚠️ SOLO se muestra una vez
        id_sensor: apiKey.id_sensor,
        descripcion: apiKey.descripcion,
        esta_activo: apiKey.esta_activo,
        created_at: apiKey.created_at,
        created_by: apiKey.created_by,
        expires_at: apiKey.expires_at,
        usuario_creador: apiKey.usuario_creador
      }
    });

  } catch (error) {
    console.error('Error al crear API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear API Key',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Habilitar/Deshabilitar una API Key
 * PATCH /api/admin/api-keys/:id/toggle
 */
exports.toggleEstado = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const apiKeyExistente = await prisma.api_keys.findUnique({
      where: { id_api_key: parseInt(id) }
    });

    if (!apiKeyExistente) {
      return res.status(404).json({
        success: false,
        message: 'API Key no encontrada'
      });
    }

    // Cambiar estado
    const apiKeyActualizada = await prisma.api_keys.update({
      where: { id_api_key: parseInt(id) },
      data: { esta_activo: !apiKeyExistente.esta_activo },
      include: {
        usuario_creador: {
          select: {
            username: true,
            nombre_completo: true
          }
        },
        sensor: {
          select: {
            id_sensor: true,
            nombre_sensor: true,
            zona: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `API Key ${apiKeyActualizada.esta_activo ? 'habilitada' : 'deshabilitada'} exitosamente`,
      data: {
        id_api_key: apiKeyActualizada.id_api_key,
        key_name: apiKeyActualizada.key_name,
        id_sensor: apiKeyActualizada.id_sensor,
        sensor: apiKeyActualizada.sensor,
        descripcion: apiKeyActualizada.descripcion,
        esta_activo: apiKeyActualizada.esta_activo,
        ultima_uso: apiKeyActualizada.ultima_uso,
        created_at: apiKeyActualizada.created_at,
        created_by: apiKeyActualizada.created_by,
        expires_at: apiKeyActualizada.expires_at,
        usuario_creador: apiKeyActualizada.usuario_creador
      }
    });

  } catch (error) {
    console.error('Error al cambiar estado de API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de API Key',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Eliminar una API Key permanentemente
 * DELETE /api/admin/api-keys/:id
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const apiKeyExistente = await prisma.api_keys.findUnique({
      where: { id_api_key: parseInt(id) }
    });

    if (!apiKeyExistente) {
      return res.status(404).json({
        success: false,
        message: 'API Key no encontrada'
      });
    }

    // Eliminar
    await prisma.api_keys.delete({
      where: { id_api_key: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: `API Key "${apiKeyExistente.key_name}" eliminada permanentemente`
    });

  } catch (error) {
    console.error('Error al eliminar API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar API Key',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

/**
 * Actualizar información de una API Key (nombre, descripción)
 * PATCH /api/admin/api-keys/:id
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { key_name, descripcion } = req.body;

    // Verificar que existe
    const apiKeyExistente = await prisma.api_keys.findUnique({
      where: { id_api_key: parseInt(id) }
    });

    if (!apiKeyExistente) {
      return res.status(404).json({
        success: false,
        message: 'API Key no encontrada'
      });
    }

    // Actualizar (el sensor asociado NO puede cambiar)
    const apiKeyActualizada = await prisma.api_keys.update({
      where: { id_api_key: parseInt(id) },
      data: {
        key_name: key_name || apiKeyExistente.key_name,
        descripcion: descripcion !== undefined ? descripcion : apiKeyExistente.descripcion
      },
      include: {
        usuario_creador: {
          select: {
            username: true,
            nombre_completo: true
          }
        },
        sensor: {
          select: {
            id_sensor: true,
            nombre_sensor: true,
            zona: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'API Key actualizada exitosamente',
      data: {
        id_api_key: apiKeyActualizada.id_api_key,
        key_name: apiKeyActualizada.key_name,
        id_sensor: apiKeyActualizada.id_sensor,
        sensor: apiKeyActualizada.sensor,
        descripcion: apiKeyActualizada.descripcion,
        esta_activo: apiKeyActualizada.esta_activo,
        ultima_uso: apiKeyActualizada.ultima_uso,
        created_at: apiKeyActualizada.created_at,
        created_by: apiKeyActualizada.created_by,
        expires_at: apiKeyActualizada.expires_at,
        usuario_creador: apiKeyActualizada.usuario_creador
      }
    });

  } catch (error) {
    console.error('Error al actualizar API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar API Key',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};
