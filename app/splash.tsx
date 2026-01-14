import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

/**
 * 🚀 PHASE 1: SPLASH SCREEN
 * Features:
 * - Centered app logo.
 * - Smooth 2-second fade-in animation.
 * - Auto-navigation to onboarding after 3 seconds.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
    const router = useRouter();
    const opacity = useSharedValue(0);

    // 🎭 Animation Styles
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    useEffect(() => {
        // Trigger fade-in on mount
        opacity.value = withTiming(1, { duration: 2000 });

        const checkTutorialStatus = async () => {
            try {
                const hasSeenTutorial = await AsyncStorage.getItem('HAS_SEEN_TUTORIAL');

                // Allow the splash animation to show for at least 3 seconds
                setTimeout(() => {
                    if (hasSeenTutorial === 'true') {
                        router.replace('/newsfeed');
                    } else {
                        router.replace('/onboarding');
                    }
                }, 3000);
            } catch (error) {
                console.error('Error checking tutorial status:', error);
                // Fallback to onboarding on error
                setTimeout(() => {
                    router.replace('/onboarding');
                }, 3000);
            }
        };

        checkTutorialStatus();
    }, []);


    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <Image
                    source={require('../assets/images/01-App open Page.png')}
                    style={styles.image}
                    contentFit="contain"
                />
            </Animated.View>
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
    logoContainer: {
        width: width * 0.7,
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
