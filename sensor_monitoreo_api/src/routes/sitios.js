// src/routes/sitios.js
const express = require('express');
const router = express.Router();
const sitiosController = require('../controllers/sitiosController');
const { verificarToken, verificarRol, verificarAccesoPublico } = require('../middleware/auth');

// Lectura (JWT o clave pública)
router.get('/', verificarAccesoPublico, sitiosController.obtenerTodos);
router.get('/:id', verificarAccesoPublico, sitiosController.obtenerPorId);

// Escritura (solo admin)
router.post('/', verificarToken, verificarRol('admin'), sitiosController.crear);
router.patch('/:id', verificarToken, verificarRol('admin'), sitiosController.actualizar);
router.delete('/:id', verificarToken, verificarRol('admin'), sitiosController.eliminar);

module.exports = router;
