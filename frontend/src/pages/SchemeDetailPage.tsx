import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { BookOpen, CheckCircle2, FileText, Calendar, IndianRupee, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`/api/scholarships/${id}`)
        .then(res => setScheme(res.data.scholarship))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || !scheme) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500 py-20 text-sm font-semibold">
          Loading Scheme Details...
        </div>
        <Footer />
      </div>
    );
  }

  const requiredDocs = JSON.parse(scheme.required_docs || '[]');
  const faqs = JSON.parse(scheme.faq_json || '[]');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-6 sm:p-8 rounded-xl shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-[#E67E22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {scheme.code}
            </span>
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Applications Open • Deadline: {scheme.deadline}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold">{scheme.name_en}</h2>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-3xl">
            {scheme.description_en}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={`/apply?schemeId=${scheme.id}`}
              className="btn-accent text-xs sm:text-sm px-6 py-3 font-bold shadow-lg hover:scale-105 transition"
            >
              Apply Now via OTR Vault
            </Link>
            <Link
              to={`/eligibility?academicLevel=${encodeURIComponent(scheme.academic_level)}`}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-5 py-3 rounded-md font-medium border border-white/30"
            >
              Check My Specific Eligibility
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Overview & Benefits */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-[#E67E22]" /> Scheme Benefits & Financial Structure
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {scheme.benefits}
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E67E22]" /> Guidelines & Eligibility Rules
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {scheme.guidelines}
              </p>
            </div>

            {/* FAQs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#E67E22]" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq: any, fIdx: number) => (
                  <div key={fIdx} className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs">
                    <p className="font-bold text-gray-900 mb-1">Q: {faq.q}</p>
                    <p className="text-gray-600">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Required Documents & Meta */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h4 className="text-sm font-bold text-[#8B4513] uppercase tracking-wider border-b pb-2">
                Required Documents (Vault Reusable)
              </h4>
              <ul className="space-y-2 text-xs text-gray-700">
                {requiredDocs.map((docName: string, idx: number) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{docName}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-bold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8B4513]" /> Verify Once, Reuse Securely
              </p>
              <p className="leading-relaxed">
                You do not need to re-upload these documents if they already exist in your verified Document Vault or DigiLocker profile.
              </p>
            </div>
          </div>
        </div>
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
