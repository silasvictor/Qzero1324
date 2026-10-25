import React from 'react';
import { OrderStatus } from '../../types';
import { Check, Clock, Printer, PackageCheck, Box, UserCheck, AlertCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps: { key: OrderStatus; label: string; icon: any; desc: string }[] = [
    { key: 'PENDING_PAYMENT', label: 'Payment', icon: Clock, desc: 'Awaiting fee settlement' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: Check, desc: 'AES-256 payload locked' },
    { key: 'QUEUED', label: 'Queued', icon: Clock, desc: 'Positioned via SJF formula' },
    { key: 'PRINTING', label: 'Printing', icon: Printer, desc: 'Hardware engine active' },
    { key: 'PACKING', label: 'Packing', icon: Box, desc: 'Sealed with margin barcode' },
    { key: 'READY_FOR_PICKUP', label: 'Ready', icon: PackageCheck, desc: 'Awaiting student ID verification' },
    { key: 'COLLECTED', label: 'Collected', icon: UserCheck, desc: 'Secure handover complete' },
  ];

  if (status === 'CANCELLED' || status === 'FAILED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <strong className="font-bold">Order {status}</strong>
          <div>This print job was terminated. Any deducted wallet credits have been auto-refunded.</div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Track Line */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0">
          <div
            className="h-full bg-brand-purple transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step Circles */}
        <div className="flex items-center justify-between relative z-10">
          {steps.map((step, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-brand-purple text-white shadow-soft'
                      : isCurrent
                      ? 'bg-brand-deep text-white ring-4 ring-purple-200 shadow-glow animate-pulse'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="mt-2">
                  <div
                    className={`text-[11px] font-bold ${
                      isCurrent ? 'text-brand-purple' : isDone ? 'text-brand-dark' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[9px] text-gray-400 hidden sm:block max-w-[80px]">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
