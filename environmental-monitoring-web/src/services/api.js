import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Token expirado o inválido
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const sensoresAPI = {
  getAll: () => api.get('/sensores'),
  getById: (id) => api.get(`/sensores/${id}`),
  create: (data) => api.post('/sensores', data),
  update: (id, data) => api.patch(`/sensores/${id}`, data),
  delete: (id) => api.delete(`/sensores/${id}`)
};

export const lecturasAPI = {
  getUltimas: (limite = 100) => api.get(`/lecturas/ultimas?limite=${limite}`),
  getBySensor: (id, limite = 50) => api.get(`/lecturas/sensor/${id}?limite=${limite}`),
  getEstadisticas: (id, dias = 7) => api.get(`/lecturas/estadisticas/${id}?dias=${dias}`),
  getAll: (filtros = {}) => api.get('/lecturas', { params: filtros })
};

export const alertasAPI = {
  getActivas: () => api.get('/alertas/activas'),
  getAll: () => api.get('/alertas'),
  resolver: (id) => api.patch(`/alertas/${id}/resolver`)
};

// ✅ Nueva API de Recorridos
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

// ✅ API de Perfil
export const perfilAPI = {
  obtenerPerfil: (userId) => api.get(`/perfil/${userId}`),
  actualizarPerfil: (userId, data) => api.patch(`/perfil/${userId}`, data),
  cambiarContrasena: (userId, data) => api.post(`/perfil/${userId}/cambiar-contrasena`, data),
  obtenerHistorial: (userId, limite = 10) => api.get(`/perfil/${userId}/historial`, { params: { limite } })
};

// ✅ API de Gestión de API Keys (solo admins)
export const apiKeysAPI = {
  obtenerTodas: () => api.get('/admin/api-keys'),
  crear: (data) => api.post('/admin/api-keys', data),
  toggleEstado: (id) => api.patch(`/admin/api-keys/${id}/toggle`),
  actualizar: (id, data) => api.patch(`/admin/api-keys/${id}`, data),
  eliminar: (id) => api.delete(`/admin/api-keys/${id}`)
};

export default api;