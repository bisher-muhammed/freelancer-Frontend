// components/FolderManager.jsx
'use client';

import { useState } from 'react';
import { Folder, FolderPlus, X } from 'lucide-react';

const FolderManager = ({ folders, documents, onCreateFolder, onFolderClick }) => {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name.');
      return;
    }
  
  

    setCreatingFolder(true);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    } catch (err) {
      console.error('Create folder error:', err);
      alert('Failed to create folder.');
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-700">Folders</h4>
        <button
          onClick={() => setShowNewFolder(true)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <FolderPlus className="w-4 h-4" />
          
          New Folder
        </button>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="mb-4 p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              disabled={creatingFolder}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <button
              onClick={handleCreateFolder}
              disabled={creatingFolder || !newFolderName.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
            >
              {creatingFolder ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName('');
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {folders.map((folder) => {
          const folderDocsCount = documents.filter(d => d.folder === folder.id).length;
          return (
            <button
              key={folder.id}
              onClick={() => onFolderClick(folder)}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {folderDocsCount} item{folderDocsCount !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
        {folders.length === 0 && (
          <div className="col-span-3 text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Folder className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="mb-2">No folders created yet</p>
            <p className="text-sm text-gray-400">
              Create folders to organize your documents
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderManager;