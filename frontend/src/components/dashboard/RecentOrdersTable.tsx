import React from 'react';
import { PrintOrder } from '../../types';
import { FileText, ArrowRight, Clock, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentOrdersTableProps {
  orders: PrintOrder[];
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PRINTING':
        return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      case 'PACKING':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'QUEUED':
        return 'bg-purple-100 text-brand-purple border-purple-200';
      case 'COLLECTED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'PENDING_PAYMENT':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-brand-dark text-base">My Print Orders</h3>
          <p className="text-xs text-brand-mutedText">Active and recently processed printing requests</p>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="text-xs font-semibold text-brand-purple hover:text-brand-deep flex items-center gap-1 hover:underline"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-400">
          No print orders yet. Start your first print!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-lavender text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">Document</th>
                <th className="pb-3 px-3">Tracking Code</th>
                <th className="pb-3 px-3">Settings</th>
                <th className="pb-3 px-3">Kiosk / Location</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-lavender/30 transition-colors">
                  {/* Document */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5 max-w-[220px]">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-brand-dark truncate" title={order.document.originalName}>
                          {order.document.originalName}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {order.totalPages} pages • ₹{order.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tracking Code */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-brand-purple bg-purple-50 px-2 py-1 rounded-md text-[11px] border border-purple-100">
                      {order.trackingCode}
                    </span>
                  </td>

                  {/* Settings */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {order.printSettings.colorMode}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {order.printSettings.duplexMode}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {order.printSettings.copies} {order.printSettings.copies > 1 ? 'copies' : 'copy'}
                      </span>
                    </div>
                  </td>

                  {/* Kiosk */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-gray-600 max-w-[160px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-purple flex-shrink-0" />
                      <span className="truncate">{order.kiosk.name}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/orders/${order.trackingCode}`)}
                      className="px-3 py-1.5 rounded-xl bg-brand-lavender hover:bg-brand-purple text-brand-purple hover:text-white font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
