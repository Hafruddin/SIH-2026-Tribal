import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, HelpCircle, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#5C2E0B] text-white pt-12 pb-6 border-t-4 border-[#E67E22]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Portal Summary */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏛️</span>
            <h3 className="text-xl font-bold text-white tracking-wide">Tribal Scholar</h3>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed">
            Unified Scholarship Portal for Scheduled Tribe Students, Ministry of Tribal Affairs, Government of India. Empowering indigenous youth with seamless educational funding.
          </p>
          <div className="bg-[#8B4513]/60 p-3 rounded border border-[#E67E22]/40 text-[11px] text-orange-200">
            <strong>Prototype Disclaimer:</strong> Created for Smart India Hackathon 2026 (Problem Statement 26238). Demo API interfaces simulate government integrations.
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#E67E22] mb-4 border-b border-[#8B4513] pb-2">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs text-gray-200">
            <li><Link to="/schemes" className="hover:text-[#E67E22] transition">Pre-Matric ST Scholarship</Link></li>
            <li><Link to="/schemes" className="hover:text-[#E67E22] transition">Post-Matric ST Scholarship (PMS-ST)</Link></li>
            <li><Link to="/schemes" className="hover:text-[#E67E22] transition">Top Class Education Scheme</Link></li>
            <li><Link to="/schemes" className="hover:text-[#E67E22] transition">National Fellowship for ST (NFST)</Link></li>
            <li><Link to="/schemes" className="hover:text-[#E67E22] transition">National Overseas Scholarship (NOS)</Link></li>
            <li><Link to="/register" className="hover:text-[#E67E22] transition font-bold text-amber-300">One-Time Registration (OTR)</Link></li>
          </ul>
        </div>

        {/* Col 3: Student Services */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#E67E22] mb-4 border-b border-[#8B4513] pb-2">
            Student Support
          </h4>
          <ul className="space-y-2 text-xs text-gray-200">
            <li><Link to="/grievance" className="hover:text-[#E67E22] transition">Grievance Registration</Link></li>
            <li><Link to="/announcements" className="hover:text-[#E67E22] transition">Latest Government Circulars</Link></li>
            <li><a href="#jago-chat" className="hover:text-[#E67E22] transition">JAGO AI Chatbot Assistant</a></li>
            <li><Link to="/login" className="hover:text-[#E67E22] transition">Track Application Status</Link></li>
            <li><Link to="/login" className="hover:text-[#E67E22] transition">Document Vault & DigiLocker</Link></li>
          </ul>
        </div>

        {/* Col 4: Helpline & Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#E67E22] mb-4 border-b border-[#8B4513] pb-2">
            National Helpline
          </h4>
          <div className="space-y-3 text-xs text-gray-200">
            <div className="flex items-start space-x-2">
              <Phone className="w-4 h-4 text-[#E67E22] mt-0.5" />
              <div>
                <p className="font-semibold text-white">Toll-Free Scholarship Helpline</p>
                <p className="text-amber-200">1800-11-8080 / 011-23381420</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 text-[#E67E22] mt-0.5" />
              <div>
                <p className="font-semibold text-white">Email Support</p>
                <p className="text-amber-200">helpdesk-tribal@gov.in</p>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-gray-300">
              Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-4 border-t border-[#8B4513] flex flex-col md:flex-row justify-between items-center text-[11px] text-gray-300 gap-2">
        <p>© 2026 Ministry of Tribal Affairs, Government of India. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Accessibility Statement (WCAG 2.1 AA)</span>
        </div>
      </div>
    </footer>
  );
};
