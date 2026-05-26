'use client';

export default function LoadingSpinner({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{content}</div>;
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}
