import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import {
  MenuItem,
  Category,
  RestaurantInfo,
  HeroConfig,
} from '../types';

const firebaseConfig = {
  apiKey: 'AIzaSyBAx7elXXGk7M16vO5NjlDC2GhWpfBQCAg',
  authDomain: 'gen-lang-client-0738987991.firebaseapp.com',
  projectId: 'gen-lang-client-0738987991',
  storageBucket: 'gen-lang-client-0738987991.firebasestorage.app',
  messagingSenderId: '565566228036',
  appId: '1:565566228036:web:4b1842685a2fbca8839e11',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

const menuRef = doc(db, 'appData', 'menu');
const categoriesRef = doc(db, 'appData', 'categories');
const restaurantRef = doc(db, 'appData', 'restaurant');
const heroRef = doc(db, 'appData', 'hero');

export async function loadMenuData() {
  const [menuSnap, categoriesSnap, restaurantSnap, heroSnap] =
    await Promise.all([
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
      ? (restaurantSnap.data() as RestaurantInfo)
      : null,

    hero: heroSnap.exists()
      ? (heroSnap.data() as HeroConfig)
      : null,
  };
}

export async function saveMenuItems(items: MenuItem[]) {
  await setDoc(menuRef, {
    items,
    updatedAt: new Date(),
  });
}

export async function saveCategories(categories: Category[]) {
  await setDoc(categoriesRef, {
    categories,
    updatedAt: new Date(),
  });
}

export async function saveRestaurant(restaurant: RestaurantInfo) {
  // لا نحفظ بيانات دخول المدير داخل البيانات العامة
  const {
    adminUsername,
    adminPassword,
    ...publicRestaurant
  } = restaurant;

  await setDoc(restaurantRef, {
    ...publicRestaurant,
    updatedAt: new Date(),
  });
}

export async function saveHero(hero: HeroConfig) {
  await setDoc(heroRef, {
    ...hero,
    updatedAt: new Date(),
  });
}
