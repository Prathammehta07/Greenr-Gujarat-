// Lightweight i18n — English/Gujarati/Hindi
import type { Language } from '@/types'

type Dict = Record<string, { en: string; gu: string; hi: string }>

const T: Dict = {
  // Navigation
  nav_dashboard: { en: 'Dashboard', gu: 'ડેશબોર્ડ', hi: 'डैशबोर्ड' },
  nav_missions: { en: 'Green Missions', gu: 'ગ્રીન મિશન્સ', hi: 'ग्रीन मिशन' },
  nav_passport: { en: 'Green Passport', gu: 'ગ્રીન પાસપોર્ટ', hi: 'ग्रीन पासपोर्ट' },
  nav_scanner: { en: 'Bill Scanner', gu: 'બિલ સ્કેનર', hi: 'बिल स्कैनर' },
  nav_doctor: { en: 'AI Energy Doctor', gu: 'AI એનર્જી ડોક્ટર', hi: 'AI एनर्जी डॉक्टर' },
  nav_solar: { en: 'Solar Advisor', gu: 'સોલર એડવાઇઝર', hi: 'सौर सलाहकार' },
  nav_community: { en: 'Community Hub', gu: 'કોમ્યુનિટી હબ', hi: 'कम्युनिटी हब' },
  nav_map: { en: 'Green Map', gu: 'ગ્રીન મેપ', hi: 'ग्रीन मैप' },
  nav_leaderboard: { en: 'Leaderboard', gu: 'લીડરબોર્ડ', hi: 'लीडरबोर्ड' },
  nav_twin: { en: 'Digital Twin', gu: 'ડિજિટલ ટ્વિન', hi: 'डिजिटल ट्विन' },
  nav_ai: { en: 'EcoMitra AI', gu: 'EcoMitra AI', hi: 'EcoMitra AI' },
  nav_admin: { en: 'Admin Center', gu: 'એડમિન સેન્ટર', hi: 'एडमिन सेंटर' },
  nav_profile: { en: 'Profile', gu: 'પ્રોફાઇલ', hi: 'प्रोफ़ाइल' },
  nav_logout: { en: 'Logout', gu: 'લોગઆઉટ', hi: 'लॉगआउट' },
  // Common
  welcome: { en: 'Welcome', gu: 'સ્વાગત', hi: 'स्वागत' },
  loading: { en: 'Loading...', gu: 'લોડ થઈ રહ્યું છે...', hi: 'लोड हो रहा है...' },
  save: { en: 'Save', gu: 'સાચવો', hi: 'सेव करें' },
  cancel: { en: 'Cancel', gu: 'રદ કરો', hi: 'रद्य' },
  submit: { en: 'Submit', gu: 'સબમિટ', hi: 'जमा करें' },
  confirm: { en: 'Confirm', gu: 'પુષ્ટિ કરો', hi: 'पुष्टि करें' },
  back: { en: 'Back', gu: 'પાછળ', hi: 'पीछे' },
}

export function t(key: keyof typeof T, lang: Language): string {
  return T[key]?.[lang] || T[key]?.en || key
}
