'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiShieldCheck, HiUserGroup, HiLightningBolt, HiCash } from 'react-icons/hi';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About SocialEarn</h1>
          <div className="card mb-8">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              SocialEarn is Nigeria's leading social media task earning platform. We connect brands and businesses 
              with real users who complete simple social media tasks for rewards. Since our launch, we've helped 
              thousands of Nigerians earn extra income from their smartphones.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our mission is to make earning money online accessible to everyone. Whether you're a student, 
              stay-at-home parent, or anyone looking for flexible online income, SocialEarn provides a legitimate 
              way to earn from completing simple tasks.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {[
              { icon: HiShieldCheck, title: 'Trusted Platform', desc: 'We prioritize security and transparency in every transaction' },
              { icon: HiUserGroup, title: 'Growing Community', desc: 'Join 50,000+ active users earning daily' },
              { icon: HiLightningBolt, title: 'Fast Payouts', desc: 'Withdraw your earnings instantly to your bank account' },
              { icon: HiCash, title: 'Real Earnings', desc: 'Earn real money that makes a difference in your life' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
