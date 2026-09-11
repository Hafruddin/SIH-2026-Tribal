import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { ReadAloudButton } from '../components/ReadAloudButton';
import {
  Search, ShieldCheck, CheckCircle2, ArrowRight, Award, FileText, Landmark,
  HelpCircle, Sparkles, BookOpen, Users, IndianRupee, Key, ChevronRight
} from 'lucide-react';

import { INDIAN_STATES } from '../constants/states';

export const LandingPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [academicLevel, setAcademicLevel] = useState('');
  const [state, setState] = useState('');
  const [featuredSchemes, setFeaturedSchemes] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // Fetch schemes and announcements from backend API
    axios.get('/api/scholarships')
      .then(res => setFeaturedSchemes(res.data.scholarships || []))
      .catch(() => {});

    axios.get('/api/announcements')
      .then(res => setAnnouncements(res.data.announcements || []))
      .catch(() => {});
  }, []);

  const handleSearchSchemes = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/eligibility?academicLevel=${encodeURIComponent(academicLevel)}&state=${encodeURIComponent(state)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="hero-content md:w-1/2 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#E67E22]/20 border border-[#E67E22]/50 text-orange-200 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Ministry of Tribal Affairs • Government of India</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
              {t('hero_title')}
            </h2>

            <p className="text-sm sm:text-base text-gray-200 max-w-xl leading-relaxed">
              {t('hero_sub')} One student, one profile, one document vault across all central and state-funded tribal welfare scholarship schemes.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/register" className="btn-accent text-sm sm:text-base font-bold shadow-xl hover:scale-105 transition">
                <span>Start One-Time Registration (OTR)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/schemes" className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-md transition text-sm border border-white/30 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Explore 5 MoTA Schemes</span>
              </Link>
            </div>
          </div>

          {/* Quick Finder Card */}
          <div className="md:w-1/2 w-full max-w-md">
            <div className="quick-finder-card bg-white text-gray-900 rounded-xl shadow-2xl p-6 sm:p-8 border-t-4 border-[#E67E22] space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-xl font-bold text-[#8B4513] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#E67E22]" />
                  {t('finder_title')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Instant automated eligibility check across all 5 MoTA scholarship categories
                </p>
              </div>

              <form onSubmit={handleSearchSchemes} className="finder-form space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Academic Level
                  </label>
                  <select
                    name="academic-level"
                    value={academicLevel}
                    onChange={e => setAcademicLevel(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                  >
                    <option value="">{t('select_academic')}</option>
                    <option value="Pre-Matric">Class IX & X (Pre-Matric)</option>
                    <option value="Post-Matric">Class XI to Post-Graduation (Post-Matric)</option>
                    <option value="Top Class">Top Class Education (IIT / NIT / IIM / AIIMS)</option>
                    <option value="Higher Fellowship">Higher Fellowship (M.Phil / Ph.D - NFST)</option>
                    <option value="National Overseas">National Overseas Scholarship (NOS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Domicile State
                  </label>
                  <select
                    name="state"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                  >
                    <option value="">{t('select_state')}</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-accent w-full text-sm font-bold shadow-md">
                  {t('btn_search_schemes')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>



      {/* 2. METRICS DASHBOARD SECTION */}
      <section className="metrics-dashboard">
        <div className="metric-card">
          <div className="w-12 h-12 bg-orange-100 text-[#E67E22] rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-extrabold text-[#8B4513]">500K+</h3>
          <p className="text-xs text-gray-600 font-medium mt-1">{t('metric_students')}</p>
        </div>

        <div className="metric-card">
          <div className="w-12 h-12 bg-blue-100 text-[#006699] rounded-full flex items-center justify-center mx-auto mb-3">
            <IndianRupee className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-extrabold text-[#006699]">₹120 Cr+</h3>
          <p className="text-xs text-gray-600 font-medium mt-1">{t('metric_funds')}</p>
        </div>

        <div className="metric-card">
          <div className="w-12 h-12 bg-amber-100 text-[#E67E22] rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-extrabold text-[#8B4513]">45+</h3>
          <p className="text-xs text-gray-600 font-medium mt-1">{t('metric_schemes')}</p>
        </div>
      </section>

      {/* 3. WORKFLOW SECTION */}
      <section className="workflow-section">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#8B4513]">
            {t('workflow_title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Simplified four-step digital process eliminating redundant paperwork and continuous document submission.
          </p>
        </div>

        <div className="timeline-container grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="step bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-[#006699] transition relative">
            <span className="step-num w-10 h-10 bg-[#8B4513] text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-md">
              1
            </span>
            <h4 className="font-bold text-gray-900 text-sm mb-2">{t('step1_title')}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{t('step1_desc')}</p>
          </div>

          <div className="step bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-[#006699] transition relative">
            <span className="step-num w-10 h-10 bg-[#006699] text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-md">
              2
            </span>
            <h4 className="font-bold text-gray-900 text-sm mb-2">{t('step2_title')}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{t('step2_desc')}</p>
          </div>

          <div className="step bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-[#006699] transition relative">
            <span className="step-num w-10 h-10 bg-[#E67E22] text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-md">
              3
            </span>
            <h4 className="font-bold text-gray-900 text-sm mb-2">{t('step3_title')}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{t('step3_desc')}</p>
          </div>

          <div className="step bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-[#006699] transition relative">
            <span className="step-num w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-md">
              4
            </span>
            <h4 className="font-bold text-gray-900 text-sm mb-2">{t('step4_title')}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{t('step4_desc')}</p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED WELFARE SCHEMES GRID */}
      <section id="schemes" className="schemes-grid">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#8B4513]">
                {t('featured_schemes')}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Central Sector & Centrally Sponsored Schemes under Ministry of Tribal Affairs
              </p>
            </div>
            <Link to="/schemes" className="text-xs font-bold text-[#006699] hover:underline flex items-center gap-1">
              View All 5 Schemes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSchemes.slice(0, 3).map((scheme: any) => (
              <div key={scheme.id} className="scheme-card">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge open bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-300">
                      {t('open_badge')}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {scheme.academic_level}
                    </span>
                  </div>

                  {(() => {
                    const schemeName = scheme[`name_${language}`] || scheme.name_hi || scheme.name_en;
                    const schemeDesc = scheme[`description_${language}`] || scheme.description_hi || scheme.description_en;
                    return (
                      <>
                        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                          {schemeName}
                        </h3>

                        <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {schemeDesc}
                        </p>

                        <div className="scheme-meta bg-gray-50 p-3 rounded-lg text-xs space-y-1 mb-6 text-gray-700 border border-gray-100">
                          <div className="flex justify-between">
                            <span><strong>{t('income_cap')}:</strong></span>
                            <span className="text-[#8B4513] font-semibold">Under ₹{(scheme.income_limit / 100000).toFixed(1)} Lakhs/yr</span>
                          </div>
                          <div className="flex justify-between">
                            <span><strong>{t('deadline')}:</strong></span>
                            <span className="text-red-700 font-semibold">{scheme.deadline}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <ReadAloudButton textToRead={`${schemeName}. ${schemeDesc}`} label="Hear Scheme" />
                        </div>
                      </>
                    );
                  })()}
                </div>

                <Link
                  to={`/schemes/${scheme.id}`}
                  className="btn card-btn w-full btn-primary text-xs py-2.5 text-center font-semibold"
                >
                  {t('apply_now')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CIRCULARS & GRIEVANCE PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Latest Circulars */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E67E22]" />
              {t('nav_circulars')}
            </h3>
            <Link to="/announcements" className="text-xs font-bold text-[#006699] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs flex items-center justify-between gap-3">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded mb-1">
                    {ann.category}
                  </span>
                  <p className="font-semibold text-gray-800 leading-tight">{ann.title_en}</p>
                  <span className="text-[10px] text-gray-400 mt-1 inline-block">{ann.publish_date}</span>
                </div>
                <a
                  href={`/api/announcements/${ann.id}/download?lang=${language}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#006699] hover:text-[#8B4513] text-xs font-bold whitespace-nowrap"
                >
                  {t('btn_download_pdf')}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Helpdesk & Grievance */}
        <div id="helpdesk" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#E67E22]" />
              {t('nav_helpdesk')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit application grievances, report payment delays, or seek document verification help.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-[#8B4513]" /> National Tribal Help Cell Response
            </p>
            <p className="leading-relaxed">
              Every submitted grievance generates a unique tracking ID (GRV-2026-XXXXXX) assigned to the District Tribal Nodal Officer for 48-hour resolution.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/grievance" className="btn-primary w-full text-center text-xs py-2.5">
              Submit Grievance Ticket
            </Link>
            <Link to="/login" className="btn-outline w-full text-center text-xs py-2.5">
              Track Ticket Status
            </Link>
          </div>
        </div>
      </section>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
