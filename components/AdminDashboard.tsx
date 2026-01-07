
import React, { useState, useEffect } from 'react';
import { PaymentRequest, UserStatus } from '../types';
import { formatDate } from '../utils/helpers';

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    const loadRequests = () => {
      const data = localStorage.getItem('visionsave_payments');
      if (data) {
        const parsed = JSON.parse(data) as PaymentRequest[];
        setRequests(parsed);
        const pendingCount = parsed.filter(r => r.status === 'PENDING').length;
        const approvedCount = parsed.filter(r => r.status === 'APPROVED').length;
        setStats({
          total: parsed.length,
          pending: pendingCount,
          revenue: approvedCount * 500 // Assuming 500 BDT per sub
        });
      }
    };
    loadRequests();
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = requests.map(req => {
      if (req.id === id) {
        // If approved, update the simulation user status if applicable
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
    // Dispatch storage event manually for same-tab updates
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Control Center</h1>
        <p className="text-gray-500">Manage manual payment verifications and user subscriptions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Approval</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Estimated Revenue</p>
          <p className="text-3xl font-bold text-green-600">৳ {stats.revenue}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">Pending Subscriptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                <th className="px-6 py-3">User Details</th>
                <th className="px-6 py-3">Phone Number</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No payment requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.username}</div>
                      <div className="text-xs text-gray-400">ID: {req.userId}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{req.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.method === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                        {req.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.timestamp)}</td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleAction(req.id, 'APPROVED')}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'REJECTED')}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold uppercase tracking-widest ${req.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
                          {req.status}
                        </span>
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
