'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiCash, HiArrowRight, HiCurrencyDollar, HiCheckCircle, HiX, HiShieldCheck } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

const BANK_DETAILS = {
  bank: 'Moniepoint',
  accountName: 'Kwoku Azamu',
  accountNumber: '6480276802',
  amount: 1500,
};

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastDeposit, setLastDeposit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, historyRes] = await Promise.all([
          API.get('/wallet'),
          API.get('/wallet/history', { params: { page: 1, limit: 20 } }),
        ]);
        setWallet(walletRes.data);
        const hist = historyRes.data?.ledger || (Array.isArray(historyRes.data) ? historyRes.data : []);
        setHistory(hist);
        setHasMore(hist.length === 20);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { data: res } = await API.get('/wallet/history', { params: { page: nextPage, limit: 20 } });
      const newItems = res?.ledger || (Array.isArray(res) ? res : []);
      setHistory((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(newItems.length === 20);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const [activating, setActivating] = useState(false);

  const handleActivateNow = async () => {
    if (!confirm('Activate your account with N1,500 from your wallet balance?')) return;
    setActivating(true);
    try {
      const { data } = await API.post('/wallet/activate');
      toast.success(data.message || 'Account activated!');
      setWallet((prev) => prev ? { ...prev, balance: prev.balance - 1500 } : prev);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Activation failed');
    } finally {
      setActivating(false);
    }
  };

  const submitDeposit = async () => {
    setSubmitting(true);
    try {
      const { data } = await API.post('/deposits/manual', {
        amount: BANK_DETAILS.amount.toString(),
        bankName: BANK_DETAILS.bank,
      });
      setLastDeposit(data.deposit);
      toast.success('Deposit request submitted! Awaiting admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl sm:text-3xl font-bold">Wallet</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your earnings and transactions</p>
      </div>

      <div className="card-gradient p-6 sm:p-8 rounded-2xl mb-8">
        <p className="text-blue-100 text-sm font-medium mb-2">Current Balance</p>
        <p className="text-4xl sm:text-5xl font-extrabold text-white">₦{wallet?.balance?.toLocaleString() || '0'}</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/withdraw" className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            <HiCash className="w-5 h-5" /> Withdraw
          </Link>
          <button onClick={() => setShowFund(true)} className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors">
            Fund Wallet <HiArrowRight className="w-5 h-5" />
          </button>
        </div>
        {!user?.isAccountActivated && (
          <>
            {wallet && wallet.balance >= 1500 ? (
              <div className="mt-4 bg-green-500/20 text-green-100 text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HiShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>You have enough balance to activate your account!</span>
                </div>
                <button
                  onClick={handleActivateNow}
                  disabled={activating}
                  className="bg-white text-green-700 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm whitespace-nowrap"
                >
                  {activating ? 'Activating...' : 'Activate Now'}
                </button>
              </div>
            ) : (
              <div className="mt-4 bg-yellow-300/20 text-yellow-100 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <HiCurrencyDollar className="w-5 h-5 flex-shrink-0" />
                Fund with ₦{BANK_DETAILS.amount.toLocaleString()} to activate your account and start earning!
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-6">Transaction History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-left py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-right py-3 font-medium text-gray-500 dark:text-gray-400">Balance</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx, i) => (
                  <tr key={tx._id || i} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <td className="py-3 whitespace-nowrap">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">{tx.description || '-'}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      }`}>
                        {tx.type === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{Math.abs(tx.amount)?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">₦{tx.balance?.toLocaleString() || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && (
          <div className="text-center mt-6">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary">
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {showFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFund(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Fund Wallet</h2>
              <button onClick={() => setShowFund(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6 space-y-3">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bank Transfer Details</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Bank</span>
                <span className="font-bold">{BANK_DETAILS.bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Account Number</span>
                <span className="font-bold text-lg tracking-wider">{BANK_DETAILS.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Account Name</span>
                <span className="font-bold">{BANK_DETAILS.accountName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-bold text-xl text-blue-600">₦{BANK_DETAILS.amount.toLocaleString()}</span>
              </div>
            </div>

            {!user?.isAccountActivated && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Funding with ₦1,500 activates your account, allowing you to start earning from tasks.
                </p>
              </div>
            )}

            {!lastDeposit && (
              <>
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      I have transferred <strong>₦{BANK_DETAILS.amount.toLocaleString()}</strong> to the account details above
                    </span>
                  </label>
                </div>

                <button
                  onClick={submitDeposit}
                  disabled={submitting || !confirmed}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><HiCheckCircle className="w-5 h-5" /> I Have Made Payment</>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Your deposit will be credited after admin confirmation.
                </p>
              </>
            )}

            {lastDeposit && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <HiCheckCircle className="w-6 h-6 text-green-600" />
                  <p className="font-semibold text-green-800 dark:text-green-200">Payment Submitted</p>
                </div>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono font-medium">{lastDeposit.reference}</span>
                  </div>
                  {lastDeposit.narration && (
                    <div className="flex justify-between">
                      <span>Narration:</span>
                      <span className="text-right max-w-[200px]">{lastDeposit.narration}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-700">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{lastDeposit.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowFund(false); setLastDeposit(null); setConfirmed(false); }}
                  className="w-full mt-4 px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
