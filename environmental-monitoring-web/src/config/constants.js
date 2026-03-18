// src/config/constants.js
// Configuración centralizada de la aplicación

/**
 * URL base de la API
 * En desarrollo: http://localhost:3000/api
 * En producción: definir en .env como VITE_API_URL
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Clave pública para acceso a endpoints de lectura de la API
 * Se envía en el header X-Public-Key cuando el usuario no tiene sesión JWT
 */
export const PUBLIC_API_KEY = import.meta.env.VITE_PUBLIC_API_KEY || '';

/**
 * Nombre de la aplicación
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'IIAP Monitoreo Ambiental';

/**
 * Versión de la aplicación
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

/**
 * Ambiente de ejecución
 */
export const NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development';

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

/**
 * Configuración de intervalos de actualización (en segundos)
 */
export const UPDATE_INTERVALS = {
  DASHBOARD: 30,
  SENSORS: 60,
  ALERTS: 30,
  MAP: 60
};

/**
 * Límites de datos
 */
export const DATA_LIMITS = {
  MAX_READINGS_CHART: 100,
  MAX_SENSORS_MAP: 50,
  MAX_ALERTS_LIST: 50
};

/**
 * Colores del tema
 */
export const THEME_COLORS = {
  PRIMARY: '#16a34a',
  PRIMARY_DARK: '#15803d',
  SECONDARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6'
};

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analista',
  RESEARCHER: 'investigador'
};

/**
 * Estados de sensor
 */
export const SENSOR_STATUS = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  MAINTENANCE: 'Mantenimiento'
};

/**
 * Tipos de zona
 */
export const ZONE_TYPES = {
  URBAN: 'Urbana',
  RURAL: 'Rural',
  FOREST: 'Bosque',
  RIVER: 'Río'
};

/**
 * Niveles de gravedad de alertas
 */
export const ALERT_SEVERITY = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
};

/**
 * Parámetros medibles
 */
export const PARAMETERS = {
  TEMPERATURE: {
    name: 'Temperatura',
    unit: '°C',
    icon: '🌡️'
  },
  HUMIDITY: {
    name: 'Humedad',
    unit: '%',
    icon: '💧'
  },
  CO2: {
    name: 'CO₂',
    unit: 'ppm',
    icon: '🌿'
  },
  CO: {
    name: 'CO',
    unit: 'ppm',
    icon: '⚠️'
  }
};

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión con el servidor',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión nuevamente',
  FORBIDDEN: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error interno del servidor',
  VALIDATION_ERROR: 'Error de validación en los datos enviados'
};

/**
 * Mensajes de éxito comunes
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente',
  UPDATED: 'Actualizado exitosamente',
  DELETED: 'Eliminado exitosamente',
  SAVED: 'Guardado exitosamente'
};

/**
 * Configuración de LocalStorage keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'usuario',
  PREFERENCES: 'preferencias'
};

/**
 * Formatos de fecha
 */
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  ISO: 'YYYY-MM-DDTHH:mm:ss'
};