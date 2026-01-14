import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Welcome to 8K News',
        description: 'Experience news like never before with high-quality visuals and concise updates.',
        image: require('../assets/images/02-Welcome Page.png'),
    },
    {
        id: '2',
        title: 'Stay Informed',
        description: 'Get real-time updates on local and national news as they happen.',
        image: require('../assets/images/20-Main News.png'),
    },
    {
        id: '3',
        title: 'Offline Reading',
        description: 'Save your favorite stories to read them later, even without an internet connection.',
        image: require('../assets/images/25-Category complete.png'),
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showPermissions, setShowPermissions] = useState(false);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            setShowPermissions(true);
        }
    };

    const handleSkip = () => {
        setShowPermissions(true);
    };

    const requestPermissions = async () => {
        try {
            await Notifications.requestPermissionsAsync();
            router.replace('/newsfeed');
        } catch (error) {
            console.error('Error requesting permissions:', error);
            router.replace('/newsfeed');
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={styles.slide}>
                <Image
                    source={item.image}
                    style={styles.image}
                    contentFit="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    const renderDots = () => {
        return (
            <View style={styles.pagination}>
                {SLIDES.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.activeDot,
                        ]}
                    />
                ))}
            </View>
        );
    };

    if (showPermissions) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.permissionContainer}>
                    <View style={styles.permissionContent}>
                        <Text style={styles.permissionTitle}>Enable Permissions</Text>
                        <Text style={styles.permissionDescription}>
                            To give you the best experience, we need a few permissions.
                        </Text>

                        <View style={styles.permissionItem}>
                            <Text style={styles.permissionItemTitle}>🔔 Notifications</Text>
                            <Text style={styles.permissionItemDesc}>Get instant alerts for breaking news.</Text>
                        </View>

                        <View style={styles.permissionItem}>
                            <Text style={styles.permissionItemTitle}>💾 Storage</Text>
                            <Text style={styles.permissionItemDesc}>Save images and stories for offline access.</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={requestPermissions}
                        >
                            <Text style={styles.buttonText}>Allow & Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.skipButton]}
                            onPress={() => router.replace('/newsfeed')}
                        >
                            <Text style={[styles.buttonText, styles.skipButtonText]}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={32}
            />

            <View style={styles.bottomSection}>
                {renderDots()}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleNext}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        alignItems: 'flex-end',
    },
    skipText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    image: {
        width: width * 0.8,
        height: width * 0.8,
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#007AFF',
        width: 20,
        height: 8,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 60,
    },
    permissionContent: {
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    permissionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    permissionDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    permissionItem: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    permissionItemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    permissionItemDesc: {
        fontSize: 14,
        color: '#555',
    },
    skipButton: {
        backgroundColor: 'transparent',
    },
    skipButtonText: {
        color: '#666',
        fontWeight: 'normal',
    },
});
