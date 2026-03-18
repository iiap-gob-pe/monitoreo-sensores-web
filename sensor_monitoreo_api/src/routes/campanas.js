// src/routes/campanas.js
const express = require('express');
const router = express.Router();
const campanasController = require('../controllers/campanasController');
const { verificarToken, verificarRol, verificarAccesoPublico } = require('../middleware/auth');

// Lectura (JWT o clave pública)
router.get('/', verificarAccesoPublico, campanasController.obtenerTodas);
router.get('/:id', verificarAccesoPublico, campanasController.obtenerPorId);

// Escritura (solo admin)
router.post('/', verificarToken, verificarRol('admin'), campanasController.crear);
router.patch('/:id', verificarToken, verificarRol('admin'), campanasController.actualizar);
router.delete('/:id', verificarToken, verificarRol('admin'), campanasController.eliminar);

// Gestión de sensores en campaña (solo admin)
router.post('/:id/sensores', verificarToken, verificarRol('admin'), campanasController.agregarSensor);
router.delete('/:id/sensores/:id_sensor', verificarToken, verificarRol('admin'), campanasController.quitarSensor);

module.exports = router;
