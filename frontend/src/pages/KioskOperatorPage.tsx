import React, { useState, useEffect } from 'react';
import { CollectionVerifier } from '../components/operator/CollectionVerifier';
import { adminApi, kiosksApi } from '../services/api';
import { Kiosk, PrintOrder } from '../types';
import { Cpu, Printer, ShieldCheck, MapPin, Clock, RefreshCw } from 'lucide-react';

export const KioskOperatorPage: React.FC = () => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [queue, setQueue] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperatorHub();
  }, []);

  const loadOperatorHub = async () => {
    setLoading(true);
    const [kRes, qRes] = await Promise.all([
      kiosksApi.getAll(),
      adminApi.getQueue(),
    ]);

    if (kRes.success && kRes.data?.kiosks) {
      setKiosks(kRes.data.kiosks);
      if (kRes.data.kiosks.length > 0 && !selectedKiosk) {
        setSelectedKiosk(kRes.data.kiosks[0]);
      }
    }

    if (qRes.success && qRes.data?.queue) {
      setQueue(qRes.data.queue);
    }

    setLoading(false);
  };

  const currentKioskJobs = selectedKiosk
    ? queue.filter((q) => q.kioskId === selectedKiosk.id)
    : queue;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Kiosk Hardware Handover Console</span>
          </div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">Kiosk Operator Terminal</h2>
          <p className="text-xs text-brand-mutedText">
            Verify student ID cards, scan sealed envelope tracking tokens, and confirm handover.
          </p>
        </div>

        {/* Kiosk Station Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Active Station:</span>
          <select
            value={selectedKiosk?.id || ''}
            onChange={(e) => {
              const k = kiosks.find((x) => x.id === e.target.value);
              if (k) setSelectedKiosk(k);
            }}
            className="p-2 rounded-xl border border-brand-cardBorder bg-white font-bold text-xs text-brand-purple outline-none shadow-sm"
          >
            {kiosks.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} ({k.campusCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Component (7 cols) */}
        <div className="lg:col-span-7">
          <CollectionVerifier />
        </div>

        {/* Station Queue & Pickup Tray (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
            <div>
              <h4 className="font-bold text-sm text-brand-dark">
                Station Tray: {selectedKiosk?.name || 'Central Kiosk'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {currentKioskJobs.length} active print envelopes in station buffer
              </p>
            </div>

            <button
              onClick={loadOperatorHub}
              className="p-1.5 rounded-xl text-gray-400 hover:text-brand-purple hover:bg-brand-lavender"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {currentKioskJobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No active jobs at this station tray.
              </div>
            ) : (
              currentKioskJobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    job.status === 'READY_FOR_PICKUP'
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-brand-cardBorder bg-brand-bg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-brand-purple bg-white px-2 py-0.5 rounded border border-purple-100">
                      {job.trackingCode}
                    </span>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'READY_FOR_PICKUP'
                          ? 'bg-green-100 text-green-700 font-black'
                          : 'bg-purple-100 text-brand-purple'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="font-bold text-brand-dark truncate">{job.document.originalName}</div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                    <span>Student: {job.user?.name}</span>
                    <span className="font-mono">Roll: {job.user?.rollNumber || '26BES7079'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
