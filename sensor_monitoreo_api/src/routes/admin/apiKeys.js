// src/routes/admin/apiKeys.js - Rutas para gestión de API Keys (solo admins)
const express = require('express');
const router = express.Router();
const apiKeyController = require('../../controllers/apiKeyController');
const { verificarToken, verificarRol } = require('../../middleware/auth');

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken);
router.use(verificarRol('admin'));

// Obtener todas las API Keys
router.get('/', apiKeyController.obtenerTodas);

// Crear una nueva API Key
router.post('/', apiKeyController.crear);

// Habilitar/Deshabilitar una API Key
router.patch('/:id/toggle', apiKeyController.toggleEstado);

// Actualizar información de una API Key
router.patch('/:id', apiKeyController.actualizar);

// Eliminar una API Key
router.delete('/:id', apiKeyController.eliminar);

module.exports = router;
