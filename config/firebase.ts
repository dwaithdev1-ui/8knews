import { initializeApp } from 'firebase/app';
import {
    FacebookAuthProvider,
    signOut as firebaseSignOut,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInAnonymously,
    signInWithPopup,
    TwitterAuthProvider,
    User
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDAJJBZdot7iJRkF9lqMzlNyxWXfD_z4X8",
    authDomain: "knews-2d1bd.firebaseapp.com",
    projectId: "knews-2d1bd",
    storageBucket: "knews-2d1bd.firebasestorage.app",
    messagingSenderId: "823388850788",
    appId: "1:823388850788:web:00ef081bf86b2b29b3ed71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

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
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        return { success: true, user: result.user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

// Twitter Sign In
export const signInWithTwitter = async () => {
    try {
        const result = await signInWithPopup(auth, twitterProvider);
        return { success: true, user: result.user };
    } catch (error: any) {
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

