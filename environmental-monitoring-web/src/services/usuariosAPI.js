// src/services/usuariosAPI.js
const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data.success ? data.data : [];
  },

  // Crear usuario
  create: async (usuarioData) => {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(usuarioData)
    });
    return await response.json();
  },

  // Actualizar usuario
  update: async (id, usuarioData) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(usuarioData)
    });
    return await response.json();
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Obtener logs de actividad
  getLogs: async (limite = 100) => {
    const response = await fetch(`${API_URL}/usuarios/logs?limite=${limite}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data.success ? data.data : [];
  }
};