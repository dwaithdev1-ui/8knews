import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';

import NewsCard from '../components/NewsCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const newsData = [
    {
        id: '1',
        title: 'Tech Revolution in 2024',
        description: 'Discover how AI and machine learning are shaping the future of industrial automation and smart cities.',
        image: require('../assets/images/20-Main News.png'),
    },
    {
        id: '2',
        title: 'Urban Green Spaces',
        description: 'Cities worldwide are adopting vertical gardens and rooftop farms to enhance urban biodiversity and air quality.',
        image: require('../assets/images/21-Local News.png'),
    },
    {
        id: '3',
        title: 'Deep Sea Exploration',
        description: 'Scientists uncover strange new life forms in the ocean depths, challenging our understanding of extreme biomes.',
        image: require('../assets/images/22-Trending News.png'),
    },
    {
        id: '4',
        title: 'Space Tourism Milestone',
        description: 'First commercial mission to the lunar orbit successfully completes its journey, opening a new chapter in space flight.',
        image: require('../assets/images/23- Ad Page.png'),
    },
    {
        id: '5',
        title: 'Renewable Energy Surge',
        description: 'Global investment in solar and wind power reaches record highs as countries strive for carbon neutrality.',
        image: require('../assets/images/24-Andhrapradesh News.png'),
    }
];

export default function NewsFeedScreen() {
    const scrollY = useSharedValue(0);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            <Animated.FlatList
                data={newsData}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                pagingEnabled
                snapToInterval={SCREEN_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onScroll={onScroll}
                refreshing={refreshing}
                onRefresh={onRefresh}
                scrollEventThrottle={8}
                renderItem={({ item, index }) => (
                    <NewsCard
                        image={item.image}
                        title={item.title}
                        description={item.description}
                        index={index}
                        scrollY={scrollY}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
