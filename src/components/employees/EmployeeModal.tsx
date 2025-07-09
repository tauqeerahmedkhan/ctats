import React from 'react';
import { Button } from '../common/Button';
import { Employee } from '../../types/Employee';
import { 
  X, User, Building2, Phone, Mail, Calendar, MapPin, GraduationCap,
  Clock, Edit, Printer, Download, CreditCard, Users, FileText, 
  Image as ImageIcon, Paperclip
} from 'lucide-react';

interface EmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onExport: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  onClose,
  onEdit,
  onPrint,
  onExport,
}) => {
  const formatWeekends = (weekends: number[]) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekends.map(day => days[day]).join(', ') || 'None';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-600 to-navy-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-navy-100">Employee ID: {employee.id}</p>
                <p className="text-navy-200 text-sm">{employee.department || 'No Department'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Documents */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ImageIcon className="mr-2 text-purple-600" size={20} />
                Profile & Documents
              </h3>
              
              {/* Profile Picture Placeholder */}
              <div className="bg-gray-100 rounded-lg p-6 mb-4 text-center">
                <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <User className="text-gray-400" size={32} />
                </div>
                <p className="text-sm text-gray-600">Profile Picture</p>
                <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
              </div>

              {/* CNIC Documents */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="text-blue-600 mr-2" size={16} />
                      <span className="text-sm font-medium">CNIC Front</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-xs">
                      View
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="text-blue-600 mr-2" size={16} />
                      <span className="text-sm font-medium">CNIC Back</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-xs">
                      View
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="text-green-600 mr-2" size={16} />
                      <span className="text-sm font-medium">Certificates</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-xs">
                      View All
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">0 documents</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Paperclip className="text-orange-600 mr-2" size={16} />
                      <span className="text-sm font-medium">Contracts</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-xs">
                      Download
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">0 documents</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" size={20} />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Father's Name</p>
                    <p className="font-medium text-gray-800">{employee.fatherName || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-800">
                      {employee.dob ? new Date(employee.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">CNIC</p>
                    <p className="font-medium text-gray-800">{employee.cnic || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <GraduationCap className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="font-medium text-gray-800">{employee.education || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Work Information */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Building2 className="mr-2 text-green-600" size={20} />
                Contact & Work Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Primary Phone</p>
                    <p className="font-medium text-gray-800">{employee.phone1 || 'Not provided'}</p>
                  </div>
                </div>
                
                {employee.phone2 && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="text-gray-500 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Secondary Phone</p>
                      <p className="font-medium text-gray-800">{employee.phone2}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="text-gray-500 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Work Shift</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {employee.shift} Shift
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-gray-500 mr-3 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Weekend Days</p>
                    <p className="font-medium text-gray-800">{formatWeekends(employee.weekends)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          {employee.address && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="mr-2 text-red-600" size={20} />
                Address
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{employee.address}</p>
              </div>
            </div>
          )}

          {/* Employee Stats */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-blue-600 font-semibold">Account Created</div>
                <div className="text-blue-800 text-sm">
                  {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-green-600 font-semibold">Last Updated</div>
                <div className="text-green-800 text-sm">
                  {employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-purple-600 font-semibold">Status</div>
                <div className="text-purple-800 text-sm">Active Employee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={onPrint}
              icon={<Printer size={18} />}
            >
              Print Profile
            </Button>
            <Button
              variant="outline"
              onClick={onExport}
              icon={<Download size={18} />}
            >
              Export Data
            </Button>
            <Button
              variant="primary"
              onClick={onEdit}
              icon={<Edit size={18} />}
            >
              Edit Employee
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};