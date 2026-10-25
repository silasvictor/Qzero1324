import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { PrintOrder } from '../types';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  FileText,
  MapPin,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  HelpCircle,
  Scissors
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (trackingCode) {
      loadOrderDetails();
      const interval = setInterval(loadOrderDetails, 8000); // Live polling
      return () => clearInterval(interval);
    }
  }, [trackingCode]);

  const loadOrderDetails = async () => {
    if (!trackingCode) return;
    const res = await ordersApi.getByIdOrCode(trackingCode);
    if (res.success && res.data?.order) {
      setOrder(res.data.order);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Package className="w-12 h-12 text-gray-300 mx-auto" />
        <h3 className="font-bold text-brand-dark text-lg">Order Not Found</h3>
        <p className="text-xs text-brand-mutedText">
          Could not locate tracking code "{trackingCode}". Please check the code and try again.
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="px-5 py-2.5 bg-brand-purple text-white text-xs font-bold rounded-2xl"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isReady = order.status === 'READY_FOR_PICKUP';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-purple transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>

        <button
          onClick={() => setShowReceipt(true)}
          className="px-4 py-2 rounded-xl bg-brand-lavender hover:bg-purple-200 text-brand-purple font-bold text-xs transition-all"
        >
          View Receipt
        </button>
      </div>

      {/* Main Status & Tracking Banner */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-brand-cardBorder shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-lavender">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tracking Code</span>
              <span className="text-[10px] font-mono bg-purple-100 text-brand-purple px-2 py-0.5 rounded font-bold">
                {order.printMode === 'INSTANT' ? 'MODE A: INSTANT 10s' : 'MODE B: SCHEDULED'}
              </span>
            </div>
            <h2 className="font-mono text-3xl font-black text-brand-purple tracking-widest mt-1">
              {order.trackingCode}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Current Status</div>
              <div className="font-extrabold text-sm text-brand-dark mt-0.5">
                {order.status.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="bg-brand-lavender p-2 rounded-2xl border border-purple-200">
              <QRCodeSVG value={order.trackingCode} size={64} fgColor="#17152F" />
            </div>
          </div>
        </div>

        {/* Visual Step-by-Step Timeline */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
            Live Queue & Spool Timeline
          </h4>
          <OrderTimeline status={order.status} />
        </div>

        {/* Ready Notification Callout */}
        {isReady && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-xs text-green-800">Your Print Is Ready For Collection!</strong>
              <p className="text-[11px] text-green-700 mt-0.5">
                Visit <strong>{order.kiosk.name}</strong>. Present your university ID card and show your tracking code <strong>{order.trackingCode}</strong> to collect your sealed envelope.
              </p>
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Document & Config */}
          <div className="p-4 bg-brand-bg rounded-2xl border border-brand-cardBorder space-y-2 text-xs">
            <div className="font-bold text-brand-dark flex items-center gap-1.5 pb-2 border-b border-purple-100">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span>Document Specifications</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">File Name:</span>
              <span className="font-bold text-brand-dark truncate max-w-[180px]" title={order.document.originalName}>
                {order.document.originalName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Page Count:</span>
              <span>{order.document.pageCount} pages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Color Palette:</span>
              <span className="font-semibold text-brand-purple">{order.printSettings.colorMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duplex Mode:</span>
              <span>{order.printSettings.duplexMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Copies:</span>
              <span>{order.printSettings.copies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Paper Faces:</span>
              <span className="font-bold">{order.totalPages}</span>
            </div>
          </div>

          {/* Kiosk & Collection */}
          <div className="p-4 bg-brand-bg rounded-2xl border border-brand-cardBorder space-y-2 text-xs">
            <div className="font-bold text-brand-dark flex items-center gap-1.5 pb-2 border-b border-purple-100">
              <MapPin className="w-4 h-4 text-brand-purple" />
              <span>Kiosk Station Telemetry</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kiosk Station:</span>
              <span className="font-bold text-brand-dark">{order.kiosk.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span className="text-gray-700 truncate max-w-[180px]">{order.kiosk.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Print Engine Speed:</span>
              <span>{order.kiosk.ppmSpeed} PPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup Slot:</span>
              <span className="font-semibold">
                {order.pickupWindowStart
                  ? new Date(order.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Immediate'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid:</span>
              <span className="font-extrabold text-brand-purple">₹{order.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking Margin:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Perforated Strip Active
              </span>
            </div>
          </div>
        </div>

        {/* Verification Record if Collected */}
        {order.verificationRecord && (
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs space-y-1.5">
            <div className="font-bold text-brand-purple flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Operator Handover Verification Audit Record</span>
            </div>
            <div className="text-gray-600">
              Verified by Operator at {new Date(order.verificationRecord.verifiedAt).toLocaleString()}.
            </div>
            <div className="text-gray-500 italic">
              Notes: "{order.verificationRecord.verificationNotes || 'Verified student ID card and envelope code match.'}"
            </div>
          </div>
        )}
      </div>

      {showReceipt && (
        <OrderReceiptModal
          order={order}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
