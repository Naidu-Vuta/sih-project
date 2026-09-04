import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Cooperative Gig Services Platform...');

  // 1. Clear existing records in proper dependency order
  await prisma.notification.deleteMany();
  await prisma.savedWorker.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cooperativeMetric.deleteMany();

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const workerPasswordHash = await bcrypt.hash('Worker@123', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  // 2. Create Platform Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@coop.local',
      passwordHash: adminPasswordHash,
      name: 'Aarav Mehta (Cooperative Director)',
      phone: '+91 98765 00001',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Create all 11 Service Categories required by user
  const categoriesData = [
    {
      name: 'Electrical',
      slug: 'electrical',
      description: 'Certified electricians for house wiring, breaker repairs, lighting, and load inspections.',
      icon: 'Zap',
    },
    {
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Pipe repairs, drainage unblocking, bathroom sanitary fixtures, and motor pumps.',
      icon: 'Wrench',
    },
    {
      name: 'Carpentry',
      slug: 'carpentry',
      description: 'Furniture design and repair, door hinges, mortise locks, and wooden partitions.',
      icon: 'Hammer',
    },
    {
      name: 'Cleaning',
      slug: 'cleaning',
      description: 'Eco-friendly deep sanitization for kitchens, bathrooms, full apartments, and upholstery.',
      icon: 'Sparkles',
    },
    {
      name: 'Painting',
      slug: 'painting',
      description: 'Interior wall emulsion, exterior waterproofing, texture designs, and wood polishing.',
      icon: 'Paintbrush',
    },
    {
      name: 'AC Repair',
      slug: 'ac-repair',
      description: 'Split and window AC servicing, gas refilling, cooling coil overhaul, and PCB maintenance.',
      icon: 'Wind',
    },
    {
      name: 'Appliance Repair',
      slug: 'appliance-repair',
      description: 'Diagnosis and repair of washing machines, refrigerators, microwaves, and water purifiers.',
      icon: 'Cpu',
    },
    {
      name: 'Driving',
      slug: 'driving',
      description: 'Verified on-demand professional chauffeurs for city commutes and outstation family trips.',
      icon: 'Car',
    },
    {
      name: 'Gardening',
      slug: 'gardening',
      description: 'Balcony garden setup, lawn mowing, organic plant nutrition, and hedge trimming.',
      icon: 'Flower2',
    },
    {
      name: 'Caregiving',
      slug: 'caregiving',
      description: 'Trained elderly companions, patient mobility support, medication reminders, and home assistance.',
      icon: 'HeartHandshake',
    },
    {
      name: 'Other Services',
      slug: 'other-services',
      description: 'Pest management, home organizing, solar inverter checks, and custom household tasks.',
      icon: 'MoreHorizontal',
    },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) => prisma.category.create({ data: c }))
  );

  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // 4. Create Services under Categories
  const services = await Promise.all([
    // Electrical
    prisma.service.create({
      data: {
        categoryId: catMap.get('electrical')!,
        title: 'Complete Electrical Safety & Fuse Inspection',
        description: 'Complete audit of MCB fuse boards, earthing integrity, neutral current, and surge hazards.',
        basePrice: 499.0,
        priceType: 'FIXED',
        durationEst: '1.5 hours',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
      },
    }),
    prisma.service.create({
      data: {
        categoryId: catMap.get('electrical')!,
        title: 'Ceiling Fan & Switchboard Installation',
        description: 'Fitting modular switches, high-speed ceiling fans, and decorative wall chandeliers.',
        basePrice: 299.0,
        priceType: 'FIXED',
        durationEst: '45 mins',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Plumbing
    prisma.service.create({
      data: {
        categoryId: catMap.get('plumbing')!,
        title: 'Emergency Leakage & Pipe Repair',
        description: 'Rapid sealing of leaking drain pipes, dripping mixer taps, and overhead tank valves.',
        basePrice: 399.0,
        priceType: 'FIXED',
        durationEst: '1 hour',
        imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Carpentry
    prisma.service.create({
      data: {
        categoryId: catMap.get('carpentry')!,
        title: 'Door Lock Replacement & Hinge Alignment',
        description: 'Mortise lock fitting, squeak elimination, handle upgrades, and wardrobe slider alignment.',
        basePrice: 349.0,
        priceType: 'FIXED',
        durationEst: '1 hour',
        imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Cleaning
    prisma.service.create({
      data: {
        categoryId: catMap.get('cleaning')!,
        title: 'Full Kitchen & Chimney Deep Clean',
        description: 'Eco-friendly degreasing of chimney filters, burners, backsplash tiles, and cabinets.',
        basePrice: 899.0,
        priceType: 'FIXED',
        durationEst: '3 hours',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Painting
    prisma.service.create({
      data: {
        categoryId: catMap.get('painting')!,
        title: 'Single Accent Wall Design & Painting',
        description: 'Premium washable emulsion with primer, putty, and smooth textured finish.',
        basePrice: 1499.0,
        priceType: 'FIXED',
        durationEst: '4 - 5 hours',
        imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // AC Repair
    prisma.service.create({
      data: {
        categoryId: catMap.get('ac-repair')!,
        title: 'Split AC Power Jet Servicing',
        description: 'High-pressure foam spray clean of indoor evaporator coil, filter wash, and outdoor compressor check.',
        basePrice: 599.0,
        priceType: 'FIXED',
        durationEst: '1.5 hours',
        imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Appliance Repair
    prisma.service.create({
      data: {
        categoryId: catMap.get('appliance-repair')!,
        title: 'Washing Machine Diagnosis & Motor Check',
        description: 'Diagnostic troubleshooting for drainage blockage, drum vibration, or spin cycle failure.',
        basePrice: 399.0,
        priceType: 'FIXED',
        durationEst: '1 hour',
        imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Driving
    prisma.service.create({
      data: {
        categoryId: catMap.get('driving')!,
        title: 'Personal Chauffeur Service (4 Hours)',
        description: 'Experienced, polite, background-checked driver for your manual or automatic vehicle in city traffic.',
        basePrice: 499.0,
        priceType: 'FIXED',
        durationEst: '4 hours',
        imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Gardening
    prisma.service.create({
      data: {
        categoryId: catMap.get('gardening')!,
        title: 'Balcony Garden Trim & Organic Soil Nourish',
        description: 'Pruning dry foliage, aerating root beds, repotting, and enriching with organic vermicompost.',
        basePrice: 449.0,
        priceType: 'FIXED',
        durationEst: '2 hours',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80',
      },
    }),
    // Caregiving
    prisma.service.create({
      data: {
        categoryId: catMap.get('caregiving')!,
        title: 'Senior Companion & Home Mobility Support',
        description: 'Compassionate assistance with daily walking, vital signs checking, and supportive presence.',
        basePrice: 699.0,
        priceType: 'FIXED',
        durationEst: '4 hours',
        imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=80',
      },
    }),
  ]);

  // 5. Create Diverse Worker Co-owners with Rich Profiles
  const worker1 = await prisma.user.create({
    data: {
      email: 'rajesh.electric@coop.local',
      passwordHash: workerPasswordHash,
      name: 'Rajesh Kumar',
      phone: '+91 98451 11223',
      role: 'WORKER',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      workerProfile: {
        create: {
          bio: 'Certified Master Electrician with 8+ years specializing in residential safety, surge protection, and high-efficiency inverter wiring. Founding member of the Bengaluru Worker Collective.',
          skills: 'Electrical, AC Repair, Appliance Repair',
          hourlyRate: 350.0,
          experienceYears: 8,
          isAvailable: true,
          isVerified: true,
          rating: 4.9,
          totalReviews: 38,
          totalJobs: 46,
          cooperativeShares: 14,
          payoutTotal: 22400.0,
          coopDividendEarned: 1792.0,
          city: 'Bengaluru',
          certifications: 'Master Electrician License #KAR-8821, NSDC Govt Skill Certified, Cooperative High Voltage Safety Certificate',
          serviceArea: 'Indiranagar, Koramangala, Bellandur, HSR Layout, Domlur',
          workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
          workingHours: '08:00 AM - 07:00 PM',
          unavailableDates: '2026-09-15',
          languages: 'English, Hindi, Kannada, Tamil',
          distanceKm: 2.1,
        },
      },
    },
  });

  const worker2 = await prisma.user.create({
    data: {
      email: 'sunita.clean@coop.local',
      passwordHash: workerPasswordHash,
      name: 'Sunita Devi',
      phone: '+91 98451 22334',
      role: 'WORKER',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      workerProfile: {
        create: {
          bio: 'Hospital-grade hygiene specialist focusing on biodegradable and pet-safe sanitization. Servicing families with pride for 6 years.',
          skills: 'Cleaning, Gardening, Other Services',
          hourlyRate: 400.0,
          experienceYears: 6,
          isAvailable: true,
          isVerified: true,
          rating: 5.0,
          totalReviews: 52,
          totalJobs: 64,
          cooperativeShares: 20,
          payoutTotal: 34800.0,
          coopDividendEarned: 2780.0,
          city: 'Bengaluru',
          certifications: 'Professional Housekeeping & Sanitization Certified (PHSC), Non-Toxic Chemical Handling Certified',
          serviceArea: 'Indiranagar, Whitefield, Marathahalli, Bellandur',
          workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
          workingHours: '07:30 AM - 06:00 PM',
          unavailableDates: '',
          languages: 'Hindi, Kannada, Telugu',
          distanceKm: 3.4,
        },
      },
    },
  });

  const worker3 = await prisma.user.create({
    data: {
      email: 'mohan.plumb@coop.local',
      passwordHash: workerPasswordHash,
      name: 'Mohan Lal',
      phone: '+91 98451 33445',
      role: 'WORKER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      workerProfile: {
        create: {
          bio: 'Master Plumber experienced in copper/PVC pipeline layouts, pressure boosters, overhead cisterns, and bathroom waterproofing.',
          skills: 'Plumbing, Appliance Repair',
          hourlyRate: 320.0,
          experienceYears: 5,
          isAvailable: true,
          isVerified: true,
          rating: 4.8,
          totalReviews: 29,
          totalJobs: 35,
          cooperativeShares: 11,
          payoutTotal: 16500.0,
          coopDividendEarned: 1320.0,
          city: 'Bengaluru',
          certifications: 'National Apprenticeship Plumbing Certificate, CPVC Certified Installer',
          serviceArea: 'Koramangala, Jayanagar, BTM Layout, JP Nagar',
          workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
          workingHours: '08:30 AM - 07:30 PM',
          unavailableDates: '2026-09-20',
          languages: 'English, Hindi, Kannada',
          distanceKm: 4.8,
        },
      },
    },
  });

  const worker4 = await prisma.user.create({
    data: {
      email: 'anil.carpenter@coop.local',
      passwordHash: workerPasswordHash,
      name: 'Anil Sutar',
      phone: '+91 98451 55667',
      role: 'WORKER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      workerProfile: {
        create: {
          bio: 'Precision wood artisan skilled in bespoke furniture fixes, modular kitchen hinge resets, and high-security smart door installations.',
          skills: 'Carpentry, Painting',
          hourlyRate: 380.0,
          experienceYears: 7,
          isAvailable: false, // On leave/busy
          isVerified: true,
          rating: 4.9,
          totalReviews: 31,
          totalJobs: 40,
          cooperativeShares: 13,
          payoutTotal: 21200.0,
          coopDividendEarned: 1696.0,
          city: 'Bengaluru',
          certifications: 'Woodworking Guild Fellow, Safety & Power Tool Precision Operator',
          serviceArea: 'Indiranagar, Ulsoor, MG Road, Frazer Town',
          workingDays: 'Mon,Tue,Wed,Thu,Fri',
          workingHours: '09:00 AM - 06:00 PM',
          unavailableDates: '',
          languages: 'Hindi, Marathi, English',
          distanceKm: 6.2,
        },
      },
    },
  });

  const worker5 = await prisma.user.create({
    data: {
      email: 'deepak.paint@coop.local',
      passwordHash: workerPasswordHash,
      name: 'Deepak Sharma',
      phone: '+91 98451 44556',
      role: 'WORKER',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      workerProfile: {
        create: {
          bio: 'Interior wall finish artisan and stencil painter applying for full cooperative membership equity.',
          skills: 'Painting, Other Services',
          hourlyRate: 300.0,
          experienceYears: 4,
          isAvailable: true,
          isVerified: false, // Pending KYC
          rating: 5.0,
          totalReviews: 2,
          totalJobs: 3,
          cooperativeShares: 1,
          payoutTotal: 1500.0,
          coopDividendEarned: 120.0,
          city: 'Bengaluru',
          certifications: 'Asian Paints Master Painter Certificate',
          serviceArea: 'Bellandur, Sarjapur Road, Kadubeesanahalli',
          workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
          workingHours: '08:00 AM - 06:00 PM',
          unavailableDates: '',
          languages: 'Hindi, Bhojpuri, English',
          distanceKm: 8.5,
        },
      },
    },
  });

  // 6. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'priya.sharma@example.com',
      passwordHash: customerPasswordHash,
      name: 'Priya Sharma',
      phone: '+91 99887 76655',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      customerProfile: {
        create: {
          address: '#402, Green Glen Layout, Bellandur',
          city: 'Bengaluru',
          pincode: '560103',
        },
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'rahul.verma@example.com',
      passwordHash: customerPasswordHash,
      name: 'Rahul Verma',
      phone: '+91 99887 66554',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      customerProfile: {
        create: {
          address: 'Plot 18, 5th Main, Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
        },
      },
    },
  });

  // 7. Seed Saved Workers for Customer Priya Sharma
  await prisma.savedWorker.create({
    data: {
      customerId: customer1.id,
      workerId: worker1.id,
    },
  });
  await prisma.savedWorker.create({
    data: {
      customerId: customer1.id,
      workerId: worker2.id,
    },
  });

  // 8. Seed Bookings demonstrating the full workflow:
  // (REQUESTED, ACCEPTED, ON_THE_WAY, ARRIVED, IN_PROGRESS, COMPLETED, PAID, REVIEWED)
  
  // A: Completed, Paid and Reviewed
  const booking1 = await prisma.booking.create({
    data: {
      bookingCode: 'BK-2026-1049',
      customerId: customer1.id,
      workerId: worker1.id,
      serviceId: services[0].id, // Electrical safety
      scheduledDate: '2026-09-01',
      timeSlot: '10:00 AM - 12:00 PM',
      address: '#402, Green Glen Layout, Bellandur, Bengaluru',
      city: 'Bengaluru',
      pincode: '560103',
      notes: 'Tripping MCB breaker when geyser is switched on',
      jobDescription: 'Inspect 32A double pole circuit breaker and replace burned neutral terminal.',
      serviceImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      status: 'REVIEWED',
      paymentStatus: 'PAID',
      paidAt: new Date('2026-09-01T11:45:00Z'),
      paymentMethod: 'UPI',
      totalPrice: 499.0,
      platformFee: 24.95,
      workerEarning: 474.05,
      coopDividendShare: 9.98,
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: customer1.id,
      workerId: worker1.id,
      rating: 5,
      comment: 'Rajesh diagnosed the neutral issue within 20 minutes and explained everything transparently. Excellent cooperative craftsperson!',
    },
  });

  // B: Completed and Paid (Ready for Customer Review)
  await prisma.booking.create({
    data: {
      bookingCode: 'BK-2026-2184',
      customerId: customer1.id,
      workerId: worker2.id,
      serviceId: services[4].id, // Kitchen deep clean
      scheduledDate: '2026-09-03',
      timeSlot: '02:00 PM - 05:00 PM',
      address: '#402, Green Glen Layout, Bellandur, Bengaluru',
      city: 'Bengaluru',
      pincode: '560103',
      notes: 'Please degrease the chimney baffle filters thoroughly.',
      jobDescription: 'Deep cleaning kitchen countertops, tiles, chimney, and hob.',
      status: 'PAID',
      paymentStatus: 'PAID',
      paidAt: new Date('2026-09-03T16:30:00Z'),
      paymentMethod: 'CASH',
      totalPrice: 899.0,
      platformFee: 44.95,
      workerEarning: 854.05,
      coopDividendShare: 17.98,
    },
  });

  // C: IN_PROGRESS (Active work underway)
  await prisma.booking.create({
    data: {
      bookingCode: 'BK-2026-3392',
      customerId: customer2.id,
      workerId: worker3.id,
      serviceId: services[2].id, // Leakage repair
      scheduledDate: '2026-09-04',
      timeSlot: '11:00 AM - 12:30 PM',
      address: 'Plot 18, 5th Main, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      pincode: '560038',
      notes: 'Water seepage behind the bathroom mixer tap',
      jobDescription: 'Replace worn rubber washers and seal thread joints with Teflon tape.',
      status: 'IN_PROGRESS',
      paymentStatus: 'PENDING',
      totalPrice: 399.0,
      platformFee: 19.95,
      workerEarning: 379.05,
      coopDividendShare: 7.98,
    },
  });

  // D: ON_THE_WAY (Worker traveling to location)
  await prisma.booking.create({
    data: {
      bookingCode: 'BK-2026-4481',
      customerId: customer1.id,
      workerId: worker1.id,
      serviceId: services[1].id, // Ceiling fan
      scheduledDate: '2026-09-04',
      timeSlot: '04:00 PM - 05:30 PM',
      address: '#402, Green Glen Layout, Bellandur, Bengaluru',
      city: 'Bengaluru',
      pincode: '560103',
      notes: 'New BLDC ceiling fan delivered, needs assembly and ceiling mounting',
      jobDescription: 'Ceiling bracket drilling and regulator installation.',
      status: 'ON_THE_WAY',
      paymentStatus: 'PENDING',
      totalPrice: 299.0,
      platformFee: 14.95,
      workerEarning: 284.05,
      coopDividendShare: 5.98,
    },
  });

  // E: ACCEPTED (Scheduled upcoming booking)
  await prisma.booking.create({
    data: {
      bookingCode: 'BK-2026-5590',
      customerId: customer2.id,
      workerId: worker1.id,
      serviceId: services[0].id,
      scheduledDate: '2026-09-06',
      timeSlot: '09:00 AM - 11:00 AM',
      address: 'Plot 18, 5th Main, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      pincode: '560038',
      notes: 'Balcony light points not getting power',
      jobDescription: 'Check external junction box and neutral return loop.',
      status: 'ACCEPTED',
      paymentStatus: 'PENDING',
      totalPrice: 499.0,
      platformFee: 24.95,
      workerEarning: 474.05,
      coopDividendShare: 9.98,
    },
  });

  // F: REQUESTED (New incoming booking awaiting Worker acceptance)
  await prisma.booking.create({
    data: {
      bookingCode: 'BK-2026-6701',
      customerId: customer1.id,
      workerId: worker3.id,
      serviceId: services[2].id,
      scheduledDate: '2026-09-07',
      timeSlot: '02:00 PM - 04:00 PM',
      address: '#402, Green Glen Layout, Bellandur, Bengaluru',
      city: 'Bengaluru',
      pincode: '560103',
      notes: 'Main gate water tap is jammed shut',
      jobDescription: 'Inspect brass bib cock and replace stem packing.',
      status: 'REQUESTED',
      paymentStatus: 'PENDING',
      totalPrice: 399.0,
      platformFee: 19.95,
      workerEarning: 379.05,
      coopDividendShare: 7.98,
    },
  });

  // 9. Seed In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        title: 'Artisan On The Way',
        message: 'Rajesh Kumar has departed and is on the way to your location for Booking #BK-2026-4481.',
        type: 'BOOKING_UPDATE',
        bookingId: 'BK-2026-4481',
        isRead: false,
      },
      {
        userId: customer1.id,
        title: 'Payment Confirmed',
        message: 'Payment of ₹899.00 for Booking #BK-2026-2184 confirmed. ₹854.05 credited to Sunita Devi.',
        type: 'PAYMENT',
        bookingId: 'BK-2026-2184',
        isRead: true,
      },
      {
        userId: worker1.id,
        title: 'New Booking Accepted',
        message: 'You accepted booking #BK-2026-5590 for Rahul Verma on 2026-09-06.',
        type: 'BOOKING_UPDATE',
        bookingId: 'BK-2026-5590',
        isRead: false,
      },
      {
        userId: worker3.id,
        title: 'Incoming Job Request',
        message: 'Priya Sharma requested Emergency Pipe Repair (#BK-2026-6701) in Bellandur.',
        type: 'BOOKING_UPDATE',
        bookingId: 'BK-2026-6701',
        isRead: false,
      },
    ],
  });

  // 10. Platform Cooperative Metric Singleton
  await prisma.cooperativeMetric.create({
    data: {
      id: 'singleton',
      totalDividendDistributed: 51240.0,
      communityWelfarePool: 92400.0,
      totalFairWagesPaid: 438500.0,
      workerMembersCount: 45,
    },
  });

  console.log('✅ Comprehensive database seeded with all 11 categories, workers, workflows, and notifications!');
}

main()
  .catch((e) => {
    console.error('Seed Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
