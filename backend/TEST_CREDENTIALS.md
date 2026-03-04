# Test Credentials & Sample Data

## 🔐 Student Test Accounts

After running database initialization, use these to test:

### Account 1 (Auto-created by init script)
```
Roll Number: CA01
Enrollment ID: ENR001
Name: Akhil Sharma
Email: akhil.sharma@didminstitute.edu.in
Password: password123
Semester: 1
```

### Account 2 (For additional testing)
```
Roll Number: CA02
Enrollment ID: ENR002
Name: Priya Patel
Email: priya.patel@didminstitute.edu.in
Password: password456
Semester: 2
```

### Account 3 (For placement testing)
```
Roll Number: CA03
Enrollment ID: ENR003
Name: Raj Kumar
Email: raj.kumar@didminstitute.edu.in
Password: password789
Semester: 4
```

---

## 👨‍💼 Admin Test Accounts

### Admin Account (User)
```
Email: trivedivedant2005@gmail.com
Password: A124@lok.
Role: super_admin
```

### Principal Account
```
Email: principal@didminstitute.edu.in
Password: Principal@123
Role: admin
```

---

## 📚 Sample Courses (MSc CA & IT)

| Code | Course Name | Semester | Credits |
|------|-------------|----------|---------|
| CS101 | Data Structures | 1 | 4 |
| CS102 | Database Management | 1 | 4 |
| CS103 | Web Development | 1 | 4 |
| CS104 | Advanced Java | 2 | 4 |
| CS105 | Software Engineering | 2 | 4 |
| CS106 | Cloud Computing | 3 | 4 |
| CS107 | Machine Learning | 3 | 4 |
| CS108 | Project Work | 4 | 6 |

---

## 💰 Sample Fee Structure

| Semester | Amount (INR) | Due Date |
|----------|-------------|----------|
| Sem 1 | 50,000 | 2026-03-31 |
| Sem 2 | 50,000 | 2026-09-30 |
| Sem 3 | 50,000 | 2027-03-31 |
| Sem 4 | 50,000 | 2027-09-30 |

---

## 📰 Sample News/Updates

### Update 1
```json
{
  "title": "Spring Semester Registration Opened",
  "content": "The registration window for Spring Semester 2026 has opened. All students must complete their registration by March 10, 2026.",
  "category": "Academic",
  "date": "2026-02-28"
}
```

### Update 2
```json
{
  "title": "Annual Tech Fest 2026",
  "content": "Mark your calendars! Annual Tech Fest will be held on March 15-16, 2026. Participate in coding competitions and workshops.",
  "category": "Events",
  "date": "2026-02-25"
}
```

### Update 3
```json
{
  "title": "Top Companies Recruiting",
  "content": "Leading IT companies including TCS, Infosys, and Cognizant will conduct campus recruitment next month.",
  "category": "Placements",
  "date": "2026-02-20"
}
```

---

## 🎓 Sample Grades (For CA01)

| Course | Marks | Grade | Semester |
|--------|-------|-------|----------|
| Data Structures | 88 | A+ | 1 |
| Database Mgmt | 85 | A | 1 |
| Web Development | 92 | A+ | 1 |

---

## 🏆 Sample Placements

| Student | Company | Position | Salary (LPA) | Status |
|---------|---------|----------|-------------|--------|
| CA03 (Raj Kumar) | TCS | Senior Developer | 7.5 | Placed |

---

## 🔄 How to Add More Data

### Add a new student manually:
```sql
INSERT INTO students 
(roll_number, enrollment_id, first_name, last_name, email, phone, password, admission_date, semester) 
VALUES 
('CA04', 'ENR004', 'Aditya', 'Singh', 'aditya@example.com', '9876543210', 
'$2a$10/hashedpassword...', NOW(), 1);
```

### Add a course:
```sql
INSERT INTO courses 
(code, name, semester, credits, instructor_name) 
VALUES 
('CS109', 'Cybersecurity', 3, 4, 'Dr. Amit Patel');
```

### Add an update:
```sql
INSERT INTO updates 
(title, content, category, date, author) 
VALUES 
('New Batch Admission Open', 'Admissions are now open for 2026 batch...', 'Announcements', NOW(), 'Admin');
```

### Add placement:
```sql
INSERT INTO placements 
(student_id, company_name, position, salary, joining_date, status) 
VALUES 
(1, 'Infosys', 'Systems Engineer', 7.0, '2026-06-01', 'placed');
```

---

## 🧪 API Testing with cURL

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"roll_number":"CA01","password":"password123"}'
```

### Get Profile:
```bash
curl -X GET http://localhost:5000/api/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Updates:
```bash
curl http://localhost:5000/api/updates
```

---

## 🔑 Token Format

After login, you'll receive a JWT token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sbF9udW1iZXIiOiJDQTAxIiwiaWF0IjoxNjU0MzIxMjAwLCJleHAiOjE2NTQzMzk4MDB9.signature
```

Use it like:
```
Authorization: Bearer eyJhbGciOi...
```

---

## 📊 Default Database State

After `initDatabase.js`:
- ✓ 8 tables created
- ✓ 0 students (add manually)
- ✓ 0 courses (add manually)
- ✓ 0 updates (add via API)
- ✓ 0 placements (add manually)

Ready to accept real data!

---

**Created:** February 28, 2026  
**For:** Dr. Indu Dayal Meshri Institute Backend
