import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPinIcon, ArrowPathIcon, FireIcon, CloudIcon, ExclamationTriangleIcon, MapIcon } from '@heroicons/react/24/outline';

// Fix del icono de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados
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

// Definir zonas con polígonos (coordenadas de ejemplo para Iquitos)
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
    descripcion: 'Área urbana de Iquitos con mayor densidad poblacional'
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
    descripcion: 'Área rural con vegetación y menor densidad poblacional'
  }
};

export default function MapView({ lecturas, lecturasUnicas }) {
  const [tipoMapa, setTipoMapa] = useState('sensores');
  const [recorridos, setRecorridos] = useState({});
  const center = [-3.7491, -73.2538];

  useEffect(() => {
    if (tipoMapa === 'recorridos' && lecturas.length > 0) {
      const recorridosPorSensor = {};
      
      lecturas.forEach(lectura => {
        if (lectura.is_movil && lectura.latitud && lectura.longitud) {
          if (!recorridosPorSensor[lectura.id_sensor]) {
            recorridosPorSensor[lectura.id_sensor] = [];
          }
          recorridosPorSensor[lectura.id_sensor].push({
            position: [lectura.latitud, lectura.longitud],
            timestamp: lectura.lectura_datetime,
            data: lectura
          });
        }
      });

      Object.keys(recorridosPorSensor).forEach(sensorId => {
        recorridosPorSensor[sensorId].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });

      setRecorridos(recorridosPorSensor);
    }
  }, [tipoMapa, lecturas]);

  // Funciones de color por temperatura
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

  // Funciones de color por CO2
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

  // Funciones de color por CO
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

  const coloresRecorrido = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  const tiposMapa = [
    { id: 'sensores', nombre: 'Sensores', icono: MapPinIcon, descripcion: 'Vista de todos los sensores' },
    { id: 'recorridos', nombre: 'Recorridos', icono: ArrowPathIcon, descripcion: 'Trayectorias de sensores móviles' },
    { id: 'calor-temp', nombre: 'Temp', icono: FireIcon, descripcion: 'Mapa de calor por temperatura' },
    { id: 'calor-co2', nombre: 'CO₂', icono: CloudIcon, descripcion: 'Mapa de calor por dióxido de carbono' },
    { id: 'calor-co', nombre: 'CO', icono: ExclamationTriangleIcon, descripcion: 'Mapa de calor por monóxido de carbono' },
    { id: 'zonas', nombre: 'Zonas', icono: MapIcon, descripcion: 'Delimitación de zonas urbanas y rurales' }
  ];

  // Contar sensores por zona
  const contarSensoresPorZona = () => {
    const urbanos = lecturasUnicas.filter(l => l.zona === 'Urbana').length;
    const rurales = lecturasUnicas.filter(l => l.zona === 'Rural').length;
    return { urbanos, rurales };
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
                title={tipo.descripcion}
              >
                <Icon className="w-5 h-5" />
                <span>{tipo.nombre}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-sm text-gray-600">
          {tiposMapa.find(t => t.id === tipoMapa)?.descripcion}
        </p>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
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
                        <p className="flex justify-between">
                          <span className="text-gray-600">Zona:</span>
                          <span className="font-medium">{lectura.zona}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Temperatura:</span>
                          <span className="font-medium">{lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">Humedad:</span>
                          <span className="font-medium">{lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">CO₂:</span>
                          <span className="font-medium">{lectura.co2_nivel ? `${lectura.co2_nivel} ppm` : 'N/A'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-600">CO:</span>
                          <span className="font-medium">{lectura.co_nivel ? `${parseFloat(lectura.co_nivel).toFixed(1)} ppm` : 'N/A'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                          {lectura.lectura_datetime 
                            ? new Date(lectura.lectura_datetime).toLocaleString('es-PE')
                            : 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}

          {/* MAPA DE RECORRIDOS */}
          {tipoMapa === 'recorridos' && Object.entries(recorridos).map(([sensorId, puntos], idx) => {
            if (puntos.length < 2) return null;
            
            const color = coloresRecorrido[idx % coloresRecorrido.length];
            const positions = puntos.map(p => p.position);

            return (
              <div key={`recorrido-${sensorId}`}>
                <Polyline 
                  positions={positions} 
                  color={color}
                  weight={3}
                  opacity={0.7}
                />
                
                <Marker 
                  position={positions[0]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">I</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-purple-700">{sensorId}</h3>
                      <p className="text-sm font-medium">Punto de inicio</p>
                      <p className="text-xs text-gray-500">
                        {new Date(puntos[0].timestamp).toLocaleString('es-PE')}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                <Marker 
                  position={positions[positions.length - 1]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">F</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-purple-700">{sensorId}</h3>
                      <p className="text-sm font-medium">Ubicación actual</p>
                      <p className="text-xs">Temp: {puntos[puntos.length - 1].data.temperatura}°C</p>
                      <p className="text-xs text-gray-500">
                        {new Date(puntos[puntos.length - 1].timestamp).toLocaleString('es-PE')}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {puntos.slice(1, -1).map((punto, pIdx) => (
                  <Circle
                    key={`punto-${sensorId}-${pIdx}`}
                    center={punto.position}
                    radius={5}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm">{sensorId}</h3>
                        <p className="text-xs">Punto intermedio {pIdx + 1}</p>
                        <p className="text-xs">Temp: {punto.data.temperatura}°C</p>
                        <p className="text-xs text-gray-500">
                          {new Date(punto.timestamp).toLocaleString('es-PE')}
                        </p>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </div>
            );
          })}

          {/* MAPA DE CALOR - TEMPERATURA */}
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
                      <p className="text-xs text-gray-600">Zona: {lectura.zona}</p>
                      <p className="text-xs text-gray-500">
                        {lectura.lectura_datetime 
                          ? new Date(lectura.lectura_datetime).toLocaleString('es-PE')
                          : 'Sin fecha'}
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {/* MAPA DE CALOR - CO2 */}
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
                      <p className="text-xs font-medium">Dióxido de Carbono (CO₂)</p>
                      <p className="text-xs text-gray-600">Zona: {lectura.zona}</p>
                      <p className="text-xs text-gray-500">
                        {lectura.lectura_datetime 
                          ? new Date(lectura.lectura_datetime).toLocaleString('es-PE')
                          : 'Sin fecha'}
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {/* MAPA DE CALOR - CO */}
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
                      <p className="text-xs font-medium">Monóxido de Carbono (CO)</p>
                      <p className="text-xs text-gray-600">Zona: {lectura.zona}</p>
                      <p className="text-xs text-gray-500">
                        {lectura.lectura_datetime 
                          ? new Date(lectura.lectura_datetime).toLocaleString('es-PE')
                          : 'Sin fecha'}
                      </p>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {/* MAPA DE ZONAS */}
          {tipoMapa === 'zonas' && (
            <>
              {/* Polígono Zona Urbana */}
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

              {/* Polígono Zona Rural */}
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

              {/* Marcadores de sensores sobre las zonas */}
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
                          <p className="text-xs mt-1">Temp: {lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A'}</p>
                          <p className="text-xs">CO₂: {lectura.co2_nivel ? `${lectura.co2_nivel} ppm` : 'N/A'}</p>
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

      {/* Leyenda */}
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
            <p className="font-medium">Trayectorias de sensores móviles</p>
            <p className="text-xs mt-1">
              <span className="font-semibold">I</span> = Inicio | 
              <span className="font-semibold"> F</span> = Ubicación actual | 
              <span className="font-semibold"> •</span> = Puntos intermedios
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

      <div className="mt-2 text-center text-xs text-gray-500">
        {tipoMapa === 'sensores' && `${lecturasUnicas.filter(l => l.latitud && l.longitud).length} sensores visibles`}
        {tipoMapa === 'recorridos' && `${Object.keys(recorridos).length} sensores móviles con recorrido`}
        {tipoMapa === 'calor-temp' && `${lecturasUnicas.filter(l => l.latitud && l.longitud && l.temperatura).length} puntos de temperatura`}
        {tipoMapa === 'calor-co2' && `${lecturasUnicas.filter(l => l.latitud && l.longitud && l.co2_nivel).length} puntos de CO₂`}
        {tipoMapa === 'calor-co' && `${lecturasUnicas.filter(l => l.latitud && l.longitud && l.co_nivel).length} puntos de CO`}
        {tipoMapa === 'zonas' && `${lecturasUnicas.length} sensores distribuidos en ${Object.keys(zonasPoligonos).length} zonas`}
      </div>
    </div>
  );
}