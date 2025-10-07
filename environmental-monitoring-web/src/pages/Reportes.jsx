// src/pages/Reportes.jsx
import { useState, useEffect } from 'react';
import { lecturasAPI, sensoresAPI, alertasAPI } from '../services/api';
import { 
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [lecturas, setLecturas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [alertas, setAlertas] = useState([]);
  
  // Filtros
  const [tipoReporte, setTipoReporte] = useState('diario'); // 'diario', 'semanal', 'mensual', 'personalizado'
  const [sensorSeleccionado, setSensorSeleccionado] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, [tipoReporte, sensorSeleccionado, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Calcular rango de fechas según tipo de reporte
      const { inicio, fin } = calcularRangoFechas();
      
      const filtros = {
        ...(sensorSeleccionado !== 'todos' && { sensor_id: sensorSeleccionado }),
        ...(inicio && { fecha_inicio: inicio }),
        ...(fin && { fecha_fin: fin }),
        limite: 1000
      };

      const [lecturasRes, sensoresRes, alertasRes] = await Promise.all([
        lecturasAPI.getAll(filtros),
        sensoresAPI.getAll(),
        alertasAPI.getAll()
      ]);

      setLecturas(lecturasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
      setAlertas(alertasRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularRangoFechas = () => {
    const ahora = new Date();
    let inicio, fin;

    switch (tipoReporte) {
      case 'diario':
        inicio = new Date(ahora);
        inicio.setHours(0, 0, 0, 0);
        fin = new Date(ahora);
        fin.setHours(23, 59, 59, 999);
        break;
      
      case 'semanal':
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - 7);
        fin = ahora;
        break;
      
      case 'mensual':
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - 30);
        fin = ahora;
        break;
      
      case 'personalizado':
        if (fechaInicio && fechaFin) {
          inicio = new Date(fechaInicio);
          fin = new Date(fechaFin);
        }
        break;
    }

    return {
      inicio: inicio ? inicio.toISOString() : null,
      fin: fin ? fin.toISOString() : null
    };
  };

  // Filtrar lecturas según selección
  const lecturasFiltradas = lecturas.filter(lectura => {
    if (sensorSeleccionado === 'todos') return true;
    return lectura.id_sensor === sensorSeleccionado;
  });

  // Calcular estadísticas
  const estadisticas = calcularEstadisticas(lecturasFiltradas);

  // Preparar datos para gráficas
  const datosGraficaTendencias = prepararDatosGrafica(lecturasFiltradas);
  const datosGraficaComparativa = prepararDatosComparativa(lecturasFiltradas);

  function calcularEstadisticas(datos) {
    if (datos.length === 0) {
      return {
        totalLecturas: 0,
        promedioTemp: 0,
        promedioHumedad: 0,
        promedioCO2: 0,
        promedioCO: 0,
        maxTemp: 0,
        minTemp: 0,
        totalAlertas: 0,
        sensoresMasActivos: []
      };
    }

    const temps = datos.map(l => parseFloat(l.temperatura)).filter(v => !isNaN(v));
    const humedades = datos.map(l => parseFloat(l.humedad)).filter(v => !isNaN(v));
    const co2s = datos.map(l => parseInt(l.co2_nivel)).filter(v => !isNaN(v));
    const cos = datos.map(l => parseFloat(l.co_nivel)).filter(v => !isNaN(v));

    // Contar lecturas por sensor
    const lecturasPorSensor = {};
    datos.forEach(lectura => {
      lecturasPorSensor[lectura.id_sensor] = (lecturasPorSensor[lectura.id_sensor] || 0) + 1;
    });

    const sensoresMasActivos = Object.entries(lecturasPorSensor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        id_sensor: id,
        lecturas: count,
        nombre: sensores.find(s => s.id_sensor === id)?.nombre_sensor || id
      }));

    return {
      totalLecturas: datos.length,
      promedioTemp: temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 0,
      promedioHumedad: humedades.length > 0 ? (humedades.reduce((a, b) => a + b, 0) / humedades.length).toFixed(1) : 0,
      promedioCO2: co2s.length > 0 ? Math.round(co2s.reduce((a, b) => a + b, 0) / co2s.length) : 0,
      promedioCO: cos.length > 0 ? (cos.reduce((a, b) => a + b, 0) / cos.length).toFixed(1) : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps).toFixed(1) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps).toFixed(1) : 0,
      totalAlertas: alertas.length,
      sensoresMasActivos
    };
  }

  function prepararDatosGrafica(datos) {
    if (datos.length === 0) return [];

    // Agrupar por fecha/hora
    const agrupados = {};
    
    datos.forEach(lectura => {
      const fecha = new Date(lectura.lectura_datetime);
      let clave;

      switch (tipoReporte) {
        case 'diario':
          clave = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          break;
        case 'semanal':
        case 'mensual':
        case 'personalizado':
          clave = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
          break;
      }

      if (!agrupados[clave]) {
        agrupados[clave] = {
          fecha: clave,
          temperaturas: [],
          humedades: [],
          co2s: [],
          cos: []
        };
      }

      if (lectura.temperatura) agrupados[clave].temperaturas.push(parseFloat(lectura.temperatura));
      if (lectura.humedad) agrupados[clave].humedades.push(parseFloat(lectura.humedad));
      if (lectura.co2_nivel) agrupados[clave].co2s.push(parseInt(lectura.co2_nivel));
      if (lectura.co_nivel) agrupados[clave].cos.push(parseFloat(lectura.co_nivel));
    });

    return Object.values(agrupados).map(grupo => ({
      fecha: grupo.fecha,
      temperatura: grupo.temperaturas.length > 0 
        ? (grupo.temperaturas.reduce((a, b) => a + b, 0) / grupo.temperaturas.length).toFixed(1)
        : null,
      humedad: grupo.humedades.length > 0
        ? (grupo.humedades.reduce((a, b) => a + b, 0) / grupo.humedades.length).toFixed(1)
        : null,
      co2: grupo.co2s.length > 0
        ? Math.round(grupo.co2s.reduce((a, b) => a + b, 0) / grupo.co2s.length)
        : null,
      co: grupo.cos.length > 0
        ? (grupo.cos.reduce((a, b) => a + b, 0) / grupo.cos.length).toFixed(1)
        : null
    })).slice(-20); // Últimos 20 puntos
  }

  function prepararDatosComparativa(datos) {
    if (datos.length === 0) return [];

    const porSensor = {};

    datos.forEach(lectura => {
      if (!porSensor[lectura.id_sensor]) {
        porSensor[lectura.id_sensor] = {
          id_sensor: lectura.id_sensor,
          nombre: sensores.find(s => s.id_sensor === lectura.id_sensor)?.nombre_sensor || lectura.id_sensor,
          temperaturas: [],
          humedades: [],
          co2s: [],
          cos: []
        };
      }

      if (lectura.temperatura) porSensor[lectura.id_sensor].temperaturas.push(parseFloat(lectura.temperatura));
      if (lectura.humedad) porSensor[lectura.id_sensor].humedades.push(parseFloat(lectura.humedad));
      if (lectura.co2_nivel) porSensor[lectura.id_sensor].co2s.push(parseInt(lectura.co2_nivel));
      if (lectura.co_nivel) porSensor[lectura.id_sensor].cos.push(parseFloat(lectura.co_nivel));
    });

    return Object.values(porSensor).map(sensor => ({
      sensor: sensor.nombre,
      temperatura: sensor.temperaturas.length > 0
        ? parseFloat((sensor.temperaturas.reduce((a, b) => a + b, 0) / sensor.temperaturas.length).toFixed(1))
        : 0,
      humedad: sensor.humedades.length > 0
        ? parseFloat((sensor.humedades.reduce((a, b) => a + b, 0) / sensor.humedades.length).toFixed(1))
        : 0,
      co2: sensor.co2s.length > 0
        ? Math.round(sensor.co2s.reduce((a, b) => a + b, 0) / sensor.co2s.length)
        : 0,
      co: sensor.cos.length > 0
        ? parseFloat((sensor.cos.reduce((a, b) => a + b, 0) / sensor.cos.length).toFixed(1))
        : 0
    }));
  }

  const getNombrePeriodo = () => {
    switch (tipoReporte) {
      case 'diario': return 'Hoy';
      case 'semanal': return 'Últimos 7 días';
      case 'mensual': return 'Últimos 30 días';
      case 'personalizado': return 'Período personalizado';
      default: return '';
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
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="mt-1 text-sm text-gray-600">
            Análisis detallado de datos ambientales y tendencias
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md">
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Exportar Reporte</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración del Reporte</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="diario">Hoy</option>
              <option value="semanal">Últimos 7 días</option>
              <option value="mensual">Últimos 30 días</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* Sensor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensor
            </label>
            <select
              value={sensorSeleccionado}
              onChange={(e) => setSensorSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos los sensores</option>
              {sensores.map(sensor => (
                <option key={sensor.id_sensor} value={sensor.id_sensor}>
                  {sensor.id_sensor} - {sensor.nombre_sensor}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio (solo si es personalizado) */}
          {tipoReporte === 'personalizado' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>Mostrando: {getNombrePeriodo()}</span>
          <span>•</span>
          <span>{lecturasFiltradas.length} lecturas</span>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Lecturas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.totalLecturas}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div>
            <p className="text-sm font-medium text-gray-600">Temp. Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.promedioTemp}°C</p>
            <p className="text-xs text-gray-500 mt-1">
              Min: {estadisticas.minTemp}°C | Max: {estadisticas.maxTemp}°C
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div>
            <p className="text-sm font-medium text-gray-600">Humedad Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.promedioHumedad}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.totalAlertas}</p>
          </div>
        </div>
      </div>

      {/* Gráfica de Tendencias */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencias Temporales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosGraficaTendencias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperatura" stroke="#F59E0B" name="Temperatura (°C)" strokeWidth={2} />
            <Line type="monotone" dataKey="humedad" stroke="#3B82F6" name="Humedad (%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficas de CO2 y CO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia de CO₂</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={datosGraficaTendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="co2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="CO₂ (ppm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia de CO</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={datosGraficaTendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="co" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="CO (ppm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativa entre Sensores */}
      {sensorSeleccionado === 'todos' && datosGraficaComparativa.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparativa entre Sensores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGraficaComparativa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sensor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="temperatura" fill="#F59E0B" name="Temp (°C)" />
              <Bar dataKey="humedad" fill="#3B82F6" name="Humedad (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de Sensores Más Activos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensores Más Activos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecturas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estadisticas.sensoresMasActivos.map((sensor, index) => (
                <tr key={sensor.id_sensor} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1} - {sensor.id_sensor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sensor.lecturas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ maxWidth: '200px' }}>
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(sensor.lecturas / estadisticas.totalLecturas * 100).toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {((sensor.lecturas / estadisticas.totalLecturas) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Promedios */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Promedios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Temperatura</p>
            <p className="text-2xl font-bold text-orange-600">{estadisticas.promedioTemp}°C</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Humedad</p>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.promedioHumedad}%</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">CO₂</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.promedioCO2} ppm</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">CO</p>
            <p className="text-2xl font-bold text-red-600">{estadisticas.promedioCO} ppm</p>
          </div>
        </div>
      </div>
    </div>
  );
}