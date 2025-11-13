// src/routes/preferencias-sistema.js
const express = require('express');
const router = express.Router();
const preferenciasSistemaController = require('../controllers/preferenciasSistemaController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación (usuario solo puede ver/editar sus propias preferencias)
router.use(verificarToken);

router.get('/:id_usuario', preferenciasSistemaController.obtener);
router.post('/', preferenciasSistemaController.crear);
router.patch('/:id_usuario', preferenciasSistemaController.actualizar);

module.exports = router;
