// src/components/configuracion/GestionUsuarios.jsx
import { useState, useEffect } from 'react';
import { usuariosAPI } from '../../services/usuariosAPI';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('crear'); // 'crear' o 'editar'
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'admin',
    estado: 'activo'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar usuarios
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuariosAPI.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setErrorMessage('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar logs
  const fetchLogs = async () => {
    try {
      const data = await usuariosAPI.getLogs(50);
      setLogs(data);
      setShowLogs(true);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    }
  };

  // Abrir modal para crear
  const handleCrearUsuario = () => {
    setModalMode('crear');
    setUsuarioSeleccionado(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre_completo: '',
      rol: 'admin',
      estado: 'activo'
    });
    setErrors({});
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditarUsuario = (usuario) => {
    setModalMode('editar');
    setUsuarioSeleccionado(usuario);
    setFormData({
      username: usuario.username,
      email: usuario.email,
      password: '',
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol,
      estado: usuario.estado
    });
    setErrors({});
    setShowModal(true);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (modalMode === 'crear') {
      if (!formData.username.trim()) {
        newErrors.username = 'El username es requerido';
      }
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      if (modalMode === 'crear') {
        result = await usuariosAPI.create(formData);
      } else {
        const dataToUpdate = {
          email: formData.email,
          nombre_completo: formData.nombre_completo,
          rol: formData.rol,
          estado: formData.estado
        };
        if (formData.password) {
          dataToUpdate.password = formData.password;
        }
        result = await usuariosAPI.update(usuarioSeleccionado.id_usuario, dataToUpdate);
      }

      if (result.success) {
        setSuccessMessage(result.message);
        setShowModal(false);
        fetchUsuarios();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setErrorMessage('Error al guardar usuario');
    }
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (usuario) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre_completo}"?`)) {
      return;
    }

    try {
      const result = await usuariosAPI.delete(usuario.id_usuario);
      if (result.success) {
        setSuccessMessage('Usuario eliminado exitosamente');
        fetchUsuarios();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setErrorMessage('Error al eliminar usuario');
    }
  };

  // Cambiar valores del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12">
        <div className="flex justify-center items-center">
          <div className="text-lg text-gray-600">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h2>
          <p className="text-sm text-gray-600 mt-1">
            Administra los usuarios y sus permisos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ClockIcon className="w-5 h-5" />
            Ver Logs
          </button>
          <button
            onClick={handleCrearUsuario}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ {errorMessage}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {usuario.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombre_completo}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{usuario.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.rol === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {usuario.rol === 'admin' ? 'Administrador' : 'Analista'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.estado === 'activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.ultimo_acceso 
                      ? new Date(usuario.ultimo_acceso).toLocaleString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditarUsuario(usuario)}
                      className="text-primary hover:text-green-700 mr-4"
                      title="Editar"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEliminarUsuario(usuario)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'crear' ? 'Crear Usuario' : 'Editar Usuario'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Juan Pérez García"
                />
                {errors.nombre_completo && (
                  <p className="mt-1 text-xs text-red-600">{errors.nombre_completo}</p>
                )}
              </div>

              {/* Username (solo en crear) */}
              {modalMode === 'crear' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="jperez"
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="juan.perez@iiap.gob.pe"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {modalMode === 'editar' && '(opcional)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                    placeholder={modalMode === 'crear' ? 'Mínimo 6 caracteres' : 'Dejar en blanco para no cambiar'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Rol */}
              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {/* Estado (solo en editar) */}
              {modalMode === 'editar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {modalMode === 'crear' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Logs */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Logs de Actividad</h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {logs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay logs disponibles</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id_log} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {log.username || 'Sistema'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 capitalize">
                              {log.accion.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {log.detalles && (
                            <p className="text-sm text-gray-600 mb-2">{log.detalles}</p>
                          )}
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {new Date(log.created_at).toLocaleString('es-PE')}
                            </span>
                            {log.ip_address && (
                              <span>🌐 {log.ip_address}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}