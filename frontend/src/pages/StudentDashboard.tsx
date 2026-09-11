import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { TimelineTracker } from '../components/TimelineTracker';
import {
  FileText, ShieldCheck, CreditCard, Bell, User, BookOpen, AlertCircle, CheckCircle2,
  Upload, ExternalLink, RefreshCw, IndianRupee, Clock, PlusCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'applications' | 'vault' | 'payments' | 'profile' | 'notifications'>('applications');
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedAppTimeline, setSelectedAppTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, appRes, docRes, payRes, notifRes] = await Promise.all([
        axios.get('/api/student/profile'),
        axios.get('/api/applications'),
        axios.get('/api/documents'),
        axios.get('/api/payments'),
        axios.get('/api/notifications'),
      ]);

      setStudent(profRes.data.student);
      setApplications(appRes.data.applications || []);
      setDocuments(docRes.data.documents || []);
      setPayments(payRes.data.payments || []);
      setNotifications(notifRes.data.notifications || []);

      if (appRes.data.applications?.length > 0) {
        fetchTimeline(appRes.data.applications[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (appId: string) => {
    try {
      const res = await axios.get(`/api/applications/${appId}`);
      setSelectedAppTimeline(res.data);
    } catch (e) {}
  };

  const totalFunds = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingDocsCount = documents.filter(d => d.verification_status !== 'VERIFIED').length;

  // Multilingual UI Text Map
  const ui: Record<string, Record<Language, string>> = {
    loadingDash: {
      en: 'Loading Student Portal Dashboard...',
      hi: 'छात्र पोर्टल डैशबोर्ड लोड हो रहा है...',
      te: 'స్టూడెంట్ పోర్టల్ డ్యాష్‌బోర్డ్ లోడ్ అవుతోంది...',
      ta: 'மாணவர் போர்ட்டல் டாஷ்போர்டு ஏற்றப்படுகிறது...',
      mr: 'विद्यार्थी पोर्टल डॅशबोर्ड लोड होत आहे...',
      bn: 'স্টুডেন্ট পোর্টাল ড্যাশবোর্ড লোড হচ্ছে...',
      ml: 'വിദ്യാർത്ഥി പോർട്ടൽ ഡാഷ്‌ബോർഡ് ലോഡ് ചെയ്യുന്നു...',
      kn: 'ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    },
    stVerified: {
      en: 'ST Verified',
      hi: 'एसटी सत्यापित',
      te: 'ST ధృవీకరించబడింది',
      ta: 'ST சரிபார்க்கப்பட்டது',
      mr: 'एसटी पडताळणी पूर्ण',
      bn: 'এসটি যাচাইকৃত',
      ml: 'എസ്ടി പരിശോധിച്ചു',
      kn: 'ಎಸ್‌ಟಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    },
    otrIdLabel: {
      en: 'OTR Lifetime Portal ID:',
      hi: 'OTR आजीवन पोर्टल आईडी:',
      te: 'OTR జీవితకాల పోర్టల్ ID:',
      ta: 'OTR வாழ்நாள் போர்ட்டல் ஐடி:',
      mr: 'OTR आजीवन पोर्टल आयडी:',
      bn: 'OTR আজীবন পোর্টাল আইডি:',
      ml: 'OTR ലൈഫ് ടൈം പോർട്ടൽ ഐഡി:',
      kn: 'OTR ಜೀವಿತಾವಧಿ ಪೋರ್ಟಲ್ ಐಡಿ:',
    },
    domicileLabel: {
      en: 'Domicile:',
      hi: 'मूल निवास:',
      te: 'నివాస రాష్ట్రం:',
      ta: 'வசிப்பிடம்:',
      mr: 'अधिवास:',
      bn: 'বাসস্থান:',
      ml: 'താമസം:',
      kn: 'ನಿವಾಸ:',
    },
    profileIntegrity: {
      en: 'Profile Integrity',
      hi: 'प्रोफ़ाइल स्थिति',
      te: 'ప్రొఫైల్ సమగ్రత',
      ta: 'சுயவிவர நிலை',
      mr: 'प्रोफाइल अखंडता',
      bn: 'প্রোফাইল অখণ্ডতা',
      ml: 'പ്രൊഫൈൽ സമഗ്രത',
      kn: 'ಪ್ರೊಫೈಲ್ ಸಮಗ್ರತೆ',
    },
    completed100: {
      en: '100% Completed',
      hi: '100% पूर्ण',
      te: '100% పూర్తయింది',
      ta: '100% முடிந்தது',
      mr: '१००% पूर्ण',
      bn: '১০০% সম্পন্ন',
      ml: '100% പൂർത്തിയായി',
      kn: '100% ಪೂರ್ಣಗೊಂಡಿದೆ',
    },
    applySchemeBtn: {
      en: 'Apply Scheme',
      hi: 'योजना के लिए आवेदन करें',
      te: 'పథకానికి దరఖాస్తు చేయండి',
      ta: 'திட்டத்திற்கு விண்ணப்பிக்கவும்',
      mr: 'योजनेसाठी अर्ज करा',
      bn: 'প্রকল্পে আবেদন করুন',
      ml: 'പദ്ധതിക്ക് അപേക്ഷിക്കുക',
      kn: 'ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    },
    activeApps: {
      en: 'Active Applications',
      hi: 'सक्रिय आवेदन',
      te: 'సక్రియ దరఖాస్తులు',
      ta: 'செயலில் உள்ள விண்ணப்பங்கள்',
      mr: 'सक्रिय अर्ज',
      bn: 'সক্রিয় আবেদনসমূহ',
      ml: 'സജീവ അപേക്ഷകൾ',
      kn: 'ಸಕ್ರಿಯ ಅರ್ಜಿಗಳು',
    },
    fundsDisbursed: {
      en: 'Scholarships Disbursed',
      hi: 'संवितरित छात्रवृत्तियां',
      te: 'మంజూరైన స్కాలర్‌షిప్‌లు',
      ta: 'வழங்கப்பட்ட உதவித்தொகைகள்',
      mr: 'वितरित शिष्यवृत्ती',
      bn: 'বিতরণকৃত বৃত্তি',
      ml: 'വിതരണം ചെയ്ത സ്കോളർഷിപ്പുകൾ',
      kn: 'ವಿತರಿಸಲಾದ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು',
    },
    pendingActions: {
      en: 'Pending Actions',
      hi: 'लंबित कार्य',
      te: 'పెండింగ్ చర్యలు',
      ta: 'நிலுவையில் உள்ள செயல்கள்',
      mr: 'प्रलंबित कृती',
      bn: 'অপেক্ষমাণ কাজ',
      ml: 'തീർപ്പുകൽപ്പിക്കാത്തവ',
      kn: 'ಬಾಕಿ ಇರುವ ಕ್ರಮಗಳು',
    },
    totalFundsRcvd: {
      en: 'Total Funds Received',
      hi: 'प्राप्त कुल धनराशि',
      te: 'మొత్తం పొందిన నిధులు',
      ta: 'பெறப்பட்ட மொத்த நிதி',
      mr: 'प्राप्त झालेला एकूण निधी',
      bn: 'মোট প্রাপ্ত অর্থ',
      ml: 'ആകെ ലഭിച്ച തുക',
      kn: 'ಸ್ವೀಕರಿಸಿದ ಒಟ್ಟು ಹಣ',
    },
    tabApps: {
      en: 'My Applications',
      hi: 'मेरे आवेदन',
      te: 'నా దరఖాస్తులు',
      ta: 'என் விண்ணப்பங்கள்',
      mr: 'माझे अर्ज',
      bn: 'আমার আবেদনসমূহ',
      ml: 'എന്റെ അപേക്ഷകൾ',
      kn: 'ನನ್ನ ಅರ್ಜಿಗಳು',
    },
    tabVault: {
      en: 'Document Vault',
      hi: 'दस्तावेज़ वॉल्ट',
      te: 'డాక్యుమెంట్ వాల్ట్',
      ta: 'ஆவணப் பெட்டகம்',
      mr: 'दस्तऐवज व्हॉल्ट',
      bn: 'ডকুমেন্ট ভল্ট',
      ml: 'രേഖാ വോൾട്ട്',
      kn: 'ಡಾಕ್ಯುಮೆಂಟ್ ವಾಲ್ಟ್',
    },
    tabPayments: {
      en: 'DBT Disbursal',
      hi: 'डीबीटी संवितरण',
      te: 'DBT నిధుల విడుదల',
      ta: 'DBT நேரடிப் பரிமாற்றம்',
      mr: 'डीबीटी वितरण',
      bn: 'ডিবিটি বিতরণ',
      ml: 'ഡിബിടി വിതരണം',
      kn: 'ಡಿಬಿಟಿ ವಿತರಣೆ',
    },
    tabNotifs: {
      en: 'Notifications',
      hi: 'अधिसूचनाएं',
      te: 'నోటిఫికేషన్‌లు',
      ta: 'அறிவிப்புகள்',
      mr: 'सूचना',
      bn: 'বিজ্ঞপ্তিগুলি',
      ml: 'അറിയിപ്പുകൾ',
      kn: 'ಅಧಿಸೂಚನೆಗಳು',
    },
    tblSchemeName: {
      en: 'Scheme Name',
      hi: 'योजना का नाम',
      te: 'పథకం పేరు',
      ta: 'திட்டத்தின் பெயர்',
      mr: 'योजनेचे नाव',
      bn: 'প্রকল্পের নাম',
      ml: 'പദ്ധതിയുടെ പേര്',
      kn: 'ಯೋಜನೆಯ ಹೆಸರು',
    },
    tblAppId: {
      en: 'Application ID',
      hi: 'आवेदन आईडी',
      te: 'దరఖాస్తు ID',
      ta: 'விண்ணப்ப எண்',
      mr: 'अर्ज आयडी',
      bn: 'আবেদন আইডি',
      ml: 'അപേക്ഷാ ഐഡി',
      kn: 'ಅರ್ಜಿ ಐಡಿ',
    },
    tblAcadYear: {
      en: 'Academic Year',
      hi: 'शैक्षणिक वर्ष',
      te: 'విద్యా సంవత్సరం',
      ta: 'கல்வியாண்டு',
      mr: 'शैक्षणिक वर्ष',
      bn: 'শিক্ষাবর্ষ',
      ml: 'അധ്യയന വർഷം',
      kn: 'ಶೈಕ್ಷಣಿಕ ವರ್ಷ',
    },
    tblStatus: {
      en: 'Current Status',
      hi: 'वर्तमान स्थिति',
      te: 'ప్రస్తుత స్థితి',
      ta: 'தற்போதைய நிலை',
      mr: 'सद्यस्थिती',
      bn: 'বর্তমান স্থিতি',
      ml: 'നിലവിലെ അവസ്ഥ',
      kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ',
    },
    tblLastUpdated: {
      en: 'Last Updated',
      hi: 'अंतिम अद्यतन',
      te: 'చివరిగా నవీకరించబడింది',
      ta: 'கடைசியாக புதுப்பிக்கப்பட்டது',
      mr: 'शेवटचे अद्यतन',
      bn: 'সর্বশেষ আপডেট',
      ml: 'അവസാനം അപ്ഡേറ്റ് ചെയ്തത്',
      kn: 'ಕೊನೆಯ ನವೀಕರಣ',
    },
    tblAction: {
      en: 'Action',
      hi: 'कार्रवाई',
      te: 'చర్య',
      ta: 'செயல்',
      mr: 'कृती',
      bn: 'পদক্ষেপ',
      ml: 'നടപടി',
      kn: 'ಕ್ರಮ',
    },
    btnViewTimeline: {
      en: 'View Timeline',
      hi: 'समयरेखा देखें',
      te: 'టైమ్‌లైన్ చూడండి',
      ta: 'காலவரிசையைக் காண்க',
      mr: 'टाइमलाइन पहा',
      bn: 'সময়রেখা দেখুন',
      ml: 'ടൈംലൈൻ കാണുക',
      kn: 'ಟೈಮ್‌ಲೈನ್ ವೀಕ್ಷಿಸಿ',
    },
    vaultTabTitle: {
      en: 'Digital Document Vault',
      hi: 'डिजिटल दस्तावेज़ वॉल्ट',
      te: 'డిజిటల్ డాక్యుమెంట్ వాల్ట్',
      ta: 'டிஜிட்டல் ஆவணப் பெட்டகம்',
      mr: 'डिजिटल दस्तऐवज व्हॉल्ट',
      bn: 'ডিজিটাল ডকুমেন্ট ভল্ট',
      ml: 'ഡിജിറ്റൽ രേഖാ വോൾട്ട്',
      kn: 'ಡಿಜಿಟಲ್ ಡಾಕ್ಯುಮೆಂಟ್ ವಾಲ್ಟ್',
    },
    vaultTabDesc: {
      en: 'Verify once. Securely reuse these verified documents across all 5 MoTA scholarship schemes.',
      hi: 'एक बार सत्यापित करें। इन सभी सत्यापित दस्तावेजों का सभी 5 MoTA छात्रवृत्ति योजनाओं में सुरक्षित पुनः उपयोग करें।',
      te: 'ఒక్కసారి ధృవీకరించండి. ఈ ధృవీకరించబడిన పత్రాలను మొత్తం 5 MoTA స్కాలర్‌షిప్ పథకాలలో సురక్షితంగా ఉపయోగించండి.',
      ta: 'ஒருமுறை சரிபார்க்கவும். இந்த ஆவணங்களை அனைத்து 5 MoTA உதவித்தொகை திட்டங்களிலும் பாதுகாப்பாக மீண்டும் பயன்படுத்தவும்.',
      mr: 'एकदा पडताळा. हे सर्व पडताळलेले दस्तऐवज सर्व ५ MoTA शिष्यवृत्ती योजनांमध्ये सुरक्षितपणे वापरा.',
      bn: 'একবার যাচাই করুন। সমস্ত ৫টি MoTA বৃত্তি প্রকল্পে এই যাচাইকৃত নথিগুলি নিরাপদে পুনঃব্যবহার করুন।',
      ml: 'ഒരിക്കൽ പരിശോധിക്കുക. എല്ലാ 5 MoTA സ്കോളർഷിപ്പ് പദ്ധതികളിലും ഈ രേഖകൾ സുരक्षितമായി വീണ്ടും ഉപയോഗിക്കുക.',
      kn: 'ಒಮ್ಮೆ ಪರಿಶೀಲಿಸಿ. ಎಲ್ಲಾ 5 MoTA ವಿದ್ಯಾರ್ಥಿವೇತನ ಯೋಜನೆಗಳಲ್ಲಿ ಈ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಮರುಬಳಕೆ ಮಾಡಿ.',
    },
    btnUpload: {
      en: 'Upload Document',
      hi: 'दस्तावेज़ अपलोड करें',
      te: 'డాక్యుమెంట్ అప్‌లోడ్ చేయండి',
      ta: 'ஆவணத்தை பதிவேற்றவும்',
      mr: 'दस्तऐवज अपलोड करा',
      bn: 'নথি আপলোড করুন',
      ml: 'രേഖ അപ്‌ലോഡ് ചെയ്യുക',
      kn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    },
    btnFetchDigi: {
      en: 'Fetch from DigiLocker',
      hi: 'डिजिलॉकर से लाएं',
      te: 'డిజిలాకర్ నుండి పొందండి',
      ta: 'டிஜிலாக்கரில் இருந்து பெறவும்',
      mr: 'डिजिलॉकरवरून आणा',
      bn: 'ডিজিলকার থেকে আনুন',
      ml: 'ഡിജിലോക്കറിൽ നിന്ന് എടുക്കുക',
      kn: 'ಡಿಜಿಲಾಕರ್‌ನಿಂದ ಪಡೆದುಕೊಳ್ಳಿ',
    },
    dbtHeaderTitle: {
      en: 'Direct Benefit Transfer (DBT) Payment Records',
      hi: 'प्रत्यक्ष लाभ अंतरण (DBT) भुगतान रिकॉर्ड',
      te: 'ప్రత్యక్ష నగదు బదిలీ (DBT) చెల్లింపు రికార్డులు',
      ta: 'நேரடி பணப் பரிமாற்றம் (DBT) செலுத்துதல் பதிவுகள்',
      mr: 'थेट लाभ हस्तांतरण (DBT) देयक नोंदी',
      bn: 'সরাসরি সুবিধা স্থানান্তর (DBT) পেমেন্ট রেকর্ড',
      ml: 'നേരിട്ടുള്ള ആനുകൂല്യ കൈമാറ്റം (DBT) പേയ്‌മെന്റ് വിവരങ്ങൾ',
      kn: 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಪಾವತಿ ದಾಖಲೆಗಳು',
    },
    dbtHeaderSub: {
      en: 'Funds are transferred directly to your Aadhaar-seeded bank account.',
      hi: 'धनराशि सीधे आपके आधार-लिंक्ड बैंक खाते में स्थानांतरित की जाती है।',
      te: 'నిధులు నేరుగా మీ ఆధార్ అనుసంధాన బ్యాంక్ ఖాతాకు బదిలీ చేయబడతాయి.',
      ta: 'நிதி உங்கள் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கில் நேரடியாக செலுத்தப்படுகிறது.',
      mr: 'निधी थेट तुमच्या आधार संलग्न बँक खात्यात जमा केला जातो.',
      bn: 'টাকা সরাসরি আপনার আধার সংযুক্ত ব্যাঙ্ক অ্যাকাউন্টে স্থানান্তরিত হয়।',
      ml: 'തുക നേരിട്ട് നിങ്ങളുടെ ആധാർ ലിങ്ക് ചെയ്ത ബാങ്ക് അക്കൗണ്ടിലേക്ക് മാറ്റുന്നു.',
      kn: 'ಹಣವನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಆಧಾರ್ ಜೋಡಿಸಲಾದ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ವರ್ಗಾಯಿಸಲಾಗುತ್ತದೆ.',
    },
    notifHistory: {
      en: 'Notification History',
      hi: 'अधिसूचना इतिहास',
      te: 'నోటిఫికేషన్ల చరిత్ర',
      ta: 'அறிவிப்பு வரலாறு',
      mr: 'सूचना इतिहास',
      bn: 'বিজ্ঞপ্তি ইতিহাস',
      ml: 'അറിയിപ്പ് ചരിത്രം',
      kn: 'ಅಧಿಸೂಚನೆ ಇತಿಹಾಸ',
    },
    verifiedStatus: {
      en: 'VERIFIED',
      hi: 'सत्यापित',
      te: 'ధృవీకరించబడింది',
      ta: 'சரிபார்க்கப்பட்டது',
      mr: 'पडताळणी पूर्ण',
      bn: 'যাচাইকৃত',
      ml: 'പരിശോധിച്ചു',
      kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    },
  };

  const getT = (key: string): string => {
    return ui[key]?.[language] || ui[key]?.['en'] || key;
  };

  const getLocalizedSchemeName = (name: string, lang: Language): string => {
    if (name.includes('Post-Matric') || name.includes('PMS-ST')) {
      const map: Record<Language, string> = {
        en: 'Post-Matric Scholarship for ST Students (PMS-ST)',
        hi: 'अनुसूचित जनजाति छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
        te: 'ST విద్యార్థుల కోసం పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (PMS-ST)',
        ta: 'பழங்குடியின மாணவர்களுக்கான மெட்ரிக்கிற்கு பிந்தைய உதவித்தொகை (PMS-ST)',
        mr: 'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी पोस्ट-मॅट्रिक शिष्यवृत्ती',
        bn: 'এসটি শিক্ষার্থীদের জন্য পোস্ট-ম্যাট্রিক স্কলারশিপ (PMS-ST)',
        ml: 'ST വിദ്യാർത്ഥികൾക്കുള്ള പോസ്റ്റ്-മെട്രിക് സ്കോളർഷിപ്പ്',
        kn: 'ST ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ (PMS-ST)',
      };
      return map[lang] || name;
    }
    if (name.includes('Pre-Matric') || name.includes('Pre Matric')) {
      const map: Record<Language, string> = {
        en: 'Pre Matric Scholarship Scheme for ST Students',
        hi: 'अनुसूचित जनजाति छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति',
        te: 'ST విద్యార్థుల కోసం ప్రీ-మెట్రిక్ స్కాలర్‌షిప్ పథకం',
        ta: 'பழங்குடியின மாணவர்களுக்கான மெட்ரிக்கிற்கு முந்தைய உதவித்தொகை',
        mr: 'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी प्री-मॅट्रिक शिष्यवृत्ती',
        bn: 'এসটি শিক্ষার্থীদের জন্য প্রাক-ম্যাট্রিক স্কলারশিপ',
        ml: 'ST വിദ്യാർത്ഥികൾക്കുള്ള പ്രീ-മെട്രിക് സ്കോളർഷിപ്പ്',
        kn: 'ST ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪ್ರಿ-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ',
      };
      return map[lang] || name;
    }
    if (name.includes('Top Class') || name.includes('Top-Class')) {
      const map: Record<Language, string> = {
        en: 'National Scholarship Scheme (Top Class) For Higher Education of ST Students',
        hi: 'अनुसूचित जनजाति छात्रों के लिए शीर्ष श्रेणी शिक्षा योजना (Top Class)',
        te: 'ST విద్యార్థుల ఉన్నత విద్య కోసం టాప్ క్లాస్ ఎడ్యుకేషన్ పథకం',
        ta: 'பழங்குடியின மாணவர்களுக்கான உயர்தரக் கல்வி உதவித்தொகைத் திட்டம் (Top Class)',
        mr: 'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी उच्च शिक्षणासाठी टॉप क्लास योजना',
        bn: 'এসটি শিক্ষার্থীদের উচ্চশিক্ষার জন্য টপ ক্লাস স্কলারশিপ',
        ml: 'ST വിദ്യാർത്ഥികളുടെ ഉന്നത വിദ്യാഭ്യാസത്തിനായുള്ള ടോപ്പ് ക്ലാസ് പദ്ധതി',
        kn: 'ST ವಿದ್ಯಾರ್ಥಿಗಳ ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಟಾಪ್ ಕ್ಲಾಸ್ ಯೋಜನೆ',
      };
      return map[lang] || name;
    }
    return name;
  };

  const getLocalizedStatus = (status: string, lang: Language): string => {
    const map: Record<string, Record<Language, string>> = {
      'Disbursed': {
        en: 'Disbursed',
        hi: 'संवितरित',
        te: 'విడుదల చేయబడింది',
        ta: 'வழங்கப்பட்டது',
        mr: 'वितरित',
        bn: 'বিতরণকৃত',
        ml: 'വിതരണം ചെയ്തു',
        kn: 'ವಿತರಿಸಲಾಗಿದೆ',
      },
      'Sanctioned': {
        en: 'Sanctioned',
        hi: 'स्वीकृत',
        te: 'మంజూరైంది',
        ta: 'ஒப்புதல் அளிக்கப்பட்டது',
        mr: 'मंजूर',
        bn: 'অনুমোদিত',
        ml: 'അനുവദിച്ചു',
        kn: 'ಮಂಜೂರಾಗಿದೆ',
      },
      'Institution Verification': {
        en: 'Institution Verification',
        hi: 'संस्थान सत्यापन',
        te: 'సంస్థ ధృవీకరణ',
        ta: 'நிறுவன சரிபார்ப்பு',
        mr: 'संस्था पडताळणी',
        bn: 'শিক্ষা প্রতিষ্ঠান যাচাইকরণ',
        ml: 'സ്ഥാപന പരിശോധന',
        kn: 'ಸಂಸ್ಥೆ ಪರಿಶೀಲನೆ',
      },
      'District Verification': {
        en: 'District Verification',
        hi: 'जिला सत्यापन',
        te: 'జిల్లా ధృవీకరణ',
        ta: 'மாவட்ட சரிபார்ப்பு',
        mr: 'जिल्हा पडताळणी',
        bn: 'জেলা যাচাইকরণ',
        ml: 'ജില്ലാ പരിശോധന',
        kn: 'ಜಿಲ್ಲಾ ಪರಿಶೀಲನೆ',
      },
    };
    return map[status]?.[lang] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#8B4513] mr-3" />
          <span className="font-semibold text-sm">{getT('loadingDash')}</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Student Profile Header Bar */}
        <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#E67E22] text-white font-bold text-2xl rounded-full flex items-center justify-center border-2 border-white shadow-md">
              {student?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold">{student?.full_name || 'Aarav Kumar'}</h2>
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {getT('stVerified')}
                </span>
              </div>
              <p className="text-xs text-orange-200 mt-0.5">
                {getT('otrIdLabel')} <strong className="font-mono text-white text-sm">{student?.otr_id || 'OTR2026001234'}</strong> | {getT('domicileLabel')} <strong>{student?.state}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-white/10 px-3.5 py-2 rounded-lg border border-white/20 text-center">
              <span className="text-[10px] text-gray-200 block uppercase font-medium">{getT('profileIntegrity')}</span>
              <span className="text-sm font-extrabold text-green-300">{getT('completed100')}</span>
            </div>

            <Link
              to="/schemes"
              className="btn-accent text-xs font-bold py-2.5 px-4 shadow-md hover:scale-105 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> {getT('applySchemeBtn')}
            </Link>
          </div>
        </div>

        {/* Four Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">{getT('activeApps')}</p>
              <h3 className="text-2xl font-black text-[#8B4513] mt-1">{applications.length}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-100 text-[#8B4513] rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">{getT('fundsDisbursed')}</p>
              <h3 className="text-2xl font-black text-[#006699] mt-1">{payments.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-[#006699] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">{getT('pendingActions')}</p>
              <h3 className={`text-2xl font-black mt-1 ${pendingDocsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {pendingDocsCount}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">{getT('totalFundsRcvd')}</p>
              <h3 className="text-2xl font-black text-green-700 mt-1">₹{totalFunds.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-xl overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applications' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> {getT('tabApps')} ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vault' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> {getT('tabVault')} ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payments' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" /> {getT('tabPayments')} ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bell className="w-4 h-4" /> {getT('tabNotifs')} ({notifications.length})
          </button>
        </div>

        {/* TAB 1: APPLICATIONS TABLE & TRACKER */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-4">{getT('tblSchemeName')}</th>
                      <th className="p-4">{getT('tblAppId')}</th>
                      <th className="p-4">{getT('tblAcadYear')}</th>
                      <th className="p-4">{getT('tblStatus')}</th>
                      <th className="p-4">{getT('tblLastUpdated')}</th>
                      <th className="p-4 text-right">{getT('tblAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-900">{getLocalizedSchemeName(app.scheme_name, language)}</td>
                        <td className="p-4 font-mono font-semibold text-[#006699]">{app.application_no}</td>
                        <td className="p-4 text-gray-600">{app.academic_year}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.current_status === 'Disbursed' || app.current_status === 'Sanctioned'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {getLocalizedStatus(app.current_status, language)}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{app.updated_at.split(' ')[0]}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => fetchTimeline(app.id)}
                            className="bg-[#006699] hover:bg-[#004466] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition"
                          >
                            {getT('btnViewTimeline')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline Stepper Component for Selected Application */}
            {selectedAppTimeline && (
              <TimelineTracker
                currentStatus={selectedAppTimeline.application.current_status}
                timelineEvents={selectedAppTimeline.timeline}
              />
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENT VAULT & REUSE */}
        {activeTab === 'vault' && (
          <div className="bg-white p-6 rounded-b-xl shadow-md border border-t-0 border-gray-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  {getT('vaultTabTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getT('vaultTabDesc')}
                </p>
              </div>

              <div className="flex gap-3">
                <Link to="/student/documents" className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-4 h-4" /> {getT('btnUpload')}
                </Link>
                <Link to="/student/documents" className="btn-outline text-xs px-4 py-2 font-semibold">
                  {getT('btnFetchDigi')}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-start gap-4 hover:bg-gray-100/60 transition">
                  <div className="space-y-1">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {doc.doc_type}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{doc.doc_name}</h4>
                    <p className="text-gray-500 text-[11px]">{doc.verified_by}</p>
                    <p className="text-[10px] text-gray-400">{doc.uploaded_at.split(' ')[0]}</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-300">
                      ✓ {getT('verifiedStatus')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DBT DISBURSAL PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-white p-6 rounded-b-xl shadow-md border border-t-0 border-gray-200 space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                {getT('dbtHeaderTitle')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {getT('dbtHeaderSub')}
              </p>
            </div>

            <div className="space-y-4">
              {payments.map(pay => (
                <div key={pay.id} className="p-4 bg-green-50/60 rounded-xl border border-green-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="bg-green-700 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                      DBT Disbursed
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{getLocalizedSchemeName(pay.scheme_name, language)}</h4>
                    <p className="text-gray-600 mt-0.5">Sanction Order: <strong className="font-mono">{pay.sanction_no}</strong></p>
                    <p className="text-gray-500 text-[11px]">Bank UTR: <span className="font-mono font-bold text-gray-700">{pay.utr_no}</span></p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black text-green-800">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{pay.disbursed_at}</p>
                    <p className="text-[11px] text-green-700 font-semibold">{pay.bank_status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 rounded-b-xl shadow-md border border-t-0 border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3">{getT('notifHistory')}</h3>
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{language === 'hi' ? notif.title_hi : notif.title_en}</span>
                    <span className="text-[10px] text-gray-400">{notif.created_at}</span>
                  </div>
                  <p className="text-gray-600">{language === 'hi' ? notif.message_hi : notif.message_en}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
