'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import { HiUser, HiLockClosed, HiShieldCheck, HiCash } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', email: user.email || '' });
      API.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/users/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await API.put('/users/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      toast.success('Password updated');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile and platform configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <HiUser className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold">Profile</h2>
          </div>
          <form onSubmit={updateProfile} className="space-y-4">
            <input className="input-field" placeholder="Full Name" value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <input className="input-field" placeholder="Email" value={profile.email} disabled />
            <button type="submit" className="btn-primary w-full">Save Changes</button>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <HiLockClosed className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold">Change Password</h2>
          </div>
          <form onSubmit={updatePassword} className="space-y-4">
            <input type="password" className="input-field" placeholder="Current Password"
              value={password.currentPassword}
              onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} />
            <input type="password" className="input-field" placeholder="New Password"
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} />
            <input type="password" className="input-field" placeholder="Confirm New Password"
              value={password.confirmPassword}
              onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Update Password</button>
          </form>
        </div>

        {stats && (
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <HiCash className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold">Platform Overview</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Earnings</p>
                <p className="text-2xl font-bold">₦{(stats.totalEarnings || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Withdrawn</p>
                <p className="text-2xl font-bold">₦{(stats.totalWithdrawn || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deposits</p>
                <p className="text-2xl font-bold">₦{(stats.totalDeposits || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Withdrawals</p>
                <p className="text-2xl font-bold">₦{(stats.totalWithdrawals || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasks Completed</p>
                <p className="text-2xl font-bold">{stats.tasksCompleted || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
