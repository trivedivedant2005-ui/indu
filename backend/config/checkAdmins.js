const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

async function checkAdmins() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [rows] = await connection.query('SELECT id, email, name, role, is_active FROM admins');
        console.log('--- Current Admins in Database ---');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking admins:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

checkAdmins();
