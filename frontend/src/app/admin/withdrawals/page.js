'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiCurrencyDollar, HiCheck, HiX, HiTrash } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

const tabs = ['All', 'Pending', 'Approved', 'Reversed'];

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data } = await API.get('/admin/withdrawals');
      setWithdrawals(data.withdrawals || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await API.put(`/admin/withdrawals/${id}/${action}`);
      toast.success(`Withdrawal ${action}ed`);
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this withdrawal?')) return;
    try {
      await API.delete(`/admin/withdrawals/${id}`);
      toast.success('Withdrawal deleted');
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = activeTab === 'All' ? withdrawals : withdrawals.filter((w) => w.status === activeTab.toLowerCase());

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage withdrawal requests</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-2 text-xs opacity-75">
                ({withdrawals.filter((w) => w.status === tab.toLowerCase()).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Bank</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Account</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium">{w.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{w.user?.email}</p>
                </td>
                <td className="py-3 px-4 font-medium text-green-600">₦{w.amount?.toLocaleString() || '0'}</td>
                <td className="py-3 px-4">{w.bankName || '-'}</td>
                <td className="py-3 px-4">{w.accountNumber || '-'}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    w.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    w.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(w._id, 'approve')} className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" title="Approve">
                          <HiCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(w._id, 'reverse')} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Reverse">
                          <HiX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(w._id)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Delete">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No withdrawals found</p>
        )}
      </div>
    </DashboardLayout>
  );
}
