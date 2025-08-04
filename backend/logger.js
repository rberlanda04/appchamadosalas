const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.dataFile = path.join(this.logDir, 'data.json');
    this.logFile = path.join(this.logDir, 'app.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  writeToFile(message) {
    try {
      const logEntry = `[${this.formatTimestamp()}] ${message}\n`;
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Erro ao escrever no log:', error);
    }
  }

  info(message, data = {}) {
    const logMessage = `INFO: ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ''}`;
    console.log(`ℹ️  ${logMessage}`);
    this.writeToFile(logMessage);
  }

  error(message, data = {}) {
    const logMessage = `ERROR: ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ''}`;
    console.error(`❌ ${logMessage}`);
    this.writeToFile(logMessage);
  }

  warn(message, data = {}) {
    const logMessage = `WARN: ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ''}`;
    console.warn(`⚠️  ${logMessage}`);
    this.writeToFile(logMessage);
  }

  debug(message, data = {}) {
    const logMessage = `DEBUG: ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ''}`;
    console.log(`🐛 ${logMessage}`);
    this.writeToFile(logMessage);
  }

  // Métodos específicos para logging de entidades
  logChamado(action, chamado) {
    const message = `CHAMADO_${action}: ID=${chamado.id}, Título=${chamado.titulo || 'N/A'}, Status=${chamado.status_id || 'N/A'}`;
    this.info(message, { chamado });
  }

  logSala(action, sala) {
    const message = `SALA_${action}: ID=${sala.id}, Nome=${sala.nome || 'N/A'}, Ativa=${sala.ativa || 'N/A'}`;
    this.info(message, { sala });
  }

  logStatus(action, status) {
    const message = `STATUS_${action}: ID=${status.id}, Nome=${status.nome || 'N/A'}, Cor=${status.cor || 'N/A'}`;
    this.info(message, { status });
  }

  // Método para salvar dados em arquivo JSON
  saveData(data) {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      this.debug('Dados salvos em arquivo', { file: this.dataFile });
    } catch (error) {
      this.error('Erro ao salvar dados', { error: error.message });
    }
  }

  // Método para carregar dados do arquivo JSON
  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.debug('Dados carregados do arquivo', { file: this.dataFile });
        return data;
      }
      return null;
    } catch (error) {
      this.error('Erro ao carregar dados', { error: error.message });
      return null;
    }
  }

  // Método para criar backup dos logs
  createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.logDir, `backup-${timestamp}.log`);
      
      if (fs.existsSync(this.logFile)) {
        fs.copyFileSync(this.logFile, backupFile);
        this.info('Backup criado', { backup: backupFile });
      }
    } catch (error) {
      this.error('Erro ao criar backup', { error: error.message });
    }
  }

  // Método para limpar logs antigos
  cleanOldLogs(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate && file.endsWith('.log') && file !== 'app.log') {
          fs.unlinkSync(filePath);
          this.info('Log antigo removido', { file });
        }
      });
    } catch (error) {
      this.error('Erro ao limpar logs antigos', { error: error.message });
    }
  }
}

// Instância global do logger
const logger = new Logger();

module.exports = {
  logger
};