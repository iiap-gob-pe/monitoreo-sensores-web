import { useState, useEffect } from 'react';
import { apiLogsAPI } from '../services/api';
import {
  ArrowPathIcon,
  FunnelIcon,
  SignalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

export default function ApiLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total_hoy: 0, exitosos_hoy: 0, errores_hoy: 0 });
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ultimaAct, setUltimaAct] = useState(null);

  // Filtros
  const [filtroEndpoint, setFiltroEndpoint] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(''); // '', 'exitoso', 'error'
  const [filtroSensor, setFiltroSensor] = useState('');
  const [limite, setLimite] = useState(50);

  useEffect(() => {
    cargarEndpoints();
    cargarLogs(true);
  }, []);

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => cargarLogs(false), 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, filtroEndpoint, filtroEstado, filtroSensor, limite]);

  // Recargar al cambiar filtros
  useEffect(() => {
    cargarLogs(false);
  }, [filtroEndpoint, filtroEstado, filtroSensor, limite]);

  const cargarEndpoints = async () => {
    try {
      const res = await apiLogsAPI.getEndpoints();
      setEndpoints(res.data.data || []);
    } catch (err) {
      console.error('Error cargando endpoints:', err);
    }
  };

  const cargarLogs = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      const params = { limite };
      if (filtroEndpoint) params.endpoint = filtroEndpoint;
      if (filtroEstado === 'error') params.solo_errores = 'true';
      if (filtroEstado === 'exitoso') params.status = '200';
      if (filtroSensor) params.id_sensor = filtroSensor;

      const res = await apiLogsAPI.getLogs(params);
      setLogs(res.data.data || []);
      setStats(res.data.stats || {});
      setUltimaAct(new Date());
    } catch (err) {
      console.error('Error cargando logs:', err);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  const fmt = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString('es-PE') + ' ' + dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-700';
    if (code >= 400 && code < 500) return 'bg-red-100 text-red-700';
    if (code >= 500) return 'bg-red-200 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  const statusIcon = (code) => {
    if (code >= 200 && code < 300) return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    return <XCircleIcon className="w-4 h-4 text-red-500" />;
  };

  // Sensores únicos del log para filtro
  const sensoresUnicos = [...new Set(logs.filter(l => l.id_sensor).map(l => l.id_sensor))];

  const [logSeleccionado, setLogSeleccionado] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitor de API</h1>
          <p className="mt-1 text-sm text-gray-600">Peticiones en tiempo real a los endpoints de datos</p>
        </div>
        <div className="flex items-center gap-3">
          {ultimaAct && (
            <span className="text-xs text-gray-400">
              {ultimaAct.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {autoRefresh ? 'En vivo (5s)' : 'Pausado'}
          </button>
          <button onClick={() => cargarLogs(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Estadísticas de hoy */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SignalIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_hoy}</p>
              <p className="text-xs text-gray-500">Peticiones hoy</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.exitosos_hoy}</p>
              <p className="text-xs text-gray-500">Exitosas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.errores_hoy}</p>
              <p className="text-xs text-gray-500">Con error</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-gray-400" />

          <select
            value={filtroEndpoint}
            onChange={(e) => setFiltroEndpoint(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los endpoints</option>
            {endpoints.map(e => (
              <option key={e.endpoint} value={e.endpoint}>{e.endpoint} ({e.count})</option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los estados</option>
            <option value="exitoso">Exitosos (2xx)</option>
            <option value="error">Errores (4xx/5xx)</option>
          </select>

          <select
            value={filtroSensor}
            onChange={(e) => setFiltroSensor(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos los sensores</option>
            {sensoresUnicos.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={limite}
            onChange={(e) => setLimite(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>

          <span className="text-xs text-gray-400 ml-auto">{logs.length} registros</span>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha/Hora</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Método</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Endpoint</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Sensor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">API Key</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Duración</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <ServerIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p>No hay logs registrados</p>
                    <p className="text-xs text-gray-400 mt-1">Las peticiones a /api/datos y /api/lecturas aparecerán aquí</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id_log}
                    onClick={() => setLogSeleccionado(logSeleccionado?.id_log === log.id_log ? null : log)}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${logSeleccionado?.id_log === log.id_log ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-2.5 px-4 text-gray-700 whitespace-nowrap text-xs">
                      {fmt(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-blue-100 text-blue-700">
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-gray-700">
                      {log.endpoint}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor(log.status_code)}`}>
                        {statusIcon(log.status_code)}
                        {log.status_code}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-600">
                      {log.id_sensor || <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-600 truncate max-w-[120px]">
                      {log.api_key_name || <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-2.5 px-4 text-right text-xs">
                      <span className={`font-medium ${log.duration_ms > 1000 ? 'text-red-600' : log.duration_ms > 500 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {log.duration_ms != null ? `${log.duration_ms}ms` : '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-400 font-mono">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle del log seleccionado */}
      {logSeleccionado && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {statusIcon(logSeleccionado.status_code)}
              Detalle de la petición
            </h3>
            <button onClick={() => setLogSeleccionado(null)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Fecha/Hora</p>
              <p className="text-sm font-medium">{fmt(logSeleccionado.timestamp)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Endpoint</p>
              <p className="text-sm font-mono font-medium">{logSeleccionado.method} {logSeleccionado.endpoint}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estado</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor(logSeleccionado.status_code)}`}>
                {logSeleccionado.status_code}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duración</p>
              <p className="text-sm font-medium">{logSeleccionado.duration_ms}ms</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sensor</p>
              <p className="text-sm font-medium">{logSeleccionado.id_sensor || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">API Key</p>
              <p className="text-sm font-medium">{logSeleccionado.api_key_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">IP</p>
              <p className="text-sm font-mono">{logSeleccionado.ip_address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">User Agent</p>
              <p className="text-sm truncate" title={logSeleccionado.user_agent}>{logSeleccionado.user_agent || 'N/A'}</p>
            </div>
          </div>

          {logSeleccionado.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-red-700 mb-1">Error</p>
              <p className="text-sm text-red-600">{logSeleccionado.error_message}</p>
            </div>
          )}

          {logSeleccionado.request_body && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">Request Body</p>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto max-h-40">{logSeleccionado.request_body}</pre>
            </div>
          )}

          {logSeleccionado.response_body && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Response</p>
              <pre className="bg-gray-900 text-blue-400 rounded-lg p-3 text-xs overflow-x-auto max-h-40">
                {(() => {
                  try { return JSON.stringify(JSON.parse(logSeleccionado.response_body), null, 2); }
                  catch { return logSeleccionado.response_body; }
                })()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
