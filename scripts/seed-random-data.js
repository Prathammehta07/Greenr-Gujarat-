// GREEN GUJARAT — Random & Demo Data Generator
// Run: node scripts/seed-random-data.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const GUJARAT_DISTRICTS = [
  ['Ahmedabad', 'AHM', 23.0225, 72.5714],
  ['Surat', 'SUR', 21.1702, 72.8311],
  ['Vadodara', 'VAD', 22.3072, 73.1812],
  ['Rajkot', 'RAJ', 22.3039, 70.8022],
  ['Gandhinagar', 'GAN', 23.2156, 72.6369],
  ['Bhavnagar', 'BHV', 21.7645, 72.1519],
  ['Jamnagar', 'JAM', 22.4707, 70.0577],
  ['Junagadh', 'JUN', 21.5222, 70.4579],
  ['Anand', 'ANA', 22.5645, 72.9289],
  ['Nadiad', 'NAD', 22.6916, 72.8634],
  ['Mehsana', 'MEH', 23.6003, 72.3788],
  ['Bharuch', 'BRT', 21.7051, 72.9963],
  ['Kutch', 'KUT', 23.7337, 69.8597],
  ['Sabarkantha', 'SAB', 23.4256, 73.0909],
  ['Banaskantha', 'BAN', 24.2646, 72.6446],
  ['Navsari', 'NAV', 20.9467, 72.9520],
  ['Patan', 'PAT', 23.8500, 72.1200]
];

const CITIZEN_NAMES = [
  'Bhavik Shah', 'Meera Dave', 'Priyank Trivedi', 'Kinjal Solanki', 'Mehul Vora',
  'Dhwani Shukla', 'Chirag Parmar', 'Tanvi Bhatt', 'Pratik Zala', 'Swati Rawal',
  'Kunal Soni', 'Hetal Prajapati', 'Nilesh Dabhi', 'Urvashi Panchal', 'Dhaval Makwana',
  'Falguni Desai', 'Yashraj Jadeja', 'Binita Chokshi', 'Manish Gadhvi', 'Rupal Kapadia',
  'Samir Mansuri', 'Geeta Waghela', 'Ashwin Modi', 'Kavita Jha', 'Nirav Barot'
];

const AVATAR_COLORS = [
  '#16834A', '#2563EB', '#D97706', '#7C3AED', '#0891B2',
  '#059669', '#DC2626', '#4F46E5', '#0D9488', '#EA580C'
];

const COMMUNITY_POSTS = [
  {
    content: 'Just installed a 4kW rooftop solar system at our home in Satellite, Ahmedabad under PM Surya Ghar Yojana! Seeing 18 units generated today alone.',
    postType: 'ACTION',
    likeCount: 24,
    comments: [
      'Congratulations! Which vendor did you choose?',
      'Awesome! Did you get the GEDA state subsidy cleared quickly?'
    ]
  },
  {
    content: 'Our society in Surat successfully diverted 250 kg of wet waste to organic compost this month. Sharing our simple 3-tier aerated bin setup.',
    postType: 'EDUCATIONAL',
    likeCount: 38,
    comments: [
      'Inspirational model for other RWAs in Gujarat!',
      'We would love to visit your society to learn the process.'
    ]
  },
  {
    content: 'Cycling 8 km to work at Infocity Gandhinagar instead of using the car. The dedicated BRTS bike corridors are fantastic early morning.',
    postType: 'ACTION',
    likeCount: 19,
    comments: [
      'Mission LiFE in daily action! Keep it up.'
    ]
  },
  {
    content: 'Replaced all halogen downlights in our clinic with 7W energy-star certified LEDs. Bill dropped by 32% in the very first billing cycle!',
    postType: 'ACTION',
    likeCount: 15,
    comments: [
      'Small interventions, massive collective savings!'
    ]
  },
  {
    content: 'Get rich quick by investing in unverified crypto green bonds! Guaranteed 40% monthly returns: http://dubious-green-scam.test',
    postType: 'DISCUSSION',
    likeCount: 0,
    reportReason: 'Spam / Financial scam',
    reportDetails: 'User is posting suspicious links unrelated to Gujarat sustainability.'
  },
  {
    content: 'Join us this Sunday 7:00 AM at Sabarmati Riverfront (near Ellis Bridge) for our community tree plantation drive. Saplings provided by Forest Dept.',
    postType: 'CAMPAIGN',
    likeCount: 42,
    comments: [
      'Count me and 3 friends in!',
      'Will carry our own reusable water bottles.'
    ]
  }
];

