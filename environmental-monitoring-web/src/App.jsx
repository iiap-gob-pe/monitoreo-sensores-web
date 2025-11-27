import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sensores from './pages/Sensores';
import Alertas from "./pages/Alertas";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import Lecturas from './pages/Lecturas';
import Perfil from './pages/Perfil';
import GestionApiKeys from './pages/GestionApiKeys';

function AppContent() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* ✅ Rutas PÚBLICAS - Sin autenticación */}
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/sensores" element={<Layout><Sensores /></Layout>} />
      <Route path="/lecturas" element={<Layout><Lecturas /></Layout>} />
      <Route path="/alertas" element={<Layout><Alertas /></Layout>} />
      <Route path="/reportes" element={<Layout><Reportes /></Layout>} />

      {/* ✅ Rutas PROTEGIDAS - Solo Admin */}
      <Route
        path="/configuracion"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout><Configuracion /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout><Perfil /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-keys"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout><GestionApiKeys /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;