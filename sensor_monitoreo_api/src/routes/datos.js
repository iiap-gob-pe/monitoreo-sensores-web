// src/routes/datos.js - Ruta para ingesta de datos CSV desde ESP32
const express = require('express');
const router = express.Router();
const datosController = require('../controllers/datosController');
const { apiLimiter } = require('../middleware/rateLimiter');
const { verificarApiKey } = require('../middleware/apiKey');
const { registrarPeticion } = require('../middleware/apiLogger');

// Middleware para parsear body como texto plano cuando Content-Type es text/csv
router.use(express.text({ type: 'text/csv', limit: '5mb' }));

// POST /api/datos - Recibir CSV crudo desde ESP32 (requiere API Key del sensor)
router.post('/', apiLimiter, registrarPeticion, verificarApiKey, datosController.recibir);

module.exports = router;
