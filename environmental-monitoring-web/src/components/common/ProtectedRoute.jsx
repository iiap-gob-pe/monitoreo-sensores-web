// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { usuario, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si se requiere un rol específico
  if (requiredRole && usuario.rol !== requiredRole) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        <p className="text-sm text-gray-500 mt-2">Tu rol: {usuario.rol}</p>
      </div>
    );
  }

  return children;
}