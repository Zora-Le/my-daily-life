import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAfGA1fVchFqgnu32bCiEAQqKM9YFxfGig',
  authDomain: 'my-daily-life-e6e18.firebaseapp.com',
  projectId: 'my-daily-life-e6e18',
  storageBucket: 'my-daily-life-e6e18.firebasestorage.app',
  messagingSenderId: '35449098973',
  appId: '1:35449098973:web:e2fb71c0e653180ac04134',
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
void setPersistence(firebaseAuth, browserLocalPersistence);

export const firestore = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
