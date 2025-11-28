// simulador-sensores-mejorado.js
// Añadido soporte para api_key por cada sensor

const axios = require('axios');

// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_URL = 'http://localhost:3000/api/lecturas';
const INTERVALO_ENVIO = 3000; // 3 segundos

// ==========================================
// 🔐 API KEYS (Pegar manualmente aquí)
// ==========================================
// 1. Genera las API Keys en el sistema web (Gestión de API Keys).
// 2. Copia la API Key generada y pégala abajo asociada al ID del sensor que desees.
// 3. La primera vez que el simulador envíe datos, el sistema vinculará esa API Key al sensor automáticamente.
// Formato: api_key_por_sensor[sensor_id] = "API_KEY_GENERADA";

const api_key_por_sensor = {
  // PEGAR AQUÍ LAS API KEYS GENERADAS EN EL DASHBOARD
  "ESP32_001": "51215b6168ffb3977d6c0a16bb56ab5710809ff7d6cfd2a72a68ae5a8cd5f2a5",
  "ESP32_002": "6cd1894131ca05600b9627d1c54b09f2850258babda0748052b767358a7950d2",
  "ESP32_003": "2aeea133d13451697dac343298f12e862b3180af4c1d965760243e96dd688ea2",
  "ESP32_004": "8fe19914fcc17d004050e67c42c889cedcaa3ff97af54f1b1c27c111156a0c5b",
  "ESP32_005": "5f1b4c90692bb7bf18373930dc0a211617cacfda67384408cecdb07d8c83044f",
  "ESP32_006": "6fc2c0a4ba8941a7b326c569ec19d658cb60db498d2f08252f4dea23ec02752f"
};

// ==========================================
// DEFINICIÓN DE SENSORES
// ==========================================

// ==========================================
// DEFINICIÓN DE SENSORES (6 SENSORES)
// ==========================================

// SENSOR 1: FIJO (Plaza de Armas)
const SENSOR_FIJO = {
  id: 'ESP32_001',
  tipo_cliente: 'ESP32_GPRS',
  zona: 'Urbana',
  latBase: -3.74912,
  lonBase: -73.25383,
  is_movil: false,
  descripcion: 'Sensor Fijo - Plaza de Armas'
};

// SENSORES 2-6: MÓVILES (Vehículos / Personal)
const SENSORES_MOVILES = [
  {
    id: 'ESP32_002',
    tipo_cliente: 'ESP32_Movil',
    zona: 'Urbana',
    latBase: -3.75123,
    lonBase: -73.25789,
    is_movil: true,
    descripcion: 'Unidad Móvil 1 - Centro',
    velocidad_movimiento: 'media'
  },
  {
    id: 'ESP32_003',
    tipo_cliente: 'ESP32_Movil',
    zona: 'Urbana',
    latBase: -3.74500,
    lonBase: -73.25000,
    is_movil: true,
    descripcion: 'Unidad Móvil 2 - Norte',
    velocidad_movimiento: 'rapida'
  },
  {
    id: 'ESP32_004',
    tipo_cliente: 'ESP32_Movil',
    zona: 'Rural',
    latBase: -3.72045,
    lonBase: -73.30125,
    is_movil: true,
    descripcion: 'Unidad Móvil 3 - Ruta Sur',
    velocidad_movimiento: 'rapida'
  },
  {
    id: 'ESP32_005',
    tipo_cliente: 'ESP32_Movil',
    zona: 'Urbana',
    latBase: -3.74200,
    lonBase: -73.26000,
    is_movil: true,
    descripcion: 'Unidad Móvil 4 - Oeste',
    velocidad_movimiento: 'media'
  },
  {
    id: 'ESP32_006',
    tipo_cliente: 'ESP32_Movil',
    zona: 'Urbana',
    latBase: -3.75500,
    lonBase: -73.24500,
    is_movil: true,
    descripcion: 'Unidad Móvil 5 - Este',
    velocidad_movimiento: 'lenta'
  }
];

// ==========================================
// FUNCIONES
// ==========================================

function obtenerApiKey(sensorId) {
  const key = api_key_por_sensor[sensorId];
  if (!key) {
    console.log(`⚠️  ADVERTENCIA: El sensor '${sensorId}' NO tiene api_key definida`);
  }
  return key || "NO_KEY_DEFINED";
}

function generarDatosAmbientales(zona) {
  const esUrbano = zona === 'Urbana';
  return {
    temperatura: esUrbano ? 20 + Math.random() * 10 : 15 + Math.random() * 15,
    humedad: esUrbano ? 40 + Math.random() * 30 : 50 + Math.random() * 40,
    co2_nivel: esUrbano ? 400 + Math.floor(Math.random() * 400) : 350 + Math.floor(Math.random() * 250),
    co_nivel: esUrbano ? 1 + Math.random() * 6 : Math.random() * 3,
    altitud: 100 + Math.random() * 20
  };
}

