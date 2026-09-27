import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import {
  MenuItem,
  Category,
  RestaurantInfo,
  HeroConfig,
} from '../types';

import { db } from './firebase';

/* =========================================================
   FIRESTORE DOCUMENTS
========================================================= */

const menuRef = doc(db, 'appData', 'menu');

const categoriesRef = doc(
  db,
  'appData',
  'categories'
);

const restaurantRef = doc(
  db,
  'appData',
  'restaurant'
);

const heroRef = doc(
  db,
  'appData',
  'hero'
);

/* =========================================================
   LOAD ALL DATABASE DATA
========================================================= */

export async function loadMenuData() {
  const [
    menuSnap,
    categoriesSnap,
    restaurantSnap,
    heroSnap,
  ] = await Promise.all([
    getDoc(menuRef),
    getDoc(categoriesRef),
    getDoc(restaurantRef),
    getDoc(heroRef),
  ]);

  return {
    items: menuSnap.exists()
      ? (menuSnap.data().items as MenuItem[])
      : null,

    categories: categoriesSnap.exists()
      ? (categoriesSnap.data().categories as Category[])
      : null,

    restaurant: restaurantSnap.exists()
      ? (restaurantSnap.data() as Partial<RestaurantInfo>)
      : null,

    hero: heroSnap.exists()
      ? (heroSnap.data() as HeroConfig)
      : null,
  };
}

/* =========================================================
   SAVE MENU ITEMS
========================================================= */

export async function saveMenuItems(items: MenuItem[]) {
  await setDoc(
    menuRef,
    {
      items,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

/* =========================================================
   SAVE CATEGORIES
========================================================= */

export async function saveCategories(categories: Category[]) {
  await setDoc(
    categoriesRef,
    {
      categories,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

/* =========================================================
   SAVE RESTAURANT
========================================================= */

export async function saveRestaurant(
  restaurant: RestaurantInfo
) {
  const publicRestaurant = {
    name: restaurant.name,
    nameEn: restaurant.nameEn,

    tagline: restaurant.tagline,
    taglineEn: restaurant.taglineEn,

    phone: restaurant.phone,
    whatsapp: restaurant.whatsapp,

    address: restaurant.address,
    addressEn: restaurant.addressEn,

    workingHours: restaurant.workingHours,
    workingHoursEn: restaurant.workingHoursEn,

    currency: restaurant.currency,
    currencyEn: restaurant.currencyEn,

    driveFolderName: restaurant.driveFolderName,
  };

  await setDoc(
    restaurantRef,
    {
      ...publicRestaurant,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

/* =========================================================
   SAVE HERO
========================================================= */

export async function saveHero(hero: HeroConfig) {
  await setDoc(
    heroRef,
    {
      ...hero,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}
