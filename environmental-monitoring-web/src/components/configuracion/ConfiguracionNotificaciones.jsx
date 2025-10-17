// src/components/configuracion/ConfiguracionNotificaciones.jsx
import { useState, useEffect } from 'react';
import { 
  BellAlertIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function ConfiguracionNotificaciones() {
  const [configuracion, setConfiguracion] = useState({
    emailNotificaciones: '',
    notificacionesActivas: true,
    alertasCriticas: true,
    alertasAltas: true,
    alertasMedias: false,
    resumenDiario: false,
    resumenSemanal: true,
    notificarNuevosSensores: true,
    notificarCambiosUmbrales: true
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Cargar configuración guardada
  useEffect(() => {
    const configGuardada = localStorage.getItem('configuracion_notificaciones');
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
    // Validar email
    if (configuracion.notificacionesActivas && !configuracion.emailNotificaciones) {
      setMensaje({ tipo: 'error', texto: 'Debes proporcionar un email para recibir notificaciones' });
      return;
    }

    if (configuracion.emailNotificaciones && !/\S+@\S+\.\S+/.test(configuracion.emailNotificaciones)) {
      setMensaje({ tipo: 'error', texto: 'Email inválido' });
      return;
    }

    setGuardando(true);
    try {
      // Guardar en localStorage (cambiar a API después)
      localStorage.setItem('configuracion_notificaciones', JSON.stringify(configuracion));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMensaje({ tipo: 'success', texto: 'Configuración de notificaciones guardada' });
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la configuración' });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Notificaciones</h2>
        <p className="text-sm text-gray-600 mt-1">
          Personaliza cómo y cuándo deseas recibir notificaciones del sistema
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email de Notificaciones */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <EnvelopeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email para Notificaciones</h3>
              <p className="text-sm text-gray-600">Dirección donde recibirás las alertas</p>
            </div>
          </div>
          <input
            type="email"
            value={configuracion.emailNotificaciones}
            onChange={(e) => handleChange('emailNotificaciones', e.target.value)}
            placeholder="tu-email@ejemplo.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Activar/Desactivar Notificaciones */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BellAlertIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estado de Notificaciones</h3>
              <p className="text-sm text-gray-600">Activa o desactiva todas las notificaciones</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notificaciones por Email</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.notificacionesActivas}
                onChange={(e) => handleChange('notificacionesActivas', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {/* Tipos de Alertas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <BellAlertIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tipos de Alertas</h3>
              <p className="text-sm text-gray-600">Selecciona qué alertas recibir</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-700">Alertas Críticas</span>
              </span>
              <input
                type="checkbox"
                checked={configuracion.alertasCriticas}
                onChange={(e) => handleChange('alertasCriticas', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                <span className="text-gray-700">Alertas Altas</span>
              </span>
              <input
                type="checkbox"
                checked={configuracion.alertasAltas}
                onChange={(e) => handleChange('alertasAltas', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-700">Alertas Medias</span>
              </span>
              <input
                type="checkbox"
                checked={configuracion.alertasMedias}
                onChange={(e) => handleChange('alertasMedias', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Resúmenes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <EnvelopeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resúmenes Periódicos</h3>
              <p className="text-sm text-gray-600">Recibe reportes automáticos</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">Resumen Diario (8:00 AM)</span>
              <input
                type="checkbox"
                checked={configuracion.resumenDiario}
                onChange={(e) => handleChange('resumenDiario', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">Resumen Semanal (Lunes 8:00 AM)</span>
              <input
                type="checkbox"
                checked={configuracion.resumenSemanal}
                onChange={(e) => handleChange('resumenSemanal', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Notificaciones del Sistema */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BellAlertIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Eventos del Sistema</h3>
              <p className="text-sm text-gray-600">Notificaciones administrativas</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">Nuevos sensores agregados</span>
              <input
                type="checkbox"
                checked={configuracion.notificarNuevosSensores}
                onChange={(e) => handleChange('notificarNuevosSensores', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">Cambios en umbrales</span>
              <input
                type="checkbox"
                checked={configuracion.notificarCambiosUmbrales}
                onChange={(e) => handleChange('notificarCambiosUmbrales', e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Vista Previa de Configuración */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Resumen de tu Configuración</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-2"><strong>Email:</strong> {configuracion.emailNotificaciones || 'No configurado'}</p>
            <p className="text-gray-600 mb-2"><strong>Estado:</strong> {configuracion.notificacionesActivas ? '✅ Activas' : '❌ Desactivadas'}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-2">
              <strong>Alertas:</strong> {[
                configuracion.alertasCriticas && 'Críticas',
                configuracion.alertasAltas && 'Altas',
                configuracion.alertasMedias && 'Medias'
              ].filter(Boolean).join(', ') || 'Ninguna'}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Resúmenes:</strong> {[
                configuracion.resumenDiario && 'Diario',
                configuracion.resumenSemanal && 'Semanal'
              ].filter(Boolean).join(', ') || 'Ninguno'}
            </p>
          </div>
        </div>
      </div>

      {/* Nota Informativa */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Las notificaciones por email requieren configuración adicional del servidor SMTP. 
              Actualmente esta funcionalidad guarda tus preferencias para cuando el sistema de envío de emails esté activo.
            </p>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
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
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}