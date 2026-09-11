import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { CheckCircle2, ShieldCheck, ArrowRight, FileText, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const ApplicationWizard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const schemeIdFromUrl = searchParams.get('schemeId') || 'sch_2';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [scheme, setScheme] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [declaration, setDeclaration] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppNo, setSubmittedAppNo] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    Promise.all([
      axios.get(`/api/scholarships/${schemeIdFromUrl}`),
      axios.get('/api/student/profile'),
      axios.get('/api/documents'),
    ]).then(([schRes, profRes, docRes]) => {
      setScheme(schRes.data.scholarship);
      setStudent(profRes.data.student);
      const docs = docRes.data.documents || [];
      setVaultDocs(docs);
      // Auto-select all verified document IDs for document reuse
      setSelectedDocIds(docs.filter((d: any) => d.verification_status === 'VERIFIED').map((d: any) => d.id));
    }).finally(() => setLoading(false));
  }, [isAuthenticated, schemeIdFromUrl]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaration) {
      alert('Please confirm declaration check.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/applications', {
        scholarshipId: scheme.id,
        academicYear,
        documentIds: selectedDocIds,
      });

      if (res.data.success) {
        setSubmittedAppNo(res.data.applicationNo);
        setStep(4); // Success Summary Step
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !scheme || !student) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500 font-semibold text-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-[#8B4513] mr-2" />
          Loading Application Wizard & Retrieving Profile...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-6">
        <div className="text-center">
          <span className="bg-amber-100 text-[#8B4513] text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            Unified Application Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#8B4513] mt-2">
            Scholarship Application Form
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Applying for: <strong className="text-gray-900">{scheme.name_en} ({scheme.code})</strong>
          </p>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-xs">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 1 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>1</span>
              <span>Smart Pre-filled Profile</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 2 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>2</span>
              <span>Document Reuse</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-[#8B4513] font-bold' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 3 ? 'bg-[#8B4513]' : 'bg-gray-300'}`}>3</span>
              <span>Review & Submit</span>
            </div>
          </div>
        )}

        {/* STEP 1: SMART PRE-FILLED PROFILE */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-xs text-green-900 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-700 flex-shrink-0" />
              <span>
                <strong>Smart Profile Prefill Active:</strong> Data below has been retrieved from your verified OTR student profile ({student.otr_id}). No re-entry required.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded border">
                <span className="text-gray-500 block">Student Name</span>
                <strong className="text-gray-900 text-sm">{student.full_name}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <span className="text-gray-500 block">OTR ID</span>
                <strong className="font-mono text-[#006699] text-sm">{student.otr_id}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <span className="text-gray-500 block">ST Community Certificate</span>
                <strong className="text-gray-900">{student.st_certificate_no}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <span className="text-gray-500 block">Annual Family Income</span>
                <strong className="text-[#8B4513]">₹{student.annual_income?.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded border sm:col-span-2">
                <span className="text-gray-500 block">Institution & Course</span>
                <strong className="text-gray-900">{student.institution_name} — {student.current_course}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded border sm:col-span-2">
                <span className="text-gray-500 block">Aadhaar-Seeded Bank Account</span>
                <strong className="text-gray-900">{student.bank_name} (Account ending in {student.bank_account_no?.slice(-4)})</strong>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setStep(2)} className="btn-primary text-xs px-6 py-2.5 font-bold">
                Continue to Verified Document Reuse
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFIED DOCUMENT REUSE */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Step 2: Reuse Verified Documents from Vault
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Select from your existing verified documents to attach to this application without re-uploading.
              </p>
            </div>

            <div className="space-y-3">
              {vaultDocs.map(doc => (
                <label
                  key={doc.id}
                  className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs cursor-pointer hover:border-[#006699] transition"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedDocIds([...selectedDocIds, doc.id]);
                        } else {
                          setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                        }
                      }}
                      className="w-4 h-4 text-[#8B4513] rounded focus:ring-[#8B4513]"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{doc.doc_name} ({doc.doc_type})</p>
                      <p className="text-gray-500 text-[10px]">Verified by: {doc.verified_by}</p>
                    </div>
                  </div>

                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-300">
                    ✓ Verified & Reusable
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="btn-outline text-xs px-4 py-2">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary text-xs px-6 py-2 font-bold">
                Review & Submit Application
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & SUBMIT */}
        {step === 3 && (
          <form onSubmit={handleSubmitApplication} className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-[#8B4513]">Step 3: Final Declaration & Submission</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-2 border border-gray-200">
              <p><strong>Applicant Name:</strong> {student.full_name} ({student.otr_id})</p>
              <p><strong>Selected Scheme:</strong> {scheme.name_en}</p>
              <p><strong>Academic Year:</strong> {academicYear}</p>
              <p><strong>Attached Vault Documents:</strong> {selectedDocIds.length} Verified Document(s)</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-2">
              <label className="flex items-start space-x-2 text-xs font-semibold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declaration}
                  onChange={e => setDeclaration(e.target.checked)}
                  className="w-4 h-4 text-[#8B4513] rounded focus:ring-[#8B4513] mt-0.5"
                />
                <span>
                  I hereby declare that the information provided is true and accurate. I understand that my application will be verified automatically by the Ministry of Tribal Affairs Nodal Verification Engine.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)} className="btn-outline text-xs px-4 py-2">
                Back
              </button>
              <button type="submit" disabled={submitting} className="btn-accent text-xs px-8 py-3 font-bold shadow-lg">
                {submitting ? 'Submitting Application...' : 'Submit Scholarship Application'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 4 && submittedAppNo && (
          <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-green-500 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-300">
                Application Submitted Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-[#8B4513] mt-3">
                Application Tracking ID
              </h3>
              <p className="text-xl font-mono font-black text-[#006699] mt-1">{submittedAppNo}</p>
            </div>

            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Your application has entered stage 1 (Submitted) and is being auto-routed to your institution for verification.
            </p>

            <div className="flex justify-center gap-4 pt-2">
              <Link to="/student/dashboard" className="btn-primary text-xs px-6 py-3 font-bold">
                Track Application in Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
