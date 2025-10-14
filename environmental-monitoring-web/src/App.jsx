import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sensores from './pages/Sensores';
import Alertas from "./pages/Alertas";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import Lecturas from './pages/Lecturas';
// import Usuarios from './pages/Usuarios'; // Lo crearemos después

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas - requieren autenticación */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sensores" 
        element={
          <ProtectedRoute>
            <Layout>
              <Sensores />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lecturas" 
        element={
          <ProtectedRoute>
            <Layout>
              <Lecturas />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alertas" 
        element={
          <ProtectedRoute>
            <Layout>
              <Alertas />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reportes" 
        element={
          <ProtectedRoute>
            <Layout>
              <Reportes />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Rutas solo para admin */}
      <Route 
        path="/configuracion" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Configuracion />
            </Layout>
          </ProtectedRoute>
        } 
      />
      {/* <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Usuarios />
            </Layout>
          </ProtectedRoute>
        } 
      /> */}

      {/* Redirigir cualquier ruta no encontrada */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        } 
      />
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