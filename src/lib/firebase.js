import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase safely — mock/missing config won't crash the app
let app, auth, db;
try {
  app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db   = getFirestore(app);
} catch (e) {
  console.warn('[Firebase] Initialization skipped (mock or missing config):', e.message);
}

/**
 * Logs a custom analytics event safely.
 * No-ops if Firebase is unavailable.
 * @param {string} eventName
 * @param {object} [params]
 */
export const logAnalyticsEvent = async (eventName, params = {}) => {
  try {
    const { getAnalytics, logEvent, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (supported && app) {
      const analytics = getAnalytics(app);
      logEvent(analytics, eventName, params);
    }
  } catch (e) {
    // Analytics not available — silently ignore
  }
};

export { app, auth, db };
