import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Scissors
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersApi, paymentsApi } from '../services/api';
import { DocumentItem, Kiosk, PickupSlot, PrintSettings, PrintOrder } from '../types';
import confetti from 'canvas-confetti';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [settings, setSettings] = useState<PrintSettings | null>(null);
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [slot, setSlot] = useState<PickupSlot | null>(null);
  const [printMode, setPrintMode] = useState<'INSTANT' | 'SCHEDULED'>('SCHEDULED');

  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'RAZORPAY_SANDBOX' | 'UPI_MOCK'>('WALLET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<PrintOrder | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    // Load state from session storage
    const rawDoc = sessionStorage.getItem('qzero_active_doc');
    const rawSettings = sessionStorage.getItem('qzero_active_settings');
    const rawKiosk = sessionStorage.getItem('qzero_active_kiosk');
    const rawSlot = sessionStorage.getItem('qzero_active_slot');
    const rawMode = sessionStorage.getItem('qzero_active_print_mode');

    if (rawDoc) setDocument(JSON.parse(rawDoc));
    if (rawSettings) setSettings(JSON.parse(rawSettings));
    if (rawKiosk) setKiosk(JSON.parse(rawKiosk));
    if (rawSlot) setSlot(JSON.parse(rawSlot));
    if (rawMode) setPrintMode(rawMode as any);
  }, []);

  const handleCompletePayment = async () => {
    if (!document || !kiosk) {
      setError('Missing document or kiosk information. Please start from the upload studio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create Order
      const createRes = await ordersApi.create({
        documentId: document.id,
        kioskId: kiosk.id,
        pickupSlotId: slot?.id || null,
        printMode
      });

      if (!createRes.success || !createRes.data?.order) {
        throw new Error(createRes.error || 'Failed to initiate order');
      }

      const newOrder = createRes.data.order;

      // Step 2: Settle Payment
      const payRes = await paymentsApi.pay({
        orderId: newOrder.id,
        method: paymentMethod
      });

      if (!payRes.success) {
        throw new Error(payRes.error || 'Payment failed');
      }

      // Step 3: Trigger celebration & refresh user wallet balance
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      await refreshProfile();
      setConfirmedOrder(payRes.data.order);

      // Clean session storage
      sessionStorage.removeItem('qzero_active_doc');
      sessionStorage.removeItem('qzero_active_settings');
      sessionStorage.removeItem('qzero_active_kiosk');
      sessionStorage.removeItem('qzero_active_slot');
    } catch (err: any) {
      setError(err.message || 'Payment transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully confirmed, render Celebration Screen
  if (confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-soft animate-in zoom-in-75">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-600">
            Payment Verified & Order Queued
          </span>
          <h2 className="text-3xl font-black text-brand-dark mt-1">Print Token Dispatched! 🎉</h2>
          <p className="text-sm text-brand-mutedText mt-1.5 max-w-md mx-auto">
            Your document has entered the QueueZero spool pipeline at <strong>{confirmedOrder.kiosk.name}</strong>.
          </p>
        </div>

        {/* Tracking Token Card */}
        <div className="p-6 bg-white rounded-3xl border border-brand-cardBorder shadow-soft max-w-sm mx-auto space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Unique Collection Tracking Code
          </div>
          <div className="font-mono text-3xl font-black text-brand-purple tracking-widest py-2 bg-purple-50 rounded-2xl border border-purple-100">
            {confirmedOrder.trackingCode}
          </div>
          <p className="text-xs text-gray-500">
            Show this 8-character code or present your Student ID at the kiosk counter for sealed pickup.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setShowReceipt(true)}
            className="px-6 py-3 rounded-2xl bg-brand-lavender hover:bg-purple-200 text-brand-purple font-bold text-xs sm:text-sm transition-all"
          >
            View & Print Receipt
          </button>

          <button
            onClick={() => navigate(`/orders/${confirmedOrder.trackingCode}`)}
            className="px-6 py-3 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft transition-all"
          >
            Track Live Timeline →
          </button>
        </div>

        {showReceipt && (
          <OrderReceiptModal
            order={confirmedOrder}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
    );
  }

  // Pre-payment Review Screen
  const subtotal = settings?.calculatedPrice || 19.50;
  const surgeFee = printMode === 'INSTANT' ? 15.0 : 0.0;
  const totalAmount = +(subtotal + surgeFee).toFixed(2);
  const walletBalance = user?.balance ?? 0;
  const isWalletSufficient = walletBalance >= totalAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Review & Pay</h2>
        <p className="text-xs text-brand-mutedText mt-0.5">
          Confirm printing parameters, chosen campus kiosk, and payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Order Breakdown (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Document & Print Specs Card */}
          <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
            <h4 className="font-bold text-brand-dark text-sm border-b border-brand-lavender pb-2">
              Print Job Summary
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="truncate">
                <div className="font-bold text-sm text-brand-dark truncate">
                  {document?.originalName || 'AI_Systems_Lab_Manual_Final.pdf'}
                </div>
                <div className="text-xs text-brand-mutedText">
                  {document?.pageCount || 14} pages • {settings?.copies || 1} copies •{' '}
                  {settings?.colorMode === 'COLOR' ? 'Full Color' : 'Black & White'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-brand-bg p-3.5 rounded-2xl text-gray-600">
              <div>
                <span className="text-[10px] text-gray-400 block">Duplex Mode</span>
                <span className="font-semibold text-brand-dark">{settings?.duplexMode || 'DOUBLE'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Paper Size</span>
                <span className="font-semibold text-brand-dark">{settings?.paperSize || 'A4'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Binding Option</span>
                <span className="font-semibold text-brand-dark">{settings?.bindingOption || 'NONE'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Tracking Margin</span>
                <span className="font-semibold text-brand-purple">
                  {settings?.includeTrackingMargin ? 'Perforated Tear Line' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Kiosk & Collection Window Card */}
          <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-3">
            <h4 className="font-bold text-brand-dark text-sm border-b border-brand-lavender pb-2">
              Target Kiosk & Pickup Time
            </h4>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-brand-dark">
                  {kiosk?.name || 'Central Campus Kiosk'}
                </div>
                <div className="text-xs text-brand-mutedText">
                  {kiosk?.location || 'Student Activity Center, Ground Floor Foyer'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-2xl text-xs text-brand-purple">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {printMode === 'INSTANT'
                  ? 'Mode A: Instant Walk-up Dispatch (Under 10-second SLA upon walk-up)'
                  : slot
                  ? `Mode B: Scheduled for ${new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today`
                  : 'Mode B: Scheduled Batch (Ready in ~10 mins)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Settlement (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-5">
            <h4 className="font-bold text-brand-dark text-sm">Payment Method</h4>

            {/* Methods */}
            <div className="space-y-2.5">
              {/* Campus Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'WALLET'
                    ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                    : 'border-brand-cardBorder hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-brand-dark">Campus Smart Wallet</div>
                    <div className="text-[11px] text-gray-500">
                      Balance: <strong className={isWalletSufficient ? 'text-green-600' : 'text-red-500'}>
                        ₹{walletBalance.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'WALLET' && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />}
                </div>
              </button>

              {/* Razorpay Sandbox */}
              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY_SANDBOX')}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  paymentMethod === 'RAZORPAY_SANDBOX'
                    ? 'border-brand-purple bg-purple-50/70 shadow-sm ring-1 ring-brand-purple'
                    : 'border-brand-cardBorder hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-brand-dark flex items-center gap-1.5">
                      <span>Razorpay Sandbox</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded font-bold">DEMO</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Cards, UPI, Netbanking</div>
                  </div>
                </div>

                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                  {paymentMethod === 'RAZORPAY_SANDBOX' && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />}
                </div>
              </button>
            </div>

            {/* Price Ledger */}
            <div className="space-y-2 pt-3 border-t border-brand-lavender text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Printing Charges:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {printMode === 'INSTANT' && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Priority Surcharge (Instant Mode):</span>
                  <span>+₹15.00</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee:</span>
                <span className="text-green-600 font-bold">₹0.00 (Campus Free)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-brand-dark pt-2 border-t border-dashed border-gray-200">
                <span>Total Amount:</span>
                <span className="text-brand-purple text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCompletePayment}
              disabled={loading || (paymentMethod === 'WALLET' && !isWalletSufficient)}
              className="w-full py-3.5 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-sm shadow-soft hover:shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Locking Spool & Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{totalAmount.toFixed(2)} & Dispatch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
