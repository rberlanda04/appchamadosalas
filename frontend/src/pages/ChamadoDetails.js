import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  MeetingRoom as MeetingRoomIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { chamadosService } from '../services/api';

const ChamadoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chamado, setChamado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusId, setStatusId] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Busca os detalhes do chamado ao carregar a página
  useEffect(() => {
    fetchChamadoDetails();
  }, [id]);

  // Função para buscar os detalhes do chamado
  const fetchChamadoDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await chamadosService.getById(id);
      setChamado(data);
      setStatusId(data.status_id);
      setResponsavel(data.responsavel || '');
      setObservacoes(data.observacoes || '');
    } catch (err) {
      console.error('Erro ao buscar detalhes do chamado:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(String(err.response.data.error));
      } else {
        setError('Não foi possível carregar os detalhes do chamado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar o chamado
  const handleUpdateChamado = async () => {
    setSaving(true);
    setError('');
    try {
      await chamadosService.update(id, {
        status_id: statusId,
        responsavel,
        observacoes,
      });
      // Atualiza os detalhes do chamado
      fetchChamadoDetails();
    } catch (err) {
      console.error('Erro ao atualizar chamado:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(String(err.response.data.error));
      } else {
        setError('Não foi possível atualizar o chamado. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Função para excluir o chamado
  const handleDeleteChamado = async () => {
    setSaving(true);
    setError('');
    try {
      await chamadosService.delete(id);
      // Redireciona para o dashboard
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir chamado:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(String(err.response.data.error));
      } else {
        setError('Não foi possível excluir o chamado. Tente novamente.');
      }
      setSaving(false);
      setOpenDeleteDialog(false);
    }
  };

  // Formata a data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Define a classe CSS com base no status
  const getStatusClass = (statusNome) => {
    if (!statusNome) return '';
    switch (statusNome.toLowerCase()) {
      case 'aberto':
        return 'status-aberto';
      case 'em andamento':
        return 'status-em-andamento';
      case 'finalizado':
        return 'status-finalizado';
      default:
        return '';
    }
  };

  // Função para voltar para a página anterior
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Detalhes do Chamado
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchChamadoDetails}>
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
      ) : chamado ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5">
                  Chamado #{chamado.id}
                </Typography>
                <Chip
                  label={chamado.status_nome}
                  className={getStatusClass(chamado.status_nome)}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MeetingRoomIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Sala {chamado.sala_numero} - Bloco {chamado.bloco} - {chamado.andar}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Aberto em:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(chamado.data_abertura)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Última atualização:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(chamado.data_atualizacao)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {chamado.data_fechamento && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Fechado em:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(chamado.data_fechamento)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {chamado.responsavel && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Responsável:
                        </Typography>
                        <Typography variant="body1">
                          {chamado.responsavel}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {chamado.descricao && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <CommentIcon fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Descrição:
                        </Typography>
                        <Typography variant="body1">
                          {chamado.descricao}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {chamado.observacoes && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <CommentIcon fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Observações:
                        </Typography>
                        <Typography variant="body1">
                          {chamado.observacoes}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Atualizar Chamado
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  label="Status"
                >
                  <MenuItem value={1}>Aberto</MenuItem>
                  <MenuItem value={2}>Em Andamento</MenuItem>
                  <MenuItem value={3}>Finalizado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Responsável"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Observações"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                multiline
                rows={4}
              />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  Excluir
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateChamado}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          Chamado não encontrado. Verifique se o ID está correto.
        </Alert>
      )}

      {/* Diálogo de confirmação para excluir chamado */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleDeleteChamado}
            color="error"
            disabled={saving}
          >
            {saving ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChamadoDetails;