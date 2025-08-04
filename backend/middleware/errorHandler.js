const { logger } = require('../logger');

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error('Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Definir status code padrão
  let statusCode = err.statusCode || err.status || 500;
  
  // Tratar diferentes tipos de erro
  let message = 'Erro interno do servidor';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados inválidos fornecidos';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Acesso não autorizado';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Acesso negado';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Recurso não encontrado';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    message = 'Conflito de dados - registro já existe';
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503;
    message = 'Serviço temporariamente indisponível';
  } else if (statusCode === 400) {
    message = err.message || 'Requisição inválida';
  } else if (statusCode === 404) {
    message = err.message || 'Recurso não encontrado';
  } else if (isDevelopment && statusCode >= 500) {
    message = err.message;
  }

  // Resposta de erro padronizada
  const errorResponse = {
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Adicionar detalhes em desenvolvimento
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  }

  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Wrapper para funções assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};