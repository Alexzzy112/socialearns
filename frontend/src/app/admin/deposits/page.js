'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiCash, HiCheck, HiX, HiTrash } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

const tabs = ['All', 'Pending', 'Approved', 'Reversed'];

export default function AdminDeposits() {
  const { user } = useAuth();
  const router = useRouter();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const { data } = await API.get('/admin/deposits');
      setDeposits(data.deposits || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await API.put(`/admin/deposits/${id}/${action}`);
      toast.success(`Deposit ${action}ed`);
      fetchDeposits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deposit?')) return;
    try {
      await API.delete(`/admin/deposits/${id}`);
      toast.success('Deposit deleted');
      fetchDeposits();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = activeTab === 'All' ? deposits : deposits.filter((d) => d.status === activeTab.toLowerCase());

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Deposit Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage deposit requests</p>
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
                ({deposits.filter((d) => d.status === tab.toLowerCase()).length})
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
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Reference / Narration</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Method</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium">{d.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.user?.email}</p>
                </td>
                <td className="py-3 px-4 font-medium text-green-600">₦{d.amount?.toLocaleString() || '0'}</td>
                <td className="py-3 px-4">
                  <p className="text-xs font-mono">{d.reference || '-'}</p>
                  {d.narration && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]" title={d.narration}>
                      {d.narration}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {d.method || d.paymentMethod || '-'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      d.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      d.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                      'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}>
                      {d.status}
                    </span>
                    {d.isActivationFee && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                        Activation Fee
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {d.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(d._id, 'approve')} className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors" title="Approve">
                          <HiCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(d._id, 'reverse')} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Reverse">
                          <HiX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(d._id)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Delete">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No deposits found</p>
        )}
      </div>
    </DashboardLayout>
  );
}
