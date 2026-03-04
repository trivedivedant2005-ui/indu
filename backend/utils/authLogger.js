// Logger utility for authentication events
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../auth_activity.log');

function logAuthEvent({ event, roll_number, email, ip }) {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} | ${event.toUpperCase()} | Roll: ${roll_number || ''} | Email: ${email || ''} | IP: ${ip || ''}\n`;
    fs.appendFile(logFilePath, logLine, err => {
        if (err) console.error('Error writing auth log:', err);
    });
}

module.exports = { logAuthEvent };
