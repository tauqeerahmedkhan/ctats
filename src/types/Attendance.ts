export interface AttendanceRecord {
  id?: number;
  employeeId: string;
  employeeName?: string;
  department?: string;
  date: string;
  present: boolean;
  timeIn?: string;
  timeOut?: string;
  shift?: string;
  hours?: number;
  overtimeHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyAttendance {
  [date: string]: {
    present: boolean;
    timeIn?: string;
    timeOut?: string;
    shift?: string;
    hours?: number;
    overtimeHours?: number;
  };
}

export interface MonthlyAttendance {
  [employeeId: string]: DailyAttendance;
}

export interface EmployeeAnalytics {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalHours: number;
  overtimeHours: number;
  avgHoursPerDay: number;
  punctualityScore: number;
  attendancePercentage: number;
  onTimeDays: number;
  lateDays: number;
  avgLateness: number;
  earlyDepartures: number;
  weeklyStats: {
    week: string;
    presentDays: number;
    totalHours: number;
    overtimeHours: number;
  }[];
  monthlyStats: {
    month: string;
    presentDays: number;
    totalHours: number;
    overtimeHours: number;
  }[];
}