// src/pages/Reportes.jsx
import { useState, useEffect, useRef} from 'react';
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

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [tipoReporte, sensorSeleccionado, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const { inicio, fin } = calcularRangoFechas();
      
      const filtros = {
        ...(sensorSeleccionado !== 'todos' && { sensor_id: sensorSeleccionado }),
        ...(inicio && { fecha_inicio: inicio }),
        ...(fin && { fecha_fin: fin }),
        limite: 1000
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
      setLoading(false);
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

  const lecturasFiltradas = lecturas.filter(lectura => {
    if (sensorSeleccionado === 'todos') return true;
    return lectura.id_sensor === sensorSeleccionado;
  });

  const estadisticas = calcularEstadisticas(lecturasFiltradas);
  const datosGraficaTendencias = prepararDatosGrafica(lecturasFiltradas);
  const datosGraficaComparativa = prepararDatosComparativa(lecturasFiltradas);

  function calcularEstadisticas(datos) {
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

    const temps = datos.map(l => parseFloat(l.temperatura)).filter(v => !isNaN(v));
    const humedades = datos.map(l => parseFloat(l.humedad)).filter(v => !isNaN(v));
    const co2s = datos.map(l => parseInt(l.co2_nivel)).filter(v => !isNaN(v));
    const cos = datos.map(l => parseFloat(l.co_nivel)).filter(v => !isNaN(v));

    const lecturasPorSensor = {};
    datos.forEach(lectura => {
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
      promedioTemp: temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 0,
      promedioHumedad: humedades.length > 0 ? (humedades.reduce((a, b) => a + b, 0) / humedades.length).toFixed(1) : 0,
      promedioCO2: co2s.length > 0 ? Math.round(co2s.reduce((a, b) => a + b, 0) / co2s.length) : 0,
      promedioCO: cos.length > 0 ? (cos.reduce((a, b) => a + b, 0) / cos.length).toFixed(1) : 0,
      maxTemp: temps.length > 0 ? Math.max(...temps).toFixed(1) : 0,
      minTemp: temps.length > 0 ? Math.min(...temps).toFixed(1) : 0,
      totalAlertas: alertas.length,
      sensoresMasActivos
    };
  }

  function prepararDatosGrafica(datos) {
    if (datos.length === 0) return [];

    const agrupados = {};
    
    datos.forEach(lectura => {
      const fecha = new Date(lectura.lectura_datetime);
      let clave;

      switch (tipoReporte) {
        case 'diario':
          clave = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          break;
        case 'semanal':
        case 'mensual':
        case 'personalizado':
          clave = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
          break;
      }

      if (!agrupados[clave]) {
        agrupados[clave] = {
          fecha: clave,
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

    return Object.values(agrupados).map(grupo => ({
      fecha: grupo.fecha,
      temperatura: grupo.temperaturas.length > 0 
        ? (grupo.temperaturas.reduce((a, b) => a + b, 0) / grupo.temperaturas.length).toFixed(1)
        : null,
      humedad: grupo.humedades.length > 0
        ? (grupo.humedades.reduce((a, b) => a + b, 0) / grupo.humedades.length).toFixed(1)
        : null,
      co2: grupo.co2s.length > 0
        ? Math.round(grupo.co2s.reduce((a, b) => a + b, 0) / grupo.co2s.length)
        : null,
      co: grupo.cos.length > 0
        ? (grupo.cos.reduce((a, b) => a + b, 0) / grupo.cos.length).toFixed(1)
        : null
    })); //.slice(-20) // Límites de los puntos de la gráfica. 

    // Determinar límite según tipo de reporte
    const limite = tipoReporte === 'diario' ? 100 : 
                   tipoReporte === 'semanal' ? 50 : 
                   tipoReporte === 'mensual' ? 30 : 50;
    
    return Object.values(agrupados).map(grupo => ({
      fecha: grupo.fecha,
      temperatura: grupo.temperaturas.length > 0 
        ? (grupo.temperaturas.reduce((a, b) => a + b, 0) / grupo.temperaturas.length).toFixed(1)
        : null,
      humedad: grupo.humedades.length > 0
        ? (grupo.humedades.reduce((a, b) => a + b, 0) / grupo.humedades.length).toFixed(1)
        : null,
      co2: grupo.co2s.length > 0
        ? Math.round(grupo.co2s.reduce((a, b) => a + b, 0) / grupo.co2s.length)
        : null,
      co: grupo.cos.length > 0
        ? (grupo.cos.reduce((a, b) => a + b, 0) / grupo.cos.length).toFixed(1)
        : null
    })).slice(-limite); // ⬅️ Límite dinámico
  }

  function prepararDatosComparativa(datos) {
    if (datos.length === 0) return [];

    const porSensor = {};

    datos.forEach(lectura => {
      if (!porSensor[lectura.id_sensor]) {
        porSensor[lectura.id_sensor] = {
          id_sensor: lectura.id_sensor,
          nombre: sensores.find(s => s.id_sensor === lectura.id_sensor)?.nombre_sensor || lectura.id_sensor,
          temperaturas: [],
          humedades: [],
          co2s: [],
          cos: []
        };
      }

      if (lectura.temperatura) porSensor[lectura.id_sensor].temperaturas.push(parseFloat(lectura.temperatura));
      if (lectura.humedad) porSensor[lectura.id_sensor].humedades.push(parseFloat(lectura.humedad));
      if (lectura.co2_nivel) porSensor[lectura.id_sensor].co2s.push(parseInt(lectura.co2_nivel));
      if (lectura.co_nivel) porSensor[lectura.id_sensor].cos.push(parseFloat(lectura.co_nivel));
    });

    return Object.values(porSensor).map(sensor => ({
      sensor: sensor.nombre,
      temperatura: sensor.temperaturas.length > 0
        ? parseFloat((sensor.temperaturas.reduce((a, b) => a + b, 0) / sensor.temperaturas.length).toFixed(1))
        : 0,
      humedad: sensor.humedades.length > 0
        ? parseFloat((sensor.humedades.reduce((a, b) => a + b, 0) / sensor.humedades.length).toFixed(1))
        : 0,
      co2: sensor.co2s.length > 0
        ? Math.round(sensor.co2s.reduce((a, b) => a + b, 0) / sensor.co2s.length)
        : 0,
      co: sensor.cos.length > 0
        ? parseFloat((sensor.cos.reduce((a, b) => a + b, 0) / sensor.cos.length).toFixed(1))
        : 0
    }));
  }

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

      // Generar archivo y descargar
      const nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.csv`;
      XLSX.writeFile(wb, nombreArchivo);

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
      
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Configuración del Reporte</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="diario">Hoy</option>
              <option value="semanal">Últimos 7 días</option>
              <option value="mensual">Últimos 30 días</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensor
            </label>
            <select
              value={sensorSeleccionado}
              onChange={(e) => setSensorSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos los sensores</option>
              {sensores.map(sensor => (
                <option key={sensor.id_sensor} value={sensor.id_sensor}>
                  {sensor.id_sensor} - {sensor.nombre_sensor}
                </option>
              ))}
            </select>
          </div>

          {tipoReporte === 'personalizado' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span>Mostrando: {getNombrePeriodo()}</span>
          <span>•</span>
          <span>{lecturasFiltradas.length} lecturas</span>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Lecturas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.totalLecturas}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-gray-600">Temp. Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.promedioTemp}°C</p>
            <p className="text-xs text-gray-500 mt-1">
              Min: {estadisticas.minTemp}°C | Max: {estadisticas.maxTemp}°C
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-gray-600">Humedad Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.promedioHumedad}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.totalAlertas}</p>
          </div>
        </div>
      </div>

      {/* Gráfica de Tendencias */}
      <div className="bg-white rounded-xl shadow-sm p-6" ref={graficoTendenciasRef}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencias Temporales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosGraficaTendencias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperatura" stroke="#F59E0B" name="Temperatura (°C)" strokeWidth={2} />
            <Line type="monotone" dataKey="humedad" stroke="#3B82F6" name="Humedad (%)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficas de CO2 y CO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6" ref={graficoCO2Ref}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia de CO₂</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={datosGraficaTendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="co2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="CO₂ (ppm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6" ref={graficoCORef}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia de CO</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={datosGraficaTendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="co" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="CO (ppm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativa entre Sensores */}
      {sensorSeleccionado === 'todos' && datosGraficaComparativa.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6" ref={graficoComparativaRef}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparativa entre Sensores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGraficaComparativa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sensor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="temperatura" fill="#F59E0B" name="Temp (°C)" />
              <Bar dataKey="humedad" fill="#3B82F6" name="Humedad (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de Sensores Más Activos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensores Más Activos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lecturas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estadisticas.sensoresMasActivos.map((sensor, index) => (
                <tr key={sensor.id_sensor} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1} - {sensor.id_sensor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sensor.lecturas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ maxWidth: '200px' }}>
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