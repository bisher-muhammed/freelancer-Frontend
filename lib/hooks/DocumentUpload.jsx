// components/DocumentUpload.jsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText, FileSpreadsheet } from 'lucide-react';

const DocumentUpload = ({ 
  folders, 
  onUpload, 
  onClose,
  maxSizeMB = 10,
  allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.webp', '.csv', '.xlsx']
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    if (!file) return null;
    const type = file.type.toLowerCase();
    if (type.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    } else if (type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert(`File type not allowed. Please upload: ${allowedExtensions.join(', ')} files.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call parent upload handler
      await onUpload(selectedFile, selectedFolderId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setSelectedFolderId('');
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Upload Document</h3>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              uploading
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:border-indigo-300 hover:bg-gray-50'
            } ${
              selectedFile
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-gray-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept={allowedExtensions.join(',')}
              disabled={uploading}
            />
            <Upload className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-indigo-500' : 'text-gray-400'}`} />
            {selectedFile ? (
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  {getFileIcon(selectedFile)}
                  <p className="font-medium text-indigo-600 truncate">{selectedFile.name}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">Drop files here or click to upload</p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports {allowedExtensions.join(', ')} up to {maxSizeMB}MB
                </p>
              </div>
            )}
          </div>

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Folder (Optional)
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              disabled={uploading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">No folder (root)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;