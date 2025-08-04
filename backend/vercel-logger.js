// Logger otimizado para ambiente serverless (Vercel)
// Não usa sistema de arquivos local, apenas console

class VercelLogger {
  constructor() {
    this.isServerless = true;
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = {}) {
    const timestamp = this.formatTimestamp();
    const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
    return `[${timestamp}] ${level}: ${message} ${dataStr}`;
  }

  info(message, data = {}) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log(`ℹ️  ${logMessage}`);
  }

  error(message, data = {}) {
    const logMessage = this.formatMessage('ERROR', message, data);
    console.error(`❌ ${logMessage}`);
  }

  warn(message, data = {}) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn(`⚠️  ${logMessage}`);
  }

  debug(message, data = {}) {
    // Em produção serverless, debug só vai para console em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.log(`🐛 ${logMessage}`);
    }
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

  // Métodos de arquivo não funcionam em serverless - retornam dados em memória
  saveData(data) {
    this.debug('Dados salvos em memória (serverless)', { dataKeys: Object.keys(data) });
    // Em serverless, os dados são mantidos apenas durante a execução
    this._memoryData = data;
  }

  loadData() {
    this.debug('Dados carregados da memória (serverless)');
    return this._memoryData || null;
  }

  // Métodos não aplicáveis em serverless
  createBackup() {
    this.debug('Backup não disponível em ambiente serverless');
  }

  cleanOldLogs() {
    this.debug('Limpeza de logs não aplicável em ambiente serverless');
  }
}

// Instância global do logger para Vercel
const logger = new VercelLogger();

module.exports = {
  logger
};