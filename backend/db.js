const mysql = require('mysql2');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const pool = mysql.createPool({
    host: process.env.DB_HOST,       // localhost
    user: process.env.DB_USER,       // root
    password: process.env.DB_PASSWORD, // 130570
    database: process.env.DB_NAME,   // meu_banco
    waitForConnections: true,
    connectionLimit: 10,             // Limite máximo de conexões
    queueLimit: 0,
});

// Testa a conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        return;
    }
    console.log('Conectado ao MySQL!');
    connection.release(); // Libera a conexão de volta para o pool
});

module.exports = pool;
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        process.exit(1); // Sai se não conseguir se conectar ao banco
    }
    console.log('Conectado ao MySQL com sucesso!');
    connection.release(); // Libera a conexão de volta ao pool
});