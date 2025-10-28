// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg'; // ✅ Import del logo

export default function Navbar() {
  const { usuario, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuMovilAbierto(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return isActive(path)
      ? "text-primary font-semibold border-b-2 border-primary"
      : "text-gray-700 hover:text-primary transition-colors font-medium hover:border-b-2 hover:border-primary/50";
  };

  const mobileLinkClass = (path) => {
    return isActive(path)
      ? "block px-4 py-3 text-base font-semibold text-primary bg-primary/5 rounded-lg"
      : "block px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-colors";
  };

  const getInitials = () => {
    if (!usuario?.nombre_completo) return 'AD';
    const names = usuario.nombre_completo.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const toggleMenuMovil = () => {
    setMenuMovilAbierto(!menuMovilAbierto);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y Título */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* ✅ Logo SVG con animación */}
              <img 
                src={logo} 
                alt="IIAP Logo" 
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
              />
              {/* Pulse effect opcional */}
              <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                IIAP
              </h1>
              <p className="text-xs text-gray-500">Monitoreo Ambiental</p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`${linkClass('/')} px-3 py-2`}>
              Dashboard
            </Link>
            <Link to="/sensores" className={`${linkClass('/sensores')} px-3 py-2`}>
              Sensores
            </Link>
            <Link to="/lecturas" className={`${linkClass('/lecturas')} px-3 py-2`}>
              Lecturas
            </Link>
            <Link to="/alertas" className={`${linkClass('/alertas')} px-3 py-2`}>
              Alertas
            </Link>
            <Link to="/reportes" className={`${linkClass('/reportes')} px-3 py-2`}>
              Reportes
            </Link>
          </div>

          {/* Acciones Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Configuración (solo admin) */}
                {isAdmin() && (
                  <Link 
                    to="/configuracion"
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${
                      isActive('/configuracion') ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary'
                    }`}
                    title="Configuración"
                  >
                    <Cog6ToothIcon className="w-6 h-6" />
                  </Link>
                )}

                {/* Avatar Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                      <span className="text-sm font-bold text-white">
                        {getInitials()}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-green-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {usuario?.nombre_completo}
                      </p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {usuario?.email}
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Administrador
                      </span>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/perfil"
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <UserCircleIcon className="w-5 h-5 text-gray-500" />
                        <span>Mi Perfil</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Botón Login Público */
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* Menú Hamburguesa Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <button className="relative p-2 text-gray-600">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}
            <button
              onClick={toggleMenuMovil}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
            >
              {menuMovilAbierto ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile */}
      {menuMovilAbierto && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link to="/" className={mobileLinkClass('/')} onClick={toggleMenuMovil}>
              📊 Dashboard
            </Link>
            <Link to="/sensores" className={mobileLinkClass('/sensores')} onClick={toggleMenuMovil}>
              📡 Sensores
            </Link>
            <Link to="/lecturas" className={mobileLinkClass('/lecturas')} onClick={toggleMenuMovil}>
              📈 Lecturas
            </Link>
            <Link to="/alertas" className={mobileLinkClass('/alertas')} onClick={toggleMenuMovil}>
              🚨 Alertas
            </Link>
            <Link to="/reportes" className={mobileLinkClass('/reportes')} onClick={toggleMenuMovil}>
              📄 Reportes
            </Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                {isAdmin() && (
                  <Link to="/configuracion" className={mobileLinkClass('/configuracion')} onClick={toggleMenuMovil}>
                    ⚙️ Configuración
                  </Link>
                )}
                <Link to="/perfil" className={mobileLinkClass('/perfil')} onClick={toggleMenuMovil}>
                  👤 Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  🚪 Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-center text-base font-semibold text-white bg-primary rounded-lg hover:bg-green-700 transition-colors"
                  onClick={toggleMenuMovil}
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}