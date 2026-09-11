import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Search, ArrowRight, Award, Calendar, IndianRupee, Filter, ShieldCheck } from 'lucide-react';

const FALLBACK_SCHEMES = [
  {
    id: 'sch_1',
    code: 'PRE-MATRIC-ST',
    name_en: 'Pre-Matric Scholarship Scheme for ST Students',
    academic_level: 'Pre-Matric',
    income_limit: 250000,
    max_amount: 7000,
    deadline: '2026-11-30',
    description_en: 'Financial support for ST students studying in Class IX and X to prevent dropouts and support secondary education completion.',
  },
  {
    id: 'sch_2',
    code: 'POST-MATRIC-ST',
    name_en: 'Post-Matric Scholarship for ST Students (PMS-ST)',
    academic_level: 'Post-Matric',
    income_limit: 250000,
    max_amount: 25000,
    deadline: '2026-12-31',
    description_en: 'Covers maintenance allowance and compulsory non-refundable fees for ST students in Class 11 up to Post-Graduation.',
  },
  {
    id: 'sch_3',
    code: 'TOP-CLASS-ST',
    name_en: 'National Scholarship Scheme (Top Class) for ST Students',
    academic_level: 'Top Class',
    income_limit: 600000,
    max_amount: 200000,
    deadline: '2026-11-15',
    description_en: 'Full tuition fee reimbursement + living allowance + computer grant for ST students admitted into IITs, NITs, IIMs, AIIMS, and NLUs.',
  },
  {
    id: 'sch_4',
    code: 'NFST-FELLOWSHIP',
    name_en: 'National Fellowship for Higher Education of ST Students (NFST)',
    academic_level: 'Higher Fellowship',
    income_limit: 800000,
    max_amount: 420000,
    deadline: '2026-10-31',
    description_en: 'Financial fellowships (₹31,000–₹35,000/month) for ST scholars pursuing M.Phil and Ph.D. degrees in Indian universities.',
  },
  {
    id: 'sch_5',
    code: 'NOS-OVERSEAS',
    name_en: 'National Overseas Scholarship for ST Candidates (NOS)',
    academic_level: 'National Overseas',
    income_limit: 600000,
    max_amount: 2500000,
    deadline: '2026-12-15',
    description_en: 'Financial assistance for ST students pursuing Masters and Ph.D. abroad in top 500 QS ranked international universities.',
  },
  {
    id: 'sch_6',
    code: 'STATE-ST-PRE',
    name_en: 'State Tribal Welfare Secondary Grant Scheme',
    academic_level: 'Pre-Matric',
    income_limit: 200000,
    max_amount: 5000,
    deadline: '2026-11-20',
    description_en: 'Special state supplementary stipend for tribal students studying in tribal welfare residential ashram schools.',
  },
  {
    id: 'sch_7',
    code: 'EMRS-MERIT',
    name_en: 'Eklavya Model Residential School (EMRS) Excellence Grant',
    academic_level: 'Pre-Matric',
    income_limit: 250000,
    max_amount: 8500,
    deadline: '2026-12-05',
    description_en: 'Merit scholarship for high-performing ST students studying in Eklavya Model Residential Schools (EMRS).',
  },
  {
    id: 'sch_8',
    code: 'MOTA-DOCTORAL',
    name_en: 'MoTA Advanced Doctoral Fellowship in Tribal Studies',
    academic_level: 'Higher Fellowship',
    income_limit: 800000,
    max_amount: 450000,
    deadline: '2026-11-28',
    description_en: 'Specialized doctoral research grant for ST scholars researching Indigenous Languages, Ethno-medicine, and Tribal Culture.',
  },
];

export const SchemesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>(FALLBACK_SCHEMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('/api/scholarships')
      .then(res => {
        if (res.data?.scholarships && res.data.scholarships.length > 0) {
          setSchemes(res.data.scholarships);
        }
      })
      .catch(() => {});
  }, []);

  const filteredSchemes = schemes.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
                          s.name_en.toLowerCase().includes(query) ||
                          s.code.toLowerCase().includes(query) ||
                          s.description_en.toLowerCase().includes(query);

    const cat = selectedCategory.toLowerCase().trim();
    const matchesCat = cat === 'all' ||
                       s.academic_level.toLowerCase().includes(cat) ||
                       s.code.toLowerCase().includes(cat) ||
                       (cat.includes('top') && s.academic_level.toLowerCase().includes('top')) ||
                       (cat.includes('fellow') && s.academic_level.toLowerCase().includes('fellow')) ||
                       (cat.includes('oversea') && s.academic_level.toLowerCase().includes('oversea'));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="bg-amber-100 text-[#8B4513] text-xs font-bold px-3.5 py-1 rounded-full border border-amber-300 shadow-sm inline-block mb-2">
            Ministry of Tribal Affairs Schemes Repository
          </span>
          <h2 className="text-3xl font-extrabold text-[#8B4513] leading-tight">
            Central & State Tribal Welfare Scholarships
          </h2>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
            Explore detailed guidelines, eligibility ceilings, required documents, and financial benefits across all MoTA scholarship programs for Scheduled Tribe (ST) students.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, code, keyword..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B4513]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
            {['All', 'Pre-Matric', 'Post-Matric', 'Top Class', 'Higher Fellowship', 'National Overseas'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-[#8B4513] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl transition group">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-300">
                    Applications Open
                  </span>
                  <span className="text-[11px] font-bold text-[#8B4513] font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {scheme.code}
                  </span>
                </div>

                {(() => {
                  const schemeName = scheme[`name_${language}`] || scheme.name_hi || scheme.name_en;
                  const schemeDesc = scheme[`description_${language}`] || scheme.description_hi || scheme.description_en;
                  return (
                    <>
                      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#8B4513] transition">
                        {schemeName}
                      </h3>

                      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                        {schemeDesc}
                      </p>

                      <div className="bg-amber-50/50 p-3 rounded-lg text-xs space-y-1.5 mb-6 border border-amber-100 text-gray-700">
                        <div className="flex justify-between">
                          <span>{t('income_cap')}:</span>
                          <strong className="text-[#8B4513]">Under ₹{(scheme.income_limit / 100000).toFixed(1)} Lakhs/yr</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Benefit:</span>
                          <strong className="text-green-700">Up to ₹{scheme.max_amount?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('deadline')}:</span>
                          <strong className="text-amber-900">{scheme.deadline}</strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          to={`/schemes/${scheme.id}`}
                          className="bg-[#8B4513] hover:bg-[#5C2E0B] text-white w-full text-center text-xs py-2.5 rounded-lg font-bold block shadow-sm transition"
                        >
                          {t('apply_now')}
                        </Link>
                        <div className="flex justify-center pt-1">
                          <ReadAloudButton textToRead={`${schemeName}. ${schemeDesc}`} label="Hear Scheme" />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
