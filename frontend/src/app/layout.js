import './globals.css';
import { AuthProvider } from '@/store/AuthContext';
import { ThemeProvider } from '@/store/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AdsterraPopunder from '@/components/AdsterraPopunder';

export const metadata = {
  title: 'SocialEarn - Earn Money from Social Media Tasks',
  description: 'Complete social media tasks and earn real money. Like, comment, follow, share and get paid instantly.',
  keywords: 'social media earn, online jobs, paid tasks, make money online, Nigeria',
  manifest: '/manifest.json',
  openGraph: {
    title: 'SocialEarn - Earn Money from Social Media Tasks',
    description: 'Complete social media tasks and earn real money.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <AdsterraPopunder />
        <ThemeProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: 'var(--card-bg)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--card-border)',
                },
              }}
            />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
