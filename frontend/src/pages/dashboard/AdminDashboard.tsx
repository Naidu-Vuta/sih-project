import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AdminOverview, User } from '../../types';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  TrendingUp,
  AlertCircle,
  Building,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WORKERS' | 'BOOKINGS'>('OVERVIEW');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, wkData] = await Promise.all([
        adminService.getOverview(),
        adminService.getWorkers(),
      ]);
      setOverview(ovData);
      setWorkers(wkData);
    } catch (err) {
      console.error('Failed to load admin data', err);
      toast.error('Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyWorker = async (workerId: string, isVerified: boolean) => {
    try {
      await adminService.verifyWorker(workerId, isVerified, isVerified ? 5 : 1);
      toast.success(
        isVerified
          ? 'Worker successfully verified and inducted with member equity shares!'
          : 'Worker verification revoked'
      );
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Verification action failed');
    }
  };

  const pendingWorkers = workers.filter((w) => !w.workerProfile?.isVerified);
  const verifiedWorkers = workers.filter((w) => w.workerProfile?.isVerified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-emerald-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cooperative Administrative Oversight Council</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Platform Operations & Governance
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            Monitor fair trade metrics, verify applicant artisans, and audit cooperative fund balances.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'OVERVIEW' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('WORKERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'WORKERS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Worker KYC</span>
            {pendingWorkers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {pendingWorkers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'BOOKINGS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Bookings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Retrieving cooperative platform telemetry...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab Content */}
          {activeTab === 'OVERVIEW' && overview && (
            <div className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Verified Workers
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900">
                      {overview.kpis.verifiedWorkers}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">
                      ({overview.kpis.pendingVerifications} Pending)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Cooperative equity co-owners</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Total Bookings
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">
                    {overview.kpis.totalBookings}
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                    {overview.kpis.completedBookings} Completed Successfully
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Gross Volume (GTV)
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">
                    ₹{overview.kpis.grossVolume.toLocaleString()}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Total transaction value</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Worker Direct Pay (95%)
                  </span>
                  <span className="text-3xl font-black text-emerald-700 mt-1 block">
                    ₹{overview.kpis.totalFairWages.toLocaleString()}
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                    Delivered with zero intermediary cut
                  </p>
                </div>
              </div>

              {/* Cooperative Ledger Balances */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Cooperative Reserve & Solidarity Fund</h3>
                    <p className="text-xs text-slate-500">Funded transparently by the 5% platform maintenance allocation</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                    Audit Status: Healthy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Community Welfare Pool</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      ₹{overview.coopMetric.communityWelfarePool.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Emergency healthcare & tool upgrades</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Patronage Dividends Distributed</p>
                    <p className="text-2xl font-black text-teal-800 mt-1">
                      ₹{overview.coopMetric.totalDividendDistributed.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Surplus redistributed to member-owners</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Platform Tech Operations Fee</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      ₹{overview.kpis.platformFeeTotal.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Server maintenance & customer dispatch</p>
                  </div>
                </div>
              </div>

              {/* Pending Verifications Notice */}
              {pendingWorkers.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        {pendingWorkers.length} Worker Applicant(s) Awaiting KYC Verification
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        New artisans are awaiting credentials review before being dispatched to households.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('WORKERS')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    Review Applicants
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Workers Management Tab */}
          {activeTab === 'WORKERS' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Worker Co-owners Verification Queue</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure all service professionals meet background, safety, and trade excellence standards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 ${
                      worker.workerProfile?.isVerified ? 'border-slate-200' : 'border-amber-300 ring-2 ring-amber-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                          alt={worker.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{worker.name}</h3>
                            {worker.workerProfile?.isVerified ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Pending KYC
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{worker.email} • {worker.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                      <p><strong>Trade & Skills:</strong> {worker.workerProfile?.skills}</p>
                      <p><strong>Experience:</strong> {worker.workerProfile?.experienceYears} years • <strong>Hourly Rate:</strong> ₹{worker.workerProfile?.hourlyRate}/hr</p>
                      <p><strong>Bio:</strong> {worker.workerProfile?.bio}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {worker.workerProfile?.isVerified
                          ? `${worker.workerProfile.cooperativeShares} Member Equity Shares`
                          : 'Pending member induction'}
                      </span>

                      <div>
                        {worker.workerProfile?.isVerified ? (
                          <button
                            onClick={() => handleVerifyWorker(worker.id, false)}
                            className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                          >
                            Revoke Verification
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyWorker(worker.id, true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify & Grant Co-op Equity</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings Oversight Tab */}
          {activeTab === 'BOOKINGS' && overview && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Platform Bookings</h2>
                <p className="text-xs text-slate-500 mt-1">Real-time audit log of community service dispatches</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Artisan Worker</th>
                        <th className="py-3 px-4">Date & Slot</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {b.service?.title}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {b.customer?.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {b.worker?.name || <span className="text-amber-600 italic">Unassigned</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {b.scheduledDate}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{b.totalPrice}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'IN_PROGRESS'
                                  ? 'bg-purple-100 text-purple-800'
                                  : b.status === 'CONFIRMED'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
