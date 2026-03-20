// src/pages/Sitios.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sitiosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { useConfirm } from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function Sitios() {
  const { permisos } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [sitios, setSitios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroZona, setFiltroZona] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  useEffect(() => {
    cargarSitios();
  }, []);

  const cargarSitios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sitiosAPI.getAll();
      setSitios(response.data.data || []);
    } catch (err) {
      console.error('Error al cargar sitios:', err);
      setError('Error al cargar los sitios. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar sitios
  const sitiosFiltrados = sitios.filter(sitio => {
    const cumpleBusqueda =
      sitio.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sitio.referencia_ubicacion?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleZona =
      filtroZona === 'todos' ? true : sitio.zona === filtroZona;

    return cumpleBusqueda && cumpleZona;
  });

  // Reset pagina cuando cambian filtros
  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroZona]);

  // Paginación
  const totalPaginas = Math.ceil(sitiosFiltrados.length / porPagina);
  const sitiosPaginados = sitiosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Estadisticas
  const stats = {
    total: sitios.length,
    activos: sitios.filter(s => s.estado === 'Activo').length,
    conSensores: sitios.filter(s => s.sensores_asociados && s.sensores_asociados > 0).length,
    sinSensores: sitios.filter(s => !s.sensores_asociados || s.sensores_asociados === 0).length
  };

  const abrirModal = (tipo, sitio = null) => {
    setModalTipo(tipo);
    setSitioSeleccionado(sitio);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalTipo('');
    setSitioSeleccionado(null);
  };

  const handleEliminar = async (sitio) => {
    if (!permisos.editarSensor()) {
      toast.error('No tienes permisos para eliminar sitios');
      return;
    }

    const ok = await confirm(`¿Estas seguro de eliminar el sitio "${sitio.nombre}"? Esta accion no se puede deshacer.`, { title: 'Confirmar', type: 'danger' });
    if (ok) {
      try {
        await sitiosAPI.delete(sitio.id_sitio);
        cargarSitios();
        toast.success('Sitio eliminado exitosamente');
      } catch (err) {
        console.error('Error al eliminar sitio:', err);
        toast.error('Error al eliminar el sitio');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={cargarSitios}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Sitios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra los sitios de monitoreo donde se instalan sensores estacionarios
          </p>
        </div>

        {permisos.editarSensor() && (
          <button
            onClick={() => abrirModal('crear')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Sitio</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sitios</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <MapPinIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPinIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Sensores</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.conSensores}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPinIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Sensores</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.sinSensores}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <MapPinIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Busqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Busqueda */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o referencia de ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtro zona */}
          <div className="flex items-center space-x-3">
            <select
              value={filtroZona}
              onChange={(e) => setFiltroZona(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todas las zonas</option>
              <option value="Urbana">Urbana</option>
              <option value="Rural">Rural</option>
              <option value="Bosque">Bosque</option>
              <option value="Rio">Rio</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {sitiosFiltrados.length} de {sitios.length} sitios
        </div>
      </div>

      {/* Tabla de Sitios */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lat/Lon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sensores asociados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sitiosPaginados.length > 0 ? (
                sitiosPaginados.map((sitio) => (
                  <tr key={sitio._id || sitio.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <MapPinIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sitio.nombre}
                          </div>
                          {sitio.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {sitio.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sitio.zona === 'Urbana' ? 'bg-gray-100 text-gray-800' :
                        sitio.zona === 'Rural' ? 'bg-green-100 text-green-800' :
                        sitio.zona === 'Bosque' ? 'bg-emerald-100 text-emerald-800' :
                        sitio.zona === 'Rio' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sitio.zona}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sitio.referencia_ubicacion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sitio.latitud && sitio.longitud
                        ? `${Number(sitio.latitud).toFixed(4)}, ${Number(sitio.longitud).toFixed(4)}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sitio.sensores_asociados > 0
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sitio.sensores_asociados || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sitio.estado === 'Activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sitio.estado || 'Activo'}
                      </span>
                      <span className={`ml-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        sitio.visibilidad === 'privado' ? 'bg-gray-800 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {sitio.visibilidad === 'privado' ? 'Privado' : 'Público'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/sites/${sitio.id_sitio}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                          title="Ver dashboard del sitio"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>

                        {permisos.editarSensor() ? (
                          <button
                            onClick={() => abrirModal('editar', sitio)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-300 p-1 rounded cursor-not-allowed"
                            title="Sin permisos para editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}

                        {permisos.editarSensor() ? (
                          <button
                            onClick={() => handleEliminar(sitio)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-300 p-1 rounded cursor-not-allowed"
                            title="Sin permisos para eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron sitios que coincidan con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPaginas > 1 && (
          <Pagination
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onChange={setPagina}
            totalItems={sitiosFiltrados.length}
            porPagina={porPagina}
          />
        )}
      </div>

      {/* Modales */}
      {modalAbierto && modalTipo === 'crear' && permisos.editarSensor() && (
        <ModalFormSitio
          onClose={cerrarModal}
          onSuccess={cargarSitios}
        />
      )}

      {modalAbierto && modalTipo === 'editar' && sitioSeleccionado && permisos.editarSensor() && (
        <ModalFormSitio
          sitio={sitioSeleccionado}
          onClose={cerrarModal}
          onSuccess={cargarSitios}
        />
      )}

      {/* Ver detalle navega a /sitios/:id */}
    </div>
  );
}

// Modal para crear/editar sitio
function ModalFormSitio({ sitio = null, onClose, onSuccess }) {
  const toast = useToast();
  const esEdicion = !!sitio;
  const [formData, setFormData] = useState({
    nombre: sitio?.nombre || '',
    descripcion: sitio?.descripcion || '',
    referencia_ubicacion: sitio?.referencia_ubicacion || '',
    latitud: sitio?.latitud || '',
    longitud: sitio?.longitud || '',
    altitud: sitio?.altitud || '',
    zona: sitio?.zona || '',
    visibilidad: sitio?.visibilidad || 'publico'
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    // Preparar datos: convertir campos numericos
    const datos = {
      ...formData,
      latitud: formData.latitud !== '' ? Number(formData.latitud) : undefined,
      longitud: formData.longitud !== '' ? Number(formData.longitud) : undefined,
      altitud: formData.altitud !== '' ? Number(formData.altitud) : undefined
    };

    // Limpiar campos undefined
    Object.keys(datos).forEach(key => {
      if (datos[key] === undefined || datos[key] === '') {
        delete datos[key];
      }
    });

    try {
      if (esEdicion) {
        await sitiosAPI.update(sitio.id_sitio, datos);
        toast.success('Sitio actualizado exitosamente');
      } else {
        await sitiosAPI.create(datos);
        toast.success('Sitio creado exitosamente');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar sitio:', err);
      toast.error(err.response?.data?.message || 'Error al guardar el sitio');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {esEdicion ? 'Editar Sitio' : 'Nuevo Sitio'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Estación Parque Central"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción del sitio de monitoreo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia de Ubicación
              </label>
              <input
                type="text"
                name="referencia_ubicacion"
                value={formData.referencia_ubicacion}
                onChange={handleChange}
                placeholder="Ej: Frente a la plaza principal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud *
                </label>
                <input
                  type="number"
                  name="latitud"
                  step="any"
                  required
                  value={formData.latitud}
                  onChange={handleChange}
                  placeholder="Ej: -12.0464"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud *
                </label>
                <input
                  type="number"
                  name="longitud"
                  step="any"
                  required
                  value={formData.longitud}
                  onChange={handleChange}
                  placeholder="Ej: -77.0428"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altitud (m.s.n.m.)
              </label>
              <input
                type="number"
                name="altitud"
                step="any"
                value={formData.altitud}
                onChange={handleChange}
                placeholder="Ej: 154"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona *
              </label>
              <select
                name="zona"
                required
                value={formData.zona}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar zona</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
                <option value="Bosque">Bosque</option>
                <option value="Rio">Rio</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibilidad</label>
                <p className="text-xs text-gray-500">
                  {formData.visibilidad === 'publico' ? 'Visible para todos los visitantes' : 'Solo visible para usuarios autenticados'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, visibilidad: formData.visibilidad === 'publico' ? 'privado' : 'publico'})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  formData.visibilidad === 'publico' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  formData.visibilidad === 'publico' ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
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
                {guardando
                  ? 'Guardando...'
                  : esEdicion
                    ? 'Guardar Cambios'
                    : 'Crear Sitio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal para ver detalles del sitio
function ModalVerSitio({ sitio, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalles del Sitio</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Informacion General */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="text-base font-medium text-gray-900">{sitio.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zona</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sitio.zona === 'Urbana' ? 'bg-gray-100 text-gray-800' :
                    sitio.zona === 'Rural' ? 'bg-green-100 text-green-800' :
                    sitio.zona === 'Bosque' ? 'bg-emerald-100 text-emerald-800' :
                    sitio.zona === 'Rio' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sitio.zona}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    sitio.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {sitio.estado || 'Activo'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sensores Asociados</p>
                  <p className="text-base font-medium text-gray-900">{sitio.sensores_asociados || 0}</p>
                </div>
              </div>
            </div>

            {/* Ubicacion */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Referencia</p>
                  <p className="text-base font-medium text-gray-900">
                    {sitio.referencia_ubicacion || 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Altitud</p>
                  <p className="text-base font-medium text-gray-900">
                    {sitio.altitud ? `${sitio.altitud} m.s.n.m.` : 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Latitud</p>
                  <p className="text-base font-medium text-gray-900">
                    {sitio.latitud ?? 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longitud</p>
                  <p className="text-base font-medium text-gray-900">
                    {sitio.longitud ?? 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Descripcion */}
            {sitio.descripcion && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">{sitio.descripcion}</p>
              </div>
            )}

            {/* Fechas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Creación</p>
                  <p className="text-base font-medium text-gray-900">
                    {sitio.created_at
                      ? new Date(sitio.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Actualización</p>
                  <p className="text-base font-medium text-gray-900">
                    {sitio.updated_at
                      ? new Date(sitio.updated_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
