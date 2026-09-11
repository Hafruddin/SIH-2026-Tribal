import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { Language, languageNames } from '../i18n/translations';
import { Menu, X, User, LogOut, Shield, Award, ChevronDown, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { fontSize, cycleFontSize } = useAccessibility();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const fontLabel = fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++';

  const [isReadingPage, setIsReadingPage] = useState(false);

  return (
    <header className="portal-header">
      {/* Official Government Top Banner */}
      <div className="gov-banner">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
          <span className="font-medium text-xs sm:text-sm">{t('official_portal')}</span>
          <span className="hidden md:inline-block text-[#E67E22] font-semibold text-xs ml-2 bg-black/30 px-2 py-0.5 rounded border border-[#E67E22]/40">
            SIH 2026 Prototype
          </span>
        </div>

        <div className="accessibility-controls flex items-center space-x-3">
          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs flex items-center space-x-1 border border-white/30 transition"
              aria-label="Change Language"
            >
              <span>🌐 {languageNames[language]}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white text-gray-900 shadow-xl rounded border border-gray-200 py-1 z-50">
                {(Object.keys(languageNames) as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 font-medium ${
                      language === lang ? 'bg-amber-100 text-[#8B4513] font-bold' : ''
                    }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Resizing Controls A / A+ / A++ */}
          <button
            onClick={cycleFontSize}
            className="bg-[#E67E22] hover:bg-[#D35400] text-white px-2 py-0.5 rounded text-xs font-bold transition shadow-sm"
            title="Toggle Accessibility Font Size (A, A+, A++)"
          >
            {fontLabel}
          </button>

          {/* Page Read Aloud Feature */}
          <button
            onClick={() => {
              if (!('speechSynthesis' in window)) return;
              if (isReadingPage || window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                setIsReadingPage(false);
                return;
              }
              window.speechSynthesis.cancel();
              const mainText = document.querySelector('main')?.textContent?.slice(0, 300) || 'Tribal Scholar Official Portal';
              const u = new SpeechSynthesisUtterance(mainText);
              const langCodes: Record<string, string> = {
                en: 'en-IN',
                hi: 'hi-IN',
                ta: 'ta-IN',
                te: 'te-IN',
                mr: 'mr-IN',
                bn: 'bn-IN',
                ml: 'ml-IN',
                kn: 'kn-IN',
              };
              u.lang = langCodes[language] || 'en-IN';
              u.rate = 0.85;
              u.onend = () => setIsReadingPage(false);
              u.onerror = () => setIsReadingPage(false);
              setIsReadingPage(true);
              window.speechSynthesis.speak(u);
            }}
            className={`px-2.5 py-1 rounded text-xs font-bold transition border hidden sm:inline-flex items-center gap-1 ${
              isReadingPage
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
            }`}
            title="Read current page content aloud or stop"
          >
            <span>{isReadingPage ? '⏹ Stop' : '🔊 Read Page'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="logo-section">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-bold text-xl border-2 border-[#E67E22] shadow-md group-hover:scale-105 transition">
              🏛️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#8B4513] leading-tight tracking-tight">
                {t('portal_name')}
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase hidden sm:block">
                Ministry of Tribal Affairs • Govt of India
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
          <li>
            <Link to="/" className="hover:text-[#8B4513] transition py-1">{t('nav_home')}</Link>
          </li>
          <li>
            <Link to="/schemes" className="hover:text-[#8B4513] transition py-1">{t('nav_schemes')}</Link>
          </li>
          <li>
            <Link to="/announcements" className="hover:text-[#8B4513] transition py-1">{t('nav_circulars')}</Link>
          </li>
          <li>
            <Link to="/grievance" className="hover:text-[#8B4513] transition py-1">{t('nav_helpdesk')}</Link>
          </li>
          {isAuthenticated && user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="text-[#006699] font-bold hover:underline flex items-center gap-1">
                <Shield className="w-4 h-4" /> Admin Portal
              </Link>
            </li>
          )}
        </ul>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to={user?.role === 'admin' ? '/admin' : '/student/dashboard'}
                className="btn-primary text-xs flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>{user?.role === 'admin' ? 'Admin Dashboard' : `Dashboard (${user?.otrId || 'Student'})`}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="auth-buttons flex items-center space-x-3">
              <Link to="/login" className="btn btn-outline text-xs">
                {t('btn_login')}
              </Link>
              <Link to="/register" className="btn btn-primary text-xs">
                {t('btn_otr')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-800 font-medium hover:text-[#8B4513]"
          >
            {t('nav_home')}
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-800 font-medium hover:text-[#8B4513]"
          >
            {t('nav_schemes')}
          </Link>
          <Link
            to="/announcements"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-800 font-medium hover:text-[#8B4513]"
          >
            {t('nav_circulars')}
          </Link>
          <Link
            to="/grievance"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-800 font-medium hover:text-[#8B4513]"
          >
            {t('nav_helpdesk')}
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <Link
                to={user?.role === 'admin' ? '/admin' : '/student/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn-primary text-center block text-sm"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-center py-2 text-red-600 font-medium text-sm hover:bg-red-50 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn btn-outline text-center block text-sm"
              >
                {t('btn_login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn btn-primary text-center block text-sm"
              >
                {t('btn_otr')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
