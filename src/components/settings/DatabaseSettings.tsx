import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { exportDbToJson, importDbFromJson, exportDbToSql, importDbFromSql, generateSampleData } from '../../services/databaseService';
import { Database, Download, Upload, RefreshCw, AlertTriangle, FileSpreadsheet, FileText, Code } from 'lucide-react';

export const DatabaseSettings: React.FC = () => {
  const { addToast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSqlImportModalOpen, setIsSqlImportModalOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [sqlImportData, setSqlImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSqlImporting, setIsSqlImporting] = useState(false);
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

  const handleImportDatabase = () => {
    setIsImportModalOpen(true);
    setImportData('');
  };

  const handleImportSql = () => {
    setIsSqlImportModalOpen(true);
    setSqlImportData('');
  };

  const processImportDatabase = async () => {
    if (!importData.trim()) {
      addToast('No data to import', 'warning');
      return;
    }

    setIsImporting(true);

    try {
      const result = await importDbFromJson(importData);
      
      if (result.success) {
        addToast(result.message, 'success');
        setIsImportModalOpen(false);
        setImportData('');
        // Refresh the page to reload all data
        window.location.reload();
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error importing database:', error);
      addToast('Failed to import database', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const processImportSql = async () => {
    if (!sqlImportData.trim()) {
      addToast('No SQL data to import', 'warning');
      return;
    }

    setIsSqlImporting(true);

    try {
      const result = await importDbFromSql(sqlImportData);
      
      if (result.success) {
        addToast(result.message, 'success');
        setIsSqlImportModalOpen(false);
        setSqlImportData('');
        // Refresh the page to reload all data
        window.location.reload();
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error importing SQL:', error);
      addToast('Failed to import SQL data', 'error');
    } finally {
      setIsSqlImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      addToast('Please select a valid JSON backup file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.onerror = () => {
      addToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  };

  const handleSqlFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.sql')) {
      addToast('Please select a valid SQL file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSqlImportData(content);
    };
    reader.onerror = () => {
      addToast('Failed to read SQL file', 'error');
    };
    reader.readAsText(file);
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
  
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Database Management</h2>
      
      <p className="text-gray-600 mb-6">
        Manage your database backups and perform maintenance tasks.
        All data is securely stored in Supabase cloud database.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-3">
            <Database className="text-blue-500 mr-2" size={20} />
            <h3 className="font-medium text-gray-800">Export JSON Backup</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Export your database to a JSON file for backup purposes.
          </p>
          <Button
            variant="primary"
            onClick={handleExportJson}
            icon={<Download size={18} />}
            fullWidth
          >
            Export JSON
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-3">
            <Code className="text-purple-500 mr-2" size={20} />
            <h3 className="font-medium text-gray-800">Export SQL Backup</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Export your database as SQL INSERT statements.
          </p>
          <Button
            variant="secondary"
            onClick={handleExportSql}
            icon={<Download size={18} />}
            fullWidth
          >
            Export SQL
          </Button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-3">
            <Upload className="text-green-500 mr-2" size={20} />
            <h3 className="font-medium text-gray-800">Import JSON Database</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Import a previously exported JSON backup file to restore your data.
          </p>
          <Button
            variant="outline"
            onClick={handleImportDatabase}
            icon={<Upload size={18} />}
            fullWidth
          >
            Import JSON
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center mb-3">
            <FileText className="text-orange-500 mr-2" size={20} />
            <h3 className="font-medium text-gray-800">Import SQL Database</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Import data from SQL INSERT statements.
          </p>
          <Button
            variant="outline"
            onClick={handleImportSql}
            icon={<Upload size={18} />}
            fullWidth
          >
            Import SQL
          </Button>
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
            icon={<FileSpreadsheet size={18} />}
            fullWidth
            isLoading={isGenerating}
          >
            Generate Sample Data
          </Button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800 mb-2">About Supabase Storage</h3>
        <p className="text-sm text-blue-700">
          This application uses Supabase as the database backend, providing secure cloud storage
          with real-time capabilities. Your data is automatically backed up and synchronized
          across all your devices. Regular exports are still recommended for additional security.
        </p>
      </div>

      {/* Import JSON Database Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Import JSON Database Backup
                </h2>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="text-amber-500 mr-2 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Important Warning</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Importing a database backup will completely replace all existing data including employees, 
                        attendance records, and settings. This action cannot be undone. Make sure to export your 
                        current data first if you want to keep it.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload JSON Backup File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select a JSON backup file exported from this application
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste JSON Data
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste your JSON backup data here..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportData('');
                    }}
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={processImportDatabase}
                    isLoading={isImporting}
                    disabled={!importData.trim()}
                    icon={<Upload size={18} />}
                  >
                    {isImporting ? 'Importing...' : 'Import Database'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import SQL Database Modal */}
      {isSqlImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Import SQL Database
                </h2>
                <button
                  onClick={() => setIsSqlImportModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="text-amber-500 mr-2 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Important Warning</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Importing SQL data will completely replace all existing data. This action cannot be undone. 
                        Make sure to export your current data first if you want to keep it.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload SQL File
                  </label>
                  <input
                    type="file"
                    accept=".sql"
                    onChange={handleSqlFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select an SQL file with INSERT statements
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste SQL Data
                  </label>
                  <textarea
                    value={sqlImportData}
                    onChange={(e) => setSqlImportData(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Paste your SQL INSERT statements here..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsSqlImportModalOpen(false);
                      setSqlImportData('');
                    }}
                    disabled={isSqlImporting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={processImportSql}
                    isLoading={isSqlImporting}
                    disabled={!sqlImportData.trim()}
                    icon={<Upload size={18} />}
                  >
                    {isSqlImporting ? 'Importing...' : 'Import SQL'}
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