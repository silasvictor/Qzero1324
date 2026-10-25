import React, { useState, useEffect } from 'react';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { UpcomingPickupCard } from '../components/dashboard/UpcomingPickupCard';
import { OrderStatsDonut } from '../components/dashboard/OrderStatsDonut';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { ordersApi } from '../services/api';
import { PrintOrder } from '../types';
import { Loader2 } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    scheduledOrders: 0,
  });
  const [upcomingPickup, setUpcomingPickup] = useState<PrintOrder | null>(null);
  const [recentOrders, setRecentOrders] = useState<PrintOrder[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getDashboardSummary();
      if (res.success && res.data) {
        setStats(res.data.statistics || stats);
        setUpcomingPickup(res.data.upcomingPickup || null);
        setRecentOrders(res.data.recentOrders || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          <span className="text-xs font-semibold text-brand-mutedText">
            Synchronizing Campus Fleet Spooler...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome Banner matching reference styling */}
      <WelcomeBanner />

      {/* 2. Top Metric Cards: Upcoming Pickup & Order Statistics Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <UpcomingPickupCard order={upcomingPickup} />
        </div>
        <div className="lg:col-span-5">
          <OrderStatsDonut stats={stats} />
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <QuickActions />

      {/* 4. Recent Print Orders Table */}
      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
};
