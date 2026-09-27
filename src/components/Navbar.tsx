import React, { useState } from 'react';
import { Search, X, Menu as MenuIcon, Languages, Home } from 'lucide-react';
import { Language, RestaurantInfo } from '../types';
import { translations } from '../utils/i18n';
import { HappyKidsLogo } from './HappyKidsLogo';

interface NavbarProps {
  restaurant: RestaurantInfo;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBackToPortal: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  restaurant,
  language,
  onLanguageChange,
  onBackToPortal,
  onSearchChange,
  searchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-[#0a163e]/95 backdrop-blur-md border-b-2 border-[#2855D9] shadow-lg shadow-[#0a163e]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <HappyKidsLogo size="md" variant="horizontal" />
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD11A]" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#12245e] text-sm text-white placeholder-[#8ca2e2] px-10 py-2.5 rounded-2xl border-2 border-[#2855D9] focus:outline-none focus:border-[#FFD11A] transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8ca2e2] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Language + Back to Portal */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
              className="px-3.5 py-2 rounded-2xl bg-[#12245e] hover:bg-[#1a3382] border-2 border-[#2855D9] hover:border-[#FFD11A] text-xs font-bold text-[#FFD11A] flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="تغيير اللغة / Change Language"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Back to Portal / Switch View */}
            <button
              onClick={onBackToPortal}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-[#12245e] hover:bg-[#1a3382] border-2 border-[#2855D9] text-xs font-bold text-[#d1dbff] hover:text-white flex items-center gap-1.5 transition-all shadow-md"
              title={t.backToPortal}
            >
              <Home className="w-4 h-4 text-[#78C943]" />
              <span className="hidden sm:inline">{t.backToPortal}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-[#12245e] border-2 border-[#2855D9] text-[#d1dbff] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Info Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1e3b96] space-y-3 animate-in fade-in duration-200">
            <div className="relative w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD11A]" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#12245e] text-sm text-white placeholder-[#8ca2e2] px-10 py-2.5 rounded-2xl border border-[#2855D9] focus:outline-none focus:border-[#FFD11A]"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onBackToPortal}
                className="text-xs text-[#d1dbff] flex items-center gap-1 hover:text-white font-bold"
              >
                <Home className="w-3.5 h-3.5 text-[#78C943]" />
                <span>{t.backToPortal}</span>
              </button>
              <button
                onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="text-xs font-bold text-[#FFD11A]"
              >
                {language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
