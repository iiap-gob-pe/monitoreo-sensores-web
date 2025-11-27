// scripts/generarApiKey.js - Script para generar API Keys para sensores/apps
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Genera una API Key aleatoria segura
 * @returns {string} API Key de 32 caracteres hexadecimales
 */
function generarApiKeyAleatoria() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Crea un hash SHA256 de la API Key
 * @param {string} apiKey - La API Key en texto plano
 * @returns {string} Hash SHA256 de la API Key
 */
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Crea una nueva API Key en la base de datos
 * @param {Object} options - Opciones para crear la API Key
 * @param {string} options.nombre - Nombre descriptivo (ej: "ESP32_Sensor_001")
 * @param {string} options.id_sensor - ID del sensor asociado (siempre requerido)
 * @param {string} options.descripcion - Descripción adicional (opcional)
 * @param {number} options.createdBy - ID del usuario admin que la crea (opcional)
 * @param {number} options.diasExpiracion - Días hasta que expire (opcional, null = nunca)
 */
async function crearApiKey(options) {
  const {
    nombre,
    id_sensor,
    descripcion = null,
    createdBy = null,
    diasExpiracion = null
  } = options;

  try {
    // Validar que el id_sensor es requerido
    if (!id_sensor) {
      throw new Error('El ID del sensor es requerido');
    }

    // Validar que no exista ya una API Key para este sensor
    const apiKeyExistente = await prisma.api_keys.findUnique({
      where: { id_sensor: id_sensor }
    });

    if (apiKeyExistente) {
      throw new Error(`Ya existe una API Key para el sensor '${id_sensor}'`);
    }

    // Generar API Key aleatoria
    const apiKeyPlain = generarApiKeyAleatoria();
    const apiKeyHash = hashApiKey(apiKeyPlain);

    // Calcular fecha de expiración si se especificó
    let expiresAt = null;
    if (diasExpiracion) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + diasExpiracion);
    }

    // Guardar en base de datos
    const apiKeyRecord = await prisma.api_keys.create({
      data: {
        key_name: nombre,
        api_key: apiKeyHash,
        id_sensor: id_sensor,
        descripcion: descripcion,
        created_by: createdBy,
        expires_at: expiresAt,
        esta_activo: true
      }
    });

    console.log('\n✅ API Key creada exitosamente!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 INFORMACIÓN DE LA API KEY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`ID:          ${apiKeyRecord.id_api_key}`);
    console.log(`Nombre:      ${apiKeyRecord.key_name}`);
    console.log(`ID Sensor:   ${apiKeyRecord.id_sensor}`);
    console.log(`Descripción: ${apiKeyRecord.descripcion || 'N/A'}`);
    console.log(`Creada:      ${apiKeyRecord.created_at.toLocaleString()}`);
    console.log(`Expira:      ${apiKeyRecord.expires_at ? apiKeyRecord.expires_at.toLocaleString() : 'Nunca'}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🔑 API KEY (guárdala en un lugar seguro):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(apiKeyPlain);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Esta es la ÚNICA vez que verás la API Key completa');
    console.log('   - Guárdala en el código del ESP32 o app móvil');
    console.log('   - Si la pierdes, deberás crear una nueva');
    console.log('\n📱 USO EN CÓDIGO:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ESP32 (C++):\n');
    console.log('   HTTPClient http;');
    console.log('   http.begin("https://api.monitoreo.iiap.org.pe/api/lecturas");');
    console.log(`   http.addHeader("X-API-Key", "${apiKeyPlain}");`);
    console.log('   http.addHeader("Content-Type", "application/json");');
    console.log('   http.POST(jsonData);\n');
    console.log('   Android (Kotlin/Retrofit):\n');
    console.log('   @Headers(');
    console.log(`     "X-API-Key: ${apiKeyPlain}",`);
    console.log('     "Content-Type: application/json"');
    console.log('   )');
    console.log('   @POST("/api/lecturas")');
    console.log('   fun enviarLectura(@Body lectura: Lectura): Call<Response>\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    return { id: apiKeyRecord.id_api_key, apiKey: apiKeyPlain };

  } catch (error) {
    console.error('❌ Error al crear API Key:', error.message);
    throw error;
  }
}

/**
 * Listar todas las API Keys (sin mostrar las keys completas)
 */
async function listarApiKeys() {
  try {
    const apiKeys = await prisma.api_keys.findMany({
      include: {
        usuario_creador: {
          select: {
            username: true,
            nombre_completo: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log('\n📋 API KEYS REGISTRADAS');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('ID  | Nombre                 | ID Sensor                | Activo | Creada por       | Última Uso');
    console.log('───────────────────────────────────────────────────────────────────────────────────────────────────────────');

    if (apiKeys.length === 0) {
      console.log('No hay API Keys registradas.');
    } else {
      apiKeys.forEach(key => {
        const ultimoUso = key.ultima_uso
          ? key.ultima_uso.toLocaleString()
          : 'Nunca';
        const activo = key.esta_activo ? '✅ Sí' : '❌ No';
        const creador = key.usuario_creador
          ? key.usuario_creador.username
          : 'Sistema';
        const idSensor = key.id_sensor.padEnd(24);

        console.log(
          `${String(key.id_api_key).padEnd(4)}| ${key.key_name.padEnd(22)} | ${idSensor} | ${activo.padEnd(6)} | ${creador.padEnd(16)} | ${ultimoUso}`
        );
      });
    }

    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al listar API Keys:', error.message);
    throw error;
  }
}

/**
 * Deshabilitar una API Key (sin eliminarla)
 */
async function deshabilitarApiKey(id) {
  try {
    const apiKey = await prisma.api_keys.update({
      where: { id_api_key: id },
      data: { esta_activo: false }
    });

    console.log(`\n✅ API Key "${apiKey.key_name}" deshabilitada exitosamente.\n`);
  } catch (error) {
    console.error('❌ Error al deshabilitar API Key:', error.message);
    throw error;
  }
}

/**
 * Habilitar una API Key previamente deshabilitada
 */
async function habilitarApiKey(id) {
  try {
    const apiKey = await prisma.api_keys.update({
      where: { id_api_key: id },
      data: { esta_activo: true }
    });

    console.log(`\n✅ API Key "${apiKey.key_name}" habilitada exitosamente.\n`);
  } catch (error) {
    console.error('❌ Error al habilitar API Key:', error.message);
    throw error;
  }
}

/**
 * Eliminar una API Key permanentemente
 */
async function eliminarApiKey(id) {
  try {
    const apiKey = await prisma.api_keys.delete({
      where: { id_api_key: id }
    });

    console.log(`\n✅ API Key "${apiKey.key_name}" eliminada permanentemente.\n`);
  } catch (error) {
    console.error('❌ Error al eliminar API Key:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFAZ DE LÍNEA DE COMANDOS
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const comando = args[0];

  try {
    switch (comando) {
      case 'crear':
        const nombre = args[1];
        const id_sensor = args[2];
        const descripcion = args[3] || null;

        if (!nombre || !id_sensor) {
          console.error('\n❌ Error: Debes proporcionar un nombre y un ID de sensor.\n');
          console.log('Uso: node scripts/generarApiKey.js crear <nombre> <id_sensor> [descripcion]\n');
          console.log('Ejemplos:');
          console.log('  node scripts/generarApiKey.js crear "API_Key_Sensor_001" "SENSOR_001" "Sensor en zona urbana"');
          console.log('  node scripts/generarApiKey.js crear "API_Key_Sensor_002" "SENSOR_002"\n');
          process.exit(1);
        }

        await crearApiKey({ nombre, id_sensor, descripcion });
        break;

      case 'listar':
        await listarApiKeys();
        break;

      case 'deshabilitar':
        const idDeshabilitar = parseInt(args[1]);
        if (!idDeshabilitar) {
          console.error('\n❌ Error: Debes proporcionar el ID de la API Key.\n');
          console.log('Uso: node scripts/generarApiKey.js deshabilitar <id>\n');
          process.exit(1);
        }
        await deshabilitarApiKey(idDeshabilitar);
        break;

      case 'habilitar':
        const idHabilitar = parseInt(args[1]);
        if (!idHabilitar) {
          console.error('\n❌ Error: Debes proporcionar el ID de la API Key.\n');
          console.log('Uso: node scripts/generarApiKey.js habilitar <id>\n');
          process.exit(1);
        }
        await habilitarApiKey(idHabilitar);
        break;

      case 'eliminar':
        const idEliminar = parseInt(args[1]);
        if (!idEliminar) {
          console.error('\n❌ Error: Debes proporcionar el ID de la API Key.\n');
          console.log('Uso: node scripts/generarApiKey.js eliminar <id>\n');
          process.exit(1);
        }
        await eliminarApiKey(idEliminar);
        break;

      default:
        console.log('\n📘 SCRIPT DE GESTIÓN DE API KEYS\n');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log('Comandos disponibles:\n');
        console.log('  crear <nombre> <id_sensor> [descripcion]  - Crear nueva API Key');
        console.log('  listar                                     - Listar todas las API Keys');
        console.log('  deshabilitar <id>                          - Deshabilitar una API Key');
        console.log('  habilitar <id>                             - Habilitar una API Key');
        console.log('  eliminar <id>                              - Eliminar permanentemente\n');
        console.log('Ejemplos:\n');
        console.log('  node scripts/generarApiKey.js crear "API_Key_Sensor_001" "SENSOR_001" "Sensor zona urbana"');
        console.log('  node scripts/generarApiKey.js crear "API_Key_Sensor_002" "SENSOR_002"');
        console.log('  node scripts/generarApiKey.js listar');
        console.log('  node scripts/generarApiKey.js deshabilitar 1');
        console.log('  node scripts/generarApiKey.js habilitar 1');
        console.log('  node scripts/generarApiKey.js eliminar 1\n');
        console.log('Notas:\n');
        console.log('  - Cada API Key está vinculada a UN sensor específico');
        console.log('  - El id_sensor es SIEMPRE requerido\n');
        console.log('═══════════════════════════════════════════════════════════════════════════\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = {
  crearApiKey,
  listarApiKeys,
  deshabilitarApiKey,
  habilitarApiKey,
  eliminarApiKey
};
