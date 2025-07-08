import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { EmployeeModal } from './EmployeeModal';
import { Employee } from '../../types/Employee';
import { Edit, Trash2, Search, ChevronDown, ChevronUp, Eye, Printer, Download } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter employees by search term
  const filteredEmployees = employees.filter((employee) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchTermLower) ||
      (employee.department && employee.department.toLowerCase().includes(searchTermLower)) ||
      (employee.cnic && employee.cnic.toLowerCase().includes(searchTermLower))
    );
  });
  
  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle null or undefined values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle sort change
  const handleSort = (field: keyof Employee) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: keyof Employee) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} className="inline" />
    ) : (
      <ChevronDown size={16} className="inline" />
    );
  };
  
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };
  
  const handlePrintEmployee = (employee: Employee) => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Profile - ${employee.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .info-item { margin-bottom: 10px; }
              .label { font-weight: bold; color: #333; }
              .value { color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Employee Profile</h1>
              <h2>${employee.name}</h2>
              <p>Employee ID: ${employee.id}</p>
            </div>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="label">Department:</span>
                  <span class="value">${employee.department || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Father's Name:</span>
                  <span class="value">${employee.fatherName || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Date of Birth:</span>
                  <span class="value">${employee.dob || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">CNIC:</span>
                  <span class="value">${employee.cnic || 'N/A'}</span>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="label">Phone 1:</span>
                  <span class="value">${employee.phone1 || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Phone 2:</span>
                  <span class="value">${employee.phone2 || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Education:</span>
                  <span class="value">${employee.education || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="label">Shift:</span>
                  <span class="value">${employee.shift}</span>
                </div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <div class="info-item">
                <span class="label">Address:</span>
                <span class="value">${employee.address || 'N/A'}</span>
              </div>
            </div>
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const handleExportEmployee = (employee: Employee) => {
    const csvContent = [
      'Field,Value',
      `Employee ID,${employee.id}`,
      `Name,${employee.name}`,
      `Department,${employee.department || ''}`,
      `Father's Name,${employee.fatherName || ''}`,
      `Date of Birth,${employee.dob || ''}`,
      `CNIC,${employee.cnic || ''}`,
      `Address,${employee.address || ''}`,
      `Phone 1,${employee.phone1 || ''}`,
      `Phone 2,${employee.phone2 || ''}`,
      `Education,${employee.education || ''}`,
      `Shift,${employee.shift}`,
      `Weekends,${JSON.stringify(employee.weekends)}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employee-${employee.id}-${employee.name.replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <Card>
      <div className="mb-4">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="p-3 flex-1 outline-none"
          />
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Showing {sortedEmployees.length} of {employees.length} employees
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {renderSortIndicator('name')}
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('department')}
              >
                Department {renderSortIndicator('department')}
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('shift')}
              >
                Shift {renderSortIndicator('shift')}
              </th>
              <th 
                className="py-3 px-4 font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('phone1')}
              >
                Contact {renderSortIndicator('phone1')}
              </th>
              <th className="py-3 px-4 font-semibold text-gray-600 border-b text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => (
              <tr key={employee.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.id}</div>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {employee.department || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.shift === 'morning' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {employee.shift.charAt(0).toUpperCase() + employee.shift.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {employee.phone1 || 'N/A'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewEmployee(employee)}
                      icon={<Eye size={16} />}
                      aria-label={`View ${employee.name}`}
                      title="View Details"
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      icon={<Edit size={16} />}
                      aria-label={`Edit ${employee.name}`}
                      title="Edit Employee"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(employee)}
                      icon={<Trash2 size={16} className="text-red-500" />}
                      className="text-red-500"
                      aria-label={`Delete ${employee.name}`}
                      title="Delete Employee"
                    >
                      Delete
                    </Button>
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Download size={16} />}
                        aria-label={`Export ${employee.name}`}
                        title="Export/Print Options"
                      >
                        Export
                      </Button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handlePrintEmployee(employee)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Printer size={16} className="mr-2" />
                            Print Profile
                          </button>
                          <button
                            onClick={() => handleExportEmployee(employee)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Download size={16} className="mr-2" />
                            Export CSV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            
            {sortedEmployees.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No employees found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </Card>
      
      {/* Employee Modal */}
      {isModalOpen && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEmployee(null);
          }}
          onEdit={() => {
            setIsModalOpen(false);
            onEdit(selectedEmployee);
          }}
          onPrint={() => handlePrintEmployee(selectedEmployee)}
          onExport={() => handleExportEmployee(selectedEmployee)}
        />
      )}
    </>
  );
};