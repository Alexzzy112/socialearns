'use client';
import { useState, useEffect } from 'react';
import { HiClipboardCopy, HiUserGroup, HiCash, HiStar } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { StatCard } from '@/components/DashboardCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const { data: res } = await API.get('/referrals');
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const copyLink = () => {
    if (data?.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const copyCode = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode);
      toast.success('Referral code copied!');
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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Refer & Earn</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Invite friends and earn N800 for each referral</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <StatCard icon={HiCash} label="Referral Earnings" value={data?.referralEarnings || 0} color="green" />
        <StatCard icon={HiUserGroup} label="Total Referrals" value={data?.totalReferrals || 0} color="indigo" />
      </div>

      <div className="card-gradient p-6 sm:p-8 rounded-2xl mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HiStar className="w-6 h-6 text-yellow-300" />
          <h2 className="text-lg font-bold text-white">N800 Bonus Per Referral</h2>
        </div>
        <p className="text-blue-100 text-sm mb-6">
          Earn N800 for every friend who signs up using your referral link and completes their first task.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
            <input type="text" readOnly value={data?.referralLink || ''} className="flex-1 bg-transparent text-white text-sm border-none outline-none" />
            <button onClick={copyLink} className="flex items-center gap-1 bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
              <HiClipboardCopy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          {data?.referralCode && (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
              <span className="text-white/60 text-sm">Code:</span>
              <span className="text-white font-bold text-sm flex-1">{data.referralCode}</span>
              <button onClick={copyCode} className="text-white/60 hover:text-white transition-colors">
                <HiClipboardCopy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4">Share Via</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-sm">Share on WhatsApp</button>
          <button className="btn-secondary text-sm">Share on Telegram</button>
          <button className="btn-secondary text-sm">Share on Twitter</button>
          <button className="btn-secondary text-sm">Share via Email</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-6">Referred Users</h2>
        {data?.referrals?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Date Joined</th>
                  <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((ref, i) => (
                  <tr key={ref._id || i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <td className="py-3">{ref.name || 'N/A'}</td>
                    <td className="py-3">{ref.email}</td>
                    <td className="py-3 whitespace-nowrap">{new Date(ref.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-semibold text-green-600">₦{ref.totalEarned?.toLocaleString() || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No referrals yet. Share your link to start earning!</p>
        )}
      </div>
    </DashboardLayout>
  );
}
