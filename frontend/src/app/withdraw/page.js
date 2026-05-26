'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';

export default function WithdrawPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ amount: '', bankName: '', accountNumber: '', accountName: '' });
  const [useSaved, setUseSaved] = useState(false);
  const [savedBank, setSavedBank] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, historyRes] = await Promise.all([
          API.get('/wallet'),
          API.get('/withdrawals'),
        ]);
        setWallet(walletRes.data);
        const withdrawals = Array.isArray(historyRes.data) ? historyRes.data : historyRes.data.withdrawals || [];
        setHistory(withdrawals);
        if (walletRes.data.bankDetails) {
          setSavedBank(walletRes.data.bankDetails);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = useSaved && savedBank
        ? { amount: form.amount }
        : form;
      await API.post('/withdrawals', payload);
      setForm({ amount: '', bankName: '', accountNumber: '', accountName: '' });
      const { data: walletRes } = await API.get('/wallet');
      setWallet(walletRes.data);
    } catch {
      // handled by interceptor
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
        <h1 className="text-2xl sm:text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Cash out your earnings to your bank account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Withdrawal Form</h2>
            <p className="text-2xl font-bold text-green-600">₦{wallet?.balance?.toLocaleString() || '0'}</p>
          </div>

          {savedBank && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input type="checkbox" id="useSaved" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} className="rounded" />
              <label htmlFor="useSaved" className="text-sm cursor-pointer">
                Use saved bank: <strong>{savedBank.bankName}</strong> - {savedBank.accountNumber} ({savedBank.accountName})
              </label>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₦)</label>
              <input type="number" name="amount" required min="100" className="input-field" placeholder="Enter amount" value={form.amount} onChange={handleChange} />
              <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: ₦100</p>
            </div>
            {!useSaved && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name</label>
                  <input type="text" name="bankName" required className="input-field" placeholder="e.g. GTBank" value={form.bankName} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <input type="text" name="accountNumber" required pattern="\d{10}" className="input-field" placeholder="10 digit account number" value={form.accountNumber} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Name</label>
                  <input type="text" name="accountName" required className="input-field" placeholder="Full name on account" value={form.accountName} onChange={handleChange} />
                </div>
              </>
            )}
            <button type="submit" disabled={submitting || !form.amount || wallet?.balance < form.amount} className="btn-primary w-full disabled:opacity-50">
              {submitting ? 'Processing...' : 'Withdraw Now'}
            </button>
            {wallet?.balance < form.amount && form.amount && (
              <p className="text-xs text-red-500 text-center">Insufficient balance</p>
            )}
          </form>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Minimum withdrawal is ₦100. Withdrawals are processed within 24-48 hours.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-6">Withdrawal History</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No withdrawal history</p>
          ) : (
            <div className="space-y-3">
              {history.map((w, i) => (
                <div key={w._id || i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-sm">₦{w.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{w.bankName} - {w.accountNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    w.status === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : w.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>
                    {w.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
