// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_URL, STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const usuarioGuardado = localStorage.getItem(STORAGE_KEYS.USER);

    if (tokenGuardado && usuarioGuardado) {
      try {
        const decoded = jwtDecode(tokenGuardado);

        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(tokenGuardado);
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.usuario));

      setToken(data.token);
      setUsuario(data.usuario);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setToken(null);
      setUsuario(null);
    }
  };

  const isAdmin = () => {
    return usuario?.rol === 'admin';
  };

  // ✅ Permisos que funcionan para público Y admin
  const permisos = {
    // Solo admin puede modificar
    editarSensor: () => isAdmin(),
    resolverAlertas: () => isAdmin(),
    configurarUmbrales: () => isAdmin(),
    gestionarUsuarios: () => isAdmin(),
    
    // Todos pueden ver (público y admin)
    verSensores: () => true,
    verLecturas: () => true,
    verAlertas: () => true,
    verReportes: () => true,
    exportarDatos: () => true
  };

  const value = {
    usuario,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!token,
    permisos
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};