import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { PortalGate } from './components/PortalGate';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuCard } from './components/MenuCard';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';

import {
  MenuItem,
  Category,
  RestaurantInfo,
  HeroConfig,
  Language,
  MenuLayoutMode,
} from './types';

import {
  INITIAL_MENU_ITEMS,
  INITIAL_CATEGORIES,
  INITIAL_RESTAURANT_INFO,
  INITIAL_HERO_CONFIG,
} from './data/mockData';

import { initAuth } from './services/auth';

import {
  loadMenuData,
  saveMenuItems,
  saveCategories,
  saveRestaurant,
  saveHero,
} from './services/firestore';

import { translations } from './utils/i18n';
import { User } from 'firebase/auth';

import {
  Utensils,
  Flame,
  Beef,
  Salad,
  Cake,
  Coffee,
  Sparkles,
  SlidersHorizontal,
  Smile,
  PartyPopper,
  LayoutGrid,
  StretchHorizontal,
  GalleryHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const STORAGE_KEY_ITEMS = 'happy_kids_items_v4';
const STORAGE_KEY_RESTAURANT = 'happy_kids_restaurant_v4';
const STORAGE_KEY_CATEGORIES = 'happy_kids_categories_v4';
const STORAGE_KEY_HERO = 'happy_kids_hero_v4';
const STORAGE_KEY_LANG = 'happy_kids_lang_v4';
const STORAGE_KEY_LAYOUT = 'happy_kids_layout_v4';


/* =========================================================
   ANIMATION
========================================================= */

const gridContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.25,
      staggerChildren: 0.055,
      delayChildren: 0.03,
    },
  },

  exit: {
    opacity: 0,
    y: -15,
    scale: 0.98,

    transition: {
      duration: 0.18,
      ease: 'easeIn' as const,
    },
  },
};


/* =========================================================
   APP
========================================================= */

