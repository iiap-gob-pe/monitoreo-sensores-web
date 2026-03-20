import axios from 'axios';
import { API_URL, PUBLIC_API_KEY, STORAGE_KEYS } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar autenticación automáticamente a todas las peticiones
// Prioridad: 1) JWT token si el usuario tiene sesión, 2) Clave pública del frontend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (PUBLIC_API_KEY) {
      // Sin sesión JWT: usar clave pública para endpoints de lectura
      config.headers['X-Public-Key'] = PUBLIC_API_KEY;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir a login si el usuario tenía sesión activa (token expirado)
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
      // Si no tenía token, no redirigir (es acceso público con X-Public-Key)
    }
    return Promise.reject(error);
  }
);

export const sensoresAPI = {
  getAll: () => api.get('/sensores'),
  getById: (id) => api.get(`/sensores/${id}`),
  create: (data) => api.post('/sensores', data),
  update: (id, data) => api.patch(`/sensores/${id}`, data),
  delete: (id) => api.delete(`/sensores/${id}`),
  regenerarApiKey: (id) => api.post(`/sensores/${id}/regenerar-apikey`)
};

export const lecturasAPI = {
  getActuales: () => api.get('/lecturas/actuales'),
  getFechasDisponibles: () => api.get('/lecturas/fechas'),
  getUltimas: (limite = 100) => api.get(`/lecturas/ultimas?limite=${limite}`),
  getBySensor: (id, limite = 50) => api.get(`/lecturas/sensor/${id}?limite=${limite}`),
  getEstadisticas: (id, dias = 7) => api.get(`/lecturas/estadisticas/${id}?dias=${dias}`),
  getAll: (filtros = {}) => api.get('/lecturas/avanzado', { params: filtros }),
  getAgrupadasCalor: (params) => api.get('/lecturas/agrupadas-calor', { params })
};

export const alertasAPI = {
  getActivas: () => api.get('/alertas/activas'),
  getAll: () => api.get('/alertas'),
  resolver: (id) => api.patch(`/alertas/${id}/resolver`)
};

// API de Recorridos
export const recorridosAPI = {
  obtenerPorFecha: (id_sensor, fecha) =>
    api.get('/recorridos/fecha', { params: { id_sensor, fecha } }),

  guardar: (data) =>
    api.post('/recorridos/guardar', data),

  listar: (params) =>
    api.get('/recorridos/lista', { params }),

  obtenerPorId: (id) =>
    api.get(`/recorridos/${id}`),

  eliminar: (id) =>
    api.delete(`/recorridos/${id}`)
};

// API de Perfil
export const perfilAPI = {
  obtenerPerfil: (userId) => api.get(`/perfil/${userId}`),
  actualizarPerfil: (userId, data) => api.patch(`/perfil/${userId}`, data),
  cambiarContrasena: (userId, data) => api.post(`/perfil/${userId}/cambiar-contrasena`, data),
  obtenerHistorial: (userId, limite = 10) => api.get(`/perfil/${userId}/historial`, { params: { limite } })
};

// API de Gestión de API Keys (solo admins)
export const apiKeysAPI = {
  obtenerTodas: () => api.get('/admin/api-keys'),
  crear: (data) => api.post('/admin/api-keys', data),
  toggleEstado: (id) => api.patch(`/admin/api-keys/${id}/toggle`),
  actualizar: (id, data) => api.patch(`/admin/api-keys/${id}`, data),
  eliminar: (id) => api.delete(`/admin/api-keys/${id}`)
};

// API de Sitios
export const sitiosAPI = {
  getAll: () => api.get('/sitios'),
  getById: (id) => api.get(`/sitios/${id}`),
  create: (data) => api.post('/sitios', data),
  update: (id, data) => api.patch(`/sitios/${id}`, data),
  delete: (id) => api.delete(`/sitios/${id}`)
};

// API de Campañas de Monitoreo
export const campanasAPI = {
  getAll: () => api.get('/campanas'),
  getById: (id) => api.get(`/campanas/${id}`),
  create: (data) => api.post('/campanas', data),
  update: (id, data) => api.patch(`/campanas/${id}`, data),
  delete: (id) => api.delete(`/campanas/${id}`),
  agregarSensor: (id, id_sensor) => api.post(`/campanas/${id}/sensores`, { id_sensor }),
  quitarSensor: (id, id_sensor) => api.delete(`/campanas/${id}/sensores/${id_sensor}`)
};

// API de Variables
export const variablesAPI = {
  getAll: () => api.get('/variables'),
  getById: (id) => api.get(`/variables/${id}`),
  create: (data) => api.post('/variables', data),
  update: (id, data) => api.patch(`/variables/${id}`, data),
  delete: (id) => api.delete(`/variables/${id}`),
  getSensorVariables: (id_sensor) => api.get(`/variables/sensor/${id_sensor}`),
  setSensorVariables: (id_sensor, variables) => api.put(`/variables/sensor/${id_sensor}`, { variables })
};

// API de Logs (solo admins)
export const apiLogsAPI = {
  getLogs: (params) => api.get('/admin/logs', { params }),
  getEndpoints: () => api.get('/admin/logs/endpoints')
};

export default api;
