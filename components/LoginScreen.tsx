import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
    onClose?: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginScreen({ onClose, onLoginSuccess }: LoginScreenProps) {
    const { loginAsGuest, loginWithGoogle, loginWithFacebook, loginWithTwitter, loading } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handleGuestLogin = async () => {
        setSelectedMethod('guest');
        await loginAsGuest();
        onLoginSuccess?.();
    };

    const handleGoogleLogin = async () => {
        setSelectedMethod('google');
        await loginWithGoogle();
        onLoginSuccess?.();
    };

    const handleFacebookLogin = async () => {
        setSelectedMethod('facebook');
        await loginWithFacebook();
        onLoginSuccess?.();
    };

    const handleTwitterLogin = async () => {
        setSelectedMethod('twitter');
        await loginWithTwitter();
        onLoginSuccess?.();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../assets/images/8K-Logo 1.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>8K న్యూస్</Text>
                <Text style={styles.subtitle}>లాగిన్ అవ్వండి లేదా కొనసాగించండి</Text>
            </View>

            {/* Login Options */}
            <View style={styles.optionsContainer}>
                {/* Guest Login */}
                <TouchableOpacity
                    style={[styles.loginButton, styles.guestButton]}
                    onPress={handleGuestLogin}
                    disabled={loading}
                >
                    {loading && selectedMethod === 'guest' ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="person-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>అతిథిగా కొనసాగించండి</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>లేదా</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Google Login */}
                <TouchableOpacity
                    style={[styles.loginButton, styles.googleButton]}
                    onPress={handleGoogleLogin}
                    disabled={loading}
                >
                    {loading && selectedMethod === 'google' ? (
                        <ActivityIndicator color="#333" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={24} color="#DB4437" />
                            <Text style={[styles.buttonText, styles.darkText]}>Google తో లాగిన్ అవ్వండి</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Facebook Login */}
                <TouchableOpacity
                    style={[styles.loginButton, styles.facebookButton]}
                    onPress={handleFacebookLogin}
                    disabled={loading}
                >
                    {loading && selectedMethod === 'facebook' ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="logo-facebook" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Facebook తో లాగిన్ అవ్వండి</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Twitter Login */}
                <TouchableOpacity
                    style={[styles.loginButton, styles.twitterButton]}
                    onPress={handleTwitterLogin}
                    disabled={loading}
                >
                    {loading && selectedMethod === 'twitter' ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="logo-twitter" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Twitter తో లాగిన్ అవ్వండి</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
                కొనసాగించడం ద్వారా, మీరు మా నిబంధనలు మరియు గోప్యతా విధానానికి అంగీకరిస్తున్నారు
            </Text>

            {/* Close Button */}
            {onClose && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    optionsContainer: {
        flex: 1,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 15,
        gap: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    guestButton: {
        backgroundColor: '#666',
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    facebookButton: {
        backgroundColor: '#1877F2',
    },
    twitterButton: {
        backgroundColor: '#1DA1F2',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    darkText: {
        color: '#333',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#999',
        fontSize: 14,
    },
    terms: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 20,
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        padding: 10,
    },
});
