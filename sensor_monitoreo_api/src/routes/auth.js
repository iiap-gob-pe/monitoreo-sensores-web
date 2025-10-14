// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/verificar', verificarToken, authController.verificar);
router.post('/logout', verificarToken, authController.logout);

// ✅ ENDPOINT TEMPORAL - Crear primer admin
// router.post('/setup-admin', async (req, res) => {
//   try {
//     const bcrypt = require('bcryptjs');
//     const { PrismaClient } = require('@prisma/client');
//     const prisma = new PrismaClient();

//     // Eliminar admin existente si hay alguno
//     await prisma.usuarios.deleteMany({
//       where: { username: 'admin' }
//     });

//     // Crear nuevo admin con hash correcto
//     const salt = await bcrypt.genSalt(10);
//     const password_hash = await bcrypt.hash('admin123', salt);

//     const admin = await prisma.usuarios.create({
//       data: {
//         username: 'admin',
//         email: 'admin@sensores.com',
//         password_hash,
//         nombre_completo: 'Administrador del Sistema',
//         rol: 'admin',
//         estado: 'activo'
//       },
//       select: {
//         id_usuario: true,
//         username: true,
//         email: true,
//         nombre_completo: true,
//         rol: true,
//         estado: true
//       }
//     });

//     console.log('✅ Admin creado exitosamente');
//     console.log('Hash generado:', password_hash);

//     res.json({
//       success: true,
//       message: '✅ Admin creado exitosamente',
//       data: admin,
//       credentials: {
//         username: 'admin',
//         password: 'admin123',
//         note: 'Usa estas credenciales para hacer login'
//       }
//     });

//   } catch (error) {
//     console.error('Error al crear admin:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

module.exports = router;