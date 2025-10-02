import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sensores from './pages/Sensores';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensores" element={<Sensores />} />
          {/* Agregar más rutas aquí */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;