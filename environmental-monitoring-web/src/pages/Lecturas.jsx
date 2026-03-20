import { useState, useEffect } from 'react';
import api from '../services/api';
import { sensoresAPI, variablesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Pagination from '../components/common/Pagination';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

// Campos legacy y sus unidades
const LEGACY_FIELDS = [
  { key: 'temperatura', label: 'Temperatura', unit: '\u00b0C', color: '#ef4444' },
  { key: 'humedad', label: 'Humedad', unit: '%', color: '#3b82f6' },
  { key: 'co2_nivel', label: 'CO2', unit: 'ppm', color: '#f59e0b' },
  { key: 'co_nivel', label: 'CO', unit: 'ppm', color: '#8b5cf6' }
];

export default function Lecturas() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  // Data states
  const [lecturas, setLecturas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filtroSensor, setFiltroSensor] = useState('');
  const [filtroVariable, setFiltroVariable] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [porPagina, setPorPagina] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Pagination state
  const [pagina, setPagina] = useState(1);

  // Initial load
  useEffect(() => {
    cargarDatos(true);
  }, []);

  // Reload when filters change
  useEffect(() => {
    setPagina(1);
    cargarLecturas(true);
  }, [filtroSensor, fechaInicio, fechaFin]);

  // Auto-refresh logic
  useEffect(() => {
    const hayFiltros = filtroSensor || fechaInicio || fechaFin;
    if (!autoRefresh || hayFiltros) return;

    const interval = setInterval(() => cargarLecturas(false), 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, filtroSensor, fechaInicio, fechaFin]);

  const cargarDatos = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      const [sensoresRes, variablesRes] = await Promise.all([
        sensoresAPI.getAll(),
        variablesAPI.getAll()
      ]);
      setSensores(sensoresRes.data.data || []);
      setVariables(variablesRes.data.data || []);
      await cargarLecturas(mostrarLoading);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  const cargarLecturas = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      const params = { limit: 500, sort_by: 'lectura_datetime', sort_order: 'DESC' };
      if (filtroSensor) params.id_sensor = filtroSensor;
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;

      const res = await api.get('/lecturas/avanzado', { params });
      setLecturas(res.data.data || []);
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  // Client-side pagination
  const totalItems = lecturas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const lecturasPaginadas = lecturas.slice(inicio, inicio + porPagina);

  // Reset page when porPagina changes
  useEffect(() => {
    setPagina(1);
  }, [porPagina]);

  // Statistics
  const sensoresReportando = new Set(lecturas.map(l => l.id_sensor)).size;
  const ultimaLectura = lecturas.length > 0
    ? new Date(lecturas[0].lectura_datetime).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : 'Sin datos';

  // Helper: get sensor info
  const getSensor = (id_sensor) => sensores.find(s => s.id_sensor === id_sensor);

  // Helper: get variable info by key name
  const getVariableInfo = (varKey) => variables.find(
    v => v.nombre_variable === varKey || v.clave === varKey || v.id_variable === varKey
  );

  // Helper: check if value is out of range
  const isOutOfRange = (varInfo, value) => {
    if (!varInfo) return false;
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return false;
    if (varInfo.rango_min !== null && varInfo.rango_min !== undefined && numVal < varInfo.rango_min) return true;
    if (varInfo.rango_max !== null && varInfo.rango_max !== undefined && numVal > varInfo.rango_max) return true;
    return false;
  };

  // Build variable entries for a reading
  const getVariableEntries = (lectura) => {
    const entries = [];
    const dinamicos = lectura.valores_dinamicos;

    if (dinamicos && typeof dinamicos === 'object' && Object.keys(dinamicos).length > 0) {
      Object.entries(dinamicos).forEach(([key, dynVal]) => {
        // dynVal puede ser { valor, nombre, unidad, color } o un valor simple
        const esObjeto = dynVal && typeof dynVal === 'object' && dynVal.valor !== undefined;
        const valor = esObjeto ? dynVal.valor : dynVal;
        const nombre = esObjeto ? dynVal.nombre : key;
        const unidad = esObjeto ? dynVal.unidad : '';
        const color = esObjeto ? dynVal.color : '#6b7280';
        if (valor == null) return;
        entries.push({
          key,
          label: nombre || key,
          value: typeof valor === 'number' ? valor : parseFloat(valor),
          unit: unidad,
          color: color,
          outOfRange: false
        });
      });
    } else {
      // Fallback to legacy fields
      LEGACY_FIELDS.forEach(field => {
        const val = lectura[field.key];
        if (val !== null && val !== undefined) {
          entries.push({
            key: field.key,
            label: field.label,
            value: val,
            unit: field.unit,
            color: field.color,
            outOfRange: false
          });
        }
      });
    }

    return entries;
  };

  // CSV download
  const handleDescargarCSV = () => {
    if (!isAuthenticated) {
      toast.warning('Debes iniciar sesion para exportar datos');
      return;
    }

    try {
      // Collect all unique variable keys
      const allKeys = new Set();
      lecturas.forEach(l => {
        const entries = getVariableEntries(l);
        entries.forEach(e => allKeys.add(e.key));
      });

      const variableKeys = Array.from(allKeys);
      const headers = ['ID Lectura', 'ID Sensor', 'Sensor', 'Fecha/Hora', 'Latitud', 'Longitud',
        ...variableKeys.map(k => {
          const info = getVariableInfo(k);
          const legacy = LEGACY_FIELDS.find(f => f.key === k);
          return info?.nombre_variable || legacy?.label || k;
        })
      ];

      const rows = lecturas.map(l => {
        const sensor = getSensor(l.id_sensor);
        const entries = getVariableEntries(l);
        const valMap = {};
        entries.forEach(e => { valMap[e.key] = e.value; });

        return [
          l.id_lectura,
          l.id_sensor,
          sensor?.nombre_sensor || l.id_sensor,
          new Date(l.lectura_datetime).toLocaleString('es-PE'),
          l.latitud || '',
          l.longitud || '',
          ...variableKeys.map(k => valMap[k] !== undefined ? valMap[k] : '')
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lecturas_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Se exportaron ${lecturas.length} lecturas`);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al generar el archivo CSV');
    }
  };

  // Loading state
  if (loading && lecturas.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Lecturas de Sensores</h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualiza todas las lecturas registradas con variables dinamicas
          </p>
        </div>
        <button
          onClick={handleDescargarCSV}
          disabled={!isAuthenticated || lecturas.length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            isAuthenticated && lecturas.length > 0
              ? 'bg-primary text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={!isAuthenticated ? 'Inicia sesion para exportar' : ''}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lecturas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <ServerIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sensores Reportando</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{sensoresReportando}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MagnifyingGlassIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ultima Lectura</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{ultimaLectura}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <ClockIcon className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Sensor filter */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Sensor</label>
            <select
              value={filtroSensor}
              onChange={(e) => setFiltroSensor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="">Todos los sensores</option>
              {sensores.map(s => (
                <option key={s.id_sensor} value={s.id_sensor}>
                  {s.nombre_sensor || s.id_sensor} {s.is_movil ? '(Movil)' : '(Fijo)'}
                </option>
              ))}
            </select>
          </div>

          {/* Variable filter (highlight) */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Variable</label>
            <select
              value={filtroVariable}
              onChange={(e) => setFiltroVariable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="">Todas las variables</option>
              {variables.map(v => (
                <option key={v.id_variable} value={v.nombre_variable || v.clave}>
                  {v.nombre_variable} ({v.unidad || '-'})
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
            <input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
            <input
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Items per page */}
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Por pagina</label>
            <select
              value={porPagina}
              onChange={(e) => setPorPagina(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2 pb-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-xs text-gray-600 whitespace-nowrap">Auto (5s)</span>
          </div>

          {/* Clear filters */}
          <button
            onClick={() => {
              setFiltroSensor('');
              setFiltroVariable('');
              setFechaInicio('');
              setFechaFin('');
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center space-x-1"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Results count */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            Mostrando {totalItems > 0 ? inicio + 1 : 0}-{Math.min(inicio + porPagina, totalItems)} de {totalItems.toLocaleString()} lecturas
          </span>
          {autoRefresh && !filtroSensor && !fechaInicio && !fechaFin && (
            <span className="flex items-center space-x-1 text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs">Actualizando en vivo</span>
            </span>
          )}
        </div>
      </div>

      {/* Reading Cards - Full width, 1 per row */}
      {lecturasPaginadas.length > 0 ? (
        <div className="space-y-3">
          {lecturasPaginadas.map((lectura) => {
            const sensor = getSensor(lectura.id_sensor);
            const varEntries = getVariableEntries(lectura);
            const fechaHora = new Date(lectura.lectura_datetime);

            const hasHighlightVar = filtroVariable
              ? varEntries.some(e => e.key === filtroVariable || e.label === filtroVariable)
              : true;
            if (filtroVariable && !hasHighlightVar) return null;

            return (
              <div
                key={lectura.id_lectura}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Sensor info */}
                  <div className="lg:w-56 flex-shrink-0 px-4 py-3 bg-gradient-to-b lg:bg-gradient-to-r from-green-50 to-emerald-50 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {sensor?.nombre_sensor || lectura.id_sensor}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{lectura.id_sensor}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        sensor?.is_movil ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {sensor?.is_movil ? 'Móvil' : 'Fijo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-500">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>
                        {fechaHora.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' '}
                        {fechaHora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    {lectura.latitud && lectura.longitud && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {parseFloat(lectura.latitud).toFixed(5)}, {parseFloat(lectura.longitud).toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* Right: Variable values in horizontal row */}
                  <div className="flex-1 px-4 py-3">
                    {varEntries.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {varEntries.map((entry) => {
                          const isHighlighted = filtroVariable && (entry.key === filtroVariable || entry.label === filtroVariable);
                          return (
                            <div
                              key={entry.key}
                              className={`relative rounded-lg px-4 py-2 min-w-[120px] flex-1 transition ${
                                isHighlighted ? 'bg-green-50 ring-2 ring-primary' : 'bg-gray-50'
                              }`}
                            >
                              <p className="text-[10px] text-gray-500 uppercase font-medium truncate">{entry.label}</p>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-xl font-bold" style={{ color: entry.color }}>
                                  {typeof entry.value === 'number'
                                    ? entry.value % 1 === 0 ? entry.value : entry.value.toFixed(1)
                                    : entry.value}
                                </span>
                                <span className="text-xs text-gray-400">{entry.unit}</span>
                              </div>
                              {entry.outOfRange && (
                                <span className="absolute top-1 right-1 flex h-2 w-2" title="Fuera de rango">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-3">Sin variables registradas</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ServerIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Sin lecturas</h3>
          <p className="text-sm text-gray-500 mt-1">
            No se encontraron lecturas con los filtros seleccionados
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-4">
        <Pagination
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onChange={setPagina}
          totalItems={totalItems}
          porPagina={porPagina}
        />
      </div>
    </div>
  );
}