const SAMPLE_EVIDENCE = [
  'Replaced 8 incandescent fixtures with 9W BEE 5-star LEDs. Meter readings dropped by ~45 kWh this billing cycle. Attached photo of replaced bulbs and GUVNL receipt.',
  'Set all home air conditioners strictly to 24°C for the past 2 weeks. Noticeable drop in peak electricity load without sacrificing comfort.',
  'Installed flow aerators on kitchen and bathroom taps. Water usage reduced by nearly 30% with zero pressure loss.',
  'Refused single-use plastic bags for 14 consecutive days during grocery shopping across local Mandvi markets in Vadodara.',
  'Planted 3 native Neem and Peepal saplings in the society open garden. Attached photo of sapling tree-guard installation.',
  'Used AMTS bus and Ahmedabad Metro for 8 commuting round-trips instead of driving a personal two-wheeler. Attached ticket QR receipts.',
  'Kitchen wet waste composting bin setup completed. 10 kg organic compost ready for home potted plants.'
];

async function seedRandomData() {
  console.log('--- STARTING RANDOM DATA GENERATION FOR GREEN GUJARAT ---');

  const passwordHash = await bcrypt.hash('GreenGujarat@2026', 10);

  // 1. Ensure all Gujarat districts exist
  console.log('1. Ensuring Gujarat districts...');
  const districtMap = new Map();
  for (const [name, code, lat, lng] of GUJARAT_DISTRICTS) {
    const d = await prisma.district.upsert({
      where: { code },
      update: { latitude: lat, longitude: lng },
      create: {
        name,
        code,
        latitude: lat,
        longitude: lng,
        population: 1200000 + Math.floor(Math.random() * 4000000)
      }
    });
    districtMap.set(code, d);
  }
  const allDistricts = Array.from(districtMap.values());

  // 2. Fetch existing missions & badges
  const missions = await prisma.mission.findMany();
  const badges = await prisma.badge.findMany();

  if (missions.length === 0) {
    console.log('No missions found in DB. Please run default seed first.');
    return;
  }

  // 3. Create 25 realistic citizens
  console.log('2. Generating 25 active Gujarat citizens with profiles...');
  const createdCitizens = [];
  for (let i = 0; i < CITIZEN_NAMES.length; i++) {
    const fullName = CITIZEN_NAMES[i];
    const email = `citizen.${fullName.toLowerCase().replace(/\s+/g, '')}@gujarat.life.in`;
    const district = allDistricts[i % allDistricts.length];
    const hasSolar = i % 4 === 0;
    const solarKw = hasSolar ? Number((2 + (i % 5) * 1.5).toFixed(1)) : null;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          role: 'CITIZEN',
          isDemo: true,
          isActive: true,
          consentPublic: true,
          consentProfile: true,
          publicName: fullName.split(' ')[0] + '_' + (100 + i * 7),
          preferredLang: i % 3 === 0 ? 'gu' : i % 3 === 1 ? 'hi' : 'en',
          profile: {
            create: {
              districtId: district.id,
              cityVillage: district.name,
              householdSize: 2 + (i % 4),
              homeType: i % 3 === 0 ? 'INDEPENDENT_HOUSE' : i % 3 === 1 ? 'APARTMENT' : 'ROW_HOUSE',
              monthlyKwh: 160 + (i * 12) + Math.floor(Math.random() * 80),
              hasRooftopSolar: hasSolar,
              solarCapacityKw: solarKw,
              avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
              bio: `Active Mission LiFE citizen from ${district.name}, committed to green living & solar power.`
            }
          }
        }
      });
    }
    createdCitizens.push(user);
  }

  // 4. Generate 6 months of footprint data and points for each citizen
  console.log('3. Populating monthly footprint consumption & green points...');
  const months = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11'];
  
  for (const citizen of createdCitizens) {
    const baseKwh = 220 + Math.floor(Math.random() * 100);

    for (let mIdx = 0; mIdx < months.length; mIdx++) {
      const month = months[mIdx];
      // savings increase over time
      const reduction = Math.floor(mIdx * 8 + Math.random() * 25);
      const kwh = Math.max(80, baseKwh - reduction);
      const savings = Math.max(0, baseKwh - kwh);
      const emissionFactor = 0.71;

      await prisma.footprintRecord.upsert({
        where: { userId_month: { userId: citizen.id, month } },
        update: {},
        create: {
          userId: citizen.id,
          month,
          electricityKwh: kwh,
          emissionFactor,
          electricityEmissionKg: Number((kwh * emissionFactor).toFixed(1)),
          baselineKwh: baseKwh,
          savingsKwh: savings,
          savingsEmissionKg: Number((savings * emissionFactor).toFixed(1)),
          source: mIdx % 2 === 0 ? 'BILL_OCR' : 'USER_REPORTED'
        }
      });

      if (savings > 5) {
        const pts = Math.min(50, savings);
        await prisma.greenPoints.create({
          data: {
            userId: citizen.id,
            points: pts,
            reason: `Energy savings: ${savings} kWh reduced in ${month}`,
            sourceType: 'BILL_SAVING',
            balanceAfter: pts
          }
        });
      }
    }

    // Award badges to active citizens
    if (badges.length > 0) {
      const badgesToAward = badges.slice(0, 1 + (createdCitizens.indexOf(citizen) % badges.length));
      for (const b of badgesToAward) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: citizen.id, badgeId: b.id } },
          update: {},
          create: {
            userId: citizen.id,
            badgeId: b.id
          }
        });
      }
    }
  }

  // 5. Generate Mission Submissions (PENDING, APPROVED, REJECTED)
  console.log('4. Generating realistic mission verification queues (Pending, Approved, Rejected)...');
  const moderator = await prisma.user.findFirst({ where: { role: 'MODERATOR' } });

  for (let i = 0; i < createdCitizens.length; i++) {
    const citizen = createdCitizens[i];
    const mission = missions[i % missions.length];

    // Status distribution: ~30% PENDING (for moderator queue), ~60% APPROVED, ~10% REJECTED
    let status = 'APPROVED';
    if (i % 3 === 0) status = 'PENDING';
    else if (i % 7 === 0) status = 'REJECTED';

    const evidenceText = SAMPLE_EVIDENCE[i % SAMPLE_EVIDENCE.length];

    await prisma.missionSubmission.upsert({
      where: { userId_missionId: { userId: citizen.id, missionId: mission.id } },
      update: {
        status,
        evidenceText,
        reviewNote: status === 'APPROVED' ? 'Verified evidence. Meets Mission LiFE criteria.' : status === 'REJECTED' ? 'Photo unclear. Please re-submit with meter date visible.' : null
      },
      create: {
        userId: citizen.id,
        missionId: mission.id,
        status,
        evidenceText,
        evidenceFile: `/uploads/evidence_citizen_${i + 1}.jpg`,
        reviewerId: status !== 'PENDING' && moderator ? moderator.id : null,
        reviewNote: status === 'APPROVED' ? 'Verified evidence. Meets Mission LiFE criteria.' : status === 'REJECTED' ? 'Photo unclear. Please re-submit with meter date visible.' : null,
        reviewedAt: status !== 'PENDING' ? new Date() : null,
        awardedPoints: status === 'APPROVED' ? mission.points : 0
      }
    });

    if (status === 'APPROVED') {
      await prisma.greenPoints.create({
        data: {
          userId: citizen.id,
          points: mission.points,
          reason: `Mission completed: ${mission.title}`,
          sourceType: 'MISSION',
          sourceId: mission.id,
          balanceAfter: mission.points
        }
      });
    }
  }

  // 6. Generate Community Posts, Comments, and Reports
  console.log('5. Seeding community discussions, comments, and reports...');
  for (let i = 0; i < COMMUNITY_POSTS.length; i++) {
    const postData = COMMUNITY_POSTS[i];
    const author = createdCitizens[i % createdCitizens.length];

    let post = await prisma.post.findFirst({ where: { content: postData.content } });
    if (!post) {
      post = await prisma.post.create({
        data: {
          authorId: author.id,
          content: postData.content,
          postType: postData.postType,
          likeCount: postData.likeCount,
          commentCount: postData.comments ? postData.comments.length : 0,
          isHidden: false
        }
      });

      // Add comments
      if (postData.comments) {
        for (let cIdx = 0; cIdx < postData.comments.length; cIdx++) {
          const commenter = createdCitizens[(i + cIdx + 1) % createdCitizens.length];
          await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: commenter.id,
              content: postData.comments[cIdx]
            }
          });
        }
      }

      // Add report if flagged
      if (postData.reportReason) {
        const reporter = createdCitizens[(i + 3) % createdCitizens.length];
        await prisma.report.create({
          data: {
            reporterId: reporter.id,
            postId: post.id,
            reason: postData.reportReason,
            details: postData.reportDetails,
            status: 'OPEN'
          }
        });
      }
    }
  }

  // 7. Seed Interactive Map Pins across Gujarat
  console.log('6. Adding 25+ Green Map Pins across Gujarat...');
  const PINS = [
    { name: 'Tata Power Fast EV Charging Station', category: 'EV_CHARGER', district: 'Ahmedabad', lat: 23.0300, lng: 72.5800, operator: 'Tata Power EZ Charge' },
    { name: 'BESCOM Metro EV Depot', category: 'EV_CHARGER', district: 'Ahmedabad', lat: 23.0600, lng: 72.5300, operator: 'G-Ride EV' },
    { name: 'Surat Municipal Solar Park 10MW', category: 'SOLAR_INSTALL', district: 'Surat', lat: 21.1900, lng: 72.8100, operator: 'SMC Solar' },
    { name: 'Adani Green Solar Rooftop Hub', category: 'SOLAR_INSTALL', district: 'Surat', lat: 21.2200, lng: 72.8600, operator: 'Adani Solar' },
    { name: 'Vadodara E-Waste Authorized Dropoff', category: 'RECYCLING', district: 'Vadodara', lat: 22.3150, lng: 73.1900, operator: 'GPCB Approved Recycler' },
    { name: 'Zero-Plastic Society Composting Center', category: 'RECYCLING', district: 'Vadodara', lat: 22.2900, lng: 73.1600, operator: 'EcoVadodara Trust' },
    { name: 'Gandhinagar Green City Tree Drive', category: 'EVENT', district: 'Gandhinagar', lat: 23.2200, lng: 72.6500, operator: 'Mission LiFE Gujarat' },
    { name: 'Rajkot Clean Energy Fair 2026', category: 'EVENT', district: 'Rajkot', lat: 22.3100, lng: 70.7900, operator: 'GEDA Rajkot Chapter' },
    { name: 'Charanka Solar Park Visitor Center', category: 'SOLAR_INSTALL', district: 'Patan', lat: 23.9000, lng: 71.2000, operator: 'GPCL / GEDA' },
    { name: 'Kutch Wind-Solar Hybrid Grid Substation', category: 'SOLAR_INSTALL', district: 'Kutch', lat: 23.2500, lng: 69.6700, operator: 'GETCO' },
    { name: 'Bhavnagar Shipbreaking Green Recycling Yard', category: 'RECYCLING', district: 'Bhavnagar', lat: 21.7500, lng: 72.1400, operator: 'Alang Green Recyclers' },
    { name: 'Anand Rural Biogas Community Plant', category: 'INITIATIVE', district: 'Anand', lat: 22.5500, lng: 72.9300, operator: 'NDDB Green Energy' }
  ];

  for (const p of PINS) {
    const d = districtMap.get(p.district === 'Ahmedabad' ? 'AHM' : p.district === 'Surat' ? 'SUR' : p.district === 'Vadodara' ? 'VAD' : p.district === 'Gandhinagar' ? 'GAN' : p.district === 'Rajkot' ? 'RAJ' : p.district === 'Patan' ? 'PAT' : p.district === 'Kutch' ? 'KUT' : p.district === 'Bhavnagar' ? 'BHV' : 'ANA');
    const existing = await prisma.mapPin.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.mapPin.create({
        data: {
          name: p.name,
          category: p.category,
          latitude: p.lat,
          longitude: p.lng,
          districtId: d ? d.id : null,
          operator: p.operator,
          isVerified: true,
          isSample: false
        }
      });
    }
  }

  // 8. Update DistrictStats for Gujarat Digital Twin
  console.log('7. Updating Gujarat District statistics for Digital Twin...');
  for (const d of allDistricts) {
    const userCount = await prisma.userProfile.count({ where: { districtId: d.id } });
    const submissionsCount = await prisma.missionSubmission.count({
      where: { user: { profile: { districtId: d.id } }, status: 'APPROVED' }
    });

    const savingsAgg = await prisma.footprintRecord.aggregate({
      where: { user: { profile: { districtId: d.id } } },
      _sum: { savingsKwh: true, savingsEmissionKg: true }
    });

    const totalSavings = (savingsAgg._sum.savingsKwh || 0) + (1000 + Math.floor(Math.random() * 4000));
    const totalCo2 = (savingsAgg._sum.savingsEmissionKg || 0) + (700 + Math.floor(Math.random() * 2800));

    await prisma.districtStats.upsert({
      where: { districtId: d.id },
      update: {
        participantCount: Math.max(userCount, 40 + Math.floor(Math.random() * 250)),
        missionsCompleted: Math.max(submissionsCount, 80 + Math.floor(Math.random() * 400)),
        reportedSavingsKwh: totalSavings,
        estimatedCo2ReductionKg: totalCo2,
        renewableAdoptionCount: 15 + Math.floor(Math.random() * 85),
        isSample: false
      },
      create: {
        districtId: d.id,
        participantCount: Math.max(userCount, 40 + Math.floor(Math.random() * 250)),
        missionsCompleted: Math.max(submissionsCount, 80 + Math.floor(Math.random() * 400)),
        reportedSavingsKwh: totalSavings,
        estimatedCo2ReductionKg: totalCo2,
        renewableAdoptionCount: 15 + Math.floor(Math.random() * 85),
        isSample: false
      }
    });
  }

  console.log('\n======================================================');
  console.log('RANDOM DATA GENERATION COMPLETED SUCCESSFULLY!');
  console.log(`- Total Citizens in DB: ${await prisma.user.count({ where: { role: 'CITIZEN' } })}`);
  console.log(`- Total Pending Verifications: ${await prisma.missionSubmission.count({ where: { status: 'PENDING' } })}`);
  console.log(`- Total Approved Missions: ${await prisma.missionSubmission.count({ where: { status: 'APPROVED' } })}`);
  console.log(`- Total Open Reports: ${await prisma.report.count({ where: { status: 'OPEN' } })}`);
  console.log(`- Total Map Pins: ${await prisma.mapPin.count()}`);
  console.log(`- Total Community Posts: ${await prisma.post.count()}`);
  console.log('======================================================');
}

seedRandomData()
  .then(() => prisma['$disconnect']())
  .catch((e) => {
    console.error(e);
    prisma['$disconnect']();
  });

