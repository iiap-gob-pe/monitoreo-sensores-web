const express = require('express');
const router = express.Router();
const recorridosController = require('../controllers/recorridosController');

router.get('/fecha', recorridosController.obtenerPorFecha);
router.get('/lista', recorridosController.listar);
router.get('/:id', recorridosController.obtenerPorId);
router.post('/guardar', recorridosController.guardar);
router.delete('/:id', recorridosController.eliminar);

module.exports = router;