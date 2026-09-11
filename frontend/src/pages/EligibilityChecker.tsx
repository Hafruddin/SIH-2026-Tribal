import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { INDIAN_STATES } from '../constants/states';
import { Search, CheckCircle2, XCircle, AlertCircle, ArrowRight, BookOpen, Shield } from 'lucide-react';

export const EligibilityChecker: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [academicLevel, setAcademicLevel] = useState(searchParams.get('academicLevel') || 'Post-Matric');
  const [state, setState] = useState(searchParams.get('state') || 'Tamil Nadu');
  const [isST, setIsST] = useState(true);
  const [isPVTG, setIsPVTG] = useState(false);
  const [annualIncome, setAnnualIncome] = useState(180000);
  const [disabilityStatus, setDisabilityStatus] = useState(false);

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runEligibilityCheck();
  }, []);

  const runEligibilityCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/eligibility/check', {
        academicLevel,
        state,
        isST,
        isPVTG,
        annualIncome,
        disabilityStatus,
      });

      setResults(res.data.results || []);
    } catch (err) {
      console.error('Eligibility check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="bg-amber-100 text-[#8B4513] text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            Rule-Based Automated Verification Engine
          </span>
          <h2 className="text-3xl font-extrabold text-[#8B4513] mt-2">
            Scholarship Eligibility Checker
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Input your academic level, domicile state, tribal category status, and annual family income to discover scheme eligibility.
          </p>
        </div>

        {/* Input Controls Card */}
        <form onSubmit={runEligibilityCheck} className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Level</label>
              <select
                value={academicLevel}
                onChange={e => setAcademicLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#8B4513]"
              >
                <option value="Pre-Matric">Class IX & X (Pre-Matric)</option>
                <option value="Post-Matric">Class XI up to PG (Post-Matric)</option>
                <option value="Top Class">Top Class Education (IIT/NIT/IIM)</option>
                <option value="Higher Fellowship">Higher Fellowship (NFST - Ph.D/M.Phil)</option>
                <option value="National Overseas">National Overseas Scholarship (NOS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Domicile State</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Annual Family Income (₹)
              </label>
              <input
                type="number"
                value={annualIncome}
                onChange={e => setAnnualIncome(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 text-xs">
            <label className="flex items-center space-x-2 font-semibold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isST}
                onChange={e => setIsST(e.target.checked)}
                className="w-4 h-4 text-[#8B4513] rounded focus:ring-[#8B4513]"
              />
              <span>Scheduled Tribe (ST) Category Verified</span>
            </label>

            <label className="flex items-center space-x-2 font-semibold text-amber-900 cursor-pointer bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
              <input
                type="checkbox"
                checked={isPVTG}
                onChange={e => setIsPVTG(e.target.checked)}
                className="w-4 h-4 text-[#8B4513] rounded focus:ring-[#8B4513]"
              />
              <span>Particularly Vulnerable Tribal Group (PVTG)</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full py-3 text-xs font-bold shadow-md">
            {loading ? 'Evaluating Eligibility Engine...' : 'Evaluate Eligibility Across All Schemes'}
          </button>
        </form>

        {/* Evaluation Results List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#8B4513]">Evaluated Scholarship Schemes</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((resItem, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border transition shadow-sm ${
                  resItem.isEligible
                    ? 'bg-white border-green-300 hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-90'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      resItem.isEligible
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {resItem.status}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    Max Amount: ₹{resItem.scheme.max_amount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <h4 className="text-base font-bold text-gray-900 mb-2">{resItem.scheme.name_en}</h4>
                <p className="text-xs text-gray-600 mb-4">{resItem.scheme.description_en}</p>

                {/* Reason Breakdown Checklist */}
                <div className="space-y-1.5 bg-gray-100 p-3 rounded-lg text-xs mb-5">
                  <p className="font-bold text-gray-700 text-[11px] mb-1">Eligibility Criteria Breakdown:</p>
                  {resItem.reasons.map((r: string, rIdx: number) => (
                    <p
                      key={rIdx}
                      className={r.startsWith('✓') ? 'text-green-700 font-medium' : r.startsWith('★') ? 'text-amber-700 font-bold' : 'text-red-600'}
                    >
                      {r}
                    </p>
                  ))}
                </div>

                {resItem.isEligible ? (
                  <Link
                    to={`/apply?schemeId=${resItem.scheme.id}`}
                    className="btn-primary w-full text-center text-xs py-2.5 font-bold block"
                  >
                    Apply Now for {resItem.scheme.code}
                  </Link>
                ) : (
                  <button disabled className="bg-gray-200 text-gray-500 w-full py-2.5 rounded text-xs font-semibold cursor-not-allowed">
                    Ineligible to Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
