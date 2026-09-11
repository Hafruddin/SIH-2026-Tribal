import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import {
  ShieldCheck, Upload, Download, RefreshCw, CheckCircle2, AlertCircle,
  FileText, ExternalLink, X, Plus
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState('Bonafide Certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // DigiLocker modal state
  const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);
  const [availableDigiDocs, setAvailableDigiDocs] = useState<any[]>([]);
  const [importingUri, setImportingUri] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('docType', docType);
    formData.append('docName', selectedFile.name);

    try {
      await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert(language === 'ta' ? 'பதிவேற்றம் தோல்வியடைந்தது.' : 'Upload failed. Ensure file is under 5MB and in PDF, JPG, or PNG format.');
    } finally {
      setUploading(false);
    }
  };

  const openDigiLockerModal = async () => {
    setDigiLockerModalOpen(true);
    try {
      const res = await axios.get('/api/documents/digilocker/available');
      setAvailableDigiDocs(res.data.availableDocuments || []);
    } catch (e) {}
  };

  const handleImportDigiLocker = async (doc: any) => {
    setImportingUri(doc.uri);
    try {
      await axios.post('/api/documents/digilocker/import', {
        docUri: doc.uri,
        docType: doc.docType,
        docName: doc.name,
      });
      setDigiLockerModalOpen(false);
      fetchDocuments();
    } catch (err) {
      alert(language === 'ta' ? 'டிஜிலாக்கர் இறக்குமதி தோல்வியடைந்தது.' : 'DigiLocker import failed');
    } finally {
      setImportingUri(null);
    }
  };

  // Multilingual UI Translations Map
  const ui: Record<string, Record<Language, string>> = {
    cryptoSecured: {
      en: 'Cryptographically Secured',
      hi: 'क्रिप्टोग्राफ़िक रूप से सुरक्षित',
      te: 'క్రిప్టోగ్రాఫికల్లీ సురక్షితం',
      ta: 'குறியாக்கவியல் ரீதியாக பாதுகாக்கப்பட்டது',
      mr: 'क्रिप्टोग्राफिकली सुरक्षित',
      bn: 'ক্রিপ্টোগ্রাফিকভাবে সুরক্ষিত',
      ml: 'ക്രിപ്റ്റോഗ്രാഫിക്കലി സുരക്ഷിതം',
      kn: 'ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕಲ್ ಆಗಿ ಸುರಕ್ಷಿತವಾಗಿದೆ',
    },
    vaultTitle: {
      en: 'Student Digital Document Vault',
      hi: 'छात्र डिजिटल दस्तावेज़ वॉल्ट',
      te: 'విద్యార్థి డిజిటల్ డాక్యుమెంట్ వాల్ట్',
      ta: 'மாணவர் டிஜிட்டல் ஆவணப் பெட்டகம்',
      mr: 'विद्यार्थी डिजिटल दस्तऐवज व्हॉल्ट',
      bn: 'ছাত্র ডিজিটাল ডকুমেন্ট ভল্ট',
      ml: 'വിദ്യാർത്ഥി ഡിജിറ്റൽ രേഖാ വോൾട്ട്',
      kn: 'ವಿದ್ಯಾರ್ಥಿ ಡಿಜಿಟಲ್ ಡಾಕ್ಯುಮೆಂಟ್ ವಾಲ್ಟ್',
    },
    vaultSubtitle: {
      en: '"Verify once. Reuse securely." All uploaded or DigiLocker-imported documents are automatically linked to your lifetime OTR profile.',
      hi: '"एक बार सत्यापित करें। सुरक्षित रूप से पुनः उपयोग करें।" सभी अपलोड किए गए या डिजिलॉकर से आयातित दस्तावेज़ आपकी आजीवन OTR प्रोफ़ाइल से स्वतः जुड़े हैं।',
      te: '"ఒక్కసారి ధృవీకరించండి. సురక్షితంగా తిరిగి ఉపయోగించండి." అప్‌లోడ్ చేసిన లేదా డిజిలాకర్ నుండి దిగుమతి చేసుకున్న అన్ని పత్రాలు మీ జీవితకాల OTR ప్రొఫైల్‌కు లింక్ చేయబడతాయి.',
      ta: '"ஒருமுறை சரிபார்க்கவும். பாதுகாப்பாக மீண்டும் பயன்படுத்தவும்." பதிவேற்றப்பட்ட அல்லது டிஜிலாக்கர் வழியாக இறக்குமதி செய்யப்பட்ட அனைத்து ஆவணங்களும் உங்கள் வாழ்நாள் OTR சுயவிவரத்துடன் தானாக இணைக்கப்பட்டுள்ளன.',
      mr: '"एकदा पडताळा. सुरक्षितपणे पुन्हा वापरा." सर्व अपलोड केलेले किंवा डिजिलॉकरवरून आयात केलेले दस्तऐवज तुमच्या आजीवन OTR प्रोफाइलशी जोडलेले आहेत.',
      bn: '"একবার যাচাই করুন। নিরাপদে পুনরায় ব্যবহার করুন।" আপলোড করা বা ডিজিলকার থেকে আমদানি করা সমস্ত নথি স্বয়ংক্রিয়ভাবে আপনার আজীবন OTR প্রোফাইলের সাথে সংযুক্ত।',
      ml: '"ഒരിക്കൽ പരിശോധിക്കുക. സുരക്ഷിതമായി വീണ്ടും ഉപയോഗിക്കുക." അപ്‌ലോഡ് ചെയ്തതോ ഡിജിലോക്കറിൽ നിന്ന് ഇറക്കുമതി ചെയ്തതോ ആയ എല്ലാ രേഖകളും നിങ്ങളുടെ OTR പ്രൊഫൈലുമായി ലിങ്ക് ചെയ്തിരിക്കുന്നു.',
      kn: '"ಒಮ್ಮೆ ಪರಿಶೀಲಿಸಿ. ಸುರಕ್ಷಿತವಾಗಿ ಮರುಬಳಕೆ ಮಾಡಿ." ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಅಥವಾ ಡಿಜಿಲಾಕರ್‌ನಿಂದ ಆಮದು ಮಾಡಿದ ಎಲ್ಲಾ ದಾಖಲೆಗಳು ನಿಮ್ಮ ಜೀವಿತಾವಧಿಯ OTR ಪ್ರೊಫೈಲ್‌ಗೆ ಲಿಂಕ್ ಆಗಿವೆ.',
    },
    uploadDoc: {
      en: 'Upload Document',
      hi: 'दस्तावेज़ अपलोड करें',
      te: 'డాక్యుమెంట్ అప్‌లోడ్ చేయండి',
      ta: 'ஆவணத்தை பதிவேற்றவும்',
      mr: 'दस्तऐवज अपलोड करा',
      bn: 'নথি আপলোড করুন',
      ml: 'രേഖ അപ്‌ലോഡ് ചെയ്യുക',
      kn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    },
    fetchDigiLocker: {
      en: 'Fetch from DigiLocker',
      hi: 'डिजिलॉकर से प्राप्त करें',
      te: 'డిజిలాకర్ నుండి పొందండి',
      ta: 'டிஜிலாக்கரில் இருந்து பெறவும்',
      mr: 'डिजिलॉकरवरून आणा',
      bn: 'ডিজিলকার থেকে আনুন',
      ml: 'ഡിജിലോക്കറിൽ നിന്ന് എടുക്കുക',
      kn: 'ಡಿಜಿಲಾಕರ್‌ನಿಂದ ಪಡೆದುಕೊಳ್ಳಿ',
    },
    reuseTitle: {
      en: 'Document Reuse Protection Active:',
      hi: 'दस्तावेज़ पुन: उपयोग सुरक्षा सक्रिय:',
      te: 'డాక్యుమెంట్ పునర్వినియోగ రక్షణ సక్రియంగా ఉంది:',
      ta: 'ஆவண மறுபயன்பாட்டு பாதுகாப்பு செயலில் உள்ளது:',
      mr: 'दस्तऐवज पुनर्वापर संरक्षण सक्रिय:',
      bn: 'নথি পুনঃব্যবহার সুরক্ষা সক্রিয়:',
      ml: 'രേഖ പുനരുപയോഗ സംരക്ഷണം സജീവം:',
      kn: 'ದಾಖಲೆ ಮರುಬಳಕೆ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ:',
    },
    reuseDesc: {
      en: 'When applying for another scholarship (e.g. Post-Matric or Top Class Education), your verified ST Certificate, Income Certificate, and Marksheets are automatically reused without requiring re-upload.',
      hi: 'अन्य छात्रवृत्ति (जैसे पोस्ट-मैट्रिक या टॉप क्लास शिक्षा) के लिए आवेदन करते समय, आपके सत्यापित एसटी प्रमाण पत्र, आय प्रमाण पत्र और अंकतालिकाएं बिना दोबारा अपलोड किए स्वचालित रूप से पुनः उपयोग की जाती हैं।',
      te: 'మరొక స్కాలర్‌షిప్ కోసం దరఖాస్తు చేసుకునేటప్పుడు, మీ ధృవీకరించబడిన ST సర్టిఫికేట్, ఆదాయ ధృవీకరణ పత్రం మరియు మార్కుల జాబితా మళ్లీ అప్‌లోడ్ చేయవలసిన అవసరం లేకుండా స్వయంచాలకంగా తిరిగి ఉపయోగించబడతాయి.',
      ta: 'மற்றொரு உதவித்தொகைக்கு விண்ணப்பிக்கும் போது, உங்கள் சரிபார்க்கப்பட்ட பழங்குடியினர் சான்றிதழ், வருமான சான்றிதழ் மற்றும் மதிப்பெண் பட்டியல்கள் மீண்டும் பதிவேற்றம் செய்ய தேவையின்றி தானாகவே பயன்படுத்தப்படும்.',
      mr: 'दुसऱ्या शिष्यवृत्तीसाठी अर्ज करताना, तुमचे पडताळलेले एसटी प्रमाणपत्र, उत्पन्न प्रमाणपत्र आणि गुणपत्रिका पुन्हा अपलोड न करता आपोआप वापरल्या जातात.',
      bn: 'অন্য বৃত্তির জন্য আবেদন করার সময়, আপনার যাচাইকৃত এসটি সার্টিফিকেট, আয় সার্টিফিকেট এবং মার্কশিট পুনরায় আপলোড না করেই স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।',
      ml: 'മറ്റൊരു സ്കോളർഷിപ്പിനായി അപേക്ഷിക്കുമ്പോൾ നിങ്ങളുടെ പരിശോധിച്ച എസ്ടി സർട്ടിഫിക്കറ്റ്, വരുമാന സർട്ടിഫിക്കറ്റ്, മാർക്ക് ലിസ്റ്റുകൾ എന്നിവ വീണ്ടും അപ്‌ലോഡ് ചെയ്യാതെ തന്നെ ഉപയോഗിക്കാം.',
      kn: 'ಮತ್ತೊಂದು ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವಾಗ, ನಿಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಎಸ್‌ಟಿ ಪ್ರಮಾಣಪತ್ರ, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಅಂಕಪಟ್ಟಿಗಳನ್ನು ಮರು-ಅಪ್‌ಲೋಡ್ ಮಾಡದೆಯೇ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮರುಬಳಕೆ ಮಾಡಲಾಗುತ್ತದೆ.',
    },
    loadingVault: {
      en: 'Loading Document Vault...',
      hi: 'दस्तावेज़ वॉल्ट लोड हो रहा है...',
      te: 'డాక్యుమెంట్ వాల్ట్ లోడ్ అవుతోంది...',
      ta: 'ஆவணப் பெட்டகம் ஏற்றப்படுகிறது...',
      mr: 'दस्तऐवज व्हॉल्ट लोड होत आहे...',
      bn: 'ডকুমেন্ট ভল্ট লোড হচ্ছে...',
      ml: 'രേഖാ വോൾട്ട് ലോഡ് ചെയ്യുന്നു...',
      kn: 'ಡಾಕ್ಯುಮೆಂಟ್ ವಾಲ್ಟ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    },
    verifiedBy: {
      en: 'Verified By:',
      hi: 'सत्यापनकर्ता:',
      te: 'ధృవీకరించినవారు:',
      ta: 'சரிபார்த்தவர்:',
      mr: 'पडताळणी करणारे:',
      bn: 'যাচাইকারী:',
      ml: 'പരിശോധിച്ചത്:',
      kn: 'ಪರಿಶೀಲಿಸಿದವರು:',
    },
    source: {
      en: 'Source:',
      hi: 'स्रोत:',
      te: 'మూలం:',
      ta: 'ஆதாரம்:',
      mr: 'स्रोत:',
      bn: 'উৎস:',
      ml: 'ഉറവിടം:',
      kn: 'ಮೂಲ:',
    },
    uploaded: {
      en: 'Uploaded:',
      hi: 'अपलोड तिथि:',
      te: 'అప్‌లోడ్ చేసిన తేదీ:',
      ta: 'பதிவேற்றிய தேதி:',
      mr: 'अपलोड तारीख:',
      bn: 'আপলোডের তারিখ:',
      ml: 'അപ്‌ലോഡ് ചെയ്തത്:',
      kn: 'ಅಪ್‌ಲೋಡ್ ದಿನಾಂಕ:',
    },
    reusableBadge: {
      en: '✓ Reusable across 5 Schemes',
      hi: '✓ 5 योजनाओं में पुनः प्रयोज्य',
      te: '✓ 5 పథకాలలో పునర్వినియోగించదగినది',
      ta: '✓ 5 திட்டங்களில் மீண்டும் பயன்படுத்தலாம்',
      mr: '✓ ५ योजनांमध्ये पुनर्वापरयोग्य',
      bn: '✓ ৫টি প্রকল্পে পুনরায় ব্যবহারযোগ্য',
      ml: '✓ 5 പദ്ധതികളിൽ ഉപയോഗിക്കാം',
      kn: '✓ 5 ಯೋಜನೆಗಳಲ್ಲಿ ಮರುಬಳಕೆ ಮಾಡಬಹುದು',
    },
    viewPdf: {
      en: 'View/PDF',
      hi: 'देखें / पीडीएफ',
      te: 'వీక్షించండి / PDF',
      ta: 'பார்வையிடு / PDF',
      mr: 'पहा / पीडीएफ',
      bn: 'দেখুন / PDF',
      ml: 'കാണുക / PDF',
      kn: 'ವೀಕ್ಷಿಸಿ / PDF',
    },
    sourceManual: {
      en: 'Manual Vault Upload',
      hi: 'मैन्युअल वॉल्ट अपलोड',
      te: 'మాన్యువల్ వాల్ట్ అప్‌లోడ్',
      ta: 'நேரடி பெட்டக பதிவேற்றம்',
      mr: 'मॅन्युअल व्हॉल्ट अपलोड',
      bn: 'ম্যানুয়াল ভল্ট আপলোড',
      ml: 'മാനുവൽ വോൾട്ട് അപ്‌ലോഡ്',
      kn: 'ಮ್ಯಾನುಯಲ್ ವಾಲ್ಟ್ ಅಪ್‌ಲೋಡ್',
    },
    sourceDigiLocker: {
      en: 'DigiLocker Import',
      hi: 'डिजिलॉकर आयात',
      te: 'డిజిలాకర్ దిగుమతి',
      ta: 'டிஜிலாக்கர் இறக்குமதி',
      mr: 'डिजिलॉकर आयात',
      bn: 'ডিজিলকার আমদানি',
      ml: 'ഡിജിലോക്കർ ഇറക്കുമതി',
      kn: 'ಡಿಜಿಲಾಕರ್ ಆಮದು',
    },
    statusVerified: {
      en: 'VERIFIED',
      hi: 'सत्यापित',
      te: 'ధృవీకరించబడింది',
      ta: 'சரிபார்க்கப்பட்டது',
      mr: 'पडताळणी पूर्ण',
      bn: 'যাচাইকৃত',
      ml: 'പരിശോധിച്ചു',
      kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    },
    modalUploadTitle: {
      en: 'Upload Document to Vault',
      hi: 'वॉल्ट में दस्तावेज़ अपलोड करें',
      te: 'వాల్ట్‌లోకి డాక్యుమెంట్ అప్‌లోడ్ చేయండి',
      ta: 'பெட்டகத்தில் ஆவணத்தை பதிவேற்றவும்',
      mr: 'व्हॉल्टमध्ये दस्तऐवज अपलोड करा',
      bn: 'ভল্টে নথি আপলোড করুন',
      ml: 'വോൾട്ടിലേക്ക് രേഖ അപ്‌ലോഡ് ചെയ്യുക',
      kn: 'ವಾಲ್ಟ್‌ಗೆ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    },
    modalCategory: {
      en: 'Document Category',
      hi: 'दस्तावेज़ श्रेणी',
      te: 'డాక్యుమెంట్ వర్గం',
      ta: 'ஆவண வகை',
      mr: 'दस्तऐवज प्रवर्ग',
      bn: 'নথি বিভাগ',
      ml: 'രേഖാ വിഭാഗം',
      kn: 'ದಾಖಲೆ ವರ್ಗ',
    },
    modalSelectFile: {
      en: 'Select File (PDF, JPG, PNG < 5MB)',
      hi: 'फ़ाइल चुनें (PDF, JPG, PNG < 5MB)',
      te: 'ఫైల్‌ను ఎంచుకోండి (PDF, JPG, PNG < 5MB)',
      ta: 'கோப்பைத் தேர்ந்தெடுக்கவும் (PDF, JPG, PNG < 5MB)',
      mr: 'फाइल निवडा (PDF, JPG, PNG < 5MB)',
      bn: 'ফাইল নির্বাচন করুন (PDF, JPG, PNG < 5MB)',
      ml: 'ഫയൽ തിരഞ്ഞെടുക്കുക (PDF, JPG, PNG < 5MB)',
      kn: 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ (PDF, JPG, PNG < 5MB)',
    },
    cancel: {
      en: 'Cancel',
      hi: 'रद्द करें',
      te: 'రద్దు చేయండి',
      ta: 'ரத்து செய்',
      mr: 'रद्द करा',
      bn: 'বাতিল করুন',
      ml: 'റദ്ദാക്കുക',
      kn: 'ರದ್ದುಮಾಡಿ',
    },
    uploadVerifyBtn: {
      en: 'Upload & Verify',
      hi: 'अपलोड और सत्यापित करें',
      te: 'అప్‌లోడ్ చేసి ధృవీకరించండి',
      ta: 'பதிவேற்றி சரிபார்க்கவும்',
      mr: 'अपलोड आणि पडताळणी करा',
      bn: 'আপলোড এবং যাচাই করুন',
      ml: 'അപ്‌ലോഡ് ചെയ്ത് പരിശോധിക്കുക',
      kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ',
    },
    uploadingBtn: {
      en: 'Uploading & Verifying...',
      hi: 'अपलोड और सत्यापन जारी है...',
      te: 'అప్‌లోడ్ చేసి ధృవీకరిస్తోంది...',
      ta: 'பதிவேற்றி சரிபார்க்கப்படுகிறது...',
      mr: 'अपलोड आणि पडताळणी सुरू आहे...',
      bn: 'আপলোড এবং যাচাই চলছে...',
      ml: 'അപ്‌ലോഡ് ചെയ്തു പരിശോധിക്കുന്നു...',
      kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    },
    digiLockerTitle: {
      en: 'DigiLocker Authorization Adapter',
      hi: 'डिजिलॉकर प्राधिकरण एडेप्टर',
      te: 'డిజిలాకర్ అధికారిక అడాప్టర్',
      ta: 'டிஜிலாக்கர் அங்கீகார அமைப்பு',
      mr: 'डिजिलॉकर अधिकृतता अडॅप्टर',
      bn: 'ডিজিলকার অনুমোদন অ্যাডাপ্টার',
      ml: 'ഡിജിലോക്കർ ഓതറൈസേഷൻ അഡാപ്റ്റർ',
      kn: 'ಡಿಜಿಲಾಕರ್ ದೃಢೀಕರಣ ಅಡಾಪ್ಟರ್',
    },
    digiLockerSubtitle: {
      en: 'Official Government DigiLocker Verification Portal (Mock Demo)',
      hi: 'आधिकारिक सरकारी डिजिलॉकर सत्यापन पोर्टल (डेमो)',
      te: 'అధికారిక ప్రభుత్వ డిజిలాకర్ ధృవీకరణ పోర్టల్ (డెమో)',
      ta: 'அதிகாரப்பூர்வ அரசு டிஜிலாக்கர் சரிபார்ப்பு போர்டல் (மாதிரி)',
      mr: 'अधिकृत शासकीय डिजिलॉकर पडताळणी पोर्टल (डेमो)',
      bn: 'অফিসিয়াল সরকারী ডিজিলকার যাচাইকরণ পোর্টাল (ডেমো)',
      ml: 'ഔദ്യോഗിക സർക്കാർ ഡിജിലോക്കർ പരിശോധനാ പോർട്ടൽ (ഡെമോ)',
      kn: 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಡಿಜಿಲಾಕರ್ ಪರಿಶೀಲನಾ ಪೋರ್ಟಲ್ (ಡೆಮೊ)',
    },
    digiLockerAuthNotice: {
      en: 'DigiLocker has authorized access for student OTR:',
      hi: 'डिजिलॉकर ने छात्र OTR के लिए पहुँच अधिकृत की है:',
      te: 'విద్యార్థి OTR కోసం డిజిలాకర్ ప్రాప్యతను ఆమోదించింది:',
      ta: 'மாணவர் OTR-க்கு டிஜிலாக்கர் அணுகல் அனுமதி வழங்கியுள்ளது:',
      mr: 'विद्यार्थी OTR साठी डिजिलॉकरने प्रवेश मंजूर केला आहे:',
      bn: 'ছাত্র OTR-এর জন্য ডিজিলকার অ্যাক্সেস অনুমোদন করেছে:',
      ml: 'വിദ്യാർത്ഥി OTR നായി ഡിജിലോക്കർ ആക്സസ് അനുവദിച്ചു:',
      kn: 'ವಿದ್ಯಾರ್ಥಿ OTR ಗಾಗಿ ಡಿಜಿಲಾಕರ್ ಪ್ರವೇಶವನ್ನು ಅಧಿಕೃತಗೊಳಿಸಿದೆ:',
    },
    digiLockerSelectDesc: {
      en: 'Select documents to import cryptographically verified certificates directly into your vault:',
      hi: 'अपने वॉल्ट में क्रिप्टोग्राफिक रूप से सत्यापित प्रमाण पत्र सीधे आयात करने के लिए दस्तावेज़ चुनें:',
      te: 'మీ వాల్ట్‌లోకి నేరుగా క్రిప్టోగ్రాఫికల్లీ ధృవీకరించబడిన పత్రాలను దిగుమతి చేసుకోవడానికి పత్రాలను ఎంచుకోండి:',
      ta: 'உங்கள் பெட்டகத்தில் சரிபார்க்கப்பட்ட சான்றிதழ்களை நேரடியாக இறக்குமதி செய்ய ஆவணங்களைத் தேர்ந்தெடுக்கவும்:',
      mr: 'तुमच्या व्हॉल्टमध्ये थेट डिजिटल स्वाक्षरी केलेले प्रमाणपत्रे आयात करण्यासाठी दस्तऐवज निवडा:',
      bn: 'সরাসরি আপনার ভল্টে ডিজিটালভাবে যাচাইকৃত সার্টিফিকেট আমদানি করতে নথি নির্বাচন করুন:',
      ml: 'നിങ്ങളുടെ വോൾട്ടിലേക്ക് നേരിട്ട് ഡിജിറ്റൽ രേഖകൾ ഇംപോർട്ട് ചെയ്യാൻ രേഖകൾ തിരഞ്ഞെടുക്കുക:',
      kn: 'ನಿಮ್ಮ ವಾಲ್ಟ್‌ಗೆ ನೇರವಾಗಿ ಡಿಜಿಟಲ್ ಪರಿಶೀಲಿಸಿದ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಆಮದು ಮಾಡಲು ದಾಖಲೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
    },
    importBtn: {
      en: 'Import to Vault',
      hi: 'वॉल्ट में आयात करें',
      te: 'వాల్ట్‌కి దిగుమతి చేయండి',
      ta: 'பெட்டகத்திற்கு இறக்குமதி செய்',
      mr: 'व्हॉल्टमध्ये आयात करा',
      bn: 'ভল্টে আমদানি করুন',
      ml: 'വോൾട്ടിലേക്ക് ഇംപോർട്ട് ചെയ്യുക',
      kn: 'ವಾಲ್ಟ್‌ಗೆ ಆಮದು ಮಾಡಿ',
    },
    importingBtn: {
      en: 'Importing...',
      hi: 'आयात जारी है...',
      te: 'దిగుమతి చేస్తోంది...',
      ta: 'இறக்குமதி செய்யப்படுகிறது...',
      mr: 'आयात करत आहे...',
      bn: 'আমদানি হচ্ছে...',
      ml: 'ഇംപോർട്ട് ചെയ്യുന്നു...',
      kn: 'ಆಮದು ಮಾಡಲಾಗುತ್ತಿದೆ...',
    },
    digiLockerNotice: {
      en: 'Notice: Documents imported via DigiLocker carry digital cryptographic signatures and are automatically classified as VERIFIED.',
      hi: 'सूचना: डिजिलॉकर के माध्यम से आयातित दस्तावेज़ डिजिटल हस्ताक्षर युक्त होते हैं और स्वचालित रूप से सत्यापित माने जाते हैं।',
      te: 'గమనిక: డిజిలాకర్ ద్వారా దిగుమతి చేయబడిన పత్రాలు డిజిటల్ సంతకాలను కలిగి ఉంటాయి మరియు స్వయంచాలకంగా ధృవీకరించబడినవిగా వర్గీకరించబడతాయి.',
      ta: 'குறிப்பு: டிஜிலாக்கர் மூலம் இறக்குமதி செய்யப்படும் ஆவணங்கள் டிஜிட்டல் கையொப்பம் கொண்டவை மற்றும் தானாகவே சரிபார்க்கப்பட்டதாக வகைப்படுத்தப்படும்.',
      mr: 'सूचना: डिजिलॉकरद्वारे आयात केलेल्या दस्तऐवजांवर डिजिटल स्वाक्षरी असते आणि ते आपोआप पडताळणी पूर्ण म्हणून वर्गीकृत केले जातात.',
      bn: 'বিজ্ঞপ্তি: ডিজিলকার মারফত আমদানি করা নথিগুলিতে ডিজিটাল স্বাক্ষর থাকে এবং স্বয়ংক্রিয়ভাবে যাচাইকৃত হিসেবে গণ্য হয়।',
      ml: 'ശ്രദ്ധിക്കുക: ഡിജിലോക്കർ വഴി ഇറക്കുമതി ചെയ്യുന്ന രേഖകൾ ഡിജിറ്റലായി ഒപ്പിട്ടവയാണ്, അവ പരിശോധിച്ചതായി കണക്കാക്കുന്നു.',
      kn: 'ಸೂಚನೆ: ಡಿಜಿಲಾಕರ್ ಮೂಲಕ ಆಮದು ಮಾಡಲಾದ ದಾಖಲೆಗಳು ಡಿಜಿಟಲ್ ಸಹಿಯನ್ನು ಹೊಂದಿರುತ್ತವೆ ಮತ್ತು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಎಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ.',
    },
  };

  const getT = (key: string): string => {
    return ui[key]?.[language] || ui[key]?.['en'] || key;
  };

  // Helper functions for dynamic data translation
  const getLocalizedDocType = (type: string, lang: Language): string => {
    const map: Record<string, Record<Language, string>> = {
      'ST Certificate': {
        en: 'ST Community Certificate',
        hi: 'अनुसूचित जनजाति (ST) प्रमाण पत्र',
        te: 'గిరిజన కుల ధ్రువీకరణ పత్రం',
        ta: 'பழங்குடியினர் சாதி சான்றிதழ்',
        mr: 'अनुसूचित जमाती जात प्रमाणपत्र',
        bn: 'উপজাতি শংসাপত্র',
        ml: 'പട്ടികവർഗ്ഗ സർട്ടിഫിക്കറ്റ്',
        kn: 'ಪರಿಶಿಷ್ಟ ಪಂಗಡ ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ',
      },
      'Income Certificate': {
        en: 'Income Certificate',
        hi: 'पारिवारिक आय प्रमाण पत्र',
        te: 'ఆదాయ ధ్రువీకరణ పత్రం',
        ta: 'குடும்ப வருமானச் சான்றிதழ்',
        mr: 'उत्पन्न प्रमाणपत्र',
        bn: 'আয় শংসাপত্র',
        ml: 'വരുമാന സർട്ടിഫിക്കറ്റ്',
        kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ',
      },
      'Bonafide Certificate': {
        en: 'College Bonafide Certificate',
        hi: 'कॉलेज बोनाफाइड प्रमाण पत्र',
        te: 'కాలేజీ బోనఫైడ్ సర్టిఫికేట్',
        ta: 'கல்லூரி உண்மைச் சான்றிதழ்',
        mr: 'महाविद्यालय बोनाफाईड प्रमाणपत्र',
        bn: 'কলেজ বোনাফাইড শংসাপত্র',
        ml: 'ബോണഫൈഡ് സർട്ടിഫിക്കറ്റ്',
        kn: 'ಕಾಲೇಜು ಬೋನಫೈಡ್ ಪ್ರಮಾಣಪತ್ರ',
      },
      'Class 10/12 Marksheet': {
        en: 'Class 10/12 Marksheet',
        hi: '10वीं/12वीं अंकतालिका',
        te: '10వ/12వ తరగతి మార్కుల జాబితా',
        ta: '10/12 ஆம் வகுப்பு மதிப்பெண் பட்டியல்',
        mr: '१०वी/१२वी गुणपत्रिका',
        bn: '১০ম/১২শ শ্রেণির মার্কশিট',
        ml: '10/12 മാർക്ക് ലിസ്റ്റ്',
        kn: '10/12 ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ',
      },
      'Bank Passbook': {
        en: 'Aadhaar Seeded Bank Passbook',
        hi: 'आधार सीडेड बैंक पासबुक',
        te: 'ఆధార్ అనుసంధాన బ్యాంక్ పాస్‌బుక్',
        ta: 'ஆதார் இணைக்கப்பட்ட வங்கி பாஸ்புக்',
        mr: 'आधार जोडणी केलेले बँक पासबुक',
        bn: 'আধার সংযুক্ত ব্যাঙ্ক পাসবই',
        ml: 'ആധാർ ലിങ്ക് ചെയ്ത ബാങ്ക് പാസ്ബുക്ക്',
        kn: 'ಆಧಾರ್ ಜೋಡಿಸಲಾದ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್',
      },
      'Fee Receipt': {
        en: 'College Fee Receipt',
        hi: 'कॉलेज शुल्क रसीद',
        te: 'కాలేజీ ఫీజు రసీదు',
        ta: 'கல்விக் கட்டண ரசீது',
        mr: 'महाविद्यालयीन शुल्क पावती',
        bn: 'কলেজ ফি রসিদ',
        ml: 'കോളേജ് ഫീസ് രസീത്',
        kn: 'ಕಾಲೇಜು ಶುಲ್ಕ ರಶೀದಿ',
      },
    };
    return map[type]?.[lang] || type;
  };

  const getLocalizedDocName = (name: string, lang: Language): string => {
    if (name.includes('Semester Academic Fee')) {
      const map: Record<Language, string> = {
        en: 'Semester Academic Fee Receipt 2026',
        hi: 'सेमेस्टर शैक्षणिक शुल्क रसीद 2026',
        te: 'సెమిస్టర్ విద్యా ఫీజు రసీదు 2026',
        ta: 'செமஸ்டர் கல்விக் கட்டண ரசீது 2026',
        mr: 'सत्र शैक्षणिक शुल्क पावती २०२६',
        bn: 'সেমিস্টার একাডেমিক ফি রসিদ ২০২৬',
        ml: 'സെമസ്റ്റർ അക്കാദമിക് ഫീസ് രസീത് 2026',
        kn: 'ಸೆಮಿಸ್ಟರ್ ಶೈಕ್ಷಣಿಕ ಶುಲ್ಕ ರಶೀದಿ 2026',
      };
      return map[lang] || name;
    }
    if (name.includes('Bonafide Student Proof') || name.includes('Bonafide')) {
      const map: Record<Language, string> = {
        en: 'College Bonafide Student Proof',
        hi: 'कॉलेज वास्तविक छात्र प्रमाण (Bonafide)',
        te: 'కాలేజీ బోనఫైడ్ విద్యార్థి ధ్రువీకరణ',
        ta: 'கல்லூரி உண்மை மாணவர் சான்று (Bonafide)',
        mr: 'महाविद्यालय बोनाफाईड विद्यार्थी पुरावा',
        bn: 'কলেজ বোনাফাইড ছাত্র প্রমাণপত্র',
        ml: 'കോളേജ് ബോണഫൈഡ് വിദ്യാർത്ഥി രേഖ',
        kn: 'ಕಾಲೇಜು ಬೋನಫೈಡ್ ವಿದ್ಯಾರ್ಥಿ ಪುರಾವೆ',
      };
      return map[lang] || name;
    }
    if (name.includes('Annual Family Income') || name.includes('Income Certificate')) {
      const map: Record<Language, string> = {
        en: 'Annual Family Income Certificate 2026-27',
        hi: 'वार्षिक पारिवारिक आय प्रमाण पत्र 2026-27',
        te: 'వార్షిక కుటుంబ ఆదాయ ధ్రువీకరణ పత్రం 2026-27',
        ta: 'குடும்ப ஆண்டு வருமானச் சான்றிதழ் 2026-27',
        mr: 'वार्षिक कौटुंबिक उत्पन्न प्रमाणपत्र २०२६-२७',
        bn: 'বার্ষিক পারিবারিক আয় শংসাপত্র ২০২৬-২৭',
        ml: 'വാർഷിക കുടുംബ വരുമാന സർട്ടിഫിക്കറ്റ് 2026-27',
        kn: 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ 2026-27',
      };
      return map[lang] || name;
    }
    if (name.includes('Bank Account Front Page') || name.includes('Passbook')) {
      const map: Record<Language, string> = {
        en: 'Aadhaar Seeded Bank Account Front Page',
        hi: 'आधार सीडेड बैंक खाता प्रथम पृष्ठ',
        te: 'ఆధార్ అనుసంధాన బ్యాంక్ ఖాతా మొదటి పేజీ',
        ta: 'ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு முதல் பக்கம்',
        mr: 'आधार जोडणी केलेले बँक खाते प्रथम पृष्ठ',
        bn: 'আধার সংযুক্ত ব্যাঙ্ক অ্যাকাউন্টের প্রথম পৃষ্ঠা',
        ml: 'ആധാർ ലിങ്ക് ചെയ്ത ബാങ്ക് അക്കൗണ്ട് മുൻപേജ്',
        kn: 'ಆಧಾರ್ ಜೋಡಿಸಲಾದ ಬ್ಯಾಂಕ್ ಖಾತೆಯ ಮೊದಲ ಪುಟ',
      };
      return map[lang] || name;
    }
    if (name.includes('SSLC') || name.includes('Marksheet')) {
      const map: Record<Language, string> = {
        en: 'SSLC & Higher Secondary Marksheet',
        hi: 'एसएसएलसी एवं उच्च माध्यमिक अंकतालिका',
        te: 'SSLC & హయ్యర్ సెకండరీ మార్కుల జాబితా',
        ta: 'எஸ்எஸ்எல்சி மற்றும் மேல்நிலைப் பள்ளி மதிப்பெண் பட்டியல்',
        mr: 'एसएसएलसी आणि उच्च माध्यमिक गुणपत्रिका',
        bn: 'এসএসএলসি এবং উচ্চ মাধ্যমিক মার্কশিট',
        ml: 'എസ്എസ്എൽസി & ഹയർ സെക്കൻഡറി മാർക്ക് ലിസ്റ്റ്',
        kn: 'ಎಸ್‌ಎಸ್‌ಎಲ್‌ಸಿ ಮತ್ತು ಹೈಯರ್ ಸೆಕೆಂಡರಿ ಅಂಕಪಟ್ಟಿ',
      };
      return map[lang] || name;
    }
    if (name.includes('Tribal Community Certificate') || name.includes('ST Certificate') || name.includes('Community')) {
      const map: Record<Language, string> = {
        en: 'Tribal Community Certificate',
        hi: 'जनजातीय समुदाय (ST) प्रमाण पत्र',
        te: 'గిరిజన కుల ధ్రువీకరణ పత్రం',
        ta: 'பழங்குடியினர் சாதி சான்றிதழ்',
        mr: 'आदिवासी समुदाय जात प्रमाणपत्र',
        bn: 'উপজাতি সম্প্রদায় শংসাপত্র',
        ml: 'പട്ടികവർഗ്ഗ കമ്മ്യൂണിറ്റി സർട്ടിഫിക്കറ്റ്',
        kn: 'ಬುಡಕಟ್ಟು ಸಮುದಾಯ ಪ್ರಮಾಣಪತ್ರ',
      };
      return map[lang] || name;
    }
    return name;
  };

  const getLocalizedVerifiedBy = (verifier: string, lang: Language): string => {
    if (!verifier) return verifier;
    if (verifier.includes('Revenue Department')) {
      const map: Record<Language, string> = {
        en: 'Revenue Department - Govt of Tamil Nadu',
        hi: 'राजस्व विभाग - तमिलनाडु सरकार',
        te: 'రెవెన్యూ శాఖ - తమిళనాడు ప్రభుత్వం',
        ta: 'வருவாய்த்துறை - தமிழ்நாடு அரசு',
        mr: 'महसूल विभाग - तामिळनाडू शासन',
        bn: 'রাজস্ব বিভাগ - তামিলনাড়ু সরকার',
        ml: 'റവന്യൂ വകുപ്പ് - തമിഴ്നാട് സർക്കാർ',
        kn: 'ಕಂದಾಯ ಇಲಾಖೆ - ತಮಿಳುನಾಡು ಸರ್ಕಾರ',
      };
      return map[lang] || verifier;
    }
    if (verifier.includes('e-District')) {
      const map: Record<Language, string> = {
        en: 'e-District Portal - TN',
        hi: 'ई-डिस्ट्रिक्ट पोर्टल - तमिलनाडु',
        te: 'ఈ-డిస్ట్రిక్ట్ పోర్టల్ - తమిళనాడు',
        ta: 'இ-டிஸ்ட்ரிக்ட் போர்டல் - தமிழ்நாடு',
        mr: 'ई-डिस्ट्रिक्ट पोर्टल - तामिळनाडू',
        bn: 'ই-ডিস্ট্রিক্ট পোর্টাল - তামিলনাড়ু',
        ml: 'ഇ-ഡിസ്ട്രിക്റ്റ് പോർട്ടൽ - ടിഎൻ',
        kn: 'ಇ-ಡಿಸ್ಟ್ರಿಕ್ಟ್ ಪೋರ್ಟಲ್ - ತಮಿಳುನಾಡು',
      };
      return map[lang] || verifier;
    }
    if (verifier.includes('Principal') || verifier.includes('College')) {
      const map: Record<Language, string> = {
        en: 'Principal, Govt Arts & Engg College',
        hi: 'प्राचार्य, शासकीय कला एवं इंजीनियरिंग कॉलेज',
        te: 'ప్రిన్సిపాల్, ప్రభుత్వ ఆర్ట్స్ & ఇంజనీరింగ్ కళాశాల',
        ta: 'முதல்வர், அரசு கலை மற்றும் பொறியியல் கல்லூரி',
        mr: 'प्राचार्य, शासकीय कला व अभियांत्रिकी महाविद्यालय',
        bn: 'অধ্যক্ষ, সরকারি আর্টস ও ইঞ্জিনিয়ারিং কলেজ',
        ml: 'പ്രിൻസിപ്പൽ, ഗവ. ആർട്സ് & എഞ്ചിനീയറിംഗ് കോളേജ്',
        kn: 'ಪ್ರಾಂಶುಪಾಲರು, ಸರ್ಕಾರಿ ಕಲಾ ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್ ಕಾಲೇಜು',
      };
      return map[lang] || verifier;
    }
    if (verifier.includes('Board of Higher Secondary Education')) {
      const map: Record<Language, string> = {
        en: 'Tamil Nadu Board of Higher Secondary Education',
        hi: 'तमिलनाडु उच्च माध्यमिक शिक्षा बोर्ड',
        te: 'తమిళనాడు హయ్యర్ సెకండరీ ఎడ్యుకేషన్ బోర్డ్',
        ta: 'தமிழ்நாடு மேல்நிலைக் கல்வி வாரியம்',
        mr: 'तामिळनाडू उच्च माध्यमिक शिक्षण मंडळ',
        bn: 'তামিলনাড়ু উচ্চ মাধ্যমিক শিক্ষা বোর্ড',
        ml: 'തമിഴ്നാട് ഹയർ സെക്കൻഡറി വിദ്യാഭ്യാസ ബോർഡ്',
        kn: 'ತಮಿಳುನಾಡು ಹೈಯರ್ ಸೆಕೆಂಡರಿ ಶಿಕ್ಷಣ ಮಂಡಳಿ',
      };
      return map[lang] || verifier;
    }
    if (verifier.includes('State Bank of India')) {
      const map: Record<Language, string> = {
        en: 'State Bank of India - Yercaud Branch',
        hi: 'भारतीय स्टेट बैंक - येरकौड शाखा',
        te: 'స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా - యెర్కాడ్ బ్రాంచ్',
        ta: 'பாரத ஸ்டேட் வங்கி - ஏற்காடு கிளை',
        mr: 'स्टेट बँक ऑफ इंडिया - येरकॉड शाखा',
        bn: 'স্টেট ব্যাঙ্ক অফ ইন্ডিয়া - ইয়ারকাড শাখা',
        ml: 'സ്റ്റേറ്റ് ബാങ്ക് ഓഫ് ഇന്ത്യ - യേർക്കാട് ശാഖ',
        kn: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ - ಯೆರ್ಕಾಡ್ ಶಾಖೆ',
      };
      return map[lang] || verifier;
    }
    if (verifier.includes('Accounts Dept')) {
      const map: Record<Language, string> = {
        en: 'Accounts Dept - Salem Engg College',
        hi: 'लेखा विभाग - सलेम इंजीनियरिंग कॉलेज',
        te: 'అకౌంట్స్ విభాగం - సేలం ఇంజనీరింగ్ కాలేజీ',
        ta: 'கணக்கு பிரிவு - சேலம் பொறியியல் கல்லூரி',
        mr: 'लेखा विभाग - सालेम अभियांत्रिकी महाविद्यालय',
        bn: 'হিসাব বিভাগ - সালেম ইঞ্জিনিয়ারিং কলেজ',
        ml: 'അക്കൗണ്ട്സ് വിഭാഗം - സേലം എഞ്ചിനീയറിംഗ് കോളേജ്',
        kn: 'ಖಾತೆಗಳ ವಿಭಾಗ - ಸೇಲಂ ಎಂಜಿನಿಯರಿಂಗ್ ಕಾಲೇಜು',
      };
      return map[lang] || verifier;
    }
    if (verifier.includes('Unified System')) {
      const map: Record<Language, string> = {
        en: 'Unified System Verification Engine',
        hi: 'एकीकृत प्रणाली सत्यापन इंजन',
        te: 'ఏకీకృత వ్యవస్థ ధృవీకరణ ఇంజిన్',
        ta: 'ஒருங்கிணைந்த கணினி சரிபார்ப்பு இயந்திரம்',
        mr: 'एकीकृत प्रणाली पडताळणी इंजिन',
        bn: 'সমন্বিত সিস্টেম যাচাইকরণ ইঞ্জিন',
        ml: 'ഏകീകൃത സിസ്റ്റം വെരിഫിക്കേഷൻ എഞ്ചിൻ',
        kn: 'ಏಕೀಕೃತ ವ್ಯವಸ್ಥೆ ಪರಿಶೀಲನಾ ಎಂಜಿನ್',
      };
      return map[lang] || verifier;
    }
    return verifier;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Title Header */}
        <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {getT('cryptoSecured')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">{getT('vaultTitle')}</h2>
            <p className="text-xs text-orange-200 mt-1">
              {getT('vaultSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-accent text-xs px-4 py-2.5 font-bold shadow-md flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> {getT('uploadDoc')}
            </button>

            <button
              onClick={openDigiLockerModal}
              className="bg-white hover:bg-gray-100 text-[#006699] text-xs px-4 py-2.5 rounded-md font-bold shadow-md flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" /> {getT('fetchDigiLocker')}
            </button>
          </div>
        </div>

        {/* Reusability Banner */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#8B4513] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-sm font-bold text-[#8B4513]">{getT('reuseTitle')}</strong>
            <p className="mt-0.5 leading-relaxed">
              {getT('reuseDesc')}
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8B4513] mb-2" />
            {getT('loadingVault')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                      {getLocalizedDocType(doc.doc_type, language)}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-300">
                      ✓ {getT('statusVerified')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">
                    {getLocalizedDocName(doc.doc_name, language)}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{doc.file_name}</p>

                  <div className="bg-gray-50 p-3 rounded-lg text-[11px] space-y-1 text-gray-600 border border-gray-100">
                    <p><strong>{getT('verifiedBy')}</strong> {getLocalizedVerifiedBy(doc.verified_by, language)}</p>
                    <p><strong>{getT('source')}</strong> {doc.digilocker_imported ? getT('sourceDigiLocker') : getT('sourceManual')}</p>
                    <p><strong>{getT('uploaded')}</strong> {doc.uploaded_at.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                  <span className="text-[#006699] font-bold flex items-center gap-1">
                    {getT('reusableBadge')}
                  </span>
                  <a href={doc.file_url} download className="text-gray-600 hover:text-[#8B4513] font-semibold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> {getT('viewPdf')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#8B4513]">{getT('modalUploadTitle')}</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">{getT('modalCategory')}</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium"
                >
                  <option value="Bonafide Certificate">{getLocalizedDocType('Bonafide Certificate', language)}</option>
                  <option value="ST Certificate">{getLocalizedDocType('ST Certificate', language)}</option>
                  <option value="Income Certificate">{getLocalizedDocType('Income Certificate', language)}</option>
                  <option value="Class 10/12 Marksheet">{getLocalizedDocType('Class 10/12 Marksheet', language)}</option>
                  <option value="Fee Receipt">{getLocalizedDocType('Fee Receipt', language)}</option>
                  <option value="Bank Passbook">{getLocalizedDocType('Bank Passbook', language)}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">{getT('modalSelectFile')}</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setUploadModalOpen(false)} className="btn-outline text-xs px-4 py-2 font-semibold">
                  {getT('cancel')}
                </button>
                <button type="submit" disabled={uploading} className="btn-primary text-xs px-6 py-2 font-bold shadow-md">
                  {uploading ? getT('uploadingBtn') : getT('uploadVerifyBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGILOCKER MOCK AUTHORIZATION MODAL */}
      {digiLockerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-bold text-base text-[#006699]">{getT('digiLockerTitle')}</h3>
                  <p className="text-[10px] text-gray-500">{getT('digiLockerSubtitle')}</p>
                </div>
              </div>
              <button onClick={() => setDigiLockerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              {getT('digiLockerAuthNotice')} <strong className="font-mono text-[#8B4513]">{user?.otrId || 'OTR2026001234'}</strong>. {getT('digiLockerSelectDesc')}
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {availableDigiDocs.map((doc, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex justify-between items-center gap-3">
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {getLocalizedDocType(doc.docType, language)}
                    </span>
                    <h4 className="font-bold text-gray-900 mt-1">{getLocalizedDocName(doc.name, language)}</h4>
                    <p className="text-[10px] text-gray-500">{getT('verifiedBy')} {getLocalizedVerifiedBy(doc.issuer, language)}</p>
                  </div>

                  <button
                    onClick={() => handleImportDigiLocker(doc)}
                    disabled={importingUri === doc.uri}
                    className="btn-primary text-xs px-3 py-1.5 font-bold whitespace-nowrap"
                  >
                    {importingUri === doc.uri ? getT('importingBtn') : getT('importBtn')}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded text-[11px] text-blue-900 border border-blue-200 leading-relaxed">
              {getT('digiLockerNotice')}
            </div>
          </div>
        </div>
      )}

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
