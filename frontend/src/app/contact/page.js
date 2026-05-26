'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiMail, HiPhone, HiLocationMarker, HiChat } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
            Have a question or issue? We're here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: HiMail, title: 'Email', info: 'support@socialearn.com' },
              { icon: HiPhone, title: 'Phone', info: '+234 800 000 0000' },
              { icon: HiChat, title: 'Live Chat', info: 'Available 24/7' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card text-center">
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.info}</p>
                </div>
              );
            })}
          </div>
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" required className="input-field"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input type="email" placeholder="Your Email" required className="input-field"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <input type="text" placeholder="Subject" required className="input-field"
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <textarea rows="5" placeholder="Your Message" required className="input-field"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
