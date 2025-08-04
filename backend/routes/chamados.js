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
    
    // Validar se statusId é um número válido
    const statusIdNum = parseInt(statusId);
    if (isNaN(statusIdNum) || statusIdNum < 1) {
      return res.status(400).json({ error: 'ID do status deve ser um número válido' });
    }
    
    const chamados = dataManager.getChamados().filter(c => c.status_id === statusIdNum);
    const chamadosFormatados = chamados.map(formatarChamado);
    
    logger.info('Chamados filtrados por status', { statusId: statusIdNum, count: chamados.length });
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
    
    // Validar se id é um número válido
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    const chamado = dataManager.getChamadoById(idNum);
    
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
      data_criacao: new Date().toISOString(),
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
      data_atualizacao: new Date().toISOString(),
      responsavel: responsavel || chamadoExistente.responsavel,
      observacoes: observacoes || chamadoExistente.observacoes
    };
    
    // Se o status for 'Finalizado' (id=3), atualiza a data de fechamento
    if (statusIdNum === 3) {
      updateData.data_fechamento = new Date().toISOString();
    }

    const chamadoAtualizado = dataManager.updateChamado(idNum, updateData);
    
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
    
    // Validar ID do chamado
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    // Validar título
    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    
    if (titulo.trim().length < 3 || titulo.trim().length > 200) {
      return res.status(400).json({ error: 'Título deve ter entre 3 e 200 caracteres' });
    }
    
    // Verificar se o chamado existe
    const chamadoExistente = dataManager.getChamadoById(idNum);
    if (!chamadoExistente) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    let salaIdNum = chamadoExistente.sala_id;
    let statusIdNum = chamadoExistente.status_id;
    
    // Verificar se a sala existe (se fornecida)
    if (sala_id) {
      salaIdNum = parseInt(sala_id);
      if (isNaN(salaIdNum) || salaIdNum < 1) {
        return res.status(400).json({ error: 'ID da sala deve ser um número válido' });
      }
      
      const sala = dataManager.getSalaById(salaIdNum);
      if (!sala) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
      
      if (!sala.ativa) {
        return res.status(400).json({ error: 'Não é possível atribuir chamados para salas inativas' });
      }
    }
    
    // Verificar se o status existe (se fornecido)
    if (status_id) {
      statusIdNum = parseInt(status_id);
      if (isNaN(statusIdNum) || statusIdNum < 1) {
        return res.status(400).json({ error: 'ID do status deve ser um número válido' });
      }
      
      const status = dataManager.getStatus();
      const statusObj = status.find(s => s.id === statusIdNum);
      if (!statusObj) {
        return res.status(404).json({ error: 'Status não encontrado' });
      }
    }
    
    const dadosAtualizacao = {
      titulo: titulo.trim(),
      descricao: descricao !== undefined ? descricao.trim() : chamadoExistente.descricao,
      sala_id: salaIdNum,
      status_id: statusIdNum,
      prioridade: prioridade || chamadoExistente.prioridade,
      solicitante: solicitante !== undefined ? solicitante.trim() : chamadoExistente.solicitante,
      responsavel: responsavel !== undefined ? responsavel.trim() : chamadoExistente.responsavel,
      observacoes: observacoes !== undefined ? observacoes.trim() : chamadoExistente.observacoes
    };
    
    // Se o status mudou para 'Finalizado' (id 3), definir data de fechamento
    if (status_id && statusIdNum === 3 && chamadoExistente.status_id !== 3) {
      dadosAtualizacao.data_fechamento = new Date().toISOString();
    }
    
    const chamadoAtualizado = dataManager.updateChamado(idNum, dadosAtualizacao);
    
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
    
    // Validar ID do chamado
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID do chamado deve ser um número válido' });
    }
    
    const resultado = dataManager.deleteChamado(idNum);
    
    if (!resultado) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    logger.info('Chamado excluído', { id: idNum });
    res.json({ message: 'Chamado excluído com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir chamado', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;