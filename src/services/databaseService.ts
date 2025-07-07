import { supabase } from '../lib/supabase';

export const exportDbToJson = async () => {
  try {
    // Get all data from tables
    const [employeesResult, attendanceResult, settingsResult] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('settings').select('*')
    ]);

    if (employeesResult.error) throw employeesResult.error;
    if (attendanceResult.error) throw attendanceResult.error;
    if (settingsResult.error) throw settingsResult.error;

    return {
      employees: employeesResult.data || [],
      attendance: attendanceResult.data || [],
      settings: settingsResult.data || [],
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
};

export const importDbFromJson = async (jsonData: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = JSON.parse(jsonData);
    
    // Check if it's v1.0 format (columns/values structure)
    if (data.employees && data.employees.columns && data.employees.values) {
      return await importV1ColumnsData(data);
    }
    
    // Check if it's v1.0 format (direct array without version)
    if (data.employees && Array.isArray(data.employees) && !data.version) {
      return await importV1Data(data);
    }
    
    // Handle v2.0 format
    if (!data.employees || !data.attendance || !data.settings) {
      return { 
        success: false, 
        message: 'Invalid backup file format. Missing required tables.' 
      };
    }

    // Clear existing data (in reverse order due to foreign keys)
    await supabase.from('attendance').delete().neq('id', 0);
    await supabase.from('employees').delete().neq('id', '');
    await supabase.from('settings').delete().neq('id', 0);

    // Import data
    if (data.employees.length > 0) {
      const { error: employeesError } = await supabase
        .from('employees')
        .insert(data.employees);
      if (employeesError) throw employeesError;
    }

    if (data.attendance.length > 0) {
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert(data.attendance);
      if (attendanceError) throw attendanceError;
    }

    if (data.settings.length > 0) {
      const { error: settingsError } = await supabase
        .from('settings')
        .insert(data.settings);
      if (settingsError) throw settingsError;
    }

    const employeeCount = data.employees.length;
    const attendanceCount = data.attendance.length;
    
    return { 
      success: true, 
      message: `Successfully imported ${employeeCount} employees and ${attendanceCount} attendance records.` 
    };
    
  } catch (error) {
    console.error('Import error:', error);
    return { 
      success: false, 
      message: 'Failed to import data. Please check the file format and try again.' 
    };
  }
};

