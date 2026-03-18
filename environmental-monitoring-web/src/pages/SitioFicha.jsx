// src/pages/SitioFicha.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sitiosAPI, lecturasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ServerIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const SENSOR_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#e11d48', '#65a30d'];

export default function SitioFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sitio, setSitio] = useState(null);
  const [lecturas, setLecturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ultimaAct, setUltimaAct] = useState(null);

  useEffect(() => { cargarDatos(true); }, [id]);

  // Auto-refresh cada 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => cargarDatos(false), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, id]);

  const cargarDatos = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      setError(null);

      const sitioRes = await sitiosAPI.getById(id);
      const sitioData = sitioRes.data.data;
      setSitio(sitioData);

      const sensores = sitioData.sensores || [];
      if (sensores.length > 0) {
        const promesas = sensores.map(s =>
          lecturasAPI.getBySensor(s.id_sensor, 50).catch(() => ({ data: { data: [] } }))
        );
        const resultados = await Promise.all(promesas);

        const todasLecturas = [];
        resultados.forEach((res, idx) => {
          const data = res.data.data || res.data || [];
          const arr = Array.isArray(data) ? data : [];
          arr.forEach(lectura => {
            todasLecturas.push({
              ...lectura,
              id_sensor: sensores[idx].id_sensor,
              nombre_sensor: sensores[idx].nombre_sensor
            });
          });
        });

        todasLecturas.sort((a, b) => new Date(b.lectura_datetime || b.fecha_hora || b.createdAt) - new Date(a.lectura_datetime || a.fecha_hora || a.createdAt));
        setLecturas(todasLecturas);
      } else {
        setLecturas([]);
      }

      setUltimaAct(new Date());
    } catch (err) {
      console.error('Error al cargar datos del sitio:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del sitio. Intente nuevamente.');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  // Fecha helper
  const getFecha = (l) => l.lectura_datetime || l.fecha_hora || l.createdAt;
  const fmt = (d) => d ? new Date(d).toLocaleDateString('es-PE') + ' ' + new Date(d).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  // Estadisticas calculadas
  const stats = (() => {
    if (lecturas.length === 0) return { totalLecturas: 0, sensoresCount: sitio?.sensores?.length || 0, tempProm: '--', tempMin: '--', tempMax: '--', co2Prom: '--', co2Min: '--', co2Max: '--' };
    const temps = lecturas.filter(l => l.temperatura != null).map(l => parseFloat(l.temperatura));
    const co2s = lecturas.filter(l => l.co2_nivel != null || l.co2 != null).map(l => parseInt(l.co2_nivel ?? l.co2));
    return {
      totalLecturas: lecturas.length,
      sensoresCount: sitio?.sensores?.length || 0,
      tempProm: temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '--',
      tempMin: temps.length > 0 ? Math.min(...temps).toFixed(1) : '--',
      tempMax: temps.length > 0 ? Math.max(...temps).toFixed(1) : '--',
      co2Prom: co2s.length > 0 ? Math.round(co2s.reduce((a, b) => a + b, 0) / co2s.length) : '--',
      co2Min: co2s.length > 0 ? Math.min(...co2s) : '--',
      co2Max: co2s.length > 0 ? Math.max(...co2s) : '--'
    };
  })();

  // Datos para el grafico combinado de temperatura
  const buildChartData = () => {
    if (!sitio?.sensores || lecturas.length === 0) return [];

    const timeMap = {};
    lecturas.forEach(l => {
      const fecha = getFecha(l);
      if (!fecha) return;
      const key = new Date(fecha).toISOString();
      if (!timeMap[key]) {
        timeMap[key] = { datetime: key };
      }
      if (l.temperatura != null) {
        timeMap[key][`temp_${l.id_sensor}`] = Number(l.temperatura);
      }
    });

    return Object.values(timeMap).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  };

  const chartData = loading ? [] : buildChartData();

  // Ultimas 30 lecturas para la tabla
  const lecturasRecientes = lecturas.slice(0, 30);

  // Última lectura global (la mas reciente de todos los sensores)
  const ultimaLectura = lecturas.length > 0 ? lecturas[0] : null;

  // Descargar CSV
  const descargarCSV = () => {
    if (!isAuthenticated || lecturas.length === 0) return;

    const header = 'Sensor,Fecha,Hora,Temperatura,Humedad,CO2,CO';
    const rows = lecturas.map(l => {
      const dt = new Date(getFecha(l));
      return `${l.nombre_sensor || l.id_sensor},${dt.toLocaleDateString('es-PE')},${dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })},${l.temperatura ?? ''},${l.humedad ?? ''},${l.co2_nivel ?? l.co2 ?? ''},${l.co_nivel ?? l.co ?? ''}`;
    });

    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sitio_${sitio?.nombre || id}_lecturas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Badge helpers
  const zonaBadge = (zona) => {
    const clases = {
      Urbana: 'bg-gray-100 text-gray-800',
      Rural: 'bg-green-100 text-green-800',
      Bosque: 'bg-emerald-100 text-emerald-800',
      Rio: 'bg-blue-100 text-blue-800'
    };
    return clases[zona] || 'bg-gray-100 text-gray-800';
  };

  const estadoBadge = (estado) => {
    return estado === 'Activo'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  // Buscar ultima lectura de un sensor
  const ultimaLecturaSensor = (idSensor) => {
    return lecturas.find(l => l.id_sensor === idSensor);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sitio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <ServerIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => cargarDatos(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate('/sites')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Volver a Sitios
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sitio) return null;

  return (
    <div className="space-y-6">
      {/* Nav + refresh */}
      <div className="flex items-center justify-between">
        <Link to="/sites" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium">
          <ArrowLeftIcon className="h-5 w-5" /> Volver a sitios
        </Link>
        <div className="flex items-center gap-3">
          {ultimaAct && (
            <span className="text-xs text-gray-400">Act: {ultimaAct.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? { animationDuration: '3s' } : {}} />
            {autoRefresh ? 'En vivo' : 'Pausado'}
          </button>
          <button onClick={() => cargarDatos(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Actualizar">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <MapPinIcon className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{sitio.nombre}</h1>
                <p className="text-sm text-gray-500">ID: {sitio.id_sitio || id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${zonaBadge(sitio.zona)}`}>
                {sitio.zona}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge(sitio.estado)}`}>
                {sitio.estado || 'Activo'}
              </span>
            </div>

            {sitio.descripcion && <p className="text-sm text-gray-600 mb-3">{sitio.descripcion}</p>}

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {sitio.referencia_ubicacion && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" /> Ref: {sitio.referencia_ubicacion}
                </span>
              )}
              <span>
                Coordenadas: {sitio.latitud != null && sitio.longitud != null
                  ? `${Number(sitio.latitud).toFixed(6)}, ${Number(sitio.longitud).toFixed(6)}`
                  : 'No especificadas'}
              </span>
              {sitio.altitud != null && (
                <span>Altitud: {sitio.altitud} m.s.n.m.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 lg:text-right">
            <ServerIcon className="w-5 h-5" />
            <span>{sitio.sensores?.length || 0} sensores asociados</span>
          </div>
        </div>
      </div>

      {/* Mapa de ubicación del sitio */}
      {sitio.latitud != null && sitio.longitud != null && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            Ubicación del Sitio
          </h2>
          <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '350px' }}>
            <MapContainer
              center={[Number(sitio.latitud), Number(sitio.longitud)]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              {/* Marcador del sitio */}
              <Marker
                position={[Number(sitio.latitud), Number(sitio.longitud)]}
                icon={L.divIcon({
                  className: '',
                  html: `<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{sitio.nombre}</p>
                    <p className="text-gray-500">{sitio.referencia_ubicacion}</p>
                    <p className="text-xs text-gray-400 mt-1">{Number(sitio.latitud).toFixed(6)}, {Number(sitio.longitud).toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Sensors List */}
      {sitio.sensores && sitio.sensores.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Sensores del Sitio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sitio.sensores.map((sensor, idx) => {
              const ultima = ultimaLecturaSensor(sensor.id_sensor);
              const esMovil = sensor.is_movil;
              return (
                <Link
                  key={sensor.id_sensor}
                  to={`/sensors/${sensor.id_sensor}`}
                  className="bg-white rounded-xl shadow-sm p-4 border-l-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ borderLeftColor: SENSOR_COLORS[idx % SENSOR_COLORS.length] }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {sensor.nombre_sensor || `Sensor ${sensor.id_sensor}`}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${estadoBadge(sensor.estado)}`}>
                        {sensor.estado || 'Activo'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${esMovil ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {esMovil ? 'Movil' : 'Fijo'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">ID: {sensor.id_sensor}</p>
                  {ultima ? (
                    <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                      {ultima.temperatura != null && <span className="text-orange-600 font-medium">{parseFloat(ultima.temperatura).toFixed(1)}°C</span>}
                      {ultima.humedad != null && <span className="text-blue-600 font-medium">{parseFloat(ultima.humedad).toFixed(1)}%</span>}
                      {(ultima.co2_nivel != null || ultima.co2 != null) && <span className="text-green-700 font-medium">{ultima.co2_nivel ?? ultima.co2} ppm</span>}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Sin lecturas recientes</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Última lectura en tiempo real */}
      {ultimaLectura && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <SignalIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Última lectura</h2>
            <span className="text-xs text-gray-500 ml-auto">{fmt(getFecha(ultimaLectura))}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Sensor: <span className="font-medium text-gray-700">{ultimaLectura.nombre_sensor || `Sensor ${ultimaLectura.id_sensor}`}</span></p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-medium">Temperatura</p>
              <p className="text-xl font-bold text-orange-600">{ultimaLectura.temperatura != null ? `${parseFloat(ultimaLectura.temperatura).toFixed(1)}°C` : '-'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-medium">Humedad</p>
              <p className="text-xl font-bold text-blue-600">{ultimaLectura.humedad != null ? `${parseFloat(ultimaLectura.humedad).toFixed(1)}%` : '-'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-medium">CO2</p>
              <p className="text-xl font-bold text-green-700">{(ultimaLectura.co2_nivel ?? ultimaLectura.co2) != null ? `${ultimaLectura.co2_nivel ?? ultimaLectura.co2} ppm` : '-'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-medium">CO</p>
              <p className="text-xl font-bold text-red-600">{(ultimaLectura.co_nivel ?? ultimaLectura.co) != null ? `${parseFloat(ultimaLectura.co_nivel ?? ultimaLectura.co).toFixed(2)} ppm` : '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Total lecturas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLecturas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Sensores</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sensoresCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Temperatura promedio</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.tempProm !== '--' ? `${stats.tempProm}°C` : '--'}</p>
          {stats.tempMin !== '--' && (
            <p className="text-[10px] text-gray-400">Min {stats.tempMin}° / Max {stats.tempMax}°</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">CO2 promedio</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{stats.co2Prom !== '--' ? `${stats.co2Prom} ppm` : '--'}</p>
          {stats.co2Min !== '--' && (
            <p className="text-[10px] text-gray-400">Min {stats.co2Min} / Max {stats.co2Max}</p>
          )}
        </div>
      </div>

      {/* Combined Temperature Chart */}
      {chartData.length > 0 && sitio.sensores && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperatura por Sensor</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="datetime"
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }}
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                labelFormatter={(val) => new Date(val).toLocaleString('es-PE')}
                formatter={(value, name) => {
                  const sensorId = name.replace('temp_', '');
                  const sensor = sitio.sensores.find(s => String(s.id_sensor) === String(sensorId));
                  return [`${value}°C`, sensor?.nombre_sensor || `Sensor ${sensorId}`];
                }}
              />
              <Legend
                formatter={(value) => {
                  const sensorId = value.replace('temp_', '');
                  const sensor = sitio.sensores.find(s => String(s.id_sensor) === String(sensorId));
                  return sensor?.nombre_sensor || `Sensor ${sensorId}`;
                }}
              />
              {sitio.sensores.map((sensor, idx) => (
                <Line
                  key={sensor.id_sensor}
                  type="monotone"
                  dataKey={`temp_${sensor.id_sensor}`}
                  stroke={SENSOR_COLORS[idx % SENSOR_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Readings Table + CSV */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lecturas Recientes ({lecturas.length} total)</h2>
          <div className="relative group">
            <button
              onClick={descargarCSV}
              disabled={!isAuthenticated || lecturas.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isAuthenticated && lecturas.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" /> Descargar CSV
            </button>
            {!isAuthenticated && (
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">Inicia sesion para descargar</div>
              </div>
            )}
          </div>
        </div>

        {lecturasRecientes.length === 0 ? (
          <div className="text-center py-12">
            <ServerIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron lecturas para los sensores de este sitio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">Sensor</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600">Fecha/Hora</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">Temp.</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">Humedad</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">CO2</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600">CO</th>
                </tr>
              </thead>
              <tbody>
                {lecturasRecientes.map((l, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-gray-700 font-medium">{l.nombre_sensor || `Sensor ${l.id_sensor}`}</td>
                    <td className="py-2.5 px-3 text-gray-500">{fmt(getFecha(l))}</td>
                    <td className="py-2.5 px-3 text-right text-orange-600 font-medium">{l.temperatura != null ? `${parseFloat(l.temperatura).toFixed(1)}°C` : '-'}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 font-medium">{l.humedad != null ? `${parseFloat(l.humedad).toFixed(1)}%` : '-'}</td>
                    <td className="py-2.5 px-3 text-right text-green-700 font-medium">{(l.co2_nivel ?? l.co2) != null ? `${l.co2_nivel ?? l.co2} ppm` : '-'}</td>
                    <td className="py-2.5 px-3 text-right text-red-600 font-medium">{(l.co_nivel ?? l.co) != null ? `${parseFloat(l.co_nivel ?? l.co).toFixed(2)} ppm` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
