import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas
import Dashboard from './pages/Dashboard';
import ScanQRCode from './pages/ScanQRCode';
import ChamadoDetails from './pages/ChamadoDetails';
import SalasList from './pages/SalasList';
import SalaDetails from './pages/SalaDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<ScanQRCode />} />
          <Route path="/chamados/:id" element={<ChamadoDetails />} />
          <Route path="/salas" element={<SalasList />} />
          <Route path="/salas/:id" element={<SalaDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}

export default App;