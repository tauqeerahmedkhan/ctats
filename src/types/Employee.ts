export interface Employee {
  id: string;
  name: string;
  department?: string;
  fatherName?: string;
  dob?: string;
  cnic?: string;
  address?: string;
  phone1?: string;
  phone2?: string;
  education?: string;
  shift: 'morning' | 'night';
  weekends: number[];
  createdAt?: string;
  updatedAt?: string;
}