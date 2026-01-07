import React, { useState, useEffect } from 'react';
import { PaymentRequest, UserStatus } from '../types.ts';
import { formatDate, getChartData } from '../utils/helpers.ts';

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState({ totalUsers: 0, pending: 0, revenue: 0, premiumCount: 0 });

  useEffect(() => {
    const loadData = () => {
      const payments = localStorage.getItem('visionsave_payments');
      const parsedPayments = payments ? JSON.parse(payments) as PaymentRequest[] : [];
      setRequests(parsedPayments);

      const approved = parsedPayments.filter(r => r.status === 'APPROVED');
      const totalRev = approved.reduce((acc, curr) => {
        const val = curr.currency === 'USD' ? curr.amount * 120 : curr.amount; // Simple conversion for graph
        return acc + val;
      }, 0);

      // In a real app we'd fetch actual users, here we simulate from storage and payments
      const user = localStorage.getItem('visionsave_user');
      setStats({
        totalUsers: parsedPayments.length + (user ? 1 : 0),
        pending: parsedPayments.filter(r => r.status === 'PENDING').length,
        revenue: totalRev,
        premiumCount: approved.length
      });
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = requests.map(req => {
      if (req.id === id) {
        if (action === 'APPROVED') {
          const userStr = localStorage.getItem('visionsave_user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id === req.userId) {
              user.status = UserStatus.PREMIUM;
              localStorage.setItem('visionsave_user', JSON.stringify(user));
            }
          }
        }
        return { ...req, status: action };
      }
      return req;
    });
    setRequests(updated);
    localStorage.setItem('visionsave_payments', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const chartData = getChartData(chartPeriod, requests);
  const maxVal = Math.max(...chartData.values, 1000);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Hub</h1>
          <p className="text-gray-500 font-medium">Monitoring VisionSave ecosystem performance.</p>
        </div>
        <div className="flex bg-white border rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setChartPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${chartPeriod === p ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'text-gray-900' },
          { label: 'Premium Users', value: stats.premiumCount, color: 'text-blue-600' },
          { label: 'Pending Requests', value: stats.pending, color: 'text-orange-500' },
          { label: 'Total Revenue (Est. BDT)', value: `৳${stats.revenue.toLocaleString()}`, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Revenue Growth (BDT Equivalent)</h2>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {chartData.values.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div 
                  className="w-full bg-green-500 rounded-t-lg transition-all duration-500 group-hover:bg-green-600"
                  style={{ height: `${(v / maxVal) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ৳{v.toLocaleString()}
                  </div>
                </div>
                <span className="mt-3 text-[10px] font-bold text-gray-400 uppercase">{chartData.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Premium Log</h2>
            <i className="fas fa-crown text-yellow-500"></i>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            {requests.filter(r => r.status === 'APPROVED').length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm italic">No active premiums yet.</div>
            ) : (
              <div className="divide-y">
                {requests.filter(r => r.status === 'APPROVED').map((req) => (
                  <div key={req.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{req.username}</div>
                      <div className="text-[10px] text-gray-500">{formatDate(req.timestamp)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-green-600">+{req.amount} {req.currency}</div>
                      <div className="text-[9px] text-gray-400 uppercase font-bold">{req.method}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Verification Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b">
                <th className="px-6 py-4">Username / ID</th>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No activity detected.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.username}</div>
                      <div className="text-[10px] text-gray-400">ID: {req.userId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                         <span className={`w-2 h-2 rounded-full ${req.method === 'Binance' ? 'bg-yellow-400' : req.method === 'bKash' ? 'bg-pink-500' : 'bg-orange-500'}`}></span>
                         <span className="text-xs font-bold text-gray-700">{req.method}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">{req.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-gray-900">{req.amount} {req.currency}</div>
                      <div className="text-[10px] text-gray-400">{formatDate(req.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleAction(req.id, 'APPROVED')} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all">Approve</button>
                          <button onClick={() => handleAction(req.id, 'REJECTED')} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100">Reject</button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${req.status === 'APPROVED' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>{req.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;