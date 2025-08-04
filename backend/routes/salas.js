const express = require('express');
const router = express.Router();
const { dataManager } = require('../database');
const logger = require('../config/logger');

// Obter todas as salas com contagem de chamados abertos
router.get('/', async (req, res) => {
  try {
    const salas = dataManager.getSalas();
    
    // Adicionar contagem de chamados abertos para cada sala
    const salasComChamados = salas.map(sala => ({
      id: sala.id,
      nome: sala.nome,
      descricao: sala.descricao,
      ativa: sala.ativa,
      chamados_abertos: dataManager.getChamadosAbertosBySala(sala.id)
    }));
    
    logger.info('Salas listadas', { count: salas.length });
    res.json(salasComChamados);
  } catch (error) {
    logger.error('Erro ao buscar salas', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter sala por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sala = dataManager.getSalaById(parseInt(id));
    
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    const salaComChamados = {
      id: sala.id,
      nome: sala.nome,
      descricao: sala.descricao,
      ativa: sala.ativa,
      chamados_abertos: dataManager.getChamadosAbertosBySala(sala.id)
    };
    
    logger.info('Sala consultada', { id: sala.id });
    res.json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao buscar sala', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter uma sala pelo número
router.get('/numero/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    const salas = dataManager.getSalas();
    const sala = salas.find(s => s.numero === numero);
    
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    const salaComChamados = {
      id: sala.id,
      numero: sala.numero,
      descricao: sala.descricao,
      qr_code: sala.qr_code || '',
      chamados_abertos: dataManager.getChamadosAbertosBySala(sala.id)
    };
    
    logger.info('Sala consultada por número', { numero: numero, id: sala.id });
    res.json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao buscar sala por número', { error: error.message, numero: req.params.numero });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova sala
router.post('/', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome da sala é obrigatório' });
    }
    
    // Verificar se já existe uma sala com o mesmo nome
    const salas = dataManager.getSalas();
    const salaExistente = salas.find(s => s.nome.toLowerCase() === nome.trim().toLowerCase());
    
    if (salaExistente) {
      return res.status(400).json({ error: 'Já existe uma sala com este nome' });
    }
    
    const novaSala = dataManager.createSala({
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : ''
    });
    
    const salaComChamados = {
      id: novaSala.id,
      nome: novaSala.nome,
      descricao: novaSala.descricao,
      ativa: novaSala.ativa,
      chamados_abertos: 0
    };
    
    logger.info('Sala criada', { id: novaSala.id, nome: novaSala.nome });
    res.status(201).json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao criar sala', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar sala
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativa } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome da sala é obrigatório' });
    }
    
    // Verificar se a sala existe
    const salaExistente = dataManager.getSalaById(parseInt(id));
    if (!salaExistente) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    // Verificar se já existe outra sala com o mesmo nome
    const salas = dataManager.getSalas();
    const salaComMesmoNome = salas.find(s => 
      s.nome.toLowerCase() === nome.trim().toLowerCase() && s.id !== parseInt(id)
    );
    
    if (salaComMesmoNome) {
      return res.status(400).json({ error: 'Já existe uma sala com este nome' });
    }
    
    const salaAtualizada = dataManager.updateSala(parseInt(id), {
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : salaExistente.descricao,
      ativa: ativa !== undefined ? ativa : salaExistente.ativa
    });
    
    const salaComChamados = {
      id: salaAtualizada.id,
      nome: salaAtualizada.nome,
      descricao: salaAtualizada.descricao,
      ativa: salaAtualizada.ativa,
      chamados_abertos: dataManager.getChamadosAbertosBySala(salaAtualizada.id)
    };
    
    logger.info('Sala atualizada', { id: salaAtualizada.id, nome: salaAtualizada.nome });
    res.json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao atualizar sala', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar o QR Code de uma sala
router.put('/:id/qrcode', async (req, res) => {
  try {
    const { id } = req.params;
    const { qr_code } = req.body;
    
    // Verificar se a sala existe
    const salaExistente = dataManager.getSalaById(parseInt(id));
    if (!salaExistente) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    const salaAtualizada = dataManager.updateSala(parseInt(id), {
      qr_code: qr_code || ''
    });
    
    logger.info('QR Code atualizado', { id: parseInt(id), qr_code: qr_code });
    res.json({ message: 'QR Code atualizado com sucesso' });
  } catch (error) {
    logger.error('Erro ao atualizar QR Code', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir sala
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se existem chamados associados a esta sala
    const chamadosCount = dataManager.getChamadosAbertosBySala(parseInt(id));
    const chamadosTotal = dataManager.getChamados().filter(c => c.sala_id === parseInt(id)).length;
    
    if (chamadosTotal > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir esta sala pois existem chamados associados a ela',
        chamados: chamadosTotal
      });
    }
    
    const resultado = dataManager.deleteSala(parseInt(id));
    
    if (!resultado) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    logger.info('Sala excluída', { id: parseInt(id) });
    res.json({ message: 'Sala excluída com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir sala', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;