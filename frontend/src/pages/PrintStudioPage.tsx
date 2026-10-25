import React, { useState, useEffect } from 'react';
import { FileDropzone } from '../components/upload/FileDropzone';
import { PrintCustomizer } from '../components/upload/PrintCustomizer';
import { TrackingMarginPreview } from '../components/upload/TrackingMarginPreview';
import { DocumentItem, PrintSettings } from '../types';
import { documentsApi } from '../services/api';
import { FileText, CheckCircle2, ArrowRight, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrintStudioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDocuments();
  }, []);

  const loadUserDocuments = async () => {
    setLoading(true);
    const res = await documentsApi.getAll();
    if (res.success && res.data?.documents) {
      setDocuments(res.data.documents);
      if (res.data.documents.length > 0 && !selectedDoc) {
        setSelectedDoc(res.data.documents[0]);
      }
    }
    setLoading(false);
  };

  const handleDocumentUploaded = (newDoc: DocumentItem) => {
    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
  };

  const handleProceedToCheckout = (settings: PrintSettings, printMode: 'INSTANT' | 'SCHEDULED') => {
    if (!selectedDoc) return;
    // Store in session storage and navigate to Kiosk selection / checkout
    sessionStorage.setItem('qzero_active_doc', JSON.stringify(selectedDoc));
    sessionStorage.setItem('qzero_active_settings', JSON.stringify(settings));
    sessionStorage.setItem('qzero_active_print_mode', printMode);

    navigate('/kiosks?mode=select');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">Upload & Print Studio</h2>
          <p className="text-xs text-brand-mutedText mt-0.5">
            Configure automated page sizing, color rastering, and tamper-proof tracking margins.
          </p>
        </div>

        {selectedDoc && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-mutedText">Active File:</span>
            <span className="text-xs font-bold text-brand-purple bg-purple-100 px-3 py-1 rounded-full truncate max-w-[200px]">
              {selectedDoc.originalName}
            </span>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Document Selector (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <FileDropzone onDocumentUploaded={handleDocumentUploaded} />

          {/* Recently Uploaded Documents Vault */}
          <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-brand-dark text-sm">Your Stored Vault Files</h4>
              <span className="text-xs text-gray-400 font-mono">{documents.length} files</span>
            </div>

            {documents.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No documents in vault. Upload your first PDF above.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                          : 'border-brand-cardBorder hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[260px]">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center flex-shrink-0 font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-brand-dark truncate">{doc.originalName}</div>
                          <div className="text-[10px] text-gray-400">
                            {doc.pageCount} pages • {(doc.fileSize / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-brand-purple text-white flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tracking Margin Visual Sheet Simulation */}
          {selectedDoc && (
            <TrackingMarginPreview
              documentName={selectedDoc.originalName}
              pageCount={selectedDoc.pageCount}
              includeTrackingMargin={selectedDoc.printSettings?.includeTrackingMargin ?? true}
              colorMode={selectedDoc.printSettings?.colorMode as any || 'BW'}
              rollNumber={user?.rollNumber || '26BES7079'}
            />
          )}
        </div>

        {/* Right Column: Interactive Print Customizer (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <PrintCustomizer
              document={selectedDoc}
              onProceedToCheckout={handleProceedToCheckout}
            />
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-brand-cardBorder shadow-soft text-center text-gray-400 flex flex-col items-center justify-center h-full min-h-[400px]">
              <FileText className="w-12 h-12 text-purple-200 mb-3" />
              <h3 className="font-bold text-brand-dark text-base">Select or Upload a Document</h3>
              <p className="text-xs text-brand-mutedText mt-1 max-w-sm">
                Drop your PDF or lab report on the left panel to configure color, duplexing, and campus kiosk release.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
