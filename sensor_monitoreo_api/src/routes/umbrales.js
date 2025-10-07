// src/routes/umbrales.js
const express = require('express');
const router = express.Router();
const umbralController = require('../controllers/umbralController');

router.get('/', umbralController.obtenerTodos);
router.post('/', umbralController.crear);
router.patch('/:id', umbralController.actualizar);
router.delete('/:id', umbralController.eliminar);

module.exports = router;