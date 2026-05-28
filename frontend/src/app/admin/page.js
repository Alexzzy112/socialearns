'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiUsers, HiCollection, HiCurrencyDollar, HiCash, HiChartBar, HiCheck, HiX, HiEye } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await API.get('/admin/dashboard');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const s = data?.stats || {};
  const stats = [
    { icon: HiUsers, label: 'Total Users', value: s.totalUsers, color: 'blue' },
    { icon: HiUsers, label: 'Active Users', value: s.activeUsers, color: 'green' },
    { icon: HiCollection, label: 'Pending Submissions', value: s.pendingSubmissions, color: 'yellow' },
    { icon: HiCurrencyDollar, label: 'Pending Withdrawals', value: s.pendingWithdrawals, color: 'red' },
    { icon: HiCash, label: 'Pending Deposits', value: s.pendingDeposits, color: 'purple' },
    { icon: HiChartBar, label: 'Total Earnings', value: s.totalEarnings, color: 'indigo' },
  ];

  const quickActions = [
    { title: 'Manage Users', desc: 'View, suspend, or activate users', href: '/admin/users', icon: HiUsers, color: 'blue' },
    { title: 'Manage Tasks', desc: 'Create, edit, or delete tasks', href: '/admin/tasks', icon: HiCollection, color: 'green' },
    { title: 'Withdrawals', desc: 'Approve or reverse withdrawals', href: '/admin/withdrawals', icon: HiCurrencyDollar, color: 'yellow' },
    { title: 'Deposits', desc: 'Manage deposit requests', href: '/admin/deposits', icon: HiCash, color: 'purple' },
    { title: 'Announcements', desc: 'Send announcements to users', href: '/admin/announcements', icon: HiEye, color: 'indigo' },
  ];

  const handleApprove = async (id, type) => {
    try {
      await API.put(`/admin/${type}/${id}/approve`);
      const { data: res } = await API.get('/admin/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id, type) => {
    try {
      await API.put(`/admin/${type}/${id}/reject`);
      const { data: res } = await API.get('/admin/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="card hover:shadow-lg transition-all duration-300 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              action.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm">{action.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Submissions</h2>
          {data?.recentSubmissions?.length > 0 ? (
            <div className="space-y-3">
              {data.recentSubmissions.map((sub) => (
                <div key={sub._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{sub.task?.title || 'Task'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sub.user?.name} &middot; {new Date(sub.createdAt).toLocaleDateString()}</p>
                  </div>
                  {sub.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(sub._id, 'submissions')} className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                        <HiCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReject(sub._id, 'submissions')} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {sub.status !== 'pending' && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      sub.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}>
                      {sub.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent submissions</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Users</h2>
          {data?.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {data.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email} &middot; {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    u.isActive && !u.isSuspended ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>
                    {u.isActive && !u.isSuspended ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent users</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
