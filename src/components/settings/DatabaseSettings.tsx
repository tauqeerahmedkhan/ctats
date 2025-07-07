import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { ImportExportMenu } from '../common/ImportExportMenu';
import { exportDbToJson, importDbFromJson, exportDbToSql, importDbFromSql, generateSampleData } from '../../services/databaseService';
import { Database, RefreshCw, FileSpreadsheet } from 'lucide-react';

export const DatabaseSettings: React.FC = () => {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleExportJson = async () => {
    try {
      const data = await exportDbToJson();
      const jsonString = JSON.stringify(data, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-db-backup-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Database exported as JSON successfully', 'success');
    } catch (error) {
      console.error('Error exporting database:', error);
      addToast('Failed to export database', 'error');
    }
  };

  const handleExportSql = async () => {
    try {
      const sqlContent = await exportDbToSql();
      
      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-db-export-${new Date().toISOString().split('T')[0]}.sql`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Database exported as SQL successfully', 'success');
    } catch (error) {
      console.error('Error exporting SQL:', error);
      addToast('Failed to export SQL', 'error');
    }
  };

  const handleImportJson = async (jsonData: string) => {
    try {
      const result = await importDbFromJson(jsonData);
      
      if (result.success) {
        addToast(result.message, 'success');
        // Refresh the page to reload all data
        window.location.reload();
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error importing database:', error);
      addToast('Failed to import database', 'error');
    }
  };

  const handleImportSql = async (sqlData: string) => {
    try {
      const result = await importDbFromSql(sqlData);
      
      if (result.success) {
        addToast(result.message, 'success');
        // Refresh the page to reload all data
        window.location.reload();
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error importing SQL:', error);
      addToast('Failed to import SQL data', 'error');
    }
  };

  const handleGenerateSampleData = async () => {
    if (!window.confirm('This will generate sample employees and attendance records. Continue?')) {
      return;
    }

    setIsGenerating(true);
    try {
      const success = await generateSampleData();
      if (success) {
        addToast('Sample data generated successfully', 'success');
        // Refresh the page to show new data
        window.location.reload();
      } else {
        addToast('Failed to generate sample data', 'error');
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
      addToast('Failed to generate sample data', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getJsonTemplate = () => {
    return JSON.stringify({
      employees: [],
      attendance: [],
      settings: [],
      exportDate: new Date().toISOString(),
      version: "2.0"
    }, null, 2);
  };

  const getSqlTemplate = () => {
    return `-- Employee Attendance System Database Import
-- Paste your SQL INSERT statements here

INSERT INTO employees (id, name, department, shift, weekends) VALUES
('EMP0001', 'John Doe', 'IT', 'morning', '[0,6]');

INSERT INTO attendance (employee_id, date, present, time_in, time_out, shift, hours, overtime_hours) VALUES
('EMP0001', '2025-01-01', true, '09:00', '17:00', 'morning', 8, 0);

INSERT INTO settings (key, value) VALUES
('weekends', '[0,6]'),
('holidays', '[]');`;
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Database Management</h2>
      
      <p className="text-gray-600 mb-6">
        Manage your database backups and perform maintenance tasks.
        All data is securely stored in Supabase cloud database.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-3">
            <Database className="text-blue-500 mr-2" size={20} />
            <h3 className="font-medium text-gray-800">Data Management</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Import and export your complete database in multiple formats including legacy v1.0 support.
          </p>
          <ImportExportMenu
            title="Complete Database Management"
            description="Full database backup and restore with v1.0 compatibility"
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onExportSql={handleExportSql}
            onImportSql={handleImportSql}
            jsonTemplate={getJsonTemplate()}
            sqlTemplate={getSqlTemplate()}
          />
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-3">
            <FileSpreadsheet className="text-indigo-500 mr-2" size={20} />
            <h3 className="font-medium text-gray-800">Sample Data</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Generate sample employees and attendance records for testing.
          </p>
          <Button
            variant="outline"
            onClick={handleGenerateSampleData}
            icon={<RefreshCw size={18} />}
            fullWidth
            isLoading={isGenerating}
          >
            Generate Sample Data
          </Button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800 mb-2">About Supabase Storage & Legacy Support</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            This application uses Supabase as the database backend, providing secure cloud storage
            with real-time capabilities. Your data is automatically backed up and synchronized
            across all your devices.
          </p>
          <p>
            <strong>Legacy v1.0 Support:</strong> The import function automatically detects and converts
            data from the previous localStorage-based version (v1.0) to the new Supabase format.
            Simply import your old JSON backup and the system will handle the migration.
          </p>
          <p>
            Regular exports are recommended for additional security and data portability.
          </p>
        </div>
      </div>
    </div>
  );
};