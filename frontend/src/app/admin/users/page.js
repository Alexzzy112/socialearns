'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiUsers, HiSearch, HiX, HiCheck, HiEye, HiCash, HiTrash } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get('/admin/users', { params: { page, search, limit: 10 } });
        setUsers(data.users || []);
        setTotalPages(data.pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search]);

  const handleSuspend = async (id, isSuspended) => {
    try {
      await API.put(`/admin/users/${id}/suspend`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isSuspended: !isSuspended } : u));
      if (selectedUser?._id === id) {
        setSelectedUser((prev) => ({ ...prev, isSuspended: !isSuspended }));
      }
      toast.success(isSuspended ? 'User unsuspended' : 'User suspended');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCreditUser = async (id) => {
    if (!confirm('Credit this user with N1,500 and activate their account?')) return;
    try {
      await API.put(`/admin/users/${id}/credit`, { amount: 1500 });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, walletBalance: (u.walletBalance || 0) + 1500, isAccountActivated: true } : u));
      if (selectedUser?._id === id) {
        setSelectedUser((prev) => ({ ...prev, walletBalance: (prev.walletBalance || 0) + 1500, isAccountActivated: true }));
      }
      toast.success('User credited with N1,500');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleActivate = async (id) => {
    try {
      await API.put(`/admin/users/${id}/activate`);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isAccountActivated: true } : u));
      if (selectedUser?._id === id) {
        setSelectedUser((prev) => ({ ...prev, isAccountActivated: true }));
      }
      toast.success('Account activated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user and all their data? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (selectedUser?._id === id) setSelectedUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all platform users</p>
        </div>
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Phone</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Joined</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Wallet</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => setSelectedUser(u)}>
                <td className="py-3 px-4 font-medium">{u.name}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.phone || '-'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    u.isSuspended ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    u.isAccountActivated ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                  }`}>
                    {u.isSuspended ? 'Suspended' : u.isAccountActivated ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-medium">₦{(u.walletBalance || 0).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {!u.isSuspended ? (
                      <button onClick={() => handleSuspend(u._id, false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        Suspend
                      </button>
                    ) : (
                      <button onClick={() => handleSuspend(u._id, true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                        Unsuspend
                      </button>
                    )}
                    {!u.isAccountActivated && !u.isSuspended && (
                      <button onClick={() => handleActivate(u._id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                        Activate
                      </button>
                    )}
                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Delete user">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Next
          </button>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="font-medium">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    selectedUser.isSuspended ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    selectedUser.isAccountActivated ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                  }`}>
                    {selectedUser.isSuspended ? 'Suspended' : selectedUser.isAccountActivated ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold">₦{(selectedUser.walletBalance || 0).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleCreditUser(selectedUser._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  <HiCash className="w-4 h-4" /> Credit N1,500
                </button>
                {selectedUser.isSuspended ? (
                  <button
                    onClick={() => handleSuspend(selectedUser._id, true)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
                  >
                    Unsuspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleSuspend(selectedUser._id, false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                  >
                    Suspend
                  </button>
                )}
              </div>
              {!selectedUser.isAccountActivated && !selectedUser.isSuspended && (
                <button
                  onClick={() => handleActivate(selectedUser._id)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Activate Account
                </button>
              )}
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
