// src/routes/preferencias-sistema.js
const express = require('express');
const router = express.Router();
const preferenciasSistemaController = require('../controllers/preferenciasSistemaController');

router.get('/:id_usuario', preferenciasSistemaController.obtener);
router.post('/', preferenciasSistemaController.crear);
router.patch('/:id_usuario', preferenciasSistemaController.actualizar);

module.exports = router;
