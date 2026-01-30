import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import React, { useCallback, useEffect, useState } from 'react';
import {
    BackHandler,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';



import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { useLocalSearchParams, useRouter } from 'expo-router';
import CategoryEndCard from '../components/CategoryEndCard';
import LoginScreen from '../components/LoginScreen';
import NewsCard from '../components/NewsCard';
import { LAYOUT } from '../constants/Layout';
import { useAuth } from '../contexts/AuthContext';

const { windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT } = LAYOUT;
const HEADER_HEIGHT = 0;

// 🌍 LANGUAGE CONFIGURATION
const LANGUAGES = [
    { id: 'english', name: 'English', localName: 'Hyderabad', letter: 'Aa', color: '#8E44AD' }, // Purple
    { id: 'tamil', name: 'Tamil', localName: 'தமிழ்', letter: 'த', color: '#2ECC71' }, // Green
    { id: 'telugu', name: 'Telugu', localName: 'తెలుగు', letter: 'తె', color: '#E74C3C' }, // Red
    { id: 'kannada', name: 'Kannada', localName: 'ಕన్నడ', letter: 'ಕ', color: '#3498DB' }, // Blue
    { id: 'hindi', name: 'Hindi', localName: 'Hindi', letter: 'हि', color: '#F39C12' }, // Orange
    { id: 'marathi', name: 'Marathi', localName: 'मराठी', letter: 'म', color: '#E91E63' }, // Pink
    { id: 'malayalam', name: 'Malayalam', localName: 'മലയാളം', letter: 'മ', color: '#1ABC9C' }, // Teal
    { id: 'gujarati', name: 'Gujarati', localName: 'ગુજરાતી', letter: 'ગ', color: '#F1C40F' }, // Yellow
    { id: 'bangla', name: 'Bangla', localName: 'বাংলা', letter: 'বা', color: '#16A085' }, // Teal
];

const API_URL = 'http://192.168.29.70:3000/api';

const formatCount = (count: number) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
};

