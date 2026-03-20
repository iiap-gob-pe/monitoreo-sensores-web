// src/controllers/datosController.js - Controlador para ingesta CSV desde ESP32
// Parsea CSV dinámicamente según la configuración de variables del sensor
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DATOS_DIR = path.join(__dirname, '..', '..', 'datos');

// Mapeo de código de variable → columna legacy en tabla lecturas
const LEGACY_COLUMNS = {
  temperatura: 'temperatura',
  humedad: 'humedad',
  co2: 'co2_nivel',
  co: 'co_nivel'
};

const datosController = {
  recibir: async (req, res) => {
    try {
      // --- Validar header X-Fecha ---
      const xFecha = req.headers['x-fecha'];
      if (!xFecha || !/^\d{8}$/.test(xFecha)) {
        return res.status(400).json({ status: 'error', mensaje: 'Header X-Fecha es obligatorio y debe tener formato YYYYMMDD' });
      }

      const anio = parseInt(xFecha.substring(0, 4));
      const mes = parseInt(xFecha.substring(4, 6));
      const dia = parseInt(xFecha.substring(6, 8));
      const fechaObj = new Date(anio, mes - 1, dia);
      if (fechaObj.getFullYear() !== anio || fechaObj.getMonth() !== mes - 1 || fechaObj.getDate() !== dia) {
        return res.status(400).json({ status: 'error', mensaje: `Fecha inválida en X-Fecha: ${xFecha}` });
      }

      // --- Validar body ---
      const bodyTexto = req.body;
      if (!bodyTexto || typeof bodyTexto !== 'string' || bodyTexto.trim().length === 0) {
        return res.status(400).json({ status: 'error', mensaje: 'El body no puede estar vacío. Envíe texto CSV con separador ";"' });
      }

      const idSensor = req.apiKey?.id_sensor || null;

      // --- Obtener configuración de variables del sensor ---
      let sensorConfig = [];
      if (idSensor) {
        sensorConfig = await prisma.sensor_variable.findMany({
          where: { id_sensor: idSensor, estado: 'activo' },
          include: { variable: true },
          orderBy: { orden_csv: 'asc' }
        });
      }

      // Fallback: si no tiene config, usar formato legacy (Fecha;Hora;Temp;Hum;CO2)
      const usarLegacy = sensorConfig.length === 0;
      const numVariables = usarLegacy ? 3 : sensorConfig.length;
      const camposMinimos = 2 + numVariables; // Fecha + Hora + variables

      // --- Parsear filas CSV ---
      const lineas = bodyTexto.trim().split('\n').filter(l => l.trim().length > 0);
      if (lineas.length === 0) {
        return res.status(400).json({ status: 'error', mensaje: 'No se encontraron filas en el CSV' });
      }

      const registrosValidos = [];
      const erroresLinea = [];

      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        const campos = linea.split(';').map(c => c.trim());

        if (campos.length < camposMinimos) {
          const esperados = usarLegacy
            ? 'Fecha;Hora;Temperatura;Humedad;CO2'
            : `Fecha;Hora;${sensorConfig.map(sv => sv.variable.nombre).join(';')}`;
          erroresLinea.push({ linea: i + 1, error: `Se esperan ${camposMinimos} campos: ${esperados}`, contenido: linea });
          continue;
        }

        const fechaStr = campos[0];
        const horaStr = campos[1];
        const valoresCampos = campos.slice(2); // Todo después de Fecha;Hora

        // Parsear fecha
        const fechaParts = fechaStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!fechaParts) {
          erroresLinea.push({ linea: i + 1, error: 'Formato de fecha inválido (esperado DD/MM/YYYY)', contenido: linea });
          continue;
        }

        const horaParts = horaStr.match(/^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i);
        if (!horaParts) {
          erroresLinea.push({ linea: i + 1, error: 'Formato de hora inválido (esperado HH:MM:SS o HH:MM:SS AM/PM)', contenido: linea });
          continue;
        }

        let horas = parseInt(horaParts[1]);
        const minutos = parseInt(horaParts[2]);
        const segundos = parseInt(horaParts[3]);
        const ampm = horaParts[4];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && horas !== 12) horas += 12;
          if (ampm.toUpperCase() === 'AM' && horas === 12) horas = 0;
        }

        const lectura_datetime = new Date(parseInt(fechaParts[3]), parseInt(fechaParts[2]) - 1, parseInt(fechaParts[1]), horas, minutos, segundos);
        if (isNaN(lectura_datetime.getTime())) {
          erroresLinea.push({ linea: i + 1, error: 'Fecha/hora resultante inválida', contenido: linea });
          continue;
        }

        // Parsear valores de variables
        const valores = {};
        let valoresValidos = true;

        if (usarLegacy) {
          // Formato legacy: Temperatura;Humedad;CO2
          valores.temperatura = parseFloat(valoresCampos[0]);
          valores.humedad = parseFloat(valoresCampos[1]);
          valores.co2_nivel = parseInt(valoresCampos[2]);
          if (isNaN(valores.temperatura) || isNaN(valores.humedad) || isNaN(valores.co2_nivel)) {
            erroresLinea.push({ linea: i + 1, error: 'Valores numéricos inválidos', contenido: linea });
            continue;
          }
        } else {
          // Formato dinámico según configuración del sensor
          for (let j = 0; j < sensorConfig.length; j++) {
            const sv = sensorConfig[j];
            const valorStr = valoresCampos[j];
            if (valorStr === undefined || valorStr === '') {
              valores[sv.variable.codigo] = null;
              continue;
            }
            const valor = parseFloat(valorStr);
            if (isNaN(valor)) {
              erroresLinea.push({ linea: i + 1, error: `Valor inválido para ${sv.variable.nombre}: "${valorStr}"`, contenido: linea });
              valoresValidos = false;
              break;
            }
            valores[sv.variable.codigo] = valor;
          }
          if (!valoresValidos) continue;
        }

        registrosValidos.push({
          lectura_datetime,
          valores,
          clave: `${fechaStr}|${horaStr}`,
          lineaOriginal: linea
        });
      }

      if (registrosValidos.length === 0) {
        return res.status(400).json({ status: 'error', mensaje: 'Ninguna fila válida encontrada en el CSV', errores: erroresLinea });
      }

      // --- Deduplicar contra archivo CSV ---
      const nombreArchivo = `${xFecha}.csv`;
      const rutaArchivo = path.join(DATOS_DIR, nombreArchivo);
      if (!fs.existsSync(DATOS_DIR)) fs.mkdirSync(DATOS_DIR, { recursive: true });

      const clavesExistentes = new Set();
      if (fs.existsSync(rutaArchivo)) {
        const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
        for (const linea of contenido.trim().split('\n').filter(l => l.trim())) {
          const c = linea.split(';');
          if (c.length >= 2) clavesExistentes.add(`${c[0].trim()}|${c[1].trim()}`);
        }
      }

      const nuevos = [];
      let duplicadas = 0;
      for (const reg of registrosValidos) {
        if (clavesExistentes.has(reg.clave)) { duplicadas++; }
        else { nuevos.push(reg); clavesExistentes.add(reg.clave); }
      }

      // --- Guardar CSV ---
      if (nuevos.length > 0) {
        fs.appendFileSync(rutaArchivo, nuevos.map(r => r.lineaOriginal).join('\n') + '\n', 'utf-8');
      }

      // --- Guardar en BD ---
      if (nuevos.length > 0) {
        for (const reg of nuevos) {
          // Datos legacy para tabla lecturas (backward compatible)
          const lecturaData = {
            id_sensor: idSensor,
            lectura_datetime: reg.lectura_datetime,
            temperatura: reg.valores.temperatura ?? reg.valores[LEGACY_COLUMNS.temperatura] ?? null,
            humedad: reg.valores.humedad ?? reg.valores[LEGACY_COLUMNS.humedad] ?? null,
            co2_nivel: reg.valores.co2_nivel ?? reg.valores.co2 ?? null,
            co_nivel: reg.valores.co_nivel ?? reg.valores.co ?? null,
            latitud: null, longitud: null, altitud: null, zona: null
          };

          const lectura = await prisma.lecturas.create({ data: lecturaData });

          // Guardar TODOS los valores en lectura_valores (incluyendo legacy)
          if (sensorConfig.length > 0) {
            const valoresInsertar = sensorConfig
              .filter(sv => reg.valores[sv.variable.codigo] != null)
              .map(sv => ({
                id_lectura: lectura.id_lectura,
                id_variable: sv.id_variable,
                valor: reg.valores[sv.variable.codigo]
              }));

            if (valoresInsertar.length > 0) {
              await prisma.lectura_valores.createMany({ data: valoresInsertar });
              console.log(`  lectura_valores: ${valoresInsertar.length} valores guardados (${valoresInsertar.map(v => v.valor).join(', ')})`);
            }
          }
        }

        // Actualizar last_seen del sensor
        if (idSensor) {
          await prisma.sensores.update({
            where: { id_sensor: idSensor },
            data: { last_seen: new Date(), estado: 'Activo' }
          }).catch(() => {});
        }
      }

      console.log(`POST /api/datos - ${xFecha}: ${nuevos.length} nuevos, ${duplicadas} duplicados` + (usarLegacy ? ' (legacy)' : ` (${sensorConfig.length} vars)`));

      res.status(200).json({
        status: 'ok',
        mensaje: `${nuevos.length} registros guardados`,
        fecha: xFecha,
        filas_procesadas: nuevos.length,
        duplicadas,
        archivo: nombreArchivo,
        formato: usarLegacy ? 'legacy (Fecha;Hora;Temp;Hum;CO2)' : `dinámico (${sensorConfig.map(sv => sv.variable.codigo).join(';')})`,
        ...(erroresLinea.length > 0 && { filas_con_error: erroresLinea.length, errores: erroresLinea })
      });

    } catch (error) {
      console.error('Error en datosController.recibir:', error);
      res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor al procesar los datos' });
    }
  }
};

module.exports = datosController;
