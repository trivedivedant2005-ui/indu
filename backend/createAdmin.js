const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = 'Vedant Trivedi';

        console.log(`Creating admin account for: ${adminEmail}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Insert admin
        await connection.query(
            'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
            [adminEmail, hashedPassword, adminName, 'super_admin']
        );

        console.log('✅ Admin account created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Role: super_admin`);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Admin account already exists');
        } else {
            console.error('❌ Error creating admin:', error.message);
        }
    } finally {
        await connection.end();
        process.exit(0);
    }
}

createAdmin();
