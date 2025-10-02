import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;