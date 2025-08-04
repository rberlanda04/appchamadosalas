import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { CameraAlt as CameraIcon } from '@mui/icons-material';

const QRCodeScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = (result) => {
    if (result) {
      setScanning(false);
      if (onScan) {
        onScan(result.text);
      }
    }
  };

  const handleError = (err) => {
    setError('Erro ao acessar a câmera. Verifique as permissões.');
    console.error(err);
    if (onError) {
      onError(err);
    }
  };

  const startScanning = () => {
    setScanning(true);
    setError('');
  };

  return (
    <Box className="qr-container">
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}

      {!scanning ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '50%',
              backgroundColor: '#f0f7ff',
              mb: 2,
            }}
          >
            <CameraIcon fontSize="large" color="primary" />
          </Paper>
          <Typography variant="h6" gutterBottom>
            Escanear QR Code
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            Escaneie o QR Code da sala para abrir um chamado de suporte técnico.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={startScanning}
            startIcon={<CameraIcon />}
          >
            Iniciar Scanner
          </Button>
        </Box>
      ) : (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <Typography variant="subtitle1" gutterBottom align="center">
            Aponte a câmera para o QR Code da sala
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              className="qr-reader"
              videoStyle={{ borderRadius: '12px' }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  border: '2px solid #1976d2',
                  width: '60%',
                  height: '60%',
                  borderRadius: '8px',
                }}
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setScanning(false)}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QRCodeScanner;