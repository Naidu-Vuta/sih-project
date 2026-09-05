import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminOverview, User } from '../../types';

type DashboardTab = 'OVERVIEW' | 'WORKERS' | 'USERS';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const date = (value?: string) => (value ? new Date(value).toLocaleDateString('en-IN') : 'Unknown');

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    try {
      setOverview(await adminService.getOverview());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    setLoadingWorkers(true);
    try {
      setWorkers(await adminService.getWorkers());
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Unable to load workers');
    } finally {
      setLoadingWorkers(false);
    }
  };

  const loadUsers = async (role = userRole) => {
    setLoadingUsers(true);
    try {
      setUsers(await adminService.getUsers(role || undefined));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Unable to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'WORKERS' && workers.length === 0) loadWorkers();
    if (activeTab === 'USERS') loadUsers();
  }, [activeTab]);

  const verify = async (worker: User, isVerified: boolean) => {
    setVerifyingId(worker.id);
    try {
      await adminService.verifyWorker(worker.id, isVerified);
      toast.success(isVerified ? `${worker.name} verified` : `${worker.name}'s verification revoked`);
      await Promise.all([loadOverview(), loadWorkers()]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Unable to update worker verification');
    } finally {
      setVerifyingId(null);
    }
  };

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
    { id: 'WORKERS', label: 'Worker verification', icon: UserCheck },
    { id: 'USERS', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            <ShieldCheck className="w-4 h-4" /> Admin portal
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">CoopGig operations</h1>
          <p className="mt-1 text-sm text-slate-600">Live platform analytics and management controls.</p>
        </div>
        <button onClick={loadOverview} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh analytics
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeTab === id ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && !overview ? (
        <div className="flex min-h-64 items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading analytics...</div>
      ) : activeTab === 'OVERVIEW' ? (
        <Overview overview={overview} />
      ) : activeTab === 'WORKERS' ? (
        <WorkerManagement workers={workers} loading={loadingWorkers} verifyingId={verifyingId} onVerify={verify} />
      ) : (
        <UserManagement users={users} loading={loadingUsers} role={userRole} onRoleChange={(role) => { setUserRole(role); loadUsers(role); }} />
      )}
    </div>
  );
};

const Overview: React.FC<{ overview: AdminOverview | null }> = ({ overview }) => {
  if (!overview) return null;
  const { kpis, coopMetric } = overview;
  const metrics = [
    ['Total bookings', kpis.totalBookings.toLocaleString('en-IN'), ClipboardList, 'text-blue-600 bg-blue-50'],
    ['Completed bookings', kpis.completedBookings.toLocaleString('en-IN'), CheckCircle2, 'text-emerald-600 bg-emerald-50'],
    ['Gross volume', money(kpis.grossVolume), DollarSign, 'text-amber-600 bg-amber-50'],
    ['Verified workers', `${kpis.verifiedWorkers} / ${kpis.totalWorkers}`, UserCheck, 'text-violet-600 bg-violet-50'],
  ] as const;

  return <div className="space-y-8">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label, value, Icon, colors]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-4 inline-flex rounded-xl p-2 ${colors}`}><Icon className="h-5 w-5" /></div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p></div>)}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Financial analytics</h2><div className="mt-5 grid grid-cols-2 gap-5 text-sm"><Metric label="Platform fees" value={money(kpis.platformFeeTotal)} /><Metric label="Fair wages" value={money(kpis.totalFairWages)} /><Metric label="Co-op dividends" value={money(kpis.totalDividends)} /><Metric label="Customers" value={kpis.totalCustomers.toLocaleString('en-IN')} /></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Cooperative health</h2>{coopMetric ? <div className="mt-5 grid grid-cols-2 gap-5 text-sm"><Metric label="Welfare pool" value={money(coopMetric.communityWelfarePool)} /><Metric label="Dividends distributed" value={money(coopMetric.totalDividendDistributed)} /><Metric label="Fair wages paid" value={money(coopMetric.totalFairWagesPaid)} /><Metric label="Member workers" value={coopMetric.workerMembersCount.toLocaleString('en-IN')} /></div> : <p className="mt-5 text-sm text-slate-500">No cooperative metric record is available.</p>}</section>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h2 className="text-lg font-bold text-slate-900">Recent bookings</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Booking</th><th className="px-6 py-3">Service</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Value</th></tr></thead><tbody className="divide-y divide-slate-100">{overview.recentBookings.map((booking) => <tr key={booking.id}><td className="px-6 py-4 font-semibold text-slate-900">{booking.bookingCode}</td><td className="px-6 py-4 text-slate-600">{booking.service.title}</td><td className="px-6 py-4 text-slate-600">{booking.customer.name}</td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{booking.status}</span></td><td className="px-6 py-4 font-semibold text-slate-900">{money(booking.totalPrice)}</td></tr>)}{overview.recentBookings.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No bookings found.</td></tr>}</tbody></table></div></section>
  </div>;
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => <div><p className="text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>;

const WorkerManagement: React.FC<{ workers: User[]; loading: boolean; verifyingId: string | null; onVerify: (worker: User, verified: boolean) => void }> = ({ workers, loading, verifyingId, onVerify }) => <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h2 className="text-lg font-bold text-slate-900">Worker verification</h2><p className="mt-1 text-sm text-slate-500">Review every worker account and manage verification status.</p></div>{loading ? <Loading /> : <div className="divide-y divide-slate-100">{workers.map((worker) => { const verified = worker.workerProfile?.isVerified ?? false; return <div key={worker.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-900">{worker.name}</p><p className="text-sm text-slate-500">{worker.email} {worker.workerProfile?.city ? `• ${worker.workerProfile.city}` : ''}</p><p className="mt-1 text-xs text-slate-400">Joined {date(worker.createdAt)} • {worker.workerProfile?.skills || 'Skills not provided'}</p></div><button onClick={() => onVerify(worker, !verified)} disabled={verifyingId === worker.id} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${verified ? 'border border-red-200 bg-white text-red-700 hover:bg-red-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'} disabled:opacity-60`}>{verifyingId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : verified ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}{verified ? 'Revoke verification' : 'Verify worker'}</button></div>; })}{workers.length === 0 && <p className="px-6 py-8 text-center text-slate-500">No workers found.</p>}</div>}</section>;

const UserManagement: React.FC<{ users: User[]; loading: boolean; role: string; onRoleChange: (role: string) => void }> = ({ users, loading, role, onRoleChange }) => <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-slate-900">User directory</h2><p className="mt-1 text-sm text-slate-500">Accounts currently stored in the platform.</p></div><select value={role} onChange={(event) => onRoleChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><option value="">All roles</option><option value="CUSTOMER">Customers</option><option value="WORKER">Workers</option><option value="ADMIN">Admins</option></select></div>{loading ? <Loading /> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Joined</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td><td className="px-6 py-4 text-slate-600">{user.email}</td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{user.role}</span></td><td className="px-6 py-4 text-slate-600">{date(user.createdAt)}</td></tr>)}{users.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>}</tbody></table></div>}</section>;

const Loading = () => <div className="flex items-center justify-center px-6 py-12 text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...</div>;

export default AdminDashboard;
