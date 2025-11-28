const express = require('express');
const router = express.Router();
const db = require('../db');

// Login do bibliotecário
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }
    
    db.query(
        'SELECT * FROM bibliotecarios WHERE username = ?',
        [username],
        (err, results) => {
            if (err) {
                console.error('Erro no banco:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ error: 'Bibliotecário não encontrado' });
            }
            
            const bibliotecario = results[0];
            
            // Comparar senha (simples - em produção use bcrypt)
            const senhaValida = (password === bibliotecario.password);
            
            if (senhaValida) {
                // Gerar token simples
                const token = 'bibliotecario-token-' + Date.now();
                
                res.json({ 
                    success: true,
                    token: token,
                    bibliotecario: {
                        id: bibliotecario.id,
                        username: bibliotecario.username,
                        nome: bibliotecario.nome,
                        email: bibliotecario.email
                    }
                });
            } else {
                res.status(401).json({ error: 'Senha incorreta' });
            }
        }
    );
});

// Middleware de autenticação
function autenticarBibliotecario(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verificação simples do token
    if (token.startsWith('bibliotecario-token-')) {
        next();
    } else {
        res.status(401).json({ error: 'Token inválido' });
    }
}

// Aplicar middleware às rotas protegidas
router.use(autenticarBibliotecario);

// Buscar solicitações pendentes
router.get('/solicitacoes', (req, res) => {
    db.query(`
        SELECT s.id, u.username, l.titulo, l.id as id_livro, u.id as id_usuario, s.data_solicitacao
        FROM solicitacoes s
        JOIN usuarios u ON s.id_usuario = u.id
        JOIN livros l ON s.id_livro = l.id
        WHERE s.status = 'pendente'
        ORDER BY s.data_solicitacao DESC
    `, (err, results) => {
        if (err) {
            console.error('Erro ao buscar solicitações:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results);
    });
});

// Aprovar solicitação
router.post('/aprovar', (req, res) => {
    const { id_solicitacao, id_usuario, id_livro } = req.body;

    // Iniciar transação
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao obter conexão:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Erro ao iniciar transação' });
            }

            try {
                // 1. Inserir empréstimo
                await connection.promise().execute(
                    'INSERT INTO emprestimos (id_usuario, id_livro, data_emprestimo) VALUES (?, ?, NOW())',
                    [id_usuario, id_livro]
                );

                // 2. Atualizar disponibilidade do livro (agora usando a rota de livros)
                await connection.promise().execute(
                    'UPDATE livros SET disponivel = 0 WHERE id = ?',
                    [id_livro]
                );

                // 3. Atualizar status da solicitação
                await connection.promise().execute(
                    'UPDATE solicitacoes SET status = "aprovado" WHERE id = ?',
                    [id_solicitacao]
                );

                // Commit da transação
                await connection.promise().commit();
                connection.release();

                res.json({ message: "Solicitação aprovada com sucesso!" });

            } catch (error) {
                // Rollback em caso de erro
                await connection.promise().rollback();
                connection.release();
                console.error('Erro na transação:', error);
                res.status(500).json({ error: 'Erro ao processar aprovação' });
            }
        });
    });
});

// Recusar solicitação
router.post('/recusar', (req, res) => {
    const { id_solicitacao } = req.body;

    db.query(
        'UPDATE solicitacoes SET status = "recusado" WHERE id = ?',
        [id_solicitacao],
        (err, results) => {
            if (err) {
                console.error('Erro ao recusar solicitação:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.json({ message: "Solicitação recusada com sucesso!" });
        }
    );
});

// REMOVER a rota /adicionarLivro daqui, pois já existe em livrosRoutes
// REMOVER a rota /removerLivro daqui, pois já existe em livrosRoutes

// Estatísticas (opcional)
router.get('/estatisticas', (req, res) => {
    db.query(`
        SELECT 
            (SELECT COUNT(*) FROM livros) as total_livros,
            (SELECT COUNT(*) FROM livros WHERE disponivel = 1) as livros_disponiveis,
            (SELECT COUNT(*) FROM solicitacoes WHERE status = 'pendente') as solicitacoes_pendentes,
            (SELECT COUNT(*) FROM emprestimos) as total_emprestimos
    `, (err, results) => {
        if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.json(results[0]);
    });
});

module.exports = router;