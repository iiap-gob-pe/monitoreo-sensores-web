// src/pages/Variables.jsx
import { useState, useEffect } from 'react';
import { variablesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { useConfirm } from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

export default function Variables() {
  const { permisos } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [variableSeleccionada, setVariableSeleccionada] = useState(null);
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  useEffect(() => {
    cargarVariables();
  }, []);

  const cargarVariables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await variablesAPI.getAll();
      setVariables(response.data.data || []);
    } catch (err) {
      console.error('Error al cargar variables:', err);
      setError('Error al cargar las variables. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar variables
  const variablesFiltradas = variables.filter(v => {
    const texto = busqueda.toLowerCase();
    return (
      v.nombre?.toLowerCase().includes(texto) ||
      v.codigo?.toLowerCase().includes(texto)
    );
  });

  // Reset pagina cuando cambian filtros
  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(variablesFiltradas.length / porPagina);
  const variablesPaginadas = variablesFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Estadisticas
  const stats = {
    total: variables.length,
    activas: variables.filter(v => v.estado === 'activo').length,
    enUso: variables.filter(v => v.sensores_count > 0).length
  };

  const abrirModal = (tipo, variable = null) => {
    setModalTipo(tipo);
    setVariableSeleccionada(variable);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalTipo('');
    setVariableSeleccionada(null);
  };

  const handleEliminar = async (variable) => {
    if (!permisos.editarSensor()) {
      toast.error('No tienes permisos para eliminar variables');
      return;
    }

    const ok = await confirm(
      `¿Estás seguro de eliminar la variable "${variable.nombre}"? Esta acción no se puede deshacer.`,
      { title: 'Confirmar eliminación', type: 'danger' }
    );
    if (ok) {
      try {
        await variablesAPI.delete(variable.id_variable || variable._id || variable.id);
        cargarVariables();
        toast.success('Variable eliminada exitosamente');
      } catch (err) {
        console.error('Error al eliminar variable:', err);
        toast.error(err.response?.data?.message || 'Error al eliminar la variable');
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
          onClick={cargarVariables}
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Variables</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra las variables de monitoreo ambiental (temperatura, humedad, CO2, etc.)
          </p>
        </div>

        {permisos.editarSensor() && (
          <button
            onClick={() => abrirModal('crear')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nueva Variable</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Variables</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg">
              <BeakerIcon className="w-8 h-8 text-primary" />
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
              <BeakerIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Uso</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enUso}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BeakerIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Busqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {variablesFiltradas.length} de {variables.length} variables
        </div>
      </div>

      {/* Tabla de Variables */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sensores
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
              {variablesPaginadas.length > 0 ? (
                variablesPaginadas.map((variable) => (
                  <tr key={variable.id_variable || variable._id || variable.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-block w-5 h-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: variable.color || '#6B7280' }}
                        title={variable.color}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">{variable.codigo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <BeakerIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {variable.nombre}
                          </div>
                          {variable.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {variable.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variable.unidad || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variable.rango_min != null && variable.rango_max != null
                        ? `${variable.rango_min} - ${variable.rango_max}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        variable.sensores_count > 0
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {variable.sensores_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        variable.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {variable.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {permisos.editarSensor() ? (
                          <button
                            onClick={() => abrirModal('editar', variable)}
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
                            onClick={() => handleEliminar(variable)}
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
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron variables que coincidan con la búsqueda
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
            totalItems={variablesFiltradas.length}
            porPagina={porPagina}
          />
        )}
      </div>

      {/* Modales */}
      {modalAbierto && modalTipo === 'crear' && permisos.editarSensor() && (
        <ModalFormVariable
          onClose={cerrarModal}
          onSuccess={cargarVariables}
        />
      )}

      {modalAbierto && modalTipo === 'editar' && variableSeleccionada && permisos.editarSensor() && (
        <ModalFormVariable
          variable={variableSeleccionada}
          onClose={cerrarModal}
          onSuccess={cargarVariables}
        />
      )}
    </div>
  );
}

// Modal para crear/editar variable
function ModalFormVariable({ variable = null, onClose, onSuccess }) {
  const toast = useToast();
  const esEdicion = !!variable;
  const [formData, setFormData] = useState({
    codigo: variable?.codigo || '',
    nombre: variable?.nombre || '',
    unidad: variable?.unidad || '',
    descripcion: variable?.descripcion || '',
    rango_min: variable?.rango_min ?? '',
    rango_max: variable?.rango_max ?? '',
    color: variable?.color || '#22c55e',
    icono: variable?.icono || ''
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'codigo') {
      // Solo minusculas, sin espacios
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase().replace(/\s/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    // Preparar datos
    const datos = {
      ...formData,
      rango_min: formData.rango_min !== '' ? Number(formData.rango_min) : undefined,
      rango_max: formData.rango_max !== '' ? Number(formData.rango_max) : undefined
    };

    // Limpiar campos vacios/undefined
    Object.keys(datos).forEach(key => {
      if (datos[key] === undefined || datos[key] === '') {
        delete datos[key];
      }
    });

    // En edicion no enviar codigo
    if (esEdicion) {
      delete datos.codigo;
    }

    try {
      if (esEdicion) {
        await variablesAPI.update(variable.id_variable || variable._id || variable.id, datos);
        toast.success('Variable actualizada exitosamente');
      } else {
        await variablesAPI.create(datos);
        toast.success('Variable creada exitosamente');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar variable:', err);
      toast.error(err.response?.data?.message || 'Error al guardar la variable');
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
              {esEdicion ? 'Editar Variable' : 'Nueva Variable'}
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
                Código *
              </label>
              <input
                type="text"
                name="codigo"
                required
                disabled={esEdicion}
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ej: temperatura, humedad, co2"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono ${
                  esEdicion ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              {!esEdicion && (
                <p className="mt-1 text-xs text-gray-500">Minúsculas, sin espacios. No se puede modificar después.</p>
              )}
            </div>

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
                placeholder="Ej: Temperatura Ambiente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <input
                type="text"
                name="unidad"
                required
                value={formData.unidad}
                onChange={handleChange}
                placeholder="Ej: °C, %, ppm, µg/m³"
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
                placeholder="Descripción de la variable de monitoreo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango Mínimo
                </label>
                <input
                  type="number"
                  name="rango_min"
                  step="any"
                  value={formData.rango_min}
                  onChange={handleChange}
                  placeholder="Ej: 0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango Máximo
                </label>
                <input
                  type="number"
                  name="rango_max"
                  step="any"
                  value={formData.rango_max}
                  onChange={handleChange}
                  placeholder="Ej: 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 font-mono">{formData.color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono
                </label>
                <input
                  type="text"
                  name="icono"
                  value={formData.icono}
                  onChange={handleChange}
                  placeholder="Ej: thermometer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
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
                    : 'Crear Variable'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
