import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { chamadosService } from '../services/api';
import ChamadoCard from '../components/ChamadoCard';

const Dashboard = () => {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // Busca os chamados ao carregar a página e quando o tab muda
  useEffect(() => {
    fetchChamados();
  }, [tabValue]);

  // Função para buscar os chamados
  const fetchChamados = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      // Busca os chamados de acordo com o tab selecionado
      if (tabValue === 0) {
        // Todos os chamados
        data = await chamadosService.getAll();
      } else {
        // Chamados filtrados por status
        data = await chamadosService.getByStatus(tabValue);
      }
      setChamados(data);
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
      setError('Não foi possível carregar os chamados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar o status de um chamado
  const handleStatusChange = async (chamadoId, newStatusId) => {
    try {
      await chamadosService.updateStatus(chamadoId, {
        status_id: newStatusId,
        responsavel: 'Técnico', // Aqui poderia vir de um contexto de autenticação
      });
      // Atualiza a lista de chamados
      fetchChamados();
    } catch (err) {
      console.error('Erro ao atualizar status do chamado:', err);
      setError('Não foi possível atualizar o status do chamado. Tente novamente.');
    }
  };

  // Função para navegar para a página de escaneamento de QR Code
  const handleScanQRCode = () => {
    navigate('/scan');
  };

  // Função para lidar com a mudança de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<QrCodeIcon />}
          onClick={handleScanQRCode}
        >
          Escanear QR Code
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Todos" />
          <Tab label="Abertos" />
          <Tab label="Em Andamento" />
          <Tab label="Finalizados" />
        </Tabs>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchChamados}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : chamados.length > 0 ? (
        <Grid container spacing={2}>
          {chamados.map((chamado) => (
            <Grid item xs={12} sm={6} md={4} key={chamado.id}>
              <ChamadoCard
                chamado={chamado}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Nenhum chamado encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {tabValue === 0
              ? 'Não há chamados registrados no sistema.'
              : 'Não há chamados com este status.'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchChamados}
          >
            Atualizar
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;