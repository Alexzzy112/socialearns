'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import { HiUser, HiLock, HiCurrencyDollar, HiCamera } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' });
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
      setBank(user.bankAccount || { bankName: '', accountNumber: '', accountName: '' });
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/users/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {}
  };

  const updateBank = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/users/profile', { bankAccount: bank });
      toast.success('Bank details updated');
    } catch (err) {}
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
    } catch (err) {}
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <HiUser className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold">Profile</h2>
          </div>
          <form onSubmit={updateProfile} className="space-y-4">
            <input className="input-field" placeholder="Full Name" value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <input className="input-field" placeholder="Phone Number" value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <input className="input-field" placeholder="Email" value={profile.email} disabled />
            <button type="submit" className="btn-primary w-full">Save Changes</button>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <HiCurrencyDollar className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold">Bank Account</h2>
          </div>
          <form onSubmit={updateBank} className="space-y-4">
            <input className="input-field" placeholder="Bank Name" value={bank.bankName}
              onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
            <input className="input-field" placeholder="Account Number" value={bank.accountNumber}
              onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
            <input className="input-field" placeholder="Account Name" value={bank.accountName}
              onChange={(e) => setBank({ ...bank, accountName: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Save Bank Details</button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <HiLock className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold">Change Password</h2>
          </div>
          <form onSubmit={updatePassword} className="max-w-md space-y-4">
            <input type="password" className="input-field" placeholder="Current Password"
              value={password.currentPassword}
              onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} />
            <input type="password" className="input-field" placeholder="New Password"
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} />
            <input type="password" className="input-field" placeholder="Confirm New Password"
              value={password.confirmPassword}
              onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} />
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
