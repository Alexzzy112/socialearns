'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiSpeakerphone, HiPlus } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { useAuth } from '@/store/AuthContext';
import toast from 'react-hot-toast';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get('/admin/announcements');
      setAnnouncements(data.announcements || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await API.post('/admin/announcements', { title, content, type });
      toast.success('Announcement sent');
      setTitle('');
      setContent('');
      setType('info');
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const typeStyles = {
    info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
    success: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
    warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    urgent: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
  };

  const typeBadgeStyles = {
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Announcements</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Send announcements to all users</p>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <HiSpeakerphone className="w-5 h-5" />
          New Announcement
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Announcement title"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              placeholder="Write your announcement here..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
          >
            <HiPlus className="w-5 h-5" />
            {submitting ? 'Sending...' : 'Send Announcement'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Previous Announcements</h2>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className={`p-4 rounded-xl border-l-4 ${typeStyles[a.type] || typeStyles.info}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeBadgeStyles[a.type] || typeBadgeStyles.info}`}>
                      {a.type}
                    </span>
                    <h3 className="font-semibold">{a.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{a.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No announcements yet</p>
        )}
      </div>
    </DashboardLayout>
  );
}
