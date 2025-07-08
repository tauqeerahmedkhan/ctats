import React, { useRef } from 'react';
import { Upload, X, File, Image } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  selectedFiles?: File[];
  placeholder?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*/*",
  multiple = false,
  onFileSelect,
  selectedFile,
  selectedFiles,
  placeholder = "Choose file",
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (multiple) {
        Array.from(files).forEach(file => onFileSelect(file));
      } else {
        onFileSelect(files[0]);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileToRemove: File) => {
    // This would need to be handled by parent component
    // For now, we'll just trigger the file input again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image size={16} className="text-blue-500" />;
    }
    return <File size={16} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
        <p className="text-sm text-gray-600">{placeholder}</p>
        <p className="text-xs text-gray-500 mt-1">
          {accept.includes('image') ? 'Images only' : 'All file types'}
        </p>
      </div>

      {/* Display selected single file */}
      {selectedFile && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
          <div className="flex items-center">
            {getFileIcon(selectedFile)}
            <span className="ml-2 text-sm text-gray-700 truncate">{selectedFile.name}</span>
            <span className="ml-2 text-xs text-gray-500">({formatFileSize(selectedFile.size)})</span>
          </div>
          <button
            type="button"
            onClick={() => removeFile(selectedFile)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Display selected multiple files */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="space-y-1">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
              <div className="flex items-center">
                {getFileIcon(file)}
                <span className="ml-2 text-sm text-gray-700 truncate">{file.name}</span>
                <span className="ml-2 text-xs text-gray-500">({formatFileSize(file.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};