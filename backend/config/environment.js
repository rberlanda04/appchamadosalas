require('dotenv').config();

// Configurações de ambiente
const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 5001,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Configurações do banco de dados
  database: {
    path: process.env.DB_PATH || '../database/chamados.db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    timeout: parseInt(process.env.DB_TIMEOUT) || 30000
  },

  // Configurações de segurança
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      maxAuthRequests: parseInt(process.env.RATE_LIMIT_MAX_AUTH_REQUESTS) || 5,
      maxApiRequests: parseInt(process.env.RATE_LIMIT_MAX_API_REQUESTS) || 30
    },
    
    // CORS
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: process.env.CORS_CREDENTIALS === 'true' || true
    },
    
    // Limites de payload
    payload: {
      jsonLimit: process.env.JSON_LIMIT || '10mb',
      urlEncodedLimit: process.env.URL_ENCODED_LIMIT || '10mb'
    }
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  // Configurações da aplicação
  app: {
    name: process.env.APP_NAME || 'App Chamados',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Sistema de Gerenciamento de Chamados'
  }
};

// Validar configurações críticas
const validateConfig = () => {
  const errors = [];

  // Validar porta
  if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
    errors.push('PORT deve ser um número entre 1 e 65535');
  }

  // Validar ambiente
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(config.server.nodeEnv)) {
    errors.push('NODE_ENV deve ser: development, production ou test');
  }

  // Validar rate limiting
  if (config.security.rateLimit.windowMs < 1000) {
    errors.push('RATE_LIMIT_WINDOW_MS deve ser pelo menos 1000ms');
  }

  if (config.security.rateLimit.maxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS deve ser pelo menos 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuração inválida:\n${errors.join('\n')}`);
  }
};

// Função para obter configuração específica
const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj && obj[key], config);
};

// Função para verificar se está em produção
const isProduction = () => {
  return config.server.nodeEnv === 'production';
};

// Função para verificar se está em desenvolvimento
const isDevelopment = () => {
  return config.server.nodeEnv === 'development';
};

module.exports = {
  config,
  validateConfig,
  getConfig,
  isProduction,
  isDevelopment
};