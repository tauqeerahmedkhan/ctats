import { supabase } from '../lib/supabase';
import { AttendanceRecord, EmployeeAnalytics } from '../types/Attendance';

export const getAttendanceByMonth = async (year: number, month: number): Promise<AttendanceRecord[]> => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employees!inner(name, department)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      employeeName: record.employees.name,
      department: record.employees.department,
      date: record.date,
      present: record.present,
      timeIn: record.time_in,
      timeOut: record.time_out,
      shift: record.shift,
      hours: record.hours,
      overtimeHours: record.overtime_hours,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));
  } catch (error) {
    console.error('Error getting attendance by month:', error);
    return [];
  }
};

export const getAttendanceByEmployee = async (
  employeeId: string, 
  year: number, 
  month: number
): Promise<AttendanceRecord[]> => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employees!inner(name, department)
      `)
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      employeeId: record.employee_id,
      employeeName: record.employees.name,
      department: record.employees.department,
      date: record.date,
      present: record.present,
      timeIn: record.time_in,
      timeOut: record.time_out,
      shift: record.shift,
      hours: record.hours,
      overtimeHours: record.overtime_hours,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));
  } catch (error) {
    console.error('Error getting attendance by employee:', error);
    return [];
  }
};

export const saveAttendanceRecord = async (record: AttendanceRecord): Promise<boolean> => {
  try {
    // Calculate hours and overtime
    let hours = 0;
    let overtimeHours = 0;

    if (record.present && record.timeIn && record.timeOut) {
      const [inHour, inMinute] = record.timeIn.split(':').map(Number);
      const [outHour, outMinute] = record.timeOut.split(':').map(Number);
      
      let totalMinutes;
      if (outHour < inHour) {
        // Night shift (crosses midnight)
        totalMinutes = (outHour + 24) * 60 + outMinute - (inHour * 60 + inMinute);
      } else {
        totalMinutes = outHour * 60 + outMinute - (inHour * 60 + inMinute);
      }
      
      hours = parseFloat((totalMinutes / 60).toFixed(2));
      
      // Calculate overtime (more than 8 hours)
      if (hours > 8) {
        overtimeHours = parseFloat((hours - 8).toFixed(2));
        hours = 8; // Cap regular hours at 8
      }
    }

    const attendanceData = {
      employee_id: record.employeeId,
      date: record.date,
      present: record.present || false,
      time_in: record.present ? record.timeIn || null : null,
      time_out: record.present ? record.timeOut || null : null,
      shift: record.shift || 'morning',
      hours: hours,
      overtime_hours: overtimeHours,
    };

    const { error } = await supabase
      .from('attendance')
      .upsert(attendanceData, {
        onConflict: 'employee_id,date'
      });

    if (error) {
      console.error('Supabase error saving attendance:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error saving attendance record:', error);
    return false;
  }
};

export const deleteAttendanceRecord = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return false;
  }
};

export const getAttendanceSummary = async (year: number, month: number): Promise<any[]> => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // First try the RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_attendance_summary', {
      start_date: startDate,
      end_date: endDate
    });

    if (!rpcError && rpcData) {
      return rpcData;
    }

    // Fallback to manual calculation if RPC fails
    console.warn('RPC function failed, using fallback calculation:', rpcError);
    
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        employees!inner(id, name, department, shift)
      `)
      .gte('date', startDate)
      .lte('date', endDate);

    if (attendanceError) throw attendanceError;

    if (!attendanceData || attendanceData.length === 0) {
      console.log('No attendance data found for the specified period');
      return [];
    }

    // Group by employee and calculate summary
    const employeeSummary = new Map();

    attendanceData.forEach(record => {
      const empId = record.employee_id;
      if (!employeeSummary.has(empId)) {
        employeeSummary.set(empId, {
          employee_id: empId,
          employee_name: record.employees.name,
          department: record.employees.department,
          shift: record.employees.shift,
          present_days: 0,
          absent_days: 0,
          total_hours: 0,
          overtime_hours: 0,
          on_time_days: 0,
          late_days: 0,
          early_departures: 0,
          avg_lateness_minutes: 0,
          punctuality_percentage: 100,
          hours_efficiency: 100,
        });
      }

      const summary = employeeSummary.get(empId);
      
      if (record.present) {
        summary.present_days++;
        summary.total_hours += record.hours || 0;
        summary.overtime_hours += record.overtime_hours || 0;

        // Check punctuality
        if (record.time_in) {
          const expectedTime = record.shift === 'morning' ? '09:00' : '21:00';
          if (record.time_in <= expectedTime) {
            summary.on_time_days++;
          } else {
            summary.late_days++;
          }
        }

        // Check early departures
        if (record.time_out) {
          const expectedEndTime = record.shift === 'morning' ? '17:00' : '05:00';
          if (record.time_out < expectedEndTime) {
            summary.early_departures++;
          }
        }
      } else {
        summary.absent_days++;
      }
    });

    // Calculate additional metrics
    const result = Array.from(employeeSummary.values()).map(summary => ({
      ...summary,
      avg_hours_per_day: summary.present_days > 0 ? summary.total_hours / summary.present_days : 0,
      punctuality_percentage: summary.present_days > 0 ? (summary.on_time_days / summary.present_days) * 100 : 100,
      hours_efficiency: summary.present_days > 0 ? (summary.total_hours / (summary.present_days * 8)) * 100 : 0,
      avg_lateness_minutes: 0,
    }));

    return result;
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    return [];
  }
};

