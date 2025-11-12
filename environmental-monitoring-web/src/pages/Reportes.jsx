// src/pages/Reportes.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { lecturasAPI, sensoresAPI, alertasAPI } from '../services/api';
import { 
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {jsPDF} from 'jspdf';
import autoTable from'jspdf-autotable';
import html2canvas from 'html2canvas';

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [lecturas, setLecturas] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [menuExportarAbierto, setMenuExportarAbierto] = useState(false);
  
  // REFERENCIAS
  const graficoTendenciasRef = useRef(null);
  const graficoCO2Ref = useRef(null);
  const graficoCORef = useRef(null);
  const graficoComparativaRef = useRef(null);

  // Filtros
  const [tipoReporte, setTipoReporte] = useState('diario');
  const [sensorSeleccionado, setSensorSeleccionado] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estados para calendario inteligente
  const [fechasConLecturas, setFechasConLecturas] = useState([]);
  const [calendarioInicioAbierto, setCalendarioInicioAbierto] = useState(false);
  const [calendarioFinAbierto, setCalendarioFinAbierto] = useState(false);
  const [mesActualInicio, setMesActualInicio] = useState(new Date().getMonth());
  const [anioActualInicio, setAnioActualInicio] = useState(new Date().getFullYear());
  const [mesActualFin, setMesActualFin] = useState(new Date().getMonth());
  const [anioActualFin, setAnioActualFin] = useState(new Date().getFullYear());

  const calendarioInicioRef = useRef(null);
  const calendarioFinRef = useRef(null);

  // Estado para controlar si ya se hizo la carga inicial
  const [cargaInicialCompletada, setCargaInicialCompletada] = useState(false);

  // Carga inicial optimizada
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar datos cuando cambia el tipo de reporte (SOLO después de carga inicial)
  useEffect(() => {
    if (!cargaInicialCompletada) return;
    cargarDatosSegunTipo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoReporte]);

  // Cargar datos cuando cambian las fechas personalizadas
  useEffect(() => {
    if (!cargaInicialCompletada) return;
    if (tipoReporte !== 'personalizado') return;
    if (!fechaInicio || !fechaFin) return;

    const timeoutId = setTimeout(() => {
      cargarDatosSegunTipo(false);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin]);

  // Actualización automática cada 3 segundos (solo en modo "Hoy")
  useEffect(() => {
    if (!cargaInicialCompletada) return;
    if (tipoReporte !== 'diario') return;

    const interval = setInterval(() => {
      cargarDatosSegunTipo(false);
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoReporte, cargaInicialCompletada]);

  // Carga inicial optimizada - solo cargar datos del día actual
  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      // Cargar solo datos de HOY inicialmente (mucho más rápido)
      const ahora = new Date();
      const hoy = new Date(ahora);
      hoy.setHours(0, 0, 0, 0);

      const filtros = {
        fecha_inicio: hoy.toISOString(),
        fecha_fin: ahora.toISOString(),
        limite: 10000
      };

      const [lecturasRes, sensoresRes, alertasRes] = await Promise.all([
        lecturasAPI.getAll(filtros),
        sensoresAPI.getAll(),
        alertasAPI.getAll()
      ]);

      setLecturas(lecturasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
      setAlertas(alertasRes.data.data || []);

      // Marcar carga inicial como completada
      setCargaInicialCompletada(true);

      // Cargar fechas disponibles en segundo plano (sin bloquear UI)
      cargarFechasDisponiblesBackground();
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar fechas disponibles en segundo plano
  const cargarFechasDisponiblesBackground = async () => {
    try {
      // Cargar solo fechas de los últimos 90 días (más eficiente)
      const ahora = new Date();
      const hace90Dias = new Date(ahora);
      hace90Dias.setDate(ahora.getDate() - 90);

      const response = await lecturasAPI.getAll({
        fecha_inicio: hace90Dias.toISOString(),
        fecha_fin: ahora.toISOString(),
        limite: 100000
      });
      const lecturas = response.data.data || [];

      if (lecturas.length > 0) {
        const fechasUnicas = [...new Set(
          lecturas
            .filter(l => l.lectura_datetime)
            .map(l => new Date(l.lectura_datetime).toISOString().split('T')[0])
        )].sort().reverse();
        setFechasConLecturas(fechasUnicas);
      }
    } catch (error) {
      console.error('Error al cargar fechas disponibles:', error);
    }
  };

  // Click outside handler para calendario inicio
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarioInicioRef.current && !calendarioInicioRef.current.contains(event.target)) {
        setCalendarioInicioAbierto(false);
      }
    };
    if (calendarioInicioAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarioInicioAbierto]);

  // Click outside handler para calendario fin
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarioFinRef.current && !calendarioFinRef.current.contains(event.target)) {
        setCalendarioFinAbierto(false);
      }
    };
    if (calendarioFinAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarioFinAbierto]);

  // Cargar datos según el tipo de reporte seleccionado (carga inteligente)
  const cargarDatosSegunTipo = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setLoading(true);

      const ahora = new Date();
      let inicio, fin;

      // Calcular rango según tipo de reporte
      switch (tipoReporte) {
        case 'diario':
          inicio = new Date(ahora);
          inicio.setHours(0, 0, 0, 0);
          fin = ahora;
          break;

        case 'semanal':
          inicio = new Date(ahora);
          inicio.setDate(ahora.getDate() - 7);
          fin = ahora;
          break;

        case 'mensual':
          inicio = new Date(ahora);
          inicio.setDate(ahora.getDate() - 30);
          fin = ahora;
          break;

        case 'personalizado':
          if (fechaInicio && fechaFin) {
            inicio = new Date(fechaInicio);
            fin = new Date(fechaFin);
          } else {
            // Si no hay fechas personalizadas, cargar último mes
            inicio = new Date(ahora);
            inicio.setDate(ahora.getDate() - 30);
            fin = ahora;
          }
          break;

        default:
          inicio = new Date(ahora);
          inicio.setHours(0, 0, 0, 0);
          fin = ahora;
      }

      const filtros = {
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        limite: 50000
      };

      const [lecturasRes, sensoresRes, alertasRes] = await Promise.all([
        lecturasAPI.getAll(filtros),
        sensoresAPI.getAll(),
        alertasAPI.getAll()
      ]);

      setLecturas(lecturasRes.data.data || []);
      setSensores(sensoresRes.data.data || []);
      setAlertas(alertasRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      if (mostrarCarga) setLoading(false);
    }
  };

  const calcularRangoFechas = () => {
    const ahora = new Date();
    let inicio, fin;

    switch (tipoReporte) {
      case 'diario':
        inicio = new Date(ahora);
        inicio.setHours(0, 0, 0, 0);
        fin = new Date(ahora);
        fin.setHours(23, 59, 59, 999);
        break;
      
      case 'semanal':
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - 7);
        fin = ahora;
        break;
      
      case 'mensual':
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - 30);
        fin = ahora;
        break;
      
      case 'personalizado':
        if (fechaInicio && fechaFin) {
          inicio = new Date(fechaInicio);
          fin = new Date(fechaFin);
        }
        break;
    }

    return {
      inicio: inicio ? inicio.toISOString() : null,
      fin: fin ? fin.toISOString() : null
    };
  };

  // Filtrado simple por sensor (los datos ya vienen filtrados por fecha del servidor)
  const lecturasFiltradas = useMemo(() => {
    if (sensorSeleccionado === 'todos') return lecturas;
    return lecturas.filter(lectura => lectura.id_sensor === sensorSeleccionado);
  }, [lecturas, sensorSeleccionado]);

  // Funciones memoizadas con useCallback - OPTIMIZADA (un solo loop)
  const calcularEstadisticas = useCallback((datos) => {
    if (datos.length === 0) {
      return {
        totalLecturas: 0,
        promedioTemp: 0,
        promedioHumedad: 0,
        promedioCO2: 0,
        promedioCO: 0,
        maxTemp: 0,
        minTemp: 0,
        totalAlertas: 0,
        sensoresMasActivos: []
      };
    }

    // Un solo loop para calcular todo (mucho más rápido)
    let sumaTemp = 0, countTemp = 0, maxTemp = -Infinity, minTemp = Infinity;
    let sumaHumedad = 0, countHumedad = 0;
    let sumaCO2 = 0, countCO2 = 0;
    let sumaCO = 0, countCO = 0;
    const lecturasPorSensor = {};

    datos.forEach(lectura => {
      // Temperatura
      const temp = parseFloat(lectura.temperatura);
      if (!isNaN(temp)) {
        sumaTemp += temp;
        countTemp++;
        if (temp > maxTemp) maxTemp = temp;
        if (temp < minTemp) minTemp = temp;
      }

      // Humedad
      const hum = parseFloat(lectura.humedad);
      if (!isNaN(hum)) {
        sumaHumedad += hum;
        countHumedad++;
      }

      // CO2
      const co2 = parseInt(lectura.co2_nivel);
      if (!isNaN(co2)) {
        sumaCO2 += co2;
        countCO2++;
      }

      // CO
      const co = parseFloat(lectura.co_nivel);
      if (!isNaN(co)) {
        sumaCO += co;
        countCO++;
      }

      // Sensores activos
      lecturasPorSensor[lectura.id_sensor] = (lecturasPorSensor[lectura.id_sensor] || 0) + 1;
    });

    const sensoresMasActivos = Object.entries(lecturasPorSensor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        id_sensor: id,
        lecturas: count,
        nombre: sensores.find(s => s.id_sensor === id)?.nombre_sensor || id
      }));

    return {
      totalLecturas: datos.length,
      promedioTemp: countTemp > 0 ? (sumaTemp / countTemp).toFixed(1) : 0,
      promedioHumedad: countHumedad > 0 ? (sumaHumedad / countHumedad).toFixed(1) : 0,
      promedioCO2: countCO2 > 0 ? Math.round(sumaCO2 / countCO2) : 0,
      promedioCO: countCO > 0 ? (sumaCO / countCO).toFixed(1) : 0,
      maxTemp: countTemp > 0 ? maxTemp.toFixed(1) : 0,
      minTemp: countTemp > 0 ? minTemp.toFixed(1) : 0,
      totalAlertas: alertas.length,
      sensoresMasActivos
    };
  }, [sensores, alertas]);

  const prepararDatosGrafica = useCallback((datos) => {
    if (datos.length === 0) return [];

    // Detectar cuántos días únicos hay
    const fechasUnicas = [...new Set(datos.map(d =>
      new Date(d.lectura_datetime).toISOString().split('T')[0]
    ))];
    const numDias = fechasUnicas.length;

    const agrupados = {};

    datos.forEach(lectura => {
      const fecha = new Date(lectura.lectura_datetime);
      let clave, claveOrden;

      // Estrategia de agrupación basada en número de días - MÁS GRANULAR
      if (numDias <= 1) {
        // 1 día: agrupar por hora (24 puntos)
        claveOrden = fecha.getTime();
        clave = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      } else if (numDias <= 3) {
        // 2-3 días: agrupar por bloques de 2 horas (12 puntos por día = 24-36 puntos)
        const bloqueHora = Math.floor(fecha.getHours() / 2) * 2;
        const fechaBase = new Date(fecha);
        fechaBase.setHours(bloqueHora, 0, 0, 0);
        claveOrden = fechaBase.getTime();
        clave = fechaBase.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) +
                ' ' + String(bloqueHora).padStart(2, '0') + 'h';
      } else if (numDias <= 7) {
        // 4-7 días: agrupar por bloques de 3 horas (8 puntos por día = 32-56 puntos)
        const bloqueHora = Math.floor(fecha.getHours() / 3) * 3;
        const fechaBase = new Date(fecha);
        fechaBase.setHours(bloqueHora, 0, 0, 0);
        claveOrden = fechaBase.getTime();
        clave = fechaBase.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) +
                ' ' + String(bloqueHora).padStart(2, '0') + 'h';
      } else if (numDias <= 15) {
        // 8-15 días: agrupar por bloques de 4 horas (6 puntos por día = 48-90 puntos)
        const bloqueHora = Math.floor(fecha.getHours() / 4) * 4;
        const fechaBase = new Date(fecha);
        fechaBase.setHours(bloqueHora, 0, 0, 0);
        claveOrden = fechaBase.getTime();
        clave = fechaBase.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) +
                ' ' + String(bloqueHora).padStart(2, '0') + 'h';
      } else if (numDias <= 30) {
        // 16-30 días: agrupar por bloques de 6 horas (4 puntos por día = 64-120 puntos)
        const bloqueHora = Math.floor(fecha.getHours() / 6) * 6;
        const fechaBase = new Date(fecha);
        fechaBase.setHours(bloqueHora, 0, 0, 0);
        claveOrden = fechaBase.getTime();
        clave = fechaBase.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) +
                ' ' + String(bloqueHora).padStart(2, '0') + 'h';
      } else if (numDias <= 60) {
        // 31-60 días: agrupar por bloques de 12 horas (2 puntos por día = 62-120 puntos)
        const bloqueHora = Math.floor(fecha.getHours() / 12) * 12;
        const fechaBase = new Date(fecha);
        fechaBase.setHours(bloqueHora, 0, 0, 0);
        claveOrden = fechaBase.getTime();
        clave = fechaBase.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) +
                (bloqueHora === 0 ? ' AM' : ' PM');
      } else {
        // Más de 60 días: agrupar por día completo (1 punto por día)
        claveOrden = new Date(fecha.toISOString().split('T')[0]).getTime();
        clave = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
      }

      if (!agrupados[clave]) {
        agrupados[clave] = {
          fecha: clave,
          orden: claveOrden,
          temperaturas: [],
          humedades: [],
          co2s: [],
          cos: []
        };
      }

      if (lectura.temperatura) agrupados[clave].temperaturas.push(parseFloat(lectura.temperatura));
      if (lectura.humedad) agrupados[clave].humedades.push(parseFloat(lectura.humedad));
      if (lectura.co2_nivel) agrupados[clave].co2s.push(parseInt(lectura.co2_nivel));
      if (lectura.co_nivel) agrupados[clave].cos.push(parseFloat(lectura.co_nivel));
    });

    // Convertir a array y ordenar cronológicamente
    return Object.values(agrupados)
      .sort((a, b) => a.orden - b.orden)
      .map(grupo => ({
        fecha: grupo.fecha,
        temperatura: grupo.temperaturas.length > 0
          ? parseFloat((grupo.temperaturas.reduce((a, b) => a + b, 0) / grupo.temperaturas.length).toFixed(1))
          : null,
        humedad: grupo.humedades.length > 0
          ? parseFloat((grupo.humedades.reduce((a, b) => a + b, 0) / grupo.humedades.length).toFixed(1))
          : null,
        co2: grupo.co2s.length > 0
          ? Math.round(grupo.co2s.reduce((a, b) => a + b, 0) / grupo.co2s.length)
          : null,
        co: grupo.cos.length > 0
          ? parseFloat((grupo.cos.reduce((a, b) => a + b, 0) / grupo.cos.length).toFixed(1))
          : null
      }));
  }, []);

  const prepararDatosComparativa = useCallback((datos) => {
    if (datos.length === 0) return [];

    // Crear mapa de sensores para búsqueda rápida
    const sensoresMap = new Map(sensores.map(s => [s.id_sensor, s.nombre_sensor]));
    const porSensor = {};

    // Un solo loop optimizado
    datos.forEach(lectura => {
      const idSensor = lectura.id_sensor;

      if (!porSensor[idSensor]) {
        porSensor[idSensor] = {
          nombre: sensoresMap.get(idSensor) || idSensor,
          sumaTemp: 0, countTemp: 0,
          sumaHum: 0, countHum: 0,
          sumaCO2: 0, countCO2: 0,
          sumaCO: 0, countCO: 0
        };
      }

      const sensor = porSensor[idSensor];

      // Acumular directamente
      const temp = parseFloat(lectura.temperatura);
      if (!isNaN(temp)) {
        sensor.sumaTemp += temp;
        sensor.countTemp++;
      }

      const hum = parseFloat(lectura.humedad);
      if (!isNaN(hum)) {
        sensor.sumaHum += hum;
        sensor.countHum++;
      }

      const co2 = parseInt(lectura.co2_nivel);
      if (!isNaN(co2)) {
        sensor.sumaCO2 += co2;
        sensor.countCO2++;
      }

      const co = parseFloat(lectura.co_nivel);
      if (!isNaN(co)) {
        sensor.sumaCO += co;
        sensor.countCO++;
      }
    });

    return Object.values(porSensor).map(sensor => ({
      sensor: sensor.nombre,
      temperatura: sensor.countTemp > 0 ? parseFloat((sensor.sumaTemp / sensor.countTemp).toFixed(1)) : 0,
      humedad: sensor.countHum > 0 ? parseFloat((sensor.sumaHum / sensor.countHum).toFixed(1)) : 0,
      co2: sensor.countCO2 > 0 ? Math.round(sensor.sumaCO2 / sensor.countCO2) : 0,
      co: sensor.countCO > 0 ? parseFloat((sensor.sumaCO / sensor.countCO).toFixed(1)) : 0
    }));
  }, [sensores]);

  // Memoizar cálculos pesados para evitar re-cálculos innecesarios
  const estadisticas = useMemo(() => calcularEstadisticas(lecturasFiltradas), [lecturasFiltradas, calcularEstadisticas]);
  const datosGraficaTendencias = useMemo(() => prepararDatosGrafica(lecturasFiltradas), [lecturasFiltradas, prepararDatosGrafica]);
  const datosGraficaComparativa = useMemo(() => prepararDatosComparativa(lecturasFiltradas), [lecturasFiltradas, prepararDatosComparativa]);

  // Función para renderizar calendario inteligente
  const renderCalendario = (tipo) => {
    const mesActual = tipo === 'inicio' ? mesActualInicio : mesActualFin;
    const anioActual = tipo === 'inicio' ? anioActualInicio : anioActualFin;
    const setMesActual = tipo === 'inicio' ? setMesActualInicio : setMesActualFin;
    const setAnioActual = tipo === 'inicio' ? setAnioActualInicio : setAnioActualFin;
    const setFecha = tipo === 'inicio' ? setFechaInicio : setFechaFin;
    const setCalendarioAbierto = tipo === 'inicio' ? setCalendarioInicioAbierto : setCalendarioFinAbierto;

    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const mesAnterior = () => {
      if (mesActual === 0) {
        setMesActual(11);
        setAnioActual(anioActual - 1);
      } else {
        setMesActual(mesActual - 1);
      }
    };

    const mesSiguiente = () => {
      if (mesActual === 11) {
        setMesActual(0);
        setAnioActual(anioActual + 1);
      } else {
        setMesActual(mesActual + 1);
      }
    };

    const seleccionarFecha = (dia) => {
      const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      if (fechasConLecturas.includes(fechaStr)) {
        // Si es fecha inicio: T00:00:00
        // Si es fecha fin: T23:59:59 para incluir todo el día
        const fechaCompleta = tipo === 'inicio'
          ? fechaStr + 'T00:00:00'
          : fechaStr + 'T23:59:59';

        setFecha(fechaCompleta);
        setCalendarioAbierto(false);
      }
    };

    const renderDias = () => {
      const dias = [];
      const hoy = new Date().toISOString().split('T')[0];

      // Obtener fechas de inicio y fin sin hora para comparación
      const fechaInicioComparacion = fechaInicio
        ? new Date(fechaInicio).toISOString().split('T')[0]
        : null;

      const fechaFinComparacion = fechaFin
        ? new Date(fechaFin).toISOString().split('T')[0]
        : null;

      // Espacios vacíos antes del primer día
      for (let i = 0; i < primerDiaSemana; i++) {
        dias.push(<div key={`empty-${i}`} className="h-10"></div>);
      }

      // Días del mes
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const tieneLecturas = fechasConLecturas.includes(fechaStr);
        const esHoy = fechaStr === hoy;
        const esFuturo = new Date(fechaStr) > new Date();

        // Validaciones de rangos de fechas
        // Si es calendario de fin, deshabilitar fechas anteriores a fecha inicio
        const esAnteriorAInicio = tipo === 'fin' && fechaInicioComparacion && fechaStr < fechaInicioComparacion;

        // Si es calendario de inicio, deshabilitar fechas posteriores a fecha fin
        const esPosteriorAFin = tipo === 'inicio' && fechaFinComparacion && fechaStr > fechaFinComparacion;

        const estaDeshabilitado = !tieneLecturas || esFuturo || esAnteriorAInicio || esPosteriorAFin;

        dias.push(
          <button
            key={dia}
            onClick={() => !estaDeshabilitado && seleccionarFecha(dia)}
            disabled={estaDeshabilitado}
            className={`
              h-10 rounded-lg font-medium text-sm transition-all duration-200 relative
              ${tieneLecturas && !esFuturo && !esAnteriorAInicio && !esPosteriorAFin
                ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:scale-110 cursor-pointer border-2 border-green-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }
              ${esHoy ? 'ring-2 ring-blue-400' : ''}
              ${esAnteriorAInicio || esPosteriorAFin ? 'opacity-40' : ''}
            `}
          >
            {dia}
            {tieneLecturas && !esFuturo && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
            )}
            {esHoy && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            )}
          </button>
        );
      }

      return dias;
    };

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 duration-200">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={mesAnterior}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-bold text-gray-900">
            {nombresMeses[mesActual]} {anioActual}
          </h3>
          <button
            onClick={mesSiguiente}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {diasSemana.map(dia => (
            <div key={dia} className="text-center text-xs font-semibold text-gray-500 py-1">
              {dia}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {renderDias()}
        </div>

        {/* Leyenda */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 border-2 border-green-200 rounded"></div>
            <span className="text-gray-600">Con datos</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-50 border-2 border-gray-200 rounded"></div>
            <span className="text-gray-600">Sin datos</span>
          </div>
        </div>
      </div>
    );
  };

  const getNombrePeriodo = () => {
    switch (tipoReporte) {
      case 'diario': return 'Hoy';
      case 'semanal': return 'Últimos 7 días';
      case 'mensual': return 'Últimos 30 días';
      case 'personalizado': return 'Período personalizado';
      default: return '';
    }
  };

  // ============ FUNCIONES DE EXPORTACIÓN ============

  const exportarCSV = () => {
    try {
      // Preparar datos para CSV
      const datosCSV = lecturasFiltradas.map(lectura => ({
        'ID Sensor': lectura.id_sensor,
        'Nombre Sensor': sensores.find(s => s.id_sensor === lectura.id_sensor)?.nombre_sensor || '',
        'Fecha/Hora': new Date(lectura.lectura_datetime).toLocaleString('es-PE'),
        'Temperatura (°C)': lectura.temperatura || '',
        'Humedad (%)': lectura.humedad || '',
        'CO2 (ppm)': lectura.co2_nivel || '',
        'CO (ppm)': lectura.co_nivel || '',
        'Latitud': lectura.latitud || '',
        'Longitud': lectura.longitud || '',
        'Zona': lectura.zona || ''
      }));

      // Crear hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(datosCSV);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lecturas');

      // Generar archivo y descargar con punto y coma como delimitador (para Excel en español)
      const nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.csv`;
      XLSX.writeFile(wb, nombreArchivo, { FS: ';' });

      alert('Archivo CSV descargado exitosamente');
      setMenuExportarAbierto(false);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el archivo CSV');
    }
  };

  const exportarExcel = () => {
    try {
      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen de estadísticas
      const datosResumen = [
        ['REPORTE DE MONITOREO AMBIENTAL'],
        ['Período:', getNombrePeriodo()],
        ['Fecha de generación:', new Date().toLocaleString('es-PE')],
        ['Sensor:', sensorSeleccionado === 'todos' ? 'Todos los sensores' : sensorSeleccionado],
        [],
        ['ESTADÍSTICAS GENERALES'],
        ['Total de Lecturas', estadisticas.totalLecturas],
        ['Temperatura Promedio (°C)', estadisticas.promedioTemp],
        ['Temperatura Máxima (°C)', estadisticas.maxTemp],
        ['Temperatura Mínima (°C)', estadisticas.minTemp],
        ['Humedad Promedio (%)', estadisticas.promedioHumedad],
        ['CO2 Promedio (ppm)', estadisticas.promedioCO2],
        ['CO Promedio (ppm)', estadisticas.promedioCO],
        ['Total de Alertas', estadisticas.totalAlertas],
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(datosResumen);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja 2: Lecturas detalladas
      const datosLecturas = lecturasFiltradas.map(lectura => ({
        'ID Sensor': lectura.id_sensor,
        'Nombre Sensor': sensores.find(s => s.id_sensor === lectura.id_sensor)?.nombre_sensor || '',
        'Fecha/Hora': new Date(lectura.lectura_datetime).toLocaleString('es-PE'),
        'Temperatura (°C)': lectura.temperatura || '',
        'Humedad (%)': lectura.humedad || '',
        'CO2 (ppm)': lectura.co2_nivel || '',
        'CO (ppm)': lectura.co_nivel || '',
        'Latitud': lectura.latitud || '',
        'Longitud': lectura.longitud || '',
        'Zona': lectura.zona || ''
      }));

      const wsLecturas = XLSX.utils.json_to_sheet(datosLecturas);
      XLSX.utils.book_append_sheet(wb, wsLecturas, 'Lecturas');

      // Hoja 3: Sensores más activos
      const datosSensores = estadisticas.sensoresMasActivos.map(sensor => ({
        'ID Sensor': sensor.id_sensor,
        'Nombre': sensor.nombre,
        'Lecturas': sensor.lecturas,
        'Porcentaje': `${((sensor.lecturas / estadisticas.totalLecturas) * 100).toFixed(1)}%`
      }));

      const wsSensores = XLSX.utils.json_to_sheet(datosSensores);
      XLSX.utils.book_append_sheet(wb, wsSensores, 'Sensores Activos');

      // Generar archivo y descargar
      const nombreArchivo = `reporte_completo_${tipoReporte}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);

      alert('Archivo Excel descargado exitosamente');
      setMenuExportarAbierto(false);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel');
    }
  };


  const exportarPDF = async () => {
  try {
    setMenuExportarAbierto(false);
    alert('Generando PDF con gráficos... Este proceso puede tardar unos segundos.');

    const doc = new jsPDF();
    let yPos = 20;

    // ========== PÁGINA 1: PORTADA Y ESTADÍSTICAS ==========
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('Reporte de Monitoreo Ambiental', 105, yPos, { align: 'center' });
    yPos += 15;

    // Línea separadora
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // Información del reporte
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Período: ${getNombrePeriodo()}`, 14, yPos);
    yPos += 7;
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })}`, 14, yPos);
    yPos += 7;
    doc.text(`Sensor: ${sensorSeleccionado === 'todos' ? 'Todos los sensores' : sensorSeleccionado}`, 14, yPos);
    yPos += 7;
    doc.text(`Total de lecturas: ${lecturasFiltradas.length}`, 14, yPos);
    yPos += 15;

    // Estadísticas generales
    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    doc.text('Estadísticas Generales', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const stats = [
      ['Total de Lecturas:', estadisticas.totalLecturas.toString()],
      ['Temperatura Promedio:', `${estadisticas.promedioTemp} °C`],
      ['Temperatura Máxima:', `${estadisticas.maxTemp} °C`],
      ['Temperatura Mínima:', `${estadisticas.minTemp} °C`],
      ['Humedad Promedio:', `${estadisticas.promedioHumedad} %`],
      ['CO₂ Promedio:', `${estadisticas.promedioCO2} ppm`],
      ['CO Promedio:', `${estadisticas.promedioCO} ppm`],
      ['Total de Alertas:', estadisticas.totalAlertas.toString()]
    ];

    stats.forEach(([label, value]) => {
      doc.setFont(undefined, 'normal');
      doc.text(label, 20, yPos);
      doc.setFont(undefined, 'bold');
      doc.text(value, 100, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Sensores más activos
    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    doc.text('Sensores Más Activos', 14, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    // Encabezados
    doc.setFont(undefined, 'bold');
    doc.text('Ranking', 20, yPos);
    doc.text('ID Sensor', 40, yPos);
    doc.text('Nombre', 80, yPos);
    doc.text('Lecturas', 130, yPos);
    doc.text('Porcentaje', 160, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');

    // Línea bajo encabezados
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos - 1, 196, yPos - 1);
    yPos += 3;

    // Datos de sensores
    estadisticas.sensoresMasActivos.forEach((sensor, index) => {
      const nombre = sensor.nombre.substring(0, 20);
      const porcentaje = ((sensor.lecturas / estadisticas.totalLecturas) * 100).toFixed(1);
      
      doc.text(`#${index + 1}`, 20, yPos);
      doc.text(sensor.id_sensor, 40, yPos);
      doc.text(nombre, 80, yPos);
      doc.text(sensor.lecturas.toString(), 130, yPos);
      doc.text(`${porcentaje}%`, 160, yPos);
      yPos += 5;
    });

    // ========== PÁGINA 2: GRÁFICO DE TENDENCIAS ==========
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setTextColor(99, 102, 241);
    doc.text('Tendencias Temporales', 105, yPos, { align: 'center' });
    yPos += 15;

    // Capturar gráfico de tendencias
    if (graficoTendenciasRef.current) {
      const canvas = await html2canvas(graficoTendenciasRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 14, yPos, 182, 80);
      yPos += 90;
    }

    // Descripción
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Gráfica que muestra la evolución temporal de temperatura y humedad en el período seleccionado.', 14, yPos, {
      maxWidth: 180
    });

    // ========== PÁGINA 3: GRÁFICOS DE CO2 Y CO ==========
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setTextColor(99, 102, 241);
    doc.text('Análisis de Gases', 105, yPos, { align: 'center' });
    yPos += 15;

    // Gráfico CO2
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('Tendencia de CO₂', 14, yPos);
    yPos += 8;

    if (graficoCO2Ref.current) {
      const canvas = await html2canvas(graficoCO2Ref.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 14, yPos, 182, 60);
      yPos += 70;
    }

    // Gráfico CO
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text('Tendencia de CO', 14, yPos);
    yPos += 8;

    if (graficoCORef.current) {
      const canvas = await html2canvas(graficoCORef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 14, yPos, 182, 60);
      yPos += 70;
    }

    // Descripción
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Análisis de niveles de dióxido de carbono (CO₂) y monóxido de carbono (CO) detectados.', 14, yPos, {
      maxWidth: 180
    });

    // ========== PÁGINA 4: COMPARATIVA (solo si aplica) ==========
    if (sensorSeleccionado === 'todos' && datosGraficaComparativa.length > 0 && graficoComparativaRef.current) {
      doc.addPage();
      yPos = 20;

      doc.setFontSize(16);
      doc.setTextColor(99, 102, 241);
      doc.text('Comparativa entre Sensores', 105, yPos, { align: 'center' });
      yPos += 15;

      const canvas = await html2canvas(graficoComparativaRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 14, yPos, 182, 90);
      yPos += 100;

      // Descripción
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Comparación de promedios de temperatura y humedad entre todos los sensores activos.', 14, yPos, {
        maxWidth: 180
      });
    }

    // ========== PÁGINA FINAL: LECTURAS DETALLADAS ==========
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setTextColor(99, 102, 241);
    doc.text('Lecturas Detalladas (Últimas 50)', 14, yPos);
    yPos += 10;

    // Encabezados de tabla
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('ID Sensor', 14, yPos);
    doc.text('Fecha/Hora', 50, yPos);
    doc.text('Temp', 90, yPos);
    doc.text('Hum', 110, yPos);
    doc.text('CO₂', 130, yPos);
    doc.text('CO', 150, yPos);
    doc.text('Zona', 170, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');

    // Línea bajo encabezados
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos - 2, 196, yPos - 2);
    yPos += 2;

    // Datos de lecturas
    lecturasFiltradas.slice(0, 50).forEach((lectura) => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }

      const fecha = new Date(lectura.lectura_datetime);
      const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
      
      doc.text(lectura.id_sensor.substring(0, 10), 14, yPos);
      doc.text(fechaStr, 50, yPos);
      doc.text(lectura.temperatura ? `${parseFloat(lectura.temperatura).toFixed(1)}°C` : 'N/A', 90, yPos);
      doc.text(lectura.humedad ? `${parseFloat(lectura.humedad).toFixed(1)}%` : 'N/A', 110, yPos);
      doc.text(lectura.co2_nivel ? `${lectura.co2_nivel}` : 'N/A', 130, yPos);
      doc.text(lectura.co_nivel ? `${parseFloat(lectura.co_nivel).toFixed(1)}` : 'N/A', 150, yPos);
      doc.text(lectura.zona ? lectura.zona.substring(0, 6) : 'N/A', 170, yPos);
      yPos += 5;
    });

    // Footer en todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      // Línea del footer
      doc.setDrawColor(200, 200, 200);
      doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);
      
      // Texto del footer
      doc.text(
        `Sistema de Monitoreo Ambiental - Generado el ${new Date().toLocaleDateString('es-PE')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      doc.text(
        `Página ${i} de ${pageCount}`,
        190,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    // Guardar PDF
    const nombreArchivo = `reporte_completo_${tipoReporte}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);

    alert('Reporte PDF con gráficos descargado exitosamente');
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    alert(`Error al exportar el archivo PDF: ${error.message}`);
  }
};
  // ============ FIN FUNCIONES DE EXPORTACIÓN ============


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Análisis detallado de datos ambientales
          </p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setMenuExportarAbierto(!menuExportarAbierto)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md text-sm sm:text-base"
          >
            <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Exportar</span>
            <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {menuExportarAbierto && (
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={exportarCSV}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center space-x-2 text-sm"
              >
                <span>📄</span>
                <span>CSV</span>
              </button>
              <button
                onClick={exportarExcel}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center space-x-2 border-t text-sm"
              >
                <span>📊</span>
                <span>Excel</span>
              </button>
              <button
                onClick={exportarPDF}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center space-x-2 border-t rounded-b-lg text-sm"
              >
                <span>📑</span>
                <span>PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resto del código de Reportes igual que antes... */}
      {/* (Filtros, Estadísticas, Gráficas, etc.) */}
      
      {/* Filtros Modernos */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
              <FunnelIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configuración del Reporte</h2>
              <p className="text-sm text-gray-500">Personaliza el análisis de datos ambientales</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{lecturasFiltradas.length} lecturas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Período */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Período de Análisis
            </label>
            <div className="relative">
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none bg-white hover:border-gray-300 font-medium text-gray-900"
              >
                <option value="diario">Hoy</option>
                <option value="semanal">Últimos 7 días</option>
                <option value="mensual">Últimos 30 días</option>
                <option value="personalizado">Rango Personalizado</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sensor */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Sensor
            </label>
            <div className="relative">
              <select
                value={sensorSeleccionado}
                onChange={(e) => setSensorSeleccionado(e.target.value)}
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none bg-white hover:border-gray-300 font-medium text-gray-900"
              >
                <option value="todos">Todos los sensores</option>
                {sensores.map(sensor => (
                  <option key={sensor.id_sensor} value={sensor.id_sensor}>
                    {sensor.id_sensor} - {sensor.nombre_sensor}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filtros de Fecha Personalizados */}
        {tipoReporte === 'personalizado' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
            {/* Fecha Inicio con Calendario */}
            <div ref={calendarioInicioRef} className="relative space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fecha de Inicio
              </label>
              <button
                onClick={() => {
                  setCalendarioInicioAbierto(!calendarioInicioAbierto);
                  setCalendarioFinAbierto(false);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:border-primary hover:shadow-md transition-all duration-200 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">
                  {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Seleccionar fecha'}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${calendarioInicioAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Calendario Inicio */}
              {calendarioInicioAbierto && renderCalendario('inicio')}
            </div>

            {/* Fecha Fin con Calendario */}
            <div ref={calendarioFinRef} className="relative space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fecha de Fin
              </label>
              <button
                onClick={() => {
                  setCalendarioFinAbierto(!calendarioFinAbierto);
                  setCalendarioInicioAbierto(false);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:border-primary hover:shadow-md transition-all duration-200 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">
                  {fechaFin ? new Date(fechaFin).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Seleccionar fecha'}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${calendarioFinAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Calendario Fin */}
              {calendarioFinAbierto && renderCalendario('fin')}
            </div>
          </div>
        )}

        {/* Resumen */}
        <div className="mt-6 flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Mostrando:</span>
            <span className="text-sm font-bold text-primary">{getNombrePeriodo()}</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-gray-700">
              {lecturasFiltradas.length} registros encontrados
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Total de Lecturas</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{estadisticas.totalLecturas}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Temp. Promedio</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{estadisticas.promedioTemp}°C</p>
            <p className="text-xs text-gray-500 mt-1">
              Min: {estadisticas.minTemp}°C | Max: {estadisticas.maxTemp}°C
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Humedad Promedio</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{estadisticas.promedioHumedad}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Total de Alertas</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{estadisticas.totalAlertas}</p>
          </div>
        </div>
      </div>

      {/* Gráfica de Tendencias */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6" ref={graficoTendenciasRef}>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Tendencias Temporales</h2>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={250} minWidth={300}>
            <LineChart data={datosGraficaTendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="temperatura" stroke="#F59E0B" name="Temperatura (°C)" strokeWidth={2} />
              <Line type="monotone" dataKey="humedad" stroke="#3B82F6" name="Humedad (%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficas de CO2 y CO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6" ref={graficoCO2Ref}>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Tendencia de CO₂</h2>
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={220} minWidth={280}>
              <AreaChart data={datosGraficaTendencias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="co2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="CO₂ (ppm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6" ref={graficoCORef}>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Tendencia de CO</h2>
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={220} minWidth={280}>
              <AreaChart data={datosGraficaTendencias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="co" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="CO (ppm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparativa entre Sensores */}
      {sensorSeleccionado === 'todos' && datosGraficaComparativa.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6" ref={graficoComparativaRef}>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Comparativa entre Sensores</h2>
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={280} minWidth={300}>
              <BarChart data={datosGraficaComparativa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sensor" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="temperatura" fill="#F59E0B" name="Temp (°C)" />
                <Bar dataKey="humedad" fill="#3B82F6" name="Humedad (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla de Sensores Más Activos */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Sensores Más Activos</h2>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Nombre</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecturas</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estadisticas.sensoresMasActivos.map((sensor, index) => (
                <tr key={sensor.id_sensor} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                    #{index + 1} - {sensor.id_sensor}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden sm:table-cell">
                    {sensor.nombre}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    {sensor.lecturas}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ maxWidth: '150px' }}>
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(sensor.lecturas / estadisticas.totalLecturas * 100).toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {((sensor.lecturas / estadisticas.totalLecturas) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Promedios */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Promedios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Temperatura</p>
            <p className="text-2xl font-bold text-orange-600">{estadisticas.promedioTemp}°C</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Humedad</p>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.promedioHumedad}%</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">CO₂</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.promedioCO2} ppm</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">CO</p>
            <p className="text-2xl font-bold text-red-600">{estadisticas.promedioCO} ppm</p>
          </div>
        </div>
      </div>
    </div>
  );
}