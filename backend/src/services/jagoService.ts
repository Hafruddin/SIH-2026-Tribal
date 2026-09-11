import OpenAI from 'openai';
import db from '../db/database';

// Initialize OpenAI client with 4-second timeout so offline/invalid keys fallback instantly
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 4000, // 4s timeout for super snappy fallback
    })
  : null;

export class JagoChatService {
  static async processMessage(
    userMessage: string,
    studentId?: string,
    language: string = 'en'
  ): Promise<{ response: string; quickActions?: string[]; studentContextUsed?: boolean }> {
    const messageLower = userMessage.toLowerCase();

    // Fetch authenticated student context if logged in
    let studentInfo: any = null;
    let applications: any[] = [];
    let payments: any[] = [];
    let documents: any[] = [];

    if (studentId) {
      studentInfo = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
      if (studentInfo) {
        applications = db.prepare(`
          SELECT a.*, s.name_en as scheme_name
          FROM applications a
          JOIN scholarships s ON a.scholarship_id = s.id
          WHERE a.student_id = ?
        `).all(studentId);
        payments = db.prepare('SELECT * FROM payments WHERE student_id = ?').all(studentId);
        documents = db.prepare('SELECT * FROM documents WHERE student_id = ?').all(studentId);
      }
    }

    // 1. AUTHENTICATED STUDENT-SPECIFIC INTENT HANDLING
    const isStatusQuery = messageLower.includes('status') || messageLower.includes('track') || messageLower.includes('application') || messageLower.includes('मेरी स्थिति') || messageLower.includes('స్టేటస్') || messageLower.includes('நிலை');
    const isPaymentQuery = messageLower.includes('payment') || messageLower.includes('dbt') || messageLower.includes('money') || messageLower.includes('amount') || messageLower.includes('भुगतान') || messageLower.includes('డబ్బులు') || messageLower.includes('பணம்');
    const isDocQuery = messageLower.includes('document') || messageLower.includes('vault') || messageLower.includes('upload') || messageLower.includes('दस्तावेज') || messageLower.includes('డాక్యుమెంట్') || messageLower.includes('ஆவணம்');
    const isEligibleQuery = messageLower.includes('eligible') || messageLower.includes('eligibility') || messageLower.includes('can i apply') || messageLower.includes('पात्र') || messageLower.includes('అర్హత') || messageLower.includes('தகுதி');

    if (studentInfo) {
      if (isStatusQuery && !messageLower.includes('required')) {
        if (applications.length === 0) {
          return {
            response: `Hello ${studentInfo.full_name}, you currently have no submitted scholarship applications. Click "Search Schemes" or navigate to "Schemes" to submit your first application!`,
            quickActions: ['Check Eligibility', 'View Schemes', 'Upload Documents'],
            studentContextUsed: true,
          };
        }
        const appList = applications
          .map(a => `• Application No: **${a.application_no}** (${a.scheme_name}) - Current Status: **${a.current_status}** (Last updated: ${a.updated_at.split(' ')[0]})`)
          .join('\n');

        return {
          response: `Hello ${studentInfo.full_name}! Here is the current status of your submitted applications:\n\n${appList}\n\nYou can click on any application in your Dashboard to view the complete timeline verification steps.`,
          quickActions: ['Track Application Timeline', 'View Payment Details', 'Upload Revised Documents'],
          studentContextUsed: true,
        };
      }

      if (isPaymentQuery) {
        if (payments.length === 0) {
          return {
            response: `Hello ${studentInfo.full_name}, your scholarship payment is currently under verification or sanction process. Once sanctioned, direct benefit funds will be transferred to your bank account (**${studentInfo.bank_name} - A/c ending in ${studentInfo.bank_account_no.slice(-4)}**).`,
            quickActions: ['Check Application Status', 'View Document Status'],
            studentContextUsed: true,
          };
        }
        const payList = payments
          .map(p => `• Sanction No: **${p.sanction_no}** | Amount: **₹${p.amount.toLocaleString('en-IN')}** | Status: **${p.status}** | UTR: **${p.utr_no}**`)
          .join('\n');

        return {
          response: `Hello ${studentInfo.full_name}! Here are your Direct Benefit Transfer (DBT) payment details:\n\n${payList}\n\nAll funds are credited directly into your Aadhaar-seeded bank account.`,
          quickActions: ['View Dashboard', 'Raise Payment Grievance'],
          studentContextUsed: true,
        };
      }

      if (isDocQuery && !messageLower.includes('required')) {
        const verifiedDocs = documents.filter(d => d.verification_status === 'VERIFIED').map(d => d.doc_type);
        const actionDocs = documents.filter(d => d.verification_status !== 'VERIFIED');

        let msg = `Hello ${studentInfo.full_name}! You have **${documents.length} document(s)** in your Document Vault.\n`;
        if (verifiedDocs.length > 0) {
          msg += `\n✓ Verified Documents ready for multi-scheme reuse: ${verifiedDocs.join(', ')}.`;
        }
        if (actionDocs.length > 0) {
          msg += `\n⚠️ Documents requiring attention: ${actionDocs.map(d => `${d.doc_type} (${d.verification_status})`).join(', ')}.`;
        } else {
          msg += `\n✨ All uploaded documents are 100% verified!`;
        }

        return {
          response: msg,
          quickActions: ['Upload New Document', 'Import from DigiLocker', 'Apply for Scholarship'],
          studentContextUsed: true,
        };
      }
    }

    // 2. OPENAI GPT ASSISTANT WITH INSTANT TIMEOUT PROTECTION
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are JAGO, an empathetic and authoritative AI Scholarship Assistance Guide for Ministry of Tribal Affairs (MoTA), Government of India.
              Answer questions clearly regarding Tribal Scholar portal, ST scholarships (Pre-Matric, Post-Matric, Top Class, National Fellowship NFST, National Overseas NOS), eligibility, document vault reuse, DigiLocker import, OTR registration, and DBT disbursal.
              Always respond in a respectful, clear tone suitable for tribal youth. Keep responses concise (under 120 words). Language requested: ${language}.`,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          max_tokens: 220,
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) {
          return {
            response: reply,
            quickActions: ['Check Eligibility', 'View Schemes', 'Required Documents', 'Payment Status', 'Raise Grievance'],
          };
        }
      } catch (err) {
        console.warn('OpenAI API request skipped/failed, switching to instant JAGO rule engine:', (err as any)?.message || err);
      }
    }

    // 3. COMPREHENSIVE MULTILINGUAL SMART RULE ENGINE FALLBACK
    let ruleReply = '';
    let actions = ['Check Eligibility', 'View Schemes', 'Required Documents', 'Payment Status', 'Raise Grievance'];

    if (messageLower.includes('required') || messageLower.includes('document') || messageLower.includes('दस्तावेज') || messageLower.includes('డాక్యుమెంట్') || messageLower.includes('ஆவணம்')) {
      ruleReply = '📜 **Mandatory Documents Required for ST Scholarships:**\n\n' +
        '1. **Aadhaar Card** (Aadhaar-seeded bank account required)\n' +
        '2. **ST Community Certificate** (Issued by Tahsildar/Revenue Dept)\n' +
        '3. **Income Certificate** (FY 2026-27 annual family income proof)\n' +
        '4. **Bonafide Student Certificate** / Institution Enrollment Proof\n' +
        '5. **Class 10/12 Marksheets** & Fee Receipts\n' +
        '6. **Aadhaar-Seeded Bank Passbook** front page\n\n' +
        '💡 *Tip: Verify once in your Document Vault or import via DigiLocker to reuse across all 5 MoTA schemes!*';
      actions = ['Import from DigiLocker', 'One-Time Registration (OTR)', 'Check Eligibility'];
    } else if (messageLower.includes('eligible') || messageLower.includes('eligibility') || messageLower.includes('पात्र') || messageLower.includes('అర్హత')) {
      ruleReply = '🎓 **Scholarship Eligibility Criteria Summary:**\n\n' +
        '• **Pre-Matric ST**: Class 9 & 10 | Income Cap: ₹2.5 Lakhs/year\n' +
        '• **Post-Matric ST (PMS-ST)**: Class 11 to Post-Graduation | Income Cap: ₹2.5 Lakhs/year\n' +
        '• **Top Class Education**: Premier Institutes (IIT/NIT/IIM/AIIMS) | Income Cap: ₹6.0 Lakhs/year\n' +
        '• **National Fellowship (NFST)**: Regular M.Phil / Ph.D Scholars | Income Cap: ₹8.0 Lakhs/year\n' +
        '• **National Overseas (NOS)**: Abroad Higher Studies in QS Top 500 Universities | Income Cap: ₹6.0 Lakhs/year';
      actions = ['Apply Now', 'Check Application', 'Required Documents'];
    } else if (messageLower.includes('status') || messageLower.includes('application') || messageLower.includes('track')) {
      ruleReply = '🔍 **Tracking Your Scholarship Application:**\n\n' +
        '1. Log in to your Student Portal using your **OTR ID** (e.g. `OTR2026001234`) and password.\n' +
        '2. Navigate to **My Applications** in your Dashboard.\n' +
        '3. View the live visual stepper timeline tracking progression across:\n' +
        '   `Submitted ➔ Institution Verified ➔ District Verified ➔ State Sanctioned ➔ DBT Processing ➔ Fund Disbursed`';
      actions = ['Student Login', 'New Registration (OTR)', 'Raise Grievance'];
    } else if (messageLower.includes('payment') || messageLower.includes('dbt') || messageLower.includes('money') || messageLower.includes('amount') || messageLower.includes('भुगतान')) {
      ruleReply = '💳 **Direct Benefit Transfer (DBT) Payment Guide:**\n\n' +
        '• All scholarship funds are credited directly into your **Aadhaar-seeded bank account** via NPCI APB.\n' +
        '• Ensure your bank account is active and seeded with your 12-digit Aadhaar number.\n' +
        '• Track payment sanction orders, transaction dates, and UTR numbers under **DBT Disbursal** in your student dashboard.';
      actions = ['Track Payment Status', 'Check Application', 'Raise Payment Grievance'];
    } else if (messageLower.includes('otr') || messageLower.includes('registration') || messageLower.includes('register')) {
      ruleReply = '🆔 **One-Time Registration (OTR) Overview:**\n\n' +
        'OTR generates a permanent lifetime portal ID for ST students using Aadhaar OTP verification. Once registered, all your verified community and income certificates are stored securely in your Document Vault for 1-click multi-scheme applications!';
      actions = ['Start OTR Registration', 'Check Eligibility', 'Required Documents'];
    } else if (messageLower.includes('digilocker')) {
      ruleReply = '🔒 **DigiLocker Integration:**\n\n' +
        'Click "Fetch from DigiLocker" in your Document Vault to automatically import state e-District ST certificates and school board marksheets with digital cryptographic verification signatures!';
      actions = ['Open Document Vault', 'Required Documents', 'Check Eligibility'];
    } else if (messageLower.includes('grievance') || messageLower.includes('help') || messageLower.includes('complaint')) {
      ruleReply = '🚨 **Helpdesk & Grievance Cell:**\n\n' +
        'If you face any application delay, document verification issue, or payment credit issue, click "Grievance / Help" in the top menu to submit a ticket. You will receive a tracking ID (e.g. `GRV-2026-001099`) for 48-hour resolution.';
      actions = ['Submit Grievance Ticket', 'Track Ticket Status'];
    } else if (messageLower.includes('scheme') || messageLower.includes('schemes') || messageLower.includes('list')) {
      ruleReply = '🏛️ **Ministry of Tribal Affairs 5 Scholarship Schemes:**\n\n' +
        '1. Pre-Matric Scholarship Scheme for ST Students\n' +
        '2. Post-Matric Scholarship for ST Students (PMS-ST)\n' +
        '3. Top Class Education Scheme for ST Students\n' +
        '4. National Fellowship for ST Scholars (NFST)\n' +
        '5. National Overseas Scholarship for ST Candidates (NOS)';
      actions = ['View Scheme Details', 'Check Eligibility', 'One-Time Registration (OTR)'];
    } else {
      ruleReply = 'Namaste! I am JAGO, your AI Tribal Scholarship Guide for the Ministry of Tribal Affairs.\n\n' +
        'I can assist you with checking scholarship eligibility, tracking your application status, listing required documents, or explaining DBT payment disbursals. How can I help you today?';
    }

    return {
      response: ruleReply,
      quickActions: actions,
    };
  }
}
