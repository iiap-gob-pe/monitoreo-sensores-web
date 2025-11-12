// simulador-sensores-mejorado.js
// Script mejorado para simular diferentes tipos de clientes enviando datos a la API
// Simula: 1) Sensores ESP32 con GPRS/WiFi directo, 2) App móvil que recibe datos por Bluetooth

const axios = require('axios');

// ==========================================
// CONFIGURACIÓN
// ==========================================
const API_URL = 'http://localhost:3000/api/lecturas';
const INTERVALO_ENVIO = 3000; // 3 segundos

// ==========================================
// DEFINICIÓN DE SENSORES
// ==========================================

// TIPO 1: Sensores Fijos con GPRS/WiFi (envían datos directamente)
const SENSORES_FIJOS_GPRS = [
  {
    id: 'ESP32_GPRS_001',
    tipo_cliente: 'ESP32_GPRS',
    zona: 'Urbana',
    latBase: -3.74912,
    lonBase: -73.25383,
    is_movil: false,
    descripcion: 'Sensor fijo con GPRS - Plaza de Armas'
  },
  {
    id: 'ESP32_WIFI_002',
    tipo_cliente: 'ESP32_WiFi',
    zona: 'Urbana',
    latBase: -3.75123,
    lonBase: -73.25789,
    is_movil: false,
    descripcion: 'Sensor fijo con WiFi - Mercado Central'
  }
];

// TIPO 2: Sensores Móviles con GPRS/WiFi (envían datos directamente mientras se mueven)
const SENSORES_MOVILES_GPRS = [
  {
    id: 'ESP32_GPRS_MOBILE_001',
    tipo_cliente: 'ESP32_GPRS_Movil',
    zona: 'Urbana',
    latBase: -3.74500,
    lonBase: -73.25000,
    is_movil: true,
    descripcion: 'Sensor móvil con GPRS - Vehículo de monitoreo',
    velocidad_movimiento: 'media' // lenta, media, rapida
  }
];

// TIPO 3: App Móvil recibiendo datos de sensores por Bluetooth
const SENSORES_APP_MOVIL = [
  {
    id: 'MOBILE_APP_001',
    tipo_cliente: 'App_Movil_Android',
    zona: 'Rural',
    latBase: -3.72045,
    lonBase: -73.30125,
    is_movil: true,
    sensores_bluetooth: ['BT_SENSOR_A', 'BT_SENSOR_B'], // IDs de sensores conectados por BT
    descripcion: 'App móvil con 2 sensores Bluetooth',
    velocidad_movimiento: 'rapida'
  },
  {
    id: 'MOBILE_APP_002',
    tipo_cliente: 'App_Movil_iOS',
    zona: 'Rural',
    latBase: -3.71234,
    lonBase: -73.31456,
    is_movil: true,
    sensores_bluetooth: ['BT_SENSOR_C'],
    descripcion: 'App móvil iOS con 1 sensor Bluetooth',
    velocidad_movimiento: 'media'
  }
];

// ==========================================
// FUNCIONES DE GENERACIÓN DE DATOS
// ==========================================

// Generar datos ambientales realistas según la zona
function generarDatosAmbientales(zona) {
  const esUrbano = zona === 'Urbana';

  return {
    temperatura: esUrbano
      ? 20 + Math.random() * 10
      : 15 + Math.random() * 15,
    humedad: esUrbano
      ? 40 + Math.random() * 30
      : 50 + Math.random() * 40,
    co2_nivel: esUrbano
      ? 400 + Math.floor(Math.random() * 400)
      : 350 + Math.floor(Math.random() * 250),
    co_nivel: esUrbano
      ? 1 + Math.random() * 6
      : Math.random() * 3,
    altitud: 100 + Math.random() * 20
  };
}

// Calcular variación de coordenadas según velocidad de movimiento
function calcularVariacionCoordenadas(velocidad, is_movil) {
  if (!is_movil) {
    // Sensores fijos: variación mínima (deriva GPS natural)
    return {
      lat: (Math.random() - 0.5) * 0.00001, // ~1 metro
      lon: (Math.random() - 0.5) * 0.00001
    };
  }

  // Sensores móviles: variación según velocidad
  const factores = {
    'lenta': 0.0005,   // ~55 metros
    'media': 0.002,    // ~220 metros
    'rapida': 0.005    // ~550 metros
  };

  const factor = factores[velocidad] || factores['media'];

  return {
    lat: (Math.random() - 0.5) * factor,
    lon: (Math.random() - 0.5) * factor
  };
}

