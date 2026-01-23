import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isGuest: boolean;
    loginAsGuest: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithFacebook: () => Promise<void>;
    loginWithTwitter: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
    FacebookAuthProvider,
    signOut as firebaseSignOut,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInAnonymously,
    signInWithPopup,
    TwitterAuthProvider
} from 'firebase/auth';

// Firebase Config
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const isAnon = firebaseUser.isAnonymous;
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    isAnonymous: isAnon,
                });
                setIsGuest(isAnon);
            } else {
                setUser(null);
                setIsGuest(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginAsGuest = async () => {
        setLoading(true);
        try {
            await signInAnonymously(auth);
            // State update handled by onAuthStateChanged
        } catch (error) {
            console.error('Guest login error:', error);
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const loginWithFacebook = async () => {
        try {
            const provider = new FacebookAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Facebook login error:', error);
        }
    };

    const loginWithTwitter = async () => {
        try {
            const provider = new TwitterAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Twitter login error:', error);
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            await AsyncStorage.removeItem('USER_ID'); // Clean up old keys if any
            await AsyncStorage.removeItem('IS_GUEST');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isGuest,
                loginAsGuest,
                loginWithGoogle,
                loginWithFacebook,
                loginWithTwitter,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
