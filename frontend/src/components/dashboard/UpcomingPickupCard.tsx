import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrintOrder } from '../../types';

interface UpcomingPickupCardProps {
  order: PrintOrder | null;
}

export const UpcomingPickupCard: React.FC<UpcomingPickupCardProps> = ({ order }) => {
  const navigate = useNavigate();

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft flex flex-col items-center justify-center text-center h-full min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-brand-lavender text-brand-purple flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-brand-dark text-base">No Pending Pickups</h3>
        <p className="text-brand-mutedText text-xs mt-1 max-w-xs">
          You don't have any prints awaiting collection right now. Upload a document to get started!
        </p>
        <button
          onClick={() => navigate('/print-studio')}
          className="mt-4 px-4 py-2 rounded-xl bg-brand-lavender hover:bg-brand-purple text-brand-purple hover:text-white text-xs font-semibold transition-all"
        >
          Start New Print
        </button>
      </div>
    );
  }

  const isReady = order.status === 'READY_FOR_PICKUP';

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">
              Upcoming Pickup
            </span>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
              isReady
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-purple-100 text-brand-purple border border-purple-200'
            }`}
          >
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Content details */}
        <div className="flex items-start gap-4">
          {/* QR Code preview */}
          <div className="bg-brand-lavender p-2 rounded-2xl border border-purple-200 flex flex-col items-center flex-shrink-0">
            <QRCodeSVG value={order.trackingCode} size={64} fgColor="#17152F" />
            <span className="text-[9px] font-mono font-bold text-brand-purple mt-1 tracking-wider">
              {order.trackingCode}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-brand-dark text-sm sm:text-base truncate" title={order.document.originalName}>
              {order.document.originalName}
            </h3>

            <div className="mt-2 space-y-1.5 text-xs text-brand-mutedText">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-purple flex-shrink-0" />
                <span className="font-medium text-brand-dark">{order.kiosk.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-turquoise flex-shrink-0" />
                <span>
                  {order.pickupWindowStart
                    ? `Ready by ${new Date(order.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Estimated in 10 mins'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sealed Envelope & Removable margin security note */}
      <div className="mt-4 pt-3 border-t border-brand-lavender flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-purple" />
          <span>Sealed tamper-proof envelope</span>
        </div>

        <button
          onClick={() => navigate(`/orders/${order.trackingCode}`)}
          className="text-xs font-bold text-brand-purple hover:text-brand-deep flex items-center gap-1 hover:underline"
        >
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
