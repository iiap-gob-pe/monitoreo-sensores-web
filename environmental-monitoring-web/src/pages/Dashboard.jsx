import { useState, useEffect } from 'react';
import { lecturasAPI, alertasAPI, sensoresAPI } from '../services/api';
import { usePreferencias } from '../hooks/usePreferencias'; // ✅ Importar hook
import { 
  ServerIcon, 
  ExclamationTriangleIcon, 
  FireIcon, 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import MapView from '../components/dashboard/MapView';

export default function Dashboard() {
  const { preferencias, formatearFechaHora, formatearFecha, formatearHora } = usePreferencias(); // ✅ Usar hook
  const [lecturas, setLecturas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limite, setLimite] = useState(5);
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null); // ✅ Tracking de actualización
  const [actualizandoBackground, setActualizandoBackground] = useState(false);

  // ✅ Cargar datos inicial
  useEffect(() => {
    fetchData(true);
  }, []);

  // ✅ Auto-refresh según preferencias
  useEffect(() => {
    if (preferencias.intervaloActualizacion > 0) {
      const interval = setInterval(() => {
        fetchData(false); // Sin loading en background
      }, preferencias.intervaloActualizacion * 1000);

      return () => clearInterval(interval);
    }
  }, [preferencias.intervaloActualizacion]);

  const fetchData = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      setActualizandoBackground(!mostrarLoading);
      
      const [lecturasRes, alertasRes, sensoresRes] = await Promise.all([
        lecturasAPI.getUltimas(1000000),
        alertasAPI.getActivas(),
        sensoresAPI.getAll(),
      ]);
      
      setLecturas(lecturasRes.data.data || []);
      setAlertas(alertasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (mostrarLoading) setLoading(false);
      setActualizandoBackground(false);
    }
  };

  // Calcular lecturas filtradas
  const lecturasFiltradas = lecturas
    .filter(lectura => {
      if (tipoFiltro === 'todos') return true;
      const sensor = sensores.find(s => s.id_sensor === lectura.id_sensor);
      if (tipoFiltro === 'movil') return sensor?.is_movil === true;
      if (tipoFiltro === 'fijo') return sensor?.is_movil === false;
      return true;
    })
    .slice(0, limite);

  // Obtener la ultima lectura de cada sensor para el mapa
  const lecturasUnicasPorSensor = [];
  const sensoresVistos = new Set();

  for (const lectura of lecturas) {
    if (!sensoresVistos.has(lectura.id_sensor) && lectura.latitud && lectura.longitud) {
      sensoresVistos.add(lectura.id_sensor);
      lecturasUnicasPorSensor.push(lectura);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const sensoresActivos = sensores.filter(s => s.estado === 'Activo').length;
  const alertasActivas = alertas.length;
  const temperaturaPromedio = lecturas.length > 0 
    ? (lecturas.reduce((sum, l) => sum + (parseFloat(l.temperatura) || 0), 0) / lecturas.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Monitoreo Ambiental en Tiempo Real
        </h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600">
          Sistema de sensores IoT - Región Loreto, Perú
        </p>
      </div>

      {/* ✅ Indicador de actualización mejorado */}
      <div className="flex justify-center px-4">
        <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {preferencias.intervaloActualizacion > 0 
                ? `Actualizando cada ${preferencias.intervaloActualizacion}s`
                : 'Actualización automática desactivada'
              }
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sensores Activos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Sensores Activos</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {sensoresActivos}/{sensores.length}
              </div>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <ServerIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-danger hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Alertas Activas</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {alertasActivas}
              </div>
            </div>
            <div className="p-3 bg-danger bg-opacity-10 rounded-lg">
              <ExclamationTriangleIcon className="w-8 h-8 text-danger" />
            </div>
          </div>
        </div>

        {/* Temperatura */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Temp. Promedio</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {temperaturaPromedio}°C
              </div>
            </div>
            <div className="p-3 bg-secondary bg-opacity-10 rounded-lg">
              <FireIcon className="w-8 h-8 text-secondary" />
            </div>
          </div>
        </div>

        {/* Calidad */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Calidad del Aire</div>
              <div className="mt-2 text-3xl font-bold text-primary">
                BUENA
              </div>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <CheckCircleIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>
        
      {/* ✅ Mapa - Solo mostrar si está habilitado en preferencias */}
      {preferencias.mostrarGraficos && (
        <MapView 
          lecturas={lecturas} 
          lecturasUnicas={lecturasUnicasPorSensor} 
        />
      )}

      {/* Últimas Lecturas con Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Últimas Lecturas</h2>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Tipo:</label>
              <select 
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos</option>
                <option value="movil">Móviles</option>
                <option value="fijo">Fijos</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Mostrar:</label>
              <select 
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value={5}>Últimos 5</option>
                <option value={10}>Últimos 10</option>
                <option value={20}>Últimos 20</option>
                <option value={50}>Últimos 50</option>
                <option value={100}>Últimos 100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Mostrando {lecturasFiltradas.length} de {lecturas.length} lecturas
            {lecturas.length >= 1000000 && ' (límite alcanzado)'}
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Sensor</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Tipo</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Zona</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Temp/Hum</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CO2/CO</th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Fecha/Hora</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lecturasFiltradas.map((lectura, index) => {
                    const sensor = sensores.find(s => s.id_sensor === lectura.id_sensor);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {lectura.id_sensor}
                        </td>
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                          {sensor?.is_movil ? (
                            <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              Móvil
                            </span>
                          ) : (
                            <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Fijo
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                            lectura.zona === 'Urbana' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {lectura.zona}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            {lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {lectura.co2_nivel || 'N/A'} ppm
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            {lectura.co_nivel ? `${parseFloat(lectura.co_nivel).toFixed(1)} ppm` : 'N/A'}
                          </div>
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
                          <div className="text-xs sm:text-sm text-gray-900">
                            {lectura.lectura_datetime ? formatearFecha(lectura.lectura_datetime) : 'N/A'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            {lectura.lectura_datetime ? formatearHora(lectura.lectura_datetime) : 'N/A'}
                          </div>
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
    </div>
  );
}