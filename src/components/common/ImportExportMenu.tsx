import React, { useState } from 'react';
import { Button } from './Button';
import { useToast } from '../../context/ToastContext';
import { Download, Upload, FileText, Database, AlertTriangle, Info } from 'lucide-react';

interface ImportExportMenuProps {
  onExportCsv?: () => void;
  onImportCsv?: () => void;
  onExportJson?: () => void;
  onImportJson?: () => void;
  onExportSql?: () => void;
  onImportSql?: () => void;
  onPrint?: () => void;
  title: string;
  description: string;
  csvTemplate?: string;
  jsonTemplate?: string;
  sqlTemplate?: string;
  disabled?: boolean;
}

export const ImportExportMenu: React.FC<ImportExportMenuProps> = ({
  onExportCsv,
  onImportCsv,
  onExportJson,
  onImportJson,
  onExportSql,
  onImportSql,
  onPrint,
  title,
  description,
  csvTemplate,
  jsonTemplate,
  sqlTemplate,
  disabled = false,
}) => {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'csv' | 'json' | 'sql' | null>(null);
  const [importData, setImportData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'json' | 'sql') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const expectedExtensions = {
      csv: ['.csv'],
      json: ['.json'],
      sql: ['.sql']
    };

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!expectedExtensions[type].includes(fileExtension)) {
      addToast(`Please select a valid ${type.toUpperCase()} file`, 'error');
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

  const processImport = async (type: 'csv' | 'json' | 'sql') => {
    if (!importData.trim()) {
      addToast('No data to import', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      let success = false;

      if (type === 'csv' && onImportCsv) {
        await onImportCsv();
        success = true;
      } else if (type === 'json' && onImportJson) {
        await onImportJson();
        success = true;
      } else if (type === 'sql' && onImportSql) {
        await onImportSql();
        success = true;
      }

      if (success) {
        setActiveModal(null);
        setImportData('');
        setIsOpen(false);
      }
    } catch (error) {
      console.error(`Error importing ${type}:`, error);
      addToast(`Failed to import ${type.toUpperCase()} data`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTemplate = (type: 'csv' | 'json' | 'sql') => {
    switch (type) {
      case 'csv': return csvTemplate || '';
      case 'json': return jsonTemplate || '';
      case 'sql': return sqlTemplate || '';
      default: return '';
    }
  };

  const openImportModal = (type: 'csv' | 'json' | 'sql') => {
    setActiveModal(type);
    setImportData(getTemplate(type));
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        icon={<Database size={18} />}
        disabled={disabled}
      >
        Data Management
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>

          <div className="p-2">
            {/* Export Section */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">Export Data</h4>
              <div className="space-y-1">
                {onExportCsv && (
                  <button
                    onClick={() => {
                      onExportCsv();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <FileText size={16} className="mr-2 text-green-600" />
                    Export CSV
                  </button>
                )}
                {onExportJson && (
                  <button
                    onClick={() => {
                      onExportJson();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Database size={16} className="mr-2 text-blue-600" />
                    Export JSON
                  </button>
                )}
                {onExportSql && (
                  <button
                    onClick={() => {
                      onExportSql();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Database size={16} className="mr-2 text-purple-600" />
                    Export SQL
                  </button>
                )}
                {onPrint && (
                  <button
                    onClick={() => {
                      onPrint();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Download size={16} className="mr-2 text-gray-600" />
                    Print Report
                  </button>
                )}
              </div>
            </div>

            {/* Import Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">Import Data</h4>
              <div className="space-y-1">
                {onImportCsv && (
                  <button
                    onClick={() => openImportModal('csv')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Upload size={16} className="mr-2 text-green-600" />
                    Import CSV
                  </button>
                )}
                {onImportJson && (
                  <button
                    onClick={() => openImportModal('json')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Upload size={16} className="mr-2 text-blue-600" />
                    Import JSON
                  </button>
                )}
                {onImportSql && (
                  <button
                    onClick={() => openImportModal('sql')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Upload size={16} className="mr-2 text-purple-600" />
                    Import SQL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Import {activeModal.toUpperCase()} Data
                </h2>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setImportData('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {activeModal === 'json' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <Info className="text-blue-500 mr-2 mt-0.5" size={20} />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Version Compatibility</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          This import function supports both current format (v2.0) and legacy format (v1.0) JSON files.
                          The system will automatically detect and convert v1.0 data structures.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="text-amber-500 mr-2 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Important Warning</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Importing data will replace existing records. Make sure to export your current data first if you want to keep it.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload {activeModal.toUpperCase()} File
                  </label>
                  <input
                    type="file"
                    accept={`.${activeModal}`}
                    onChange={(e) => handleFileUpload(e, activeModal)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select a {activeModal.toUpperCase()} file to import
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste {activeModal.toUpperCase()} Data
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    placeholder={`Paste your ${activeModal.toUpperCase()} data here...`}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveModal(null);
                      setImportData('');
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => processImport(activeModal)}
                    isLoading={isProcessing}
                    disabled={!importData.trim()}
                    icon={<Upload size={18} />}
                  >
                    {isProcessing ? 'Importing...' : `Import ${activeModal.toUpperCase()}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};