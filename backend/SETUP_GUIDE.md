# Backend Setup & Database Integration Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (local or remote)
- Git (optional)

### Installation Steps

#### 1. **Setup MySQL Database**

First, create the database. You have two options:

**Option A: Manual Setup**
```sql
CREATE DATABASE IF NOT EXISTS didm_institute;
```

**Option B: Automatic Setup (Recommended)**
```bash
cd backend
npm install
node config/initDatabase.js
```

This will automatically create all required tables.

#### 2. **Configure Environment Variables**

Update `.env` file in the `backend` folder with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=didm_institute
DB_PORT=3306

PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_change_this

ADMIN_EMAIL=admin@didminstitute.edu.in
ADMIN_PASSWORD=admin@123
```

#### 3. **Install Dependencies**

```bash
cd backend
npm install
```

#### 4. **Start the Backend Server**

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will run on: `http://localhost:5000`

---

## 📊 Database Schema

### Tables Created:

1. **students** - Student account information
2. **courses** - Course details for MSc CA & IT program
3. **enrollments** - Student course enrollments
4. **updates** - News and announcements
5. **fees** - Student fee records
6. **placements** - Placement information
7. **admins** - Administrative users
8. **announcements** - Alerts and notifications

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/signup` - Create admin account
- `POST /api/auth/admin/login` - Admin login

### Student Portal
- `GET /api/students/profile` - Get student profile (requires auth)
- `GET /api/students/courses` - Get enrolled courses
- `GET /api/students/grades` - Get marks and grades
- `GET /api/students/fees` - Get fee status
- `GET /api/students/placement` - Get placement status
- `PUT /api/students/profile/update` - Update profile

### Updates & News
- `GET /api/updates` - Get all updates (public)
- `GET /api/updates/category/:category` - Get updates by category
- `GET /api/updates/:id` - Get single update
- `POST /api/updates/create` - Create update (admin only)
- `PUT /api/updates/:id/update` - Edit update (admin only)
- `DELETE /api/updates/:id/delete` - Delete update (admin only)

---

## 🧪 Testing the API

### Demo Credentials:
```
Roll Number: CA01
Password: password123
```

### Sample API Calls:

**1. Student Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "roll_number": "CA01",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": 1,
    "roll_number": "CA01",
    "name": "John Doe",
    "email": "john@example.com",
    "semester": 1
  }
}
```

**2. Get All Updates**
```bash
curl http://localhost:5000/api/updates
```

**3. Get Student Profile (with authentication)**
```bash
curl -X GET http://localhost:5000/api/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control (Student, Admin)
- CORS enabled for frontend integration
- Environment variable protection

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── initDatabase.js      # Database initialization script
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── students.js          # Student portal endpoints
│   └── updates.js           # Updates/news endpoints
├── server.js                # Main server file
├── .env                     # Environment variables
└── package.json             # Dependencies

frontend/
├── index.html               # Home page
├── portal.html              # Student portal (with API integration)
├── facilities.html          # Facilities page
├── updates.html             # Updates page (fetches from API)
├── contact.html             # Contact page
├── styles.css               # Styling
└── script.js                # Frontend JavaScript (with API calls)
```

---

## 🌐 Frontend Integration

The frontend is already integrated with the backend API. Here's what's connected:

### Portal Login (`portal.html`)
- Sends login credentials to `/api/auth/login`
- Stores JWT token in localStorage
- Displays error/success messages

### Updates Page (`updates.html`)
- Fetches updates from `/api/updates`
- Displays them dynamically
- Updates refresh from database

### Configuration
Update `API_BASE_URL` in `script.js` if your backend runs on a different port:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 📱 Mobile App Integration

To connect a mobile app (React Native, Flutter, etc.):

```javascript
const API_BASE_URL = 'http://your-server-ip:5000/api';

// Example: Login from mobile
fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    roll_number: 'CA01',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    saveToken(data.token);
    navigateToDashboard();
  }
})
```

---

## 🐛 Troubleshooting

### 1. "Connection refused" error
- Ensure MySQL server is running
- Check database credentials in `.env`
- Verify DB_HOST and DB_PORT

### 2. "CORS error" in browser
- CORS is enabled in server.js
- If still issues, update CORS origin in server.js

### 3. "Table doesn't exist" error
- Run: `node config/initDatabase.js`
- This will create all tables

### 4. "JWT token invalid"
- Token might be expired (expires in 24 hours)
- Login again to get new token

---

## 📈 Next Steps

1. **Add More Endpoints**
   - Assignments submission
   - Timetable management
   - Notice board
   - Academic transcript

2. **Implement File Upload**
   - Store student documents
   - Upload assignments
   - Profile picture upload

3. **Email Notifications**
   - Send login alerts
   - Announcement notifications
   - Fee reminders

4. **Advanced Features**
   - Payment gateway integration
   - SMS notifications
   - Email notifications
   - Admin dashboard

---

## 🚀 Deployment

### Deploy to Production

1. **Environment Setup**
   - Use production MySQL server
   - Update `.env` with production credentials
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET

2. **Hosting Options**
   - Heroku
   - DigitalOcean
   - AWS EC2
   - Google Cloud
   - Azure

3. **Update Frontend API URL**
   - Change `API_BASE_URL` to your production server

---

## 📞 Support

For issues or questions:
- Check error logs in terminal
- Review API responses
- Test endpoints with Postman
- Check database entries directly

---

**Version**: 1.0  
**Last Updated**: February 28, 2026  
**Database**: MySQL with Node.js + Express
