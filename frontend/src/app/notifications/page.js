'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import API from '@/lib/axios';
import { HiBell, HiCheck, HiInformationCircle, HiExclamation, HiCheckCircle, HiXCircle } from 'react-icons/hi';

const typeIcons = {
  info: HiInformationCircle,
  success: HiCheckCircle,
  warning: HiExclamation,
  error: HiXCircle,
  announcement: HiBell,
};

const typeColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  announcement: 'text-purple-500',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {}
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="btn-secondary py-2 px-4 text-sm">
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <HiBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || HiInformationCircle;
            const color = typeColors[notif.type] || 'text-blue-500';
            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markRead(notif._id)}
                className={`card flex gap-4 cursor-pointer transition-all ${
                  !notif.isRead ? 'ring-1 ring-blue-200 dark:ring-blue-800 bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
