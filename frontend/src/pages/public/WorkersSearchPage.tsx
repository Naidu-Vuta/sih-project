import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { workerService } from '../../services/workerService';
import { serviceService } from '../../services/serviceService';
import { customerService } from '../../services/customerService';
import { User, Service, Category } from '../../types';
import { BookingModal } from '../../components/common/BookingModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Bookmark,
  Clock,
  Coins,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Eye,
  Navigation,
} from 'lucide-react';

export const WorkersSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [workers, setWorkers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [savedWorkerIds, setSavedWorkerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [selectedSkill, setSelectedSkill] = useState<string>(searchParams.get('skill') || '');
  const [locationQuery, setLocationQuery] = useState<string>(searchParams.get('location') || '');
  const [maxDistance, setMaxDistance] = useState<number>(Number(searchParams.get('distance')) || 25);
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get('rating')) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('maxPrice')) || 600);
  const [availableOnly, setAvailableOnly] = useState<boolean>(searchParams.get('available') === 'true');

  // Booking Modal
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<User | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  // Load Categories & Initial Data
  useEffect(() => {
    const initData = async () => {
      try {
        const [cats, servs] = await Promise.all([
          serviceService.getCategories(),
          serviceService.getServices(),
        ]);
        setCategories(cats);
        setServices(servs);

        if (user && user.role === 'CUSTOMER') {
          const saved = await customerService.getSavedWorkers();
          setSavedWorkerIds(saved.map((w) => w.id));
        }
      } catch (err) {
        console.error('Failed loading categories', err);
      }
    };
    initData();
  }, [user]);

  // Fetch Workers when filters change
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await workerService.getPublicWorkers({
        skill: selectedSkill || undefined,
        location: locationQuery || undefined,
        maxDistance: maxDistance < 25 ? maxDistance : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        maxPrice: maxPrice < 600 ? maxPrice : undefined,
        available: availableOnly ? true : undefined,
      });
      setWorkers(data);
    } catch (err) {
      console.error('Error searching workers', err);
      toast.error('Failed to search workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedSkill, locationQuery, maxDistance, minRating, maxPrice, availableOnly]);

  const handleResetFilters = () => {
    setSelectedSkill('');
    setLocationQuery('');
    setMaxDistance(25);
    setMinRating(0);
    setMaxPrice(600);
    setAvailableOnly(false);
  };

  const handleToggleSave = async (workerId: string) => {
    if (!user) {
      toast.error('Please log in as a customer to save workers');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      toast.error('Only customers can bookmark workers');
      return;
    }

    try {
      const res = await customerService.toggleSaveWorker(workerId);
      if (res.isSaved) {
        setSavedWorkerIds((prev) => [...prev, workerId]);
        toast.success('Worker saved to your bookmarks!');
      } else {
        setSavedWorkerIds((prev) => prev.filter((id) => id !== workerId));
        toast.success('Worker removed from saved list');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update saved worker');
    }
  };

  const handleBookWorker = (worker: User) => {
    // Find matching service for this worker's trade, or default to first service
    const workerSkill = worker.workerProfile?.skills.split(',')[0].trim().toLowerCase() || '';
    const matchedService =
      services.find((s) => s.title.toLowerCase().includes(workerSkill) || s.category?.name.toLowerCase().includes(workerSkill)) ||
      services[0];

    setSelectedWorkerForBooking(worker);
    setSelectedServiceForBooking(matchedService || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
          Neighborhood Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Find Verified Local Craftspeople
        </h1>
        <p className="text-sm text-slate-600">
          Filter certified cooperative artisans by trade, distance, neighborhood, hourly price, and verified customer ratings.
        </p>
      </div>

      {/* Main Container: Sidebar Filters + Worker Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Filter Workers
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Skill / Trade Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Service / Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="">All Services & Trades</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location / Area Search */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Locality / Neighborhood
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. Indiranagar, Bellandur, Koramangala"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Distance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="uppercase tracking-wider">Distance Range</span>
              <span className="text-emerald-700 font-extrabold">{maxDistance >= 25 ? 'Any Distance' : `< ${maxDistance} km`}</span>
            </div>
            <input
              type="range"
              min={2}
              max={25}
              step={1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>2 km</span>
              <span>10 km</span>
              <span>25+ km</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Minimum Rating
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[0, 4.0, 4.5, 4.8].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setMinRating(rate)}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition border ${
                    minRating === rate
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {rate === 0 ? 'All' : `${rate}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Hourly Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="uppercase tracking-wider">Max Hourly Rate</span>
              <span className="text-emerald-700 font-extrabold">₹{maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min={250}
              max={600}
              step={25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>₹250</span>
              <span>₹400</span>
              <span>₹600</span>
            </div>
          </div>

          {/* Live Availability Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Available Today Only</span>
                <span className="text-[11px] text-slate-500">Show pros on active duty right now</span>
              </div>
            </label>
          </div>
        </aside>

        {/* Right Workers List */}
        <main className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              Showing <span className="text-emerald-700 font-bold">{workers.length}</span> verified cooperative craftspeople
            </span>
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              ⚡ 95% direct wage guarantee
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500">Finding nearby cooperative workers...</p>
            </div>
          ) : workers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Workers Matched Filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your distance range, adjusting the maximum price, or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workers.map((worker) => {
                const isSaved = savedWorkerIds.includes(worker.id);
                return (
                  <div
                    key={worker.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
                  >
                    {/* Worker Card Top: Photo, Name, Verified Badge, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={
                              worker.avatarUrl ||
                              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
                            }
                            alt={worker.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              worker.workerProfile?.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                            title={worker.workerProfile?.isAvailable ? 'Available Now' : 'Busy / Off Duty'}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-base">{worker.name}</h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600">
                            <span className="flex items-center font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                              {worker.workerProfile?.rating || '5.0'}
                            </span>
                            <span>({worker.workerProfile?.totalReviews || 0} reviews)</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              {worker.workerProfile?.experienceYears} yrs exp
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <Navigation className="w-3 h-3 text-emerald-600" />
                            <span>{worker.workerProfile?.distanceKm || 2.4} km away</span>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{worker.workerProfile?.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleToggleSave(worker.id)}
                        className={`p-2 rounded-xl transition ${
                          isSaved
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save worker'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Skills Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {worker.workerProfile?.skills.split(',').map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Certifications or Bio Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                      "{worker.workerProfile?.bio}"
                    </p>

                    {/* Card Stats Bar: Rate & Completed Jobs */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Starting Rate</span>
                        <span className="font-extrabold text-slate-900">
                          ₹{worker.workerProfile?.hourlyRate}/hr
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Jobs Done</span>
                        <span className="font-extrabold text-emerald-800">
                          {worker.workerProfile?.totalJobs || 0}+
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                        <span
                          className={`font-bold text-[11px] ${
                            worker.workerProfile?.isAvailable ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {worker.workerProfile?.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: View Profile & Book Now */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                      <Link
                        to={`/workers/${worker.id}`}
                        className="py-2.5 px-3 text-center rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Profile</span>
                      </Link>

                      <button
                        onClick={() => handleBookWorker(worker)}
                        className="py-2.5 px-3 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {selectedWorkerForBooking && selectedServiceForBooking && (
        <BookingModal
          service={selectedServiceForBooking}
          preselectedWorker={selectedWorkerForBooking}
          onClose={() => {
            setSelectedWorkerForBooking(null);
            setSelectedServiceForBooking(null);
          }}
        />
      )}
    </div>
  );
};
