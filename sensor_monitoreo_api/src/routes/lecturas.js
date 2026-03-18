// src/routes/lecturas.js - Rutas para gestión de lecturas ambientales
const express = require('express');
const router = express.Router();
const lecturaController = require('../controllers/lecturaController');
const { verificarAccesoPublico } = require('../middleware/auth');
const { verificarApiKey } = require('../middleware/apiKey');
const { apiLimiter } = require('../middleware/rateLimiter');

// Ruta protegida para ESP32/Apps móviles - REQUIERE API Key y RATE LIMITING
router.post('/', apiLimiter, verificarApiKey, lecturaController.crear);       // POST /api/lecturas (Para ESP32/Apps)

// Rutas protegidas de lectura (requieren JWT o clave pública del frontend)
router.get('/', verificarAccesoPublico, lecturaController.obtenerTodas);                   // GET /api/lecturas
router.get('/actuales', verificarAccesoPublico, lecturaController.obtenerActuales);        // GET /api/lecturas/actuales
router.get('/fechas', verificarAccesoPublico, lecturaController.obtenerFechas);            // GET /api/lecturas/fechas
router.get('/agrupadas-calor', verificarAccesoPublico, lecturaController.obtenerAgrupadasCalor); // GET /api/lecturas/agrupadas-calor
router.get('/ultimas', verificarAccesoPublico, lecturaController.obtenerUltimas);          // GET /api/lecturas/ultimas
router.get('/sensor/:id', verificarAccesoPublico, lecturaController.obtenerPorSensor);     // GET /api/lecturas/sensor/:id
router.get('/estadisticas/:id', verificarAccesoPublico, lecturaController.obtenerEstadisticas); // GET /api/lecturas/estadisticas/:id
router.get('/avanzado', verificarAccesoPublico, lecturaController.obtenerLecturasAvanzado);     // GET /api/lecturas/avanzado
router.get('/exportar', verificarAccesoPublico, lecturaController.obtenerParaExportar);         // GET /api/lecturas/exportar

module.exports = router;
