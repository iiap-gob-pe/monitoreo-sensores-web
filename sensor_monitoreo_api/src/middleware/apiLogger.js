// src/middleware/apiLogger.js - Registra peticiones a endpoints de datos en BD
const { prisma } = require('../config/database');

/**
 * Middleware que registra peticiones a la base de datos.
 * Se aplica a endpoints específicos (datos, lecturas, etc.)
 */
const registrarPeticion = (req, res, next) => {
  const inicio = Date.now();

  // Capturar el body original del response
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const duracion = Date.now() - inicio;

    // Resumen del request body (truncar si es muy largo)
    let requestBody = null;
    if (req.body) {
      if (typeof req.body === 'string') {
        requestBody = req.body.substring(0, 500);
      } else {
        requestBody = JSON.stringify(req.body).substring(0, 500);
      }
    }

    // Resumen del response (truncar)
    let responseBody = null;
    if (body) {
      responseBody = JSON.stringify(body).substring(0, 500);
    }

    // Determinar si fue error
    const esError = res.statusCode >= 400;
    const errorMsg = esError ? (body?.message || body?.mensaje || null) : null;

    // Guardar en BD de forma asíncrona (no bloquea la respuesta)
    prisma.api_logs.create({
      data: {
        method: req.method,
        endpoint: req.originalUrl.split('?')[0], // Sin query params
        status_code: res.statusCode,
        ip_address: req.ip || req.connection?.remoteAddress || null,
        id_sensor: req.apiKey?.id_sensor || null,
        api_key_name: req.apiKey?.nombre || null,
        request_body: requestBody,
        response_body: responseBody,
        duration_ms: duracion,
        error_message: errorMsg,
        user_agent: (req.headers['user-agent'] || '').substring(0, 255)
      }
    }).catch(err => {
      console.error('Error al guardar log de API:', err.message);
    });

    return originalJson(body);
  };

  next();
};

module.exports = { registrarPeticion };
