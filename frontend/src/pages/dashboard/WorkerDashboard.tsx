import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workerService } from '../../services/workerService';
import { bookingService } from '../../services/bookingService';
import { WorkerStats, Booking, WorkerEarningsAnalytics } from '../../types';
import toast from 'react-hot-toast';
import {
  Wrench,
  ShieldCheck,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
  Coins,
  Award,
  AlertCircle,
  Play,
  CheckCircle2,
  XCircle,
  User,
  Star,
  Zap,
  Phone,
  Image,
  Navigation,
  Edit3,
  Save,
  Check,
  X,
  CreditCard,
  Briefcase,
  DollarSign,
  Truck,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'JOBS' | 'SCHEDULE' | 'PROFILE' | 'EARNINGS'>('JOBS');

  // Data States
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<WorkerEarningsAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  // Profile Edit Form State
  const [profileName, setProfileName] = useState<string>('');
  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [profileSkills, setProfileSkills] = useState<string>('');
  const [profileExperience, setProfileExperience] = useState<number>(2);
  const [profileHourlyRate, setProfileHourlyRate] = useState<number>(350);
  const [profileCertifications, setProfileCertifications] = useState<string>('');
  const [profileServiceArea, setProfileServiceArea] = useState<string>('');
  const [profileLanguages, setProfileLanguages] = useState<string>('');
  const [profileBio, setProfileBio] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Schedule Form State
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [workingHours, setWorkingHours] = useState<string>('08:00 AM - 07:00 PM');
  const [unavailableDates, setUnavailableDates] = useState<string>('');
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData, earningsData] = await Promise.all([
        workerService.getStats(),
        bookingService.getWorkerBookings(),
        workerService.getEarnings(),
      ]);

      setStats(statsData);
      setBookings(bookingsData);
      setEarnings(earningsData);
      setIsAvailable(statsData.availability);

      // Populate edit states
      if (statsData.profile) {
        const p = statsData.profile;
        setProfileName(user?.name || '');
        setProfileAvatar(user?.avatarUrl || '');
        setProfileSkills(p.skills || '');
        setProfileExperience(p.experienceYears || 2);
        setProfileHourlyRate(p.hourlyRate || 350);
        setProfileCertifications(p.certifications || '');
        setProfileServiceArea(p.serviceArea || '');
        setProfileLanguages(p.languages || '');
        setProfileBio(p.bio || '');

        if (p.workingDays) {
          setWorkingDays(p.workingDays.split(',').map((d) => d.trim()));
        }
        if (p.workingHours) {
          setWorkingHours(p.workingHours);
        }
        if (p.unavailableDates) {
          setUnavailableDates(p.unavailableDates);
        }
      }
    } catch (err) {
      console.error('Failed to load worker data', err);
      toast.error('Error loading worker dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const nextState = !isAvailable;
      await workerService.toggleAvailability(nextState);
      setIsAvailable(nextState);
      toast.success(
        nextState ? 'Status: Available for new neighborhood jobs' : 'Status: Off Duty / Busy'
      );
    } catch (err) {
      toast.error('Failed to update duty availability');
    } finally {
      setToggling(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking status advanced to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await workerService.updateProfile({
        name: profileName,
        avatarUrl: profileAvatar,
        skills: profileSkills,
        experienceYears: Number(profileExperience),
        hourlyRate: Number(profileHourlyRate),
        certifications: profileCertifications,
        serviceArea: profileServiceArea,
        languages: profileLanguages,
        bio: profileBio,
      });
      toast.success('Worker credentials and profile updated!');
      await refreshUser();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSchedule(true);
    try {
      await workerService.updateSchedule({
        workingDays: workingDays.join(','),
        workingHours,
        unavailableDates,
      });
      toast.success('Weekly availability schedule and leave dates saved!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update schedule');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Job Categories
  const incomingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const activeJobs = bookings.filter(
    (b) =>
      b.status === 'ACCEPTED' ||
      b.status === 'ON_THE_WAY' ||
      b.status === 'ARRIVED' ||
      b.status === 'IN_PROGRESS'
  );
  const completedJobs = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-emerald-800/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Cooperative Worker Co-owner #{user?.workerProfile?.cooperativeShares || 1}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Primary Trade: <strong className="text-emerald-200">{user?.workerProfile?.skills}</strong> • Base Rate: ₹{user?.workerProfile?.hourlyRate}/hr
          </p>
        </div>

        {/* Live Availability Toggle */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              Work Duty Status
            </p>
            <p className="text-sm font-bold">
              {isAvailable ? '🟢 Available for Jobs' : '⚪ Busy / Off Duty'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isAvailable
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isAvailable ? 'Go Off Duty' : 'Go Available'}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'JOBS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Dispatch Center</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-bounce">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULE')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'SCHEDULE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Working Schedule & Leave</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'PROFILE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('EARNINGS')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'EARNINGS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Earnings & Dividends</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading worker workspace...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: JOBS MANAGEMENT */}
          {activeTab === 'JOBS' && (
            <div className="space-y-8">
              {/* Summary KPIs */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Today's Jobs
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {stats.jobCounts.today}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Active for today</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Active In-Progress
                    </span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {activeJobs.length}
                    </span>
                    <span className="text-[11px] text-purple-700 font-semibold">Under execution</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Total Direct Wages
                    </span>
                    <span className="text-2xl font-black text-emerald-800 mt-1 block">
                      ₹{stats.financials.totalEarned.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">95% payout rate</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Customer Rating
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-900">
                        {stats.profile.rating || 5.0}
                      </span>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {stats.profile.totalReviews} verified ratings
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION: Incoming Requests (status: REQUESTED) */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Incoming Job Requests</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                    {incomingRequests.length}
                  </span>
                </h2>

                {incomingRequests.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                    No new incoming requests right now. Keep your duty status set to Available!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {req.bookingCode}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">
                              {req.service?.title}
                            </h3>
                          </div>
                          <span className="text-lg font-black text-slate-900">
                            ₹{req.workerEarning.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl">
                          <p>
                            👤 Customer: <strong>{req.customer?.name}</strong> (📞 {req.customer?.phone || 'On file'})
                          </p>
                          <p>📅 Schedule: {req.scheduledDate} ({req.timeSlot})</p>
                          <p>📍 Address: {req.address}, {req.city}</p>
                          {req.jobDescription && (
                            <p className="italic text-slate-700 pt-1">
                              "{req.jobDescription}"
                            </p>
                          )}
                          {req.serviceImage && (
                            <div className="pt-2">
                              <span className="text-[10px] text-slate-400 block mb-1">Customer Photo:</span>
                              <img
                                src={req.serviceImage}
                                alt="Job site"
                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                              />
                            </div>
                          )}
                        </div>

                        {/* Accept / Reject Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold border border-rose-200 transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Booking</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: Active Ongoing Jobs */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Active Ongoing Jobs ({activeJobs.length})</span>
                </h2>

                {activeJobs.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                    No active jobs in execution right now. Accept an incoming request above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {job.bookingCode}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">
                              {job.service?.title}
                            </h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                            {job.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl">
                          <p>👤 Customer: <strong>{job.customer?.name}</strong> (📞 {job.customer?.phone || 'On file'})</p>
                          <p>📅 Schedule: {job.scheduledDate} ({job.timeSlot})</p>
                          <p>📍 Location: {job.address}, {job.city}</p>
                          {job.jobDescription && (
                            <p className="italic text-slate-700 pt-1">
                              "{job.jobDescription}"
                            </p>
                          )}
                          {job.serviceImage && (
                            <div className="pt-2">
                              <img
                                src={job.serviceImage}
                                alt="Job site"
                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                              />
                            </div>
                          )}
                        </div>

                        {/* Step by step action buttons for Worker */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Your Pay (95%)</span>
                            <span className="text-base font-black text-emerald-800">
                              ₹{job.workerEarning.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {job.status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleUpdateStatus(job.id, 'ON_THE_WAY')}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Depart (On The Way)</span>
                              </button>
                            )}

                            {job.status === 'ON_THE_WAY' && (
                              <button
                                onClick={() => handleUpdateStatus(job.id, 'ARRIVED')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Mark Arrived</span>
                              </button>
                            )}

                            {job.status === 'ARRIVED' && (
                              <button
                                onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Start Work</span>
                              </button>
                            )}

                            {job.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete Work</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & AVAILABILITY */}
          {activeTab === 'SCHEDULE' && (
            <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Working Days & Schedule</h2>
                <p className="text-xs text-slate-500">
                  Customers can only book time slots according to your configured working schedule.
                </p>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-6">
                {/* Working Days Checkboxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Active Working Days
                  </label>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const active = workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWorkingDay(day)}
                          className={`py-2.5 rounded-xl font-bold transition border ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Daily Service Hours
                  </label>
                  <input
                    type="text"
                    required
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="08:00 AM - 07:00 PM"
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <span className="text-[11px] text-slate-400">
                    Example: 08:00 AM - 07:00 PM, or 09:00 AM - 06:00 PM
                  </span>
                </div>

                {/* Unavailable / Leave Dates */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Mark Unavailable Dates (Leave / Holidays)
                  </label>
                  <input
                    type="text"
                    value={unavailableDates}
                    onChange={(e) => setUnavailableDates(e.target.value)}
                    placeholder="e.g. 2026-09-15, 2026-09-20, 2026-10-02"
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <span className="text-[11px] text-slate-400">
                    Comma-separated dates (YYYY-MM-DD) when you will not accept new bookings.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSchedule}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSchedule ? 'Saving...' : 'Save Schedule Settings'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROFILE MANAGEMENT */}
          {activeTab === 'PROFILE' && (
            <div className="max-w-3xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Worker Profile & Credentials</h2>
                <p className="text-xs text-slate-500">
                  Update your public profile, certifications, languages, and pricing shown to households.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Skills / Trades
                    </label>
                    <input
                      type="text"
                      required
                      value={profileSkills}
                      onChange={(e) => setProfileSkills(e.target.value)}
                      placeholder="e.g. Electrical, AC Repair"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      min={150}
                      value={profileHourlyRate}
                      onChange={(e) => setProfileHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Years Experience
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={profileExperience}
                      onChange={(e) => setProfileExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trade Certifications & Licenses
                  </label>
                  <input
                    type="text"
                    value={profileCertifications}
                    onChange={(e) => setProfileCertifications(e.target.value)}
                    placeholder="e.g. Govt Skill India Certified, Master License #8821"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Covered Neighborhoods (Service Area)
                    </label>
                    <input
                      type="text"
                      value={profileServiceArea}
                      onChange={(e) => setProfileServiceArea(e.target.value)}
                      placeholder="e.g. Indiranagar, Koramangala, Bellandur"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      value={profileLanguages}
                      onChange={(e) => setProfileLanguages(e.target.value)}
                      placeholder="e.g. English, Hindi, Kannada"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: EARNINGS ANALYTICS */}
          {activeTab === 'EARNINGS' && earnings && (
            <div className="space-y-8">
              {/* Earnings Cards: Daily, Weekly, Monthly, Total */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Today's Earnings
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">
                    ₹{earnings.dailyEarnings.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">95% fair direct wage</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Weekly (Last 7 Days)
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">
                    ₹{earnings.weeklyEarnings.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Completed assignments</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Monthly (Last 30 Days)
                  </span>
                  <span className="text-3xl font-black text-slate-900 mt-1 block">
                    ₹{earnings.monthlyEarnings.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Full cycle gross wage</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    All-Time Direct Pay
                  </span>
                  <span className="text-3xl font-black text-emerald-800 mt-1 block">
                    ₹{earnings.totalEarnings.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-teal-700 font-bold block mt-0.5">
                    +₹{earnings.coopDividendEarned.toFixed(2)} Patronage Dividends
                  </span>
                </div>
              </div>

              {/* Payment History Ledger */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Payment & Payout History</h3>

                {earnings.paymentHistory.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                    No settled payments yet.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                          <tr>
                            <th className="py-3 px-4">Booking ID</th>
                            <th className="py-3 px-4">Service</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Direct Pay (95%)</th>
                            <th className="py-3 px-4">Dividend Credited</th>
                            <th className="py-3 px-4">Method</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {earnings.paymentHistory.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                                {p.bookingCode}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-900">{p.serviceTitle}</td>
                              <td className="py-3 px-4 text-slate-600">{p.customerName}</td>
                              <td className="py-3 px-4 text-slate-500">{p.date}</td>
                              <td className="py-3 px-4 font-bold text-emerald-800">
                                ₹{p.workerEarning.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-teal-700 font-semibold">
                                +₹{p.coopDividendShare.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  SETTLED
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
