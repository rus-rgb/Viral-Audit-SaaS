import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert("Please upload a video file.");
      }
    }
  }, [disabled, onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
        disabled 
          ? 'border-brand-gray bg-brand-gray/20 opacity-50 cursor-not-allowed' 
          : 'border-brand-muted hover:border-brand-accent hover:bg-brand-gray/30 cursor-pointer'
      }`}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        id="video-upload"
      />
      <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="text-xl font-bold text-brand-text mb-2">Upload Ad Video</span>
        <span className="text-sm text-brand-muted">Drag & drop or click to browse</span>
        <span className="text-xs text-brand-muted mt-4">Max size: 100MB</span>
      </label>
    </div>
  );
};

export default FileUpload;