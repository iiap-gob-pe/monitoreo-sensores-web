// src/controllers/lecturaController.js - Controlador para gestión de lecturas ambientales
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const lecturaController = {
  // Crear nueva lectura (Endpoint principal para ESP32)
  crear: async (req, res) => {
    try {
      const {
        temperatura,
        humedad,
        co2_nivel,
        co_nivel,
        latitud,
        longitud,
        altitud,
        zona
      } = req.body;

      // 🔐 OBTENER ID DEL SENSOR
      let id_sensor = req.apiKey.id_sensor;
      const id_sensor_body = req.body.id_sensor; // El sensor debe enviar su ID en el body
      let needsBinding = false;

      // 🆕 AUTO-BINDING: Si la API Key no tiene sensor asociado, marcaremos para asociar
      if (!id_sensor) {
        if (!id_sensor_body) {
          return res.status(400).json({
            success: false,
            message: 'Primera conexión: Debe enviar id_sensor en el cuerpo para vincularlo a la API Key'
          });
        }
        id_sensor = id_sensor_body;
        needsBinding = true;
      } else {
        // Si la key ya tiene sensor, VERIFICAR que coincida con el que envía (si envía)
        if (id_sensor_body && id_sensor_body !== id_sensor) {
          console.warn(`⚠️ Mismatch: API Key es de ${id_sensor}, pero request dice ${id_sensor_body}. Usando el de la Key.`);
        }
      }

      console.log(`🔐 Lectura recibida para sensor: ${id_sensor} (API Key: ${req.apiKey.nombre})`);

      // 🆕 PASO 1: Verificar si el sensor existe
      let sensor = await prisma.sensores.findUnique({
        where: { id_sensor }
      });

      // 🆕 PASO 2: Si no existe, AUTO-REGISTRARLO
      if (!sensor) {
        console.log(`🆕 Nuevo sensor detectado: ${id_sensor} - Iniciando auto-registro...`);

        try {
          sensor = await prisma.sensores.create({
            data: {
              id_sensor: id_sensor,
              nombre_sensor: `Sensor ${id_sensor}`,
              zona: zona || 'Urbana',
              is_movil: true, // Por defecto móvil, se ajustará automáticamente
              estado: 'Activo',
              description: 'Sensor auto-registrado al enviar primera lectura',
              last_seen: new Date()
            }
          });

          console.log(`✅ Sensor ${id_sensor} registrado exitosamente`);
        } catch (createError) {
          // Si el error es por clave duplicada (código P2002), significa que otro proceso
          // ya creó el sensor (race condition). En ese caso, simplemente buscarlo de nuevo.
          if (createError.code === 'P2002') {
            console.log(`⚠️ Sensor ${id_sensor} ya fue registrado por otro proceso. Buscando...`);
            sensor = await prisma.sensores.findUnique({
              where: { id_sensor }
            });

            if (!sensor) {
              // Esto no debería pasar, pero por seguridad
              console.error(`❌ Error crítico: Sensor ${id_sensor} no encontrado después de duplicate key`);
              return res.status(500).json({
                success: false,
                message: 'Error al verificar sensor',
                code: 'SENSOR_NOT_FOUND_AFTER_DUPLICATE'
              });
            }

            console.log(`✅ Sensor ${id_sensor} encontrado correctamente`);
          } else {
            // Cualquier otro error es un problema real
            console.error(`❌ Error al auto-registrar sensor ${id_sensor}:`, createError);
            return res.status(500).json({
              success: false,
              message: 'Error al registrar el nuevo sensor',
              error: createError.message
            });
          }
        }
      } else {
        // 🔄 PASO 3: Actualizar última conexión y detectar movilidad
        try {
          // Obtener últimas 5 lecturas del sensor para detectar movimiento
          const ultimasLecturas = await prisma.lecturas.findMany({
            where: { id_sensor },
            orderBy: { lectura_datetime: 'desc' },
            take: 5,
            select: { latitud: true, longitud: true }
          });

          // Determinar si es móvil basado en variación de coordenadas
          let esMovil = sensor.is_movil; // Mantener valor actual por defecto

          if (ultimasLecturas.length >= 3 && latitud && longitud) {
            const coordenadasUnicas = new Set(
              ultimasLecturas
                .filter(l => l.latitud && l.longitud)
                .map(l => `${l.latitud.toFixed(4)},${l.longitud.toFixed(4)}`)
            );

            // Si hay más de 1 coordenada diferente (tolerancia de 4 decimales ≈ 11 metros)
            esMovil = coordenadasUnicas.size > 1;

            console.log(`📍 Sensor ${id_sensor}: ${esMovil ? 'Móvil' : 'Fijo'} detectado (${coordenadasUnicas.size} ubicaciones)`);
          }

          await prisma.sensores.update({
            where: { id_sensor },
            data: {
              last_seen: new Date(),
              estado: 'Activo',
              is_movil: esMovil // Actualizar según movimiento detectado
            }
          });
        } catch (updateError) {
          console.error(`⚠️ Error al actualizar sensor ${id_sensor}:`, updateError);
        }
      }

      // 🔗 PASO 3.5: Si es primera vez, VINCULAR API Key al Sensor (ahora que seguro existe)
      if (needsBinding) {
        console.log(`🔗 Vinculando API Key '${req.apiKey.nombre}' al sensor '${id_sensor}'...`);
        try {
          await prisma.api_keys.update({
            where: { id_api_key: req.apiKey.id },
            data: { id_sensor: id_sensor }
          });
          console.log(`✅ Vinculación exitosa.`);
        } catch (bindError) {
          console.error('Error al vincular sensor a API Key:', bindError);
          return res.status(409).json({
            success: false,
            message: 'Error al vincular: Este sensor ya podría estar asociado a otra API Key o hubo un conflicto.',
            error: bindError.message,
            code: bindError.code
          });
        }
      }

      // 📊 PASO 4: Insertar la lectura
      const nuevaLectura = await prisma.lecturas.create({
        data: {
          id_sensor,
          temperatura: temperatura ? parseFloat(temperatura) : null,
          humedad: humedad ? parseFloat(humedad) : null,
          co2_nivel: co2_nivel ? parseInt(co2_nivel) : null,
          co_nivel: co_nivel ? parseFloat(co_nivel) : null,
          latitud: latitud ? parseFloat(latitud) : null,
          longitud: longitud ? parseFloat(longitud) : null,
          altitud: altitud ? parseFloat(altitud) : null,
          zona: zona || sensor.zona || 'Urbana',
          lectura_datetime: new Date()
        }
      });

      // ✅ Respuesta exitosa
      res.status(201).json({
        success: true,
        message: sensor.created_at && (new Date() - new Date(sensor.created_at)) < 5000
          ? 'Nuevo sensor registrado y lectura guardada'
          : 'Lectura registrada exitosamente',
        data: nuevaLectura,
        sensor_info: {
          id: sensor.id_sensor,
          nombre: sensor.nombre_sensor,
          es_nuevo: sensor.created_at && (new Date() - new Date(sensor.created_at)) < 5000
        }
      });

    } catch (error) {
      console.error('❌ Error en lecturasController.crear:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al procesar la lectura',
        error: error.message
      });
    }
  },

  // Obtener todas las lecturas con filtros
  obtenerTodas: async (req, res) => {
    try {
      const {
        id_sensor,
        fecha_inicio,
        fecha_fin,
        zona,
        limite = 100,
        pagina = 1
      } = req.query;

      const limitVal = Math.min(parseInt(limite) || 100, 5000); // Cap at 5000
      const skip = (parseInt(pagina) - 1) * limitVal;

      const filtros = {
        ...(id_sensor && { id_sensor: id_sensor }),
        ...(zona && { zona }),
        ...(fecha_inicio && fecha_fin && {
          lectura_datetime: {
            gte: new Date(fecha_inicio),
            lte: new Date(fecha_fin)
          }
        })
      };

      const [lecturas, total] = await Promise.all([
        prisma.lecturas.findMany({
          where: filtros,
          include: {
            sensor: {
              select: {
                nombre_sensor: true,
                zona: true,
                is_movil: true
              }
            }
          },
          orderBy: {
            lectura_datetime: 'desc'
          },
          skip,
          take: limitVal
        }),
        prisma.lecturas.count({ where: filtros })
      ]);

      res.status(200).json({
        success: true,
        message: 'Lecturas obtenidas exitosamente',
        data: lecturas,
        pagination: {
          total,
          pagina: parseInt(pagina),
          limite: limitVal,
          total_paginas: Math.ceil(total / limitVal)
        }
      });

    } catch (error) {
      console.error('Error al obtener lecturas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener lecturas de un sensor específico
  obtenerPorSensor: async (req, res) => {
    try {
      const { id } = req.params;
      const { limite = 50 } = req.query;

      const lecturas = await prisma.lecturas.findMany({
        where: { id_sensor: id },
        include: {
          sensor: {
            select: {
              nombre_sensor: true,
              zona: true,
              is_movil: true
            }
          }
        },
        orderBy: {
          lectura_datetime: 'desc'
        },
        take: parseInt(limite)
      });

      if (lecturas.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No se encontraron lecturas para el sensor ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lecturas del sensor obtenidas exitosamente',
        data: lecturas,
        total: lecturas.length
      });

    } catch (error) {
      console.error('Error al obtener lecturas del sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener últimas N lecturas de todos los sensores
  obtenerUltimas: async (req, res) => {
    try {
      // Límite interno máximo de 5000 para evitar que el request tumbe la BD/RAM
      const limite = Math.min(parseInt(req.query.limite) || 1000, 5000);

      const lecturas = await prisma.lecturas.findMany({
        include: {
          sensor: {
            select: {
              id_sensor: true,
              nombre_sensor: true,
              zona: true,
              is_movil: true,
              estado: true
            }
          }
        },
        orderBy: {
          lectura_datetime: 'desc'
        },
        take: limite
      });

      // Transformar datos para mantener compatibilidad con el frontend
      const lecturasFormateadas = lecturas.map(lectura => ({
        id_sensor: lectura.id_sensor,
        nombre_sensor: lectura.sensor.nombre_sensor,
        zona: lectura.zona || lectura.sensor.zona,
        is_movil: lectura.sensor.is_movil,
        estado: lectura.sensor.estado,
        lectura_datetime: lectura.lectura_datetime,
        temperatura: lectura.temperatura,
        humedad: lectura.humedad,
        co2_nivel: lectura.co2_nivel,
        co_nivel: lectura.co_nivel,
        latitud: lectura.latitud,
        longitud: lectura.longitud,
        altitud: lectura.altitud
      }));

      res.status(200).json({
        success: true,
        message: 'Últimas lecturas obtenidas exitosamente',
        data: lecturasFormateadas,
        total: lecturasFormateadas.length
      });

    } catch (error) {
      console.error('Error al obtener últimas lecturas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  obtenerActuales: async (req, res) => {
    try {
      // ✅ OPTIMIZADO: Consulta uno a uno los sensores activos con LIMIT 1 usando su Indexed Column
      // En vez de obligar a PostgreSQL a realizar un escaneo y agrupamiento (DISTINCT) de ~100k registros (Lento: +8 segundos)
      const sensores = await prisma.sensores.findMany({ select: { id_sensor: true } });
      const currentReadingsPromises = sensores.map(sensor => 
        prisma.lecturas.findFirst({
          where: { id_sensor: sensor.id_sensor },
          orderBy: { lectura_datetime: 'desc' },
          include: {
            sensor: {
              select: { id_sensor: true, nombre_sensor: true, zona: true, is_movil: true, estado: true }
            }
          }
        })
      );
      
      const lecturasCrudas = await Promise.all(currentReadingsPromises);
      const lecturas = lecturasCrudas.filter(l => l !== null);

      const lecturasFormateadas = lecturas.map(lectura => ({
        id_sensor: lectura.id_sensor,
        nombre_sensor: lectura.sensor.nombre_sensor,
        zona: lectura.zona || lectura.sensor.zona,
        is_movil: lectura.sensor.is_movil,
        estado: lectura.sensor.estado,
        lectura_datetime: lectura.lectura_datetime,
        temperatura: lectura.temperatura,
        humedad: lectura.humedad,
        co2_nivel: lectura.co2_nivel,
        co_nivel: lectura.co_nivel,
        latitud: lectura.latitud,
        longitud: lectura.longitud,
        altitud: lectura.altitud
      }));

      // Ordenar por fecha de lectura real descendente (opcional, como prefiera el cliente)
      lecturasFormateadas.sort((a, b) => new Date(b.lectura_datetime) - new Date(a.lectura_datetime));

      res.status(200).json({
        success: true,
        message: 'Lecturas actuales obtenidas exitosamente',
        data: lecturasFormateadas,
        total: lecturasFormateadas.length
      });
    } catch (error) {
      console.error('Error al obtener lecturas actuales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener fechas únicas con lecturas registradas (para calendarios)
  obtenerFechas: async (req, res) => {
    try {
      // Uso de query raw para usar TO_CHAR y extraer fechas unícas velozmente
      // Evita descargar un millón de items
      const result = await prisma.$queryRaw`
        SELECT DISTINCT TO_CHAR(lectura_datetime, 'YYYY-MM-DD') as fecha 
        FROM lecturas 
        WHERE lectura_datetime IS NOT NULL 
        ORDER BY fecha DESC
      `;
      
      const fechas = result.map(row => row.fecha);

      res.status(200).json({
        success: true,
        message: 'Fechas obtenidas exitosamente',
        data: fechas
      });
    } catch (error) {
      console.error('Error al obtener fechas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener estadísticas de un sensor
  obtenerEstadisticas: async (req, res) => {
    try {
      const { id } = req.params;
      const { dias = 7 } = req.query;

      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

      const estadisticas = await prisma.lecturas.aggregate({
        where: {
          id_sensor: id,
          lectura_datetime: {
            gte: fechaInicio
          }
        },
        _avg: {
          temperatura: true,
          humedad: true,
          co2_nivel: true,
          co_nivel: true
        },
        _max: {
          temperatura: true,
          humedad: true,
          co2_nivel: true,
          co_nivel: true
        },
        _min: {
          temperatura: true,
          humedad: true,
          co2_nivel: true,
          co_nivel: true
        },
        _count: true
      });

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          periodo_dias: parseInt(dias),
          total_lecturas: estadisticas._count,
          promedios: estadisticas._avg,
          maximos: estadisticas._max,
          minimos: estadisticas._min
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener lecturas con filtros avanzados y paginación (usando Prisma)
  obtenerLecturasAvanzado: async (req, res) => {
    try {
      const {
        id_sensor,
        parametro,
        fecha_inicio,
        fecha_fin,
        tipo_sensor,      // ✅ Nuevo: móvil o fijo
        page = 1,
        limit = 50,
        sort_by = 'lectura_datetime',
        sort_order = 'DESC'
      } = req.query;

      // Construir filtros dinámicamente
      const filtros = {};

      if (id_sensor) {
        filtros.id_sensor = id_sensor;
      }

      if (fecha_inicio && fecha_fin) {
        filtros.lectura_datetime = {
          gte: new Date(fecha_inicio),
          lte: new Date(fecha_fin)
        };
      } else if (fecha_inicio) {
        filtros.lectura_datetime = {
          gte: new Date(fecha_inicio)
        };
      } else if (fecha_fin) {
        filtros.lectura_datetime = {
          lte: new Date(fecha_fin)
        };
      }

      // ✅ Filtro por parámetro específico
      if (parametro) {
        switch (parametro.toLowerCase()) {
          case 'temperatura':
            filtros.temperatura = { not: null };
            break;
          case 'humedad':
            filtros.humedad = { not: null };
            break;
          case 'co2':
            filtros.co2_nivel = { not: null };
            break;
          case 'co':
            filtros.co_nivel = { not: null };
            break;
        }
      }

      // ✅ Filtro por tipo de sensor (móvil o fijo)
      const sensorWhere = {};
      if (tipo_sensor !== undefined && tipo_sensor !== '') {
        sensorWhere.is_movil = tipo_sensor === 'movil';
      }

      // Determinar ordenamiento
      const validSortColumns = ['lectura_datetime', 'temperatura', 'humedad', 'co2_nivel', 'co_nivel', 'id_sensor'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'lectura_datetime';
      const order = sort_order.toUpperCase() === 'ASC' ? 'asc' : 'desc';

      // ✅ Construir where completo
      const whereClause = {
        ...filtros,
        ...(Object.keys(sensorWhere).length > 0 && { sensor: sensorWhere })
      };

      // Obtener total de registros y lecturas paginadas
      const [total, lecturas] = await Promise.all([
        prisma.lecturas.count({ where: whereClause }),
        prisma.lecturas.findMany({
          where: whereClause,
          include: {
            sensor: {
              select: {
                nombre_sensor: true,
                zona: true,
                is_movil: true,
                estado: true
              }
            }
          },
          orderBy: {
            [sortColumn]: order
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit)
        })
      ]);

      // Formatear datos para compatibilidad con frontend
      const lecturasFormateadas = lecturas.map(lectura => ({
        id_lectura: lectura.id_lectura,
        sensor_id: lectura.id_sensor,
        nombre_sensor: lectura.sensor.nombre_sensor,
        is_movil: lectura.sensor.is_movil,
        tipo_sensor: lectura.sensor.is_movil ? 'Móvil' : 'Fijo',
        sensor_estado: lectura.sensor.estado,
        lectura_datetime: lectura.lectura_datetime,
        temperatura: lectura.temperatura,
        humedad: lectura.humedad,
        co2_nivel: lectura.co2_nivel,
        co_nivel: lectura.co_nivel,
        latitud: lectura.latitud,
        longitud: lectura.longitud,
        altitud: lectura.altitud
      }));

      res.json({
        success: true,
        data: lecturasFormateadas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error al obtener lecturas avanzadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener lecturas avanzadas',
        error: error.message
      });
    }
  },

  // ✅ Nueva función: Agrupación en PostgreSQL para Mapas de Calor
  obtenerAgrupadasCalor: async (req, res) => {
    try {
      const { fecha, id_sensor } = req.query;

      if (!fecha) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro fecha es requerido'
        });
      }

      // Rango del día completo
      const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
      const fechaFin = new Date(`${fecha}T23:59:59.999Z`);

      const whereClause = {
        lectura_datetime: {
          gte: fechaInicio,
          lte: fechaFin
        },
        latitud: { not: null },
        longitud: { not: null }
      };

      if (id_sensor && id_sensor !== 'todos') {
        whereClause.id_sensor = id_sensor;
      }

      // Agrupamos usando Prisma y calculamos promedios
      const agrupaciones = await prisma.lecturas.groupBy({
        by: ['id_sensor'],
        where: whereClause,
        _avg: {
          temperatura: true,
          humedad: true,
          co2_nivel: true,
          co_nivel: true,
          latitud: true,
          longitud: true
        },
        _count: {
          id_lectura: true // Cantidad de lecturas por sensor
        }
      });

      // Formatear salida simplificada para el Frontend
      const lecturasAgrupadas = agrupaciones.map(g => ({
        id_sensor: g.id_sensor,
        latitud: Number(g._avg.latitud),
        longitud: Number(g._avg.longitud),
        temperatura: Number(g._avg.temperatura),
        humedad: Number(g._avg.humedad),
        co2_nivel: Number(g._avg.co2_nivel),
        co_nivel: Number(g._avg.co_nivel),
        cantidad_lecturas: g._count.id_lectura
      }));

      res.json({
        success: true,
        data: lecturasAgrupadas
      });
      
    } catch (error) {
      console.error('Error al agrupar lecturas para calor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al agrupar lecturas',
        error: error.message
      });
    }
  },
  //Obtención de todas las lecturas sin paginación
  obtenerParaExportar: async (req, res) => {
    try {
      const {
        id_sensor,
        parametro,
        fecha_inicio,
        fecha_fin,
        tipo_sensor
      } = req.query;

      // Construir filtros
      const filtros = {};

      if (id_sensor) {
        filtros.id_sensor = id_sensor;
      }

      if (fecha_inicio && fecha_fin) {
        filtros.lectura_datetime = {
          gte: new Date(fecha_inicio),
          lte: new Date(fecha_fin)
        };
      } else if (fecha_inicio) {
        filtros.lectura_datetime = {
          gte: new Date(fecha_inicio)
        };
      } else if (fecha_fin) {
        filtros.lectura_datetime = {
          lte: new Date(fecha_fin)
        };
      }

      if (parametro) {
        switch (parametro.toLowerCase()) {
          case 'temperatura':
            filtros.temperatura = { not: null };
            break;
          case 'humedad':
            filtros.humedad = { not: null };
            break;
          case 'co2':
            filtros.co2_nivel = { not: null };
            break;
          case 'co':
            filtros.co_nivel = { not: null };
            break;
        }
      }

      const sensorWhere = {};
      if (tipo_sensor !== undefined && tipo_sensor !== '') {
        sensorWhere.is_movil = tipo_sensor === 'movil';
      }

      const whereClause = {
        ...filtros,
        ...(Object.keys(sensorWhere).length > 0 && { sensor: sensorWhere })
      };

      // Obtener TODAS las lecturas sin límite
      const lecturas = await prisma.lecturas.findMany({
        where: whereClause,
        include: {
          sensor: {
            select: {
              nombre_sensor: true,
              zona: true,
              is_movil: true,
              estado: true
            }
          }
        },
        orderBy: {
          lectura_datetime: 'desc'
        }
        // Sin skip ni take - obtiene TODAS
      });

      // Formatear datos
      const lecturasFormateadas = lecturas.map(lectura => ({
        id_lectura: lectura.id_lectura,
        sensor_id: lectura.id_sensor,
        nombre_sensor: lectura.sensor.nombre_sensor,
        is_movil: lectura.sensor.is_movil,
        tipo_sensor: lectura.sensor.is_movil ? 'Móvil' : 'Estacionario',
        sensor_estado: lectura.sensor.estado,
        lectura_datetime: lectura.lectura_datetime,
        temperatura: lectura.temperatura,
        humedad: lectura.humedad,
        co2_nivel: lectura.co2_nivel,
        co_nivel: lectura.co_nivel,
        latitud: lectura.latitud,
        longitud: lectura.longitud,
        altitud: lectura.altitud
      }));

      res.json({
        success: true,
        data: lecturasFormateadas,
        total: lecturasFormateadas.length
      });

    } catch (error) {
      console.error('Error al obtener lecturas para exportar:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener lecturas',
        error: error.message
      });
    }
  }
};

// Función auxiliar para verificar umbrales
async function verificarUmbrales(id_sensor, valores) {
  try {
    const umbrales = await prisma.sensor_umbral.findMany({
      where: {
        id_sensor,
        alerta_habilitar: true
      }
    });

    for (const umbral of umbrales) {
      let valor_actual = null;
      let parametro_display = umbral.parametro_nombre;

      switch (umbral.parametro_nombre.toLowerCase()) {
        case 'temperatura':
          valor_actual = valores.temperatura;
          break;
        case 'humedad':
          valor_actual = valores.humedad;
          break;
        case 'co2':
          valor_actual = valores.co2_nivel;
          break;
        case 'co':
          valor_actual = valores.co_nivel;
          break;
      }

      if (valor_actual !== null) {
        const valor_num = parseFloat(valor_actual);
        let crear_alerta = false;
        let tipo_alerta = '';
        let valor_umbral = null;
        let gravedad = 'Medio';

        if (umbral.max_umbral && valor_num > parseFloat(umbral.max_umbral)) {
          crear_alerta = true;
          tipo_alerta = `high_${umbral.parametro_nombre.toLowerCase()}`;
          valor_umbral = parseFloat(umbral.max_umbral);
          gravedad = valor_num > (parseFloat(umbral.max_umbral) * 1.5) ? 'Critico' : 'Alto';
        } else if (umbral.min_umbral && valor_num < parseFloat(umbral.min_umbral)) {
          crear_alerta = true;
          tipo_alerta = `low_${umbral.parametro_nombre.toLowerCase()}`;
          valor_umbral = parseFloat(umbral.min_umbral);
          gravedad = 'Medio';
        }

        if (crear_alerta) {
          await prisma.alertas.create({
            data: {
              id_sensor,
              alerta_tipo: tipo_alerta,
              parametro_nombre: parametro_display,
              umbral_valor: valor_umbral,
              actual_valor: valor_num,
              mensaje: `${parametro_display} fuera de rango: ${valor_num} (umbral: ${valor_umbral})`,
              gravedad
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error al verificar umbrales:', error);
  }
}

// ✅ EXPORTACIÓN CORRECTA
module.exports = lecturaController;