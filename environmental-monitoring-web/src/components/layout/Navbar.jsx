import { Link } from 'react-router-dom';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">IA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">IIAP</h1>
              <p className="text-xs text-gray-500">Monitoreo Ambiental</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Dashboard
            </Link>
            <Link to="/sensores" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Sensores
            </Link>
            <Link to="/alertas" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Alertas
            </Link>
            <Link to="/reportes" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Reportes
            </Link>
          </div>

          {/* User section + Config */}
          <div className="flex items-center space-x-4">
            {/* Botón de Configuración */}
            <Link 
              to="/configuracion"
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Configuración"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </Link>

            {/* Avatar de usuario */}
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}