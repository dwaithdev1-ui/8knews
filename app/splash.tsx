import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AntigravityLoader from '../components/AntigravityLoader';

export default function SplashScreenComponent() {
    const router = useRouter();

    useEffect(() => {
        const prepare = async () => {
            // Hide the native splash screen immediately when this component mounts
            await SplashScreen.hideAsync();
        };
        prepare();

        const checkTutorialStatus = async () => {
            try {
                // Wait for the animation to play out a bit
                setTimeout(async () => {
                    const hasSeenTutorial = await AsyncStorage.getItem('HAS_SEEN_TUTORIAL');
                    if (hasSeenTutorial === 'true') {
                        router.replace('/newsfeed');
                    } else {
                        router.replace('/onboarding');
                    }
                }, 4000);
            } catch (error) {
                console.error('Error checking tutorial status:', error);
                setTimeout(() => {
                    router.replace('/onboarding');
                }, 3000);
            }
        };

        checkTutorialStatus();
    }, []);

    return (
        <View style={styles.container}>
            <AntigravityLoader />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
