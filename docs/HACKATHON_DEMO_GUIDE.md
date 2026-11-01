# GREEN GUJARAT — Hackathon Demo Guide

> Scripted 5–7 minute walkthrough of all 15 modules for judges.

## Before You Start

1. Ensure the dev server is running: `bun run dev`
2. Open the preview in a new tab (use the "Open in New Tab" button above the Preview Panel)
3. Demo credentials (also visible on the login page):

| Role | Email | Password |
| --- | --- | --- |
| Citizen | `citizen@demo.greengujarat.in` | `GreenGujarat@2026` |
| Moderator | `moderator@demo.greengujarat.in` | `GreenGujarat@2026` |
| GEDA Admin | `admin@demo.greengujarat.in` | `GreenGujarat@2026` |

---

## Demo Flow (5 minutes)

### 1. Landing Page (30 seconds)
- Hero: "Make Every Action Count for a Greener Gujarat."
- Scroll through: Mission LiFE explanation, Features grid, How It Works, Live Impact stats (sourced from the database), Green Challenges preview, Solar section, Community section, Footer.
- **Highlight:** Statistics are pulled live from `/api/v1/impact-stats` — these are real database counts, not hardcoded.

### 2. Citizen Journey — Login & Dashboard (45 seconds)
- Click "Join Green Gujarat" → "Log in"
- Click the "Citizen" demo button to autofill credentials
- Click "Log in" → lands on Dashboard
- **Show:** Green Score radial chart, monthly consumption chart (may be empty initially — that's expected), AI energy tips, badges row.
- Note: For demo accounts with prior seeded footprint data, the chart will show 5 months of history.

### 3. Bill Scanner — OCR + Confirmation (60 seconds)
- Click "Bill Scanner" in the sidebar
- Click the upload area or drag a JPG/PNG/PDF bill
- **Explain:** OCR runs in demo mode (regex-based) — extracted fields are shown for **manual confirmation** before saving
- Edit the units if desired → click "Confirm & Save"
- **Show success toast:** "X green points awarded for X kWh saved vs your baseline"
- Click "Load history" to see the confirmed bill in the table

### 4. AI Energy Doctor (30 seconds)
- Click "AI Energy Doctor"
- **Show:** Trend analysis (Increasing/Decreasing/Stable), anomalies detection, appliance-level recommendations with kWh and ₹ savings estimates
- Note the disclaimer: analysis is based on uploaded bills, not real-time smart-meter data

### 5. EcoMitra AI Assistant (30 seconds)
- Click "EcoMitra AI"
- Click a suggestion chip (e.g. "How do I reduce my electricity bill?")
- **Show:** Multilingual response (try switching to Gujarati or Hindi using the language buttons)
- Note the "Demo mode" badge and disclaimer

### 6. Green Missions + Submission Flow (60 seconds)
- Click "Green Missions"
- **Show:** 7 category filters, 15 missions with difficulty badges and point values
- Click "Start Mission" on any mission → enter evidence text → "Submit for review"
- Switch to "My Submissions" tab to see pending status
- **Explain:** Duplicate submissions are prevented server-side; points only awarded after moderator approval

### 7. Moderator Approval Flow (45 seconds)
- **Open a new incognito window** (or log out and log in as Moderator)
- Login as `moderator@demo.greengujarat.in`
- Navigate to "Admin Center" → "Submissions" tab
- **Show:** The pending submission from the citizen
- Click "Approve & Award X pts"
- **Show:** Citizen auto-receives points + First Step badge (auto-awarded at first approved mission)
- Mention: Audit log captures every action; CSV export available

### 8. Green Passport + PDF Certificate (30 seconds)
- Switch back to Citizen session
- Click "Green Passport"
- **Show:** Hero stats (points, missions, badges, est. CO₂ cut), badge collection grid, monthly points chart, sustainability timeline
- Click "Download Certificate" → a styled PDF generates and downloads (Green Impact Certificate with user name, stats, badges, official disclaimer)

### 9. Smart Solar Advisor (30 seconds)
- Click "Solar Advisor"
- Default values pre-filled from profile (monthly kWh, district)
- Click "Calculate Feasibility"
- **Show:** Recommended capacity, monthly generation, installation cost, annual savings, payback period, CO₂ reduction
- Scroll to "Pathway to Verified Resources" — PM Surya Ghar subsidy, GEDA vendors, net-metering

### 10. Green Community Map (30 seconds)
- Click "Green Map"
- **Show:** Leaflet + OpenStreetMap with Gujarat-focused pins
- Toggle category filters (EV charger, solar, recycling, events, initiatives)
- Click a pin → popup shows details; **note the "Sample" badge** on demo pins
- **Emphasise:** We do not invent real business locations or falsely label unverified pins as verified

### 11. Gujarat Green Digital Twin (45 seconds)
- Click "Digital Twin"
- **Show:** Interactive Leaflet map with circle markers sized by participation
- Click a district circle → side panel shows detailed metrics
- Scroll to top-10 charts (by participation, by CO₂ reduction)
- **Emphasise:** Sample data clearly labelled; not a real-time government digital twin

### 12. Leaderboard (20 seconds)
- Click "Leaderboard"
- Toggle between Citizens/Districts/Schools/Colleges/Communities
- Toggle period (Week/Month/All-time)
- **Show:** Top-3 podium, anonymised display names, "You" badge on current user

### 13. Community Hub (30 seconds)
- Click "Community Hub"
- **Show:** 5 seeded communities (Ahmedabad Cyclists, Surat Solar, etc.)
- Join a community → create a post → like/report posts
- Click "Create" to start a new community

### 14. GEDA Admin Control Center (45 seconds)
- Login as `admin@demo.greengujarat.in`
- Click "Admin Center"
- **Show Overview tab:** 10 metric cards (citizens, MAU, missions done, pending, reports, kWh saved, CO₂ cut, communities, posts, campaigns)
- **Show Users tab:** search, role change, activate/deactivate, CSV export
- **Show Missions tab:** CRUD operations, activate/deactivate
- **Show Settings tab:** emission factor, tariff, solar benchmarks — admin-configurable
- **Show Audit Logs tab:** last 100 actions with actor, resource, timestamp

### 15. Profile & Consent (15 seconds)
- Click "Profile"
- **Show:** Personal info form, household details, solar toggle, consent switches (profile/public/contact), data deletion workflow

---

## Talking Points for Judges

1. **Production-minded architecture:** 18-table Prisma schema with proper constraints, JWT auth, RBAC, audit logs — not a mockup.
2. **End-to-end functional:** Every button, form, and chart is wired to real backend logic. No fake success messages.
3. **Transparent calculations:** Every formula documented; admin can configure emission factors and scoring rules via UI.
4. **Privacy-first:** Bills stored privately, anonymised display names on leaderboards, consent management, data deletion workflow.
5. **Honest labelling:** Demo vs real data clearly distinguished. No claims of GEDA endorsement or official statistics.
6. **Multilingual:** EcoMitra AI supports English, Gujarati, Hindi.
7. **Real OCR flow:** Upload → extract → manual confirm → save (not a fake "scanned!" message).
8. **Moderation workflow:** Submit → review → approve/reject → auto-points + auto-badges + audit log.
9. **PDF certificates:** Real jsPDF generation of monthly Green Impact Certificates.
10. **Interactive maps:** Leaflet + OSM with circle-marker digital twin, sample/verified pin distinction.

---

## Common Questions

**Q: Is this affiliated with GEDA?**
A: No. It's a hackathon prototype for problem statement HC26-GEDA01. The footer and README clearly state this.

**Q: Are the statistics real?**
A: They're real database counts from this platform. Demo accounts are clearly separated. We do not claim official GEDA or government statistics.

**Q: How would you scale this for production?**
A: Switch Prisma to PostgreSQL, port API routes to FastAPI if desired (same contract), install Tesseract OCR, configure SMTP for forgot-password, set LLM_API_KEY for real EcoMitra responses, deploy via Docker (compose file referenced in problem statement).

**Q: Why rule-based AI instead of a real LLM?**
A: For offline hackathon demos. The `LLM_PROVIDER` env var switches to a real LLM with zero code changes — see `src/lib/eco-engine.ts`.

**Q: How are points protected from fraud?**
A: Unique constraint on `(userId, missionId)` prevents duplicate submissions. Points only awarded via moderator approval endpoint. Source dedup check on `(sourceType, sourceId)` prevents double-awarding. Users cannot directly edit points. Every award/reversal logged in audit.
