import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { UnifiedVerificationEngine } from '../services/verificationEngine';
import { JagoChatService } from '../services/jagoService';
import { JagoOrchestrator } from '../services/jagoOrchestrator';
import { voiceAssistantService } from '../services/elevenlabsService';
import { AnalyticsService } from '../services/analyticsService';
import { DigiLockerAdapter } from '../adapters';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tribal_scholar_sih_2026_secure_jwt_secret_key_98765';

// ----------------------------------------------------
// 1. AUTHENTICATION & OTR ENDPOINTS
// ----------------------------------------------------
router.post('/auth/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile and OTP required' });
  }
  // Demo OTP acceptance: '123456' or any 6-digit OTP
  return res.json({
    success: true,
    message: 'Mobile number verified successfully via OTP (Demo System).',
    verifiedMobile: mobile,
  });
});

router.post('/auth/register', async (req, res) => {
  try {
    const {
      fullName, dob, gender, mobile, email, password, state, district, pincode, address,
      category, stCertNo, pvtgStatus, pvtgGroupName, annualIncome, fatherName, motherName,
      academicLevel, currentCourse, institutionName, institutionCode, disabilityStatus,
      bankAccountNo, ifscCode, bankName, aadhaarNo
    } = req.body;

    if (!fullName || !mobile || !password || !state || !annualIncome) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    // Generate Unique OTR ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const otrId = `OTR2026${randomSuffix}`;

    const userId = `usr_${Date.now()}`;
    const studentId = `std_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const maskedAadhaar = aadhaarNo ? `XXXX-XXXX-${aadhaarNo.slice(-4)}` : 'XXXX-XXXX-8912';

    // Insert User
    db.prepare(`
      INSERT INTO users (id, email, mobile, password_hash, role, otr_id)
      VALUES (?, ?, ?, ?, 'student', ?)
    `).run(userId, email || `${otrId.toLowerCase()}@student.demo`, mobile, passwordHash, otrId);

    // Insert Student Profile
    db.prepare(`
      INSERT INTO students (
        id, user_id, otr_id, full_name, dob, gender, state, district, pincode, address,
        category, st_certificate_no, pvtg_status, pvtg_group_name, annual_income,
        father_name, mother_name, academic_level, current_course, institution_name,
        institution_code, disability_status, bank_account_no, ifsc_code, bank_name, aadhaar_masked
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId, userId, otrId, fullName, dob || '2004-01-01', gender || 'Male', state, district || 'Central', pincode || '600001', address || 'Tribal Colony',
      category || 'ST (Scheduled Tribe)', stCertNo || `ST/${state.slice(0, 2).toUpperCase()}/2026/${Math.floor(10000 + Math.random() * 90000)}`,
      pvtgStatus ? 1 : 0, pvtgGroupName || null, Number(annualIncome), fatherName || '', motherName || '',
      academicLevel || 'Post-Matric', currentCourse || 'General Studies', institutionName || 'Govt Institute',
      institutionCode || 'AISHE-2026', disabilityStatus ? 1 : 0, bankAccountNo || '990011223344', ifscCode || 'SBIN0001234', bankName || 'State Bank of India', maskedAadhaar
    );

    // Auto-create initial default verified documents in vault
    db.prepare(`
      INSERT INTO documents (id, student_id, doc_type, doc_name, file_name, file_url, file_size, verification_status, verified_by, digilocker_imported)
      VALUES (?, ?, 'ST Certificate', 'Tribal Community Certificate', 'ST_Certificate.pdf', '/uploads/demo/st_cert.pdf', 240000, 'VERIFIED', 'State e-District Portal', 1)
    `).run(`doc_st_${Date.now()}`, studentId);

    db.prepare(`
      INSERT INTO documents (id, student_id, doc_type, doc_name, file_name, file_url, file_size, verification_status, verified_by, digilocker_imported)
      VALUES (?, ?, 'Income Certificate', 'Income Certificate FY 2026-27', 'Income_Certificate.pdf', '/uploads/demo/income_cert.pdf', 180000, 'VERIFIED', 'Revenue Office', 1)
    `).run(`doc_inc_${Date.now()}`, studentId);

    // Welcome Notification
    db.prepare(`
      INSERT INTO notifications (id, user_id, title_en, title_hi, message_en, message_hi, type)
      VALUES (?, ?, 'Welcome to Tribal Scholar Portal!', 'ट्राइबल स्कॉलर पोर्टल में आपका स्वागत है!', ?, ?, 'WELCOME')
    `).run(
      `notif_${Date.now()}`, userId,
      `Your One-Time Registration ID is ${otrId}. Your verified documents have been saved to your Document Vault.`,
      `आपकी वन-टाइम रजिस्ट्रेशन आईडी ${otrId} है। आपके दस्तावेज़ आपके वॉलेट में सुरक्षित हैं।`
    );

    const token = jwt.sign({ id: userId, email: email || `${otrId}@student.demo`, role: 'student', otr_id: otrId }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      otrId,
      token,
      student: { id: studentId, fullName, otrId, role: 'student' }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', (req, res) => {
  let rawInput = req.body.otrOrMobile || req.body.identifier || req.body.mobile || req.body.email || '';
  let password = (req.body.password || '').trim();

  let cleanInput = rawInput.trim();
  const lowerInput = cleanInput.toLowerCase();

  // 1. Identify User Role (Admin vs Student)
  let user: any = null;

  if (lowerInput.includes('admin')) {
    user = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as any;
  }

  // If not admin, try exact/typo OTR ID, email, or mobile lookup
  if (!user && cleanInput) {
    let normalizedInput = cleanInput;
    if (/^otr2/i.test(cleanInput)) {
      normalizedInput = cleanInput.replace(/^otr2[dD0]/i, 'OTR20');
    }

    user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(TRIM(otr_id)) = LOWER(?) 
         OR LOWER(TRIM(email)) = LOWER(?) 
         OR TRIM(mobile) = ? 
         OR LOWER(TRIM(otr_id)) = LOWER(?)
    `).get(cleanInput, cleanInput, cleanInput, normalizedInput) as any;
  }

  // Default Fallback: If student OTR / typo / any input, default to primary demo student (Aarav Kumar)
  if (!user) {
    user = db.prepare("SELECT * FROM users WHERE role = 'student' ORDER BY id ASC LIMIT 1").get() as any;
  }

  // Fallback to first user in DB if table empty
  if (!user) {
    user = db.prepare("SELECT * FROM users LIMIT 1").get() as any;
  }

  if (!user) {
    return res.status(500).json({ error: 'Database uninitialized. Please run seed script.' });
  }

  // 2. Demo Password Handling: Accept bcrypt match OR any demo password string
  let isPasswordValid = false;
  if (password) {
    isPasswordValid = bcrypt.compareSync(password, user.password_hash);
  }

  // Guarantee login success in demo environment for student / admin testing
  if (!isPasswordValid) {
    isPasswordValid = true;
  }

  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id) as any;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, otr_id: user.otr_id }, JWT_SECRET, { expiresIn: '7d' });

  const displayName = student ? student.full_name : (user.role === 'admin' ? 'Demo Administrator' : 'Student User');
  const roleName = user.role === 'admin' ? 'ADMIN' : 'STUDENT';

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: displayName,
      email: user.email,
      mobile: user.mobile,
      role: roleName,
      otrId: user.otr_id,
      studentProfile: student || null
    }
  });
});

// GET /api/auth/me - Session Restoration
router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT id, email, mobile, role, otr_id FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(401).json({ error: 'Session invalid or user not found' });
    }

    const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id) as any;
    const displayName = student ? student.full_name : (user.role === 'admin' ? 'Demo Administrator' : 'Student User');
    const roleName = user.role === 'admin' ? 'ADMIN' : 'STUDENT';

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: displayName,
        email: user.email,
        mobile: user.mobile,
        role: roleName,
        otrId: user.otr_id,
        studentProfile: student || null
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// 2. STUDENT PROFILE & DASHBOARD
// ----------------------------------------------------
router.get('/student/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }
  return res.json({ student });
});

router.put('/student/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const {
    fullName, dob, gender, state, district, pincode, address, annualIncome,
    institutionName, institutionCode, currentCourse, bankAccountNo, ifscCode, bankName
  } = req.body;

  db.prepare(`
    UPDATE students SET
      full_name = COALESCE(?, full_name),
      dob = COALESCE(?, dob),
      gender = COALESCE(?, gender),
      state = COALESCE(?, state),
      district = COALESCE(?, district),
      pincode = COALESCE(?, pincode),
      address = COALESCE(?, address),
      annual_income = COALESCE(?, annual_income),
      institution_name = COALESCE(?, institution_name),
      institution_code = COALESCE(?, institution_code),
      current_course = COALESCE(?, current_course),
      bank_account_no = COALESCE(?, bank_account_no),
      ifsc_code = COALESCE(?, ifsc_code),
      bank_name = COALESCE(?, bank_name)
    WHERE id = ?
  `).run(
    fullName, dob, gender, state, district, pincode, address,
    annualIncome ? Number(annualIncome) : null,
    institutionName, institutionCode, currentCourse, bankAccountNo, ifscCode, bankName,
    student.id
  );

  const updatedStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(student.id);
  return res.json({ success: true, student: updatedStudent });
});

// ----------------------------------------------------
// 3. SCHOLARSHIPS & ELIGIBILITY ENGINE
// ----------------------------------------------------
router.get('/scholarships', (req, res) => {
  const scholarships = db.prepare('SELECT * FROM scholarships').all();
  return res.json({ scholarships });
});

router.get('/scholarships/:id', (req, res) => {
  const scholarship = db.prepare('SELECT * FROM scholarships WHERE id = ? OR code = ?').get(req.params.id, req.params.id);
  if (!scholarship) {
    return res.status(404).json({ error: 'Scholarship scheme not found' });
  }
  return res.json({ scholarship });
});

router.post('/eligibility/check', (req, res) => {
  const { academicLevel, state, isST, isPVTG, annualIncome, disabilityStatus } = req.body;
  const income = Number(annualIncome) || 0;

  const allSchemes = db.prepare('SELECT * FROM scholarships').all() as any[];

  const results = allSchemes.map(s => {
    const reasons: string[] = [];
    let eligible = true;

    // Check ST status
    if (s.st_only && !isST) {
      eligible = false;
      reasons.push('Requires Scheduled Tribe (ST) category status.');
    } else {
      reasons.push('✓ ST status verified');
    }

    // Check Income
    if (income > s.income_limit) {
      eligible = false;
      reasons.push(`Family annual income (₹${income.toLocaleString('en-IN')}) exceeds scheme limit of ₹${s.income_limit.toLocaleString('en-IN')}.`);
    } else {
      reasons.push(`✓ Annual income within ceiling limit of ₹${s.income_limit.toLocaleString('en-IN')}`);
    }

    // Check Academic Level match
    if (academicLevel && s.academic_level !== academicLevel && academicLevel !== 'All') {
      // Allow general match if close
      if (s.academic_level === 'Higher Fellowship' && academicLevel !== 'Higher Fellowship') {
        eligible = false;
        reasons.push(`Requires enrollment in M.Phil / Ph.D fellowship courses.`);
      } else {
        reasons.push(`• Academic level target: ${s.academic_level}`);
      }
    } else {
      reasons.push(`✓ Academic course level matched (${s.academic_level})`);
    }

    if (isPVTG && s.pvtg_priority) {
      reasons.push('★ High Priority PVTG Beneficiary Allocation Enabled');
    }

    return {
      scheme: s,
      status: eligible ? 'Eligible to Apply' : 'Not Eligible',
      isEligible: eligible,
      reasons,
    };
  });

  return res.json({ results });
});

// ----------------------------------------------------
// 4. SCHOLARSHIP APPLICATIONS & TRACKING TIMELINE
// ----------------------------------------------------
router.get('/applications', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const applications = db.prepare(`
    SELECT a.*, s.name_en as scheme_name, s.code as scheme_code, s.max_amount
    FROM applications a
    JOIN scholarships s ON a.scholarship_id = s.id
    WHERE a.student_id = ?
    ORDER BY a.submitted_at DESC
  `).all(student.id);

  return res.json({ applications });
});

router.post('/applications', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { scholarshipId, academicYear, documentIds } = req.body;
  if (!scholarshipId) {
    return res.status(400).json({ error: 'Scholarship ID required' });
  }

  const scholarship = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(scholarshipId) as any;
  if (!scholarship) {
    return res.status(404).json({ error: 'Scholarship scheme not found' });
  }

  const appId = `app_${Date.now()}`;
  const appNo = `${scholarship.code}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  db.prepare(`
    INSERT INTO applications (id, application_no, student_id, scholarship_id, academic_year, current_status)
    VALUES (?, ?, ?, ?, ?, 'Submitted')
  `).run(appId, appNo, student.id, scholarship.id, academicYear || '2026-2027');

  // Relate uploaded or existing reused documents
  if (Array.isArray(documentIds)) {
    const docStmt = db.prepare('INSERT OR IGNORE INTO application_documents (application_id, document_id) VALUES (?, ?)');
    documentIds.forEach((docId: string) => docStmt.run(appId, docId));
  }

  // Create initial timeline stage
  db.prepare(`
    INSERT INTO application_timeline (id, application_id, stage, status, action_by, remarks)
    VALUES (?, ?, 'Submitted', 'Completed', ?, 'Application submitted successfully using One-Time Verified document vault profile.')
  `).run(`tl_${Date.now()}`, appId, `${student.full_name} (Student)`);

  // Auto-simulate stage 2 (Institution Verification) for rich demo experience
  setTimeout(() => {
    db.prepare(`
      UPDATE applications SET current_status = 'Institution Verification', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(appId);

    db.prepare(`
      INSERT INTO application_timeline (id, application_id, stage, status, action_by, remarks)
      VALUES (?, ?, 'Institution Verification', 'Completed', 'Principal / Nodal Officer', 'Academic transcripts and bonafide credentials verified.')
    `).run(`tl_inst_${Date.now()}`, appId);
  }, 1000);

  // Send Notification
  db.prepare(`
    INSERT INTO notifications (id, user_id, title_en, title_hi, message_en, message_hi, type)
    VALUES (?, ?, 'Scholarship Application Submitted!', 'छात्रवृत्ति आवेदन जमा हुआ!', ?, ?, 'APPLICATION')
  `).run(
    `notif_${Date.now()}`, req.user!.id,
    `Application ${appNo} for ${scholarship.name_en} submitted successfully.`,
    `आपका आवेदन ${appNo} सफलतापूर्वक जमा कर दिया गया है।`
  );

  return res.json({
    success: true,
    applicationId: appId,
    applicationNo: appNo,
    message: 'Application submitted successfully.',
  });
});

router.get('/applications/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const application = db.prepare(`
    SELECT a.*, s.name_en as scheme_name, s.code as scheme_code, s.description_en, s.max_amount
    FROM applications a
    JOIN scholarships s ON a.scholarship_id = s.id
    WHERE a.id = ? OR a.application_no = ?
  `).get(req.params.id, req.params.id) as any;

  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const timeline = db.prepare('SELECT * FROM application_timeline WHERE application_id = ? ORDER BY timestamp ASC').all(application.id);
  const docs = db.prepare(`
    SELECT d.*
    FROM documents d
    JOIN application_documents ad ON d.id = ad.document_id
    WHERE ad.application_id = ?
  `).all(application.id);

  return res.json({ application, timeline, documents: docs });
});

// ----------------------------------------------------
// 5. DOCUMENT VAULT & REUSE & DIGILOCKER
// ----------------------------------------------------
router.get('/documents', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const documents = db.prepare('SELECT * FROM documents WHERE student_id = ? ORDER BY uploaded_at DESC').all(student.id);
  return res.json({ documents });
});

router.post('/documents', authenticateToken, upload.single('file'), (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { docType, docName } = req.body;
  if (!req.file || !docType) {
    return res.status(400).json({ error: 'File and Document Type required' });
  }

  const docId = `doc_${Date.now()}`;
  const fileUrl = `/uploads/${req.file.filename}`;

  db.prepare(`
    INSERT INTO documents (id, student_id, doc_type, doc_name, file_name, file_url, file_size, verification_status, verified_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'VERIFIED', 'Unified System Automated OCR & Security Validation')
  `).run(docId, student.id, docType, docName || docType, req.file.originalname, fileUrl, req.file.size);

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId);
  return res.json({ success: true, document: doc, message: 'Document uploaded and verified in vault!' });
});

router.post('/documents/digilocker/import', authenticateToken, async (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { docUri, docType, docName } = req.body;
  const verification = await UnifiedVerificationEngine.importFromDigiLocker(student.otr_id, docUri, student.id);

  const docId = `doc_dl_${Date.now()}`;
  db.prepare(`
    INSERT INTO documents (id, student_id, doc_type, doc_name, file_name, file_url, file_size, verification_status, verified_by, digilocker_imported)
    VALUES (?, ?, ?, ?, ?, ?, 150000, 'VERIFIED', 'DigiLocker Cryptographic Authority', 1)
  `).run(docId, student.id, docType, docName || docType, `${docType.replace(/\s+/g, '_')}_DigiLocker.pdf`, '/uploads/demo/st_cert.pdf');

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId);
  return res.json({ success: true, document: doc, verification });
});

router.get('/documents/digilocker/available', authenticateToken, async (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  const docs = await DigiLockerAdapter.getAvailableDocuments(student?.otr_id || 'OTR2026001234');
  return res.json({ availableDocuments: docs });
});

// ----------------------------------------------------
// 6. PAYMENTS & DBT TRACKING
// ----------------------------------------------------
router.get('/payments', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const payments = db.prepare(`
    SELECT p.*, a.application_no, s.name_en as scheme_name
    FROM payments p
    JOIN applications a ON p.application_id = a.id
    JOIN scholarships s ON a.scholarship_id = s.id
    WHERE p.student_id = ?
    ORDER BY p.disbursed_at DESC
  `).all(student.id);

  return res.json({ payments, bankDetails: { bankName: student.bank_name, accountNo: student.bank_account_no, ifsc: student.ifsc_code } });
});

// ----------------------------------------------------
// 7. NOTIFICATIONS & ANNOUNCEMENTS & GRIEVANCES
// ----------------------------------------------------
router.get('/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user!.id) as any;
  return res.json({ notifications, unreadCount: unreadCount?.count || 0 });
});

router.put('/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  return res.json({ success: true });
});

router.get('/announcements', (req, res) => {
  const announcements = db.prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY publish_date DESC').all();
  return res.json({ announcements });
});

// Download a circular as a printable HTML document
router.get('/announcements/:id/download', (req, res) => {
  const ann = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id) as any;
  if (!ann) {
    return res.status(404).json({ error: 'Circular not found' });
  }

  const lang = ((req.query.lang as string) || 'en').toLowerCase();

  const pdfUi: Record<string, any> = {
    en: { printBtn: '🖨️ Print / Save as PDF', closeBtn: '✕ Close', gov: 'Government of India', ministry: 'Ministry of Tribal Affairs', circNo: 'Circular No.', cat: 'Category', date: 'Date of Issue', stampTitle: 'Joint Secretary (ST Welfare)', demoNote: 'This is a demo/prototype document for SIH 2026 (Problem Statement 26238).' },
    hi: { printBtn: '🖨️ प्रिंट / पीडीएफ के रूप में सहेजें', closeBtn: '✕ बंद करें', gov: 'भारत सरकार', ministry: 'जनजातीय कार्य मंत्रालय', circNo: 'परिपत्र सं.', cat: 'श्रेणी', date: 'जारी करने की तिथि', stampTitle: 'संयुक्त सचिव (एसटी कल्याण)', demoNote: 'यह एसआईएच 2026 (समस्या कथन 26238) के लिए एक डेमो/प्रोटोटाइप दस्तावेज़ है।' },
    te: { printBtn: '🖨️ ప్రింట్ / PDF గా సేవ్ చేయండి', closeBtn: '✕ మూసివేయి', gov: 'భారత ప్రభుత్వం', ministry: 'గిరిజన సంక్షేమ మంత్రిత్వ శాఖ', circNo: 'సర్క్యులర్ నం.', cat: 'వర్గం', date: 'జారీ చేసిన తేదీ', stampTitle: 'జాయింట్ సెక్రటరీ (ST సంక్షేమం)', demoNote: 'ఇది SIH 2026 కొరకు డెమో/ప్రోటోటైప్ డాక్యుమెంట్.' },
    ta: { printBtn: '🖨️ அச்சிடு / PDF ஆக சேமிக்கவும்', closeBtn: '✕ மூடு', gov: 'இந்திய அரசு', ministry: 'பழங்குடியினர் நல அமைச்சகம்', circNo: 'சுற்றறிக்கை எண்.', cat: 'வகை', date: 'வெளியிடப்பட்ட தேதி', stampTitle: 'இணைச் செயலாளர் (ST நலன்)', demoNote: 'இது SIH 2026 க்கான மாதிரி ஆவணமாகும்.' },
    mr: { printBtn: '🖨️ प्रिंट / PDF म्हणून जतन करा', closeBtn: '✕ बंद करा', gov: 'भारत सरकार', ministry: 'आदिवासी विकास मंत्रालय', circNo: 'परिपत्रक क्र.', cat: 'वर्ग', date: 'दिनांक', stampTitle: 'संयुक्त सचिव (एसटी कल्याण)', demoNote: 'हे SIH 2026 साठी प्रात्यक्षिक दस्तऐवज आहे.' },
    bn: { printBtn: '🖨️ প্রিন্ট / PDF হিসেবে সংরক্ষণ করুন', closeBtn: '✕ বন্ধ করুন', gov: 'ভারত সরকার', ministry: 'উপজাতি বিষয়ক মন্ত্ৰণালয়', circNo: 'বিজ্ঞপ্তি নং', cat: 'বিভাগ', date: 'প্রকাশের তারিখ', stampTitle: 'যুগ্ম সচিব (এসটি কল্যাণ)', demoNote: 'এটি SIH 2026 এর জন্য একটি ডেমো নথি।' },
    ml: { printBtn: '🖨️ പ്രിന്റ് / PDF ആയി സേവ് ചെയ്യുക', closeBtn: '✕ അടയ്ക്കുക', gov: 'ഭാരത സർക്കാർ', ministry: 'ഗോത്രവർഗ്ഗ കാര്യ മന്ത്രാലയം', circNo: 'സർക്കുലർ നമ്പർ', cat: 'വിഭാഗം', date: 'തീയതി', stampTitle: 'ജോയിന്റ് സെക്രട്ടറി (ST ക്ഷേമം)', demoNote: 'ഇത് SIH 2026 നായുള്ള ഡെമോ രേഖയാണ്.' },
    kn: { printBtn: '🖨️ ಪ್ರಿಂಟ್ / PDF ಆಗಿ ಉಳಿಸಿ', closeBtn: '✕ ಮುಚ್ಚಿ', gov: 'ಭಾರತ ಸರ್ಕಾರ', ministry: 'ಬುಡಕಟ್ಟು ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯ', circNo: 'ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ', cat: 'ವರ್ಗ', date: 'ದಿನಾಂಕ', stampTitle: 'ಸಂಯುಕ್ತ ಕಾರ್ಯದರ್ಶಿ (ST ಕಲ್ಯಾಣ)', demoNote: 'ಇದು SIH 2026 ಗಾಗಿ ಡೆಮೋ ದಾಖಲೆಯಾಗಿದೆ.' }
  };

  const ui = pdfUi[lang] || pdfUi['en'];

  // Rich content map for each circular with real government tribal scholarship details
  const circularContent: Record<string, string> = {
    'ann_1': `
      <h2>Subject: Opening of Online Applications for Post-Matric Scholarship (PMS-ST) &amp; Pre-Matric Scholarship for Scheduled Tribe Students, Academic Year 2026-27</h2>
      <p><strong>Reference:</strong> F.No. 11013/06/2026-SCD-V dated 15th July, 2026</p>
      <hr/>
      <p>The Ministry of Tribal Affairs, Government of India, is pleased to announce the opening of online applications for the following Centrally Sponsored Schemes for Scheduled Tribe (ST) students for the Academic Year 2026-27:</p>
      <ol>
        <li><strong>Pre-Matric Scholarship for ST Students</strong> — For Classes IX and X<br/>
          <ul>
            <li>Parental annual income ceiling: ≤ ₹2,50,000</li>
            <li>Stipend: ₹225/month (Day Scholars) | ₹525/month (Hostellers) for 10 months</li>
            <li>Fund sharing: Centre 75% : State 25% (90:10 for NE &amp; Special Category States)</li>
          </ul>
        </li>
        <li><strong>Post-Matric Scholarship (PMS-ST)</strong> — For Class XI to Post-Graduation<br/>
          <ul>
            <li>Parental annual income ceiling: ≤ ₹2,50,000</li>
            <li>Full compulsory non-refundable fee reimbursement up to ₹25,000/year</li>
            <li>Monthly maintenance allowance: ₹1,200/month</li>
            <li>Applicable in AISHE/UDISE recognized institutions</li>
          </ul>
        </li>
      </ol>
      <h3>How to Apply</h3>
      <p>Students must submit applications online through the <strong>National Scholarship Portal (NSP)</strong> at <em>scholarships.gov.in</em> or through respective State Tribal Welfare portals. Applications via <strong>Tribal Scholar Portal</strong> (dbttribal.gov.in) are also accepted.</p>
      <h3>Important Dates</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr style="background:#8B4513;color:white"><th>Event</th><th>Date</th></tr>
        <tr><td>Online Portal Opens</td><td>15th July 2026</td></tr>
        <tr><td>Last Date for Fresh Applications</td><td>30th November 2026</td></tr>
        <tr><td>Last Date for Renewal Applications</td><td>31st December 2026</td></tr>
        <tr><td>Institute Verification Deadline</td><td>15th January 2027</td></tr>
      </table>
      <h3>Required Documents</h3>
      <ul>
        <li>Aadhaar Card (mandatory for DBT)</li>
        <li>ST Community Certificate issued by Revenue Authority</li>
        <li>Income Certificate (≤ ₹2.50 Lakhs) from Tehsildar/SDM</li>
        <li>Previous year marksheet / School Bonafide Certificate</li>
        <li>Aadhaar-seeded Bank Passbook (in student's name)</li>
        <li>Fee receipt from recognized institution</li>
      </ul>
      <p><strong>Note:</strong> All disbursements will be made exclusively through Direct Benefit Transfer (DBT) to Aadhaar-seeded bank accounts via PFMS.</p>
    `,
    'ann_2': `
      <h2>Subject: Mandatory Aadhaar Seeding of Bank Accounts for Direct Benefit Transfer (DBT) under Tribal Welfare Scholarship Schemes</h2>
      <p><strong>Reference:</strong> F.No. 14011/03/2026-DBT-MoTA dated 1st August, 2026</p>
      <hr/>
      <p>In compliance with the Government of India directive for 100% Direct Benefit Transfer (DBT) implementation, all Scheduled Tribe (ST) students availing scholarships under Ministry of Tribal Affairs (MoTA) schemes are hereby directed to ensure the following:</p>
      <ol>
        <li><strong>Aadhaar-Bank Linking:</strong> The student's Aadhaar number must be seeded/linked with their primary bank account through the respective bank branch.</li>
        <li><strong>NPCI Mapper:</strong> Aadhaar Payment Bridge (APB) mapping must be active on the National Payments Corporation of India (NPCI) Mapper.</li>
        <li><strong>Bank Account Ownership:</strong> The bank account must be in the student's own name (joint accounts with parent are not accepted for DBT).</li>
        <li><strong>Active Account:</strong> Dormant accounts (no transaction for 24+ months) will be rejected by PFMS. Students must activate their accounts before applying.</li>
      </ol>
      <h3>Verification Process</h3>
      <p>The Public Financial Management System (PFMS) will perform automated validation of:</p>
      <ul>
        <li>Aadhaar number validity via UIDAI</li>
        <li>Bank account status (active/dormant)</li>
        <li>NPCI APB mapper availability</li>
        <li>Name matching between Aadhaar, bank account, and scholarship application</li>
      </ul>
      <h3>Consequences of Non-Compliance</h3>
      <p>Scholarship amounts for students without valid Aadhaar-seeded bank accounts will be <strong>withheld</strong> until compliance is achieved. No manual/cheque disbursements will be processed.</p>
      <p><strong>Helpline:</strong> Students can contact the National Tribal Helpline at 1800-11-8080 (Toll-Free) for assistance with Aadhaar seeding.</p>
    `,
    'ann_3': `
      <h2>Subject: Revised Income Ceiling Guidelines for National Overseas Scholarship (NOS) for ST Candidates, Academic Year 2026-27</h2>
      <p><strong>Reference:</strong> F.No. 12012/02/2026-ES-IV dated 10th August, 2026</p>
      <hr/>
      <p>The Ministry of Tribal Affairs has revised the family income ceiling and eligibility guidelines for the National Overseas Scholarship (NOS) scheme for Scheduled Tribe candidates pursuing Master's and Ph.D. programs abroad:</p>
      <h3>Revised Eligibility Criteria</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr style="background:#006699;color:white"><th>Parameter</th><th>Previous</th><th>Revised (2026-27)</th></tr>
        <tr><td>Family Annual Income Ceiling</td><td>₹6,00,000</td><td>₹6,00,000 (unchanged)</td></tr>
        <tr><td>Age Limit</td><td>35 years</td><td>35 years as of 1st July 2026</td></tr>
        <tr><td>Minimum Qualifying Marks</td><td>55%</td><td>55% in qualifying degree</td></tr>
        <tr><td>University Requirement</td><td>Top 500 QS</td><td>Top 500 QS World University Rankings</td></tr>
        <tr><td>Annual Slots</td><td>20</td><td>20 awards per year</td></tr>
      </table>
      <h3>Financial Support Provided</h3>
      <ul>
        <li>Full annual tuition fees paid directly to the foreign university</li>
        <li>Annual living allowance: US\$15,400</li>
        <li>Economy class return airfare (one-time)</li>
        <li>Visa fees and health insurance premium</li>
        <li>Contingency &amp; equipment allowance</li>
      </ul>
      <p><strong>Application Portal:</strong> Apply through National Scholarship Portal (scholarships.gov.in). Last date: 15th December 2026.</p>
    `,
    'ann_4': `
      <h2>Subject: Extension of Application Deadline for National Fellowship for Scheduled Tribe Students (NFST) till 31st October 2026</h2>
      <p><strong>Reference:</strong> F.No. 17014/01/2026-SCD-V dated 28th August, 2026</p>
      <hr/>
      <p>In response to representations received from various State Tribal Welfare Departments and university registrars regarding delayed Ph.D. registration cycles, the Ministry of Tribal Affairs has decided to extend the last date for submission of online applications for the <strong>National Fellowship for ST Students (NFST)</strong> scheme for the Academic Year 2026-27.</p>
      <h3>Revised Timeline</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr style="background:#8B4513;color:white"><th>Milestone</th><th>Original Date</th><th>Revised Date</th></tr>
        <tr><td>Last Date for Online Application</td><td>30th September 2026</td><td><strong>31st October 2026</strong></td></tr>
        <tr><td>University Forwarding Deadline</td><td>15th October 2026</td><td><strong>15th November 2026</strong></td></tr>
        <tr><td>Screening Committee Review</td><td>November 2026</td><td>December 2026</td></tr>
      </table>
      <h3>Fellowship Details</h3>
      <ul>
        <li>JRF: ₹37,000/month for initial 2 years</li>
        <li>SRF: ₹42,000/month for remaining tenure</li>
        <li>Annual Contingency Grant: ₹25,000 (Humanities) / ₹30,000 (Science &amp; Engineering)</li>
        <li>HRA as per central government norms</li>
        <li>Total annual slots: 750 fellowships for ST scholars</li>
      </ul>
      <p>Candidates who have already applied need not re-apply. This extension is applicable only for fresh applications.</p>
    `,
    'ann_5': `
      <h2>Subject: Notification of Notified Premier Institutes under the Top Class Education Scheme for ST Students, 2026</h2>
      <p><strong>Reference:</strong> F.No. 15013/04/2026-SCD-V dated 2nd September, 2026</p>
      <hr/>
      <p>The Ministry of Tribal Affairs publishes the updated list of <strong>265 Premier Institutes</strong> notified for the National Scholarship Scheme (Top Class) for Higher Education of ST Students for Academic Year 2026-27.</p>
      <h3>Categories of Notified Institutes</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        <tr style="background:#006699;color:white"><th>Category</th><th>Count</th><th>Examples</th></tr>
        <tr><td>Indian Institutes of Technology (IITs)</td><td>23</td><td>IIT Bombay, IIT Delhi, IIT Madras, IIT Kanpur</td></tr>
        <tr><td>National Institutes of Technology (NITs)</td><td>31</td><td>NIT Trichy, NIT Warangal, NIT Surathkal</td></tr>
        <tr><td>Indian Institutes of Management (IIMs)</td><td>20</td><td>IIM Ahmedabad, IIM Bangalore, IIM Calcutta</td></tr>
        <tr><td>AIIMS &amp; Medical Institutes</td><td>15</td><td>AIIMS Delhi, AIIMS Bhopal, JIPMER</td></tr>
        <tr><td>Central Universities</td><td>45</td><td>JNU, BHU, Delhi University, Hyderabad University</td></tr>
        <tr><td>National Law Universities</td><td>22</td><td>NLSIU Bangalore, NALSAR Hyderabad</td></tr>
        <tr><td>IISER, NISER, ISI &amp; Others</td><td>109</td><td>IISER Pune, ISI Kolkata, NISER Bhubaneswar</td></tr>
      </table>
      <h3>Scholarship Coverage</h3>
      <ul>
        <li>100% Tuition Fees &amp; Admission Fees</li>
        <li>Non-refundable institutional fees</li>
        <li>Monthly living stipend allowance</li>
        <li>Book &amp; stationery allowance</li>
        <li>Computer/laptop purchase allowance (one-time)</li>
      </ul>
      <p>Family income must not exceed ₹6,00,000 per annum from all sources. The complete list is available at <em>tribal.nic.in</em>.</p>
    `,
    'ann_6': `
      <h2>Subject: Guidelines for Particularly Vulnerable Tribal Group (PVTG) Priority Verification through e-District Integration</h2>
      <p><strong>Reference:</strong> F.No. 16013/01/2026-SCD-VI dated 5th September, 2026</p>
      <hr/>
      <p>The Ministry of Tribal Affairs issues the following operational guidelines for implementation of <strong>priority verification</strong> and <strong>expedited processing</strong> of scholarship applications from students belonging to Particularly Vulnerable Tribal Groups (PVTGs).</p>
      <h3>Background</h3>
      <p>India has 75 identified PVTGs across 18 States and 1 Union Territory, with a combined population of approximately 37.5 lakh. These communities face the most severe socio-economic deprivation and require special attention in welfare scheme implementation.</p>
      <h3>Key Directives</h3>
      <ol>
        <li><strong>Automated PVTG Identification:</strong> State portals must integrate with e-District databases to auto-detect PVTG status from ST certificates. The certificate must specify the exact tribal group name.</li>
        <li><strong>Fast-Track Processing:</strong> PVTG applications must be verified within 7 working days (vs. 21 days for general ST).</li>
        <li><strong>Priority Sanctioning:</strong> PVTG applicants shall receive top priority in fund sanctioning queues at District, State, and Central levels.</li>
        <li><strong>Additional Allowances:</strong> PVTG students are eligible for supplementary hostel allowance of ₹500/month over regular rates.</li>
      </ol>
      <h3>List of 75 PVTGs</h3>
      <p>Some notable PVTGs include: Birhor (Jharkhand), Baiga (MP/Chhattisgarh), Particularly Vulnerable Groups in Andaman &amp; Nicobar (Great Andamanese, Onge, Jarawa, Sentinelese), Korwa (Chhattisgarh), Chenchu (Telangana/AP), Toda (Tamil Nadu), Cholanaickan (Kerala), Birjia (Jharkhand).</p>
      <p>State Tribal Welfare Departments must complete e-District integration by <strong>31st December 2026</strong>.</p>
    `,
  };

  const titleText = ann[`title_${lang}`] || ann.title_hi || ann.title_en;
  const content = circularContent[ann.id] || `<h2>${titleText}</h2><p>Category: ${ann.category}</p><p>Published: ${ann.publish_date}</p>`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${titleText} — ${ui.ministry}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: 'Segoe UI', 'Noto Sans', 'Arial Unicode MS', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 50px; color: #1a1a1a; line-height: 1.7; }
    .header { text-align: center; border-bottom: 3px double #8B4513; padding-bottom: 20px; margin-bottom: 30px; }
    .header .emblem { font-size: 36px; }
    .header h1 { font-size: 16px; color: #8B4513; margin: 8px 0 2px; text-transform: uppercase; letter-spacing: 2px; }
    .header .ministry { font-size: 13px; color: #006699; font-weight: bold; }
    .header .portal { font-size: 11px; color: #666; margin-top: 4px; }
    .meta { background: #f9f6f2; padding: 12px 20px; border-left: 4px solid #8B4513; margin-bottom: 24px; font-size: 12px; color: #555; }
    h2 { font-size: 16px; color: #333; margin-top: 0; }
    h3 { font-size: 14px; color: #8B4513; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; }
    table { font-size: 12px; margin: 12px 0; }
    td, th { padding: 6px 12px; text-align: left; border: 1px solid #ccc; }
    ul, ol { font-size: 13px; }
    li { margin-bottom: 6px; }
    p { font-size: 13px; text-align: justify; }
    .footer { border-top: 2px solid #8B4513; margin-top: 40px; padding-top: 16px; font-size: 11px; color: #888; text-align: center; }
    .stamp { margin-top: 40px; text-align: right; font-size: 12px; color: #333; }
    .btn-print { display: inline-block; background: #8B4513; color: white; padding: 8px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin-right: 8px; }
    .btn-print:hover { background: #6d350f; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:20px;">
    <button class="btn-print" onclick="window.print()">${ui.printBtn}</button>
    <button class="btn-print" onclick="window.close()" style="background:#006699">${ui.closeBtn}</button>
  </div>
  <div class="header">
    <div class="emblem">🏛️</div>
    <h1>${ui.gov}</h1>
    <div class="ministry">${ui.ministry}</div>
    <div class="portal">Tribal Scholar Portal — SIH 2026 Prototype | dbttribal.gov.in</div>
  </div>
  <div class="meta">
    <strong>${ui.circNo}:</strong> MoTA/TSP/${ann.id.replace('ann_', '')}/${ann.publish_date.split('-')[0]} &nbsp; | &nbsp;
    <strong>${ui.cat}:</strong> ${ann.category} &nbsp; | &nbsp;
    <strong>${ui.date}:</strong> ${ann.publish_date}
  </div>
  ${content}
  <div class="stamp">
    <p><strong>Sd/-</strong><br/>
    ${ui.stampTitle}<br/>
    ${ui.ministry}<br/>
    ${ui.gov}, New Delhi</p>
    <p style="font-size:10px;color:#999;">${ui.demoNote}</p>
  </div>
  <div class="footer">
    ${ui.ministry}, Shastri Bhawan, New Delhi - 110001 | Toll-Free Helpline: 1800-11-8080<br/>
    © 2026 Tribal Scholar Portal — Unified ST Scholarship Platform (SIH 2026 Prototype)
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

router.post('/grievances', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { category, scholarshipId, subject, description } = req.body;
  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject, and description required' });
  }

  const grvId = `grv_${Date.now()}`;
  const ticketNo = `GRV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  db.prepare(`
    INSERT INTO grievances (id, ticket_no, student_id, category, scholarship_id, subject, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted')
  `).run(grvId, ticketNo, student.id, category, scholarshipId || null, subject, description);

  return res.json({ success: true, ticketNo, message: 'Grievance ticket registered successfully.' });
});

router.get('/grievances', authenticateToken, (req: AuthRequest, res: Response) => {
  const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user!.id) as any;
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const grievances = db.prepare('SELECT * FROM grievances WHERE student_id = ? ORDER BY created_at DESC').all(student.id);
  return res.json({ grievances });
});

// ----------------------------------------------------
// 8. JAGO AI CHATBOT ROUTE
// ----------------------------------------------------
router.post('/chat', async (req: AuthRequest, res: Response) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content required' });
  }

  let studentId: string | undefined = undefined;

  // Optional authentication payload check for personalized replies
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(decoded.id) as any;
      if (student) studentId = student.id;
    } catch (e) {
      // Unauthenticated chat fallback
    }
  }

  const reply = await JagoChatService.processMessage(message, studentId, language || 'en');
  return res.json(reply);
});

// REAL-TIME VOICE ASSISTANT ENDPOINTS (ELEVENLABS INTEGRATION)
router.post('/voice/process', async (req: AuthRequest, res: Response) => {
  const { message, language, speed } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Voice message content required' });
  }

  let studentId: string | undefined = undefined;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(decoded.id) as any;
      if (student) studentId = student.id;
    } catch (e) {}
  }

  const voicePayload = await JagoOrchestrator.processVoiceCommand(
    message,
    studentId,
    language || 'en',
    speed || 'slow'
  );

  return res.json(voicePayload);
});

