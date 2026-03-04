const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        // Create database
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
        );
        console.log('✓ Database created/verified');

        // Select database
        await connection.changeUser({ database: process.env.DB_NAME });

        // Create Students table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                roll_number VARCHAR(50) UNIQUE NOT NULL,
                enrollment_id VARCHAR(100) UNIQUE NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password VARCHAR(255) NOT NULL,
                semester INT DEFAULT 1,
                admission_date DATE,
                status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
                profile_picture VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX(roll_number),
                INDEX(email)
            )
        `);
        console.log('✓ Students table created');

        // Create Updates/News table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS updates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content LONGTEXT NOT NULL,
                category ENUM('Academic', 'Events', 'Placements', 'Facilities', 'Announcements') DEFAULT 'Announcements',
                date DATE NOT NULL,
                author VARCHAR(100),
                is_published BOOLEAN DEFAULT TRUE,
                views INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX(category),
                INDEX(date)
            )
        `);
        console.log('✓ Updates table created');

        // Create Courses table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                credits INT DEFAULT 4,
                semester INT,
                instructor_name VARCHAR(100),
                instructor_email VARCHAR(100),
                capacity INT DEFAULT 60,
                enrolled_students INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX(code)
            )
        `);
        console.log('✓ Courses table created');

        // Create Enrollments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                grade VARCHAR(2),
                marks INT,
                attendance INT DEFAULT 0,
                status ENUM('ongoing', 'completed', 'dropped') DEFAULT 'ongoing',
                enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY(student_id, course_id),
                INDEX(student_id),
                INDEX(course_id)
            )
        `);
        console.log('✓ Enrollments table created');

        // Create Fees table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                semester INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                due_date DATE NOT NULL,
                payment_date DATE,
                status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
                payment_method VARCHAR(50),
                transaction_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
                INDEX(student_id),
                INDEX(status)
            )
        `);
        console.log('✓ Fees table created');

        // Create Announcements table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message LONGTEXT NOT NULL,
                priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
                target_audience VARCHAR(100),
                published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expiry_date DATE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX(priority),
                INDEX(is_active)
            )
        `);
        console.log('✓ Announcements table created');

        // Create Placements table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS placements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                position VARCHAR(100),
                salary DECIMAL(12, 2),
                joining_date DATE,
                status ENUM('placed', 'offer_pending', 'not_placed') DEFAULT 'placed',
                placed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
                INDEX(student_id),
                INDEX(status)
            )
        `);
        console.log('✓ Placements table created');

        // Create Admins table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100),
                role ENUM('admin', 'super_admin') DEFAULT 'admin',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX(email)
            )
        `);
        console.log('✓ Admins table created');

        console.log('\n✅ Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initializeDatabase();
