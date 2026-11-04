# 🌿 GREEN GUJARAT — Mission LiFE Citizen Engagement Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Govt of Gujarat](https://img.shields.io/badge/GEDA-Mission%20LiFE-16834A?style=for-the-badge)](https://geda.gujarat.gov.in/)

> **"Small Actions. Big Impact. One Green Gujarat."**  
> An enterprise-grade, role-based civic sustainability platform developed for the **Gujarat Energy Development Agency (GEDA)** under Problem Statement **HC26-GEDA01** (*Theme: Green Energy & Sustainability*).

---

## 📌 Platform Overview

**GREEN GUJARAT** empowers 60+ million citizens across all 33 districts of Gujarat to participate in India's **Mission LiFE (Lifestyle for Environment)** movement. 

The platform turns domestic energy conservation, rooftop solar adoption, and civic sustainability micro-habits into measurable, verified, and gamified progress.

```
       ┌────────────────────────────────────────────────────────┐
       │             GREEN GUJARAT PLATFORM (GEDA)             │
       └────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
  🧑 CITIZEN PORTAL        🛡️ MODERATOR PORTAL       🏛️ ADMIN CONSOLE
  • Personal Dashboard     • Mission Verification   • State-Wide KPIs
  • Green Missions         • Photo Evidence Review  • User & Role Management
  • Smart Bill Scanner     • Reported Content       • Mission & Campaign CRUD
  • AI Energy Doctor       • Community Moderation   • District Analytics
  • Community & Passport   • Verification History   • GEDA Authority Center
```

---

## 👥 3-Tier Role-Based Experience (RBAC)

The platform enforces strict server-side and client-side **Role-Based Access Control (RBAC)**. Each role receives a dedicated, streamlined dashboard with zero unnecessary clutter (limited to 5 core navigation items per role):

### 1. 🧑 Citizen Panel — *My Green Dashboard*
Designed for citizens to track personal carbon emissions, reduce electricity bills, and earn Green Points.
* **My Dashboard** (`#dashboard`): Real-time Green Score, electricity consumption trend, CO₂ reduction stats, active streak, and personalized AI tips.
* **Green Missions** (`#missions`): Daily Mission LiFE micro-habits (24°C AC challenge, bucket baths, tree plantation) with photo proof upload.
* **Bill Scanner** (`#scanner`): Instant OCR analysis for Torrent Power, DGVCL, PGVCL, MGVCL, and UGVCL electricity bills.
* **AI Energy Doctor** (`#doctor`): Appliance-level consumption audit, vampire power detection, and tariff tier optimization.
* **Community Hub** (`#community`): Connect with local municipal wards, RWAs, schools, and green initiatives across Gujarat.
* *Quick Extras*: **Green Action Passport** (verifiable certificates) & **My Rewards** (civic redemption).

### 2. 🛡️ Moderator Panel — *Community Moderation Dashboard*
Designed for authenticating civic actions and ensuring community safety without admin overhead.
* **Moderator Overview** (`#moderator-dashboard`): Real-time verification queue metrics, approval ratios, and pending alerts.
* **Pending Verifications** (`#mod-pending`): Live review queue for submitted mission proof photos with single-click Approve / Reject actions.
* **Reported Content** (`#mod-reports`): Community flagged posts, inappropriate discussions, and user report handling.
* **Community Feed** (`#mod-posts`): Live feed moderation with options to hide or feature community contributions.
* **Verification History** (`#mod-history`): Tamper-evident audit log of all processed verification decisions.
* *Security Safeguards*: Strict restriction from system configuration, user role alteration, or database internals.

### 3. 🏛️ Admin Panel — *GEDA Administration Dashboard*
Designed for GEDA officials and state administrative personnel to monitor Gujarat's clean energy transition.
* **State Dashboard** (`#admin-dashboard`): State-wide Mission LiFE overview, active citizens, total kWh saved, and CO₂ offset.
* **User Management** (`#admin-citizens`): Comprehensive registry of citizens, moderators, account status, and role elevation.
* **Mission Management** (`#admin-missions`): Create, update, activate, and configure point weights for state-wide campaigns.
* **State Analytics** (`#admin-analytics`): District-wise performance across all 33 districts, renewable adoption rates, and exportable reports.
* **GEDA Control Center** (`#admin`): Central control for system settings, AI engine parameters, and tamper-proof platform audit logs.

---

## ⚡ Core Modules & Innovations

| Module | Features & Capabilities |
| :--- | :--- |
| **Smart Bill Scanner** | OCR bill reader calibrated for Gujarat DISCOMs (Torrent, DGVCL, PGVCL, MGVCL, UGVCL). Automatically extracts kWh, tariff tier, and calculates carbon emissions. |
| **AI Energy Doctor** | Algorithmic audit assessing phantom load, seasonal AC variations, and projected cost savings from simple behavioral changes. |
| **EcoMitra AI Copilot** | Multilingual conversational assistant supporting **English, Gujarati (ગુજરાતી), and Hindi (हिन्दी)** with instant advice on solar subsidies and energy saving. |
| **Smart Solar Advisor** | Dynamic rooftop solar feasibility engine integrating the **PM Surya Ghar: Muft Bijli Yojana** central subsidy calculator (up to ₹78,000) and 25-year financial ROI. |
| **Gujarat Green Map** | Interactive Leaflet-powered GIS map locating verified EV charging stations, solar installations, compost pits, and recycling hubs. |
| **Green Digital Twin** | High-level interactive 3D/2D model visualizing district-by-district energy efficiency, solar capacity, and civic participation across Gujarat. |
| **Green Action Passport** | Verifiable digital credentials, dynamic tier progression, and downloadable PDF Green Impact Certificates. |
| **State Leaderboards** | Anonymized, district-wise, municipal-level, and institutional rankings updated in real time. |

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router + Turbopack), React 19, TypeScript
* **Styling & UI**: Tailwind CSS 4, shadcn/ui (Radix primitives), Lucide Icons
* **Data Visualization**: Recharts, Leaflet GIS, OpenStreetMap
* **Backend Architecture**: Next.js Versioned REST API (`/api/v1/*`) with RBAC middleware
* **Database & ORM**: Prisma ORM with SQLite (Zero-config local demo) / PostgreSQL ready
* **Security**: JWT (`httpOnly`, SameSite cookies), bcryptjs password hashing, parameterised queries
* **Document Generation**: jsPDF for official Citizen Impact Certificates

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** 18.18+ or 20+ installed
* **npm**, **pnpm**, or **bun**

