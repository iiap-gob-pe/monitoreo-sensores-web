// src/routes/lecturas.js - Rutas para gestión de lecturas ambientales
const express = require('express');
const router = express.Router();
const lecturaController = require('../controllers/lecturaController');

// Rutas para lecturas
router.post('/', lecturaController.crear);                         // POST /api/lecturas (Para ESP32)
router.get('/', lecturaController.obtenerTodas);                   // GET /api/lecturas
router.get('/ultimas', lecturaController.obtenerUltimas);          // GET /api/lecturas/ultimas
router.get('/sensor/:id', lecturaController.obtenerPorSensor);     // GET /api/lecturas/sensor/:id
router.get('/estadisticas/:id', lecturaController.obtenerEstadisticas); // GET /api/lecturas/estadisticas/:id
router.get('/avanzado', lecturaController.obtenerLecturasAvanzado);     


module.exports = router;