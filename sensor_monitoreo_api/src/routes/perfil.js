// backend/src/routes/perfil.js
const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

// Rutas de perfil
router.get('/:userId/historial', perfilController.obtenerHistorialActividad);
router.post('/:userId/cambiar-contrasena', perfilController.cambiarContrasena);

router.get('/:userId', perfilController.obtenerPerfil);
router.patch('/:userId', perfilController.actualizarPerfil);

module.exports = router;