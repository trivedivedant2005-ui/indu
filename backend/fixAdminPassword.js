const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminPassword() {
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

        console.log(`Fixing password for: ${adminEmail}`);
        console.log(`New password: ${adminPassword}`);

        // Hash the correct password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Update the admin password
        await connection.query(
            'UPDATE admins SET password = ? WHERE email = ?',
            [hashedPassword, adminEmail]
        );

        console.log('✅ Admin password updated successfully!');

        // Verify the update
        const [admins] = await connection.query(
            'SELECT email, name, role FROM admins WHERE email = ?',
            [adminEmail]
        );

        if (admins.length > 0) {
            console.log('✅ Admin account verified:');
            console.log(`Email: ${admins[0].email}`);
            console.log(`Name: ${admins[0].name}`);
            console.log(`Role: ${admins[0].role}`);
        }

    } catch (error) {
        console.error('❌ Error fixing admin password:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

fixAdminPassword();
