// components/DocumentPreview.jsx
'use client';

import { 
  X, 
  Download, 
  Trash2, 
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  User,
  Calendar,
  Folder
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

const DocumentPreview = ({ 
  document: doc,
  onDownload,
  onDelete,
  onClose
}) => {
  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    } else if (fileType?.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    } else if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) {
      return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    } else if (fileType?.includes('code') || fileType?.includes('javascript')) {
      return <FileCode className="w-6 h-6 text-purple-500" />;
    } else {
      return <FileText className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      onDelete(doc.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(doc.mime_type)}
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{doc.original_name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {doc.uploaded_by_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(doc.created_at)}
                </span>
                {doc.file_size && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onDownload(doc.id, doc.original_name)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {doc.mime_type?.includes('image') ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <img
                src={doc.file_url}
                alt={doc.original_name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/300';
                }}
              />
            </div>
          ) : doc.mime_type?.includes('pdf') ? (
            <div className="h-full">
              <iframe
                src={`${doc.file_url}#view=fitH`}
                className="w-full h-full min-h-[500px] border-0 rounded-lg"
                title={doc.original_name}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h4 className="font-medium text-gray-600 mb-2">Preview not available</h4>
              <p className="text-gray-500 mb-6 max-w-md">
                This file type cannot be previewed in the browser. Please download it to view the contents.
              </p>
              <button
                onClick={() => onDownload(doc.id, doc.original_name)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download to View
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              File Type: <span className="font-medium">{doc.mime_type || 'Unknown'}</span>
            </div>
            <button
              onClick={handleDelete}
              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;