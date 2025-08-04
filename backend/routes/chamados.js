const express = require('express');
const router = express.Router();
const { dataManager } = require('../database');
const { logger } = require('../logger');
const moment = require('moment');

// Função auxiliar para formatar dados de resposta
const formatarChamado = (chamado) => {
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
    data_abertura: moment(chamado.data_abertura).format('DD/MM/YYYY HH:mm'),
    data_fechamento: chamado.data_fechamento ? moment(chamado.data_fechamento).format('DD/MM/YYYY HH:mm') : null,
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
    const chamados = dataManager.getChamados();
    const chamadosFormatados = chamados.map(formatarChamado);
    
    logger.info('Chamados listados', { count: chamados.length });
    res.json(chamadosFormatados);
  } catch (error) {
    logger.error('Erro ao buscar chamados', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter chamados filtrados por status
router.get('/status/:statusId', async (req, res) => {
  try {
    const { statusId } = req.params;
    
    const chamados = dataManager.getChamados().filter(c => c.status_id === parseInt(statusId));
    const chamadosFormatados = chamados.map(formatarChamado);
    
    logger.info('Chamados filtrados por status', { statusId, count: chamados.length });
    res.json(chamadosFormatados);
  } catch (error) {
    logger.error('Erro ao buscar chamados por status', { error: error.message, statusId: req.params.statusId });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter chamado específico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const chamado = dataManager.getChamadoById(parseInt(id));
    
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    const chamadoFormatado = formatarChamado(chamado);
    logger.info('Chamado consultado', { id: chamado.id });
    res.json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao buscar chamado', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar um novo chamado
router.post('/', async (req, res) => {
  try {
    const { titulo, sala_id, descricao, prioridade, solicitante, responsavel, observacoes } = req.body;
    
    if (!titulo || !sala_id || !descricao) {
      return res.status(400).json({ error: 'Título, sala e descrição são obrigatórios' });
    }
    
    // Verificar se a sala existe
    const salas = dataManager.getSalas();
    const sala = salas.find(s => s.id === parseInt(sala_id));
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    const novoChamado = {
      titulo: titulo.trim(),
      sala_id: parseInt(sala_id),
      status_id: 1, // Status 'Aberto'
      descricao: descricao.trim(),
      prioridade: prioridade || 'media',
      solicitante: solicitante ? solicitante.trim() : '',
      responsavel: responsavel ? responsavel.trim() : '',
      observacoes: observacoes ? observacoes.trim() : '',
      data_abertura: new Date(),
      data_fechamento: null
    };
    
    const chamadoCriado = dataManager.createChamado(novoChamado);
    const chamadoFormatado = formatarChamado(chamadoCriado);
    
    logger.info('Chamado criado', { id: chamadoCriado.id, titulo: chamadoCriado.titulo });
    res.status(201).json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao criar chamado', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar o status de um chamado
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id, responsavel, observacoes } = req.body;
    
    if (!status_id) {
      return res.status(400).json({ error: 'ID do status é obrigatório' });
    }

    // Verificar se o chamado existe
    const chamadoExistente = dataManager.getChamadoById(parseInt(id));
    if (!chamadoExistente) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    // Verificar se o status existe
    const status = dataManager.getStatus();
    const statusObj = status.find(s => s.id === parseInt(status_id));
    if (!statusObj) {
      return res.status(404).json({ error: 'Status não encontrado' });
    }

    const updateData = {
      status_id: parseInt(status_id),
      data_atualizacao: new Date(),
      responsavel: responsavel || chamadoExistente.responsavel,
      observacoes: observacoes || chamadoExistente.observacoes
    };
    
    // Se o status for 'Finalizado' (id=3), atualiza a data de fechamento
    if (parseInt(status_id) === 3) {
      updateData.data_fechamento = new Date();
    }

    const chamadoAtualizado = dataManager.updateChamado(parseInt(id), updateData);
    
    if (!chamadoAtualizado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    const chamadoFormatado = formatarChamado(chamadoAtualizado);
    logger.info('Status do chamado atualizado', { id: chamadoAtualizado.id, status_id: chamadoAtualizado.status_id });
    res.json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao atualizar status do chamado', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar chamado
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, sala_id, status_id, prioridade, solicitante, responsavel, observacoes } = req.body;
    
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    
    // Verificar se o chamado existe
    const chamadoExistente = dataManager.getChamadoById(parseInt(id));
    if (!chamadoExistente) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    // Verificar se a sala existe (se fornecida)
    if (sala_id) {
      const salas = dataManager.getSalas();
      const sala = salas.find(s => s.id === parseInt(sala_id));
      if (!sala) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
    }
    
    // Verificar se o status existe (se fornecido)
    if (status_id) {
      const status = dataManager.getStatus();
      const statusObj = status.find(s => s.id === parseInt(status_id));
      if (!statusObj) {
        return res.status(404).json({ error: 'Status não encontrado' });
      }
    }
    
    const dadosAtualizacao = {
      titulo: titulo.trim(),
      descricao: descricao !== undefined ? descricao.trim() : chamadoExistente.descricao,
      sala_id: sala_id ? parseInt(sala_id) : chamadoExistente.sala_id,
      status_id: status_id ? parseInt(status_id) : chamadoExistente.status_id,
      prioridade: prioridade || chamadoExistente.prioridade,
      solicitante: solicitante !== undefined ? solicitante.trim() : chamadoExistente.solicitante,
      responsavel: responsavel !== undefined ? responsavel.trim() : chamadoExistente.responsavel,
      observacoes: observacoes !== undefined ? observacoes.trim() : chamadoExistente.observacoes
    };
    
    // Se o status mudou para 'Finalizado' (id 3), definir data de fechamento
    if (status_id && parseInt(status_id) === 3 && chamadoExistente.status_id !== 3) {
      dadosAtualizacao.data_fechamento = new Date();
    }
    
    const chamadoAtualizado = dataManager.updateChamado(parseInt(id), dadosAtualizacao);
    
    if (!chamadoAtualizado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    const chamadoFormatado = formatarChamado(chamadoAtualizado);
    logger.info('Chamado atualizado', { id: chamadoAtualizado.id, titulo: chamadoAtualizado.titulo });
    res.json(chamadoFormatado);
  } catch (error) {
    logger.error('Erro ao atualizar chamado', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir chamado
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = dataManager.deleteChamado(parseInt(id));
    
    if (!resultado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    logger.info('Chamado excluído', { id: parseInt(id) });
    res.json({ message: 'Chamado excluído com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir chamado', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;