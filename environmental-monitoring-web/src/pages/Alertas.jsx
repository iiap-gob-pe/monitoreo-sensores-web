// src/pages/Alertas.jsx
import { useState, useEffect } from 'react';
import { alertasAPI, sensoresAPI } from '../services/api';
import { useAuth } from '../context/AuthContext'; // ✅ Importar
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XMarkIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  FireIcon,
  BellAlertIcon
} from '@heroicons/react/24/solid';

export default function Alertas() {
  const { permisos, usuario } = useAuth(); // ✅ Obtener permisos y usuario
  const [alertas, setAlertas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activas');
  const [filtroGravedad, setFiltroGravedad] = useState('todos');
  const [filtroSensor, setFiltroSensor] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatos(true);
  }, []);

  // Auto-refresh SOLO si no hay filtros
  useEffect(() => {
    const hayFiltros = busqueda || filtroEstado !== 'activas' || 
                      filtroGravedad !== 'todos' || filtroSensor !== 'todos';
    
    if (hayFiltros) return; // No actualizar si hay filtros
    
    const interval = setInterval(() => cargarDatos(false), 3000);
    return () => clearInterval(interval);
  }, [busqueda, filtroEstado, filtroGravedad, filtroSensor]);

  const cargarDatos = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      
      const [alertasRes, sensoresRes] = await Promise.all([
        alertasAPI.getAll({limite: 5000}),
        sensoresAPI.getAll()
      ]);
      
      setAlertas(alertasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  // Filtrar alertas
  const alertasFiltradas = alertas.filter(alerta => {
    const cumpleBusqueda = 
      alerta.id_sensor.toLowerCase().includes(busqueda.toLowerCase()) ||
      alerta.mensaje.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleEstado = 
      filtroEstado === 'todas' ? true :
      filtroEstado === 'activas' ? alerta.is_resolved === false :
      filtroEstado === 'resueltas' ? alerta.is_resolved === true : true;

    const cumpleGravedad = 
      filtroGravedad === 'todos' ? true :
      alerta.gravedad === filtroGravedad;

    const cumpleSensor = 
      filtroSensor === 'todos' ? true :
      alerta.id_sensor === filtroSensor;

    return cumpleBusqueda && cumpleEstado && cumpleGravedad && cumpleSensor;
  });

  // Calcular estadísticas
  const stats = {
    total: alertas.length,
    activas: alertas.filter(a => !a.is_resolved).length,
    criticas: alertas.filter(a => !a.is_resolved && a.gravedad === 'Critico').length,
    resueltas: alertas.filter(a => a.is_resolved).length
  };

  const handleResolverAlerta = async (alerta) => {
    // ✅ Verificar permisos antes de resolver
    if (!permisos.resolverAlertas()) {
      alert('No tienes permisos para resolver alertas. Solo los administradores pueden realizar esta acción.');
      return;
    }

    if (window.confirm(`¿Marcar como resuelta la alerta: ${alerta.mensaje}?`)) {
      try {
        await alertasAPI.resolver(alerta.id_alerta);
        cargarDatos();
        alert('Alerta marcada como resuelta');
      } catch (error) {
        console.error('Error al resolver alerta:', error);
        alert('Error al resolver la alerta');
      }
    }
  };

  const abrirDetalles = (alerta) => {
    setAlertaSeleccionada(alerta);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAlertaSeleccionada(null);
  };

  const getGravedadColor = (gravedad) => {
    switch(gravedad) {
      case 'Critico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGravedadIcon = (gravedad) => {
    switch(gravedad) {
      case 'Critico': return <FireIcon className="w-5 h-5" />;
      case 'Alto': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'Medio': return <ExclamationCircleIcon className="w-5 h-5" />;
      default: return <BellAlertIcon className="w-5 h-5" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Alertas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitorea y gestiona alertas generadas por los sensores ambientales
            {/* ✅ Mostrar rol del usuario */}
            <span className="ml-2 text-xs text-gray-400">
              (Vista como {usuario?.rol})
            </span>
          </p>
        </div>
      </div>

      {/* ✅ Banner de permisos para analistas */}
      {!permisos.resolverAlertas() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <LockClosedIcon className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Permisos limitados:</strong> Puedes ver todas las alertas pero solo los administradores pueden marcarlas como resueltas.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alertas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <BellAlertIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activas}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.criticas}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FireIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resueltas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.resueltas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por sensor o mensaje..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="resueltas">Resueltas</option>
            </select>

            <select
              value={filtroGravedad}
              onChange={(e) => setFiltroGravedad(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todas las gravedades</option>
              <option value="Critico">Críticas</option>
              <option value="Alto">Altas</option>
              <option value="Medio">Medias</option>
            </select>

            <select
              value={filtroSensor}
              onChange={(e) => setFiltroSensor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todos los sensores</option>
              {sensores.map(sensor => (
                <option key={sensor.id_sensor} value={sensor.id_sensor}>
                  {sensor.id_sensor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {alertasFiltradas.length} de {alertas.length} alertas
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {alertasFiltradas.length > 0 ? (
            alertasFiltradas.map((alerta) => {
              const sensor = sensores.find(s => s.id_sensor === alerta.id_sensor);
              return (
                <div 
                  key={alerta.id_alerta} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    alerta.is_resolved ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Contenido principal */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icono de gravedad */}
                      <div className={`p-3 rounded-lg ${getGravedadColor(alerta.gravedad)}`}>
                        {getGravedadIcon(alerta.gravedad)}
                      </div>

                      {/* Información de la alerta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {alerta.parametro_nombre}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getGravedadColor(alerta.gravedad)}`}>
                            {alerta.gravedad}
                          </span>
                          {alerta.is_resolved && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Resuelta
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-2">{alerta.mensaje}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="font-medium text-gray-700 mr-1">Sensor:</span>
                            {alerta.id_sensor}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-gray-700 mr-1">Zona:</span>
                            {sensor?.zona || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-gray-700 mr-1">Valor:</span>
                            {alerta.actual_valor} 
                            {alerta.parametro_nombre === 'Temperatura' ? '°C' : 
                             alerta.parametro_nombre === 'Humedad' ? '%' : ' ppm'}
                          </span>
                          <span className="flex items-center">
                            <span className="font-medium text-gray-700 mr-1">Umbral:</span>
                            {alerta.umbral_valor}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          Generada el {new Date(alerta.se_activo_at).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {alerta.is_resolved && alerta.resuelto_at && (
                            <span className="ml-3">
                              • Resuelta el {new Date(alerta.resuelto_at).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* ✅ Ver detalles - Todos pueden */}
                      <button
                        onClick={() => abrirDetalles(alerta)}
                        className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        Ver detalles
                      </button>
                      
                      {/* ✅ Resolver - Solo admin */}
                      {!alerta.is_resolved && (
                        permisos.resolverAlertas() ? (
                          <button
                            onClick={() => handleResolverAlerta(alerta)}
                            className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center space-x-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Resolver</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-2 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed flex items-center space-x-1"
                            title="Solo administradores pueden resolver alertas"
                          >
                            <LockClosedIcon className="w-4 h-4" />
                            <span>Resolver</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              No se encontraron alertas que coincidan con los filtros seleccionados
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {modalAbierto && alertaSeleccionada && (
        <ModalDetallesAlerta 
          alerta={alertaSeleccionada}
          sensor={sensores.find(s => s.id_sensor === alertaSeleccionada.id_sensor)}
          onClose={cerrarModal}
          onResolver={handleResolverAlerta}
          puedeResolver={permisos.resolverAlertas()} // ✅ Pasar permiso al modal
        />
      )}
    </div>
  );
}

// Componente Modal Detalles de Alerta
function ModalDetallesAlerta({ alerta, sensor, onClose, onResolver, puedeResolver }) { // ✅ Recibir permiso
  const getGravedadColor = (gravedad) => {
    switch(gravedad) {
      case 'Critico': return 'bg-red-100 text-red-800';
      case 'Alto': return 'bg-orange-100 text-orange-800';
      case 'Medio': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalles de la Alerta</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Estado y Gravedad */}
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getGravedadColor(alerta.gravedad)}`}>
                {alerta.gravedad}
              </span>
              {alerta.is_resolved ? (
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Resuelta
                </span>
              ) : (
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
                  ⚠ Activa
                </span>
              )}
            </div>

            {/* Información de la Alerta */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Alerta</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID de Alerta</p>
                  <p className="text-base font-medium text-gray-900">#{alerta.id_alerta}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Alerta</p>
                  <p className="text-base font-medium text-gray-900">{alerta.alerta_tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parámetro</p>
                  <p className="text-base font-medium text-gray-900">{alerta.parametro_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Actual</p>
                  <p className="text-base font-medium text-red-600">
                    {alerta.actual_valor} 
                    {alerta.parametro_nombre === 'Temperatura' ? '°C' : 
                     alerta.parametro_nombre === 'Humedad' ? '%' : ' ppm'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Umbral Configurado</p>
                  <p className="text-base font-medium text-gray-900">
                    {alerta.umbral_valor}
                    {alerta.parametro_nombre === 'Temperatura' ? '°C' : 
                     alerta.parametro_nombre === 'Humedad' ? '%' : ' ppm'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exceso</p>
                  <p className="text-base font-medium text-orange-600">
                    +{(alerta.actual_valor - alerta.umbral_valor).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mensaje</h3>
              <p className="text-gray-700">{alerta.mensaje}</p>
            </div>

            {/* Información del Sensor */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Asociado</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID del Sensor</p>
                  <p className="text-base font-medium text-gray-900">{alerta.id_sensor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre del Sensor</p>
                  <p className="text-base font-medium text-gray-900">{sensor?.nombre_sensor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zona</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sensor?.zona === 'Urbana' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {sensor?.zona || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sensor?.is_movil ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {sensor?.is_movil ? 'Móvil' : 'Fijo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro Temporal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Generación</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(alerta.created_at).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
                {alerta.is_resolved && alerta.resuelto_at && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Resolución</p>
                    <p className="text-base font-medium text-green-600">
                      {new Date(alerta.resuelto_at).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Acciones con permisos */}
          <div className="mt-6 flex space-x-3">
            {!alerta.is_resolved && (
              puedeResolver ? (
                <button
                  onClick={() => {
                    onResolver(alerta);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Marcar como Resuelta</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
                  title="Solo administradores pueden resolver alertas"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Solo Admin puede Resolver</span>
                </button>
              )
            )}
            <button
              onClick={onClose}
              className={`${!alerta.is_resolved && puedeResolver ? 'flex-1' : 'w-full'} px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}