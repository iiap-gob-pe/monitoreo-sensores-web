const express = require('express');
const router = express.Router();
const recorridosController = require('../controllers/recorridosController');
const { verificarTokenOpcional, verificarToken, verificarRol } = require('../middleware/auth');

// Rutas públicas de solo lectura
router.get('/fecha', verificarTokenOpcional, recorridosController.obtenerPorFecha);        // GET /api/recorridos/fecha - Público
router.get('/lista', verificarTokenOpcional, recorridosController.listar);                 // GET /api/recorridos/lista - Público
router.get('/:id', verificarTokenOpcional, recorridosController.obtenerPorId);            // GET /api/recorridos/:id - Público

// Rutas protegidas
router.post('/guardar', verificarToken, recorridosController.guardar);                     // POST /api/recorridos/guardar - Requiere login
router.delete('/:id', verificarToken, verificarRol('admin'), recorridosController.eliminar); // DELETE /api/recorridos/:id - Solo admin

module.exports = router;