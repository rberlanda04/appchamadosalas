const express = require('express');
const moment = require('moment');

module.exports = (db) => {
  const router = express.Router();

  // Obter todos os chamados com informações da sala e status
  router.get('/', (req, res) => {
    const query = `
      SELECT c.*, s.numero as sala_numero, s.bloco, s.andar, st.nome as status_nome
      FROM chamados c
      JOIN salas s ON c.sala_id = s.id
      JOIN status_chamado st ON c.status_id = st.id
      ORDER BY c.data_abertura DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Obter chamados filtrados por status
  router.get('/status/:statusId', (req, res) => {
    const { statusId } = req.params;
    
    const query = `
      SELECT c.*, s.numero as sala_numero, s.bloco, s.andar, st.nome as status_nome
      FROM chamados c
      JOIN salas s ON c.sala_id = s.id
      JOIN status_chamado st ON c.status_id = st.id
      WHERE c.status_id = ?
      ORDER BY c.data_abertura DESC
    `;

    db.all(query, [statusId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Obter um chamado específico por ID
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
      SELECT c.*, s.numero as sala_numero, s.bloco, s.andar, st.nome as status_nome
      FROM chamados c
      JOIN salas s ON c.sala_id = s.id
      JOIN status_chamado st ON c.status_id = st.id
      WHERE c.id = ?
    `;

    db.get(query, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }
      res.json(row);
    });
  });

  // Criar um novo chamado
  router.post('/', (req, res) => {
    const { sala_id, descricao, responsavel } = req.body;
    
    if (!sala_id) {
      return res.status(400).json({ error: 'ID da sala é obrigatório' });
    }

    const dataAbertura = moment().format('YYYY-MM-DD HH:mm:ss');
    
    const query = `
      INSERT INTO chamados (sala_id, status_id, descricao, data_abertura, responsavel)
      VALUES (?, 1, ?, ?, ?)
    `;

    db.run(query, [sala_id, descricao || '', dataAbertura, responsavel || ''], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Retorna o chamado criado
      db.get(`
        SELECT c.*, s.numero as sala_numero, s.bloco, s.andar, st.nome as status_nome
        FROM chamados c
        JOIN salas s ON c.sala_id = s.id
        JOIN status_chamado st ON c.status_id = st.id
        WHERE c.id = ?
      `, [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    });
  });

  // Atualizar o status de um chamado
  router.put('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status_id, responsavel, observacoes } = req.body;
    
    if (!status_id) {
      return res.status(400).json({ error: 'ID do status é obrigatório' });
    }

    const dataAtualizacao = moment().format('YYYY-MM-DD HH:mm:ss');
    let query, params;
    
    // Se o status for 'Finalizado' (id=3), atualiza a data de fechamento
    if (parseInt(status_id) === 3) {
      query = `
        UPDATE chamados
        SET status_id = ?, data_atualizacao = ?, data_fechamento = ?, responsavel = ?, observacoes = ?
        WHERE id = ?
      `;
      params = [status_id, dataAtualizacao, dataAtualizacao, responsavel, observacoes, id];
    } else {
      query = `
        UPDATE chamados
        SET status_id = ?, data_atualizacao = ?, responsavel = ?, observacoes = ?
        WHERE id = ?
      `;
      params = [status_id, dataAtualizacao, responsavel, observacoes, id];
    }

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }
      
      // Retorna o chamado atualizado
      db.get(`
        SELECT c.*, s.numero as sala_numero, s.bloco, s.andar, st.nome as status_nome
        FROM chamados c
        JOIN salas s ON c.sala_id = s.id
        JOIN status_chamado st ON c.status_id = st.id
        WHERE c.id = ?
      `, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });

  // Atualizar um chamado
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status_id, descricao, responsavel, observacoes } = req.body;
    
    const dataAtualizacao = moment().format('YYYY-MM-DD HH:mm:ss');
    let query, params;
    
    // Se o status for 'Finalizado' (id=3), atualiza a data de fechamento
    if (parseInt(status_id) === 3) {
      query = `
        UPDATE chamados
        SET status_id = ?, descricao = ?, data_atualizacao = ?, data_fechamento = ?, responsavel = ?, observacoes = ?
        WHERE id = ?
      `;
      params = [status_id, descricao, dataAtualizacao, dataAtualizacao, responsavel, observacoes, id];
    } else {
      query = `
        UPDATE chamados
        SET status_id = ?, descricao = ?, data_atualizacao = ?, responsavel = ?, observacoes = ?
        WHERE id = ?
      `;
      params = [status_id, descricao, dataAtualizacao, responsavel, observacoes, id];
    }

    db.run(query, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }
      
      // Retorna o chamado atualizado
      db.get(`
        SELECT c.*, s.numero as sala_numero, s.bloco, s.andar, st.nome as status_nome
        FROM chamados c
        JOIN salas s ON c.sala_id = s.id
        JOIN status_chamado st ON c.status_id = st.id
        WHERE c.id = ?
      `, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });

  // Excluir um chamado
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM chamados WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
      }
      res.json({ message: 'Chamado excluído com sucesso' });
    });
  });

  return router;
};