
// server.js - Punto de entrada del servidor. Trae consigo la app y la herramienta de prisma.
const app = require('./src/app');
const { prisma, disconnectPrisma } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Función para inicializar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 Servidor Environmental Monitoring API iniciado');
      console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📊 Documentación: http://localhost:${PORT}/api/docs`);
      console.log(`⏰ Iniciado en: ${new Date().toLocaleString()}`);
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', async () => {
      console.log('\n🔄 Cerrando servidor por SIGTERM...');
      await disconnectPrisma();
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n🔄 Cerrando servidor por SIGINT...');
      await disconnectPrisma();
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await disconnectPrisma();
    process.exit(1);
  }
}

// Inicializar servidor
startServer();