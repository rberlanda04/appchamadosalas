const express = require('express');
const cors = require('cors');

// Importar e validar configurações
const { config, isProduction } = require('./config/environment');

// Importar configuração do sistema de dados
const { initializeDataSystem } = require('./vercel-database');
const { logger } = require('./vercel-logger');

// Importar middlewares de segurança (versão simplificada para serverless)
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar rotas otimizadas para Vercel
const chamadosRoutes = require('./routes/vercel-chamados');
const salasRoutes = require('./routes/vercel-salas');
const statusRoutes = require('./routes/vercel-status');

const app = express();

// Inicializar sistema de dados (apenas uma vez)
let dataInitialized = false;
const initData = async () => {
  if (!dataInitialized) {
    try {
      await initializeDataSystem();
      dataInitialized = true;
      logger.info('🚀 Sistema de dados inicializado para Vercel');
    } catch (error) {
      logger.error('❌ Erro ao inicializar sistema:', error.message);
    }
  }
};

// Rate limiting simplificado para serverless
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: isProduction() ? 100 : 200, // Mais permissivo em produção serverless
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para health check
    return req.path === '/api/health';
  }
});

// Middleware de segurança simplificado
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
});

// Middleware de validação de entrada simplificado
const validateInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>"'&]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// Middleware de segurança
app.use(securityHeaders);
app.use(validateInput);

// CORS configurado para produção
app.use(cors({
  origin: isProduction() ? 
    ['https://appchamadosalas.vercel.app', 'https://appchamadosalas-git-main-rberlanda04.vercel.app'] : 
    ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting para APIs
app.use('/api', apiLimiter);

// Middleware para inicializar dados em cada request (serverless)
app.use(async (req, res, next) => {
  await initData();
  next();
});

// Usar as rotas
app.use('/api/chamados', chamadosRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/status', statusRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API funcionando corretamente no Vercel', 
    app: config.app.name,
    version: config.app.version,
    environment: config.server.nodeEnv,
    serverless: true,
    timestamp: new Date().toISOString() 
  });
});

// Middleware de tratamento de erros simplificado
app.use((err, req, res, next) => {
  logger.error('Erro capturado no Vercel:', {
    message: err.message,
    url: req.url,
    method: req.method
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = isProduction() ? 'Erro interno do servidor' : err.message;

  res.status(statusCode).json({
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
});

// Exportar para Vercel
module.exports = app;