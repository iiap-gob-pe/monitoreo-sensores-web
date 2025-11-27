// src/pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { perfilAPI } from '../services/api';
import CambiarContrasenaModal from '../components/perfil/CambiarContrasenaModal';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function Perfil() {
  const [userId] = useState(1);

  const [perfil, setPerfil] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    username: ''
  });
  const [mostrarModalContrasena, setMostrarModalContrasena] = useState(false);

  useEffect(() => {
    cargarPerfil();
    cargarHistorial();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await perfilAPI.obtenerPerfil(userId);
      const result = response.data;

      if (result.success) {
        setPerfil(result.data);
        setFormData({
          nombre: result.data.nombre_completo || '',
          email: result.data.email || '',
          username: result.data.username || ''
        });
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const response = await perfilAPI.obtenerHistorial(userId, 10);
      const result = response.data;

      if (result.success) {
        setHistorial(result.data);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const response = await perfilAPI.actualizarPerfil(userId, formData);
      const result = response.data;

      if (result.success) {
        setPerfil(result.data);
        setModoEdicion(false);
        setMensaje({ tipo: 'success', texto: '✅ Perfil actualizado exitosamente' });
        cargarHistorial();
      } else {
        setMensaje({ tipo: 'error', texto: result.message || 'Error al actualizar perfil' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: '❌ Error al guardar los cambios' });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setFormData({
      nombre: perfil.nombre_completo || '',
      email: perfil.email || '',
      username: perfil.username || ''
    });
    setModoEdicion(false);
    setMensaje({ tipo: '', texto: '' });
  };

  const getRolBadge = (rol) => {
    const estilos = {
      'admin': 'bg-red-100 text-red-800',
      'analista': 'bg-blue-100 text-blue-800',
      'investigador': 'bg-purple-100 text-purple-800'
    };

    const iconos = {
      'admin': '👑',
      'analista': '📊',
      'investigador': '🔬'
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${estilos[rol] || 'bg-gray-100 text-gray-800'}`}>
        <span>{iconos[rol]}</span>
        {rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : 'Usuario'}
      </span>
    );
  };

  const getTipoActividadIcono = (tipo) => {
    const iconos = {
      'usuarios': '👤',
      'sensores': '📡',
      'lecturas': '📊',
      'alertas': '🚨',
      'sensor_umbral': '⚙️',
      'general': '📝'
    };
    return iconos[tipo] || '📝';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-2 text-lg text-gray-600">
          Gestiona tu información personal y revisa tu actividad
        </p>
      </div>

      {/* Botón Editar */}
      {!modoEdicion && (
        <div className="flex justify-center">
          <button
            onClick={() => setModoEdicion(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <PencilSquareIcon className="w-5 h-5" />
            Editar Perfil
          </button>
        </div>
      )}

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`p-4 rounded-lg ${
          mensaje.tipo === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card de Información Personal */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
            
            <div className="space-y-6">
              {/* Nombre Completo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserCircleIcon className="w-4 h-4 text-gray-400" />
                  Nombre Completo
                </label>
                {modoEdicion ? (
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ingrese su nombre completo"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.nombre_completo || 'No especificado'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  Correo Electrónico
                </label>
                {modoEdicion ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="usuario@ejemplo.com"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.email || 'No especificado'}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserCircleIcon className="w-4 h-4 text-gray-400" />
                  Nombre de Usuario
                </label>
                {modoEdicion ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="usuario123"
                  />
                ) : (
                  <p className="text-gray-900">{perfil.username || 'No especificado'}</p>
                )}
              </div>

              {/* Botones de acción */}
              {modoEdicion && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    onClick={handleCancelar}
                    disabled={guardando}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card de Historial */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
            
            {historial.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay actividad registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historial.map((actividad) => (
                  <div
                    key={actividad.actividad_id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl mt-0.5">
                      {getTipoActividadIcono(actividad.tipo_actividad)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {actividad.descripcion}
                      </p>
                      {actividad.detalles && (
                        <p className="text-xs text-gray-600 mt-1">
                          {actividad.detalles}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatearFecha(actividad.fecha_actividad)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          
          {/* Card de Rol */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Rol y Permisos</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Rol Actual
                </label>
                {getRolBadge(perfil.rol)}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Permisos del rol:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {perfil.rol === 'admin' && (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Acceso total al sistema
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Gestión de usuarios
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Configuración avanzada
                      </li>
                    </>
                  )}
                  {perfil.rol === 'analista' && (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Visualización de datos
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Exportación de reportes
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Configuración de alertas
                      </li>
                    </>
                  )}
                  {perfil.rol === 'investigador' && (
                    <>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Acceso a datos históricos
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Análisis estadístico
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Descarga de datasets
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Card de Información de Cuenta */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="text-sm font-medium text-gray-900">
                    {perfil.created_at ? formatearFecha(perfil.created_at) : 'No disponible'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Último acceso</p>
                  <p className="text-sm font-medium text-gray-900">
                    {perfil.ultimo_acceso ? formatearFecha(perfil.ultimo_acceso) : 'No disponible'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    perfil.estado === 'activo' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    Estado: {perfil.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Acciones Rápidas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-2">
                <button 
                    onClick={() => setMostrarModalContrasena(true)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                    <KeyIcon className="w-4 h-4 text-gray-500" />
                    Cambiar Contraseña
                </button>
            </div>
          </div>
        </div>
      </div>
        {mostrarModalContrasena && (
            <CambiarContrasenaModal 
                isOpen={mostrarModalContrasena}
                onClose={() => setMostrarModalContrasena(false)}
                userId={userId}
                onSuccess={(mensaje) => {
                    setMensaje({ tipo: 'success', texto: mensaje });
                    cargarHistorial();
                }}
            />
        )}
    </div>
  );
}