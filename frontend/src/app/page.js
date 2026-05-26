'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiArrowRight, HiCheck, HiStar, HiShieldCheck, HiLightningBolt, HiCash, HiUserGroup, HiDeviceMobile } from 'react-icons/hi';
import { useAuth } from '@/store/AuthContext';

const features = [
  { icon: HiLightningBolt, title: 'Quick Tasks', desc: 'Complete tasks in minutes - like, follow, share and earn instantly' },
  { icon: HiCash, title: 'Real Earnings', desc: 'Earn real money that you can withdraw to your bank account' },
  { icon: HiUserGroup, title: 'Referral Bonus', desc: 'Earn N800 for every friend you refer to the platform' },
  { icon: HiShieldCheck, title: 'Secure & Verified', desc: 'Your earnings and data are protected with enterprise-grade security' },
  { icon: HiDeviceMobile, title: 'Works Anywhere', desc: 'Complete tasks on your phone, tablet, or computer' },
  { icon: HiStar, title: '24/7 Support', desc: 'Our support team is always ready to help you' },
];

const stats = [
  { value: '50,000+', label: 'Active Users' },
  { value: '₦10M+', label: 'Total Paid Out' },
  { value: '500K+', label: 'Tasks Completed' },
  { value: '4.8/5', label: 'User Rating' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HiStar className="w-4 h-4" />
              Trusted by 50,000+ users
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Earn Money by Completing{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Social Media Tasks
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Join thousands of Nigerians earning real money by liking, commenting, following, and sharing on social media. Instant payouts, zero stress.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Go to Dashboard <HiArrowRight className="inline w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary text-lg px-8 py-4">
                    Start Earning Now <HiArrowRight className="inline w-5 h-5 ml-2" />
                  </Link>
                  <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><HiCheck className="text-green-500" /> No fees</span>
              <span className="flex items-center gap-1"><HiCheck className="text-green-500" /> Instant withdrawal</span>
              <span className="flex items-center gap-1"><HiCheck className="text-green-500" /> 24/7 support</span>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Start earning in three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Create Account', desc: 'Sign up for free and complete your profile' },
                { step: '02', title: 'Complete Tasks', desc: 'Choose from available tasks and submit proof' },
                { step: '03', title: 'Get Paid', desc: 'Earn rewards and withdraw to your bank' },
              ].map((item) => (
                <div key={item.step} className="card text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose SocialEarn?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                We provide the best earning experience
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="card hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-gradient p-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-blue-100 mb-8 text-lg">
                Join 50,000+ Nigerians earning real money from social media tasks
              </p>
              {user ? (
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors">
                  Go to Dashboard <HiArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link href="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors">
                  Get Started Free <HiArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
