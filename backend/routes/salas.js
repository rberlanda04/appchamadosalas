const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Obter todas as salas
  router.get('/', (req, res) => {
    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM chamados c WHERE c.sala_id = s.id AND c.status_id != 3) as chamados_abertos
      FROM salas s
      ORDER BY s.bloco, s.andar, s.numero
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Obter uma sala específica por ID
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM chamados c WHERE c.sala_id = s.id AND c.status_id != 3) as chamados_abertos
      FROM salas s
      WHERE s.id = ?
    `;

    db.get(query, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
      res.json(row);
    });
  });

  // Obter uma sala pelo número
  router.get('/numero/:numero', (req, res) => {
    const { numero } = req.params;
    
    const query = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM chamados c WHERE c.sala_id = s.id AND c.status_id != 3) as chamados_abertos
      FROM salas s
      WHERE s.numero = ?
    `;

    db.get(query, [numero], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
      res.json(row);
    });
  });

  // Criar uma nova sala
  router.post('/', (req, res) => {
    const { numero, descricao, bloco, andar, qr_code_url } = req.body;
    
    if (!numero) {
      return res.status(400).json({ error: 'Número da sala é obrigatório' });
    }

    const query = `
      INSERT INTO salas (numero, descricao, bloco, andar, qr_code_url)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [numero, descricao || '', bloco || '', andar || '', qr_code_url || ''], function(err) {
      if (err) {
        // Verifica se o erro é de violação de chave única (número da sala já existe)
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Já existe uma sala com este número' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      // Retorna a sala criada
      db.get('SELECT * FROM salas WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    });
  });

  // Atualizar uma sala
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { numero, descricao, bloco, andar, qr_code_url } = req.body;
    
    if (!numero) {
      return res.status(400).json({ error: 'Número da sala é obrigatório' });
    }

    const query = `
      UPDATE salas
      SET numero = ?, descricao = ?, bloco = ?, andar = ?, qr_code_url = ?
      WHERE id = ?
    `;

    db.run(query, [numero, descricao || '', bloco || '', andar || '', qr_code_url || '', id], function(err) {
      if (err) {
        // Verifica se o erro é de violação de chave única (número da sala já existe)
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Já existe uma sala com este número' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
      
      // Retorna a sala atualizada
      db.get('SELECT * FROM salas WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });

  // Atualizar o QR Code de uma sala
  router.put('/:id/qrcode', (req, res) => {
    const { id } = req.params;
    const { qr_code_url } = req.body;
    
    if (!qr_code_url) {
      return res.status(400).json({ error: 'URL do QR Code é obrigatória' });
    }

    const query = `
      UPDATE salas
      SET qr_code_url = ?
      WHERE id = ?
    `;

    db.run(query, [qr_code_url, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
      
      // Retorna a sala atualizada
      db.get('SELECT * FROM salas WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });

  // Excluir uma sala
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Verifica se existem chamados associados a esta sala
    db.get('SELECT COUNT(*) as count FROM chamados WHERE sala_id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (row.count > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir esta sala pois existem chamados associados a ela',
          chamados: row.count
        });
      }
      
      // Se não houver chamados, exclui a sala
      db.run('DELETE FROM salas WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Sala não encontrada' });
        }
        res.json({ message: 'Sala excluída com sucesso' });
      });
    });
  });

  return router;
};