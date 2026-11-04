// EcoMitra AI — multilingual rule-based assistant
// When LLM_PROVIDER=demo (or no API key), this rule engine provides
// context-aware responses in English, Gujarati, and Hindi.
// Real LLM integration is wired in src/lib/llm.ts (server-only).

import type { Language } from '@/types'

interface Rule {
  keywords: { en: string[]; gu: string[]; hi: string[] }
  responses: { en: string; gu: string; hi: string }
}

const RULES: Rule[] = [
  {
    keywords: {
      en: ['electricity bill', 'save electricity', 'reduce electricity', 'power consumption', 'kwh', 'units'],
      gu: ['વીજળી બિલ', 'વીજળી બચત', 'વીજળી વપરશ', 'યુનિટ'],
      hi: ['बिजली बिल', 'बिजली बचाने', 'बिजली खप', 'यूनिट']
    },
    responses: {
      en: 'To reduce your electricity bill: (1) Switch to LED bulbs — save 75% per bulb. (2) Set AC to 24°C — each degree lower adds ~6% to consumption. (3) Unplug devices on standby — phantom loads add 5–10% to bills. (4) Use natural light and ventilation. (5) Service refrigerator coils twice a year. Upload your bill on the Bill Scanner page and I can give you personalised estimates.',
      gu: 'તમારું વીજળી બિલ ઘટાડવા માટે: (1) LED બલ્બનો ઉપયોગ કરો — દરેક બલ્બમાં 75% બચત. (2) AC 24°C પર સેટ કરો — દરેક ડિગ્રી ઓછી તાપમાને ~6% વપરશ વધારે છે. (3) સ્ટેન્ડબાય પર રહેલા ઉપકરણોનું પ્લગ કાઢી નાખો. (4) કુદરતી પ્રકાશ અને હવાનો ઉપયોગ કરો. (5) રેફ્રિજરેટરની કોઇલ વર્ષમાં બે વાર સાફ કરો.',
      hi: 'अपना बिजली बिल कम करने के लिए: (1) LED बल्ब का उपयोग करें — प्रति बल्ब 75% की बचत. (2) AC को 24°C पर सेट करें — हर डिग्री कम तापमान से ~6% खप बढ़ती है. (3) स्टैंडबाय पर रहने वाले उपकरणों का प्लग निकालें. (4) प्राकृतिक प्रकाश और हवा का उपयोग करें. (5) रेफ्रिजरेटर की कॉइल साल में दो बार साफ करें.'
    }
  },
  {
    keywords: {
      en: ['solar', 'rooftop', 'panel', 'pv'],
      gu: ['સોલર', 'છત', 'પેનલ'],
      hi: ['सौर', 'छत', 'पैनल']
    },
    responses: {
      en: 'Rooftop solar in Gujarat: A 3 kW system generates ~360 units/month, costs ~₹1.65 lakh (before subsidy), and pays back in 4–6 years. Under PM Surya Ghar: central subsidy ₹30,000–₹78,000 (1–3 kW) plus Gujarat state subsidy. Visit the Solar Advisor for a personalised estimate. Always verify vendor approval with GEDA/GERC — I cannot recommend specific vendors.',
      gu: 'ગુજરાતમાં છત સોલર: 3 kW સિસ્ટમ ~360 યુનિટ/મહિનો ઉત્પાદન કરે, ખર્ચ ~₹1.65 લાખ (સબસિડી પહેલાં), 4–6 વર્ષમાં પેબેક. PM સૂર્ય ઘર યોજના હેઠળ કેન્દ્ર સબસિડી ₹30,000–₹78,000 અને ગુજરાત રાજ્ય સબસિડી. Solar Advisor પર જાઓ વ્યક્તિગત અંદાજ માટે.',
      hi: 'गुजरात में छत सौर: 3 kW सिस्टम ~360 यूनिट/माह उत्पादन करती है, लागत ~₹1.65 लाख (सब्सिडी पूर्व), 4–6 वर्ष में पेबैक. PM सूर्य घर योजना के तहत केंद्रीय सब्सिडी ₹30,000–₹78,000 और गुजरात राज्य सब्सिडी. व्यक्तिगत अनुमान के लिए Solar Advisor पर जाएँ.'
    }
  },
  {
    keywords: {
      en: ['carbon footprint', 'co2', 'emission', 'carbon'],
      gu: ['કાર્બન', 'ઉત્સર્જન', 'co2'],
      hi: ['कार्बन', 'उत्सर्जन', 'co2']
    },
    responses: {
      en: 'Your carbon footprint from electricity = units consumed × emission factor. For India, the grid emission factor is ~0.71 kg CO₂/kWh. So 300 units/month ≈ 213 kg CO₂/month. To reduce: save electricity, switch to rooftop solar (zero direct emissions), and use efficient appliances. The Green Score on your dashboard combines verified actions, savings, and points.',
      gu: 'વીજળીથી કાર્બન ફૂટપ્રિન્ટ = વપરાયેલા યુનિટ × ઉત્સર્જન ગુણાંક. ભારત માટે ગ્રિડ ઉત્સર્જન ગુણાંક ~0.71 kg CO₂/kWh. એટલે 300 યુનિટ/મહિનો ≈ 213 kg CO₂/મહિનો.',
      hi: 'बिजली से कार्बन फुटप्रिंट = खप यूनिट × उत्सर्जन कारक. भारत के लिए ग्रिड उत्सर्जन कारक ~0.71 kg CO₂/kWh. यानी 300 यूनिट/माह ≈ 213 kg CO₂/माह.'
    }
  },
  {
    keywords: {
      en: ['mission life', 'life mission', 'mission', 'challenge'],
      gu: ['મિશન', 'લાઇફ', 'પડકાર'],
      hi: ['मिशन', 'लाइफ', 'चुनौती']
    },
    responses: {
      en: 'Mission LiFE (Lifestyle for Environment) is a global movement launched by India at COP26 in 2021. It encourages individual lifestyle changes — saving water, reducing waste, using public transport, switching to renewables, and adopting sustainable consumption. GREEN GUJARAT turns Mission LiFE into actionable daily missions you can complete, verify, and earn points for.',
      gu: 'Mission LiFE (Lifestyle for Environment) એ COP26 (2021) માં ભારત દ્વારા શરૂ કરાયેલ વૈશ્વિક આંદોલન છે. તે વ્યક્તિગત જીવનશૈલી બદલાવને પ્રોત્સાહિત કરે છે — પાણી બચાવવું, કચરો ઘટાડવો, જાહેર પરિવહન, નવીનીકરણીય ઉર્જા.',
      hi: 'Mission LiFE (Lifestyle for Environment) COP26 (2021) में भारत द्वारा शुरू किया गया वैश्विक आंदोलन है। यह व्यक्तिगत जीवनशैली बदलाव को प्रोत्साहित करता है — पानी बचाना, कचरा घटाना, सार्वजनिक परिवहन, नवीकरणीय ऊर्जा।'
    }
  },
  {
    keywords: {
      en: ['water', 'save water'],
      gu: ['પાણી', 'પાણી બચાવ'],
      hi: ['पानी', 'जल बचत']
    },
    responses: {
      en: 'Water conservation tips: (1) Fix leaking taps — a drip wastes 11,000 L/year. (2) Use bucket bath instead of shower — saves 50 L/bath. (3) Install low-flow fixtures. (4) Reuse RO waste water for mopping/gardening. (5) Rainwater harvesting for terrace houses. Complete the "Install Water-Saving Fixture" mission to earn points.',
      gu: 'પાણી બચતની ટિપ્સ: (1) ટપકતા નળ સમારો — 11,000 L/વર્ષ બગડે છે. (2) શાવરને બદલે બાલ્ટીથી સ્નાન — 50 L/સ્નાન બચે. (3) લો-ફ્લો ફિક્સ્ચર લગાવો.',
      hi: 'जल बचत युक्तियाँ: (1) टपकते नल ठीक करें — 11,000 L/वर्ष बर्बाद होता है. (2) शॉवर के बजाय बाल्टी से स्नान — 50 L/स्नान बचत. (3) लो-फ्लो फिक्स्चर लगाएँ.'
    }
  },
  {
    keywords: {
      en: ['transport', 'ev', 'electric vehicle', 'bike', 'car', 'bus'],
      gu: ['પરિવહન', 'ઇવી', 'ગાડી', 'બસ'],
      hi: ['परिवहन', 'इवी', 'गाड़ी', 'बस']
    },
    responses: {
      en: 'Sustainable transport: (1) Walk/cycle for short trips (<2 km) — zero emissions. (2) Use AMTS/BRTS in Ahmedabad, metro in Ahmedabad/Surat. (3) Carpooling saves 30–50% emissions per person. (4) EVs: Tata Punch EV, MG Comet — running cost ₹1/km vs ₹7/km for petrol. Find EV chargers on the Community Map. The transport sector contributes ~13% of India\'s emissions.',
      gu: 'ટકાઉ પરિવહન: (1) ટૂંકી મુસાફરી માટે ચાલવું/સાયકલ. (2) AMTS/BRTS, મેટ્રોનો ઉપયોગ. (3) કારપૂલિંગ 30–50% ઉત્સર્જન બચાવે. (4) EV: ₹1/km vs પેટ્રોલ ₹7/km.',
      hi: 'टिकाऊ परिवहन: (1) छोटी यात्रा के लिए चलना/साइकिल. (2) AMTS/BRTS, मेट्रो का उपयोग. (3) कारपूलिंग 30–50% उत्सर्जन बचाता है. (4) EV: ₹1/km vs पेट्रोल ₹7/km.'
    }
  },
  {
    keywords: {
      en: ['waste', 'recycle', 'compost', 'plastic'],
      gu: ['કચરો', 'રિસાયકલ', 'ખાતર'],
      hi: ['कचरा', 'रीसाइकिल', 'कम्पोस्ट']
    },
    responses: {
      en: 'Waste reduction: (1) Segregate wet/dry/hazardous at source. (2) Compost kitchen waste — reduces landfill methane. (3) Refuse single-use plastic; carry cloth bags. (4) Donate usable items instead of discarding. Find recycling centres on the Community Map.',
      gu: 'કચરો ઘટાડો: (1) ભીનો/સૂકો/જોખમી કચરો અલગ કરો. (2) રસોડાનો કચરો ખાતરમાં ફેરવો. (3) સિંગલ-યુઝ પ્લાસ્ટિકથી દૂર રહો.',
      hi: 'कचरा घटाव: (1) गीला/सूखा/खतरनाक कचरा अलग करें. (2) रसोई का कचरा कम्पोस्ट बनाएँ. (3) सिंगल-यूज़ प्लास्टिक से बचें.'
    }
  },
  {
    keywords: {
      en: ['tree', 'plant', 'plantation'],
      gu: ['ઝાડ', 'વૃક્ષ', 'વાવેતર'],
      hi: ['पेड़', 'वृक्ष', 'रोपण']
    },
    responses: {
      en: 'Tree plantation: A mature tree absorbs ~22 kg CO₂/year and produces oxygen for 2 people. Gujarat\'s "Mangalam" and "Van Mahotsav" drives plant native species like Neem, Banyan, Pipal, Khijdo. Join a community plantation event from the Community Hub. Single tree = 1 mission submission + 50 points.',
      gu: 'વૃક્ષ વાવેતર: પુખ્ત વૃક્ષ ~22 kg CO₂/વર્ષ શોષે છે. ગુજરાતના "મંગલમ" અને "વન મહોત્સવ" અભિયાન. કોમ્યુનિટી હબમાંથી જોડાઓ.',
      hi: 'वृक्ष रोपण: परिपक्व वृक्ष ~22 kg CO₂/वर्ष सोखता है। गुजरात के "मंगलम" और "वन महोत्सव" अभियान। कम्युनिटी हब से जुड़ें।'
    }
  },
  {
    keywords: {
      en: ['hello', 'hi', 'namaste', 'help', 'what can you do'],
      gu: ['નમસ્તે', 'હાય', 'મદદ'],
      hi: ['नमस्ते', 'हाय', 'मदद']
    },
    responses: {
      en: 'Namaste! I am EcoMitra, your AI assistant for GREEN GUJARAT. I can explain electricity savings, solar energy, carbon footprints, water conservation, waste reduction, sustainable transport, and Mission LiFE. I can also guide you through the platform. What would you like to know?',
      gu: 'નમસ્તે! હું EcoMitra છું, GREEN GUJARAT માટે તમારી AI સહાયક. હું વીજળી બચત, સોલર ઉર્જા, કાર્બન ફૂટપ્રિન્ટ, પાણી બચત, કચરો ઘટાડવો, ટકાઉ પરિવહન અને Mission LiFE સમજાવી શકું છું.',
      hi: 'नमस्ते! मैं EcoMitra हूँ, GREEN GUJARAT के लिए आपकी AI सहायक। मैं बिजली बचत, सौर ऊर्जा, कार्बन फुटप्रिंट, जल बचत, कचरा घटाव, टिकाऊ परिवहन और Mission LiFE समझा सकती हूँ।'
    }
  }
]

