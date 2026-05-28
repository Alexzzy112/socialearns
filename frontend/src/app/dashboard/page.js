'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiCash, HiBadgeCheck, HiClock, HiUserGroup, HiUsers, HiArrowRight, HiShieldCheck, HiCurrencyDollar } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { StatCard } from '@/components/DashboardCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await API.get('/users/dashboard');
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleActivateNow = async () => {
    if (!confirm('Activate your account with N1,500 from your wallet balance?')) return;
    setActivating(true);
    try {
      const { data: res } = await API.post('/wallet/activate');
      toast.success(res.message || 'Account activated!');
      setData((prev) => prev ? {
        ...prev,
        stats: { ...prev.stats, walletBalance: prev.stats.walletBalance - 1500 },
      } : prev);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Activation failed');
    } finally {
      setActivating(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return (
    <DashboardLayout>
      <div className="card text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    </DashboardLayout>
  );

  const s = data?.stats || {};
  const stats = [
    { icon: HiCash, label: 'Wallet Balance', value: s.walletBalance, color: 'blue' },
    { icon: HiCash, label: 'Total Earned', value: s.totalEarned, color: 'green' },
    { icon: HiBadgeCheck, label: 'Completed Tasks', value: s.completedTasks, color: 'purple' },
    { icon: HiClock, label: 'Pending Tasks', value: s.pendingTasks, color: 'yellow' },
    { icon: HiUserGroup, label: 'Referral Earnings', value: s.referralEarnings, color: 'indigo' },
    { icon: HiUsers, label: 'Total Referrals', value: s.totalReferrals, color: 'green' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s your earning overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
        ))}
      </div>

      {!user?.isAccountActivated && (
        <div className="mb-8">
          {data?.wallet && data.wallet.balance >= 1500 ? (
            <div className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <HiShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">Ready to activate!</p>
                  <p className="text-sm text-green-600 dark:text-green-400">You have enough balance to activate your account.</p>
                </div>
              </div>
              <button
                onClick={handleActivateNow}
                disabled={activating}
                className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
              >
                {activating ? 'Activating...' : 'Activate Now'}
              </button>
            </div>
          ) : (
            <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center gap-3 p-4">
              <HiCurrencyDollar className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Account not activated</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Fund your wallet with ₦1,500 to activate your account and start earning!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/tasks" className="card flex items-center gap-4 hover:shadow-lg transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <HiBadgeCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Complete Tasks</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start earning now</p>
          </div>
          <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>
        <Link href="/withdraw" className="card flex items-center gap-4 hover:shadow-lg transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
            <HiCash className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Withdraw</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cash out your earnings</p>
          </div>
          <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
        </Link>
        <Link href="/referral" className="card flex items-center gap-4 hover:shadow-lg transition-all duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <HiUserGroup className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Refer Friends</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Earn N800 per referral</p>
          </div>
          <HiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </Link>
      </div>

      {data?.announcements?.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Announcements</h2>
            <Link href="/notifications" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {data.announcements.map((a) => (
              <div key={a._id} className={`p-4 rounded-xl border-l-4 ${
                a.type === 'urgent' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                a.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                a.type === 'success' ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' :
                'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    a.type === 'urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    a.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                    a.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  }`}>{a.type}</span>
                  <p className="font-semibold text-sm">{a.title}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <Link href="/wallet" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        {data?.wallet?.ledger?.length > 0 ? (
          <div className="space-y-3">
            {data.wallet.ledger.slice(0, 10).map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-sm">{entry.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-semibold ${entry.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.type === 'credit' ? '+' : '-'}₦{Math.abs(entry.amount)?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </DashboardLayout>
  );
}
