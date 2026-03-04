const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSampleStudents() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const students = [
            {
                roll_number: 'CA01',
                enrollment_id: 'ENR001',
                first_name: 'Akhil',
                last_name: 'Sharma',
                email: 'akhil.sharma@didminstitute.edu.in',
                phone: '9876543210',
                password: 'password123',
                semester: 1
            },
            {
                roll_number: 'CA02',
                enrollment_id: 'ENR002',
                first_name: 'Priya',
                last_name: 'Patel',
                email: 'priya.patel@didminstitute.edu.in',
                phone: '9876543211',
                password: 'password456',
                semester: 2
            },
            {
                roll_number: 'CA03',
                enrollment_id: 'ENR003',
                first_name: 'Raj',
                last_name: 'Kumar',
                email: 'raj.kumar@didminstitute.edu.in',
                phone: '9876543212',
                password: 'password789',
                semester: 4
            }
        ];

        for (const student of students) {
            try {
                const hashedPassword = await bcrypt.hash(student.password, 10);
                
                await connection.query(
                    `INSERT INTO students 
                    (roll_number, enrollment_id, first_name, last_name, email, phone, password, admission_date, semester) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                    [student.roll_number, student.enrollment_id, student.first_name, student.last_name, 
                     student.email, student.phone, hashedPassword, student.semester]
                );
                
                console.log(`✅ Created student: ${student.roll_number} - ${student.first_name} ${student.last_name}`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  Student ${student.roll_number} already exists`);
                } else {
                    console.error(`❌ Error creating student ${student.roll_number}:`, error.message);
                }
            }
        }

        console.log('\n✅ Sample students creation completed!');
        console.log('\n📋 Test Credentials:');
        console.log('Student 1 - Roll: CA01, Password: password123');
        console.log('Student 2 - Roll: CA02, Password: password456');
        console.log('Student 3 - Roll: CA03, Password: password789');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

createSampleStudents();
