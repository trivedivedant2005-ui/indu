const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

async function debugLogin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const email = 'trivedivedant2005@gmail.com';
        const inputPassword = 'A124@lok.';

        console.log(`Checking login for: ${email}`);
        console.log(`Input Password: ${inputPassword}`);

        const [admins] = await connection.query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            console.log('❌ No admin found with this email');
            process.exit(1);
        }

        const admin = admins[0];
        console.log('✅ Admin found in database');
        console.log(`Stored Hashed Password: ${admin.password}`);

        const isMatch = await bcrypt.compare(inputPassword, admin.password);

        if (isMatch) {
            console.log('🏆 SUCCESS: Password matches the hash!');
        } else {
            console.log('❌ FAILURE: Password does NOT match the hash.');

            // Re-hash and update just in case
            console.log('Attempting to re-hash and update...');
            const newHash = await bcrypt.hash(inputPassword, 10);
            await connection.query('UPDATE admins SET password = ? WHERE email = ?', [newHash, email]);
            console.log('✅ Password has been re-hashed and updated in the database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

debugLogin();
