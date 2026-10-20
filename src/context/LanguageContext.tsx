import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries, type Lang } from '../i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Traduce una clave del diccionario; si falta, devuelve la clave en español o la clave misma. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const readInitialLang = (): Lang => {
  try {
    const saved = localStorage.getItem('oy-lang');
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* almacenamiento bloqueado: se usa español */ }
  return 'es';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';
    try { localStorage.setItem('oy-lang', lang); } catch { /* sin persistencia */ }
  }, [lang]);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let text = dictionaries[lang][key] ?? dictionaries.es[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang: setLangState, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return ctx;
};