// Generar anomalías ocasionales (para disparar alertas)
function aplicarAnomalias(datos, sensorId) {
  // 15% de probabilidad de generar una anomalía
  if (Math.random() < 0.15) {
    const tipoAnomalia = Math.floor(Math.random() * 4);

    switch(tipoAnomalia) {
      case 0:
        datos.temperatura = 35 + Math.random() * 5;
        console.log(`   ⚠️  ${sensorId}: Temperatura alta - ${datos.temperatura.toFixed(2)}°C`);
        break;
      case 1:
        datos.co2_nivel = 1000 + Math.floor(Math.random() * 500);
        console.log(`   ⚠️  ${sensorId}: CO2 elevado - ${datos.co2_nivel} ppm`);
        break;
      case 2:
        datos.co_nivel = 9 + Math.random() * 3;
        console.log(`   ⚠️  ${sensorId}: CO alto - ${datos.co_nivel.toFixed(2)} ppm`);
        break;
      case 3:
        datos.humedad = Math.random() < 0.5 ? 10 + Math.random() * 5 : 85 + Math.random() * 10;
        console.log(`   ⚠️  ${sensorId}: Humedad extrema - ${datos.humedad.toFixed(2)}%`);
        break;
    }
  }

  return datos;
}

// ==========================================
// SIMULADORES POR TIPO DE CLIENTE
// ==========================================

// SIMULADOR 1: ESP32 con GPRS/WiFi (envío directo)
async function simularSensorESP32(sensor) {
  try {
    const variacion = calcularVariacionCoordenadas(
      sensor.velocidad_movimiento || 'lenta',
      sensor.is_movil
    );

    let datos = generarDatosAmbientales(sensor.zona);
    datos = aplicarAnomalias(datos, sensor.id);

    const payload = {
      id_sensor: sensor.id,
      temperatura: parseFloat(datos.temperatura.toFixed(2)),
      humedad: parseFloat(datos.humedad.toFixed(2)),
      co2_nivel: datos.co2_nivel,
      co_nivel: parseFloat(datos.co_nivel.toFixed(2)),
      latitud: parseFloat((sensor.latBase + variacion.lat).toFixed(8)),
      longitud: parseFloat((sensor.lonBase + variacion.lon).toFixed(8)),
      altitud: parseFloat(datos.altitud.toFixed(2)),
      zona: sensor.zona
    };

    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': sensor.tipo_cliente, // Header para identificar tipo de cliente
        'X-Device-Info': `${sensor.tipo_cliente} - ${sensor.descripcion}`
      }
    });

    if (response.status === 201) {
      console.log(`✅ [${sensor.tipo_cliente}] ${sensor.id}: Datos enviados`);
      console.log(`   📍 Lat: ${payload.latitud.toFixed(6)}, Lon: ${payload.longitud.toFixed(6)}`);
      console.log(`   🌡️  T:${payload.temperatura}°C H:${payload.humedad}% CO2:${payload.co2_nivel}ppm CO:${payload.co_nivel}ppm`);
    }

    return { success: true, sensor: sensor.id };
  } catch (error) {
    console.error(`❌ [${sensor.tipo_cliente}] ${sensor.id}: ${error.message}`);
    return { success: false, sensor: sensor.id, error: error.message };
  }
}

