import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { INDIAN_STATES } from '../constants/states';
import { CheckCircle2, ShieldCheck, ArrowRight, UserCheck, AlertCircle, Download, Copy, Phone, FileText, Lock } from 'lucide-react';

export const RegisterOTR: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [aadhaarNo, setAadhaarNo] = useState('');

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2004-05-14');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Student@123');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Salem');
  const [pincode, setPincode] = useState('636001');
  const [address, setAddress] = useState('Door 45, Tribal Welfare Colony, Yercaud Road');

  const [category, setCategory] = useState('ST (Scheduled Tribe)');
  const [stCertNo, setStCertNo] = useState('ST/TN/2026/88912');
  const [pvtgStatus, setPvtgStatus] = useState(false);
  const [pvtgGroupName, setPvtgGroupName] = useState('');
  const [annualIncome, setAnnualIncome] = useState('180000');
  const [fatherName, setFatherName] = useState('Kannan Kumar');
  const [motherName, setMotherName] = useState('Lakshmi Kumar');

  const [academicLevel, setAcademicLevel] = useState('Post-Matric');
  const [currentCourse, setCurrentCourse] = useState('B.Tech Computer Science');
  const [institutionName, setInstitutionName] = useState('Government Arts & Engineering College, Salem');
  const [bankAccountNo, setBankAccountNo] = useState('9182736450192');
  const [ifscCode, setIfscCode] = useState('SBIN0004521');
  const [bankName, setBankName] = useState('State Bank of India');

  // Success OTR State
  const [generatedOtrId, setGeneratedOtrId] = useState<string | null>(null);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/verify-otp', { mobile, otp: otp || '123456' });
      setOtpVerified(true);
      setStep(2);
    } catch (err: any) {
      setError('Invalid OTP code. Use demo code 123456.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        fullName, dob, gender, mobile, email, password, state, district, pincode, address,
        category, stCertNo, pvtgStatus, pvtgGroupName, annualIncome, fatherName, motherName,
        academicLevel, currentCourse, institutionName, bankAccountNo, ifscCode, bankName, aadhaarNo
      };

      const res = await axios.post('/api/auth/register', payload);
      if (res.data.success) {
        setGeneratedOtrId(res.data.otrId);
        login(res.data.token, res.data.student);
        setStep(5); // Success Summary Step
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center mb-8">
          <span className="inline-block bg-amber-100 text-[#8B4513] text-xs font-bold px-3 py-1 rounded-full border border-amber-300 mb-2">
            One-Time Registration (OTR) Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#8B4513]">
            Student Lifetime Portal Identity Creation
          </h2>
          <p className="text-xs text-gray-600 mt-1 max-w-lg mx-auto">
            Verify via Aadhaar OTP to create your permanent profile. Documents verified once can be reused for all 5 MoTA scholarship schemes.
          </p>
        </div>

        {/* Stepper Header */}
        {step < 5 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 overflow-x-auto text-xs">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 1 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>1</span>
              <span>Mobile OTP</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 2 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>2</span>
              <span>Identity & Personal</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 3 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>3</span>
              <span>ST & Income</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 4 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>4</span>
              <span>Academic & Bank</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: MOBILE & OTP VERIFICATION */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#E67E22]" />
                Step 1: Mobile & Aadhaar Demo OTP Verification
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your mobile number to receive a 6-digit OTP for identity authentication.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number (Linked with Aadhaar)
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Aadhaar Number (Demo Vault Check)
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={aadhaarNo}
                  onChange={e => setAadhaarNo(e.target.value)}
                  placeholder="12 Digit Aadhaar Number (e.g. 918273648912)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    6-Digit OTP Code
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
                    Demo OTP: 123456
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 123456"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-mono text-center tracking-widest text-lg focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-bold"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PERSONAL DETAILS */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#E67E22]" />
                Step 2: Basic Student Personal Information
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your details as recorded in your official Aadhaar and School Leaving Certificates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@demo.com"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State of Domicile</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#8B4513]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="btn-outline text-xs px-4 py-2">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary text-xs px-6 py-2">
                Continue to ST & Income Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ST & INCOME DETAILS */}
        {step === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E67E22]" />
                Step 3: Tribal ST Category & Family Income Credentials
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your tribal category certificate will be auto-verified via State e-District integration adapters.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Caste Category</label>
                <input
                  type="text"
                  disabled
                  value={category}
                  className="w-full bg-gray-100 border border-gray-300 text-gray-700 rounded-lg p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ST Certificate Number</label>
                <input
                  type="text"
                  required
                  value={stCertNo}
                  onChange={e => setStCertNo(e.target.value)}
                  placeholder="e.g. ST/TN/2026/88912"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pvtgStatus}
                    onChange={e => setPvtgStatus(e.target.checked)}
                    className="w-4 h-4 text-[#8B4513] rounded focus:ring-[#8B4513]"
                  />
                  <span>Belong to Particularly Vulnerable Tribal Group (PVTG)?</span>
                </label>
                {pvtgStatus && (
                  <input
                    type="text"
                    value={pvtgGroupName}
                    onChange={e => setPvtgGroupName(e.target.value)}
                    placeholder="Enter PVTG Tribal Group Name (e.g. Birhor, Toda, Chenchu)"
                    className="w-full bg-white border border-amber-300 rounded p-2 text-xs mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Annual Family Income (₹)
                </label>
                <input
                  type="number"
                  required
                  value={annualIncome}
                  onChange={e => setAnnualIncome(e.target.value)}
                  placeholder="e.g. 180000"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={e => setFatherName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={e => setMotherName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)} className="btn-outline text-xs px-4 py-2">
                Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary text-xs px-6 py-2">
                Continue to Academic & Bank Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ACADEMIC & BANK DETAILS */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#E67E22]" />
                Step 4: Academic Course & Aadhaar-Seeded Bank Account
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Direct Benefit Transfer (DBT) payments require an Aadhaar-seeded active bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Level</label>
                <select
                  value={academicLevel}
                  onChange={e => setAcademicLevel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                >
                  <option value="Pre-Matric">Class IX & X (Pre-Matric)</option>
                  <option value="Post-Matric">Class XI up to PG (Post-Matric)</option>
                  <option value="Top Class">Top Class Education (Premier Institutes)</option>
                  <option value="Higher Fellowship">Higher Fellowship (NFST)</option>
                  <option value="National Overseas">National Overseas Scholarship (NOS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Current Course Name</label>
                <input
                  type="text"
                  required
                  value={currentCourse}
                  onChange={e => setCurrentCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  placeholder="e.g. Government Arts & Engineering College"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={bankAccountNo}
                  onChange={e => setBankAccountNo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(3)} className="btn-outline text-xs px-4 py-2">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-accent text-xs px-8 py-3 font-bold shadow-lg">
                {loading ? 'Creating OTR ID...' : 'Generate Lifetime OTR ID & Register'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: OTR REGISTRATION SUCCESS SUMMARY */}
        {step === 5 && generatedOtrId && (
          <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-green-500 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-300">
                Registration Successful
              </span>
              <h3 className="text-2xl font-extrabold text-[#8B4513] mt-3">
                Your One-Time Registration (OTR) ID
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Save this permanent lifetime ID. Use it to log in and apply across all tribal scholarship portals.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 max-w-md mx-auto space-y-3">
              <div className="text-3xl font-mono font-black text-[#006699] tracking-wider select-all bg-white p-3 rounded border border-gray-300 shadow-sm flex items-center justify-center gap-2">
                <span>{generatedOtrId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedOtrId)}
                  className="text-gray-400 hover:text-[#8B4513]"
                  title="Copy OTR ID"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="text-left text-xs space-y-1 text-gray-700 pt-2 border-t border-gray-200">
                <p><strong>Student Name:</strong> {fullName}</p>
                <p><strong>Mobile:</strong> {mobile}</p>
                <p><strong>Caste Category:</strong> {category}</p>
                <p><strong>Document Vault Status:</strong> <span className="text-green-700 font-bold">2 Verified Certificates Auto-Loaded</span></p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link to="/student/dashboard" className="btn-primary text-xs px-6 py-3 font-bold">
                Go to Student Dashboard
              </Link>
              <Link to="/schemes" className="btn-outline text-xs px-6 py-3 font-bold">
                Apply for Scholarships Now
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
