import bcrypt from 'bcryptjs';
import db, { initDb } from '../db/database';

export function seedDatabase() {
  initDb();

  console.log('Seeding database with rich, realistic Indian tribal scholarship demo data...');

  // Clear tables
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM grievances;
    DELETE FROM payments;
    DELETE FROM application_documents;
    DELETE FROM documents;
    DELETE FROM application_timeline;
    DELETE FROM applications;
    DELETE FROM scholarships;
    DELETE FROM students;
    DELETE FROM users;
    DELETE FROM announcements;
  `);

  const studentPasswordHash = bcrypt.hashSync('Student@123', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  // 1. Create Users (Student + Admin + Additional Students)
  const studentUserStmt = db.prepare(`
    INSERT INTO users (id, email, mobile, password_hash, role, otr_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  studentUserStmt.run('usr_student_1', 'aarav.kumar@demo.tribalscholar.in', '9876543210', studentPasswordHash, 'student', 'OTR2026001234');
  studentUserStmt.run('usr_student_2', 'sunita.marandi@student.demo', '9876543211', studentPasswordHash, 'student', 'OTR2026005678');
  studentUserStmt.run('usr_student_3', 'rahul.munda@student.demo', '9876543212', studentPasswordHash, 'student', 'OTR2026009988');
  studentUserStmt.run('usr_student_4', 'ananya.naik@student.demo', '9876543213', studentPasswordHash, 'student', 'OTR2026003344');
  studentUserStmt.run('usr_student_5', 'birsa.gond@student.demo', '9876543214', studentPasswordHash, 'student', 'OTR2026007711');
  studentUserStmt.run('usr_admin_1', 'admin@tribalscholar.demo', '9900112233', adminPasswordHash, 'admin', null);

  // 2. Create Student Profiles
  const studentStmt = db.prepare(`
    INSERT INTO students (
      id, user_id, otr_id, full_name, dob, gender, state, district, pincode, address,
      category, st_certificate_no, pvtg_status, pvtg_group_name, annual_income,
      father_name, mother_name, academic_level, current_course, institution_name,
      institution_code, disability_status, bank_account_no, ifsc_code, bank_name, aadhaar_masked
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  studentStmt.run(
    'std_1', 'usr_student_1', 'OTR2026001234', 'Aarav Kumar', '2004-05-14', 'Male', 'Tamil Nadu', 'Salem', '636001',
    'Door 45, Tribal Welfare Colony, Yercaud Road, Salem', 'ST (Scheduled Tribe)', 'ST/TN/2023/88912', 0, null, 185000,
    'Kannan Kumar', 'Lakshmi Kumar', 'Post-Matric', 'B.Sc Computer Science (2nd Year)', 'Government Arts College, Salem',
    'AISHE-C-23491', 0, '9182736450192', 'SBIN0004521', 'State Bank of India', 'XXXX-XXXX-8912'
  );

  studentStmt.run(
    'std_2', 'usr_student_2', 'OTR2026005678', 'Sunita Marandi', '2005-08-22', 'Female', 'Jharkhand', 'Ranchi', '834001',
    'Village Birsa Nagar, Block Namkum, Ranchi', 'ST (Scheduled Tribe)', 'ST/JH/2022/44120', 1, 'Birhor (PVTG)', 120000,
    'Soma Marandi', 'Maino Marandi', 'Pre-Matric', 'Class X', 'Govt High School Namkum',
    'UDISE-20019283', 0, '5512093847123', 'CNRB0001092', 'Canara Bank', 'XXXX-XXXX-4410'
  );

  studentStmt.run(
    'std_3', 'usr_student_3', 'OTR2026009988', 'Rahul Munda', '2001-11-03', 'Male', 'Odisha', 'Mayurbhanj', '757001',
    'Ward 12, Baripada Tribal Hostel Road, Mayurbhanj', 'ST (Scheduled Tribe)', 'ST/OR/2021/90123', 0, null, 210000,
    'Birsa Munda', 'Sumi Munda', 'Higher Fellowship', 'Ph.D. Environmental Science', 'Utkal University, Bhubaneswar',
    'AISHE-U-0355', 0, '7712039485129', 'IOBA0001289', 'Indian Overseas Bank', 'XXXX-XXXX-9012'
  );

  studentStmt.run(
    'std_4', 'usr_student_4', 'OTR2026003344', 'Ananya Naik', '2003-02-18', 'Female', 'Madhya Pradesh', 'Mandla', '481661',
    'Tribal Colony Ward 4, Mandla', 'ST (Scheduled Tribe)', 'ST/MP/2023/11029', 1, 'Baiga (PVTG)', 150000,
    'Ramesh Naik', 'Sita Naik', 'Top Class', 'B.Tech Electrical Engineering', 'Indian Institute of Technology (IIT) Indore',
    'AISHE-U-0012', 0, '8890128394012', 'PUNB0002341', 'Punjab National Bank', 'XXXX-XXXX-3344'
  );

  studentStmt.run(
    'std_5', 'usr_student_5', 'OTR2026007711', 'Birsa Gond', '2002-09-12', 'Male', 'Chhattisgarh', 'Bastar', '494001',
    'Jagdalpur Tribal Hostel, Bastar', 'ST (Scheduled Tribe)', 'ST/CG/2022/99012', 0, null, 195000,
    'Sukhram Gond', 'Rukmani Gond', 'National Overseas', 'M.Sc. Renewable Energy', 'University of Edinburgh, UK',
    'NOS-QS-0042', 0, '6671029384712', 'HDFC0000123', 'HDFC Bank', 'XXXX-XXXX-7711'
  );

  // 3. Seed Scholarships (10 Schemes Across All Categories)
  const schemeStmt = db.prepare(`
    INSERT INTO scholarships (
      id, code, name_en, name_hi, name_te, name_ta, name_mr, name_bn, name_kn,
      academic_level, income_limit, st_only, pvtg_priority, deadline, max_amount,
      description_en, description_hi, benefits, required_docs, guidelines, faq_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Scheme 1: Pre-Matric
  schemeStmt.run(
    'sch_1', 'PRE-MATRIC-ST',
    'Pre Matric Scholarship Scheme for ST Students',
    'अनुसूचित जनजाति छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति योजना',
    'ST విద్యార్థుల కోసం ప్రీ-మెట్రిక్ స్కాలర్‌షిప్ పథకం',
    'பழங்குடியின மாணவர்களுக்கான மெட்ரிக்கிற்கு முந்தைய உதவித்தொகைத் திட்டம்',
    'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी प्री-मॅट्रिक शिष्यवृत्ती योजना',
    'এসটি শিক্ষার্থীদের জন্য প্রাক-ম্যাট্রিক স্কলারশিপ প্রকল্প',
    'ST ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪ್ರಿ-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ ಯೋಜನೆ',
    'Pre-Matric', 250000, 1, 1, '2026-11-30', 7000,
    'This is a Centrally Sponsored Scheme implemented through States/UTs who are responsible for inviting applications from students online through State Portal or National Scholarship Portal, checking eligibility verification and disbursement of scholarship to eligible ST students directly to their bank accounts through DBT. https://dbttribal.gov.in/',
    'कक्षा IX और X में पढ़ने वाले एसटी छात्रों के लिए प्रत्यक्ष लाभ हस्तांतरण (DBT) के माध्यम से राज्य पोर्टल और राष्ट्रीय छात्रवृत्ति पोर्टल पर सहायता।',
    'Applicable for Classes IX-X. Parental income limit ≤ ₹2.50 Lakhs/yr. Day Scholars: ₹225/month | Hostellers: ₹525/month (for 10 months). Fund sharing ratio: 75:25 (Centre:State) & 90:10 for NE/Special Category States.',
    '["Aadhaar Card", "ST Community Certificate", "Income Certificate (<= Rs 2.50 Lakhs)", "School Bonafide Certificate", "Bank Passbook (Aadhaar Seeded)"]',
    '• Applicable to ST students studying in Classes IX - X.\n• Parental income from all sources should not exceed Rs. 2.50 lakhs per annum.\n• Scholarships are paid @ Rs. 225/- per month for Day Scholars and @ Rs. 525/- per month for Hostellers for a period of 10 months in a year.\n• Fund sharing ratio: 75:25 between Centre & State, 90:10 for NE/Special Category States/UTs.',
    JSON.stringify([
      { q: 'What is the parental income ceiling for Pre-Matric ST?', a: 'Parental income from all sources should not exceed Rs. 2.50 lakhs per annum.' },
      { q: 'What is the stipend rate for hostellers vs day scholars?', a: 'Scholarships are paid @ Rs. 225/- per month for Day Scholars and @ Rs. 525/- per month for Hostellers for 10 months in a year.' },
      { q: 'What is the Centre:State funding sharing ratio?', a: 'Funds are shared at 75:25 between Centre and State/UTs, and 90:10 for North Eastern & Special Category States/UTs.' }
    ])
  );

  // Scheme 2: Post-Matric
  schemeStmt.run(
    'sch_2', 'POST-MATRIC-ST',
    'Post-Matric Scholarship for ST Students (PMS-ST)',
    'अनुसूचित जनजाति के छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
    'ST విద్యార్థుల కోసం పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (PMS-ST)',
    'பழங்குடியின மாணவர்களுக்கான மெட்ரிக்கிற்கு பிந்தைய உதவித்தொகை',
    'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी पोस्ट-मॅट्रिक शिष्यवृत्ती',
    'এসটি শিক্ষার্থীদের জন্য পোস্ট-ম্যাট্রিক স্কলারশিপ',
    'ST ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ',
    'Post-Matric', 250000, 1, 1, '2026-12-31', 25000,
    'Covers complete maintenance allowance, compulsory non-refundable fees, and study tour allowances for ST students pursuing Class XI up to Post-Graduation. https://dbttribal.gov.in/',
    'कक्षा 11वीं से स्नातकोत्तर तक की पढ़ाई करने वाले एसटी छात्रों के लिए रखरखाव भत्ता और शिक्षण शुल्क कवर करता है।',
    'Full compulsory tuition fee reimbursement up to ₹25,000 per annum + monthly maintenance allowance of ₹1,200/month.',
    '["Aadhaar Card", "ST Community Certificate", "Income Certificate (<= Rs 2.50 Lakhs)", "Class 10/12 Marksheet", "College Bonafide Certificate", "Fee Receipt", "Aadhaar-Seeded Bank Passbook"]',
    'Must be admitted in a post-matric course in an AISHE/UDISE accredited college, university or polytechnic.',
    JSON.stringify([
      { q: 'Can distance education students apply?', a: 'Yes, distance learning ST students are covered under category-specific rates.' },
      { q: 'Is PVTG priority applicable?', a: 'Yes, PVTG applicants receive expedited verification and top priority sanctioning.' }
    ])
  );

  // Scheme 3: Top Class
  schemeStmt.run(
    'sch_3', 'TOP-CLASS-ST',
    'National Scholarship Scheme (Top Class) For Higher Education of ST Students',
    'अनुसूचित जनजाति के छात्रों के लिए टॉप क्लास शिक्षा योजना',
    'ST విద్యార్థుల కోసం టాప్ క్లాస్ ఎడ్యుకేషన్ పథకం',
    'பழங்குடியின மாணவர்களுக்கான உயர்தரக் கல்வித் திட்டம்',
    'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी टॉप क्लास शिक्षण योजना',
    'এসটি শিক্ষার্থীদের জন্য টপ ক্লাস শিক্ষা প্রকল্প',
    'ST ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಟಾಪ್ ಕ್ಲಾಸ್ ಶಿಕ್ಷಣ ಯೋಜನೆ',
    'Top Class', 600000, 1, 1, '2026-11-15', 200000,
    'This is a Central Sector Scheme fully funded and implemented by Central Govt. Scholarship is given to all eligible ST students for pursuing higher studies in prescribed courses in any of the 265 Premier Institutes of Country like IITs, AIIMS, IIMs, NITs, etc. identified by the Ministry. https://scholarships.gov.in',
    'आईआईटी, एनआईटी, आईआईएम और एम्स जैसे देश के 265 प्रमुख संस्थानों में प्रवेश पाने वाले एसटी छात्रों के लिए पूर्ण वित्तीय सहायता।',
    'Scholarship includes 100% tuition fees, admission fees, Non-Refundable Fees, living stipend allowance, and computer allowance.',
    '["Aadhaar Card", "ST Community Certificate", "Income Certificate (<= Rs 6.00 Lakhs)", "Premier Institute Admission Offer Letter", "Fee Receipt", "Bank Details"]',
    '• Scholarship is given to all eligible fresh students.\n• The Scholarship is given for entire duration of the course pursued by the student.\n• Family income from all sources should not exceed Rs. 6.00 lakhs per annum.\n• Scholarship amount includes tuition fees, admission fees, Non-Refundable Fees, stipend and allowances for books and computer.',
    JSON.stringify([
      { q: 'What is the annual family income cap for Top Class ST?', a: 'Family income from all sources should not exceed Rs. 6.00 lakhs per annum.' },
      { q: 'Which institutes are eligible under Top Class?', a: 'ST students pursuing higher studies in prescribed courses in any of the 265 Premier Institutes of the country identified by the Ministry (IITs, AIIMS, IIMs, NITs, etc.).' },
      { q: 'Does it cover laptops and books?', a: 'Yes, scholarship amount includes tuition fees, admission fees, stipend and allowances for books and computer.' }
    ])
  );

  // Scheme 4: NFST (Higher Fellowship)
  schemeStmt.run(
    'sch_4', 'NFST-FELLOWSHIP',
    'National Fellowship for ST Students (NFST)',
    'अनुसूचित जनजाति छात्रों के लिए राष्ट्रीय फेलोशिप योजना',
    'ST విద్యార్థుల కోసం నేషనల్ ఫెలోషిప్ (NFST)',
    'பழங்குடியின மாணவர்களுக்கான தேசிய ஆராய்ச்சி உதவித்தொகை',
    'अनुसूचित जमातींच्या विद्यार्थ्यांसाठी राष्ट्रीय फेलोशिप',
    'এসটি শিক্ষার্থীদের জন্য জাতীয় ফেলোশিপ (NFST)',
    'ST ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ರಾಷ್ಟ್ರೀಯ ಫೆಲೋಶಿಪ್ (NFST)',
    'Higher Fellowship', 800000, 1, 1, '2026-10-31', 420000,
    'Fellowships for ST scholars pursuing regular M.Phil and Ph.D. degrees in Science, Humanities, Engineering, and Social Sciences.',
    'विज्ञान, मानविकी और इंजीनियरिंग में एम.फिल और पीएचडी करने वाले एसटी शोधार्थियों के लिए वित्तीय सहायता।',
    'JRF Fellowship ₹37,000/month for initial 2 years; SRF Fellowship ₹42,000/month + annual contingency grant of ₹25,000.',
    '["Aadhaar Card", "ST Certificate", "Master Degree Certificate", "UGC-NET / JRF Scorecard", "Ph.D Registration Letter", "Research Synopsis"]',
    'Candidate must be registered for M.Phil / Ph.D in a UGC recognized university or research institution.',
    JSON.stringify([
      { q: 'How many fellowships are awarded annually?', a: '750 slots are reserved annually for ST research scholars.' }
    ])
  );

  // Scheme 5: NOS (National Overseas)
  schemeStmt.run(
    'sch_5', 'NOS-OVERSEAS',
    'National Overseas Scholarship for ST Candidates (NOS)',
    'अनुसूचित जनजाति के उम्मीदवारों के लिए राष्ट्रीय प्रवासी छात्रवृत्ति',
    'ST అభ్యర్థుల కోసం నేషనల్ ఓవర్సీస్ స్కాలర్‌షిప్ (NOS)',
    'பழங்குடியினருக்கான தேசிய வெளிநாட்டு உதவித்தொகை',
    'अनुसूचित जमाती उमेदवारांसाठी नॅशनल ओव्हरसीज शिष्यवृत्ती',
    'এসটি প্রার্থীদের জন্য জাতীয় ওভারসিজ স্কলারশিপ (NOS)',
    'ST ಅಭ್ಯರ್ಥಿಗಳಿಗೆ ರಾಷ್ಟ್ರೀಯ ವಿದೇಶಿ ವಿದ್ಯಾರ್ಥಿವೇತನ (NOS)',
    'National Overseas', 600000, 1, 1, '2026-12-15', 2500000,
    'Financial assistance to ST students for pursuing Higher Studies abroad (Master Degree, Ph.D.) in top 500 QS ranked international universities.',
    'शीर्ष 500 अंतरराष्ट्रीय विश्वविद्यालयों में उच्च अध्ययन (मास्टर्स और पीएचडी) के लिए एसटी छात्रों को सहायता।',
    'Full annual tuition fee paid directly to foreign university + US$ 15,400 annual living allowance + airfare + health insurance.',
    '["Aadhaar Card", "ST Certificate", "Valid Indian Passport", "Unconditional Admission Offer Letter from Foreign University", "QS World Ranking Proof", "Income Certificate"]',
    'Minimum 55% marks in qualifying degree. Age must be below 35 years as of 1st July of election year.',
    JSON.stringify([
      { q: 'Which countries are covered?', a: 'All countries housing universities in the top 500 QS World University Rankings.' }
    ])
  );

  // Additional Scheme 6: State Tribal Pre-Matric Allowance
  schemeStmt.run(
    'sch_6', 'STATE-ST-PRE',
    'State Tribal Welfare Secondary Grant Scheme',
    'राज्य जनजातीय कल्याण माध्यमिक अनुदान योजना',
    'రాష్ట్ర గిరిజన సంక్షేమ సెకండరీ గ్రాంట్ పథకం',
    'மாநில பழங்குடியினர் நல இரண்டாம் நிலை நிதியுதவி',
    'राज्य आदिवासी कल्याण माध्यमिक अनुदान योजना',
    'রাজ্য উপজাতীয় কল্যাণ সেকেন্ডারি গ্রান্ট প্রকল্প',
    'ರಾಜ್ಯ ಬುಡಕಟ್ಟು ಕಲ್ಯಾಣ ಸೆಕೆಂಡರಿ ಗ್ರಾಂಟ್ ಯೋಜನೆ',
    'Pre-Matric', 200000, 1, 1, '2026-11-20', 5000,
    'Special state supplementary stipend for tribal students studying in tribal welfare residential ashram schools.',
    'जनजातीय कल्याण आवासीय आश्रम शालाओं में पढ़ने वाले आदिवासी छात्रों के लिए विशेष राज्य पूरक वजीफा।',
    'Monthly book and uniform allowance of ₹500/month + annual sports kit.',
    '["Aadhaar Card", "ST Certificate", "Ashram School Admission Proof"]',
    'Enrolled in State Ashram School or Eklavya Model Residential School (EMRS).',
    JSON.stringify([{ q: 'Is it stackable with Central Pre-Matric?', a: 'Yes, this is an additional state welfare top-up grant.' }])
  );

  // Additional Scheme 7: EMRS Tribal Merit Scholarship
  schemeStmt.run(
    'sch_7', 'EMRS-MERIT',
    'Eklavya Model Residential School Excellence Grant',
    'एकलव्य मॉडल आवासीय विद्यालय उत्कृष्टता अनुदान',
    'ఏకలవ్య మోడల్ రెసిడెన్షియల్ స్కూల్ ఎక్సలెన్స్ గ్రాంట్',
    'ஏகலவ்யா மாதிரி குடியிருப்பு பள்ளி சிறப்பு உதவித்தொகை',
    'एकलव्य मॉडेल निवासी शाळा गुणवत्ता शिष्यवृत्ती',
    'এককলাব্য মডেল রেসিডেন্সিয়াল স্কুল মেধা স্কলারশিপ',
    'ಏಕಲವ್ಯ ಮಾದರಿ ವಸತಿ ಶಾಲೆ ಪ್ರಶಸ್ತಿ ಯೋಜನೆ',
    'Pre-Matric', 250000, 1, 1, '2026-12-05', 8500,
    'Merit scholarship for high-performing ST students studying in Ekalavya Model Residential Schools (EMRS).',
    'एकलव्य मॉडल आवासीय विद्यालयों (ईएमआरएस) में उत्कृष्ट प्रदर्शन करने वाले एसटी छात्रों के लिए मेधा छात्रवृत्ति।',
    '₹8,500/year merit award + laptop allowance for top 10 percentile rankers.',
    '["Aadhaar Card", "EMRS Student ID", "Class 8/9 Report Card"]',
    'Must secure 75% or above in previous academic term evaluation in EMRS school.',
    JSON.stringify([{ q: 'Who awards this?', a: 'National Education Society for Tribal Students (NESTS).' }])
  );

  // Additional Scheme 8: Tribal Higher Research Doctoral Grant
  schemeStmt.run(
    'sch_8', 'MOTA-DOCTORAL',
    'MoTA Advanced Doctoral Fellowship in Tribal Studies',
    'जनजातीय अध्ययन में उन्नत डॉक्टरेट फेलोशिप',
    'గిరిజన అధ్యయనాలలో అధునాతన డాక్టోరల్ ఫెలోషిప్',
    'பழங்குடியினர் ஆய்வில் உயர்கல்வி ஆராய்ச்சி உதவித்தொகை',
    'आदिवासी अभ्यासातील प्रगत संशोधन फेलोशिप',
    'উপজাতীয় গবেষণায় উচ্চতর ফেলোশিপ',
    'ಬುಡಕಟ್ಟು ಅಧ್ಯಯನದಲ್ಲಿ ಉನ್ನತ ಸಂಶೋಧನಾ ಫೆಲೋಶಿಪ್',
    'Higher Fellowship', 800000, 1, 1, '2026-11-28', 450000,
    'Specialized doctoral research grant for ST scholars researching Indigenous Languages, Ethno-medicine, and Tribal Culture preservation.',
    'जनजातीय भाषाओं, एथनो-मेडिसिन और जनजातीय संस्कृति संरक्षण पर शोध करने वाले एसटी शोधार्थियों के लिए विशेष अनुदान।',
    '₹45,000/month fellowship + ₹50,000 annual field survey contingency.',
    '["Aadhaar Card", "ST Certificate", "Ph.D Registration Letter", "Research Proposal"]',
    'Research topic must center on Tribal Culture, Indigenous Languages, or Ethno-botany.',
    JSON.stringify([{ q: 'Is UGC-NET mandatory?', a: 'Preference given to NET/GATE qualified candidates.' }])
  );

  // 4. Seed Documents for Student 1 (Aarav Kumar)
  const docStmt = db.prepare(`
    INSERT INTO documents (
      id, student_id, doc_type, doc_name, file_name, file_url, file_size,
      verification_status, verified_by, digilocker_imported, uploaded_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  docStmt.run('doc_1', 'std_1', 'ST Certificate', 'Tribal Community Certificate', 'ST_Certificate_Aarav.pdf', '/uploads/demo/st_cert.pdf', 245000, 'VERIFIED', 'Revenue Department - Govt of Tamil Nadu', 1, '2026-01-15 10:30:00', 'Permanent');
  docStmt.run('doc_2', 'std_1', 'Income Certificate', 'Annual Family Income Certificate 2026-27', 'Income_Cert_2026.pdf', '/uploads/demo/income_cert.pdf', 180000, 'VERIFIED', 'e-District Portal - TN', 1, '2026-04-01 11:15:00', '2027-03-31');
  docStmt.run('doc_3', 'std_1', 'Bonafide Certificate', 'College Bonafide Student Proof', 'Bonafide_Salem_Engg.pdf', '/uploads/demo/bonafide.pdf', 312000, 'VERIFIED', 'Principal, Govt Arts & Engg College', 0, '2026-07-20 14:00:00', '2027-05-31');
  docStmt.run('doc_4', 'std_1', 'Class 10/12 Marksheet', 'SSLC & Higher Secondary Marksheet', 'HSC_Marksheet.pdf', '/uploads/demo/marksheet.pdf', 510000, 'VERIFIED', 'Tamil Nadu Board of Higher Secondary Education', 1, '2026-01-15 10:35:00', 'Permanent');
  docStmt.run('doc_5', 'std_1', 'Bank Passbook', 'Aadhaar Seeded Bank Account Front Page', 'SBI_Passbook_Aarav.pdf', '/uploads/demo/bank_passbook.pdf', 190000, 'VERIFIED', 'State Bank of India - Yercaud Branch', 0, '2026-01-16 09:20:00', 'Permanent');
  docStmt.run('doc_6', 'std_1', 'Fee Receipt', 'Semester Academic Fee Receipt 2026', 'Fee_Receipt_Sem3.pdf', '/uploads/demo/fee_receipt.pdf', 140000, 'VERIFIED', 'Accounts Dept - Salem Engg College', 0, '2026-07-25 15:30:00', '2027-05-31');

  // Documents for Student 3 (Rahul Munda - Higher Fellowship)
  docStmt.run('doc_7', 'std_3', 'ST Certificate', 'Tribal Community Certificate', 'ST_Certificate_Rahul.pdf', '/uploads/demo/st_cert.pdf', 230000, 'VERIFIED', 'District Collectorate Mayurbhanj', 1, '2026-02-10 11:00:00', 'Permanent');
  docStmt.run('doc_8', 'std_3', 'NET/JRF Certificate', 'UGC NET JRF Scorecard', 'UGC_JRF_Scorecard.pdf', '/uploads/demo/marksheet.pdf', 410000, 'VERIFIED', 'National Testing Agency (NTA)', 1, '2026-03-01 14:20:00', 'Permanent');

  // 5. Seed Applications for Student 1
  const appStmt = db.prepare(`
    INSERT INTO applications (
      id, application_no, student_id, scholarship_id, academic_year, current_status, submitted_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  appStmt.run('app_1', 'PMS-ST-2026-000123', 'std_1', 'sch_2', '2026-2027', 'Disbursed', '2026-08-01 10:00:00', '2026-08-25 16:30:00');
  appStmt.run('app_2', 'PRE-ST-2025-009120', 'std_1', 'sch_1', '2025-2026', 'Sanctioned', '2025-09-10 11:20:00', '2025-10-15 14:10:00');
  appStmt.run('app_3', 'TOP-ST-2026-004412', 'std_1', 'sch_3', '2026-2027', 'Institution Verification', '2026-09-01 09:15:00', '2026-09-02 11:00:00');

  // Application for Student 3 (Rahul Munda - Higher Fellowship)
  appStmt.run('app_4', 'NFST-2026-009988', 'std_3', 'sch_4', '2026-2027', 'District Verification', '2026-08-15 14:00:00', '2026-08-20 10:30:00');

  // Relate Application 1 & 3 with Documents
  const appDocStmt = db.prepare(`
    INSERT INTO application_documents (application_id, document_id) VALUES (?, ?)
  `);
  appDocStmt.run('app_1', 'doc_1');
  appDocStmt.run('app_1', 'doc_2');
  appDocStmt.run('app_1', 'doc_3');
  appDocStmt.run('app_1', 'doc_4');
  appDocStmt.run('app_1', 'doc_5');

  appDocStmt.run('app_3', 'doc_1');
  appDocStmt.run('app_3', 'doc_2');
  appDocStmt.run('app_3', 'doc_6');

  appDocStmt.run('app_4', 'doc_7');
  appDocStmt.run('app_4', 'doc_8');

  // 6. Seed Application Timeline for Application 1
  const timelineStmt = db.prepare(`
    INSERT INTO application_timeline (id, application_id, stage, status, action_by, remarks, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  timelineStmt.run('tl_1', 'app_1', 'Submitted', 'Completed', 'Aarav Kumar (Student)', 'Application submitted via One-Time Verification (OTR)', '2026-08-01 10:00:00');
  timelineStmt.run('tl_2', 'app_1', 'Institution Verified', 'Completed', 'Principal - Govt Arts & Engg College Salem', 'Verified student attendance, fee receipts, and bonafide status.', '2026-08-05 14:30:00');
  timelineStmt.run('tl_3', 'app_1', 'District Verified', 'Completed', 'District Tribal Welfare Officer, Salem', 'Verified ST Certificate & Income credentials against e-District registry.', '2026-08-12 11:15:00');
  timelineStmt.run('tl_4', 'app_1', 'State/Department Verification', 'Completed', 'Directorate of Tribal Welfare - Govt of Tamil Nadu', 'State level sanction quota approved.', '2026-08-18 16:45:00');
  timelineStmt.run('tl_5', 'app_1', 'Sanctioned', 'Completed', 'Ministry of Tribal Affairs (MoTA)', 'Scholarship sanctioned. Order No: MoTA/PMS-ST/2026/TN-8912', '2026-08-20 09:30:00');
  timelineStmt.run('tl_6', 'app_1', 'DBT Processing', 'Completed', 'Public Financial Management System (PFMS)', 'NPCI Aadhaar Payment Bridge (APB) mapping verified.', '2026-08-22 13:00:00');
  timelineStmt.run('tl_7', 'app_1', 'Fund Disbursed', 'Completed', 'State Bank of India (SBI)', '₹18,500 credited directly to Account 9182736450192 via UTR PFMS202608259012.', '2026-08-25 16:30:00');

  // Timeline for App 3
  timelineStmt.run('tl_8', 'app_3', 'Submitted', 'Completed', 'Aarav Kumar (Student)', 'Application submitted for Top Class Education Scheme.', '2026-09-01 09:15:00');
  timelineStmt.run('tl_9', 'app_3', 'Institution Verification', 'Completed', 'Nodal Officer - IIT/Govt Engg College', 'Verified admission letter and JEE merit rank.', '2026-09-02 11:00:00');

  // 7. Seed Payments
  const payStmt = db.prepare(`
    INSERT INTO payments (id, application_id, student_id, amount, sanction_no, status, utr_no, disbursed_at, bank_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  payStmt.run('pay_1', 'app_1', 'std_1', 18500, 'MoTA/PMS-ST/2026/TN-8912', 'Credited', 'PFMS202608259012', '2026-08-25 16:30:00', 'Success (DBT Account Credited)');
  payStmt.run('pay_2', 'app_2', 'std_1', 7000, 'MoTA/PRE-ST/2025/TN-1102', 'Credited', 'PFMS202510158812', '2025-10-15 14:10:00', 'Success (DBT Account Credited)');

  // 8. Seed Announcements (6 Announcements)
  const annStmt = db.prepare(`
    INSERT INTO announcements (id, title_en, title_hi, category, publish_date, download_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  annStmt.run('ann_1', 'Opening of Online Applications for PMS-ST & Pre-Matric ST Schemes 2026-27', 'प्री-मैट्रिक एवं पोस्ट-मैट्रिक एसटी योजनाओं 2026-27 के लिए आवेदन खुले', 'Scholarship', '2026-07-15', '/announcements/circular_2026_01.pdf');
  annStmt.run('ann_2', 'Mandatory Aadhaar Seeding of Bank Accounts for Direct Benefit Transfer (DBT)', 'प्रत्यक्ष लाभ हस्तांतरण (DBT) हेतु बैंक खातों की आधार सीडिंग अनिवार्य', 'Payment', '2026-08-01', '/announcements/dbt_circular.pdf');
  annStmt.run('ann_3', 'Revised Income Ceiling Guidelines for National Overseas Scholarship (NOS)', 'राष्ट्रीय प्रवासी छात्रवृत्ति हेतु संशोधित आय सीमा दिशानिर्देश', 'Important Notice', '2026-08-10', '/announcements/nos_guidelines.pdf');
  annStmt.run('ann_4', 'Extension of Application Deadline for National Fellowship (NFST) till Oct 31', 'राष्ट्रीय फेलोशिप (NFST) हेतु आवेदन की अंतिम तिथि 31 अक्टूबर तक बढ़ी', 'Deadline', '2026-08-28', '/announcements/nfst_extension.pdf');
  annStmt.run('ann_5', 'Notification of Notified Institutes for Top Class ST Education Scheme 2026', 'टॉप क्लास एसटी शिक्षा योजना 2026 के लिए अधिसूचित संस्थानों की सूची', 'Government Circular', '2026-09-02', '/announcements/top_class_institutes.pdf');
  annStmt.run('ann_6', 'Guidelines for PVTG Priority Verification via e-District Integration', 'ई-डिस्ट्रिक्ट एकीकरण के माध्यम से विशेष रूप से कमजोर जनजातीय समूहों (PVTG) हेतु दिशानिर्देश', 'Important Notice', '2026-09-05', '/announcements/pvtg_verification.pdf');

  // 9. Seed Notifications for Student 1
  const notifStmt = db.prepare(`
    INSERT INTO notifications (id, user_id, title_en, title_hi, message_en, message_hi, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  notifStmt.run('notif_1', 'usr_student_1', 'DBT Payment Credited!', 'DBT भुगतान जमा हुआ!', '₹18,500 scholarship amount has been credited to your SBI account.', '₹18,500 की छात्रवृत्ति राशि आपके एसबीआई खाते में जमा कर दी गई है।', 'PAYMENT', 0, '2026-08-25 16:35:00');
  notifStmt.run('notif_2', 'usr_student_1', 'ST Certificate Verified', 'एसटी प्रमाणपत्र सत्यापित', 'Your Tribal ST Certificate has been successfully verified via e-District portal.', 'आपका एसटी प्रमाणपत्र ई-डिस्ट्रिक्ट पोर्टल के माध्यम से सफलतापूर्वक सत्यापित किया गया है।', 'VERIFICATION', 1, '2026-08-12 11:20:00');
  notifStmt.run('notif_3', 'usr_student_1', 'Application Sanctioned', 'आवेदन स्वीकृत', 'Your Post-Matric Scholarship application PMS-ST-2026-000123 has been sanctioned by MoTA.', 'आपका आवेदन PMS-ST-2026-000123 स्वीकृत कर दिया गया है।', 'STATUS', 1, '2026-08-20 09:35:00');
  notifStmt.run('notif_4', 'usr_student_1', 'Institution Verification Complete', 'संस्थान सत्यापन पूर्ण', 'Government Arts & Engineering College Salem verified your Top Class application credentials.', 'आपके संस्थान ने आपके आवेदन साख को सत्यापित कर दिया है।', 'STATUS', 0, '2026-09-02 11:05:00');

  // 10. Seed Grievances
  const grvStmt = db.prepare(`
    INSERT INTO grievances (id, ticket_no, student_id, category, scholarship_id, subject, description, status, resolution, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  grvStmt.run(
    'grv_1', 'GRV-2026-001099', 'std_1', 'Document issue', 'sch_2',
    'Income Certificate Expiry Query', 'My income certificate expires on March 31, 2027. Do I need to re-upload for continuation next semester?',
    'Resolved', 'Your current valid income certificate is sufficient for Academic Year 2026-27. Re-upload will only be required for 2027-28 renewal.',
    '2026-08-03 14:20:00'
  );
  grvStmt.run(
    'grv_2', 'GRV-2026-003412', 'std_3', 'Verification issue', 'sch_4',
    'NFST JRF Scorecard Verification Delay', 'UGC-NTA score card upload shows pending institutional verification for 5 days.',
    'Under Review', 'Assigned to NTA verification cell. Automated API re-validation triggered.',
    '2026-08-22 10:15:00'
  );

  console.log('Database seeding completed with 8 schemes, 5 students, 6 circulars & rich demo records!');
}

if (require.main === module) {
  seedDatabase();
}
