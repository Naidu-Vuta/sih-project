import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workerService } from '../../services/workerService';
import { serviceService } from '../../services/serviceService';
import { customerService } from '../../services/customerService';
import { User, Service } from '../../types';
import { BookingModal } from '../../components/common/BookingModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Calendar,
  Languages,
  Award,
  CheckCircle2,
  Briefcase,
  Bookmark,
  ArrowLeft,
  Coins,
  ChevronRight,
  Phone,
  User as UserIcon,
} from 'lucide-react';

export const WorkerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [workerData, servicesData] = await Promise.all([
          workerService.getWorkerById(id),
          serviceService.getServices(),
        ]);
        setWorker(workerData);
        setServices(servicesData);

        // Check if saved
        if (user && user.role === 'CUSTOMER') {
          const savedList = await customerService.getSavedWorkers();
          setIsSaved(savedList.some((w) => w.id === id));
        }
      } catch (err) {
        console.error('Failed to load worker profile', err);
        toast.error('Worker profile not found');
        navigate('/workers');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, user, navigate]);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Please log in as customer to bookmark craftspeople');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      toast.error('Only customer accounts can bookmark workers');
      return;
    }
    if (!worker) return;

    try {
      const res = await customerService.toggleSaveWorker(worker.id);
      setIsSaved(res.isSaved);
      toast.success(res.isSaved ? 'Worker saved to bookmarks' : 'Worker removed from bookmarks');
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleOpenBooking = (serviceItem?: Service) => {
    if (serviceItem) {
      setSelectedService(serviceItem);
    } else {
      // Find matching trade or default
      const primarySkill = worker?.workerProfile?.skills.split(',')[0].trim().toLowerCase() || '';
      const matched =
        services.find((s) => s.title.toLowerCase().includes(primarySkill) || s.category?.name.toLowerCase().includes(primarySkill)) ||
        services[0];
      setSelectedService(matched || null);
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading craftsperson profile...</p>
        </div>
      </div>
    );
  }

  if (!worker || !worker.workerProfile) {
    return null;
  }

  const p = worker.workerProfile;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          to="/workers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Worker Directory</span>
        </Link>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <img
                src={
                  worker.avatarUrl ||
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200'
                }
                alt={worker.name}
                className="w-24 h-24 sm:w-28 sm:sm:h-28 rounded-3xl object-cover border-2 border-slate-200 shadow-md"
              />
              <div
                className={`absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm border-2 border-white ${
                  p.isAvailable ? 'bg-emerald-600' : 'bg-slate-500'
                }`}
              >
                {p.isAvailable ? 'Available' : 'Busy'}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{worker.name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Co-owner
                </span>
              </div>

              <p className="text-sm font-semibold text-emerald-700">{p.skills}</p>

              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{p.rating || 5.0}</span>
                  <span className="text-slate-400 font-normal">({p.totalReviews || 0} reviews)</span>
                </div>
                <span>•</span>
                <span>{p.experienceYears} Years Trade Experience</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {p.city} ({p.distanceKm || 2.5} km away)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl border text-xs font-semibold transition ${
                isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
              title={isSaved ? 'Remove from bookmarks' : 'Bookmark worker'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => handleOpenBooking()}
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Craftsperson</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hourly Price</span>
            <span className="text-lg font-black text-slate-900">₹{p.hourlyRate}/hr</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">95% fair direct wage</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completed Jobs</span>
            <span className="text-lg font-black text-emerald-800">{p.totalJobs || 25}+ Homes</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Verified neighborhood repairs</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Co-op Equity</span>
            <span className="text-lg font-black text-slate-900">{p.cooperativeShares} Shares</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Democratic voting co-owner</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Working Hours</span>
            <span className="text-xs font-bold text-slate-900 block mt-1">{p.workingHours}</span>
            <span className="text-[10px] text-slate-500 block">{p.workingDays}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Left + Reviews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Certifications, Service Area, Languages, Bio */}
        <div className="lg:col-span-7 space-y-6">
          {/* About / Bio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              About the Craftsperson
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {p.bio || 'Dedicated cooperative artisan providing high-quality, honest household service.'}
            </p>
          </div>

          {/* Certifications & Trade Credentials */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Certifications & Trade Credentials
            </h3>
            <div className="space-y-2">
              {p.certifications?.split(',').map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs font-semibold text-emerald-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{cert.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Area */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Covered Service Neighborhoods
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.serviceArea?.split(',').map((area, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700"
                >
                  📍 {area.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-600" />
              Languages Spoken
            </h3>
            <p className="text-xs text-slate-700 font-medium">{p.languages}</p>
          </div>
        </div>

        {/* Right Column: Customer Reviews & Ratings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Customer Reviews ({worker.reviewsReceived?.length || 0})
              </h3>
              <span className="text-xs font-extrabold text-amber-500">
                {p.rating || 5.0} / 5.0 Rating
              </span>
            </div>

            {(!worker.reviewsReceived || worker.reviewsReceived.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No reviews yet for this artisan. Be the first to book and rate!
              </div>
            ) : (
              <div className="space-y-3">
                {worker.reviewsReceived.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-center">
                          {rev.customer?.name ? rev.customer.name.charAt(0) : 'C'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {rev.customer?.name || 'Verified Customer'}
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          preselectedWorker={worker}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};
