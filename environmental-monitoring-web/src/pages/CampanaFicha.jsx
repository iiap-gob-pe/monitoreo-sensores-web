// src/pages/CampanaFicha.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campanasAPI, lecturasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  FlagIcon,
  ServerIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#e11d48', '#65a30d'];

export default function CampanaFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [campana, setCampana] = useState(null);
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

      const campRes = await campanasAPI.getById(id);
      const campData = campRes.data.data;
      setCampana(campData);

      // Cargar lecturas de todos los sensores de la campaña
      const sensoresCamp = campData.sensores || [];
      setLecturas([]);
      if (sensoresCamp.length > 0) {
        const lecturasPromises = sensoresCamp.map(sensor =>
          lecturasAPI.getBySensor(sensor.id_sensor, 50)
            .then(res => {
              const data = res.data.data || res.data || [];
              return data.map(l => ({
                ...l,
                sensor_nombre: sensor.nombre_sensor || sensor.id_sensor,
                id_sensor: sensor.id_sensor
              }));
            })
            .catch(() => [])
        );
        const resultados = await Promise.all(lecturasPromises);
        const todasLecturas = resultados.flat();
        todasLecturas.sort((a, b) => new Date(b.lectura_datetime || b.created_at) - new Date(a.lectura_datetime || a.created_at));
        setLecturas(todasLecturas);
      }
      setUltimaAct(new Date());
    } catch (err) {
      console.error('Error al cargar campana:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos de la campaña. Intenta de nuevo.');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  // --- Helpers ---
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('es-PE') + ' ' + new Date(d).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const estadoBadgeClass = (estado) => {
    const estilos = {
      planificada: 'bg-yellow-100 text-yellow-800',
      activa: 'bg-green-100 text-green-800',
      finalizada: 'bg-gray-100 text-gray-800'
    };
    return estilos[estado] || 'bg-gray-100 text-gray-800';
  };

  const calcularDuracion = () => {
    if (!campana) return 'N/A';
    const inicio = new Date(campana.fecha_inicio);
    if (!campana.fecha_fin) return 'En curso';
    const fin = new Date(campana.fecha_fin);
    const diffMs = fin - inicio;
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${dias} dias`;
  };

  // --- Stats ---
  const stats = (() => {
    if (lecturas.length === 0) return { total: 0, tempProm: '0', tempMin: '-', tempMax: '-' };
    const temps = lecturas.filter(l => l.temperatura != null).map(l => Number(l.temperatura));
    const t = temps.length;
    return {
      total: lecturas.length,
      tempProm: t > 0 ? (temps.reduce((a, b) => a + b, 0) / t).toFixed(1) : 'N/A',
      tempMin: t > 0 ? Math.min(...temps).toFixed(1) : '-',
      tempMax: t > 0 ? Math.max(...temps).toFixed(1) : '-'
    };
  })();

  // --- Chart data ---
  const getComparisonData = () => {
    if (!campana?.sensores || lecturas.length === 0) return [];
    return campana.sensores.map(sensor => {
      const sensorLecturas = lecturas.filter(l => l.id_sensor === sensor.id_sensor);
      const avgTemp = sensorLecturas.length > 0
        ? sensorLecturas.reduce((s, l) => s + (Number(l.temperatura) || 0), 0) / sensorLecturas.length
        : 0;
      const avgHum = sensorLecturas.length > 0
        ? sensorLecturas.reduce((s, l) => s + (Number(l.humedad) || 0), 0) / sensorLecturas.length
        : 0;
      const avgCO2 = sensorLecturas.length > 0
        ? sensorLecturas.reduce((s, l) => s + (Number(l.co2_nivel) || 0), 0) / sensorLecturas.length
        : 0;
      return {
        nombre: sensor.nombre_sensor || sensor.id_sensor,
        Temperatura: parseFloat(avgTemp.toFixed(1)),
        Humedad: parseFloat(avgHum.toFixed(1)),
        CO2: parseFloat(avgCO2.toFixed(1))
      };
    });
  };

  const getTimelineData = () => {
    if (!campana?.sensores || lecturas.length === 0) return [];
    const timeMap = {};

    lecturas.forEach(l => {
      const fecha = l.lectura_datetime || l.created_at;
      if (!fecha) return;
      const key = new Date(fecha).toISOString();
      if (!timeMap[key]) {
        timeMap[key] = {
          _ts: new Date(fecha).getTime(),
          fecha: new Date(fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        };
      }
      const sensorName = l.sensor_nombre;
      timeMap[key][sensorName] = Number(l.temperatura) || 0;
    });

    return Object.values(timeMap)
      .sort((a, b) => a._ts - b._ts)
      .slice(-50);
  };

  // --- CSV Download ---
  const descargarCSV = () => {
    if (!isAuthenticated || lecturas.length === 0) return;
    const headers = ['Sensor', 'Fecha/Hora', 'Temperatura', 'Humedad', 'CO2', 'CO'];
    const rows = lecturas.map(l => [
      l.sensor_nombre,
      l.lectura_datetime || l.created_at || '',
      l.temperatura ?? '',
      l.humedad ?? '',
      l.co2_nivel ?? '',
      l.co_nivel ?? ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campana_${campana?.nombre || id}_lecturas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Loading state ---
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando campaña...</p>
      </div>
    </div>
  );

  // --- Error state ---
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
        <ServerIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => navigate('/campaigns')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Volver a Campañas
          </button>
          <button onClick={() => cargarDatos(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );

  if (!campana) return null;

  const sensores = campana.sensores || [];
  const comparisonData = getComparisonData();
  const timelineData = getTimelineData();
  const sensorNames = sensores.map(s => s.nombre_sensor || s.id_sensor);
  const lecturasRecientes = lecturas.slice(0, 30);
  const ultimaLectura = lecturas.length > 0 ? lecturas[0] : null;

  return (
    <div className="space-y-6">
      {/* Nav + refresh controls */}
      <div className="flex items-center justify-between">
        <Link to="/campaigns" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium">
          <ArrowLeftIcon className="h-5 w-5" /> Volver a Campañas
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
                <FlagIcon className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campana.nombre}</h1>
                <p className="text-sm text-gray-500">ID: {id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoBadgeClass(campana.estado)}`}>
                {campana.estado}
              </span>
              {campana.zona && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  {campana.zona}
                </span>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-2">
              <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" />
              <span>{formatFecha(campana.fecha_inicio)}</span>
              <span className="mx-2">-</span>
              <span>{campana.fecha_fin ? formatFecha(campana.fecha_fin) : 'En curso'}</span>
              <span className="ml-3 text-xs text-gray-400">({calcularDuracion()})</span>
            </div>

            {campana.descripcion && (
              <p className="text-sm text-gray-600 mb-3">{campana.descripcion}</p>
            )}
            {campana.usuario_creador && (
              <p className="text-sm text-gray-500">
                Creado por: <span className="font-medium text-gray-700">{campana.usuario_creador?.nombre_completo || campana.usuario_creador?.username || 'N/A'}</span>
              </p>
            )}
          </div>

          {/* Download CSV */}
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
      </div>

      {/* Última lectura en tiempo real */}
      {ultimaLectura && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <SignalIcon className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Última lectura</h2>
            <span className="text-xs text-gray-500 ml-auto">{fmt(ultimaLectura.lectura_datetime || ultimaLectura.created_at)}</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Sensor: <span className="font-medium text-gray-700">{ultimaLectura.sensor_nombre}</span></p>
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
              <p className="text-xl font-bold text-green-700">{ultimaLectura.co2_nivel != null ? `${ultimaLectura.co2_nivel} ppm` : '-'}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-medium">CO</p>
              <p className="text-xl font-bold text-red-600">{ultimaLectura.co_nivel != null ? `${parseFloat(ultimaLectura.co_nivel).toFixed(2)} ppm` : '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Total Lecturas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Sensores</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{sensores.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Duración</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{calcularDuracion()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-xs text-gray-500 font-medium">Temperatura promedio</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.tempProm}°C</p>
          <p className="text-[10px] text-gray-400">Min {stats.tempMin}° / Max {stats.tempMax}°</p>
        </div>
      </div>

      {/* Sensors List as clickable cards */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sensores de la Campaña</h2>
        {sensores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sensores.map((sensor) => (
              <Link
                key={sensor.id_sensor}
                to={`/sensors/${sensor.id_sensor}`}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-200 group"
              >
                <div className={`p-2 rounded-lg ${sensor.estado === 'Activo' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <ServerIcon className={`w-6 h-6 ${sensor.estado === 'Activo' ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-green-700 transition">
                    {sensor.nombre_sensor || sensor.id_sensor}
                  </p>
                  <p className="text-xs text-gray-500">{sensor.id_sensor}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    sensor.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {sensor.estado || 'N/A'}
                  </span>
                  {sensor.tipo && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                      {sensor.tipo}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">No hay sensores asignados a esta campaña</p>
        )}
      </div>

      {/* Environmental Comparison Chart (BarChart) */}
      {comparisonData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparación Ambiental por Sensor</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="Temperatura" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Humedad" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CO2" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Temperature Timeline Chart (LineChart) */}
      {timelineData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temperatura en el Tiempo</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} unit="°C" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              {sensorNames.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Readings Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lecturas Recientes ({lecturas.length} total)</h2>
        </div>

        {lecturasRecientes.length === 0 ? (
          <div className="text-center py-8">
            <ServerIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay lecturas disponibles para esta campaña</p>
            <p className="text-gray-400 text-sm mt-1">Las lecturas aparecerán cuando los sensores comiencen a enviar datos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lecturasRecientes.map((lectura, idx) => {
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
                <div key={idx} className="flex flex-col lg:flex-row bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition overflow-hidden">
                  <div className="lg:w-52 flex-shrink-0 px-4 py-2.5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
                    <p className="text-sm font-medium text-gray-900">{lectura.sensor_nombre}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{fmt(lectura.lectura_datetime || lectura.created_at)}</p>
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
        )}
      </div>
    </div>
  );
}
