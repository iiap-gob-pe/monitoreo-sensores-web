// src/pages/Sensores.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sensoresAPI, sitiosAPI, variablesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { useConfirm } from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  LockClosedIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import {
  ServerIcon,
  SignalIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

export default function Sensores() {
  const { permisos, usuario } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [sensoresRecientes, setSensoresRecientes] = useState([]);
  const [sensorSeleccionado, setSensorSeleccionado] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  useEffect(() => {
    cargarSensores();
  }, []);

  const cargarSensores = async () => {
    try {
      setLoading(true);
      const response = await sensoresAPI.getAll();
      const todosSensores = response.data.data || [];
      setSensores(todosSensores);

      // 🆕 Filtrar sensores detectados en las últimas 24 horas
      const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recientes = todosSensores.filter(s =>
        new Date(s.created_at) > hace24h
      );
      setSensoresRecientes(recientes);

    } catch (error) {
      console.error('Error al cargar sensores:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Función para calcular tiempo transcurrido
const calcularTiempoDesde = (fecha) => {
  const ahora = new Date();
  const entonces = new Date(fecha);
  const diffMs = ahora - entonces;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMins / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffDias > 0) return `${diffDias} día${diffDias > 1 ? 's' : ''}`;
  if (diffHoras > 0) return `${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
  if (diffMins > 0) return `${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  return 'recién';
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

  // Reset pagina cuando cambian filtros
  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroTipo, filtroZona, filtroEstado]);

  // Paginación
  const totalPaginas = Math.ceil(sensoresFiltrados.length / porPagina);
  const sensoresPaginados = sensoresFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

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

  const handleDesactivar = async (sensor) => {
    // ✅ Verificar permisos antes de desactivar
    if (!permisos.editarSensor()) {
      toast.error('No tienes permisos para cambiar el estado de sensores');
      return;
    }

    const nuevoEstado = sensor.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const accion = nuevoEstado === 'Inactivo' ? 'desactivar' : 'activar';

    const confirmado = await confirm(`¿Estás seguro de ${accion} el sensor ${sensor.id_sensor}?`);
    if (confirmado) {
      try {
        await sensoresAPI.update(sensor.id_sensor, { estado: nuevoEstado });
        cargarSensores();
        toast.success(`Sensor ${accion === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
      } catch (error) {
        console.error(`Error al ${accion} sensor:`, error);
        toast.error(`Error al ${accion} el sensor`);
      }
    }
  };

  // Helper para renderizar la zona en la tabla
  const renderZonaCell = (sensor) => {
    if (!sensor.is_movil && sensor.sitio) {
      return (
        <div>
          <p className="text-sm font-medium text-gray-900">{sensor.sitio.nombre}</p>
          {sensor.sitio.zona && (
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
              sensor.sitio.zona === 'Urbana' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
            }`}>
              {sensor.sitio.zona}
            </span>
          )}
        </div>
      );
    }
    if (sensor.is_movil && sensor.campanas && sensor.campanas.length > 0) {
      return (
        <div className="space-y-1">
          {sensor.campanas.slice(0, 2).map((c) => (
            <span key={c.id_campana} className={`block px-2 py-0.5 text-xs font-semibold rounded-full ${
              c.estado === 'Activa' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {c.nombre}
            </span>
          ))}
          {sensor.campanas.length > 2 && (
            <span className="text-xs text-gray-500">+{sensor.campanas.length - 2} más</span>
          )}
        </div>
      );
    }
    // Fallback to old zona field
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        sensor.zona === 'Urbana'
          ? 'bg-gray-100 text-gray-800'
          : 'bg-green-100 text-green-800'
      }`}>
        {sensor.zona || 'Sin asignar'}
      </span>
    );
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

        <div className="flex items-center space-x-3">
          {/* Botón Nuevo Sensor - Solo visible para usuarios con permisos */}
          {permisos.editarSensor() && (
            <button
              onClick={() => setModalCrearAbierto(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nuevo Sensor</span>
            </button>
          )}

          {/* 🆕 Mensaje informativo de auto-registro */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            <ServerIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              Los sensores se registran automáticamente al conectarse
            </span>
          </div>
        </div>
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

      {/* ✅ Banner de permisos*/}
      {!permisos.editarSensor() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <LockClosedIcon className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Modo de solo lectura:</strong> Puedes ver todos los sensores pero no puedes crear, editar o eliminar.
            </p>
          </div>
        </div>
      )}

      {/* 🆕 Sensores Detectados Recientemente - VERSIÓN MINIMALISTA */}
      {sensoresRecientes.length > 0 && (
        <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Sensores Detectados Recientemente
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                {sensoresRecientes.length}
              </span>
            </div>
            <span className="text-xs text-gray-500">Últimas 24 horas</span>
          </div>

          <div className="space-y-2">
            {sensoresRecientes.map(sensor => (
              <div
                key={sensor.id_sensor}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${
                    sensor.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sensor.id_sensor}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {sensor.nombre_sensor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    hace {calcularTiempoDesde(sensor.created_at)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    sensor.is_movil
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {sensor.is_movil ? 'Móvil' : 'Fijo'}
                  </span>
                </div>
              </div>
            ))}
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
                  Zona / Ubicación
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
              {sensoresPaginados.length > 0 ? (
                sensoresPaginados.map((sensor) => (
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
                    <td className="px-6 py-4">
                      {renderZonaCell(sensor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sensor.estado === 'Activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sensor.estado}
                      </span>
                      <span className={`ml-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        sensor.visibilidad === 'privado' ? 'bg-gray-800 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {sensor.visibilidad === 'privado' ? 'Privado' : 'Público'}
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
                        {/* Ver dashboard del sensor */}
                        <button
                          onClick={() => navigate(`/sensors/${sensor.id_sensor}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                          title="Ver dashboard del sensor"
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

                        {/* ✅ Desactivar/Activar - Solo admin */}
                        {permisos.editarSensor() ? (
                          <button
                            onClick={() => handleDesactivar(sensor)}
                            className={`p-1 rounded transition ${
                              sensor.estado === 'Activo'
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={sensor.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                          >
                            {sensor.estado === 'Activo' ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
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
        {totalPaginas > 1 && (
          <Pagination
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onChange={setPagina}
            totalItems={sensoresFiltrados.length}
            porPagina={porPagina}
          />
        )}
      </div>

      {/* Modales */}
      {modalAbierto && modalTipo === 'editar' && sensorSeleccionado && permisos.editarSensor() && (
        <ModalEditarSensor
          sensor={sensorSeleccionado}
          onClose={cerrarModal}
          onSuccess={cargarSensores}
        />
      )}

      {/* Ver detalle navega a /sensores/:id */}

      {/* Modal Crear Sensor */}
      {modalCrearAbierto && permisos.editarSensor() && (
        <ModalCrearSensor
          onClose={() => setModalCrearAbierto(false)}
          onSuccess={cargarSensores}
        />
      )}
    </div>
  );
}


// ========================================
// Modal Crear Sensor
// ========================================
function ModalCrearSensor({ onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    id_sensor: '',
    nombre_sensor: '',
    is_movil: false,
    id_sitio: '',
    latitud: '',
    longitud: '',
    altitud: '',
    description: '',
    visibilidad: 'publico'
  });
  const [sitios, setSitios] = useState([]);
  const [variablesDisponibles, setVariablesDisponibles] = useState([]);
  const [variablesSeleccionadas, setVariablesSeleccionadas] = useState([]);
  const [cargandoSitios, setCargandoSitios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [apiKeyResult, setApiKeyResult] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    cargarSitios();
    cargarVariables();
  }, []);

  const cargarVariables = async () => {
    try {
      const res = await variablesAPI.getAll();
      const vars = (res.data.data || []).filter(v => v.estado === 'activo');
      setVariablesDisponibles(vars);
      // Pre-seleccionar las 4 default con orden
      const defaults = ['temperatura', 'humedad', 'co2', 'co'];
      const presel = vars.filter(v => defaults.includes(v.codigo)).map((v, idx) => ({ id_variable: v.id_variable, orden_csv: idx + 1, nombre: v.nombre, codigo: v.codigo, unidad: v.unidad }));
      setVariablesSeleccionadas(presel);
    } catch (err) {
      console.error('Error cargando variables:', err);
    }
  };

  const agregarVariable = (id_variable) => {
    const v = variablesDisponibles.find(x => x.id_variable === parseInt(id_variable));
    if (!v || variablesSeleccionadas.find(x => x.id_variable === v.id_variable)) return;
    setVariablesSeleccionadas([...variablesSeleccionadas, { id_variable: v.id_variable, orden_csv: variablesSeleccionadas.length + 1, nombre: v.nombre, codigo: v.codigo, unidad: v.unidad }]);
  };

  const quitarVariable = (id_variable) => {
    const nuevas = variablesSeleccionadas.filter(v => v.id_variable !== id_variable).map((v, idx) => ({ ...v, orden_csv: idx + 1 }));
    setVariablesSeleccionadas(nuevas);
  };

  const moverVariable = (idx, dir) => {
    const arr = [...variablesSeleccionadas];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setVariablesSeleccionadas(arr.map((v, i) => ({ ...v, orden_csv: i + 1 })));
  };

  const cargarSitios = async () => {
    try {
      setCargandoSitios(true);
      const response = await sitiosAPI.getAll();
      setSitios(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error al cargar sitios:', error);
    } finally {
      setCargandoSitios(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const payload = {
        id_sensor: formData.id_sensor,
        nombre_sensor: formData.nombre_sensor,
        is_movil: formData.is_movil,
        description: formData.description || undefined,
        visibilidad: formData.visibilidad
      };

      // Estacionario: incluir sitio y ubicación
      if (!formData.is_movil) {
        if (formData.id_sitio) payload.id_sitio = formData.id_sitio;
        if (formData.latitud) payload.latitud = formData.latitud;
        if (formData.longitud) payload.longitud = formData.longitud;
        if (formData.altitud) payload.altitud = formData.altitud;
      }

      const response = await sensoresAPI.create(payload);
      const data = response.data;

      // Guardar configuración de variables del sensor
      if (variablesSeleccionadas.length > 0) {
        await variablesAPI.setSensorVariables(formData.id_sensor, variablesSeleccionadas.map(v => ({
          id_variable: v.id_variable,
          orden_csv: v.orden_csv
        }))).catch(err => console.error('Error configurando variables:', err));
      }

      // Extraer la API key de la respuesta
      const apiKeyPlain = data.api_key?.api_key_plain || data.data?.api_key?.api_key_plain || null;

      if (apiKeyPlain) {
        setApiKeyResult(apiKeyPlain);
      } else {
        toast.success('Sensor creado exitosamente');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al crear sensor:', error);
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al crear el sensor';
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleCopiarApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKeyResult);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = apiKeyResult;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleCerrarConApiKey = () => {
    onSuccess();
    onClose();
  };

  // Si ya se creó el sensor y tenemos la API key, mostrar el resultado
  if (apiKeyResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Sensor Creado Exitosamente</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              Guarda la API Key del sensor. <strong className="text-red-600">No podrás verla nuevamente.</strong>
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">API Key del Sensor</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm font-mono text-gray-900 break-all bg-white px-3 py-2 rounded border">
                  {apiKeyResult}
                </code>
                <button
                  onClick={handleCopiarApiKey}
                  className={`flex-shrink-0 p-2 rounded-lg transition ${
                    copiado
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title="Copiar API Key"
                >
                  {copiado ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {copiado && (
                <p className="text-xs text-green-600 mt-1">Copiado al portapapeles</p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Importante:</strong> Esta API Key es necesaria para que el sensor envíe datos al sistema.
                Configúrala en el dispositivo antes de cerrar esta ventana.
              </p>
            </div>

            <button
              onClick={handleCerrarConApiKey}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Entendido, cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Sensor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
                placeholder="Ej: SENSOR_TEMP_001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Identificador único del sensor</p>
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
                placeholder="Ej: Sensor de Temperatura - Zona Norte"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="is_movil_crear" className="block text-sm font-medium text-gray-700">
                  Sensor Móvil
                </label>
                <p className="text-xs text-gray-500">
                  {formData.is_movil
                    ? 'Se asigna a campañas de monitoreo'
                    : 'Se asigna a un sitio fijo de monitoreo'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_movil}
                onClick={() => setFormData({...formData, is_movil: !formData.is_movil, id_sitio: ''})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.is_movil ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.is_movil ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dropdown de Sitio - solo visible cuando es estacionario */}
            {!formData.is_movil && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio de Monitoreo
                </label>
                {cargandoSitios ? (
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Cargando sitios...</span>
                  </div>
                ) : (
                  <select
                    value={formData.id_sitio}
                    onChange={(e) => setFormData({...formData, id_sitio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">-- Seleccionar sitio --</option>
                    {sitios.map((sitio) => (
                      <option key={sitio.id_sitio} value={sitio.id_sitio}>
                        {sitio.nombre} {sitio.zona ? `(${sitio.zona})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1 text-xs text-gray-500">Ubicación fija donde estará instalado el sensor. La ubicación se hereda del sitio si no se especifica.</p>
              </div>
            )}

            {/* Ubicación geográfica - solo estacionarios */}
            {!formData.is_movil && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación Geográfica
                  <span className="text-xs text-gray-400 ml-1">(opcional si tiene sitio)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitud}
                      onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                      placeholder="Latitud"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitud}
                      onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                      placeholder="Longitud"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={formData.altitud}
                      onChange={(e) => setFormData({...formData, altitud: e.target.value})}
                      placeholder="Altitud (m)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Si no se especifica, se usa la ubicación del sitio.</p>
              </div>
            )}

            {formData.is_movil && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700">
                  Los sensores móviles se asignan a campañas de monitoreo desde la sección de Campañas.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                placeholder="Descripción opcional del sensor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Configuración de variables que mide el sensor */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables que mide el sensor
                <span className="text-xs text-gray-400 ml-1">(el orden define las columnas del CSV)</span>
              </label>

              {/* Variables seleccionadas con orden */}
              {variablesSeleccionadas.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Formato CSV: Fecha;Hora;{variablesSeleccionadas.map(v => v.codigo).join(';')}</p>
                  {variablesSeleccionadas.map((v, idx) => (
                    <div key={v.id_variable} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border">
                      <span className="text-xs font-bold text-gray-400 w-5">{v.orden_csv}</span>
                      <span className="text-sm font-medium text-gray-800 flex-1">{v.nombre} <span className="text-gray-400">({v.unidad})</span></span>
                      <button type="button" onClick={() => moverVariable(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                      <button type="button" onClick={() => moverVariable(idx, 1)} disabled={idx === variablesSeleccionadas.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                      <button type="button" onClick={() => quitarVariable(v.id_variable)} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar variable */}
              <select
                onChange={(e) => { agregarVariable(e.target.value); e.target.value = ''; }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                defaultValue=""
              >
                <option value="" disabled>+ Agregar variable...</option>
                {variablesDisponibles.filter(v => !variablesSeleccionadas.find(s => s.id_variable === v.id_variable)).map(v => (
                  <option key={v.id_variable} value={v.id_variable}>{v.nombre} ({v.unidad})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibilidad</label>
                <p className="text-xs text-gray-500">
                  {formData.visibilidad === 'publico' ? 'Visible para todos los visitantes' : 'Solo visible para usuarios autenticados'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, visibilidad: formData.visibilidad === 'publico' ? 'privado' : 'publico'})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  formData.visibilidad === 'publico' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  formData.visibilidad === 'publico' ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
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
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 font-medium"
              >
                {guardando ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creando...</span>
                  </span>
                ) : (
                  'Crear Sensor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


// ========================================
// Modal Editar Sensor (updated with id_sitio dropdown)
// ========================================
function ModalEditarSensor({ sensor, onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre_sensor: sensor.nombre_sensor || '',
    zona: sensor.zona || 'Urbana',
    is_movil: sensor.is_movil || false,
    id_sitio: sensor.sitio?.id_sitio || sensor.id_sitio || '',
    latitud: sensor.latitud || '',
    longitud: sensor.longitud || '',
    altitud: sensor.altitud || '',
    description: sensor.description || '',
    visibilidad: sensor.visibilidad || 'publico'
  });
  const [sitios, setSitios] = useState([]);
  const [variablesDisponibles, setVariablesDisponibles] = useState([]);
  const [variablesSeleccionadas, setVariablesSeleccionadas] = useState([]);
  const [cargandoSitios, setCargandoSitios] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!formData.is_movil) cargarSitios();
    cargarVariablesConfig();
  }, []);

  const cargarVariablesConfig = async () => {
    try {
      const [varsRes, configRes] = await Promise.all([
        variablesAPI.getAll(),
        variablesAPI.getSensorVariables(sensor.id_sensor)
      ]);
      const vars = (varsRes.data.data || []).filter(v => v.estado === 'activo');
      setVariablesDisponibles(vars);
      const config = (configRes.data.data || []).map(sv => ({
        id_variable: sv.variable.id_variable,
        orden_csv: sv.orden_csv,
        nombre: sv.variable.nombre,
        codigo: sv.variable.codigo,
        unidad: sv.variable.unidad
      }));
      setVariablesSeleccionadas(config);
    } catch (err) {
      console.error('Error cargando variables:', err);
    }
  };

  const agregarVariableEdit = (id_variable) => {
    const v = variablesDisponibles.find(x => x.id_variable === parseInt(id_variable));
    if (!v || variablesSeleccionadas.find(x => x.id_variable === v.id_variable)) return;
    setVariablesSeleccionadas([...variablesSeleccionadas, { id_variable: v.id_variable, orden_csv: variablesSeleccionadas.length + 1, nombre: v.nombre, codigo: v.codigo, unidad: v.unidad }]);
  };

  const quitarVariableEdit = (id_variable) => {
    setVariablesSeleccionadas(variablesSeleccionadas.filter(v => v.id_variable !== id_variable).map((v, i) => ({ ...v, orden_csv: i + 1 })));
  };

  const moverVariableEdit = (idx, dir) => {
    const arr = [...variablesSeleccionadas];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setVariablesSeleccionadas(arr.map((v, i) => ({ ...v, orden_csv: i + 1 })));
  };

  const cargarSitios = async () => {
    try {
      setCargandoSitios(true);
      const response = await sitiosAPI.getAll();
      setSitios(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error al cargar sitios:', error);
    } finally {
      setCargandoSitios(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const payload = {
        nombre_sensor: formData.nombre_sensor,
        zona: formData.zona,
        is_movil: formData.is_movil,
        description: formData.description,
        visibilidad: formData.visibilidad
      };

      // Estacionario: incluir sitio y ubicación
      if (!formData.is_movil) {
        payload.id_sitio = formData.id_sitio || null;
        payload.latitud = formData.latitud || null;
        payload.longitud = formData.longitud || null;
        payload.altitud = formData.altitud || null;
      } else {
        payload.id_sitio = null;
      }

      await sensoresAPI.update(sensor.id_sensor, payload);

      // Guardar configuración de variables
      await variablesAPI.setSensorVariables(sensor.id_sensor, variablesSeleccionadas.map(v => ({
        id_variable: v.id_variable,
        orden_csv: v.orden_csv
      }))).catch(err => console.error('Error guardando variables:', err));

      toast.success('Sensor actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar sensor:', error);
      toast.error('Error al actualizar el sensor');
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
                onChange={(e) => setFormData({...formData, is_movil: e.target.checked, id_sitio: ''})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="is_movil_edit" className="ml-2 block text-sm text-gray-700">
                Sensor Móvil
              </label>
            </div>

            {/* Dropdown de Sitio - solo visible cuando es estacionario */}
            {!formData.is_movil && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio de Monitoreo
                </label>
                {cargandoSitios ? (
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Cargando sitios...</span>
                  </div>
                ) : (
                  <select
                    value={formData.id_sitio}
                    onChange={(e) => setFormData({...formData, id_sitio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">-- Seleccionar sitio --</option>
                    {sitios.map((sitio) => (
                      <option key={sitio.id_sitio} value={sitio.id_sitio}>
                        {sitio.nombre} {sitio.zona ? `(${sitio.zona})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Ubicación geográfica - solo estacionarios */}
            {!formData.is_movil && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación Geográfica
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitud}
                      onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                      placeholder="Latitud"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitud}
                      onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                      placeholder="Longitud"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      value={formData.altitud}
                      onChange={(e) => setFormData({...formData, altitud: e.target.value})}
                      placeholder="Altitud (m)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Si se deja vacío, se usa la ubicación del sitio asignado.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Configuración de variables */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables que mide
                <span className="text-xs text-gray-400 ml-1">(el orden define columnas del CSV)</span>
              </label>
              {variablesSeleccionadas.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Formato: Fecha;Hora;{variablesSeleccionadas.map(v => v.codigo).join(';')}</p>
                  {variablesSeleccionadas.map((v, idx) => (
                    <div key={v.id_variable} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border">
                      <span className="text-xs font-bold text-gray-400 w-5">{v.orden_csv}</span>
                      <span className="text-sm font-medium text-gray-800 flex-1">{v.nombre} <span className="text-gray-400">({v.unidad})</span></span>
                      <button type="button" onClick={() => moverVariableEdit(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                      <button type="button" onClick={() => moverVariableEdit(idx, 1)} disabled={idx === variablesSeleccionadas.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                      <button type="button" onClick={() => quitarVariableEdit(v.id_variable)} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <select onChange={(e) => { agregarVariableEdit(e.target.value); e.target.value = ''; }} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" defaultValue="">
                <option value="" disabled>+ Agregar variable...</option>
                {variablesDisponibles.filter(v => !variablesSeleccionadas.find(s => s.id_variable === v.id_variable)).map(v => (
                  <option key={v.id_variable} value={v.id_variable}>{v.nombre} ({v.unidad})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibilidad</label>
                <p className="text-xs text-gray-500">
                  {formData.visibilidad === 'publico' ? 'Visible para todos los visitantes' : 'Solo visible para usuarios autenticados'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, visibilidad: formData.visibilidad === 'publico' ? 'privado' : 'publico'})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  formData.visibilidad === 'publico' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  formData.visibilidad === 'publico' ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
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


// ========================================
// Modal Ver Sensor (updated with sitio/campanas info)
// ========================================
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

            {/* Sitio de Monitoreo - Solo para estacionarios */}
            {!sensor.is_movil && sensor.sitio && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sitio de Monitoreo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre del Sitio</p>
                    <p className="text-base font-medium text-gray-900">{sensor.sitio.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zona</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      sensor.sitio.zona === 'Urbana' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {sensor.sitio.zona}
                    </span>
                  </div>
                  {sensor.sitio.referencia_ubicacion && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Referencia de Ubicación</p>
                      <p className="text-base font-medium text-gray-900">{sensor.sitio.referencia_ubicacion}</p>
                    </div>
                  )}
                  {(sensor.sitio.latitud && sensor.sitio.longitud) && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Coordenadas</p>
                      <p className="text-base font-medium text-gray-900">
                        {sensor.sitio.latitud}, {sensor.sitio.longitud}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campañas de Monitoreo - Solo para móviles */}
            {sensor.is_movil && sensor.campanas && sensor.campanas.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campañas de Monitoreo
                  <span className="ml-2 text-sm font-normal text-gray-500">({sensor.campanas.length})</span>
                </h3>
                <div className="space-y-3">
                  {sensor.campanas.map((campana) => (
                    <div key={campana.id_campana} className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{campana.nombre}</p>
                          {campana.zona && (
                            <p className="text-xs text-gray-500">Zona: {campana.zona}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          campana.estado === 'Activa'
                            ? 'bg-green-100 text-green-700'
                            : campana.estado === 'Finalizada'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {campana.estado}
                        </span>
                      </div>
                      {(campana.fecha_inicio || campana.fecha_fin) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {campana.fecha_inicio && new Date(campana.fecha_inicio).toLocaleDateString('es-PE')}
                          {campana.fecha_inicio && campana.fecha_fin && ' - '}
                          {campana.fecha_fin && new Date(campana.fecha_fin).toLocaleDateString('es-PE')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sensor.is_movil && (!sensor.campanas || sensor.campanas.length === 0) && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Campañas de Monitoreo</h3>
                <p className="text-sm text-gray-600">Este sensor móvil no está asignado a ninguna campaña.</p>
              </div>
            )}

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
