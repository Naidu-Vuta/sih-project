import React from 'react';
import {
  Users,
  ShieldCheck,
  Scale,
  Award,
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
  Lock,
  Coins,
  Building,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
          The Platform Cooperativism Manifesto
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          A Better Way to Work.{' '}
          <span className="text-emerald-600">A Better Way to Serve.</span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          CoopGig was founded on a simple truth: the people who repair our power grids, fix our pipes, and keep our living spaces clean deserve dignity, equity, and ownership of the digital tools they use every day.
        </p>
      </div>

      {/* The Cooperative Difference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Democratic Governance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In our cooperative, workers are not "independent contractors" subjected to opaque algorithms. Every verified artisan receives member equity and has 1 vote on platform policies, commission rates, and safety guidelines.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">95% Guaranteed Pay</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Corporate gig monopolies extract 25% to 30% from every service. CoopGig operates on a lean 5% platform maintenance fee. 95% goes directly to the worker who actually did the hard physical labor.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Patronage Dividends</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Because our platform is worker-owned, any operational surplus at the end of each fiscal cycle is redistributed directly back to member workers based on their completed jobs.
          </p>
        </div>
      </div>

      {/* Financial Transparency Architecture */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Open Ledger Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            Where Does Every Rupee Go?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Unlike private corporations whose revenues vanish into venture capital funds and speculative marketing, every transaction is accounted for on our cooperative ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-3xl font-black text-emerald-300">95%</span>
            <h4 className="text-base font-bold text-white mt-1">Direct Worker Payout</h4>
            <p className="text-xs text-slate-300 mt-2">
              Paid immediately to the artisan’s bank account or UPI after customer confirmation.
            </p>
          </div>

          <div className="p-6 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-3xl font-black text-teal-300">3%</span>
            <h4 className="text-base font-bold text-white mt-1">Emergency & Health Pool</h4>
            <p className="text-xs text-slate-300 mt-2">
              Provides accident insurance, healthcare coverage, and interest-free tool repair loans for active members.
            </p>
          </div>

          <div className="p-6 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-3xl font-black text-amber-300">2%</span>
            <h4 className="text-base font-bold text-white mt-1">Tech Maintenance & Server Costs</h4>
            <p className="text-xs text-slate-300 mt-2">
              Maintains high-availability cloud servers, database backups, verification systems, and helpline staff.
            </p>
          </div>
        </div>
      </div>

      {/* 7 Cooperative Principles */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">
            Guided by International Cooperative Principles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Built following the International Co-operative Alliance (ICA) framework.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '1. Voluntary & Open Membership',
              desc: 'Open to all qualified local tradespeople without gender, racial, or social discrimination.',
            },
            {
              title: '2. Democratic Member Control',
              desc: 'One member, one vote. Decisions are guided by worker assemblies and elected committees.',
            },
            {
              title: '3. Member Economic Participation',
              desc: 'Surplus capital benefits members proportionally through dividends and welfare services.',
            },
            {
              title: '4. Autonomy & Independence',
              desc: 'Controlled by the workers who create the value, ensuring no corporate takeover.',
            },
            {
              title: '5. Education & Upskilling',
              desc: 'Regular certification workshops, electrical safety training, and tool upgrade guidance.',
            },
            {
              title: '6. Concern for Community',
              desc: 'Sustainable local economic development, fair pricing for households, and subsidized elderly assistance.',
            },
          ].map((principle, idx) => (
            <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{principle.title}</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-5.5">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
