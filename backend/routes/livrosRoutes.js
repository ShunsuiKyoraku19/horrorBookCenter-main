const express = require('express');
const router = express.Router();
const livrosController = require('../controllers/livrosController');

// Rotas de livros
router.get('/', livrosController.listarLivros);
router.post('/', livrosController.adicionarLivro);
router.put('/:id', livrosController.atualizarLivro);
router.delete('/:id', livrosController.removerLivro);

module.exports = router;
