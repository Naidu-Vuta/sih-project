import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service, User } from '../../types';
import { bookingService } from '../../services/bookingService';
import { serviceService } from '../../services/serviceService';
import { workerService } from '../../services/workerService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Image,
  User as UserIcon,
} from 'lucide-react';

interface BookingModalProps {
  service?: Service | null;
  preselectedWorker?: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:30 AM - 01:30 PM',
  '02:00 PM - 04:00 PM',
  '04:30 PM - 06:30 PM',
  '07:00 PM - 08:30 PM',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  service: initialService,
  preselectedWorker,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<User[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialService?.id || '');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(preselectedWorker?.id || '');

  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [address, setAddress] = useState<string>(
    (user?.customerProfile?.address as string) || ''
  );
  const [city, setCity] = useState<string>(
    (user?.customerProfile?.city as string) || 'Bengaluru'
  );
  const [pincode, setPincode] = useState<string>(
    (user?.customerProfile?.pincode as string) || ''
  );
  const [jobDescription, setJobDescription] = useState<string>('');
  const [serviceImage, setServiceImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [servs, wks] = await Promise.all([
          serviceService.getServices(),
          workerService.getPublicWorkers(),
        ]);
        setAvailableServices(servs);
        setAvailableWorkers(wks);

        if (!selectedServiceId && servs.length > 0) {
          setSelectedServiceId(servs[0].id);
        }
      } catch (err) {
        console.error('Error loading booking dropdowns', err);
      }
    };

    fetchOptions();
  }, [selectedServiceId]);

  const currentService =
    availableServices.find((s) => s.id === selectedServiceId) || initialService || availableServices[0];

  const currentWorker =
    availableWorkers.find((w) => w.id === selectedWorkerId) || preselectedWorker;

  // Financial calculations (Cooperative 95% worker wage / 5% platform fee)
  const totalPrice = currentService ? currentService.basePrice : 499;
  const workerWage = (totalPrice * 0.95).toFixed(2);
  const coopFund = (totalPrice * 0.05).toFixed(2);
  const dividend = (totalPrice * 0.02).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in as a customer to book a service');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only Customer accounts can create service bookings');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter service address');
      return;
    }

    if (!currentService) {
      toast.error('Please select a service');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await bookingService.createBooking({
        serviceId: currentService.id,
        workerId: selectedWorkerId || undefined,
        scheduledDate,
        timeSlot,
        address,
        city,
        pincode,
        notes: jobDescription,
        jobDescription,
        serviceImage: serviceImage || undefined,
      });

      toast.success(
        `Booking ${newBooking.bookingCode} confirmed! A verified cooperative craftsperson has been assigned.`
      );
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to create booking';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold mb-2 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cooperative Fair Wage Booking</span>
            </div>
            <h3 className="text-xl font-bold">
              {currentService ? currentService.title : 'Book Household Service'}
            </h3>
            <p className="text-emerald-100 text-xs mt-1">
              Estimated Duration: {currentService?.durationEst || '1-2 hours'} • Base Price: ₹{totalPrice}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cooperative Transparent Receipt Box */}
        <div className="bg-emerald-50/70 p-4 border-b border-emerald-100 px-6">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 mb-1.5">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              Transparent Value Distribution
            </span>
            <span className="text-emerald-800 font-bold">Total: ₹{totalPrice}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-emerald-200">
            <div>
              <span className="text-slate-400 block">Worker Direct Pay (95%)</span>
              <span className="font-bold text-slate-800">₹{workerWage}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Co-op Welfare (5%)</span>
              <span className="font-bold text-slate-800">₹{coopFund}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Worker Dividend Pool</span>
              <span className="font-bold text-emerald-700">+₹{dividend}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Service Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selected Service
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              {availableServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (₹{s.basePrice})
                </option>
              ))}
            </select>
          </div>

          {/* Worker Selection / Preselected Worker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              Assigned Cooperative Craftsperson
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value="">Auto-match Nearest Available Artisan</option>
              {availableWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.workerProfile?.skills.split(',')[0]} • {w.workerProfile?.rating}★ • {w.workerProfile?.distanceKm || 2.5} km away)
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Service Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Preferred Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Service Address & Landmark
            </label>
            <input
              type="text"
              placeholder="House/flat number, apartment name, street and landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                placeholder="560103"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Job Description (Describe what needs fixing)
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Geyser switch sparking and main MCB trips whenever water heats up..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none"
            />
          </div>

          {/* Optional Service Image Upload / URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-slate-500" />
              Optional Service Photo (URL)
            </label>
            <input
              type="url"
              placeholder="https://example.com/broken-pipe-photo.jpg"
              value={serviceImage}
              onChange={(e) => setServiceImage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
            <span className="text-[10px] text-slate-400">
              Helps the artisan prepare the correct tools and replacement parts in advance.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking (Pay ₹{totalPrice} on Service)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
