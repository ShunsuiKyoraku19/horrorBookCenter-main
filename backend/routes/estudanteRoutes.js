const express = require('express');
const router = express.Router();
const db = require('../db');

// Ver todos os livros
router.get('/livros', (req, res) => {
    db.query('SELECT * FROM livros', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Solicitar um livro
router.post('/solicitar', (req, res) => {
    const { id_usuario, id_livro } = req.body;

    const query = `
        INSERT INTO solicitacoes (id_usuario, id_livro, status, data_solicitacao) 
        VALUES (?, ?, 'pendente', NOW())
    `;

    db.query(query, [id_usuario, id_livro], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Solicitação enviada!' });
    });
});

// Devolver livro
router.post('/devolver', (req, res) => {
    const { id_usuario, id_livro } = req.body;

    const query = `
        DELETE FROM emprestimos 
        WHERE id_usuario = ? AND id_livro = ?
    `;

    db.query(query, [id_usuario, id_livro], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query('UPDATE livros SET disponivel = 1 WHERE id = ?', [id_livro]);
        res.json({ message: 'Devolução registrada!' });
    });
});

module.exports = router;
