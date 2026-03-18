// src/pages/Campanas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campanasAPI, sensoresAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { useConfirm } from '../components/common/ConfirmModal';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function Campanas() {
  const { permisos } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [campanas, setCampanas] = useState([]);
  const [sensoresMoviles, setSensoresMoviles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('todos');

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState(''); // 'crear', 'editar', 'ver'
  const [campanaSeleccionada, setCampanaSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campRes, sensRes] = await Promise.all([
        campanasAPI.getAll(),
        sensoresAPI.getAll()
      ]);
      setCampanas(campRes.data.data || []);
      const todos = sensRes.data.data || [];
      setSensoresMoviles(todos.filter(s => s.is_movil === true));
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar las campañas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const campanasFiltradas = campanas.filter(c => {
    const cumpleBusqueda = c.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
    const cumpleZona = filtroZona === 'todos' || c.zona === filtroZona;
    return cumpleBusqueda && cumpleEstado && cumpleZona;
  });

  // Estadisticas
  const stats = {
    total: campanas.length,
    activas: campanas.filter(c => c.estado === 'activa').length,
    planificadas: campanas.filter(c => c.estado === 'planificada').length,
    finalizadas: campanas.filter(c => c.estado === 'finalizada').length
  };

  const estadoBadge = (estado) => {
    const estilos = {
      planificada: 'bg-yellow-100 text-yellow-800',
      activa: 'bg-green-100 text-green-800',
      finalizada: 'bg-gray-100 text-gray-800'
    };
    return estilos[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const abrirModal = (tipo, campana = null) => {
    setModalTipo(tipo);
    setCampanaSeleccionada(campana);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalTipo('');
    setCampanaSeleccionada(null);
  };

  const handleEliminar = async (campana) => {
    const ok = await confirm(`¿Estas seguro de que deseas eliminar la campaña "${campana.nombre}"? Esta acción no se puede deshacer.`, { title: 'Confirmar', type: 'danger' });
    if (ok) {
      try {
        await campanasAPI.delete(campana.id);
        cargarDatos();
        toast.success('Campaña eliminada exitosamente');
      } catch (err) {
        console.error('Error al eliminar campana:', err);
        toast.error('Error al eliminar la campaña');
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
          onClick={cargarDatos}
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
          <h1 className="text-3xl font-bold text-gray-900">Campañas de Monitoreo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona campañas que agrupan sensores móviles para monitoreo ambiental
          </p>
        </div>
        {permisos.editarSensor() && (
          <button
            onClick={() => abrirModal('crear')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nueva Campaña</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campañas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planificadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.planificadas}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Finalizadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.finalizadas}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
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
              placeholder="Buscar por nombre de campaña..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="planificada">Planificada</option>
              <option value="activa">Activa</option>
              <option value="finalizada">Finalizada</option>
            </select>

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

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {campanasFiltradas.length} de {campanas.length} campañas
        </div>
      </div>

      {/* Lista de Campanas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campanasFiltradas.length > 0 ? (
          campanasFiltradas.map((campana) => (
            <div
              key={campana.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Encabezado de la tarjeta */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                    {campana.nombre}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${estadoBadge(campana.estado)}`}>
                    {campana.estado}
                  </span>
                </div>

                {/* Descripcion */}
                {campana.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {campana.descripcion}
                  </p>
                )}

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-16">Zona:</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                      {campana.zona}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{formatFecha(campana.fecha_inicio)}</span>
                    <span className="mx-1">-</span>
                    <span>{formatFecha(campana.fecha_fin)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Sensores:</span>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {campana.sensores?.length || 0} asignados
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/campaigns/${campana.id_campana}`)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition"
                    title="Ver dashboard de campaña"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>

                  {permisos.editarSensor() && (
                    <>
                      <button
                        onClick={() => abrirModal('editar', campana)}
                        className="text-yellow-600 hover:text-yellow-900 p-2 rounded hover:bg-yellow-50 transition"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(campana)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No se encontraron campañas que coincidan con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {modalAbierto && (modalTipo === 'crear' || modalTipo === 'editar') && (
        <ModalFormCampana
          campana={campanaSeleccionada}
          sensoresMoviles={sensoresMoviles}
          onClose={cerrarModal}
          onSuccess={cargarDatos}
        />
      )}

      {/* Ver detalle navega a /campanas/:id */}
    </div>
  );
}

// ---- Modal Form (Crear / Editar) ----
function ModalFormCampana({ campana, sensoresMoviles, onClose, onSuccess }) {
  const toast = useToast();
  const esEditar = !!campana;
  const [formData, setFormData] = useState({
    nombre: campana?.nombre || '',
    descripcion: campana?.descripcion || '',
    zona: campana?.zona || '',
    fecha_inicio: campana?.fecha_inicio ? campana.fecha_inicio.slice(0, 10) : '',
    fecha_fin: campana?.fecha_fin ? campana.fecha_fin.slice(0, 10) : '',
    sensores_ids: campana?.sensores?.map(s => s.id_sensor) || []
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSensor = (id_sensor) => {
    setFormData(prev => {
      const existe = prev.sensores_ids.includes(id_sensor);
      return {
        ...prev,
        sensores_ids: existe
          ? prev.sensores_ids.filter(id => id !== id_sensor)
          : [...prev.sensores_ids, id_sensor]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        zona: formData.zona,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        sensores_ids: formData.sensores_ids
      };

      if (esEditar) {
        await campanasAPI.update(campana.id, payload);
        toast.success('Campaña actualizada exitosamente');
      } else {
        await campanasAPI.create(payload);
        toast.success('Campaña creada exitosamente');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar campana:', err);
      toast.error('Error al guardar la campaña');
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
              {esEditar ? 'Editar Campaña' : 'Nueva Campaña'}
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
            {/* Nombre */}
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
                placeholder="Nombre de la campaña"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Descripcion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción de la campaña"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Zona */}
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

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  name="fecha_inicio"
                  required
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Sensores Moviles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sensores Moviles
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                {sensoresMoviles.length > 0 ? (
                  sensoresMoviles.map(sensor => (
                    <label
                      key={sensor.id_sensor}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.sensores_ids.includes(sensor.id_sensor)}
                        onChange={() => toggleSensor(sensor.id_sensor)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {sensor.nombre_sensor}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {sensor.id_sensor} - {sensor.zona}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        sensor.estado === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sensor.estado}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay sensores móviles disponibles
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.sensores_ids.length} sensor(es) seleccionado(s)
              </p>
            </div>

            {/* Botones */}
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
                {guardando ? 'Guardando...' : esEditar ? 'Guardar Cambios' : 'Crear Campaña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---- Modal Ver Detalle ----
function ModalVerCampana({ campana, onClose }) {
  const estadoBadge = (estado) => {
    const estilos = {
      planificada: 'bg-yellow-100 text-yellow-800',
      activa: 'bg-green-100 text-green-800',
      finalizada: 'bg-gray-100 text-gray-800'
    };
    return estilos[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detalle de Campaña</h2>
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
            {/* Información General */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="text-base font-medium text-gray-900">{campana.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${estadoBadge(campana.estado)}`}>
                    {campana.estado}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zona</p>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                    {campana.zona}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha Inicio</p>
                  <p className="text-base font-medium text-gray-900">{formatFecha(campana.fecha_inicio)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha Fin</p>
                  <p className="text-base font-medium text-gray-900">{formatFecha(campana.fecha_fin)}</p>
                </div>
              </div>
            </div>

            {/* Descripcion */}
            {campana.descripcion && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">{campana.descripcion}</p>
              </div>
            )}

            {/* Sensores Asignados */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sensores Asignados ({campana.sensores?.length || 0})
              </h3>
              {campana.sensores && campana.sensores.length > 0 ? (
                <div className="space-y-2">
                  {campana.sensores.map(sensor => (
                    <div
                      key={sensor.id_sensor}
                      className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${
                          sensor.estado === 'Activo' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {sensor.nombre_sensor || sensor.id_sensor}
                          </p>
                          <p className="text-xs text-gray-500">{sensor.id_sensor}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        sensor.estado === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sensor.estado || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay sensores asignados a esta campaña
                </p>
              )}
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
