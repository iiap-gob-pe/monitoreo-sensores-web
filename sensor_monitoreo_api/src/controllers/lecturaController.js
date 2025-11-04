// src/controllers/lecturaController.js - Controlador para gestión de lecturas ambientales
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const lecturaController = {
  // Crear nueva lectura (Endpoint principal para ESP32)
  crear: async (req, res) => {
    try {
      const {
        id_sensor,
        temperatura,
        humedad,
        co2_nivel,
        co_nivel,
        latitud,
        longitud,
        altitud,
        zona
      } = req.body;

      // Validar campos requeridos
      if (!id_sensor) {
        return res.status(400).json({
          success: false,
          message: 'El campo id_sensor es obligatorio'
        });
      }

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
          console.error(`❌ Error al auto-registrar sensor ${id_sensor}:`, createError);
          return res.status(500).json({
            success: false,
            message: 'Error al registrar el nuevo sensor',
            error: createError.message
          });
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

      const skip = (parseInt(pagina) - 1) * parseInt(limite);

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
          take: parseInt(limite)
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
          limite: parseInt(limite),
          total_paginas: Math.ceil(total / parseInt(limite))
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
      const limite = parseInt(req.query.limite) || 100000;

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
          tipo_sensor,      // ✅ Nuevo: móvil o estacionario
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
          switch(parametro.toLowerCase()) {
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

        // ✅ Filtro por tipo de sensor (móvil o estacionario)
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
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        });

      } catch (error) {
        console.error('Error al obtener lecturas avanzado:', error);
        res.status(500).json({ 
          success: false,
          message: 'Error al obtener lecturas',
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
        switch(parametro.toLowerCase()) {
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