// src/routes/sensores.js - Rutas para gestión de sensores
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Rutas para sensores
router.get('/', sensorController.obtenerTodos);                    // GET /api/sensores
router.get('/:id', sensorController.obtenerPorId);                 // GET /api/sensores/:id
router.post('/', sensorController.crear);                          // POST /api/sensores
router.put('/:id', sensorController.actualizar);                   // PUT /api/sensores/:id
router.delete('/:id', sensorController.eliminar);                  // DELETE /api/sensores/:id
router.put('/:id/ultimo-visto', sensorController.actualizarUltimoVisto); // PUT /api/sensores/:id/ultimo-visto

module.exports = router;