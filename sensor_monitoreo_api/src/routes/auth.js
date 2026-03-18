// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Login con rate limiting anti fuerza bruta (5 intentos / 15 min por IP)
router.post('/login', loginLimiter, authController.login);
router.get('/verificar', verificarToken, authController.verificar);
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
