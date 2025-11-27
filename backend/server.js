// Carregar as variáveis de ambiente
require('dotenv').config({ path: './backend/.env' });

// Verificar se as variáveis de ambiente estão sendo carregadas corretamente
console.log('Conectando ao MySQL com:');
console.log('Usuário:', process.env.DB_USER);
console.log('Senha:', process.env.DB_PASSWORD ? '***' : 'Não definida');

const db = require('./db'); // Seu pool de conexões

// Testar a conexão com o banco de dados
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
        process.exit(1); // Sai se não conseguir se conectar ao banco
    }
    console.log('Conectado ao MySQL com sucesso!');
    connection.release(); // Libera a conexão de volta ao pool
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir CORS e JSON
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));

// Rota de teste
app.get('/', (req, res) => {
    res.send('Backend funcionando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

console.log('Usuário carregado:', process.env.DB_USER);
console.log('Senha carregada:', process.env.DB_PASSWORD ? '***' : 'Não definida');