const DEFAULT_NEWS_DATA = [
    // 🏠 MAIN NEWS & TRENDING - MODI VISIBILITY
    {
        id: 'national-1',
        title: 'ప్రధాని మోదీ - జర్మన్ ఛాన్సలర్ భేటీ',
        description: 'జర్మన్ ఛాన్సలర్ ఫ్రెడరిక్ మెర్జ్‌తో ప్రధాని మోదీ సమావేశం. ఇరు దేశాల మధ్య వ్యూహాత్మక భాగస్వామ్యం, వాణిజ్యం మరియు టెక్నాలజీ రంగాలలో సహకారంపై కీలక చర్చలు.',
        image: require('../assets/images/res_rect_5_6.png'),
        tags: ['national', 'trending']
    },
    // // 📸 PHOTOS (Top HUD)
    // {
    //     id: 'photo-hud-item-1',
    //     title: 'Ethereal Beauty',
    //     description: 'Experience the visual splendor.',
    //     image: require('../assets/images/res_71nplsn8_sl_ac_uf894_1000_ql80.jpg'),
    //     tags: ['photos', 'trending'],
    //     isFullCard: true
    // },
    // 🏠 MAIN NEWS & TRENDING
    {
        id: 'main-1',
        title: 'సంక్రాంతి సంబరాలు: తెలుగు లోగిళ్ళలో పండుగ శోభ',
        description: 'భోగి మంటలు, రంగవల్లులు, గాలిపటాలతో తెలుగు రాష్ట్రాల్లో సంక్రాంతి వేడుకలు ఘనంగా జరుగుతున్నాయి. ఇంటి ముందు ముగ్గులు, గొబ్బెమ్మలు, హరిదాసుల కీర్తనలు, బసవన్నల దీవెనలతో పల్లెలు కళకళలాడుతున్నాయి. పిండివంటల ఘుమఘుమలు, కుటుంబ సభ్యుల కలయికలతో ఆనందం వెల్లివిరుస్తోంది. ఈ పండుగ ప్రతింటా సిరులు కురిపించాలని కోరుకుందాం.',
        image: require('../assets/images/res_253566_sankrantiii.webp'),
        tags: ['main', 'trending']
    },
    {
        id: 'main-2',
        title: 'జీఎస్‌ఎల్‌వీ-ఎఫ్15: నావిగేషన్ ఉపగ్రహ ప్రయోగం',
        description: 'శ్రీహరికోట నుండి జనవరి 29న సాయంత్రం 6:23 గంటలకు ఎన్‌వీఎస్-02 ఉపగ్రహాన్ని మోసుకెళ్లే జీఎస్‌ఎల్‌వీ-ఎఫ్15 రాకెట్ ప్రయోగం జరగనుంది. ఇది భారత నావిగేషన్ వ్యవస్థలో కీలకం.',
        image: require('../assets/images/res_high.jpg'),
        tags: ['main', 'trending']
    },
    {
        id: 'main-3',
        title: 'జాతీయ యువజన దినోత్సవం: స్వామి వివేకానంద స్ఫూర్తి',
        description: 'స్వామి వివేకానంద జయంతి సందర్భంగా దేశవ్యాప్తంగా జాతీయ యువజన దినోత్సవ వేడుకలు. యువత దేశాభివృద్ధిలో కీలక పాత్ర పోషించాలని, ఆయన ఆశయాలను స్ఫూర్తిగా తీసుకోవాలని ప్రముఖుల పిలుపు. పాఠశాలలు, కళాశాలల్లో ప్రత్యేక కార్యక్రమాలు.',
        image: require('../assets/images/res_national_youth_day_vivekananda.jpg'),
        tags: ['main', 'trending']
    },
    {
        id: 'main-4',
        title: 'జాతీయ హైవే ప్రాజెక్టుల ప్రారంభం',
        description: 'దేశవ్యాప్తంగా రవాణా సౌకర్యాలను మెరుగుపరచడానికి వేల కోట్ల రూపాయలతో నూతన రహదారుల నిర్మాణం.',
        image: require('../assets/images/res_rectangle_5_1.png'),
        tags: ['main']
    },

    // 🎬 CINEMA (Pushpa & Others)
    {
        id: 'cine-pawan',
        title: 'తీవ్ర జ్వరంతో బాధపడుతున్న పవన్ కళ్యాణ్ ను పరామర్శించిన చంద్రబాబు... పవన్ ఆరోగ్యంపై',
        description: 'ఆంధ్రప్రదేశ్ ఉప ముఖ్యమంత్రి పవన్ కళ్యాణ్ ను ముఖ్యమంత్రి చంద్రబాబు నాయుడు పరామర్శించారు. గత కొద్ది రోజులుగా వైరల్ ఫీవర్ తో బాధపడుతున్న పవన్ ఆరోగ్యం కుదుటపడుతోంది.',
        image: require('../assets/images/res_rectangle_5_1.png'),
        tags: ['cinema', 'trending', 'politics']
    },
    {
        id: 'cine-1',
        title: 'ది రాజా సాబ్',
        description: '',
        image: require('../assets/images/res_the_raja_saab_27x40.jpg'),
        tags: ['cinema', 'trending'],
        isFullCard: true
    },
    {
        id: 'cine-2',
        title: 'టాలీవుడ్ అప్‌కమింగ్ బిగ్ బడ్జెట్ సినిమాలు',
        description: 'త్వరలో విడుదల కాబోతున్న టాప్ హీరోల చిత్రాల టీజర్స్ మరియు ట్రైలర్స్ సోషల్ మీడియాలో వైరల్ అవుతున్నాయి.',
        image: require('../assets/images/res_tollywood_happy_new_year_2026_hd_posters_1.webp'),
        tags: ['cinema', 'trending'],
        isFullCard: true
    },
    {
        id: 'cine-3',
        title: 'గ్లోబల్ సినిమా వేదికపై టాలీవుడ్ సత్తా',
        description: 'మన తెలుగు సినిమాలు అంతర్జాతీయ వేదికలపై అవార్డులు గెలుచుకుంటూ తెలుగు జెండాను ఎగరేస్తున్నాయి.',
        image: require('../assets/images/res_vertical_59065698_c226_41df_b879_f54fb04bdb48.jpg'),
        tags: ['cinema'],
        isFullCard: true
    },

    // 🕉️ BHAKTI (Devotional & Festivals)
    {
        id: 'bhakti-1',
        title: 'ఆధ్యాత్మిక శాంతి: ధ్యానం ప్రాముఖ్యత',
        description: 'ధ్యానం చేయడం వల్ల మనస్సు ప్రశాంతంగా ఉండటమే కాకుండా ఆరోగ్యం కూడా మెరుగుపడుతుంది.',
        image: require('../assets/images/res_lordshive.png'),
        tags: ['bhakti', 'trending'],
        isFullCard: true
    },
    {
        id: 'bhakti-2',
        title: 'ప్రసిద్ధ పుణ్యక్షేత్రాల దర్శనం - యాత్రా విశేషాలు',
        description: 'ఈ పండుగ సీజన్ లో తప్పక సందర్శించాల్సిన ముఖ్యమైన దర్శనీయ క్షేత్రాల జాబితా మీ కోసం.',
        image: require('../assets/images/res_bhakthi.jpg'),
        tags: ['bhakti'],
        isFullCard: true
    },
    {
        id: 'bhakti-3',
        title: 'మహా శివరాత్రి వేడుకల కోసం సిద్ధమవుతున్న ఆలయాలు',
        description: 'శైవ క్షేత్రాలలో మహా శివరాత్రి సందర్భంగా విద్యుత్ దీపాలతో అలంకరణ మరియు ప్రత్యేక పూజలు.',
        image: require('../assets/images/res_bhogi_festival_images_education.png'),
        tags: ['bhakti', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-bhakti-1',
        title: 'ప్రార్థన',
        description: 'ప్రశాంతమైన ఉదయం కోసం ప్రార్థన.',
        image: require('../assets/images/res_praying_hands.png'),
        tags: ['bhakti'],
        isFullCard: true
    },

    // 🚜 AGRICULTURE (Vyavasayam)
    {
        id: 'agri-1',
        title: 'వ్యవసాయంలో డ్రోన్ టెక్నాలజీ వినియోగం',
        description: 'రైతులకు సాగులో సహాయం చేయడానికి ప్రభుత్వం ప్రవేశపెట్టిన మల్టీ-పర్పస్ డ్రోన్స్ మంచి ఫలితాలను ఇస్తున్నాయి.',
        image: require('../assets/images/res_pad_screenshot_p4v5d7z8j6.webp'),
        tags: ['agriculture', 'trending'],
        isFullCard: true
    },
    {
        id: 'agri-2',
        title: 'సేంద్రీయ సాగుతో అధిక లాభాలు: రైతుల అనుభవం',
        description: 'కెమికల్స్ వాడకుండా సహజ సిద్ధంగా పండించిన పంటలకు మార్కెట్లో మంచి గిరాకీ ఏర్పడింది.',
        image: require('../assets/images/res_premium_photo_1682092016074_b136e1acb26e.jpg'),
        tags: ['agriculture', 'trending'],
        isFullCard: true
    },
    {
        id: 'agri-3',
        title: 'గుంటూరు మిర్చి యార్డ్‌లో రికార్డ్ లావాదేవీలు',
        description: 'ఈ ఏడాది మిర్చి దిగుబడి ఆశాజనకంగా ఉండటంతో రైతులు హర్షం వ్యక్తం చేస్తున్నారు.',
        image: require('../assets/images/res_picture5.png'),
        tags: ['agriculture', 'guntur', 'local'],
        isFullCard: true
    },

    // 🏆 SPORTS (Kridalu)
    {
        id: 'sports-1',
        title: 'క్రికెట్: భారత్ అద్భుత విజయం',
        description: 'తొలి టెస్టులో ప్రత్యర్థి జట్టును మట్టికరిపించిన భారత జట్టు. రోహిత్ శర్మ వీరోచిత సెంచరీ.',
        image: require('../assets/images/res_vk18.jpg'),
        tags: ['sports', 'trending'],
        isFullCard: true
    },

    {
        id: 'sports-2',
        title: 'నేషనల్ గేమ్స్: తెలుగు రాష్ట్రాల క్రీడాకారుల జోరు',
        description: 'పలు విభాగాల్లో గోల్డ్ మెడల్స్ గెలుచుకుంటూ మన అథ్లెట్లు సత్తా చాటుతున్నారు.',
        image: require('../assets/images/res_match_winning.jpg'),
        tags: ['sports', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-sports-comp',
        title: 'Sports Complete',
        description: 'Caught up with all sports news.',
        image: require('../assets/images/res_25_category_complete_3.png'),
        tags: ['sports', 'trending'],
        isFullCard: true
    },

    // 🏮 WISHES & FESTIVAL CARDS
    {
        id: 'wish-1',
        title: 'సంక్రాంతి శుభాకాంక్షలు: పండుగ సందడి',
        description: 'ముంగిట ముగ్గులు, గొబ్బెమ్మలు మరియు కోడి పందేలతో పల్లెల్లో పండుగ వాతావరణం నెలకొంది.',
        image: require('../assets/images/res_vivekanandha_2.jpg'),
        tags: ['whatsapp', 'trending'],
        isFullCard: true
    },
    {
        id: 'wish-2',
        title: 'హ్యాపీ బర్త్‌డే: విషెస్ కార్డ్స్',
        description: 'మీ స్నేహితులకు మరియు కుటుంబ సభ్యులకు ఈ ప్రత్యేకమైన విషెస్ మెసేజ్‌లను పంపండి.',
        image: require('../assets/images/res_whatsapp.jpg'),
        tags: ['wishes', 'trending'],
        isFullCard: true
    },

    // 📲 WHATSAPP STATUS
    {
        id: 'wa-1',
        title: 'లేటెస్ట్ మొటివేషనల్ స్టేటస్ వీడియోలు',
        description: 'జీవితంలో ఏదైనా సాధించాలనుకునే వారికి స్ఫూర్తినిచ్చే అద్భుతమైన స్టేటస్ కలెక్షన్.',
        image: require('../assets/images/res_monday.jpg'),
        tags: ['whatsapp'],
        isFullCard: true
    },
    {
        id: 'wa-2',
        title: 'వైరల్ వాట్సాప్ స్టేటస్ అప్‌డేట్స్',
        description: 'సోషల్ మీడియాలో ట్రెండింగ్ లో ఉన్న వీడియోలు మరియు చిత్రాలు ఇక్కడ చూడండి.',
        image: require('../assets/images/res_vivekanadha.jpg'),
        tags: ['whatsapp', 'trending'],
        isFullCard: true
    },

    // 🏙️ LOCAL NEWS (Hyderabad & Guntur)
    {
        id: 'loc-vij-1',
        title: 'సంక్రాంతి రద్దీ: విజయవాడ బస్టాండ్ కిటకిట',
        description: 'పండుగకు సొంతూళ్లకు వెళ్లే ప్రయాణికులతో విజయవాడ పండిట్ నెహ్రూ బస్ స్టేషన్ కిక్కిరిసిపోయింది. బస్సులు ప్రయాణికులతో నిండిపోవడంతో అధికారులు ప్రత్యేక సర్వీసులు ఏర్పాటు చేస్తున్నారు.',
        image: require('../assets/images/res_vijayawada.jpg'),
        tags: ['vijayawada', 'local', 'trending']
    },
    {
        id: 'hyd-traffic-1',
        title: 'హైదరాబాద్‌ ట్రాఫిక్ జామ్: పండుగ పయనం',
        description: 'సంక్రాంతి పండుగకు సొంతూళ్లకు వెళ్లే వారితో హైదరాబాద్ రహదారులు కిక్కిరిసిపోయాయి. విజయవాడ హైవేపై భారీగా ట్రాఫిక్ నిలిచిపోయింది.',
        image: require('../assets/images/res_traffic_1_1.jpg'),
        tags: ['hyderabad', 'local', 'trending']
    },
    {
        id: 'andhra-2',
        title: 'ఆంధ్రప్రదేశ్ వార్తలు',
        description: 'ఆంధ్రప్రదేశ్ రాష్ట్రంలో జరుగుతున్న తాజా రాజకీయ, సామాజిక పరిణామాలు మరియు అభివృద్ధి పనుల వివరాలు.',
        image: require('../assets/images/res_rectangle_5_4.png'),
        tags: ['andhra']
    },
    {
        id: 'telangana-1',
        title: 'తెలంగాణ వార్తలు',
        description: 'తెలంగాణ రాష్ట్రంలో అమలు అవుతున్న ప్రజా సంక్షేమ పథకాలు మరియు హైదరాబాద్ నగర అభివృద్ధి విశేషాలు.',
        image: require('../assets/images/res_rectangle_5_5.png'),
        tags: ['telangana']
    },

    {
        id: 'cold-wave-1',
        title: 'ఉత్తర భారతంలో గజగజ వణికిస్తున్న చలి',
        description: 'ఢిల్లీతో సహా ఉత్తర భారత రాష్ట్రాల్లో ఉష్ణోగ్రతలు కనిష్ట స్థాయికి పడిపోయాయి. పొగమంచు కారణంగా జనజీవనం స్తంభించింది. ప్రజలు అప్రమత్తంగా ఉండాలని వాతావరణ శాఖ హెచ్చరిక.',
        image: require('../assets/images/res_11delhi_cold.png'),
        tags: ['national', 'trending']
    },
    {
        id: 'loc-gun-1',
        title: 'గుంటూరు: అభివృద్ధి పనుల వేగవంతం',
        description: 'నగర అభివృద్ధి కోసం మంజూరైన నిధులతో కొత్త రోడ్లు మరియు డ్రైనేజీ పనులు ప్రారంభం.',
        image: require('../assets/images/res_news_hero.png'),
        tags: ['guntur', 'local', 'trending']
    },

    // 👗 LIFESTYLE & HEALTH
    {
        id: 'life-1',
        title: 'ఆరోగ్యకరమైన ఆహారపు అలవాట్లు: చిట్కాలు',
        description: 'ప్రతిరోజూ తాజా కూరగాయలు మరియు పండ్లను మీ డైట్ లో చేర్చుకోవడం వల్ల ఇమ్యూనిటీ పెరుగుతుంది.',
        image: require('../assets/images/res_8k_news_trending_page_23.png'),
        tags: ['lifestyle', 'trending'],
        isFullCard: true
    },
    {
        id: 'life-2',
        title: 'మోడ్రన్ హోమ్ ఇంటీరియర్ డిజైన్స్ 2024',
        description: 'తక్కువ ఖర్చుతో మీ ఇంటిని అందంగా మార్చుకునే సరికొత్త ఇంటీరియర్ ఐడియాలు.',
        image: require('../assets/images/res_71vzkytfris_ac_uf894_1000_ql80.jpg'),
        tags: ['lifestyle', 'trending'],
        isFullCard: true
    },
    {
        id: 'life-3',
        title: 'మోడ్రన్ హోమ్ ఇంటీరియర్ డిజైన్స్ 2024',
        description: 'తక్కువ ఖర్చుతో మీ ఇంటిని అందంగా మార్చుకునే సరికొత్త ఇంటీరియర్ ఐడియాలు.',
        image: require('../assets/images/res_71nplsn8_sl_ac_uf894_1000_ql80.jpg'),
        tags: ['lifestyle', 'trending'],
        isFullCard: true
    },

    // 📰 AFFAIRS (Current Affairs)
    {
        id: 'aff-1',
        title: 'కరెంటు అఫైర్స్: రాష్ట్ర బడ్జెట్ విశ్లేషణ',
        description: 'ప్రభుత్వం ప్రకటించిన రాబోయే ఆర్థిక సంవత్సర బడ్జెట్ పై పూర్తి అవగాహన పొందండి.',
        image: require('../assets/images/res_1757262949538.jpg'),
        tags: ['affairs', 'trending'],
        isFullCard: true
    },
    {
        id: 'aff-2',
        title: 'మెరుగైన పాలన కోసం డిజిటల్ రిఫార్మ్స్',
        description: 'ప్రభుత్వ సేవలను ప్రజలకు మరింత సులభంగా చేరవేసేందుకు టెక్నాలజీ వినియోగం.',
        image: require('../assets/images/res_25_category_complete_5.png'),
        tags: ['affairs', 'main'],
        isFullCard: true
    },

    // 📸 PHOTOS & VIDEOS (Top Bar)
    {
        id: 'photo-1',
        title: 'భారతదేశ అద్భుత ప్రకృతి దృశ్యాలు',
        description: 'హిమాలయాల నుండి కన్యాకుమారి వరకు మన దేశ సౌందర్యం ఫొటోలలో.',
        image: require('../assets/images/res_pexels_jeswinthomas_1007431.png'),
        tags: ['photos', 'trending'],
        isFullCard: true
    },

    {
        id: 'video-custom-hud',
        title: 'Trending Viral Video',
        description: 'Watch the latest viral sensation now.',
        image: require('../assets/images/res_200297_912370117_medium.mp4'),
        tags: ['videos'],
        isVideo: true,
        isFullCard: true
    },
    {
        id: 'video-1',
        title: 'సాంకేతిక విప్లవం: వీడియో రిపోర్ట్',
        description: 'రాబోయే కాలంలో ఏయే గ్యాడ్జెట్స్ మన జీవితాలను శాసించబోతున్నాయో చూడండి.',
        image: require('../assets/images/res_8k_news_top_bar_video_1.png'),
        tags: ['trending'],
        isVideo: true
    },
    {
        id: 'video-new-2',
        title: 'తాజా వీడియో వార్తలు',
        description: 'రండి చూడండి! ఈ రోజు సోషల్ మీడియాలో వైరల్ అవుతున్న ఆసక్తికరమైన వీడియో.',
        image: require('../assets/images/res_picture11.png'),
        tags: ['trending'],
        isVideo: true
    },
    // 🏮 WISHES & FESTIVAL CARDS (FULL CARDS)
    {
        id: 'full-card-1',
        title: 'Full Card 1',
        description: 'Displaying full card image 1',
        image: require('../assets/images/res_20_photos_1.png'),
        tags: ['photos'],
        isFullCard: true
    },
    {
        id: 'full-card-2',
        title: 'Full Card 2',
        description: 'Displaying full card image 2',
        image: require('../assets/images/res_22_photos_3.png'),
        tags: ['photos'],
        isFullCard: true
    },
    {
        id: 'full-card-3',
        title: 'Full Card 3',
        description: 'Displaying full card image 3',
        image: require('../assets/images/res_23_photos_4.png'),
        tags: ['photos'],
        isFullCard: true
    },
    {
        id: 'full-card-4',
        title: 'Full Card 4',
        description: 'Displaying full card image 4',
        image: require('../assets/images/res_23_ad_page.png'),
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-card-5',
        title: 'Full Card 5',
        description: 'Displaying full card image 5',
        image: require('../assets/images/res_24_photos_5.png'),
        tags: ['photos'],
        isFullCard: true
    },
    {
        id: 'full-card-6',
        title: 'Full Card 6',
        description: 'Displaying full card image 6',
        image: require('../assets/images/res_25_category_complete_2.png'),
        tags: ['agriculture', 'trending'],
        isFullCard: true
    },

    {
        id: 'full-card-8',
        title: 'Full Card 8',
        description: 'Displaying full card image 8',
        image: require('../assets/images/res_25_category_complete_4.png'),
        tags: ['affairs', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-card-9',
        title: 'Full Card 9',
        description: 'Displaying full card image 9',
        image: require('../assets/images/res_25_category_complete_5.png'),
        tags: ['lifestyle', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-card-10',
        title: 'Morning Status',
        description: 'Start your day with positivity.',
        image: require('../assets/images/res_25_category_complete_6.png'),
        tags: ['whatsapp', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-card-11',
        title: 'Full Card 11',
        description: 'Displaying full card image 11',
        image: require('../assets/images/res_25_category_complete_7.png'),
        tags: ['cinema', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-card-12',
        title: 'Sports News',
        description: 'Catch up on all sports updates.',
        image: require('../assets/images/res_25_category_complete_8.png'),
        tags: ['sports', 'trending'],
        isFullCard: true
    },

    // 📱 LOCAL & WHATSAPP
    {
        id: 'local-1',
        title: 'ప్రాంతీయ వార్తలు: మీ జిల్లా విశేషాలు',
        description: 'మీ చుట్టూ జరుగుతున్న తాజా సంఘటనలు మరియు అభివృద్ధి పనుల సమాచారం.',
        image: require('../assets/images/res_news_hero.png'),
        tags: ['local', 'guntur']
    },
    {
        id: 'whatsapp-1',
        title: 'వాట్సాప్ స్టేటస్ వీడియోలు',
        description: 'మీకు నచ్చిన వీడియోలను డౌన్లోడ్ చేసుకోండి మరియు స్టేటస్ గా పెట్టుకోండి.',
        image: require('../assets/images/res_whatsapp.jpg'), // Fixed missing image
        tags: ['whatsapp'],
        isVideo: true,
        isFullCard: true,
        video: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    // ✨ NEW ITEMS ADDED
    {
        id: 'wish-new-1',
        title: 'దీపావళి శుభాకాంక్షలు',
        description: 'ఈ దీపావళి మీ ఇంట వెలుగులు నింపాలని, సుఖసంతోషాలతో వర్ధిల్లాలని కోరుకుంటున్నాము.',
        image: require('../assets/images/res_wishes1.png'),
        tags: ['wishes', 'trending'],
        isFullCard: true
    },
    {
        id: 'tech-new-1',
        title: 'కొత్త స్మార్ట్‌ఫోన్ రివ్యూ 2024',
        description: 'మార్కెట్లోకి వచ్చిన లేటెస్ట్ ఫీచర్స్ తో కూడిన స్మార్ట్‌ఫోన్ పనితీరు ఎలా ఉందో చూడండి.',
        image: require('../assets/images/res_8k_news_top_bar_video_2.png'),
        tags: ['trending'],
        isVideo: true
    },
    {
        id: 'photo-new-1',
        title: 'ప్రకృతి అందాలు: అరకు లోయ',
        description: 'విశాఖ మన్యంలో పర్యాటకులను కట్టిపడేస్తున్న ప్రకృతి రమణీయ దృశ్యాలు. తప్పక చూడాల్సిన ప్రదేశం.',
        image: require('../assets/images/res_picture3.png'),
        tags: ['whatsapp', 'trending'],
        isFullCard: true
    },
    {
        id: 'local-new-1',
        title: 'నగరంలో ట్రాఫిక్ నిబంధనలు కఠినతరం',
        description: 'హెల్మెట్ ధరించని వాహనదారులకు భారీ జరిమానాలు విధించనున్న ట్రాఫిక్ పోలీసులు.',
        image: require('../assets/images/res_picture4.png'),
        tags: ['local', 'hyderabad'],
        isFullCard: true
    },
    {
        id: 'cine-new-1',
        title: 'ఓటీటీలో ఈ వారం విడుదలయ్యే చిత్రాలు',
        description: 'ఇంట్లోనే కూర్చుని వినోదాన్ని ఆస్వాదించడానికి సిద్ధంగా ఉండండి. ఈ వారం ముచ్చటగొలిపే చిత్రాల జాబితా.',
        image: require('../assets/images/res_picture5.png'),
        tags: ['cinema', 'trending']
    },
    {
        id: 'full-ad-1',
        title: 'Special Promotion',
        description: 'Exclusive Ad Page',
        image: require('../assets/images/res_23_ad_page.png'),
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-comp-6',
        title: 'Category Complete',
        description: 'You have caught up with all stories.',
        image: require('../assets/images/res_25_category_complete_6.png'),
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-comp-7',
        title: 'Category Complete',
        description: 'Stay tuned for more updates.',
        image: require('../assets/images/res_25_category_complete_7.png'),
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-comp-8',
        title: 'Category Complete',
        description: 'Fresh news coming soon.',
        image: require('../assets/images/res_25_category_complete_8.png'),
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-wish-2',
        title: 'Greetings',
        description: 'Best wishes for you.',
        image: require('../assets/images/res_wishes2.png'),
        tags: ['wishes', 'whatsapp', 'trending'],
        isFullCard: true
    }
];






const MAGAZINE_DATA = [
    { id: 'mag1', title: 'వ్యవసాయం', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_mag_agri.png') },
    { id: 'mag2', title: 'జీవనశైలి', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_mag_life.png') },
    { id: 'mag3', title: 'పరిశ్రమలు', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_mag_ind.png') },
    { id: 'mag4', title: 'ఆటోమొబైల్స్', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_mag_auto.png') },
    { id: 'mag5', title: 'శాస్త్రవేత్తలు', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_mag_sci.png') },
    { id: 'mag6', title: 'రియల్ ఎస్టేట్', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_mag_real.png') },
    { id: 'mag7', title: 'క్రికెట్', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_match_winning.jpg') },
    { id: 'mag8', title: 'హైదరాబాద్', badge: 'పుస్తకం', date: '01 January', image: require('../assets/images/res_vijayawada.jpg') },
];

const ALL_LOCATIONS_DATA = [
    // TELANGANA
    { id: 'hyd', name: 'Hyderabad', telugu: 'హైదరాబాద్', state: 'TS' },
    { id: 'sec', name: 'Secunderabad', telugu: 'సికింద్రాబాద్', state: 'TS' },
    { id: 'kuk', name: 'Kukatpally', telugu: 'కూకట్‌పల్లి', state: 'TS' },
    { id: 'war', name: 'Warangal', telugu: 'వరంగల్', state: 'TS' },
    { id: 'kham', name: 'Khammam', telugu: 'ఖమ్మం', state: 'TS' },
    { id: 'kar', name: 'Karimnagar', telugu: 'కరీంనగర్', state: 'TS' },
    { id: 'niz', name: 'Nizamabad', telugu: 'నిజామాబాద్', state: 'TS' },
    { id: 'mah', name: 'Mahabubnagar', telugu: 'మహబూబ్‌నగర్', state: 'TS' },
    { id: 'nal', name: 'Nalgonda', telugu: 'నల్గొండ', state: 'TS' },
    { id: 'adl', name: 'Adilabad', telugu: 'ఆదిలాబాద్', state: 'TS' },
    { id: 'sur', name: 'Suryapet', telugu: 'సూర్యాపేట', state: 'TS' },
    { id: 'sidd', name: 'Siddipet', telugu: 'సిద్దిపేట', state: 'TS' },
    { id: 'mir', name: 'Miryalaguda', telugu: 'మిర్యాలగూడ', state: 'TS' },
    { id: 'jag', name: 'Jagtial', telugu: 'జగిత్యాల', state: 'TS' },
    { id: 'man', name: 'Mancherial', telugu: 'మంచిర్యాల', state: 'TS' },
    { id: 'koth', name: 'Kothagudem', telugu: 'కోతగూడెం', state: 'TS' },
    { id: 'bhad', name: 'Bhadrachalam', telugu: 'భద్రాచలం', state: 'TS' },
    { id: 'han', name: 'Hanamkonda', telugu: 'హనుమకొండ', state: 'TS' },
    { id: 'med', name: 'Medak', telugu: 'మేడక్', state: 'TS' },
    { id: 'san', name: 'Sangareddy', telugu: 'సంగారెడ్డి', state: 'TS' },
    { id: 'vik', name: 'Vikarabad', telugu: 'వికారాబాద్', state: 'TS' },

    // ANDHRA PRADESH
    { id: 'vij', name: 'Vijayawada', telugu: 'విజయవాడ', state: 'AP' },
    { id: 'viz', name: 'Visakhapatnam', telugu: 'విశాఖపట్నం', state: 'AP' },
    { id: 'gun', name: 'Guntur', telugu: 'గుంటూరు', state: 'AP' },
    { id: 'nel', name: 'Nellore', telugu: 'నెల్లూరు', state: 'AP' },
    { id: 'kur', name: 'Kurnool', telugu: 'కర్నూలు', state: 'AP' },
    { id: 'raj', name: 'Rajahmundry', telugu: 'రాజమండ్రి', state: 'AP' },
    { id: 'tir', name: 'Tirupati', telugu: 'తిరుపతి', state: 'AP' },
    { id: 'kad', name: 'Kadapa', telugu: 'కడప', state: 'AP' },
    { id: 'kak', name: 'Kakinada', telugu: 'కాకినాడ', state: 'AP' },
    { id: 'ana', name: 'Anantapur', telugu: 'అనంతపురం', state: 'AP' },
    { id: 'vizian', name: 'Vizianagaram', telugu: 'విజయనగరం', state: 'AP' },
    { id: 'elk', name: 'Eluru', telugu: 'ఏలూరు', state: 'AP' },
    { id: 'ong', name: 'Ongole', telugu: 'ఒంగోలు', state: 'AP' },
    { id: 'sri', name: 'Srikakulam', telugu: 'శ్రీకాకుళం', state: 'AP' },
    { id: 'mac', name: 'Machilipatnam', telugu: 'మచిలీపట్నం', state: 'AP' },
    { id: 'chi', name: 'Chittoor', telugu: 'చిత్తూరు', state: 'AP' },
    { id: 'bhi', name: 'Bhimavaram', telugu: 'భీమవరం', state: 'AP' },
    { id: 'pro', name: 'Proddatur', telugu: 'ప్రొద్దుటూరు', state: 'AP' },
    { id: 'nan', name: 'Nandyal', telugu: 'నంద్యాల', state: 'AP' },
    { id: 'hind', name: 'Hindupur', telugu: 'హిందూపురం', state: 'AP' },
    { id: 'ten', name: 'Tenali', telugu: 'తెనాలి', state: 'AP' },
    { id: 'ama', name: 'Amaravati', telugu: 'అమరావతి', state: 'AP' },
    { id: 'gud', name: 'Gudivada', telugu: 'గుడివాడ', state: 'AP' },
];

// Helper function to get English name from Telugu location
const getEnglishLocationName = (teluguName: string): string => {
    const location = ALL_LOCATIONS_DATA.find(loc => loc.telugu === teluguName);
    return location ? location.name.toLowerCase() : teluguName.toLowerCase();
};

export default function NewsFeedScreen() {
    const insets = useSafeAreaInsets();

    // 🔌 OFFLINE MODE LOGIC
    const [isConnected, setIsConnected] = useState(true);

    const checkInternetConnection = async () => {
        try {
            const networkState = await Network.getNetworkStateAsync();
            setIsConnected(networkState.isConnected ?? false);
        } catch (e) {
            console.log("Error checking network", e);
            setIsConnected(true);
        }
    };

    useEffect(() => {
        checkInternetConnection();
    }, []);

    // 📐 Precise height calculation - matching physical screen for one-page fit
    const getCategoryDefaultImage = (slug: string) => {
        const s = String(slug || '').toLowerCase();
        if (s.includes('bhakti')) return require('../assets/images/res_bhakthi.jpg');
        if (s.includes('agri')) return require('../assets/images/res_mag_agri.png');
        if (s.includes('sport')) return require('../assets/images/res_match_winning.jpg');
        if (s.includes('cine')) return require('../assets/images/res_the_raja_saab_27x40.jpg');
        if (s.includes('wish')) return require('../assets/images/res_wishes1.png');
        if (s.includes('whatsapp')) return require('../assets/images/res_whatsapp.jpg');
        if (s.includes('life')) return require('../assets/images/res_mag_life.png');
        if (s.includes('affair')) return require('../assets/images/res_26_india_news_1.png');
        if (s.includes('local') || s.includes('hyd') || s.includes('guntur') || s.includes('vijay')) return require('../assets/images/res_21_local_news.png');
        if (s.includes('trending')) return require('../assets/images/res_22_trending_news.png');
        return require('../assets/images/res_20_main_news.png');
    };

    const CARD_HEIGHT = LAYOUT.windowHeight;

    const [newsData, setNewsData] = useState<any[]>(DEFAULT_NEWS_DATA);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(`${API_URL}/news`);
                const data = await response.json();
                if (data && data.length > 0) {
                    const mappedData = data.map((item: any) => {
                        // Find local match once to reuse properly
                        const localMatch = DEFAULT_NEWS_DATA.find(d => d.title === item.title);

                        // Extract primary image from media array
                        const primaryMedia = item.media?.find((m: any) => m.is_primary) || item.media?.[0];
                        let mediaUrl = primaryMedia?.url;

                        // Fix localhost URLs for Emulator/Device
                        if (mediaUrl && mediaUrl.includes('localhost')) {
                            mediaUrl = mediaUrl.replace('localhost', '192.168.29.70');
                        }

                        // Map Layout Properties (DB snake_case -> App camelCase)
                        let isFullCard = item.is_full_card || localMatch?.isFullCard;
                        let isVideo = item.is_video || localMatch?.isVideo;

                        // 🏷️ Category Slugs Extraction
                        const categories = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
                        const categorySlugs = categories.map((c: any) => c.slug);
                        const primarySlug = categorySlugs[0] || '';

                        // 🛠️ FORCE FIX: Ensure specific Main News items are NEVER Full Card
                        if (categorySlugs.includes('main') || categorySlugs.includes('national') ||
                            item.tags?.includes('main') || item.tags?.includes('national') ||
                            item.title?.includes('జర్మన్') || item.title?.includes('IPL') ||
                            item.title?.includes('ఐపీఎల్') || item.title?.includes('ప్రధాని మోదీ')) {
                            isFullCard = false;
                        }

                        // 📸 FORCE FULL SCREEN FOR PHOTOS & REEL VIDEOS (Hide Title/Desc)
                        // REELS: Pure 'videos' tag (no news context)
                        // PHOTOS: Always immersive
                        const hasNewsContext = categorySlugs.includes('main') || categorySlugs.includes('trending') ||
                            item.tags?.includes('main') || item.tags?.includes('trending') ||
                            categorySlugs.includes('national') || item.tags?.includes('national');

                        const isReel = (categorySlugs.includes('videos') || item.tags?.includes('videos')) && !hasNewsContext;

                        if (categorySlugs.includes('photos') || item.tags?.includes('photos') || isReel) {
                            isFullCard = true;
                        }

                        // 🖼️ Image Selection Logic
                        let finalImage = localMatch ? localMatch.image : (mediaUrl || getCategoryDefaultImage(primarySlug || categorySlugs[0] || 'trending'));

                        // ⚾ IPL 2026 Image Fix (Broaden match and ensure correct asset)
                        if (item.title?.toLowerCase().includes('ipl') ||
                            item.title?.includes('ఐపీఎల్ 2026') ||
                            item.title?.includes('ఐపీల్ 2026')) {
                            finalImage = require('../assets/images/gettyimages-2218439512-612x612.jpg');
                        }

                        const finalTags = [...new Set([...(item.tags || []), ...categorySlugs])];

                        return {
                            ...item,
                            id: item._id, // Use MongoDB _id as id
                            likeCount: item.like_count || 0, // Map API like_count to app likeCount

                            // Image: Prioritize Local Asset -> Media URL -> Default
                            image: finalImage,

                            tags: finalTags,

                            isFullCard,
                            isVideo,
                            video: item.video || localMatch?.video,
                            created_at: item.created_at || new Date().toISOString(),
                            type: item.type || 'news',
                            redirect_url: item.redirect_url || null,
                            placement: item.placement || 'trending'
                        };
                    });

                    // Sort: Latest news first (LIFO order) based on created_at
                    mappedData.sort((a, b) => {
                        const dateA = new Date(a.created_at).getTime();
                        const dateB = new Date(b.created_at).getTime();
                        return dateB - dateA;
                    });

                    // Merge: Put API news first, then Default news
                    setNewsData([...mappedData, ...DEFAULT_NEWS_DATA]);
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };
        fetchNews();
    }, []);
    const router = useRouter();
    const params = useLocalSearchParams();
    const flatListRef = React.useRef<any>(null);
    const [isTutorialMode, setIsTutorialMode] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(1);

    const scrollY = useSharedValue(0);
    const menuOpen = useSharedValue(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTutIndex, setActiveTutIndex] = useState(0);
    const [showHint, setShowHint] = useState(true);
    const [tutorialSubStep, setTutorialSubStep] = useState<'tap' | 'swipe-down'>('tap');
    const [seenTutIndices, setSeenTutIndices] = useState<number[]>([]);
    const [showMenuBadge, setShowMenuBadge] = useState(false);
    const [isLocalNewsLocationVisible, setIsLocalNewsLocationVisible] = useState(false);
    const [isMenuLocationVisible, setIsMenuLocationVisible] = useState(false);
    const [isDigitalMagazineVisible, setIsDigitalMagazineVisible] = useState(false);
    const [magazines, setMagazines] = useState([]);
    const [viewingMagazine, setViewingMagazine] = useState(null);
    const [magazinePages, setMagazinePages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [underPages, setUnderPages] = useState({ next: 1, prev: -1 });

    // 📖 MAGAZINE ANIMATION SHARED VALUES
    const magSwipeX = useSharedValue(0);
    const magFlipProgress = useSharedValue(0); // 0 to 1 for next, 0 to -1 for prev
    const isTurningPage = useSharedValue(false);
    const swipeHintOpacity = useSharedValue(1);

    // 📖 SWIPE HINT ANIMATION
    useEffect(() => {
        if (viewingMagazine) {
            swipeHintOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 800 }),
                    withTiming(0.4, { duration: 800 })
                ),
                -1,
                true
            );
        } else {
            swipeHintOpacity.value = 0;
        }
    }, [viewingMagazine]);


    const [localNewsSearchQuery, setLocalNewsSearchQuery] = useState('');
    // 📖 MAGAZINE ANIMATION GESTURES & STYLES
    const magPanGesture = Gesture.Pan()
        .activeOffsetX([-5, 5])
        .failOffsetY([-500, 500])
        .onStart(() => {
            if (isTurningPage.value) return;
            isTurningPage.value = true;
        })

        .onUpdate((event) => {
            magSwipeX.value = event.translationX;
            magFlipProgress.value = interpolate(
                event.translationX,
                [-WINDOW_WIDTH, 0, WINDOW_WIDTH],
                [1, 0, -1],
                Extrapolation.CLAMP
            );
        })
        .onEnd((event) => {
            const threshold = WINDOW_WIDTH / 10;
            const velocityThreshold = 300;

            if ((event.translationX < -threshold || event.velocityX < -velocityThreshold) && currentPageIndex < magazinePages.length - 1) {
                magFlipProgress.value = withTiming(1, { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, () => {
                    'worklet';
                    runOnJS(setCurrentPageIndex)((prev: number) => Math.min(prev + 1, magazinePages.length - 1));
                });
            } else if ((event.translationX > threshold || event.velocityX > velocityThreshold) && currentPageIndex > 0) {
                magFlipProgress.value = withTiming(-1, { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, () => {
                    'worklet';
                    runOnJS(setCurrentPageIndex)((prev: number) => Math.max(prev - 1, 0));
                });
            } else {
                magFlipProgress.value = withTiming(0, {}, () => {
                    'worklet';
                    magSwipeX.value = 0;
                    isTurningPage.value = false;
                });
            }
        });



    const flipAnimationStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(
            magFlipProgress.value,
            [-1, 0, 1],
            [120, 0, -120],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { perspective: 1500 },
                { translateX: -WINDOW_WIDTH / 2 },
                { rotateY: `${rotateY}deg` },
                { translateX: WINDOW_WIDTH / 2 },
            ],
            zIndex: 10,
        };
    });

    const nextPageStyle = useAnimatedStyle(() => {
        const isNext = magFlipProgress.value > 0;
        return {
            opacity: isNext ? interpolate(magFlipProgress.value, [0, 0.1, 1], [0, 1, 1], Extrapolation.CLAMP) : 0,
            transform: [
                { scale: interpolate(Math.abs(magFlipProgress.value), [0, 1], [0.95, 1]) }
            ],
            zIndex: isNext ? 1 : -1,
        };
    });

    const prevPageStyle = useAnimatedStyle(() => {
        const isPrev = magFlipProgress.value < 0;
        return {
            opacity: isPrev ? interpolate(Math.abs(magFlipProgress.value), [0, 0.1, 1], [0, 1, 1], Extrapolation.CLAMP) : 0,
            transform: [
                { scale: interpolate(Math.abs(magFlipProgress.value), [0, 1], [0.95, 1]) }
            ],
            zIndex: isPrev ? 1 : -1,
        };
    });

    const [isSearching, setIsSearching] = useState(false);




    // 💡 SWIPE HINT STATE
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [hasTriggeredSwipeHint, setHasTriggeredSwipeHint] = useState(false);

    // 💬 COMMENT HINT STATE
    const [isCommentHintVisible, setIsCommentHintVisible] = useState(false);
    const [hasSeenCommentHint, setHasSeenCommentHint] = useState(false);
    const [isOptionsHintVisible, setIsOptionsHintVisible] = useState(false);
    const [hasSeenOptionsHint, setHasSeenOptionsHint] = useState(false);
    const [isShareHintVisible, setIsShareHintVisible] = useState(false);
    const [hasSeenShareHint, setHasSeenShareHint] = useState(false);

    const dismissHint = (index: number) => {
        setShowHint(false);
        setSeenTutIndices(prev => {
            if (!prev.includes(index)) {
                return [...prev, index];
            }
            return prev;
        });
    };

    // 🎓 SEQUENCED TUTORIAL STATE
    const [tutorialSequence, setTutorialSequence] = useState(0);

    useEffect(() => {
        if (!isTutorialMode) return;

        // Sequence Timers
        const timer1 = setTimeout(() => setTutorialSequence(1), 3000); // After 3s show Swipe Down
        const timer2 = setTimeout(() => setTutorialSequence(2), 6000); // After 6s show Tap
        const timer3 = setTimeout(() => {
            setIsTutorialMode(false); // End after 9s
            AsyncStorage.setItem('HAS_SEEN_TUTORIAL_V17', 'true').catch(() => { });

            // Show comment hint after tutorial if not seen before
            if (!hasSeenCommentHint) {
                setIsCommentHintVisible(true);
            }
        }, 9000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [isTutorialMode]);

    // 📚 FETCH MAGAZINES WHEN MODAL OPENS
    useEffect(() => {
        if (isDigitalMagazineVisible) {
            fetchMagazines();
        }
    }, [isDigitalMagazineVisible]);

    // Check if menu has been opened before (for red badge)
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const hasOpenedMenu = await AsyncStorage.getItem('HAS_OPENED_MENU');
                if (!hasOpenedMenu) {
                    setShowMenuBadge(true);
                }

                const hasSeenTutorial = await AsyncStorage.getItem('HAS_SEEN_TUTORIAL_V17');
                // 🎓 FORCE TUTORIAL: If ?isTutorial=true is in URL, force show it
                if (params.isTutorial === 'true' || !hasSeenTutorial) {
                    setIsTutorialMode(true);
                }

                const ratedStatus = await AsyncStorage.getItem('HAS_RATED_APP');
                if (ratedStatus === 'true') {
                    setHasRated(true);
                }

                const savedLocation = await AsyncStorage.getItem('USER_LOCATION');
                const manualStored = await AsyncStorage.getItem('IS_MANUAL_LOCATION');
                if (savedLocation) {
                    setUserLocation(savedLocation);
                }
                if (manualStored === 'true') {
                    setIsManualLocation(true);
                }

                // 💬 CHECK IF USER HAS SEEN COMMENT HINT
                const hasSeenComment = await AsyncStorage.getItem('HAS_SEEN_COMMENT_HINT');
                if (hasSeenComment === 'true') {
                    setHasSeenCommentHint(true);
                }
            } catch (error) {
                console.error('Error checking status:', error);
            }
        };
        checkStatus();
    }, []);

    // 📖 SYNC ANIMATION WITH PAGE CHANGE (Eliminate Flicker)
    useEffect(() => {
        // Snap shared values back to idle once React has committed the source swap
        magFlipProgress.value = 0;
        magSwipeX.value = 0;
        isTurningPage.value = false;

        // Update under-layer sources ONLY after the turn is truly finished
        // This prevents the "next next" page from showing during the reset frame
        setUnderPages({
            next: currentPageIndex + 1,
            prev: currentPageIndex - 1
        });
    }, [currentPageIndex]);

    const [isMuted, setIsMuted] = useState(true);
    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

    // 🔐 AUTHENTICATION (Optional - may not be available during initial load)
    let authContext;
    try {
        authContext = useAuth();
    } catch (error) {
        // Auth not available yet, will be undefined
        authContext = { user: null, isGuest: false, logout: async () => { } };
    }
    const { user, isGuest, logout } = authContext;







    // 💬 COMMENT MODAL STATE
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const commentRevealVal = useSharedValue(0);
    const [currentNewsId, setCurrentNewsId] = useState<string | null>(null);
    const [currentNewsTitle, setCurrentNewsTitle] = useState('');
    const [isViewingVideoComments, setIsViewingVideoComments] = useState(false);

    type Reply = {
        id: string;
        text: string;
        user: string;
        userId?: string;
        gifUrl?: string;
        timestamp: number;
        isMe: boolean;
        likedByMe: boolean;
        likeCount: number;
        parentCommentId: string;
        isSensitive?: boolean;
    };

    type Comment = {
        id: string;
        text: string;
        user: string;
        userId?: string;
        gifUrl?: string;
        location?: string;
        timestamp: number;
        isMe: boolean;
        likedByMe: boolean;
        likeCount: number;
        replies: Reply[];
        isSensitive?: boolean;
        isBlocked?: boolean;
        showReplies?: boolean;
    };

    const [allComments, setAllComments] = useState<Record<string, Comment[]>>({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const comments = (currentNewsId && allComments[currentNewsId]) || [];
    const [notificationPreferences, setNotificationPreferences] = useState<Record<string, boolean>>({});
    const [newComment, setNewComment] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ commentId: string, replyId?: string } | null>(null);
    const [replyTarget, setReplyTarget] = useState<{ commentId: string, userName: string } | null>(null);

    // Moderation States
    const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
    const [blockedCommentIds, setBlockedCommentIds] = useState<string[]>([]);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportingItem, setReportingItem] = useState<{ commentId: string, replyId?: string, userId: string } | null>(null);
    const [revealedSensitiveIds, setRevealedSensitiveIds] = useState<string[]>([]);
    const [newsInteractions, setNewsInteractions] = useState<Record<string, {
        liked: boolean;
        disliked: boolean;
        likeCount: number;
        dislikeCount: number;
    }>>({});

    // 🎓 AUTO-TRIGGER NEXT HINT IN SEQUENCE
    useEffect(() => {
        // If they've seen comments but NOT options hint yet -> Show options hint
        if (hasSeenCommentHint && !hasSeenOptionsHint && !isOptionsHintVisible) {
            setIsOptionsHintVisible(true);
        }
        // If they've seen options but NOT share hint yet -> Show share hint
        if (hasSeenOptionsHint && !hasSeenShareHint && !isShareHintVisible) {
            setIsShareHintVisible(true);
        }
    }, [hasSeenCommentHint, hasSeenOptionsHint, hasSeenShareHint]);

    // 💾 LOAD PERSISTED DATA ON MOUNT
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const [savedComments, savedBlockedUsers, savedBlockedComments, savedInteractions, savedOptionsHint, savedCommentHint, savedShareHint, savedNotifications, savedNightMode] = await Promise.all([
                    AsyncStorage.getItem('ALL_COMMENTS_V1'),
                    AsyncStorage.getItem('BLOCKED_USER_IDS_V1'),
                    AsyncStorage.getItem('BLOCKED_COMMENT_IDS_V1'),
                    AsyncStorage.getItem('NEWS_INTERACTIONS_V1'),
                    AsyncStorage.getItem('HAS_SEEN_OPTIONS_HINT'),
                    AsyncStorage.getItem('HAS_SEEN_COMMENT_HINT'),
                    AsyncStorage.getItem('HAS_SEEN_SHARE_HINT'),
                    AsyncStorage.getItem('NOTIFICATIONS_ENABLED'),
                    AsyncStorage.getItem('NIGHT_MODE_ENABLED')
                ]);

                if (savedComments) setAllComments(JSON.parse(savedComments));
                if (savedBlockedUsers) setBlockedUserIds(JSON.parse(savedBlockedUsers));
                if (savedBlockedComments) setBlockedCommentIds(JSON.parse(savedBlockedComments));
                if (savedInteractions) setNewsInteractions(JSON.parse(savedInteractions));
                if (savedOptionsHint) setHasSeenOptionsHint(true);
                if (savedShareHint) setHasSeenShareHint(true);
                if (savedNotifications !== null) setIsNotificationEnabled(JSON.parse(savedNotifications));
                if (savedNightMode !== null) setIsNightModeEnabled(JSON.parse(savedNightMode));

                // 🔖 LOAD SAVED STORIES
                const savedBookmarks = await AsyncStorage.getItem('SAVED_NEWS_IDS_V1');
                if (savedBookmarks) {
                    setSavedIds(JSON.parse(savedBookmarks));
                }
                setIsBookmarksLoaded(true);

                // 💬 INITIALIZE COMMENT HINT VISIBILITY
                if (!savedCommentHint) {
                    setIsCommentHintVisible(true);
                } else {
                    setHasSeenCommentHint(true);
                }
            } catch (err) {
                console.error('Error loading persisted moderation data:', err);
            }
        };
        loadPersistedData();
    }, []);

    // 💾 SAVE COMMENTS ON UPDATE
    useEffect(() => {
        if (Object.keys(allComments).length > 0) {
            AsyncStorage.setItem('ALL_COMMENTS_V1', JSON.stringify(allComments)).catch(err =>
                console.error('Error saving comments:', err)
            );
        }
    }, [allComments]);

    // 💾 SAVE MODERATION ON UPDATE
    useEffect(() => {
        AsyncStorage.setItem('BLOCKED_USER_IDS_V1', JSON.stringify(blockedUserIds)).catch(err =>
            console.error('Error saving blocked users:', err)
        );
    }, [blockedUserIds]);

    useEffect(() => {
        AsyncStorage.setItem('BLOCKED_COMMENT_IDS_V1', JSON.stringify(blockedCommentIds)).catch(err =>
            console.error('Error saving blocked comments:', err)
        );
    }, [blockedCommentIds]);

    // 💾 SAVE INTERACTIONS ON UPDATE
    useEffect(() => {
        if (Object.keys(newsInteractions).length > 0) {
            AsyncStorage.setItem('NEWS_INTERACTIONS_V1', JSON.stringify(newsInteractions)).catch(err =>
                console.error('Error saving interactions:', err)
            );
        }
    }, [newsInteractions]);

    const handleLikeNews = useCallback((newsId: string) => {
        setNewsInteractions(prev => {
            const current = prev[newsId] || { liked: false, disliked: false, likeCount: 0, dislikeCount: 0 };
            const isLiked = !current.liked;
            let newLikeCount = isLiked ? current.likeCount + 1 : Math.max(0, current.likeCount - 1);
            let newDislikeCount = current.dislikeCount;
            let isDisliked = current.disliked;

            if (isLiked && isDisliked) {
                isDisliked = false;
                newDislikeCount = Math.max(0, newDislikeCount - 1);
            }

            return {
                ...prev,
                [newsId]: {
                    ...current,
                    liked: isLiked,
                    disliked: isDisliked,
                    likeCount: newLikeCount,
                    dislikeCount: newDislikeCount
                }
            };
        });
    }, []);

    const handleDislikeNews = useCallback((newsId: string) => {
        setNewsInteractions(prev => {
            const current = prev[newsId] || { liked: false, disliked: false, likeCount: 0, dislikeCount: 0 };
            const isDisliked = !current.disliked;
            let newDislikeCount = isDisliked ? current.dislikeCount + 1 : Math.max(0, current.dislikeCount - 1);
            let newLikeCount = current.likeCount;
            let isLiked = current.liked;

            if (isDisliked && isLiked) {
                isLiked = false;
                newLikeCount = Math.max(0, newLikeCount - 1);
            }

            return {
                ...prev,
                [newsId]: {
                    ...current,
                    liked: isLiked,
                    disliked: isDisliked,
                    likeCount: newLikeCount,
                    dislikeCount: newDislikeCount
                }
            };
        });
    }, []);

    // 📚 MAGAZINE FUNCTIONS
    const fetchMagazines = async () => {
        try {
            const response = await fetch(`${API_URL}/news`);
            const data = await response.json();
            // Filter for digital magazines category
            const magazineItems = data.filter((item: any) => {
                if (!item.category_id) return false;
                const catIds = Array.isArray(item.category_id) ? item.category_id : [item.category_id];
                return catIds.some((cat: any) => cat.toString().includes('69776dd55ecba5f83ece50af'));
            });
            setMagazines(magazineItems);

        } catch (error) {
            console.error('Error fetching magazines:', error);
        }
    };

    const openMagazine = async (magazineId: string) => {
        try {
            // Fetch magazine pages from news_media
            const response = await fetch(`${API_URL}/news/${magazineId}/media`);
            const pages = await response.json();
            if (pages && pages.length > 0) {
                setMagazinePages(pages.sort((a: any, b: any) => a.page_number - b.page_number));
                setViewingMagazine(magazineId);
                setCurrentPageIndex(0);
                setIsDigitalMagazineVisible(false);
            }
        } catch (error) {
            console.error('Error fetching magazine pages:', error);
        }
    };

    const closeMagazineViewer = () => {
        setViewingMagazine(null);
        setMagazinePages([]);
        setCurrentPageIndex(0);
    };

    const nextPage = () => {
        if (currentPageIndex < magazinePages.length - 1 && !isTurningPage.value) {
            isTurningPage.value = true;
            magFlipProgress.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, () => {
                runOnJS(setCurrentPageIndex)((prev: number) => Math.min(prev + 1, magazinePages.length - 1));
            });
        }
    };

    const previousPage = () => {
        if (currentPageIndex > 0 && !isTurningPage.value) {
            isTurningPage.value = true;
            magFlipProgress.value = withTiming(-1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, () => {
                runOnJS(setCurrentPageIndex)((prev: number) => Math.max(prev - 1, 0));
            });
        }
    };


    const commentAnimationStyle = useAnimatedStyle(() => {
        const val = commentRevealVal.value;
        // Morph from small circle to full panel
        const width = interpolate(val, [0, 1], [30, WINDOW_WIDTH], Extrapolation.CLAMP);
        const height = interpolate(val, [0, 1], [30, LAYOUT.windowHeight], Extrapolation.CLAMP);
        const borderRadius = interpolate(val, [0, 0.5, 1], [30, 40, 0], Extrapolation.CLAMP);
        const opacity = interpolate(val, [0, 0.05, 1], [0, 1, 1]);

        return {
            width,
            height,
            borderRadius,
            opacity,
            transform: [
                { translateY: interpolate(val, [0, 1], [10, 0], Extrapolation.CLAMP) }
            ]
        };
    });

    const overlayAnimationStyle = useAnimatedStyle(() => ({
        opacity: interpolate(commentRevealVal.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    }));

    const getTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const containsSensitiveContent = (text: string) => {
        const sensitiveKeywords = [
            // English
            'violence', 'abuse', 'sexual', 'assault', 'pedophilia', 'incest',
            'animal cruelty', 'animal death', 'self-harm', 'suicide',
            'eating disorder', 'fat phobia', 'porn', 'pornography', 'nude',
            'rape', 'kill', 'murder', 'blood', 'gore', 'sex', 'fuck', 'shit',
            'bitch', 'asshole', 'bastard', 'dick', 'pussy',
            // Telugu (Script)
            'లైంగిక', 'దాడి', 'హింస', 'చిత్రహింసలు', 'అశ్లీల', 'బూతు', 'తప్పు',
            // Telugu (Transliterated)
            'lucha', 'na kodaka', 'lanja', 'dengu', 'munda', 'kodaka', 'nee amma',
            'lanja kodaka', 'nee ayya', 'gey', 'gay', 'lesbian',
            // GIF Detection
            '[GIF]', 'gif', '.gif'
        ];
        const lowerText = text.toLowerCase();
        return sensitiveKeywords.some(keyword => lowerText.includes(keyword));
    };

    // 🔖 SAVED STORIES STATE
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [isBookmarksLoaded, setIsBookmarksLoaded] = useState(false);

    // 🛠️ MENU FUNCTIONALITY STATE
    const [activeMenuModal, setActiveMenuModal] = useState<'profile' | 'saved' | 'lang' | 'feedback' | 'report' | 'settings' | 'privacy' | 'terms' | null>(null);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isNightModeEnabled, setIsNightModeEnabled] = useState(false);
    const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
    const [selectedTextSize, setSelectedTextSize] = useState('Small');
    const [userName, setUserName] = useState('Guest User');
    const [currentLanguage, setCurrentLanguage] = useState('English');
    const [tempName, setTempName] = useState('');
    const [feedbackText, setFeedbackText] = useState('');

    // ⚙️ OPTIONS MENU STATE
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const [reportStep, setReportStep] = useState<'menu' | 'form' | 'success'>('menu');
    const [selectedReason, setSelectedReason] = useState('');
    const [reportReasonText, setReportReasonText] = useState('');

    // 📤 SHARE MODAL STATE
    const [isShareModalVisible, setShareModalVisible] = useState(false);
    const [selectedShareId, setSelectedShareId] = useState<string | null>(null);

    // 📱 HUD (TOP/BOTTOM BARS) STATE
    const [isHUDVisible, setIsHUDVisible] = useState(false); // Hidden by default on first load
    const [isTrendingTopHintVisible, setIsTrendingTopHintVisible] = useState(false);
    const [isPhotosTopHintVisible, setIsPhotosTopHintVisible] = useState(false);
    const [isVideosTopHintVisible, setIsVideosTopHintVisible] = useState(false);
    const [hasSeenTrendingHint, setHasSeenTrendingHint] = useState(false);
    const [hasSeenPhotosHint, setHasSeenPhotosHint] = useState(false);
    const [hasSeenVideosHint, setHasSeenVideosHint] = useState(false);
    const [isUnreadHintVisible, setIsUnreadHintVisible] = useState(false);
    const [isLocationHintVisible, setIsLocationHintVisible] = useState(false);
    const [isCategoryHintVisible, setIsCategoryHintVisible] = useState(false);
    const [isReloadHintVisible, setIsReloadHintVisible] = useState(false);
    const [hasSeenUnreadHint, setHasSeenUnreadHint] = useState(false);
    const [hasSeenLocationHint, setHasSeenLocationHint] = useState(false);
    const [hasSeenCategoryHint, setHasSeenCategoryHint] = useState(false);
    const [unreadCount, setUnreadCount] = useState(newsData.length);
    const [showCountPopup, setShowCountPopup] = useState(false);
    const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);

    const CATEGORY_TABS = [
        { id: 'main', title: 'మెయిన్ న్యూస్', bg: require('../assets/images/res_20_main_news.png'), accent: '#0083B0', titleColor: '#d93025' },
        { id: 'local', title: 'లోకల్ న్యూస్', bg: require('../assets/images/res_21_local_news.png'), accent: '#2C3E50', titleColor: '#000' },
        { id: 'wishes', title: 'విషెస్', bg: require('../assets/images/res_wishes1.png'), accent: '#D32F2F', titleColor: '#E91E63' },
        { id: 'trending', title: 'ట్రెండింగ్ న్యూస్', bg: require('../assets/images/res_22_trending_news.png'), accent: '#FF8F00', titleColor: '#fff' },
        { id: 'whatsapp', title: 'వాట్సాప్ స్టేటస్', bg: require('../assets/images/res_whatsapp.png'), accent: '#2E7D32', titleColor: '#2E7D32' },
        { id: 'bhakti', title: 'భక్తి', bg: require('../assets/images/res_bhakthi.jpg'), accent: '#FBC02D', titleColor: '#6A1B9A' },
        { id: 'affairs', title: 'కరెంటు అఫైర్స్', bg: require('../assets/images/res_26_india_news_1.png'), accent: '#1976D2', titleColor: '#1565C0' },
        { id: 'lifestyle', title: 'లైఫ్          స్టైల్', bg: require('../assets/images/res_mag_life.png'), accent: '#C2185B', titleColor: '#C62828' },
        { id: 'agriculture', title: 'వ్యవసాయం', bg: require('../assets/images/res_mag_agri.png'), accent: '#388E3C', titleColor: '#fff' },
        { id: 'cinema', title: 'సినిమా', bg: require('../assets/images/res_the_raja_saab_27x40.jpg'), accent: '#0097A7', titleColor: '#FFf' },
        { id: 'sports', title: 'క్రీడలు', bg: require('../assets/images/res_match_winning.jpg'), accent: '#E64A19', titleColor: '#fff' },
        { id: 'videos', title: 'వీడియోలు', bg: require('../assets/images/res_20_main_news.png'), accent: '#000000', titleColor: '#fff' },
        { id: 'photos', title: 'ఫోటోలు', bg: require('../assets/images/res_20_main_news.png'), accent: '#8E44AD', titleColor: '#fff' },
    ];

    // 📍 LOCATION & CATEGORY LOGIC
    const [userLocation, setUserLocation] = useState<string>('హైదరాబాద్');
    const [isManualLocation, setIsManualLocation] = useState<boolean>(false);
    const [activeCategory, setActiveCategory] = useState<string>('trending');
    const [filteredNews, setFilteredNews] = useState<any[]>([]);
    const [readNewsIds, setReadNewsIds] = useState<string[]>([]);
    const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'location'>('all');
    const [pendingScrollToId, setPendingScrollToId] = useState<string | null>(null);

    // 🚪 EXIT MODAL STATE
    const [isExitModalVisible, setIsExitModalVisible] = useState(false);

    // 🌍 LOCATION SELECTOR STATE
    const [isLocationSelectorVisible, setIsLocationSelectorVisible] = useState(false);

    // 🔐 LOGIN MODAL STATE
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    const handleLoginContinue = () => {
        setIsLoginModalVisible(false);
        setIsHUDVisible(false);
        setTimeout(() => {
            setIsLocationSelectorVisible(true);
        }, 100);
    };

    // ⭐ RATING FLOW STATE
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [showThankYouPage, setShowThankYouPage] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);

    const blinkOpacity = useSharedValue(1);
    const hudAnimValue = useSharedValue(0); // 0 = hidden, 1 = visible

    useEffect(() => {
        // Check if Reload Hint has been seen
        // Check persistent hint status
        AsyncStorage.removeItem('HAS_SEEN_TRENDING_HINT');
        AsyncStorage.removeItem('HAS_SEEN_PHOTOS_HINT');
        AsyncStorage.removeItem('HAS_SEEN_VIDEOS_HINT');
        AsyncStorage.removeItem('HAS_SEEN_RELOAD_HINT');
        AsyncStorage.removeItem('HAS_SEEN_UNREAD_HINT');
        AsyncStorage.removeItem('HAS_SEEN_LOCATION_HINT');
        AsyncStorage.removeItem('HAS_SEEN_CATEGORY_HINT');

        Promise.all([
            AsyncStorage.getItem('HAS_SEEN_TRENDING_HINT'),
            AsyncStorage.getItem('HAS_SEEN_PHOTOS_HINT'),
            AsyncStorage.getItem('HAS_SEEN_VIDEOS_HINT'),
            AsyncStorage.getItem('HAS_SEEN_RELOAD_HINT'),
            AsyncStorage.getItem('HAS_SEEN_UNREAD_HINT'),
            AsyncStorage.getItem('HAS_SEEN_LOCATION_HINT'),
            AsyncStorage.getItem('HAS_SEEN_CATEGORY_HINT')
        ]).then(([trending, photos, videos, reload, unread, location, category]) => {
            if (trending === 'true') {
                setHasSeenTrendingHint(true);
            }
            if (photos === 'true') setHasSeenPhotosHint(true);
            if (videos === 'true') setHasSeenVideosHint(true);
            if (reload === 'true') setIsReloadHintVisible(false);
            if (unread === 'true') setHasSeenUnreadHint(true);
            if (location === 'true') setHasSeenLocationHint(true);
            if (category === 'true') setHasSeenCategoryHint(true);
        });



        // Blinking effect for the dots
        blinkOpacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1, // infinite
            true
        );

        return () => { };
    }, []);

    // Auto-hide HUD after 5 seconds
    useEffect(() => {
        if (isHUDVisible) {
            const timer = setTimeout(() => {
                setIsHUDVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isHUDVisible]);

    // 🔍 1. COMPREHENSIVE MODAL/OVERLAY CHECK
    // This includes all possible full-screen screens that hide the newsfeed HUD.
    const anyModalVisible = isCategoriesVisible ||
        isMenuOpen ||
        isLocationSelectorVisible ||
        isLocalNewsLocationVisible ||
        activeMenuModal !== null ||
        commentModalVisible ||
        isViewingVideoComments ||
        isShareModalVisible ||
        isOptionsVisible ||
        isLoginModalVisible ||
        isExitModalVisible ||
        isDigitalMagazineVisible ||
        isMenuLocationVisible ||
        isMenuLocationVisible;

    // Handle location selection
    const handleLocationSelect = async (location: any) => {
        setUserLocation(location.telugu);
        setIsManualLocation(true);
        setIsLocationSelectorVisible(false);
        setIsLocalNewsLocationVisible(false);
        setIsMenuLocationVisible(false);
        await AsyncStorage.setItem('USER_LOCATION', location.telugu);
        await AsyncStorage.setItem('IS_MANUAL_LOCATION', 'true');
    };
    // 🔄 2. SNAP VS SLIDE LOGIC
    // We use a ref to detect when we've JUST come out of a modal.
    // If a modal is open, or was just true in the previous cycle, we snap the HUD instantly.
    // This satisfies the requirement: HUD animation ONLY in newsfeed, NOT categories/menu screens.
    const prevAnyModalVisibleRef = React.useRef(false);

    useEffect(() => {
        // Clear value of anyModalVisible for clarity (optional but good for future-proofing)
        const inNewsfeedMode = !anyModalVisible;
        const targetValue = (isHUDVisible && inNewsfeedMode) ? 1 : 0;

        if (anyModalVisible || prevAnyModalVisibleRef.current) {
            // SNAP: Instant presence change during modal transitions
            hudAnimValue.value = targetValue;
        } else {
            // SLIDE: Smooth animation for NewsFeed browsing (swipe/tap)
            if (isHUDVisible) {
                hudAnimValue.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
            } else {
                hudAnimValue.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.ease) });
            }
        }

        // Update ref for next cycle
        prevAnyModalVisibleRef.current = anyModalVisible;
    }, [isHUDVisible, anyModalVisible]);

    useEffect(() => {
        const totalNews = newsData.length;
        const readCount = readNewsIds.length;
        setUnreadCount(totalNews - readCount);
    }, [readNewsIds, newsData]);

    // 📍 3. AUTOMATIC LOCATION DETECTION
    useEffect(() => {
        const autoDetectLocation = async () => {
            // Only auto-detect if user hasn't set a manual preference
            if (isManualLocation) return;

            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                if (reverseGeocode.length > 0) {
                    const city = reverseGeocode[0].city || reverseGeocode[0].district || reverseGeocode[0].subregion;
                    if (city) {
                        const matchedLoc = ALL_LOCATIONS_DATA.find(loc =>
                            loc.name.toLowerCase() === city.toLowerCase() ||
                            city.toLowerCase().includes(loc.name.toLowerCase())
                        );

                        if (matchedLoc) {
                            setUserLocation(matchedLoc.telugu);
                            await AsyncStorage.setItem('USER_LOCATION', matchedLoc.telugu);
                        }
                    }
                }
            } catch (error) {
                console.log('Error auto-detecting location:', error);
            }
        };

        autoDetectLocation();
    }, [isManualLocation]);

    // Back Button Handler
    useEffect(() => {
        const backAction = () => {
            // Priority 1: Close Comments (Standard or Video)
            if (commentModalVisible || isViewingVideoComments) {
                closeComments();
                return true;
            }

            // Priority 2: Close other overlays
            if (isCategoriesVisible) {
                setIsCategoriesVisible(false);
                return true;
            }
            if (isMenuOpen) {
                toggleMenu();
                return true;
            }
            if (isLocationSelectorVisible) {
                setIsLocationSelectorVisible(false);
                return true;
            }
            if (isLocalNewsLocationVisible) {
                setIsLocalNewsLocationVisible(false);
                return true;
            }
            if (activeMenuModal) {
                setActiveMenuModal(null);
                return true;
            }
            if (isShareModalVisible) {
                setShareModalVisible(false);
                return true;
            }
            if (isOptionsVisible) {
                handleOptionsClose();
                return true;
            }
            if (isLoginModalVisible) {
                setIsLoginModalVisible(false);
                return true;
            }
            if (isDigitalMagazineVisible) {
                setIsDigitalMagazineVisible(false);
                return true;
            }
            if (viewingMagazine) {
                closeMagazineViewer();
                return true;
            }
            if (isTutorialMode) {
                setIsTutorialMode(false);
                return true;
            }
            if (isHUDVisible) {
                setIsHUDVisible(false);
                return true;
            }
            if (isExitModalVisible) {
                setIsExitModalVisible(false);
                return true;
            }
            if (isMenuLocationVisible) {
                setIsMenuLocationVisible(false);
                return true;
            }

            // Priority 3: Navigate back in stack if possible (e.g. back to Permissions)
            if (router.canGoBack()) {
                router.back();
                return true;
            }

            // Priority 4: Show Exit Modal (Last Resort)
            setIsExitModalVisible(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [
        commentModalVisible, isViewingVideoComments, isCategoriesVisible,
        isMenuOpen, isLocationSelectorVisible, isLocalNewsLocationVisible,
        activeMenuModal, isShareModalVisible, isOptionsVisible,
        isLoginModalVisible, isDigitalMagazineVisible, viewingMagazine,
        isTutorialMode, isHUDVisible, isExitModalVisible, isMenuLocationVisible
    ]);

    // 🛠️ STABILITY FIX: Memoize the base structure (Stories + Random Fillers)
    // This ensures scrolling (which updates readNewsIds) does NOT re-shuffle the list, causing shaking.
    // 🛠️ STABILITY FIX: Memoize the base structure (Stories + Random Fillers)
    // This ensures scrolling (which updates readNewsIds) does NOT re-shuffle the list, causing shaking.
    const stableMixedNews = React.useMemo(() => {
        let baseList = [];

        // 1. STANDARD NEWS FEEDS
        if (activeCategory === 'videos') {
            // 🎬 REELS SECTION: Only immersive, full-screen videos
            baseList = newsData.filter(item =>
                (item.tags?.includes('videos') || item.isVideo) &&
                item.isFullCard === true &&
                item.type !== 'ad' &&
                // Specifically exclude items with news context from the reels section
                !(item.tags?.includes('trending') || item.tags?.includes('main') || item.tags?.includes('national'))
            );
        } else if (activeCategory === 'local') {
            // Convert Telugu location name to English for tag matching
            const englishLocation = getEnglishLocationName(userLocation);
            baseList = newsData.filter(item =>
            (item.tags?.some((tag: string) => String(tag).toLowerCase().includes(englishLocation)) ||
                String(item.location || '').toLowerCase().includes(englishLocation))
            );
        } else {
            // 📰 REGULAR CATEGORIES (Trending, Main, etc.)
            baseList = newsData.filter(item =>
                (item.tags?.includes(activeCategory) ||
                    (activeCategory === 'trending' && item.placement === 'trending' && item.type === 'ad')) &&
                !(item.tags?.includes('videos') && item.isFullCard) // 🚫 Exclude Reels from News Feed
            );

            // Special case: If we are in 'trending', ensure any videos are NOT reels (they should have text)
            // UNLESS there's no other way to show them. But usually, news videos have trending tag.
        }

        // Add end card if list is not empty
        if (baseList.length > 0) {
            baseList.push({ id: 'end-card', type: 'end' });
        }

        return baseList;
    }, [activeCategory, newsData, userLocation]);


    // Optimization: Only listen to readNewsIds when in 'unread' filter mode to prevent list regeneration on scroll
    const effectiveReadIds = filterMode === 'unread' ? readNewsIds : null;

    // Final Filter & Rating Injection Effect
    useEffect(() => {
        let final = [...stableMixedNews];

        // 1. Filter (Unread/Location Modes)
        if (filterMode === 'unread') {
            // Show only unread news items
            final = final.filter(item =>
                !readNewsIds.includes(item.id) &&
                item.type !== 'rating'
            );
        } else if (filterMode === 'location') {
            // Show only location-specific regular news items
            final = final.filter(item =>
                item.tags?.includes(userLocation) &&
                !item.isVideo &&
                !item.video &&
                !item.isFullCard &&
                !item.tags?.includes('videos') &&
                !item.id.toLowerCase().includes('video') &&
                !item.id.startsWith('full-')
            );
        }

        // 2. Inject Rating Card
        if (!hasRated || showThankYouPage) {
            if (final.length >= 7) {
                final.splice(6, 0, { id: 'rating-card', type: 'rating' });
            } else if (final.length > 3) {
                final.push({ id: 'rating-card', type: 'rating' });
            }
        }

        setFilteredNews(final);
    }, [stableMixedNews, filterMode, effectiveReadIds, hasRated, showThankYouPage]);

    // 📜 AUTO-SCROLL TO PENDING ITEM
    useEffect(() => {
        if (pendingScrollToId && filteredNews.length > 0) {
            const index = filteredNews.findIndex(item => item.id === pendingScrollToId);
            if (index !== -1) {
                // Determine if we need to switch categories if not found? 
                // No, we assume handleOpenSavedStory successfully switched context or it's here.
                // Wait a brief moment for layout
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true });
                    setPendingScrollToId(null);
                }, 300);
            }
        }
    }, [filteredNews, pendingScrollToId]);

    // Check for Swipe Hint on 'main-2'
    useEffect(() => {
        if (!hasTriggeredSwipeHint && filteredNews.length > activeTutIndex) {
            const currentItem = filteredNews[activeTutIndex];
            if (currentItem && currentItem.id === 'main-2') {
                setShowSwipeHint(true);
                setHasTriggeredSwipeHint(true);
                setTimeout(() => {
                    setShowSwipeHint(false);
                }, 4000);
            }
        }
    }, [activeTutIndex, filteredNews, hasTriggeredSwipeHint]);



    // SWIPE HINT TRIGGER LOGIC
    useEffect(() => {
        if (!hasTriggeredSwipeHint && filteredNews.length > activeTutIndex) {
            const currentItem = filteredNews[activeTutIndex];
            if (currentItem && currentItem.id === 'main-2') {
                setShowSwipeHint(true);
                setHasTriggeredSwipeHint(true);
                setTimeout(() => {
                    setShowSwipeHint(false);
                }, 4000);
            }
        }
    }, [activeTutIndex, filteredNews, hasTriggeredSwipeHint]);


    const handleExitConfirm = () => {
        setIsExitModalVisible(false);
        BackHandler.exitApp();
    };

    const handleExitCancel = () => {
        setIsExitModalVisible(false);
    };

    const handleLocationClick = () => {
        if (isLocationHintVisible) {
            setIsLocationHintVisible(false);
            setHasSeenLocationHint(true);
            AsyncStorage.setItem('HAS_SEEN_LOCATION_HINT', 'true').catch(() => { });
            if (!hasSeenCategoryHint) {
                setIsCategoryHintVisible(true);
            }
        }
        // Switch to local news for current location
        setActiveCategory('local');
        setFilterMode('all');
        setIsTutorialMode(false);
        setIsHUDVisible(true); // Ensure HUD is visible when switching
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    };

    const handleUnreadClick = () => {
        if (isUnreadHintVisible) {
            setIsUnreadHintVisible(false);
            setHasSeenUnreadHint(true);
            AsyncStorage.setItem('HAS_SEEN_UNREAD_HINT', 'true').catch(() => { });
            if (!hasSeenLocationHint) {
                setIsLocationHintVisible(true);
            }
        }
        // Toggle unread filter
        if (filterMode === 'unread') {
            setFilterMode('all');
        } else {
            setFilterMode('unread');
            // Important: Scroll to top when showing unread news so user starts from the most recent
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
        }
    };

    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.value,
    }));

    // Animated styles for HUD slide in/out
    const topHudAnimStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: interpolate(hudAnimValue.value, [0, 1], [-130 - insets.top, 0]) }
            ],
            opacity: hudAnimValue.value,
        };
    });

    const bottomHudAnimStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: interpolate(hudAnimValue.value, [0, 1], [130 + insets.bottom, 0]) }
            ],
            opacity: hudAnimValue.value,
        };
    });


    const handleOptionsOpen = (id: string) => {
        // 💬 DISMISS OPTIONS HINT ON FIRST OPEN
        if (isOptionsHintVisible && !hasSeenOptionsHint) {
            setIsOptionsHintVisible(false);
            setHasSeenOptionsHint(true);
            AsyncStorage.setItem('HAS_SEEN_OPTIONS_HINT', 'true').catch(() => { });
        }
        setCurrentNewsId(id); // Store ID for report/download actions
        setReportStep('menu');
        setIsOptionsVisible(true);
    };

    const handleDownloadImage = async () => {
        if (!currentNewsId) return;
        // Use filteredNews which contains the data including images
        const item = filteredNews.find(i => i.id === currentNewsId);
        if (!item) return;

        try {
            let imgUri = '';
            if (typeof item.image === 'number') {
                // Local asset (require)
                const asset = RNImage.resolveAssetSource(item.image);
                imgUri = asset.uri;
            } else if (typeof item.image === 'string') {
                imgUri = item.image;
            } else if (item.image && item.image.uri) {
                imgUri = item.image.uri;
            }

            if (!imgUri) {
                alert('Could not identify image source.');
                return;
            }

            // 🌐 WEB IMPLEMENTATION
            if (Platform.OS === 'web') {
                // Standard web download
                const link = document.createElement('a');
                link.href = imgUri;
                link.download = `8knews_${item.id}.jpg`;
                link.target = '_blank'; // Fail-safe for some browsers
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                handleOptionsClose();
                return;
            }

            // 📱 NATIVE IMPLEMENTATION (Android/iOS)
            // 1. Request Media Library Permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Gallery permission is required to save images.');
                return;
            }

            // 2. Prepare Cache Path
            const ext = imgUri.split('.').pop()?.split('?')[0] || 'jpg';
            const fileName = `8knews_${item.id}_${Date.now()}.${ext}`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            // 3. Download/Copy to Cache
            let localUri = '';
            if (imgUri.startsWith('http')) {
                const downloadResult = await FileSystem.downloadAsync(imgUri, fileUri);
                localUri = downloadResult.uri;
            } else {
                await FileSystem.copyAsync({ from: imgUri, to: fileUri });
                localUri = fileUri;
            }

            // 4. Save to Media Library
            await MediaLibrary.createAssetAsync(localUri);

            if (Platform.OS === 'android') {
                ToastAndroid.show('Image saved to gallery!', ToastAndroid.SHORT);
            } else {
                alert('Image saved to gallery!');
            }

            handleOptionsClose();
        } catch (err) {
            console.error('Download error:', err);
            alert('Download failed. Please try again.');
        }
    };

    const handleOptionsClose = () => {
        setIsOptionsVisible(false);
        setReportStep('menu');
        setSelectedReason('');
        setReportReasonText('');

        // 🚩 STEP 3: SHOW SHARE HINT AFTER DISMISSING OPTIONS
        if (hasSeenOptionsHint && !hasSeenShareHint) {
            setIsShareHintVisible(true);
        }
    };

    // 🔖 TOGGLE SAVE FUNCTION
    const handleToggleSave = (newsId: string) => {
        setSavedIds(prev => {
            const isSaved = prev.includes(newsId);
            let newSavedIds;
            if (isSaved) {
                newSavedIds = prev.filter(id => id !== newsId);
                // ToastAndroid.show('Removed from Saved Stories', ToastAndroid.SHORT);
            } else {
                newSavedIds = [...prev, newsId];
                // ToastAndroid.show('Added to Saved Stories', ToastAndroid.SHORT);
            }
            return newSavedIds;
        });

        // If triggered from options menu
        if (isOptionsVisible) {
            handleOptionsClose();
            const isNowSaved = !savedIds.includes(newsId);
            if (Platform.OS === 'android') {
                ToastAndroid.show(isNowSaved ? 'Story Saved' : 'Story Removed', ToastAndroid.SHORT);
            } else {
                alert(isNowSaved ? 'Story Saved' : 'Story Removed');
            }
        }
    };

    // 💾 SAVE BOOKMARKS ON UPDATE
    useEffect(() => {
        if (isBookmarksLoaded) {
            AsyncStorage.setItem('SAVED_NEWS_IDS_V1', JSON.stringify(savedIds)).catch(err =>
                console.error('Error saving bookmarks:', err)
            );
        }
    }, [savedIds, isBookmarksLoaded]);



    // 📂 OPEN SAVED STORY
    const handleOpenSavedStory = (newsId: string) => {
        setActiveMenuModal(null);

        // 1. Check if visible in current list
        const index = filteredNews.findIndex(item => item.id === newsId);
        if (index !== -1) {
            setTimeout(() => flatListRef.current?.scrollToIndex({ index, animated: true }), 100);
            return;
        }

        // 2. If not, try to switch to its category
        const article = newsData.find(item => item.id === newsId);
        if (article) {
            setPendingScrollToId(newsId);
            setFilterMode('all');
            setIsTutorialMode(false);

            // Heuristic to switch category
            if (article.tags?.includes('trending')) {
                setActiveCategory('trending');
            } else {
                // Find matching category tab
                const cat = CATEGORY_TABS.find(tab => article.tags?.includes(tab.id));
                if (cat) setActiveCategory(cat.id);
                else setActiveCategory('trending'); // Fallback
            }
        }
    };

    const handleReportSubmit = () => {
        setReportStep('success');
    };

    const handleIncrementShare = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/news/${id}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?._id || null, platform: 'general' })
            });
            const data = await response.json();
            if (data.success) {
                // Update local newsData state
                setNewsData(prev => prev.map(item =>
                    item.id === id ? { ...item, shareCount: data.share_count } : item
                ));
            }
        } catch (error) {
            console.error('Error incrementing share:', error);
        }
    };

    const handleWhatsAppShare = async (id: string) => {
        const item = newsData.find(i => i.id === id);
        if (!item) return;

        const shareUrl = `https://8knews.app/news/${item.id}`;
        const shareText = `${item.title}\n\n${item.description}\n\nRead more at: ${shareUrl}`;

        try {
            const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
            await Linking.openURL(whatsappUrl);
            handleIncrementShare(id);
        } catch (error) {
            console.error('WhatsApp share error:', error);
            // Fallback to general share if WhatsApp URI fails
            await Share.share({
                message: shareText,
                url: shareUrl,
            });
            handleIncrementShare(id);
        }
    };

    const handleOpenShare = (id: string) => {
        // 💬 DISMISS SHARE HINT ON FIRST OPEN
        if (isShareHintVisible && !hasSeenShareHint) {
            setIsShareHintVisible(false);
            setHasSeenShareHint(true);
            AsyncStorage.setItem('HAS_SEEN_SHARE_HINT', 'true').catch(() => { });
        }
        setSelectedShareId(id);
        setShareModalVisible(true);
        // Note: We'll increment only when an actual platform is chosen in handleShareAction
    };

    const handleShareAction = async (platform: string) => {
        if (!selectedShareId) return;
        const item = newsData.find(i => i.id === selectedShareId);
        if (!item) return;

        const shareUrl = `https://8knews.app/news/${item.id}`;
        const shareText = `${item.title}\n\n${item.description}\n\nRead more at: ${shareUrl}`;

        try {
            switch (platform) {
                case 'WhatsApp':
                case 'WhatsApp Status':
                    await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareText)}`);
                    handleIncrementShare(selectedShareId);
                    break;
                case 'X Share':
                    await Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
                    break;
                case 'Facebook':
                case 'Facebook Stories':
                    await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
                    break;
                case 'Instagram':
                case 'Instagram Chat':
                case 'Instagram Stories':
                    // Instagram mostly works through native share for stories/posts on mobile devices
                    try {
                        await Share.share({
                            message: shareText,
                            url: shareUrl,
                        });
                    } catch (e) {
                        // If direct share fails, try to open the app as a fallback
                        await Linking.openURL('instagram://app').catch(() => {
                            Linking.openURL('https://www.instagram.com/');
                        });
                    }
                    break;
                case 'Telegram':
                    await Linking.openURL(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(item.title)}`);
                    break;
                case 'Copy Link':
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl);
                        if (Platform.OS === 'android') {
                            ToastAndroid.show('లింక్ కాపీ చేయబడింది', ToastAndroid.SHORT);
                        } else {
                            alert('లింక్ కాపీ చేయబడింది');
                        }
                    } else {
                        await Share.share({ message: shareUrl });
                    }
                    break;
                case 'More':
                    await Share.share({ message: shareText, title: item.title });
                    break;
                default:
                    console.log(`Sharing to ${platform} not implemented`);
                    break;
            }
        } catch (error) {
            console.error('Sharing error:', error);
            // Fallback for web or if app is not installed
            if (platform !== 'More' && platform !== 'Copy Link') {
                try {
                    await Share.share({ message: shareText });
                } catch (innerError) {
                    console.error('Final share fallback failed:', innerError);
                }
            }
        } finally {
            setShareModalVisible(false);
        }
    };

    const goToHome = () => {
        setActiveCategory('trending');
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        setIsHUDVisible(false);
    };

    // ⭐ RATING HANDLERS
    const handleStarPress = (rating: number) => {
        setSelectedRating(rating);
    };

    const handleRateOnPlayStore = async () => {
        // Show thank you page immediately
        setShowThankYouPage(true);
        setHasRated(true);
        AsyncStorage.setItem('HAS_RATED_APP', 'true').catch(() => { });

        if (Platform.OS === 'android') {
            ToastAndroid.show('Opening Play Store...', ToastAndroid.SHORT);
        }

        // Direct Play Store Link (Only reliable method in Development Mode)
        // Note: The "In-App Review" bottom sheet requires the app to be published/internal-test-track.
        // We use direct linking here to ensure functionality during testing.
        const playStoreUrl = 'market://details?id=com.eightknews.app';
        const webUrl = 'https://play.google.com/store/apps/details?id=com.eightknews.app';

        try {
            const canOpen = await Linking.canOpenURL(playStoreUrl);
            if (canOpen) {
                await Linking.openURL(playStoreUrl);
            } else {
                await Linking.openURL(webUrl);
            }
        } catch (error) {
            console.error('Error opening Play Store:', error);
        }
    };

    const handleSkipRating = () => {
        setIsRatingModalVisible(false);
    };

    const handleSkipThankYou = () => {
        setShowThankYouPage(false);
    };

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });


    const toggleMenu = async () => {
        const nextState = !isMenuOpen;
        setIsMenuOpen(nextState);
        menuOpen.value = nextState ? 1 : 0;

        // Mark menu as opened (hide badge permanently)
        if (showMenuBadge) {
            try {
                await AsyncStorage.setItem('HAS_OPENED_MENU', 'true');
                setShowMenuBadge(false);
            } catch (error) {
                console.error('Error saving menu opened status:', error);
            }
        }
    };

    const handleOpenComments = (id: string) => {
        let newsItem = newsData.find(item => item.id === id);

        // Fallback to magazines if not found in regular news feed
        if (!newsItem && magazines.length > 0) {
            const mag = magazines.find((m: any) => m._id === id);
            if (mag) {
                newsItem = { ...mag, id: mag._id };
            }
        }

        if (newsItem) {
            // 💬 DISMISS COMMENT HINT ON FIRST COMMENT CLICK
            if (isCommentHintVisible && !hasSeenCommentHint) {
                setIsCommentHintVisible(false);
                setHasSeenCommentHint(true);
                AsyncStorage.setItem('HAS_SEEN_COMMENT_HINT', 'true').catch(() => { });
            }

            setCurrentNewsId(id);
            setCurrentNewsTitle(newsItem.title);
            setIsViewingVideoComments(!!newsItem.isVideo);

            // Initialize comments if none exist for this ID
            if (!allComments[id]) {
                setAllComments(prev => ({ ...prev, [id]: [] }));
            }

            setCommentModalVisible(true);
            commentRevealVal.value = withTiming(1, {
                duration: 600,
                easing: Easing.inOut(Easing.ease)
            });
        }
    };

    const toggleNotifications = (enabled: boolean) => {
        if (currentNewsId) {
            setNotificationPreferences(prev => ({
                ...prev,
                [currentNewsId]: enabled
            }));
        }
    };

    const closeComments = () => {
        commentRevealVal.value = withTiming(0, {
            duration: 500,
            easing: Easing.inOut(Easing.ease)
        }, (finished) => {
            if (finished) {
                runOnJS(setCommentModalVisible)(false);
                runOnJS(setIsViewingVideoComments)(false);
                // 🚩 STEP 2: SHOW OPTIONS HINT AFTER DISMISSING COMMENTS
                // Mark comment hint as seen right here as well to double check
                setHasSeenCommentHint(true);
                if (!hasSeenOptionsHint) {
                    runOnJS(setIsOptionsHintVisible)(true);
                }
            }
        });
    };

    const handleAddComment = (gifUrl?: string) => {
        if ((newComment.trim() || gifUrl) && currentNewsId) {
            const isMe = true;
            const finalUser = (userName !== 'Guest User') ? userName : 'You';

            setAllComments(prev => {
                const currentList = prev[currentNewsId] || [];
                if (replyTarget) {
                    // Add as reply
                    return {
                        ...prev,
                        [currentNewsId]: currentList.map(c => {
                            if (c.id === replyTarget.commentId) {
                                const isSensitive = containsSensitiveContent(newComment);
                                const newReply: Reply = {
                                    id: Date.now().toString(),
                                    text: newComment,
                                    user: finalUser,
                                    userId: finalUser, // ID for demo
                                    gifUrl: gifUrl,
                                    timestamp: Date.now(),
                                    isMe: true,
                                    likedByMe: false,
                                    likeCount: 0,
                                    parentCommentId: c.id,
                                    isSensitive: isSensitive
                                };
                                return { ...c, replies: [...c.replies, newReply], showReplies: true };
                            }
                            return c;
                        })
                    };
                } else {
                    // Add as main comment
                    const isSensitive = containsSensitiveContent(newComment);
                    const comment: Comment = {
                        id: Date.now().toString(),
                        text: newComment,
                        user: finalUser,
                        userId: finalUser, // ID for demo
                        gifUrl: gifUrl,
                        location: 'Ranga Reddy (D)',
                        timestamp: Date.now(),
                        isMe: true,
                        likedByMe: false,
                        likeCount: 0,
                        replies: [],
                        isSensitive: isSensitive
                    };
                    return {
                        ...prev,
                        [currentNewsId]: [comment, ...currentList]
                    };
                }
            });

            if (replyTarget) setReplyTarget(null);
            setNewComment('');
            setShowGifPicker(false);
            setShowEmojiPicker(false);
        }
    };

    const toggleReplies = (commentId: string) => {
        if (!currentNewsId) return;
        setAllComments(prev => {
            const currentList = prev[currentNewsId] || [];
            return {
                ...prev,
                [currentNewsId]: currentList.map(c =>
                    c.id === commentId ? { ...c, showReplies: !c.showReplies } : c
                )
            };
        });
    };

    const handleLikeComment = (commentId: string, replyId?: string) => {
        if (!currentNewsId) return;
        setAllComments(prev => {
            const currentList = prev[currentNewsId] || [];
            return {
                ...prev,
                [currentNewsId]: currentList.map(c => {
                    if (c.id === commentId) {
                        if (replyId) {
                            return {
                                ...c,
                                replies: c.replies.map(r => {
                                    if (r.id === replyId) {
                                        return {
                                            ...r,
                                            likedByMe: !r.likedByMe,
                                            likeCount: r.likedByMe ? Math.max(0, r.likeCount - 1) : r.likeCount + 1
                                        };
                                    }
                                    return r;
                                })
                            };
                        } else {
                            return {
                                ...c,
                                likedByMe: !c.likedByMe,
                                likeCount: c.likedByMe ? Math.max(0, c.likeCount - 1) : c.likeCount + 1
                            };
                        }
                    }
                    return c;
                })
            };
        });
    };

    const handleDeleteAction = (commentId: string, replyId?: string) => {
        setDeleteTarget({ commentId, replyId });
    };

    const confirmDelete = () => {
        if (!deleteTarget || !currentNewsId) return;
        const { commentId, replyId } = deleteTarget;
        setAllComments(prev => {
            const currentList = prev[currentNewsId] || [];
            if (replyId) {
                return {
                    ...prev,
                    [currentNewsId]: currentList.map(c => {
                        if (c.id === commentId) {
                            return { ...c, replies: c.replies.filter(r => r.id !== replyId) };
                        }
                        return c;
                    })
                };
            } else {
                return {
                    ...prev,
                    [currentNewsId]: currentList.filter(c => c.id !== commentId)
                };
            }
        });
        setDeleteTarget(null);
    };

    const handleCopyComment = (text: string) => {
        alert('కామెంట్ కాపీ చేయబడింది');
    };

    const handleReportComment = (commentId: string, replyId?: string) => {
        if (!currentNewsId) return;
        const commentList = allComments[currentNewsId] || [];
        const comment = commentList.find(c => c.id === commentId);
        if (!comment) return;

        let userId = comment.userId || comment.user;
        if (replyId) {
            const reply = comment.replies.find(r => r.id === replyId);
            if (reply) userId = reply.userId || reply.user;
        }

        setReportingItem({ commentId, replyId, userId });
        setReportModalVisible(true);
    };

    const handleBlockUser = () => {
        if (reportingItem) {
            setBlockedUserIds(prev => [...prev, reportingItem.userId]);
            setReportModalVisible(false);
            setReportingItem(null);
            alert('User blocked successfully.');
        }
    };

    const handleBlockComment = () => {
        if (reportingItem) {
            setBlockedCommentIds(prev => [...prev, reportingItem.commentId]);
            setReportModalVisible(false);
            setReportingItem(null);
            alert('Comment blocked successfully.');
        }
    };

    const handleSubmitModerationReport = () => {
        setReportModalVisible(false);
        setReportingItem(null);
        alert('Report submitted. Our team will review it.');
    };

    const revealSensitive = (id: string) => {
        setRevealedSensitiveIds(prev => [...prev, id]);
    };

    const handleMenuAction = (id: string) => {
        toggleMenu(); // Close side menu
        if (id === 'profile') {
            setTempName(userName);
            setActiveMenuModal('profile');
        } else if (id === 'lang') {
            setActiveMenuModal('lang');
        } else if (id === 'saved') {
            setActiveMenuModal('saved');
        } else if (id === 'feedback') {
            setFeedbackText('');
            setActiveMenuModal('feedback');
        } else if (id === 'report') {
            setFeedbackText('');
            setActiveMenuModal('report');
        } else if (id === 'categories') {
            setIsCategoriesVisible(true);
        }
    };

    const handleUpdateName = () => {
        if (tempName.trim()) {
            setUserName(tempName);
            setActiveMenuModal(null);
        }
    };

    const handleSelectLanguage = (lang: string) => {
        setCurrentLanguage(lang);
        setActiveMenuModal(null);
    };

    const handleSubmitFeedback = () => {
        if (feedbackText.trim()) {
            alert('Thank you! Your feedback has been submitted.');
            setActiveMenuModal(null);
        }
    };



    const menuStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: interpolate(menuOpen.value, [0, 1], [-WINDOW_WIDTH, 0]) }
            ],
        };
    });

    const overlayStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(menuOpen.value, [0, 1], [0, 0.5]),
            display: menuOpen.value > 0 ? 'flex' : 'none',
        };
    });

    const MENU_ITEMS: any[] = [
        // Operations removed - new items will be added later
    ];

    // Offline Mode UI
    if (!isConnected) {
        return (
            <SafeAreaView style={styles.offlineContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                <View style={styles.offlineHeader}>
                    <View style={styles.offlinePopupContainer}>
                        <View style={styles.offlinePopup}>
                            <Text style={styles.offlinePopupText}>దీని మీద క్లిక్ చేసినప్పుడు న్యూస్ పొందొచ్చు</Text>
                        </View>
                        <View style={styles.offlinePopupArrow} />
                    </View>

                    <TouchableOpacity onPress={checkInternetConnection} style={styles.offlineReloadBtn}>
                        <Ionicons name="refresh" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={styles.offlineContent}>
                    <Image
                        source={require('../assets/images/no_internet.png')}
                        style={styles.offlineImage}
                        contentFit="contain"
                    />
                    <Text style={styles.offlineText}>
                        మీకు ప్రస్తుతం యాక్టివ్ ఇంటర్నెట్ కనెక్షన్ లేదని కనిపిస్తుంది
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, isNightModeEnabled && { backgroundColor: '#000' }]}>
            <StatusBar
                barStyle={isNightModeEnabled ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
                hidden={false} // Ensure status bar is always visible or handled by system
            />


            <Animated.FlatList
                ref={flatListRef}
                data={filteredNews}
                extraData={[
                    isCommentHintVisible,
                    isOptionsHintVisible,
                    isShareHintVisible,
                    newsInteractions,
                    allComments,
                    showSwipeHint,
                    isAutoPlayEnabled,
                    isNightModeEnabled
                ]}
                keyExtractor={(item) => item.id}
                pagingEnabled={true} // ✅ Strict One-Card Paging
                snapToInterval={CARD_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                onScrollBeginDrag={() => {
                    // if (isTutorialMode) setShowHint(false);
                }}
                onScrollEndDrag={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.y / CARD_HEIGHT);
                    if (idx !== activeTutIndex) {
                        setActiveTutIndex(idx);
                        if (isTutorialMode && idx <= 2) {
                            setShowHint(true);
                        }
                        if (idx > 2) {
                            setIsTutorialMode(false);
                            AsyncStorage.setItem('HAS_SEEN_TUTORIAL_V17', 'true').catch(() => { });
                        }
                    }
                }}
                scrollEventThrottle={16} // ✅ Optimized for 60fps (less JS load)
                removeClippedSubviews={true} // ✅ CRITICAL: Unmount off-screen views for performance
                windowSize={15} // ✅ Increased to keep more items in memory (prevents reloading on scroll up)
                initialNumToRender={4}
                maxToRenderPerBatch={5}
                getItemLayout={(data, index) => ({
                    length: CARD_HEIGHT,
                    offset: CARD_HEIGHT * index,
                    index,
                })}
                ListEmptyComponent={() => (
                    <Pressable
                        style={{
                            flex: 1,
                            height: LAYOUT.windowHeight * 0.8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 40
                        }}
                        onPress={() => setIsHUDVisible(!isHUDVisible)}
                    >
                        <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', lineHeight: 28, marginBottom: 30 }}>
                            {activeCategory === 'local'
                                ? `${userLocation} కు సంబంధించిన వార్తలు ఇంకా అందుబాటులో లేవు. లొకేషన్ మార్చుకోండి లేదా ట్రెండింగ్ వార్తలు చూడండి.`
                                : 'వార్తలు లోడ్ అవుతున్నాయి...'}
                        </Text>

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#FFD700',
                                paddingHorizontal: 25,
                                paddingVertical: 12,
                                borderRadius: 25
                            }}
                            onPress={() => {
                                setActiveCategory('trending');
                                setFilterMode('all');
                                setIsTutorialMode(false);
                                setIsHUDVisible(true);
                                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                            }}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Go Back to Trending</Text>
                        </TouchableOpacity>
                    </Pressable>
                )}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.y / CARD_HEIGHT);
                    if (idx !== activeTutIndex) {
                        setActiveTutIndex(idx);

                        // Force show hint when index changes in tutorial mode
                        if (isTutorialMode && idx <= 2) {
                            setShowHint(true);
                        }

                        if (idx > 2) {
                            setIsTutorialMode(false);
                            AsyncStorage.setItem('HAS_SEEN_TUTORIAL_V17', 'true').catch(() => { });
                        }
                    }

                    // Mark current news as read (Stabilized: runs only when scroll stops)
                    const currentItem = filteredNews[idx];
                    if (currentItem && currentItem.id) {
                        setReadNewsIds((prev: string[]) => {
                            if (!prev.includes(currentItem.id)) {
                                return [...prev, currentItem.id];
                            }
                            return prev;
                        });
                    }
                }}
                renderItem={({ item, index }) => {
                    if (item.type === 'end') {
                        return (
                            <CategoryEndCard
                                key="end-card"
                                onBack={() => {
                                    setActiveCategory('trending');
                                    setFilterMode('all');
                                    setIsTutorialMode(false);
                                    setIsHUDVisible(true);
                                    setTimeout(() => {
                                        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                    }, 100);
                                }}
                            />
                        );
                    }

                    if (item.type === 'rating') {
                        return (
                            <View style={{ width: LAYOUT.windowWidth, height: LAYOUT.windowHeight, backgroundColor: isNightModeEnabled ? '#000' : '#fff', justifyContent: 'center', alignItems: 'center' }}>
                                {showThankYouPage ? (
                                    // Thank You View
                                    <View style={styles.thankYouContainer}>
                                        <Image
                                            source={require('../assets/images/res_praying_hands.png')}
                                            style={styles.prayingHandsIcon}
                                            contentFit="contain"
                                        />
                                        <Text style={styles.thankYouTitle}>8K న్యూస్</Text>
                                        <Text style={styles.thankYouMessage}>
                                            మీ అభిప్రాయం తెలియచేసినందుకు{'\n'}ధన్యవాదములు
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.skipContainerBottom}
                                            onPress={() => {
                                                flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
                                            }}
                                        >
                                            <Ionicons name="arrow-up" size={16} color="#000" />
                                            <Text style={styles.skipText}>Push up to skip</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    // Rating View
                                    <View style={styles.ratingContainer}>
                                        <Image
                                            source={require('../assets/images/res_8k_logo_1.png')}
                                            style={styles.ratingLogo}
                                            contentFit="contain"
                                        />
                                        <Text style={[styles.ratingQuestion, isNightModeEnabled && { color: '#fff' }]}>8K న్యూస్ ఆస్వాదిస్తున్నారా?</Text>
                                        <Text style={[styles.ratingDescription, isNightModeEnabled && { color: '#9BA1A6' }]}>
                                            ప్లే స్టోర్ లో రేటింగ్ ఇవ్వడం ద్వారా మాకు మద్దతు ఇవ్వండి
                                        </Text>

                                        {/* Primary Rating Action */}
                                        <TouchableOpacity
                                            onPress={handleRateOnPlayStore}
                                            style={styles.rateButton}
                                        >
                                            <Text style={styles.rateButtonText}>Rate on Play Store</Text>
                                        </TouchableOpacity>

                                        {/* Not Now / Skip */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
                                            }}
                                            style={styles.notNowButton}
                                        >
                                            <Text style={styles.notNowText}>Not now</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    }

                    // Debug logging for ads
                    if (item.type === 'ad') {
                        console.log('Rendering Ad NewsCard:', {
                            id: item.id,
                            type: item.type,
                            redirect_url: item.redirect_url,
                            title: item.title
                        });
                    }

                    return (
                        <NewsCard
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            title={item.title}
                            description={item.description}
                            index={index}
                            scrollY={scrollY}
                            totalItems={filteredNews.length}
                            onComment={handleOpenComments}
                            isSaved={savedIds.includes(item.id)}
                            onToggleSave={handleToggleSave}
                            onOptions={handleOptionsOpen}
                            onShare={handleOpenShare}
                            isFullCard={item.isFullCard}
                            showSwipeHint={item.id === 'main-2' && showSwipeHint}
                            isVideo={item.isVideo}
                            video={item.video}
                            isMuted={isMuted}
                            onToggleMute={toggleMute}
                            cardHeight={CARD_HEIGHT}
                            showCommentHint={isCommentHintVisible && index === 0}
                            commentCount={allComments[item.id]?.length || 0}
                            liked={newsInteractions[item.id]?.liked || false}
                            disliked={newsInteractions[item.id]?.disliked || false}
                            likeCount={newsInteractions[item.id]?.likeCount ?? item.likeCount}
                            dislikeCount={newsInteractions[item.id]?.dislikeCount || 0}
                            onLike={handleLikeNews}
                            onDislike={handleDislikeNews}
                            showOptionsHint={isOptionsHintVisible && index === 0}
                            showShareHint={isShareHintVisible && index === 0}
                            isSaved={savedIds.includes(item.id)}
                            onToggleSave={() => handleToggleSave(item.id)}
                            type={item.type}
                            redirectUrl={item.redirect_url}
                            onAdRedirect={item.type === 'ad' && item.redirect_url ? () => {
                                Linking.openURL(item.redirect_url).catch(err =>
                                    console.error('Failed to open ad URL:', err)
                                );
                            } : undefined}
                            onTap={() => {
                                const nextHUDState = !isHUDVisible;
                                setIsHUDVisible(nextHUDState);

                                if (nextHUDState) {
                                    if (!hasSeenTrendingHint) {
                                        setIsTrendingTopHintVisible(true);
                                    }
                                }

                                if (isTutorialMode && showHint) {
                                    dismissHint(activeTutIndex);
                                }
                            }}
                            darkMode={isNightModeEnabled}
                            autoPlayEnabled={isAutoPlayEnabled}
                            shareCount={item.shareCount || 0}
                            onDownload={() => {
                                setCurrentNewsId(item.id);
                                handleDownloadImage();
                            }}
                            onWhatsAppShare={() => handleWhatsAppShare(item.id)}
                            onIncrementShare={() => handleIncrementShare(item.id)}
                        />
                    );
                }}
            />





            {/* 🚪 EXIT CONFIRMATION MODAL */}
            {isExitModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.exitModalContainer, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                        <Text style={[styles.exitModalTitle, isNightModeEnabled && { color: '#fff' }]}>మీరు ఖచ్చితంగా బయటకు వెళ్ళాలి అనుకుంటున్నారా?</Text>
                        <View style={styles.exitModalButtons}>
                            <TouchableOpacity
                                style={[styles.exitModalBtn, styles.exitModalBtnYes]}
                                onPress={handleExitConfirm}
                            >
                                <Text style={styles.exitModalBtnText}>అవును</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.exitModalBtn, styles.exitModalBtnNo]}
                                onPress={handleExitCancel}
                            >
                                <Text style={styles.exitModalBtnText}>కాదు</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}



            {/* HUD BARS */}
            <>
                {/* 🔝 TOP HUD BAR */}
                <Animated.View
                    style={[styles.topHud, { paddingTop: insets.top, height: 75 + insets.top }, topHudAnimStyle]}
                    pointerEvents={isHUDVisible ? 'auto' : 'none'}
                >
                    {!anyModalVisible && (
                        <View style={styles.topHudContent}>
                            <TouchableOpacity style={styles.hudMenuBtn} onPress={toggleMenu}>
                                <Ionicons name="menu" size={28} color="#fff" />
                                {showMenuBadge && <View style={styles.menuBadgeDot} />}
                            </TouchableOpacity>



                            <ScrollView horizontal showsHorizontalScrollIndicator={false} removeClippedSubviews={false} style={{ overflow: 'visible' }} contentContainerStyle={styles.topHudCategories}>
                                <TouchableOpacity style={styles.categoryItemWrapper} onPress={() => {
                                    if (isTrendingTopHintVisible) {
                                        setIsTrendingTopHintVisible(false);
                                        setHasSeenTrendingHint(true);
                                        setIsPhotosTopHintVisible(true);
                                        setActiveCategory('photos'); // Move yellow line to Photos
                                        AsyncStorage.setItem('HAS_SEEN_TRENDING_HINT', 'true').catch(() => { });
                                    } else {
                                        setActiveCategory('trending');
                                        setFilterMode('all');
                                        setIsTutorialMode(false);
                                        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                    }
                                }}>
                                    <View style={{ overflow: 'visible', zIndex: 1000, position: 'relative' }}>
                                        <Text style={[styles.categoryText, activeCategory === 'trending' && styles.categoryTextActive]}>ట్రెండింగ్</Text>
                                        {activeCategory === 'trending' && <View style={styles.categoryActiveIndicator} />}
                                        {isTrendingTopHintVisible && <Animated.View style={[styles.unreadDot, blinkStyle, { top: -10, right: -12, zIndex: 10005 }]} />}

                                        {/* 💡 TRENDING TOP HINT */}
                                        {isTrendingTopHintVisible && (
                                            <View style={styles.trendingHintPopup}>
                                                <Text style={styles.unreadHintText}>దీని మీద క్లిక్ చేసినప్పుడు అన్నీ కేటగిరీల న్యూస్ చూడవచ్చును</Text>
                                                <View style={styles.trendingHintArrow} />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.categoryItemWrapper} onPress={() => {
                                    if (isPhotosTopHintVisible) {
                                        setIsPhotosTopHintVisible(false);
                                        setHasSeenPhotosHint(true);
                                        setIsVideosTopHintVisible(true);
                                        setActiveCategory('videos'); // Move yellow line to Videos
                                        AsyncStorage.setItem('HAS_SEEN_PHOTOS_HINT', 'true').catch(() => { });
                                    } else {
                                        setActiveCategory('photos');
                                        setFilterMode('all');
                                        setIsTutorialMode(false);
                                        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                    }
                                }}>
                                    <View style={{ overflow: 'visible', zIndex: 1000, position: 'relative' }}>
                                        <Text style={[styles.categoryText, activeCategory === 'photos' && styles.categoryTextActive]}>ఫొటోలు</Text>
                                        {activeCategory === 'photos' && <View style={styles.categoryActiveIndicator} />}
                                        {isPhotosTopHintVisible && <Animated.View style={[styles.unreadDot, blinkStyle, { top: -10, right: -12, zIndex: 10005 }]} />}

                                        {/* 💡 PHOTOS TOP HINT */}
                                        {isPhotosTopHintVisible && (
                                            <View style={[styles.trendingHintPopup, { left: -75, width: 230 }]}>
                                                <Text style={styles.unreadHintText}>దీని మీద క్లిక్ చేసినప్పుడు అన్ని రకాల చిత్రాలను చూడవచ్చును</Text>
                                                <View style={[styles.trendingHintArrow, { left: 95 }]} />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.categoryItemWrapper} onPress={() => {
                                    if (isVideosTopHintVisible) {
                                        setIsVideosTopHintVisible(false);
                                        setHasSeenVideosHint(true);
                                        AsyncStorage.setItem('HAS_SEEN_VIDEOS_HINT', 'true').catch(() => { });
                                        // Advancing to Bottom HUD hints
                                        setIsUnreadHintVisible(true);
                                        setIsLocationHintVisible(true);
                                    } else {
                                        setActiveCategory('videos');
                                        setFilterMode('all');
                                        setIsTutorialMode(false);
                                        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                    }
                                }}>
                                    <View style={{ overflow: 'visible', zIndex: 1000, position: 'relative' }}>
                                        <Text style={[styles.categoryText, activeCategory === 'videos' && styles.categoryTextActive]}>వీడియోలు</Text>
                                        {activeCategory === 'videos' && <View style={styles.categoryActiveIndicator} />}
                                        {isVideosTopHintVisible && <Animated.View style={[styles.unreadDot, blinkStyle, { top: -10, right: -12, zIndex: 10005 }]} />}

                                        {/* 💡 VIDEOS TOP HINT */}
                                        {isVideosTopHintVisible && (
                                            <View style={[styles.trendingHintPopup, { left: -85, width: 230 }]}>
                                                <Text style={styles.unreadHintText}>దీని మీద క్లిక్ చేసినప్పుడు అన్ని రకాల వీడియోలను చూడవచ్చును</Text>
                                                <View style={[styles.trendingHintArrow, { left: 105 }]} />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    )}
                </Animated.View>

                {/* ⏬ BOTTOM HUD BAR */}
                <Animated.View
                    style={[styles.bottomHud, { paddingBottom: insets.bottom, height: 85 + insets.bottom }, bottomHudAnimStyle]}
                    pointerEvents={isHUDVisible ? 'auto' : 'none'}
                >
                    {!anyModalVisible && (
                        <View style={styles.bottomHudContent}>
                            <TouchableOpacity
                                style={styles.hudActionItem}
                                onPress={handleUnreadClick}
                            >
                                <View>
                                    <Ionicons name="eye-off-outline" size={24} color="#FFD700" />
                                    {isUnreadHintVisible && unreadCount > 0 && (
                                        <Animated.View style={[styles.unreadDot, blinkStyle]} />
                                    )}
                                    {unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.hudActionLabel}>చదవని</Text>

                                {/* Priority Unread Hint */}
                                {isUnreadHintVisible && unreadCount > 0 && (
                                    <View style={styles.unreadHintPopup}>
                                        <Text style={styles.unreadHintText}>మీరు చదవని న్యూస్ లు చూసేందుకు దీనిపై క్లిక్ చేయండి</Text>
                                        <View style={styles.unreadHintArrow} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.hudActionItem}
                                onPress={handleLocationClick}
                            >
                                <View>
                                    <Ionicons name="location-outline" size={24} color="#FFD700" />
                                    {isLocationHintVisible && !isUnreadHintVisible && (
                                        <Animated.View style={[styles.unreadDot, blinkStyle]} />
                                    )}
                                </View>
                                <Text style={styles.hudActionLabel}>{userLocation}</Text>

                                {/* Location Hint (Only if Unread is hidden) */}
                                {isLocationHintVisible && !isUnreadHintVisible && (
                                    <View style={styles.unreadHintPopup}>
                                        <Text style={styles.unreadHintText}>మీ ప్రాంతపు వార్తలను చూడవచ్చును</Text>
                                        <View style={styles.unreadHintArrow} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.hudActionItem}
                                onPress={() => {
                                    if (isCategoryHintVisible) {
                                        setIsCategoryHintVisible(false);
                                        setHasSeenCategoryHint(true);
                                        AsyncStorage.setItem('HAS_SEEN_CATEGORY_HINT', 'true').catch(() => { });
                                        if (isReloadHintVisible === false) setIsReloadHintVisible(true);
                                    }
                                    setIsCategoriesVisible(true);
                                }}
                            >
                                <View>
                                    <Ionicons name="grid-outline" size={24} color="#FFD700" />
                                    {isCategoryHintVisible && !isUnreadHintVisible && !isLocationHintVisible && <Animated.View style={[styles.unreadDot, blinkStyle]} />}
                                </View>
                                <Text style={styles.hudActionLabel}>కేటగిరీ</Text>

                                {/* Category Hint (Only if others are hidden) */}
                                {isCategoryHintVisible && !isUnreadHintVisible && !isLocationHintVisible && (
                                    <View style={[styles.unreadHintPopup, { left: -200, right: undefined, width: 240 }]}>
                                        <Text style={styles.unreadHintText}>కేటగిరీలు మీద క్లిక్ చేస్తే మరిన్ని కేటగిరీలను పొందవచ్చు</Text>
                                        <View style={[styles.unreadHintArrow, { left: 210 }]} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.hudActionItem}
                                onPress={() => {
                                    setIsReloadHintVisible(false);
                                    AsyncStorage.setItem('HAS_SEEN_RELOAD_HINT', 'true');

                                    // Show hint popup on reload click
                                    setShowCountPopup(true);
                                    setTimeout(() => setShowCountPopup(false), 2000);

                                    // Reload Action: Switch to Trending and Scroll to top
                                    setActiveCategory('trending');
                                    setFilterMode('all');
                                    setIsTutorialMode(false);
                                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                                }}
                            >
                                <View>
                                    <Ionicons name="refresh-outline" size={24} color="#FFD700" />
                                    {isReloadHintVisible && !isCategoryHintVisible && (
                                        <Animated.View style={[styles.unreadDot, blinkStyle]} />
                                    )}
                                </View>
                                <Text style={styles.hudActionLabel}>రీలోడ్</Text>

                                {/* Reload Hint (Shows when Category hint is dismissed) */}
                                {isReloadHintVisible && !isCategoryHintVisible && (
                                    <View style={[styles.unreadHintPopup, { left: -210, right: undefined, width: 240 }]}>
                                        <Text style={styles.unreadHintText}>దీని మీద క్లిక్ చేస్తే కొత్త వార్తలను చూడవచ్చును</Text>
                                        <View style={[styles.unreadHintArrow, { left: 220 }]} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Temporary Count Popup for 1s */}
                            {showCountPopup && (
                                <View style={styles.countPopupOverlay}>
                                    <View style={styles.countPopupContainer}>
                                        <Text style={styles.countPopupText}>దీని మీద క్లిక్ చేస్తే కొత్త వార్తలను చూడవచ్చును</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </Animated.View>
            </>

            {/* 📂 CATEGORIES MODAL (Grid Layout) */}
            {
                isCategoriesVisible && (
                    <View style={[styles.modalOverlay, { backgroundColor: isNightModeEnabled ? '#151718' : '#fff', justifyContent: 'flex-start' }]}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={[styles.categoriesHeader, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                                    setIsCategoriesVisible(false);
                                    setIsHUDVisible(true); // Force HUD open to show Reload hint
                                }}>
                                    <Ionicons name="close" size={28} color={isNightModeEnabled ? "#fff" : "#000"} />
                                </TouchableOpacity>
                                <Text style={[styles.categoriesHeaderTitle, isNightModeEnabled && { color: '#fff' }]}>కేటగిరీలు</Text>
                                <View style={{ width: 48 }} />
                            </View>

                            <ScrollView contentContainerStyle={styles.categoryLeafList} showsVerticalScrollIndicator={false}>
                                {CATEGORY_TABS.filter(cat => cat.id !== 'videos' && cat.id !== 'photos').map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.categoryLeafItem, { borderColor: cat.accent || '#fff' }]}
                                        onPress={() => {
                                            // Special handling for Local News - show location selector
                                            if (cat.id === 'local') {
                                                setIsCategoriesVisible(false);
                                                setIsHUDVisible(false);
                                                setIsLocalNewsLocationVisible(true);
                                            } else {
                                                setActiveCategory(cat.id);
                                                setFilterMode('all'); // Reset other filters
                                                setIsTutorialMode(false);
                                                if (!hasSeenCommentHint) {
                                                    setIsCommentHintVisible(true);
                                                }
                                                flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                                setIsCategoriesVisible(false);
                                                setIsHUDVisible(true); // Force HUD open to show Reload hint
                                            }
                                        }}
                                    >
                                        <View style={styles.categoryLeafBg}>
                                            {cat.id === 'main' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_1.png')}
                                                        style={{ width: '100%', height: '100%' }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'local' ? (
                                                <View style={{ flex: 1, backgroundColor: isNightModeEnabled ? '#151718' : '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_2.png')}
                                                        style={{ width: '100%', height: '100%' }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'wishes' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_3.png')}
                                                        style={{ width: '100%', height: '100%' }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'trending' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_4.png')}
                                                        style={{
                                                            width: '140%',
                                                            height: '140%',
                                                            marginLeft: 0, // Shift right to bring the left logo fully into view
                                                            marginTop: -15, // Lift the image up
                                                        }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'whatsapp' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_5.png')}
                                                        style={{ width: '100%', height: '100%' }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'bhakti' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_6.png')}
                                                        style={{ width: '100%', height: '100%' }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'affairs' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_7.png')}
                                                        style={{ width: '100%', height: '100%' }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'lifestyle' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_8.png')}
                                                        style={{
                                                            width: '100%',
                                                            height: '110%',
                                                            // marginTop: -10
                                                        }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'agriculture' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_9.png')}
                                                        style={{
                                                            width: '100%',
                                                            height: '110%',
                                                            // marginTop: -10
                                                        }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'cinema' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_10.png')}
                                                        style={{
                                                            width: '100%',
                                                            height: '110%',
                                                            // marginTop: -10
                                                        }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : cat.id === 'sports' ? (
                                                <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                    <Image
                                                        source={require('../assets/images/res_vector_11.png')}
                                                        style={{
                                                            width: '100%',
                                                            height: '110%',
                                                            // marginTop: -10
                                                        }}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                            ) : (
                                                <>
                                                    <Image
                                                        source={cat.bg}
                                                        style={styles.categoryLeafImage}
                                                        contentFit="cover"
                                                    />
                                                    <View style={styles.categoryLeafOverlay} />
                                                </>
                                            )}
                                        </View>

                                        <View style={styles.categoryLeafContent}>
                                            {cat.isHot && (
                                                <View style={styles.hotBadge}>
                                                    <Text style={styles.hotText}>HOT !</Text>
                                                </View>
                                            )}
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: (cat.id === 'wishes' || cat.id === 'bhakti' || cat.id === 'lifestyle') ? 'center' : ((cat.id === 'cinema' || cat.id === 'sports') ? 'flex-end' : (cat.id === 'main' || cat.id === 'whatsapp' ? 'space-between' : 'flex-start')),
                                                width: '100%',
                                                paddingHorizontal: (cat.id === 'main' || cat.id === 'whatsapp') ? 5 : 0
                                            }}>
                                                {(cat.id === 'whatsapp') && (
                                                    <Image
                                                        source={require('../assets/images/res_rectangle.png')}
                                                        style={{ width: 80, height: 80, marginLeft: -10 }}
                                                        contentFit="contain"
                                                    />
                                                )}

                                                {cat.id === 'lifestyle' ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 }}>
                                                        <Text
                                                            numberOfLines={1}
                                                            adjustsFontSizeToFit
                                                            minimumFontScale={0.5}
                                                            style={[styles.categoryLeafText, styles.categoryLifestyleText, { color: cat.titleColor }]}
                                                        >
                                                            లైఫ్
                                                        </Text>
                                                        <Text
                                                            numberOfLines={1}
                                                            adjustsFontSizeToFit
                                                            minimumFontScale={0.5}
                                                            style={[styles.categoryLeafText, styles.categoryLifestyleText, { color: cat.titleColor }]}
                                                        >
                                                            స్టైల్
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={0.5}
                                                        style={[
                                                            styles.categoryLeafText,
                                                            { color: cat.titleColor, flex: (cat.id === 'main') ? 1 : undefined },
                                                            cat.id === 'main' && styles.categoryMainText,
                                                            cat.id === 'local' && styles.categoryLocalText,
                                                            cat.id === 'wishes' && styles.categoryWishesText,
                                                            cat.id === 'trending' && styles.categoryTrendingText,
                                                            cat.id === 'whatsapp' && styles.categoryWhatsappText,
                                                            cat.id === 'bhakti' && styles.categoryBhaktiText,
                                                            cat.id === 'cinema' && styles.categoryCinemaText,
                                                            cat.id === 'sports' && styles.categorySportsText
                                                        ]}
                                                    >
                                                        {cat.title}
                                                    </Text>
                                                )}
                                                {cat.id === 'main' && (
                                                    <Image
                                                        source={require('../assets/images/res_rectangle.png')}
                                                        style={{ width: 70, height: 70, marginRight: -5 }}
                                                        contentFit="contain"
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )
            }

            {/* 🌍 1. LOCAL NEWS LOCATION SELECTOR (OLD UI - Simple List) */}
            {
                isLocalNewsLocationVisible && (
                    <View style={[styles.fullModalOverlay, { backgroundColor: '#fff' }]}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={styles.locHeaderRef}>
                                <View style={styles.locHeaderCenter}>
                                    <Image
                                        source={require('../assets/images/res_8k_logo_1.png')}
                                        style={styles.locHeaderLogo}
                                        contentFit="contain"
                                    />
                                </View>
                                <Text style={styles.locHeaderLeftText}>Change location</Text>
                                <TouchableOpacity onPress={() => setIsLocalNewsLocationVisible(false)} style={styles.locHeaderRight}>
                                    <Ionicons name="chevron-forward" size={28} color="#1a73e8" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30 }} showsVerticalScrollIndicator={false}>
                                <Text style={styles.locRefInstruction}>మీకు కావాల్సిన నియోజకవర్గం ఎంచుకోండి</Text>

                                {/* Search Box */}
                                <View style={styles.locRefSearchContainer}>
                                    <View style={styles.locRefSearchBox}>
                                        <Ionicons name="location-sharp" size={20} color="#777" />
                                        <TextInput
                                            style={styles.locRefInput}
                                            placeholder="మీ నియోజకవర్గం పేరు శోధించండి..."
                                            placeholderTextColor="#999"
                                            value={localNewsSearchQuery}
                                            onChangeText={setLocalNewsSearchQuery}
                                        />
                                        <Ionicons name="search" size={20} color="#777" />
                                    </View>
                                </View>

                                {/* Location List */}
                                <View style={{ marginTop: 10 }}>
                                    {(() => {
                                        const searchLower = localNewsSearchQuery.toLowerCase().trim();

                                        // Only show results if user is typing
                                        if (searchLower === '') return null;

                                        const filteredLocations = ALL_LOCATIONS_DATA.filter(loc =>
                                            loc.telugu.includes(localNewsSearchQuery) ||
                                            loc.name.toLowerCase().includes(searchLower)
                                        );

                                        if (filteredLocations.length === 0) {
                                            return <Text style={{ color: '#999', padding: 10, textAlign: 'center' }}>No location found</Text>;
                                        }

                                        return filteredLocations.map((loc, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={styles.locListItem}
                                                onPress={() => {
                                                    handleLocationSelect(loc);
                                                    setActiveCategory('local');
                                                    setFilterMode('all');
                                                    setIsTutorialMode(false);
                                                    setLocalNewsSearchQuery('');
                                                    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                                    setIsLocalNewsLocationVisible(false);
                                                    setIsHUDVisible(true);
                                                }}
                                            >
                                                <View style={styles.locListLeft}>
                                                    <View style={styles.locListIconCircle}>
                                                        <Ionicons name="location-sharp" size={18} color="#1a73e8" />
                                                    </View>
                                                    <Text style={styles.locListItemText}>{loc.telugu}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={22} color="#999" />
                                            </TouchableOpacity>
                                        ));
                                    })()}
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )
            }

            {/* 🌍 2. MENU LOCATION SELECTOR (NEW UI - Enhanced) */}
            {
                isMenuLocationVisible && (
                    <View style={[styles.fullModalOverlay, { backgroundColor: isNightModeEnabled ? '#151718' : '#fff' }]}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={[styles.locHeaderRef, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                                <Text style={[styles.locHeaderLeftText, { width: 200 }, isNightModeEnabled && { color: '#fff' }]}>మీ ప్రాంతాన్ని ఎంచుకోండి</Text>
                                <View style={{ flex: 1 }} />
                                <TouchableOpacity onPress={() => setIsMenuLocationVisible(false)} style={styles.locHeaderRight}>
                                    <Ionicons name="close" size={28} color={isNightModeEnabled ? "#fff" : "#000"} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
                                {/* 1. Manual Search Section */}
                                <View style={styles.locSearchCard}>
                                    <Text style={styles.locSearchPrompt}>మీ లొకేషన్ను మీరే స్వయంగా ఎంచుకునేందుకు ఈ ఆప్షన్ ఎంచుకోండి</Text>

                                    {(!isSearching && userLocation) ? (
                                        <TouchableOpacity style={styles.locSearchInputBox} onPress={() => { setIsSearching(true); setLocalNewsSearchQuery(''); }}>
                                            <View style={styles.locInputChip}>
                                                <Text style={styles.locInputText}>{userLocation}</Text>
                                                <TouchableOpacity onPress={(e) => { e.stopPropagation(); setIsSearching(true); setLocalNewsSearchQuery(''); }}>
                                                    <Ionicons name="close" size={14} color="#666" style={{ marginLeft: 5 }} />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ flex: 1 }} />
                                            <Ionicons name="search" size={20} color="#999" />
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.locSearchInputBox}>
                                            <Ionicons name="search" size={20} color="#999" style={{ marginRight: 10 }} />
                                            <TextInput
                                                style={{ flex: 1, color: '#000', fontSize: 16 }}
                                                placeholder="Search City..."
                                                placeholderTextColor="#999"
                                                value={localNewsSearchQuery}
                                                onChangeText={setLocalNewsSearchQuery}
                                                autoFocus
                                            />
                                            {localNewsSearchQuery.length > 0 && (
                                                <TouchableOpacity onPress={() => setLocalNewsSearchQuery('')}>
                                                    <Ionicons name="close-circle" size={20} color="#ccc" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}

                                    {isSearching && (
                                        <View style={{ maxHeight: 200, marginBottom: 10 }}>
                                            {(() => {
                                                if (localNewsSearchQuery.trim().length === 0) return null;

                                                const searchLower = localNewsSearchQuery.toLowerCase();
                                                const filtered = ALL_LOCATIONS_DATA.filter(loc =>
                                                    loc.telugu.includes(localNewsSearchQuery) ||
                                                    loc.name.toLowerCase().startsWith(searchLower) ||
                                                    loc.name.toLowerCase().includes(searchLower)
                                                );

                                                if (filtered.length === 0) {
                                                    return <Text style={{ color: '#999', padding: 10 }}>No location found</Text>;
                                                }

                                                return filtered.map((loc, idx) => (
                                                    <TouchableOpacity key={idx} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {
                                                        handleLocationSelect(loc);
                                                        setActiveCategory('local');
                                                        setFilterMode('all');
                                                        setIsSearching(false);
                                                        setLocalNewsSearchQuery('');

                                                        // Close Modal & Go to Feed
                                                        setIsTutorialMode(false);
                                                        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                                        setIsMenuLocationVisible(false);
                                                        setIsHUDVisible(true);
                                                    }}>
                                                        <Text style={{ fontSize: 16, color: isNightModeEnabled ? '#fff' : '#333' }}>{loc.telugu}</Text>
                                                    </TouchableOpacity>
                                                ));
                                            })()}
                                        </View>
                                    )}

                                    <Text style={styles.locSearchSub}>వార్తల విధానం: నియోజకవర్గాల వారీగా</Text>
                                </View>

                                {/* 2. Allow Location Section */}
                                <Text style={styles.locPermTitle}>మీ చుట్టూ జరిగే వార్తలు పొందేందుకు లొకేషన్ అనుమతివ్వండి</Text>
                                <TouchableOpacity style={styles.locPermBtn} onPress={async () => {
                                    const { status } = await Location.requestForegroundPermissionsAsync();
                                    if (status === 'granted') {
                                        setIsManualLocation(false);
                                        await AsyncStorage.removeItem('IS_MANUAL_LOCATION');
                                        alert('GPS లొకేషన్ ఎనేబుల్ చేయబడింది');
                                    } else {
                                        alert('లొకేషన్ అనుమతి నిరాకరించబడింది');
                                    }
                                }}>
                                    <View style={styles.locPermIconCircle}>
                                        <Ionicons name="locate" size={18} color="#fff" />
                                    </View>
                                    <Text style={styles.locPermBtnText}>లొకేషన్ అనుమతించండి</Text>
                                </TouchableOpacity>

                                {/* 3. Favorites Section */}
                                <View style={styles.locFavHeader}>
                                    <Ionicons name="star" size={18} color="#1a73e8" />
                                    <Text style={styles.locFavTitle}>మీకు ఇష్టమైన నియోజకవర్గాలు</Text>
                                </View>

                                {/* List */}
                                <View>
                                    {['కూకట్‌పల్లి', 'సికింద్రాబాద్', 'శ్రీకాకుళం'].map((locName, idx) => (
                                        <TouchableOpacity key={idx} style={styles.locHistoryItem} onPress={() => {
                                            const matched = ALL_LOCATIONS_DATA.find(l => l.telugu === locName);
                                            if (matched) {
                                                handleLocationSelect(matched);
                                            } else {
                                                setUserLocation(locName);
                                                setIsManualLocation(true);
                                                AsyncStorage.setItem('USER_LOCATION', locName);
                                                AsyncStorage.setItem('IS_MANUAL_LOCATION', 'true');
                                            }
                                            setActiveCategory('local');
                                            setFilterMode('all');
                                            setIsTutorialMode(false);
                                            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                                            setIsMenuLocationVisible(false); // Close Menu UI
                                            setIsHUDVisible(true);
                                        }}>
                                            <View style={styles.locHistoryIcon}>
                                                <Ionicons name="time-outline" size={16} color="#666" />
                                            </View>
                                            <Text style={styles.locHistoryText}>{locName}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )
            }



            {/* 🗑️ DELETE CONFIRMATION OVERLAY */}
            {
                deleteTarget && (
                    <View style={[styles.modalOverlay, { zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                        <View style={[styles.deleteModalCard, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                            <Ionicons name="trash" size={40} color="#e44" style={{ marginBottom: 15 }} />
                            <Text style={[styles.deleteModalTitle, isNightModeEnabled && { color: '#fff' }]}>కామెంట్‌ను తొలగించాలా?</Text>
                            <TouchableOpacity style={styles.deleteModalBtn} onPress={confirmDelete}>
                                <Text style={styles.deleteModalBtnText}>Delete Comment</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setDeleteTarget(null)}>
                                <Text style={styles.cancelModalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }

            {/* ⚙️ OPTIONS & REPORT MODAL */}
            {
                isOptionsVisible && (
                    <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                        <Pressable style={styles.fullSpace} onPress={handleOptionsClose} />

                        {/* 1. INITIAL MENU */}
                        {reportStep === 'menu' && (
                            <Pressable style={[styles.optionsCard, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={(e) => e.stopPropagation()}>
                                <Pressable style={styles.closeButton} onPress={handleOptionsClose}>
                                    <Ionicons name="close" size={20} color="#333" />
                                </Pressable>

                                <Pressable style={styles.optionsItem} onPress={() => setReportStep('form')}>
                                    <Ionicons name="alert-circle-outline" size={24} color="#333" />
                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, isNightModeEnabled && { color: '#fff' }]}>Report Story</Text>
                                        <Text style={[styles.optionSubtitle, isNightModeEnabled && { color: '#ccc' }]}>Help us improve better</Text>
                                    </View>
                                </Pressable>

                                <Pressable style={styles.optionsItem} onPress={handleDownloadImage}>
                                    <Ionicons name="download-outline" size={24} color="#333" />
                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, isNightModeEnabled && { color: '#fff' }]}>Download</Text>
                                        <Text style={[styles.optionSubtitle, isNightModeEnabled && { color: '#ccc' }]}>Save to Local Directory</Text>
                                    </View>
                                </Pressable>

                                <Pressable style={styles.optionsItem} onPress={() => handleToggleSave(currentNewsId!)}>
                                    <Ionicons name={savedIds.includes(currentNewsId!) ? "bookmark" : "bookmark-outline"} size={24} color="#333" />
                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, isNightModeEnabled && { color: '#fff' }]}>{savedIds.includes(currentNewsId!) ? "Unbookmark" : "Bookmark"}</Text>
                                        <Text style={[styles.optionSubtitle, isNightModeEnabled && { color: '#ccc' }]}>{savedIds.includes(currentNewsId!) ? "Remove from saved" : "Save to read offline"}</Text>
                                    </View>
                                </Pressable>
                                <View style={{ height: 4, width: 40, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginTop: 15 }} />
                            </Pressable>
                        )}

                        {/* 2. REPORT FORM */}
                        {reportStep === 'form' && (
                            <Pressable style={[styles.reportCard, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={(e) => e.stopPropagation()}>
                                <Pressable style={styles.closeButtonRound} onPress={handleOptionsClose}>
                                    <Ionicons name="close" size={20} color="#333" />
                                </Pressable>

                                {['Mistakes Observed', 'Wrong Content', 'Hateful Statement', 'Biased Story', 'Copyright Violation'].map((reason) => (
                                    <Pressable key={reason} style={styles.radioItem} onPress={() => setSelectedReason(reason)}>
                                        <Ionicons
                                            name={selectedReason === reason ? "radio-button-on" : "radio-button-off"}
                                            size={24}
                                            color="#000"
                                        />
                                        <Text style={styles.radioLabel}>{reason}</Text>
                                    </Pressable>
                                ))}

                                <Text style={styles.otherReasonLabel}>Other reasons</Text>
                                <TextInput
                                    style={styles.reportInput}
                                    placeholder="Please tell us why you want to report this story"
                                    value={reportReasonText}
                                    onChangeText={setReportReasonText}
                                    multiline
                                />

                                <Pressable style={styles.reportSubmitBtn} onPress={handleReportSubmit}>
                                    <Text style={styles.reportSubmitText}>Report a mistake</Text>
                                </Pressable>
                            </Pressable>
                        )}

                        {/* 3. SUCCESS MESSAGE */}
                        {reportStep === 'success' && (
                            <Pressable style={[styles.successCard, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={(e) => e.stopPropagation()}>
                                <Pressable style={styles.closeButtonRoundAbsolute} onPress={handleOptionsClose}>
                                    <Ionicons name="close" size={20} color="#333" />
                                </Pressable>
                                <Text style={styles.successTitle}>Report issue successfully</Text>
                                <Text style={styles.successSubtitle}>Help us improve better</Text>
                            </Pressable>
                        )}
                    </View>
                )
            }

            {/* 🛠️ MENU ACTION MODALS (Dynamic Content) */}
            {
                activeMenuModal !== null && (
                    <View style={[
                        styles.modalOverlay,
                        { justifyContent: activeMenuModal === 'settings' ? 'flex-start' : 'center' },
                        activeMenuModal === 'settings' && { backgroundColor: isNightModeEnabled ? '#121212' : '#fff', padding: 0 }
                    ]}>
                        <Pressable style={styles.fullSpace} onPress={() => setActiveMenuModal(null)} />
                        <View style={[
                            styles.actionModalContainer,
                            (activeMenuModal === 'settings' || activeMenuModal === 'terms' || activeMenuModal === 'privacy') && styles.settingsFullModal,
                            isNightModeEnabled && { backgroundColor: '#000' }
                        ]}>
                            {activeMenuModal !== 'lang' && activeMenuModal !== 'terms' && activeMenuModal !== 'privacy' && (
                                <View style={[styles.commentHeader, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                                    {activeMenuModal === 'settings' ? (
                                        <>
                                            <Pressable onPress={() => setActiveMenuModal(null)} style={{ padding: 5, marginRight: 10 }}>
                                                <Ionicons name="arrow-back" size={28} color={isNightModeEnabled ? "#fff" : "#000"} />
                                            </Pressable>
                                            <Text style={[styles.commentHeaderTitle, isNightModeEnabled && { color: '#fff' }]}>Settings</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.commentHeaderTitle}>
                                                {(activeMenuModal === 'profile' ? 'Edit Profile' : (activeMenuModal === 'saved' ? 'Saved Stories' : (activeMenuModal === 'feedback' ? 'Send Feedback' : 'Report an Issue')))}
                                            </Text>
                                            <Pressable onPress={() => setActiveMenuModal(null)}>
                                                <Ionicons name="close" size={28} color="#000" />
                                            </Pressable>
                                        </>
                                    )}
                                </View>
                            )}

                            {/* --- Settings Content --- */}
                            {activeMenuModal === 'settings' && (
                                <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                                    <TouchableOpacity style={[styles.settingsItem, isNightModeEnabled && { backgroundColor: '#1e1e1e' }]} onPress={() => setActiveMenuModal('lang')}>
                                        <View style={[styles.settingsIconBox, { backgroundColor: isNightModeEnabled ? '#333' : '#F8F1E6' }]}>
                                            <Ionicons name="language" size={20} color="#B8860B" />
                                        </View>
                                        <Text style={[styles.settingsLabel, isNightModeEnabled && { color: '#fff' }]}>Language</Text>
                                        <View style={styles.settingsSelector}>
                                            <Text style={[styles.settingsSelectorText, isNightModeEnabled && { color: '#ccc' }]}>{currentLanguage}</Text>
                                            <Ionicons name="chevron-down" size={16} color={isNightModeEnabled ? "#ccc" : "#666"} />
                                        </View>
                                    </TouchableOpacity>

                                    <View style={[styles.settingsItem, isNightModeEnabled && { backgroundColor: '#1e1e1e' }]}>
                                        <View style={[styles.settingsIconBox, { backgroundColor: isNightModeEnabled ? '#333' : '#E8F1FB' }]}>
                                            <Ionicons name="notifications" size={20} color="#4A90E2" />
                                        </View>
                                        <Text style={[styles.settingsLabel, isNightModeEnabled && { color: '#fff' }]}>Notification</Text>
                                        <Switch
                                            value={isNotificationEnabled}
                                            onValueChange={setIsNotificationEnabled}
                                            trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>

                                    <View style={[styles.settingsItem, isNightModeEnabled && { backgroundColor: '#1e1e1e' }]}>
                                        <View style={[styles.settingsIconBox, { backgroundColor: isNightModeEnabled ? '#333' : '#F0F0F0' }]}>
                                            <Ionicons name="moon" size={20} color={isNightModeEnabled ? "#fff" : "#666"} />
                                        </View>
                                        <Text style={[styles.settingsLabel, isNightModeEnabled && { color: '#fff' }]}>Night Mode</Text>
                                        <Switch
                                            value={isNightModeEnabled}
                                            onValueChange={setIsNightModeEnabled}
                                            trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                            thumbColor="#fff"
                                        />
                                    </View>

                                    <TouchableOpacity style={[styles.settingsItem, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                        <View style={[styles.settingsIconBox, { backgroundColor: isNightModeEnabled ? '#333' : '#F0F7FF' }]}>
                                            <Ionicons name="play-circle" size={20} color="#FF8F00" />
                                        </View>
                                        <Text style={[styles.settingsLabel, isNightModeEnabled && { color: '#fff' }]}>Auto play</Text>
                                        <Switch
                                            value={isAutoPlayEnabled}
                                            onValueChange={setIsAutoPlayEnabled}
                                            trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                            thumbColor="#fff"
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.settingsItem, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                        <View style={[styles.settingsIconBox, { backgroundColor: isNightModeEnabled ? '#333' : '#F0F0F0' }]}>
                                            <Ionicons name="text" size={20} color="#666" />
                                        </View>
                                        <Text style={[styles.settingsLabel, isNightModeEnabled && { color: '#fff' }]}>Text Size</Text>
                                        <View style={styles.settingsSelector}>
                                            <Text style={[styles.settingsSelectorText, isNightModeEnabled && { color: '#ccc' }]}>Small</Text>
                                            <Ionicons name="chevron-down" size={16} color={isNightModeEnabled ? "#ccc" : "#666"} />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.settingsItem, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={() => setActiveMenuModal('saved')}>
                                        <View style={[styles.settingsIconBox, { backgroundColor: isNightModeEnabled ? '#333' : '#FFF4E6' }]}>
                                            <Ionicons name="bookmark" size={20} color="#FF8C00" />
                                        </View>
                                        <Text style={[styles.settingsLabel, isNightModeEnabled && { color: '#fff' }]}>Saved Bookmarks</Text>
                                        <Ionicons name="chevron-forward" size={18} color={isNightModeEnabled ? "#9BA1A6" : "#999"} style={{ marginLeft: 'auto' }} />
                                    </TouchableOpacity>

                                    <View style={[styles.aboutAppContainer, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                        <View style={styles.aboutAppHeader}>
                                            <Text style={[styles.aboutAppHeaderText, isNightModeEnabled && { color: '#fff' }]}>About App</Text>
                                        </View>
                                        <TouchableOpacity style={[styles.aboutItem, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                                            <Ionicons name="information-circle-outline" size={22} color={isNightModeEnabled ? "#fff" : "#333"} />
                                            <Text style={[styles.aboutItemLabel, isNightModeEnabled && { color: '#fff' }]}>About us</Text>
                                            <Ionicons name="chevron-forward" size={18} color={isNightModeEnabled ? "#9BA1A6" : "#999"} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.aboutItem, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]} onPress={() => setActiveMenuModal('privacy')}>
                                            <Ionicons name="shield-checkmark-outline" size={22} color={isNightModeEnabled ? "#fff" : "#333"} />
                                            <Text style={[styles.aboutItemLabel, isNightModeEnabled && { color: '#fff' }]}>Privacy Policy</Text>
                                            <Ionicons name="chevron-forward" size={18} color={isNightModeEnabled ? "#9BA1A6" : "#999"} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.aboutItem, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]} onPress={() => setActiveMenuModal('terms')}>
                                            <Ionicons name="document-text-outline" size={22} color={isNightModeEnabled ? "#fff" : "#333"} />
                                            <Text style={[styles.aboutItemLabel, isNightModeEnabled && { color: '#fff' }]}>Terms and Conditions</Text>
                                            <Ionicons name="chevron-forward" size={18} color={isNightModeEnabled ? "#9BA1A6" : "#999"} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.aboutItem, { borderBottomWidth: 0 }, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                            <Ionicons name="chatbubble-ellipses-outline" size={22} color={isNightModeEnabled ? "#fff" : "#333"} />
                                            <Text style={[styles.aboutItemLabel, isNightModeEnabled && { color: '#fff' }]}>Feedback</Text>
                                            <Ionicons name="chevron-forward" size={18} color={isNightModeEnabled ? "#9BA1A6" : "#999"} />
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            )}

                            {/* --- Profile Content --- */}
                            {activeMenuModal === 'profile' && (
                                <View style={styles.formContent}>
                                    <View style={[styles.profileCircleLarge, { overflow: 'hidden' }, isNightModeEnabled && { backgroundColor: '#333' }]}>
                                        <Image
                                            source="https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211469.png"
                                            style={styles.profileAvatarImg}
                                            contentFit="cover"
                                        />
                                    </View>
                                    <Text style={[styles.inputLabel, isNightModeEnabled && { color: '#ccc' }]}>DISPLAY NAME</Text>
                                    <TextInput
                                        style={[styles.formInput, isNightModeEnabled && { backgroundColor: '#151718', color: '#fff' }]}
                                        value={tempName}
                                        onChangeText={setTempName}
                                        placeholder="Enter your name"
                                        placeholderTextColor={isNightModeEnabled ? '#666' : '#999'}
                                    />
                                    <Pressable style={styles.submitBtn} onPress={handleUpdateName}>
                                        <Text style={styles.submitBtnText}>Save Changes</Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* --- Language Content --- */}
                            {activeMenuModal === 'lang' && (
                                <View style={{ flex: 1, backgroundColor: isNightModeEnabled ? '#000' : '#fff', paddingTop: 20 }}>
                                    {/* Header */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20 }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: isNightModeEnabled ? '#fff' : '#333', flex: 1, textAlign: 'center', lineHeight: 28, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed' }}>
                                            Choose your preferred language{'\n'}to read the news
                                        </Text>
                                        <TouchableOpacity onPress={() => setActiveMenuModal(null)} style={{ padding: 5, backgroundColor: isNightModeEnabled ? '#333' : '#ccc', borderRadius: 15 }}>
                                            <Ionicons name="close" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                                        {/* Top 3 Full Width */}
                                        {LANGUAGES.slice(0, 3).map((lang) => (
                                            <TouchableOpacity
                                                key={lang.id}
                                                style={[styles.langCard, { borderBottomColor: lang.color }, isNightModeEnabled && { backgroundColor: '#151718', shadowColor: '#000' }]}
                                                onPress={() => handleSelectLanguage(lang.name)}
                                            >
                                                <View style={styles.langIconBox}>
                                                    <Text style={[styles.langLetter, { color: lang.color }]}>{lang.letter}</Text>
                                                    {/* Decorative dots */}
                                                    <View style={[styles.dot, { backgroundColor: lang.color, top: 0, left: 10, opacity: 0.4 }]} />
                                                    <View style={[styles.dot, { backgroundColor: lang.color, bottom: 5, right: 0, opacity: 0.6 }]} />
                                                </View>
                                                <View style={styles.langTextBox}>
                                                    <Text style={[styles.langLocalName, isNightModeEnabled && { color: '#fff' }]}>{lang.localName}</Text>
                                                    <Text style={[styles.langEnglishName, isNightModeEnabled && { color: '#ccc' }]}>{lang.name}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}

                                        {/* Grid for the rest */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                            {LANGUAGES.slice(3).map((lang) => (
                                                <TouchableOpacity
                                                    key={lang.id}
                                                    style={[styles.langCardGrid, { borderBottomColor: lang.color }, isNightModeEnabled && { backgroundColor: '#151718', shadowColor: '#000' }]}
                                                    onPress={() => handleSelectLanguage(lang.name)}
                                                >
                                                    <View style={styles.langIconBoxSmall}>
                                                        <Text style={[styles.langLetterSmall, { color: lang.color }]}>{lang.letter}</Text>
                                                        <View style={[styles.dot, { backgroundColor: lang.color, top: -2, left: 8, opacity: 0.4, width: 4, height: 4 }]} />
                                                    </View>
                                                    <View>
                                                        <Text style={[styles.langLocalNameSmall, isNightModeEnabled && { color: '#fff' }]}>{lang.localName}</Text>
                                                        <Text style={[styles.langEnglishNameSmall, isNightModeEnabled && { color: '#ccc' }]}>{lang.name}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}

                            {/* --- Saved Stories Content --- */}
                            {activeMenuModal === 'saved' && (
                                <ScrollView style={styles.savedScroll}>
                                    {savedIds.length > 0 ? (
                                        newsData.filter(item => savedIds.includes(item.id)).map(item => (
                                            <View key={item.id} style={[styles.savedItem, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                                <Ionicons name="bookmark" size={20} color="#fbbc04" style={{ marginRight: 10 }} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.savedTitle, isNightModeEnabled && { color: '#fff' }]} numberOfLines={1}>{item.title}</Text>
                                                    <Text style={[styles.savedDesc, isNightModeEnabled && { color: '#ccc' }]} numberOfLines={1}>{item.description}</Text>
                                                </View>
                                                <Pressable onPress={() => handleToggleSave(item.id)}>
                                                    <Ionicons name="trash-outline" size={20} color="#e44" />
                                                </Pressable>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Ionicons name="bookmark-outline" size={60} color="#ccc" />
                                            <Text style={styles.emptyText}>No saved stories yet.</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            )}

                            {/* --- Feedback / Report Content --- */}
                            {(activeMenuModal === 'feedback' || activeMenuModal === 'report') && (
                                <View style={styles.formContent}>
                                    <Text style={[styles.inputLabel, isNightModeEnabled && { color: '#ccc' }]}>
                                        {activeMenuModal === 'feedback' ? 'TELL US WHAT YOU THINK' : 'WHAT IS THE ISSUE?'}
                                    </Text>
                                    <TextInput
                                        style={[styles.formInput, { height: 120, textAlignVertical: 'top' }, isNightModeEnabled && { backgroundColor: '#151718', color: '#fff' }]}
                                        value={feedbackText}
                                        onChangeText={setFeedbackText}
                                        placeholder="Type your message here..."
                                        placeholderTextColor={isNightModeEnabled ? '#666' : '#999'}
                                        multiline
                                    />
                                    <Pressable style={styles.submitBtn} onPress={handleSubmitFeedback}>
                                        <Text style={styles.submitBtnText}>Submit</Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* --- Terms and Conditions Content --- */}
                            {activeMenuModal === 'terms' && (
                                <View style={{ flex: 1, backgroundColor: '#EDEEF0' }}>
                                    {/* 1. Header Navigation */}
                                    <View style={styles.termsHeader}>
                                        <TouchableOpacity onPress={() => setActiveMenuModal('settings')} style={styles.termsBackBtn}>
                                            <Ionicons name="arrow-back" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.termsHeaderText}>Terms & conditions</Text>
                                    </View>

                                    {/* 2. Banner Area */}
                                    <View style={styles.termsBanner}>
                                        <Text style={styles.termsBannerTitle}>Terms</Text>
                                    </View>

                                    {/* 3. Content Card */}
                                    <View style={styles.termsContentCard}>
                                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                            <Text style={styles.termsCardTitle}>Terms</Text>
                                            <View style={styles.termsYellowDivider} />

                                            <View style={styles.termsSectionHeader}>
                                                <View style={styles.termsYellowPill} />
                                                <Text style={styles.termsSectionTitle}>Terms and Conditions</Text>
                                            </View>

                                            <Text style={styles.termsLegalText}>
                                                Terms and Conditions – 8K News{"\n\n"}
                                                These Terms and Conditions (“Terms”) govern the access to and use of the website https://www.8knews.com (“Website”) and the mobile application 8K News (“App”), owned and operated by 8K News Private Limited, having its registered office at [Your Registered Address], India (“Company”, “8K News”, “we”, “us”, “our”), and are effective from [Effective Date].{"\n\n"}
                                                ALL USERS AND VISITORS ARE REQUIRED TO READ THESE TERMS CAREFULLY BEFORE USING THE APP OR WEBSITE.{"\n"}
                                                If you do not agree with any part of these Terms, please discontinue use immediately.{"\n\n"}
                                                For any questions or concerns, contact us at support@8knews.com.{"\n\n"}
                                                1. Applicability & Acceptance{"\n"}
                                                By accessing or using the 8K News App or Website, you agree to be legally bound by these Terms, our Privacy Policy, and all applicable laws in India, including the Information Technology Act, 2000 and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.{"\n\n"}
                                                8K News reserves the right to modify these Terms at any time without prior notice. Continued use constitutes acceptance of the revised Terms.{"\n\n"}
                                                2. Definitions{"\n"}
                                                “App”: The 8K News mobile application available on Android/iOS platforms.{"\n"}
                                                “User” / “You”: Any individual accessing or using the App or Website.{"\n"}
                                                “Content”: News articles, videos, images, audio, text, advertisements, and other materials.{"\n"}
                                                “Sponsored Content”: Paid or promotional content clearly marked as “Ad”, “Sponsored”, or similar.{"\n"}
                                                “Third-Party Content”: Content sourced from external agencies, contributors, or partners.{"\n\n"}
                                                3. Nature of Service & Disclaimer{"\n"}
                                                8K News functions as a digital news intermediary. While we strive for accuracy, we do not guarantee the completeness, correctness, or reliability of any content displayed.{"\n"}
                                                All content is provided on an “AS IS” and “AS AVAILABLE” basis.{"\n"}
                                                8K News does not provide investment, legal, medical, financial, or professional advice.{"\n\n"}
                                                4. Disclaimer of Warranties & Limitation of Liability{"\n"}
                                                8K News makes no express or implied warranties regarding accuracy, fitness, or availability.{"\n"}
                                                We are not liable for:{"\n"}
                                                - Data loss{"\n"}
                                                - Service interruptions{"\n"}
                                                - Content inaccuracies{"\n"}
                                                - Third-party actions{"\n"}
                                                - User-generated content{"\n\n"}
                                                In no event shall 8K News or its employees be liable for direct, indirect, incidental, or consequential damages.{"\n\n"}
                                                5. Availability & Regional Use{"\n"}
                                                The App and Website are operated from India. Users accessing from outside India are responsible for compliance with local laws.{"\n"}
                                                Features, content, and services may vary by region.{"\n\n"}
                                                6. Third-Party Links & Services{"\n"}
                                                The App may contain links to third-party websites or services.{"\n"}
                                                8K News does not control or endorse such services and is not responsible for their content, accuracy, or practices.{"\n"}
                                                Use of third-party services is at your own risk.{"\n\n"}
                                                7. Third-Party Content{"\n"}
                                                Some content may be sourced from independent agencies or contributors and will be clearly identified.{"\n"}
                                                8K News:{"\n"}
                                                - Does not exercise editorial control over such content{"\n"}
                                                - Disclaims all liability related to accuracy or legality{"\n"}
                                                - Will act upon complaints through a lawful takedown process{"\n\n"}
                                                Takedown requests may be sent to grievance@8knews.com.{"\n\n"}
                                                8. Copyright & Intellectual Property{"\n"}
                                                All platform design, trademarks, logos, and proprietary elements belong to 8K News unless otherwise stated.{"\n\n"}
                                                Users may:{"\n"}
                                                - View content for personal, non-commercial use{"\n\n"}
                                                Users may NOT:{"\n"}
                                                - Copy, redistribute, modify, or monetize content{"\n"}
                                                - Remove copyright notices{"\n"}
                                                - Reuse content without written permission{"\n\n"}
                                                9. Advertisements{"\n"}
                                                Advertisements may appear in various formats including banners, videos, pop-ups, and sponsored posts.{"\n"}
                                                8K News:{"\n"}
                                                - Does not endorse advertised products or services{"\n"}
                                                - Is not responsible for claims made by advertisers{"\n"}
                                                - Does not verify personal details in matrimonial or classified ads{"\n\n"}
                                                All advertiser interactions are solely between users and advertisers.{"\n\n"}
                                                10. User Conduct{"\n"}
                                                Users shall not:{"\n"}
                                                - Post defamatory, obscene, hateful, or illegal content{"\n"}
                                                - Violate intellectual property rights{"\n"}
                                                - Engage in harassment or abusive behavior{"\n"}
                                                - Spread misinformation with malicious intent{"\n\n"}
                                                8K News reserves the right to:{"\n"}
                                                - Remove content{"\n"}
                                                - Suspend or block users{"\n"}
                                                - Share information with legal authorities when required{"\n\n"}
                                                11. Contributor & Reporter Terms{"\n"}
                                                - Contributors are responsible for the originality and legality of submitted content{"\n"}
                                                - Plagiarism or copyright violations may result in termination{"\n"}
                                                - Content may be reused across languages/platforms without additional payment{"\n"}
                                                - Videos may be distributed across 8K News platforms without revenue sharing{"\n"}
                                                - Contributors indemnify 8K News against all legal claims{"\n\n"}
                                                12. Earnings & Payments{"\n"}
                                                - Earnings are subject to platform rules{"\n"}
                                                - Withdrawals may be made via UPI/NEFT{"\n"}
                                                - Inactive balances for 9 months may be forfeited{"\n"}
                                                - Detailed revenue terms are available in the Earnings section{"\n\n"}
                                                13. Indemnity{"\n"}
                                                Users and contributors agree to indemnify and hold harmless 8K News, its directors, employees, and partners against all claims, damages, losses, or liabilities arising from misuse, violations, or illegal activities.{"\n\n"}
                                                14. Governing Law & Jurisdiction{"\n"}
                                                These Terms are governed by the laws of India.{"\n"}
                                                All disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.{"\n\n"}
                                                15. Contact & Grievance Redressal{"\n"}
                                                📧 support@8knews.com{"\n"}
                                                📧 grievance@8knews.com
                                            </Text>
                                            <Text style={styles.termsCopyright}>©2026 8knews . All Rights Reserved</Text>
                                        </ScrollView>
                                    </View>
                                </View>
                            )}

                            {/* --- Privacy Policy Content --- */}
                            {activeMenuModal === 'privacy' && (
                                <View style={{ flex: 1, backgroundColor: '#EDEEF0' }}>
                                    {/* 1. Header Navigation */}
                                    <View style={styles.termsHeader}>
                                        <TouchableOpacity onPress={() => setActiveMenuModal('settings')} style={styles.termsBackBtn}>
                                            <Ionicons name="arrow-back" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.termsHeaderText}>Privacy Policy</Text>
                                    </View>

                                    {/* 2. Banner Area */}
                                    <View style={styles.termsBanner}>
                                        <Text style={styles.termsBannerTitle}>Privacy</Text>
                                    </View>

                                    {/* 3. Content Card */}
                                    <View style={styles.termsContentCard}>
                                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                            <Text style={styles.termsCardTitle}>Privacy</Text>
                                            <View style={styles.termsYellowDivider} />

                                            <View style={styles.termsSectionHeader}>
                                                <View style={styles.termsYellowPill} />
                                                <Text style={styles.termsSectionTitle}>Privacy Policy</Text>
                                            </View>

                                            <Text style={styles.termsLegalText}>
                                                Privacy Policy – 8K News{"\n\n"}
                                                Please read this Privacy Policy carefully. This Privacy Policy explains how 8K News Private Limited (“Company”, “8K News”, “we”, “us”, “our”) collects, uses, stores, protects, and discloses information collected from users (“You”, “Your”, “User”) of the 8K News mobile application (“App”).{"\n\n"}
                                                By downloading, installing, registering, or using the App, You consent to the collection, storage, processing, transfer, and disclosure of Your information as described in this Privacy Policy.{"\n\n"}
                                                If You do not agree with any part of this Privacy Policy, please do not download or use the App.{"\n\n"}
                                                1. Applicability{"\n"}
                                                This Privacy Policy applies only to the 8K News mobile application and website owned and operated by 8K News Private Limited.{"\n"}
                                                This Policy does not apply to third-party websites, services, applications, or platforms that may be linked or accessible through the App (“Third-Party Services”). 8K News does not control and is not responsible for the privacy practices or content of such Third-Party Services.{"\n\n"}
                                                2. Information Collected from Users{"\n"}
                                                8K News may collect the following types of information:{"\n\n"}
                                                a) Personal Information{"\n"}
                                                - Name (if provided){"\n"}
                                                - Email address{"\n"}
                                                - Phone number{"\n"}
                                                - Login identifiers (Google, Facebook, Twitter, etc.){"\n"}
                                                - Language preferences{"\n"}
                                                - Location (city/state-level, if enabled){"\n\n"}
                                                b) Non-Personal Information{"\n"}
                                                - Device information (model, OS version){"\n"}
                                                - App usage data{"\n"}
                                                - IP address{"\n"}
                                                - Log files{"\n"}
                                                - Crash reports{"\n"}
                                                - Analytics data{"\n\n"}
                                                c) Content-Related Information{"\n"}
                                                - News interactions (likes, shares, bookmarks){"\n"}
                                                - Comments or feedback{"\n"}
                                                - Content uploaded by contributors or reporters{"\n\n"}
                                                3. How 8K News Uses the Collected Information{"\n"}
                                                8K News uses collected information for the following purposes:{"\n"}
                                                - To provide and improve App functionality{"\n"}
                                                - To personalize news content and language preferences{"\n"}
                                                - To manage user authentication and security{"\n"}
                                                - To enable content creation, review, and publishing workflows{"\n"}
                                                - To communicate important updates, notifications, and alerts{"\n"}
                                                - To comply with legal and regulatory obligations{"\n"}
                                                - To prevent fraud, abuse, and unauthorized access{"\n"}
                                                - To analyze usage trends and improve performance{"\n\n"}
                                                4. How 8K News Protects User Information{"\n"}
                                                8K News follows industry-standard security practices to safeguard user information, including:{"\n"}
                                                - Secure servers and encrypted storage{"\n"}
                                                - Restricted access to personal data{"\n"}
                                                - Regular security monitoring{"\n"}
                                                - Use of trusted third-party infrastructure providers{"\n"}
                                                However, no method of transmission or storage is 100% secure, and 8K News does not guarantee absolute security of data.{"\n\n"}
                                                5. Sharing of User Information{"\n"}
                                                8K News does not sell or rent personal information to third parties.{"\n"}
                                                User information may be shared only in the following circumstances:{"\n"}
                                                - With trusted service providers (analytics, hosting, authentication){"\n"}
                                                - With government or law enforcement authorities when legally required{"\n"}
                                                - To protect the rights, safety, and property of 8K News and its users{"\n"}
                                                - With user consent{"\n"}
                                                All third-party partners are required to maintain confidentiality and data protection standards.{"\n\n"}
                                                6. User Choices & Control{"\n"}
                                                Users have the right to:{"\n"}
                                                - Update or correct profile information{"\n"}
                                                - Manage notification preferences{"\n"}
                                                - Choose language and content categories{"\n"}
                                                - Withdraw consent by uninstalling the App{"\n"}
                                                - Request deletion of personal data (subject to legal requirements){"\n"}
                                                Certain features may be unavailable if required permissions are denied.{"\n\n"}
                                                7. User Privacy & Advertisements{"\n"}
                                                8K News may display advertisements and sponsored content.{"\n"}
                                                - Ads may be personalized based on non-sensitive usage data{"\n"}
                                                - Advertisers do not receive personally identifiable information{"\n"}
                                                - Sponsored content will be clearly labeled{"\n"}
                                                8K News does not control third-party advertisers’ data collection practices.{"\n\n"}
                                                8. Data Retention{"\n"}
                                                User data is retained only for as long as necessary to:{"\n"}
                                                - Provide services{"\n"}
                                                - Comply with legal obligations{"\n"}
                                                - Resolve disputes{"\n"}
                                                - Enforce agreements{"\n"}
                                                Inactive accounts or unused data may be deleted periodically.{"\n\n"}
                                                9. Children’s Privacy{"\n"}
                                                8K News does not knowingly collect personal information from children under 18 years of age. If such data is discovered, it will be deleted promptly.{"\n\n"}
                                                10. Changes to This Privacy Policy{"\n"}
                                                8K News may revise this Privacy Policy from time to time.{"\n"}
                                                - Updates will be posted within the App or Website{"\n"}
                                                - Continued use after changes indicates acceptance of the revised policy{"\n"}
                                                Users are encouraged to review this policy periodically.{"\n\n"}
                                                11. User Acceptance{"\n"}
                                                By using the 8K News App or Website, You acknowledge that You have read, understood, and agreed to this Privacy Policy.{"\n\n"}
                                                12. Contact Information{"\n"}
                                                For any questions, concerns, or legal queries related to this Privacy Policy, please contact us at:{"\n"}
                                                📧 support@8knews.com{"\n"}
                                                📧 grievance@8knews.com
                                            </Text>
                                            <Text style={styles.termsCopyright}>©2026 8knews . All Rights Reserved</Text>
                                        </ScrollView>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )
            }

            <Animated.View style={[styles.overlay, overlayStyle]}>
                <Pressable style={{ flex: 1 }} onPress={toggleMenu} />
            </Animated.View>

            <Animated.View style={[styles.menuContainer, { paddingTop: insets.top || (Platform.OS === 'ios' ? 50 : 10), paddingBottom: insets.bottom }, menuStyle, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                <View style={[styles.customMenuHeader, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                    <TouchableOpacity style={styles.menuIconBtn} onPress={() => { toggleMenu(); setActiveMenuModal('settings'); }}>
                        <Ionicons name="settings-outline" size={24} color={isNightModeEnabled ? "#fff" : "#666"} />
                    </TouchableOpacity>
                    <Image
                        source={require('../assets/images/res_screenshot_2026_01_06_170338.png')}
                        style={styles.menuLogo}
                        contentFit="contain"
                    />
                    <TouchableOpacity style={styles.menuNewsHeader} onPress={() => { toggleMenu(); }}>
                        <Text style={[styles.menuNewsText, isNightModeEnabled && { color: '#fff' }]}>న్యూస్</Text>
                        <Ionicons name="chevron-forward" size={22} color="#4A90E2" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={[styles.newMenuList, isNightModeEnabled && { backgroundColor: '#151718' }]} showsVerticalScrollIndicator={false}>
                    {/* 2. Guest Login Card */}
                    {/* 2. Guest Login Card */}
                    <TouchableOpacity style={[styles.guestCard, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={() => {
                        toggleMenu();
                        setIsLoginModalVisible(true);
                    }}>
                        <View style={[styles.guestIconCircle, { overflow: 'hidden' }, isNightModeEnabled && { borderColor: '#555' }]}>
                            <Image
                                source="https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211469.png"
                                style={styles.profileAvatarImg}
                                contentFit="cover"
                            />
                        </View>
                        <Text style={styles.guestTextLogin}>Guest Login</Text>
                        <View style={{ flex: 1 }} />
                        <Ionicons name="chevron-forward" size={20} color={isNightModeEnabled ? "#fff" : "#ccc"} />
                    </TouchableOpacity>

                    {/* 3. States Grid (Row 1) */}
                    <View style={styles.gridRow}>
                        <TouchableOpacity style={[styles.gridItemState, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={() => { setActiveCategory('andhra'); toggleMenu(); flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); }}>
                            <Image source={require('../assets/images/res_ap_map_outline.png')} style={styles.stateMapIcon} contentFit="contain" />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.stateTitle, isNightModeEnabled && { color: '#fff' }]}>ఆంధ్రప్రదేశ్</Text>
                                <Text style={[styles.stateSubText, isNightModeEnabled && { color: '#ccc' }]}>Only Andhra Pradesh News</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity style={[styles.gridItemState, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={() => { setActiveCategory('telangana'); toggleMenu(); flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); }}>
                            <Image source={require('../assets/images/res_telangana_map_outline.png')} style={styles.stateMapIcon} contentFit="contain" />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.stateTitle, isNightModeEnabled && { color: '#fff' }]}>తెలంగాణ</Text>
                                <Text style={[styles.stateSubText, isNightModeEnabled && { color: '#ccc' }]}>Only Telangana News</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 4. News Grid (Row 2) */}
                    <View style={styles.gridRow}>
                        <TouchableOpacity style={[styles.gridItemSimple, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={() => { setActiveCategory('national'); toggleMenu(); flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); }}>
                            <Text style={[styles.gridTitleNational, isNightModeEnabled && { color: '#fff' }]}>జాతీయం</Text>
                            <Text style={[styles.gridSubCenter, isNightModeEnabled && { color: '#ccc' }]}>Only National News</Text>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity style={[styles.gridItemSimple, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                <Ionicons name="search" size={24} color={isNightModeEnabled ? "#fff" : "#000"} />
                                <Text style={[styles.gridTitleMain, { marginLeft: 8 }, isNightModeEnabled && { color: '#fff' }]}>Fact Check</Text>
                            </View>
                            <Text style={[styles.gridSubTeluguFact, isNightModeEnabled && { color: '#ccc' }]}>న్యూస్ పబ్లిష్ అయిందా.. లేదో వెరిఫై</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 5. Big Cards Row */}
                    <View style={styles.gridRow}>
                        <TouchableOpacity
                            style={[styles.bigCard, { backgroundColor: isNightModeEnabled ? '#151718' : '#F8F9FA', borderColor: isNightModeEnabled ? '#333' : '#E6E6E6' }]}
                            onPress={() => { toggleMenu(); setIsDigitalMagazineVisible(true); }}
                        >
                            <View style={styles.magazineIconCircle}>
                                <MaterialCommunityIcons name="newspaper-variant-outline" size={24} color="#0F5B8B" />
                            </View>
                            <Text style={[styles.bigCardTextLarge, isNightModeEnabled && { color: '#fff' }]}>డిజిటల్{"\n"}మ్యాగజిన్స్</Text>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity style={[styles.bigCard, { backgroundColor: '#F8F9FA', padding: 15 }, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]}>
                            <View style={styles.pollGroupIcon}>
                                <MaterialCommunityIcons name="account-group-outline" size={32} color={isNightModeEnabled ? "#fff" : "#555"} />
                            </View>
                            <Text style={[styles.bigCardTextLargeCenter, isNightModeEnabled && { color: '#fff' }]}>పోల్స్</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 6. List Items */}
                    <View style={styles.menuListContainerFlat}>
                        {/* Selected Location */}
                        <TouchableOpacity style={[styles.menuListItemFlat, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={() => {
                            toggleMenu();
                            setIsMenuLocationVisible(true);
                        }}>
                            <View style={styles.menuListLeftRow}>
                                <Ionicons name="location-outline" size={26} color={isNightModeEnabled ? "#fff" : "#000"} />
                                <View style={{ marginLeft: 15 }}>
                                    <Text style={[styles.menuListLabel, isNightModeEnabled && { color: '#fff' }]}>మీరు ఎంచుకున్న స్థానం</Text>
                                    <Text style={styles.menuListLocationBlue}>{userLocation}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuListItemFlat, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={toggleMenu}>
                            <Text style={[styles.menuListTitleSimpleBlack, isNightModeEnabled && { color: '#fff' }]}>English News</Text>
                            <Ionicons name="chevron-forward" size={20} color={isNightModeEnabled ? "#9BA1A6" : "#333"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuListItemFlat, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={toggleMenu}>
                            <Text style={[styles.menuListTitleSimpleBlack, isNightModeEnabled && { color: '#fff' }]}>Job notifications</Text>
                            <Ionicons name="chevron-forward" size={20} color={isNightModeEnabled ? "#9BA1A6" : "#333"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuListItemFlat, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={toggleMenu}>
                            <Text style={[styles.menuListTitleSimpleBlack, isNightModeEnabled && { color: '#fff' }]}>జాతకం & రాశి ఫలాలు వీడియోలు</Text>
                            <Ionicons name="chevron-forward" size={20} color={isNightModeEnabled ? "#9BA1A6" : "#333"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuListItemFlat, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]} onPress={toggleMenu}>
                            <Text style={[styles.menuListTitleSimpleBlack, isNightModeEnabled && { color: '#fff' }]}>8k న్యూస్ ఎక్స్‌క్లూజివ్</Text>
                            <Ionicons name="chevron-forward" size={20} color={isNightModeEnabled ? "#9BA1A6" : "#333"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuListItemFlat, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]}>
                            <View style={styles.menuListLeftRow}>
                                <Ionicons name="megaphone-outline" size={24} color={isNightModeEnabled ? "#fff" : "#000"} />
                                <Text style={[styles.menuListTitleSimpleBlack, { marginLeft: 15 }, isNightModeEnabled && { color: '#fff' }]}>Refer Now</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={isNightModeEnabled ? "#9BA1A6" : "#333"} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </Animated.View>

            {/* 🔐 LOGIN MODAL - REMOVED DUPLICATE MOCK */}


            {/* 🔐 FIREBASE LOGIN SCREEN */}
            {
                isLoginModalVisible && (
                    <View style={[styles.fullModalOverlay, { backgroundColor: '#fff', zIndex: 10000 }]}>
                        <LoginScreen
                            onClose={() => setIsLoginModalVisible(false)}
                            onLoginSuccess={() => {
                                setIsLoginModalVisible(false);
                                // Optionally show location selector after login
                                // setTimeout(() => setIsLocationSelectorVisible(true), 300);
                            }}
                        />
                    </View>
                )
            }

            {/* 🌍 LOCATION SELECTION SCREEN (Guest Login) */}
            {
                isLocationSelectorVisible && (
                    <View style={[styles.fullModalOverlay, { backgroundColor: isNightModeEnabled ? '#000' : '#fff' }]}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={[styles.locHeaderRef, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                                <Text style={[styles.locHeaderLeftText, isNightModeEnabled && { color: '#fff' }]}>Change location</Text>
                                <View style={styles.locHeaderCenter}>
                                    <Image
                                        source={require('../assets/images/res_8k_logo_1.png')}
                                        style={styles.locHeaderLogo}
                                        contentFit="contain"
                                    />
                                </View>
                                <TouchableOpacity onPress={() => setIsLocationSelectorVisible(false)} style={styles.locHeaderRight}>
                                    <Ionicons name="chevron-forward" size={28} color="#1a73e8" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30 }}>
                                <Text style={[styles.locRefInstruction, isNightModeEnabled && { color: '#fff' }]}>మీకు కావాల్సిన నియోజకవర్గం ఎంచుకోండి</Text>

                                <View style={styles.locRefSearchContainer}>
                                    <View style={[styles.locRefSearchBox, isNightModeEnabled && { borderColor: '#333' }]}>
                                        <Ionicons name="location-sharp" size={20} color="#777" />
                                        <TextInput
                                            style={[styles.locRefInput, isNightModeEnabled && { color: '#fff' }]}
                                            placeholder="మీ నియోజకవర్గం పేరు శోధించండి..."
                                            placeholderTextColor={isNightModeEnabled ? '#666' : '#999'}
                                        />
                                        <Ionicons name="search" size={20} color="#777" />
                                    </View>
                                </View>

                                {/* Location List Items */}
                                <View style={{ marginTop: 10 }}>
                                    {[
                                        { id: 'hyd', name: 'హైదరాబాద్' },
                                        { id: 'kukatpally', name: 'కూకట్‌పల్లి' },
                                        { id: 'sec', name: 'సికింద్రాబాద్' },
                                        { id: 'sri', name: 'శ్రీకాకుళం' },
                                        { id: 'guntur', name: 'గుంటూరు' },
                                        { id: 'vij', name: 'విజయవాడ' },
                                        { id: 'vizag', name: 'విశాఖపట్నం' },
                                        { id: 'tirupati', name: 'తిరుపతి' }
                                    ].map((loc) => (
                                        <TouchableOpacity
                                            key={loc.id}
                                            style={[styles.locListItem, isNightModeEnabled && { backgroundColor: '#151718', borderColor: '#333' }]}
                                            onPress={() => {
                                                setUserLocation(loc.name);
                                                setIsLocationSelectorVisible(false);
                                                setIsHUDVisible(true);
                                            }}
                                        >
                                            <View style={styles.locListLeft}>
                                                <View style={styles.locListIconCircle}>
                                                    <Ionicons name="location-sharp" size={18} color="#1a73e8" />
                                                </View>
                                                <Text style={[styles.locListItemText, isNightModeEnabled && { color: '#fff' }]}>{loc.name}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={22} color={isNightModeEnabled ? "#666" : "#999"} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )
            }

            {/* 📚 DIGITAL MAGAZINES MODAL */}
            {
                isDigitalMagazineVisible && (
                    <View style={[styles.fullModalOverlay, isNightModeEnabled && { backgroundColor: '#000' }]}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={[styles.magHeader, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                <TouchableOpacity onPress={() => setIsDigitalMagazineVisible(false)} style={styles.magBackRoundBtn}>
                                    <Ionicons name="chevron-back" size={24} color="#000" />
                                </TouchableOpacity>
                                <Text style={[styles.magHeaderText, isNightModeEnabled && { color: '#fff' }]}>డిజిటల్ మ్యాగజిన్స్</Text>
                                <View style={{ width: 44 }} />
                            </View>
                            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.magListContent} showsVerticalScrollIndicator={false}>
                                {magazines.length > 0 ? magazines.map((item: any) => (
                                    <TouchableOpacity key={item._id} style={[styles.magCard, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={() => openMagazine(item._id)} activeOpacity={0.7}>
                                        <Image
                                            source={{ uri: item.image?.includes('http') ? item.image : `${API_URL.replace('/api', '')}${item.image}` }}
                                            style={styles.magCardImage}
                                            contentFit="cover"
                                        />
                                        <View style={styles.magCardInfo}>
                                            <View style={styles.magBadge}>
                                                <Text style={styles.magBadgeText}>పుస్తకం</Text>
                                            </View>
                                            <Text style={[styles.magCardTitle, isNightModeEnabled && { color: '#fff' }]}>{item.title}</Text>
                                            <Text style={[styles.magCardDate, isNightModeEnabled && { color: '#9BA1A6' }]}>{new Date(item.created_at).toLocaleDateString('te-IN', { day: 'numeric', month: 'long' })}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )) : MAGAZINE_DATA.map((item) => (
                                    <TouchableOpacity key={item.id} style={[styles.magCard, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={() => {
                                        // Try to find a real magazine with similar title if magazines were fetched
                                        const realMag = magazines.find(m => m.title.toLowerCase().includes(item.title.toLowerCase()) || item.title.includes(m.title));
                                        if (realMag) {
                                            openMagazine(realMag._id);
                                        } else {
                                            console.log('Clicked hardcoded:', item.id);
                                            // Fallback: if user clicks "వ్యవసాయం" and we have any magazine, open it for demo
                                            if (magazines.length > 0) openMagazine(magazines[0]._id);
                                        }
                                    }} activeOpacity={0.7}>


                                        <Image
                                            source={item.image}
                                            style={styles.magCardImage}
                                            contentFit="cover"
                                        />
                                        <View style={styles.magCardInfo}>
                                            <View style={styles.magBadge}>
                                                <Text style={styles.magBadgeText}>{item.badge}</Text>
                                            </View>
                                            <Text style={[styles.magCardTitle, isNightModeEnabled && { color: '#fff' }]}>{item.title}</Text>
                                            <Text style={[styles.magCardDate, isNightModeEnabled && { color: '#9BA1A6' }]}>{item.date}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}

                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                )
            }

            {/* 🎓 TUTORIAL OVERLAYS - SEQUENCED ON FIRST SCREEN */}
            {
                isTutorialMode && (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 3000, elevation: 3000 }]} pointerEvents="none">

                        {/* SEQUENCE 0: SWIPE UP */}
                        {tutorialSequence === 0 && (
                            <Animated.View style={styles.swipeHintBottom}>
                                <Text style={styles.swipeHintText}>
                                    తదుపరి వార్తల కోసం పైకి నెట్టండి
                                </Text>
                                <Ionicons name="chevron-up" size={26} color="#fff" style={{ alignSelf: 'center', marginTop: 5 }} />
                            </Animated.View>
                        )}

                        {/* SEQUENCE 1: SWIPE DOWN */}
                        {tutorialSequence === 1 && (
                            <Animated.View style={styles.swipeHintBlueButton}>
                                <Text style={styles.swipeHintText}>
                                    క్రిందికి నెట్టండి
                                </Text>
                                <Ionicons name="chevron-down" size={26} color="#fff" style={{ alignSelf: 'center', marginTop: 5 }} />
                            </Animated.View>
                        )}

                        {/* SEQUENCE 2: TAP */}
                        {tutorialSequence === 2 && (
                            <Animated.View style={styles.tapHintCenter}>
                                <Text style={styles.tapHintText}>
                                    మెనూ బార్ చూడటానికి ఎక్కడైనా నొక్కండి
                                </Text>
                                <Ionicons name="hand-left-outline" size={30} color="#fff" style={{ alignSelf: 'center', marginTop: 10 }} />
                            </Animated.View>
                        )}

                    </View>
                )
            }
            {/* 📖 MAGAZINE VIEWER MODAL */}
            {
                viewingMagazine && (
                    <GestureHandlerRootView style={styles.magViewerOverlay}>
                        <SafeAreaView style={{ flex: 1 }}>
                            {/* 📱 TOP BAR */}
                            <View style={[styles.magViewerHeader, { marginTop: Platform.OS === 'ios' ? 0 : 10 }]}>
                                <View style={styles.magHeaderLeft}>
                                    <TouchableOpacity style={styles.magViewerCloseBtn} onPress={closeMagazineViewer}>
                                        <Ionicons name="arrow-back" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <View>
                                        <Text style={styles.magHeaderTitleTe}>మ్యాగజైన్</Text>
                                        <Text style={styles.magHeaderPageInfo}>Page no {currentPageIndex + 1}/{magazinePages.length}</Text>
                                    </View>
                                </View>
                                <Image source={require('../assets/images/res_8k_logo_1.png')} style={styles.magViewerLogo} contentFit="contain" />

                            </View>

                            <View style={[styles.magViewerContent, { overflow: 'hidden' }]}>
                                {magazinePages.length > 0 && (
                                    <GestureDetector gesture={magPanGesture}>
                                        <View
                                            style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
                                            renderToHardwareTextureAndroid={true}
                                            shouldRasterizeIOS={true}
                                            collapsable={false}
                                        >
                                            <Animated.View
                                                style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}
                                                renderToHardwareTextureAndroid={true}
                                                collapsable={false}
                                            >
                                                {/* Next Page Layer (Under) */}
                                                <Animated.View
                                                    style={[StyleSheet.absoluteFill, nextPageStyle, { backfaceVisibility: 'hidden' }]}
                                                    renderToHardwareTextureAndroid={true}
                                                    collapsable={false}
                                                >
                                                    {underPages.next < magazinePages.length && underPages.next >= 0 && (
                                                        <Image
                                                            source={{ uri: magazinePages[underPages.next].url.replace('localhost', '192.168.29.70') }}
                                                            style={styles.magPageImage}
                                                            contentFit="contain"
                                                            priority="high"
                                                            cachePolicy="memory-disk"
                                                        />
                                                    )}
                                                </Animated.View>

                                                {/* Previous Page Layer (Under) */}
                                                <Animated.View
                                                    style={[StyleSheet.absoluteFill, prevPageStyle, { backfaceVisibility: 'hidden' }]}
                                                    renderToHardwareTextureAndroid={true}
                                                    collapsable={false}
                                                >
                                                    {underPages.prev >= 0 && underPages.prev < magazinePages.length && (
                                                        <Image
                                                            source={{ uri: magazinePages[underPages.prev].url.replace('localhost', '192.168.29.70') }}
                                                            style={styles.magPageImage}
                                                            contentFit="contain"
                                                            priority="high"
                                                            cachePolicy="memory-disk"
                                                        />
                                                    )}
                                                </Animated.View>

                                                {/* Top Layer (Current Page) */}
                                                <Animated.View
                                                    style={[
                                                        StyleSheet.absoluteFill,
                                                        flipAnimationStyle,
                                                        { zIndex: 2, backgroundColor: '#000', backfaceVisibility: 'hidden' }
                                                    ]}
                                                    renderToHardwareTextureAndroid={true}
                                                    collapsable={false}
                                                >
                                                    <Image
                                                        source={{ uri: magazinePages[currentPageIndex].url.replace('localhost', '192.168.29.70') }}
                                                        style={styles.magPageImage}
                                                        contentFit="contain"
                                                        priority="high"
                                                        cachePolicy="memory-disk"
                                                    />
                                                    {/* Edge Shadow */}
                                                    <Animated.View style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: 20,
                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                        opacity: interpolate(Math.abs(magFlipProgress.value), [0, 1], [0, 1])
                                                    }} />
                                                </Animated.View>
                                            </Animated.View>

                                            {/* Navigation Buttons Overlay */}
                                            <View style={styles.magNavOverlay} pointerEvents="box-none">
                                                <TouchableOpacity
                                                    style={[styles.magNavBtn, { left: 10 }]}
                                                    onPress={previousPage}
                                                    activeOpacity={0.6}
                                                >
                                                    <Ionicons name="chevron-back" size={30} color="#fff" />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.magNavBtn, { right: 10 }]}
                                                    onPress={nextPage}
                                                    activeOpacity={0.6}
                                                >
                                                    <Ionicons name="chevron-forward" size={30} color="#fff" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </GestureDetector>
                                )}
                            </View>

                            {/* 💡 SWIPE HINT */}
                            <Animated.View style={[styles.magSwipeHintContainer, { opacity: swipeHintOpacity }]}>
                                <View style={styles.magSwipeHintPill}>
                                    <Ionicons name="chevron-back" size={12} color="#fff" />
                                    <Ionicons name="chevron-back" size={12} color="#fff" style={{ marginLeft: -8 }} />
                                    <Text style={styles.magSwipeHintText}>SWIPE</Text>
                                    <Ionicons name="chevron-forward" size={12} color="#fff" style={{ marginRight: -8 }} />
                                    <Ionicons name="chevron-forward" size={12} color="#fff" />
                                </View>
                            </Animated.View>

                            {/* 📊 INTERACTION BAR */}
                            <View style={styles.magInteractionBar}>
                                <View style={styles.magInteractionLeft}>
                                    <TouchableOpacity
                                        style={styles.magInteractionItem}
                                        onPress={() => handleLikeNews(viewingMagazine)}
                                    >
                                        <Ionicons
                                            name={newsInteractions[viewingMagazine]?.liked ? "thumbs-up" : "thumbs-up-outline"}
                                            size={24}
                                            color={newsInteractions[viewingMagazine]?.liked ? "#1a73e8" : "#fff"}
                                        />
                                        <Text style={styles.magInteractionText}>
                                            {formatCount(newsInteractions[viewingMagazine]?.likeCount ?? (magazines.find(m => m._id === viewingMagazine)?.likeCount || 0))}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.magInteractionItem}
                                        onPress={() => handleDislikeNews(viewingMagazine)}
                                    >
                                        <Ionicons
                                            name={newsInteractions[viewingMagazine]?.disliked ? "thumbs-down" : "thumbs-down-outline"}
                                            size={24}
                                            color={newsInteractions[viewingMagazine]?.disliked ? "#d93025" : "#fff"}
                                        />
                                        <Text style={styles.magInteractionText}>
                                            {formatCount(newsInteractions[viewingMagazine]?.dislikeCount || 0)}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.magInteractionItem}
                                        onPress={() => handleOpenComments(viewingMagazine)}
                                    >
                                        <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                                        <Text style={styles.magInteractionText}>
                                            {allComments[viewingMagazine]?.length || 0}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.magBottomIndicator}>
                                    <Text style={styles.magBottomPageNum}>{currentPageIndex + 1}/{magazinePages.length}</Text>
                                </View>
                            </View>
                        </SafeAreaView>
                    </GestureHandlerRootView>


                )
            }

            {/* 📤 CUSTOM SHARE OVERLAY (Fits inside App Layout) */}
            {
                isShareModalVisible && (
                    <View style={styles.modalOverlay}>
                        <Pressable style={styles.fullSpace} onPress={() => setShareModalVisible(false)}>
                            <View style={{ flex: 1 }} />
                            <Pressable style={[styles.shareContainerSmall, isNightModeEnabled && { backgroundColor: '#151718' }]} onPress={(e) => e.stopPropagation()}>
                                <View style={[styles.sharePill, isNightModeEnabled && { backgroundColor: '#333' }]} />
                                <Text style={[styles.shareTitleText, isNightModeEnabled && { color: '#fff' }]}>Share</Text>

                                <View style={styles.shareGrid}>
                                    {[
                                        { name: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
                                        { name: 'WhatsApp Status', icon: 'sync-circle', color: '#25D366' },
                                        { name: 'X Share', icon: 'logo-twitter', color: '#000' },
                                        { name: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
                                        { name: 'Instagram Chat', icon: 'chatbubbles', color: '#E4405F' },
                                        { name: 'Instagram Stories', icon: 'add-circle', color: '#C13584' },
                                        { name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
                                        { name: 'Facebook Stories', icon: 'book', color: '#1877F2' },
                                        { name: 'Telegram', icon: 'paper-plane', color: '#0088CC' },
                                        { name: 'Copy Link', icon: 'link', color: '#444' },
                                        { name: 'More', icon: 'ellipsis-horizontal', color: '#888' },
                                    ].map((item) => (
                                        <Pressable key={item.name} style={styles.shareGridItem} onPress={() => handleShareAction(item.name)}>
                                            <View style={[styles.shareIconBox, { backgroundColor: item.color }]}>
                                                <Ionicons name={item.icon as any} size={28} color="#fff" />
                                            </View>
                                            <Text style={[styles.shareItemLabel, isNightModeEnabled && { color: '#fff' }]}>{item.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                                <View style={{ height: 40 }} />
                            </Pressable>
                        </Pressable>
                    </View>
                )
            }

            {/* 💬 COMMENT OVERLAY (Morphing Reveal Expansion) */}
            {
                commentModalVisible && (
                    <Animated.View style={[styles.modalOverlay, overlayAnimationStyle]}>
                        <Pressable style={styles.fullSpace} onPress={closeComments} />
                        <Animated.View style={[styles.commentContainer, commentAnimationStyle, isNightModeEnabled && { backgroundColor: '#000' }]}>
                            {/* 1. Header: Back | Title | Toggle */}
                            <View style={[styles.commentHeader, isNightModeEnabled && { backgroundColor: '#151718', borderBottomColor: '#333' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <TouchableOpacity onPress={closeComments} style={{ padding: 5, marginRight: 8 }}>
                                        <Ionicons name="arrow-back" size={24} color={isNightModeEnabled ? "#fff" : "#999"} />
                                    </TouchableOpacity>
                                    <Text style={[styles.commentHeaderTitle, isNightModeEnabled && { color: '#fff' }]} numberOfLines={1}>{currentNewsTitle}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, color: '#666', marginBottom: -4 }}>నోటిఫికేషన్లు</Text>
                                    <Switch
                                        value={currentNewsId ? (notificationPreferences[currentNewsId] ?? true) : true}
                                        onValueChange={toggleNotifications}
                                        trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                        thumbColor="#fff"
                                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                    />
                                </View>
                            </View>

                            {/* 2. Scrollable Comment List */}
                            <ScrollView style={styles.commentList} showsVerticalScrollIndicator={false}>
                                {isViewingVideoComments && (
                                    <View style={styles.relevantDropdown}>
                                        <Text style={styles.relevantText}>Most relevant</Text>
                                        <Ionicons name="chevron-down" size={16} color="#000" />
                                    </View>
                                )}

                                {comments.filter(c => !blockedCommentIds.includes(c.id) && !blockedUserIds.includes(c.userId || c.user)).map((item, index) => {
                                    const commentNumber = comments.length - index;
                                    const isBlocked = blockedCommentIds.includes(item.id) || blockedUserIds.includes(item.userId || item.user);

                                    if (isViewingVideoComments) {
                                        return (
                                            <View key={item.id} style={styles.videoCommentItem}>
                                                {/* Left: Avatar */}
                                                <View style={[styles.videoAvatar, { backgroundColor: ['#00BFA5', '#00C853', '#FFD600', '#FF4081'][index % 4], justifyContent: 'center', alignItems: 'center' }]}>
                                                    {/* Using placeholder initials if no image */}
                                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{item.user.charAt(0)}</Text>
                                                </View>

                                                {/* Right: Content */}
                                                <View style={styles.videoContent}>
                                                    <View style={styles.videoUserRow}>
                                                        <Text style={styles.videoUserName}>{item.user}</Text>
                                                        <Text style={styles.videoTime}>· {getTimeAgo(item.timestamp).replace(' ago', '')}</Text>
                                                    </View>

                                                    {item.isSensitive && !revealedSensitiveIds.includes(item.id) ? (
                                                        <TouchableOpacity style={styles.sensitiveContainer} onPress={() => revealSensitive(item.id)}>
                                                            <View style={styles.sensitiveContentRow}>
                                                                <Ionicons name="eye-off-outline" size={20} color="#666" />
                                                                <Text style={styles.sensitiveText}>Sensitive content</Text>
                                                            </View>
                                                            <View style={styles.sensitiveTapBtn}>
                                                                <Text style={styles.sensitiveTapText}>Tap to</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View>
                                                            {item.text.trim().length > 0 && <Text style={styles.videoCommentText}>{item.text}</Text>}
                                                            {item.gifUrl && (
                                                                <Image
                                                                    source={{ uri: item.gifUrl }}
                                                                    style={styles.commentGif}
                                                                    contentFit="cover"
                                                                />
                                                            )}
                                                        </View>
                                                    )}

                                                    <View style={styles.videoActionRow}>
                                                        <TouchableOpacity onPress={() => setReplyTarget({ commentId: item.id, userName: item.user })}>
                                                            <Text style={styles.videoActionText}>Reply</Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity style={styles.videoLikeContainer} onPress={() => handleLikeComment(item.id)}>
                                                            <View style={styles.videoLikeBadge}>
                                                                <Ionicons name="thumbs-up" size={10} color="#fff" />
                                                            </View>
                                                            <Text style={styles.videoLikeCount}>{item.likeCount}</Text>
                                                        </TouchableOpacity>

                                                        <View style={styles.videoReactionIcons}>
                                                            <TouchableOpacity onPress={() => handleLikeComment(item.id)}>
                                                                <Ionicons name={item.likedByMe ? "thumbs-up" : "thumbs-up-outline"} size={20} color={item.likedByMe ? "#1a73e8" : "#65676b"} />
                                                            </TouchableOpacity>
                                                            <Ionicons name="thumbs-down-outline" size={20} color="#65676b" />
                                                        </View>
                                                    </View>

                                                    {item.replies.length > 0 && (
                                                        <TouchableOpacity onPress={() => toggleReplies(item.id)}>
                                                            <Text style={styles.viewRepliesText}>
                                                                <Ionicons name={item.showReplies ? "chevron-up" : "return-down-forward"} size={14} color="#65676b" /> {item.showReplies ? "Hide" : `View ${item.replies.length}`} reply
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                    {/* Nested Replies for Video */}
                                                    {item.showReplies && item.replies.map(reply => (
                                                        <View key={reply.id} style={styles.videoReplyItem}>
                                                            <View style={[styles.videoAvatar, { width: 24, height: 24, borderRadius: 12, backgroundColor: '#8BC34A', justifyContent: 'center', alignItems: 'center' }]}>
                                                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{reply.user.charAt(0)}</Text>
                                                            </View>
                                                            <View style={styles.videoContent}>
                                                                <View style={styles.videoUserRow}>
                                                                    <Text style={[styles.videoUserName, { fontSize: 11 }]}>{reply.user}</Text>
                                                                    <Text style={[styles.videoTime, { fontSize: 10 }]}>· {getTimeAgo(reply.timestamp).replace(' ago', '')}</Text>
                                                                </View>
                                                                <View>
                                                                    {reply.text.trim().length > 0 && <Text style={[styles.videoCommentText, { fontSize: 13 }]}>{reply.text}</Text>}
                                                                    {reply.gifUrl && (
                                                                        <Image
                                                                            source={{ uri: reply.gifUrl }}
                                                                            style={[styles.commentGif, { width: 120, height: 120 }]}
                                                                            contentFit="cover"
                                                                        />
                                                                    )}
                                                                </View>
                                                                <View style={styles.videoActionRow}>
                                                                    <TouchableOpacity onPress={() => handleLikeComment(item.id, reply.id)}>
                                                                        <Ionicons name={reply.likedByMe ? "thumbs-up" : "thumbs-up-outline"} size={16} color={reply.likedByMe ? "#1a73e8" : "#65676b"} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        );
                                    }

                                    const visibleReplies = item.replies.filter(r => !blockedUserIds.includes(r.userId || r.user));

                                    return (
                                        <View key={item.id} style={styles.commentItemWrap}>
                                            <View style={styles.commentItem}>
                                                {/* Left: Avatar with Number */}
                                                <View style={[styles.avatarCircle, { backgroundColor: ['#00BFA5', '#00C853', '#FFD600', '#FF4081'][index % 4] }]}>
                                                    <Text style={styles.avatarNumber}>{commentNumber}</Text>
                                                </View>

                                                {/* Right: Content */}
                                                <View style={styles.commentContentWrapper}>
                                                    {/* Gray Box for Text */}
                                                    <View style={styles.commentBubble}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Text style={styles.commentUserName}>{item.user}</Text>
                                                                {item.isMe && (
                                                                    <View style={styles.mePill}>
                                                                        <Text style={styles.meText}>me</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <Text style={styles.footerTimeText}>{getTimeAgo(item.timestamp)}</Text>
                                                        </View>
                                                        <TouchableOpacity disabled>
                                                            <Text style={styles.commentLocation}>📍 {item.location || 'Ranga Reddy (D)'}</Text>
                                                        </TouchableOpacity>

                                                        {item.isSensitive && !revealedSensitiveIds.includes(item.id) ? (
                                                            <TouchableOpacity style={styles.sensitiveContainer} onPress={() => revealSensitive(item.id)}>
                                                                <View style={styles.sensitiveContentRow}>
                                                                    <Ionicons name="eye-off-outline" size={20} color="#666" />
                                                                    <Text style={styles.sensitiveText}>Sensitive content</Text>
                                                                </View>
                                                                <View style={styles.sensitiveTapBtn}>
                                                                    <Text style={styles.sensitiveTapText}>Tap to</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ) : (
                                                            <View>
                                                                {item.text.trim().length > 0 && <Text style={styles.commentTextContent}>{item.text}</Text>}
                                                                {item.gifUrl && (
                                                                    <Image
                                                                        source={{ uri: item.gifUrl }}
                                                                        style={styles.commentGif}
                                                                        contentFit="cover"
                                                                    />
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* Footer: Reply | Delete | Icons */}
                                                    <View style={styles.commentFooterRow}>
                                                        <View style={styles.footerLeft}>
                                                            <TouchableOpacity style={styles.footerAction} onPress={() => setReplyTarget({ commentId: item.id, userName: item.user })}>
                                                                <Ionicons name="arrow-undo" size={14} color="#666" />
                                                                <Text style={styles.footerReplyText}>Reply</Text>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity style={styles.footerAction} onPress={() => handleLikeComment(item.id)}>
                                                                <Ionicons name={item.likedByMe ? "heart" : "heart-outline"} size={16} color={item.likedByMe ? "#e44" : "#666"} />
                                                                <Text style={[styles.footerReplyText, item.likedByMe && { color: '#e44' }]}>{item.likeCount > 0 ? item.likeCount : 'Like'}</Text>
                                                            </TouchableOpacity>

                                                            {item.isMe && (
                                                                <TouchableOpacity style={styles.footerAction} onPress={() => handleDeleteAction(item.id)}>
                                                                    <Ionicons name="trash-outline" size={14} color="#666" />
                                                                    <Text style={styles.footerReplyText}>Delete</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>

                                                        <View style={styles.footerRight}>
                                                            <TouchableOpacity onPress={() => handleCopyComment(item.text)}>
                                                                <Ionicons name="copy-outline" size={16} color="#aaa" style={styles.footerIcon} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => handleReportComment(item.id)}>
                                                                <Ionicons name="alert-circle-outline" size={18} color="#aaa" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>

                                                    {/* REPLIES SECTION */}
                                                    {visibleReplies.length > 0 && (
                                                        <View style={styles.repliesContainer}>
                                                            {visibleReplies.map((reply) => (
                                                                <View key={reply.id} style={styles.replyItem}>
                                                                    <View style={styles.replyThreadLine} />
                                                                    <View style={styles.replyContent}>
                                                                        <View style={styles.replyBubble}>
                                                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                                    <Text style={styles.commentUserName}># {reply.user}</Text>
                                                                                    {reply.isMe && (
                                                                                        <View style={styles.mePill}>
                                                                                            <Text style={styles.meText}>me</Text>
                                                                                        </View>
                                                                                    )}
                                                                                </View>
                                                                                <Text style={styles.footerTimeText}>{getTimeAgo(reply.timestamp)}</Text>
                                                                            </View>

                                                                            {reply.isSensitive && !revealedSensitiveIds.includes(reply.id) ? (
                                                                                <TouchableOpacity style={styles.sensitiveContainer} onPress={() => revealSensitive(reply.id)}>
                                                                                    <View style={styles.sensitiveContentRow}>
                                                                                        <Ionicons name="eye-off-outline" size={16} color="#666" />
                                                                                        <Text style={[styles.sensitiveText, { fontSize: 12 }]}>Sensitive content</Text>
                                                                                    </View>
                                                                                    <View style={[styles.sensitiveTapBtn, { paddingHorizontal: 8, paddingVertical: 4 }]}>
                                                                                        <Text style={[styles.sensitiveTapText, { fontSize: 11 }]}>Tap to</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            ) : (
                                                                                <View>
                                                                                    {reply.text.trim().length > 0 && <Text style={styles.commentTextContent}>{reply.text}</Text>}
                                                                                    {reply.gifUrl && (
                                                                                        <Image
                                                                                            source={{ uri: reply.gifUrl }}
                                                                                            style={[styles.commentGif, { width: 120, height: 120 }]}
                                                                                            contentFit="cover"
                                                                                        />
                                                                                    )}
                                                                                </View>
                                                                            )}
                                                                        </View>

                                                                        <View style={styles.commentFooterRow}>
                                                                            <View style={styles.footerLeft}>
                                                                                <TouchableOpacity style={styles.footerAction} onPress={() => handleLikeComment(item.id, reply.id)}>
                                                                                    <Ionicons name={reply.likedByMe ? "heart" : "heart-outline"} size={14} color={reply.likedByMe ? "#e44" : "#666"} />
                                                                                    <Text style={[styles.footerReplyText, reply.likedByMe && { color: '#e44' }]}>{reply.likeCount > 0 ? reply.likeCount : 'Like'}</Text>
                                                                                </TouchableOpacity>
                                                                                {reply.isMe && (
                                                                                    <TouchableOpacity style={styles.footerAction} onPress={() => handleDeleteAction(item.id, reply.id)}>
                                                                                        <Ionicons name="trash-outline" size={12} color="#666" />
                                                                                        <Text style={styles.footerReplyText}>Delete</Text>
                                                                                    </TouchableOpacity>
                                                                                )}
                                                                            </View>
                                                                            <View style={styles.footerRight}>
                                                                                <TouchableOpacity onPress={() => handleReportComment(item.id, reply.id)}>
                                                                                    <Ionicons name="alert-circle-outline" size={14} color="#aaa" />
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            {/* 3. Bottom: Reactions + Input */}
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                            >
                                {isViewingVideoComments ? (
                                    <View style={styles.videoInputContainer}>
                                        <View style={{ flex: 1 }}>
                                            {replyTarget && (
                                                <View style={[styles.replyIndicator, { paddingVertical: 4, paddingHorizontal: 10 }]}>
                                                    <Text style={[styles.replyIndicatorText, { fontSize: 11 }]}>Replying to @{replyTarget.userName}</Text>
                                                    <TouchableOpacity onPress={() => setReplyTarget(null)}>
                                                        <Ionicons name="close-circle" size={14} color="#65676b" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            <TextInput
                                                style={styles.videoInput}
                                                placeholder={replyTarget ? "Reply..." : "Add a comment..."}
                                                placeholderTextColor="#65676b"
                                                value={newComment}
                                                onChangeText={setNewComment}
                                            />
                                        </View>
                                        {newComment.trim().length > 0 && (
                                            <TouchableOpacity style={styles.videoSendBtn} onPress={() => handleAddComment()}>
                                                <Ionicons name="send" size={20} color="#1a73e8" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.bottomInputContainer}>
                                        {/* Emoji Reaction Bar */}
                                        <View style={styles.reactionBar}>
                                            <Pressable style={styles.reactionEmoji} onPress={() => setNewComment(prev => prev + '😂')}><Text style={{ fontSize: 20 }}>😂</Text></Pressable>
                                            <Pressable style={styles.reactionEmoji} onPress={() => setNewComment(prev => prev + '❤️')}><Text style={{ fontSize: 20 }}>❤️</Text></Pressable>
                                            <Pressable style={styles.reactionEmoji} onPress={() => setNewComment(prev => prev + '😍')}><Text style={{ fontSize: 20 }}>😍</Text></Pressable>
                                            <Pressable style={styles.reactionEmoji} onPress={() => setNewComment(prev => prev + '🤣')}><Text style={{ fontSize: 20 }}>🤣</Text></Pressable>
                                            <Pressable style={styles.reactionEmoji} onPress={() => setNewComment(prev => prev + '😆')}><Text style={{ fontSize: 20 }}>😆</Text></Pressable>
                                            <Ionicons name="chevron-forward" size={20} color="#999" />
                                        </View>

                                        <View style={styles.inputRow}>
                                            <View style={styles.inputLeftIcons}>
                                                <TouchableOpacity onPress={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}>
                                                    <View style={styles.giftIconBox}>
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>GIF</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}>
                                                    <Ionicons name="happy-outline" size={24} color="#666" style={{ marginLeft: 15 }} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                {replyTarget && (
                                                    <View style={styles.replyIndicator}>
                                                        <Text style={styles.replyIndicatorText}>Replying to @{replyTarget.userName}</Text>
                                                        <TouchableOpacity onPress={() => setReplyTarget(null)}>
                                                            <Ionicons name="close-circle" size={16} color="#444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                <TextInput
                                                    style={styles.newInputStyle}
                                                    placeholder={replyTarget ? "రిప్లై ఇవ్వండి..." : "కామెంట్ చేయండి"}
                                                    placeholderTextColor="#999"
                                                    value={newComment}
                                                    onChangeText={setNewComment}
                                                />
                                            </View>

                                            {/* Action Buttons */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                                <Pressable style={styles.langToggleBtn}>
                                                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>అ/A</Text>
                                                </Pressable>

                                                {newComment.trim().length > 0 && (
                                                    <Pressable style={styles.sendBtn} onPress={() => handleAddComment()}>
                                                        <Ionicons name="send" size={20} color="#1a73e8" />
                                                    </Pressable>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                )}
                                {showEmojiPicker && (
                                    <EmojiSelector
                                        onEmojiSelect={(emoji) => {
                                            setNewComment(prev => prev + emoji);
                                        }}
                                        isNightMode={isNightModeEnabled}
                                    />
                                )}
                                {showGifPicker && (
                                    <GifSelector
                                        onGifSelect={(gifUrl) => {
                                            handleAddComment(gifUrl);
                                        }}
                                        isNightMode={isNightModeEnabled}
                                    />
                                )}
                            </KeyboardAvoidingView>
                        </Animated.View>

                        {/* 🚩 REPORT / MODERATION MODAL (IN-MODAL OVERLAY) */}
                        {reportModalVisible && (
                            <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200 }]}>
                                <Pressable style={styles.fullSpace} onPress={() => { setReportModalVisible(false); setReportingItem(null); }} />
                                <View style={[styles.reportSheetContainer, isNightModeEnabled && { backgroundColor: '#151718' }]}>
                                    <View style={[styles.reportSheetPill, isNightModeEnabled && { backgroundColor: '#333' }]} />
                                    <Text style={[styles.reportSheetTitle, isNightModeEnabled && { color: '#fff' }]}>కామెంట్ మీద చర్య</Text>

                                    <TouchableOpacity style={styles.reportActionItem} onPress={handleBlockComment}>
                                        <View style={[styles.reportIconBox, { backgroundColor: '#fdecea' }]}>
                                            <Ionicons name="chatbubble-outline" size={22} color="#d93025" />
                                        </View>
                                        <View style={styles.reportActionTextContent}>
                                            <Text style={styles.reportActionLabel}>బ్లాక్ కామెంట్</Text>
                                            <Text style={styles.reportActionSub}>ఈ కామెంట్‌ను మళ్లీ చూడకూడదు</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.reportActionItem} onPress={handleBlockUser}>
                                        <View style={[styles.reportIconBox, { backgroundColor: '#fdecea' }]}>
                                            <Ionicons name="person-remove-outline" size={22} color="#d93025" />
                                        </View>
                                        <View style={styles.reportActionTextContent}>
                                            <Text style={styles.reportActionLabel}>బ్లాక్ యూజర్</Text>
                                            <Text style={styles.reportActionSub}>ఈ యూజర్ నుండి వచ్చే అన్ని కామెంట్స్‌ను బ్లాక్ చేయండి</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.reportActionItem} onPress={handleSubmitModerationReport}>
                                        <View style={[styles.reportIconBox, { backgroundColor: '#e8f0fe' }]}>
                                            <Ionicons name="flag-outline" size={22} color="#1a73e8" />
                                        </View>
                                        <View style={styles.reportActionTextContent}>
                                            <Text style={styles.reportActionLabel}>రిపోర్ట్ ఇష్యూ</Text>
                                            <Text style={styles.reportActionSub}>ఈ కామెంట్‌పై మా టీమ్‌కు ఫిర్యాదు చేయండి</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.reportCancelBtn}
                                        onPress={() => { setReportModalVisible(false); setReportingItem(null); }}
                                    >
                                        <Text style={styles.reportCancelText}>రద్దు చేయి</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                )
            }
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#000',
    },
    commentGif: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    header: {
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        zIndex: 10,
    },
    menuIconButton: {
        padding: 5,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#000',
    },
    searchButton: {
        padding: 5,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 99,
    },
    menuContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#fff',
        zIndex: 100,
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
        width: 65,
        height: 65,
        borderRadius: 33,
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
        fontSize: 13,
        color: '#666',
        marginTop: 2,
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
    badge: {
        backgroundColor: '#e44',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    menuFooter: {
        position: 'absolute',
        bottom: 30,
        left: 25,
    },
    versionText: {
        fontSize: 12,
        color: '#999',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 70000, // Elevated to ensure it covers everything including magazine viewer
    },
    fullModalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        zIndex: 100000, // Extremely high to cover HUDs and everything
    },
    fullSpace: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    sendBtn: {
        marginLeft: 10,
        padding: 5,
    },
    commentContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        height: '100%',
        width: '100%',
        maxWidth: 420,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        overflow: 'hidden',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    commentHeaderTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        letterSpacing: -0.3,
    },
    commentList: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    commentItemWrap: {
        marginBottom: 25,
    },
    commentItem: {
        flexDirection: 'row',
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 5,
    },
    avatarNumber: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    commentContentWrapper: {
        flex: 1,
    },
    commentBubble: {
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        padding: 12,
        alignSelf: 'flex-start',
        minWidth: '100%',
    },
    commentUserName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
    },
    commentLocation: {
        fontSize: 10,
        color: '#666',
        marginVertical: 4,
    },
    commentTextContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    mePill: {
        backgroundColor: '#1a73e8',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 8,
        marginLeft: 8,
    },
    meText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    commentFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        paddingHorizontal: 4,
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerTimeText: {
        fontSize: 11,
        color: '#888',
    },
    // 📼 VIDEO STYLE COMMENTS
    videoCommentItem: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    videoAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    videoContent: {
        flex: 1,
    },
    videoUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    videoUserName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
        marginRight: 6,
    },
    videoTime: {
        fontSize: 12,
        color: '#666',
    },
    videoCommentText: {
        fontSize: 14,
        color: '#111',
        lineHeight: 18,
    },
    videoActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    videoActionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#65676b',
        marginRight: 15,
    },
    videoLikeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderWidth: 1,
        borderColor: '#f0f2f5',
        marginRight: 20,
    },
    videoLikeBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#1877f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    videoLikeCount: {
        fontSize: 12,
        color: '#65676b',
    },
    videoReactionIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    relevantDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    relevantText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginRight: 4,
    },
    viewRepliesText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#65676b',
        fontWeight: 'bold',
        color: '#65676b',
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoReplyItem: {
        flexDirection: 'row',
        marginTop: 10,
        marginLeft: 0,
    },
    videoInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    videoInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 14,
        color: '#000',
    },
    videoSendBtn: {
        marginLeft: 10,
        padding: 5,
    },
    footerReplyText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    footerIcon: {
        opacity: 0.6,
    },
    repliesContainer: {
        marginTop: 15,
        paddingLeft: 10,
    },
    replyItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    replyThreadLine: {
        width: 2,
        backgroundColor: '#E0E0E0',
        marginRight: 12,
        borderRadius: 1,
    },
    replyContent: {
        flex: 1,
    },
    replyBubble: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    replyIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginBottom: 8,
    },
    replyIndicatorText: {
        fontSize: 12,
        color: '#1a73e8',
        fontWeight: 'bold',
    },
    deleteModalCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        width: '80%',
        maxWidth: 320,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    deleteModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    deleteModalBtn: {
        backgroundColor: '#e44',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteModalBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelModalBtn: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelModalBtnText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomInputContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    reactionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    reactionEmoji: {
        padding: 5,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputLeftIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    giftIconBox: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        paddingHorizontal: 3,
        paddingVertical: 1,
    },
    newInputStyle: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 14,
        color: '#000',
        minHeight: 40,
    },
    langToggleBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1a73e8',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 25,
        width: '100%',
        maxWidth: 420,
        height: '92%',
        padding: 0,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    settingsFullModal: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        elevation: 0,
        backgroundColor: '#F7F7F7',
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    settingsIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    settingsSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6F7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    settingsSelectorText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
    aboutAppContainer: {
        backgroundColor: '#FFF9F0', // Light beige
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FFD7D7', // Light red/pink border
        marginTop: 10,
        marginBottom: 40,
        overflow: 'hidden',
    },
    aboutAppHeader: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 5,
    },
    aboutAppHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    aboutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#FFF0E0',
    },
    aboutItemLabel: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
    },
    formContent: {
        marginTop: 10,
        alignItems: 'center',
    },
    profileCircleLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#999',
        alignSelf: 'flex-start',
        marginBottom: 8,
        letterSpacing: 1,
    },
    formInput: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
        marginBottom: 20,
    },
    submitBtn: {
        backgroundColor: '#000',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    langList: {
        marginTop: 10,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    langText: {
        fontSize: 16,
        color: '#333',
    },
    langTextActive: {
        color: '#1a73e8',
        fontWeight: 'bold',
    },
    savedScroll: {
        marginTop: 10,
    },
    savedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    savedTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    savedDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    optionsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsCard: {
        width: '85%',
        maxWidth: 320,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 15,
    },
    optionsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    optionTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#999',
        marginTop: 10,
    },
    // REPORT FORM STYLES
    reportCard: {
        width: '90%',
        maxWidth: 360,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
    },
    closeButtonRound: {
        alignSelf: 'flex-end',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#fff',
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    radioLabel: {
        fontSize: 16,
        color: '#000',
        marginLeft: 15,
        fontWeight: '500',
    },
    otherReasonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 8,
    },
    reportInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    reportSubmitBtn: {
        backgroundColor: '#0088CC', // Blue Color
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    reportSubmitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // SUCCESS CARD STYLES
    successCard: {
        width: '85%',
        maxWidth: 320,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        position: 'relative',
    },
    closeButtonRoundAbsolute: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
    // EXIT MODAL STYLES
    exitModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        width: '80%',
        maxWidth: 320,
        alignItems: 'center',
    },
    exitModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    exitModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    exitModalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    exitModalBtnYes: {
        backgroundColor: '#e44',
    },
    exitModalBtnNo: {
        backgroundColor: '#ccc',
    },
    exitModalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // SHARE MODAL STYLES
    shareOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    shareContainerSmall: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    sharePill: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15,
    },
    shareTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    shareGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    shareGridItem: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 20,
    },
    shareIconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    shareItemLabel: {
        fontSize: 10,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    // HUD STYLES
    topHud: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 110, // Increased
        zIndex: 50000, // Very high
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingTop: Platform.OS === 'ios' ? 45 : 15,
        overflow: 'visible',
    },
    topHudContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        overflow: 'visible',
        zIndex: 500,
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
        overflow: 'visible',
    },
    categoryItemWrapper: {
        alignItems: 'center',
        zIndex: 100,
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
        zIndex: 9000,
        backgroundColor: 'rgba(51, 51, 51, 0.95)',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        justifyContent: 'center',
        overflow: 'visible',
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
        zIndex: 100,
    },
    hudActionLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    unreadDot: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ff0000', // Solid bright red
        borderWidth: 1.5,
        borderColor: '#fff', // White border to make it pop
    },
    unreadBadge: {
        position: 'absolute',
        top: -10,
        right: -10, // Top Right as per image
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
    unreadHintPopup: {
        position: 'absolute',
        bottom: 70, // Slightly higher
        backgroundColor: '#0F5B8B',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        width: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        left: -40, // Shifted right to avoid clipping on left edge
        zIndex: 10000,
    },
    unreadHintText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 20,
    },
    unreadHintArrow: {
        position: 'absolute',
        bottom: -8,
        left: 50, // Adjusted to point at icon center after box shift
        marginLeft: -8,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderLeftColor: 'transparent',
        borderRightWidth: 8,
        borderRightColor: 'transparent',
        borderTopWidth: 8,
        borderTopColor: '#0F5B8B',
    },
    trendingHintPopup: {
        position: 'absolute',
        top: 55, // Adjusted to be clearly visible below tab
        minHeight: 55,
        backgroundColor: '#0F5B8B',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 20,
        width: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 20,
        left: -10,
        zIndex: 99999,
    },
    trendingHintArrow: {
        position: 'absolute',
        top: -8,
        left: 30, // Pointing to the left-aligned text
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderLeftColor: 'transparent',
        borderRightWidth: 8,
        borderRightColor: 'transparent',
        borderBottomWidth: 8,
        borderBottomColor: '#0F5B8B',
    },
    countPopupOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: LAYOUT.windowHeight,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    countPopupContainer: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    countPopupText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // CATEGORIES MODAL STYLES (Simple Text List)
    categoriesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    categoriesHeaderTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    categoriesBackText: {
        fontSize: 18,
        color: '#1a73e8',
        fontWeight: '600',
    },
    categoryLeafList: {
        paddingTop: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    categoryLeafItem: {
        width: '100%',
        height: 70,
        borderRadius: 15,
        borderTopRightRadius: 50,
        borderBottomLeftRadius: 50,
        marginBottom: 15,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        backgroundColor: '#fff',
    },
    categoryLeafImage: {
        width: '100%',
        height: '100%',
        opacity: 0.12, // Very light, only showing graphics/scenery hints
    },
    categoryLeafBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
    },
    categoryLeafOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)', // Extra layering to hide background text
    },
    categoryLeafContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        zIndex: 2,
    },
    categoryLeafText: {
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
    },
    categoryMainText: {
        fontSize: 30,
        color: '#ff0000',
        fontWeight: '900',
        textShadowColor: '#fff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'left',
        marginLeft: 10,
    },
    categoryLocalText: {
        fontSize: 30,
        color: '#000',
        fontWeight: '900',
        textShadowColor: '#fff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'left',
        marginLeft: 10,
    },
    categoryWishesText: {
        fontSize: 30,
        color: '#e91e63', // Pink/Magenta as in reference
        fontWeight: '900',
        textShadowColor: '#fff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'center',
    },
    categoryTrendingText: {
        fontSize: 28, // Prevent wrapping
        color: '#fff',
        fontWeight: '900',
        textShadowColor: '#ff0000',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'left',
        marginLeft: 90, // Increased to clear the shifted logo
    },
    categoryWhatsappText: {
        fontSize: 28, // Adjusted for icon space
        color: '#fff',
        fontWeight: '900',
        textShadowColor: '#2E7D32',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        textAlign: 'left',
        marginLeft: 5,
    },
    categoryBhaktiText: {
        fontSize: 30,
        color: '#940000', // Maroon/Deep red
        fontWeight: '900',
        textShadowColor: '#fff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'center',
    },
    categoryCinemaText: {
        fontSize: 30,
        color: '#fff',
        fontWeight: '900',
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'right',
        marginRight: 10,
    },
    categorySportsText: {
        fontSize: 30,
        color: '#fff',
        fontWeight: '900',
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'right',
        marginRight: 15,
    },
    categoryLifestyleText: {
        fontSize: 30,
        fontWeight: '900',
        textShadowColor: '#fff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'center',
    },
    hotBadge: {
        position: 'absolute',
        left: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f00',
        transform: [{ rotate: '-10deg' }],
    },
    hotText: {
        color: '#f00',
        fontSize: 14,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    // TUTORIAL HINT STYLES
    swipeHintBottom: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        backgroundColor: '#0F5B8B',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },

    swipeHintTop: {
        position: 'absolute',
        top: 180,
        alignSelf: 'center',
        backgroundColor: '#0F5B8B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        zIndex: 3000,
        elevation: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    swipeHintBlueButton: {
        position: 'absolute',
        top: 250, // Adjusted to be visible on the image roughly where user indicated or typical central/top area
        alignSelf: 'center',
        backgroundColor: '#0F5B8B', // Blue color as requested/persisted
        paddingVertical: 12,
        paddingHorizontal: 25, // Button-like padding
        borderRadius: 25, // Pill shape
        zIndex: 3000,
        elevation: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tapHintCenter: {
        position: 'absolute',
        top: '40%',
        alignSelf: 'center',
        backgroundColor: '#0F5B8B',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 25,
        zIndex: 3000,
        elevation: 100,
        alignItems: 'center',
    },
    tapHintText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    swipeHintText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    menuBadgeDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff0000',
        borderWidth: 2,
        borderColor: '#fff',
    },
    // NEW MENU STYLES
    customMenuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 5,
        paddingTop: 5,
        backgroundColor: '#fff',
    },
    menuIconBtn: {
        padding: 5,
    },
    menuLogo: {
        width: 60,
        height: 60,
    },
    menuNewsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuNewsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 4,
    },
    newMenuList: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 15,
    },
    guestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E6E6E6',
        marginTop: 8,
        marginBottom: 8,
    },
    guestIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    guestTextLogin: {
        fontSize: 16,
        color: '#4A90E2',
        fontWeight: '500',
    },
    gridRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    gridItemState: {
        flex: 1,
        backgroundColor: '#F5F6F7',
        borderRadius: 15,
        padding: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    stateMapIcon: {
        width: 30,
        height: 30,
        marginRight: 6,
    },
    stateTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    stateSubText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#555',
        marginTop: 1,
    },
    gridItemSimple: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E6E6E6',
        justifyContent: 'center',
    },
    gridTitleNational: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        textAlign: 'center',
    },
    gridSubCenter: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginTop: 3,
    },
    gridSubTeluguFact: {
        fontSize: 11,
        color: '#444',
        marginTop: 2,
        fontWeight: '500',
    },
    bigCard: {
        flex: 1,
        borderRadius: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E6E6E6',
        height: 85,
        justifyContent: 'center',
    },
    imagePreviewContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuPreviewImage: {
        width: '90%',
        height: '80%',
    },
    closeImageBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    magazineIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    pollGroupIcon: {
        alignItems: 'center',
        marginBottom: 5,
    },
    bigCardTextLarge: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A237E',
        lineHeight: 20,
    },
    bigCardTextLargeCenter: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        textAlign: 'center',
    },
    menuListContainerFlat: {
        marginTop: 5,
    },
    menuListItemFlat: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E6E6E6',
        marginBottom: 10,
    },
    menuListLeftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuListLabel: {
        fontSize: 13,
        color: '#000',
        fontWeight: '500',
    },
    menuListLocationBlue: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: 'bold',
        marginTop: 1,
    },
    menuListTitleSimpleBlack: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    gridTitleMain: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    // LOCATION SELECTOR STYLES
    locHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    locHeaderRef: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        backgroundColor: '#fff',
    },
    locHeaderLeftText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        width: 120,
    },
    locHeaderCenter: {
        flex: 1,
        alignItems: 'center',
    },
    locHeaderLogo: {
        width: 60,
        height: 40,
    },
    locHeaderRight: {
        width: 120,
        alignItems: 'flex-end',
    },
    locRefInstruction: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'left',
    },
    locRefSearchContainer: {
        width: '100%',
    },
    locRefSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 30,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 10,
    },
    locRefInput: {
        flex: 1,
        fontSize: 15,
        color: '#000',
        paddingHorizontal: 10,
    },
    locRefSearchBoxEmpty: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 30,
        height: 50,
        opacity: 0.5,
    },
    locListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    locListLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locListIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EBF3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    locListItemText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    locHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    locSearchCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 25,
    },
    locSearchPrompt: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        lineHeight: 20,
    },
    locSearchInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 12,
    },
    locInputChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    locInputText: {
        fontSize: 14,
        color: '#000',
    },
    locSearchSub: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    locPermTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        lineHeight: 22,
    },
    locPermBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 1,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    locPermIconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#1a73e8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    locPermBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    locFavHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    locFavTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 10,
    },
    locHistoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 12,
        elevation: 1,
    },
    locHistoryIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    locHistoryText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    // LOGIN MODAL STYLES
    loginCard: {
        width: '85%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    loginIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    loginSub: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    loginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 30,
        marginBottom: 15,
        elevation: 1,
    },
    loginBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
    loginSocialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
        width: '100%',
    },
    socialIconBtn: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    loginFooter: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
    // LOCAL NEWS LOCATION SELECTOR STYLES
    localNewsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    localNewsHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        textAlign: 'center',
    },
    localNewsPrompt: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    localNewsSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6F7',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    localNewsSearchInput: {
        flex: 1,
        fontSize: 15,
        color: '#000',
    },
    localNewsLocationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    localNewsLocationIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    localNewsLocationText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    profileAvatarImg: {
        width: '100%',
        height: '100%',
    },
    // ⭐ RATING MODAL STYLES
    ratingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        zIndex: 200000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    ratingLogo: {
        width: 140,
        height: 140,
        marginBottom: 50,
    },
    ratingQuestion: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    ratingDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 60,
        lineHeight: 24,
        paddingHorizontal: 15,
    },
    rateButton: {
        backgroundColor: '#007AFF',
        width: '85%',
        paddingVertical: 18,
        borderRadius: 35,
        alignItems: 'center',
        marginBottom: 35,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    rateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    notNowButton: {
        padding: 15,
    },
    notNowText: {
        color: '#999',
        fontSize: 16,
        fontWeight: '500',
    },
    skipText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    // 🙏 THANK YOU PAGE STYLES
    thankYouContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#B0B0B0', // Grey background to match prompt image
        paddingHorizontal: 30,
    },
    prayingHandsIcon: {
        width: 120,
        height: 120,
        marginBottom: 25,
    },
    thankYouTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    thankYouMessage: {
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
        lineHeight: 26,
    },
    skipContainerBottom: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    // 📚 DIGITAL MAGAZINES STYLES
    magHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 30,
        marginHorizontal: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    magBackRoundBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
    },
    magHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    magListContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    magCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        gap: 15,
    },
    magCardImage: {
        width: 130,
        height: 130,
        borderRadius: 8,
    },
    magCardInfo: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 5,
    },
    magBadge: {
        backgroundColor: '#00A86B',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    magBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    magCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    magCardDate: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    magBlueBtn: {
        backgroundColor: '#1E90FF',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    magBlueBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // 🚩 REPORT SHEET STYLES
    reportSheetContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 40,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    reportSheetPill: {
        width: 40,
        height: 5,
        backgroundColor: '#eee',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    reportSheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 25,
        textAlign: 'center',
    },
    reportActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    reportIconBox: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    reportActionTextContent: {
        flex: 1,
    },
    reportActionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    reportActionSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    reportCancelBtn: {
        marginTop: 25,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
    },
    reportCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },

    // ⚠️ SENSITIVE CONTENT STYLES
    sensitiveContainer: {
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    sensitiveContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sensitiveText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    sensitiveTapBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    sensitiveTapText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    // 🌍 NEW LANGUAGE UI STYLES
    langCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderBottomWidth: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    langCardGrid: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderBottomWidth: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    langIconBox: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        position: 'relative',
    },
    langIconBoxSmall: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        position: 'relative',
    },
    langLetter: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    langLetterSmall: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    langTextBox: {
        flex: 1,
    },
    langLocalName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    langEnglishName: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    langLocalNameSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    langEnglishNameSmall: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    dot: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    // 📜 TERMS AND CONDITIONS STYLES (MATCHING REFERENCE)
    termsHeader: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#333',
    },
    termsBackBtn: {
        padding: 5,
        marginRight: 10,
    },
    termsHeaderText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    termsBanner: {
        height: 140,
        backgroundColor: '#333',
        justifyContent: 'center',
        paddingHorizontal: 25,
        borderBottomWidth: 0,
    },
    termsBannerTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    termsContentCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        marginTop: -35,
        paddingHorizontal: 25,
        paddingTop: 35,
    },
    termsCardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    termsYellowDivider: {
        width: 45,
        height: 4,
        backgroundColor: '#FFD700',
        marginBottom: 30,
    },
    termsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    termsYellowPill: {
        width: 6,
        height: 24,
        backgroundColor: '#FFD700',
        borderRadius: 3,
        marginRight: 12,
    },
    termsSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    termsLegalText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#444',
        textAlign: 'justify',
    },
    termsCopyright: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
        fontWeight: '500',
    },

    // 📖 MAGAZINE VIEWER STYLES
    magViewerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 60000,
    },
    magViewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        zIndex: 100,
    },
    magHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    magHeaderTitleTe: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    magHeaderPageInfo: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    magViewerLogo: {
        width: 45,
        height: 45,
    },
    magViewerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },

    magPageImage: {
        width: WINDOW_WIDTH,
        height: '100%',
    },
    magInteractionBar: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#000',
    },
    magInteractionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 25,
    },
    magInteractionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    magInteractionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    magBottomIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    magBottomPageNum: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.6,
    },
    magSwipeHintContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        zIndex: 50,
    },
    magSwipeHintPill: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    magSwipeHintText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    magViewerCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    magNavOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    magNavBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    // 🔌 OFFLINE MODE STYLES
    offlineContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    offlineHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 20,
        zIndex: 10,
    },
    offlineReloadBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    offlinePopupContainer: {
        position: 'absolute',
        top: 25,
        right: 70,
        alignItems: 'flex-end',
    },
    offlinePopup: {
        backgroundColor: '#004d40', // Dark teal/green as in design
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: -1, // Overlap slightly with arrow
    },
    offlinePopupText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    offlinePopupArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 0,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#004d40',
        marginRight: 10, // Align with the button center
    },
    offlineContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: -50, // Move up slightly to account for visual balance
    },
    offlineImage: {
        width: 250,
        height: 250,
        marginBottom: 30,
    },
    offlineText: {
        fontSize: 22,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 32,
    },
});



