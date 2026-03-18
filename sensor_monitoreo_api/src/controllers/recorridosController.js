const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const recorridosController = {
  // Obtener recorrido por fecha
  obtenerPorFecha: async (req, res) => {
    try {
      const { id_sensor, fecha } = req.query;
      
      if (!id_sensor || !fecha) {
        return res.status(400).json({
          success: false,
          message: 'id_sensor y fecha son requeridos'
        });
      }

      // ✅ Parsear fecha sin zona horaria
        const [year, month, day] = fecha.split('-').map(Number);

        const fechaInicio = new Date(year, month - 1, day, 0, 0, 0, 0);
        const fechaFin = new Date(year, month - 1, day, 23, 59, 59, 999);

        console.log('📅 Buscando recorrido:', {
          id_sensor,
          fecha,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString()
        });

      const lecturas = await prisma.lecturas.findMany({
        where: {
          id_sensor,
          lectura_datetime: {
            gte: fechaInicio,
            lte: fechaFin
          },
          latitud: { not: null },
          longitud: { not: null }
        },
        orderBy: {
          lectura_datetime: 'asc'
        },
        select: {
          lectura_datetime: true,
          latitud: true,
          longitud: true,
          temperatura: true,
          humedad: true,
          co2_nivel: true,
          co_nivel: true,
          altitud: true
        }
      });

      // ✅ ESTE LOG DEBE ESTAR AQUÍ
        console.log(`📍 Lecturas encontradas para ${id_sensor}: ${lecturas.length}`);
        if (lecturas.length > 0) {
          console.log('Primera lectura:', lecturas[0]);
        }

      if (lecturas.length === 0) {
        return res.json({
          success: true,
          message: 'No hay recorrido para esta fecha',
          data: []
        });
      }

      // Filtrado por distancia (Downsampling basado en variación espacial)
      // Solo agregamos puntos si la distancia con el anterior es > 5 metros (0.005 km)
      const lecturasFiltradas = [];
      let distanciaTotal = 0;
      
      if (lecturas.length > 0) {
        lecturasFiltradas.push(lecturas[0]); // Siempre incluir el primer punto

        let ultimoPuntoAgregado = lecturas[0];

        for (let i = 1; i < lecturas.length; i++) {
          const puntoActual = lecturas[i];
          const distParaTotal = calcularDistancia(
            lecturas[i-1].latitud, lecturas[i-1].longitud,
            puntoActual.latitud, puntoActual.longitud
          );
          distanciaTotal += distParaTotal;

          const distDesdeUltimoAgregado = calcularDistancia(
            ultimoPuntoAgregado.latitud, ultimoPuntoAgregado.longitud,
            puntoActual.latitud, puntoActual.longitud
          );

          // Agregar al arreglo filtrado si cambió de posición más de 5 metros
          if (distDesdeUltimoAgregado > 0.005) {
            lecturasFiltradas.push(puntoActual);
            ultimoPuntoAgregado = puntoActual;
          }
        }
        
        // Asegurarnos de incluir el último punto si no se agregó ya
        if (ultimoPuntoAgregado !== lecturas[lecturas.length - 1]) {
           lecturasFiltradas.push(lecturas[lecturas.length - 1]);
        }
      }

      console.log(`📉 Puntos originales: ${lecturas.length} -> Tras filtro de 5m: ${lecturasFiltradas.length}`);

      res.json({
        success: true,
        data: lecturasFiltradas,
        metadata: {
          total_puntos: lecturasFiltradas.length,
          distancia_km: distanciaTotal.toFixed(2),
          hora_inicio: lecturas[0].lectura_datetime,
          hora_fin: lecturas[lecturas.length - 1].lectura_datetime,
          duracion_minutos: Math.round(
            (new Date(lecturas[lecturas.length - 1].lectura_datetime) - 
             new Date(lecturas[0].lectura_datetime)) / 60000
          )
        }
      });

    } catch (error) {
      console.error('Error al obtener recorrido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener recorrido',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Guardar recorrido
  guardar: async (req, res) => {
    try {
      const {
        id_sensor,
        nombre_recorrido,
        fecha_recorrido,
        hora_inicio,
        hora_fin,
        puntos,
        metadata,
        usuario_creo
      } = req.body;

      if (!id_sensor || !nombre_recorrido || !fecha_recorrido || !puntos) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos'
        });
      }

      // Calcular distancia
      let distancia = 0;
      for (let i = 1; i < puntos.length; i++) {
        distancia += calcularDistancia(
          puntos[i-1].latitud, puntos[i-1].longitud,
          puntos[i].latitud, puntos[i].longitud
        );
      }

      const duracion = Math.round(
        (new Date(hora_fin) - new Date(hora_inicio)) / 60000
      );

      const recorrido = await prisma.recorridos_guardados.create({
        data: {
          id_sensor,
          nombre_recorrido,
          fecha_recorrido: new Date(fecha_recorrido),
          hora_inicio: new Date(hora_inicio),
          hora_fin: new Date(hora_fin),
          total_puntos: puntos.length,
          distancia_km: distancia,
          duracion_minutos: duracion,
          puntos_geojson: puntos,
          metadata: metadata || {},
          usuario_creo: usuario_creo || 'sistema'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Recorrido guardado exitosamente',
        data: recorrido
      });

    } catch (error) {
      console.error('Error al guardar recorrido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar recorrido',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Listar recorridos guardados
  listar: async (req, res) => {
    try {
      const { id_sensor, fecha_desde, fecha_hasta } = req.query;

      const filtros = {};
      if (id_sensor) filtros.id_sensor = id_sensor;
      if (fecha_desde && fecha_hasta) {
        filtros.fecha_recorrido = {
          gte: new Date(fecha_desde),
          lte: new Date(fecha_hasta)
        };
      }

      const recorridos = await prisma.recorridos_guardados.findMany({
        where: filtros,
        orderBy: {
          fecha_recorrido: 'desc'
        },
        select: {
          id_recorrido: true,
          id_sensor: true,
          nombre_recorrido: true,
          fecha_recorrido: true,
          hora_inicio: true,
          hora_fin: true,
          total_puntos: true,
          distancia_km: true,
          duracion_minutos: true,
          created_at: true
        }
      });

      res.json({
        success: true,
        data: recorridos,
        total: recorridos.length
      });

    } catch (error) {
      console.error('Error al listar recorridos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar recorridos',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Obtener un recorrido específico
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const recorrido = await prisma.recorridos_guardados.findUnique({
        where: {
          id_recorrido: parseInt(id)
        }
      });

      if (!recorrido) {
        return res.status(404).json({
          success: false,
          message: 'Recorrido no encontrado'
        });
      }

      res.json({
        success: true,
        data: recorrido
      });

    } catch (error) {
      console.error('Error al obtener recorrido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener recorrido',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  },

  // Eliminar recorrido
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.recorridos_guardados.delete({
        where: {
          id_recorrido: parseInt(id)
        }
      });

      res.json({
        success: true,
        message: 'Recorrido eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar recorrido:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar recorrido',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }
};

// Fórmula de Haversine para calcular distancia
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = recorridosController;