import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle
} from 'react-native-reanimated';

import { LAYOUT } from '../constants/Layout';

const CARD_HEIGHT = LAYOUT.windowHeight;

interface Props {
    id: string;
    image: any;
    title: string;
    description: string;
    index: number;
    scrollY: SharedValue<number>;
    totalItems: number;
    onComment?: (id: string) => void;
    isSaved?: boolean;
    onToggleSave?: (id: string) => void;
    onOptions?: () => void;
    onShare?: (id: string) => void;
    onTap?: () => void;
    isFullCard?: boolean;
    showSwipeHint?: boolean;
    isVideo?: boolean;
    video?: string;
    isMuted?: boolean;
    onToggleMute?: () => void;
}

/**
 * 🍱 ZOOM-REVEAL STACKED CARD
 * Next screen reveals from underneath with a zoom-in animation.
 */
export default function NewsCard({
    id, image, title, description, index, scrollY, totalItems,
    onComment, isSaved, onToggleSave, onOptions, onShare, onTap, isFullCard, showSwipeHint,
    isVideo, video, isMuted, onToggleMute
}: Props) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
        if (disliked) setDisliked(false);
    };

    const handleDislike = () => {
        setDisliked(!disliked);
        if (liked) setLiked(false);
    };

    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * CARD_HEIGHT,
            index * CARD_HEIGHT,
            (index + 1) * CARD_HEIGHT
        ];

        const scale = interpolate(
            scrollY.value,
            inputRange,
            [0.9, 1, 1],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            inputRange,
            [-CARD_HEIGHT, 0, 0],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            inputRange,
            [0, 1, 1],
            Extrapolation.CLAMP
        );

        return {
            zIndex: totalItems - index,
            elevation: totalItems - index,
            opacity: opacity,
            transform: [
                { translateY: translateY },
                { scale: scale }
            ]
        };
    });

    // If it's a full card (special image) OR a video, render fit-to-screen layout
    if (isFullCard || isVideo) {
        return (
            <Animated.View style={[styles.container, animatedStyle]}>
                <Pressable style={{ flex: 1 }} onPress={onTap}>
                    {isVideo ? (
                        <View style={{ flex: 1, backgroundColor: '#000' }}>
                            <Video
                                source={video ? { uri: video } : (typeof image === 'string' ? { uri: image } : image)}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay={true}
                                isMuted={isMuted}
                            />

                            {/* 8K Logo Overlay */}
                            <Image
                                source={require('../assets/images/8K-Logo 1.png')}
                                style={{
                                    position: 'absolute',
                                    top: 50,
                                    right: 20,
                                    width: 60,
                                    height: 60,
                                    zIndex: 20
                                }}
                                contentFit="contain"
                            />

                            {/* Right Vertical Actions (Share & Mute) */}
                            <View style={styles.videoRightActions}>
                                <TouchableOpacity style={styles.videoSideButton} onPress={() => onShare?.(id)}>
                                    <View style={styles.videoSideIconBg}>
                                        <Ionicons name="arrow-redo" size={28} color="#00C800" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.videoSideButton} onPress={onToggleMute}>
                                    <View style={styles.videoSideIconBg}>
                                        <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={28} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Bottom Horizontal Actions (Like, Dislike, Comment) */}
                            <View style={styles.videoBottomActions}>
                                <TouchableOpacity style={styles.videoActionButton} onPress={handleLike}>
                                    <Ionicons
                                        name={liked ? "thumbs-up" : "thumbs-up-outline"}
                                        size={28}
                                        color={liked ? "#1a73e8" : "#fff"}
                                    />
                                    <Text style={styles.videoActionText}>2.0K</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.videoActionButton} onPress={handleDislike}>
                                    <Ionicons
                                        name={disliked ? "thumbs-down" : "thumbs-down-outline"}
                                        size={28}
                                        color={disliked ? "#d93025" : "#fff"}
                                    />
                                    <Text style={styles.videoActionText}>46</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.videoActionButton}
                                    onPress={() => onComment?.(id)}
                                >
                                    <Ionicons name="chatbubble-outline" size={26} color="#fff" />
                                    <Text style={styles.videoActionText}>46</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <Image
                                source={image}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                            {/* 8K Logo Overlay for Full Image Card */}
                            <Image
                                source={require('../assets/images/8K-Logo 1.png')}
                                style={{
                                    position: 'absolute',
                                    top: 50,
                                    right: 20,
                                    width: 60,
                                    height: 60,
                                    zIndex: 20
                                }}
                                contentFit="contain"
                            />
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Pressable style={{ flex: 1 }} onPress={onTap}>
                {/* 1. Top Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={image}
                        style={styles.image}
                        contentFit="cover"
                    />
                    {/* Location Badge (Bottom Right of Image) */}
                    <View style={styles.locationBadgeContainer}>
                        <View style={styles.locationBadge}>
                            <Ionicons name="location" size={10} color="#fff" />
                            <Text style={styles.locationText}>గడివాడ</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Content Card (Sloped Overlap) */}
                <View style={styles.contentCard}>
                    {/* Slope Effect View */}
                    <View style={styles.slopeEdge} />

                    {/* Content Header (Inside White Card) */}
                    <View style={styles.contentHeader}>
                        <View style={styles.headerLeft}>
                            <Image
                                source={require('../assets/images/8K-Logo 1.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                            <Text style={styles.networkName}>8Knetwork:12-1-2026</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={styles.appLinkBadge}>
                                <Text style={styles.appLinkText}>8K news/Gfe1wx</Text>
                            </View>
                        </View>
                    </View>

                    {/* 3. Main Text Content */}
                    <ScrollView
                        style={styles.textContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.textScrollContent}
                    >
                        <Text style={styles.titleText}>{title}</Text>
                        <Text style={styles.descriptionText}>{description}</Text>

                        <Text style={styles.readMoreText}>ఇంకా చదవండి ......</Text>
                    </ScrollView>

                    {/* 4. Metadata & Action Bar Footer */}
                    <View style={styles.footer}>
                        <Pressable style={styles.metadataRow}>
                            <Ionicons name="time-outline" size={16} color="#333" />
                            <Text style={styles.metaText}>14 m ago / {index + 1} of {totalItems} Pages</Text>
                        </Pressable>

                        <View style={styles.separator} />

                        <View style={styles.actionRow} onStartShouldSetResponder={() => true}>
                            <View style={styles.leftActions}>
                                <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
                                    <Ionicons
                                        name={liked ? "thumbs-up" : "thumbs-up-outline"}
                                        size={24}
                                        color={liked ? "#1a73e8" : "#333"}
                                    />
                                    <Text style={styles.actionText}>2.0K</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={handleDislike}>
                                    <Ionicons
                                        name={disliked ? "thumbs-down" : "thumbs-down-outline"}
                                        size={24}
                                        color={disliked ? "#d93025" : "#333"}
                                    />
                                    <Text style={styles.actionText}>46</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => onComment?.(id)}
                                >
                                    <Ionicons name="chatbubble-outline" size={24} color="#333" />
                                    <Text style={styles.actionText}>46</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rightActions}>
                                <TouchableOpacity style={styles.iconButton} onPress={onOptions}>
                                    <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.iconButton} onPress={() => onShare?.(id)}>
                                    <Ionicons name="arrow-redo" size={28} color="#00C800" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: CARD_HEIGHT,
        width: '100%',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: CARD_HEIGHT * 0.40,
        backgroundColor: '#eee',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    locationBadgeContainer: {
        position: 'absolute',
        bottom: 40, // Above the overlap
        right: 15,
        zIndex: 5,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    locationText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    contentCard: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 20, // Moved further down to reveal more image
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    slopeEdge: {
        position: 'absolute',
        top: -50,
        left: -30,
        right: -30,
        height: 120, // Taller to cover the new gap
        backgroundColor: '#fff',
        transform: [{ rotate: '6deg' }],
        borderTopLeftRadius: 60,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        zIndex: 10, // Ensure header is above slopeEdge
        marginTop: 5,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 10,
        marginTop: -45, // Lifted up to the edge
        marginLeft: -5,
    },
    networkName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '700',
        marginTop: -35, // Lifted to match logo
    },
    headerRight: {
        alignItems: 'flex-end',
        marginTop: -30, // Lifted app link as well
    },
    appLinkBadge: {
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    appLinkText: {
        color: '#555',
        fontSize: 11,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    textScrollContent: {
        paddingBottom: 10,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000',
        marginBottom: 10, // Reduced margin
        lineHeight: 28, // Tighter line height
    },
    descriptionText: {
        fontSize: 19,
        fontWeight: '500',
        color: '#000',
        lineHeight: 28, // Slightly more breathing room for justified text
        marginBottom: 10,
        textAlign: 'justify', // Justified neat look
    },
    readMoreText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center', // Center the text
        marginTop: 10,       // Push it down a bit
    },
    footer: {
        paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    metaText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    actionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    iconButton: {
        padding: 5,
    },
    videoRightActions: {
        position: 'absolute',
        bottom: 120, // Positioned above the bottom actions
        right: 15,
        gap: 20,
        alignItems: 'center',
    },
    videoSideButton: {
        padding: 5,
    },
    videoSideIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBottomActions: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 80, // Leave space for side buttons if they were lower
        flexDirection: 'row',
        alignItems: 'center',
        gap: 25,
    },
    videoActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    videoActionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    }
});
