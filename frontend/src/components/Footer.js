import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {currentYear}
          {' '}
          <Link color="inherit" href="#">
            Sistema de Gerenciamento de Chamados
          </Link>
          {' - Desenvolvido para suporte técnico em salas de aula'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;