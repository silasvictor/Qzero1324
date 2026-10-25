import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { documentsApi } from '../../services/api';
import { DocumentItem } from '../../types';

interface FileDropzoneProps {
  onDocumentUploaded: (doc: DocumentItem) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onDocumentUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError('Please upload a PDF, DOCX, or image file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit');
      return;
    }

    setUploading(true);
    setProgress(30);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(60);
      const res = await documentsApi.upload(formData);
      setProgress(100);

      if (res.success && res.data?.document) {
        onDocumentUploaded(res.data.document);
      } else {
        setError(res.error || 'Failed to upload document');
      }
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-purple bg-purple-50/70 scale-[1.01]'
            : 'border-purple-200 hover:border-brand-purple hover:bg-brand-lavender/30 bg-white'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-deep to-brand-purple text-white flex items-center justify-center shadow-soft mb-4">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="font-bold text-brand-dark text-lg sm:text-xl">
            {uploading ? 'Analyzing Document & Pages...' : 'Drop your document here, or browse'}
          </h3>
          <p className="text-brand-mutedText text-xs sm:text-sm mt-1 max-w-sm">
            Supports PDF, DOCX, and high-resolution slides up to 50MB with instant page parsing.
          </p>

          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-brand-purple text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Page Counting & Color Detector</span>
          </div>

          {uploading && (
            <div className="w-full max-w-xs mt-6">
              <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[11px] font-semibold text-brand-purple mt-1.5">
                Ingesting to AES-256 spool vault ({progress}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
