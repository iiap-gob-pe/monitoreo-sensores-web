export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IA</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">IIAP</h3>
                <p className="text-sm text-gray-400">Laboratorio de IA</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Investigación científica aplicada para la conservación y desarrollo sustentable de la Amazonía.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Instituto de Investigaciones de la Amazonía Peruana</p>
              <p>Iquitos, Loreto - Perú</p>
              <p>Email: investigacion@iiap.gob.pe</p>
              <p>Teléfono: +51 65 265 515</p>
            </div>
          </div>

          {/* Info adicional */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sistema de Monitoreo</h3>
            <p className="text-gray-400 text-sm">
              Sistema de monitoreo ambiental en tiempo real mediante dispositivos IoT para la Amazonía peruana.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          © 2025 IIAP. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}