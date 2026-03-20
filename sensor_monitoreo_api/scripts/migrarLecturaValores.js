// Script para migrar lecturas legacy a lectura_valores
// Ejecutar: node scripts/migrarLecturaValores.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LEGACY_MAP = {
  temperatura: 'temperatura',
  humedad: 'humedad',
  co2: 'co2_nivel',
  co: 'co_nivel'
};

async function migrar() {
  // Obtener todos los sensores con config de variables
  const sensores = await prisma.sensor_variable.findMany({
    include: { variable: true },
    orderBy: { orden_csv: 'asc' }
  });

  // Agrupar por sensor
  const configPorSensor = {};
  sensores.forEach(sv => {
    if (!configPorSensor[sv.id_sensor]) configPorSensor[sv.id_sensor] = [];
    configPorSensor[sv.id_sensor].push(sv);
  });

  console.log('Sensores con config:', Object.keys(configPorSensor));

  let totalMigrados = 0;

  for (const [idSensor, config] of Object.entries(configPorSensor)) {
    // Lecturas del sensor que NO tienen lectura_valores
    const lecturas = await prisma.lecturas.findMany({
      where: {
        id_sensor: idSensor,
        valores: { none: {} } // sin valores dinamicos
      },
      orderBy: { lectura_datetime: 'desc' }
    });

    console.log(`Sensor ${idSensor}: ${lecturas.length} lecturas sin valores dinamicos`);

    for (const lectura of lecturas) {
      const valores = [];

      for (const sv of config) {
        const legacyField = LEGACY_MAP[sv.variable.codigo];
        const legacyValue = legacyField ? lectura[legacyField] : null;

        if (legacyValue != null) {
          valores.push({
            id_lectura: lectura.id_lectura,
            id_variable: sv.id_variable,
            valor: parseFloat(legacyValue)
          });
        }
      }

      if (valores.length > 0) {
        await prisma.lectura_valores.createMany({
          data: valores,
          skipDuplicates: true
        });
        totalMigrados++;
      }
    }
  }

  console.log(`Migracion completada: ${totalMigrados} lecturas actualizadas`);
  process.exit(0);
}

migrar().catch(e => { console.error(e); process.exit(1); });