export default function App() {

  /* =======================================================
     DATABASE LOADING
  ======================================================= */

  const [isLoadingDatabase, setIsLoadingDatabase] = useState(true);


  /* =======================================================
     VIEW MODE
  ======================================================= */

  const [viewMode, setViewMode] = useState<
    'portal' | 'customer' | 'admin'
  >('portal');


  /* =======================================================
     LANGUAGE
  ======================================================= */

  const [language, setLanguage] = useState<Language>(() => {

    try {

      const saved = localStorage.getItem(STORAGE_KEY_LANG);

      return saved === 'en' || saved === 'ar'
        ? saved
        : 'ar';

    } catch {

      return 'ar';

    }

  });


  /* =======================================================
     ADMIN AUTH
  ======================================================= */

  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState(false);

  const [isAdminModalOpen, setIsAdminModalOpen] =
    useState(false);


  /* =======================================================
     MENU ITEMS
  ======================================================= */

  const [items, setItems] = useState<MenuItem[]>(() => {

    try {

      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);

      return saved
        ? JSON.parse(saved)
        : INITIAL_MENU_ITEMS;

    } catch {

      return INITIAL_MENU_ITEMS;

    }

  });


  /* =======================================================
     CATEGORIES
  ======================================================= */

  const [categories, setCategories] =
    useState<Category[]>(() => {

      try {

        const saved =
          localStorage.getItem(STORAGE_KEY_CATEGORIES);

        return saved
          ? JSON.parse(saved)
          : INITIAL_CATEGORIES;

      } catch {

        return INITIAL_CATEGORIES;

      }

    });


  /* =======================================================
     RESTAURANT
  ======================================================= */

  const [restaurant, setRestaurant] =
    useState<RestaurantInfo>(() => {

      try {

        const saved =
          localStorage.getItem(STORAGE_KEY_RESTAURANT);

        return saved
          ? JSON.parse(saved)
          : INITIAL_RESTAURANT_INFO;

      } catch {

        return INITIAL_RESTAURANT_INFO;

      }

    });


  /* =======================================================
     HERO
  ======================================================= */

  const [heroConfig, setHeroConfig] =
    useState<HeroConfig>(() => {

      try {

        const saved =
          localStorage.getItem(STORAGE_KEY_HERO);

        if (saved) {

          return {
            ...INITIAL_HERO_CONFIG,
            ...JSON.parse(saved),
          };

        }

        return INITIAL_HERO_CONFIG;

      } catch {

        return INITIAL_HERO_CONFIG;

      }

    });


  /* =======================================================
     CATEGORY / SEARCH / SORT
  ======================================================= */

  const [selectedCategory, setSelectedCategory] =
    useState<string>('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [sortBy, setSortBy] =
    useState<
      'default' |
      'price-asc' |
      'price-desc' |
      'popular'
    >('default');


  /* =======================================================
     LAYOUT
  ======================================================= */

  const [layoutMode, setLayoutMode] =
    useState<MenuLayoutMode>(() => {

      try {

        const saved =
          localStorage.getItem(STORAGE_KEY_LAYOUT)
          as MenuLayoutMode;

        return (
          saved === 'grid' ||
          saved === 'horizontal' ||
          saved === 'carousel'
        )
          ? saved
          : 'grid';

      } catch {

        return 'grid';

      }

    });


  /* =======================================================
     REFS
  ======================================================= */

  const carouselRef =
    useRef<HTMLDivElement>(null);

  const menuSectionRef =
    useRef<HTMLDivElement>(null);


  /* =======================================================
     GOOGLE USER
  ======================================================= */

  const [user, setUser] =
    useState<User | null>(null);


  /* =======================================================
     TRANSLATIONS
  ======================================================= */

  const t = translations[language];


  /* =======================================================
     LOAD FIRESTORE DATA
     
     هذا هو الجزء المهم:
     عند فتح الموقع يتم جلب البيانات من Firestore.
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const loadDatabase = async () => {

      setIsLoadingDatabase(true);

      try {

        const data = await loadMenuData();

        if (cancelled) return;

        /*
         * إذا وجدنا بيانات في Firestore
         * نستخدمها بدلاً من البيانات المحلية.
         */

        if (data?.items) {

          setItems(data.items);

          localStorage.setItem(
            STORAGE_KEY_ITEMS,
            JSON.stringify(data.items)
          );

        }

        if (data?.categories) {

          setCategories(data.categories);

          localStorage.setItem(
            STORAGE_KEY_CATEGORIES,
            JSON.stringify(data.categories)
          );

        }

        if (data?.restaurant) {

          setRestaurant((current) => ({
            ...current,
            ...data.restaurant,
          }));

          localStorage.setItem(
            STORAGE_KEY_RESTAURANT,
            JSON.stringify({
              ...restaurant,
              ...data.restaurant,
            })
          );

        }

        if (data?.hero) {

          setHeroConfig((current) => ({
            ...current,
            ...data.hero,
          }));

          localStorage.setItem(
            STORAGE_KEY_HERO,
            JSON.stringify({
              ...heroConfig,
              ...data.hero,
            })
          );

        }

      } catch (error) {

        console.error(
          'Failed to load Firestore data:',
          error
        );

        /*
         * لا نوقف الموقع إذا فشلت قاعدة البيانات.
         *
         * سيستمر الموقع باستخدام البيانات الموجودة
         * في localStorage أو البيانات الافتراضية.
         */

      } finally {

        if (!cancelled) {

          setIsLoadingDatabase(false);

        }

      }

    };


    loadDatabase();


    return () => {

      cancelled = true;

    };

  }, []);


  /* =======================================================
     UPDATE MENU ITEMS
     
     لوحة التحكم تستعمل هذه الدالة.
     يتم:
     1. تحديث الشاشة
     2. حفظ Firestore
     3. تحديث localStorage كنسخة احتياطية
  ======================================================= */

  const handleUpdateItems = async (
    newItems: MenuItem[]
  ) => {

    setItems(newItems);

    try {

      localStorage.setItem(
        STORAGE_KEY_ITEMS,
        JSON.stringify(newItems)
      );

      await saveMenuItems(newItems);

      console.log(
        'Menu items saved to Firestore'
      );

    } catch (error) {

      console.error(
        'Failed to save menu items:',
        error
      );

      alert(
        language === 'ar'
          ? 'حدث خطأ أثناء حفظ المنيو في قاعدة البيانات'
          : 'Failed to save menu to database'
      );

    }

  };


  /* =======================================================
     UPDATE CATEGORIES
  ======================================================= */

  const handleUpdateCategories = async (
    newCategories: Category[]
  ) => {

    setCategories(newCategories);

    try {

      localStorage.setItem(
        STORAGE_KEY_CATEGORIES,
        JSON.stringify(newCategories)
      );

      await saveCategories(newCategories);

      console.log(
        'Categories saved to Firestore'
      );

    } catch (error) {

      console.error(
        'Failed to save categories:',
        error
      );

      alert(
        language === 'ar'
          ? 'حدث خطأ أثناء حفظ التصنيفات'
          : 'Failed to save categories'
      );

    }

  };


  /* =======================================================
     UPDATE RESTAURANT
  ======================================================= */

  const handleUpdateRestaurant = async (
    newRestaurant: RestaurantInfo
  ) => {

    setRestaurant(newRestaurant);

    try {

      localStorage.setItem(
        STORAGE_KEY_RESTAURANT,
        JSON.stringify(newRestaurant)
      );

      await saveRestaurant(newRestaurant);

      console.log(
        'Restaurant information saved to Firestore'
      );

    } catch (error) {

      console.error(
        'Failed to save restaurant:',
        error
      );

      alert(
        language === 'ar'
          ? 'حدث خطأ أثناء حفظ معلومات المطعم'
          : 'Failed to save restaurant information'
      );

    }

  };


  /* =======================================================
     UPDATE HERO
  ======================================================= */

  const handleUpdateHero = async (
    newHero: HeroConfig
  ) => {

    setHeroConfig(newHero);

    try {

      localStorage.setItem(
        STORAGE_KEY_HERO,
        JSON.stringify(newHero)
      );

      await saveHero(newHero);

      console.log(
        'Hero configuration saved to Firestore'
      );

    } catch (error) {

      console.error(
        'Failed to save hero:',
        error
      );

      alert(
        language === 'ar'
          ? 'حدث خطأ أثناء حفظ واجهة الصفحة الرئيسية'
          : 'Failed to save hero configuration'
      );

    }

  };


  /* =======================================================
     LAYOUT LOCAL STORAGE
     
     طريقة العرض ليست بيانات المطعم،
     لذلك تبقى محلية على الجهاز.
  ======================================================= */

  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEY_LAYOUT,
      layoutMode
    );

  }, [layoutMode]);


  /* =======================================================
     LANGUAGE
  ======================================================= */

  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEY_LANG,
      language
    );

    document.documentElement.lang =
      language;

    document.documentElement.dir =
      language === 'ar'
        ? 'rtl'
        : 'ltr';

  }, [language]);


  /* =======================================================
     GOOGLE AUTH
  ======================================================= */

  useEffect(() => {

    const unsubscribe = initAuth(

      (currentUser) => {

        setUser(currentUser);

      },

      () => {

        setUser(null);

      }

    );

    return () => {

      if (typeof unsubscribe === 'function') {

        unsubscribe();

      }

    };

  }, []);


  /* =======================================================
     CAROUSEL SCROLL
  ======================================================= */

  const handleScrollCarousel = (
    direction: 'prev' | 'next'
  ) => {

    if (!carouselRef.current) return;

    const isRTL =
      language === 'ar';

    const scrollAmount = 340;

    const delta =
      direction === 'next'
        ? (
            isRTL
              ? -scrollAmount
              : scrollAmount
          )
        : (
            isRTL
              ? scrollAmount
              : -scrollAmount
          );

    carouselRef.current.scrollBy({
      left: delta,
      behavior: 'smooth',
    });

  };


  /* =======================================================
     SCROLL TO MENU
  ======================================================= */

  const scrollToMenu = () => {

    menuSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
    });

  };


  /* =======================================================
     FILTERED ITEMS
  ======================================================= */

  const filteredItems = useMemo(() => {

    return items

      .filter((item) => {

        const matchesCategory =
          selectedCategory === 'all' ||
          item.category === selectedCategory;

        const query =
          searchQuery
            .trim()
            .toLowerCase();

        const matchesSearch =
          !query ||

          item.name
            .toLowerCase()
            .includes(query) ||

          (
            item.nameEn &&
            item.nameEn
              .toLowerCase()
              .includes(query)
          ) ||

          item.description
            .toLowerCase()
            .includes(query) ||

          (
            item.descriptionEn &&
            item.descriptionEn
              .toLowerCase()
              .includes(query)
          );

        return (
          matchesCategory &&
          matchesSearch
        );

      })

      .sort((a, b) => {

        if (
          sortBy === 'price-asc'
        ) {

          return a.price - b.price;

        }

        if (
          sortBy === 'price-desc'
        ) {

          return b.price - a.price;

        }

        if (
          sortBy === 'popular'
        ) {

          return (
            (b.isPopular ? 1 : 0) -
            (a.isPopular ? 1 : 0)
          );

        }

        /*
         * Default:
         * Chef Special
         * ثم Popular
         */

        const aScore =
          (a.isChefSpecial ? 2 : 0) +
          (a.isPopular ? 1 : 0);

        const bScore =
          (b.isChefSpecial ? 2 : 0) +
          (b.isPopular ? 1 : 0);

        return bScore - aScore;

      });

  }, [
    items,
    selectedCategory,
    searchQuery,
    sortBy,
  ]);


  /* =======================================================
     CATEGORY ICON
  ======================================================= */

  const renderCategoryIcon = (
    iconName?: string
  ) => {

    switch (iconName) {

      case 'Flame':
        return (
          <Flame className="w-4 h-4" />
        );

      case 'Beef':
        return (
          <Beef className="w-4 h-4" />
        );

      case 'Salad':
        return (
          <Salad className="w-4 h-4" />
        );

      case 'Cake':
        return (
          <Cake className="w-4 h-4" />
        );

      case 'Coffee':
        return (
          <Coffee className="w-4 h-4" />
        );

      case 'Smile':
        return (
          <Smile className="w-4 h-4" />
        );

      default:
        return (
          <Utensils className="w-4 h-4" />
        );

    }

  };


  /* =======================================================
     CATEGORY COLORS
  ======================================================= */

  const getCategoryColor = (
    index: number
  ) => {

    const colors = [

      '#F2292E',
      '#F7941D',
      '#FFD11A',
      '#78C943',
      '#71359B',
      '#2855D9',

    ];

    return colors[
      index % colors.length
    ];

  };


  /* =======================================================
     CURRENT CATEGORY
  ======================================================= */

  const currentCategoryObj =
    useMemo(() => {

      if (
        selectedCategory === 'all'
      ) {

        return null;

      }

      return (
        categories.find(
          (c) =>
            c.id === selectedCategory
        ) || null
      );

    }, [
      categories,
      selectedCategory,
    ]);


  /* =======================================================
     ACTIVE CATEGORY COLOR
  ======================================================= */

  const activeCategoryColor =
    useMemo(() => {

      if (
        selectedCategory === 'all'
      ) {

        return '#FFD11A';

      }

      const idx =
        categories.findIndex(
          (c) =>
            c.id === selectedCategory
        );

      return getCategoryColor(
        idx >= 0 ? idx : 0
      );

    }, [
      categories,
      selectedCategory,
    ]);


  /* =======================================================
     DATABASE LOADING SCREEN
  ======================================================= */

  if (isLoadingDatabase) {

    return (

      <div
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className="
          min-h-screen
          bg-[#0a163e]
          text-white
          flex
          items-center
          justify-center
          font-['Cairo',sans-serif]
        "
      >

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            flex
            flex-col
            items-center
            gap-5
          "
        >

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
            className="
              w-16
              h-16
              rounded-2xl
              bg-[#FFD11A]
              flex
              items-center
              justify-center
              shadow-lg
              shadow-[#FFD11A]/30
            "
          >

            <Utensils
              className="
                w-8
                h-8
                text-[#0a163e]
              "
            />

          </motion.div>

          <div className="text-center">

            <h2
              className="
                text-xl
                font-black
                font-['Fredoka','Cairo',sans-serif]
              "
            >
              {language === 'ar'
                ? 'جاري تحميل المنيو...'
                : 'Loading menu...'}
            </h2>

            <p
              className="
                text-sm
                text-[#9ebbf9]
                mt-1
              "
            >
              {language === 'ar'
                ? 'جاري الاتصال بقاعدة البيانات'
                : 'Connecting to database'}
            </p>

          </div>

        </motion.div>

      </div>

    );

  }


  /* =======================================================
     PORTAL
  ======================================================= */

  if (
    viewMode === 'portal'
  ) {

    return (

      <AnimatePresence mode="wait">

        <motion.div
          key="portal-view"
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.98,
          }}
          transition={{
            duration: 0.3,
          }}
        >

          <PortalGate

            language={language}

            onLanguageChange={
              setLanguage
            }

            restaurant={restaurant}

            hero={heroConfig}

            onSelectCustomerView={() =>
              setViewMode('customer')
            }

            onAdminLoginSuccess={() => {

              setIsAdminAuthenticated(
                true
              );

              setViewMode('admin');

              setIsAdminModalOpen(
                true
              );

            }}

          />

        </motion.div>

      </AnimatePresence>

    );

  }


  /* =======================================================
     ADMIN
  ======================================================= */

  if (
    viewMode === 'admin'
  ) {

    return (

      <div
        className="
          min-h-screen
          bg-[#0a163e]
          text-white
          flex
          flex-col
          font-['Cairo',sans-serif]
        "
      >

        <AdminModal

          isOpen={true}

          onClose={() => {

            setIsAdminModalOpen(false);

            setViewMode('portal');

          }}

          items={items}

          categories={categories}

          hero={heroConfig}

          restaurant={restaurant}

          language={language}


          /*
           * IMPORTANT:
           * لا نستخدم setItems هنا.
           *
           * نستخدم handleUpdateItems
           * حتى يتم الحفظ في Firestore.
           */

          onUpdateItems={
            handleUpdateItems
          }

          onUpdateCategories={
            handleUpdateCategories
          }

          onUpdateHero={
            handleUpdateHero
          }

          onUpdateRestaurant={
            handleUpdateRestaurant
          }


          user={user}

          onUserChange={
            setUser
          }

          onAdminLogout={() => {

            setIsAdminAuthenticated(
              false
            );

            setIsAdminModalOpen(
              false
            );

            setViewMode('portal');

          }}

        />

      </div>

    );

  }


  /* =======================================================
     CUSTOMER VIEW
  ======================================================= */

  return (

    <motion.div

      initial={{
        opacity: 0,
      }}

      animate={{
        opacity: 1,
      }}

      transition={{
        duration: 0.4,
      }}

      className="
        min-h-screen
        bg-[#0a163e]
        text-white
        flex
        flex-col
        font-['Cairo',sans-serif]
        selection:bg-[#FFD11A]
        selection:text-[#0a163e]
      "
    >


      {/* ===================================================
          NAVBAR
      =================================================== */}

      <Navbar

        restaurant={restaurant}

        language={language}

        onLanguageChange={
          setLanguage
        }

        onBackToPortal={() =>
          setViewMode('portal')
        }

        onSearchChange={
          setSearchQuery
        }

        searchQuery={
          searchQuery
        }

      />


      {/* ===================================================
          HERO
      =================================================== */}

      <Hero

        hero={heroConfig}

        restaurant={restaurant}

        language={language}

        onExploreMenu={
          scrollToMenu
        }

      />


      {/* ===================================================
          MAIN MENU
      =================================================== */}

      <main

        ref={menuSectionRef}

        className="
          flex-1
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-12
          w-full
          space-y-8
        "
      >


        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            justify-between
            gap-4
            border-b-2
            border-[#1e3b96]
            pb-6
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                font-black
                text-[#FFD11A]
                uppercase
                tracking-wider
                mb-1
              "
            >

              <Sparkles
                className="
                  w-3.5
                  h-3.5
                  animate-spin
                "
                style={{
                  animationDuration: '5s',
                }}
              />

              <span>
                {t.menuSubtitle}
              </span>

            </div>


            <h2
              className="
                text-2xl
                sm:text-4xl
                font-black
                text-white
                font-['Fredoka','Cairo',sans-serif]
                flex
                items-center
                gap-3
              "
            >

              <span>
                {t.menuTitle}
              </span>

              <motion.span

                animate={{
                  rotate: [
                    0,
                    15,
                    -10,
                    15,
                    0,
                  ],
                }}

                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut',
                }}

                className="
                  inline-block
                  text-2xl
                "
              >
                🎈
              </motion.span>

            </h2>

          </div>


          {/* =================================================
              CONTROLS
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-2.5
              flex-wrap
            "
          >


            {/* =============================================
                LAYOUT SWITCHER
            ============================================= */}

            <div
              className="
                flex
                items-center
                bg-[#0d1e52]
                border-2
                border-[#2855D9]
                p-1
                rounded-2xl
                shadow-md
              "
            >

              <span
                className="
                  text-[11px]
                  font-black
                  text-[#a4bcf7]
                  px-2
                  hidden
                  lg:inline
                "
              >
                {t.layoutMode}:
              </span>


              {/* GRID */}

              <motion.button

                onClick={() =>
                  setLayoutMode('grid')
                }

                whileTap={{
                  scale: 0.92,
                }}

                whileHover={{
                  scale: 1.05,
                }}

                className={`
                  relative
                  px-3
                  py-1.5
                  rounded-xl
                  text-xs
                  font-black
                  flex
                  items-center
                  gap-1.5
                  transition-colors
                  cursor-pointer
                  select-none
                  ${
                    layoutMode === 'grid'
                      ? 'text-[#0a163e]'
                      : 'text-white hover:text-[#FFD11A]'
                  }
                `}

                title={
                  t.layoutGrid
                }
              >

                {layoutMode === 'grid' && (

                  <motion.div

                    layoutId="activeLayoutIndicator"

                    className="
                      absolute
                      inset-0
                      bg-[#FFD11A]
                      rounded-xl
                      shadow-md
                      -z-10
                    "

                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 25,
                    }}

                  />

                )}

                <LayoutGrid
                  className="
                    w-3.5
                    h-3.5
                  "
                />

                <span
                  className="
                    hidden
                    sm:inline
                  "
                >
                  {t.layoutGridShort}
                </span>

              </motion.button>


              {/* HORIZONTAL */}

              <motion.button

                onClick={() =>
                  setLayoutMode(
                    'horizontal'
                  )
                }

                whileTap={{
                  scale: 0.92,
                }}

                whileHover={{
                  scale: 1.05,
                }}

                className={`
                  relative
                  px-3
                  py-1.5
                  rounded-xl
                  text-xs
                  font-black
                  flex
                  items-center
                  gap-1.5
                  transition-colors
                  cursor-pointer
                  select-none
                  ${
                    layoutMode ===
                    'horizontal'
                      ? 'text-white'
                      : 'text-white hover:text-[#FFD11A]'
                  }
                `}

                title={
                  t.layoutHorizontal
                }
              >

                {layoutMode ===
                  'horizontal' && (

                  <motion.div

                    layoutId="activeLayoutIndicator"

                    className="
                      absolute
                      inset-0
                      bg-[#2855D9]
                      rounded-xl
                      shadow-md
                      -z-10
                    "

                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 25,
                    }}

                  />

                )}

                <StretchHorizontal
                  className="
                    w-3.5
                    h-3.5
                  "
                />

                <span
                  className="
                    hidden
                    sm:inline
                  "
                >
                  {t.layoutHorizontalShort}
                </span>

              </motion.button>


              {/* CAROUSEL */}

              <motion.button

                onClick={() =>
                  setLayoutMode(
                    'carousel'
                  )
                }

                whileTap={{
                  scale: 0.92,
                }}

                whileHover={{
                  scale: 1.05,
                }}

                className={`
                  relative
                  px-3
                  py-1.5
                  rounded-xl
                  text-xs
                  font-black
                  flex
                  items-center
                  gap-1.5
                  transition-colors
                  cursor-pointer
                  select-none
                  ${
                    layoutMode ===
                    'carousel'
                      ? 'text-[#0a163e]'
                      : 'text-white hover:text-[#FFD11A]'
                  }
                `}

                title={
                  t.layoutCarousel
                }
              >

                {layoutMode ===
                  'carousel' && (

                  <motion.div

                    layoutId="activeLayoutIndicator"

                    className="
                      absolute
                      inset-0
                      bg-[#78C943]
                      rounded-xl
                      shadow-md
                      -z-10
                    "

                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 25,
                    }}

                  />

                )}

                <GalleryHorizontal
                  className="
                    w-3.5
                    h-3.5
                  "
                />

                <span
                  className="
                    hidden
                    sm:inline
                  "
                >
                  {t.layoutCarouselShort}
                </span>

              </motion.button>

            </div>


            {/* =============================================
                SORT
            ============================================= */}

            <div
              className="
                flex
                items-center
                gap-2
                bg-[#12245e]
                border-2
                border-[#2855D9]
                px-3.5
                py-2
                rounded-2xl
                text-xs
                shadow-md
              "
            >

              <SlidersHorizontal
                className="
                  w-4
                  h-4
                  text-[#FFD11A]
                "
              />

              <span
                className="
                  text-[#a4bcf7]
                  hidden
                  sm:inline
                  font-bold
                "
              >
                {t.sortBy}:
              </span>

              <select

                value={sortBy}

                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'default'
                      | 'price-asc'
                      | 'price-desc'
                      | 'popular'
                  )
                }

                className="
                  bg-transparent
                  text-white
                  font-black
                  focus:outline-none
                  cursor-pointer
                  text-xs
                "
              >

                <option
                  value="default"
                  className="
                    bg-[#0f2156]
                    text-white
                  "
                >
                  {t.sortSpecialFirst}
                </option>

                <option
                  value="popular"
                  className="
                    bg-[#0f2156]
                    text-white
                  "
                >
                  {t.sortPopular}
                </option>

                <option
                  value="price-asc"
                  className="
                    bg-[#0f2156]
                    text-white
                  "
                >
                  {t.sortPriceAsc}
                </option>

                <option
                  value="price-desc"
                  className="
                    bg-[#0f2156]
                    text-white
                  "
                >
                  {t.sortPriceDesc}
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* =================================================
            CATEGORIES
        ================================================= */}

        <div
          className="
            relative
            py-2
          "
        >

          <div
            className="
              flex
              items-center
              gap-2.5
              overflow-x-auto
              pb-2
              pt-1
              scrollbar-none
              px-1
            "
          >


            {/* ALL */}

            <motion.button

              onClick={() =>
                setSelectedCategory('all')
              }

              whileHover={{
                scale: 1.07,
                y: -3,
              }}

              whileTap={{
                scale: 0.93,
              }}

              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 20,
              }}

              className="
                relative
                px-4
                py-2.5
                rounded-2xl
                text-xs
                sm:text-sm
                font-black
                flex
                items-center
                gap-2
                whitespace-nowrap
                cursor-pointer
                select-none
                border-2
                transition-colors
                duration-200
              "

              style={{
                borderColor:
                  selectedCategory ===
                  'all'
                    ? '#FFD11A'
                    : '#2855D9',

                backgroundColor:
                  selectedCategory ===
                  'all'
                    ? '#FFD11A'
                    : '#12245e',

                color:
                  selectedCategory ===
                  'all'
                    ? '#0a163e'
                    : '#ffffff',
              }}
            >

              <motion.span

                animate={
                  selectedCategory ===
                  'all'
                    ? {
                        rotate: [
                          0,
                          -15,
                          15,
                          -10,
                          0,
                        ],
                      }
                    : {}
                }

                transition={{
                  duration: 0.5,
                }}
              >

                <Utensils
                  className="
                    w-4
                    h-4
                  "
                />

              </motion.span>

              <span>
                {t.allCategories}
              </span>

              <span
                className={`
                  text-[10px]
                  px-2
                  py-0.5
                  rounded-full
                  font-bold
                  transition-colors
                  ${
                    selectedCategory ===
                    'all'
                      ? 'bg-[#0a163e] text-[#FFD11A]'
                      : 'bg-[#1e3b96] text-white'
                  }
                `}
              >
                {items.length}
              </span>

            </motion.button>


            {/* USER CATEGORIES */}

            {categories.map(
              (cat, idx) => {

                const isSelected =
                  selectedCategory ===
                  cat.id;

                const count =
                  items.filter(
                    (i) =>
                      i.category ===
                      cat.id
                  ).length;

                const catName =
                  language === 'ar'
                    ? cat.name
                    : (
                        cat.nameEn ||
                        cat.name
                      );

                const color =
                  getCategoryColor(idx);


                return (

                  <motion.button

                    key={cat.id}

                    onClick={() =>
                      setSelectedCategory(
                        cat.id
                      )
                    }

                    whileHover={{
                      scale: 1.07,
                      y: -3,
                    }}

                    whileTap={{
                      scale: 0.93,
                    }}

                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 20,
                    }}

                    className="
                      relative
                      px-4
                      py-2.5
                      rounded-2xl
                      text-xs
                      sm:text-sm
                      font-black
                      flex
                      items-center
                      gap-2
                      whitespace-nowrap
                      cursor-pointer
                      select-none
                      border-2
                      transition-colors
                      duration-200
                    "

                    style={{
                      backgroundColor:
                        isSelected
                          ? color
                          : '#12245e',

                      borderColor:
                        isSelected
                          ? color
                          : '#2855D9',

                      color: '#ffffff',
                    }}
                  >

                    <motion.span

                      animate={
                        isSelected
                          ? {
                              rotate: [
                                0,
                                -12,
                                12,
                                -8,
                                0,
                              ],
                              scale: [
                                1,
                                1.2,
                                1,
                              ],
                            }
                          : {}
                      }

                      transition={{
                        duration: 0.45,
                      }}
                    >

                      {renderCategoryIcon(
                        cat.icon
                      )}

                    </motion.span>

                    <span>
                      {catName}
                    </span>

                    <span
                      className={`
                        text-[10px]
                        px-2
                        py-0.5
                        rounded-full
                        font-bold
                        transition-colors
                        ${
                          isSelected
                            ? 'bg-black/25 text-white'
                            : 'bg-[#1e3b96] text-[#FFD11A]'
                        }
                      `}
                    >
                      {count}
                    </span>

                  </motion.button>

                );

              }
            )}

          </div>

        </div>


        {/* =================================================
            ACTIVE CATEGORY BANNER
        ================================================= */}

        <AnimatePresence mode="wait">

          <motion.div

            key={selectedCategory}

            initial={{
              opacity: 0,
              y: 15,
              scale: 0.96,
            }}

            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}

            exit={{
              opacity: 0,
              y: -12,
              scale: 0.97,
            }}

            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 24,
            }}

            className="
              rounded-3xl
              p-5
              sm:p-6
              border-2
              relative
              overflow-hidden
              flex
              flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-4
              shadow-xl
            "

            style={{
              backgroundColor:
                '#0d1e52',

              borderColor:
                activeCategoryColor,

              boxShadow:
                `0 10px 30px -10px ${activeCategoryColor}33`,
            }}
          >

            <div
              className="
                absolute
                -top-6
                -end-6
                w-32
                h-32
                rounded-full
                opacity-15
                pointer-events-none
                blur-xl
              "
              style={{
                backgroundColor:
                  activeCategoryColor,
              }}
            />

            <div
              className="
                absolute
                -bottom-6
                -start-6
                w-28
                h-28
                rounded-full
                opacity-15
                pointer-events-none
                blur-xl
              "
              style={{
                backgroundColor:
                  '#2855D9',
              }}
            />


            <div
              className="
                flex
                items-center
                gap-4
                relative
                z-10
              "
            >

              <motion.div

                initial={{
                  scale: 0,
                  rotate: -25,
                }}

                animate={{
                  scale: 1,
                  rotate: 0,
                }}

                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                  delay: 0.05,
                }}

                className="
                  w-14
                  h-14
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-lg
                  flex-shrink-0
                "

                style={{
                  backgroundColor:
                    activeCategoryColor,
                }}
              >

                {selectedCategory ===
                'all' ? (

                  <PartyPopper
                    className="
                      w-7
                      h-7
                      text-[#0a163e]
                    "
                  />

                ) : (

                  renderCategoryIcon(
                    currentCategoryObj?.icon
                  )

                )}

              </motion.div>


              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mb-1
                  "
                >

                  <span

                    className="
                      text-[11px]
                      font-black
                      uppercase
                      px-2.5
                      py-0.5
                      rounded-full
                      tracking-wider
                    "

                    style={{
                      backgroundColor:
                        `${activeCategoryColor}25`,

                      color:
                        activeCategoryColor ===
                        '#FFD11A'
                          ? '#FFD11A'
                          : activeCategoryColor,

                      border:
                        `1px solid ${activeCategoryColor}55`,
                    }}
                  >

                    {selectedCategory ===
                    'all'

                      ? (
                          language ===
                          'ar'
                            ? 'التصنيف الكامل'
                            : 'All Categories'
                        )

                      : (
                          language ===
                          'ar'
                            ? 'تصنيف مميز'
                            : 'Featured Category'
                        )}

                  </span>


                  <span
                    className="
                      text-xs
                      text-[#9ebbf9]
                      font-bold
                    "
                  >

                    {filteredItems.length}{' '}

                    {language === 'ar'
                      ? 'أطباق ووجبات'
                      : 'Dishes & Meals'}

                  </span>

                </div>


                <h3
                  className="
                    text-xl
                    sm:text-2xl
                    font-black
                    text-white
                    font-['Fredoka','Cairo',sans-serif]
                  "
                >

                  {selectedCategory ===
                  'all'

                    ? (
                        language ===
                        'ar'
                          ? 'جميع وجبات وقوائم Happy Kids'
                          : 'All Happy Kids Meals & Treats'
                      )

                    : (
                        language ===
                        'ar'
                          ? currentCategoryObj?.name
                          : (
                              currentCategoryObj?.nameEn ||
                              currentCategoryObj?.name
                            )
                      )}

                </h3>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-2
                self-start
                sm:self-center
                relative
                z-10
              "
            >

              <span
                className="
                  text-xs
                  bg-[#12245e]
                  border
                  border-[#2855D9]
                  px-3.5
                  py-1.5
                  rounded-xl
                  text-[#FFD11A]
                  font-black
                  flex
                  items-center
                  gap-1.5
                  shadow-sm
                "
              >

                <Sparkles
                  className="
                    w-3.5
                    h-3.5
                    animate-spin
                  "
                  style={{
                    animationDuration:
                      '4s',
                  }}
                />

                <span>

                  {language === 'ar'
                    ? 'محضر طازجاً وبأعلى معايير الجودة والنظافة'
                    : 'Freshly prepared with love & quality'}

                </span>

              </span>

            </div>

          </motion.div>

        </AnimatePresence>


        {/* =================================================
            SEARCH
        ================================================= */}

        {searchQuery && (

          <motion.div

            initial={{
              opacity: 0,
              y: -10,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            className="
              flex
              items-center
              justify-between
              p-3.5
              rounded-2xl
              bg-[#12245e]
              border-2
              border-[#2855D9]
              text-xs
              text-[#a4bcf7]
            "
          >

            <span>

              {t.searchResultFor}{' '}

              <strong
                className="
                  text-[#FFD11A]
                "
              >
                "{searchQuery}"
              </strong>{' '}

              ({filteredItems.length})

            </span>


            <button

              onClick={() =>
                setSearchQuery('')
              }

              className="
                text-[#FFD11A]
                font-bold
                hover:underline
                cursor-pointer
              "
            >

              {t.clearSearch}

            </button>

          </motion.div>

        )}


        {/* =================================================
            MENU CARDS
        ================================================= */}

        <AnimatePresence mode="wait">

          {filteredItems.length > 0 ? (

            layoutMode === 'carousel' ? (

              /* =================================================
                 CAROUSEL
              ================================================= */

              <motion.div

                key={`
                  carousel-wrap-
                  ${selectedCategory}-
                  ${sortBy}-
                  ${searchQuery}
                `}

                initial={{
                  opacity: 0,
                  y: 15,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                exit={{
                  opacity: 0,
                  y: -15,
                }}

                transition={{
                  duration: 0.25,
                }}

                className="
                  space-y-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    px-2
                    py-1
                    bg-[#0d1e52]
                    rounded-2xl
                    border
                    border-[#2855D9]/50
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2.5
                      text-xs
                      font-bold
                      text-[#9ebbf9]
                    "
                  >

                    <span
                      className="
                        w-2.5
                        h-2.5
                        rounded-full
                        bg-[#78C943]
                        animate-pulse
                      "
                    />

                    <span>

                      {language === 'ar'
                        ? 'تصفح وجبات الأطفال بالسحب يميناً ويساراً أو عبر الأسهم المرحة'
                        : 'Swipe or use the cheerful arrows to explore meals'}

                    </span>

                    <span
                      className="
                        text-[10px]
                        bg-[#12245e]
                        border
                        border-[#2855D9]
                        px-2
                        py-0.5
                        rounded-full
                        text-[#FFD11A]
                      "
                    >
                      {filteredItems.length}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <motion.button

                      onClick={() =>
                        handleScrollCarousel(
                          'prev'
                        )
                      }

                      whileHover={{
                        scale: 1.12,
                      }}

                      whileTap={{
                        scale: 0.88,
                      }}

                      className="
                        w-9
                        h-9
                        rounded-xl
                        bg-[#12245e]
                        hover:bg-[#FFD11A]
                        text-white
                        hover:text-[#0a163e]
                        border-2
                        border-[#2855D9]
                        hover:border-[#FFD11A]
                        flex
                        items-center
                        justify-center
                        transition-colors
                        shadow-md
                        cursor-pointer
                      "

                      title={
                        t.prevDish
                      }
                    >

                      {language === 'ar'

                        ? (
                            <ChevronRight
                              className="
                                w-5
                                h-5
                              "
                            />
                          )

                        : (
                            <ChevronLeft
                              className="
                                w-5
                                h-5
                              "
                            />
                          )}

                    </motion.button>


                    <motion.button

                      onClick={() =>
                        handleScrollCarousel(
                          'next'
                        )
                      }

                      whileHover={{
                        scale: 1.12,
                      }}

                      whileTap={{
                        scale: 0.88,
                      }}

                      className="
                        w-9
                        h-9
                        rounded-xl
                        bg-[#12245e]
                        hover:bg-[#FFD11A]
                        text-white
                        hover:text-[#0a163e]
                        border-2
                        border-[#2855D9]
                        hover:border-[#FFD11A]
                        flex
                        items-center
                        justify-center
                        transition-colors
                        shadow-md
                        cursor-pointer
                      "

                      title={
                        t.nextDish
                      }
                    >

                      {language === 'ar'

                        ? (
                            <ChevronLeft
                              className="
                                w-5
                                h-5
                              "
                            />
                          )

                        : (
                            <ChevronRight
                              className="
                                w-5
                                h-5
                              "
                            />
                          )}

                    </motion.button>

                  </div>

                </div>


                <motion.div

                  ref={carouselRef}

                  variants={
                    gridContainerVariants
                  }

                  initial="hidden"

                  animate="visible"

                  exit="exit"

                  className="
                    flex
                    gap-5
                    overflow-x-auto
                    pb-6
                    pt-2
                    scroll-smooth
                    scrollbar-thin
                    scrollbar-thumb-[#2855D9]
                    scrollbar-track-[#0a163e]
                    snap-x
                    snap-mandatory
                    px-1
                  "
                >

                  {filteredItems.map(
                    (item, idx) => (

                      <MenuCard

                        key={item.id}

                        item={item}

                        currency={
                          language === 'ar'
                            ? restaurant.currency
                            : restaurant.currencyEn
                        }

                        language={
                          language
                        }

                        index={idx}

                        isAdmin={false}

                        layoutVariant={
                          'carousel'
                        }

                      />

                    )
                  )}

                </motion.div>

              </motion.div>


            ) : layoutMode === 'horizontal' ? (

              /* =================================================
                 HORIZONTAL
              ================================================= */

              <motion.div

                key={`
                  horizontal-
                  ${selectedCategory}-
                  ${sortBy}-
                  ${searchQuery}
                `}

                variants={
                  gridContainerVariants
                }

                initial="hidden"

                animate="visible"

                exit="exit"

                className="
                  grid
                  grid-cols-1
                  xl:grid-cols-2
                  gap-5
                "
              >

                {filteredItems.map(
                  (item, idx) => (

                    <MenuCard

                      key={item.id}

                      item={item}

                      currency={
                        language === 'ar'
                          ? restaurant.currency
                          : restaurant.currencyEn
                      }

                      language={
                        language
                      }

                      index={idx}

                      isAdmin={false}

                      layoutVariant={
                        'horizontal'
                      }

                    />

                  )
                )}

              </motion.div>


            ) : (

              /* =================================================
                 GRID
              ================================================= */

              <motion.div

                key={`
                  grid-
                  ${selectedCategory}-
                  ${sortBy}-
                  ${searchQuery}
                `}

                variants={
                  gridContainerVariants
                }

                initial="hidden"

                animate="visible"

                exit="exit"

                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                  gap-6
                "
              >

                {filteredItems.map(
                  (item, idx) => (

                    <MenuCard

                      key={item.id}

                      item={item}

                      currency={
                        language === 'ar'
                          ? restaurant.currency
                          : restaurant.currencyEn
                      }

                      language={
                        language
                      }

                      index={idx}

                      isAdmin={false}

                      layoutVariant={
                        'vertical'
                      }

                    />

                  )
                )}

              </motion.div>

            )

          ) : (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <motion.div

              key="empty-state"

              initial={{
                opacity: 0,
                scale: 0.88,
                y: 20,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.9,
              }}

              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 22,
              }}

              className="
                py-20
                text-center
                space-y-4
                bg-[#0f2156]
                rounded-3xl
                border-2
                border-[#2855D9]
                shadow-xl
                max-w-xl
                mx-auto
              "
            >

              <motion.div

                animate={{
                  rotate: [
                    -8,
                    8,
                    -8,
                  ],

                  scale: [
                    1,
                    1.1,
                    1,
                  ],
                }}

                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: 'easeInOut',
                }}

                className="
                  w-16
                  h-16
                  rounded-full
                  bg-[#FFD11A]/20
                  border-2
                  border-[#FFD11A]
                  flex
                  items-center
                  justify-center
                  mx-auto
                  text-[#FFD11A]
                "
              >

                <Smile
                  className="
                    w-10
                    h-10
                  "
                />

              </motion.div>


              <h3
                className="
                  text-xl
                  font-black
                  text-white
                  font-['Fredoka','Cairo',sans-serif]
                "
              >

                {t.noItemsFound}

              </h3>


              <p
                className="
                  text-xs
                  text-[#a4bcf7]
                  max-w-sm
                  mx-auto
                "
              >

                {language === 'ar'

                  ? 'لم نعثر على أطباق تطابق بحثك حالياً، جرب اختيار تصنيف آخر أو استعراض كل الوجبات'

                  : 'No dishes match your query. Try choosing another category or browsing all meals.'}

              </p>


              <button

                onClick={() => {

                  setSelectedCategory(
                    'all'
                  );

                  setSearchQuery('');

                }}

                className="
                  px-6
                  py-2.5
                  rounded-2xl
                  bg-[#FFD11A]
                  text-xs
                  text-[#0a163e]
                  font-black
                  border-2
                  border-[#FFD11A]
                  shadow-lg
                  shadow-[#FFD11A]/30
                  hover:bg-[#e6bc17]
                  transition-all
                  cursor-pointer
                  inline-flex
                  items-center
                  gap-2
                "
              >

                <Sparkles
                  className="
                    w-4
                    h-4
                  "
                />

                <span>
                  {t.viewAllDishes}
                </span>

              </button>

            </motion.div>

          )}

        </AnimatePresence>

      </main>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <Footer

        restaurant={restaurant}

        language={language}

      />

    </motion.div>

  );

}
