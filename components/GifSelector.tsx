import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const MOCK_GIFS = [
    { id: '1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/v1.Y2lkPTc5MGI3NjExYzhjNmRiZjU5YThmYjM1ZTM3Zjk0ZWY5ZDRmZjE5ZTM4ZDRjZjA4OCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o7TKURJODv9e1m4W4/giphy.gif' },
    { id: '2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/3o7TKVUn7iM8FMEU24/giphy.gif' },
    { id: '3', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/l0HlHFRbmaZtBRhXG/giphy.gif' },
    { id: '4', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/3o7TKVVlXpS8X8kEwM/giphy.gif' },
    { id: '5', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/l0HlR3kfdv-3_GTMQ/giphy.gif' },
    { id: '6', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/3o7TKP9LNAd9r5FNS8/giphy.gif' },
    { id: '7', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnFnbXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/3o7TKVUn7iM8FMEU24/giphy.gif' },
    { id: '8', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnFnbXIzZWZ4eHd4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PWc/l0HlHFRbmaZtBRhXG/giphy.gif' },
];

interface GifSelectorProps {
    onGifSelect: (gifUrl: string) => void;
    isNightMode?: boolean;
}

const GifSelector: React.FC<GifSelectorProps> = ({ onGifSelect, isNightMode }) => {
    const [search, setSearch] = useState('');

    return (
        <View style={[styles.container, isNightMode && styles.containerNight]}>
            <View style={[styles.searchContainer, isNightMode && styles.searchContainerNight]}>
                <Ionicons name="search" size={20} color={isNightMode ? "#9BA1A6" : "#666"} />
                <TextInput
                    style={[styles.searchInput, isNightMode && styles.searchInputNight]}
                    placeholder="Search GIFs..."
                    placeholderTextColor={isNightMode ? "#666" : "#999"}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            <FlatList
                data={MOCK_GIFS}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.gifButton}
                        onPress={() => onGifSelect(item.url)}
                    >
                        <Image
                            source={{ uri: item.url }}
                            style={styles.gifImage}
                            contentFit="cover"
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300,
        backgroundColor: '#fff',
        padding: 5,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    containerNight: {
        backgroundColor: '#151718',
        borderTopColor: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        margin: 10,
        height: 40,
    },
    searchContainerNight: {
        backgroundColor: '#262829',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    searchInputNight: {
        color: '#fff',
    },
    gifButton: {
        flex: 1,
        margin: 2,
        height: 120,
    },
    gifImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
});

export default GifSelector;
