import React, { useState, useEffect } from 'react';
import { adminApi, kiosksApi, supportApi } from '../services/api';
import {
  ShieldCheck,
  Printer,
  Users,
  Package,
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ArrowRight,
  LifeBuoy
} from 'lucide-react';
import { Kiosk, PrintOrder, SupportTicket } from '../types';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [queue, setQueue] = useState<PrintOrder[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'KIOSKS' | 'TICKETS' | 'USERS'>('QUEUE');
  const [loading, setLoading] = useState(true);

  // Status updater modal state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [anRes, qRes, kRes, tRes, uRes] = await Promise.all([
      adminApi.getAnalytics(),
      adminApi.getQueue(),
      kiosksApi.getAll(),
      supportApi.getAdminTickets(),
      adminApi.getUsers(),
    ]);

    if (anRes.success && anRes.data) setAnalytics(anRes.data.metrics);
    if (qRes.success && qRes.data) setQueue(qRes.data.queue);
    if (kRes.success && kRes.data) setKiosks(kRes.data.kiosks);
    if (tRes.success && tRes.data) setTickets(tRes.data.tickets);
    if (uRes.success && uRes.data) setUsers(uRes.data.users);
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    setActionSuccess(null);
    try {
      const res = await adminApi.updateOrderStatus(orderId, status);
      if (res.success) {
        setActionSuccess(`Order updated to ${status}`);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    const response = prompt('Enter response / refund message for student:', 'Credit issued to campus wallet.');
    if (response) {
      await supportApi.respondTicket(ticketId, {
        status: 'RESOLVED',
        adminResponse: response,
      });
      loadAllData();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Central Campus Print Fleet Head-Up Display</span>
          </div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">Fleet Administration Console</h2>
          <p className="text-xs text-brand-mutedText">
            Real-time telemetry, queue priority dispatching, kiosk maintenance, and financial audits.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="px-4 py-2 rounded-2xl bg-white border border-brand-cardBorder hover:bg-brand-lavender text-brand-purple font-bold text-xs flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet Telemetry</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-brand-cardBorder shadow-soft">
          <div className="text-[10px] uppercase font-bold text-gray-400">Total Students</div>
          <div className="text-2xl font-black text-brand-dark mt-0.5">
            {analytics?.totalStudents || 12}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-cardBorder shadow-soft">
          <div className="text-[10px] uppercase font-bold text-gray-400">Active Spool Queue</div>
          <div className="text-2xl font-black text-brand-purple mt-0.5">
            {analytics?.pendingOrders || 3}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-cardBorder shadow-soft">
          <div className="text-[10px] uppercase font-bold text-gray-400">Total Orders</div>
          <div className="text-2xl font-black text-brand-dark mt-0.5">
            {analytics?.totalOrders || 24}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-cardBorder shadow-soft">
          <div className="text-[10px] uppercase font-bold text-gray-400">Scrap Prevention (SPR)</div>
          <div className="text-2xl font-black text-brand-turquoise mt-0.5">
            {analytics?.scrapPreventionRatio ? `${(analytics.scrapPreventionRatio * 100).toFixed(1)}%` : '99.8%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-cardBorder shadow-soft">
          <div className="text-[10px] uppercase font-bold text-gray-400">Fleet Revenue</div>
          <div className="text-2xl font-black text-green-600 mt-0.5">
            ₹{analytics?.totalRevenue ? analytics.totalRevenue.toFixed(2) : '384.50'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-cardBorder shadow-soft">
          <div className="text-[10px] uppercase font-bold text-gray-400">Online Kiosks</div>
          <div className="text-2xl font-black text-brand-deep mt-0.5">
            {analytics?.activeKiosks || 5} / {analytics?.totalKiosks || 5}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-cardBorder pb-2">
        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'QUEUE'
              ? 'bg-brand-purple text-white shadow-soft'
              : 'bg-white text-gray-600 hover:bg-brand-lavender'
          }`}
        >
          Queue Manager ({queue.length})
        </button>

        <button
          onClick={() => setActiveTab('KIOSKS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'KIOSKS'
              ? 'bg-brand-purple text-white shadow-soft'
              : 'bg-white text-gray-600 hover:bg-brand-lavender'
          }`}
        >
          Kiosk Fleet Telemetry ({kiosks.length})
        </button>

        <button
          onClick={() => setActiveTab('TICKETS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TICKETS'
              ? 'bg-brand-purple text-white shadow-soft'
              : 'bg-white text-gray-600 hover:bg-brand-lavender'
          }`}
        >
          Support Requests ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'USERS'
              ? 'bg-brand-purple text-white shadow-soft'
              : 'bg-white text-gray-600 hover:bg-brand-lavender'
          }`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* Tab 1: Queue Manager Table */}
      {activeTab === 'QUEUE' && (
        <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
            <h4 className="font-bold text-sm text-brand-dark">Active Spool Jobs & Hardware Dispatch</h4>
            <span className="text-xs text-brand-mutedText">Dynamic SJF Priority Ordered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-lavender text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-3">Token Code</th>
                  <th className="pb-3 px-3">Student</th>
                  <th className="pb-3 px-3">Document</th>
                  <th className="pb-3 px-3">Target Kiosk</th>
                  <th className="pb-3 px-3">Priority Score</th>
                  <th className="pb-3 px-3">Current Status</th>
                  <th className="pb-3 px-3 text-right">Advance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queue.map((job) => (
                  <tr key={job.id} className="hover:bg-brand-lavender/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-brand-purple">
                      {job.trackingCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-brand-dark">{job.user?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {job.user?.rollNumber || '26BES7079'}
                      </div>
                    </td>
                    <td className="py-3 px-3 truncate max-w-[180px]">
                      <div className="font-semibold truncate">{job.document?.originalName}</div>
                      <div className="text-[10px] text-gray-400">
                        {job.totalPages} pgs • {job.printSettings?.colorMode} • {job.printSettings?.duplexMode}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-medium">
                      {job.kiosk?.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-xs bg-purple-50 text-brand-purple px-2 py-0.5 rounded">
                        P: {job.priorityScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-brand-purple">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {job.status === 'QUEUED' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'PRINTING')}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-[10px]"
                          >
                            Print Hardware
                          </button>
                        )}
                        {job.status === 'PRINTING' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'PACKING')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-[10px]"
                          >
                            Pack Envelope
                          </button>
                        )}
                        {job.status === 'PACKING' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'READY_FOR_PICKUP')}
                            className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-600 hover:text-white font-bold text-[10px]"
                          >
                            Mark Ready
                          </button>
                        )}
                        {job.status === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'COLLECTED')}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white font-bold text-[10px]"
                          >
                            Handover
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Kiosks Telemetry */}
      {activeTab === 'KIOSKS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kiosks.map((k) => (
            <div key={k.id} className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-brand-purple px-2 py-0.5 rounded">
                    {k.campusCode}
                  </span>
                  <h4 className="font-bold text-base text-brand-dark mt-1">{k.name}</h4>
                  <p className="text-xs text-brand-mutedText line-clamp-1">{k.location}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                  {k.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-gray-500 mb-1 text-[11px]">
                    <span>Paper Tray Level</span>
                    <strong className="text-brand-dark">{k.paperLevelPercent}%</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${k.paperLevelPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-500 mb-1 text-[11px]">
                    <span>Toner Drum Level</span>
                    <strong className="text-brand-dark">{k.tonerLevelPercent}%</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-purple h-2 rounded-full" style={{ width: `${k.tonerLevelPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-lavender text-xs flex justify-between text-gray-600">
                <span>Speed: {k.ppmSpeed} PPM</span>
                <span>Active Queue: {k.queueDepth} jobs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Support Requests */}
      {activeTab === 'TICKETS' && (
        <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
            <h4 className="font-bold text-sm text-brand-dark">Student Assistance & Refund Requests</h4>
            <span className="text-xs text-brand-mutedText">{tickets.length} total tickets</span>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-brand-cardBorder bg-brand-bg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-brand-dark">
                    {t.subject} <span className="text-gray-400 font-normal">({t.user?.name} - {t.user?.rollNumber})</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-brand-purple'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-gray-600 text-xs">{t.description}</p>

                {t.adminResponse ? (
                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-brand-purple font-medium">
                    Response: "{t.adminResponse}"
                  </div>
                ) : (
                  <button
                    onClick={() => handleResolveTicket(t.id)}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-brand-purple text-white font-bold text-xs hover:bg-brand-deep"
                  >
                    Reply & Resolve Ticket
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: User Accounts */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-lavender">
            <h4 className="font-bold text-sm text-brand-dark">Registered Campus Users</h4>
            <span className="text-xs text-brand-mutedText">{users.length} enrolled profiles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-lavender text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-3">Name / Role</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Roll Number</th>
                  <th className="pb-3 px-3">Department</th>
                  <th className="pb-3 px-3">Wallet Balance</th>
                  <th className="pb-3 px-3 text-right">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-lavender/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-brand-dark">
                      {u.name}
                      <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-50 text-brand-purple">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{u.email}</td>
                    <td className="py-3 px-3 font-mono font-bold text-brand-purple">{u.rollNumber || 'N/A'}</td>
                    <td className="py-3 px-3 text-gray-500">{u.department || 'N/A'}</td>
                    <td className="py-3 px-3 font-bold text-brand-dark">
                      ₹{u.studentProfile?.balance ? u.studentProfile.balance.toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{u._count?.orders || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
