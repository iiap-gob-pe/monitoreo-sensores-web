// src/components/configuracion/ConfiguracionUmbrales.jsx
import { useState, useEffect } from 'react';
import { sensoresAPI } from '../../services/api';
import axios from 'axios';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmModal';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { 
  FireIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

export default function ConfiguracionUmbrales() {
  const toast = useToast();
  const confirm = useConfirm();
  const [umbrales, setUmbrales] = useState([]);
  const [sensores, setSensores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSensor, setFiltroSensor] = useState('todos');
  const [filtroParametro, setFiltroParametro] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState(''); // 'crear', 'editar'
  const [umbralSeleccionado, setUmbralSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [sensoresRes, umbralesRes] = await Promise.all([
        sensoresAPI.getAll(),
        axios.get('http://localhost:3000/api/umbrales')
      ]);
      
      setSensores(sensoresRes.data.data || []);
      setUmbrales(umbralesRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar umbrales
  const umbralesFiltrados = umbrales.filter(umbral => {
    const cumpleBusqueda = 
      umbral.id_sensor.toLowerCase().includes(busqueda.toLowerCase()) ||
      umbral.parametro_nombre.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleSensor = 
      filtroSensor === 'todos' ? true :
      umbral.id_sensor === filtroSensor;

    const cumpleParametro = 
      filtroParametro === 'todos' ? true :
      umbral.parametro_nombre === filtroParametro;

    return cumpleBusqueda && cumpleSensor && cumpleParametro;
  });

  // Estadísticas
  const stats = {
    total: umbrales.length,
    activos: umbrales.filter(u => u.alerta_habilitar === true).length,
    sensoresConUmbrales: new Set(umbrales.map(u => u.id_sensor)).size
  };

  const abrirModal = (tipo, umbral = null) => {
    setModalTipo(tipo);
    setUmbralSeleccionado(umbral);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalTipo('');
    setUmbralSeleccionado(null);
  };

  const handleEliminar = async (umbral) => {
    if (await confirm(`¿Eliminar umbral de ${umbral.parametro_nombre} para ${umbral.id_sensor}?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/umbrales/${umbral.id_sensor_umbral}`);
        cargarDatos();
        toast.success('Umbral eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar umbral:', error);
        toast.error('Error al eliminar el umbral');
      }
    }
  };

  const getParametroIcon = (parametro) => {
    switch(parametro) {
      case 'Temperatura': return <FireIcon className="w-5 h-5 text-orange-500" />;
      case 'Humedad': return <span className="text-blue-500">💧</span>;
      case 'co2': return <span className="text-green-500">🌿</span>;
      case 'co': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón Agregar */}
      <div className="flex justify-end">
        <button
          onClick={() => abrirModal('crear')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Agregar Umbral</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Umbrales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <FireIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Umbrales Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sensores Configurados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.sensoresConUmbrales}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-3xl">📡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por sensor o parámetro..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            
            <select
              value={filtroSensor}
              onChange={(e) => setFiltroSensor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todos los sensores</option>
              {sensores.map(sensor => (
                <option key={sensor.id_sensor} value={sensor.id_sensor}>
                  {sensor.id_sensor}
                </option>
              ))}
            </select>

            <select
              value={filtroParametro}
              onChange={(e) => setFiltroParametro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todos los parámetros</option>
              <option value="Temperatura">Temperatura</option>
              <option value="Humedad">Humedad</option>
              <option value="co2">CO₂</option>
              <option value="co">CO</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {umbralesFiltrados.length} de {umbrales.length} umbrales
        </div>
      </div>

      {/* Tabla de Umbrales */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parámetro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Máximo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {umbralesFiltrados.length > 0 ? (
                umbralesFiltrados.map((umbral) => (
                  <tr key={umbral.id_sensor_umbral} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {umbral.id_sensor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getParametroIcon(umbral.parametro_nombre)}
                        <span className="text-sm text-gray-900">{umbral.parametro_nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {umbral.min_umbral !== null ? umbral.min_umbral : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {umbral.max_umbral !== null ? umbral.max_umbral : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        umbral.alerta_habilitar
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {umbral.alerta_habilitar ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => abrirModal('editar', umbral)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminar(umbral)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron umbrales que coincidan con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {modalAbierto && modalTipo === 'crear' && (
        <ModalCrearUmbral 
          sensores={sensores}
          onClose={cerrarModal} 
          onSuccess={cargarDatos} 
        />
      )}
      
      {modalAbierto && modalTipo === 'editar' && umbralSeleccionado && (
        <ModalEditarUmbral 
          umbral={umbralSeleccionado}
          onClose={cerrarModal} 
          onSuccess={cargarDatos} 
        />
      )}
    </div>
  );
}

// Componente Modal Crear Umbral
function ModalCrearUmbral({ sensores, onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    id_sensor: '',
    parametro_nombre: 'Temperatura',
    min_umbral: '',
    max_umbral: '',
    alerta_habilitar: true
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      await axios.post('http://localhost:3000/api/umbrales', {
        ...formData,
        min_umbral: formData.min_umbral ? parseFloat(formData.min_umbral) : null,
        max_umbral: formData.max_umbral ? parseFloat(formData.max_umbral) : null
      });
      toast.success('Umbral creado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear umbral:', error);
      toast.error(error.response?.data?.message || 'Error al crear el umbral');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agregar Nuevo Umbral</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sensor *
              </label>
              <select
                required
                value={formData.id_sensor}
                onChange={(e) => setFormData({...formData, id_sensor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar sensor</option>
                {sensores.map(sensor => (
                  <option key={sensor.id_sensor} value={sensor.id_sensor}>
                    {sensor.id_sensor} - {sensor.nombre_sensor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parámetro *
              </label>
              <select
                value={formData.parametro_nombre}
                onChange={(e) => setFormData({...formData, parametro_nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Temperatura">Temperatura (°C)</option>
                <option value="Humedad">Humedad (%)</option>
                <option value="co2">CO₂ (ppm)</option>
                <option value="co">CO (ppm)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_umbral}
                  onChange={(e) => setFormData({...formData, min_umbral: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: 5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_umbral}
                  onChange={(e) => setFormData({...formData, max_umbral: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: 35.0"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="alerta_habilitar"
                checked={formData.alerta_habilitar}
                onChange={(e) => setFormData({...formData, alerta_habilitar: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="alerta_habilitar" className="ml-2 block text-sm text-gray-700">
                Habilitar alertas para este umbral
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Crear Umbral'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente Modal Editar Umbral
function ModalEditarUmbral({ umbral, onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    min_umbral: umbral.min_umbral || '',
    max_umbral: umbral.max_umbral || '',
    alerta_habilitar: umbral.alerta_habilitar
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      await axios.patch(`http://localhost:3000/api/umbrales/${umbral.id_sensor_umbral}`, {
        min_umbral: formData.min_umbral ? parseFloat(formData.min_umbral) : null,
        max_umbral: formData.max_umbral ? parseFloat(formData.max_umbral) : null,
        alerta_habilitar: formData.alerta_habilitar
      });
      toast.success('Umbral actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al actualizar umbral:', error);
      toast.error('Error al actualizar el umbral');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Umbral</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sensor: <span className="font-semibold">{umbral.id_sensor}</span> - 
            Parámetro: <span className="font-semibold">{umbral.parametro_nombre}</span>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_umbral}
                  onChange={(e) => setFormData({...formData, min_umbral: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_umbral}
                  onChange={(e) => setFormData({...formData, max_umbral: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="alerta_habilitar_edit"
                checked={formData.alerta_habilitar}
                onChange={(e) => setFormData({...formData, alerta_habilitar: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="alerta_habilitar_edit" className="ml-2 block text-sm text-gray-700">
                Habilitar alertas para este umbral
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}