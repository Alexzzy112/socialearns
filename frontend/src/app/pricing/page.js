'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiCheck, HiArrowRight } from 'react-icons/hi';
import { useAuth } from '@/store/AuthContext';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Get started with basic earning',
    features: [
      'Complete basic social tasks',
      'Earn up to N500 daily',
      'Referral bonus (N800/ref)',
      'Withdraw to bank',
      'Email support',
    ],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 'N1,500',
    period: 'one-time',
    description: 'Unlock full earning potential',
    features: [
      'All starter features',
      'Unlimited daily tasks',
      'Higher paying tasks',
      'Priority withdrawal',
      'Priority support',
      'Early access to new tasks',
      'VIP community access',
    ],
    highlighted: true,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Start free and unlock premium features as you grow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`card relative ${plan.highlighted ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6 mt-2">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-4xl font-extrabold mb-1">{plan.price}</p>
                  {plan.period && <p className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</p>}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm">
                      <HiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center">
                  <Link
                    href={user ? '/deposit' : '/register'}
                    className={`w-full ${plan.highlighted ? 'btn-primary' : 'btn-outline'} inline-flex items-center justify-center gap-2`}
                  >
                    {plan.price === 'Free' ? 'Get Started' : 'Activate Now'} <HiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
