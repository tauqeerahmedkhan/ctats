# Employee Attendance Tracker

A comprehensive web-based employee attendance management system built with React and SQLite, featuring real-time attendance tracking, employee management, and detailed reporting.

![Attendance Tracker](https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## Features

- 📊 Interactive Dashboard with Real-time Statistics
- 👥 Employee Management
- ✅ Daily Attendance Tracking
- 📅 Multiple Shift Support
- 📈 Detailed Reports & Analytics
- 🖨️ Print-friendly Reports
- 📱 Responsive Design
- 💾 Local Data Storage
- 📤 Import/Export Functionality

## System Requirements

- Node.js v18.18.0 LTS
- npm v9.8.1
- PM2 v5.3.0
- Windows Server 2019 or later

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/attendance-tracker.git
cd attendance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Windows Server Deployment

#### Prerequisites

1. Install Node.js LTS:
   - Download Node.js v18.18.0 LTS from https://nodejs.org
   - Run the installer with default settings
   - Verify installation in PowerShell:
     ```powershell
     node --version  # Should show v18.18.0
     npm --version   # Should show v9.8.1
     ```

2. Install PM2 globally:
   ```powershell
   npm install -g pm2@5.3.0
   ```

#### Installation Steps

1. Create Application Directory:
   ```powershell
   mkdir C:\attendance-tracker
   cd C:\attendance-tracker
   ```

2. Copy Application Files:
   - Copy all project files to `C:\attendance-tracker`
   - Install dependencies:
     ```powershell
     npm install
     ```

3. Create PM2 Configuration:
   Create a file named `ecosystem.config.cjs` with the following content:
   ```javascript
   module.exports = {
     apps: [{
       name: 'attendance-tracker',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production'
       },
       time: true
     }]
   }
   ```

4. Start with PM2:
   ```powershell
   # Start the application with PM2
   pm2 start ecosystem.config.cjs
   pm2 save
   
   # Install PM2 as a Windows Service
   pm2-service-install -n "AttendanceTracker"
   ```

5. Configure Firewall:
   ```powershell
   New-NetFirewallRule -DisplayName "Attendance Tracker" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
   ```

6. Access Application:
   - Open browser and navigate to `http://YOUR-SERVER-IP`
   - For local access: `http://localhost`

#### Service Management

- Start Service: `net start AttendanceTracker`
- Stop Service: `net stop AttendanceTracker`
- View Status: `pm2 status`
- View Logs: `pm2 logs`

## Data Import Templates

### Employee Import Format (CSV)

```csv
id,name,department,fatherName,dob,cnic,address,phone1,phone2,education,shift,weekends
EMP0001,John Doe,IT,James Doe,1990-01-01,12345-6789012-3,123 Main St,0300-1234567,0321-7654321,BS Computer Science,morning,"[0,6]"
EMP0002,Jane Smith,HR,John Smith,1992-05-15,98765-4321098-7,456 Park Ave,0333-9876543,,MBA,morning,"[0,6]"
```

Notes:
- First row must contain headers (case-insensitive)
- `id` is optional (will be auto-generated if not provided)
- `name` is required
- `shift` can be 'morning' or 'night' (defaults to 'morning')
- `weekends` should be a JSON array of day numbers (0=Sunday, 6=Saturday)
- Empty values are allowed for optional fields

### Attendance Import Format (CSV)

```csv
employeeId,date,present,timeIn,timeOut,shift
EMP0001,2025-01-01,1,09:00,17:00,morning
EMP0002,2025-01-01,1,09:15,17:30,morning
EMP0003,2025-01-01,0,,,morning
```

Notes:
- First row must contain headers (case-insensitive)
- `employeeId` and `date` are required
- `date` must be in YYYY-MM-DD format
- `present` should be 1 for present, 0 for absent
- `timeIn` and `timeOut` are required if present=1 (24-hour format)
- `shift` defaults to 'morning' if not specified

## Sample Data

The application comes with sample data including:
- 5 employees across different departments
- 1 month of attendance records
- Pre-configured shifts and holidays

## License

MIT License - feel free to use this project for your organization.

## Support

For support or feature requests, please open an issue on the GitHub repository.