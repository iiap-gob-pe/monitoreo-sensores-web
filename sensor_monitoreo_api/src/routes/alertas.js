// src/routes/alertas.js - Rutas para gestión de alertas
const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');
const { verificarAccesoPublico, verificarToken, verificarRol } = require('../middleware/auth');

// Rutas protegidas de lectura (requieren JWT o clave pública del frontend)
router.get('/', verificarAccesoPublico, alertaController.obtenerTodas);                     // GET /api/alertas
router.get('/activas', verificarAccesoPublico, alertaController.obtenerActivas);            // GET /api/alertas/activas
router.get('/estadisticas', verificarAccesoPublico, alertaController.obtenerEstadisticas);  // GET /api/alertas/estadisticas
router.get('/sensor/:id', verificarAccesoPublico, alertaController.obtenerPorSensor);       // GET /api/alertas/sensor/:id

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarRol('admin'), alertaController.crear);                           // POST /api/alertas (crear alerta manual)
router.patch('/:id/resolver', verificarToken, verificarRol('admin'), alertaController.resolver);           // PATCH /api/alertas/:id/resolver
router.put('/resolver-multiples', verificarToken, verificarRol('admin'), alertaController.resolverMultiples); // PUT /api/alertas/resolver-multiples

module.exports = router;
