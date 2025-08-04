const express = require('express');
const { dataManager } = require('../database');
const logger = require('../logger');
const router = express.Router();

// Listar todos os status
router.get('/', async (req, res) => {
  try {
    const status = dataManager.getStatus();
    logger.info('Status listados', { count: status.length });
    res.json(status);
  } catch (error) {
    logger.error('Erro ao buscar status', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar status por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const status = dataManager.getStatusById(parseInt(id));
    
    if (!status) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }
    
    logger.info('Status encontrado', { id: status.id, nome: status.nome });
    res.json(status);
  } catch (error) {
    logger.error('Erro ao buscar status', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo status
router.post('/', async (req, res) => {
  try {
    const { nome, cor, ativo } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome do status é obrigatório' });
    }
    
    // Verificar se já existe um status com o mesmo nome
    const status = dataManager.getStatus();
    const statusExistente = status.find(s => s.nome.toLowerCase() === nome.trim().toLowerCase());
    
    if (statusExistente) {
      return res.status(400).json({ error: 'Já existe um status com este nome' });
    }
    
    const novoStatus = dataManager.createStatus({
      nome: nome.trim(),
      cor: cor || '#000000',
      ativo: ativo !== undefined ? ativo : true
    });
    
    logger.info('Status criado', { id: novoStatus.id, nome: novoStatus.nome });
    res.status(201).json(novoStatus);
  } catch (error) {
    logger.error('Erro ao criar status', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cor, ativo } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome do status é obrigatório' });
    }
    
    // Verificar se o status existe
    const statusExistente = dataManager.getStatusById(parseInt(id));
    if (!statusExistente) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }
    
    // Verificar se já existe outro status com o mesmo nome
    const status = dataManager.getStatus();
    const statusComMesmoNome = status.find(s => 
      s.nome.toLowerCase() === nome.trim().toLowerCase() && s.id !== parseInt(id)
    );
    
    if (statusComMesmoNome) {
      return res.status(400).json({ error: 'Já existe um status com este nome' });
    }
    
    const statusAtualizado = dataManager.updateStatus(parseInt(id), {
      nome: nome.trim(),
      cor: cor || statusExistente.cor,
      ativo: ativo !== undefined ? ativo : statusExistente.ativo
    });
    
    logger.info('Status atualizado', { id: statusAtualizado.id, nome: statusAtualizado.nome });
    res.json(statusAtualizado);
  } catch (error) {
    logger.error('Erro ao atualizar status', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir status
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se existem chamados associados a este status
    const chamadosComStatus = dataManager.getChamados().filter(c => c.status_id === parseInt(id));
    
    if (chamadosComStatus.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este status pois existem chamados associados a ele',
        chamados_count: chamadosComStatus.length
      });
    }
    
    const resultado = dataManager.deleteStatus(parseInt(id));
    
    if (!resultado) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }
    
    logger.info('Status excluído', { id: parseInt(id) });
    res.json({ message: 'Status excluído com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir status', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;