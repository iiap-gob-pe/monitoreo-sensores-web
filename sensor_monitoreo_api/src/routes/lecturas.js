// src/routes/lecturas.js - Rutas para gestión de lecturas ambientales
const express = require('express');
const router = express.Router();
const lecturaController = require('../controllers/lecturaController');
const { verificarTokenOpcional } = require('../middleware/auth');
const { verificarApiKey } = require('../middleware/apiKey');
const { apiLimiter } = require('../middleware/rateLimiter');

// Ruta protegida para ESP32/Apps móviles - REQUIERE API Key y RATE LIMITING
router.post('/', apiLimiter, verificarApiKey, lecturaController.crear);       // POST /api/lecturas (Para ESP32/Apps)

// Rutas públicas de solo lectura (con token opcional para posibles permisos futuros)
router.get('/', verificarTokenOpcional, lecturaController.obtenerTodas);                   // GET /api/lecturas - Público
router.get('/ultimas', verificarTokenOpcional, lecturaController.obtenerUltimas);          // GET /api/lecturas/ultimas - Público
router.get('/sensor/:id', verificarTokenOpcional, lecturaController.obtenerPorSensor);     // GET /api/lecturas/sensor/:id - Público
router.get('/estadisticas/:id', verificarTokenOpcional, lecturaController.obtenerEstadisticas); // GET /api/lecturas/estadisticas/:id - Público
router.get('/avanzado', verificarTokenOpcional, lecturaController.obtenerLecturasAvanzado);     // GET /api/lecturas/avanzado - Público
router.get('/exportar', verificarTokenOpcional, lecturaController.obtenerParaExportar);         // GET /api/lecturas/exportar - Público

module.exports = router;