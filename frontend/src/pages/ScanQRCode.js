import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import QRCodeScanner from '../components/QRCodeScanner';
import { salasService, chamadosService } from '../services/api';

const ScanQRCode = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [salaInfo, setSalaInfo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  // Função para lidar com o escaneamento do QR Code
  const handleScan = async (data) => {
    if (!data) return;

    setLoading(true);
    setError('');

    try {
      // Verifica se o QR Code contém um número de sala válido
      const salaNumero = data.trim();
      
      // Busca informações da sala pelo número
      const sala = await salasService.getByNumero(salaNumero);
      setSalaInfo(sala);
      setOpenDialog(true);
    } catch (err) {
      console.error('Erro ao processar QR Code:', err);
      if (err.response && err.response.status === 404) {
        setError(`Sala não encontrada. Verifique se o QR Code é válido.`);
      } else {
        setError('Erro ao processar o QR Code. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com erros do scanner
  const handleScanError = (err) => {
    console.error('Erro no scanner:', err);
    setError('Erro ao acessar a câmera. Verifique as permissões.');
  };

  // Função para abrir um chamado
  const handleSubmitChamado = async () => {
    if (!salaInfo) return;

    setLoading(true);
    setError('');

    try {
      // Cria um novo chamado
      await chamadosService.create({
        sala_id: salaInfo.id,
        descricao: descricao,
        responsavel: '', // Será preenchido pelo técnico que atender
      });

      // Fecha o diálogo e mostra mensagem de sucesso
      setOpenDialog(false);
      setSuccess(true);
      setDescricao('');
      setSalaInfo(null);

      // Redireciona para o dashboard após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Erro ao criar chamado:', err);
      setError('Não foi possível criar o chamado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para fechar o diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSalaInfo(null);
  };

  // Função para fechar a mensagem de sucesso
  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Escanear QR Code
      </Typography>

      <Typography variant="body1" paragraph>
        Escaneie o QR Code da sala para abrir um chamado de suporte técnico.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3,
            }}
          >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Processando...
            </Typography>
          </Box>
        ) : (
          <QRCodeScanner onScan={handleScan} onError={handleScanError} />
        )}
      </Box>

      {/* Diálogo para confirmar a abertura do chamado */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Chamado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja abrir um chamado para a sala:
          </DialogContentText>
          {salaInfo && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="h6">
                Sala {salaInfo.numero}
              </Typography>
              <Typography variant="body2">
                {salaInfo.descricao} - Bloco {salaInfo.bloco} - {salaInfo.andar}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="descricao"
            label="Descrição do problema (opcional)"
            type="text"
            fullWidth
            variant="outlined"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmitChamado}
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Abrir Chamado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar mensagem de sucesso */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          Chamado aberto com sucesso! Redirecionando...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScanQRCode;