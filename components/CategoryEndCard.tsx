import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LAYOUT } from '../constants/Layout';

const CARD_HEIGHT = LAYOUT.windowHeight;

interface Props {
    onBack: () => void;
}

export default function CategoryEndCard({ onBack }: Props) {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={onBack}
        >
            {/* Full Clean Graphic */}
            <Image
                source={require('../assets/images/25-Category complete.png')}
                style={styles.fullImage}
                contentFit="cover"
            />
            {/* Subtle Overlay Button to guide user */}
            <View style={styles.buttonOverlay}>
                <Text style={styles.buttonText}>మెయిన్ న్యూస్ చూడండి</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: CARD_HEIGHT,
        width: '100%',
        backgroundColor: '#fff',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    buttonOverlay: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
