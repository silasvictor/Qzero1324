import React, { useState, useEffect } from 'react';
import {
  Palette,
  FileSpreadsheet,
  Copy,
  Layers,
  Scissors,
  Bookmark,
  Zap,
  Calendar,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { DocumentItem, PrintSettings } from '../../types';
import { documentsApi } from '../../services/api';

interface PrintCustomizerProps {
  document: DocumentItem;
  onProceedToCheckout: (settings: PrintSettings, printMode: 'INSTANT' | 'SCHEDULED') => void;
}

export const PrintCustomizer: React.FC<PrintCustomizerProps> = ({
  document,
  onProceedToCheckout,
}) => {
  const [colorMode, setColorMode] = useState<'BW' | 'COLOR'>(document.isColorDetected ? 'COLOR' : 'BW');
  const [duplexMode, setDuplexMode] = useState<'SINGLE' | 'DOUBLE'>('DOUBLE');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [pageRange, setPageRange] = useState('ALL');
  const [customRange, setCustomRange] = useState('');
  const [copies, setCopies] = useState(1);
  const [includeTrackingMargin, setIncludeTrackingMargin] = useState(true);
  const [bindingOption, setBindingOption] = useState<'NONE' | 'CORNER_STAPLE' | 'SPIRAL'>('NONE');
  const [printMode, setPrintMode] = useState<'INSTANT' | 'SCHEDULED'>('SCHEDULED');

  const [priceData, setPriceData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Recalculate price whenever settings change
  useEffect(() => {
    updateAndRecalculate();
  }, [colorMode, duplexMode, paperSize, orientation, pageRange, customRange, copies, includeTrackingMargin, bindingOption, printMode]);

  const updateAndRecalculate = async () => {
    const finalPageRange = pageRange === 'CUSTOM' ? (customRange || 'ALL') : pageRange;

    const payload = {
      colorMode,
      duplexMode,
      paperSize,
      orientation,
      pageRange: finalPageRange,
      copies,
      includeTrackingMargin,
      bindingOption,
      printMode
    };

    const res = await documentsApi.updateSettings(document.id, payload);
    if (res.success && res.data) {
      setPriceData(res.data.pricing);
    }
  };

  const handleProceed = () => {
    const finalSettings: PrintSettings = {
      colorMode,
      duplexMode,
      paperSize,
      orientation,
      pageRange: pageRange === 'CUSTOM' ? customRange : pageRange,
      oddEven: 'ALL',
      copies,
      includeTrackingMargin,
      bindingOption,
      calculatedPrice: priceData?.totalAmount || 0,
    };

    onProceedToCheckout(finalSettings, printMode);
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-brand-cardBorder shadow-soft space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-brand-lavender">
        <div>
          <h3 className="font-bold text-brand-dark text-lg">Print Customization Studio</h3>
          <p className="text-xs text-brand-mutedText">
            Configure paper, ink telemetry, duplexing, and hardware release options.
          </p>
        </div>

        <div className="text-right">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Estimated Total</div>
          <div className="text-2xl font-black text-brand-purple">
            ₹{priceData ? priceData.totalAmount.toFixed(2) : '...'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Color Palette Mode */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-brand-purple" />
            <span>Color / Inks</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setColorMode('BW')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                colorMode === 'BW'
                  ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                  : 'border-brand-cardBorder hover:border-purple-200'
              }`}
            >
              <div className="font-bold text-xs text-brand-dark">Black & White</div>
              <div className="text-[11px] text-brand-mutedText mt-0.5">₹1.50 per page (Eco)</div>
            </button>

            <button
              type="button"
              onClick={() => setColorMode('COLOR')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                colorMode === 'COLOR'
                  ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                  : 'border-brand-cardBorder hover:border-purple-200'
              }`}
            >
              <div className="font-bold text-xs text-brand-dark flex items-center justify-between">
                <span>Full Color</span>
                <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">HD</span>
              </div>
              <div className="text-[11px] text-brand-mutedText mt-0.5">₹7.00 per page</div>
            </button>
          </div>
        </div>

        {/* 2. Sides / Duplexing */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-purple" />
            <span>Sides / Duplex</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDuplexMode('DOUBLE')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                duplexMode === 'DOUBLE'
                  ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                  : 'border-brand-cardBorder hover:border-purple-200'
              }`}
            >
              <div className="font-bold text-xs text-brand-dark flex items-center justify-between">
                <span>Double-Sided</span>
                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold">-15%</span>
              </div>
              <div className="text-[11px] text-brand-mutedText mt-0.5">Eco duplex discount</div>
            </button>

            <button
              type="button"
              onClick={() => setDuplexMode('SINGLE')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                duplexMode === 'SINGLE'
                  ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                  : 'border-brand-cardBorder hover:border-purple-200'
              }`}
            >
              <div className="font-bold text-xs text-brand-dark">Single-Sided</div>
              <div className="text-[11px] text-brand-mutedText mt-0.5">Standard single face</div>
            </button>
          </div>
        </div>

        {/* 3. Paper Size & Orientation */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-brand-purple" />
            <span>Paper Size & Orientation</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as any)}
              className="p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
            >
              <option value="A4">A4 (Standard 80 GSM)</option>
              <option value="A3">A3 (Poster / Ledger)</option>
            </select>

            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
            >
              <option value="PORTRAIT">Portrait</option>
              <option value="LANDSCAPE">Landscape</option>
            </select>
          </div>
        </div>

        {/* 4. Number of Copies */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">
            <Copy className="w-4 h-4 text-brand-purple" />
            <span>Number of Copies</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCopies(Math.max(1, copies - 1))}
              className="w-10 h-10 rounded-xl border border-brand-cardBorder bg-brand-bg hover:bg-brand-lavender text-brand-dark font-bold flex items-center justify-center transition-all text-sm"
            >
              -
            </button>
            <span className="w-12 text-center font-extrabold text-base text-brand-dark">{copies}</span>
            <button
              type="button"
              onClick={() => setCopies(copies + 1)}
              className="w-10 h-10 rounded-xl border border-brand-cardBorder bg-brand-bg hover:bg-brand-lavender text-brand-dark font-bold flex items-center justify-center transition-all text-sm"
            >
              +
            </button>
            <span className="text-xs text-brand-mutedText ml-2">
              Total {document.pageCount * copies} printed pages
            </span>
          </div>
        </div>

        {/* 5. Page Range Selector */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-2">Page Selection</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['ALL', 'ODD', 'CUSTOM'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPageRange(m)}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-medium transition-all ${
                  pageRange === m
                    ? 'border-brand-purple bg-purple-50 text-brand-purple font-bold'
                    : 'border-brand-cardBorder text-gray-600 hover:bg-gray-50'
                }`}
              >
                {m === 'ALL' ? 'All Pages' : m === 'ODD' ? 'Odd Pages Only' : 'Custom Range'}
              </button>
            ))}
          </div>

          {pageRange === 'CUSTOM' && (
            <input
              type="text"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
              placeholder="e.g. 1-5, 8, 11-14"
              className="w-full p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
            />
          )}
        </div>

        {/* 6. Binding Options */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-2 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-brand-purple" />
            <span>Collation & Binding</span>
          </label>
          <select
            value={bindingOption}
            onChange={(e) => setBindingOption(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
          >
            <option value="NONE">No Binding (Loose Collated Sheets)</option>
            <option value="CORNER_STAPLE">Corner Stapled (+₹5.00)</option>
            <option value="SPIRAL">Spiral Wire Binding (+₹25.00)</option>
          </select>
        </div>
      </div>

      {/* 7. Removable Tracking-Code Margin Toggle (Crucial from manual) */}
      <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-brand-purple flex items-center justify-center border border-purple-200">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-brand-dark">Include Removable Tracking-Code Margin</div>
            <div className="text-[11px] text-brand-mutedText">
              Prints perforated tear line with tracking code for sealed envelope collection.
            </div>
          </div>
        </div>

        <input
          type="checkbox"
          checked={includeTrackingMargin}
          onChange={(e) => setIncludeTrackingMargin(e.target.checked)}
          className="w-5 h-5 accent-brand-purple cursor-pointer rounded"
        />
      </div>

      {/* 8. Operational Mode: Instant vs Scheduled */}
      <div>
        <label className="block text-xs font-bold text-brand-dark mb-2">Priority Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPrintMode('SCHEDULED')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              printMode === 'SCHEDULED'
                ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                : 'border-brand-cardBorder hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-purple" />
              <div className="font-bold text-xs text-brand-dark">Mode B: Scheduled Pickup</div>
            </div>
            <div className="text-[11px] text-brand-mutedText mt-1">
              Select any free pickup time slot. No surge fee.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('INSTANT')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              printMode === 'INSTANT'
                ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                : 'border-brand-cardBorder hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <div className="font-bold text-xs text-brand-dark">Mode A: Instant / Urgent</div>
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">+₹15</span>
            </div>
            <div className="text-[11px] text-brand-mutedText mt-1">
              Jumps to top of queue. Ready in &lt;10s upon kiosk walk-up.
            </div>
          </button>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="pt-4 border-t border-brand-lavender flex items-center justify-between">
        <div className="text-xs text-brand-mutedText">
          Estimated print duration: ~{priceData?.estimatedPrintTimeSec || 20}s on hardware
        </div>

        <button
          onClick={handleProceed}
          className="px-6 py-3 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-sm shadow-soft hover:shadow-glow flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <span>Select Kiosk & Slot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
