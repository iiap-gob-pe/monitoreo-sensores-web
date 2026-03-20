// src/routes/variables.js
const express = require('express');
const router = express.Router();
const variablesController = require('../controllers/variablesController');
const { verificarToken, verificarRol, verificarAccesoPublico } = require('../middleware/auth');

// Lectura (público con clave)
router.get('/', verificarAccesoPublico, variablesController.obtenerTodas);
router.get('/:id', verificarAccesoPublico, variablesController.obtenerPorId);

// CRUD (admin)
router.post('/', verificarToken, verificarRol('admin'), variablesController.crear);
router.patch('/:id', verificarToken, verificarRol('admin'), variablesController.actualizar);
router.delete('/:id', verificarToken, verificarRol('admin'), variablesController.eliminar);

// Configuración de variables por sensor
router.get('/sensor/:id_sensor', verificarAccesoPublico, variablesController.obtenerVariablesSensor);
router.put('/sensor/:id_sensor', verificarToken, verificarRol('admin'), variablesController.asignarVariablesSensor);

module.exports = router;
