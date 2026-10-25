import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PrintOrder } from '../../types';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface OrderReceiptModalProps {
  order: PrintOrder;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-cardBorder overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-deep to-brand-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              Q
            </div>
            <div>
              <div className="font-bold text-base leading-none">QueueZero (Q-Zero)</div>
              <div className="text-[10px] text-purple-200 mt-0.5">Campus Print Receipt & Token</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 text-xs font-sans">
          {/* Tracking Barcode & QR Box */}
          <div className="bg-brand-lavender/60 p-4 rounded-2xl border border-purple-200 text-center flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              Verification Token
            </span>
            <div className="my-2 bg-white p-2 rounded-xl shadow-sm border border-purple-100">
              <QRCodeSVG value={order.trackingCode} size={100} fgColor="#17152F" />
            </div>
            <div className="font-mono text-xl font-black text-brand-purple tracking-widest">
              {order.trackingCode}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">
              Present this token or QR to the kiosk operator for pickup.
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-2 py-2 border-y border-dashed border-gray-200 text-gray-600">
            <div className="flex justify-between">
              <span>Receipt Number:</span>
              <span className="font-mono font-bold text-brand-dark">
                {order.payment?.receiptNumber || `RCP-${order.trackingCode}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Document:</span>
              <span className="font-bold text-brand-dark truncate max-w-[200px]" title={order.document.originalName}>
                {order.document.originalName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Print Specs:</span>
              <span className="font-medium text-brand-dark">
                {order.printSettings.colorMode} • {order.printSettings.duplexMode} • {order.totalPages} pgs
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kiosk Station:</span>
              <span className="font-bold text-brand-purple">{order.kiosk.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Priority SLA:</span>
              <span className="font-medium text-brand-dark">
                {order.printMode === 'INSTANT' ? 'Mode A (Instant 10s SLA)' : 'Mode B (Scheduled Batch)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-brand-dark">Total Fee Paid:</span>
            <span className="font-extrabold text-lg text-brand-purple">
              ₹{order.amount.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl text-[10px] text-gray-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-purple flex-shrink-0" />
            <span>Removable tracking-code margin attached. Verified sealed envelope packaging.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-brand-dark hover:bg-gray-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-purple text-white hover:bg-brand-deep font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
