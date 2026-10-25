import React from 'react';
import { Scissors, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface TrackingMarginProps {
  documentName: string;
  pageCount: number;
  includeTrackingMargin: boolean;
  colorMode: 'BW' | 'COLOR';
  rollNumber?: string | null;
}

export const TrackingMarginPreview: React.FC<TrackingMarginProps> = ({
  documentName,
  pageCount,
  includeTrackingMargin,
  colorMode,
  rollNumber = '26BES7079',
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-purple" />
            <h4 className="font-bold text-brand-dark text-sm">Hardware Sheet & Margin Preview</h4>
          </div>
          <span className="text-[10px] font-mono bg-purple-100 text-brand-purple px-2 py-0.5 rounded font-bold">
            ISO A4 Standard
          </span>
        </div>

        {/* Paper Sheet Simulator */}
        <div className="relative mx-auto my-3 w-56 h-72 bg-white rounded-lg border-2 border-gray-200 shadow-md p-4 flex flex-col justify-between overflow-hidden">
          {/* Simulated content lines */}
          <div className="space-y-2 opacity-60">
            <div className="h-3 bg-gray-400 rounded w-3/4 mb-3" />
            <div className="h-2 bg-gray-300 rounded w-full" />
            <div className="h-2 bg-gray-300 rounded w-5/6" />
            <div className="h-2 bg-gray-300 rounded w-11/12" />
            <div className={`h-16 rounded-md border flex items-center justify-center text-[10px] ${
              colorMode === 'COLOR' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}>
              {colorMode === 'COLOR' ? 'Color Raster Content' : 'Monochrome Content'}
            </div>
            <div className="h-2 bg-gray-300 rounded w-4/5" />
            <div className="h-2 bg-gray-300 rounded w-full" />
          </div>

          {/* Tracking Margin Area */}
          {includeTrackingMargin ? (
            <div className="mt-2 pt-2 border-t-2 border-dashed border-brand-purple/70 bg-purple-50/80 -mx-4 -mb-4 px-3 py-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[8px] text-brand-purple font-mono font-bold">
                <span className="flex items-center gap-1">
                  <Scissors className="w-2.5 h-2.5" /> TEAR HERE
                </span>
                <span>Q-ZERO FLEET VERIFIED</span>
              </div>
              <div className="flex items-center justify-between text-[7px] text-brand-dark font-mono mt-0.5">
                <span>CODE: <strong>8XUI-Z123</strong></span>
                <span>P. 1/{pageCount}</span>
                <span>ROLL: {rollNumber}</span>
              </div>
            </div>
          ) : (
            <div className="text-[8px] text-gray-400 text-center py-1 border-t border-gray-100">
              No tracking margin attached
            </div>
          )}
        </div>

        {/* Warning / Explanation as mandated by manual */}
        {includeTrackingMargin ? (
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 flex items-start gap-2 mt-3">
            <AlertTriangle className="w-4 h-4 text-brand-warning flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Tracking Margin Warning:</strong>
              <div className="text-[10px] text-amber-700 mt-0.5">
                A 0.5-inch removable perforated strip is added at the bottom for secure kiosk envelope matching. Ensure your document text has at least 15mm bottom margin.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-brand-purple flex items-center gap-2 mt-3">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Full-bleed printing enabled without tear strip.</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-brand-lavender text-center text-[11px] text-brand-mutedText">
        Multi-pass cryptographic shred on kiosk tray exit
      </div>
    </div>
  );
};
