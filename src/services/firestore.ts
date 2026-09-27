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

const menuRef = doc(
  db,
  'appData',
  'menu'
);

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
      ? (
          menuSnap.data()
            .items as MenuItem[]
        )
      : null,


    categories: categoriesSnap.exists()
      ? (
          categoriesSnap.data()
            .categories as Category[]
        )
      : null,


    restaurant: restaurantSnap.exists()
      ? (
          restaurantSnap.data()
        as Partial<RestaurantInfo>
        )
      : null,


    hero: heroSnap.exists()
      ? (
          heroSnap.data()
        as HeroConfig
        )
      : null,

  };

}


/* =========================================================
   SAVE MENU ITEMS
========================================================= */

export async function saveMenuItems(
  items: MenuItem[]
) {

  await setDoc(

    menuRef,

    {
      items,

      updatedAt:
        serverTimestamp(),
    },

    {
      merge: true,
    }

  );

}


/* =========================================================
   SAVE CATEGORIES
========================================================= */

export async function saveCategories(
  categories: Category[]
) {

  await setDoc(

    categoriesRef,

    {
      categories,

      updatedAt:
        serverTimestamp(),
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

  /*
   * مهم:
   * لا نحفظ اسم المستخدم وكلمة المرور
   * داخل Firestore العام.
   */

  const {
    adminUsername,
    adminPassword,
    ...publicRestaurant
  } = restaurant;


  await setDoc(

    restaurantRef,

    {
      ...publicRestaurant,

      updatedAt:
        serverTimestamp(),
    },

    {
      merge: true,
    }

  );

}


/* =========================================================
   SAVE HERO
========================================================= */

export async function saveHero(
  hero: HeroConfig
) {

  await setDoc(

    heroRef,

    {
      ...hero,

      updatedAt:
        serverTimestamp(),
    },

    {
      merge: true,
    }

  );

}
