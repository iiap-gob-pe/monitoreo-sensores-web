// backend/src/routes/perfil.js
const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas de perfil requieren autenticación (el usuario solo puede ver/editar su propio perfil)
router.use(verificarToken);

router.get('/:userId/historial', perfilController.obtenerHistorialActividad);
router.post('/:userId/cambiar-contrasena', perfilController.cambiarContrasena);
router.get('/:userId', perfilController.obtenerPerfil);
router.patch('/:userId', perfilController.actualizarPerfil);

module.exports = router;