// simulador-sensores.js
// Script para simular datos de sensores ESP32 enviando información a la API

const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3000/api/lecturas';
const INTERVALO_ENVIO = 30000; // 30 segundos en milisegundos

// Definir sensores a simular (deben existir en la base de datos)
const SENSORES = [
  { id: 'SENSOR_001', zona: 'Urbana', latBase: -3.74912, lonBase: -73.25383, is_movil: false }, // Estacionario
  { id: 'SENSOR_002', zona: 'Urbana', latBase: -3.75123, lonBase: -73.25789, is_movil: true },  // Móvil
  { id: 'SENSOR_003', zona: 'Rural', latBase: -3.72045, lonBase: -73.30125, is_movil: true },   // Móvil
  { id: 'SENSOR_004', zona: 'Rural', latBase: -3.71234, lonBase: -73.31456, is_movil: true },   // Móvil
  { id: 'TEST_SENSOR', zona: 'Urbana', latBase: -3.74500, lonBase: -73.25000, is_movil: true }  // Móvil
];

// Función para generar datos realistas según la zona
function generarDatosAleatorios(sensor) {
  const esUrbano = sensor.zona === 'Urbana';
  
  const temperatura = esUrbano 
    ? 20 + Math.random() * 10
    : 15 + Math.random() * 15;
  
  const humedad = esUrbano
    ? 40 + Math.random() * 30
    : 50 + Math.random() * 40;
  
  const co2_nivel = esUrbano
    ? 400 + Math.floor(Math.random() * 400)
    : 350 + Math.floor(Math.random() * 250);
  
  const co_nivel = esUrbano
    ? 1 + Math.random() * 6
    : Math.random() * 3;
  
  // Si es móvil, variación más grande; si es estacionario, casi ninguna variación
  const latVariacion = sensor.is_movil ? (Math.random() - 0.5) * 0.01 : (Math.random() - 0.5) * 0.0001;
  const lonVariacion = sensor.is_movil ? (Math.random() - 0.5) * 0.01 : (Math.random() - 0.5) * 0.0001;
  
  return {
    id_sensor: sensor.id,
    temperatura: parseFloat(temperatura.toFixed(2)),
    humedad: parseFloat(humedad.toFixed(2)),
    co2_nivel: co2_nivel,
    co_nivel: parseFloat(co_nivel.toFixed(2)),
    latitud: parseFloat((sensor.latBase + latVariacion).toFixed(8)),
    longitud: parseFloat((sensor.lonBase + lonVariacion).toFixed(8)),
    altitud: parseFloat((100 + Math.random() * 20).toFixed(2)),
    zona: sensor.zona
  };
}

// Ocasionalmente generar valores que disparen alertas
function generarDatosConAnomalias(sensor) {
  const datos = generarDatosAleatorios(sensor);
  
  // 20% de probabilidad de generar una anomalía
  if (Math.random() < 0.2) {
    const tipoAnomalia = Math.floor(Math.random() * 4);
    
    switch(tipoAnomalia) {
      case 0: // Temperatura alta
        datos.temperatura = 35 + Math.random() * 5;
        console.log(`   ⚠️  ${sensor.id}: Temperatura alta simulada - ${datos.temperatura.toFixed(2)}°C`);
        break;
      case 1: // CO2 elevado
        datos.co2_nivel = 1000 + Math.floor(Math.random() * 500);
        console.log(`   ⚠️  ${sensor.id}: CO2 elevado simulado - ${datos.co2_nivel} ppm`);
        break;
      case 2: // CO alto
        datos.co_nivel = 9 + Math.random() * 3;
        console.log(`   ⚠️  ${sensor.id}: CO alto simulado - ${datos.co_nivel.toFixed(2)} ppm`);
        break;
      case 3: // Humedad extrema
        datos.humedad = Math.random() < 0.5 ? 10 + Math.random() * 5 : 85 + Math.random() * 10;
        console.log(`   ⚠️  ${sensor.id}: Humedad extrema simulada - ${datos.humedad.toFixed(2)}%`);
        break;
    }
  }
  
  return datos;
}

// Función para enviar datos a la API
async function enviarDatosSensor(sensor) {
  try {
    const datos = generarDatosConAnomalias(sensor);
    const response = await axios.post(API_URL, datos, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 201) {
      console.log(`✅ ${sensor.id}: Datos enviados correctamente`);
      console.log(`   T:${datos.temperatura}°C H:${datos.humedad}% CO2:${datos.co2_nivel}ppm CO:${datos.co_nivel}ppm`);
    }
  } catch (error) {
    if (error.response) {
      console.error(`❌ ${sensor.id}: Error ${error.response.status} - ${error.response.data.message || error.message}`);
    } else if (error.request) {
      console.error(`❌ ${sensor.id}: No hay respuesta del servidor. ¿Está corriendo la API?`);
    } else {
      console.error(`❌ ${sensor.id}: Error al enviar datos - ${error.message}`);
    }
  }
}

// Función para enviar datos de todos los sensores
async function cicloEnvio() {
  console.log('\n--- Nuevo ciclo de envío ---');
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  
  for (const sensor of SENSORES) {
    await enviarDatosSensor(sensor);
    // Pequeña pausa entre sensores para evitar sobrecarga
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Inicialización
console.log('====================================');
console.log('  SIMULADOR DE SENSORES ESP32');
console.log('====================================');
console.log(`API URL: ${API_URL}`);
console.log(`Sensores configurados: ${SENSORES.length}`);
console.log(`Intervalo de envío: ${INTERVALO_ENVIO / 1000} segundos`);
console.log('====================================\n');

// Verificar que el servidor esté disponible
axios.get('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Servidor API detectado y funcionando\n');
    
    // Primera ejecución inmediata
    cicloEnvio();
    
    // Programar envíos periódicos
    setInterval(cicloEnvio, INTERVALO_ENVIO);
    
    console.log(`\n🔄 Simulación iniciada. Los datos se enviarán cada ${INTERVALO_ENVIO / 1000} segundos.`);
    console.log('Presiona Ctrl+C para detener el simulador.\n');
  })
  .catch((error) => {
    console.error('❌ ERROR: No se puede conectar con la API');
    console.error('   Asegúrate de que el servidor esté corriendo en http://localhost:3000');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  });