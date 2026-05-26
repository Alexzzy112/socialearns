'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { HiMenu, HiX, HiMoon, HiSun, HiBell, HiUser, HiLogout } from 'react-icons/hi';
import API from '@/lib/axios';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (user) {
      API.get('/notifications/unread-count')
        .then(({ data }) => setUnread(data.count))
        .catch(() => {});
    }
  }, [user]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {user && (
              <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <HiMenu className="w-6 h-6" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SE</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SocialEarn
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {!user && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <HiBell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  </button>

                  {showProfile && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-2 animate-slide-down">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setShowProfile(false)}>
                          <HiUser className="w-4 h-4" /> Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setShowProfile(false)}>
                            <HiUser className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setShowProfile(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <HiLogout className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary py-2 px-4 text-sm">Sign In</Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