// Import v1.0 data with columns/values structure
const importV1ColumnsData = async (v1Data: any): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Importing v1.0 data format (columns/values structure)...');
    
    // Clear existing data
    await supabase.from('attendance').delete().neq('id', 0);
    await supabase.from('employees').delete().neq('id', '');
    await supabase.from('settings').delete().neq('id', 0);

    let employeeCount = 0;
    let attendanceCount = 0;

    // Convert and import employees
    if (v1Data.employees && v1Data.employees.columns && v1Data.employees.values) {
      const columns = v1Data.employees.columns;
      const convertedEmployees = v1Data.employees.values.map((values: any[]) => {
        const employee: any = {};
        
        columns.forEach((column: string, index: number) => {
          const value = values[index];
          
          switch (column.toLowerCase()) {
            case 'id':
              employee.id = value || `EMP${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
              break;
            case 'name':
              employee.name = value;
              break;
            case 'department':
              employee.department = value || null;
              break;
            case 'fathername':
              employee.father_name = value || null;
              break;
            case 'dob':
              employee.dob = value || null;
              break;
            case 'cnic':
              employee.cnic = value || null;
              break;
            case 'address':
              employee.address = value ? value.replace(/\n/g, ' ').trim() : null;
              break;
            case 'phone1':
              employee.phone1 = value || null;
              break;
            case 'phone2':
              employee.phone2 = value || null;
              break;
            case 'education':
              employee.education = value || null;
              break;
            case 'shift':
              employee.shift = value || 'morning';
              break;
            case 'weekends':
              try {
                employee.weekends = typeof value === 'string' ? JSON.parse(value) : (value || [0, 6]);
              } catch (e) {
                employee.weekends = [0, 6];
              }
              break;
          }
        });

        // Set defaults
        employee.shift = employee.shift || 'morning';
        employee.weekends = employee.weekends || [0, 6];
        employee.created_at = new Date().toISOString();
        employee.updated_at = new Date().toISOString();

        return employee;
      }).filter((emp: any) => emp.name); // Only include employees with names

      if (convertedEmployees.length > 0) {
        const { error: employeesError } = await supabase
          .from('employees')
          .insert(convertedEmployees);
        if (employeesError) {
          console.error('Error inserting employees:', employeesError);
          throw employeesError;
        }
        employeeCount = convertedEmployees.length;
      }
    }

    // Convert and import attendance
    if (v1Data.attendance && v1Data.attendance.columns && v1Data.attendance.values) {
      const columns = v1Data.attendance.columns;
      const convertedAttendance = v1Data.attendance.values.map((values: any[]) => {
        const attendance: any = {};
        
        columns.forEach((column: string, index: number) => {
          const value = values[index];
          
          switch (column.toLowerCase()) {
            case 'employeeid':
              attendance.employee_id = value;
              break;
            case 'date':
              attendance.date = value;
              break;
            case 'present':
              attendance.present = value === 1 || value === true || value === 'true';
              break;
            case 'timein':
              attendance.time_in = value || null;
              break;
            case 'timeout':
              attendance.time_out = value || null;
              break;
            case 'shift':
              attendance.shift = value || 'morning';
              break;
            case 'hours':
              attendance.hours = parseFloat(value) || 0;
              break;
          }
        });

        // Calculate overtime hours (hours > 8)
        const totalHours = attendance.hours || 0;
        if (totalHours > 8) {
          attendance.overtime_hours = totalHours - 8;
          attendance.hours = 8; // Cap regular hours at 8
        } else {
          attendance.overtime_hours = 0;
        }

        attendance.created_at = new Date().toISOString();
        attendance.updated_at = new Date().toISOString();

        return attendance;
      }).filter((att: any) => att.employee_id && att.date); // Only include records with required fields

      if (convertedAttendance.length > 0) {
        // Insert in batches to avoid timeout
        const batchSize = 100;
        for (let i = 0; i < convertedAttendance.length; i += batchSize) {
          const batch = convertedAttendance.slice(i, i + batchSize);
          const { error: attendanceError } = await supabase
            .from('attendance')
            .insert(batch);
          if (attendanceError) {
            console.error('Error inserting attendance batch:', attendanceError);
            throw attendanceError;
          }
        }
        attendanceCount = convertedAttendance.length;
      }
    }

    // Convert and import settings
    const defaultSettings = [];
    
    if (v1Data.settings && v1Data.settings.columns && v1Data.settings.values) {
      const columns = v1Data.settings.columns;
      v1Data.settings.values.forEach((values: any[]) => {
        const setting: any = {};
        columns.forEach((column: string, index: number) => {
          setting[column] = values[index];
        });
        
        if (setting.key && setting.value) {
          try {
            const parsedValue = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
            defaultSettings.push({
              key: setting.key,
              value: parsedValue,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } catch (e) {
            // If parsing fails, use the raw value
            defaultSettings.push({
              key: setting.key,
              value: setting.value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      });
    }

    // Add default settings if none provided
    if (defaultSettings.length === 0) {
      defaultSettings.push(
        { 
          key: 'weekends', 
          value: [0, 6],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          key: 'holidays', 
          value: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          key: 'shifts', 
          value: {
            morning: { start: '09:00', end: '17:00' },
            night: { start: '21:00', end: '05:00' }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    if (defaultSettings.length > 0) {
      const { error: settingsError } = await supabase
        .from('settings')
        .insert(defaultSettings);
      if (settingsError) {
        console.error('Error inserting settings:', settingsError);
        throw settingsError;
      }
    }

    return {
      success: true,
      message: `Successfully migrated v1.0 data: ${employeeCount} employees and ${attendanceCount} attendance records.`
    };
  } catch (error) {
    console.error('Error importing v1.0 columns/values data:', error);
    return {
      success: false,
      message: 'Failed to import v1.0 data. Please check the file format and try again.'
    };
  }
};

// Import v1.0 data (direct array format)
const importV1Data = async (v1Data: any): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Importing v1.0 data format (direct array)...');
    
    // Clear existing data
    await supabase.from('attendance').delete().neq('id', 0);
    await supabase.from('employees').delete().neq('id', '');
    await supabase.from('settings').delete().neq('id', 0);

    let employeeCount = 0;
    let attendanceCount = 0;

    // Convert and import employees
    if (v1Data.employees && Array.isArray(v1Data.employees)) {
      const convertedEmployees = v1Data.employees.map((emp: any) => ({
        id: emp.id || `EMP${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        name: emp.name,
        department: emp.department || null,
        father_name: emp.fatherName || null,
        dob: emp.dob || null,
        cnic: emp.cnic || null,
        address: emp.address || null,
        phone1: emp.phone1 || null,
        phone2: emp.phone2 || null,
        education: emp.education || null,
        shift: emp.shift || 'morning',
        weekends: emp.weekends || [0, 6],
        created_at: emp.createdAt || new Date().toISOString(),
        updated_at: emp.updatedAt || new Date().toISOString(),
      }));

      if (convertedEmployees.length > 0) {
        const { error: employeesError } = await supabase
          .from('employees')
          .insert(convertedEmployees);
        if (employeesError) throw employeesError;
        employeeCount = convertedEmployees.length;
      }
    }

    // Convert and import attendance
    if (v1Data.attendance && Array.isArray(v1Data.attendance)) {
      const convertedAttendance = v1Data.attendance.map((att: any) => ({
        employee_id: att.employeeId,
        date: att.date,
        present: att.present || false,
        time_in: att.timeIn || null,
        time_out: att.timeOut || null,
        shift: att.shift || 'morning',
        hours: att.hours || 0,
        overtime_hours: att.overtimeHours || 0,
        created_at: att.createdAt || new Date().toISOString(),
        updated_at: att.updatedAt || new Date().toISOString(),
      }));

      if (convertedAttendance.length > 0) {
        // Insert in batches to avoid timeout
        const batchSize = 100;
        for (let i = 0; i < convertedAttendance.length; i += batchSize) {
          const batch = convertedAttendance.slice(i, i + batchSize);
          const { error: attendanceError } = await supabase
            .from('attendance')
            .insert(batch);
          if (attendanceError) throw attendanceError;
        }
        attendanceCount = convertedAttendance.length;
      }
    }

    // Convert and import settings
    const defaultSettings = [
      { key: 'weekends', value: v1Data.settings?.weekends || [0, 6] },
      { key: 'holidays', value: v1Data.settings?.holidays || [] },
      { key: 'shifts', value: v1Data.settings?.shifts || {
        morning: { start: '09:00', end: '17:00' },
        night: { start: '21:00', end: '05:00' }
      }}
    ];

    const { error: settingsError } = await supabase
      .from('settings')
      .insert(defaultSettings);
    if (settingsError) throw settingsError;

    return {
      success: true,
      message: `Successfully migrated v1.0 data: ${employeeCount} employees and ${attendanceCount} attendance records.`
    };
  } catch (error) {
    console.error('Error importing v1.0 data:', error);
    return {
      success: false,
      message: 'Failed to import v1.0 data. Please check the file format and try again.'
    };
  }
};

export const importDbFromSql = async (sqlData: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Parse SQL INSERT statements
    const lines = sqlData.split('\n').filter(line => line.trim());
    let employeeCount = 0;
    let attendanceCount = 0;
    let settingsCount = 0;

    // Clear existing data first
    await supabase.from('attendance').delete().neq('id', 0);
    await supabase.from('employees').delete().neq('id', '');
    await supabase.from('settings').delete().neq('id', 0);

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || !trimmedLine) continue;
      
      // Parse INSERT statements
      if (trimmedLine.toLowerCase().startsWith('insert into employees')) {
        const valuesMatch = trimmedLine.match(/VALUES\s*(.+);?$/i);
        if (valuesMatch) {
          const valuesStr = valuesMatch[1].replace(/;$/, '');
          const employees = parseInsertValues(valuesStr, 'employees');
          
          if (employees.length > 0) {
            const { error } = await supabase.from('employees').insert(employees);
            if (error) throw error;
            employeeCount += employees.length;
          }
        }
      } else if (trimmedLine.toLowerCase().startsWith('insert into attendance')) {
        const valuesMatch = trimmedLine.match(/VALUES\s*(.+);?$/i);
        if (valuesMatch) {
          const valuesStr = valuesMatch[1].replace(/;$/, '');
          const attendance = parseInsertValues(valuesStr, 'attendance');
          
          if (attendance.length > 0) {
            const { error } = await supabase.from('attendance').insert(attendance);
            if (error) throw error;
            attendanceCount += attendance.length;
          }
        }
      } else if (trimmedLine.toLowerCase().startsWith('insert into settings')) {
        const valuesMatch = trimmedLine.match(/VALUES\s*(.+);?$/i);
        if (valuesMatch) {
          const valuesStr = valuesMatch[1].replace(/;$/, '');
          const settings = parseInsertValues(valuesStr, 'settings');
          
          if (settings.length > 0) {
            const { error } = await supabase.from('settings').insert(settings);
            if (error) throw error;
            settingsCount += settings.length;
          }
        }
      }
    }

    return {
      success: true,
      message: `Successfully imported ${employeeCount} employees, ${attendanceCount} attendance records, and ${settingsCount} settings.`
    };
  } catch (error) {
    console.error('SQL import error:', error);
    return {
      success: false,
      message: 'Failed to import SQL data. Please check the file format and try again.'
    };
  }
};

