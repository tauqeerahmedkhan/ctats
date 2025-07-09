import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { FileUpload } from '../common/FileUpload';
import { addEmployee, updateEmployee } from '../../services/employeeService';
import { getSettings } from '../../services/settingsService';
import { Employee } from '../../types/Employee';
import { Upload, User, CreditCard, FileText } from 'lucide-react';

interface EmployeeFormProps {
  employee: Employee | null;
  onClose: (reloadData?: boolean) => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onClose,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initial form state
  const [formData, setFormData] = useState<Employee>({
    id: employee?.id || '',
    name: employee?.name || '',
    department: employee?.department || '',
    fatherName: employee?.fatherName || '',
    dob: employee?.dob || '',
    cnic: employee?.cnic || '',
    address: employee?.address || '',
    phone1: employee?.phone1 || '',
    phone2: employee?.phone2 || '',
    education: employee?.education || '',
    shift: employee?.shift || 'morning',
    weekends: employee?.weekends || [0, 6],
  });
  
  const [files, setFiles] = useState({
    profilePic: null as File | null,
    cnicFront: null as File | null,
    cnicBack: null as File | null,
    documents: [] as File[]
  });
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle weekend checkbox change
  const handleWeekendChange = (day: number) => {
    setFormData((prev) => {
      const newWeekends = prev.weekends.includes(day)
        ? prev.weekends.filter((d) => d !== day)
        : [...prev.weekends, day];
      
      return { ...prev, weekends: newWeekends };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      addToast('Employee name is required', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let success;
      
      if (employee) {
        // Update existing employee
        success = await updateEmployee(formData);
        if (success) {
          addToast(`Employee ${formData.name} updated successfully`, 'success');
        }
      } else {
        // Add new employee
        success = await addEmployee(formData);
        if (success) {
          addToast(`Employee ${formData.name} added successfully`, 'success');
        }
      }
      
      if (success) {
        onClose(true); // Close and reload data
      } else {
        addToast('Failed to save employee', 'error');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      addToast('An error occurred while saving the employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Upload className="mr-2" size={20} />
          Documents & Photos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline mr-1" size={16} />
              Profile Picture
            </label>
            <FileUpload
              accept="image/*"
              onFileSelect={(file) => setFiles(prev => ({ ...prev, profilePic: file }))}
              selectedFile={files.profilePic}
              placeholder="Upload employee photo"
            />
          </div>
          
          {/* CNIC Front */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline mr-1" size={16} />
              CNIC Front
            </label>
            <FileUpload
              accept="image/*"
              onFileSelect={(file) => setFiles(prev => ({ ...prev, cnicFront: file }))}
              selectedFile={files.cnicFront}
              placeholder="Upload CNIC front"
            />
          </div>
          
          {/* CNIC Back */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline mr-1" size={16} />
              CNIC Back
            </label>
            <FileUpload
              accept="image/*"
              onFileSelect={(file) => setFiles(prev => ({ ...prev, cnicBack: file }))}
              selectedFile={files.cnicBack}
              placeholder="Upload CNIC back"
            />
          </div>
        </div>
        
        {/* Additional Documents */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline mr-1" size={16} />
            Additional Documents
          </label>
          <FileUpload
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
            onFileSelect={(file) => setFiles(prev => ({ 
              ...prev, 
              documents: [...prev.documents, file] 
            }))}
            selectedFiles={files.documents}
            placeholder="Upload certificates, contracts, etc."
          />
        </div>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Employee Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">
            Father's Name
          </label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">
            CNIC
          </label>
          <input
            type="text"
            id="cnic"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            placeholder="12345-6789012-3"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="phone1" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Phone
          </label>
          <input
            type="text"
            id="phone1"
            name="phone1"
            value={formData.phone1}
            onChange={handleChange}
            placeholder="0300-1234567"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="phone2" className="block text-sm font-medium text-gray-700 mb-1">
            Secondary Phone
          </label>
          <input
            type="text"
            id="phone2"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            placeholder="0321-7654321"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
            Education
          </label>
          <input
            type="text"
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Bachelor's Degree"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          />
        </div>
        
        <div>
          <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
            Shift
          </label>
          <select
            id="shift"
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
          >
            <option value="morning">Morning</option>
            <option value="night">Night</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Configuration</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Weekends
        </label>
        <div className="flex flex-wrap gap-3">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
            <label key={day} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.weekends.includes(index)}
                onChange={() => handleWeekendChange(index)}
                className="h-4 w-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
              />
              <span className="ml-2 text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          These are the days when the employee is not required to work.
        </p>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={() => onClose(false)}
          type="button"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
          isLoading={isSubmitting}
        >
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
};