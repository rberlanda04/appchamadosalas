const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar e validar configurações
const { config, validateConfig, isProduction } = require('./config/environment');

// Validar configurações na inicialização
try {
  validateConfig();
} catch (error) {
  console.error('❌ Erro na configuração:', error.message);
  process.exit(1);
}

// Importar configuração do sistema de dados
const { initializeDataSystem } = require('./database');
const { logger } = require('./logger');

// Importar middlewares de segurança
const { 
  generalLimiter, 
  apiLimiter, 
  validateInput, 
  securityHeaders 
} = require('./middleware/security');

// Importar middleware de tratamento de erros
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Importar rotas
const chamadosRoutes = require('./routes/chamados');
const salasRoutes = require('./routes/salas');
const statusRoutes = require('./routes/status');

const app = express();
const PORT = config.server.port;

// Inicializar sistema de dados
initializeDataSystem().then(() => {
  logger.info('🚀 Sistema de dados inicializado com sucesso!');
}).catch(error => {
  logger.error('❌ Erro ao inicializar sistema:', error.message);
});

// Middleware de segurança (aplicar primeiro)
app.use(securityHeaders);
app.use(generalLimiter);
app.use(validateInput);

// Middleware básico
app.use(cors({
  origin: config.security.cors.origin,
  credentials: config.security.cors.credentials
}));
app.use(express.json({ limit: config.security.payload.jsonLimit }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.security.payload.urlEncodedLimit 
}));

// Aplicar rate limiting específico para APIs
app.use('/api', apiLimiter);

// Usar as rotas
app.use('/api/chamados', chamadosRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/status', statusRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API funcionando corretamente', 
    app: config.app.name,
    version: config.app.version,
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString() 
  });
});

// Middleware de tratamento de erros (deve vir por último)
app.use(notFoundHandler);
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, config.server.host, () => {
  console.log(`🚀 ${config.app.name} v${config.app.version}`);
  console.log(`🌐 Servidor rodando em http://${config.server.host}:${PORT}`);
  console.log(`🔧 Ambiente: ${config.server.nodeEnv}`);
  console.log(`🛡️  Segurança: ${isProduction() ? 'Produção' : 'Desenvolvimento'}`);
});

// Exportar apenas o app
module.exports = { app };