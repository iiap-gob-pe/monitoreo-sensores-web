// src/routes/sensores.js - Rutas para gestión de sensores
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', sensorController.obtenerTodos);                // GET /api/sensores - Público
router.get('/:id', sensorController.obtenerPorId);             // GET /api/sensores/:id - Público

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarRol('admin'), sensorController.crear);                      // POST /api/sensores
router.patch('/:id', verificarToken, verificarRol('admin'), sensorController.actualizar);             // PATCH /api/sensores/:id
router.delete('/:id', verificarToken, verificarRol('admin'), sensorController.eliminar);              // DELETE /api/sensores/:id

module.exports = router;