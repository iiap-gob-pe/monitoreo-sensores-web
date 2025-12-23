const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sensores = await prisma.sensores.findMany();
    console.log('📡 Sensores actuales:');
    sensores.forEach(s => console.log(` - [${s.id_sensor}] ${s.nombre_sensor} (Zona: ${s.zona})`));

    const lecturasCount = await prisma.lecturas.count({
        where: {
            lectura_datetime: {
                gte: new Date('2025-11-21T00:00:00'),
                lt: new Date('2025-11-22T00:00:00')
            }
        }
    });
    console.log(`\n📊 Total lecturas del 21/11/2025: ${lecturasCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
