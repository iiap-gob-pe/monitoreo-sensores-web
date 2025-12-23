const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const directoryPath = path.join(__dirname);
    const files = fs.readdirSync(directoryPath);

    // Filtrar archivos CSV que coincidan con el patrón ESP32_XXX.csv
    const csvFiles = files.filter(file => file.endsWith('.csv') && file.startsWith('ESP32_'));

    console.log(`📂 Archivos CSV encontrados: ${csvFiles.join(', ')}`);

    for (const file of csvFiles) {
        const sensorId = path.parse(file).name;
        const filePath = path.join(directoryPath, file);

        console.log(`\n🔹 Procesando archivo: ${file} para Sensor ID: ${sensorId}`);

        // Verificar si el sensor existe y obtener su ZONA
        const sensor = await prisma.sensores.findUnique({
            where: { id_sensor: sensorId }
        });

        if (!sensor) {
            console.warn(`⚠️  El sensor ${sensorId} no existe en la base de datos. Saltando...`);
            continue;
        }

        const { zona: sensorZona } = sensor;
        console.log(`📍 Zona del sensor: ${sensorZona || 'No definida'}`);

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        let insertedCount = 0;

        // Ignorar cabecera si existe
        const startLine = lines[0].startsWith('Fecha') ? 1 : 0;

        const lecturasToInsert = [];

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(';');

            if (parts.length < 8) continue;

            try {
                const fechaStr = parts[0];
                const horaStr = parts[1];

                const [day, month, year] = fechaStr.split('/');
                const isoDateString = `${year}-${month}-${day}T${horaStr}`;
                const fechaHora = new Date(isoDateString);

                const temp = parseFloat(parts[2]);
                const hum = parseFloat(parts[3]);
                const co = parseFloat(parts[4]);
                const co2 = parseInt(parts[5]);
                const lat = parseFloat(parts[6]);
                const lon = parseFloat(parts[7]);
                const alt = parseFloat(parts[8]);

                if (isNaN(lat) || isNaN(lon)) continue;

                lecturasToInsert.push({
                    id_sensor: sensorId,
                    lectura_datetime: fechaHora,
                    temperatura: isNaN(temp) ? null : temp,
                    humedad: isNaN(hum) ? null : hum,
                    co_nivel: isNaN(co) ? null : co,
                    co2_nivel: isNaN(co2) ? null : co2,
                    latitud: lat,
                    longitud: lon,
                    altitud: isNaN(alt) ? null : alt,
                    zona: sensorZona // Usar la zona del sensor para cumplir con el constraint check
                });

            } catch (e) {
                console.error(`❌ Error parseando línea ${i + 1}: ${line}`, e.message);
            }
        }

        console.log(`📝 Total lecturas parseadas para ${sensorId}: ${lecturasToInsert.length}`);
        if (lecturasToInsert.length > 0) {
            console.log('🔍 Ejemplo de lectura:', lecturasToInsert[0]);
        }

        // Insertar en lotes
        const BATCH_SIZE = 100;
        for (let i = 0; i < lecturasToInsert.length; i += BATCH_SIZE) {
            const batch = lecturasToInsert.slice(i, i + BATCH_SIZE);
            try {
                await prisma.lecturas.createMany({
                    data: batch,
                    skipDuplicates: true
                });
                insertedCount += batch.length;
                console.log(`📥 Lote ${Math.ceil((i + 1) / BATCH_SIZE)} insertado (${batch.length} registros). Total: ${insertedCount}`);
            } catch (error) {
                console.error(`\n❌ Error insertando lote:`, error.message);
            }
        }
        console.log(`✅ Finalizado sensor ${sensorId}. Total lecturas insertadas: ${insertedCount}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
