# ArogyaSetu AI 🏥🌿

> **AI-Powered, Multilingual, Offline-Aware Rural Healthcare Platform**  
> *«From a patient's voice in the village to a doctor's desk — and back to the patient in their own language.»*

---

## 🌟 Overview & Mission

Rural healthcare in India faces four acute bottlenecks: language barriers between dialect-speaking villagers and clinical systems, acute PHC doctor shortages, connectivity dropouts in remote habitations, and fragmented care records.

**ArogyaSetu AI** solves this by acting as an intelligent, safety-governed communication bridge:
- **ASHA-Worker Centric:** Large touch targets, minimal typing, voice-first input, and low-literacy friendly visual indicators.
- **Multilingual Vernacular Pipeline:** Native speech recognition and TTS in **Telugu (`te-IN`)**, **Hindi (`hi-IN`)**, and **English (`en-IN`)**. Original dialect transcripts are strictly preserved in the clinical record rather than silently overwritten.
- **Strict Medical AI Safety:** The AI is the bridge, NOT the doctor. It extracts structured symptoms and classifies urgency (*Emergency*, *Urgent*, *Routine*), but never independently prescribes or diagnoses. Only certified PHC Medical Officers authorize prescriptions.
- **Offline-First Resilience:** Visual states (**ONLINE**, **OFFLINE**, **SYNCING**, **SYNCED**, **SYNC FAILED**) with local storage caching for patchy 2G/3G networks.

---

## 🧩 The Four Core Modules

### 1. 🎙️ ArogyaVani (Voice-First Triage)
- Speech-to-Speech interaction in Telugu, Hindi, and English.
- Captures native dialect audio, produces verifiable transcripts, and classifies triage urgency.
- Provides immediate safe vernacular guidance to the patient and generates doctor-facing clinical English summaries.
- One-click translation to structured Health Tickets.

### 2. 📋 VaidyaSahayak (ASHA / ANM Clinical Assistant)
- **Patient Directory & Registration (`/asha/patients`):** Rapid field registration with gestational tracking and chronic condition screening.
- **Health Ticket Hub (`/asha/tickets`):** End-to-end longitudinal tracking object connecting voice, vitals, doctor review, and follow-ups.
- **Maternal Health Monitoring (`/asha/pregnancy`):** High-risk pregnancy surveillance, gestational week tracker, and red-flag alerts.
- **Offline Sync Center (`/asha/sync`):** Explicit sync states and queued field updates.

### 3. 🔄 SevaConnect (Care Coordination & Referral Network)
- **Referral Lifecycle (`/asha/referrals` & `/doctor/referrals`):** Village-to-PHC transfer management with priority tagging (High, Medium, Routine).
- **Follow-up Engine (`/asha/followups` & `/doctor/followups`):** Due Today, Overdue, and Upcoming home visits with one-click completion.
- **Healthcare Facilities Directory (`/asha/facilities`):** Locality-based PHC, CHC, and District Hospital guide with real service indicators.

### 4. 📚 SwasthyaGyan (Vernacular Community Health Education)
- Categorized public health modules: Maternal Health, Child Immunization, Nutrition, Water Sanitation, and Seasonal Epidemic prevention.
- Audio narration (TTS) for non-literate community members.

---

## 🎫 Central Object: The Health Ticket

Every patient journey is unified through a unique Health Ticket (e.g. `HT-2026-000124`):

```text
Patient Voice (Telugu/Hindi)
        ↓
Speech-to-Text (Preserved Original Transcript)
        ↓
Structured Triage (Symptoms + Vitals Screened)
        ↓
Unique Health Ticket Generated
        ↓
SevaConnect PHC Referral
        ↓
Doctor Review at Health Centre
        ↓
Certified Doctor Prescription (Medicines + Dosage Locked)
        ↓
Verified Vernacular Patient Explainer ("Voice back to Patient")
        ↓
ASHA Field Follow-up Scheduled
```

---

## 👥 Supported Roles & Dashboards

