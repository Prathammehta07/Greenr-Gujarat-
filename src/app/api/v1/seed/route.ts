// POST /api/v1/seed — seed demo data (admin or first-run only)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, hashPassword, audit } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/api'

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
  ['Banaskantha', 'BAN', 24.2646, 72.6446]
] as const

const MISSIONS = [
  { title: 'Switch to LED Bulbs', description: 'Replace 5 incandescent/CFL bulbs with LED bulbs at home.', instructions: 'Upload a clear photo showing your new LED bulbs installed. Include the count of bulbs replaced in the text field.', category: 'ELECTRICITY', difficulty: 'EASY', points: 20, estimatedCo2Kg: 5 },
  { title: '24°C AC Challenge', description: 'Set your AC to 24°C for one full week during summer.', instructions: 'Submit a photo of your AC remote showing 24°C setting with date visible. Add a 1-line note on your comfort level.', category: 'ELECTRICITY', difficulty: 'MEDIUM', points: 35, estimatedCo2Kg: 12 },
  { title: 'Unplug Standby Devices', description: 'Unplug all devices on standby (TV, chargers, gaming consoles) for 7 days.', instructions: 'Submit a short text describing devices unplugged and any bill change noticed. Optional photo of smart power strip.', category: 'ELECTRICITY', difficulty: 'EASY', points: 15, estimatedCo2Kg: 3 },
  { title: 'Install Water-Saving Aerator', description: 'Install low-flow aerator on at least one tap at home.', instructions: 'Upload photo of installed aerator with tap running. Mention brand/model if known.', category: 'WATER', difficulty: 'EASY', points: 15, estimatedCo2Kg: 0 },
  { title: 'Bucket Bath Challenge', description: 'Use bucket bath instead of shower for 7 consecutive days.', instructions: 'Submit a one-line daily log of bucket-bath days, plus a final photo of your bucket.', category: 'WATER', difficulty: 'EASY', points: 20, estimatedCo2Kg: 0 },
  { title: 'Cycle to Work/School', description: 'Cycle or walk for trips under 2 km for one week.', instructions: 'Submit a photo of your cycle/walking route or tracker screenshot showing at least 5 days of activity.', category: 'TRANSPORT', difficulty: 'MEDIUM', points: 30, estimatedCo2Kg: 8 },
  { title: 'Use Public Transport', description: 'Use AMTS/BRTS/Metro for 5 round trips in a month.', instructions: 'Submit photos of 3 ticket stubs or QR passes. Mention the routes used in the text field.', category: 'TRANSPORT', difficulty: 'MEDIUM', points: 25, estimatedCo2Kg: 12 },
  { title: 'Home Composting Setup', description: 'Set up a home composting bin for kitchen waste.', instructions: 'Upload photo of compost bin with kitchen waste added. Submit 2-week update showing compost formation.', category: 'WASTE', difficulty: 'HARD', points: 50, estimatedCo2Kg: 15 },
  { title: 'Plastic-Free Week', description: 'Avoid single-use plastic for 7 days. Carry cloth bag and steel bottle.', instructions: 'Submit a daily checklist (text) of plastic items avoided. Photo of your cloth bag/steel bottle optional.', category: 'WASTE', difficulty: 'MEDIUM', points: 25, estimatedCo2Kg: 5 },
  { title: 'Plant a Native Tree', description: 'Plant a native Gujarat tree (Neem, Pipal, Banyan, Khijdo) and care for it.', instructions: 'Upload photo of planted sapling with location. Submit 30-day survival update photo.', category: 'TREE', difficulty: 'MEDIUM', points: 50, estimatedCo2Kg: 22 },
  { title: 'Rooftop Solar Site Survey', description: 'Conduct a rooftop solar feasibility survey using the Solar Advisor.', instructions: 'Submit a screenshot of your Solar Advisor result with capacity, savings, and payback. Mention your district.', category: 'RENEWABLE', difficulty: 'MEDIUM', points: 40, estimatedCo2Kg: 100 },
  { title: 'Solar Water Heater Install', description: 'Install a solar water heater (ETSWH) at home.', instructions: 'Upload photo of installed solar water heater on rooftop. Mention capacity in litres.', category: 'RENEWABLE', difficulty: 'HARD', points: 80, estimatedCo2Kg: 200 },
  { title: 'Buy 5-Star Appliance', description: 'Replace an old appliance with a BEE 5-star rated one.', instructions: 'Upload photo of new appliance with BEE 5-star label visible. Mention replaced appliance.', category: 'CONSUMPTION', difficulty: 'MEDIUM', points: 35, estimatedCo2Kg: 20 },
  { title: 'Carry Your Own Bag', description: 'Refuse plastic bags at shops for 14 days. Always carry a cloth bag.', instructions: 'Submit text log of 14 days with shop names where you refused plastic. Photo of cloth bag.', category: 'CONSUMPTION', difficulty: 'EASY', points: 15, estimatedCo2Kg: 2 },
  { title: 'Meatless Monday', description: 'Avoid meat on Mondays for one month (4 Mondays).', instructions: 'Submit a weekly text log of meatless Monday meals. Optional photos of plant-based dishes.', category: 'CONSUMPTION', difficulty: 'EASY', points: 20, estimatedCo2Kg: 30 }
]

