const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

async function setupAdmins() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const admins = [
            {
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                name: 'Vedant Trivedi',
                role: 'super_admin'
            },
            {
                email: process.env.PRINCIPAL_EMAIL,
                password: process.env.PRINCIPAL_PASSWORD,
                name: 'Principal Sir',
                role: 'admin'
            }
        ];

        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await connection.query(
                'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password=?, role=?',
                [admin.email, hashedPassword, admin.name, admin.role, hashedPassword, admin.role]
            );
            console.log(`✅ Admin account setup: ${admin.email} (${admin.role})`);
        }

        console.log('\n✅ All admin accounts setup successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up admins:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

setupAdmins();
