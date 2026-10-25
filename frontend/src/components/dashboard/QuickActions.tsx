import React from 'react';
import { UploadCloud, MapPin, Calendar, Package, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Upload Document',
      description: 'PDF, DOCX, or slides',
      icon: UploadCloud,
      color: 'bg-purple-100 text-brand-purple',
      hoverBorder: 'hover:border-brand-purple',
      link: '/print-studio',
    },
    {
      title: 'Locate a Kiosk',
      description: 'Campus live queue map',
      icon: MapPin,
      color: 'bg-teal-100 text-teal-700',
      hoverBorder: 'hover:border-brand-turquoise',
      link: '/kiosks',
    },
    {
      title: 'Book a Slot',
      description: 'Pre-order pickup time',
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-700',
      hoverBorder: 'hover:border-indigo-400',
      link: '/calendar',
    },
    {
      title: 'View Orders',
      description: 'Live tracking & history',
      icon: Package,
      color: 'bg-amber-100 text-amber-700',
      hoverBorder: 'hover:border-amber-400',
      link: '/orders',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-brand-dark text-base">Quick Actions</h3>
        <span className="text-xs text-brand-mutedText">Frequently used operations</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => navigate(act.link)}
              className={`p-4 rounded-2xl border border-brand-cardBorder ${act.hoverBorder} hover:shadow-soft transition-all text-left group flex flex-col justify-between bg-gradient-to-b from-white to-[#FAF9FF]`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${act.color} flex items-center justify-center font-bold`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-brand-purple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="mt-4">
                <div className="font-bold text-sm text-brand-dark group-hover:text-brand-purple transition-colors">
                  {act.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 truncate">{act.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
