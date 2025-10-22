// src/components/perfil/CambiarContrasenaModal.jsx
import { useState } from 'react';
import { 
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CambiarContrasenaModal({ isOpen, onClose, userId, onSuccess }) {
  const [formData, setFormData] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasena: ''
  });

  const [mostrar, setMostrar] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });

  const [validacion, setValidacion] = useState({
    longitudMinima: false,
    tieneMayuscula: false,
    tieneMinuscula: false,
    tieneNumero: false,
    tieneEspecial: false
  });

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Validar contraseña en tiempo real
  const validarContrasena = (password) => {
    setValidacion({
      longitudMinima: password.length >= 8,
      tieneMayuscula: /[A-Z]/.test(password),
      tieneMinuscula: /[a-z]/.test(password),
      tieneNumero: /[0-9]/.test(password),
      tieneEspecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'contrasenaNueva') {
      validarContrasena(value);
    }

    setError('');
  };

  const toggleMostrar = (campo) => {
    setMostrar(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.contrasenaActual) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }

    if (!formData.contrasenaNueva || !formData.confirmarContrasena) {
      setError('Debes completar todos los campos');
      return;
    }

    if (formData.contrasenaNueva !== formData.confirmarContrasena) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (!Object.values(validacion).every(v => v)) {
      setError('La nueva contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (formData.contrasenaActual === formData.contrasenaNueva) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setGuardando(true);

    try {
      const response = await fetch(`http://localhost:3000/api/perfil/${userId}/cambiar-contrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrasenaActual: formData.contrasenaActual,
          contrasenaNueva: formData.contrasenaNueva
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess('✅ Contraseña actualizada exitosamente');
        onClose();
        // Resetear formulario
        setFormData({
          contrasenaActual: '',
          contrasenaNueva: '',
          confirmarContrasena: ''
        });
      } else {
        setError(result.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <KeyIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cambiar Contraseña
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={mostrar.actual ? 'text' : 'password'}
                name="contrasenaActual"
                value={formData.contrasenaActual}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => toggleMostrar('actual')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrar.actual ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrar.nueva ? 'text' : 'password'}
                name="contrasenaNueva"
                value={formData.contrasenaNueva}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => toggleMostrar('nueva')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrar.nueva ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Requisitos de Seguridad */}
          {formData.contrasenaNueva && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Requisitos de seguridad:
              </p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${validacion.longitudMinima ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{validacion.longitudMinima ? '✅' : '⭕'}</span>
                  Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-2 ${validacion.tieneMayuscula ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{validacion.tieneMayuscula ? '✅' : '⭕'}</span>
                  Al menos una mayúscula
                </div>
                <div className={`flex items-center gap-2 ${validacion.tieneMinuscula ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{validacion.tieneMinuscula ? '✅' : '⭕'}</span>
                  Al menos una minúscula
                </div>
                <div className={`flex items-center gap-2 ${validacion.tieneNumero ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{validacion.tieneNumero ? '✅' : '⭕'}</span>
                  Al menos un número
                </div>
                <div className={`flex items-center gap-2 ${validacion.tieneEspecial ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{validacion.tieneEspecial ? '✅' : '⭕'}</span>
                  Al menos un carácter especial (!@#$%^&*)
                </div>
              </div>
            </div>
          )}

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrar.confirmar ? 'text' : 'password'}
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => toggleMostrar('confirmar')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrar.confirmar ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmarContrasena && formData.contrasenaNueva && (
              <p className={`text-xs mt-1 ${
                formData.contrasenaNueva === formData.confirmarContrasena 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formData.contrasenaNueva === formData.confirmarContrasena 
                  ? '✅ Las contraseñas coinciden' 
                  : '❌ Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !Object.values(validacion).every(v => v)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {guardando ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}