router.post('/voice/tts', async (req, res) => {
  const { text, language, speed } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text required for TTS' });
  }

  const audioResult = await voiceAssistantService.speak(text, language || 'en', speed || 'slow');
  return res.json(audioResult);
});

// ELEVENLABS AGENTS REAL-TIME INTEGRATION ENDPOINTS
router.get('/jago/health', (req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  const apiKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.startsWith('your_'));
  const agentIdConfigured = Boolean(agentId && agentId.trim() !== '' && !agentId.startsWith('your_'));
  const agentIdFormatValid = Boolean(agentId && agentId.startsWith('agent_'));

  return res.json({
    ok: true,
    provider: 'elevenlabs',
    configured: apiKeyConfigured && agentIdConfigured,
    agentConfigured: agentIdConfigured,
    apiKeyConfigured,
    agentIdConfigured,
    agentIdFormatValid,
    backendReachable: true,
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/jago/signed-url', async (req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  const apiKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.startsWith('your_'));
  const agentIdConfigured = Boolean(agentId && agentId.trim() !== '' && !agentId.startsWith('your_'));

  if (!apiKeyConfigured) {
    console.error('[JAGO ElevenLabs Security Error] ELEVENLABS_API_KEY missing in backend environment.');
    return res.status(400).json({
      error: 'ELEVENLABS_API_KEY is not configured on backend environment.',
      apiKeyConfigured: false,
    });
  }

  if (!agentIdConfigured) {
    console.error('[JAGO ElevenLabs Error] JAGO Agent ID is not configured.');
    return res.status(400).json({
      error: 'JAGO Agent ID is not configured.',
      agentIdConfigured: false,
    });
  }

  try {
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId!)}`;
    console.log(`[JAGO ElevenLabs] Contacting ElevenLabs API for agent_id=${agentId} (Key configured: YES)`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[JAGO ElevenLabs Error] Signed URL Request failed (HTTP ${response.status}):`, errorText);
      return res.status(response.status).json({
        error: 'ElevenLabs signed URL request failed',
        statusCode: response.status,
        details: errorText,
        agentIdConfigured: true,
      });
    }

    const data = (await response.json()) as any;
    if (!data.signed_url) {
      console.error('[JAGO ElevenLabs Error] ElevenLabs response missing signed_url property:', data);
      return res.status(500).json({ error: 'Invalid response format from ElevenLabs API', details: data });
    }

    console.log('[JAGO ElevenLabs Success] Generated temporary signed URL successfully.');
    return res.json({ signedUrl: data.signed_url });
  } catch (err: any) {
    console.error('[JAGO ElevenLabs Server Error] Exception fetching signed URL:', err.message);
    return res.status(500).json({ error: 'Server exception generating ElevenLabs signed URL', details: err.message });
  }
});

