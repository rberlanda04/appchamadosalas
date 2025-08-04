const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inicializa o app Express
const app = express();
const PORT = process.env.PORT || 5000;

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
const chamadosRoutes = require('./routes/chamados');
const salasRoutes = require('./routes/salas');

// Configura as rotas
app.use('/api/chamados', chamadosRoutes(db));
app.use('/api/salas', salasRoutes(db));

// Rota de teste para verificar se a API está funcionando
app.get('/api/status', (req, res) => {
  res.json({ status: 'API funcionando corretamente' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Encerra a conexão com o banco de dados quando o servidor é encerrado
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar o banco de dados:', err.message);
    } else {
      console.log('Conexão com o banco de dados fechada');
    }
    process.exit(0);
  });
});