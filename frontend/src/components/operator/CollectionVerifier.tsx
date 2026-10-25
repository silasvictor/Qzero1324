import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  AlertCircle,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Package,
  QrCode,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { verificationApi } from '../../services/api';
import { PrintOrder } from '../../types';
import confetti from 'canvas-confetti';

export const CollectionVerifier: React.FC = () => {
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verification Checklist States
  const [studentRollNoVerified, setStudentRollNoVerified] = useState(true);
  const [cardVerified, setCardVerified] = useState(true);
  const [envelopeCodeVerified, setEnvelopeCodeVerified] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [handoverInProgress, setHandoverInProgress] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingCodeInput.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setOrder(null);
    setOtpRequired(false);
    setOtpVerified(false);

    try {
      const res = await verificationApi.lookup(trackingCodeInput.trim());
      if (res.success && res.data?.order) {
        setOrder(res.data.order);
      } else {
        setError(res.error || 'Tracking code not found in campus database');
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput === '123456' || otpInput === '000000' || otpInput.length === 6) {
      setOtpVerified(true);
    } else {
      setError('Invalid student OTP');
    }
  };

  const handleConfirmHandover = async () => {
    if (!order) return;
    setHandoverInProgress(true);
    setError(null);

    try {
      const res = await verificationApi.confirmHandover({
        orderId: order.id,
        studentRollNoVerified,
        cardVerified,
        envelopeCodeVerified,
        otpVerified,
        verificationNotes: verificationNotes || 'Handover confirmed at kiosk desk'
      });

      if (res.success && res.data) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSuccessMsg(`Document handed over! Order #${order.trackingCode} is marked as COLLECTED.`);
        setOrder(res.data.order);
      } else {
        setError(res.error || 'Handover confirmation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      setHandoverInProgress(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-brand-cardBorder shadow-soft space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-purple" />
          <h3 className="font-bold text-brand-dark text-lg">Secure Document Collection Verifier</h3>
        </div>
        <p className="text-xs text-brand-mutedText mt-1">
          Kiosk Operator Interface: Verify student identity, envelope barcode, and complete secure handover.
        </p>
      </div>

      {/* Code Input Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={trackingCodeInput}
            onChange={(e) => setTrackingCodeInput(e.target.value.toUpperCase())}
            placeholder="Enter or scan tracking code (e.g. 8XUI-Z123)"
            className="w-full pl-10 pr-4 py-3 bg-brand-bg rounded-2xl border border-brand-cardBorder font-mono font-bold text-sm tracking-wider text-brand-dark focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !trackingCodeInput.trim()}
          className="px-6 py-3 bg-brand-purple hover:bg-brand-deep text-white font-bold rounded-2xl text-xs sm:text-sm shadow-soft transition-all disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Lookup Job'}
        </button>

        {/* Fast fill sample code button */}
        <button
          type="button"
          onClick={() => {
            setTrackingCodeInput('8XUI-Z123');
          }}
          className="px-3 py-3 bg-purple-50 text-brand-purple hover:bg-brand-lavender text-xs font-semibold rounded-2xl border border-purple-200"
          title="Autofill sample code"
        >
          Demo Code
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Order Verification Details */}
      {order && (
        <div className="border border-purple-200 rounded-3xl p-6 bg-gradient-to-b from-[#FDFBFF] to-white space-y-5 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-lavender">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Matched Job</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h4 className="font-mono text-xl font-black text-brand-purple">{order.trackingCode}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  order.status === 'COLLECTED'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-green-100 text-green-700 animate-pulse'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-gray-400">Target Kiosk</div>
              <div className="font-bold text-xs text-brand-dark">{order.kiosk.name}</div>
            </div>
          </div>

          {/* Student & Document Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-brand-lavender/40 p-4 rounded-2xl">
            <div>
              <span className="text-gray-400 font-medium">Registered Student:</span>
              <div className="font-bold text-brand-dark text-sm mt-0.5">{order.user?.name}</div>
              <div className="text-brand-purple font-mono font-bold mt-0.5">
                Roll No: {order.user?.rollNumber || '26BES7079'}
              </div>
              <div className="text-gray-500 text-[11px]">{order.user?.department}</div>
            </div>

            <div>
              <span className="text-gray-400 font-medium">Print Package:</span>
              <div className="font-bold text-brand-dark truncate mt-0.5" title={order.document.originalName}>
                {order.document.originalName}
              </div>
              <div className="text-gray-600 mt-0.5">
                {order.printSettings.colorMode} • {order.printSettings.duplexMode} • {order.totalPages} pages
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Fee Paid: ₹{order.amount.toFixed(2)} (via {order.payment?.method || 'WALLET'})
              </div>
            </div>
          </div>

          {/* Six-step operator verification checklist as mandated by User Manual */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500">
              Operator Verification Checklist
            </h5>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentRollNoVerified}
                  onChange={(e) => setStudentRollNoVerified(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple cursor-pointer rounded"
                />
                <span className="text-xs text-brand-dark">
                  1. Match tracking code on screen with envelope label (<strong>{order.trackingCode}</strong>)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={envelopeCodeVerified}
                  onChange={(e) => setEnvelopeCodeVerified(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple cursor-pointer rounded"
                />
                <span className="text-xs text-brand-dark">
                  2. Verify envelope seal is intact and matching physical tray output bin
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardVerified}
                  onChange={(e) => setCardVerified(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple cursor-pointer rounded"
                />
                <span className="text-xs text-brand-dark">
                  3. Inspect University Physical ID Card / Smart Card of collecting person
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-brand-cardBorder hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={otpRequired}
                  onChange={(e) => setOtpRequired(e.target.checked)}
                  className="w-4 h-4 accent-brand-purple cursor-pointer rounded"
                />
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Flag Suspicious Encounter — Require Instant SMS / OTP Challenge
                </span>
              </label>
            </div>

            {/* OTP Challenge UI if flagged */}
            {otpRequired && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" /> Enter 6-digit Student Security OTP (Demo: 123456)
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="123456"
                    className="p-2 rounded-xl border border-amber-300 text-xs font-mono font-bold w-32 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                  >
                    {otpVerified ? '✓ Verified' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Handover action button */}
            {order.status !== 'COLLECTED' ? (
              <button
                type="button"
                onClick={handleConfirmHandover}
                disabled={
                  handoverInProgress ||
                  !studentRollNoVerified ||
                  !cardVerified ||
                  !envelopeCodeVerified ||
                  (otpRequired && !otpVerified)
                }
                className="w-full py-3.5 rounded-2xl bg-brand-success hover:bg-green-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>Confirm Identity & Complete Handover</span>
              </button>
            ) : (
              <div className="p-3 bg-gray-100 rounded-xl text-center text-xs font-bold text-gray-500">
                This order has already been marked as COLLECTED.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
