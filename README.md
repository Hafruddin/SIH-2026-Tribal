# TRIBAL SCHOLAR (SIH 2026 Problem Statement 26238)
> *"Empowering Tribal Youth Through Higher Education"*

**Official Unified Scholarship Application Portal Prototype** for Ministry of Tribal Affairs (MoTA), Government of India. Developed for Smart India Hackathon 2026.

---

## 🏛️ Core Product Differentiator
**"One Student → One Profile → One Document Vault → Multiple Eligible Scholarships → One Unified Tracking Experience"**
*Verify once. Reuse securely across central and state tribal scholarship schemes.*

---

## 🚀 Key Features

1. **Strict Website Template Preserved**:
   - Official Ministry Header, Gov Banner, Language Switcher, Accessibility Controls.
   - Quick Scheme Eligibility Finder Card.
   - Live Metrics Dashboard (500K+ Students, ₹120 Cr+ Disbursed, 45+ Schemes).
   - 4-Step Application Workflow Timeline.
   - Featured Welfare Schemes Grid (Pre-Matric, Post-Matric, Top Class, National Fellowship NFST, National Overseas NOS).
   - Latest Circulars & Helpdesk Grievance Cell.

2. **Multilingual System (7 Languages)**:
   - Supports **English (`en`), Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Marathi (`mr`), Bengali (`bn`), Kannada (`kn`)**.
   - Instant UI language switching with persistent storage.

3. **Accessibility (WCAG 2.1 AA)**:
   - Live Font Resizing Controls (`A` 100%, `A+` 115%, `A++` 130%).
   - High contrast focus rings, ARIA labels, semantic HTML.

4. **One-Time Registration (OTR) & Authentication**:
   - Multi-step OTR wizard generating unique lifetime IDs (`OTR2026XXXXXX`).
   - OTP simulation & Aadhaar identity demo verification.

5. **Document Vault & DigiLocker Adapter**:
   - One-time verification & reuse across schemes.
   - Drag-and-drop file upload (PDF, JPG, PNG < 5MB).
   - DigiLocker Authorization Adapter modal importing cryptographically verified certificates.

6. **Unified Verification Layer & Government Adapters**:
   - Adapter interfaces for UIDAI, ST Certificate e-District, Income Tax Revenue, UDISE+, APAAR, AISHE, UGC-NTA.

7. **JAGO AI Chatbot Assistant**:
   - Multilingual assistant powered by OpenAI API (with smart offline fallback rule engine).
   - Context-aware: retrieves logged-in student's live application status and payment records.

8. **Direct Benefit Transfer (DBT) Payment Tracker**:
   - Real-time sanction and UTR payment tracking right up to bank credit confirmation.

9. **ST Coverage Gap Analytics (Admin Portal)**:
   - Route `/admin` & `/admin/analytics`: Matches UDISE+/APAAR ST headcount against OTR registrations to highlight unreached tribal populations.

---

## 🔑 Demo Access Credentials

| User Role | Credentials | Purpose |
| :--- | :--- | :--- |
| **Student (OTR)** | **OTR ID**: `OTR2026001234`<br/>**Password**: `Student@123` | Log in as pre-configured student (Aarav Kumar) with active applications & DBT payments. |
| **Admin (MoTA)** | **Email**: `admin@tribalscholar.demo`<br/>**Password**: `Admin@123` | Access National Admin Control Portal & ST Coverage Analytics. |

---

## ⚙️ Project Architecture

```
SIH-2026-2nd/
├── backend/
│   ├── src/
│   │   ├── adapters/       # UIDAI, DigiLocker, ST Cert, Income, UDISE+/AISHE adapters
│   │   ├── controllers/    # Route handler controllers
│   │   ├── db/             # SQLite database setup & migrations
│   │   ├── middleware/     # JWT Auth & Multer upload middleware
│   │   ├── routes/         # Express REST API routes
│   │   ├── seed/           # Rich seed data script
│   │   ├── services/       # Verification Engine, JAGO AI Chatbot, ST Analytics
│   │   └── server.ts       # Express Server entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Header, Footer, JagoChatbot, TimelineTracker
│   │   ├── context/        # LanguageContext, AccessibilityContext, AuthContext
│   │   ├── i18n/           # Locales for 7 languages
│   │   ├── pages/          # Landing, Schemes, Eligibility, OTR, Login, Dashboard, Vault, Admin
│   │   ├── App.tsx         # React Router setup
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Quick Start Guide (Local Execution)

### Prerequisites
- Node.js v18+ and npm installed.

### 1. Start Backend Server (Port 5000)
```bash
cd backend
npm install
npm run seed     # Seeds demo students, schemes, vault documents & DBT payments
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Start Frontend App (Port 5173)
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🌐 API Documentation

- `POST /api/auth/register` - Submit One-Time Registration (OTR)
- `POST /api/auth/login` - Authenticate student or admin
- `GET /api/scholarships` - List all 5 MoTA scholarship schemes
- `POST /api/eligibility/check` - Run eligibility evaluation engine
- `GET /api/applications` - Fetch student scholarship applications
- `POST /api/applications` - Submit scholarship application with document vault reuse
- `GET /api/documents` - Fetch student document vault
- `POST /api/documents/digilocker/import` - Import verified certificate from DigiLocker
- `GET /api/payments` - Track DBT bank credit payments
- `POST /api/chat` - Interact with JAGO AI Assistant
- `GET /api/admin/dashboard` - Admin summary metrics
- `GET /api/admin/analytics` - ST Coverage Gap Analytics
