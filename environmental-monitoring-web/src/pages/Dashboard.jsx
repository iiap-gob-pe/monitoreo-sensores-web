import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lecturasAPI, alertasAPI, sensoresAPI, sitiosAPI, campanasAPI } from '../services/api';
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
      const [lecturasRes, actualesRes, alertasRes, sensoresRes, sitiosRes, campanasRes] = await Promise.all([
        lecturasAPI.getUltimas(100),
        lecturasAPI.getActuales(),
        alertasAPI.getActivas(),
        sensoresAPI.getAll(),
        sitiosAPI.getAll(),
        campanasAPI.getAll()
      ]);
      setLecturas(lecturasRes.data.data || []);
      setLecturasActuales(actualesRes.data.data || []);
      setAlertas(alertasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
      setSitios(sitiosRes.data.data || []);
      setCampanas(campanasRes.data.data || []);
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
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center space-x-2 mb-2">
              <FireIcon className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Temperatura</span>
            </div>
            <p className="text-xs text-gray-500">Medicion en grados Celsius (°C). Rango tipico: 20-35°C en la region amazonica.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <CloudIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Humedad Relativa</span>
            </div>
            <p className="text-xs text-gray-500">Porcentaje de humedad en el aire (%). Rango tipico: 60-95% en zonas tropicales.</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              <span className="text-sm font-medium text-gray-700">CO2</span>
            </div>
            <p className="text-xs text-gray-500">Dioxido de carbono en partes por millon (ppm). Nivel normal exterior: 400-450 ppm.</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-700">CO</span>
            </div>
            <p className="text-xs text-gray-500">Monoxido de carbono en partes por millon (ppm). Toxico a niveles superiores a 35 ppm.</p>
          </div>
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

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Sensor</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Tipo</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Temp/Hum</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CO2/CO</th>
                  <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Fecha/Hora</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lecturasTabla.map((lectura, index) => {
                  const sensor = sensores.find(s => s.id_sensor === lectura.id_sensor);
                  return (
                    <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/sensors/${lectura.id_sensor}`)}>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {lectura.id_sensor}
                      </td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${sensor?.is_movil ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                          {sensor?.is_movil ? 'Movil' : 'Fijo'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">{lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A'}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">{lectura.co2_nivel || 'N/A'} ppm</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{lectura.co_nivel ? `${parseFloat(lectura.co_nivel).toFixed(1)} ppm` : 'N/A'}</div>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {lectura.latitud && lectura.longitud ? (
                          <div>
                            <div>{parseFloat(lectura.latitud).toFixed(4)}°</div>
                            <div>{parseFloat(lectura.longitud).toFixed(4)}°</div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">{lectura.lectura_datetime ? formatearFecha(lectura.lectura_datetime) : 'N/A'}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{lectura.lectura_datetime ? formatearHora(lectura.lectura_datetime) : 'N/A'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
