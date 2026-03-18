import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ConfirmProvider } from './components/common/ConfirmModal';
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
import Sitios from './pages/Sitios';
import Campanas from './pages/Campanas';
import SensorFicha from './pages/SensorFicha';
import SitioFicha from './pages/SitioFicha';
import CampanaFicha from './pages/CampanaFicha';

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Public routes */}
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/sensors" element={<Layout><Sensores /></Layout>} />
      <Route path="/sensors/:id" element={<Layout><SensorFicha /></Layout>} />
      <Route path="/readings" element={<Layout><Lecturas /></Layout>} />
      <Route path="/alerts" element={<Layout><Alertas /></Layout>} />
      <Route path="/reports" element={<Layout><Reportes /></Layout>} />
      <Route path="/sites" element={<Layout><Sitios /></Layout>} />
      <Route path="/sites/:id" element={<Layout><SitioFicha /></Layout>} />
      <Route path="/campaigns" element={<Layout><Campanas /></Layout>} />
      <Route path="/campaigns/:id" element={<Layout><CampanaFicha /></Layout>} />

      {/* Protected routes - Admin only */}
      <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><Layout><Configuracion /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute requiredRole="admin"><Layout><Perfil /></Layout></ProtectedRoute>} />
      <Route path="/api-keys" element={<ProtectedRoute requiredRole="admin"><Layout><GestionApiKeys /></Layout></ProtectedRoute>} />

      {/* Redirects for old Spanish URLs */}
      <Route path="/sensores" element={<Navigate to="/sensors" replace />} />
      <Route path="/sensores/:id" element={<Navigate to="/sensors/:id" replace />} />
      <Route path="/lecturas" element={<Navigate to="/readings" replace />} />
      <Route path="/alertas" element={<Navigate to="/alerts" replace />} />
      <Route path="/reportes" element={<Navigate to="/reports" replace />} />
      <Route path="/sitios" element={<Navigate to="/sites" replace />} />
      <Route path="/campanas" element={<Navigate to="/campaigns" replace />} />
      <Route path="/configuracion" element={<Navigate to="/settings" replace />} />
      <Route path="/perfil" element={<Navigate to="/profile" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppContent />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
