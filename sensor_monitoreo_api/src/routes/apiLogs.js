// src/routes/apiLogs.js - Rutas admin para consultar logs de API
const express = require('express');
const router = express.Router();
const apiLogsController = require('../controllers/apiLogsController');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Solo admin puede ver logs
router.use(verificarToken, verificarRol('admin'));

router.get('/', apiLogsController.obtenerLogs);
router.get('/endpoints', apiLogsController.obtenerEndpoints);

module.exports = router;
