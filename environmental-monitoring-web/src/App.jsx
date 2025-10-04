import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Sensores from './pages/Sensores';
import Alertas from "./pages/Alertas"; 

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensores" element={<Sensores />} />
          <Route path="/alertas" element={<Alertas />} />
          {/* Agregar más rutas aquí */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;