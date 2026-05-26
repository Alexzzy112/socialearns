'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SE</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SocialEarn</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Earn money by completing simple social media tasks. Join thousands of happy earners today!</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="block hover:text-blue-600">Home</Link>
              <Link href="/about" className="block hover:text-blue-600">About</Link>
              <Link href="/pricing" className="block hover:text-blue-600">Pricing</Link>
              <Link href="/faq" className="block hover:text-blue-600">FAQ</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/contact" className="block hover:text-blue-600">Contact Us</Link>
              <Link href="/privacy" className="block hover:text-blue-600">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-blue-600">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>support@socialearn.com</p>
              <p>+234 800 000 0000</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} SocialEarn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
