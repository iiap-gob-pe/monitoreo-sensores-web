import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sensoresAPI, lecturasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  ServerIcon,
  MapPinIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  FlagIcon,
  ArrowPathIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function SensorFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sensor, setSensor] = useState(null);
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
      const [sensorRes, lecturasRes] = await Promise.all([
        sensoresAPI.getById(id),
        lecturasAPI.getBySensor(id, 200)
      ]);
      setSensor(sensorRes.data.data);
      setLecturas(lecturasRes.data.data || []);
      setUltimaAct(new Date());
    } catch (err) {
      console.error('Error cargando datos del sensor:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del sensor');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  // Detect dynamic variables config
  const variablesConfig = sensor?.variables_config && sensor.variables_config.length > 0 ? sensor.variables_config : null;

  // Chart data (ultimas 100 ascendente)
  const chartData = lecturas
    .slice(0, 100)
    .sort((a, b) => new Date(a.lectura_datetime) - new Date(b.lectura_datetime))
    .map((l) => {
      const dt = new Date(l.lectura_datetime);
      const punto = {
        fecha: `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`,
      };
      if (variablesConfig) {
        variablesConfig.forEach((v) => {
          const dyn = l.valores_dinamicos?.[v.codigo];
          punto[v.codigo] = dyn ? parseFloat(dyn.valor) || 0 : 0;
        });
      } else {
        punto.temperatura = parseFloat(l.temperatura) || 0;
        punto.humedad = parseFloat(l.humedad) || 0;
        punto.co2_nivel = parseInt(l.co2_nivel) || 0;
        punto.co_nivel = parseFloat(l.co_nivel) || 0;
      }
      return punto;
    });

  // Estadisticas
  const stats = (() => {
    const base = { total: lecturas.length };
    if (lecturas.length === 0) return base;
    const t = lecturas.length;
    if (variablesConfig) {
      base.dynamic = {};
      variablesConfig.forEach((v) => {
        const vals = lecturas.map(l => {
          const dyn = l.valores_dinamicos?.[v.codigo];
          return dyn ? parseFloat(dyn.valor) || 0 : 0;
        });
        const sum = vals.reduce((a, b) => a + b, 0);
        base.dynamic[v.codigo] = {
          prom: (sum / t).toFixed(1),
          min: Math.min(...vals).toFixed(1),
          max: Math.max(...vals).toFixed(1),
          nombre: v.nombre,
          unidad: v.unidad,
          color: v.color
        };
      });
    } else {
      const temps = lecturas.map(l => parseFloat(l.temperatura) || 0);
      const hums = lecturas.map(l => parseFloat(l.humedad) || 0);
      const co2s = lecturas.map(l => parseInt(l.co2_nivel) || 0);
      base.tempProm = (temps.reduce((a,b) => a+b, 0) / t).toFixed(1);
      base.humProm = (hums.reduce((a,b) => a+b, 0) / t).toFixed(1);
      base.co2Prom = Math.round(co2s.reduce((a,b) => a+b, 0) / t);
      base.tempMin = Math.min(...temps).toFixed(1);
      base.tempMax = Math.max(...temps).toFixed(1);
      base.co2Min = Math.min(...co2s);
      base.co2Max = Math.max(...co2s);
    }
    return base;
  })();

  const lecturasRecientes = lecturas.slice(0, 30);

  const descargarCSV = () => {
    if (!isAuthenticated || lecturas.length === 0) return;
    let header, rows;
    if (variablesConfig) {
      const varHeaders = variablesConfig.map(v => v.nombre);
      header = ['Fecha', 'Hora', ...varHeaders, 'Latitud', 'Longitud'].join(',');
      rows = lecturas.map((l) => {
        const dt = new Date(l.lectura_datetime);
        const varValues = variablesConfig.map(v => {
          const dyn = l.valores_dinamicos?.[v.codigo];
          return dyn ? dyn.valor ?? '' : '';
        });
        return [dt.toLocaleDateString('es-PE'), dt.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}), ...varValues, l.latitud??'', l.longitud??''].join(',');
      });
    } else {
      header = 'Fecha,Hora,Temperatura,Humedad,CO2,CO,Latitud,Longitud';
      rows = lecturas.map((l) => {
        const dt = new Date(l.lectura_datetime);
        return `${dt.toLocaleDateString('es-PE')},${dt.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})},${l.temperatura??''},${l.humedad??''},${l.co2_nivel??''},${l.co_nivel??''},${l.latitud??''},${l.longitud??''}`;
      });
    }
    const blob = new Blob([[header,...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor_${id}_lecturas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('es-PE') + ' ' + new Date(d).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}) : 'N/A';

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando sensor...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
        <ServerIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate('/sensors')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Volver</button>
      </div>
    </div>
  );

  if (!sensor) return null;
  const esMovil = sensor.is_movil;

  // Última lectura
  const ultimaLectura = lecturas.length > 0 ? lecturas[0] : null;

  return (
    <div className="space-y-6">
      {/* Nav + refresh */}
      <div className="flex items-center justify-between">
        <Link to="/sensors" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium">
          <ArrowLeftIcon className="h-5 w-5" /> Volver a sensores
        </Link>
        <div className="flex items-center gap-3">
          {ultimaAct && (
            <span className="text-xs text-gray-400">Act: {ultimaAct.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? {animationDuration:'3s'} : {}} />
            {autoRefresh ? 'En vivo' : 'Pausado'}
          </button>
          <button onClick={() => cargarDatos(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Actualizar">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${esMovil ? 'bg-purple-100' : 'bg-blue-100'}`}>
                <ServerIcon className={`h-7 w-7 ${esMovil ? 'text-purple-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{sensor.nombre_sensor}</h1>
                <p className="text-sm text-gray-500">ID: {sensor.id_sensor}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sensor.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {sensor.estado}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${esMovil ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {esMovil ? 'Movil' : 'Estacionario'}
              </span>
              {sensor.zona && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />{sensor.zona}
                </span>
              )}
            </div>

            {sensor.description && <p className="text-sm text-gray-600 mb-3">{sensor.description}</p>}

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" /> Última conexión: {fmt(sensor.last_seen)}</span>
              <span>Registrado: {fmt(sensor.created_at)}</span>
            </div>

            {/* Formato CSV y variables configuradas */}
            {variablesConfig && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                {sensor.formato_csv && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-600">Formato CSV: </span>
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">{sensor.formato_csv}</code>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-600">Variables:</span>
                  {variablesConfig.map((v) => (
                    <span key={v.id_variable} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: v.color }}></span>
                      {v.nombre} ({v.unidad})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sitio o Campanas */}
          <div className="space-y-3 lg:text-right">
            {!esMovil && sensor.sitio && (
              <Link to={`/sites/${sensor.sitio.id_sitio}`} className="block bg-blue-50 rounded-lg p-4 border border-blue-100 hover:bg-blue-100 transition">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <MapPinIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">Sitio de monitoreo</span>
                </div>
                <p className="text-sm font-medium text-blue-900">{sensor.sitio.nombre}</p>
                {sensor.sitio.referencia_ubicacion && <p className="text-xs text-blue-600">{sensor.sitio.referencia_ubicacion}</p>}
                {sensor.sitio.latitud && sensor.sitio.longitud && (
                  <p className="text-[10px] text-blue-500 mt-1">{parseFloat(sensor.sitio.latitud).toFixed(5)}, {parseFloat(sensor.sitio.longitud).toFixed(5)}</p>
                )}
              </Link>
            )}
            {esMovil && sensor.campanas && sensor.campanas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-purple-600 flex items-center gap-1 justify-end"><FlagIcon className="h-3.5 w-3.5" /> Campañas asignadas</p>
                {sensor.campanas.map((c) => (
                  <Link key={c.id_campana} to={`/campaigns/${c.id_campana}`} className="block bg-purple-50 rounded-lg p-3 border border-purple-100 hover:bg-purple-100 transition">
                    <p className="text-sm font-medium text-purple-900">{c.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${c.estado === 'activa' ? 'bg-green-100 text-green-700' : c.estado === 'planificada' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{c.estado}</span>
                      <span className="text-[10px] text-purple-500">{c.zona}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!esMovil && !sensor.sitio && <p className="text-xs text-gray-400 italic">Sin sitio asignado</p>}
            {esMovil && (!sensor.campanas || sensor.campanas.length === 0) && <p className="text-xs text-gray-400 italic">Sin campañas asignadas</p>}
          </div>
        </div>
      </div>

      {/* Mini mapa de ubicación del sensor */}
      {(() => {
        const lat = sensor.latitud || sensor.sitio?.latitud;
        const lon = sensor.longitud || sensor.sitio?.longitud;
        if (!lat || !lon) return null;
        return (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              Ubicación del Sensor
            </h2>
            <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '250px' }}>
              <MapContainer
                center={[Number(lat), Number(lon)]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <Marker
                  position={[Number(lat), Number(lon)]}
                  icon={L.divIcon({
                    className: '',
                    html: `<div style="background:${esMovil ? '#7c3aed' : '#16a34a'};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{sensor.nombre_sensor}</p>
                      <p className="text-xs text-gray-500">{sensor.id_sensor}</p>
                      <p className="text-xs text-gray-400 mt-1">{Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}</p>
                      {sensor.sitio && <p className="text-xs text-blue-600 mt-1">Sitio: {sensor.sitio.nombre}</p>}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        );
      })()}

      {/* Lectura en tiempo real */}
      {ultimaLectura && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <SignalIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Última lectura</h2>
            <span className="text-xs text-gray-500 ml-auto">{fmt(ultimaLectura.lectura_datetime)}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {variablesConfig ? (
              <>
                {variablesConfig.map((v) => {
                  const dyn = ultimaLectura.valores_dinamicos?.[v.codigo];
                  const val = dyn ? dyn.valor : null;
                  return (
                    <div key={v.id_variable} className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-[10px] text-gray-500 uppercase font-medium">{v.nombre}</p>
                      <p className="text-xl font-bold" style={{ color: v.color }}>{val != null ? `${parseFloat(val).toFixed(1)} ${v.unidad}` : '-'}</p>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Temperatura</p>
                  <p className="text-xl font-bold text-orange-600">{ultimaLectura.temperatura ? `${parseFloat(ultimaLectura.temperatura).toFixed(1)}°C` : '-'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Humedad</p>
                  <p className="text-xl font-bold text-blue-600">{ultimaLectura.humedad ? `${parseFloat(ultimaLectura.humedad).toFixed(1)}%` : '-'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">CO2</p>
                  <p className="text-xl font-bold text-green-700">{ultimaLectura.co2_nivel ? `${ultimaLectura.co2_nivel} ppm` : '-'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">CO</p>
                  <p className="text-xl font-bold text-red-600">{ultimaLectura.co_nivel ? `${parseFloat(ultimaLectura.co_nivel).toFixed(2)} ppm` : '-'}</p>
                </div>
              </>
            )}
            {ultimaLectura.latitud && ultimaLectura.longitud && (
              <>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Latitud</p>
                  <p className="text-sm font-bold text-gray-700">{parseFloat(ultimaLectura.latitud).toFixed(6)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Longitud</p>
                  <p className="text-sm font-bold text-gray-700">{parseFloat(ultimaLectura.longitud).toFixed(6)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Estadisticas historicas */}
      <div className={`grid grid-cols-2 ${variablesConfig ? `lg:grid-cols-${Math.min(variablesConfig.length + 1, 6)}` : 'lg:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Total lecturas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        {variablesConfig && stats.dynamic ? (
          variablesConfig.map((v) => {
            const s = stats.dynamic[v.codigo];
            if (!s) return null;
            return (
              <div key={v.id_variable} className="bg-white rounded-xl shadow-sm border p-5">
                <p className="text-xs text-gray-500 font-medium">{s.nombre} promedio</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.prom} {s.unidad}</p>
                <p className="text-[10px] text-gray-400">Min {s.min} / Max {s.max}</p>
              </div>
            );
          })
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-xs text-gray-500 font-medium">Temperatura</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.tempProm ?? '0'}°C</p>
              <p className="text-[10px] text-gray-400">Min {stats.tempMin ?? '-'}° / Max {stats.tempMax ?? '-'}°</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-xs text-gray-500 font-medium">Humedad promedio</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.humProm ?? '0'}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-xs text-gray-500 font-medium">CO2</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.co2Prom ?? '0'} ppm</p>
              <p className="text-[10px] text-gray-400">Min {stats.co2Min ?? '-'} / Max {stats.co2Max ?? '-'}</p>
            </div>
          </>
        )}
      </div>

      {/* Graficos */}
      {chartData.length > 0 && variablesConfig ? (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Tendencia de Variables</h2>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              {variablesConfig.map((v) => (
                <Line key={v.id_variable} type="monotone" dataKey={v.codigo} stroke={v.color} strokeWidth={2} dot={false} name={`${v.nombre} (${v.unidad})`} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : chartData.length > 0 ? (
        <>
          {/* Grafico Temperatura y Humedad (legacy) */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tendencia de Temperatura y Humedad</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis yAxisId="temp" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="hum" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line yAxisId="temp" type="monotone" dataKey="temperatura" stroke="#f97316" strokeWidth={2} dot={false} name="Temperatura (°C)" />
                <Line yAxisId="hum" type="monotone" dataKey="humedad" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humedad (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Grafico CO2 y CO (legacy) */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tendencia CO2 y CO</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis yAxisId="co2" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="co" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Area yAxisId="co2" type="monotone" dataKey="co2_nivel" stroke="#16a34a" fill="#bbf7d0" strokeWidth={2} name="CO2 (ppm)" />
                <Area yAxisId="co" type="monotone" dataKey="co_nivel" stroke="#ef4444" fill="#fecaca" strokeWidth={2} name="CO (ppm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}

      {/* Tabla de lecturas + CSV */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Registro de lecturas ({lecturas.length} total)</h2>
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
          <p className="text-gray-500 text-sm text-center py-8">No hay lecturas disponibles.</p>
        ) : (
          <div className="space-y-2">
            {lecturasRecientes.map((l, idx) => {
              // Usar valores_dinamicos del registro (lo que realmente se registró)
              const dyn = l.valores_dinamicos || {};
              const vars = Object.keys(dyn).length > 0
                ? Object.entries(dyn).map(([codigo, v]) => ({
                    codigo,
                    nombre: v.nombre || codigo,
                    unidad: v.unidad || '',
                    color: v.color || '#6b7280',
                    valor: v.valor
                  }))
                : [
                    ...(l.temperatura != null ? [{ codigo: 'temperatura', nombre: 'Temperatura', unidad: '°C', color: '#f97316', valor: l.temperatura }] : []),
                    ...(l.humedad != null ? [{ codigo: 'humedad', nombre: 'Humedad', unidad: '%', color: '#3b82f6', valor: l.humedad }] : []),
                    ...(l.co2_nivel != null ? [{ codigo: 'co2', nombre: 'CO2', unidad: 'ppm', color: '#16a34a', valor: l.co2_nivel }] : []),
                    ...(l.co_nivel != null ? [{ codigo: 'co', nombre: 'CO', unidad: 'ppm', color: '#ef4444', valor: l.co_nivel }] : [])
                  ];

              if (vars.length === 0) return null;

              return (
                <div key={idx} className="flex flex-col lg:flex-row bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition overflow-hidden">
                  <div className="lg:w-48 flex-shrink-0 px-4 py-2.5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
                    <p className="text-xs font-medium text-gray-700">{fmt(l.lectura_datetime)}</p>
                    {l.latitud && l.longitud && (
                      <p className="text-[10px] text-gray-400 mt-1">{parseFloat(l.latitud).toFixed(5)}, {parseFloat(l.longitud).toFixed(5)}</p>
                    )}
                  </div>
                  <div className="flex-1 px-4 py-2.5 flex flex-wrap gap-3">
                    {vars.map(v => (
                      <div key={v.codigo} className="bg-white rounded-lg px-3 py-1.5 min-w-[100px] flex-1">
                        <p className="text-[10px] text-gray-500 uppercase font-medium">{v.nombre}</p>
                        <span className="text-lg font-bold" style={{ color: v.color }}>
                          {v.valor != null ? parseFloat(v.valor).toFixed(1) : '-'}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{v.unidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
