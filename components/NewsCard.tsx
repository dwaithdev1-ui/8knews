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
    onLike?: (id: string) => void;
    onDislike?: (id: string) => void;
    darkMode?: boolean;
    autoPlayEnabled?: boolean;
    type?: 'news' | 'ad';
    redirectUrl?: string;
    onAdRedirect?: () => void;
    shareCount?: number;
    onDownload?: () => void;
    onWhatsAppShare?: () => void;
    onIncrementShare?: () => void;
}

/**
 * 🍱 ZOOM-REVEAL STACKED CARD
 * Next screen reveals from underneath with a zoom-in animation.
 */
const NewsCard = React.memo(({
    id, image, title, description, index, scrollY, totalItems,
    onComment, isSaved, onToggleSave, onOptions, onShare, onTap, isFullCard, showSwipeHint,
    isVideo, video, isMuted, onToggleMute, cardHeight, showCommentHint, showOptionsHint, showShareHint, commentCount = 0,
    likeCount = 0, dislikeCount = 0, liked = false, disliked = false, onLike, onDislike, darkMode = false, autoPlayEnabled = true,
    type = 'news', redirectUrl, onAdRedirect, shareCount = 0, onDownload, onWhatsAppShare, onIncrementShare
}: Props) => {
    const CARD_HEIGHT_VAL = cardHeight || LAYOUT.windowHeight;

    // 🎨 DYNAMIC COLORS
    const bgColor = darkMode ? '#000000' : '#fff';
    const textColor = darkMode ? '#FFFFFF' : '#000';
    const subTextColor = darkMode ? '#A1A1A1' : '#333';
    const cardBgColor = darkMode ? '#151718' : '#fff';

    // Playback State
    const [isPlaying, setIsPlaying] = React.useState(autoPlayEnabled);

    // Sync state if setting changes
    React.useEffect(() => {
        setIsPlaying(autoPlayEnabled);
    }, [autoPlayEnabled]);

    // Debug logging for ads
    React.useEffect(() => {
        if (type === 'ad') {
            console.log('Ad Card Detected:', {
                id,
                type,
                redirectUrl,
                hasOnAdRedirect: !!onAdRedirect
            });
        }
    }, [type, redirectUrl, onAdRedirect, id]);

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
        onLike?.(id);
    };

    const handleDislike = (e: any) => {
        e.stopPropagation();
        onDislike?.(id);
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

    // If it's a full card (special image) OR explicitly Full Screen, render fit-to-screen layout
    if (isFullCard) {
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
                                shouldPlay={isPlaying}
                                isMuted={isMuted}
                            />

                            {/* Play Button Overlay (Allows clicks through to HUD) */}
                            {!isPlaying && (
                                <View
                                    pointerEvents="box-none"
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}
                                >
                                    <TouchableOpacity
                                        onPress={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                                        style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 50, padding: 15 }}
                                    >
                                        <Ionicons name="play" size={50} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}

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
                            <View style={[styles.videoRightActions, { zIndex: 100 }]}>
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
                            <View style={[styles.videoBottomActions, { zIndex: 100 }]}>
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
                            {type === 'ad' && (
                                <View style={styles.sponsoredBadgeFull}>
                                    <Text style={styles.sponsoredText}>Sponsored / Ad</Text>
                                </View>
                            )}
                            {/* Ad Redirect Icon for Full Card */}
                            {type === 'ad' && redirectUrl && (
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onAdRedirect?.();
                                    }}
                                    style={styles.adRedirectButton}
                                >
                                    <View style={styles.adRedirectIconBg}>
                                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                                        <Ionicons name="chevron-forward" size={24} color="#fff" style={{ marginLeft: -12 }} />
                                    </View>
                                </TouchableOpacity>
                            )}
                            {/* Photo Action Bar (Download, WhatsApp, Share) */}
                            {type !== 'ad' && !isVideo && (
                                <View style={styles.photoActionBar}>
                                    <TouchableOpacity
                                        style={styles.photoActionButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onDownload?.();
                                        }}
                                    >
                                        <Ionicons name="download-outline" size={28} color="#fff" />
                                        <Text style={styles.photoActionLabel}>Download</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.photoActionButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onWhatsAppShare?.();
                                            onIncrementShare?.();
                                        }}
                                    >
                                        <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
                                        <Text style={styles.photoActionLabel}>{shareCount} Shares</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.photoActionButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onShare?.(id);
                                            onIncrementShare?.();
                                        }}
                                    >
                                        <Ionicons name="share-outline" size={28} color="#fff" />
                                        <Text style={styles.photoActionLabel}>Share</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[styles.container, { height: CARD_HEIGHT_VAL, backgroundColor: bgColor }, animatedStyle]}>
            <Pressable style={{ flex: 1 }} onPress={onTap}>
                {/* 1. Top Image/Video Section */}
                <View style={styles.imageContainer}>
                    {isVideo ? (
                        <View style={{ flex: 1 }}>
                            <Video
                                source={video ? { uri: video } : (typeof image === 'string' ? { uri: image } : image)}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay={isPlaying}
                                isMuted={isMuted}
                            />

                            {/* Play Button Overlay (Allows clicks through) */}
                            {!isPlaying && (
                                <View
                                    pointerEvents="box-none"
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}
                                >
                                    <TouchableOpacity
                                        onPress={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                                        style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 50, padding: 15 }}
                                    >
                                        <Ionicons name="play" size={50} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Tap to Toggle Play/Pause when Playing */}
                            {isPlaying && (
                                <Pressable
                                    onPress={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}
                                />
                            )}

                            {/* Mute Button for Standard Card */}
                            <TouchableOpacity
                                onPress={onToggleMute}
                                style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20, zIndex: 15 }}
                            >
                                <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Image
                            source={image}
                            style={styles.image}
                            contentFit="cover"
                        />
                    )}

                    {/* Ad Redirect Icon (Top Right) */}
                    {type === 'ad' && redirectUrl && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onAdRedirect?.();
                            }}
                            style={styles.adRedirectButton}
                        >
                            <View style={styles.adRedirectIconBg}>
                                <Ionicons name="chevron-forward" size={24} color="#fff" />
                                <Ionicons name="chevron-forward" size={24} color="#fff" style={{ marginLeft: -12 }} />
                            </View>
                        </TouchableOpacity>
                    )}

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

                        {type !== 'ad' ? (
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
                        ) : (
                            <View style={styles.adActionRow}>
                                <TouchableOpacity
                                    style={styles.visitWebsiteBtn}
                                    onPress={onTap}
                                >
                                    <Text style={styles.visitWebsiteText}>Visit Website / App</Text>
                                    <Ionicons name="open-outline" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
});

export default NewsCard;

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
    termsCopyright: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
        fontWeight: '500',
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
        right: 80, // Space for right vertical actions
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
    },
    sponsoredBadgeFull: {
        position: 'absolute',
        top: 120,
        left: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 30,
        borderWidth: 1,
        borderColor: '#fab005',
    },
    sponsoredBadgeSmall: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(255, 215, 0, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        zIndex: 30,
        borderWidth: 1,
        borderColor: '#fab005',
    },
    sponsoredText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    adActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: '100%',
    },
    visitWebsiteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a73e8',
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    visitWebsiteText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    adRedirectButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1000,
    },
    adRedirectIconBg: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(26, 115, 232, 1)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    photoActionBar: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 15,
        borderRadius: 20,
        zIndex: 50,
    },
    photoActionButton: {
        alignItems: 'center',
        gap: 5,
    },
    photoActionLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
});
