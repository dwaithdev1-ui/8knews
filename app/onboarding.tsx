import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height: WINDOW_HEIGHT } = Dimensions.get('window');

// 📋 ONBOARDING CONTENT
const WELCOME_SLIDE = {
    title: 'Welcome to 8K News',
    description: 'Experience news like never before with high-quality visuals and concise updates.',
    image: require('../assets/images/02-Welcome Page.png'),
};

export default function OnboardingScreen() {
    const router = useRouter();

    const handleContinue = () => {
        router.replace('/permissions');
    };

    useEffect(() => {
        const timer = setTimeout(handleContinue, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <TouchableOpacity
                style={styles.mainWrapper}
                onPress={handleContinue}
                activeOpacity={1}
            >
                <Image
                    source={WELCOME_SLIDE.image}
                    style={styles.fullImage}
                    contentFit="cover"
                    transition={500}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainWrapper: {
        flex: 1,
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
});
