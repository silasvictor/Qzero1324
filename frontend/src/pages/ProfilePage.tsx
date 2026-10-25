import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, CreditCard, Sparkles, Award, Mail, Phone, BookOpen, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Student Identity & Campus Card</h2>
        <p className="text-xs text-brand-mutedText mt-0.5">
          Verified academic credentials used for secure kiosk pickup authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Virtual University Smart Card (7 cols) */}
        <div className="md:col-span-7 bg-gradient-to-tr from-brand-dark via-[#26204E] to-brand-deep rounded-3xl p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-purple-800/40">
          <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-brand-turquoise text-lg border border-white/20">
                Q0
              </div>
              <div>
                <div className="text-xs font-bold tracking-wider text-purple-200 uppercase">
                  VIT-AP University • Amaravati Campus
                </div>
                <div className="text-sm font-semibold text-white">Smart Identity & Print Pass</div>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold bg-brand-turquoise/20 text-brand-turquoise border border-brand-turquoise/40 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>

          <div className="relative z-10 my-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-black text-white tracking-wide">{user?.name}</div>
              <div className="text-xs font-mono text-purple-300 font-bold mt-0.5">
                Roll No: {user?.rollNumber || '26BES7079'}
              </div>
              <div className="text-[11px] text-gray-300 mt-0.5">
                {user?.department || 'School of Computer Science & Engineering (SCOPE)'} • {user?.year || '3rd Year B.Tech'}
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-xl">
              <QRCodeSVG value={`QZERO-STUDENT-${user?.rollNumber || '26BES7079'}`} size={64} fgColor="#17152F" />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/15 text-[11px] text-gray-300 font-mono">
            <span>Card ID: UCID-{user?.rollNumber || '26BES7079'}</span>
            <span>Zero-Wait Telemetry Certified</span>
          </div>
        </div>

        {/* Account Details & Loyalty (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <h4 className="font-bold text-sm text-brand-dark pb-2 border-b border-brand-lavender">
            Academic Profile
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-gray-600">
              <Mail className="w-4 h-4 text-brand-purple flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600">
              <Phone className="w-4 h-4 text-brand-purple flex-shrink-0" />
              <span>{user?.phone || '+91 9848022338'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600">
              <BookOpen className="w-4 h-4 text-brand-purple flex-shrink-0" />
              <span>{user?.department || 'Computer Science & Engineering'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-dark flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-purple" />
                <span>Loyalty Tier: Silver</span>
              </span>
              <span className="font-bold text-brand-purple">{user?.loyaltyPoints || 180} pts</span>
            </div>
            <p className="text-[10px] text-brand-mutedText">
              Earn 2 points for every ₹1 spent on eco duplex prints. Redeemable for complimentary binding and rush orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
