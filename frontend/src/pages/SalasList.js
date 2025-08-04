import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { salasService } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const SalasList = () => {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSala, setCurrentSala] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });

  // Busca as salas ao carregar a página
  useEffect(() => {
    fetchSalas();
  }, []);

  // Função para buscar as salas
  const fetchSalas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await salasService.getAll();
      setSalas(data);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
      if (err.response && err.response.data && err.response.data.error) {
         setError(String(err.response.data.error));
       } else {
        setError('Não foi possível carregar as salas. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir o diálogo de criação/edição de sala
  const handleOpenDialog = (sala = null) => {
    if (sala) {
      setCurrentSala(sala);
      setFormData({
        nome: sala.nome || '',
        descricao: sala.descricao || '',
      });
    } else {
      setCurrentSala(null);
      setFormData({
        nome: '',
        descricao: '',
      });
    }
    setOpenDialog(true);
  };

  // Função para abrir o diálogo de QR Code
  const handleOpenQRDialog = (sala) => {
    setCurrentSala(sala);
    setOpenQRDialog(true);
  };

  // Função para abrir o diálogo de exclusão
  const handleOpenDeleteDialog = (sala) => {
    setCurrentSala(sala);
    setOpenDeleteDialog(true);
  };

  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Função para salvar uma sala (criar ou atualizar)
  const handleSaveSala = async () => {
    if (!formData.nome) {
      setError('O nome da sala é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (currentSala) {
        // Atualiza uma sala existente
        await salasService.update(currentSala.id, formData);
      } else {
        // Cria uma nova sala
        await salasService.create(formData);
      }

      // Fecha o diálogo e atualiza a lista de salas
      setOpenDialog(false);
      fetchSalas();
    } catch (err) {
      console.error('Erro ao salvar sala:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(String(err.response.data.error));
      } else {
        setError('Não foi possível salvar a sala. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir uma sala
  const handleDeleteSala = async () => {
    if (!currentSala) return;

    setLoading(true);
    setError('');

    try {
      await salasService.delete(currentSala.id);
      // Fecha o diálogo e atualiza a lista de salas
      setOpenDeleteDialog(false);
      fetchSalas();
    } catch (err) {
      console.error('Erro ao excluir sala:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(String(err.response.data.error));
      } else {
        setError('Não foi possível excluir a sala. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
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
          Salas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Sala
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchSalas}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && !salas.length ? (
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
      ) : salas.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Chamados Abertos</TableCell>
                <TableCell align="center">QR Code</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salas.map((sala) => (
                <TableRow key={sala.id}>
                  <TableCell>{sala.nome}</TableCell>
                  <TableCell>{sala.descricao || '-'}</TableCell>
                  <TableCell>
                    {sala.chamados_abertos > 0 ? (
                      <Chip
                        label={sala.chamados_abertos}
                        color="error"
                        size="small"
                      />
                    ) : (
                      '0'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenQRDialog(sala)}
                    >
                      <QrCodeIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(sala)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(sala)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Nenhuma sala cadastrada
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Clique no botão "Nova Sala" para cadastrar uma sala.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSalas}
          >
            Atualizar
          </Button>
        </Paper>
      )}

      {/* Diálogo para criar/editar sala */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentSala ? 'Editar Sala' : 'Nova Sala'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="nome"
                label="Nome da Sala *"
                value={formData.nome}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="descricao"
                label="Descrição"
                value={formData.descricao}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveSala}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para exibir QR Code */}
      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>QR Code da Sala</DialogTitle>
        <DialogContent>
          {currentSala && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {currentSala.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {currentSala.descricao}
              </Typography>
              <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <QRCodeSVG
                  value={currentSala.nome}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Escaneie este QR Code para abrir um chamado para esta sala.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          {currentSala && (
            <Typography variant="body1">
              Tem certeza que deseja excluir a sala "{currentSala.nome}"?
              {currentSala.chamados_abertos > 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Esta sala possui {currentSala.chamados_abertos} chamado(s) aberto(s).
                  Não será possível excluí-la até que todos os chamados sejam finalizados.
                </Typography>
              )}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleDeleteSala}
            color="error"
            disabled={loading || (currentSala && currentSala.chamados_abertos > 0)}
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalasList;