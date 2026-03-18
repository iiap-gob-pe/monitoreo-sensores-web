const express = require('express');
const router = express.Router();
const recorridosController = require('../controllers/recorridosController');
const { verificarAccesoPublico, verificarToken, verificarRol } = require('../middleware/auth');

// Rutas protegidas de lectura (requieren JWT o clave pública del frontend)
router.get('/fecha', verificarAccesoPublico, recorridosController.obtenerPorFecha);        // GET /api/recorridos/fecha
router.get('/lista', verificarAccesoPublico, recorridosController.listar);                 // GET /api/recorridos/lista
router.get('/:id', verificarAccesoPublico, recorridosController.obtenerPorId);            // GET /api/recorridos/:id

// Rutas protegidas
router.post('/guardar', verificarToken, recorridosController.guardar);                     // POST /api/recorridos/guardar - Requiere login
router.delete('/:id', verificarToken, verificarRol('admin'), recorridosController.eliminar); // DELETE /api/recorridos/:id - Solo admin

module.exports = router;
