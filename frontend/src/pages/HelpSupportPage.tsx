import React, { useState, useEffect } from 'react';
import { supportApi } from '../services/api';
import { SupportTicket } from '../types';
import { HelpCircle, Send, CheckCircle2, AlertCircle, LifeBuoy, MessageSquare, ChevronDown } from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [category, setCategory] = useState('PRINT_QUALITY');
  const [orderCode, setOrderCode] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const res = await supportApi.getMyTickets();
    if (res.success && res.data?.tickets) {
      setTickets(res.data.tickets);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setLoading(true);
    setError(null);
    setSubmitted(false);

    try {
      const res = await supportApi.submitTicket({
        category,
        subject,
        description,
        orderId: orderCode ? orderCode.trim() : undefined,
      });

      if (res.success) {
        setSubmitted(true);
        setSubject('');
        setDescription('');
        setOrderCode('');
        loadTickets();
      } else {
        setError(res.error || 'Failed to submit ticket');
      }
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">Help & Support Desk</h2>
        <p className="text-xs text-brand-mutedText mt-0.5">
          Report hardware printing issues, missing pages, or request automated refunds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ticket Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 lg:p-8 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-lavender">
            <LifeBuoy className="w-5 h-5 text-brand-purple" />
            <h3 className="font-bold text-sm text-brand-dark">Submit a Support Request</h3>
          </div>

          {submitted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Ticket submitted! Our campus technicians will review it shortly.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-brand-dark mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              >
                <option value="PRINT_QUALITY">Print Quality (Faint Inks / Streaks)</option>
                <option value="MISSING_PAGES">Missing Pages / Incomplete Collating</option>
                <option value="KIOSK_PROBLEM">Kiosk Hardware Jam / Offline Station</option>
                <option value="PAYMENT_ISSUE">Payment Deducted but Token Not Issued</option>
                <option value="REFUND_REQUEST">Immediate Automated Credit Refund</option>
                <option value="GENERAL">General Inquiries</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">
                Order Tracking Code (Optional)
              </label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="e.g. 8XUI-Z123"
                className="w-full p-2.5 rounded-xl border border-brand-cardBorder font-mono font-bold text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about what occurred at the kiosk..."
                className="w-full p-2.5 rounded-xl border border-brand-cardBorder text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Existing Tickets (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-lavender">
            <MessageSquare className="w-5 h-5 text-brand-purple" />
            <h3 className="font-bold text-sm text-brand-dark">Your Tickets ({tickets.length})</h3>
          </div>

          {tickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No support requests filed.
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl border border-brand-cardBorder bg-brand-bg text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-dark truncate max-w-[170px]">
                      {t.subject}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-brand-purple'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-gray-500 text-[11px] line-clamp-2">{t.description}</p>

                  {t.adminResponse && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-xl border border-purple-100 text-[10px] text-brand-purple">
                      <strong>Admin Response:</strong> "{t.adminResponse}"
                    </div>
                  )}

                  <div className="text-[9px] text-gray-400 pt-1">
                    Filed on {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
