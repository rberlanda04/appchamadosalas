import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  MeetingRoom as MeetingRoomIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import moment from 'moment';

const ChamadoCard = ({ chamado, onStatusChange }) => {
  const navigate = useNavigate();

  // Formata a data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Define a classe CSS com base no status
  const getStatusClass = (statusNome) => {
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

  // Navega para a página de detalhes do chamado
  const handleViewDetails = () => {
    navigate(`/chamados/${chamado.id}`);
  };

  // Atualiza o status do chamado
  const handleStatusChange = (newStatusId) => {
    if (onStatusChange) {
      onStatusChange(chamado.id, newStatusId);
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h6" component="div">
            Chamado #{chamado.id}
          </Typography>
          <Chip
            label={chamado.status_nome}
            className={getStatusClass(chamado.status_nome)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MeetingRoomIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body1">
            {chamado.sala_nome || `Sala ${chamado.sala_id}`}
          </Typography>
        </Box>

        {chamado.descricao && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {chamado.descricao}
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Aberto em: {formatDate(chamado.data_criacao)}
          </Typography>
        </Box>

        {chamado.responsavel && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Responsável: {chamado.responsavel}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button size="small" onClick={handleViewDetails}>
          Ver Detalhes
        </Button>

        {chamado.status_nome === 'Aberto' && (
          <Button
            size="small"
            color="primary"
            onClick={() => handleStatusChange(2)}
          >
            Em Andamento
          </Button>
        )}

        {chamado.status_nome === 'Em Andamento' && (
          <Button
            size="small"
            color="success"
            onClick={() => handleStatusChange(3)}
          >
            Finalizar
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ChamadoCard;