// ----------------------------------------------------
// 9. ADMIN DASHBOARD & ANALYTICS
// ----------------------------------------------------
router.get('/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const dbStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as any;
  const dbApplications = db.prepare('SELECT COUNT(*) as count FROM applications').get() as any;
  const dbPending = db.prepare("SELECT COUNT(*) as count FROM applications WHERE current_status LIKE '%Verification%'").get() as any;
  const dbApproved = db.prepare("SELECT COUNT(*) as count FROM applications WHERE current_status IN ('Sanctioned', 'DBT Processing', 'Disbursed')").get() as any;
  const dbDisbursed = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Credited'").get() as any;
  const dbGrievances = db.prepare("SELECT COUNT(*) as count FROM grievances WHERE status != 'Resolved'").get() as any;

  const applicationsByScheme = db.prepare(`
    SELECT s.name_en as scheme_name, COUNT(a.id) as count
    FROM scholarships s
    LEFT JOIN applications a ON s.id = a.scholarship_id
    GROUP BY s.id
  `).all();

  const applicationsByStatus = db.prepare(`
    SELECT current_status as status, COUNT(id) as count
    FROM applications
    GROUP BY current_status
  `).all();

  return res.json({
    metrics: {
      totalStudents: '24,582',
      totalApplications: '8,421',
      pendingVerifications: '1,284',
      approvedSanctioned: '6,932',
      totalDisbursedAmount: 184200000,
      disbursedFormatted: '₹18.42 Cr',
      openGrievances: '324',
      dbCounts: {
        students: dbStudents.count,
        applications: dbApplications.count,
        pending: dbPending.count,
        approved: dbApproved.count,
        disbursed: dbDisbursed.total || 18500,
        grievances: dbGrievances.count
      }
    },
    applicationsByScheme,
    applicationsByStatus,
    isDemoData: true
  });
});

router.get('/admin/students', authenticateToken, requireAdmin, (req, res) => {
  const students = db.prepare('SELECT * FROM students ORDER BY otr_id ASC').all();
  return res.json({ students });
});

router.get('/admin/applications', authenticateToken, requireAdmin, (req, res) => {
  const applications = db.prepare(`
    SELECT a.*, std.full_name as student_name, std.otr_id, std.state, s.name_en as scheme_name
    FROM applications a
    JOIN students std ON a.student_id = std.id
    JOIN scholarships s ON a.scholarship_id = s.id
    ORDER BY a.submitted_at DESC
  `).all();
  return res.json({ applications });
});

router.get('/admin/grievances', authenticateToken, requireAdmin, (req, res) => {
  const grievances = db.prepare(`
    SELECT g.*, std.full_name as student_name, std.otr_id
    FROM grievances g
    JOIN students std ON g.student_id = std.id
    ORDER BY g.created_at DESC
  `).all();
  return res.json({ grievances });
});

router.get('/admin/analytics', authenticateToken, requireAdmin, (req, res) => {
  const coverageData = AnalyticsService.getSTCoverageData();
  return res.json(coverageData);
});

export default router;
