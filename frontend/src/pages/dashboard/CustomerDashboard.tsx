import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { customerService } from '../../services/customerService';
import { Booking, User, Notification, PaymentRecord } from '../../types';
import { ReviewModal } from '../../components/common/ReviewModal';
import { BookingModal } from '../../components/common/BookingModal';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Bookmark,
  Bell,
  CreditCard,
  FileText,
  User as UserIcon,
  Navigation,
  ArrowRight,
  Trash2,
  DollarSign,
  Check,
  Truck,
  Play,
  RotateCcw,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  'REQUESTED',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'PAID',
  'REVIEWED',
];

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'SAVED' | 'PAYMENTS' | 'NOTIFICATIONS'
  >('ACTIVE');

  // Data States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [rebookWorker, setRebookWorker] = useState<User | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [bookingsData, savedData, notifsData, paymentsData] = await Promise.all([
        bookingService.getCustomerBookings(),
        customerService.getSavedWorkers(),
        customerService.getNotifications(),
        customerService.getPaymentHistory(),
      ]);
      setBookings(bookingsData);
      setSavedWorkers(savedData);
      setNotifications(notifsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Customer dashboard load error', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.updateBookingStatus(id, 'CANCELLED');
      toast.success('Booking cancelled');
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handlePayBooking = async (id: string) => {
    try {
      await bookingService.updateBookingStatus(id, 'PAID', 'UPI');
      toast.success('Payment completed! ₹' + ' successfully credited directly to the craftsperson.');
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment failed');
    }
  };

  const handleRemoveSavedWorker = async (workerId: string) => {
    try {
      await customerService.toggleSaveWorker(workerId);
      setSavedWorkers((prev) => prev.filter((w) => w.id !== workerId));
      toast.success('Worker removed from saved list');
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await customerService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (id === 'all' || n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification(s) marked as read');
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  // Categorize Bookings
  const todayStr = new Date().toISOString().split('T')[0];

  const activeBookings = bookings.filter(
    (b) =>
      b.status === 'REQUESTED' ||
      b.status === 'ACCEPTED' ||
      b.status === 'ON_THE_WAY' ||
      b.status === 'ARRIVED' ||
      b.status === 'IN_PROGRESS' ||
      (b.status === 'COMPLETED' && b.paymentStatus === 'PENDING')
  );

  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === 'ACCEPTED' || b.status === 'REQUESTED') &&
      b.scheduledDate > todayStr
  );

  const completedBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED'
  );

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const getStepIndex = (status: string) => {
    const idx = WORKFLOW_STEPS.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/50 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Customer Co-op Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name}</h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Track active service dispatches, book verified neighborhood artisans, and audit transparent receipts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/workers"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Find & Book Workers</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ACTIVE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Bookings</span>
          {activeBookings.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
              {activeBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'UPCOMING'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed ({completedBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SAVED')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'SAVED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Workers ({savedWorkers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'PAYMENTS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment History</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {unreadNotifCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading your cooperative portal...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ACTIVE BOOKINGS with 8-Step Timeline */}
          {activeTab === 'ACTIVE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Active Service Requests</h2>
                <span className="text-xs text-slate-500">
                  Step-by-step dispatch updates from craftsperson
                </span>
              </div>

              {activeBookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Active Jobs Right Now</h3>
                  <p className="text-xs text-slate-500">
                    Need an electrician, plumber, or deep cleaner? Book verified neighborhood artisans with 95% fair direct pay.
                  </p>
                  <Link
                    to="/workers"
                    className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                  >
                    Browse Local Workers
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeBookings.map((booking) => {
                    const currentStepIdx = getStepIndex(booking.status);
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-sm space-y-6"
                      >
                        {/* Booking Header: ID, Title, Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                {booking.bookingCode}
                              </span>
                              <span className="text-xs text-slate-400">
                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mt-1">
                              {booking.service?.title}
                            </h3>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase">
                              Standard Amount
                            </span>
                            <span className="text-xl font-black text-slate-900">
                              ₹{booking.totalPrice}
                            </span>
                          </div>
                        </div>

                        {/* Interactive 8-Step Progress Workflow Tracker */}
                        <div className="space-y-2 py-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Service Workflow Timeline
                          </p>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center text-[10px]">
                            {WORKFLOW_STEPS.map((step, idx) => {
                              const isPastOrCurrent = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;
                              return (
                                <div
                                  key={step}
                                  className={`p-2 rounded-xl transition border ${
                                    isCurrent
                                      ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm scale-105'
                                      : isPastOrCurrent
                                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-emerald-200'
                                      : 'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}
                                >
                                  <span className="block truncate">{step.replace(/_/g, ' ')}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Details Grid: Scheduled Slot, Address, Job Description, Photo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>
                                <strong>Date:</strong> {booking.scheduledDate} ({booking.timeSlot})
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Location:</strong> {booking.address}, {booking.city}
                              </span>
                            </div>
                            {booking.jobDescription && (
                              <div className="pt-1">
                                <span className="font-semibold text-slate-800 block">Job Description:</span>
                                <p className="italic text-slate-600 mt-0.5">"{booking.jobDescription}"</p>
                              </div>
                            )}
                          </div>

                          {/* Assigned Worker Box */}
                          {booking.worker ? (
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    booking.worker.avatarUrl ||
                                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
                                  }
                                  alt={booking.worker.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-bold text-slate-900 text-xs">
                                      {booking.worker.name}
                                    </h4>
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <p className="text-[11px] text-emerald-700 font-medium">
                                    Verified Co-owner ({booking.worker.workerProfile?.rating || 5.0}★)
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    📞 {booking.worker.phone || 'Available via platform chat'}
                                  </p>
                                </div>
                              </div>

                              <Link
                                to={`/workers/${booking.worker.id}`}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                              >
                                View Profile
                              </Link>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                              <span className="text-xs">
                                Cooperative dispatcher is assigning a verified artisan in your area.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 text-xs">
                          <div className="text-slate-500">
                            Transparent Breakdown:{' '}
                            <strong className="text-emerald-700">
                              ₹{booking.workerEarning.toFixed(2)} (95%)
                            </strong>{' '}
                            to worker •{' '}
                            <span className="text-slate-600">
                              ₹{booking.platformFee.toFixed(2)} (5%)
                            </span>{' '}
                            co-op fund
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {booking.status === 'REQUESTED' && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold transition"
                              >
                                Cancel Request
                              </button>
                            )}

                            {booking.status === 'COMPLETED' && booking.paymentStatus === 'PENDING' && (
                              <button
                                onClick={() => handlePayBooking(booking.id)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>Pay Now (₹{booking.totalPrice})</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPCOMING BOOKINGS */}
          {activeTab === 'UPCOMING' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Upcoming Scheduled Jobs</h2>
              {upcomingBookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No upcoming scheduled jobs beyond today.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {b.bookingCode}
                        </span>
                        <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{b.service?.title}</h3>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>📅 Scheduled: {b.scheduledDate} ({b.timeSlot})</p>
                        <p>📍 Location: {b.address}, {b.city}</p>
                        <p>👤 Assigned Artisan: {b.worker?.name || 'Auto-matching'}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 text-sm">₹{b.totalPrice}</span>
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-rose-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLETED BOOKINGS */}
          {activeTab === 'COMPLETED' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Past & Completed Services</h2>
              {completedBookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No completed service records yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {b.bookingCode}
                          </span>
                          <span className="text-xs text-emerald-700 font-semibold">
                            ✓ {b.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{b.service?.title}</h4>
                        <p className="text-xs text-slate-500">
                          Serviced by: <strong>{b.worker?.name}</strong> • Completed on {b.scheduledDate}
                        </p>

                        {b.review && (
                          <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                            <span>You rated: {b.review.rating}/5 stars — "{b.review.comment}"</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-2">
                        <span className="text-lg font-black text-slate-900 block">
                          ₹{b.totalPrice}
                        </span>

                        {!b.review && (
                          <button
                            onClick={() => setSelectedBookingForReview(b)}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Rate Artisan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED WORKERS */}
          {activeTab === 'SAVED' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Your Bookmarked Craftspeople</h2>
                <span className="text-xs text-slate-500">{savedWorkers.length} saved pros</span>
              </div>

              {savedWorkers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Saved Workers Yet</h3>
                  <p className="text-xs text-slate-500">
                    Bookmark your favorite local electricians, plumbers, and carpenters for fast re-booking.
                  </p>
                  <Link
                    to="/workers"
                    className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Explore Directory
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              worker.avatarUrl ||
                              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
                            }
                            alt={worker.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                            <p className="text-xs text-emerald-700 font-semibold">
                              {worker.workerProfile?.skills.split(',')[0]}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{worker.workerProfile?.rating || 5.0}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSavedWorker(worker.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {worker.workerProfile?.bio}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          ₹{worker.workerProfile?.hourlyRate}/hr
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/workers/${worker.id}`}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium border border-slate-200"
                          >
                            Profile
                          </Link>
                          <button
                            onClick={() => setRebookWorker(worker)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            Book Again
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENT HISTORY */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Payment & Receipt Ledger</h2>
              {payments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No payment transactions recorded yet.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Artisan Paid</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Worker Wage (95%)</th>
                          <th className="py-3 px-4">Co-op Fund (5%)</th>
                          <th className="py-3 px-4">Total Paid</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                              {p.bookingCode}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {p.serviceTitle}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{p.workerName}</td>
                            <td className="py-3 px-4 text-slate-500">{p.date}</td>
                            <td className="py-3 px-4 text-emerald-700 font-bold">
                              ₹{p.workerShare.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              ₹{p.platformFee.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900">
                              ₹{p.totalPaid.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                PAID ({p.paymentMethod})
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
          )}

          {/* TAB 6: NOTIFICATIONS FEED */}
          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={() => handleMarkNotifRead('all')}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No notifications to display.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkNotifRead(n.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                        n.isRead
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-emerald-50/70 border-emerald-200 text-slate-900 font-medium'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSuccess={loadAllData}
        />
      )}

      {/* Rebook Saved Worker Modal */}
      {rebookWorker && (
        <BookingModal
          preselectedWorker={rebookWorker}
          onClose={() => setRebookWorker(null)}
          onSuccess={loadAllData}
        />
      )}
    </div>
  );
};
