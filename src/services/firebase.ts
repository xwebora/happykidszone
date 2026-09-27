import {
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import {
  getAuth,
} from 'firebase/auth';

import {
  getFirestore,
} from 'firebase/firestore';

import {
  getStorage,
} from 'firebase/storage';


const firebaseConfig = {

  apiKey:
    'AIzaSyBAx7elXXGk7M16vO5NjlDC2GhWpfBQCAg',

  authDomain:
    'gen-lang-client-0738987991.firebaseapp.com',

  projectId:
    'gen-lang-client-0738987991',

  storageBucket:
    'gen-lang-client-0738987991.firebasestorage.app',

  messagingSenderId:
    '565566228036',

  appId:
    '1:565566228036:web:4b1842685a2fbca8839e11',

};


export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


export const auth =
  getAuth(app);


export const db =
  getFirestore(app);


export const storage =
  getStorage(app);
