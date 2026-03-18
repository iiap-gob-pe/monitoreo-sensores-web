// src/app.js - Configuración principal de Express
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Importar rutas
const sensoresRoutes = require('./routes/sensores');
const lecturasRoutes = require('./routes/lecturas');
const alertasRoutes = require('./routes/alertas');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const perfilRoutes = require('./routes/perfil');
const recorridosRoutes = require('./routes/recorridos');
const umbralesRoutes = require('./routes/umbrales');
const preferenciasSistemaRoutes = require('./routes/preferencias-sistema');
const adminApiKeysRoutes = require('./routes/admin/apiKeys');
const datosRoutes = require('./routes/datos');
const sitiosRoutes = require('./routes/sitios');
const campanasRoutes = require('./routes/campanas');


const app = express();

// Confiar en el proxy inverso (necesario para que Rate Limiter obtenga la IP real en producción)
app.set('trust proxy', 1);

// Middleware de seguridad (cabeceras de seguridad)
app.use(helmet());

// Configuración de CORS
// Lee CORS_ORIGIN desde .env y permite múltiples orígenes separados por coma
const getCorsOrigins = () => {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origins = corsOrigin.split(',').map(origin => origin.trim());

  // En desarrollo: permitir IPs locales para pruebas con app móvil en la MISMA red WiFi
  // En producción: las apps móviles acceden por el dominio público (ej: https://api.monitoreo.iiap.org.pe)
  // y NO necesitan estar en CORS ya que las peticiones POST /api/lecturas son públicas
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3001');
    origins.push(/^http:\/\/192\.168\.\d+\.\d+:\d+$/);  // Red local 192.168.x.x con puerto (pruebas)
    origins.push(/^http:\/\/192\.168\.\d+\.\d+$/);       // Red local 192.168.x.x sin puerto (pruebas)
    origins.push(/^http:\/\/10\.\d+\.\d+\.\d+$/);        // Red 10.x.x.x (algunas redes WiFi)
  }

  return origins;
};

app.use(cors({
  origin: getCorsOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',  // Header para autenticación de sensores y apps móviles
    // Headers personalizados de la app móvil
    'X-Client-Type',
    'X-Client-Version',
    'X-Device-ID',
    'X-Fecha'
  ],
  credentials: true
}));

// Middleware de logging
// Log a consola
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Log a archivo (persistente) - guarda TODOS los requests
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('[:date[iso]] :remote-addr :method :url :status :res[content-length] :response-time ms - :user-agent', { stream: accessLogStream }));

// Log separado para errores (4xx y 5xx)
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });
app.use(morgan('[:date[iso]] :remote-addr :method :url :status :res[content-length] - Body: :req[content-type] :req[x-api-key] :req[x-fecha]', {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting para prevenir abuso de API (solo para rutas públicas)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 300, // 300 request/min (5 request/seg) - Aumentado para soportar simulador con múltiples sensores
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Auth tiene su propio loginLimiter más estricto
    return req.path.startsWith('/api/auth');
  }
});

// Aplicar rate limiting
app.use('/api', apiLimiter);

// Rutas principales
app.use('/api/sensores', sensoresRoutes);
app.use('/api/lecturas', lecturasRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/umbrales', umbralesRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/recorridos', recorridosRoutes);
app.use('/api/preferencias-sistema', preferenciasSistemaRoutes);

// Registrar rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rutas de administración (solo admins)
app.use('/api/admin/api-keys', adminApiKeysRoutes);

// Ruta de ingesta CSV desde ESP32
app.use('/api/datos', datosRoutes);

// Gestión de sitios y campañas
app.use('/api/sitios', sitiosRoutes);
app.use('/api/campanas', campanasRoutes);

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
      datos: {
        'POST /api/datos': 'Ingesta CSV desde ESP32 (Content-Type: text/csv, Header: X-Fecha)'
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