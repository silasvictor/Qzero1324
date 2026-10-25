import React, { useState, useEffect } from 'react';
import { CampusMap } from '../components/kiosk/CampusMap';
import { kiosksApi, ordersApi } from '../services/api';
import { Kiosk, PickupSlot } from '../types';
import {
  MapPin,
  Clock,
  Printer,
  Zap,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Loader2,
  BatteryCharging,
  Layers,
  Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const KioskLocatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSelectMode = searchParams.get('mode') === 'select';

  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    loadKiosks();
  }, []);

  const loadKiosks = async () => {
    setLoading(true);
    const res = await kiosksApi.getAll();
    if (res.success && res.data?.kiosks) {
      setKiosks(res.data.kiosks);
      if (res.data.kiosks.length > 0) {
        handleSelectKiosk(res.data.kiosks[0]);
      }
    }
    setLoading(false);
  };

  const handleSelectKiosk = async (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    setSlotsLoading(true);
    const res = await kiosksApi.getSlots(kiosk.id);
    if (res.success && res.data?.slots) {
      setSlots(res.data.slots);
      const available = res.data.slots.find((s: PickupSlot) => s.isAvailable);
      setSelectedSlot(available || null);
    }
    setSlotsLoading(false);
  };

  const handleProceedToCheckout = () => {
    if (!selectedKiosk) return;

    sessionStorage.setItem('qzero_active_kiosk', JSON.stringify(selectedKiosk));
    if (selectedSlot) {
      sessionStorage.setItem('qzero_active_slot', JSON.stringify(selectedSlot));
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-brand-purple text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Campus Fleet Telemetry</span>
          </div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">Campus Kiosk Locator</h2>
          <p className="text-xs text-brand-mutedText">
            Real-time status, paper and toner levels, queue workloads, and pickup slot bookings.
          </p>
        </div>

        {isSelectMode && selectedKiosk && (
          <button
            onClick={handleProceedToCheckout}
            className="px-6 py-3 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft hover:shadow-glow flex items-center gap-2 transition-all"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Grid: Leaflet Map + Kiosk List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <CampusMap
            kiosks={kiosks}
            selectedKioskId={selectedKiosk?.id}
            onSelectKiosk={handleSelectKiosk}
          />

          {/* Selected Kiosk Detailed Card */}
          {selectedKiosk && (
            <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-purple-100 text-brand-purple px-2 py-0.5 rounded">
                      {selectedKiosk.campusCode}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      Near CB
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-brand-dark mt-1">{selectedKiosk.name}</h3>
                  <div className="text-xs text-brand-mutedText flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-purple flex-shrink-0" />
                    <span>{selectedKiosk.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    {selectedKiosk.status}
                  </span>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">
                    Speed: {selectedKiosk.ppmSpeed} PPM
                  </div>
                </div>
              </div>

              {/* Telemetry meters */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Queue Depth</div>
                  <div className="text-lg font-black text-brand-purple mt-0.5">
                    {selectedKiosk.queueDepth} <span className="text-xs font-medium">jobs</span>
                  </div>
                </div>

                <div className="p-3 bg-green-50/70 rounded-2xl border border-green-100 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Paper Level</div>
                  <div className="text-lg font-black text-green-700 mt-0.5">
                    {selectedKiosk.paperLevelPercent}%
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Toner Level</div>
                  <div className="text-lg font-black text-indigo-700 mt-0.5">
                    {selectedKiosk.tonerLevelPercent}%
                  </div>
                </div>
              </div>

              {/* Pickup Time Slots */}
              <div className="pt-3 border-t border-brand-lavender">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-brand-dark">
                    <Calendar className="w-4 h-4 text-brand-purple" />
                    <span>Select Scheduled Collection Slot</span>
                  </div>
                  <span className="text-[11px] text-brand-mutedText">Today's Schedule</span>
                </div>

                {slotsLoading ? (
                  <div className="py-4 text-center text-xs text-gray-400">Loading slots...</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {slots.map((s) => {
                      const isPicked = selectedSlot?.id === s.id;
                      const timeStr = new Date(s.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <button
                          key={s.id}
                          disabled={!s.isAvailable}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isPicked
                              ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                              : s.isAvailable
                              ? 'bg-white hover:bg-brand-lavender text-brand-dark border-brand-cardBorder'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <div>{timeStr}</div>
                          <div className="text-[9px] opacity-80">
                            {s.isAvailable ? `${s.capacity - s.bookedCount} free` : 'Full'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Kiosk Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-brand-dark text-sm">All Campus Hubs ({kiosks.length})</h4>
            <span className="text-xs text-brand-mutedText">Tap to view live load</span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {kiosks.map((k) => {
              const isSelected = selectedKiosk?.id === k.id;
              return (
                <div
                  key={k.id}
                  onClick={() => handleSelectKiosk(k)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-brand-purple shadow-soft ring-2 ring-brand-purple/20'
                      : 'border-brand-cardBorder hover:border-purple-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-purple-100 text-brand-purple px-2 py-0.5 rounded">
                          {k.campusCode}
                        </span>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                          Near CB
                        </span>
                        <h4 className="font-bold text-sm text-brand-dark">{k.name}</h4>
                      </div>
                      <p className="text-xs text-brand-mutedText mt-1 line-clamp-1">{k.location}</p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        k.status === 'ONLINE'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-brand-lavender text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400">Wait Time</span>
                      <div className="font-bold text-brand-dark">~{k.queueDepth * 2} mins</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Paper</span>
                      <div className="font-bold text-green-600">{k.paperLevelPercent}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Active Queue</span>
                      <div className="font-bold text-brand-purple">{k.queueDepth} in line</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectKiosk(k);
                      if (isSelectMode) handleProceedToCheckout();
                    }}
                    className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-purple text-white shadow-soft'
                        : 'bg-brand-lavender hover:bg-brand-purple text-brand-purple hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSelectMode ? 'Use this Kiosk →' : 'Selected'}</span>
                      </>
                    ) : (
                      <span>Select Kiosk</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
