'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiCollection, HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '', description: '', category: '', reward: '', platform: '',
  targetUrl: '', requirements: '', instructions: '', totalSlots: '', dailyLimit: '',
};

export default function AdminTasks() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/admin/tasks');
      setTasks(data.tasks || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      category: task.category || '',
      reward: task.reward || '',
      platform: task.platform || '',
      targetUrl: task.targetUrl || '',
      requirements: task.requirements || '',
      instructions: task.instructions || '',
      totalSlots: task.totalSlots || '',
      dailyLimit: task.dailyLimit || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, reward: Number(form.reward), totalSlots: Number(form.totalSlots), dailyLimit: Number(form.dailyLimit) };
      if (editing) {
        await API.put(`/admin/tasks/${editing._id}`, payload);
        toast.success('Task updated');
      } else {
        await API.post('/admin/tasks', payload);
        toast.success('Task created');
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/admin/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'active' ? 'inactive' : 'active';
      await API.put(`/admin/tasks/${task._id}`, { status: newStatus });
      toast.success(`Task ${newStatus}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Task Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage platform tasks</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <HiPlus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Title</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Reward</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Slots</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Completed</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4 font-medium">{task.title}</td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {task.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-green-600">₦{task.reward?.toLocaleString() || '0'}</td>
                <td className="py-3 px-4">{task.totalSlots || '-'}</td>
                <td className="py-3 px-4">{task.completedCount || 0}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      task.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {task.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(task)} className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tasks yet</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editing ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select category</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="telegram">Telegram</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reward (₦)</label>
                  <input type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} required className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <input type="text" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target URL</label>
                  <input type="url" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Requirements</label>
                  <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Instructions</label>
                  <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Slots</label>
                  <input type="number" value={form.totalSlots} onChange={(e) => setForm({ ...form, totalSlots: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Limit</label>
                  <input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
                  {editing ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
