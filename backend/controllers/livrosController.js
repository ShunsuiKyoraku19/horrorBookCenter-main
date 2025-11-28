const pool = require('../db');

// Listar todos os livros
exports.listarLivros = async (req, res) => {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM livros');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar livros', error });
    }
};

// Adicionar livro novo
exports.adicionarLivro = async (req, res) => {
    const { titulo, autor, categoria, imagem } = req.body;

    try {
        await pool.promise().query(
            'INSERT INTO livros (titulo, autor, categoria, imagem, disponivel) VALUES (?, ?, ?, ?, TRUE)',
            [titulo, autor, categoria, imagem]
        );

        res.json({ message: 'Livro adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar livro', error });
    }
};

// Atualizar livro
exports.atualizarLivro = async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, categoria, imagem, disponivel } = req.body;

    try {
        await pool.promise().query(
            'UPDATE livros SET titulo=?, autor=?, categoria=?, imagem=?, disponivel=? WHERE id=?',
            [titulo, autor, categoria, imagem, disponivel, id]
        );

        res.json({ message: 'Livro atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar livro', error });
    }
};

// Remover livro
exports.removerLivro = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.promise().query('DELETE FROM livros WHERE id=?', [id]);
        res.json({ message: 'Livro removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover livro', error });
    }
};
