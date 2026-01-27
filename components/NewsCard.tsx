import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
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
    onOptions?: (id: string) => void;
    onShare?: (id: string) => void;
    onTap?: () => void;
    isFullCard?: boolean;
    showSwipeHint?: boolean;
    isVideo?: boolean;
    video?: string;
    isMuted?: boolean;
    onToggleMute?: () => void;
    cardHeight?: number;
    showCommentHint?: boolean;
    showOptionsHint?: boolean;
    showShareHint?: boolean;
    commentCount?: number;
    likeCount?: number;
    dislikeCount?: number;
    liked?: boolean;
    disliked?: boolean;
    onLike?: () => void;
    onDislike?: () => void;
    darkMode?: boolean;
}

/**
 * 🍱 ZOOM-REVEAL STACKED CARD
 * Next screen reveals from underneath with a zoom-in animation.
 */
export default function NewsCard({
    id, image, title, description, index, scrollY, totalItems,
    onComment, isSaved, onToggleSave, onOptions, onShare, onTap, isFullCard, showSwipeHint,
    isVideo, video, isMuted, onToggleMute, cardHeight, showCommentHint, showOptionsHint, showShareHint, commentCount = 0,
    likeCount = 0, dislikeCount = 0, liked = false, disliked = false, onLike, onDislike, darkMode = false
}: Props) {
    const CARD_HEIGHT_VAL = cardHeight || LAYOUT.windowHeight;

    // 🎨 DYNAMIC COLORS
    const bgColor = darkMode ? '#121212' : '#fff';
    const textColor = darkMode ? '#eee' : '#000';
    const subTextColor = darkMode ? '#bbb' : '#333';
    const cardBgColor = darkMode ? '#1e1e1e' : '#fff';

    // Blinking animation for comment hint
    const hintBlinkAnim = useSharedValue(1);

    React.useEffect(() => {
        if (showCommentHint || showOptionsHint || showShareHint) {
            hintBlinkAnim.value = withRepeat(
                withTiming(0.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        }
    }, [showCommentHint, showOptionsHint, showShareHint]);

    const hintBlinkStyle = useAnimatedStyle(() => ({
        opacity: hintBlinkAnim.value,
    }));

    const formatCount = (count: number) => {
        if (!count) return '0';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const handleLike = (e: any) => {
        e.stopPropagation();
        onLike?.();
    };

    const handleDislike = (e: any) => {
        e.stopPropagation();
        onDislike?.();
    };

    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * CARD_HEIGHT_VAL,
            index * CARD_HEIGHT_VAL,
            (index + 1) * CARD_HEIGHT_VAL
        ];

        // 📈 Simpler scale/transY to avoid "underneath" ghosting
        const scale = interpolate(
            scrollY.value,
            inputRange,
            [0.9, 1, 1],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            inputRange,
            [-CARD_HEIGHT_VAL, 0, 0],
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
            <Animated.View style={[styles.container, { height: CARD_HEIGHT_VAL, backgroundColor: bgColor }, animatedStyle]}>
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
                                    <Text style={styles.videoActionText}>{formatCount(likeCount)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.videoActionButton} onPress={handleDislike}>
                                    <Ionicons
                                        name={disliked ? "thumbs-down" : "thumbs-down-outline"}
                                        size={28}
                                        color={disliked ? "#d93025" : "#fff"}
                                    />
                                    <Text style={styles.videoActionText}>{formatCount(dislikeCount)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.videoActionButton}
                                    onPress={() => onComment?.(id)}
                                >
                                    <View style={{ position: 'relative' }}>
                                        <Ionicons name="chatbubble-outline" size={26} color="#fff" />
                                        {showCommentHint && (
                                            <Animated.View style={[styles.commentHintDot, hintBlinkStyle]} />
                                        )}
                                    </View>
                                    <Text style={styles.videoActionText}>{commentCount}</Text>
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
        <Animated.View style={[styles.container, { height: CARD_HEIGHT_VAL, backgroundColor: bgColor }, animatedStyle]}>
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
                <View style={[styles.contentCard, { backgroundColor: cardBgColor }]}>
                    {/* Slope Effect View */}
                    <View style={[styles.slopeEdge, { backgroundColor: cardBgColor }]} />

                    {/* Content Header (Inside White Card) */}
                    <View style={styles.contentHeader}>
                        <View style={styles.headerLeft}>
                            <Image
                                source={require('../assets/images/8K-Logo 1.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                            <Text style={[styles.networkName, { color: subTextColor }]}>8Knetwork:12-1-2026</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={[styles.appLinkBadge, { backgroundColor: darkMode ? '#333' : '#F0F2F5' }]}>
                                <Text style={[styles.appLinkText, { color: darkMode ? '#ccc' : '#555' }]}>8K news/Gfe1wx</Text>
                            </View>
                        </View>
                    </View>

                    {/* 3. Main Text Content */}
                    <View style={styles.textContainer}>
                        <Text style={[styles.titleText, { color: textColor }]} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
                        <Text style={[styles.descriptionText, { color: textColor }]} numberOfLines={10} ellipsizeMode="tail">{description}</Text>

                        <Text style={[styles.readMoreText, { color: textColor }]}>ఇంకా చదవండి ......</Text>
                    </View>

                    {/* 4. Metadata & Action Bar Footer */}
                    <View style={styles.footer}>
                        <Pressable style={styles.metadataRow}>
                            <Ionicons name="time-outline" size={16} color={darkMode ? '#ccc' : '#333'} />
                            <Text style={[styles.metaText, { color: darkMode ? '#ccc' : '#666' }]}>14 m ago / {index + 1} of {totalItems} Pages</Text>
                        </Pressable>

                        <View style={[styles.separator, { backgroundColor: darkMode ? '#333' : '#eee' }]} />

                        <View style={styles.actionRow} onStartShouldSetResponder={() => true}>
                            <View style={styles.leftActions}>
                                <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
                                    <Ionicons
                                        name={liked ? "thumbs-up" : "thumbs-up-outline"}
                                        size={24}
                                        color={liked ? "#1a73e8" : (darkMode ? '#ddd' : '#333')}
                                    />
                                    <Text style={[styles.actionText, { color: darkMode ? '#ddd' : '#666' }]}>{formatCount(likeCount)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem} onPress={handleDislike}>
                                    <Ionicons
                                        name={disliked ? "thumbs-down" : "thumbs-down-outline"}
                                        size={24}
                                        color={disliked ? "#d93025" : (darkMode ? '#ddd' : '#333')}
                                    />
                                    <Text style={[styles.actionText, { color: darkMode ? '#ddd' : '#666' }]}>{formatCount(dislikeCount)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => onComment?.(id)}
                                >
                                    <View style={{ position: 'relative' }}>
                                        <Ionicons name="chatbubble-outline" size={24} color={darkMode ? '#ddd' : '#333'} />
                                        {showCommentHint && (
                                            <Animated.View style={[styles.commentHintDot, hintBlinkStyle]} />
                                        )}
                                    </View>
                                    <Text style={[styles.actionText, { color: darkMode ? '#ddd' : '#666' }]}>{commentCount}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rightActions}>
                                <TouchableOpacity style={styles.iconButton} onPress={() => onOptions?.(id)}>
                                    <View style={{ position: 'relative' }}>
                                        <Ionicons name="ellipsis-vertical" size={24} color={darkMode ? '#fff' : '#000'} />
                                        {showOptionsHint && (
                                            <Animated.View style={[styles.commentHintDot, hintBlinkStyle]} />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.iconButton} onPress={() => onShare?.(id)}>
                                    <View style={{ position: 'relative' }}>
                                        <Ionicons name="arrow-redo" size={28} color="#00C800" />
                                        {showShareHint && (
                                            <Animated.View style={[styles.commentHintDot, hintBlinkStyle]} />
                                        )}
                                    </View>
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
        height: CARD_HEIGHT, // 📏 Match synchronized window height exactly
        width: '100%',
        backgroundColor: '#fff', // 🥥 Solid background to prevent ghosting
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: CARD_HEIGHT * 0.475, // 📈 Final precision to fill 820px perfectly
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
    titleText: {
        fontSize: 22, // 📉 Balanced size
        fontWeight: '900',
        color: '#000',
        marginBottom: 5,
        lineHeight: 28,
    },
    descriptionText: {
        fontSize: 16, // 📉 Reduced from 20 to fit more text
        fontWeight: '500',
        color: '#000',
        lineHeight: 20,
        marginBottom: 5,
        textAlign: 'justify',
    },
    readMoreText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginTop: 5,
    },
    footer: {
        paddingVertical: 0,
        paddingBottom: 0, // ⚓ Absolute zero bottom edge
    },
    metadataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5, // 📉 Reduced from 10
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
        marginBottom: 5,
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
    },
    commentHintDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF0000',
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 100,
    }
});
