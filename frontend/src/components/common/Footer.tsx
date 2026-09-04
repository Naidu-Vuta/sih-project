import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Users, Scale, HelpCircle, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Coop<span className="text-emerald-400">Gig</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering Workers. Serving Communities. A democratic, worker-owned cooperative replacing extractive middlemen with fair wages, equity shares, and verified craftsmanship.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-medium">
              <Users className="w-4 h-4" />
              <span>100% Democratic Worker Ownership</span>
            </div>
          </div>

          {/* Platform Services */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Household Trades</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services?category=electrical-wiring" className="hover:text-white transition">
                  Electrical & Safety
                </Link>
              </li>
              <li>
                <Link to="/services?category=plumbing-water" className="hover:text-white transition">
                  Plumbing & Sanitation
                </Link>
              </li>
              <li>
                <Link to="/services?category=home-cleaning" className="hover:text-white transition">
                  Deep Sanitization & Hygiene
                </Link>
              </li>
              <li>
                <Link to="/services?category=carpentry-woodwork" className="hover:text-white transition">
                  Carpentry & Security
                </Link>
              </li>
              <li>
                <Link to="/services?category=painting-waterproofing" className="hover:text-white transition">
                  Painting & Waterproofing
                </Link>
              </li>
            </ul>
          </div>

          {/* Cooperative Model */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Cooperative Charter</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  How the Co-op Works
                </Link>
              </li>
              <li>
                <Link to="/about#governance" className="hover:text-white transition">
                  Democratic Governance
                </Link>
              </li>
              <li>
                <Link to="/about#dividends" className="hover:text-white transition">
                  Patronage Dividends (95% Pay)
                </Link>
              </li>
              <li>
                <Link to="/about#safety" className="hover:text-white transition">
                  Worker Emergency Fund
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Worker Co-owner Enrollment
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Community Care</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Cooperative Grievance Helpline</p>
                  <p className="text-white font-medium">1800-419-COOP (Toll Free)</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  Transparent 5% platform maintenance fee vs. 25-30% private corporate commission.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-emerald-400 text-xs font-medium border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Worker Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Cooperative Gig Services Platform. Built for Smart India Hackathon.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-400">Ethics & Principles</Link>
            <Link to="/contact" className="hover:text-slate-400">Grievance Redressal</Link>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for local workers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
