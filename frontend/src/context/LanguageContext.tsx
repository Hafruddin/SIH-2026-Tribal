import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved1 = localStorage.getItem('tribalScholarLanguage') as Language;
    const saved2 = localStorage.getItem('tribal_scholar_lang') as Language;
    const initial = saved1 || saved2;
    return initial && translations[initial] ? initial : 'en';
  });

  const setLanguage = (lang: Language) => {
    if (!translations[lang]) return;
    setLanguageState(lang);
    localStorage.setItem('tribalScholarLanguage', lang);
    localStorage.setItem('tribal_scholar_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