const BADGES = [
  { code: 'FIRST_STEP', name: 'First Step', description: 'Complete your first verified mission.', icon: 'Footprints', color: '16834A', criteria: 'approvedCount >= 1', points: 0 },
  { code: 'GREEN_WARRIOR', name: 'Green Warrior', description: 'Complete 5 verified missions.', icon: 'Sword', color: '2563EB', criteria: 'approvedCount >= 5', points: 25 },
  { code: 'ECO_CHAMPION', name: 'Eco Champion', description: 'Complete 10 verified missions.', icon: 'Trophy', color: 'D97706', criteria: 'approvedCount >= 10', points: 50 },
  { code: 'GREEN_GUJARATI', name: 'Green Gujarati', description: 'Complete 25 verified missions — a true sustainability leader.', icon: 'Crown', color: '7C3AED', criteria: 'approvedCount >= 25', points: 100 },
  { code: 'SOLAR_PIONEER', name: 'Solar Pioneer', description: 'Adopt rooftop solar at home.', icon: 'Sun', color: 'EA580C', criteria: 'hasRooftopSolar', points: 50 },
  { code: 'BILL_SCANNER', name: 'Bill Scanner', description: 'Scan and confirm your first electricity bill.', icon: 'ScanLine', color: '0891B2', criteria: 'billsConfirmed >= 1', points: 10 },
  { code: 'COMMUNITY_BUILDER', name: 'Community Builder', description: 'Create or join a green community.', icon: 'Users', color: '059669', criteria: 'communityJoined >= 1', points: 15 },
  { code: 'CARBON_CONSCIOUS', name: 'Carbon Conscious', description: 'Save 100 kg CO₂ through verified actions.', icon: 'Leaf', color: '16A34A', criteria: 'co2Saved >= 100', points: 30 }
]

