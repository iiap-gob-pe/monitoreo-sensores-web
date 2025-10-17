// src/components/configuracion/PreferenciasSistema.jsx
import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

export default function PreferenciasSistema() {
  const [configuracion, setConfiguracion] = useState({
    zonaHoraria: 'America/Lima',
    formatoFecha: 'DD/MM/YYYY',
    intervaloActualizacion: 30,
    registrosPorPagina: 20,
    mostrarGraficos: true,
    animacionesGraficos: true
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Cargar configuración guardada
  useEffect(() => {
    const configGuardada = localStorage.getItem('preferencias_sistema');
    if (configGuardada) {
      setConfiguracion(JSON.parse(configGuardada));
    }
  }, []);

  const handleChange = (campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // Guardar en localStorage
      localStorage.setItem('preferencias_sistema', JSON.stringify(configuracion));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMensaje({ tipo: 'success', texto: 'Preferencias guardadas exitosamente. Recargando página...' });
      
      // Recargar para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar las preferencias' });
    } finally {
      setGuardando(false);
    }
  };

  const handleRestaurar = () => {
    if (window.confirm('¿Restaurar configuración por defecto?')) {
      const configDefault = {
        zonaHoraria: 'America/Lima',
        formatoFecha: 'DD/MM/YYYY',
        intervaloActualizacion: 30,
        registrosPorPagina: 20,
        mostrarGraficos: true,
        animacionesGraficos: true
      };
      setConfiguracion(configDefault);
      localStorage.setItem('preferencias_sistema', JSON.stringify(configDefault));
      setMensaje({ tipo: 'success', texto: 'Configuración restaurada. Recargando...' });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preferencias del Sistema</h2>
          <p className="text-sm text-gray-600 mt-1">
            Personaliza la experiencia del sistema según tus preferencias
          </p>
        </div>
        <button
          onClick={handleRestaurar}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Restaurar por Defecto
        </button>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`p-4 rounded-lg ${
          mensaje.tipo === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
        </div>
      )}

      {/* Configuraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zona Horaria */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Zona Horaria</h3>
              <p className="text-sm text-gray-600">Configura la zona horaria del sistema</p>
            </div>
          </div>
          <select
            value={configuracion.zonaHoraria}
            onChange={(e) => handleChange('zonaHoraria', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="America/Lima">América/Lima (GMT-5)</option>
            <option value="America/Bogota">América/Bogotá (GMT-5)</option>
            <option value="America/Mexico_City">América/Ciudad de México (GMT-6)</option>
            <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (GMT-3)</option>
            <option value="Europe/Madrid">Europa/Madrid (GMT+1)</option>
          </select>
        </div>

        {/* Formato de Fecha */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GlobeAltIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Formato de Fecha</h3>
              <p className="text-sm text-gray-600">Cómo se muestran las fechas</p>
            </div>
          </div>
          <select
            value={configuracion.formatoFecha}
            onChange={(e) => handleChange('formatoFecha', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (15/10/2024)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (10/15/2024)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-10-15)</option>
          </select>
        </div>

        {/* Intervalo de Actualización */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowPathIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Actualización de Datos</h3>
              <p className="text-sm text-gray-600">Frecuencia de refresco automático</p>
            </div>
          </div>
          <select
            value={configuracion.intervaloActualizacion}
            onChange={(e) => handleChange('intervaloActualizacion', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={10}>Cada 10 segundos</option>
            <option value={30}>Cada 30 segundos (Recomendado)</option>
            <option value={60}>Cada 1 minuto</option>
            <option value={300}>Cada 5 minutos</option>
            <option value={0}>Desactivado (Manual)</option>
          </select>
        </div>

        {/* Registros por Página */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TableCellsIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Registros por Página</h3>
              <p className="text-sm text-gray-600">Cantidad predeterminada en tablas</p>
            </div>
          </div>
          <select
            value={configuracion.registrosPorPagina}
            onChange={(e) => handleChange('registrosPorPagina', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              
            <option value={10}>10 registros</option>
            <option value={20}>20 registros (Recomendado)</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
            <option value={200}>200 registros</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Este será el valor inicial en todas las tablas del sistema
          </p>
        </div>

        {/* Opciones de Gráficos */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Opciones de Visualización</h3>
              <p className="text-sm text-gray-600">Personaliza la interfaz gráfica</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={configuracion.mostrarGraficos}
                onChange={(e) => handleChange('mostrarGraficos', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <div>
                <span className="text-gray-900 font-medium">Mostrar gráficos</span>
                <p className="text-xs text-gray-500">En dashboard y reportes</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={configuracion.animacionesGraficos}
                onChange={(e) => handleChange('animacionesGraficos', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
              <div>
                <span className="text-gray-900 font-medium">Animaciones en gráficos</span>
                <p className="text-xs text-gray-500">Efectos visuales suaves</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Nota sobre Temperatura */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Nota sobre unidades de medida:</strong> El sistema trabaja con las siguientes unidades estándar:
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>Temperatura: Grados Celsius (°C)</li>
              <li>Humedad: Porcentaje (%)</li>
              <li>CO2: Partes por millón (ppm)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vista Previa */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Resumen de Configuración</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Zona Horaria:</strong> {configuracion.zonaHoraria}
            </p>
            <p className="text-gray-700">
              <strong>Formato de Fecha:</strong> {configuracion.formatoFecha}
            </p>
            <p className="text-gray-700">
              <strong>Actualización:</strong> {
                configuracion.intervaloActualizacion === 0 
                  ? 'Desactivada' 
                  : `Cada ${configuracion.intervaloActualizacion} segundos`
              }
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Registros por Página:</strong> {configuracion.registrosPorPagina}
            </p>
            <p className="text-gray-700">
              <strong>Gráficos:</strong> {configuracion.mostrarGraficos ? '✅ Activados' : '❌ Desactivados'}
            </p>
            <p className="text-gray-700">
              <strong>Animaciones:</strong> {configuracion.animacionesGraficos ? '✅ Activadas' : '❌ Desactivadas'}
            </p>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              <span>Guardar y Aplicar Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}