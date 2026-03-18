// src/controllers/datosController.js - Controlador para ingesta CSV desde ESP32
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Directorio donde se almacenan los CSV
const DATOS_DIR = path.join(__dirname, '..', '..', 'datos');

const datosController = {
  /**
   * POST /api/datos
   * Recibe CSV crudo desde ESP32, deduplicar por Fecha+Hora,
   * guarda en archivo local y en base de datos.
   */
  recibir: async (req, res) => {
    try {
      // --- Validar header X-Fecha ---
      const xFecha = req.headers['x-fecha'];
      if (!xFecha || !/^\d{8}$/.test(xFecha)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'Header X-Fecha es obligatorio y debe tener formato YYYYMMDD'
        });
      }

      // Validar que la fecha sea coherente
      const anio = parseInt(xFecha.substring(0, 4));
      const mes = parseInt(xFecha.substring(4, 6));
      const dia = parseInt(xFecha.substring(6, 8));
      const fechaObj = new Date(anio, mes - 1, dia);
      if (fechaObj.getFullYear() !== anio || fechaObj.getMonth() !== mes - 1 || fechaObj.getDate() !== dia) {
        return res.status(400).json({
          status: 'error',
          mensaje: `Fecha inválida en X-Fecha: ${xFecha}`
        });
      }

      // --- Validar body ---
      const bodyTexto = req.body;
      if (!bodyTexto || typeof bodyTexto !== 'string' || bodyTexto.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'El body no puede estar vacío. Envíe texto CSV con separador ";"'
        });
      }

      // --- Parsear filas CSV ---
      const lineas = bodyTexto.trim().split('\n').filter(l => l.trim().length > 0);
      if (lineas.length === 0) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'No se encontraron filas en el CSV'
        });
      }

      const registrosValidos = [];
      const erroresLinea = [];

      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        const campos = linea.split(';');

        if (campos.length < 5) {
          erroresLinea.push({ linea: i + 1, error: 'Se esperan 5 campos: Fecha;Hora;Temperatura;Humedad;CO2', contenido: linea });
          continue;
        }

        const [fechaStr, horaStr, tempStr, humStr, co2Str] = campos.map(c => c.trim());

        // Validar campos numéricos
        const temperatura = parseFloat(tempStr);
        const humedad = parseFloat(humStr);
        const co2 = parseInt(co2Str);

        if (isNaN(temperatura) || isNaN(humedad) || isNaN(co2)) {
          erroresLinea.push({ linea: i + 1, error: 'Valores numéricos inválidos', contenido: linea });
          continue;
        }

        // Parsear fecha y hora: "16/03/2025" + "08:00:00 AM"
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

        const lectura_datetime = new Date(
          parseInt(fechaParts[3]),   // año
          parseInt(fechaParts[2]) - 1, // mes (0-indexed)
          parseInt(fechaParts[1]),   // día
          horas, minutos, segundos
        );

        if (isNaN(lectura_datetime.getTime())) {
          erroresLinea.push({ linea: i + 1, error: 'Fecha/hora resultante inválida', contenido: linea });
          continue;
        }

        registrosValidos.push({
          lectura_datetime,
          temperatura,
          humedad,
          co2_nivel: co2,
          clave: `${fechaStr}|${horaStr}`, // clave para deduplicar
          lineaOriginal: linea
        });
      }

      if (registrosValidos.length === 0) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'Ninguna fila válida encontrada en el CSV',
          errores: erroresLinea
        });
      }

      // --- Deduplicar contra archivo CSV existente ---
      const nombreArchivo = `${xFecha}.csv`;
      const rutaArchivo = path.join(DATOS_DIR, nombreArchivo);

      // Asegurar que el directorio existe
      if (!fs.existsSync(DATOS_DIR)) {
        fs.mkdirSync(DATOS_DIR, { recursive: true });
      }

      // Leer claves existentes del archivo (si existe)
      const clavesExistentes = new Set();
      if (fs.existsSync(rutaArchivo)) {
        const contenidoExistente = fs.readFileSync(rutaArchivo, 'utf-8');
        const lineasExistentes = contenidoExistente.trim().split('\n').filter(l => l.trim().length > 0);
        for (const linea of lineasExistentes) {
          const campos = linea.split(';');
          if (campos.length >= 2) {
            clavesExistentes.add(`${campos[0].trim()}|${campos[1].trim()}`);
          }
        }
      }

      // Filtrar duplicados
      const nuevos = [];
      let duplicadas = 0;

      for (const reg of registrosValidos) {
        if (clavesExistentes.has(reg.clave)) {
          duplicadas++;
        } else {
          nuevos.push(reg);
          clavesExistentes.add(reg.clave); // evitar duplicados dentro del mismo envío
        }
      }

      // --- Guardar en archivo CSV ---
      if (nuevos.length > 0) {
        const lineasNuevas = nuevos.map(r => r.lineaOriginal).join('\n') + '\n';
        fs.appendFileSync(rutaArchivo, lineasNuevas, 'utf-8');
      }

      // --- Guardar en base de datos ---
      // Obtener id_sensor de la API Key autenticada
      const idSensor = req.apiKey?.id_sensor || null;

      if (nuevos.length > 0) {
        const datosInsertar = nuevos.map(r => ({
          id_sensor: idSensor,
          lectura_datetime: r.lectura_datetime,
          temperatura: r.temperatura,
          humedad: r.humedad,
          co2_nivel: r.co2_nivel,
          co_nivel: null,
          latitud: null,
          longitud: null,
          altitud: null,
          zona: null
        }));

        await prisma.lecturas.createMany({
          data: datosInsertar,
          skipDuplicates: true
        });

        // Actualizar last_seen del sensor
        if (idSensor) {
          await prisma.sensores.update({
            where: { id_sensor: idSensor },
            data: { last_seen: new Date(), estado: 'Activo' }
          }).catch(() => {});
        }
      }

      console.log(`📥 POST /api/datos - ${xFecha}: ${nuevos.length} nuevos, ${duplicadas} duplicados`);

      // --- Respuesta ---
      res.status(200).json({
        status: 'ok',
        mensaje: `${nuevos.length} registros guardados`,
        fecha: xFecha,
        filas_procesadas: nuevos.length,
        duplicadas,
        archivo: nombreArchivo,
        ...(erroresLinea.length > 0 && { filas_con_error: erroresLinea.length, errores: erroresLinea })
      });

    } catch (error) {
      console.error('Error en datosController.recibir:', error);
      res.status(500).json({
        status: 'error',
        mensaje: 'Error interno del servidor al procesar los datos'
      });
    }
  }
};

module.exports = datosController;
