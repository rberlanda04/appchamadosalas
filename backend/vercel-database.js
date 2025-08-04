const { logger } = require('./vercel-logger');

class VercelDataManager {
  constructor() {
    this.data = {
      chamados: [],
      salas: [],
      status: []
    };
    this.nextIds = {
      chamados: 1,
      salas: 1,
      status: 1
    };
    this.initialized = false;
  }

  // Inicializar dados padrão
  initializeData() {
    if (this.initialized) {
      logger.debug('Dados já inicializados, pulando inicialização');
      return;
    }

    // Status padrão
    this.data.status = [
      { id: 1, nome: 'Aberto', cor: '#ff6b6b', ativo: true },
      { id: 2, nome: 'Em Andamento', cor: '#feca57', ativo: true },
      { id: 3, nome: 'Concluído', cor: '#48dbfb', ativo: true },
      { id: 4, nome: 'Cancelado', cor: '#ff9ff3', ativo: true }
    ];
    this.nextIds.status = 5;

    // Salas padrão
    this.data.salas = [
      { id: 1, nome: 'Sala 101', descricao: 'Sala de aula 101', ativa: true },
      { id: 2, nome: 'Sala 102', descricao: 'Sala de aula 102', ativa: true },
      { id: 3, nome: 'Laboratório de Informática', descricao: 'Lab de informática', ativa: true }
    ];
    this.nextIds.salas = 4;

    // Chamados de exemplo para demonstração
    this.data.chamados = [
      {
        id: 1,
        titulo: 'Projetor não funciona',
        descricao: 'O projetor da sala 101 não está ligando',
        sala_id: 1,
        status_id: 1,
        prioridade: 'alta',
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
      },
      {
        id: 2,
        titulo: 'Ar condicionado com problema',
        descricao: 'Ar condicionado não está resfriando adequadamente',
        sala_id: 2,
        status_id: 2,
        prioridade: 'media',
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
      }
    ];
    this.nextIds.chamados = 3;

    this.initialized = true;

    logger.info('Dados iniciais carregados no Vercel', {
      chamados: this.data.chamados.length,
      salas: this.data.salas.length,
      status: this.data.status.length
    });
  }

  // Métodos para Chamados
  getChamados() {
    return this.data.chamados;
  }

  getChamadoById(id) {
    return this.data.chamados.find(c => c.id === id);
  }

  createChamado(chamadoData) {
    const novoChamado = {
      id: this.nextIds.chamados++,
      ...chamadoData,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString()
    };
    this.data.chamados.push(novoChamado);
    logger.logChamado('CREATE', novoChamado);
    return novoChamado;
  }

  updateChamado(id, updateData) {
    const index = this.data.chamados.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.data.chamados[index] = {
      ...this.data.chamados[index],
      ...updateData,
      data_atualizacao: new Date().toISOString()
    };
    logger.logChamado('UPDATE', this.data.chamados[index]);
    return this.data.chamados[index];
  }

  deleteChamado(id) {
    const index = this.data.chamados.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    const chamado = this.data.chamados[index];
    this.data.chamados.splice(index, 1);
    logger.logChamado('DELETE', chamado);
    return true;
  }

  getChamadosAbertosBySala(salaId) {
    return this.data.chamados.filter(c => c.sala_id === salaId && c.status_id !== 3).length;
  }

  // Métodos para Salas
  getSalas() {
    return this.data.salas;
  }

  getSalaById(id) {
    return this.data.salas.find(s => s.id === id);
  }

  createSala(salaData) {
    const novaSala = {
      id: this.nextIds.salas++,
      ...salaData,
      ativa: salaData.ativa !== undefined ? salaData.ativa : true
    };
    this.data.salas.push(novaSala);
    logger.logSala('CREATE', novaSala);
    return novaSala;
  }

  updateSala(id, updateData) {
    const index = this.data.salas.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    this.data.salas[index] = {
      ...this.data.salas[index],
      ...updateData
    };
    logger.logSala('UPDATE', this.data.salas[index]);
    return this.data.salas[index];
  }

  deleteSala(id) {
    const index = this.data.salas.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    const sala = this.data.salas[index];
    this.data.salas.splice(index, 1);
    logger.logSala('DELETE', sala);
    return true;
  }

  // Métodos para Status
  getStatus() {
    return this.data.status;
  }

  getStatusById(id) {
    return this.data.status.find(s => s.id === id);
  }

  createStatus(statusData) {
    const novoStatus = {
      id: this.nextIds.status++,
      ...statusData
    };
    this.data.status.push(novoStatus);
    logger.logStatus('CREATE', novoStatus);
    return novoStatus;
  }

  updateStatus(id, updateData) {
    const index = this.data.status.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    this.data.status[index] = {
      ...this.data.status[index],
      ...updateData
    };
    logger.logStatus('UPDATE', this.data.status[index]);
    return this.data.status[index];
  }

  deleteStatus(id) {
    const index = this.data.status.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    const status = this.data.status[index];
    this.data.status.splice(index, 1);
    logger.logStatus('DELETE', status);
    return true;
  }
}

// Instância global do gerenciador de dados para Vercel
let vercelDataManager = null;

// Função para obter ou criar a instância do data manager
function getDataManager() {
  if (!vercelDataManager) {
    vercelDataManager = new VercelDataManager();
  }
  return vercelDataManager;
}

// Função para inicializar o sistema de dados no Vercel
async function initializeDataSystem() {
  try {
    logger.info('Inicializando sistema de dados no Vercel...');
    const manager = getDataManager();
    manager.initializeData();
    logger.info('Sistema de dados inicializado com sucesso no Vercel!');
    return true;
  } catch (error) {
    logger.error('Erro ao inicializar sistema de dados no Vercel', { error: error.message });
    throw error;
  }
}

module.exports = {
  dataManager: getDataManager(),
  initializeDataSystem,
  getDataManager
};