export function ruleBasedReply(message: string, lang: Language): { reply: string; isFallback: boolean } {
  const lower = message.toLowerCase()
  for (const rule of RULES) {
    const allKeywords = [...rule.keywords.en, ...rule.keywords.gu, ...rule.keywords.hi]
    const matched = allKeywords.some(kw => lower.includes(kw.toLowerCase()))
    if (matched) {
      return { reply: rule.responses[lang] || rule.responses.en, isFallback: true }
    }
  }
  // default
  const defaults = {
    en: `I'd be happy to help with that. I'm EcoMitra, currently running in demo (rule-based) mode. I can assist with: electricity saving, solar energy, carbon footprint, water conservation, waste reduction, sustainable transport, tree plantation, and Mission LiFE. Try asking "How do I save electricity?" or "What is rooftop solar?". Note: estimates are approximate. For verified schemes/subsidies please consult GEDA's official website.`,
    gu: `હું તમારી મદદ કરીશ. હું EcoMitra છું, અત્યારે ડેમો (રૂલ-આધારિત) મોડમાં છું. હું વીજળી બચત, સોલર, કાર્બન, પાણી, કચરો, પરિવહન, વૃક્ષ અને Mission LiFE માં મદદ કરી શકું.`,
    hi: `मैं आपकी मदद करूँगा। मैं EcoMitra हूँ, अभी डेमो (रूल-आधारित) मोड में हूँ। मैं बिजली बचत, सौर, कार्बन, पानी, कचरा, परिवहन, वृक्ष और Mission LiFE में मदद कर सकता हूँ।`
  }
  return { reply: defaults[lang], isFallback: true }
}

export async function llmReply(message: string, lang: Language, history: { role: string; content: string }[]): Promise<{ reply: string; isFallback: boolean }> {
  // If a real LLM is configured, we'd call it here (server-only).
  // For now, use rule-based with conversation history context.
  void history
  return ruleBasedReply(message, lang)
}
