// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

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
      const response = await fetch('http://localhost:3000/api/auth/login', {
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

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
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setToken(null);
      setUsuario(null);
    }
  };

  const isAdmin = () => {
    return usuario?.rol === 'admin';
  };

  const isAnalista = () => {
    return usuario?.rol === 'analista';
  };

  // ✅ Nuevas funciones de permisos granulares
  const permisos = {
    // Sensores
    verSensores: () => true, // Todos pueden ver
    crearSensor: () => isAdmin(),
    editarSensor: () => isAdmin(),
    eliminarSensor: () => isAdmin(),
    
    // Lecturas
    verLecturas: () => true,
    exportarDatos: () => true,
    exportarTodosDatos: () => true, // Todos pueden exportar
    
    // Alertas
    verAlertas: () => true,
    resolverAlertas: () => isAdmin(),
    
    // Configuración
    configurarUmbrales: () => isAdmin(),
    gestionarUsuarios: () => isAdmin(),
    
    // Reportes
    verReportes: () => true,
    generarReportes: () => true
  };

  const value = {
    usuario,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAnalista,
    isAuthenticated: !!token,
    permisos // ✅ Exportar permisos
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};