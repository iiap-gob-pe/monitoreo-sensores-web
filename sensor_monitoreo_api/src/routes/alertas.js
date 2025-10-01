// src/routes/alertas.js - Rutas para gestión de alertas
const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');

// Rutas para alertas
router.get('/', alertaController.obtenerTodas);                     // GET /api/alertas
router.get('/activas', alertaController.obtenerActivas);            // GET /api/alertas/activas
router.get('/estadisticas', alertaController.obtenerEstadisticas);  // GET /api/alertas/estadisticas
router.get('/sensor/:id', alertaController.obtenerPorSensor);       // GET /api/alertas/sensor/:id
router.post('/', alertaController.crear);                          // POST /api/alertas (crear alerta manual)
router.put('/:id/resolver', alertaController.resolver);            // PUT /api/alertas/:id/resolver
router.put('/resolver-multiples', alertaController.resolverMultiples); // PUT /api/alertas/resolver-multiples

module.exports = router;