const parseInsertValues = (valuesStr: string, tableName: string): any[] => {
  try {
    const results: any[] = [];
    
    // Split by rows (each row is wrapped in parentheses)
    const rowMatches = valuesStr.match(/\([^)]+\)/g);
    if (!rowMatches) return results;

    for (const rowMatch of rowMatches) {
      const values = rowMatch.slice(1, -1); // Remove parentheses
      const parsedValues = parseRowValues(values);
      
      if (tableName === 'employees') {
        results.push({
          id: parsedValues[0],
          name: parsedValues[1],
          department: parsedValues[2] === 'NULL' ? null : parsedValues[2],
          father_name: parsedValues[3] === 'NULL' ? null : parsedValues[3],
          dob: parsedValues[4] === 'NULL' ? null : parsedValues[4],
          cnic: parsedValues[5] === 'NULL' ? null : parsedValues[5],
          address: parsedValues[6] === 'NULL' ? null : parsedValues[6],
          phone1: parsedValues[7] === 'NULL' ? null : parsedValues[7],
          phone2: parsedValues[8] === 'NULL' ? null : parsedValues[8],
          education: parsedValues[9] === 'NULL' ? null : parsedValues[9],
          shift: parsedValues[10],
          weekends: JSON.parse(parsedValues[11]),
          created_at: parsedValues[12],
          updated_at: parsedValues[13],
        });
      } else if (tableName === 'attendance') {
        results.push({
          employee_id: parsedValues[0],
          date: parsedValues[1],
          present: parsedValues[2] === 'true' || parsedValues[2] === 't',
          time_in: parsedValues[3] === 'NULL' ? null : parsedValues[3],
          time_out: parsedValues[4] === 'NULL' ? null : parsedValues[4],
          shift: parsedValues[5],
          hours: parseFloat(parsedValues[6]) || 0,
          overtime_hours: parseFloat(parsedValues[7]) || 0,
          created_at: parsedValues[8],
          updated_at: parsedValues[9],
        });
      } else if (tableName === 'settings') {
        results.push({
          key: parsedValues[0],
          value: JSON.parse(parsedValues[1]),
          created_at: parsedValues[2],
          updated_at: parsedValues[3],
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing row values:', error);
    return [];
  }
};

const parseRowValues = (valuesStr: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    
    if (!inQuotes && (char === "'" || char === '"')) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      // Check if it's an escaped quote
      if (i + 1 < valuesStr.length && valuesStr[i + 1] === quoteChar) {
        current += char;
        i++; // Skip the next quote
      } else {
        inQuotes = false;
        quoteChar = '';
      }
    } else if (!inQuotes && char === ',') {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values.map(val => {
    // Remove surrounding quotes and handle NULL
    if (val === 'NULL') return 'NULL';
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      return val.slice(1, -1);
    }
    return val;
  });
};

export const exportDbToSql = async (): Promise<string> => {
  try {
    const data = await exportDbToJson();
    
    let sql = '-- Employee Attendance System Database Export\n';
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;
    
    // Export employees
    sql += '-- Employees Table\n';
    if (data.employees.length > 0) {
      sql += 'INSERT INTO employees (id, name, department, father_name, dob, cnic, address, phone1, phone2, education, shift, weekends, created_at, updated_at) VALUES\n';
      const employeeValues = data.employees.map(emp => 
        `('${emp.id}', '${emp.name.replace(/'/g, "''")}', ${emp.department ? `'${emp.department.replace(/'/g, "''")}'` : 'NULL'}, ${emp.father_name ? `'${emp.father_name.replace(/'/g, "''")}'` : 'NULL'}, ${emp.dob ? `'${emp.dob}'` : 'NULL'}, ${emp.cnic ? `'${emp.cnic}'` : 'NULL'}, ${emp.address ? `'${emp.address.replace(/'/g, "''")}'` : 'NULL'}, ${emp.phone1 ? `'${emp.phone1}'` : 'NULL'}, ${emp.phone2 ? `'${emp.phone2}'` : 'NULL'}, ${emp.education ? `'${emp.education.replace(/'/g, "''")}'` : 'NULL'}, '${emp.shift}', '${JSON.stringify(emp.weekends)}', '${emp.created_at}', '${emp.updated_at}')`
      );
      sql += employeeValues.join(',\n') + ';\n\n';
    }
    
    // Export attendance
    sql += '-- Attendance Table\n';
    if (data.attendance.length > 0) {
      sql += 'INSERT INTO attendance (employee_id, date, present, time_in, time_out, shift, hours, overtime_hours, created_at, updated_at) VALUES\n';
      const attendanceValues = data.attendance.map(att => 
        `('${att.employee_id}', '${att.date}', ${att.present}, ${att.time_in ? `'${att.time_in}'` : 'NULL'}, ${att.time_out ? `'${att.time_out}'` : 'NULL'}, '${att.shift}', ${att.hours}, ${att.overtime_hours}, '${att.created_at}', '${att.updated_at}')`
      );
      sql += attendanceValues.join(',\n') + ';\n\n';
    }
    
    // Export settings
    sql += '-- Settings Table\n';
    if (data.settings.length > 0) {
      sql += 'INSERT INTO settings (key, value, created_at, updated_at) VALUES\n';
      const settingsValues = data.settings.map(setting => 
        `('${setting.key}', '${JSON.stringify(setting.value)}', '${setting.created_at}', '${setting.updated_at}')`
      );
      sql += settingsValues.join(',\n') + ';\n\n';
    }
    
    return sql;
  } catch (error) {
    console.error('Error exporting to SQL:', error);
    throw error;
  }
};

export const generateSampleData = async (): Promise<boolean> => {
  try {
    // Sample employees
    const sampleEmployees = [
      {
        id: 'EMP0001',
        name: 'John Smith',
        department: 'IT',
        father_name: 'Michael Smith',
        dob: '1990-05-15',
        cnic: '12345-6789012-3',
        address: '123 Tech Street, Silicon Valley',
        phone1: '0300-1234567',
        phone2: '0321-7654321',
        education: 'BS Computer Science',
        shift: 'morning',
        weekends: [0, 6]
      },
      {
        id: 'EMP0002',
        name: 'Sarah Johnson',
        department: 'HR',
        father_name: 'Robert Johnson',
        dob: '1992-08-21',
        cnic: '98765-4321098-7',
        address: '456 HR Avenue, Corporate District',
        phone1: '0333-9876543',
        phone2: null,
        education: 'MBA Human Resources',
        shift: 'morning',
        weekends: [0, 6]
      },
      {
        id: 'EMP0003',
        name: 'David Chen',
        department: 'Engineering',
        father_name: 'James Chen',
        dob: '1988-12-03',
        cnic: '45678-9012345-6',
        address: '789 Engineering Blvd',
        phone1: '0345-6789012',
        phone2: null,
        education: 'MS Mechanical Engineering',
        shift: 'night',
        weekends: [5, 6]
      },
      {
        id: 'EMP0004',
        name: 'Maria Garcia',
        department: 'Finance',
        father_name: 'Carlos Garcia',
        dob: '1991-03-10',
        cnic: '11111-2222233-4',
        address: '321 Finance Plaza',
        phone1: '0301-1111111',
        phone2: '0322-2222222',
        education: 'MBA Finance',
        shift: 'morning',
        weekends: [0, 6]
      },
      {
        id: 'EMP0005',
        name: 'Ahmed Ali',
        department: 'Marketing',
        father_name: 'Ali Ahmed',
        dob: '1989-07-25',
        cnic: '55555-6666677-8',
        address: '654 Marketing Street',
        phone1: '0305-5555555',
        phone2: null,
        education: 'BBA Marketing',
        shift: 'morning',
        weekends: [0, 6]
      }
    ];

    // Clear existing sample data first
    await supabase.from('attendance').delete().in('employee_id', sampleEmployees.map(e => e.id));
    await supabase.from('employees').delete().in('id', sampleEmployees.map(e => e.id));

    // Insert sample employees
    const { error: employeesError } = await supabase
      .from('employees')
      .insert(sampleEmployees);

    if (employeesError) {
      console.error('Error inserting sample employees:', employeesError);
      throw employeesError;
    }

    // Generate sample attendance for current month and previous month
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const sampleAttendance = [];
    
    // Generate for current month
    const daysInCurrentMonth = new Date(year, month, 0).getDate();
    for (const employee of sampleEmployees) {
      for (let day = 1; day <= daysInCurrentMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        
        // Skip weekends and future dates
        if (employee.weekends.includes(dayOfWeek) || date > currentDate) continue;
        
        // 90% chance of being present
        const present = Math.random() < 0.9;
        
        if (present) {
          const isLate = Math.random() < 0.1; // 10% chance of being late
          const hasOvertime = Math.random() < 0.2; // 20% chance of overtime
          
          let timeIn, timeOut, hours = 8, overtimeHours = 0;
          
          if (employee.shift === 'morning') {
            timeIn = isLate ? '09:15' : '09:00';
            timeOut = hasOvertime ? '18:30' : '17:00';
            if (hasOvertime) {
              hours = 8;
              overtimeHours = 1.5;
            }
          } else {
            timeIn = isLate ? '21:15' : '21:00';
            timeOut = hasOvertime ? '06:30' : '05:00';
            if (hasOvertime) {
              hours = 8;
              overtimeHours = 1.5;
            }
          }
          
          sampleAttendance.push({
            employee_id: employee.id,
            date: date.toISOString().split('T')[0],
            present: true,
            time_in: timeIn,
            time_out: timeOut,
            shift: employee.shift,
            hours,
            overtime_hours: overtimeHours
          });
        } else {
          sampleAttendance.push({
            employee_id: employee.id,
            date: date.toISOString().split('T')[0],
            present: false,
            time_in: null,
            time_out: null,
            shift: employee.shift,
            hours: 0,
            overtime_hours: 0
          });
        }
      }
    }

    // Generate for previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    
    for (const employee of sampleEmployees) {
      for (let day = 1; day <= daysInPrevMonth; day++) {
        const date = new Date(prevYear, prevMonth - 1, day);
        const dayOfWeek = date.getDay();
        
        // Skip weekends
        if (employee.weekends.includes(dayOfWeek)) continue;
        
        // 85% chance of being present for previous month
        const present = Math.random() < 0.85;
        
        if (present) {
          const isLate = Math.random() < 0.15; // 15% chance of being late
          const hasOvertime = Math.random() < 0.25; // 25% chance of overtime
          
          let timeIn, timeOut, hours = 8, overtimeHours = 0;
          
          if (employee.shift === 'morning') {
            timeIn = isLate ? '09:20' : '09:00';
            timeOut = hasOvertime ? '19:00' : '17:00';
            if (hasOvertime) {
              hours = 8;
              overtimeHours = 2;
            }
          } else {
            timeIn = isLate ? '21:20' : '21:00';
            timeOut = hasOvertime ? '07:00' : '05:00';
            if (hasOvertime) {
              hours = 8;
              overtimeHours = 2;
            }
          }
          
          sampleAttendance.push({
            employee_id: employee.id,
            date: date.toISOString().split('T')[0],
            present: true,
            time_in: timeIn,
            time_out: timeOut,
            shift: employee.shift,
            hours,
            overtime_hours: overtimeHours
          });
        } else {
          sampleAttendance.push({
            employee_id: employee.id,
            date: date.toISOString().split('T')[0],
            present: false,
            time_in: null,
            time_out: null,
            shift: employee.shift,
            hours: 0,
            overtime_hours: 0
          });
        }
      }
    }

    // Insert sample attendance in batches
    if (sampleAttendance.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < sampleAttendance.length; i += batchSize) {
        const batch = sampleAttendance.slice(i, i + batchSize);
        const { error: attendanceError } = await supabase
          .from('attendance')
          .insert(batch);

        if (attendanceError) {
          console.error('Error inserting sample attendance batch:', attendanceError);
          throw attendanceError;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error generating sample data:', error);
    return false;
  }
};