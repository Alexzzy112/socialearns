'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import {
  HiHome,
  HiClipboardList,
  HiCash,
  HiUserGroup,
  HiBell,
  HiChartBar,
  HiCog,
  HiShieldCheck,
  HiUsers,
  HiCurrencyDollar,
  HiCollection,
  HiSpeakerphone,
  HiLogout,
} from 'react-icons/hi';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: HiHome },
    { href: '/tasks', label: 'Tasks', icon: HiClipboardList },
    { href: '/wallet', label: 'Wallet', icon: HiCash },
    { href: '/withdraw', label: 'Withdraw', icon: HiCash },
    { href: '/referral', label: 'Referral', icon: HiUserGroup },
    { href: '/notifications', label: 'Notifications', icon: HiBell },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: HiChartBar },
    { href: '/admin/users', label: 'Users', icon: HiUsers },
    { href: '/admin/tasks', label: 'Tasks', icon: HiCollection },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: HiCurrencyDollar },
    { href: '/admin/deposits', label: 'Deposits', icon: HiCash },
    { href: '/admin/announcements', label: 'Announce', icon: HiSpeakerphone },
  ];

  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
            {!isAdmin && (
              <Link href="/dashboard/settings" onClick={onClose} className="sidebar-link">
                <HiCog className="w-5 h-5" /> Settings
              </Link>
            )}
            <button onClick={logout} className="w-full sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <HiLogout className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
