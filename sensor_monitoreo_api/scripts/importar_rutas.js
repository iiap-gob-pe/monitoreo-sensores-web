const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// La ruta donde están los CSVs
const RUTAS_DIR = path.join(__dirname, '../rutas');

const parsearFechaHora = (fechaStr, horaStr) => {
  try {
    let dia, mes, ano;
    if (fechaStr.includes('/')) {
      [dia, mes, ano] = fechaStr.split('/');
    } else if (fechaStr.includes('-')) {
      const partes = fechaStr.split('-');
      if (partes[0].length === 4 || partes[0].length === 2) {
        // YYYY-M-D o YY-M-D format
        ano = partes[0];
        mes = partes[1];
        dia = partes[2];
        if (ano.length === 2) ano = "20" + ano;
      } else {
        [dia, mes, ano] = partes;
      }
    } else {
      return null;
    }
    
    // Ensure two digit formatting
    const diaPad = String(dia).padStart(2, '0');
    const mesPad = String(mes).padStart(2, '0');
    
    // Asumimos hora local de Iquitos/Lima (-05:00)
    const fechaObj = new Date(`${ano}-${mesPad}-${diaPad}T${horaStr.padStart(8, '0')}.000-05:00`);
    if (isNaN(fechaObj.getTime())) return null;
    return fechaObj;
  } catch (error) {
    return null;
  }
};

async function procesarArchivo(filePath, id_sensor) {
  console.log(`\nIniciando procesamiento de: ${filePath}`);
  
  // 1. Asegurar que el sensor existe en la BD
  let sensor = await prisma.sensores.findUnique({ where: { id_sensor } });
  if (!sensor) {
    console.log(`El sensor ${id_sensor} no existía. Creándolo...`);
    sensor = await prisma.sensores.create({
      data: {
        id_sensor,
        nombre_sensor: `Sensor Móvil ${id_sensor}`,
        zona: 'Urbana', // Por defecto
        is_movil: true, // Ya que son recorridos
        estado: 'Activo',
        description: 'Autoregistrado por script de importación CSV'
      }
    });
  }

  const lecturasLote = [];
  let numLinea = 0;
  let lineasInvalidas = 0;
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const linea of rl) {
    numLinea++;
    
    // Ignorar la cabecera (suponiendo que la primera línea es el encabezado)
    if (numLinea === 1 && linea.toLowerCase().includes('fecha')) {
      continue;
    }

    // Dividimos por el delimitador ; o ,
    const columnas = linea.split(/[,;]/);
    
    // Verificar que tengamos al menos las columnas necesarias (asumiendo formato del ESP32_002)
    // Fecha;Hora;Temperatura (C);Humedad (%);CO (ppm);CO2 (ppm);Latitud;Longitud;Altitud (m);Velocidad (km/h);HDOP
    if (columnas.length < 9) {
      lineasInvalidas++;
      continue;
    }

    const [fechaStr, horaStr, tempStr, humStr, coStr, co2Str, latStr, lonStr, altStr] = columnas;

    const fecha_obj = parsearFechaHora(fechaStr, horaStr);
    const temperatura = parseFloat(tempStr);
    const humedad = parseFloat(humStr);
    const co_nivel = parseFloat(coStr);
    const co2_nivel = parseInt(co2Str, 10);
    const latitud = parseFloat(latStr);
    const longitud = parseFloat(lonStr);
    const altitud = parseFloat(altStr);

    if (!fecha_obj) {
      if (lineasInvalidas < 3) console.log('Skipping line by date: ', {fechaStr, horaStr});
      lineasInvalidas++;
      continue;
    }

    const t = parseFloat(tempStr) || null;
    const h = parseFloat(humStr) || null;
    const co = parseFloat(coStr) || null;
    const co2 = parseInt(co2Str, 10) || null;
    const lat = parseFloat(latStr) || null;
    const lon = parseFloat(lonStr) || null;

    if (t === null || h === null || lat === null || lon === null) {
       lineasInvalidas++;
       continue;
    }

    lecturasLote.push({
      id_sensor: id_sensor,
      lectura_datetime: fecha_obj,
      temperatura: t,
      humedad: h,
      co_nivel: co ?? 0,
      co2_nivel: co2 ?? 0,
      latitud: lat,
      longitud: lon,
      altitud: parseFloat(altStr) || 0,
      zona: 'Urbana'
    });

    // Guardar en lotes de 2000 para no saturar la memoria RAM
    if (lecturasLote.length >= 2000) {
      await prisma.lecturas.createMany({
        data: lecturasLote
        // skipDuplicates: true
      });
      console.log(`  - Se guardaron ${lecturasLote.length} lecturas...`);
      lecturasLote.length = 0; // Vaciar array
    }
  }

  // Guardar resto de registros que no sumaron 2000
  if (lecturasLote.length > 0) {
    await prisma.lecturas.createMany({
      data: lecturasLote
      // skipDuplicates: true
    });
    console.log(`  - Se guardaron las últimas ${lecturasLote.length} lecturas.`);
  }

  console.log(`✅ Archivo procesado.`);
  console.log(`  - Total líneas analizadas: ${numLinea}`);
  console.log(`  - Líneas descartadas por formato inválido: ${lineasInvalidas}`);
}

async function main() {
  console.log('--- INICIANDO IMPORTACIÓN BATCH DE CSVs ---');

  try {
    if (!fs.existsSync(RUTAS_DIR)) {
      throw new Error(`La carpeta ${RUTAS_DIR} no existe.`);
    }

    const archivos = fs.readdirSync(RUTAS_DIR);
    const archivosCSV = archivos.filter(archivo => archivo.toLowerCase().endsWith('.csv'));

    if (archivosCSV.length === 0) {
      console.log('⚠️ No se encontraron archivos .csv en la carpeta.');
      return;
    }

    for (const archivo of archivosCSV) {
      // Obtenemos el nombre base. Si el archivo es ESP32_001_datos_2025.csv, extraer ESP32_001
      let id_sensor = path.basename(archivo, path.extname(archivo));
      if (id_sensor.includes('_datos')) {
        id_sensor = id_sensor.split('_datos')[0];
      } else {
        // En caso de que sea ESP32_002.csv o algo con múltiples guiones
        const match = id_sensor.match(/^([A-Za-z0-9]+_[A-Za-z0-9]+)/);
        if (match) id_sensor = match[1];
      }

      const rutaCompleta = path.join(RUTAS_DIR, archivo);
      
      await procesarArchivo(rutaCompleta, id_sensor);
    }

    console.log('\n🎉 IMPORTACIÓN EXITOSA. TODOS LOS DATOS CARGADOS.');

  } catch (error) {
    console.error('❌ Error en el proceso de importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
