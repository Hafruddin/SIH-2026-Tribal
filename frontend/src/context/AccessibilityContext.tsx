import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  cycleFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('tribal_scholar_font_size') as FontSize;
    return saved || 'normal';
  });

  useEffect(() => {
    document.body.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    document.body.classList.add(`font-scale-${fontSize}`);
    localStorage.setItem('tribal_scholar_font_size', fontSize);
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSizeState('large');
    else if (fontSize === 'large') setFontSizeState('xlarge');
    else setFontSizeState('normal');
  };

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, cycleFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
