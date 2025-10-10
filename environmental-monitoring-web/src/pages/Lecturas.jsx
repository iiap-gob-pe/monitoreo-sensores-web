import { useState, useEffect } from 'react';
import { lecturasAPI, sensoresAPI } from '../services/api';

export default function Lecturas() {
  // Estados
  const [lecturas, setLecturas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    sensor_id: '',
    parametro: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_entorno: '',
    page: 1,
    limit: 50,
    sort_by: 'lectura_datetime',
    sort_order: 'DESC'
  });

  // Estado de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Vista: tabla o tarjetas
  const [vistaActual, setVistaActual] = useState('tabla');

  // Cargar sensores para el filtro
  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const data = await sensoresAPI.getAll();
        setSensores(data);
      } catch (err) {
        console.error('Error al cargar sensores:', err);
      }
    };
    fetchSensores();
  }, []);

  // Cargar lecturas con filtros
  useEffect(() => {
    fetchLecturas();
  }, [filtros]);

  const fetchLecturas = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construir query string con filtros activos
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
      [name]: value,
      page: 1 // Reset a página 1 cuando cambian filtros
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      sensor_id: '',
      parametro: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipo_entorno: '',
      page: 1,
      limit: 50,
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

  // Exportar a CSV
  const exportarCSV = () => {
    const headers = ['Fecha/Hora', 'Sensor', 'Ubicación', 'Tipo Entorno', 'Temperatura', 'Humedad', 'CO2', 'CO', 'Latitud', 'Longitud'];
    
    const csvContent = [
      headers.join(','),
      ...lecturas.map(l => [
        l.lectura_datetime,
        l.sensor_id,
        l.ubicacion || '',
        l.tipo_entorno || '',
        l.temperatura || '',
        l.humedad || '',
        l.co2_nivel || '',
        l.co_nivel || '',
        l.latitud || '',
        l.longitud || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecturas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Obtener color según valor de parámetro
    const getColorAlerta = (valor, parametro) => {
        if (!valor) return 'text-gray-400';
        // Ejemplo: colorear según rangos (ajusta según tus umbrales)
        
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historial de Lecturas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total} registros encontrados
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setVistaActual(vistaActual === 'tabla' ? 'tarjetas' : 'tabla')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {vistaActual === 'tabla' ? '📇 Tarjetas' : '📊 Tabla'}
          </button>
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📥 Exportar CSV
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
              name="sensor_id"
              value={filtros.sensor_id}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los sensores</option>
              {sensores.map(sensor => (
                <option key={sensor.sensor_id} value={sensor.sensor_id}>
                  {sensor.sensor_id} - {sensor.ubicacion}
                </option>
              ))}
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

          {/* Filtro de Tipo de Entorno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Entorno
            </label>
            <select
              name="tipo_entorno"
              value={filtros.tipo_entorno}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="urbano">Urbano</option>
              <option value="rural">Rural</option>
            </select>
          </div>

          {/* Filtro de Registros por página */}
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
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
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
          {Object.values(filtros).filter(v => v && v !== 1 && v !== 50 && v !== 'lectura_datetime' && v !== 'DESC').length > 0 && (
            <span>
              ✓ {Object.values(filtros).filter(v => v && v !== 1 && v !== 50 && v !== 'lectura_datetime' && v !== 'DESC').length} filtro(s) activo(s)
            </span>
          )}
        </div>
      </div>

      {/* Contenido: Tabla o Tarjetas */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {vistaActual === 'tabla' ? (
        /* VISTA DE TABLA */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => cambiarOrden('lectura_datetime')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Fecha/Hora {filtros.sort_by === 'lectura_datetime' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
                  </th>
                  <th 
                    onClick={() => cambiarOrden('sensor_id')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Sensor {filtros.sort_by === 'sensor_id' && (filtros.sort_order === 'DESC' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lecturas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No hay lecturas que coincidan con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  lecturas.map((lectura) => (
                    <tr key={lectura.id_lectura} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="text-gray-900">
                          {new Date(lectura.lectura_datetime).toLocaleDateString('es-PE')}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(lectura.lectura_datetime).toLocaleTimeString('es-PE')}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lectura.sensor_id}</div>
                        <div className="text-xs text-gray-500">{lectura.tipo_entorno}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {lectura.ubicacion || 'N/A'}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA DE TARJETAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lecturas.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No hay lecturas que coincidan con los filtros seleccionados
            </div>
          ) : (
            lecturas.map((lectura) => (
              <div key={lectura.id_lectura} className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lectura.sensor_id}</h3>
                    <p className="text-sm text-gray-500">{lectura.ubicacion}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    lectura.tipo_entorno === 'urbano' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {lectura.tipo_entorno}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">🌡️ Temperatura:</span>
                    <span className="text-sm font-medium">{lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">💧 Humedad:</span>
                    <span className="text-sm font-medium">{lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">🌫️ CO₂:</span>
                    <span className="text-sm font-medium">{lectura.co2_nivel ? `${lectura.co2_nivel} ppm` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">☁️ CO:</span>
                    <span className="text-sm font-medium">{lectura.co_nivel ? `${parseFloat(lectura.co_nivel).toFixed(1)} ppm` : 'N/A'}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 border-t pt-2">
                  📅 {new Date(lectura.lectura_datetime).toLocaleString('es-PE')}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
                  // Mostrar solo algunas páginas alrededor de la actual
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
                        }`}>
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