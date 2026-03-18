import { useState, useEffect } from 'react';
import { KeyIcon, PlusIcon, PowerIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiKeysAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { useConfirm } from '../components/common/ConfirmModal';

const GestionApiKeys = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [nuevaApiKey, setNuevaApiKey] = useState(null);
  const [formData, setFormData] = useState({
    key_name: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarApiKeys();
  }, []);

  const cargarApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeysAPI.obtenerTodas();
      setApiKeys(response.data.data);
    } catch (error) {
      console.error('Error al cargar API Keys:', error);
      toast.error('Error al cargar API Keys: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!formData.key_name.trim()) {
      toast.info('El nombre es requerido');
      return;
    }

    // id_sensor ya no es requerido al crear
    // if (!formData.id_sensor.trim()) { ... }

    try {
      const response = await apiKeysAPI.crear(formData);
      setNuevaApiKey(response.data.data);
      setShowModal(false);
      setShowModal(false);
      setShowKeyModal(true);
      setFormData({ key_name: '', descripcion: '' });
      cargarApiKeys();
    } catch (error) {
      console.error('Error al crear API Key:', error);
      toast.error('Error al crear API Key: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleEstado = async (id, nombreActual) => {
    if (!await confirm(`¿Confirmas cambiar el estado de "${nombreActual}"?`)) return;

    try {
      await apiKeysAPI.toggleEstado(id);
      cargarApiKeys();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!await confirm(`¿Estás seguro de eliminar permanentemente la API Key "${nombre}"? Esta acción no se puede deshacer y los dispositivos con esta key dejarán de funcionar.`)) return;

    try {
      await apiKeysAPI.eliminar(id);
      cargarApiKeys();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    toast.success('API Key copiada al portapapeles');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
            <KeyIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de API Keys</h1>
            <p className="mt-1 text-sm text-gray-600">
              Crea API Keys para sensores. El sensor se registrará automáticamente cuando envíe su primera lectura.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nueva API Key</span>
        </button>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Sensor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada por</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Uso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No hay API Keys registradas
                    </td>
                  </tr>
                ) : (
                  apiKeys.map(key => (
                    <tr key={key.id_api_key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {key.id_api_key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{key.key_name}</div>
                        {key.descripcion && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{key.descripcion}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-mono font-medium ${key.id_sensor ? 'text-gray-900' : 'text-orange-500 italic'}`}>
                          {key.id_sensor || 'Pendiente de conexión...'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${key.esta_activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {key.esta_activo ? '✓ Activo' : '✗ Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.usuario_creador?.username || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(key.ultima_uso)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleEstado(key.id_api_key, key.key_name)}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${key.esta_activo
                            ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                            } transition-colors`}
                          title={key.esta_activo ? 'Deshabilitar' : 'Habilitar'}
                        >
                          <PowerIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(key.id_api_key, key.key_name)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                          title="Eliminar permanentemente"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear nueva API Key */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleCrear}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Crear Nueva API Key
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            value={formData.key_name}
                            onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                            placeholder="ej: ESP32_Sensor_001"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                          <p className="mt-1 text-xs text-gray-500">Nombre descriptivo para identificar el dispositivo</p>
                        </div>

                        {/* Campo ID Sensor ELIMINADO - Se vincula automáticamente */}
                        {/* 
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID del Sensor *
                          </label>
                          <input ... />
                        </div> 
                        */}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción (opcional)
                          </label>
                          <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="ej: Sensor fijo en zona urbana de Iquitos"
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Crear API Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar la nueva API Key */}
      {showKeyModal && nuevaApiKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      ✅ API Key Creada Exitosamente
                    </h3>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>IMPORTANTE:</strong> Esta es la ÚNICA vez que verás la API Key completa. Guárdala en un lugar seguro.
                            <br /><br />
                            Esta API Key se vinculará automáticamente al primer sensor que envíe datos usándola. Asegúrate de configurarla en el dispositivo correcto.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                          <dd className="mt-1 text-sm text-gray-900">{nuevaApiKey.key_name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">ID del Sensor</dt>
                          <dd className="mt-1 text-sm text-gray-900 font-mono">
                            {nuevaApiKey.id_sensor || <span className="text-orange-500 italic">Se vinculará automáticamente al conectar</span>}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔑 API Key
                      </label>
                      <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-3">
                        <code className="flex-1 text-green-400 font-mono text-sm break-all">
                          {nuevaApiKey.api_key_plain}
                        </code>
                        <button
                          onClick={() => copiarAlPortapapeles(nuevaApiKey.api_key_plain)}
                          className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    setShowKeyModal(false);
                    setNuevaApiKey(null);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Entendido, he guardado la API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionApiKeys;
