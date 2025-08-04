const express = require('express');
const router = express.Router();
const { getDataManager } = require('../vercel-database');
const { logger } = require('../vercel-logger');

// Obter todos os status
router.get('/', async (req, res) => {
  try {
    const dataManager = getDataManager();
    const status = dataManager.getStatus();
    
    logger.info('Status listados no Vercel', { count: status.length });
    res.json(status);
  } catch (error) {
    logger.error('Erro ao buscar status no Vercel', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter status específico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar se id é um número válido
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do status deve ser um número válido' });
    }
    
    const dataManager = getDataManager();
    const status = dataManager.getStatusById(idNum);
    
    if (!status) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }
    
    logger.info('Status consultado no Vercel', { id: status.id });
    res.json(status);
  } catch (error) {
    logger.error('Erro ao buscar status no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar um novo status
router.post('/', async (req, res) => {
  try {
    const { nome, cor, ativo } = req.body;
    
    // Validações básicas
    if (!nome || !cor) {
      return res.status(400).json({ error: 'Nome e cor são obrigatórios' });
    }
    
    // Validar tipos e tamanhos
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 50) {
      return res.status(400).json({ error: 'Nome do status deve ter entre 2 e 50 caracteres' });
    }
    
    if (typeof cor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
      return res.status(400).json({ error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' });
    }
    
    const dataManager = getDataManager();
    
    // Verificar se já existe um status com o mesmo nome
    const statusList = dataManager.getStatus();
    const statusExistente = statusList.find(s => s.nome.toLowerCase() === nome.trim().toLowerCase());
    if (statusExistente) {
      return res.status(400).json({ error: 'Já existe um status com este nome' });
    }
    
    const novoStatus = {
      nome: nome.trim(),
      cor: cor.toLowerCase(),
      ativo: ativo !== undefined ? Boolean(ativo) : true
    };
    
    const statusCriado = dataManager.createStatus(novoStatus);
    
    logger.info('Status criado no Vercel', { id: statusCriado.id, nome: statusCriado.nome });
    res.status(201).json(statusCriado);
  } catch (error) {
    logger.error('Erro ao criar status no Vercel', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar um status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cor, ativo } = req.body;
    
    // Validar ID do status
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do status deve ser um número válido' });
    }
    
    // Verificar se o status existe
    const dataManager = getDataManager();
    const statusExistente = dataManager.getStatusById(idNum);
    if (!statusExistente) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }
    
    const updateData = {};
    
    // Validar e atualizar campos opcionais
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 50) {
        return res.status(400).json({ error: 'Nome do status deve ter entre 2 e 50 caracteres' });
      }
      
      // Verificar se já existe outro status com o mesmo nome
      const statusList = dataManager.getStatus();
      const outroStatus = statusList.find(s => s.id !== idNum && s.nome.toLowerCase() === nome.trim().toLowerCase());
      if (outroStatus) {
        return res.status(400).json({ error: 'Já existe outro status com este nome' });
      }
      
      updateData.nome = nome.trim();
    }
    
    if (cor !== undefined) {
      if (typeof cor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
        return res.status(400).json({ error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' });
      }
      updateData.cor = cor.toLowerCase();
    }
    
    if (ativo !== undefined) {
      updateData.ativo = Boolean(ativo);
    }
    
    const statusAtualizado = dataManager.updateStatus(idNum, updateData);
    
    logger.info('Status atualizado no Vercel', { id: idNum });
    res.json(statusAtualizado);
  } catch (error) {
    logger.error('Erro ao atualizar status no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar um status
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID do status
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do status deve ser um número válido' });
    }
    
    // Verificar se o status existe
    const dataManager = getDataManager();
    const statusExistente = dataManager.getStatusById(idNum);
    if (!statusExistente) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }
    
    // Verificar se há chamados usando este status
    const chamados = dataManager.getChamados();
    const chamadosComStatus = chamados.filter(c => c.status_id === idNum);
    if (chamadosComStatus.length > 0) {
      return res.status(400).json({ 
        error: `Não é possível deletar o status. Existem ${chamadosComStatus.length} chamado(s) usando este status.` 
      });
    }
    
    const sucesso = dataManager.deleteStatus(idNum);
    
    if (sucesso) {
      logger.info('Status deletado no Vercel', { id: idNum });
      res.json({ message: 'Status deletado com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar status' });
    }
  } catch (error) {
    logger.error('Erro ao deletar status no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;