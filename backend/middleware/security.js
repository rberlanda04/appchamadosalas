const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { config } = require('../config/environment');

// Middleware de rate limiting
const createRateLimit = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Muitas tentativas. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limits específicos usando configurações
const generalLimiter = createRateLimit(
  config.security.rateLimit.windowMs, 
  config.security.rateLimit.maxRequests
);
const authLimiter = createRateLimit(
  config.security.rateLimit.windowMs, 
  config.security.rateLimit.maxAuthRequests
);
const apiLimiter = createRateLimit(
  1 * 60 * 1000, // 1 minuto
  config.security.rateLimit.maxApiRequests
);

// Middleware de validação de entrada
const validateInput = (req, res, next) => {
  // Sanitizar strings de entrada
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>"'&]/g, '');
  };

  // Aplicar sanitização recursivamente
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

  // Sanitizar body, query e params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Middleware de segurança de headers
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

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  validateInput,
  securityHeaders
};