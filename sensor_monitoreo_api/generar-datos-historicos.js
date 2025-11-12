// generar-datos-historicos.js
// Script para generar datos históricos de los últimos 30 días
// Esto te permitirá probar los gráficos con datos reales

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/lecturas';

// Sensores a simular
const SENSORES = [
  { id: 'ESP32_001', zona: 'Urbana', lat: -3.74912, lon: -73.25383 },
  { id: 'ESP32_002', zona: 'Urbana', lat: -3.75123, lon: -73.25789 },
  { id: 'ESP32_MOBILE_001', zona: 'Rural', lat: -3.74500, lon: -73.25000 }
];

// Función para generar valor con variación
function generarValor(base, variacion) {
  return base + (Math.random() - 0.5) * variacion;
}

// Función para enviar lectura
async function enviarLectura(sensor, fecha) {
  try {
    const data = {
      id_sensor: sensor.id,
      temperatura: parseFloat(generarValor(25, 5).toFixed(1)),
      humedad: parseFloat(generarValor(65, 20).toFixed(1)),
      co2_nivel: Math.round(generarValor(450, 200)),
      co_nivel: parseFloat(generarValor(2, 1).toFixed(1)),
      latitud: sensor.lat,
      longitud: sensor.lon,
      altitud: 105.0,
      zona: sensor.zona,
      lectura_datetime: fecha.toISOString() // Enviar fecha específica
    };

    await axios.post(API_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'Generador_Historico'
      }
    });

    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Función principal
async function generarDatosHistoricos() {
  console.log('🚀 Iniciando generación de datos históricos...\n');

  const ahora = new Date();
  const diasAtras = 30; // Generar datos de los últimos 30 días
  let totalEnviados = 0;
  let totalErrores = 0;

  // Para cada día
  for (let dia = diasAtras; dia >= 0; dia--) {
    const fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() - dia);
    fecha.setHours(0, 0, 0, 0);

    console.log(`\n📅 Generando datos para: ${fecha.toLocaleDateString('es-PE')}`);

    // Para cada hora del día (de 6am a 10pm)
    for (let hora = 6; hora <= 22; hora++) {
      fecha.setHours(hora, 0, 0, 0);

      // Para cada sensor
      for (const sensor of SENSORES) {
        // Generar 1-3 lecturas por hora
        const numLecturas = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numLecturas; i++) {
          const minutos = Math.floor(Math.random() * 60);
          const fechaLectura = new Date(fecha);
          fechaLectura.setMinutes(minutos);

          const exito = await enviarLectura(sensor, fechaLectura);

          if (exito) {
            totalEnviados++;
            process.stdout.write('.');
          } else {
            totalErrores++;
            process.stdout.write('✗');
          }

          // Pequeña pausa para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
  }

  console.log('\n\n✅ Generación completada!');
  console.log(`📊 Total enviados: ${totalEnviados}`);
  console.log(`❌ Total errores: ${totalErrores}`);
  console.log(`\n💡 Ahora puedes probar los filtros en la página de Reportes`);
}

// Ejecutar
generarDatosHistoricos().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
