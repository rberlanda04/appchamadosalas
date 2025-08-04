const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inicializa o app Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conecta ao banco de dados SQLite
const dbPath = path.resolve(__dirname, '../database/chamados.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

// Importa as rotas
const chamadosRoutes = require('../backend/routes/chamados');
const salasRoutes = require('../backend/routes/salas');

// Configura as rotas
app.use('/api/chamados', chamadosRoutes(db));
app.use('/api/salas', salasRoutes(db));

// Rota de teste para verificar se a API está funcionando
app.get('/api/status', (req, res) => {
  res.json({ status: 'API funcionando corretamente' });
});

// Exporta o app para o Vercel
module.exports = app;