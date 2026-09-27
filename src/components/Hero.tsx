import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UtensilsCrossed, Clock, Star, Heart, Phone, ArrowDown, Smile } from 'lucide-react';
import { HeroConfig, Language, RestaurantInfo } from '../types';
import { translations } from '../utils/i18n';

interface HeroProps {
  hero: HeroConfig;
  restaurant: RestaurantInfo;
  language: Language;
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  hero,
  restaurant,
  language,
  onExploreMenu,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b-2 border-[#1e3b96]">
      {/* Background Glows with Happy Kids Zone Brand Colors */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#2855D9]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-[#71359B]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#FFD11A]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Main Hero Text (Dynamic based on HeroConfig) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12245e] border-2 border-[#FFD11A] text-[#FFD11A] text-xs sm:text-sm font-black tracking-wide shadow-md">
              <Sparkles className="w-4 h-4 text-[#FFD11A] animate-pulse" />
              <span>{isAr ? hero.welcomeBadgeAr : hero.welcomeBadgeEn}</span>
            </div>

            {/* Main Title Line 1 + Highlight */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-['Fredoka','Cairo',sans-serif] leading-tight lg:leading-[1.15]">
              {isAr ? hero.titleLine1Ar : hero.titleLine1En} <br />
              <span className="bg-gradient-to-r from-[#FFD11A] via-[#F7941D] to-[#F2292E] bg-clip-text text-transparent drop-shadow-sm">
                {isAr ? hero.titleHighlightAr : hero.titleHighlightEn}
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-base sm:text-lg text-[#d1dbff] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {isAr ? hero.taglineAr : hero.taglineEn}
            </p>

            {/* Badges / Quick Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
              {/* Badge 1 - Red/Orange accent */}
              <div className="bg-[#12245e] border-2 border-[#F2292E] p-3.5 rounded-2xl text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-center text-[#F2292E] mb-1">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="text-lg font-black text-white font-['Fredoka',sans-serif]">{hero.badge1Value}</div>
                <div className="text-[11px] text-[#ffd3d4] font-bold">{isAr ? hero.badge1LabelAr : hero.badge1LabelEn}</div>
              </div>

              {/* Badge 2 - Yellow accent */}
              <div className="bg-[#12245e] border-2 border-[#FFD11A] p-3.5 rounded-2xl text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-center text-[#FFD11A] mb-1">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="text-lg font-black text-white font-['Fredoka',sans-serif]">{hero.badge2Value}</div>
                <div className="text-[11px] text-[#fff2be] font-bold">{isAr ? hero.badge2LabelAr : hero.badge2LabelEn}</div>
              </div>

              {/* Badge 3 - Green accent */}
              <div className="bg-[#12245e] border-2 border-[#78C943] p-3.5 rounded-2xl text-center shadow-lg transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-center text-[#78C943] mb-1">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="text-lg font-black text-white font-['Fredoka',sans-serif]">{hero.badge3Value}</div>
                <div className="text-[11px] text-[#dbf7c8] font-bold">{isAr ? hero.badge3LabelAr : hero.badge3LabelEn}</div>
              </div>
            </div>

            {/* Customer CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={onExploreMenu}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD11A] via-[#F7941D] to-[#F2292E] hover:brightness-110 text-[#0a163e] font-black text-base shadow-xl shadow-[#F7941D]/30 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <UtensilsCrossed className="w-5 h-5 text-[#0a163e]" />
                <span>{t.exploreMenu}</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                className="px-6 py-3.5 rounded-2xl bg-[#12245e] hover:bg-[#1a3382] border-2 border-[#2855D9] hover:border-[#78C943] text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-md"
              >
                <Phone className="w-4 h-4 text-[#78C943]" />
                <span dir="ltr">{restaurant.phone}</span>
              </a>
            </div>
          </div>

          {/* Right Featured Visual Display */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame with Rainbow Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#F2292E] via-[#FFD11A] to-[#2855D9] rounded-3xl blur-xl opacity-40 animate-pulse pointer-events-none" />
              
              <div className="relative rounded-3xl overflow-hidden border-2 sm:border-3 border-[#2855D9] bg-gradient-to-b from-[#102256] to-[#0a163e] shadow-2xl transition-all duration-300 hover:border-[#FFD11A]">
                
                {/* Spotlight Header Bar: Clearly displays 'الوجبة الأكثر بهجة للأطفال' without cluttering the image */}
                <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between border-b-2 border-[#1e3b96] bg-[#0c1a47]/90 backdrop-blur-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FFD11A]/20 via-[#F7941D]/20 to-[#F2292E]/20 border-2 border-[#FFD11A] text-[#FFD11A] text-xs sm:text-sm font-black shadow-md">
                    <Sparkles className="w-4 h-4 text-[#FFD11A] shrink-0 animate-pulse" />
                    <span className="font-['Cairo','Fredoka',sans-serif] tracking-wide">
                      {isAr ? hero.featuredTagAr : hero.featuredTagEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12245e] border border-[#2855D9] text-[11px] font-bold text-[#FFD11A]">
                    <Star className="w-3.5 h-3.5 fill-current text-[#FFD11A]" />
                    <span className="text-[#d1dbff]">{t.chefSpecial}</span>
                  </div>
                </div>

                {/* Clean, Unobstructed Food Image Container */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-[#07102e] group">
                  <img
                    src={hero.featuredDishImage || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80'}
                    alt={isAr ? hero.featuredDishTitleAr : hero.featuredDishTitleEn}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Gentle gradient vignette to blend into info section */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a47] via-transparent to-transparent opacity-80 pointer-events-none" />
                  
                  {/* Floating Price Pill in bottom corner */}
                  <div className={`absolute bottom-3 ${isAr ? 'left-3' : 'right-3'} bg-[#0a163e]/95 backdrop-blur-md border-2 border-[#FFD11A] px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5`}>
                    <span className="text-xl sm:text-2xl font-black text-[#FFD11A] font-['Fredoka',sans-serif] leading-none">
                      {hero.featuredDishPrice}
                    </span>
                    <span className="text-xs text-[#d1dbff] font-bold">
                      {isAr ? restaurant.currency : restaurant.currencyEn}
                    </span>
                  </div>

                  {/* 'Available Now' Badge */}
                  <div className={`absolute bottom-3 ${isAr ? 'right-3' : 'left-3'} bg-[#78C943] text-[#0a163e] px-3 py-1 rounded-full text-[11px] sm:text-xs font-black shadow-lg flex items-center gap-1.5`}>
                    <span className="w-2 h-2 rounded-full bg-[#0a163e] animate-ping" />
                    <span>{t.availableNow}</span>
                  </div>
                </div>

                {/* Dedicated Dish Information Section with High Contrast and Zero Image Clutter */}
                <div className="p-4 sm:p-5 space-y-2 bg-gradient-to-b from-[#0c1a47] to-[#081335] border-t border-[#1e3b96]">
                  <h4 className="text-white font-black text-lg sm:text-xl font-['Fredoka','Cairo',sans-serif] leading-snug">
                    {isAr ? hero.featuredDishTitleAr : hero.featuredDishTitleEn}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#b8cbff] leading-relaxed line-clamp-2">
                    {isAr ? hero.featuredDishSubtitleAr : hero.featuredDishSubtitleEn}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
