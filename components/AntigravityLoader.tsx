import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 50;

// Google Antigravity derived palette
const COLORS = [
    '#4285F4', // Google Blue
    '#DB4437', // Google Red
    '#F4B400', // Google Yellow
    '#0F9D58', // Google Green
    '#AB47BC', // Purple accent
    '#00ACC1', // Cyan accent
];

const Particle = ({ index }: { index: number }) => {
    // Initial configuration
    const angle = Math.random() * 2 * Math.PI;
    // Distribute particles to drift further out covering more screen
    const maxDist = Math.max(width, height) * 0.4;
    const distance = 40 + Math.random() * maxDist;
    const size = 4 + Math.random() * 10; // 4px - 14px bubbles
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Animation timing
    const delay = Math.random() * 1500;
    const duration = 2500 + Math.random() * 2000;

    // Shared Values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0); // Start hidden
    const opacity = useSharedValue(0);

    useEffect(() => {
        // 1. Drifting Motion (Center -> Outward)
        translateX.value = withDelay(delay, withRepeat(
            withTiming(Math.cos(angle) * distance, { duration: duration, easing: Easing.out(Easing.quad) }),
            -1,
            true // Reverse back to center for "breathing" effect
        ));

        translateY.value = withDelay(delay, withRepeat(
            withTiming(Math.sin(angle) * distance, { duration: duration, easing: Easing.out(Easing.quad) }),
            -1,
            true
        ));

        // 2. Zoom In / Zoom Out (Pulse)
        scale.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(1.2, { duration: duration * 0.4 }), // Expand
                withTiming(1.5, { duration: duration * 0.2 }), // Peak
                withTiming(0.1, { duration: duration * 0.4 })  // Shrink
            ),
            -1,
            true // Reverses smoothly
        ));

        // 3. Opacity (Fade In / Fade Out)
        opacity.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(0.8, { duration: duration * 0.3 }),
                withTiming(0.4, { duration: duration * 0.4 }),
                withTiming(0, { duration: duration * 0.3 })
            ),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                animatedStyle
            ]}
        />
    );
};

export default function AntigravityLoader() {
    return (
        <View style={styles.container}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <Particle key={i} index={i} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    particle: {
        position: 'absolute',
    },
});
