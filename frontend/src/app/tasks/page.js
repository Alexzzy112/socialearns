'use client';
import { useState, useEffect } from 'react';
import { HiFilter, HiUpload, HiExternalLink } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';

const categories = ['All', 'Like', 'Comment', 'Follow', 'Share', 'YouTube', 'WhatsApp', 'Telegram'];

const categoryColors = {
  Like: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Comment: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Follow: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  Share: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  YouTube: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  WhatsApp: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  Telegram: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
};

const statusColors = {
  available: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [proofUrl, setProofUrl] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: res } = await API.get('/tasks');
        setTasks(Array.isArray(res) ? res : res.tasks || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = category === 'All' ? tasks : tasks.filter((t) => t.category === category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (screenshot) formData.append('screenshot', screenshot);
      if (proofUrl) formData.append('url', proofUrl);
      await API.post(`/tasks/${selectedTask._id}/submit`, formData);
      setSelectedTask(null);
      setScreenshot(null);
      setProofUrl('');
    } catch (err) {
      // error handled by interceptor
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
        <h1 className="text-2xl sm:text-3xl font-bold">Tasks</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Complete tasks and earn rewards</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <HiFilter className="w-5 h-5 text-gray-400 self-center" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tasks available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task._id} className="card hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[task.category] || categoryColors.Like}`}>
                  {task.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[task.status] || statusColors.available}`}>
                  {task.status || 'available'}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{task.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{task.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-green-600">₦{task.reward?.toLocaleString() || '0'}</span>
                {task.platform && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <HiExternalLink className="w-3 h-3" /> {task.platform}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedTask(task)}
                className="btn-primary w-full text-center"
              >
                Start Task
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTask(null)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[selectedTask.category] || ''}`}>
                {selectedTask.category}
              </span>
              <span className="text-xl font-bold text-green-600">₦{selectedTask.reward?.toLocaleString() || '0'}</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedTask.description}</p>

            {selectedTask.requirements && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-1">Requirements:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.requirements}</p>
              </div>
            )}

            {selectedTask.targetUrl && (
              <a
                href={selectedTask.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors mb-4"
              >
                <HiExternalLink className="w-5 h-5" /> Perform Task
              </a>
            )}

            {selectedTask.instructions && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium mb-2">Instructions:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedTask.instructions}</p>
              </div>
            )}

            <hr className="border-gray-200 dark:border-gray-600 mb-4" />
            <p className="text-sm font-medium mb-3">Submit Proof of Completion</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Screenshot</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('screenshot-input').click()}>
                  <HiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {screenshot ? screenshot.name : 'Click to upload screenshot'}
                  </p>
                  <input id="screenshot-input" type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files[0])} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Proof URL (optional)</label>
                <input type="url" className="input-field" placeholder="https://" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} />
              </div>
              <button type="submit" disabled={submitting || (!screenshot && !proofUrl)} className="btn-primary w-full disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Proof'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
