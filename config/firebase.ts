import { initializeApp } from 'firebase/app';
import {
    FacebookAuthProvider,
    signOut as firebaseSignOut,
    getAuth,
    getRedirectResult,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInAnonymously,
    signInWithPopup,
    signInWithRedirect,
    TwitterAuthProvider,
    User
} from 'firebase/auth';

const firebaseConfig = {
<<<<<<< Updated upstream
    apiKey: "AIzaSyDAJJBZdot7iJRkF9lqMzlNyxWXfD_z4X8",
    authDomain: "knews-2d1bd.firebaseapp.com",
    projectId: "knews-2d1bd",
    storageBucket: "knews-2d1bd.firebasestorage.app",
    messagingSenderId: "823388850788",
    appId: "1:823388850788:web:00ef081bf86b2b29b3ed71"
=======
  apiKey: "AIzaSyDAJJBZdot7iJRkF9lqMzlNyxWXfD_z4X8",
  authDomain: "knews-2d1bd.firebaseapp.com",
  projectId: "knews-2d1bd",
  storageBucket: "knews-2d1bd.firebasestorage.app",
  messagingSenderId: "823388850788",
  appId: "1:823388850788:web:00ef081bf86b2b29b3ed71"
>>>>>>> Stashed changes
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Check if we are on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

// Helper to handle sign in
const performSignIn = async (provider: any) => {
    try {
        if (isMobile) {
            // Mobile browsers often block popups, use redirect instead
            await signInWithRedirect(auth, provider);
            return { success: true, pending: true };
        } else {
            const result = await signInWithPopup(auth, provider);
            return { success: true, user: result.user };
        }
    } catch (error: any) {
        console.error("Sign-in error:", error);
        return { success: false, error: error.message };
    }
};

// Guest Login (Anonymous)
export const signInAsGuest = async () => {
    try {
        const result = await signInAnonymously(auth);
        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Google Sign In
export const signInWithGoogle = () => performSignIn(googleProvider);

// Facebook Sign In
export const signInWithFacebook = () => performSignIn(facebookProvider);

// Twitter Sign In
export const signInWithTwitter = () => performSignIn(twitterProvider);

// Handle Redirect Result (Call this on app load)
export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            return { success: true, user: result.user };
        }
        return { success: false, noResult: true };
    } catch (error: any) {
        console.error("Redirect error:", error);
        return { success: false, error: error.message };
    }
};

// Sign Out
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Auth State Observer
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export { auth };

