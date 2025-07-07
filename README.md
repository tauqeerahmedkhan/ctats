# Employee Attendance Tracker

A comprehensive cloud-based employee attendance management system built with React, TypeScript, and Supabase, featuring real-time attendance tracking, advanced analytics, role-based access control, and comprehensive reporting capabilities.

![Attendance Tracker](https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## 🚀 Features

### 📊 **Dashboard & Analytics**
- Interactive dashboard with real-time statistics
- Key performance indicators (KPIs) for attendance metrics
- Quick action buttons for common tasks
- Visual charts and graphs for data insights
- Department-wise and shift-wise analytics

### 👥 **Employee Management**
- Complete employee profile management
- Department and shift assignment
- Individual weekend configuration
- Employee search and filtering
- Bulk import/export functionality
- Employee analytics and performance tracking

### ✅ **Attendance Tracking**
- Daily attendance marking with time tracking
- Multiple shift support (Morning, Night, Custom)
- Automatic overtime calculation (>8 hours)
- Weekend and holiday management
- Bulk attendance import/export
- Real-time attendance calendar view

### 📈 **Advanced Reporting**
- Comprehensive attendance summary reports
- Punctuality and overtime analysis
- Individual employee analytics with charts
- Monthly and yearly trend analysis
- Print-friendly report layouts
- Export reports in CSV format

### ⚙️ **Settings & Configuration**
- Flexible shift timing configuration
- Weekend day customization per employee
- Holiday management with automatic calendar integration
- System-wide settings management
- User profile and security settings

### 🔐 **Security & User Management**
- Supabase authentication with email/password
- Role-based access control (RBAC)
- Secure cloud data storage
- Row-level security (RLS) policies
- Password management and profile updates

### 💾 **Data Management**
- Cloud-based PostgreSQL database via Supabase
- Automatic data backup and synchronization
- Import/Export functionality (JSON, CSV, SQL)
- Legacy data migration support (v1.0 compatibility)
- Sample data generation for testing

### 🖨️ **Import/Export Capabilities**
- **Employee Data**: CSV import/export with templates
- **Attendance Records**: Bulk CSV import/export
- **Database Backup**: Complete JSON export/import
- **SQL Export**: Database structure and data as SQL
- **Legacy Support**: Import from v1.0 JSON format
- **Print Reports**: Optimized print layouts

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify-ready

## 📋 System Requirements

- Node.js v18.18.0 LTS or higher
- npm v9.8.1 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Supabase cloud services

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/attendance-tracker.git
cd attendance-tracker
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the provided migrations in the Supabase SQL editor
3. Copy your project URL and anon key to the `.env` file

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📊 Database Schema

### Core Tables

#### **employees**
- `id` (text, primary key) - Employee ID
- `name` (text, required) - Employee name
- `department` (text) - Department name
- `father_name` (text) - Father's name
- `dob` (date) - Date of birth
- `cnic` (text) - National ID number
- `address` (text) - Full address
- `phone1`, `phone2` (text) - Contact numbers
- `education` (text) - Education details
- `shift` (text) - Assigned shift (morning/night)
- `weekends` (jsonb) - Weekend days array
- `created_at`, `updated_at` (timestamptz) - Timestamps

#### **attendance**
- `id` (bigint, primary key) - Record ID
- `employee_id` (text, foreign key) - Reference to employee
- `date` (date) - Attendance date
- `present` (boolean) - Presence status
- `time_in`, `time_out` (time) - Clock in/out times
- `shift` (text) - Shift worked
- `hours` (numeric) - Regular hours worked
- `overtime_hours` (numeric) - Overtime hours
- `created_at`, `updated_at` (timestamptz) - Timestamps

#### **settings**
- `id` (bigint, primary key) - Setting ID
- `key` (text, unique) - Setting key
- `value` (jsonb) - Setting value
- `created_at`, `updated_at` (timestamptz) - Timestamps

### Advanced Features

#### **Analytics Functions**
- `get_attendance_summary()` - Monthly attendance analytics
- `get_employee_analytics()` - Individual employee metrics

#### **Security**
- Row Level Security (RLS) enabled on all tables
- Authenticated user policies
- Secure data access patterns

## 📥 Data Import/Export

### Employee Import Format (CSV)

```csv
id,name,department,fatherName,dob,cnic,address,phone1,phone2,education,shift,weekends
EMP0001,John Doe,IT,James Doe,1990-01-01,12345-6789012-3,123 Main St,0300-1234567,0321-7654321,BS Computer Science,morning,"[0,6]"
EMP0002,Jane Smith,HR,John Smith,1992-05-15,98765-4321098-7,456 Park Ave,0333-9876543,,MBA,morning,"[0,6]"
```

### Attendance Import Format (CSV)

```csv
employeeId,date,present,timeIn,timeOut,shift
EMP0001,2025-01-01,1,09:00,17:00,morning
EMP0002,2025-01-01,1,09:15,17:30,morning
EMP0003,2025-01-01,0,,,morning
```

### Database Backup Format (JSON)

```json
{
  "employees": [...],
  "attendance": [...],
  "settings": [...],
  "exportDate": "2025-01-01T00:00:00.000Z",
  "version": "2.0"
}
```

## 🔧 Configuration

### Default Settings

- **Weekends**: Sunday (0) and Saturday (6)
- **Default Holiday**: Friday (automatically added)
- **Shifts**: 
  - Morning: 09:00 - 17:00
  - Night: 21:00 - 05:00
- **Overtime**: Calculated for hours > 8 per day

### Customization Options

- **Weekend Days**: Configurable per employee
- **Shift Timings**: Fully customizable
- **Holiday Calendar**: Add company and national holidays
- **Overtime Rules**: Automatic calculation based on shift hours

## 👤 User Management & RBAC

### Authentication
- Email/password authentication via Supabase
- Secure session management
- Password reset functionality

### Role-Based Access Control
- **Admin**: Full system access
- **Manager**: Department-level access
- **Employee**: Limited self-service access
- **Viewer**: Read-only access

### Security Features
- Row-level security policies
- Encrypted data transmission
- Secure cloud storage
- Audit trail for data changes

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total employees and departments
- Daily attendance rates
- Average working hours
- Overtime statistics
- Punctuality scores

### Detailed Reports
- **Attendance Summary**: Monthly overview with punctuality metrics
- **Punctuality Analysis**: Late arrivals, early departures, efficiency
- **Employee Analytics**: Individual performance with charts
- **Trend Analysis**: Weekly and monthly patterns

### Export Options
- Print-optimized layouts
- CSV exports for external analysis
- PDF-ready formatting
- Custom date range selection

## 🔄 Migration & Legacy Support

### From Version 1.0
- Automatic detection of v1.0 JSON format
- Data structure conversion
- Settings migration
- Employee and attendance data preservation

### Backup Strategy
- Regular JSON exports recommended
- SQL dumps for complete backup
- Cloud synchronization via Supabase
- Version-controlled schema migrations

## 🚀 Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Deployment

#### Netlify (Recommended)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Manual Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Sample Data

The application includes a sample data generator that creates:
- 5 employees across different departments
- 2 months of realistic attendance data
- Various attendance patterns (on-time, late, overtime)
- Department and shift diversity

Access via: **Settings → Database Management → Generate Sample Data**

## 🔍 Troubleshooting

### Common Issues

#### Authentication Problems
- Verify Supabase URL and keys in `.env`
- Check Supabase project status
- Ensure RLS policies are properly configured

#### Data Import Failures
- Validate CSV format and headers
- Check for special characters in data
- Ensure employee IDs exist for attendance imports

#### Performance Issues
- Use date range filters for large datasets
- Enable database indexes for frequently queried columns
- Consider pagination for large employee lists

### Support Resources
- Check browser console for detailed error messages
- Verify network connectivity to Supabase
- Review Supabase dashboard for API usage and errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for the styling framework
- [Lucide React](https://lucide.dev) for the icon library
- [Recharts](https://recharts.org) for data visualization

## 📞 Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

---

**Built with ❤️ using React, TypeScript, and Supabase**