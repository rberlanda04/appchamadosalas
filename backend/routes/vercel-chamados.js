const express = require('express');
const router = express.Router();
const { getDataManager } = require('../vercel-database');
const { logger } = require('../vercel-logger');
const moment = require('moment');

// Função auxiliar para formatar dados de resposta
const formatarChamado = (chamado) => {
  const dataManager = getDataManager();
  const salas = dataManager.getSalas();
  const status = dataManager.getStatus();
  
  const sala = salas.find(s => s.id === chamado.sala_id);
  const statusObj = status.find(s => s.id === chamado.status_id);
  
  return {
    id: chamado.id,
    titulo: chamado.titulo,
    sala_id: chamado.sala_id,
    status_id: chamado.status_id,
    descricao: chamado.descricao,
    prioridade: chamado.prioridade,
    solicitante: chamado.solicitante,
    data_criacao: chamado.data_criacao,
    data_atualizacao: chamado.data_atualizacao,
    data_fechamento: chamado.data_fechamento,
    responsavel: chamado.responsavel,
    observacoes: chamado.observacoes,
    sala_nome: sala ? sala.nome : 'Sala não encontrada',
    status_nome: statusObj ? statusObj.nome : 'Status não encontrado',
    status_cor: statusObj ? statusObj.cor : '#000000'
  };
};

