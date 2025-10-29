import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPinIcon, 
  FireIcon, 
  CloudIcon, 
  ExclamationTriangleIcon, 
  MapIcon,
  BookmarkIcon,
  CalendarIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { recorridosAPI } from '../../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12]
  });
};

const fijoIcon = createCustomIcon('#3B82F6');
const movilIcon = createCustomIcon('#8B5CF6');

const zonasPoligonos = {
  urbana: {
    nombre: 'Zona Urbana',
    color: '#3B82F6',
    fillColor: '#3B82F6',
    coordenadas: [
      [-3.7450, -73.2600],
      [-3.7450, -73.2480],
      [-3.7530, -73.2480],
      [-3.7530, -73.2600]
    ],
    descripcion: 'Área urbana de Iquitos'
  },
  rural: {
    nombre: 'Zona Rural',
    color: '#10B981',
    fillColor: '#10B981',
    coordenadas: [
      [-3.7200, -73.3100],
      [-3.7200, -73.2900],
      [-3.7400, -73.2900],
      [-3.7400, -73.3100]
    ],
    descripcion: 'Área rural con vegetación'
  }
};

export default function MapView({ lecturas, lecturasUnicas }) {
  const [tipoMapa, setTipoMapa] = useState('sensores');
  const center = [-3.7491, -73.2538];

  // ✅ Estados para recorridos por fecha
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sensorRecorrido, setSensorRecorrido] = useState('todos'); // ✅ Por defecto "todos"
  const [recorridosDia, setRecorridosDia] = useState({}); // ✅ Objeto con múltiples sensores
  const [metadataRecorrido, setMetadataRecorrido] = useState(null);
  const [sensoresMoviles, setSensoresMoviles] = useState([]);
  const [recorridosGuardados, setRecorridosGuardados] = useState([]);
  const [modalGuardar, setModalGuardar] = useState(false);
  const [modalListado, setModalListado] = useState(false); // ✅ Nuevo modal para ver guardados
  const [nombreRecorrido, setNombreRecorrido] = useState('');

  // Obtener sensores móviles
  useEffect(() => {
    const moviles = [...new Set(
      lecturas
        .filter(l => l.is_movil && l.latitud && l.longitud)
        .map(l => l.id_sensor)
    )];
    setSensoresMoviles(moviles);
  }, [lecturas]);

  // Cargar recorrido por fecha
  useEffect(() => {
    if (tipoMapa === 'recorridos' && fechaSeleccionada) {
      cargarRecorridosFecha();
    }
  }, [tipoMapa, sensorRecorrido, fechaSeleccionada]);

  //Autorefrescar cada 30 secs
  useEffect(() => {
  if (tipoMapa === 'recorridos' && fechaSeleccionada === new Date().toISOString().split('T')[0]) {
    const interval = setInterval(() => {
      console.log('🔄 Actualizando recorridos en tiempo real...');
      cargarRecorridosFecha();
    }, 3000);

    return () => clearInterval(interval);
  }
}, [tipoMapa, fechaSeleccionada, sensoresMoviles]);

  const cargarRecorridosFecha = async () => {
    try {
      if (sensorRecorrido === 'todos') {
        // ✅ Cargar recorridos de TODOS los sensores móviles
        const promesas = sensoresMoviles.map(id => 
          recorridosAPI.obtenerPorFecha(id, fechaSeleccionada)
        );
        
        const respuestas = await Promise.all(promesas);
        const recorridosObj = {};
        let totalPuntos = 0;
        let totalDistancia = 0;

        respuestas.forEach((res, idx) => {
          if (res.data.success && res.data.data.length > 0) {
            const sensorId = sensoresMoviles[idx];
            recorridosObj[sensorId] = res.data.data;
            if (res.data.metadata) {
              totalPuntos += res.data.metadata.total_puntos;
              totalDistancia += parseFloat(res.data.metadata.distancia_km);
            }
          }
        });

        setRecorridosDia(recorridosObj);
        
        if (Object.keys(recorridosObj).length > 0) {
          setMetadataRecorrido({
            total_sensores: Object.keys(recorridosObj).length,
            total_puntos: totalPuntos,
            distancia_km: totalDistancia.toFixed(2)
          });
        } else {
          setMetadataRecorrido(null);
        }

      } else {
        // ✅ Cargar recorrido de UN sensor específico
        const response = await recorridosAPI.obtenerPorFecha(sensorRecorrido, fechaSeleccionada);
        if (response.data.success && response.data.data.length > 0) {
          setRecorridosDia({ [sensorRecorrido]: response.data.data });
          setMetadataRecorrido(response.data.metadata);
        } else {
          setRecorridosDia({});
          setMetadataRecorrido(null);
        }
      }
    } catch (error) {
      console.error('Error al cargar recorrido:', error);
      setRecorridosDia({});
      setMetadataRecorrido(null);
    }
  };

  // Guardar recorrido
  const guardarRecorrido = async () => {
    if (!nombreRecorrido.trim()) {
      alert('Ingresa un nombre para el recorrido');
      return;
    }

    if (Object.keys(recorridosDia).length === 0) {
      alert('No hay datos de recorrido para guardar');
      return;
    }

    if (sensorRecorrido === 'todos') {
      alert('Selecciona un sensor específico para guardar el recorrido');
      return;
    }

    try {
      const puntos = recorridosDia[sensorRecorrido];
      
      await recorridosAPI.guardar({
        id_sensor: sensorRecorrido,
        nombre_recorrido: nombreRecorrido,
        fecha_recorrido: fechaSeleccionada,
        hora_inicio: puntos[0].lectura_datetime,
        hora_fin: puntos[puntos.length - 1].lectura_datetime,
        puntos: puntos.map(p => ({
          latitud: parseFloat(p.latitud),
          longitud: parseFloat(p.longitud),
          timestamp: p.lectura_datetime,
          temperatura: p.temperatura,
          humedad: p.humedad
        })),
        metadata: metadataRecorrido
      });

      alert('✅ Recorrido guardado exitosamente');
      setModalGuardar(false);
      setNombreRecorrido('');
      cargarRecorridosGuardados();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el recorrido');
    }
  };

  // Cargar lista de recorridos guardados
  const cargarRecorridosGuardados = async () => {
    try {
      const params = sensorRecorrido !== 'todos' ? { id_sensor: sensorRecorrido } : {};
      const response = await recorridosAPI.listar(params);
      if (response.data.success) {
        setRecorridosGuardados(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar guardados:', error);
    }
  };

  // Eliminar recorrido guardado
  const eliminarRecorrido = async (id, nombre) => {
    if (!confirm(`¿Eliminar el recorrido "${nombre}"?`)) return;
    
    try {
      await recorridosAPI.eliminar(id);
      alert('✅ Recorrido eliminado');
      cargarRecorridosGuardados();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el recorrido');
    }
  };

  useEffect(() => {
    if (tipoMapa === 'recorridos') {
      cargarRecorridosGuardados();
    }
  }, [tipoMapa, sensorRecorrido]);

  const getColorByTemp = (temp) => {
    if (!temp) return '#808080';
    if (temp < 18) return '#3B82F6';
    if (temp < 22) return '#10B981';
    if (temp < 26) return '#F59E0B';
    if (temp < 30) return '#EF4444';
    return '#7C2D12';
  };

  const getRadiusByTemp = (temp) => {
    if (!temp) return 50;
    return 50 + (temp * 10);
  };

  const getColorByCO2 = (co2) => {
    if (!co2) return '#808080';
    if (co2 < 600) return '#10B981';
    if (co2 < 800) return '#F59E0B';
    if (co2 < 1000) return '#FB923C';
    if (co2 < 1500) return '#EF4444';
    return '#7C2D12';
  };

  const getRadiusByCO2 = (co2) => {
    if (!co2) return 50;
    return 50 + (co2 * 0.05);
  };

  const getColorByCO = (co) => {
    if (!co) return '#808080';
    if (co < 4) return '#10B981';
    if (co < 9) return '#F59E0B';
    if (co < 25) return '#FB923C';
    if (co < 50) return '#EF4444';
    return '#7C2D12';
  };

  const getRadiusByCO = (co) => {
    if (!co) return 50;
    return 50 + (co * 15);
  };

  const coloresRecorrido = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F97316'];

  const tiposMapa = [
    { id: 'sensores', nombre: 'Sensores', icono: MapPinIcon },
    { id: 'recorridos', nombre: 'Recorridos', icono: CalendarIcon },
    { id: 'calor-temp', nombre: 'Temp', icono: FireIcon },
    { id: 'calor-co2', nombre: 'CO₂', icono: CloudIcon },
    { id: 'calor-co', nombre: 'CO', icono: ExclamationTriangleIcon },
    { id: 'zonas', nombre: 'Zonas', icono: MapIcon }
  ];

  const contarSensoresPorZona = () => {
    const urbanos = lecturasUnicas.filter(l => l.zona === 'Urbana').length;
    const rurales = lecturasUnicas.filter(l => l.zona === 'Rural').length;
    return { urbanos, rurales };
  };

  // ✅ Visualizar recorrido guardado en el mapa
  const visualizarRecorrido = async (recorrido) => {
    try {
      // Obtener el recorrido completo con puntos
      const response = await recorridosAPI.obtenerPorId(recorrido.id_recorrido);
      
      if (response.data.success) {
        const datosCompletos = response.data.data;
        
        // Configurar el mapa para mostrar este recorrido
        setSensorRecorrido(datosCompletos.id_sensor);
        setFechaSeleccionada(datosCompletos.fecha_recorrido.split('T')[0]);
        
        // Cargar el recorrido desde la API original (por fecha)
        // Esto garantiza compatibilidad con el sistema actual
        setModalListado(false);
        
        // Notificar al usuario
        setTimeout(() => {
          alert(`✅ Visualizando: ${datosCompletos.nombre_recorrido}\n\nSensor: ${datosCompletos.id_sensor}\nFecha: ${new Date(datosCompletos.fecha_recorrido).toLocaleDateString('es-PE')}`);
        }, 300);
      }
    } catch (error) {
      console.error('Error al visualizar:', error);
      alert('Error al cargar el recorrido');
    }
  };

  // ✅ Descargar recorrido como CSV
  const descargarRecorridoCSV = async (recorrido) => {
    try {
      const response = await recorridosAPI.obtenerPorId(recorrido.id_recorrido);
      
      if (response.data.success) {
        const datos = response.data.data;
        const puntos = datos.puntos_geojson;

        // Crear CSV
        const headers = ['Timestamp', 'Latitud', 'Longitud', 'Temperatura (°C)', 'Humedad (%)', 'CO2 (ppm)', 'CO (ppm)'];
        const rows = puntos.map(p => [
          p.timestamp ? new Date(p.timestamp).toLocaleString('es-PE') : '',
          p.latitud || '',
          p.longitud || '',
          p.temperatura || '',
          p.humedad || '',
          p.co2_nivel || '',
          p.co_nivel || ''
        ]);

        const csvContent = [
          `Recorrido: ${datos.nombre_recorrido}`,
          `Sensor: ${datos.id_sensor}`,
          `Fecha: ${new Date(datos.fecha_recorrido).toLocaleDateString('es-PE')}`,
          `Distancia: ${datos.distancia_km} km`,
          `Duración: ${datos.duracion_minutos} minutos`,
          '',
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        // Descargar
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recorrido_${datos.id_sensor}_${datos.fecha_recorrido.split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        alert('✅ Archivo CSV descargado');
      }
    } catch (error) {
      console.error('Error al descargar CSV:', error);
      alert('Error al descargar el archivo');
    }
  };

  // ✅ Descargar recorrido como GPX (formato para GPS)
  const descargarRecorridoGPX = async (recorrido) => {
    try {
      const response = await recorridosAPI.obtenerPorId(recorrido.id_recorrido);
      
      if (response.data.success) {
        const datos = response.data.data;
        const puntos = datos.puntos_geojson;

        // Crear GPX
        const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Sistema de Monitoreo Ambiental" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${datos.nombre_recorrido}</name>
    <desc>Sensor: ${datos.id_sensor} - Fecha: ${new Date(datos.fecha_recorrido).toLocaleDateString('es-PE')}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${datos.nombre_recorrido}</name>
    <desc>Distancia: ${datos.distancia_km} km - Duración: ${datos.duracion_minutos} min</desc>
    <trkseg>
${puntos.map(p => `      <trkpt lat="${p.latitud}" lon="${p.longitud}">
        ${p.altitud ? `<ele>${p.altitud}</ele>` : ''}
        ${p.timestamp ? `<time>${new Date(p.timestamp).toISOString()}</time>` : ''}
        ${p.temperatura ? `<extensions><temp>${p.temperatura}</temp></extensions>` : ''}
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`;

        // Descargar
        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recorrido_${datos.id_sensor}_${datos.fecha_recorrido.split('T')[0]}.gpx`;
        link.click();
        window.URL.revokeObjectURL(url);

        alert('✅ Archivo GPX descargado\n\nPuedes abrir este archivo en Google Earth, GPS o apps de mapas');
      }
    } catch (error) {
      console.error('Error al descargar GPX:', error);
      alert('Error al descargar el archivo');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Mapa Ambiental Interactivo</h2>
        
        <div className="flex flex-wrap gap-2">
          {tiposMapa.map((tipo) => {
            const Icon = tipo.icono;
            return (
              <button
                key={tipo.id}
                onClick={() => setTipoMapa(tipo.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  tipoMapa === tipo.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tipo.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ Controles de Recorridos Diarios */}
      {tipoMapa === 'recorridos' && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sensor
              </label>
              <select
                value={sensorRecorrido}
                onChange={(e) => setSensorRecorrido(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="todos">🔍 Todos los sensores</option>
                {sensoresMoviles.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Recorrido
              </label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setModalGuardar(true)}
                disabled={Object.keys(recorridosDia).length === 0 || sensorRecorrido === 'todos'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                title={sensorRecorrido === 'todos' ? 'Selecciona un sensor específico' : ''}
              >
                <BookmarkIcon className="w-5 h-5" />
                <span>Guardar</span>
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setModalListado(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <BookmarkIcon className="w-5 h-5" />
                <span>Ver Guardados ({recorridosGuardados.length})</span>
              </button>
            </div>
          </div>

          {metadataRecorrido && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              {sensorRecorrido === 'todos' ? (
                <>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metadataRecorrido.total_sensores}
                    </div>
                    <div className="text-gray-600">Sensores</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metadataRecorrido.total_puntos}
                    </div>
                    <div className="text-gray-600">Puntos Total</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {metadataRecorrido.distancia_km} km
                    </div>
                    <div className="text-gray-600">Distancia Total</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metadataRecorrido.total_puntos}
                    </div>
                    <div className="text-gray-600">Puntos</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metadataRecorrido.distancia_km} km
                    </div>
                    <div className="text-gray-600">Distancia</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {metadataRecorrido.duracion_minutos} min
                    </div>
                    <div className="text-gray-600">Duración</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(metadataRecorrido.hora_inicio).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'})}
                      {' - '}
                      {new Date(metadataRecorrido.hora_fin).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                    <div className="text-gray-600">Horario</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* MAPA DE SENSORES */}
          {tipoMapa === 'sensores' && lecturasUnicas.map((lectura, index) => {
            if (lectura.latitud && lectura.longitud) {
              const icon = lectura.is_movil ? movilIcon : fijoIcon;
              return (
                <Marker 
                  key={`sensor-${index}`} 
                  position={[lectura.latitud, lectura.longitud]}
                  icon={icon}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{lectura.id_sensor}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          lectura.is_movil ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lectura.is_movil ? 'Móvil' : 'Fijo'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Temp:</span> <span className="font-medium">{lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}</span></p>
                        <p><span className="text-gray-600">Humedad:</span> <span className="font-medium">{lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A'}</span></p>
                        <p><span className="text-gray-600">CO₂:</span> <span className="font-medium">{lectura.co2_nivel ? `${lectura.co2_nivel} ppm` : 'N/A'}</span></p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}

          {/* ✅ RECORRIDOS DEL DÍA (uno o varios sensores) */}
          {tipoMapa === 'recorridos' && Object.entries(recorridosDia).map(([sensorId, puntos], idx) => {
            if (puntos.length === 0) return null;
            
            const color = coloresRecorrido[idx % coloresRecorrido.length];
            const positions = puntos.map(p => [parseFloat(p.latitud), parseFloat(p.longitud)]);

            return (
              <div key={`recorrido-${sensorId}`}>
                <Polyline 
                  positions={positions} 
                  color={color}
                  weight={4}
                  opacity={0.8}
                />
                
                {/* Inicio */}
                <Marker 
                  position={positions[0]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">I</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold" style={{color}}>{sensorId}</h3>
                      <p className="text-sm font-medium">Inicio</p>
                      <p className="text-xs">{new Date(puntos[0].lectura_datetime).toLocaleTimeString('es-PE')}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Fin */}
                <Marker 
                  position={positions[positions.length - 1]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">F</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold" style={{color}}>{sensorId}</h3>
                      <p className="text-sm font-medium">Fin</p>
                      <p className="text-xs">{new Date(puntos[puntos.length - 1].lectura_datetime).toLocaleTimeString('es-PE')}</p>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}

          {/* MAPAS DE CALOR */}
          {tipoMapa === 'calor-temp' && lecturasUnicas.map((lectura, index) => {
            if (lectura.latitud && lectura.longitud && lectura.temperatura) {
              const color = getColorByTemp(parseFloat(lectura.temperatura));
              const radius = getRadiusByTemp(parseFloat(lectura.temperatura));
              
              return (
                <Circle
                  key={`calor-temp-${index}`}
                  center={[lectura.latitud, lectura.longitud]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 2,
                    opacity: 0.8
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{lectura.id_sensor}</h3>
                      <p className="text-lg font-bold" style={{ color: color }}>
                        {parseFloat(lectura.temperatura).toFixed(1)}°C
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {tipoMapa === 'calor-co2' && lecturasUnicas.map((lectura, index) => {
            if (lectura.latitud && lectura.longitud && lectura.co2_nivel) {
              const co2Value = parseInt(lectura.co2_nivel);
              const color = getColorByCO2(co2Value);
              const radius = getRadiusByCO2(co2Value);
              
              return (
                <Circle
                  key={`calor-co2-${index}`}
                  center={[lectura.latitud, lectura.longitud]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 2,
                    opacity: 0.8
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{lectura.id_sensor}</h3>
                      <p className="text-lg font-bold" style={{ color: color }}>
                        {co2Value} ppm
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {tipoMapa === 'calor-co' && lecturasUnicas.map((lectura, index) => {
            if (lectura.latitud && lectura.longitud && lectura.co_nivel) {
              const coValue = parseFloat(lectura.co_nivel);
              const color = getColorByCO(coValue);
              const radius = getRadiusByCO(coValue);
              
              return (
                <Circle
                  key={`calor-co-${index}`}
                  center={[lectura.latitud, lectura.longitud]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 2,
                    opacity: 0.8
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{lectura.id_sensor}</h3>
                      <p className="text-lg font-bold" style={{ color: color }}>
                        {coValue.toFixed(1)} ppm
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {/* ZONAS */}
          {tipoMapa === 'zonas' && (
            <>
              <Polygon
                positions={zonasPoligonos.urbana.coordenadas}
                pathOptions={{
                  color: zonasPoligonos.urbana.color,
                  fillColor: zonasPoligonos.urbana.fillColor,
                  fillOpacity: 0.2,
                  weight: 3
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-blue-700">{zonasPoligonos.urbana.nombre}</h3>
                    <p className="text-sm mt-1">{zonasPoligonos.urbana.descripcion}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Sensores activos: {contarSensoresPorZona().urbanos}
                    </p>
                  </div>
                </Popup>
              </Polygon>

              <Polygon
                positions={zonasPoligonos.rural.coordenadas}
                pathOptions={{
                  color: zonasPoligonos.rural.color,
                  fillColor: zonasPoligonos.rural.fillColor,
                  fillOpacity: 0.2,
                  weight: 3
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-green-700">{zonasPoligonos.rural.nombre}</h3>
                    <p className="text-sm mt-1">{zonasPoligonos.rural.descripcion}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Sensores activos: {contarSensoresPorZona().rurales}
                    </p>
                  </div>
                </Popup>
              </Polygon>

              {lecturasUnicas.map((lectura, index) => {
                if (lectura.latitud && lectura.longitud) {
                  const icon = lectura.is_movil ? movilIcon : fijoIcon;
                  return (
                    <Marker 
                      key={`zona-sensor-${index}`} 
                      position={[lectura.latitud, lectura.longitud]}
                      icon={icon}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{lectura.id_sensor}</h3>
                          <p className="text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              lectura.zona === 'Urbana' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {lectura.zona}
                            </span>
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </>
          )}
        </MapContainer>
      </div>

      {/* Leyendas */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        {tipoMapa === 'sensores' && (
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
              <span className="text-gray-700">Sensor Fijo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow"></div>
              <span className="text-gray-700">Sensor Móvil</span>
            </div>
          </div>
        )}

        {tipoMapa === 'recorridos' && (
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">Recorridos del {fechaSeleccionada.split('-').reverse().join('/')}</p>
            <p className="text-xs mt-1">
              {sensorRecorrido === 'todos' 
                ? `Mostrando ${Object.keys(recorridosDia).length} sensores con recorrido`
                : 'Selecciona "Todos" para ver múltiples sensores'
              }
            </p>
          </div>
        )}

        {tipoMapa === 'calor-temp' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">Escala de Temperatura</p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                <span>&lt;18°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span>18-22°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <span>22-26°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <span>26-30°C</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7C2D12' }}></div>
                <span>&gt;30°C</span>
              </div>
            </div>
          </div>
        )}

        {tipoMapa === 'calor-co2' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">Escala de CO₂</p>
            <div className="flex items-center justify-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span>&lt;600 ppm</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <span>600-800</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FB923C' }}></div>
                <span>800-1000</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <span>1000-1500</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7C2D12' }}></div>
                <span>&gt;1500</span>
              </div>
            </div>
          </div>
        )}

        {tipoMapa === 'calor-co' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">Escala de CO</p>
            <div className="flex items-center justify-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span>&lt;4 ppm</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <span>4-9</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FB923C' }}></div>
                <span>9-25</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <span>25-50</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7C2D12' }}></div>
                <span>&gt;50</span>
              </div>
            </div>
          </div>
        )}

        {tipoMapa === 'zonas' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2 text-center">Delimitación de Zonas</p>
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-4 border-2" style={{ borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
                <div>
                  <span className="font-medium text-blue-700">Zona Urbana</span>
                  <span className="text-gray-600 ml-2">({contarSensoresPorZona().urbanos} sensores)</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-4 border-2" style={{ borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' }}></div>
                <div>
                  <span className="font-medium text-green-700">Zona Rural</span>
                  <span className="text-gray-600 ml-2">({contarSensoresPorZona().rurales} sensores)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal para Guardar Recorrido - CON Z-INDEX ALTO */}
      {modalGuardar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Guardar Recorrido</h3>
              <button
                onClick={() => {
                  setModalGuardar(false);
                  setNombreRecorrido('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Recorrido
              </label>
              <input
                type="text"
                value={nombreRecorrido}
                onChange={(e) => setNombreRecorrido(e.target.value)}
                placeholder="Ej: Recorrido Matutino - Centro"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <p><span className="font-medium">Sensor:</span> {sensorRecorrido}</p>
              <p><span className="font-medium">Fecha:</span> {new Date(fechaSeleccionada).toLocaleDateString('es-PE')}</p>
              {recorridosDia[sensorRecorrido] && (
                <>
                  <p><span className="font-medium">Puntos:</span> {recorridosDia[sensorRecorrido].length}</p>
                  {metadataRecorrido && (
                    <>
                      <p><span className="font-medium">Distancia:</span> {metadataRecorrido.distancia_km} km</p>
                      <p><span className="font-medium">Duración:</span> {metadataRecorrido.duracion_minutos} min</p>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setModalGuardar(false);
                  setNombreRecorrido('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={guardarRecorrido}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal para Ver Recorridos Guardados */}
      {modalListado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recorridos Guardados ({recorridosGuardados.length})</h3>
              <button
                onClick={() => setModalListado(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {recorridosGuardados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookmarkIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p>No hay recorridos guardados</p>
                <p className="text-sm mt-1">Guarda un recorrido para verlo aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recorridosGuardados.map(r => (
                  <div key={r.id_recorrido} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">{r.nombre_recorrido}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Guardado el {new Date(r.created_at).toLocaleString('es-PE')}
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarRecorrido(r.id_recorrido, r.nombre_recorrido)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar recorrido"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500 text-xs">Sensor</p>
                        <p className="font-semibold text-gray-900">{r.id_sensor}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500 text-xs">Fecha</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(r.fecha_recorrido).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500 text-xs">Distancia</p>
                        <p className="font-semibold text-blue-600">{r.distancia_km} km</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500 text-xs">Duración</p>
                        <p className="font-semibold text-green-600">{r.duracion_minutos} min</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500 text-xs">Puntos</p>
                        <p className="font-semibold text-purple-600">{r.total_puntos}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500 text-xs">Horario</p>
                        <p className="font-semibold text-gray-900 text-xs">
                          {new Date(r.hora_inicio).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'})}
                          {' - '}
                          {new Date(r.hora_fin).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => visualizarRecorrido(r)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm"
                      >
                        <MapIcon className="w-4 h-4" />
                        <span>Ver en Mapa</span>
                      </button>
                      <button
                        onClick={() => descargarRecorridoCSV(r)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>📥</span>
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={() => descargarRecorridoGPX(r)}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2 text-sm"
                      >
                        <span>🗺️</span>
                        <span>GPX</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setModalListado(false)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 text-center text-xs text-gray-500">
        {tipoMapa === 'sensores' && `${lecturasUnicas.filter(l => l.latitud && l.longitud).length} sensores visibles`}
        {tipoMapa === 'recorridos' && Object.keys(recorridosDia).length > 0 && (
          sensorRecorrido === 'todos' 
            ? `${Object.keys(recorridosDia).length} sensores con recorrido` 
            : `${recorridosDia[sensorRecorrido]?.length || 0} puntos del recorrido`
        )}
        {tipoMapa === 'calor-temp' && `${lecturasUnicas.filter(l => l.latitud && l.longitud && l.temperatura).length} puntos de temperatura`}
        {tipoMapa === 'calor-co2' && `${lecturasUnicas.filter(l => l.latitud && l.longitud && l.co2_nivel).length} puntos de CO₂`}
        {tipoMapa === 'calor-co' && `${lecturasUnicas.filter(l => l.latitud && l.longitud && l.co_nivel).length} puntos de CO`}
        {tipoMapa === 'zonas' && `${lecturasUnicas.length} sensores distribuidos en ${Object.keys(zonasPoligonos).length} zonas`}
      </div>
    </div>
  );
}