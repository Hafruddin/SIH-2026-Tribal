import { getTranslation } from "./jagoTranslations";

import db from '../db/database';
import { voiceAssistantService } from './elevenlabsService';

export interface VoiceAction {
  type: 'NAVIGATE' | 'HIGHLIGHT' | 'OPEN_MODAL' | 'CONFIRM' | 'NONE';
  target?: string;
  payload?: any;
}

export interface VoiceResponsePayload {
  language: string;
  intent: string;
  displayText: string;
  spokenText: string;
  audioBase64?: string;
  isMockAudio: boolean;
  quickActions: string[];
  action: VoiceAction;
  studentContextUsed: boolean;
}

export class JagoOrchestrator {
  static async processVoiceCommand(
    userMessage: string,
    studentId?: string,
    language: string = 'en',
    speed: 'slow' | 'normal' | 'fast' = 'slow'
  ): Promise<VoiceResponsePayload> {
    const msgLower = userMessage.toLowerCase();

    // 1. Fetch Student Context if authenticated
    let studentInfo: any = null;
    let applications: any[] = [];
    let payments: any[] = [];
    let documents: any[] = [];

    if (studentId) {
      studentInfo = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
      if (studentInfo) {
        applications = db.prepare(`
          SELECT a.*, s.name_en as scheme_name, s.code as scheme_code
          FROM applications a
          JOIN scholarships s ON a.scholarship_id = s.id
          WHERE a.student_id = ?
        `).all(studentId);
        payments = db.prepare('SELECT * FROM payments WHERE student_id = ?').all(studentId);
        documents = db.prepare('SELECT * FROM documents WHERE student_id = ?').all(studentId);
      }
    }

    let intent = 'GENERAL_QUERY';
    let displayText = '';
    let spokenText = '';
    let quickActions = ['Check Eligibility', 'View Schemes', 'Required Documents', 'Payment Status', 'Raise Grievance'];
    let action: VoiceAction = { type: 'NONE' };
    let studentContextUsed = false;

    // 2. NAVIGATION INTENTS
    if (msgLower.includes('open scheme') || msgLower.includes('show scheme') || msgLower.includes('view scheme') || msgLower.includes('திட்டங்கள்') || msgLower.includes('योजना')) {
      intent = 'NAVIGATE_SCHEMES';
      displayText = 'Opening Central & State Tribal Scholarship Schemes Repository...';
      spokenText = language === 'ta'
        ? 'நிச்சயமாக! பழங்குடியினர் உதவித்தொகை திட்டங்கள் பக்கத்தைத் திறக்கிறேன்.'
        : language === 'hi'
        ? 'जी बिल्कुल! सभी छात्रवृत्ति योजनाओं की सूची खोल रहा हूँ।'
        : 'Opening the scholarship schemes list for you.';
      action = { type: 'NAVIGATE', target: '/schemes' };
    }
    else if (msgLower.includes('show my application') || msgLower.includes('open application') || msgLower.includes('my application') || msgLower.includes('விண்ணப்பங்கள்')) {
      intent = 'NAVIGATE_APPLICATIONS';
      displayText = 'Opening My Applications & Status Tracking Dashboard...';
      spokenText = language === 'ta'
        ? 'உங்கள் விண்ணப்பங்கள் மற்றும் நிலவரப் பக்கத்தைத் திறக்கிறேன்.'
        : language === 'hi'
        ? 'आपके आवेदन और ट्रैकिंग डैशबोर्ड को खोला जा रहा है।'
        : 'Opening your applications tracking dashboard.';
      action = { type: 'NAVIGATE', target: '/student/dashboard' };
    }
    else if (msgLower.includes('open document') || msgLower.includes('show my document') || msgLower.includes('vault') || msgLower.includes('digilocker') || msgLower.includes('ஆவணங்கள்')) {
      intent = 'NAVIGATE_DOCUMENTS';
      displayText = 'Opening Digital Document Vault & DigiLocker Adapter...';
      spokenText = language === 'ta'
        ? 'உங்கள் சரிபார்க்கப்பட்ட டிஜிட்டல் ஆவண பெட்டகத்தைத் திறக்கிறேன்.'
        : language === 'hi'
        ? 'आपके डिजिटल दस्तावेज वॉल्ट को खोला जा रहा है।'
        : 'Opening your verified digital document vault.';
      action = { type: 'NAVIGATE', target: '/student/documents' };
    }
    else if (msgLower.includes('grievance') || msgLower.includes('complaint') || msgLower.includes('helpdesk') || msgLower.includes('புகார்') || msgLower.includes('शिकायत')) {
      intent = 'NAVIGATE_GRIEVANCE';
      displayText = 'Opening Grievance Helpdesk Ticket Registration...';
      spokenText = language === 'ta'
        ? 'புகார் பதிவு மற்றும் உதவிமைய பக்கத்தைத் திறக்கிறேன்.'
        : language === 'hi'
        ? 'आपकी शिकायत निवारण सहायता केंद्र खोला जा रहा है।'
        : 'Opening the grievance helpdesk page for you.';
      action = { type: 'NAVIGATE', target: '/grievance' };
    }
    else if (msgLower.includes('home') || msgLower.includes('main page') || msgLower.includes('முகப்பு')) {
      intent = 'NAVIGATE_HOME';
      displayText = 'Navigating to Home Portal...';
      spokenText = language === 'ta' ? 'முகப்புப் பக்கத்திற்குச் செல்கிறது.' : 'Going to main portal home page.';
      action = { type: 'NAVIGATE', target: '/' };
    }

    // SCHOLARSHIP SPECIFIC KNOWLEDGE BASE INTENTS
    else if (msgLower.includes('post-matric') || msgLower.includes('post matric') || msgLower.includes('postmatric')) {
      intent = 'SCHEME_POST_MATRIC';
      displayText = '📜 **Post-Matric Scholarship for ST Students (MoTA)**\n\n• **Eligibility**: ST students studying in Class 11, 12, UG, PG, B.Tech, MBBS, M.Sc.\n• **Income Limit**: Annual family income up to ₹2.50 Lakhs.\n• **Benefits**: 100% compulsory fee reimbursement + maintenance allowance up to ₹1,200/month.\n• **DBT Mode**: Direct bank transfer to Aadhaar-seeded bank account.';
      spokenText = language === 'ta'
        ? 'போஸ்ட் மெட்ரிக் உதவித்தொகை: 11-ஆம் வகுப்பு முதல் கல்லூரி படிக்கும் பழங்குடியின மாணவர்களுக்கு கட்டண விலக்கு மற்றும் மாதம் 1200 ரூபாய் பராமரிப்பு தொகை வழங்கப்படுகிறது.'
        : language === 'hi'
        ? 'पोस्ट-मैट्रिक छात्रवृत्ति: कक्षा 11 से उच्च शिक्षा प्राप्त कर रहे एसटी छात्रों को पूर्ण शुल्क प्रतिपूर्ति और रखरखाव भत्ता प्रदान किया जाता है।'
        : 'Post Matric Scholarship covers 100% compulsory tuition fees and monthly maintenance allowance for ST students pursuing higher education.';
      action = { type: 'HIGHLIGHT', target: '#schemes' };
      quickActions = ['Apply for Post-Matric', 'Check Eligibility', 'Required Documents'];
    }
    else if (msgLower.includes('pre-matric') || msgLower.includes('pre matric') || msgLower.includes('class 9') || msgLower.includes('class 10')) {
      intent = 'SCHEME_PRE_MATRIC';
      displayText = '📜 **Pre-Matric Scholarship for ST Students (Classes 9 & 10)**\n\n• **Eligibility**: ST students enrolled in recognized Class 9 or 10.\n• **Income Limit**: Annual family income under ₹2.00 Lakhs.\n• **Stipend**: ₹225/month for Hostellers | ₹150/month for Day Scholars + Book grant ₹750/year.\n• **Objective**: Support tribal students in completing secondary school.';
      spokenText = language === 'ta'
        ? 'ப்ரீ மெட்ரிக் உதவித்தொகை: 9 மற்றும் 10-ஆம் வகுப்பு படிக்கும் ST மாணவர்களுக்கு கல்வி உதவித்தொகை மற்றும் புத்தக மானியம் வழங்கப்படுகிறது.'
        : 'Pre Matric Scholarship provides monthly stipend and book grants for ST students in Classes 9 and 10.';
      quickActions = ['Check Eligibility', 'Required Documents'];
    }
    else if (msgLower.includes('top class') || msgLower.includes('iit') || msgLower.includes('iim') || msgLower.includes('nit') || msgLower.includes('aiims')) {
      intent = 'SCHEME_TOP_CLASS';
      displayText = '🏛️ **Top Class Education Scheme for ST Students (Premier Institutes)**\n\n• **Institutes**: IITs, NITs, IIMs, AIIMS, NLUs, NIFT, IISER.\n• **Coverage**: 100% tuition fees + ₹3,000/month living expenses + ₹5,000/year books + ₹45,000 one-time computer grant.\n• **Income Limit**: Family income up to ₹6.00 Lakhs/year.\n• **Slots**: 1,000 fresh ST scholarships granted annually.';
      spokenText = language === 'ta'
        ? 'டாப் கிளாஸ் திட்டம்: IIT, NIT, IIM போன்ற உயர் கல்வி நிறுவனங்களில் சேர்க்கை பெற்ற பழங்குடியின மாணவர்களுக்கு முழு கட்டணம் மற்றும் கணினி மானியம் வழங்கப்படுகிறது.'
        : 'Top Class Education Scheme covers full tuition fees, living expenses, and laptop grants for ST students in IITs, NITs, and IIMs.';
      quickActions = ['Check Premier Institutes', 'Apply Now'];
    }
    else if (msgLower.includes('overseas') || msgLower.includes('abroad') || msgLower.includes('nos') || msgLower.includes('foreign')) {
      intent = 'SCHEME_OVERSEAS';
      displayText = '✈️ **National Overseas Scholarship (NOS) for ST Students**\n\n• **Coverage**: Masters, Ph.D., and Post-Doctoral research in top foreign universities (US, UK, Europe, Australia).\n• **Allowance**: £9,900/year (UK) | $15,400/year (USA & other countries) + Full tuition fees + Visa & Travel airfare.\n• **Income Limit**: Family income below ₹8.00 Lakhs/year.\n• **Slots**: 40 seats allocated annually.';
      spokenText = language === 'ta'
        ? 'தேசிய வெளிநாட்டு உதவித்தொகை: வெளிநாடுகளில் முதுகலை மற்றும் ஆராய்ச்சி படிக்கும் ST மாணவர்களுக்கு முழு கல்வி கட்டணம் மற்றும் பயணச் செலவு வழங்கப்படுகிறது.'
        : 'National Overseas Scholarship supports ST students for Masters and Ph.D. studies in foreign universities with full tuition and living allowances.';
      quickActions = ['View NOS Guidelines', 'Check Overseas Slots'];
    }
    else if (msgLower.includes('fellowship') || msgLower.includes('nfst') || msgLower.includes('phd') || msgLower.includes('mphil')) {
      intent = 'SCHEME_NFST';
      displayText = '🎓 **National Fellowship & Scholarship for Higher Education (NFST)**\n\n• **Target**: ST scholars pursuing M.Phil / Ph.D. in Indian universities.\n• **Fellowship**: ₹31,000/month (JRF) | ₹35,000/month (SRF) + HRA + Contingency up to ₹20,500/year.\n• **Selection**: Merit-based selection managed directly by MoTA.';
      spokenText = 'NFST Fellowship provides 31,000 to 35,000 rupees monthly stipend for ST researchers pursuing Ph.D. degrees.';
      quickActions = ['View Fellowship Details', 'Check Eligibility'];
    }

    // AUTHENTICATED STUDENT STATUS & PAYMENT INTENTS
    else if (studentInfo && (msgLower.includes('status') || msgLower.includes('track') || msgLower.includes('நிலை'))) {
      intent = 'STUDENT_STATUS';
      studentContextUsed = true;
      if (applications.length === 0) {
        displayText = `Hello ${studentInfo.full_name}, you currently have no active scholarship applications.`;
        spokenText = language === 'ta'
          ? `வணக்கம் ${studentInfo.full_name}, உங்களிடம் தற்போது சமர்ப்பிக்கப்பட்ட விண்ணப்பங்கள் எதுவும் இல்லை.`
          : `Hello ${studentInfo.full_name}, you do not have any submitted scholarship applications yet.`;
      } else {
        const topApp = applications[0];
        displayText = `Hello ${studentInfo.full_name}! Your **${topApp.scheme_name}** application (Application No: **${topApp.application_no}**) current status is: **${topApp.current_status}**.`;

        let simpleStatusText = 'is under institute verification.';
        if (topApp.current_status === 'Disbursed') simpleStatusText = 'has been approved and payment sent via DBT.';
        else if (topApp.current_status === 'Sanctioned') simpleStatusText = 'has been sanctioned by the Ministry of Tribal Affairs.';

        spokenText = language === 'ta'
          ? `வணக்கம் ${studentInfo.full_name}! உங்கள் விண்ணப்பம் தற்போது சரிபார்ப்பு நிலையில் உள்ளது.`
          : `Hello ${studentInfo.full_name}! Your ${topApp.scheme_code} application ${simpleStatusText}`;
      }
      action = { type: 'HIGHLIGHT', target: '#applications' };
    }
    else if (studentInfo && (msgLower.includes('payment') || msgLower.includes('dbt') || msgLower.includes('money') || msgLower.includes('பணம்') || msgLower.includes('पैसा'))) {
      intent = 'STUDENT_PAYMENT';
      studentContextUsed = true;
      if (payments.length === 0) {
        displayText = `Hello ${studentInfo.full_name}, your scholarship payment is currently under Aadhaar bank account verification.`;
        spokenText = language === 'ta'
          ? `வணக்கம் ${studentInfo.full_name}, உங்கள் பணம் தற்போது வங்கியால் சரிபார்க்கப்பட்டு வருகிறது.`
          : `Hello ${studentInfo.full_name}, your scholarship payment is undergoing bank verification.`;
      } else {
        const topPay = payments[0];
        displayText = `Hello ${studentInfo.full_name}! Scholarship amount of **₹${topPay.amount.toLocaleString('en-IN')}** has been credited via Direct Benefit Transfer (DBT) to your ${studentInfo.bank_name} account. UTR: **${topPay.utr_no}**.`;
        spokenText = language === 'ta'
          ? `வணக்கம் ${studentInfo.full_name}! உங்கள் எஸ்பிஐ வங்கிக் கணக்கில் உதவித்தொகை வரவு வைக்கப்பட்டுள்ளது.`
          : `Hello ${studentInfo.full_name}! Your scholarship amount of ${topPay.amount} rupees has been credited to your bank account.`;
      }
      action = { type: 'HIGHLIGHT', target: '#payments' };
    }

    // GENERAL ELIGIBILITY INTENT
    else if (msgLower.includes('eligible') || msgLower.includes('qualification') || msgLower.includes('தகுதி')) {
      intent = 'CHECK_ELIGIBILITY';
      if (language === 'ta') {
        displayText = '🎓 **பழங்குடியினர் உதவித்தொகை தகுதிகள்:**\n\n1. **Post-Matric**: குடும்ப வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும்.\n2. **Top Class Education**: IIT/NIT சேர்க்கை பெற்ற பழங்குடியினர்.\n3. **NOS Overseas**: வெளிநாட்டு உயர்கல்வித் திட்டம் (வருமானம் ₹8L வரை).';
        spokenText = 'உங்கள் ST சாதிச் சான்றிதழ் மற்றும் வருமான வரம்பின் அடிப்படையில் நீங்கள் போஸ்ட் மெட்ரிக் மற்றும் டாப் கிளாஸ் உதவித்தொகைக்கு தகுதியானவர்.';
      } else {
        displayText = '🎓 **ST Scholarship Eligibility Matrix:**\n\n1. **Post-Matric ST**: Income under ₹2.50L/year.\n2. **Top Class Education**: Enrolled in IIT/NIT/IIM.\n3. **National Overseas**: Studying abroad (Income under ₹8.00L/year).\n4. **Pre-Matric ST**: Classes 9 & 10 (Income under ₹2.00L/year).';
        spokenText = 'Based on your ST profile, you are eligible for the Post-Matric Scholarship and Top Class Education Scheme.';
      }
      action = { type: 'HIGHLIGHT', target: '#schemes' };
      quickActions = ['Check Eligibility', 'Required Documents', 'View Schemes'];
    }

    // REQUIRED DOCUMENTS INTENT
    else if (msgLower.includes('document') || msgLower.includes('required') || msgLower.includes('ஆவணம்') || msgLower.includes('कागजात')) {
      intent = 'REQUIRED_DOCUMENTS';
      const t = getTranslation('REQUIRED_DOCUMENTS', language) || getTranslation('REQUIRED_DOCUMENTS', 'en')!;
      displayText = t.display;
      spokenText = t.spoken;
      quickActions = ['Fetch from DigiLocker', 'Upload Documents', 'Check Eligibility'];
    }

    // GENERAL WELCOME / DEFAULT INTENT
    else {
      intent = 'WELCOME_ASSIST';
      const t = getTranslation('WELCOME_ASSIST', language) || getTranslation('WELCOME_ASSIST', 'en')!;
      displayText = t.display;
      spokenText = t.spoken;
    }

    // 3. GENERATE AUDIO SPEECH SYNTHESIS
    const audioResult = await voiceAssistantService.speak(spokenText, language, speed);

    return {
      language,
      intent,
      displayText,
      spokenText,
      audioBase64: audioResult.audioBase64,
      isMockAudio: audioResult.isMock,
      quickActions,
      action,
      studentContextUsed,
    };
  }
}
