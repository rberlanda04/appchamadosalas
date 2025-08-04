const express = require('express');
const router = express.Router();
const { getDataManager } = require('../vercel-database');
const { logger } = require('../vercel-logger');

// Obter todas as salas
router.get('/', async (req, res) => {
  try {
    const dataManager = getDataManager();
    const salas = dataManager.getSalas();
    
    // Adicionar contagem de chamados abertos para cada sala
    const salasComChamados = salas.map(sala => ({
      ...sala,
      chamados_abertos: dataManager.getChamadosAbertosBySala(sala.id)
    }));
    
    logger.info('Salas listadas no Vercel', { count: salas.length });
    res.json(salasComChamados);
  } catch (error) {
    logger.error('Erro ao buscar salas no Vercel', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter sala específica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar se id é um número válido
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID da sala deve ser um número válido' });
    }
    
    const dataManager = getDataManager();
    const sala = dataManager.getSalaById(idNum);
    
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    // Adicionar contagem de chamados abertos
    const salaComChamados = {
      ...sala,
      chamados_abertos: dataManager.getChamadosAbertosBySala(sala.id)
    };
    
    logger.info('Sala consultada no Vercel', { id: sala.id });
    res.json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao buscar sala no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar uma nova sala
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, ativa } = req.body;
    
    // Validações básicas
    if (!nome) {
      return res.status(400).json({ error: 'Nome da sala é obrigatório' });
    }
    
    // Validar tipos e tamanhos
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
      return res.status(400).json({ error: 'Nome da sala deve ter entre 2 e 100 caracteres' });
    }
    
    if (descricao && (typeof descricao !== 'string' || descricao.trim().length > 500)) {
      return res.status(400).json({ error: 'Descrição deve ter no máximo 500 caracteres' });
    }
    
    const dataManager = getDataManager();
    
    // Verificar se já existe uma sala com o mesmo nome
    const salas = dataManager.getSalas();
    const salaExistente = salas.find(s => s.nome.toLowerCase() === nome.trim().toLowerCase());
    if (salaExistente) {
      return res.status(400).json({ error: 'Já existe uma sala com este nome' });
    }
    
    const novaSala = {
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : '',
      ativa: ativa !== undefined ? Boolean(ativa) : true
    };
    
    const salaCriada = dataManager.createSala(novaSala);
    
    // Adicionar contagem de chamados abertos (será 0 para sala nova)
    const salaComChamados = {
      ...salaCriada,
      chamados_abertos: 0
    };
    
    logger.info('Sala criada no Vercel', { id: salaCriada.id, nome: salaCriada.nome });
    res.status(201).json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao criar sala no Vercel', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar uma sala
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativa } = req.body;
    
    // Validar ID da sala
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID da sala deve ser um número válido' });
    }
    
    // Verificar se a sala existe
    const dataManager = getDataManager();
    const salaExistente = dataManager.getSalaById(idNum);
    if (!salaExistente) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    const updateData = {};
    
    // Validar e atualizar campos opcionais
    if (nome !== undefined) {
      if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
        return res.status(400).json({ error: 'Nome da sala deve ter entre 2 e 100 caracteres' });
      }
      
      // Verificar se já existe outra sala com o mesmo nome
      const salas = dataManager.getSalas();
      const outraSala = salas.find(s => s.id !== idNum && s.nome.toLowerCase() === nome.trim().toLowerCase());
      if (outraSala) {
        return res.status(400).json({ error: 'Já existe outra sala com este nome' });
      }
      
      updateData.nome = nome.trim();
    }
    
    if (descricao !== undefined) {
      if (descricao && (typeof descricao !== 'string' || descricao.trim().length > 500)) {
        return res.status(400).json({ error: 'Descrição deve ter no máximo 500 caracteres' });
      }
      updateData.descricao = descricao ? descricao.trim() : '';
    }
    
    if (ativa !== undefined) {
      updateData.ativa = Boolean(ativa);
    }
    
    const salaAtualizada = dataManager.updateSala(idNum, updateData);
    
    // Adicionar contagem de chamados abertos
    const salaComChamados = {
      ...salaAtualizada,
      chamados_abertos: dataManager.getChamadosAbertosBySala(salaAtualizada.id)
    };
    
    logger.info('Sala atualizada no Vercel', { id: idNum });
    res.json(salaComChamados);
  } catch (error) {
    logger.error('Erro ao atualizar sala no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar uma sala
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID da sala
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return res.status(400).json({ error: 'ID da sala deve ser um número válido' });
    }
    
    // Verificar se a sala existe
    const dataManager = getDataManager();
    const salaExistente = dataManager.getSalaById(idNum);
    if (!salaExistente) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    // Verificar se há chamados associados à sala
    const chamadosAbertos = dataManager.getChamadosAbertosBySala(idNum);
    if (chamadosAbertos > 0) {
      return res.status(400).json({ 
        error: `Não é possível deletar a sala. Existem ${chamadosAbertos} chamado(s) aberto(s) associado(s) a esta sala.` 
      });
    }
    
    const sucesso = dataManager.deleteSala(idNum);
    
    if (sucesso) {
      logger.info('Sala deletada no Vercel', { id: idNum });
      res.json({ message: 'Sala deletada com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar sala' });
    }
  } catch (error) {
    logger.error('Erro ao deletar sala no Vercel', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;