const mysql = require('mysql2');
const connection = require('../db'); // Importa a conexão com o MySQL

// Cadastro de usuário
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)';

    connection.query(query, [username, email, password], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Erro ao registrar usuário', error: err });
        }
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    });
};

// Login de usuário
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';

    connection.query(query, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao fazer login', error: err });
        }
        if (results.length > 0) {
            res.status(200).json({ message: 'Login bem-sucedido!' });
        } else {
            res.status(400).json({ message: 'Credenciais inválidas' });
        }
    });
};