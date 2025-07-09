import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Employee } from '../../types/Employee';
import { 
  User, Building2, Phone, Calendar, MapPin, GraduationCap, Clock,
  Edit, Printer, Download, CreditCard, Users
} from 'lucide-react';

interface EmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onExport: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee, onClose, onEdit, onPrint, onExport
}) => {
  const formatWeekends = (weekends: number[]) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekends.map(day => days[day]).join(', ') || 'None';
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      <Icon className="text-gray-500 mr-3" size={18} />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );

  const footer = (
    <div className="flex flex-wrap justify-end gap-3">
      <Button variant="outline" onClick={onPrint} icon={<Printer size={18} />}>Print</Button>
      <Button variant="outline" onClick={onExport} icon={<Download size={18} />}>Export</Button>
      <Button variant="primary" onClick={onEdit} icon={<Edit size={18} />}>Edit</Button>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={`${employee.name} - ${employee.id}`} size="lg" footer={footer}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 text-blue-600" size={20} />Personal Information
          </h3>
          <div className="space-y-4">
            <InfoItem icon={Users} label="Father's Name" value={employee.fatherName || 'Not provided'} />
            <InfoItem icon={Calendar} label="Date of Birth" value={employee.dob ? new Date(employee.dob).toLocaleDateString() : 'Not provided'} />
            <InfoItem icon={CreditCard} label="CNIC" value={employee.cnic || 'Not provided'} />
            <InfoItem icon={GraduationCap} label="Education" value={employee.education || 'Not provided'} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Building2 className="mr-2 text-green-600" size={20} />Work Details
          </h3>
          <div className="space-y-4">
            <InfoItem icon={Phone} label="Primary Phone" value={employee.phone1 || 'Not provided'} />
            {employee.phone2 && <InfoItem icon={Phone} label="Secondary Phone" value={employee.phone2} />}
            <InfoItem icon={Clock} label="Work Shift" value={`${employee.shift} Shift`} />
            <InfoItem icon={Calendar} label="Weekend Days" value={formatWeekends(employee.weekends)} />
          </div>
        </div>
      </div>

      {employee.address && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-red-600" size={20} />Address
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800">{employee.address}</p>
          </div>
        </div>
      )}
    </Modal>
  );
};