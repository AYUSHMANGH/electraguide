import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

/**
 * Firebase configuration sourced from environment variables.
 * All values must be set in .env — see .env.example for reference.
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize only once (Vite HMR can run this module multiple times)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db   = getFirestore(app);

/**
 * Returns the Firebase Analytics instance if the browser supports it.
 * Gracefully returns null in SSR / restricted environments.
 * @returns {Promise<import('firebase/analytics').Analytics | null>}
 */
const getAnalyticsInstance = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  } catch (e) {
    console.warn('[Firebase] Analytics not supported:', e);
  }
  return null;
};

/**
 * Logs a custom analytics event. No-ops gracefully if analytics is unavailable.
 * @param {string} eventName - Firebase Analytics event name
 * @param {object} [params]  - Additional event parameters
 */
export const logAnalyticsEvent = async (eventName, params = {}) => {
  const analytics = await getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export { app, auth, db };
