// src/routes/alertas.js - Rutas para gestión de alertas
const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');
const { verificarTokenOpcional, verificarToken, verificarRol } = require('../middleware/auth');

// Rutas públicas de solo lectura
router.get('/', verificarTokenOpcional, alertaController.obtenerTodas);                     // GET /api/alertas - Público
router.get('/activas', verificarTokenOpcional, alertaController.obtenerActivas);            // GET /api/alertas/activas - Público
router.get('/estadisticas', verificarTokenOpcional, alertaController.obtenerEstadisticas);  // GET /api/alertas/estadisticas - Público
router.get('/sensor/:id', verificarTokenOpcional, alertaController.obtenerPorSensor);       // GET /api/alertas/sensor/:id - Público

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarRol('admin'), alertaController.crear);                           // POST /api/alertas (crear alerta manual)
router.patch('/:id/resolver', verificarToken, verificarRol('admin'), alertaController.resolver);           // PATCH /api/alertas/:id/resolver
router.put('/resolver-multiples', verificarToken, verificarRol('admin'), alertaController.resolverMultiples); // PUT /api/alertas/resolver-multiples

module.exports = router;