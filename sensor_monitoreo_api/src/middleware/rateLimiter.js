// src/middleware/rateLimiter.js - Limitador de peticiones para proteger la API
const rateLimit = require('express-rate-limit');

/**
 * Limitador estricto para la ingesta de datos de sensores
 * Configurado para: Máximo 30 peticiones por minuto por IP
 * Basado en el requerimiento de 1 petición cada 3 segundos (~20 peticiones/min)
 * Esto da margen para reintentos o latencia de red, pero bloquea spam.
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Ventana de 1 minuto
  max: 30, // Límite de 30 peticiones por IP en esa ventana
  standardHeaders: true, // Retorna info de limite en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  handler: (req, res) => {
    // Respuesta personalizada cuando se excede el límite
    console.warn(`🛑 ALERTA DE SEGURIDAD: IP ${req.ip} bloqueada temporalmente por Rate Limiting (> 30 requests/min).`);
    return res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones desde esta IP. Por favor espera un minuto para enviar más datos.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Limitador estricto para login (anti fuerza bruta)
 * Máximo 5 intentos de login por IP cada 15 minutos
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 5, // Máximo 5 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🛑 ALERTA: IP ${req.ip} bloqueada por demasiados intentos de login.`);
    return res.status(429).json({
      success: false,
      message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    });
  }
});

module.exports = {
  apiLimiter,
  loginLimiter
};
