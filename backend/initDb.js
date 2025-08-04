const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Garante que o diretório database existe
const dbDir = path.resolve(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Caminho para o banco de dados
const dbPath = path.resolve(dbDir, 'chamados.db');

// Conecta ao banco de dados (cria se não existir)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    return;
  }
  console.log('Conectado ao banco de dados SQLite. Iniciando criação das tabelas...');
  
  // Habilita as chaves estrangeiras
  db.run('PRAGMA foreign_keys = ON');
  
  // Cria a tabela de salas
  db.run(`
    CREATE TABLE IF NOT EXISTS salas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL UNIQUE,
      descricao TEXT,
      bloco TEXT,
      andar TEXT,
      qr_code_url TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela salas:', err.message);
      return;
    }
    console.log('Tabela salas criada com sucesso');
    
    // Insere algumas salas de exemplo
    const salas = [
      { numero: '101', descricao: 'Sala de Aula', bloco: 'A', andar: 'Térreo' },
      { numero: '102', descricao: 'Sala de Aula', bloco: 'A', andar: 'Térreo' },
      { numero: '201', descricao: 'Laboratório de Informática', bloco: 'B', andar: '2º Andar' },
      { numero: '202', descricao: 'Sala de Aula', bloco: 'B', andar: '2º Andar' },
      { numero: '301', descricao: 'Sala de Reuniões', bloco: 'C', andar: '3º Andar' }
    ];
    
    const insertSala = db.prepare('INSERT OR IGNORE INTO salas (numero, descricao, bloco, andar) VALUES (?, ?, ?, ?)');
    salas.forEach(sala => {
      insertSala.run(sala.numero, sala.descricao, sala.bloco, sala.andar);
    });
    insertSala.finalize();
    
    console.log('Salas de exemplo inseridas com sucesso');
  });
  
  // Cria a tabela de status de chamados
  db.run(`
    CREATE TABLE IF NOT EXISTS status_chamado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela status_chamado:', err.message);
      return;
    }
    console.log('Tabela status_chamado criada com sucesso');
    
    // Insere os status padrão
    const status = [
      { nome: 'Aberto' },
      { nome: 'Em Andamento' },
      { nome: 'Finalizado' }
    ];
    
    const insertStatus = db.prepare('INSERT OR IGNORE INTO status_chamado (nome) VALUES (?)');
    status.forEach(s => {
      insertStatus.run(s.nome);
    });
    insertStatus.finalize();
    
    console.log('Status padrão inseridos com sucesso');
  });
  
  // Cria a tabela de chamados
  db.run(`
    CREATE TABLE IF NOT EXISTS chamados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sala_id INTEGER NOT NULL,
      status_id INTEGER NOT NULL DEFAULT 1,
      descricao TEXT,
      data_abertura DATETIME NOT NULL,
      data_atualizacao DATETIME,
      data_fechamento DATETIME,
      responsavel TEXT,
      observacoes TEXT,
      FOREIGN KEY (sala_id) REFERENCES salas (id),
      FOREIGN KEY (status_id) REFERENCES status_chamado (id)
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela chamados:', err.message);
      return;
    }
    console.log('Tabela chamados criada com sucesso');
    
    // Fecha a conexão com o banco de dados
    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar o banco de dados:', err.message);
        return;
      }
      console.log('Inicialização do banco de dados concluída com sucesso!');
    });
  });
});