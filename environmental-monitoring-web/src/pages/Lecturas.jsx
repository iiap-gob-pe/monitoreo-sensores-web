import { useState, useEffect } from 'react';
import { usePreferencias } from '../hooks/usePreferencias';

export default function Lecturas() {
  const { preferencias, formatearFechaHora, formatearFecha, formatearHora } = usePreferencias();
  
  // Estados
  const [lecturas, setLecturas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ SOLUCIÓN: Inicializar filtros directamente desde localStorage
  const getLimitInicial = () => {
    try {
      const configGuardada = localStorage.getItem('preferencias_sistema');
      if (configGuardada) {
        const config = JSON.parse(configGuardada);
        return config.registrosPorPagina || 20;
      }
    } catch (error) {
      console.error('Error al cargar limit inicial:', error);
    }
    return 20; // Fallback
  };

  // ✅ Estados de filtros - Inicializar con valor desde localStorage
  const [filtros, setFiltros] = useState({
    id_sensor: '',
    parametro: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_sensor: '',
    page: 1,
    limit: getLimitInicial(), // ✅ Carga directamente desde localStorage
    sort_by: 'lectura_datetime',
    sort_order: 'DESC'
  });

  // Estado de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: getLimitInicial(),
    total: 0,
    totalPages: 0
  });

  console.log('📌 Filtros inicializados con limit:', filtros.limit); // Debug

  // Cargar sensores para el filtro
  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/sensores');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setSensores(data.data);
        } else if (Array.isArray(data)) {
          setSensores(data);
        } else {
          setSensores([]);
        }
      } catch (err) {
        console.error('Error al cargar sensores:', err);
        setSensores([]);
      }
    };
    fetchSensores();
  }, []);

  // ✅ Cargar lecturas cuando cambien los filtros
  useEffect(() => {
    console.log('📡 Cargando lecturas con limit:', filtros.limit); // Debug
    fetchLecturas();
  }, [filtros]);

  const fetchLecturas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params.append(key, filtros[key]);
        }
      });

      const response = await fetch(`http://localhost:3000/api/lecturas/avanzado?${params}`);
      const result = await response.json();

      if (result.success) {
        setLecturas(result.data);
        setPagination(result.pagination);
      } else {
        setError('Error al cargar las lecturas');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: name === 'limit' ? Number(value) : value,
      page: 1
    }));
  };

  // ✅ Limpiar filtros - Usa el valor actual de preferencias
  const limpiarFiltros = () => {
    const limitActual = preferencias.registrosPorPagina || getLimitInicial();
    console.log('🧹 Limpiando filtros, limit:', limitActual); // Debug
    
    setFiltros({
      id_sensor: '',
      parametro: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipo_sensor: '',
      page: 1,
      limit: limitActual,
      sort_by: 'lectura_datetime',
      sort_order: 'DESC'
    });
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  // Cambiar ordenamiento
  const cambiarOrden = (columna) => {
    setFiltros(prev => ({
      ...prev,
      sort_by: columna,
      sort_order: prev.sort_by === columna && prev.sort_order === 'DESC' ? 'ASC' : 'DESC'
    }));
  };

  // Exportar página actual con formato de fecha
  const exportarPaginaActual = () => {
    let headers = ['Fecha/Hora', 'Sensor', 'Nombre', 'Tipo'];
    let rows = [];

    if (filtros.parametro) {
      const parametroLabel = {
        'temperatura': 'Temperatura (°C)',
        'humedad': 'Humedad (%)',
        'co2': 'CO₂ (ppm)',
        'co': 'CO (ppm)'
      }[filtros.parametro] || filtros.parametro;
      
      headers.push(parametroLabel, 'Latitud', 'Longitud');
      
      rows = lecturas.map(l => [
        formatearFechaHora(l.lectura_datetime),
        l.sensor_id,
        l.nombre_sensor || '',
        l.tipo_sensor || '',
        l[filtros.parametro === 'co2' ? 'co2_nivel' : filtros.parametro === 'co' ? 'co_nivel' : filtros.parametro] || '',
        l.latitud || '',
        l.longitud || ''
      ]);
    } else {
      headers.push('Temperatura', 'Humedad', 'CO2', 'CO', 'Latitud', 'Longitud');
      
      rows = lecturas.map(l => [
        formatearFechaHora(l.lectura_datetime),
        l.sensor_id,
        l.nombre_sensor || '',
        l.tipo_sensor || '',
        l.temperatura || '',
        l.humedad || '',
        l.co2_nivel || '',
        l.co_nivel || '',
        l.latitud || '',
        l.longitud || ''
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecturas_pagina_actual_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Exportar todos los datos con formato de fecha
  const exportarTodosDatos = async () => {
    try {
      const exportBtn = document.getElementById('export-all-btn');
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = '⏳ Exportando...';
      }

      const params = new URLSearchParams();
      if (filtros.id_sensor) params.append('id_sensor', filtros.id_sensor);
      if (filtros.parametro) params.append('parametro', filtros.parametro);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.tipo_sensor) params.append('tipo_sensor', filtros.tipo_sensor);

      const response = await fetch(`http://localhost:3000/api/lecturas/exportar?${params}`);
      const result = await response.json();

      if (!result.success) {
        alert('Error al exportar datos');
        return;
      }

      const todasLecturas = result.data;

      let headers = ['Fecha/Hora', 'Sensor', 'Nombre', 'Tipo'];
      let rows = [];

      if (filtros.parametro) {
        const parametroLabel = {
          'temperatura': 'Temperatura (°C)',
          'humedad': 'Humedad (%)',
          'co2': 'CO₂ (ppm)',
          'co': 'CO (ppm)'
        }[filtros.parametro] || filtros.parametro;
        
        headers.push(parametroLabel, 'Latitud', 'Longitud');
        
        rows = todasLecturas.map(l => [
          formatearFechaHora(l.lectura_datetime),
          l.sensor_id,
          l.nombre_sensor || '',
          l.tipo_sensor || '',
          l[filtros.parametro === 'co2' ? 'co2_nivel' : filtros.parametro === 'co' ? 'co_nivel' : filtros.parametro] || '',
          l.latitud || '',
          l.longitud || ''
        ]);
      } else {
        headers.push('Temperatura', 'Humedad', 'CO2', 'CO', 'Latitud', 'Longitud');
        
        rows = todasLecturas.map(l => [
          formatearFechaHora(l.lectura_datetime),
          l.sensor_id,
          l.nombre_sensor || '',
          l.tipo_sensor || '',
          l.temperatura || '',
          l.humedad || '',
          l.co2_nivel || '',
          l.co_nivel || '',
          l.latitud || '',
          l.longitud || ''
        ]);
      }

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecturas_completas_${todasLecturas.length}_registros_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      alert(`✅ Se exportaron ${todasLecturas.length} registros exitosamente`);

    } catch (error) {
      console.error('Error al exportar:', error);
      alert('❌ Error al exportar los datos');
    } finally {
      const exportBtn = document.getElementById('export-all-btn');
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = '📥 Exportar Todos';
      }
    }
  };

  // Obtener color según valor de parámetro
  const getColorAlerta = (valor, parametro) => {
    if (!valor) return 'text-gray-400';
    const valorNum = parseFloat(valor);
    
    switch(parametro) {
      case 'temperatura':
        if (valorNum > 35) return 'text-red-600 font-bold';
        if (valorNum > 30) return 'text-orange-600';
        if (valorNum < 10) return 'text-blue-600';
        return 'text-green-600';
      case 'humedad':
        if (valorNum > 80) return 'text-red-600 font-bold';
        if (valorNum < 30) return 'text-orange-600';
        return 'text-green-600';
      case 'co2':
        if (valorNum > 1000) return 'text-red-600 font-bold';
        if (valorNum > 800) return 'text-orange-600';
        return 'text-green-600';
      case 'co':
        if (valorNum > 50) return 'text-red-600 font-bold';
        if (valorNum > 30) return 'text-orange-600';
        return 'text-green-600';
      default:
        return 'text-gray-900';
    }
  };

  // Función para renderizar columnas según parámetro seleccionado
  const renderColumnasTabla = () => {
    if (filtros.parametro) {
      const parametroInfo = {
        'temperatura': { label: 'Temperatura', unidad: '°C', campo: 'temperatura' },
        'humedad': { label: 'Humedad', unidad: '%', campo: 'humedad' },
        'co2': { label: 'CO₂', unidad: 'ppm', campo: 'co2_nivel' },
        'co': { label: 'CO', unidad: 'ppm', campo: 'co_nivel' }
      };

      const info = parametroInfo[filtros.parametro];

      return (
        <>
          <th 
            onClick={() => cambiarOrden('lectura_datetime')}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          >
            Fecha/Hora {filtros.sort_by === 'lectura_datetime' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
          </th>
          <th 
            onClick={() => cambiarOrden('id_sensor')}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          >
            Sensor {filtros.sort_by === 'id_sensor' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre / Tipo
          </th>
          <th 
            onClick={() => cambiarOrden(info.campo)}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          >
            {info.label} ({info.unidad}) {filtros.sort_by === info.campo && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Coordenadas
          </th>
        </>
      );
    }

    // Vista completa sin filtro de parámetro
    return (
      <>
        <th 
          onClick={() => cambiarOrden('lectura_datetime')}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        >
          Fecha/Hora {filtros.sort_by === 'lectura_datetime' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
        </th>
        <th 
          onClick={() => cambiarOrden('id_sensor')}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        >
          Sensor {filtros.sort_by === 'id_sensor' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nombre / Tipo
        </th>
        <th 
          onClick={() => cambiarOrden('temperatura')}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        >
          Temp. {filtros.sort_by === 'temperatura' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
        </th>
        <th 
          onClick={() => cambiarOrden('humedad')}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        >
          Humedad {filtros.sort_by === 'humedad' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
        </th>
        <th 
          onClick={() => cambiarOrden('co2_nivel')}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        >
          CO₂ {filtros.sort_by === 'co2_nivel' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
        </th>
        <th 
          onClick={() => cambiarOrden('co_nivel')}
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
        >
          CO {filtros.sort_by === 'co_nivel' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Coordenadas
        </th>
      </>
    );
  };

  // Función para renderizar filas con formato de fecha personalizado
  const renderFilasTabla = (lectura) => {
    if (filtros.parametro) {
      const parametroInfo = {
        'temperatura': { campo: 'temperatura', unidad: '°C', decimales: 1 },
        'humedad': { campo: 'humedad', unidad: '%', decimales: 1 },
        'co2': { campo: 'co2_nivel', unidad: ' ppm', decimales: 0 },
        'co': { campo: 'co_nivel', unidad: ' ppm', decimales: 1 }
      };

      const info = parametroInfo[filtros.parametro];
      const valor = lectura[info.campo];

      return (
        <>
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            <div className="text-gray-900">
              {formatearFecha(lectura.lectura_datetime)}
            </div>
            <div className="text-gray-500 text-xs">
              {formatearHora(lectura.lectura_datetime)}
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{lectura.sensor_id}</div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-sm">
            <div className="text-gray-900">{lectura.nombre_sensor || 'N/A'}</div>
            <div className="text-xs">
              <span className={`px-2 py-1 rounded ${
                lectura.is_movil 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {lectura.tipo_sensor}
              </span>
            </div>
          </td>
          <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getColorAlerta(valor, filtros.parametro)}`}>
            {valor ? `${parseFloat(valor).toFixed(info.decimales)}${info.unidad}` : 'N/A'}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
            {lectura.latitud && lectura.longitud ? (
              <div>
                <div>{parseFloat(lectura.latitud).toFixed(4)}°</div>
                <div>{parseFloat(lectura.longitud).toFixed(4)}°</div>
              </div>
            ) : 'N/A'}
          </td>
        </>
      );
    }

    // Vista completa
    return (
      <>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          <div className="text-gray-900">
            {formatearFecha(lectura.lectura_datetime)}
          </div>
          <div className="text-gray-500 text-xs">
            {formatearHora(lectura.lectura_datetime)}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{lectura.sensor_id}</div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          <div className="text-gray-900">{lectura.nombre_sensor || 'N/A'}</div>
          <div className="text-xs">
            <span className={`px-2 py-1 rounded ${
              lectura.is_movil 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {lectura.tipo_sensor}
            </span>
          </div>
        </td>
        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getColorAlerta(lectura.temperatura, 'temperatura')}`}>
          {lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}
        </td>
        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getColorAlerta(lectura.humedad, 'humedad')}`}>
          {lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A'}
        </td>
        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getColorAlerta(lectura.co2_nivel, 'co2')}`}>
          {lectura.co2_nivel ? `${lectura.co2_nivel} ppm` : 'N/A'}
        </td>
        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getColorAlerta(lectura.co_nivel, 'co')}`}>
          {lectura.co_nivel ? `${parseFloat(lectura.co_nivel).toFixed(1)} ppm` : 'N/A'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
          {lectura.latitud && lectura.longitud ? (
            <div>
              <div>{parseFloat(lectura.latitud).toFixed(4)}°</div>
              <div>{parseFloat(lectura.longitud).toFixed(4)}°</div>
            </div>
          ) : 'N/A'}
        </td>
      </>
    );
  };

  if (loading && lecturas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cargando lecturas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial de Lecturas</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {pagination.total} registros encontrados
            {filtros.parametro && (
              <span className="ml-2 text-blue-600">
                • Filtrando por: {filtros.parametro.toUpperCase()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={exportarPaginaActual}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
            title="Exportar solo los datos visibles"
          >
            <span className="text-xs sm:text-base">📄</span>
            <span className="text-xs sm:text-sm">Página</span>
            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">
              {lecturas.length}
            </span>
          </button>
          <button
            id="export-all-btn"
            onClick={exportarTodosDatos}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
          >
            <span className="text-xs sm:text-base">📥</span>
            <span className="text-xs sm:text-sm">Todos</span>
            <span className="text-xs bg-green-500 px-2 py-0.5 rounded">
              {pagination.total}
            </span>
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={limpiarFiltros}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpiar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de Sensor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensor
            </label>
            <select
              name="id_sensor"
              value={filtros.id_sensor}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los sensores</option>
              {Array.isArray(sensores) && sensores.length > 0 ? (
                sensores.map(sensor => (
                  <option key={sensor.id_sensor} value={sensor.id_sensor}>
                    {sensor.id_sensor} - {sensor.nombre_sensor}
                  </option>
                ))
              ) : (
                <option key="no-sensores" disabled>No hay sensores disponibles</option>
              )}
            </select>
          </div>

          {/* Filtro de Parámetro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parámetro
            </label>
            <select
              name="parametro"
              value={filtros.parametro}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los parámetros</option>
              <option value="temperatura">Temperatura</option>
              <option value="humedad">Humedad</option>
              <option value="co2">CO₂</option>
              <option value="co">CO</option>
            </select>
          </div>

          {/* Filtro de Tipo de Sensor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sensor
            </label>
            <select
              name="tipo_sensor"
              value={filtros.tipo_sensor}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="movil">Móvil</option>
              <option value="estacionario">Estacionario</option>
            </select>
          </div>

          {/* ✅ Filtro de Registros por página */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registros por página
            </label>
            <select
              name="limit"
              value={filtros.limit}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              name="fecha_fin"
              value={filtros.fecha_fin}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contador de filtros activos */}
        <div className="mt-4 text-sm text-gray-600">
          {Object.entries(filtros).filter(([key, value]) => 
            value && !['page', 'limit', 'sort_by', 'sort_order'].includes(key)
          ).length > 0 && (
            <span>
              ✓ {Object.entries(filtros).filter(([key, value]) => 
                value && !['page', 'limit', 'sort_by', 'sort_order'].includes(key)
              ).length} filtro(s) activo(s)
            </span>
          )}
        </div>
      </div>

      {/* Contenido: Tabla */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderColumnasTabla()}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lecturas.length === 0 ? (
                <tr>
                  <td colSpan={filtros.parametro ? "5" : "8"} className="px-4 py-8 text-center text-gray-500">
                    No hay lecturas que coincidan con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                lecturas.map((lectura) => (
                  <tr key={lectura.id_lectura} className="hover:bg-gray-50">
                    {renderFilasTabla(lectura)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 rounded-lg shadow flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => cambiarPagina(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => cambiarPagina(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => cambiarPagina(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  ←
                </button>
                
                {/* Números de página */}
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => cambiarPagina(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 3 ||
                    pageNum === pagination.page + 3
                  ) {
                    return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => cambiarPagina(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}