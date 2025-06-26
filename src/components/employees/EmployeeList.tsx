import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Employee } from '../../types/Employee';
import { Edit, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';

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
  
  return (
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
                      onClick={() => onEdit(employee)}
                      icon={<Edit size={16} />}
                      aria-label={`Edit ${employee.name}`}
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
                    >
                      Delete
                    </Button>
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
  );
};