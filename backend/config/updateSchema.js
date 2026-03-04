const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('🔄 Updating database schema...');

        // 1. Update Admins role enum to include 'clerk'
        // Note: ALTER TABLE on ENUM is a bit tricky, but here we'll add it
        await connection.query(`
            ALTER TABLE admins 
            MODIFY COLUMN role ENUM('admin', 'super_admin', 'clerk') DEFAULT 'admin'
        `);
        console.log('✓ Roles updated to include clerk');

        // 2. Create Gallery table for photos
        await connection.query(`
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(uploaded_by) REFERENCES admins(id) ON DELETE SET NULL
            )
        `);
        console.log('✓ Gallery table created');

        // 3. Create Study Materials table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS study_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                semester INT NOT NULL,
                subject VARCHAR(255),
                file_url VARCHAR(255) NOT NULL,
                uploaded_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(uploaded_by) REFERENCES admins(id) ON DELETE SET NULL,
                INDEX(semester)
            )
        `);
        console.log('✓ Study Materials table created');

        console.log('\n✅ Schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

updateSchema();
