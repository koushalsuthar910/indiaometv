import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Safety from './pages/Safety';
import Report from './pages/Report';
import Login from './pages/Login';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/report" element={<Report />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
