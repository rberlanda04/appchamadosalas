const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuração do sistema de dados
const { initializeDataSystem } = require('./database');
const { logger } = require('./logger');

// Importar rotas
const chamadosRoutes = require('./routes/chamados');
const salasRoutes = require('./routes/salas');
const statusRoutes = require('./routes/status');

const app = express();
const PORT = process.env.PORT || 5001;

// Inicializar sistema de dados
initializeDataSystem().then(() => {
  logger.info('🚀 Sistema de dados inicializado com sucesso!');
}).catch(error => {
  logger.error('❌ Erro ao inicializar sistema:', error.message);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar as rotas
app.use('/api/chamados', chamadosRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/status', statusRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'API funcionando corretamente', timestamp: new Date().toISOString() });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Exportar apenas o app
module.exports = { app };