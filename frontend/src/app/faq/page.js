'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiChevronDown } from 'react-icons/hi';

const faqs = [
  {
    q: 'How do I start earning?',
    a: 'Register an account, complete your profile, and activate your account by funding at least N1,500. Then browse available tasks and start completing them.',
  },
  {
    q: 'How much can I earn?',
    a: 'Earnings vary by task type. Basic tasks pay between N50-N200, while premium tasks can pay up to N500 each. Active users earn between N1,000-N5,000 daily.',
  },
  {
    q: 'How do I withdraw my earnings?',
    a: 'Go to the Withdraw page, enter your bank details and amount. Withdrawals are processed within 24 hours on weekdays.',
  },
  {
    q: 'Is there a referral program?',
    a: 'Yes! You earn N800 for every friend who registers using your referral link. There is no limit to how many friends you can refer.',
  },
  {
    q: 'What happens if my task is rejected?',
    a: 'If your submission is rejected, you can retry the task. Make sure to follow all instructions carefully and submit clear screenshot proof.',
  },
  {
    q: 'How long does account activation take?',
    a: 'Account activation is instant once your N1,500 deposit is confirmed. Admin may also manually activate accounts.',
  },
  {
    q: 'Can I use multiple accounts?',
    a: 'No. Multiple accounts are strictly prohibited and will result in permanent suspension of all accounts.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. We use industry-standard encryption and security measures to protect your data. We never share your information with third parties.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Got questions? We've got answers.
          </p>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="card p-0 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <HiChevronDown className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
