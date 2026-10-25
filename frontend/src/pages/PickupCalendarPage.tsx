import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { ordersApi, kiosksApi } from '../services/api';
import { PrintOrder, Kiosk } from '../types';
import { useNavigate } from 'react-router-dom';

export const PickupCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ordersRes, kiosksRes] = await Promise.all([
      ordersApi.getAll(),
      kiosksApi.getAll(),
    ]);

    if (ordersRes.success && ordersRes.data?.orders) {
      setOrders(ordersRes.data.orders);
    }
    if (kiosksRes.success && kiosksRes.data?.kiosks) {
      setKiosks(kiosksRes.data.kiosks);
    }
    setLoading(false);
  };

  // Next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const selectedDayOrders = orders.filter((o) => {
    if (!o.pickupWindowStart) return false;
    return isSameDay(new Date(o.pickupWindowStart), selectedDate);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Pickup Calendar</h2>
        <p className="text-xs text-brand-mutedText mt-0.5">
          Schedule and manage your document collection time slots across campus hubs.
        </p>
      </div>

      {/* Date Strip Selector */}
      <div className="bg-white rounded-3xl p-5 border border-brand-cardBorder shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-purple" />
            <h3 className="font-bold text-sm text-brand-dark">
              {selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <span className="text-xs font-semibold text-brand-purple bg-purple-50 px-3 py-1 rounded-full">
            7-Day Booking Horizon
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {days.map((d, i) => {
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());
            const count = orders.filter(
              (o) => o.pickupWindowStart && isSameDay(new Date(o.pickupWindowStart), d)
            ).length;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[85px] ${
                  isSelected
                    ? 'border-brand-purple bg-brand-purple text-white shadow-soft font-bold'
                    : 'border-brand-cardBorder bg-brand-bg hover:bg-brand-lavender text-brand-dark'
                }`}
              >
                <span className={`text-[11px] uppercase ${isSelected ? 'text-purple-200' : 'text-gray-400'}`}>
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className="text-lg font-black my-0.5">{d.getDate()}</span>
                {count > 0 ? (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white text-brand-purple' : 'bg-purple-100 text-brand-purple'
                    }`}
                  >
                    {count} {count === 1 ? 'job' : 'jobs'}
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-300">-</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Slots & Scheduled Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheduled Orders for Selected Date (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
            <h4 className="font-bold text-sm text-brand-dark">
              Pickups Scheduled on {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h4>
            <span className="text-xs bg-purple-100 text-brand-purple font-bold px-2 py-0.5 rounded-full">
              {selectedDayOrders.length} bookings
            </span>
          </div>

          {selectedDayOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              No print jobs scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.trackingCode}`)}
                  className="p-4 rounded-2xl border border-brand-cardBorder hover:border-brand-purple hover:bg-brand-lavender/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center font-bold font-mono text-xs">
                      Q0
                    </div>
                    <div>
                      <div className="font-bold text-xs text-brand-dark">{order.document.originalName}</div>
                      <div className="text-[11px] text-brand-mutedText flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-purple" />
                          {order.kiosk.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-brand-purple">
                          <Clock className="w-3 h-3" />
                          {order.pickupWindowStart
                            ? new Date(order.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Anytime'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-brand-purple bg-purple-50 px-2 py-1 rounded-lg">
                    {order.trackingCode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campus Kiosk Quick Availability (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <h4 className="font-bold text-sm text-brand-dark pb-3 border-b border-brand-lavender">
            Kiosk Capacity & Headroom
          </h4>

          <div className="space-y-3">
            {kiosks.map((k) => (
              <div key={k.id} className="p-3.5 rounded-2xl border border-brand-cardBorder bg-brand-bg flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-brand-dark">{k.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Speed: {k.ppmSpeed} PPM • 24/7 Terminal</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">
                    Open Slots Available
                  </span>
                  <div className="text-[10px] text-brand-purple font-semibold mt-1">
                    ~{k.queueDepth * 2}m queue wait
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
