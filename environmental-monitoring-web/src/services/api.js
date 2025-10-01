import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sensoresAPI = {
  getAll: () => api.get('/sensores'),
  getById: (id) => api.get(`/sensores/${id}`),
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
  resolver: (id, nota) => api.put(`/alertas/${id}/resolver`, { nota }),
};

export default api;