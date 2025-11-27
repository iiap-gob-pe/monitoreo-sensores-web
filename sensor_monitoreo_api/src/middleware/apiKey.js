// src/middleware/apiKey.js - Middleware para validar API Keys de sensores/apps
const crypto = require('crypto');
const { prisma } = require('../config/database');

/**
 * Middleware para validar API Key en peticiones de sensores/apps móviles
 * La API Key debe venir en el header: X-API-Key
 */
const verificarApiKey = async (req, res, next) => {
  try {
    // Obtener API Key del header
    const apiKeyRecibida = req.headers['x-api-key'];

    if (!apiKeyRecibida) {
      return res.status(401).json({
        success: false,
        message: 'API Key requerida. Incluye el header X-API-Key',
        code: 'API_KEY_MISSING'
      });
    }

    // Hash de la API Key recibida (en BD se guardan hasheadas)
    const apiKeyHash = crypto
      .createHash('sha256')
      .update(apiKeyRecibida)
      .digest('hex');

    // Buscar la API Key en la base de datos
    const apiKey = await prisma.api_keys.findUnique({
      where: { api_key: apiKeyHash }
    });

    // Validar que existe
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API Key inválida',
        code: 'API_KEY_INVALID'
      });
    }

    // Validar que está activa
    if (!apiKey.esta_activo) {
      return res.status(403).json({
        success: false,
        message: 'API Key deshabilitada',
        code: 'API_KEY_DISABLED'
      });
    }

    // Validar que no haya expirado (si tiene fecha de expiración)
    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      return res.status(403).json({
        success: false,
        message: 'API Key expirada',
        code: 'API_KEY_EXPIRED'
      });
    }

    // Actualizar última vez de uso (en background para no bloquear la petición)
    prisma.api_keys.update({
      where: { id_api_key: apiKey.id_api_key },
      data: { ultima_uso: new Date() }
    }).catch(err => {
      console.error('Error al actualizar ultima_uso de API Key:', err);
    });

    // Agregar info de la API Key al request para uso posterior
    req.apiKey = {
      id: apiKey.id_api_key,
      nombre: apiKey.key_name,
      id_sensor: apiKey.id_sensor  // ID del sensor asociado
    };

    // Continuar con la petición
    next();

  } catch (error) {
    console.error('Error en verificación de API Key:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al validar API Key',
      code: 'API_KEY_ERROR'
    });
  }
};

/**
 * Middleware para permitir OPCIONALMENTE una API Key
 * Si viene, la valida. Si no viene, continúa igual.
 * Útil para endpoints que son públicos pero pueden beneficiarse de tener contexto
 */
const verificarApiKeyOpcional = async (req, res, next) => {
  try {
    const apiKeyRecibida = req.headers['x-api-key'];

    // Si no viene API Key, continuar sin validar
    if (!apiKeyRecibida) {
      return next();
    }

    // Si viene, validarla
    const apiKeyHash = crypto
      .createHash('sha256')
      .update(apiKeyRecibida)
      .digest('hex');

    const apiKey = await prisma.api_keys.findUnique({
      where: { api_key: apiKeyHash }
    });

    // Si existe y está activa, agregar info al request
    if (apiKey && apiKey.esta_activo) {
      req.apiKey = {
        id: apiKey.id_api_key,
        nombre: apiKey.key_name,
        id_sensor: apiKey.id_sensor  // ID del sensor asociado
      };

      // Actualizar última uso
      prisma.api_keys.update({
        where: { id_api_key: apiKey.id_api_key },
        data: { ultima_uso: new Date() }
      }).catch(err => console.error('Error al actualizar ultima_uso:', err));
    }

    next();

  } catch (error) {
    console.error('Error en verificación opcional de API Key:', error);
    // En modo opcional, no bloqueamos por errores
    next();
  }
};

module.exports = {
  verificarApiKey,
  verificarApiKeyOpcional
};
