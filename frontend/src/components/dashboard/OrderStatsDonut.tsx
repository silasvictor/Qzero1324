import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OrderStatsProps {
  stats: {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    scheduledOrders: number;
  };
}

export const OrderStatsDonut: React.FC<OrderStatsProps> = ({ stats }) => {
  const data = [
    { name: 'Completed', value: stats.completedOrders || 0, color: '#22C55E' },
    { name: 'Active', value: stats.activeOrders || 0, color: '#7047EB' },
    { name: 'Scheduled', value: stats.scheduledOrders || 0, color: '#35C6C0' },
  ];

  // Fallback data if user has 0 orders yet
  const total = stats.totalOrders || 0;
  const chartData = total > 0 ? data : [{ name: 'No Orders', value: 1, color: '#EAE3FD' }];

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-cardBorder shadow-soft flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-brand-dark text-base">Order Statistics</h3>
        <span className="text-xs bg-purple-100 text-brand-purple font-bold px-2.5 py-0.5 rounded-full">
          Total: {total}
        </span>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} jobs`, name]}
              contentStyle={{
                backgroundColor: '#17152F',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Pie
              data={chartData}
              innerRadius={52}
              outerRadius={72}
              paddingAngle={total > 0 ? 4 : 0}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-brand-dark leading-none">{total}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-0.5">Prints</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-lavender text-center text-xs">
        <div>
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-brand-success" />
            <span>Completed</span>
          </div>
          <div className="font-bold text-brand-dark mt-0.5">{stats.completedOrders}</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-brand-purple" />
            <span>Active</span>
          </div>
          <div className="font-bold text-brand-dark mt-0.5">{stats.activeOrders}</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-brand-turquoise" />
            <span>Scheduled</span>
          </div>
          <div className="font-bold text-brand-dark mt-0.5">{stats.scheduledOrders}</div>
        </div>
      </div>
    </div>
  );
};
