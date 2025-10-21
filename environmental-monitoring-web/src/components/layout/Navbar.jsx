// src/components/layout/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon // ✅ Agregar este import
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { usuario, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return isActive(path)
      ? "text-primary font-semibold"
      : "text-gray-700 hover:text-primary transition-colors font-medium";
  };

  // Si no está autenticado, no mostrar navbar
  if (!isAuthenticated) {
    return null;
  }

  // Obtener iniciales del nombre del usuario
  const getInitials = () => {
    if (!usuario?.nombre_completo) return 'U';
    const names = usuario.nombre_completo.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

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
            <Link to="/" className={linkClass('/')}>
              Dashboard
            </Link>
            <Link to="/sensores" className={linkClass('/sensores')}>
              Sensores
            </Link>
            <Link to="/alertas" className={linkClass('/alertas')}>
              Alertas
            </Link>
            <Link to="/reportes" className={linkClass('/reportes')}>
              Reportes
            </Link>
            <Link to="/lecturas" className={linkClass('/lecturas')}>
              Lecturas
            </Link>
            {/* ✅ Enlace a Perfil corregido */}
            <Link 
              to="/perfil" 
              className={`${linkClass('/perfil')} flex items-center space-x-2`}
            >
              <UserCircleIcon className="w-5 h-5" />
              <span>Mi Perfil</span>
            </Link>
          </div>

          {/* User section + Config */}
          <div className="flex items-center space-x-4">
            {/* Botón de Configuración (solo admin) */}
            {isAdmin() && (
              <Link 
                to="/configuracion"
                className={`p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 ${
                  isActive('/configuracion') ? 'text-primary' : 'text-gray-600 hover:text-primary'
                }`}
                title="Configuración"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </Link>
            )}

            {/* Avatar de usuario con menú */}
            <div className="relative group">
              <button className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials()}
                  </span>
                </div>
              </button>

              {/* Dropdown al hacer hover */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {usuario?.nombre_completo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {usuario?.email}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    usuario?.rol === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {usuario?.rol === 'admin' ? 'Administrador' : 'Analista'}
                  </span>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}