export const getEmployeeAnalytics = async (
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<EmployeeAnalytics | null> => {
  try {
    // First try the RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_employee_analytics', {
      emp_id: employeeId,
      start_date: startDate,
      end_date: endDate
    });

    if (!rpcError && rpcData) {
      return rpcData;
    }

    // Fallback to manual calculation
    console.warn('RPC function failed, using fallback calculation:', rpcError);
    
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        employees!inner(name, department)
      `)
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (attendanceError) throw attendanceError;

    if (!attendanceData || attendanceData.length === 0) {
      return null;
    }

    const employee = attendanceData[0].employees;
    let presentDays = 0;
    let totalHours = 0;
    let overtimeHours = 0;
    let onTimeDays = 0;
    let lateDays = 0;

    attendanceData.forEach(record => {
      if (record.present) {
        presentDays++;
        totalHours += record.hours || 0;
        overtimeHours += record.overtime_hours || 0;

        if (record.time_in) {
          const expectedTime = record.shift === 'morning' ? '09:00' : '21:00';
          if (record.time_in <= expectedTime) {
            onTimeDays++;
          } else {
            lateDays++;
          }
        }
      }
    });

    const totalDays = attendanceData.length;
    const absentDays = totalDays - presentDays;

    return {
      employeeId,
      employeeName: employee.name,
      department: employee.department || '',
      totalDays,
      presentDays,
      absentDays,
      totalHours,
      overtimeHours,
      avgHoursPerDay: presentDays > 0 ? totalHours / presentDays : 0,
      punctualityScore: presentDays > 0 ? (onTimeDays / presentDays) * 100 : 100,
      attendancePercentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
      onTimeDays,
      lateDays,
      avgLateness: 0,
      earlyDepartures: 0,
      weeklyStats: [],
      monthlyStats: [],
    };
  } catch (error) {
    console.error('Error getting employee analytics:', error);
    return null;
  }
};

export const importAttendanceFromCsv = async (csvData: string): Promise<{ success: boolean; count: number }> => {
  try {
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) {
      return { success: false, count: 0 };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const rows = lines.slice(1);
    let count = 0;

    for (const row of rows) {
      try {
        const values = row.split(',').map(v => v.trim());
        const record: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          switch (header) {
            case 'employeeid':
            case 'employee_id':
              record.employeeId = value;
              break;
            case 'date':
              record.date = value;
              break;
            case 'present':
              record.present = value === '1' || value?.toLowerCase() === 'true';
              break;
            case 'timein':
            case 'time_in':
              record.timeIn = value || null;
              break;
            case 'timeout':
            case 'time_out':
              record.timeOut = value || null;
              break;
            case 'shift':
              record.shift = value || 'morning';
              break;
          }
        });

        if (!record.employeeId || !record.date) continue;

        if (await saveAttendanceRecord(record as AttendanceRecord)) {
          count++;
        }
      } catch (rowError) {
        console.error('Row processing error:', rowError);
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error('Error importing attendance from CSV:', error);
    return { success: false, count: 0 };
  }
};

export const exportAttendanceToCsv = async (year: number, month: number): Promise<string> => {
  try {
    const records = await getAttendanceByMonth(year, month);
    
    if (records.length === 0) {
      return '';
    }

    const headers = [
      'Employee ID', 'Employee Name', 'Department', 'Date', 'Present', 
      'Time In', 'Time Out', 'Shift', 'Hours', 'Overtime Hours'
    ];

    const csvData = records.map(record => [
      record.employeeId,
      record.employeeName,
      record.department || '',
      record.date,
      record.present ? 'Yes' : 'No',
      record.timeIn || '',
      record.timeOut || '',
      record.shift || '',
      record.hours?.toString() || '0',
      record.overtimeHours?.toString() || '0',
    ]);

    return [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
  } catch (error) {
    console.error('Error exporting attendance:', error);
    return '';
  }
};

export const getAttendanceTemplate = (): string => {
  return `employeeId,date,present,timeIn,timeOut,shift
EMP0001,2025-01-01,1,09:00,17:00,morning
EMP0002,2025-01-01,1,09:15,17:30,morning
EMP0003,2025-01-01,0,,,morning

Instructions:
1. employeeId: Employee ID (required)
2. date: YYYY-MM-DD format (required)
3. present: 1 for present, 0 for absent
4. timeIn: HH:mm format (required if present)
5. timeOut: HH:mm format (required if present)
6. shift: morning or night (defaults to morning)

Notes:
- First row must contain headers
- Date must be in YYYY-MM-DD format
- Time must be in 24-hour format (HH:mm)
- For absent employees, leave timeIn and timeOut empty
- CSV file should be UTF-8 encoded
- Overtime is automatically calculated for hours > 8`;
};