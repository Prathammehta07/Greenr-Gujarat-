// GET /api/v1/auth/me
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    include: { profile: { include: { district: true } } }
  })
  if (!user) return unauthorized()

  return ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      publicName: user.publicName,
      preferredLang: user.preferredLang,
      isDemo: user.isDemo,
      consentPublic: user.consentPublic,
      consentProfile: user.consentProfile,
      consentContact: user.consentContact,
      profile: user.profile ? {
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
    }
  })
}