export async function POST(req: NextRequest) {
  // First-run: allow without auth if no admin exists yet
  const existingAdmin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (existingAdmin) {
    const payload = await getAuthUser()
    if (!payload) return unauthorized()
    if (payload.role !== 'ADMIN') return forbidden()
  }

  // 1. Districts
  for (const [name, code, lat, lng] of GUJARAT_DISTRICTS) {
    await db.district.upsert({
      where: { code: code as string },
      update: { latitude: lat as number, longitude: lng as number },
      create: { name: name as string, code: code as string, latitude: lat as number, longitude: lng as number, population: 1_000_000 + Math.floor(Math.random() * 5_000_000) }
    })
  }

  // 2. Badges
  for (const b of BADGES) {
    await db.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description, icon: b.icon, color: b.color, criteria: b.criteria, points: b.points },
      create: b
    })
  }

  // 3. System settings
  const settings = [
    { key: 'EMISSION_FACTOR_KG_PER_KWH', value: '0.71', description: 'kg CO₂ emitted per kWh of grid electricity (India average, CEA 2023). Admin-configurable.' },
    { key: 'DEFAULT_TARIFF', value: '7.5', description: 'Default residential electricity tariff (INR per kWh) used for solar/savings estimates.' },
    { key: 'SOLAR_COST_PER_KW', value: '55000', description: 'Rooftop PV benchmark installation cost (INR per kW), before subsidy.' },
    { key: 'SOLAR_YIELD_PER_KW_PER_YEAR', value: '1450', description: 'Estimated annual energy yield per kW installed in Gujarat.' },
    { key: 'MISSION_SAVINGS_POINT_RATE', value: '1', description: 'Green points per kWh saved on confirmed bills (max 50/month).' }
  ]
  for (const s of settings) {
    await db.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { ...s, isPublic: true }
    })
  }

  // 4. Missions
  for (const m of MISSIONS) {
    const existing = await db.mission.findFirst({ where: { title: m.title } })
    if (!existing) {
      await db.mission.create({ data: m })
    }
  }

  // 5. Demo users — Citizen, Moderator, Admin
  const demoPasswordHash = await hashPassword('GreenGujarat@2026')
  const ahm = await db.district.findUnique({ where: { code: 'AHM' } })
  const surat = await db.district.findUnique({ where: { code: 'SUR' } })
  const gandhinagar = await db.district.findUnique({ where: { code: 'GAN' } })

  const demoUsers = [
    { email: 'citizen@demo.greengujarat.in', name: 'Aarav Patel', role: 'CITIZEN', district: ahm, publicName: 'Aarav_P***' },
    { email: 'moderator@demo.greengujarat.in', name: 'Diya Shah', role: 'MODERATOR', district: surat, publicName: 'Diya_S***' },
    { email: 'admin@demo.greengujarat.in', name: 'GEDA Admin', role: 'ADMIN', district: gandhinagar, publicName: null }
  ]
  for (const u of demoUsers) {
    const existing = await db.user.findUnique({ where: { email: u.email } })
    if (!existing) {
      await db.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash: demoPasswordHash,
          role: u.role,
          isDemo: true,
          publicName: u.publicName,
          consentPublic: u.role === 'CITIZEN',
          profile: { create: { districtId: u.district?.id || null, cityVillage: u.district?.name, householdSize: 4, homeType: 'APARTMENT', monthlyKwh: 280 + Math.floor(Math.random() * 120) } }
        }
      })
    }
  }

  // 6. Sample citizens + footprints + district stats
  const sampleNames = ['Riya Mehta', 'Karan Joshi', 'Sneha Gandhi', 'Vivek Desai', 'Anjali Pandya', 'Rohan Vyas', 'Pooja Bhatt', 'Hardik Amin', 'Nisha Kothari', 'Jay Thakkar']
  const allDistricts = await db.district.findMany()
  const sampleUsers: any[] = []
  for (let i = 0; i < sampleNames.length; i++) {
    const email = `sample${i + 1}@demo.greengujarat.in`
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      const district = allDistricts[i % allDistricts.length]
      user = await db.user.create({
        data: {
          email,
          name: sampleNames[i],
          passwordHash: demoPasswordHash,
          role: 'CITIZEN',
          isDemo: true,
          publicName: sampleNames[i].split(' ')[0] + '_' + (1000 + i),
          consentPublic: true,
          profile: { create: { districtId: district.id, cityVillage: district.name, householdSize: 3 + (i % 3), homeType: i % 2 ? 'INDEPENDENT_HOUSE' : 'APARTMENT', monthlyKwh: 180 + i * 25 } }
        }
      })
      // create 4 months of footprint history
      const baseKwh = 240 + i * 15
      for (let m = 5; m >= 1; m--) {
        const month = `2025-${String(11 - m).padStart(2, '0')}`
        const kwh = baseKwh + (Math.random() * 60 - 30)
        const savings = Math.max(0, baseKwh * 1.1 - kwh)
        await db.footprintRecord.create({
          data: {
            userId: user.id,
            month,
            electricityKwh: Math.round(kwh),
            emissionFactor: 0.71,
            electricityEmissionKg: Math.round(kwh * 0.71),
            baselineKwh: Math.round(baseKwh * 1.1),
            savingsKwh: Math.round(savings),
            savingsEmissionKg: Math.round(savings * 0.71),
            source: 'USER_REPORTED'
          }
        })
        // award points for savings
        const pts = Math.min(50, Math.round(savings))
        if (pts > 0) {
          await db.greenPoints.create({
            data: {
              userId: user.id,
              points: pts,
              reason: `Electricity saving: ${Math.round(savings)} kWh vs baseline (${month})`,
              sourceType: 'BILL_SAVING',
              balanceAfter: pts
            }
          })
        }
      }
      sampleUsers.push(user)
    }
  }

  // 7. District stats (clearly labelled sample)
  for (const d of allDistricts) {
    const isSample = true
    await db.districtStats.upsert({
      where: { districtId: d.id },
      update: {},
      create: {
        districtId: d.id,
        participantCount: 50 + Math.floor(Math.random() * 500),
        missionsCompleted: 100 + Math.floor(Math.random() * 1000),
        reportedSavingsKwh: 1000 + Math.floor(Math.random() * 20000),
        estimatedCo2ReductionKg: 700 + Math.floor(Math.random() * 14000),
        renewableAdoptionCount: 5 + Math.floor(Math.random() * 80),
        isSample
      }
    })
  }

  // 8. Communities
  const communities = [
    { name: 'Ahmedabad Cyclists Forum', description: 'Citizens promoting cycling as sustainable urban transport in Ahmedabad.', category: 'NGO' },
    { name: 'Surat Solar Sangathan', description: 'Rooftop solar adopters sharing experiences and vendor reviews in Surat.', category: 'RWA' },
    { name: 'Vadodara Eco Club', description: 'College students driving zero-waste and tree plantation drives.', category: 'COLLEGE' },
    { name: 'Gandhinagar Green School', description: 'School-level Mission LiFE activities and environmental education.', category: 'SCHOOL' },
    { name: 'Kutch Renewable Energy Network', description: 'Renewable energy professionals and enthusiasts in Kutch region.', category: 'NGO' }
  ]
  const adminUser = await db.user.findUnique({ where: { email: 'admin@demo.greengujarat.in' } })
  for (const c of communities) {
    const existing = await db.community.findFirst({ where: { name: c.name } })
    if (!existing && adminUser) {
      await db.community.create({
        data: {
          ...c,
          ownerId: adminUser.id,
          memberCount: 1,
          members: { create: { userId: adminUser.id, role: 'ADMIN' } }
        }
      })
    }
  }

  // 9. Sample map pins — clearly labelled as sample
  const samplePins = [
    { name: 'BRTS EV Charging Hub (Sample)', category: 'EV_CHARGER', lat: 23.0225, lng: 72.5714, district: 'Ahmedabad', address: 'Demo address — sample pin', operator: 'Sample Operator' },
    { name: 'Solar Power Plant 5MW (Sample)', category: 'SOLAR_INSTALL', lat: 21.1702, lng: 72.8311, district: 'Surat', address: 'Demo address — sample pin', operator: 'Sample Operator' },
    { name: 'E-Waste Recycling Centre (Sample)', category: 'RECYCLING', lat: 22.3072, lng: 73.1812, district: 'Vadodara', address: 'Demo address — sample pin', operator: 'Sample Operator' },
    { name: 'Tree Plantation Drive (Sample)', category: 'EVENT', lat: 23.2156, lng: 72.6369, district: 'Gandhinagar', address: 'Sample event pin', operator: null },
    { name: 'Lake Clean-up Initiative (Sample)', category: 'INITIATIVE', lat: 22.4707, lng: 70.0577, district: 'Jamnagar', address: 'Sample initiative pin', operator: null }
  ]
  for (const p of samplePins) {
    const district = await db.district.findFirst({ where: { name: p.district } })
    const exists = await db.mapPin.findFirst({ where: { name: p.name } })
    if (!exists) {
      await db.mapPin.create({
        data: {
          name: p.name,
          category: p.category,
          latitude: p.lat,
          longitude: p.lng,
          address: p.address,
          operator: p.operator,
          districtId: district?.id || null,
          isVerified: false,
          isSample: true,
          metadata: JSON.stringify({ source: 'demo seed' })
        }
      })
    }
  }

  // 10. Audit log entry
  await audit('SEED_COMPLETED', 'SYSTEM', undefined, undefined, 'Demo data seeded successfully')

  return ok({
    success: true,
    message: 'Demo data seeded successfully.',
    counts: {
      districts: GUJARAT_DISTRICTS.length,
      missions: MISSIONS.length,
      badges: BADGES.length,
      demoAccounts: demoUsers.length,
      sampleUsers: sampleNames.length,
      communities: communities.length,
      samplePins: samplePins.length
    },
    demoCredentials: [
      { role: 'CITIZEN', email: 'citizen@demo.greengujarat.in', password: 'GreenGujarat@2026' },
      { role: 'MODERATOR', email: 'moderator@demo.greengujarat.in', password: 'GreenGujarat@2026' },
      { role: 'ADMIN', email: 'admin@demo.greengujarat.in', password: 'GreenGujarat@2026' }
    ]
  })
}
