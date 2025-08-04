const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.dataFile = path.join(logsDir, 'data.json');
    this.initializeDataFile();
  }

  initializeDataFile() {
    if (!fs.existsSync(this.dataFile)) {
      const initialData = {
        chamados: [],
        salas: [
          { id: 1, nome: 'Sala 101', descricao: 'Sala de aula do primeiro andar', ativa: true },
          { id: 2, nome: 'Sala 102', descricao: 'Sala de aula do primeiro andar', ativa: true },
          { id: 3, nome: 'Sala 201', descricao: 'Sala de aula do segundo andar', ativa: true },
          { id: 4, nome: 'Sala 202', descricao: 'Sala de aula do segundo andar', ativa: true },
          { id: 5, nome: 'Laboratório de Informática', descricao: 'Laboratório com computadores', ativa: true }
        ],
        status: [
          { id: 1, nome: 'Aberto', descricao: 'Chamado recém criado', ativo: true },
          { id: 2, nome: 'Em Andamento', descricao: 'Chamado sendo atendido', ativo: true },
          { id: 3, nome: 'Finalizado', descricao: 'Chamado resolvido', ativo: true }
        ],
        counters: {
          chamados: 1,
          salas: 6,
          status: 4
        }
      };
      this.saveData(initialData);
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    const logLine = `${timestamp} [${level.toUpperCase()}] ${message}${data ? ' - ' + JSON.stringify(data) : ''}\n`;
    
    // Escrever no arquivo de log
    fs.appendFileSync(this.logFile, logLine);
    
    // Também exibir no console
    console.log(logLine.trim());
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }

  // Métodos para gerenciar dados
  loadData() {
    try {
      const data = fs.readFileSync(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      this.error('Erro ao carregar dados', { error: error.message });
      return null;
    }
  }

  saveData(data) {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      this.info('Dados salvos com sucesso');
      return true;
    } catch (error) {
      this.error('Erro ao salvar dados', { error: error.message });
      return false;
    }
  }

  // Métodos específicos para cada entidade
  logChamadoAction(action, chamadoData) {
    this.info(`Chamado ${action}`, {
      action,
      chamado: chamadoData
    });
  }

  logSalaAction(action, salaData) {
    this.info(`Sala ${action}`, {
      action,
      sala: salaData
    });
  }

  logStatusAction(action, statusData) {
    this.info(`Status ${action}`, {
      action,
      status: statusData
    });
  }

  // Backup dos dados
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(logsDir, `backup-${timestamp}.json`);
    
    try {
      const data = this.loadData();
      fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
      this.info('Backup criado', { file: backupFile });
      return backupFile;
    } catch (error) {
      this.error('Erro ao criar backup', { error: error.message });
      return null;
    }
  }

  // Limpar logs antigos (manter apenas os últimos 30 dias)
  cleanOldLogs() {
    try {
      const files = fs.readdirSync(logsDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < thirtyDaysAgo && file.endsWith('.log')) {
          fs.unlinkSync(filePath);
          this.info('Log antigo removido', { file });
        }
      });
    } catch (error) {
      this.error('Erro ao limpar logs antigos', { error: error.message });
    }
  }
}

// Instância singleton
const logger = new Logger();

module.exports = logger;