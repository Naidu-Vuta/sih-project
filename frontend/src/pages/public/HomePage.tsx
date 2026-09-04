import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Award,
  ArrowRight,
  Zap,
  Wrench,
  Sparkles,
  Hammer,
  Paintbrush,
  HeartHandshake,
  TrendingUp,
  CheckCircle,
  XCircle,
  Star,
  Coins,
} from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { workerService } from '../../services/workerService';
import { Service, User, Category } from '../../types';
import { BookingModal } from '../../components/common/BookingModal';
import api from '../../services/api';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<any>({
    totalFairWagesPaid: 412500,
    workerMembersCount: 42,
    totalDividendDistributed: 48950,
    communityWelfarePool: 87400,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, servs, wks, healthRes] = await Promise.all([
          serviceService.getCategories(),
          serviceService.getServices(),
          workerService.getPublicWorkers(),
          api.get('/health'),
        ]);
        setCategories(cats.slice(0, 6));
        setFeaturedServices(servs.slice(0, 4));
        setWorkers(wks.slice(0, 3));
        if (healthRes.data?.cooperativeMetrics) {
          setPlatformMetrics(healthRes.data.cooperativeMetrics);
        }
      } catch (err) {
        console.error('Home data load error', err);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'electrical-wiring':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'plumbing-water':
        return <Wrench className="w-6 h-6 text-sky-500" />;
      case 'home-cleaning':
        return <Sparkles className="w-6 h-6 text-emerald-500" />;
      case 'carpentry-woodwork':
        return <Hammer className="w-6 h-6 text-orange-500" />;
      case 'painting-waterproofing':
        return <Paintbrush className="w-6 h-6 text-purple-500" />;
      default:
        return <HeartHandshake className="w-6 h-6 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
                <Users className="w-3.5 h-3.5" />
                <span>Next-Gen Platform Cooperativism • SIH 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Empowering Workers.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                  Serving Communities.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
                A worker-owned gig services cooperative replacing predatory intermediary commissions with democratic ownership, 95% guaranteed fair direct pay, patronage dividends, and vetted neighborhood craftsmanship.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/services"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Book a Verified Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur transition flex items-center gap-2"
                >
                  <span>Join as Worker Co-owner</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-emerald-700/50 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-2xl font-bold text-emerald-300">95%</p>
                  <p className="text-xs text-emerald-200/80">Direct Worker Wage</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-300">100%</p>
                  <p className="text-xs text-emerald-200/80">Verified Local Pros</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-300">5%</p>
                  <p className="text-xs text-emerald-200/80">Reinvested Platform Fee</p>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Transparency Box */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-300" />
                    <span className="font-bold text-sm tracking-wide uppercase text-emerald-200">
                      Cooperative Transparency Model
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                    Per ₹1000 Service
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-emerald-200">Direct Craftsperson Payout</span>
                      <span className="text-emerald-300 font-bold">₹950 (95%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-400 h-2.5 rounded-full w-[95%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">Emergency & Healthcare Pool</span>
                      <span className="text-teal-300 font-bold">₹30 (3%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-teal-400 h-2.5 rounded-full w-[3%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">Tech & Community Operations</span>
                      <span className="text-slate-300 font-bold">₹20 (2%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-slate-400 h-2.5 rounded-full w-[2%]"></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Award className="w-4 h-4" />
                    Annual Patronage Dividend
                  </div>
                  Surplus generated across the year is redistributed back to worker members proportional to completed jobs. Every worker holds a voting equity share!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Cooperative Impact Ledger */}
      <section className="-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Coins className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fair Wages Paid</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{platformMetrics.totalFairWagesPaid.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">95% delivered directly to artisans</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Worker Co-owners</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {platformMetrics.workerMembersCount}
            </p>
            <p className="text-[11px] text-teal-700 mt-1 font-medium">Equal voting voting members</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dividends Distributed</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{platformMetrics.totalDividendDistributed.toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-700 mt-1 font-medium">Patronage profit shares earned</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Welfare Pool</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{platformMetrics.communityWelfarePool.toLocaleString()}
            </p>
            <p className="text-[11px] text-indigo-700 mt-1 font-medium">Health & accident safety fund</p>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Essential Trades
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
            Verified Local Crafts for Every Home
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Standardized rates, vetted safety inspections, and background-verified cooperative members.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/services?category=${cat.slug}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition">
                {getCategoryIcon(cat.slug)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {cat._count?.services ? `${cat._count.services} Services` : 'Verified Pros'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Services Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Popular Bookings
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Top Household Services
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>View all services catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {service.imageUrl && (
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-800 shadow-sm">
                    {service.durationEst}
                  </div>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                    {service.category?.name || 'Household Service'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Standard Rate</span>
                    <span className="text-lg font-extrabold text-slate-900">₹{service.basePrice}</span>
                  </div>
                  <button
                    onClick={() => setSelectedService(service)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cooperative vs. Extractive Gig Monopolies Comparison */}
      <section className="bg-slate-100/80 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
              Why Cooperatives Win
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Traditional Gig Platforms vs. The Cooperative Model
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              How democratic worker ownership changes the economics for workers and customers alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Corporate Gig Monopoly */}
            <div className="bg-white p-7 rounded-2xl border border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <h3 className="font-bold text-base text-rose-900">Extractive Corporate Platforms</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                  Middleman Extraction
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>25% – 30% commission</strong> deducted from every completed job.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Opaque black-box algorithmic penalties, deactivations with no human appeal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Workers have zero ownership, zero equity, and no voice in pricing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>All surplus value exits local communities into venture capital dividends.</span>
                </li>
              </ul>
            </div>

            {/* Cooperative Platform */}
            <div className="bg-white p-7 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4 relative">
              <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Our Model
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <h3 className="font-bold text-base text-emerald-950">Cooperative Platform (CoopGig)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  Worker-Owned
                </span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>95% direct wage</strong>; only 5% transparent fee for platform sustainability.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Democratic governance: <strong>1 Worker = 1 Vote</strong> on platform policies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Annual patronage dividends paid out to workers based on platform surplus.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated emergency healthcare and tool-upgrade solidarity fund.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Worker Co-owners Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Meet the Member-Owners
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Verified Neighborhood Professionals
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Every professional on CoopGig is a verified co-owner invested in top craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={worker.avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                  alt={worker.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base">{worker.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">
                    {worker.workerProfile?.skills.split(',')[0]}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {worker.workerProfile?.rating || '5.0'}
                    </span>
                    <span>•</span>
                    <span>{worker.workerProfile?.experienceYears || 5} yrs exp</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                "{worker.workerProfile?.bio}"
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Cooperative Equity</span>
                  <span className="font-bold text-emerald-800">
                    {worker.workerProfile?.cooperativeShares || 1} Member Shares
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Completed Jobs</span>
                  <span className="font-bold text-slate-800">
                    {worker.workerProfile?.totalJobs || 25}+ Homes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};
