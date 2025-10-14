// src/pages/Sensores.jsx
import { useState, useEffect } from 'react';
import { sensoresAPI } from '../services/api';
import { useAuth } from '../context/AuthContext'; // ✅ Importar
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { 
  ServerIcon,
  SignalIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

export default function Sensores() {
  const { permisos, usuario } = useAuth(); // ✅ Obtener permisos y usuario
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [sensorSeleccionado, setSensorSeleccionado] = useState(null);

  useEffect(() => {
    cargarSensores();
  }, []);

  const cargarSensores = async () => {
    try {
      setLoading(true);
      const response = await sensoresAPI.getAll();
      setSensores(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar sensores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar sensores
  const sensoresFiltrados = sensores.filter(sensor => {
    const cumpleBusqueda = 
      sensor.id_sensor.toLowerCase().includes(busqueda.toLowerCase()) ||
      sensor.nombre_sensor.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleTipo = 
      filtroTipo === 'todos' ? true :
      filtroTipo === 'movil' ? sensor.is_movil === true :
      filtroTipo === 'fijo' ? sensor.is_movil === false : true;

    const cumpleZona = 
      filtroZona === 'todos' ? true :
      sensor.zona === filtroZona;

    const cumpleEstado = 
      filtroEstado === 'todos' ? true :
      sensor.estado === filtroEstado;

    return cumpleBusqueda && cumpleTipo && cumpleZona && cumpleEstado;
  });

  // Calcular estadísticas
  const stats = {
    total: sensores.length,
    activos: sensores.filter(s => s.estado === 'Activo').length,
    moviles: sensores.filter(s => s.is_movil === true).length,
    fijos: sensores.filter(s => s.is_movil === false).length
  };

  const abrirModal = (tipo, sensor = null) => {
    setModalTipo(tipo);
    setSensorSeleccionado(sensor);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalTipo('');
    setSensorSeleccionado(null);
  };

  const handleEliminar = async (sensor) => {
    // ✅ Verificar permisos antes de eliminar
    if (!permisos.eliminarSensor()) {
      alert('No tienes permisos para eliminar sensores');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el sensor ${sensor.id_sensor}?`)) {
      try {
        await sensoresAPI.delete(sensor.id_sensor);
        cargarSensores();
        alert('Sensor eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar sensor:', error);
        alert('Error al eliminar el sensor');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Sensores</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra y monitorea todos tus dispositivos de sensores ambientales
            {/* ✅ Mostrar rol y modo de visualización */}
            <span className="ml-2 text-xs text-gray-400">
              (Vista como {usuario?.rol})
            </span>
          </p>
        </div>
        
        {/* ✅ Botón Agregar solo para admin */}
        {permisos.crearSensor() ? (
          <button
            onClick={() => abrirModal('crear')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Agregar Sensor</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
            <LockClosedIcon className="w-5 h-5" />
            <span className="text-sm">Solo Lectura</span>
          </div>
        )}
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sensores</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <ServerIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sensores Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <SignalIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sensores Móviles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.moviles}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPinIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sensores Fijos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.fijos}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Banner de permisos para analistas */}
      {!permisos.crearSensor() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <LockClosedIcon className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Modo de solo lectura:</strong> Como analista, puedes ver todos los sensores pero no puedes crear, editar o eliminar.
            </p>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID o nombre del sensor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todos los tipos</option>
              <option value="movil">Móviles</option>
              <option value="fijo">Fijos</option>
            </select>

            <select
              value={filtroZona}
              onChange={(e) => setFiltroZona(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todas las zonas</option>
              <option value="Urbana">Urbana</option>
              <option value="Rural">Rural</option>
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {sensoresFiltrados.length} de {sensores.length} sensores
        </div>
      </div>

      {/* Tabla de Sensores */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sensor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Conexión
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sensoresFiltrados.length > 0 ? (
                sensoresFiltrados.map((sensor) => (
                  <tr key={sensor.id_sensor} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          sensor.is_movil ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <ServerIcon className={`h-6 w-6 ${
                            sensor.is_movil ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sensor.id_sensor}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sensor.nombre_sensor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sensor.is_movil
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {sensor.is_movil ? 'Móvil' : 'Fijo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sensor.zona === 'Urbana'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sensor.zona}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sensor.estado === 'Activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sensor.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sensor.last_seen 
                        ? new Date(sensor.last_seen).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Sin conexión'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* ✅ Ver detalles - Todos pueden */}
                        <button
                          onClick={() => abrirModal('ver', sensor)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        
                        {/* ✅ Editar - Solo admin */}
                        {permisos.editarSensor() ? (
                          <button
                            onClick={() => abrirModal('editar', sensor)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-300 p-1 rounded cursor-not-allowed"
                            title="Sin permisos para editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        
                        {/* ✅ Eliminar - Solo admin */}
                        {permisos.eliminarSensor() ? (
                          <button
                            onClick={() => handleEliminar(sensor)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-300 p-1 rounded cursor-not-allowed"
                            title="Sin permisos para eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron sensores que coincidan con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {modalAbierto && modalTipo === 'crear' && permisos.crearSensor() && (
        <ModalCrearSensor 
          onClose={cerrarModal} 
          onSuccess={cargarSensores} 
        />
      )}
      
      {modalAbierto && modalTipo === 'editar' && sensorSeleccionado && permisos.editarSensor() && (
        <ModalEditarSensor 
          sensor={sensorSeleccionado}
          onClose={cerrarModal} 
          onSuccess={cargarSensores} 
        />
      )}

      {modalAbierto && modalTipo === 'ver' && sensorSeleccionado && (
        <ModalVerSensor 
          sensor={sensorSeleccionado}
          onClose={cerrarModal} 
        />
      )}
    </div>
  );
}

// Componente Modal Crear Sensor (sin cambios, ya está bien)
function ModalCrearSensor({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    id_sensor: '',
    nombre_sensor: '',
    zona: 'Urbana',
    is_movil: false,
    description: ''
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      await sensoresAPI.create(formData);
      alert('Sensor creado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear sensor:', error);
      alert('Error al crear el sensor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agregar Nuevo Sensor</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Sensor *
              </label>
              <input
                type="text"
                required
                value={formData.id_sensor}
                onChange={(e) => setFormData({...formData, id_sensor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: SENSOR_005"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Sensor *
              </label>
              <input
                type="text"
                required
                value={formData.nombre_sensor}
                onChange={(e) => setFormData({...formData, nombre_sensor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ej: Sensor Cinco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona *
              </label>
              <select
                value={formData.zona}
                onChange={(e) => setFormData({...formData, zona: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_movil"
                checked={formData.is_movil}
                onChange={(e) => setFormData({...formData, is_movil: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="is_movil" className="ml-2 block text-sm text-gray-700">
                Sensor Móvil
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Descripción opcional del sensor"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Crear Sensor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Los componentes ModalEditarSensor y ModalVerSensor quedan igual, no necesitan cambios
// (El resto del código es idéntico al original)

function ModalEditarSensor({ sensor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre_sensor: sensor.nombre_sensor || '',
    zona: sensor.zona || 'Urbana',
    is_movil: sensor.is_movil || false,
    description: sensor.description || ''
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      await sensoresAPI.update(sensor.id_sensor, formData);
      alert('Sensor actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar sensor:', error);
      alert('Error al actualizar el sensor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Sensor</h2>
          <p className="text-sm text-gray-600 mb-4">ID: {sensor.id_sensor}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Sensor *
              </label>
              <input
                type="text"
                required
                value={formData.nombre_sensor}
                onChange={(e) => setFormData({...formData, nombre_sensor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona *
              </label>
              <select
                value={formData.zona}
                onChange={(e) => setFormData({...formData, zona: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_movil_edit"
                checked={formData.is_movil}
                onChange={(e) => setFormData({...formData, is_movil: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="is_movil_edit" className="ml-2 block text-sm text-gray-700">
                Sensor Móvil
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ModalVerSensor({ sensor, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalles del Sensor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID del Sensor</p>
                  <p className="text-base font-medium text-gray-900">{sensor.id_sensor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="text-base font-medium text-gray-900">{sensor.nombre_sensor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sensor.is_movil ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sensor.is_movil ? 'Móvil' : 'Fijo'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zona</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sensor.zona === 'Urbana' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {sensor.zona}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sensor.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {sensor.estado}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Conexión</p>
                  <p className="text-base font-medium text-gray-900">
                    {sensor.last_seen 
                      ? new Date(sensor.last_seen).toLocaleString('es-PE')
                      : 'Sin conexión'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {sensor.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">{sensor.description}</p>
              </div>
            )}

            {/* Fechas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Creación</p>
                  <p className="text-base font-medium text-gray-900">
                    {sensor.created_at 
                      ? new Date(sensor.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Actualización</p>
                  <p className="text-base font-medium text-gray-900">
                    {sensor.updated_at 
                      ? new Date(sensor.updated_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}