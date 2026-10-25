import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsApi } from '../services/api';
import { Wallet, CreditCard, ArrowUpRight, Plus, Sparkles, CheckCircle2, History, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalletPage: React.FC = () => {
  const { user, refreshProfile, updateBalanceLocally } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    const res = await paymentsApi.getHistory();
    if (res.success && res.data?.payments) {
      setPayments(res.data.payments);
    }
  };

  const handleTopUp = async (amount: number) => {
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await paymentsApi.topUpWallet(amount);
      if (res.success && res.data?.newBalance !== undefined) {
        updateBalanceLocally(res.data.newBalance);
        await refreshProfile();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
        setSuccessMsg(`Successfully credited ₹${amount.toFixed(2)} to your campus smart wallet!`);
        loadPaymentHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Campus Wallet & Payments</h2>
        <p className="text-xs text-brand-mutedText mt-0.5">
          Prepaid print credits, automated balance settlements, and financial audit ledger.
        </p>
      </div>

      {/* Top Wallet Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Wallet Balance Card (7 cols) */}
        <div className="md:col-span-7 bg-gradient-to-tr from-brand-deep via-brand-purple to-indigo-600 rounded-3xl p-8 text-white shadow-soft relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-purple-200">
                Unified Campus Print Credits
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                ₹{user?.balance ? user.balance.toFixed(2) : '0.00'}
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-white">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <div className="text-purple-200 text-[11px]">Linked Student ID</div>
              <div className="font-mono font-bold text-white">{user?.rollNumber || '26BES7079'}</div>
            </div>

            <div>
              <div className="text-purple-200 text-[11px]">Eco Loyalty Points</div>
              <div className="font-bold text-brand-turquoise">
                {user?.loyaltyPoints || 180} pts (Eligible for ₹18 discount)
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-turquoise" />
              <span>Zero Transaction Fees</span>
            </div>
          </div>
        </div>

        {/* Quick Top-Up Widget (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-brand-dark">Instant Wallet Top-Up</h4>
            <span className="text-xs text-brand-purple font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
              Demo Gateway
            </span>
          </div>

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setRechargeAmount(amt)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  rechargeAmount === amt
                    ? 'border-brand-purple bg-purple-50 text-brand-purple ring-1 ring-brand-purple'
                    : 'border-brand-cardBorder hover:bg-gray-50 text-gray-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleTopUp(rechargeAmount)}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Adding credits...' : `Add ₹${rechargeAmount} to Wallet`}</span>
          </button>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-purple" />
            <h4 className="font-bold text-sm text-brand-dark">Payment Transactions & Receipts</h4>
          </div>
          <span className="text-xs text-brand-mutedText">{payments.length} ledger entries</span>
        </div>

        {payments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-lavender text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-3">Receipt / Txn ID</th>
                  <th className="pb-3 px-3">Order Details</th>
                  <th className="pb-3 px-3">Method</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-lavender/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-brand-dark">{p.receiptNumber}</span>
                      <div className="text-[10px] text-gray-400 font-mono">{p.transactionId}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-brand-dark truncate max-w-[200px]">
                        {p.order?.document?.originalName || 'Print Job'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Code: {p.order?.trackingCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-brand-purple">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-500">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-brand-dark">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
