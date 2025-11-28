const mysql = require('mysql2');
require('dotenv').config();

// Cria o pool de conexões
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão apenas UMA vez
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        process.exit(1); // Sai se der erro
    }
    console.log('Conectado ao MySQL com sucesso!');
    connection.release();
});

module.exports = pool;
