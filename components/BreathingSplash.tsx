import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

export default function BreathingSplash() {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        // Continuous breathing animation
        scale.value = withRepeat(
            withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        opacity.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.bubbleContainer, animatedStyle]}>
                <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.bubble}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        // Optional: Soft shadow/glow effect
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    bubble: {
        width: '100%',
        height: '100%',
        borderRadius: 75, // Circle
    },
});
