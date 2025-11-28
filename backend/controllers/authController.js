const db = require('../db');

// Cadastro de usuário normal
exports.register = (req, res) => {
    const { username, email, password } = req.body;

    const query = 'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)';

    db.query(query, [username, email, password], (err, results) => {
        if (err) {
            return res.status(400).json({ message: 'Erro ao registrar usuário', error: err });
        }
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    });
};

// Login de usuário normal
exports.login = (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';

    db.query(query, [username, password], (err, results) => {
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

// 🔥 Login de BIBLIOTECÁRIO — A FUNÇÃO QUE FALTAVA!
exports.loginBibliotecario = (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM bibliotecarios WHERE username = ? AND password = ?';

    db.query(query, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao fazer login do bibliotecário', error: err });
        }
        if (results.length > 0) {
            res.status(200).json({ message: 'Login do bibliotecário bem-sucedido!' });
        } else {
            res.status(400).json({ message: 'Credenciais inválidas' });
        }
    });
};