// Estado global para movimiento continuo (simular rutas)
const rutas_estado = {};

function calcularVariacionCoordenadas(velocidad, is_movil, sensorId) {
  if (!is_movil) return { lat: (Math.random() - 0.5) * 0.00001, lon: (Math.random() - 0.5) * 0.00001 };

  // Inicializar estado si no existe
  if (!rutas_estado[sensorId]) {
    rutas_estado[sensorId] = {
      latDir: 0,
      lonDir: 0,
      steps: 1000 // Forzar cambio de dirección inicial
    };
  }

  const estado = rutas_estado[sensorId];

  // Cambiar dirección cada 30 pasos (simular una cuadra)
  if (estado.steps > 30) {
    // Escoger una dirección cardinal: N, S, E, O (Movimiento tipo "Manhattan")
    const direcciones = [
      { lat: 1, lon: 0 },  // Norte
      { lat: -1, lon: 0 }, // Sur
      { lat: 0, lon: 1 },  // Este
      { lat: 0, lon: -1 }  // Oeste
    ];
    const dir = direcciones[Math.floor(Math.random() * direcciones.length)];

    // Factor de escala para lat/lon (aprox 0.00015 grados ~ 16 metros)
    estado.latDir = dir.lat * 0.00015;
    estado.lonDir = dir.lon * 0.00015;
    estado.steps = 0;
  }
  estado.steps++;

  const factores = { lenta: 0.5, media: 1, rapida: 2 };
  const multiplicador = factores[velocidad] || 1;

  return {
    lat: estado.latDir * multiplicador,
    lon: estado.lonDir * multiplicador
  };
}

function aplicarAnomalias(datos, sensorId) {
  if (Math.random() < 0.15) {
    const tipo = Math.floor(Math.random() * 4);
    switch (tipo) {
      case 0: datos.temperatura = 35 + Math.random() * 5; break;
      case 1: datos.co2_nivel = 1000 + Math.random() * 500; break;
      case 2: datos.co_nivel = 9 + Math.random() * 3; break;
      case 3: datos.humedad = Math.random() < 0.5 ? 10 + Math.random() * 5 : 85 + Math.random() * 10; break;
    }
  }
  return datos;
}

// ==========================================
// ENVÍO DE DATOS (Incluye API KEY)
// ==========================================

async function simularSensorESP32(sensor) {
  try {
    const variacion = calcularVariacionCoordenadas(sensor.velocidad_movimiento || 'lenta', sensor.is_movil, sensor.id);

    // Actualizar base para que se "mueva" realmente en el mapa
    sensor.latBase += variacion.lat;
    sensor.lonBase += variacion.lon;

    let datos = generarDatosAmbientales(sensor.zona);
    datos = aplicarAnomalias(datos, sensor.id);

    const payload = {
      id_sensor: sensor.id,
      temperatura: Number(datos.temperatura.toFixed(2)),
      humedad: Number(datos.humedad.toFixed(2)),
      co2_nivel: datos.co2_nivel,
      co_nivel: Number(datos.co_nivel.toFixed(2)),
      latitud: Number((sensor.latBase).toFixed(8)),
      longitud: Number((sensor.lonBase).toFixed(8)),
      altitud: Number(datos.altitud.toFixed(2)),
      zona: sensor.zona
    };

    const api_key = obtenerApiKey(sensor.id);

    await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': sensor.tipo_cliente,
        'X-Device-Info': sensor.descripcion,
        'x-api-key': api_key
      }
    });

    console.log(`✅ [${sensor.tipo_cliente}] ${sensor.id}: Datos enviados`);
  } catch (err) {
    console.error(`❌ [${sensor.tipo_cliente}] ${sensor.id}: ${err.response?.status || err.message}`);
  }
}

async function cicloSimulacion() {
  console.log(`\n⏱️ ${new Date().toLocaleString('es-PE')}`);

  // Simular Sensor Fijo
  await simularSensorESP32(SENSOR_FIJO);

  // Simular Sensores Móviles
  for (const s of SENSORES_MOVILES) {
    await simularSensorESP32(s);
  }
}

axios.get('http://localhost:3000/api/health')
  .then(() => {
    console.log('API OK, iniciando simulación...');
    cicloSimulacion();
    setInterval(cicloSimulacion, INTERVALO_ENVIO);
  })
  .catch(err => {
    console.error('❌ No se pudo conectar con la API:', err.message);
  });
