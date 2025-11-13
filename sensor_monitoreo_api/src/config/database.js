// src/config/database.js
// Instancia singleton de PrismaClient para evitar múltiples conexiones

const { PrismaClient } = require('@prisma/client');

let prisma;

/**
 * Obtiene o crea la instancia singleton de Prisma
 * En producción, esto previene el agotamiento de conexiones
 * En desarrollo con hot-reload, reutiliza la instancia existente
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
      errorFormat: 'pretty',
    });

    // Configurar el manejo de desconexión
    prisma.$connect()
      .then(() => {
        console.log('✅ Prisma Client conectado exitosamente');
      })
      .catch((error) => {
        console.error('❌ Error al conectar Prisma Client:', error);
        process.exit(1);
      });
  }

  return prisma;
}

/**
 * Desconecta el cliente de Prisma de manera limpia
 * Útil para testing y cierre del servidor
 */
async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('✅ Prisma Client desconectado');
  }
}

module.exports = {
  prisma: getPrismaClient(),
  getPrismaClient,
  disconnectPrisma
};