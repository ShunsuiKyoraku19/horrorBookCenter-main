const express = require('express');
const router = express.Router();

// Importa o pool de conexões
const pool = require('../db');

// Controller do bibliotecário
const authController = require('../controllers/authController');

// -----------------------------
// ROTA DE REGISTRO DE USUÁRIO
// -----------------------------
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Checa se já existe
        const [existingUser] = await pool.promise().query(
            'SELECT * FROM usuarios WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Usuário ou email já existe' });
        }

        // Registra
        await pool.promise().query(
            'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// ----------------------------------------
// ROTA DE LOGIN DO BIBLIOTECÁRIO
// ----------------------------------------
router.post('/login-bibliotecario', authController.loginBibliotecario);

// Exporta tudo CERTINHO
module.exports = router;
