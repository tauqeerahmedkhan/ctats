import { supabase } from '../lib/supabase';
import { Employee } from '../types/Employee';

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      fatherName: emp.father_name,
      dob: emp.dob,
      cnic: emp.cnic,
      address: emp.address,
      phone1: emp.phone1,
      phone2: emp.phone2,
      education: emp.education,
      shift: emp.shift as 'morning' | 'night',
      weekends: emp.weekends || [0, 6],
      createdAt: emp.created_at,
      updatedAt: emp.updated_at,
    }));
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      department: data.department,
      fatherName: data.father_name,
      dob: data.dob,
      cnic: data.cnic,
      address: data.address,
      phone1: data.phone1,
      phone2: data.phone2,
      education: data.education,
      shift: data.shift as 'morning' | 'night',
      weekends: data.weekends || [0, 6],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error getting employee by ID:', error);
    return null;
  }
};

export const addEmployee = async (employee: Employee): Promise<boolean> => {
  try {
    if (!employee.name?.trim()) {
      console.error('Employee name is required');
      return false;
    }

    const employeeData = {
      name: employee.name.trim(),
      department: employee.department?.trim() || null,
      father_name: employee.fatherName?.trim() || null,
      dob: employee.dob || null,
      cnic: employee.cnic?.trim() || null,
      address: employee.address?.trim() || null,
      phone1: employee.phone1?.trim() || null,
      phone2: employee.phone2?.trim() || null,
      education: employee.education?.trim() || null,
      shift: employee.shift || 'morning',
      weekends: employee.weekends || [0, 6],
    };

    // If ID is provided, use it, otherwise let database generate it
    if (employee.id?.trim()) {
      employeeData.id = employee.id.trim();
    }

    const { error } = await supabase
      .from('employees')
      .insert(employeeData);

    if (error) {
      console.error('Supabase error adding employee:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error adding employee:', error);
    return false;
  }
};

export const updateEmployee = async (employee: Employee): Promise<boolean> => {
  try {
    if (!employee.name?.trim()) {
      console.error('Employee name is required');
      return false;
    }

    const { error } = await supabase
      .from('employees')
      .update({
        name: employee.name.trim(),
        department: employee.department?.trim() || null,
        father_name: employee.fatherName?.trim() || null,
        dob: employee.dob || null,
        cnic: employee.cnic?.trim() || null,
        address: employee.address?.trim() || null,
        phone1: employee.phone1?.trim() || null,
        phone2: employee.phone2?.trim() || null,
        education: employee.education?.trim() || null,
        shift: employee.shift || 'morning',
        weekends: employee.weekends || [0, 6],
      })
      .eq('id', employee.id);

    if (error) {
      console.error('Supabase error updating employee:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error updating employee:', error);
    return false;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting employee:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
};

export const importEmployeesFromCsv = async (csvData: string): Promise<{ success: boolean; count: number }> => {
  try {
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) {
      return { success: false, count: 0 };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    if (!headers.includes('name')) {
      return { success: false, count: 0 };
    }

    const rows = lines.slice(1);
    let count = 0;

    for (const row of rows) {
      try {
        const values = row.split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const employee: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          
          if (header === 'weekends') {
            try {
              employee[header] = value ? JSON.parse(value) : [0, 6];
            } catch (e) {
              employee[header] = [0, 6];
            }
          } else if (header === 'fathername') {
            employee.fatherName = value || null;
          } else {
            employee[header] = value || null;
          }
        });

        if (!employee.name?.trim()) continue;

        employee.shift = employee.shift || 'morning';
        employee.weekends = employee.weekends || [0, 6];

        if (await addEmployee(employee as Employee)) {
          count++;
        }
      } catch (rowError) {
        console.error('Row processing error:', rowError);
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return { success: false, count: 0 };
  }
};

export const exportEmployeesToCsv = async (): Promise<string> => {
  try {
    const employees = await getAllEmployees();
    
    if (employees.length === 0) {
      return '';
    }

    const headers = [
      'id', 'name', 'department', 'fatherName', 'dob', 'cnic', 
      'address', 'phone1', 'phone2', 'education', 'shift', 'weekends'
    ];

    const csvData = employees.map(emp => [
      emp.id,
      emp.name,
      emp.department || '',
      emp.fatherName || '',
      emp.dob || '',
      emp.cnic || '',
      emp.address || '',
      emp.phone1 || '',
      emp.phone2 || '',
      emp.education || '',
      emp.shift,
      JSON.stringify(emp.weekends)
    ]);

    return [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
  } catch (error) {
    console.error('Error exporting employees:', error);
    return '';
  }
};

export const getEmployeeTemplate = (): string => {
  return `id,name,department,fatherName,dob,cnic,address,phone1,phone2,education,shift,weekends
EMP0001,John Doe,IT,James Doe,1990-01-01,12345-6789012-3,123 Main St,0300-1234567,0321-7654321,BS Computer Science,morning,"[0,6]"
EMP0002,Jane Smith,HR,John Smith,1992-05-15,98765-4321098-7,456 Park Ave,0333-9876543,,MBA,morning,"[0,6]"

Instructions:
1. id: Employee ID (optional - will be auto-generated if not provided)
2. name: Employee name (required)
3. department: Department name (optional)
4. fatherName: Father's name (optional)
5. dob: Date of birth in YYYY-MM-DD format (optional)
6. cnic: CNIC number (optional)
7. address: Full address (optional)
8. phone1: Primary phone number (optional)
9. phone2: Secondary phone number (optional)
10. education: Education details (optional)
11. shift: morning or night (defaults to morning)
12. weekends: JSON array of weekend days [0=Sunday, 6=Saturday] (defaults to [0,6])

Notes:
- First row must contain headers (case-insensitive)
- Only 'name' field is required
- Empty values are allowed for optional fields
- CSV file should be UTF-8 encoded`;
};