// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo y Descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logo} 
                alt="IIAP Logo" 
                className="w-12 h-12 brightness-0 invert"
              />
              <div>
                <h3 className="text-xl font-bold">IIAP</h3>
                <p className="text-sm text-gray-400">Laboratorio de IA</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Instituto de Investigaciones de la Amazonía Peruana. 
              Investigación científica aplicada para la conservación y desarrollo 
              sustentable de la Amazonía.
            </p>
            {/* Redes Sociales */}
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/iiap" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/iiap" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/iiap" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/sensores" className="text-gray-400 hover:text-white transition-colors">
                  Sensores
                </Link>
              </li>
              <li>
                <Link to="/lecturas" className="text-gray-400 hover:text-white transition-colors">
                  Lecturas
                </Link>
              </li>
              <li>
                <Link to="/alertas" className="text-gray-400 hover:text-white transition-colors">
                  Alertas
                </Link>
              </li>
              <li>
                <Link to="/reportes" className="text-gray-400 hover:text-white transition-colors">
                  Reportes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>Av. Abelardo Quiñones Km. 2.5<br/>Iquitos, Loreto - Perú</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📧</span>
                <a href="mailto:investigacion@iiap.gob.pe" className="hover:text-white transition-colors">
                  investigacion@iiap.gob.pe
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <a href="tel:+5165265515" className="hover:text-white transition-colors">
                  +51 65 265 515
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">🌐</span>
                <a href="https://www.iiap.gob.pe" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  www.iiap.gob.pe
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              © {currentYear} IIAP. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacidad" className="hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="hover:text-white transition-colors">
                Términos de Uso
              </Link>
              <span className="text-gray-600">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}