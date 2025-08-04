import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { salasService, chamadosService } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import ChamadoCard from '../components/ChamadoCard';

const SalaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sala, setSala] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chamadosLoading, setChamadosLoading] = useState(true);
  const [error, setError] = useState('');
  const [chamadosError, setChamadosError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    bloco: '',
    andar: '',
  });
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Busca os detalhes da sala ao carregar a página
  useEffect(() => {
    fetchSalaDetails();
    fetchChamados();
  }, [id]);

  // Função para buscar os detalhes da sala
  const fetchSalaDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await salasService.getById(id);
      setSala(data);
      setFormData({
        numero: data.numero,
        descricao: data.descricao || '',
        bloco: data.bloco || '',
        andar: data.andar || '',
      });
    } catch (err) {
      console.error('Erro ao buscar detalhes da sala:', err);
      setError('Não foi possível carregar os detalhes da sala. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar os chamados da sala
  const fetchChamados = async () => {
    setChamadosLoading(true);
    setChamadosError('');
    try {
      // Aqui estamos simulando a busca de chamados por sala, já que não temos um endpoint específico
      // Em uma implementação real, você teria um endpoint como /api/salas/:id/chamados
      const allChamados = await chamadosService.getAll();
      const salaChamados = allChamados.filter(chamado => chamado.sala_id === parseInt(id));
      setChamados(salaChamados);
    } catch (err) {
      console.error('Erro ao buscar chamados da sala:', err);
      setChamadosError('Não foi possível carregar os chamados desta sala. Tente novamente.');
    } finally {
      setChamadosLoading(false);
    }
  };

  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Função para atualizar a sala
  const handleUpdateSala = async () => {
    if (!formData.numero) {
      setError('O número da sala é obrigatório.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await salasService.update(id, formData);
      // Atualiza os detalhes da sala e sai do modo de edição
      fetchSalaDetails();
      setEditMode(false);
    } catch (err) {
      console.error('Erro ao atualizar sala:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Não foi possível atualizar a sala. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Função para excluir a sala
  const handleDeleteSala = async () => {
    setSaving(true);
    setError('');

    try {
      await salasService.delete(id);
      // Redireciona para a lista de salas
      navigate('/salas');
    } catch (err) {
      console.error('Erro ao excluir sala:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Não foi possível excluir a sala. Tente novamente.');
      }
      setSaving(false);
      setOpenDeleteDialog(false);
    }
  };

  // Função para atualizar o status de um chamado
  const handleUpdateChamadoStatus = async (chamadoId, newStatusId) => {
    try {
      await chamadosService.updateStatus(chamadoId, newStatusId);
      // Atualiza a lista de chamados
      fetchChamados();
    } catch (err) {
      console.error('Erro ao atualizar status do chamado:', err);
      setChamadosError('Não foi possível atualizar o status do chamado. Tente novamente.');
    }
  };

  // Função para voltar para a página anterior
  const handleGoBack = () => {
    navigate('/salas');
  };

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    // Restaura os dados originais
    if (sala) {
      setFormData({
        numero: sala.numero,
        descricao: sala.descricao || '',
        bloco: sala.bloco || '',
        andar: sala.andar || '',
      });
    }
    setEditMode(false);
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 2 }}
      >
        Voltar para Lista de Salas
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Detalhes da Sala
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchSalaDetails}>
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
      ) : sala ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              {editMode ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Editar Sala
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="numero"
                        label="Número da Sala *"
                        value={formData.numero}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="descricao"
                        label="Descrição"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="bloco"
                        label="Bloco"
                        value={formData.bloco}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="andar"
                        label="Andar"
                        value={formData.andar}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={handleCancelEdit}
                      sx={{ mr: 1 }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateSala}
                      disabled={saving}
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h5">
                      Sala {sala.numero}
                    </Typography>
                    <Box>
                      <Tooltip title="Editar Sala">
                        <IconButton
                          color="primary"
                          onClick={() => setEditMode(true)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver QR Code">
                        <IconButton
                          color="primary"
                          onClick={() => setOpenQRDialog(true)}
                        >
                          <QrCodeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir Sala">
                        <IconButton
                          color="error"
                          onClick={() => setOpenDeleteDialog(true)}
                          disabled={chamados.filter(c => c.status_id !== 3).length > 0}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {sala.descricao && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Descrição:
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {sala.descricao}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Bloco:
                      </Typography>
                      <Typography variant="body1">
                        {sala.bloco || 'Não informado'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Andar:
                      </Typography>
                      <Typography variant="body1">
                        {sala.andar || 'Não informado'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Chamados Abertos:
                        </Typography>
                        <Chip
                          label={chamados.filter(c => c.status_id === 1).length}
                          color={chamados.filter(c => c.status_id === 1).length > 0 ? 'error' : 'default'}
                          sx={{ mr: 1 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  py: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  QR Code da Sala
                </Typography>
                <Box sx={{ my: 2 }}>
                  <QRCodeSVG
                    value={sala.numero}
                    size={150}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" align="center">
                  Escaneie este QR Code para abrir um chamado para esta sala.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Chamados desta Sala
              </Typography>

              {chamadosError && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={fetchChamados}>
                      Tentar Novamente
                    </Button>
                  }
                >
                  {chamadosError}
                </Alert>
              )}

              {chamadosLoading ? (
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
                <Box sx={{ mt: 2 }}>
                  {chamados.map((chamado) => (
                    <Box key={chamado.id} sx={{ mb: 2 }}>
                      <ChamadoCard
                        chamado={chamado}
                        onUpdateStatus={handleUpdateChamadoStatus}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" paragraph>
                    Nenhum chamado registrado para esta sala.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/scan')}
                  >
                    Abrir Novo Chamado
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          Sala não encontrada. Verifique se o ID está correto.
        </Alert>
      )}

      {/* Diálogo para exibir QR Code */}
      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>QR Code da Sala</DialogTitle>
        <DialogContent>
          {sala && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sala {sala.numero}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {sala.descricao} - Bloco {sala.bloco} - {sala.andar}
              </Typography>
              <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <QRCodeSVG
                  value={sala.numero}
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
          {sala && (
            <DialogContentText>
              Tem certeza que deseja excluir a sala {sala.numero}?
              {chamados.filter(c => c.status_id !== 3).length > 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Esta sala possui chamados abertos ou em andamento.
                  Não será possível excluí-la até que todos os chamados sejam finalizados.
                </Typography>
              )}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleDeleteSala}
            color="error"
            disabled={saving || chamados.filter(c => c.status_id !== 3).length > 0}
          >
            {saving ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaDetails;