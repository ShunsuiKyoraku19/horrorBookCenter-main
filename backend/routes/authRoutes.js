const express = require('express');
const router = express.Router(); // Defina o Router aqui

// Importa o pool de conexões
const pool = require('../db'); 

// Rota de registro
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verifica se o usuário já existe
        const [existingUser] = await pool.promise().query(
            'SELECT * FROM usuarios WHERE username = ? OR email = ?', [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Usuário ou email já existe' });
        }

        // Insere o novo usuário no banco de dados
        await pool.promise().query(
            'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)', [username, email, password]
        );

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Exporta o router para uso em outros arquivos
module.exports = router;
