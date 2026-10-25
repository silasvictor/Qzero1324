import React, { useState, useEffect } from 'react';
import { ordersApi } from '../services/api';
import { PrintOrder } from '../types';
import {
  Package,
  Search,
  Filter,
  Eye,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';

export const MyOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<PrintOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, [activeTab, searchQuery]);

  const loadOrders = async () => {
    setLoading(true);
    const res = await ordersApi.getAll({
      status: activeTab === 'ALL' ? undefined : activeTab,
      search: searchQuery || undefined,
    });
    if (res.success && res.data?.orders) {
      setOrders(res.data.orders);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse';
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

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'QUEUED', label: 'Queued' },
    { key: 'PRINTING', label: 'Printing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { key: 'COLLECTED', label: 'Collected' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">My Print Orders</h2>
          <p className="text-xs text-brand-mutedText mt-0.5">
            Real-time telemetry tracking, envelope codes, and pickup receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/print-studio')}
          className="px-5 py-2.5 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft transition-all self-start sm:self-auto"
        >
          + New Print Job
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? 'bg-brand-purple text-white shadow-soft font-bold'
                  : 'bg-white text-gray-600 hover:bg-brand-lavender border border-brand-cardBorder'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, file or kiosk..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-brand-cardBorder rounded-xl text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-brand-cardBorder shadow-soft">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-brand-dark text-base">No Orders Found</h3>
          <p className="text-xs text-brand-mutedText mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No printing jobs matched "${searchQuery}". Try a different keyword.`
              : 'You have no orders in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-brand-cardBorder shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono font-black text-sm bg-purple-50 text-brand-purple px-2.5 py-1 rounded-xl border border-purple-200">
                    {order.trackingCode}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-sm text-brand-dark truncate" title={order.document.originalName}>
                      {order.document.originalName}
                    </h4>
                    <div className="text-[11px] text-gray-400">
                      {order.totalPages} pages • {order.printSettings.colorMode} • {order.printSettings.duplexMode}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-brand-mutedText bg-brand-bg p-3 rounded-2xl mb-4">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand-purple flex-shrink-0" />
                    <span className="truncate">{order.kiosk.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-turquoise flex-shrink-0" />
                    <span>
                      {order.pickupWindowStart
                        ? `Pickup: ${new Date(order.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Immediate walk-up dispatch'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-brand-dark font-semibold pt-1 border-t border-purple-100">
                    <span>Fee:</span>
                    <span>₹{order.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-lavender text-xs">
                <button
                  onClick={() => setSelectedReceiptOrder(order)}
                  className="py-2 px-3 rounded-xl bg-brand-lavender hover:bg-purple-200 text-brand-purple font-bold transition-all text-center"
                >
                  Receipt
                </button>

                <button
                  onClick={() => navigate(`/orders/${order.trackingCode}`)}
                  className="py-2 px-3 rounded-xl bg-brand-purple hover:bg-brand-deep text-white font-bold transition-all text-center flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReceiptOrder && (
        <OrderReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
