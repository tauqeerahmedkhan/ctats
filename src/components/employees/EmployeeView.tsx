import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { EmployeeList } from './EmployeeList';
import { EmployeeForm } from './EmployeeForm';
import { getAllEmployees, deleteEmployee, importEmployeesFromCsv, exportEmployeesToCsv, getEmployeeTemplate } from '../../services/employeeService';
import { Employee } from '../../types/Employee';
import { UserPlus, Upload, Download, UserX } from 'lucide-react';

export const EmployeeView: React.FC = () => {
  const { addToast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load employees when component mounts
  useEffect(() => {
    loadEmployees();
  }, []);
  
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const employeesList = await getAllEmployees();
      setEmployees(employeesList);
    } catch (error) {
      console.error('Error loading employees:', error);
      addToast('Failed to load employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };
  
  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}? This will also delete all attendance records for this employee.`)) {
      const success = await deleteEmployee(employee.id);
      
      if (success) {
        addToast(`Employee ${employee.name} deleted successfully`, 'success');
        loadEmployees();
      } else {
        addToast('Failed to delete employee', 'error');
      }
    }
  };
  
  const handleFormClose = (reloadData: boolean = false) => {
    setIsFormOpen(false);
    if (reloadData) {
      loadEmployees();
    }
  };
  
  const handleExportCsv = async () => {
    if (employees.length === 0) {
      addToast('No employees to export', 'warning');
      return;
    }
    
    try {
      const csvContent = await exportEmployeesToCsv();
      
      if (!csvContent) {
        addToast('No data to export', 'warning');
        return;
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'employees.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Employees exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting employees:', error);
      addToast('Failed to export employees', 'error');
    }
  };
  
  const handleImportCsv = () => {
    setIsImportOpen(true);
    setImportData(getEmployeeTemplate());
  };
  
  const processImportCsv = async () => {
    if (!importData.trim()) {
      addToast('No data to import', 'warning');
      return;
    }
    
    try {
      const result = await importEmployeesFromCsv(importData);
      
      if (result.success) {
        addToast(`Successfully imported ${result.count} employees`, 'success');
        setIsImportOpen(false);
        setImportData('');
        loadEmployees();
      } else {
        addToast('Failed to import employees', 'error');
      }
    } catch (error) {
      console.error('Error importing employees:', error);
      addToast('Failed to import employees', 'error');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600">Add, edit, and manage employee information</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary" 
            onClick={handleAddEmployee}
            icon={<UserPlus size={18} />}
          >
            Add Employee
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCsv}
            icon={<Download size={18} />}
          >
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={handleImportCsv}
            icon={<Upload size={18} />}
          >
            Import CSV
          </Button>
        </div>
      </div>
      
      {employees.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserX size={40} />}
            title="No employees found"
            description="Add your first employee to get started"
            action={
              <Button 
                variant="primary" 
                onClick={handleAddEmployee}
              >
                Add Employee
              </Button>
            }
          />
        </Card>
      ) : (
        <EmployeeList 
          employees={employees} 
          onEdit={handleEditEmployee} 
          onDelete={handleDeleteEmployee} 
        />
      )}
      
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <EmployeeForm 
                employee={selectedEmployee} 
                onClose={handleFormClose} 
              />
            </div>
          </div>
        </div>
      )}
      
      {isImportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Import Employees from CSV
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Paste your CSV data below. The first row should contain headers.
                  You can use the template provided or clear it and paste your own data.
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                />
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsImportOpen(false);
                      setImportData('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={processImportCsv}
                  >
                    Import Employees
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};