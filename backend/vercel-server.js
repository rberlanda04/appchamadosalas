const express = require('express');

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS simples
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint simples
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Endpoint simples para testar logs
app.get('/api/test', (req, res) => {
  console.log('Teste de log no Vercel:', new Date().toISOString());
  res.json({ 
    message: 'Teste realizado com sucesso',
    timestamp: new Date().toISOString(),
    logs: 'Verifique os logs do Vercel para ver esta mensagem'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro:', error.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Exportar para Vercel
module.exports = app;