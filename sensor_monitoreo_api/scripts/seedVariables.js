const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const vars = [
    { codigo: 'temperatura', nombre: 'Temperatura', unidad: 'C', descripcion: 'Temperatura del aire en grados Celsius', rango_min: -10, rango_max: 50, color: '#f97316', icono: 'fire' },
    { codigo: 'humedad', nombre: 'Humedad Relativa', unidad: '%', descripcion: 'Porcentaje de humedad relativa del aire', rango_min: 0, rango_max: 100, color: '#3b82f6', icono: 'cloud' },
    { codigo: 'co2', nombre: 'Dioxido de Carbono (CO2)', unidad: 'ppm', descripcion: 'Concentracion de CO2 en partes por millon', rango_min: 300, rango_max: 5000, color: '#16a34a', icono: 'leaf' },
    { codigo: 'co', nombre: 'Monoxido de Carbono (CO)', unidad: 'ppm', descripcion: 'Concentracion de CO en partes por millon. Toxico a niveles superiores a 35 ppm', rango_min: 0, rango_max: 100, color: '#ef4444', icono: 'warning' }
  ];

  for (const v of vars) {
    await prisma.variables.upsert({ where: { codigo: v.codigo }, update: v, create: v });
    console.log('  Variable:', v.codigo);
  }
  console.log('4 variables creadas/actualizadas');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
