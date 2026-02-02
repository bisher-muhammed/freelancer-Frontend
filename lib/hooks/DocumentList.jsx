// components/DocumentList.jsx
'use client';

import { 
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  Eye,
  Download,
  Trash2,
  Folder,
  Calendar,
  User
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

const DocumentList = ({ 
  documents, 
  folders,
  onPreview, 
  onDownload, 
  onDelete 
}) => {
  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (fileType?.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    } else if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    } else if (fileType?.includes('text')) {
      return <FileText className="w-5 h-5 text-gray-500" />;
    } else if (fileType?.includes('code') || fileType?.includes('javascript')) {
      return <FileCode className="w-5 h-5 text-purple-500" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFolderName = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-3">
      {documents.length > 0 ? (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {getFileIcon(doc.mime_type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.original_name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {doc.uploaded_by_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(doc.created_at)}
                    </span>
                    {getFolderName(doc.folder) && (
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {getFolderName(doc.folder)}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <button
                  onClick={() => onPreview(doc)}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDownload(doc.id, doc.original_name)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-medium text-gray-600 mb-2">No documents uploaded yet</h4>
          <p className="text-gray-500 text-sm mb-4">
            Upload project files, contracts, or other documents related to this contract
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentList;