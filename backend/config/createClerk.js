const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createClerk() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const email = 'clerk@didm.edu.in';
        const password = 'clerk@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password=?',
            [email, hashedPassword, 'John Clerk', 'clerk', hashedPassword]
        );

        console.log('✅ Clerk user created!');
        console.log('Email: ' + email);
        console.log('Password: ' + password);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

createClerk();
