import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signOut as firebaseSignOut,
    onAuthChange,
    signInAsGuest,
    signInWithFacebook,
    signInWithGoogle,
    signInWithTwitter
} from '../config/firebase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);
            setIsGuest(firebaseUser?.isAnonymous || false);

            // Store user info in AsyncStorage
            if (firebaseUser) {
                await AsyncStorage.setItem('USER_ID', firebaseUser.uid);
                await AsyncStorage.setItem('USER_EMAIL', firebaseUser.email || '');
                await AsyncStorage.setItem('USER_NAME', firebaseUser.displayName || '');
                await AsyncStorage.setItem('IS_GUEST', firebaseUser.isAnonymous ? 'true' : 'false');
            } else {
                await AsyncStorage.removeItem('USER_ID');
                await AsyncStorage.removeItem('USER_EMAIL');
                await AsyncStorage.removeItem('USER_NAME');
                await AsyncStorage.removeItem('IS_GUEST');
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginAsGuest = async () => {
        setLoading(true);
        const result = await signInAsGuest();
        if (!result.success) {
            console.error('Guest login failed:', result.error);
        }
        setLoading(false);
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        const result = await signInWithGoogle();
        if (!result.success) {
            console.error('Google login failed:', result.error);
        }
        setLoading(false);
    };

    const loginWithFacebook = async () => {
        setLoading(true);
        const result = await signInWithFacebook();
        if (!result.success) {
            console.error('Facebook login failed:', result.error);
        }
        setLoading(false);
    };

    const loginWithTwitter = async () => {
        setLoading(true);
        const result = await signInWithTwitter();
        if (!result.success) {
            console.error('Twitter login failed:', result.error);
        }
        setLoading(false);
    };

    const logout = async () => {
        setLoading(true);
        await firebaseSignOut();
        setLoading(false);
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
