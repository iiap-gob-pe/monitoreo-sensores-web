// src/routes/umbrales.js
const express = require('express');
const router = express.Router();
const umbralController = require('../controllers/umbralController');
const { verificarToken, verificarRol, verificarAccesoPublico } = require('../middleware/auth');

// Rutas protegidas de lectura (requieren JWT o clave pública del frontend)
router.get('/', verificarAccesoPublico, umbralController.obtenerTodos);

// Rutas protegidas (solo Admin)
router.post('/', verificarToken, verificarRol('admin'), umbralController.crear);
router.patch('/:id', verificarToken, verificarRol('admin'), umbralController.actualizar);
router.delete('/:id', verificarToken, verificarRol('admin'), umbralController.eliminar);

module.exports = router;
