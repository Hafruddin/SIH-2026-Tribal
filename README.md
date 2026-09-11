# TRIBAL SCHOLAR (SIH 2026 — Problem Statement ID: 26238)
> *"Unified Scholarship Mobile Application & Web Portal for Tribal Students"*
> Ministry of Tribal Affairs (MoTA), Government of India • Smart India Hackathon 2026

**Production Frontend URL:** [https://tribalscholarship.netlify.app](https://tribalscholarship.netlify.app)  
**GitHub Repository:** [https://github.com/Hafruddin/SIH-2026-Tribal](https://github.com/Hafruddin/SIH-2026-Tribal)

---

## 🏛️ Core Value Proposition
**"One Student → One Profile → One Lifetime OTR → One Verified Document Vault → Multiple Eligible Scholarships → One Unified DBT Tracking Experience"**  
*Verify once. Reuse securely across central and state tribal scholarship schemes without repetitive paperwork.*

---

## 🚀 Key Features & Architectural Modules

1. **JAGO Multilingual Voice Assistant (ElevenLabs ElevenAgents + Web Speech)**:
   - Voice-first assistance designed for tribal students, supporting **English, Hindi, Telugu, Tamil, Marathi, Bengali, Kannada, and Malayalam**.
   - Dual-engine fallback: Real-time ElevenLabs conversational AI SDK with seamless Web Speech API fallbacks.
   - Profile-aware: Authenticated students can query their live application status, sanction numbers, and DBT payment dates via voice.

2. **Unified Document Vault & DigiLocker Adapter**:
   - Cryptographically stamped and verified document repository (ST Caste Certificate, Income Certificate, College Bonafide, Marksheets, Bank Passbook).
   - Once verified, documents are automatically linked to future scholarship applications without re-uploading.

3. **Multilingual System & Localized PDF Generation**:
   - 8 language interfaces (`en`, `hi`, `te`, `ta`, `mr`, `bn`, `ml`, `kn`) covering all pages, forms, and dialogs.
   - Multilingual Circular Viewer & PDF Generator (`ann_6` PVTG guidelines) rendering native script Unicode documents with printable formats.

4. **Secure Authentication & Lifetime OTR**:
   - Role-based authorization with bcrypt password encryption and JWT sessions.
   - Dedicated portals for Students (`/student/dashboard`) and Administrators (`/admin`).

5. **Direct Benefit Transfer (DBT) Tracker**:
   - Real-time milestone tracking (Sanction, PFMS validation, Bank Credit, UTR transaction reference).

6. **Government Integration Adapters (Mock Production-Ready Interfaces)**:
   - UIDAI (Aadhaar verification), e-District (ST Caste & Income validation), UDISE+/APAAR (Student registry), PFMS (DBT disbursals).

---

## 🔑 Demo Credentials

| Role | Identifier | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `OTR2026001234` | `Student@123` | [`/login`](https://tribalscholarship.netlify.app/login) → [`/student/dashboard`](https://tribalscholarship.netlify.app/student/dashboard) |
| **Demo Administrator** | `admin@tribalscholar.demo` | `Admin@123` | [`/login`](https://tribalscholarship.netlify.app/login) → [`/admin`](https://tribalscholarship.netlify.app/admin) |

---

## 🏗️ Production Architecture

```
USER BROWSER / MOBILE CLIENT
           ↓
    NETLIFY EDGE CDN (https://tribalscholarship.netlify.app)
    React 18 + Vite SPA (Client-side routing + Axios)
           ↓ HTTPS (VITE_API_BASE_URL)
    PUBLIC NODE.JS BACKEND (Render / Railway / AWS)
    Express + TypeScript + CORS + Helmet + Multer
       ├── JAGO Assistant Engine (ElevenLabs SDK / Web Speech)
       ├── Authentication & JWT Session Verifier
       ├── Verification Engine & Gov Adapters
       └── Database Layer (Prisma ORM for MySQL)
```

---

## ⚙️ Environment Variables Setup

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_key_here
DATABASE_URL=mysql://user:password@host:3306/tribal_scholar
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_AGENT_ID=agent_jago_tribal_scholar
CORS_ORIGIN=https://tribalscholarship.netlify.app
```

---

## 🚀 1-Click Backend Deployment (Render)

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository: `https://github.com/Hafruddin/SIH-2026-Tribal`.
4. Render will automatically detect `render.yaml` and configure the web service with all build and start commands.
5. Copy your deployed Render URL (e.g., `https://tribal-scholar-backend.onrender.com`).
6. In **Netlify Site Configuration** → **Environment Variables**, set:
   - `VITE_API_BASE_URL` = `https://tribal-scholar-backend.onrender.com`
7. Trigger a new deployment on Netlify.

---

## 🧪 Testing & Verification Status

| Feature / Module | Status | Verification Summary |
| :--- | :--- | :--- |
| **Frontend Build** | PASS | `npm run build` completed with 0 errors via TypeScript 5 & Vite. |
| **Backend Build** | PASS | `tsc` compiled cleanly to `dist/server.js`. |
| **Health Endpoints** | PASS | `GET /api/health` returns `{ ok: true, status: 'OK' }`. |
| **JAGO Health** | PASS | `GET /api/jago/health` verifies ElevenLabs connectivity safely. |
| **Student Auth** | PASS | `OTR2026001234` / `Student@123` verified with bcrypt & JWT. |
| **Admin Auth** | PASS | `admin@tribalscholar.demo` / `Admin@123` verified with role `ADMIN`. |
| **Invalid Auth** | PASS | Invalid password returns HTTP 401; empty input returns HTTP 400. |
| **Multilingual PDFs** | PASS | `ann_6` verified with native Telugu, Tamil, Hindi, and English bodies. |
| **Prisma Schema** | PASS | 14 database models defined with MySQL configuration in `backend/prisma/schema.prisma`. |
| **Netlify Routing** | PASS | `netlify.toml` configured with `/* -> /index.html 200` to eliminate 404s. |