// SIMULADOR 2: App Móvil con sensores Bluetooth
async function simularAppMovil(appConfig) {
  try {
    const variacion = calcularVariacionCoordenadas(
      appConfig.velocidad_movimiento || 'media',
      appConfig.is_movil
    );

    // La app móvil envía lecturas de TODOS sus sensores Bluetooth conectados
    const resultados = [];

    for (const sensorBT of appConfig.sensores_bluetooth) {
      let datos = generarDatosAmbientales(appConfig.zona);
      datos = aplicarAnomalias(datos, sensorBT);

      // La ubicación es la del teléfono (GPS), no del sensor Bluetooth
      const payload = {
        id_sensor: sensorBT, // ID del sensor Bluetooth
        temperatura: parseFloat(datos.temperatura.toFixed(2)),
        humedad: parseFloat(datos.humedad.toFixed(2)),
        co2_nivel: datos.co2_nivel,
        co_nivel: parseFloat(datos.co_nivel.toFixed(2)),
        latitud: parseFloat((appConfig.latBase + variacion.lat).toFixed(8)),
        longitud: parseFloat((appConfig.lonBase + variacion.lon).toFixed(8)),
        altitud: parseFloat(datos.altitud.toFixed(2)),
        zona: appConfig.zona
      };

      const response = await axios.post(API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': appConfig.tipo_cliente,
          'X-App-ID': appConfig.id, // ID de la app móvil
          'X-Sensor-BT-ID': sensorBT, // ID del sensor Bluetooth
          'X-Connection-Type': 'Bluetooth'
        }
      });

      if (response.status === 201) {
        console.log(`✅ [${appConfig.tipo_cliente}] App ${appConfig.id} → Sensor BT ${sensorBT}`);
        console.log(`   📱 Ubicación del teléfono: Lat ${payload.latitud.toFixed(6)}, Lon ${payload.longitud.toFixed(6)}`);
        console.log(`   📡 Datos del sensor BT: T:${payload.temperatura}°C H:${payload.humedad}% CO2:${payload.co2_nivel}ppm`);
      }

      resultados.push({ success: true, sensor: sensorBT });

      // Pequeña pausa entre sensores BT
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return resultados;
  } catch (error) {
    console.error(`❌ [${appConfig.tipo_cliente}] ${appConfig.id}: ${error.message}`);
    return [{ success: false, app: appConfig.id, error: error.message }];
  }
}

// ==========================================
// CICLO PRINCIPAL DE SIMULACIÓN
// ==========================================

async function cicloSimulacion() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📅 ${new Date().toLocaleString('es-PE')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Simular sensores fijos con GPRS/WiFi
  console.log('🔹 SENSORES FIJOS (GPRS/WiFi)');
  for (const sensor of SENSORES_FIJOS_GPRS) {
    await simularSensorESP32(sensor);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 2. Simular sensores móviles con GPRS/WiFi
  console.log('\n🔹 SENSORES MÓVILES (GPRS/WiFi)');
  for (const sensor of SENSORES_MOVILES_GPRS) {
    await simularSensorESP32(sensor);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 3. Simular apps móviles con sensores Bluetooth
  console.log('\n🔹 APPS MÓVILES (Bluetooth)');
  for (const app of SENSORES_APP_MOVIL) {
    await simularAppMovil(app);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     SIMULADOR MEJORADO DE SENSORES AMBIENTALES        ║');
console.log('║              Sistema de Monitoreo IoT                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('📊 CONFIGURACIÓN:');
console.log(`   • API URL: ${API_URL}`);
console.log(`   • Intervalo: ${INTERVALO_ENVIO / 1000} segundos`);
console.log(`   • Sensores Fijos GPRS/WiFi: ${SENSORES_FIJOS_GPRS.length}`);
console.log(`   • Sensores Móviles GPRS/WiFi: ${SENSORES_MOVILES_GPRS.length}`);
console.log(`   • Apps Móviles (Bluetooth): ${SENSORES_APP_MOVIL.length}`);

const totalSensoresBT = SENSORES_APP_MOVIL.reduce((sum, app) => sum + app.sensores_bluetooth.length, 0);
console.log(`   • Sensores Bluetooth totales: ${totalSensoresBT}`);
console.log('\n' + '─'.repeat(56) + '\n');

// Verificar conectividad con la API
axios.get('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Servidor API detectado y funcionando\n');
    console.log('🚀 Iniciando simulación...\n');

    // Primera ejecución inmediata
    cicloSimulacion();

    // Programar envíos periódicos
    setInterval(cicloSimulacion, INTERVALO_ENVIO);

    console.log(`\n🔄 Simulación activa. Datos cada ${INTERVALO_ENVIO / 1000} segundos.`);
    console.log('   Presiona Ctrl+C para detener.\n');
  })
  .catch((error) => {
    console.error('\n❌ ERROR: No se puede conectar con la API');
    console.error(`   URL intentada: http://localhost:3000/api/health`);
    console.error(`   Mensaje: ${error.message}\n`);
    console.error('💡 Solución:');
    console.error('   1. Verifica que el servidor API esté corriendo');
    console.error('   2. Ejecuta: cd sensor_monitoreo_api && npm start');
    console.error('   3. Espera a que el servidor inicie completamente\n');
    process.exit(1);
  });