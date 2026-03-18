// src/routes/sensores.js - Rutas para gestión de sensores
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { verificarToken, verificarRol, verificarAccesoPublico } = require('../middleware/auth');

// Rutas protegidas de lectura (requieren JWT o clave pública del frontend)
router.get('/', verificarAccesoPublico, sensorController.obtenerTodos);                // GET /api/sensores
router.get('/:id', verificarAccesoPublico, sensorController.obtenerPorId);             // GET /api/sensores/:id

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarRol('admin'), sensorController.crear);                      // POST /api/sensores (auto-genera API Key)
router.post('/:id/regenerar-apikey', verificarToken, verificarRol('admin'), sensorController.regenerarApiKey); // POST /api/sensores/:id/regenerar-apikey
router.patch('/:id', verificarToken, verificarRol('admin'), sensorController.actualizar);             // PATCH /api/sensores/:id
router.delete('/:id', verificarToken, verificarRol('admin'), sensorController.eliminar);              // DELETE /api/sensores/:id

module.exports = router;
