// src/routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol admin
router.use(verificarToken, verificarRol('admin'));

router.get('/', usuarioController.obtenerTodos);
router.post('/', usuarioController.crear);
router.patch('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.eliminar);
router.get('/logs', usuarioController.obtenerLogs);

module.exports = router;