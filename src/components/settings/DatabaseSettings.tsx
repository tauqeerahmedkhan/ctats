import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { ImportExportMenu } from '../common/ImportExportMenu';
import { exportDbToJson, importDbFromJson, exportDbToSql, importDbFromSql, generateSampleData, clearAllData } from '../../services/databaseService';
import { Database, RefreshCw, FileSpreadsheet, Trash2, AlertTriangle } from 'lucide-react';

export const DatabaseSettings: React.FC = () => {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
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

  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently delete ALL data including employees, attendance records, and settings. This action cannot be undone.\n\nAre you absolutely sure you want to continue?'
    );
    
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'FINAL WARNING: You are about to delete ALL data. Type "DELETE" in the next prompt to confirm.'
    );
    
    if (!doubleConfirmed) return;

    const userInput = window.prompt('Type "DELETE" to confirm database reset:');
    if (userInput !== 'DELETE') {
      addToast('Database reset cancelled - confirmation text did not match', 'info');
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearAllData();
      if (result.success) {
        addToast(result.message, 'success');
        // Refresh the page to reload all data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error clearing database:', error);
      addToast('Failed to clear database', 'error');
    } finally {
      setIsClearing(false);
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
-- Supports both v1.0 and v2.0 formats
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
            Import and export your complete database in multiple formats with v1.0 legacy support.
          </p>
          <ImportExportMenu
            title="Complete Database Management"
            description="Full database backup and restore with v1.0/v2.0 compatibility"
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
      
      {/* Database Reset Section */}
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-600 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-red-800 mb-2">Reset Database</h4>
              <p className="text-red-700 text-sm mb-4">
                Permanently delete all employees, attendance records, and custom settings. 
                This action cannot be undone and will restore default system settings.
              </p>
              <div className="text-xs text-red-600 space-y-1">
                <p>• All employee data will be lost</p>
                <p>• All attendance records will be deleted</p>
                <p>• Custom settings will be reset to defaults</p>
                <p>• This action requires multiple confirmations</p>
              </div>
            </div>
            <Button
              variant="danger"
              onClick={handleClearDatabase}
              icon={<Trash2 size={18} />}
              isLoading={isClearing}
              className="ml-4"
            >
              Reset Database
            </Button>
          </div>
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
            <strong>Enhanced Legacy Support:</strong> The import functions automatically detect and convert
            data from the previous localStorage-based version (v1.0) to the new Supabase format (v2.0).
            Both JSON and SQL imports support v1.0 format detection and conversion.
          </p>
          <p>
            <strong>SQL Import:</strong> Now supports importing SQL files from v1.0 exports with automatic
            format detection and conversion. Regular exports are recommended for data security.
          </p>
        </div>
      </div>
    </div>
  );
};