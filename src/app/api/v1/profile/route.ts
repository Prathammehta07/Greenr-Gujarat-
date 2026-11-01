// GET /api/v1/profile  +  PUT /api/v1/profile
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { profile: { include: { district: true } } }
  })
  if (!user) return unauthorized()

  return ok({
    profile: user.profile ? {
      name: user.name,
      email: user.email,
      publicName: user.publicName,
      preferredLang: user.preferredLang,
      consentPublic: user.consentPublic,
      consentProfile: user.consentProfile,
      consentContact: user.consentContact,
      districtId: user.profile.districtId,
      districtName: user.profile.district?.name,
      cityVillage: user.profile.cityVillage,
      householdSize: user.profile.householdSize,
      homeType: user.profile.homeType,
      monthlyKwh: user.profile.monthlyKwh,
      hasRooftopSolar: user.profile.hasRooftopSolar,
      solarCapacityKw: user.profile.solarCapacityKw,
      bio: user.profile.bio,
      avatarColor: user.profile.avatarColor,
    } : null
  })
}

export async function PUT(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  const allowed = ['name', 'cityVillage', 'householdSize', 'homeType', 'monthlyKwh', 'hasRooftopSolar', 'solarCapacityKw', 'bio', 'consentPublic', 'consentProfile', 'consentContact', 'preferredLang', 'districtId', 'avatarColor']
  const data: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in body) data[k] = body[k]
  }

  // validate district if provided
  if (data.districtId) {
    const d = await db.district.findUnique({ where: { id: data.districtId } })
    if (!d) return err('Invalid district')
  }

  const user = await db.user.findUnique({ where: { id: payload.sub }, include: { profile: true } })
  if (!user) return unauthorized()

  // update User fields
  const userFields: Record<string, unknown> = {}
  if (data.name !== undefined) userFields.name = data.name
  if (data.preferredLang !== undefined) userFields.preferredLang = data.preferredLang
  if (data.consentPublic !== undefined) {
    userFields.consentPublic = data.consentPublic
    if (data.consentPublic && !user.publicName) {
      userFields.publicName = (data.name || user.name).split(' ')[0] + '_' + Math.random().toString(36).slice(2, 6)
    }
  }
  if (data.consentProfile !== undefined) userFields.consentProfile = data.consentProfile
  if (data.consentContact !== undefined) userFields.consentContact = data.consentContact

  // update Profile fields
  const profileFields: Record<string, unknown> = {}
  for (const k of ['cityVillage', 'householdSize', 'homeType', 'monthlyKwh', 'hasRooftopSolar', 'solarCapacityKw', 'bio', 'avatarColor', 'districtId']) {
    if (data[k] !== undefined) profileFields[k] = data[k]
  }

  await db.$transaction(async (tx) => {
    if (Object.keys(userFields).length) {
      await tx.user.update({ where: { id: user.id }, data: userFields })
    }
    if (user.profile) {
      if (Object.keys(profileFields).length) {
        await tx.userProfile.update({ where: { userId: user.id }, data: profileFields })
      }
    } else if (Object.keys(profileFields).length) {
      await tx.userProfile.create({ data: { userId: user.id, ...profileFields } })
    }
  })

  await audit('PROFILE_UPDATED', 'USER', user.id, user.id, JSON.stringify(Object.keys(data)))

  return ok({ success: true })
}
