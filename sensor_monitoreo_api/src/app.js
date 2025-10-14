// src/app.js - Configuración principal de Express
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar rutas
const sensoresRoutes = require('./routes/sensores');
const lecturasRoutes = require('./routes/lecturas');
const alertasRoutes = require('./routes/alertas');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
 


const app = express();

// Middleware de seguridad (cabeceras de seguridad)
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas principales
app.use('/api/sensores', sensoresRoutes);
app.use('/api/lecturas', lecturasRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/umbrales', require('./routes/umbrales'));

// Registrar rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Monitoreo Ambiental API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de documentación básica
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    message: 'Monitoreo Ambiental API - Documentación',
    version: '1.0.0',
    endpoints: {
      sensores: {
        'GET /api/sensores': 'Obtener todos los sensores',
        'GET /api/sensores/:id': 'Obtener un sensor específico',
        'POST /api/sensores': 'Crear un nuevo sensor',
        'PUT /api/sensores/:id': 'Actualizar un sensor',
        'DELETE /api/sensores/:id': 'Eliminar un sensor'
      },
      lecturas: {
        'GET /api/lecturas': 'Obtener todas las lecturas',
        'GET /api/lecturas/sensor/:id': 'Obtener lecturas de un sensor',
        'POST /api/lecturas': 'Crear una nueva lectura (para ESP32)',
        'GET /api/lecturas/ultimas': 'Obtener las últimas lecturas de todos los sensores'
      },
      alertas: {
        'GET /api/alertas': 'Obtener todas las alertas',
        'GET /api/alertas/activas': 'Obtener alertas no resueltas',
        'PUT /api/alertas/:id/resolver': 'Marcar alerta como resuelta'
      },
      utilidades: {
        'GET /api/health': 'Estado de salud del servidor',
        'GET /api/docs': 'Esta documentación'
      }
    },
    ejemplos: {
      'POST /api/lecturas': {
        id_sensor: 'SENSOR_001',
        temperatura: 23.5,
        humedad: 65.2,
        co2_nivel: 450,
        co_nivel: 2.1,
        latitud: -3.74912,
        longitud: -73.25383,
        altitud: 106.0,
        zona: 'Urbana'
      }
    }
  });
});

// Ruta para la raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenido a Monitoreo Ambiental API',
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableRoutes: [
      'GET /api/docs',
      'GET /api/health',
      'GET /api/sensores',
      'GET /api/lecturas',
      'GET /api/alertas',
      'GET /api/umbrales',
      'POST /api/auth/login',           // ✅ NUEVO
      'GET /api/auth/verificar',        // ✅ NUEVO
      'POST /api/usuarios'              // Nuevo
    ]
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;