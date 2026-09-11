import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Download, Calendar } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/announcements')
      .then(res => setAnnouncements(res.data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="bg-amber-100 text-[#8B4513] text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            Official Notices & Notifications
          </span>
          <h2 className="text-3xl font-extrabold text-[#8B4513] mt-2">
            Latest Government Circulars
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Official guidelines, opening notices, income ceiling updates, and DBT bank account mandates issued by Ministry of Tribal Affairs.
          </p>
        </div>

        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#006699] transition">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded">
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Published: {ann.publish_date}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">{ann.title_en}</h3>
                <p className="text-xs text-[#8B4513] font-semibold">{ann.title_hi}</p>
              </div>

              <a
                href={`/api/announcements/${ann.id}/download?lang=${language}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs px-4 py-2 font-bold flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-4 h-4" /> {t('btn_download_pdf')}
              </a>
            </div>
          ))}
        </div>
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
