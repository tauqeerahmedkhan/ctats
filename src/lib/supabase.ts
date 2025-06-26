import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          department: string | null;
          father_name: string | null;
          dob: string | null;
          cnic: string | null;
          address: string | null;
          phone1: string | null;
          phone2: string | null;
          education: string | null;
          shift: string;
          weekends: number[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          department?: string | null;
          father_name?: string | null;
          dob?: string | null;
          cnic?: string | null;
          address?: string | null;
          phone1?: string | null;
          phone2?: string | null;
          education?: string | null;
          shift?: string;
          weekends?: number[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          department?: string | null;
          father_name?: string | null;
          dob?: string | null;
          cnic?: string | null;
          address?: string | null;
          phone1?: string | null;
          phone2?: string | null;
          education?: string | null;
          shift?: string;
          weekends?: number[];
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: number;
          employee_id: string;
          date: string;
          present: boolean;
          time_in: string | null;
          time_out: string | null;
          shift: string;
          hours: number;
          overtime_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          employee_id: string;
          date: string;
          present?: boolean;
          time_in?: string | null;
          time_out?: string | null;
          shift?: string;
          hours?: number;
          overtime_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          employee_id?: string;
          date?: string;
          present?: boolean;
          time_in?: string | null;
          time_out?: string | null;
          shift?: string;
          hours?: number;
          overtime_hours?: number;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: number;
          key: string;
          value: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          key: string;
          value: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          key?: string;
          value?: any;
          updated_at?: string;
        };
      };
    };
  };
};