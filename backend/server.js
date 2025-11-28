// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

console.log('Iniciando servidor com usuário do banco:', process.env.DB_USER);

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/livros', require('./routes/livrosRoutes'));
app.use('/api/estudante', require('./routes/estudanteRoutes'));
app.use('/api/bibliotecario', require('./routes/bibliotecarioRoutes')); // ← ESTA LINHA

// Rota de teste
app.get('/', (req, res) => {
    res.send('Backend funcionando!');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});