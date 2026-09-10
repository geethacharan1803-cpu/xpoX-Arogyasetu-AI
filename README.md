# ArogyaSetu AI 🏥🌿

> **AI-Powered, Multilingual, Offline-Ready Rural Healthcare Platform**  
> Bridging the critical care gap between rural patients, frontline ASHA workers, and Primary Health Centre (PHC) doctors.

---

## 🌟 Overview

Rural healthcare in India faces severe challenges: language barriers, doctor shortages, connectivity dropouts, and fragmented patient records. **ArogyaSetu AI** provides an accessible, mobile-first ecosystem tailored specifically for community health workers and rural communities:

- **ASHA-Worker Friendly:** High contrast, thumb-friendly touch targets, minimal typing, visual cues.
- **Multilingual & Voice-First:** Voice queries and text-to-speech in Telugu, Hindi, and English (ArogyaVani).
- **Human-in-the-Loop Safety:** AI assists with triage and summarization, but never diagnoses or prescribes — medical decisions remain strictly with PHC doctors.
- **Offline Resilience:** Works with local storage caching and clear sync indicators for patchy rural networks.
- **Fast & Zero-Config Demo:** Full demo dataset pre-loaded; runs standalone with zero setup or API keys required.

---

## 👥 Supported Roles & Workflows

### 1. 👩‍⚕️ ASHA Worker Portal
- **Dashboard:** At-a-glance metrics (active patients, high-risk cases, pending follow-ups, sync status).
- **Patient Registry (`/asha/patients`):** Searchable community directory with complete history and one-click new patient registration.
- **Smart Triage & Health Tickets (`/asha/tickets`):** Structured symptom intake generating severity-tagged health tickets.
- **High-Risk Pregnancy Monitoring (`/asha/pregnancy`):** Track trimester milestones, hemoglobin levels, and danger signs.
- **SevaConnect Referrals (`/asha/referrals`):** Seamless digital referrals from village to nearest PHC or district hospital.
- **Follow-Up Scheduler (`/asha/followups`):** Due today, overdue, and upcoming home visits.
- **ArogyaVani Voice Assistant (`/asha/voice`):** Speech-to-speech in Telugu, Hindi, and English for hands-free clinical notes and field queries.
- **SwasthyaGyan (`/asha/education`):** Audio-narrated community health guides (maternal health, immunization, sanitation).
- **Sync Center (`/asha/sync`):** Online/offline status monitor and sync trigger.

### 2. 🩺 PHC Doctor Portal
- **Doctor Dashboard (`/doctor/dashboard`):** Inbound referrals, high-priority triage alerts, pending health ticket reviews.
- **Clinical Referrals (`/doctor/referrals`):** Review ASHA notes, update patient disposition, and coordinate hospital admissions.
- **e-Prescriptions (`/doctor/prescriptions`):** Verified prescription creation by certified doctors (with explicit AI safety disclaimers).
- **Patient Records (`/doctor/patients`):** Long-term longitudinal health history.

### 3. 👤 Patient & Family Portal
- **Patient Home (`/patient/home`):** Simple interface for rural patients and caretakers.
- **Active Care Tickets (`/patient/ticket`):** Real-time status of doctor visits and referrals.
- **Upcoming Follow-Ups (`/patient/followups`):** Visual calendar of upcoming home visits and medication schedules.
- **Voice Help & Health Guides:** Direct access to ArogyaVani and SwasthyaGyan audio library.

### 4. 🏛️ Health Administrator Portal
- **System Dashboard (`/admin/dashboard`):** District-wide statistics, coverage rates, and active caseload.
- **PHC Directory (`/admin/phcs`):** Primary health centres, bed availability, and referral capacity.
- **Field Worker Registry (`/admin/workers`):** ASHA worker assignments and community reach.
- **System Analytics (`/admin/analytics`):** Real-time metrics on referral turnaround and maternal outcomes.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, dynamic client rendering, optimized static generation)
- **UI & Styling:** Vanilla CSS Design System with accessible HSL color palettes, custom responsive layouts, and zero heavy CSS frameworks
- **Icons:** [Lucide React](https://lucide.dev/)
- **Voice & Speech:** Web Speech Recognition API + Web Speech Synthesis (TTS) with Telugu (`te-IN`), Hindi (`hi-IN`), and English (`en-IN`)
- **AI Integration:** Google Gemini API integration (`/api/ai`, `/api/translate`) with graceful built-in fallback to rich demo responses when API keys are absent

---

## 🚀 Quick Start (Local Run)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(ArogyaSetu AI includes a complete offline demo engine and works fully without any API key)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🚢 Deploying to Vercel

ArogyaSetu AI is pre-configured and tested for 1-click zero-error Vercel deployment:

1. Push this repository to GitHub/GitLab.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import the repository.
4. (Optional) Add `GEMINI_API_KEY` in Environment Variables if you want live Gemini AI generation.
5. Click **"Deploy"**. The build will run `npm run build` and deploy within 60 seconds.

---

## 🛡️ Medical AI Safety Principles

1. **Human Doctor in Control:** The platform strictly prohibits AI from generating definitive diagnoses or prescriptions. Only licensed PHC doctors can authorize prescriptions.
2. **Deterministic Fallbacks:** Rural network outages never block field operations; triage logic defaults to standardized protocol-based checklists.
3. **Data Privacy:** Local storage is used for offline caching; sensitive health records include clear role-based access separation.