// Obter todos os chamados com informações da sala e status
router.get('/', async (req, res) => {
  try {
    const dataManager = getDataManager();
    const chamados = dataManager.getChamados();
    const chamadosFormatados = chamados.map(formatarChamado);
    
    logger.info('Chamados listados no Vercel', { count: chamados.length });
    res.json(chamadosFormatados);
  } catch (error) {
    logger.error('Erro ao buscar chamados no Vercel', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter chamados filtrados por status
router.get('/status/:statusId', async (req, res) => {
  try {
    const { statusId } = req.params;
    
    // Validar se statusId é um número válido
    const statusIdNum = parseInt(statusId);
    if (isNaN(statusIdNum) || statusIdNum < 1) {
      return res.status(400).json({ error: 'ID do status deve ser um número válido' });
    }
    
    const dataManager = getDataManager();
    const chamados = dataManager.getChamados().filter(c => c.status_id === statusIdNum);
    const chamadosFormatados = chamados.map(formatarChamado);
    
    logger.info('Chamados filtrados por status no Vercel', { statusId: statusIdNum, count: chamados.length });
    res.json(chamadosFormatados);
  } catch (error) {
    logger.error('Erro ao buscar chamados por status no Vercel', { error: error.message, statusId: req.params.statusId });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter chamado específico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar se id é um número válido
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    const dataManager = getDataManager();
    const chamado = dataManager.getChamadoById(idNum);
    
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    const chamadoFormatado = formatarChamado(chamado);
    logger.info('Chamado consultado no Vercel', { id: chamado.id });
    res.json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao buscar chamado no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar um novo chamado
router.post('/', async (req, res) => {
  try {
    const { titulo, sala_id, descricao, prioridade, solicitante, responsavel, observacoes } = req.body;
    
    // Validações básicas
    if (!titulo || !sala_id || !descricao) {
      return res.status(400).json({ error: 'Título, sala_id e descrição são obrigatórios' });
    }
    
    // Validar tipos e tamanhos
    if (typeof titulo !== 'string' || titulo.trim().length < 3 || titulo.trim().length > 200) {
      return res.status(400).json({ error: 'Título deve ter entre 3 e 200 caracteres' });
    }
    
    if (typeof descricao !== 'string' || descricao.trim().length < 10 || descricao.trim().length > 1000) {
      return res.status(400).json({ error: 'Descrição deve ter entre 10 e 1000 caracteres' });
    }
    
    const salaIdNum = parseInt(sala_id);
    if (isNaN(salaIdNum) || salaIdNum < 1) {
      return res.status(400).json({ error: 'ID da sala deve ser um número válido' });
    }
    
    // Verificar se a sala existe
    const dataManager = getDataManager();
    const sala = dataManager.getSalaById(salaIdNum);
    if (!sala) {
      return res.status(400).json({ error: 'Sala não encontrada' });
    }
    
    // Verificar se a sala está ativa
    if (!sala.ativa) {
      return res.status(400).json({ error: 'Não é possível criar chamados para salas inativas' });
    }
    
    const novoChamado = {
      titulo: titulo.trim(),
      sala_id: salaIdNum,
      descricao: descricao.trim(),
      status_id: 1, // Aberto
      prioridade: prioridade || 'media',
      solicitante: solicitante ? solicitante.trim() : '',
      responsavel: responsavel ? responsavel.trim() : '',
      observacoes: observacoes ? observacoes.trim() : '',
      data_fechamento: null
    };
    
    const chamadoCriado = dataManager.createChamado(novoChamado);
    const chamadoFormatado = formatarChamado(chamadoCriado);
    
    logger.info('Chamado criado no Vercel', { id: chamadoCriado.id, titulo: chamadoCriado.titulo });
    res.status(201).json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao criar chamado no Vercel', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar o status de um chamado
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id, responsavel, observacoes } = req.body;
    
    // Validar ID do chamado
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    // Validar status_id
    if (!status_id) {
      return res.status(400).json({ error: 'ID do status é obrigatório' });
    }
    
    const statusIdNum = parseInt(status_id);
    if (isNaN(statusIdNum) || statusIdNum < 1) {
      return res.status(400).json({ error: 'ID do status deve ser um número válido' });
    }

    // Verificar se o chamado existe
    const dataManager = getDataManager();
    const chamadoExistente = dataManager.getChamadoById(idNum);
    if (!chamadoExistente) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    // Verificar se o status existe
    const status = dataManager.getStatus();
    const statusObj = status.find(s => s.id === statusIdNum);
    if (!statusObj) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }

    const updateData = {
      status_id: statusIdNum,
      responsavel: responsavel || chamadoExistente.responsavel,
      observacoes: observacoes || chamadoExistente.observacoes
    };
    
    // Se o status for 'Concluído' (id=3), atualiza a data de fechamento
    if (statusIdNum === 3) {
      updateData.data_fechamento = new Date().toISOString();
    }

    const chamadoAtualizado = dataManager.updateChamado(idNum, updateData);
    const chamadoFormatado = formatarChamado(chamadoAtualizado);
    
    logger.info('Status do chamado atualizado no Vercel', { id: idNum, novoStatus: statusIdNum });
    res.json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao atualizar status do chamado no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar um chamado completo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, sala_id, descricao, prioridade, solicitante, responsavel, observacoes } = req.body;
    
    // Validar ID do chamado
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    // Verificar se o chamado existe
    const dataManager = getDataManager();
    const chamadoExistente = dataManager.getChamadoById(idNum);
    if (!chamadoExistente) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    const updateData = {};
    
    // Validar e atualizar campos opcionais
    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || titulo.trim().length < 3 || titulo.trim().length > 200) {
        return res.status(400).json({ error: 'Título deve ter entre 3 e 200 caracteres' });
      }
      updateData.titulo = titulo.trim();
    }
    
    if (descricao !== undefined) {
      if (typeof descricao !== 'string' || descricao.trim().length < 10 || descricao.trim().length > 1000) {
        return res.status(400).json({ error: 'Descrição deve ter entre 10 e 1000 caracteres' });
      }
      updateData.descricao = descricao.trim();
    }
    
    if (sala_id !== undefined) {
      const salaIdNum = parseInt(sala_id);
      if (isNaN(salaIdNum) || salaIdNum < 1) {
        return res.status(400).json({ error: 'ID da sala deve ser um número válido' });
      }
      
      const sala = dataManager.getSalaById(salaIdNum);
      if (!sala) {
        return res.status(400).json({ error: 'Sala não encontrada' });
      }
      
      updateData.sala_id = salaIdNum;
    }
    
    if (prioridade !== undefined) {
      updateData.prioridade = prioridade;
    }
    
    if (solicitante !== undefined) {
      updateData.solicitante = solicitante ? solicitante.trim() : '';
    }
    
    if (responsavel !== undefined) {
      updateData.responsavel = responsavel ? responsavel.trim() : '';
    }
    
    if (observacoes !== undefined) {
      updateData.observacoes = observacoes ? observacoes.trim() : '';
    }
    
    const chamadoAtualizado = dataManager.updateChamado(idNum, updateData);
    const chamadoFormatado = formatarChamado(chamadoAtualizado);
    
    logger.info('Chamado atualizado no Vercel', { id: idNum });
    res.json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao atualizar chamado no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar um chamado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID do chamado
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    // Verificar se o chamado existe
    const dataManager = getDataManager();
    const chamadoExistente = dataManager.getChamadoById(idNum);
    if (!chamadoExistente) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    const sucesso = dataManager.deleteChamado(idNum);
    
    if (sucesso) {
      logger.info('Chamado deletado no Vercel', { id: idNum });
      res.json({ message: 'Chamado deletado com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar chamado' });
    }
  } catch (error) {
    logger.error('Erro ao deletar chamado no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;