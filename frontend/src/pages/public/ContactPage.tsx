import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Clock, ShieldCheck, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Customer Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your grievance/inquiry has been lodged with the Cooperative Member Council.');
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
          Community Care & Grievance Redressal
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          We’re Here for Workers and Households
        </h1>
        <p className="text-sm text-slate-600">
          Have an inquiry, booking concern, or worker membership dispute? Our community support team responds within 2 business hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              Cooperative Helpline
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Direct access for emergency household repair coordination and worker on-duty assistance.
            </p>

            <div className="space-y-3 text-sm pt-2">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-300" />
                <span>1800-419-COOP (Toll Free)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-300" />
                <span>support@cooperative-gig.org</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>Mon – Sun: 7:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Bengaluru Cooperative Hub
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              #42, 3rd Floor, Labor & Cooperative Complex, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-0.5">Worker Walk-in Hours:</span>
              Daily 9:00 AM - 1:00 PM for KYC verification, tool inspection, and dividend counseling.
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-1">Submit Inquiry or Grievance</h3>
          <p className="text-xs text-slate-500 mb-6">
            Every ticket is reviewed by the Democratic Member Ombudsman.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
              >
                <option value="Customer Support">Customer Booking / Service Support</option>
                <option value="Worker Membership">Worker Co-owner Membership Inquiry</option>
                <option value="Grievance">Grievance & Redressal Complaint</option>
                <option value="Partnership">Local Community Partnership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Issue Details</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your query or problem in detail..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Member Council</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