| Role | Default Credentials / Switcher | Core Features |
| :--- | :--- | :--- |
| **👩‍⚕️ ASHA Worker** | Role Switcher ➔ ASHA Worker | Patient Registration, ArogyaVani Voice Intake, Smart Triage, Maternal Tracking, Follow-ups, Sync Center |
| **🩺 PHC Doctor** | Role Switcher ➔ Doctor | Inbound Referrals, Clinical Ticket Review, e-Prescriptions with AI Explainer, Longitudinal Patient Records |
| **👤 Patient / Family** | Role Switcher ➔ Patient | Vernacular Voice Help, Active Health Ticket Timeline, Appointment Reminders, Audio Education |
| **🏛️ Health Administrator** | Role Switcher ➔ Administrator | District-Wide KPI Dashboards, Facility & Bed Oversight, Referral Turnaround Analytics, Field Workforce Reach |

---

## 🛡️ Medical AI Safety & Prescription Guardrails

1. **Human-in-the-Loop:** AI assists with translation and triage summarization. It is strictly prohibited from altering medicines, dosages, frequencies, or durations.
2. **Audit Provenance:** Original voice transcripts are permanently linked alongside doctor review notes.
3. **Verified Patient Explainer:** When a doctor authorizes a prescription, the system translates the instructions into Telugu or Hindi (e.g., *"Take 1 tablet after meals with water twice daily"*) and allows audio playback without altering any clinical parameter.
4. **Deterministic Fallbacks:** If external AI services or network connections are unavailable, the platform uses standardized clinical guideline algorithms and cached responses.

---

## 🛠️ Technology Stack

- **Frontend & Routing:** [Next.js 14](https://nextjs.org/) (App Router, Client-Side Rendering, 0-blocking static prerendering)
- **Styling:** Custom Vanilla CSS Design System with accessible HSL color palettes and zero heavy framework bloat (First Load JS: `87.4 kB`).
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio & Speech:** Web Speech Recognition API + Web Speech Synthesis (Telugu `te-IN`, Hindi `hi-IN`, English `en-IN`).
- **AI & Translation:** Google Gemini API (`/api/ai`, `/api/translate`) with built-in context-aware offline clinical dictionary fallback.
- **Hosting Target:** [Vercel](https://vercel.com/)

---

## 🚀 Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Configure Environment (Optional)
cp .env.example .env.local

# 3. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

```bash
# 4. Production build & test
npm run build
npm run start
```

---

## 🚢 Deploying to Vercel

1. Push to your GitHub repository:
   ```bash
   git push origin main
   ```
2. In [Vercel Dashboard](https://vercel.com/), click **"Add New Project"** and import `xpoX-Arogyasetu-AI`.
3. *(Optional)* Add `GEMINI_API_KEY` under Environment Variables.
4. Click **"Deploy"**. The build completes in ~30 seconds with 0 configuration required.

---

## 🏆 Hackathon Demo Flow (3-Minute Script)

1. **Login:** Select **ASHA Worker** on the login screen.
2. **Patient Registration:** Navigate to **Patients** ➔ click **"Register Patient"** ➔ add a new village member.
3. **Voice Intake (ArogyaVani):** Open **ArogyaVani** ➔ select Telugu (`te-IN`) ➔ click a sample prompt (*"High Fever & Chills"*) or speak into the microphone ➔ notice the original Telugu transcript, the urgency alert, and the English doctor summary. Click **"Speak to Patient"** to demonstrate vernacular audio output.
4. **Health Ticket:** Click **"Generate Health Ticket"** ➔ review vitals, symptoms, and the multi-step timeline.
5. **Referral:** Go to **Referrals** ➔ click **"New Referral"** ➔ send patient to **PHC Rampur**.
6. **Doctor Review:** Switch role to **Doctor** ➔ open **Referrals** ➔ click **"Accept Referral"** ➔ click **"Add Prescription"**.
7. **Safe Prescription & Voice Back to Patient:** Click **"Authorize & Save Prescription"** ➔ play the verified audio explanation in **Telugu** or **Hindi** for the patient.
8. **Admin Oversight:** Switch role to **Admin** ➔ view district-wide referral trends, PHC facility beds, and analytics.