### 1. Clone the Repository
```bash
git clone https://github.com/Prathammehta07/Greenr-Gujarat-.git
cd Greenr-Gujarat-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="super-secret-key-min-32-characters-long"
JWT_ACCESS_EXPIRES="900"
JWT_REFRESH_EXPIRES="604800"
EMISSION_FACTOR_KG_PER_KWH="0.71"
OCR_PROVIDER="demo"
LLM_PROVIDER="demo"
```

### 4. Push Database Schema & Seed Data
```bash
# Push database schema
npx prisma db push

# Seed initial districts, missions, badges, and demo accounts
npm run db:seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Access Credentials

The database comes pre-seeded with dedicated demo accounts for instant evaluation:

| Role | Email Address | Password | Landing Portal |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@demo.greengujarat.in` | `GreenGujarat@2026` | Citizen Dashboard (`#dashboard`) |
| **Moderator** | `moderator@demo.greengujarat.in` | `GreenGujarat@2026` | Moderator Dashboard (`#moderator-dashboard`) |
| **GEDA Admin** | `admin@demo.greengujarat.in` | `GreenGujarat@2026` | Admin Dashboard (`#admin-dashboard`) |

> 💡 *You can also click the quick demo role buttons on the login screen for instant 1-click access.*

---

## 📐 Calculation Formulas & Scientific Baselines

All formulas are standardized according to Indian Bureau of Energy Efficiency (BEE) and CEA grid factors:

1. **Grid Emission Factor**:  
   $$\text{Emission (kg } \text{CO}_2) = \text{Consumption (kWh)} \times 0.71 \text{ kg CO}_2/\text{kWh}$$
2. **Estimated Energy Savings**:  
   $$\text{Savings (kWh)} = \text{Baseline Average} - \text{Current Consumption}$$
3. **Green Score**:  
   $$\text{Score} = \min\left(100, \, \left(\text{Points} \times 0.2\right) + \left(\text{Saved kWh} \times 0.2\right) + \left(\text{Verified Missions} \times 1.0\right)\right)$$
4. **PM Surya Ghar Subsidy Tier**:
   * Up to $1\text{ kW}$: ₹30,000
   * $2\text{ kW}$: ₹60,000
   * $3\text{ kW}$ and above: ₹78,000 (Maximum Central Financial Assistance)

---

## 📁 Project Directory Structure

```
Greenr-Gujarat-/
├── prisma/
│   └── schema.prisma            # 18 relational models with indexes & cascades
├── public/
│   ├── logo.svg                 # Official Green Gujarat brand mark
│   └── images/                  # Infographics and scenic Gujarat clean energy assets
├── src/
│   ├── app/
│   │   ├── api/v1/              # RESTful API endpoints with role checks
│   │   │   ├── admin/           # Metrics, user management, audit logs, seeding
│   │   │   ├── moderator/       # Queue metrics and verification controls
│   │   │   ├── auth/            # JWT authentication & session management
│   │   │   ├── bills/           # OCR bill processing & history
│   │   │   ├── missions/        # Citizen mission submissions
│   │   │   └── solar/           # PM Surya Ghar solar calculator
│   │   ├── globals.css          # Design tokens & color variables
│   │   ├── layout.tsx           # Metadata, favicon, and AuthProvider wrapper
│   │   └── page.tsx             # Role-based SPA router with RBAC guards
│   ├── components/
│   │   ├── shared/              # Sidebars, Logo, and App Shell
│   │   │   ├── citizen-sidebar.tsx
│   │   │   ├── moderator-sidebar.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── app-shell.tsx
│   │   │   └── logo.tsx
│   │   ├── ui/                  # Accessible shadcn/ui components
│   │   └── views/               # Individual feature and role view pages
│   ├── lib/
│   │   ├── rbac.ts              # Centralized Role-Based Access Control logic
│   │   ├── router.tsx           # Client-side hash routing & history sync
│   │   ├── auth.ts              # Server-side JWT & password hashing
│   │   ├── calc.ts              # Mathematical & emission calculations
│   │   └── eco-engine.ts        # Multilingual EcoMitra rules engine
│   └── types/                   # TypeScript interfaces & API contracts
├── scripts/
│   └── seed-random-data.js      # Seed generator for demo users & submissions
└── package.json
```

---

## 🔒 Security & Verification Integrity

* **Tamper-Proof Audit Logging**: Every administrative action, mission approval, rejection, and role alteration is permanently logged in the `AuditLog` table.
* **Anti-Cheat Verification**: Mission submissions require photo proof; duplicate attempts are prevented via unique composite indexes (`userId` + `missionId`).
* **Privacy Safeguards**: Citizen electricity bills and consumer numbers are strictly segregated and inaccessible to moderators or other citizens. Leaderboards display anonymized civic display handles.

---

## 📄 License

This project is developed for the GEDA Hackathon (Problem Statement **HC26-GEDA01**).  
Licensed under the [MIT License](LICENSE).
