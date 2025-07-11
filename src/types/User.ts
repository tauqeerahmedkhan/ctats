export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface UserPermissions {
  // Dashboard permissions
  viewDashboard: boolean;
  viewSystemStatus: boolean;
  
  // Employee management permissions
  viewEmployees: boolean;
  addEmployees: boolean;
  editEmployees: boolean;
  deleteEmployees: boolean;
  viewEmployeeDetails: boolean;
  exportEmployeeData: boolean;
  importEmployeeData: boolean;
  
  // Attendance permissions
  viewAttendance: boolean;
  markAttendance: boolean;
  editAttendance: boolean;
  deleteAttendance: boolean;
  viewAttendanceCalendar: boolean;
  exportAttendanceData: boolean;
  importAttendanceData: boolean;
  
  // Reports permissions
  viewReports: boolean;
  viewAttendanceSummary: boolean;
  viewPunctualityReports: boolean;
  viewEmployeeAnalytics: boolean;
  exportReports: boolean;
  printReports: boolean;
  
  // Settings permissions
  viewSettings: boolean;
  editWeekendSettings: boolean;
  editHolidaySettings: boolean;
  editShiftSettings: boolean;
  viewDatabaseSettings: boolean;
  exportDatabase: boolean;
  importDatabase: boolean;
  clearDatabase: boolean;
  generateSampleData: boolean;
  
  // User management permissions
  viewUserSettings: boolean;
  editUserProfile: boolean;
  changePassword: boolean;
  viewUserManagement: boolean;
  manageUsers: boolean;
  assignRoles: boolean;
}

export const getRolePermissions = (role: UserRole): UserPermissions => {
  const basePermissions: UserPermissions = {
    viewDashboard: false,
    viewSystemStatus: false,
    viewEmployees: false,
    addEmployees: false,
    editEmployees: false,
    deleteEmployees: false,
    viewEmployeeDetails: false,
    exportEmployeeData: false,
    importEmployeeData: false,
    viewAttendance: false,
    markAttendance: false,
    editAttendance: false,
    deleteAttendance: false,
    viewAttendanceCalendar: false,
    exportAttendanceData: false,
    importAttendanceData: false,
    viewReports: false,
    viewAttendanceSummary: false,
    viewPunctualityReports: false,
    viewEmployeeAnalytics: false,
    exportReports: false,
    printReports: false,
    viewSettings: false,
    editWeekendSettings: false,
    editHolidaySettings: false,
    editShiftSettings: false,
    viewDatabaseSettings: false,
    exportDatabase: false,
    importDatabase: false,
    clearDatabase: false,
    generateSampleData: false,
    viewUserSettings: false,
    editUserProfile: false,
    changePassword: false,
    viewUserManagement: false,
    manageUsers: false,
    assignRoles: false,
  };

  switch (role) {
    case 'admin':
      // Admin has all permissions
      return Object.keys(basePermissions).reduce((acc, key) => {
        acc[key as keyof UserPermissions] = true;
        return acc;
      }, {} as UserPermissions);

    case 'manager':
      return {
        ...basePermissions,
        // Dashboard
        viewDashboard: true,
        viewSystemStatus: true,
        
        // Employee management
        viewEmployees: true,
        addEmployees: true,
        editEmployees: true,
        deleteEmployees: true,
        viewEmployeeDetails: true,
        exportEmployeeData: true,
        importEmployeeData: true,
        
        // Attendance
        viewAttendance: true,
        markAttendance: true,
        editAttendance: true,
        deleteAttendance: true,
        viewAttendanceCalendar: true,
        exportAttendanceData: true,
        importAttendanceData: true,
        
        // Reports
        viewReports: true,
        viewAttendanceSummary: true,
        viewPunctualityReports: true,
        viewEmployeeAnalytics: true,
        exportReports: true,
        printReports: true,
        
        // Settings (limited)
        viewSettings: true,
        editWeekendSettings: true,
        editHolidaySettings: true,
        editShiftSettings: true,
        viewDatabaseSettings: false,
        exportDatabase: true,
        importDatabase: false,
        clearDatabase: false,
        generateSampleData: true,
        
        // User settings
        viewUserSettings: true,
        editUserProfile: true,
        changePassword: true,
        viewUserManagement: false,
        manageUsers: false,
        assignRoles: false,
      };

    case 'employee':
      return {
        ...basePermissions,
        // Dashboard (limited)
        viewDashboard: true,
        viewSystemStatus: false,
        
        // Employee management (limited)
        viewEmployees: true,
        viewEmployeeDetails: true,
        exportEmployeeData: false,
        
        // Attendance (self-service)
        viewAttendance: true,
        markAttendance: true,
        viewAttendanceCalendar: true,
        
        // Reports (limited)
        viewReports: true,
        viewAttendanceSummary: true,
        printReports: true,
        
        // User settings
        viewUserSettings: true,
        editUserProfile: true,
        changePassword: true,
      };

    case 'viewer':
      return {
        ...basePermissions,
        // Dashboard (read-only)
        viewDashboard: true,
        viewSystemStatus: true,
        
        // Employee management (read-only)
        viewEmployees: true,
        viewEmployeeDetails: true,
        
        // Attendance (read-only)
        viewAttendance: true,
        viewAttendanceCalendar: true,
        
        // Reports (read-only)
        viewReports: true,
        viewAttendanceSummary: true,
        viewPunctualityReports: true,
        viewEmployeeAnalytics: true,
        printReports: true,
        
        // User settings
        viewUserSettings: true,
        editUserProfile: true,
        changePassword: true,
      };

    default:
      return basePermissions;
  }
};

export const hasPermission = (userRole: UserRole, permission: keyof UserPermissions): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
};