import React from 'react';
import { UploadCloud, MapPin, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const WelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 via-brand-lavender to-[#F5F0FF] p-6 lg:p-8 border border-purple-200/60 shadow-soft">
      {/* Decorative gradient blur spheres */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-40 -top-10 w-48 h-48 bg-brand-turquoise/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 text-brand-purple text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Smart Campus Printing Network</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-dark tracking-tight">
            Hello, <span className="text-brand-purple">{user?.name || 'Student'}</span>! 👋
          </h1>
          <p className="text-brand-mutedText text-sm sm:text-base mt-1.5 max-w-xl">
            Print smarter. Wait less. Send documents to any campus kiosk and collect without physical queues.
          </p>
        </div>

        {/* Action Buttons as specified */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/print-studio')}
            className="px-5 py-2.5 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => navigate('/kiosks')}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-brand-lavender text-brand-dark hover:text-brand-purple text-xs sm:text-sm font-semibold border border-purple-200 shadow-sm flex items-center gap-2 transition-all"
          >
            <MapPin className="w-4 h-4 text-brand-purple" />
            <span>Find Kiosk</span>
          </button>

          <button
            onClick={() => navigate('/calendar')}
            className="px-4 py-2.5 rounded-2xl bg-white/70 hover:bg-white text-brand-dark hover:text-brand-purple text-xs sm:text-sm font-semibold border border-purple-200 shadow-sm flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4 text-brand-purple" />
            <span>Book a Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
