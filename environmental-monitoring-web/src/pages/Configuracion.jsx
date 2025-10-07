// src/pages/Configuracion.jsx
import { useState, useEffect } from 'react';
import { sensoresAPI } from '../services/api';
import { 
  Cog6ToothIcon,
  BellAlertIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import ConfiguracionUmbrales from '../components/configuracion/ConfiguracionUmbrales';

export default function Configuracion() {
  const [tabActivo, setTabActivo] = useState('umbrales');

  const tabs = [
    { id: 'umbrales', nombre: 'Umbrales de Alertas', icono: BellAlertIcon, disponible: true },
    { id: 'usuarios', nombre: 'Gestión de Usuarios', icono: UserGroupIcon, disponible: false },
    { id: 'notificaciones', nombre: 'Notificaciones', icono: BellAlertIcon, disponible: false },
    { id: 'sistema', nombre: 'Preferencias del Sistema', icono: GlobeAltIcon, disponible: false },
    { id: 'exportacion', nombre: 'Exportación Automática', icono: ArrowDownTrayIcon, disponible: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
          <Cog6ToothIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona las configuraciones del sistema de monitoreo ambiental
          </p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icono;
            return (
              <button
                key={tab.id}
                onClick={() => tab.disponible && setTabActivo(tab.id)}
                disabled={!tab.disponible}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  tabActivo === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : tab.disponible
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.nombre}</span>
                {!tab.disponible && (
                  <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">
                    Próximamente
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div>
        {tabActivo === 'umbrales' && <ConfiguracionUmbrales />}
        
        {tabActivo === 'usuarios' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}

        {tabActivo === 'notificaciones' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BellAlertIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Notificaciones</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}

        {tabActivo === 'sistema' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <GlobeAltIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Preferencias del Sistema</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}

        {tabActivo === 'exportacion' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ArrowDownTrayIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Exportación Automática</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
}