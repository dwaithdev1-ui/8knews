import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    ZoomIn,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { LAYOUT } from '../constants/Layout';

const width = LAYOUT.windowWidth;
const height = LAYOUT.windowHeight;

export default function PermissionsScreen() {
    const router = useRouter();
    const [step, setStep] = useState<'notification' | 'location'>('notification');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- NEWSFEED FEATURES STATES ---
    const [isHUDVisible, setIsHUDVisible] = useState(true);
    const [activeCategory, setActiveCategory] = useState('trending');
    const [unreadCount] = useState(12);
    const [userLocation] = useState('hyderabad');
    const blinkOpacity = useSharedValue(1);

    // Side Menu state
    const menuOpen = useSharedValue(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.value,
    }));

    const toggleMenu = () => {
        if (menuOpen.value === 0) {
            setIsMenuOpen(true);
            menuOpen.value = withTiming(1, { duration: 300 });
        } else {
            menuOpen.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    runOnJS(setIsMenuOpen)(false);
                }
            });
        }
    };

    const menuStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: interpolate(menuOpen.value, [0, 1], [-width, 0]) }
            ],
        };
    });

    const overlayStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(menuOpen.value, [0, 1], [0, 0.5]),
            display: menuOpen.value > 0 ? 'flex' : 'none',
        };
    });

    useEffect(() => {
        // --- 🛡️ PERMISSION SKIP LOGIC ---
        const checkExistingPermissions = async () => {
            try {
                const hasAskedNotif = await AsyncStorage.getItem('hasAskedNotificationPermission');
                const hasAskedLoc = await AsyncStorage.getItem('hasAskedLocationPermission');

                // If we've already asked both, bypass this screen
                if (hasAskedNotif === 'true' && hasAskedLoc === 'true') {
                    router.replace('/newsfeed');
                }
            } catch (err) {
                console.error("Error checking permissions state:", err);
            }
        };
        checkExistingPermissions();

        blinkOpacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1,
            true
        );
    }, []);

    const handleAction = async (action: 'allow' | 'deny') => {
        setIsProcessing(true);

        if (step === 'notification') {
            // Store that we've asked for notifications
            await AsyncStorage.setItem('hasAskedNotificationPermission', 'true');

            if (action === 'allow' && Platform.OS !== 'web') {
                try {
                    await Notifications.requestPermissionsAsync();
                } catch (e) {
                    console.error("Notification permission error:", e);
                }
            }
            setTimeout(() => {
                setIsProcessing(false);
                setStep('location');
            }, 500);
        } else {
            // Store that we've asked for location
            await AsyncStorage.setItem('hasAskedLocationPermission', 'true');
            // This is the final step, so also mark the tutorial/onboarding as seen
            await AsyncStorage.setItem('HAS_SEEN_TUTORIAL', 'true');

            if (action === 'allow' && Platform.OS !== 'web') {
                try {
                    await Location.requestForegroundPermissionsAsync();
                } catch (e) {
                    console.error("Location permission error:", e);
                }
            }
            setTimeout(() => {
                setIsProcessing(false);
                router.replace('/newsfeed?isTutorial=true');
            }, 500);
        }
    };

    return (
        <View style={styles.container}>

            {/* --- BACKGROUND: App Introduction Page Design --- */}
            <View style={styles.introBackground}>
                <Image
                    source={require('../assets/images/Rectangle 5.png')}
                    style={styles.topGoldImage}
                    contentFit="cover"
                />
                <View style={styles.bottomCardSection}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../assets/images/8K-Logo 1.png')}
                            style={styles.logo}
                            contentFit="contain"
                        />
                    </View>
                    <View style={styles.contentContainer}>
                        <Image
                            source={require('../assets/images/తెలుగు ప్రజల కోసం ప్రత్యేకంగా రూపొందిన 8K న్యూస్ యాప్ ప్రతి క్షణం తాజా వార్తలను అందిస్తుంది. 1.png')}
                            style={styles.introContentImage}
                            contentFit="contain"
                        />
                    </View>

                    {/* --- UPDATED FOOTER (Match NewsCard) --- */}
                    <View style={styles.footer}>
                        <View style={styles.actionRow}>
                            <View style={styles.leftActions}>
                                <TouchableOpacity style={styles.actionItem}>
                                    <Ionicons name="thumbs-up-outline" size={24} color="#333" />
                                    <Text style={styles.actionText}>2.0K</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem}>
                                    <Ionicons name="thumbs-down-outline" size={24} color="#333" />
                                    <Text style={styles.actionText}>46</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionItem}>
                                    <Ionicons name="chatbubble-outline" size={24} color="#333" />
                                    <Text style={styles.actionText}>46</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rightActions}>
                                <TouchableOpacity style={styles.iconButton}>
                                    <Ionicons name="ellipsis-vertical" size={22} color="#333" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.iconButton}>
                                    <Ionicons name="arrow-redo" size={28} color="#00C800" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* --- TOP HUD BAR --- */}
                {isHUDVisible && (
                    <View style={styles.topHud}>
                        <View style={styles.topHudContent}>
                            <TouchableOpacity style={styles.hudMenuBtn} onPress={toggleMenu}>
                                <Ionicons name="menu" size={28} color="#fff" />
                            </TouchableOpacity>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topHudCategories}>
                                <TouchableOpacity style={styles.categoryItemWrapper}>
                                    <Text style={[styles.categoryText, activeCategory === 'trending' && styles.categoryTextActive]}>ట్రెండింగ్</Text>
                                    {activeCategory === 'trending' && <View style={styles.categoryActiveIndicator} />}
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text style={styles.categoryText}>ఫొటోలు</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text style={styles.categoryText}>వీడియోలు</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                )}

                {/* --- BOTTOM HUD BAR --- */}
                {isHUDVisible && (
                    <View style={styles.bottomHud}>
                        <View style={styles.bottomHudContent}>
                            <TouchableOpacity style={styles.hudActionItem}>
                                <View>
                                    <Ionicons name="eye-off-outline" size={24} color="#FFD700" />
                                    {unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.hudActionLabel}>చదవని</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.hudActionItem}>
                                <Ionicons name="location-outline" size={24} color="#FFD700" />
                                <Text style={styles.hudActionLabel}>{userLocation === 'hyderabad' ? 'హైదరాబాద్' : 'గుంటూరు'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.hudActionItem}>
                                <Ionicons name="grid-outline" size={24} color="#FFD700" />
                                <Text style={styles.hudActionLabel}>కేటగిరీ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.hudActionItem}>
                                <Ionicons name="refresh-outline" size={24} color="#FFD700" />
                                <Text style={styles.hudActionLabel}>రీలోడ్</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* --- SIDE MENU --- */}
                <Animated.View style={[styles.menuOverlay, overlayStyle]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={toggleMenu} />
                </Animated.View>

                <Animated.View style={[styles.sideMenu, menuStyle]}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.menuHeader}>
                            <View style={styles.profileCircle}>
                                <Ionicons name="person" size={35} color="#fff" />
                            </View>
                            <View style={{ marginLeft: 15 }}>
                                <Text style={styles.userName}>Guest User</Text>
                                <Text style={styles.userSub}>మీ వివరాలు పూర్తి చేయండి</Text>
                            </View>
                        </View>
                        <ScrollView style={styles.menuList}>
                            {[
                                { icon: 'person-outline', label: 'ప్రొఫైల్' },
                                { icon: 'notifications-outline', label: 'నోటిఫికేషన్లు' },
                                { icon: 'language-outline', label: 'భాష' },
                                { icon: 'bookmark-outline', label: 'సేవ్ చేసిన వార్తలు' },
                                { icon: 'chatbox-ellipses-outline', label: 'అభిప్రాయం' },
                                { icon: 'alert-circle-outline', label: 'రిపోర్ట్ ఇష్యూ' },
                                { icon: 'settings-outline', label: 'సెట్టింగ్స్' },
                            ].map((item, idx) => (
                                <TouchableOpacity key={idx} style={styles.menuItem}>
                                    <Ionicons name={item.icon as any} size={22} color="#333" />
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.menuFooter}>
                            <Text style={styles.versionText}>Version 1.0.17</Text>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </View>

            {/* --- OVERLAY --- */}
            <View style={styles.overlay} />

            {/* --- POPUPS --- */}
            {step === 'notification' ? (
                // NOTIFICATION POPUP
                <Animated.View
                    entering={ZoomIn.duration(300)}
                    style={styles.popupContainer}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="notifications" size={32} color="#222" />
                    </View>

                    <Text style={styles.titleText}>
                        Allow <Text style={styles.boldText}>8knews</Text> to send notifications
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleAction('allow')}
                            disabled={isProcessing}
                            activeOpacity={0.7}
                        >
                            {isProcessing ? <ActivityIndicator color="#000" /> : <Text style={styles.actionButtonText}>Allow</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleAction('deny')}
                            disabled={isProcessing}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.actionButtonText}>Don't Allow</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            ) : step === 'location' ? (
                // LOCATION POPUP (Android 12 Style)
                <Animated.View
                    entering={ZoomIn.duration(300)}
                    style={[styles.popupContainer, styles.locationPopupWidth]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="location-sharp" size={32} color="#1E88E5" />
                    </View>

                    <Text style={styles.locationTitle}>
                        Allow <Text style={styles.boldText}>8knews</Text> to access this device's precise location?
                    </Text>

                    {/* Precise vs Approximate Visuals */}
                    <View style={styles.mapOptionsContainer}>
                        <View style={styles.mapOption}>
                            <View style={[styles.mapCircle, styles.mapSelected]}>
                                <Image
                                    // Simulating map view
                                    source={require('../assets/images/map_texture.jpg')} // Placeholder for map texture
                                    style={styles.mapTexture}
                                    contentFit="cover"
                                />
                                <View style={styles.pinPoint} />
                                <Ionicons name="location-sharp" size={24} color="#1E88E5" style={styles.centerPin} />
                            </View>
                            <Text style={[styles.mapLabel, styles.labelSelected]}>Precise</Text>
                        </View>

                        <View style={styles.mapOption}>
                            <View style={styles.mapCircle}>
                                <Image
                                    source={require('../assets/images/map_texture.jpg')}
                                    style={[styles.mapTexture, { opacity: 0.5 }]}
                                    contentFit="cover"
                                />
                                <View style={styles.approxCircle} />
                            </View>
                            <Text style={styles.mapLabel}>Approximate</Text>
                        </View>
                    </View>

                    {/* Buttons Stack */}
                    <View style={styles.locationBtnContainer}>
                        <TouchableOpacity
                            style={styles.locBtn}
                            onPress={() => handleAction('allow')}
                            disabled={isProcessing}
                        >
                            <Text style={styles.locBtnText}>While using the app</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.locBtn}
                            onPress={() => handleAction('allow')}
                            disabled={isProcessing}
                        >
                            <Text style={styles.locBtnText}>Only this time</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.locBtn}
                            onPress={() => handleAction('deny')}
                            disabled={isProcessing}
                        >
                            <Text style={styles.locBtnText}>Don't allow</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            ) : null}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    // Background UI Styles (Intro)
    introBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E3AD3E',
    },
    topGoldImage: {
        flex: 0.35,
        width: '100%',
    },
    bottomCardSection: {
        flex: 0.65,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
        justifyContent: 'space-between'
    },
    logoWrapper: {
        position: 'absolute',
        top: -35, left: 20,
        width: 70, height: 70,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
        transform: [{ rotate: '-5deg' }]
    },
    logo: { width: '100%', height: '100%' },
    contentContainer: { marginTop: 10, flex: 1, justifyContent: 'center' },
    introContentImage: {
        width: '100%',
        height: 200,
    },
    swipeButton: {
        backgroundColor: '#0F5B8B', // Deep Blue
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 10,
        zIndex: 10, // Ensure button is clickable
    },
    // Hint Image Styles
    hintImageContainer: {
        position: 'absolute',
        bottom: '100%', // Position directly above the button
        alignSelf: 'center',
        marginBottom: 10,
        zIndex: 20,
    },
    hintImage: {
        width: 150, // Reasonable size for a gesture hint
        height: 150,
    },
    swipeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // --- UPDATED FOOTER (Match NewsCard) ---
    footer: {
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        width: '100%',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 25,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    iconButton: {
        padding: 4,
    },

    // --- HUD STYLES ---
    topHud: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 90,
        zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingTop: Platform.OS === 'ios' ? 40 : 10,
    },
    topHudContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    hudMenuBtn: {
        padding: 5,
        marginRight: 10,
    },
    topHudCategories: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        paddingRight: 60,
    },
    categoryItemWrapper: {
        alignItems: 'center',
    },
    categoryText: {
        color: '#eee',
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    categoryTextActive: {
        color: '#fff',
        opacity: 1,
    },
    categoryActiveIndicator: {
        width: '100%',
        height: 3,
        backgroundColor: '#FFD700',
        marginTop: 4,
        borderRadius: 2,
    },
    bottomHud: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 120 : 100,
        zIndex: 200,
        backgroundColor: 'rgba(51, 51, 51, 0.95)',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        justifyContent: 'center',
    },
    bottomHudContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    hudActionItem: {
        alignItems: 'center',
        gap: 6,
    },
    hudActionLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    unreadBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#FFD700',
        paddingHorizontal: 5,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    unreadBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '900',
    },
    unreadDot: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ff0000',
        borderWidth: 1.5,
        borderColor: '#fff',
    },

    // --- RESTORED POPUP STYLES ---
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    popupContainer: {
        width: width * 0.75,
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 1000,
    },
    locationPopupWidth: {
        width: width * 0.82,
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderRadius: 28,
    },
    iconContainer: { marginBottom: 16 },
    boldText: { fontWeight: 'bold' },
    titleText: {
        fontSize: 18,
        color: '#111',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 28,
        fontWeight: '600',
    },
    buttonContainer: { width: '100%', gap: 14 },
    actionButton: {
        width: '100%',
        backgroundColor: '#DAE9FA',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: { fontSize: 16, fontWeight: '700', color: '#000' },
    locationTitle: {
        fontSize: 17,
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        paddingHorizontal: 5,
    },
    mapOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    mapOption: {
        alignItems: 'center',
        width: '45%',
    },
    mapCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapSelected: {
        borderColor: '#1E88E5',
        borderWidth: 2,
    },
    mapTexture: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    centerPin: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2,
    },
    pinPoint: {},
    approxCircle: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(30, 136, 229, 0.3)',
        borderWidth: 1, borderColor: '#1E88E5',
    },
    mapLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    labelSelected: {
        color: '#1E88E5',
        fontWeight: '700',
    },
    locationBtnContainer: {
        width: '100%',
        backgroundColor: '#DAE9FA',
        borderRadius: 18,
        overflow: 'hidden',
    },
    locBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    locBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        width: '100%',
    },

    // --- SIDE MENU STYLES ---
    menuOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 500,
    },
    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: width * 0.8,
        backgroundColor: '#fff',
        zIndex: 600,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        elevation: 10,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    profileCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    userSub: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    menuList: {
        flex: 1,
        paddingTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
    },
    menuLabel: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        flex: 1,
    },
    menuFooter: {
        padding: 25,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    versionText: {
        fontSize: 12,
        color: '#999',
    },
});
