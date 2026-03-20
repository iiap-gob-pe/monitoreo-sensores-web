import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lecturasAPI, alertasAPI, sensoresAPI, sitiosAPI, campanasAPI, variablesAPI } from '../services/api';
import { usePreferencias } from '../hooks/usePreferencias';
import { useAuth } from '../context/AuthContext';
import {
  ServerIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CloudIcon,
  ClockIcon,
  MapPinIcon,
  FlagIcon,
  ArrowRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import MapView from '../components/dashboard/MapView';

export default function Dashboard() {
  const { preferencias, formatearFecha, formatearHora } = usePreferencias();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lecturas, setLecturas] = useState([]);
  const [lecturasActuales, setLecturasActuales] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [sitios, setSitios] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [variablesList, setVariablesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limite, setLimite] = useState(5);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => { fetchData(true); }, []);

  useEffect(() => {
    if (preferencias.intervaloActualizacion > 0) {
      const interval = setInterval(() => fetchData(false), preferencias.intervaloActualizacion * 1000);
      return () => clearInterval(interval);
    }
  }, [preferencias.intervaloActualizacion]);

  const fetchData = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      const [lecturasRes, actualesRes, alertasRes, sensoresRes, sitiosRes, campanasRes, variablesRes] = await Promise.all([
        lecturasAPI.getUltimas(100),
        lecturasAPI.getActuales(),
        alertasAPI.getActivas(),
        sensoresAPI.getAll(),
        sitiosAPI.getAll(),
        campanasAPI.getAll(),
        variablesAPI.getAll()
      ]);
      setLecturas(lecturasRes.data.data || []);
      setLecturasActuales(actualesRes.data.data || []);
      setAlertas(alertasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
      setSitios(sitiosRes.data.data || []);
      setCampanas(campanasRes.data.data || []);
      setVariablesList(variablesRes.data.data || []);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  const lecturasTabla = lecturas
    .filter(lectura => {
      if (tipoFiltro === 'todos') return true;
      const sensor = sensores.find(s => s.id_sensor === lectura.id_sensor);
      if (tipoFiltro === 'movil') return sensor?.is_movil === true;
      if (tipoFiltro === 'fijo') return sensor?.is_movil === false;
      return true;
    })
    .slice(0, limite);

  const lecturasUnicasPorSensor = lecturasActuales.filter(l => l.latitud && l.longitud);
  const sensoresActivos = sensores.filter(s => s.estado === 'Activo').length;
  const sitiosActivos = sitios.filter(s => s.estado === 'activo').length;
  const campanasActivas = campanas.filter(c => c.estado === 'activa').length;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          IIAP Sense
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
          Portal web de almacenamiento, gestión y procesamiento de datos provenientes de sensores ambientales, generados en los distintos proyectos de investigacion institucionales.
        </p>
      </div>

      {/* Indicador de actualización */}
      <div className="flex justify-center px-4">
        <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {preferencias.intervaloActualizacion > 0
                ? `Actualizando cada ${preferencias.intervaloActualizacion}s`
                : 'Actualización automática desactivada'}
            </span>
          </div>
          {ultimaActualizacion && (
            <>
              <span className="hidden sm:inline text-gray-300">|</span>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <ClockIcon className="w-3 h-3" />
                <span>Última: {formatearHora(ultimaActualizacion)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards - Clickeables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sensores Activos */}
        <button onClick={() => navigate('/sensors')} className="text-left bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
              <ServerIcon className="w-6 h-6 text-green-600" />
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{sensoresActivos}</p>
          <p className="text-xs text-gray-500 mt-1">Sensores activos</p>
          <p className="text-[10px] text-gray-400">{sensores.length} total</p>
        </button>

        {/* Sitios */}
        <button onClick={() => navigate('/sites')} className="text-left bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
              <MapPinIcon className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{sitiosActivos}</p>
          <p className="text-xs text-gray-500 mt-1">Sitios monitoreando</p>
          <p className="text-[10px] text-gray-400">{sitios.length} total</p>
        </button>

        {/* Campanas */}
        <button onClick={() => navigate('/campaigns')} className="text-left bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
              <FlagIcon className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{campanasActivas}</p>
          <p className="text-xs text-gray-500 mt-1">Campañas activas</p>
          <p className="text-[10px] text-gray-400">{campanas.length} total</p>
        </button>

        {/* Alertas */}
        <button onClick={() => navigate('/alerts')} className="text-left bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{alertas.length}</p>
          <p className="text-xs text-gray-500 mt-1">Alertas activas</p>
        </button>
      </div>

      {/* Variables Monitoreadas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 text-primary mr-2" />
          Variables Monitoreadas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {variablesList.filter(v => v.estado === 'activo').map(variable => (
            <div key={variable.id_variable} className="bg-gray-50 rounded-lg p-4 border" style={{ borderLeftWidth: '4px', borderLeftColor: variable.color }}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: variable.color }}></span>
                <span className="text-sm font-medium text-gray-700">{variable.nombre}</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-1">{variable.unidad} | Rango: {variable.rango_min} - {variable.rango_max}</p>
              <p className="text-xs text-gray-500">{variable.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen rapido: sitios y campañas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sitios recientes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPinIcon className="w-5 h-5 text-blue-500 mr-2" />
              Sitios de Monitoreo
            </h3>
            <button onClick={() => navigate('/sites')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Ver todos <ArrowRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          {sitios.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay sitios registrados</p>
          ) : (
            <div className="space-y-3">
              {sitios.slice(0, 5).map(sitio => (
                <div key={sitio.id_sitio} onClick={() => navigate(`/sites/${sitio.id_sitio}`)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sitio.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{sitio.referencia_ubicacion || sitio.zona}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${sitio.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {sitio.estado}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {sitio.sensores?.length || 0} sensor{(sitio.sensores?.length || 0) !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campañas activas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FlagIcon className="w-5 h-5 text-purple-500 mr-2" />
              Campañas de Monitoreo
            </h3>
            <button onClick={() => navigate('/campaigns')} className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              Ver todas <ArrowRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          {campanas.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay campañas registradas</p>
          ) : (
            <div className="space-y-3">
              {campanas.slice(0, 5).map(campana => {
                const estadoColor = campana.estado === 'activa' ? 'bg-green-100 text-green-700'
                  : campana.estado === 'planificada' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600';
                return (
                  <div key={campana.id_campana} onClick={() => navigate(`/campaigns/${campana.id_campana}`)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{campana.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {campana.zona} | {new Date(campana.fecha_inicio).toLocaleDateString('es-PE')}
                        {campana.fecha_fin && ` - ${new Date(campana.fecha_fin).toLocaleDateString('es-PE')}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${estadoColor}`}>
                        {campana.estado}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {campana.sensores?.length || 0} sensor{(campana.sensores?.length || 0) !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mapa */}
      {preferencias.mostrarGraficos && (
        <MapView sensores={sensores} lecturasActuales={lecturasUnicasPorSensor} />
      )}

      {/* Últimas Lecturas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Últimas Lecturas</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Tipo:</label>
              <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                <option value="todos">Todos</option>
                <option value="movil">Moviles</option>
                <option value="fijo">Fijos</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Mostrar:</label>
              <select value={limite} onChange={(e) => setLimite(Number(e.target.value))} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Mostrando {lecturasTabla.length} de {lecturas.length} lecturas
          </span>
        </div>

        <div className="space-y-2">
          {lecturasTabla.map((lectura, index) => {
            const sensor = sensores.find(s => s.id_sensor === lectura.id_sensor);
            const dyn = lectura.valores_dinamicos || {};
            const vars = Object.keys(dyn).length > 0
              ? Object.entries(dyn).filter(([, v]) => v.valor != null).map(([codigo, v]) => ({
                  nombre: v.nombre || codigo, unidad: v.unidad || '', color: v.color || '#6b7280', valor: v.valor
                }))
              : [
                  ...(lectura.temperatura != null ? [{ nombre: 'Temperatura', unidad: '°C', color: '#f97316', valor: lectura.temperatura }] : []),
                  ...(lectura.humedad != null ? [{ nombre: 'Humedad', unidad: '%', color: '#3b82f6', valor: lectura.humedad }] : []),
                  ...(lectura.co2_nivel != null ? [{ nombre: 'CO2', unidad: 'ppm', color: '#16a34a', valor: lectura.co2_nivel }] : []),
                  ...(lectura.co_nivel != null ? [{ nombre: 'CO', unidad: 'ppm', color: '#ef4444', valor: lectura.co_nivel }] : [])
                ];
            return (
              <div
                key={index}
                onClick={() => navigate(`/sensors/${lectura.id_sensor}`)}
                className="flex flex-col lg:flex-row bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 hover:shadow-sm cursor-pointer transition overflow-hidden"
              >
                <div className="lg:w-52 flex-shrink-0 px-4 py-2.5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{sensor?.nombre_sensor || lectura.id_sensor}</h3>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${sensor?.is_movil ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {sensor?.is_movil ? 'Móvil' : 'Fijo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {lectura.lectura_datetime ? `${formatearFecha(lectura.lectura_datetime)} ${formatearHora(lectura.lectura_datetime)}` : 'N/A'}
                  </p>
                  {lectura.latitud && lectura.longitud && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{parseFloat(lectura.latitud).toFixed(4)}, {parseFloat(lectura.longitud).toFixed(4)}</p>
                  )}
                </div>
                <div className="flex-1 px-4 py-2.5 flex flex-wrap gap-3">
                  {vars.filter(v => v.valor != null).map((v, i) => (
                    <div key={i} className="bg-white rounded-lg px-3 py-1.5 min-w-[100px] flex-1">
                      <p className="text-[10px] text-gray-500 uppercase font-medium">{v.nombre}</p>
                      <span className="text-lg font-bold" style={{ color: v.color }}>
                        {parseFloat(v.valor).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{v.unidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
