import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    Dimensions,
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

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 0;
// const CARD_HEIGHT = LAYOUT.windowHeight; // Will define inside component for safe area

const API_URL = 'http://192.168.29.70:3000/api';

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
        image: require('../assets/images/res_high.png'),
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

    // 🏮 WISHES & FESTIVAL CARDS
    {
        id: 'wish-1',
        title: 'సంక్రాంతి శుభాకాంక్షలు: పండుగ సందడి',
        description: 'ముంగిట ముగ్గులు, గొబ్బెమ్మలు మరియు కోడి పందేలతో పల్లెల్లో పండుగ వాతావరణం నెలకొంది.',
        image: require('../assets/images/res_vivekanandha_2.jpg'),
        tags: ['wishes', 'whatsapp'],
        isFullCard: true
    },
    {
        id: 'wish-2',
        title: 'హ్యాపీ బర్త్‌డే: విషెస్ కార్డ్స్',
        description: 'మీ స్నేహితులకు మరియు కుటుంబ సభ్యులకు ఈ ప్రత్యేకమైన విషెస్ మెసేజ్‌లను పంపండి.',
        image: require('../assets/images/res_whatsapp.jpg'),
        tags: ['wishes', 'whatsapp', 'trending'],
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
        tags: ['videos', 'trending'],
        isVideo: true
    },
    {
        id: 'video-1',
        title: 'సాంకేతిక విప్లవం: వీడియో రిపోర్ట్',
        description: 'రాబోయే కాలంలో ఏయే గ్యాడ్జెట్స్ మన జీవితాలను శాసించబోతున్నాయో చూడండి.',
        image: require('../assets/images/res_8k_news_top_bar_video_1.png'),
        tags: ['videos', 'trending'],
        isVideo: true
    },
    {
        id: 'video-new-2',
        title: 'తాజా వీడియో వార్తలు',
        description: 'రండి చూడండి! ఈ రోజు సోషల్ మీడియాలో వైరల్ అవుతున్న ఆసక్తికరమైన వీడియో.',
        image: require('../assets/images/res_picture11.png'),
        tags: ['videos', 'trending'],
        isVideo: true
    },
    // 🏮 WISHES & FESTIVAL CARDS (FULL CARDS)
    {
        id: 'full-card-1',
        title: 'Full Card 1',
        description: 'Displaying full card image 1',
        image: require('../assets/images/res_20_photos_1.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-2',
        title: 'Full Card 2',
        description: 'Displaying full card image 2',
        image: require('../assets/images/res_22_photos_3.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-3',
        title: 'Full Card 3',
        description: 'Displaying full card image 3',
        image: require('../assets/images/res_23_photos_4.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-4',
        title: 'Full Card 4',
        description: 'Displaying full card image 4',
        image: require('../assets/images/res_23_ad_page.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-5',
        title: 'Full Card 5',
        description: 'Displaying full card image 5',
        image: require('../assets/images/res_24_photos_5.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-6',
        title: 'Full Card 6',
        description: 'Displaying full card image 6',
        image: require('../assets/images/res_25_category_complete_2.png'),
        tags: ['wishes'],
        isFullCard: true
    },

    {
        id: 'full-card-8',
        title: 'Full Card 8',
        description: 'Displaying full card image 8',
        image: require('../assets/images/res_25_category_complete_4.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-9',
        title: 'Full Card 9',
        description: 'Displaying full card image 9',
        image: require('../assets/images/res_25_category_complete_5.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-10',
        title: 'Full Card 10',
        description: 'Displaying full card image 10',
        image: require('../assets/images/res_25_category_complete_6.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-11',
        title: 'Full Card 11',
        description: 'Displaying full card image 11',
        image: require('../assets/images/res_25_category_complete_7.png'),
        tags: ['wishes'],
        isFullCard: true
    },
    {
        id: 'full-card-12',
        title: 'Full Card 12',
        description: 'Displaying full card image 12',
        image: require('../assets/images/res_25_category_complete_8.png'),
        tags: ['wishes'],
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
        image: require('../assets/images/res_whatsapp.png'), // Fixed missing image
        tags: ['whatsapp'],
        isVideo: true,
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
        tags: ['videos', 'trending'],
        isVideo: true
    },
    {
        id: 'photo-new-1',
        title: 'ప్రకృతి అందాలు: అరకు లోయ',
        description: 'విశాఖ మన్యంలో పర్యాటకులను కట్టిపడేస్తున్న ప్రకృతి రమణీయ దృశ్యాలు. తప్పక చూడాల్సిన ప్రదేశం.',
        image: require('../assets/images/res_picture3.png'),
        tags: ['photos', 'trending', 'lifestyle'],
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

export default function NewsFeedScreen() {
    const insets = useSafeAreaInsets();
    // 📐 Precise height calculation - matching physical screen for one-page fit
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

                        // 🛠️ FORCE FIX: Ensure specific Main News items are NEVER Full Card (Yellow Card Fix)
                        const categorySlug = item.category?.slug || '';
                        if (categorySlug === 'main' || categorySlug === 'national' ||
                            item.tags?.includes('main') || item.tags?.includes('national') ||
                            item.title?.includes('జర్మన్') || item.title?.includes('IPL') ||
                            item.title?.includes('ఐపీల్') || item.title?.includes('ఐపీఎల్') ||
                            item.title?.includes('ప్రధాని మోదీ')) {
                            isFullCard = false;
                        }

                        // 🖼️ Image Selection Logic
                        let finalImage = localMatch ? localMatch.image : (mediaUrl || DEFAULT_NEWS_DATA[0].image);

                        // ⚾ IPL 2026 Image Fix (Broaden match and ensure correct asset)
                        if (item.title?.toLowerCase().includes('ipl') ||
                            item.title?.includes('ఐపీఎల్ 2026') ||
                            item.title?.includes('ఐపీల్ 2026')) {
                            finalImage = require('../assets/images/gettyimages-2218439512-612x612.jpg');
                        }

                        return {
                            ...item,
                            id: item._id, // Use MongoDB _id as id
                            likeCount: item.like_count || 0, // Map API like_count to app likeCount

                            // Image: Prioritize Local Asset -> Media URL -> Default
                            image: finalImage,

                            tags: item.tags || [item.category?.slug, 'trending', 'main'],

                            isFullCard,
                            isVideo,
                            video: item.video || localMatch?.video
                        };
                    });
                    setNewsData(mappedData);
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
    const [isDigitalMagazineVisible, setIsDigitalMagazineVisible] = useState(false);
    const [localNewsSearchQuery, setLocalNewsSearchQuery] = useState('');
    const [selectedLocalLocation, setSelectedLocalLocation] = useState('');

    // 💡 SWIPE HINT STATE
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [hasTriggeredSwipeHint, setHasTriggeredSwipeHint] = useState(false);

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
        }, 9000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [isTutorialMode]);

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
            } catch (error) {
                console.error('Error checking status:', error);
            }
        };
        checkStatus();
    }, []);

    const [isMuted, setIsMuted] = useState(true);
    const toggleMute = () => setIsMuted(prev => !prev);

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
    const [currentNewsTitle, setCurrentNewsTitle] = useState('');
    const [isViewingVideoComments, setIsViewingVideoComments] = useState(false);

    type Reply = {
        id: string;
        text: string;
        user: string;
        timestamp: number;
        isMe: boolean;
        likedByMe: boolean;
        likeCount: number;
        parentCommentId: string;
    };

    type Comment = {
        id: string;
        text: string;
        user: string;
        location?: string;
        timestamp: number;
        isMe: boolean;
        likedByMe: boolean;
        likeCount: number;
        replies: Reply[];
        isSensitive?: boolean;
        showReplies?: boolean;
    };

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ commentId: string, replyId?: string } | null>(null);
    const [replyTarget, setReplyTarget] = useState<{ commentId: string, userName: string } | null>(null);

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

    // 🔖 SAVED STORIES STATE
    const [savedIds, setSavedIds] = useState<string[]>([]);

    // 🛠️ MENU FUNCTIONALITY STATE
    const [activeMenuModal, setActiveMenuModal] = useState<'profile' | 'saved' | 'lang' | 'feedback' | 'report' | 'settings' | null>(null);
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
    const [unreadCount, setUnreadCount] = useState(12); // Example count
    const [showCountPopup, setShowCountPopup] = useState(false);
    const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);

    const CATEGORY_TABS = [
        { id: 'main', title: 'మెయిన్ న్యూస్', bg: require('../assets/images/res_20_main_news.png'), accent: '#0083B0', titleColor: '#d93025' },
        { id: 'local', title: 'లోకల్ న్యూస్', bg: require('../assets/images/res_21_local_news.png'), accent: '#2C3E50', titleColor: '#000' },
        { id: 'wishes', title: 'విషెస్', bg: require('../assets/images/res_21_local_news.png'), accent: '#D32F2F', titleColor: '#E91E63' },
        { id: 'trending', title: 'ట్రెండింగ్ న్యూస్', bg: require('../assets/images/res_20_main_news.png'), accent: '#FF8F00', titleColor: '#fff' },
        { id: 'whatsapp', title: 'వాట్సాప్ స్టేటస్', bg: require('../assets/images/res_25_telangana_news.png'), accent: '#2E7D32', titleColor: '#2E7D32' },
        { id: 'bhakti', title: 'భక్తి', bg: require('../assets/images/res_20_main_news.png'), accent: '#FBC02D', titleColor: '#6A1B9A' },
        { id: 'affairs', title: 'కరెంటు అఫైర్స్', bg: require('../assets/images/res_26_india_news_1.png'), accent: '#1976D2', titleColor: '#1565C0' },
        { id: 'lifestyle', title: 'లైఫ్          స్టైల్', bg: require('../assets/images/res_20_main_news.png'), accent: '#C2185B', titleColor: '#C62828' },
        { id: 'agriculture', title: 'వ్యవసాయం', bg: require('../assets/images/res_24_andhrapradesh_news.png'), accent: '#388E3C', titleColor: '#fff' },
        { id: 'cinema', title: 'సినిమా', bg: require('../assets/images/res_20_main_news.png'), accent: '#0097A7', titleColor: '#FFf' },
        { id: 'sports', title: 'క్రీడలు', bg: require('../assets/images/res_26_india_news.png'), accent: '#E64A19', titleColor: '#fff' },
    ];

    // 📍 LOCATION & CATEGORY LOGIC
    const [userLocation, setUserLocation] = useState<string>('హైదరాబాద్');
    const [activeCategory, setActiveCategory] = useState<string>('trending');
    const [filteredNews, setFilteredNews] = useState<any[]>([]);
    const [readNewsIds, setReadNewsIds] = useState<string[]>([]);
    const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'location'>('all');

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

    // Update unread count dynamically
    useEffect(() => {
        const totalNews = newsData.length;
        const readCount = readNewsIds.length;
        setUnreadCount(totalNews - readCount);
    }, [readNewsIds]);

    // (Rating prompt logic moved to filteredNews useEffect)

    // Back Button Handler
    useEffect(() => {
        const backAction = () => {
            setIsExitModalVisible(true);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    // 🛠️ STABILITY FIX: Memoize the base structure (Stories + Random Fillers)
    // This ensures scrolling (which updates readNewsIds) does NOT re-shuffle the list, causing shaking.
    const stableMixedNews = React.useMemo(() => {
        let baseList = [];
        if (activeCategory === 'local') {
            baseList = newsData.filter(item => item.tags?.includes(userLocation));
        } else {
            baseList = newsData.filter(item => item.tags?.includes(activeCategory));
        }

        const stories = baseList.filter(item =>
            !item.id.startsWith('full-card-') &&
            !item.id.startsWith('full-ad-') &&
            !item.id.startsWith('full-comp-')
        );

        const closers = baseList.filter(item => item.id.startsWith('full-comp-'));

        const fillerPool = newsData.filter(item =>
            item.id.startsWith('full-card-') ||
            item.id.startsWith('full-ad-')
        );

        // Shuffle once per category/data change
        const shuffledFillers = [...fillerPool].sort(() => 0.5 - Math.random());

        let merged = [];
        let fillerIdx = 0;
        let nextInsertionIndex = Math.floor(Math.random() * 3) + 3;

        stories.forEach((story, index) => {
            merged.push(story);
            if (index === nextInsertionIndex && fillerIdx < shuffledFillers.length) {
                merged.push(shuffledFillers[fillerIdx]);
                fillerIdx++;
                nextInsertionIndex = index + Math.floor(Math.random() * 4) + 3;
            }
        });

        // Append closers/fallback
        if (activeCategory !== 'trending') {
            merged.push({ id: 'end-card', type: 'end' });
        } else {
            if (closers.length > 0) merged.push(...closers);
            else merged.push({ id: 'end-card', type: 'end' });
        }

        // Fallback for empty
        if (merged.length === 0) {
            merged = newsData.filter(item => item.tags?.includes('trending'));
        }

        return merged;
    }, [activeCategory, userLocation, newsData]);

    // Optimization: Only listen to readNewsIds when in 'unread' filter mode to prevent list regeneration on scroll
    const effectiveReadIds = filterMode === 'unread' ? readNewsIds : null;

    // Final Filter & Rating Injection Effect
    useEffect(() => {
        let final = [...stableMixedNews];

        // 1. Filter (Unread/Location Modes)
        if (filterMode === 'unread') {
            // Show only unread regular news items (exclude ALL videos and full cards)
            final = final.filter(item =>
                !readNewsIds.includes(item.id) &&
                !item.isVideo &&
                !item.video && // Double check for video URL presence
                !item.isFullCard &&
                !item.tags?.includes('videos') &&
                !item.tags?.includes('whatsapp') && // Whatsapp often has videos
                !item.id.toLowerCase().includes('video') &&
                !item.id.startsWith('full-') &&
                item.type !== 'rating' // Safety
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
        // Toggle location filter
        if (filterMode === 'location') {
            setFilterMode('all');
        } else {
            setFilterMode('location');
        }
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


    const handleOptionsOpen = () => {
        setReportStep('menu');
        setIsOptionsVisible(true);
    };

    const handleOptionsClose = () => {
        setIsOptionsVisible(false);
        setReportStep('menu');
        setSelectedReason('');
        setReportReasonText('');
    };

    const handleReportSubmit = () => {
        setReportStep('success');
    };

    const handleOpenShare = (id: string) => {
        setSelectedShareId(id);
        setShareModalVisible(true);
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

            // Mark current news as read
            const currentIndex = Math.round(event.contentOffset.y / CARD_HEIGHT);
            const currentItem = filteredNews[currentIndex];
            if (currentItem && currentItem.id) {
                runOnJS(setReadNewsIds)((prev: string[]) => {
                    if (!prev.includes(currentItem.id)) {
                        return [...prev, currentItem.id];
                    }
                    return prev;
                });
            }
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
        const newsItem = newsData.find(item => item.id === id);
        if (newsItem) {
            setCurrentNewsTitle(newsItem.title);
            setIsViewingVideoComments(!!newsItem.isVideo);

            // Updated Sample Data to match the requested Video/Facebook style
            setComments([
                {
                    id: 'c1',
                    user: 'C Y Subramanyam Reddy',
                    text: 'Movie name enti',
                    timestamp: Date.now() - 4 * 7 * 24 * 60 * 60 * 1000, // 4w ago
                    isMe: false,
                    likedByMe: true,
                    likeCount: 4,
                    replies: [
                        {
                            id: 'r1',
                            user: 'B Govardhan',
                            text: 'Tiger 3',
                            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
                            isMe: false,
                            likedByMe: false,
                            likeCount: 2,
                            parentCommentId: 'c1'
                        }
                    ],
                    showReplies: false
                },
                {
                    id: 'c2',
                    user: 'Devendar Yerri',
                    text: '..',
                    timestamp: Date.now() - 5 * 7 * 24 * 60 * 60 * 1000, // 5w ago
                    isMe: false,
                    likedByMe: false,
                    likeCount: 4,
                    replies: []
                },
                {
                    id: 'c3',
                    user: 'Kolanti Anilkumar Anilkumar',
                    text: 'Movie name enti',
                    timestamp: Date.now() - 1 * 7 * 24 * 60 * 60 * 1000, // 1w ago
                    isMe: false,
                    likedByMe: false,
                    likeCount: 1,
                    replies: []
                }
            ]);

            setCommentModalVisible(true);
            commentRevealVal.value = withTiming(1, {
                duration: 600,
                easing: Easing.inOut(Easing.ease)
            });
        }
    };

    const closeComments = () => {
        commentRevealVal.value = withTiming(0, {
            duration: 500,
            easing: Easing.inOut(Easing.ease)
        }, (finished) => {
            if (finished) {
                runOnJS(setCommentModalVisible)(false);
            }
        });
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const isMe = true;
            const finalUser = (userName !== 'Guest User') ? userName : 'You';

            if (replyTarget) {
                // Add as reply
                setComments(prev => prev.map(c => {
                    if (c.id === replyTarget.commentId) {
                        const newReply: Reply = {
                            id: Date.now().toString(),
                            text: newComment,
                            user: finalUser,
                            timestamp: Date.now(),
                            isMe: true,
                            likedByMe: false,
                            likeCount: 0,
                            parentCommentId: c.id
                        };
                        return { ...c, replies: [...c.replies, newReply], showReplies: true };
                    }
                    return c;
                }));
                setReplyTarget(null);
            } else {
                // Add as main comment
                const comment: Comment = {
                    id: Date.now().toString(),
                    text: newComment,
                    user: finalUser,
                    location: 'Ranga Reddy (D)',
                    timestamp: Date.now(),
                    isMe: true,
                    likedByMe: false,
                    likeCount: 0,
                    replies: [],
                };
                setComments([comment, ...comments]);
            }
            setNewComment('');
        }
    };

    const handleLikeComment = (commentId: string, replyId?: string) => {
        setComments(prev => prev.map(c => {
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
        }));
    };

    const handleDeleteAction = (commentId: string, replyId?: string) => {
        setDeleteTarget({ commentId, replyId });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const { commentId, replyId } = deleteTarget;
        if (replyId) {
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    return { ...c, replies: c.replies.filter(r => r.id !== replyId) };
                }
                return c;
            }));
        } else {
            setComments(prev => prev.filter(c => c.id !== commentId));
        }
        setDeleteTarget(null);
    };

    const handleCopyComment = (text: string) => {
        alert('కామెంట్ కాపీ చేయబడింది');
    };

    const handleReportComment = (commentId: string, replyId?: string) => {
        alert('రిపోర్ట్ సమర్పించబడింది');
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

    const handleToggleSave = (id: string) => {
        setSavedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
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

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
                hidden={isLocalNewsLocationVisible || isLocationSelectorVisible || isCategoriesVisible || isMenuOpen}
            />


            <Animated.FlatList
                ref={flatListRef}
                data={filteredNews}
                extraData={showSwipeHint} // ✅ Force re-render when hint toggles
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
                    <View style={{ flex: 1, height: LAYOUT.windowHeight, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                        <Text style={{ color: '#fff' }}>వార్తలు లోడ్ అవుతున్నాయి...</Text>
                    </View>
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
                            <View style={{ width: LAYOUT.windowWidth, height: LAYOUT.windowHeight, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
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
                                        <Text style={styles.ratingQuestion}>8K న్యూస్ ఆస్వాదిస్తున్నారా?</Text>
                                        <Text style={styles.ratingDescription}>
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
                        />
                    );
                }}
            />





            {/* 🚪 EXIT CONFIRMATION MODAL */}
            {isExitModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.exitModalContainer}>
                        <Text style={styles.exitModalTitle}>మీరు ఖచ్చితంగా బయటకు వెళ్దాం అనుకుంటున్నారా?</Text>
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
                {isHUDVisible && !isCategoriesVisible && !isMenuOpen && !isLocationSelectorVisible && !isLocalNewsLocationVisible && !activeMenuModal && !commentModalVisible && !isShareModalVisible && !isOptionsVisible && !isLoginModalVisible && !isExitModalVisible && (
                    <View style={styles.topHud}>
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
                    </View>
                )}

                {/* ⏬ BOTTOM HUD BAR */}
                {isHUDVisible && !isCategoriesVisible && !isMenuOpen && !isLocationSelectorVisible && !isLocalNewsLocationVisible && !activeMenuModal && !commentModalVisible && !isShareModalVisible && !isOptionsVisible && !isLoginModalVisible && !isExitModalVisible && (
                    <View style={styles.bottomHud}>
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

                                    // Reload Action: Scroll to top
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
                        </View>

                        {/* Temporary Count Popup for 1s */}
                        {showCountPopup && (
                            <View style={styles.countPopupOverlay}>
                                <View style={styles.countPopupContainer}>
                                    <Text style={styles.countPopupText}>దీని మీద క్లిక్ చేస్తే కొత్త వార్తలను చూడవచ్చును</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )
                }

                {/* 📂 CATEGORIES MODAL (Grid Layout) */}
                {
                    isCategoriesVisible && (
                        <View style={[styles.modalOverlay, { backgroundColor: '#fff', justifyContent: 'flex-start' }]}>
                            <SafeAreaView style={styles.fullSpace}>
                                <View style={styles.categoriesHeader}>
                                    <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                                        setIsCategoriesVisible(false);
                                        setIsHUDVisible(true); // Force HUD open to show Reload hint
                                    }}>
                                        <Ionicons name="close" size={28} color="#000" />
                                    </TouchableOpacity>
                                    <Text style={styles.categoriesHeaderTitle}>కేటగిరీలు</Text>
                                    <View style={{ width: 48 }} />
                                </View>

                                <ScrollView contentContainerStyle={styles.categoryLeafList} showsVerticalScrollIndicator={false}>
                                    {CATEGORY_TABS.map((cat) => (
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
                                                    <View style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden' }}>
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

                {/* 🌍 LOCAL NEWS LOCATION SELECTOR */}
                {
                    isLocalNewsLocationVisible && (
                        <View style={[styles.fullModalOverlay, { backgroundColor: '#fff' }]}>
                            <SafeAreaView style={styles.fullSpace}>
                                <View style={styles.locHeaderRef}>
                                    <Text style={styles.locHeaderLeftText}>Change location</Text>
                                    <View style={styles.locHeaderCenter}>
                                        <Image
                                            source={require('../assets/images/res_8k_logo_1.png')}
                                            style={styles.locHeaderLogo}
                                            contentFit="contain"
                                        />
                                    </View>
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
                                            const allLocations = [
                                                { telugu: 'హైదరాబాద్', english: 'hyderabad', id: 'hyd' },
                                                { telugu: 'కూకట్‌పల్లి', english: 'kukatpally', id: 'kukatpally' },
                                                { telugu: 'సికింద్రాబాద్', english: 'secunderabad', id: 'sec' },
                                                { telugu: 'శ్రీకాకుళం', english: 'srikakulam', id: 'sri' },
                                                { telugu: 'గుంటూరు', english: 'guntur', id: 'guntur' },
                                                { telugu: 'విజయవాడ', english: 'vijayawada', id: 'vij' },
                                                { telugu: 'విశాఖపట్నం', english: 'visakhapatnam', id: 'vizag' },
                                                { telugu: 'తిరుపతి', english: 'tirupati', id: 'tirupati' }
                                            ];

                                            const searchLower = localNewsSearchQuery.toLowerCase().trim();
                                            const filteredLocations = searchLower === ''
                                                ? allLocations
                                                : allLocations.filter(loc =>
                                                    loc.telugu.includes(localNewsSearchQuery) ||
                                                    loc.english.includes(searchLower)
                                                );

                                            return filteredLocations.map((loc, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={styles.locListItem}
                                                    onPress={() => {
                                                        setSelectedLocalLocation(loc.telugu);
                                                        setUserLocation(loc.telugu);
                                                        setActiveCategory('local');
                                                        setFilterMode('all');
                                                        setIsTutorialMode(false);
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

                {/* 📤 CUSTOM SHARE OVERLAY (Fits inside App Layout) */}
                {
                    isShareModalVisible && (
                        <View style={styles.modalOverlay}>
                            <Pressable style={styles.fullSpace} onPress={() => setShareModalVisible(false)}>
                                <View style={{ flex: 1 }} />
                                <Pressable style={styles.shareContainerSmall} onPress={(e) => e.stopPropagation()}>
                                    <View style={styles.sharePill} />
                                    <Text style={styles.shareTitleText}>Share</Text>

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
                                                <Text style={styles.shareItemLabel}>{item.name}</Text>
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
                            <Animated.View style={[styles.commentContainer, commentAnimationStyle]}>
                                {/* 1. Header: Back | Title | Toggle */}
                                <View style={styles.commentHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <TouchableOpacity onPress={closeComments} style={{ padding: 5, marginRight: 8 }}>
                                            <Ionicons name="arrow-back" size={24} color="#999" />
                                        </TouchableOpacity>
                                        <Text style={styles.commentHeaderTitle} numberOfLines={1}>{currentNewsTitle}</Text>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, color: '#666', marginBottom: -4 }}>కామెంట్స్</Text>
                                        <Switch
                                            value={true}
                                            onValueChange={() => { }}
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

                                    {comments.map((item, index) => {
                                        const commentNumber = comments.length - index;

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

                                                        <Text style={styles.videoCommentText}>{item.text}</Text>

                                                        <View style={styles.videoActionRow}>
                                                            <Text style={styles.videoActionText}>Reply</Text>

                                                            <View style={styles.videoLikeContainer}>
                                                                <View style={styles.videoLikeBadge}>
                                                                    <Ionicons name="thumbs-up" size={10} color="#fff" />
                                                                </View>
                                                                <Text style={styles.videoLikeCount}>{item.likeCount}</Text>
                                                            </View>

                                                            <View style={styles.videoReactionIcons}>
                                                                <Ionicons name="thumbs-up-outline" size={20} color="#65676b" />
                                                                <Ionicons name="thumbs-down-outline" size={20} color="#65676b" />
                                                            </View>
                                                        </View>

                                                        {item.replies.length > 0 && (
                                                            <TouchableOpacity onPress={() => { }}>
                                                                <Text style={styles.viewRepliesText}>
                                                                    <Ionicons name="return-down-forward" size={14} color="#65676b" /> View {item.replies.length} reply
                                                                </Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            );
                                        }

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
                                                            <Text style={styles.commentTextContent}>{item.text}</Text>
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
                                                                    <Ionicons name="alert-circle-outline" size={16} color="#aaa" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>

                                                        {/* REPLIES SECTION */}
                                                        {item.replies.length > 0 && (
                                                            <View style={styles.repliesContainer}>
                                                                {item.replies.map((reply) => (
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
                                                                                <Text style={styles.commentTextContent}>{reply.text}</Text>
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
                                            <TextInput
                                                style={styles.videoInput}
                                                placeholder="Write a comment..."
                                                placeholderTextColor="#65676b"
                                                value={newComment}
                                                onChangeText={setNewComment}
                                            />
                                        </View>
                                    ) : (
                                        <View style={styles.bottomInputContainer}>
                                            {/* Emoji Reaction Bar */}
                                            <View style={styles.reactionBar}>
                                                <Pressable style={styles.reactionEmoji}><Text style={{ fontSize: 20 }}>😂</Text></Pressable>
                                                <Pressable style={styles.reactionEmoji}><Text style={{ fontSize: 20 }}>❤️</Text></Pressable>
                                                <Pressable style={styles.reactionEmoji}><Text style={{ fontSize: 20 }}>😍</Text></Pressable>
                                                <Pressable style={styles.reactionEmoji}><Text style={{ fontSize: 20 }}>🤣</Text></Pressable>
                                                <Pressable style={styles.reactionEmoji}><Text style={{ fontSize: 20 }}>😆</Text></Pressable>
                                                <Ionicons name="chevron-forward" size={20} color="#999" />
                                            </View>

                                            <View style={styles.inputRow}>
                                                <View style={styles.inputLeftIcons}>
                                                    <View style={styles.giftIconBox}>
                                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>GIF</Text>
                                                    </View>
                                                    <Ionicons name="happy-outline" size={24} color="#666" style={{ marginLeft: 15 }} />
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
                                                        <Pressable style={styles.sendBtn} onPress={handleAddComment}>
                                                            <Ionicons name="send" size={20} color="#1a73e8" />
                                                        </Pressable>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </KeyboardAvoidingView>
                            </Animated.View>
                        </Animated.View>
                    )
                }

                {/* 🗑️ DELETE CONFIRMATION OVERLAY */}
                {
                    deleteTarget && (
                        <View style={[styles.modalOverlay, { zIndex: 1100, backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                            <View style={styles.deleteModalCard}>
                                <Ionicons name="trash" size={40} color="#e44" style={{ marginBottom: 15 }} />
                                <Text style={styles.deleteModalTitle}>కామెంట్‌ను తొలగించాలా?</Text>
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
                                <Pressable style={styles.optionsCard} onPress={(e) => e.stopPropagation()}>
                                    <Pressable style={styles.closeButton} onPress={handleOptionsClose}>
                                        <Ionicons name="close" size={20} color="#333" />
                                    </Pressable>

                                    <Pressable style={styles.optionsItem} onPress={() => setReportStep('form')}>
                                        <Ionicons name="alert-circle-outline" size={24} color="#333" />
                                        <View style={styles.optionTextContainer}>
                                            <Text style={styles.optionTitle}>Report Story</Text>
                                            <Text style={styles.optionSubtitle}>Help us improve better</Text>
                                        </View>
                                    </Pressable>

                                    <Pressable style={styles.optionsItem} onPress={() => { alert('Downloading...'); handleOptionsClose(); }}>
                                        <Ionicons name="download-outline" size={24} color="#333" />
                                        <View style={styles.optionTextContainer}>
                                            <Text style={styles.optionTitle}>Download</Text>
                                            <Text style={styles.optionSubtitle}>Save to Local Directory</Text>
                                        </View>
                                    </Pressable>

                                    <Pressable style={styles.optionsItem} onPress={() => { alert('Bookmarked'); handleOptionsClose(); }}>
                                        <Ionicons name="bookmark-outline" size={24} color="#333" />
                                        <View style={styles.optionTextContainer}>
                                            <Text style={styles.optionTitle}>Bookmark</Text>
                                            <Text style={styles.optionSubtitle}>Save to read offline</Text>
                                        </View>
                                    </Pressable>
                                    <View style={{ height: 4, width: 40, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginTop: 15 }} />
                                </Pressable>
                            )}

                            {/* 2. REPORT FORM */}
                            {reportStep === 'form' && (
                                <Pressable style={styles.reportCard} onPress={(e) => e.stopPropagation()}>
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
                                <Pressable style={styles.successCard} onPress={(e) => e.stopPropagation()}>
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
                            activeMenuModal === 'settings' && { backgroundColor: '#fff', padding: 0 }
                        ]}>
                            <Pressable style={styles.fullSpace} onPress={() => setActiveMenuModal(null)} />
                            <View style={[
                                styles.actionModalContainer,
                                activeMenuModal === 'settings' && styles.settingsFullModal
                            ]}>
                                <View style={styles.commentHeader}>
                                    {activeMenuModal === 'settings' ? (
                                        <>
                                            <Pressable onPress={() => setActiveMenuModal(null)} style={{ padding: 5, marginRight: 10 }}>
                                                <Ionicons name="arrow-back" size={28} color="#000" />
                                            </Pressable>
                                            <Text style={styles.commentHeaderTitle}>Settings</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.commentHeaderTitle}>
                                                {(activeMenuModal === 'profile' ? 'Edit Profile' : (activeMenuModal === 'lang' ? 'Select Language' : (activeMenuModal === 'saved' ? 'Saved Stories' : (activeMenuModal === 'feedback' ? 'Send Feedback' : 'Report an Issue'))))}
                                            </Text>
                                            <Pressable onPress={() => setActiveMenuModal(null)}>
                                                <Ionicons name="close" size={28} color="#000" />
                                            </Pressable>
                                        </>
                                    )}
                                </View>

                                {/* --- Settings Content --- */}
                                {activeMenuModal === 'settings' && (
                                    <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                                        <TouchableOpacity style={styles.settingsItem}>
                                            <View style={[styles.settingsIconBox, { backgroundColor: '#F8F1E6' }]}>
                                                <Ionicons name="language" size={20} color="#B8860B" />
                                            </View>
                                            <Text style={styles.settingsLabel}>Language</Text>
                                            <View style={styles.settingsSelector}>
                                                <Text style={styles.settingsSelectorText}>Telugu</Text>
                                                <Ionicons name="chevron-down" size={16} color="#666" />
                                            </View>
                                        </TouchableOpacity>

                                        <View style={styles.settingsItem}>
                                            <View style={[styles.settingsIconBox, { backgroundColor: '#E8F1FB' }]}>
                                                <Ionicons name="notifications" size={20} color="#4A90E2" />
                                            </View>
                                            <Text style={styles.settingsLabel}>Notification</Text>
                                            <Switch
                                                value={isNotificationEnabled}
                                                onValueChange={setIsNotificationEnabled}
                                                trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                                thumbColor="#fff"
                                            />
                                        </View>

                                        <View style={styles.settingsItem}>
                                            <View style={[styles.settingsIconBox, { backgroundColor: '#F0F0F0' }]}>
                                                <Ionicons name="moon" size={20} color="#666" />
                                            </View>
                                            <Text style={styles.settingsLabel}>Night Mode</Text>
                                            <Switch
                                                value={isNightModeEnabled}
                                                onValueChange={setIsNightModeEnabled}
                                                trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                                thumbColor="#fff"
                                            />
                                        </View>

                                        <TouchableOpacity style={styles.settingsItem}>
                                            <View style={[styles.settingsIconBox, { backgroundColor: '#F0F7FF' }]}>
                                                <Ionicons name="play-circle" size={20} color="#FF8F00" />
                                            </View>
                                            <Text style={styles.settingsLabel}>Auto play</Text>
                                            <Switch
                                                value={isAutoPlayEnabled}
                                                onValueChange={setIsAutoPlayEnabled}
                                                trackColor={{ false: "#D1D1D1", true: "#4A90E2" }}
                                                thumbColor="#fff"
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.settingsItem}>
                                            <View style={[styles.settingsIconBox, { backgroundColor: '#F0F0F0' }]}>
                                                <Ionicons name="text" size={20} color="#666" />
                                            </View>
                                            <Text style={styles.settingsLabel}>Text Size</Text>
                                            <View style={styles.settingsSelector}>
                                                <Text style={styles.settingsSelectorText}>Small</Text>
                                                <Ionicons name="chevron-down" size={16} color="#666" />
                                            </View>
                                        </TouchableOpacity>

                                        <View style={styles.aboutAppContainer}>
                                            <View style={styles.aboutAppHeader}>
                                                <Text style={styles.aboutAppHeaderText}>About App</Text>
                                            </View>
                                            <TouchableOpacity style={styles.aboutItem}>
                                                <Ionicons name="information-circle-outline" size={22} color="#333" />
                                                <Text style={styles.aboutItemLabel}>About us</Text>
                                                <Ionicons name="chevron-forward" size={18} color="#999" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.aboutItem}>
                                                <Ionicons name="shield-checkmark-outline" size={22} color="#333" />
                                                <Text style={styles.aboutItemLabel}>Privacy Policy</Text>
                                                <Ionicons name="chevron-forward" size={18} color="#999" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.aboutItem}>
                                                <Ionicons name="document-text-outline" size={22} color="#333" />
                                                <Text style={styles.aboutItemLabel}>Regulations & Conditions</Text>
                                                <Ionicons name="chevron-forward" size={18} color="#999" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.aboutItem, { borderBottomWidth: 0 }]}>
                                                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" />
                                                <Text style={styles.aboutItemLabel}>Feedback</Text>
                                                <Ionicons name="chevron-forward" size={18} color="#999" />
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                )}

                                {/* --- Profile Content --- */}
                                {activeMenuModal === 'profile' && (
                                    <View style={styles.formContent}>
                                        <View style={[styles.profileCircleLarge, { overflow: 'hidden' }]}>
                                            <Image
                                                source="https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211469.png"
                                                style={styles.profileAvatarImg}
                                                contentFit="cover"
                                            />
                                        </View>
                                        <Text style={styles.inputLabel}>DISPLAY NAME</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            value={tempName}
                                            onChangeText={setTempName}
                                            placeholder="Enter your name"
                                        />
                                        <Pressable style={styles.submitBtn} onPress={handleUpdateName}>
                                            <Text style={styles.submitBtnText}>Save Changes</Text>
                                        </Pressable>
                                    </View>
                                )}

                                {/* --- Language Content --- */}
                                {activeMenuModal === 'lang' && (
                                    <View style={styles.langList}>
                                        {['English', 'Telugu (తెలుగు)', 'Hindi (हिन्दी)'].map((lang) => (
                                            <Pressable
                                                key={lang}
                                                style={styles.langItem}
                                                onPress={() => handleSelectLanguage(lang.split(' ')[0])}
                                            >
                                                <Text style={[styles.langText, currentLanguage === lang.split(' ')[0] && styles.langTextActive]}>
                                                    {lang}
                                                </Text>
                                                {currentLanguage === lang.split(' ')[0] && (
                                                    <Ionicons name="checkmark-circle" size={24} color="#1a73e8" />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                {/* --- Saved Stories Content --- */}
                                {activeMenuModal === 'saved' && (
                                    <ScrollView style={styles.savedScroll}>
                                        {savedIds.length > 0 ? (
                                            newsData.filter(item => savedIds.includes(item.id)).map(item => (
                                                <View key={item.id} style={styles.savedItem}>
                                                    <Ionicons name="bookmark" size={20} color="#fbbc04" style={{ marginRight: 10 }} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.savedTitle} numberOfLines={1}>{item.title}</Text>
                                                        <Text style={styles.savedDesc} numberOfLines={1}>{item.description}</Text>
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
                                        <Text style={styles.inputLabel}>
                                            {activeMenuModal === 'feedback' ? 'TELL US WHAT YOU THINK' : 'WHAT IS THE ISSUE?'}
                                        </Text>
                                        <TextInput
                                            style={[styles.formInput, { height: 120, textAlignVertical: 'top' }]}
                                            value={feedbackText}
                                            onChangeText={setFeedbackText}
                                            placeholder="Type your message here..."
                                            multiline
                                        />
                                        <Pressable style={styles.submitBtn} onPress={handleSubmitFeedback}>
                                            <Text style={styles.submitBtnText}>Submit</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    )
                }

                <Animated.View style={[styles.overlay, overlayStyle]}>
                    <Pressable style={{ flex: 1 }} onPress={toggleMenu} />
                </Animated.View>

                <Animated.View style={[styles.menuContainer, menuStyle]}>
                    <View style={styles.customMenuHeader}>
                        <TouchableOpacity style={styles.menuIconBtn} onPress={() => { toggleMenu(); setActiveMenuModal('settings'); }}>
                            <Ionicons name="settings-outline" size={24} color="#666" />
                        </TouchableOpacity>
                        <Image
                            source={require('../assets/images/res_screenshot_2026_01_06_170338.png')}
                            style={styles.menuLogo}
                            contentFit="contain"
                        />
                        <TouchableOpacity style={styles.menuNewsHeader} onPress={() => { toggleMenu(); }}>
                            <Text style={styles.menuNewsText}>న్యూస్</Text>
                            <Ionicons name="chevron-forward" size={22} color="#4A90E2" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.newMenuList} showsVerticalScrollIndicator={false}>
                        {/* 2. Guest Login Card */}
                        <TouchableOpacity style={styles.guestCard} onPress={() => {
                            toggleMenu();
                            setIsLoginModalVisible(true);
                        }}>
                            <View style={[styles.guestIconCircle, { overflow: 'hidden' }]}>
                                <Image
                                    source="https://png.pngtree.com/png-vector/20231019/ourmid/pngtree-user-profile-avatar-png-image_10211469.png"
                                    style={styles.profileAvatarImg}
                                    contentFit="cover"
                                />
                            </View>
                            <Text style={styles.guestTextLogin}>Guest Login</Text>
                            <View style={{ flex: 1 }} />
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        {/* 3. States Grid (Row 1) */}
                        <View style={styles.gridRow}>
                            <TouchableOpacity style={styles.gridItemState} onPress={() => { setActiveCategory('andhra'); toggleMenu(); flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); }}>
                                <Image source={require('../assets/images/res_ap_map_outline.png')} style={styles.stateMapIcon} contentFit="contain" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.stateTitle}>ఆంధ్రప్రదేశ్</Text>
                                    <Text style={styles.stateSubText}>Only Andhra Pradesh News</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                            <TouchableOpacity style={styles.gridItemState} onPress={() => { setActiveCategory('telangana'); toggleMenu(); flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); }}>
                                <Image source={require('../assets/images/res_telangana_map_outline.png')} style={styles.stateMapIcon} contentFit="contain" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.stateTitle}>తెలంగాణ</Text>
                                    <Text style={styles.stateSubText}>Only Telangana News</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* 4. News Grid (Row 2) */}
                        <View style={styles.gridRow}>
                            <TouchableOpacity style={styles.gridItemSimple} onPress={() => { setActiveCategory('national'); toggleMenu(); flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); }}>
                                <Text style={styles.gridTitleNational}>జాతీయం</Text>
                                <Text style={styles.gridSubCenter}>Only National News</Text>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                            <TouchableOpacity style={styles.gridItemSimple}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                    <Ionicons name="search" size={24} color="#000" />
                                    <Text style={[styles.gridTitleMain, { marginLeft: 8 }]}>Fact Check</Text>
                                </View>
                                <Text style={styles.gridSubTeluguFact}>న్యూస్ పబ్లిష్ అయిందా.. లేదో వెరిఫై</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 5. Big Cards Row */}
                        <View style={styles.gridRow}>
                            <TouchableOpacity
                                style={[styles.bigCard, { backgroundColor: '#F8F9FA' }]}
                                onPress={() => { toggleMenu(); setIsDigitalMagazineVisible(true); }}
                            >
                                <View style={styles.magazineIconCircle}>
                                    <MaterialCommunityIcons name="newspaper-variant-outline" size={24} color="#0F5B8B" />
                                </View>
                                <Text style={styles.bigCardTextLarge}>డిజిటల్{"\n"}మ్యాగజిన్స్</Text>
                            </TouchableOpacity>
                            <View style={{ width: 10 }} />
                            <TouchableOpacity style={[styles.bigCard, { backgroundColor: '#F8F9FA', padding: 15 }]}>
                                <View style={styles.pollGroupIcon}>
                                    <MaterialCommunityIcons name="account-group-outline" size={32} color="#555" />
                                </View>
                                <Text style={styles.bigCardTextLargeCenter}>పోల్స్</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 6. List Items */}
                        <View style={styles.menuListContainerFlat}>
                            {/* Selected Location */}
                            <TouchableOpacity style={styles.menuListItemFlat}>
                                <View style={styles.menuListLeftRow}>
                                    <Ionicons name="location-outline" size={26} color="#000" />
                                    <View style={{ marginLeft: 15 }}>
                                        <Text style={styles.menuListLabel}>మీరు ఎంచుకున్న స్థానం</Text>
                                        <Text style={styles.menuListLocationBlue}>Hyderabad</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuListItemFlat} onPress={toggleMenu}>
                                <Text style={styles.menuListTitleSimpleBlack}>English News</Text>
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuListItemFlat} onPress={toggleMenu}>
                                <Text style={styles.menuListTitleSimpleBlack}>Job notifications</Text>
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuListItemFlat} onPress={toggleMenu}>
                                <Text style={styles.menuListTitleSimpleBlack}>జాతకం & రాశి ఫలాలు వీడియోలు</Text>
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuListItemFlat} onPress={toggleMenu}>
                                <Text style={styles.menuListTitleSimpleBlack}>8k న్యూస్ ఎక్స్‌క్లూజివ్</Text>
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.menuListItemFlat}>
                                <View style={styles.menuListLeftRow}>
                                    <Ionicons name="megaphone-outline" size={24} color="#000" />
                                    <Text style={[styles.menuListTitleSimpleBlack, { marginLeft: 15 }]}>Refer Now</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </Animated.View>

                {/* 🔐 LOGIN MODAL - REMOVED DUPLICATE MOCK */}


            </>


            {/* 🔐 FIREBASE LOGIN SCREEN */}
            {isLoginModalVisible && (
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
            )}

            {/* 🌍 LOCATION SELECTION SCREEN (Guest Login) */}
            {
                isLocationSelectorVisible && (
                    <View style={[styles.fullModalOverlay, { backgroundColor: '#fff' }]}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={styles.locHeaderRef}>
                                <Text style={styles.locHeaderLeftText}>Change location</Text>
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
                                <Text style={styles.locRefInstruction}>మీకు కావాల్సిన నియోజకవర్గం ఎంచుకోండి</Text>

                                <View style={styles.locRefSearchContainer}>
                                    <View style={styles.locRefSearchBox}>
                                        <Ionicons name="location-sharp" size={20} color="#777" />
                                        <TextInput
                                            style={styles.locRefInput}
                                            placeholder="మీ నియోజకవర్గం పేరు శోధించండి..."
                                            placeholderTextColor="#999"
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
                                            style={styles.locListItem}
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
                                                <Text style={styles.locListItemText}>{loc.name}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={22} color="#999" />
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
                    <View style={styles.fullModalOverlay}>
                        <SafeAreaView style={styles.fullSpace}>
                            <View style={styles.magHeader}>
                                <TouchableOpacity onPress={() => setIsDigitalMagazineVisible(false)} style={styles.magBackRoundBtn}>
                                    <Ionicons name="chevron-back" size={24} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.magHeaderText}>డిజిటల్ మ్యాగజిన్స్</Text>
                                <View style={{ width: 44 }} />
                            </View>

                            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.magListContent} showsVerticalScrollIndicator={false}>
                                {MAGAZINE_DATA.map((item) => (
                                    <View key={item.id} style={styles.magCard}>
                                        <Image
                                            source={item.image}
                                            style={styles.magCardImage}
                                            contentFit="cover"
                                        />
                                        <View style={styles.magCardInfo}>
                                            <View style={styles.magBadge}>
                                                <Text style={styles.magBadgeText}>{item.badge}</Text>
                                            </View>
                                            <Text style={styles.magCardTitle}>{item.title}</Text>
                                            <Text style={styles.magCardDate}>{item.date}</Text>

                                        </View>
                                    </View>
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
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#000',
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
        paddingTop: Platform.OS === 'ios' ? 50 : 10,
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
        zIndex: 500, // Elevated to ensure it covers everything
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
        marginTop: 6,
        marginLeft: 0,
    },
    videoInputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        padding: 10,
        backgroundColor: '#fff',
    },
    videoInput: {
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 14,
        color: '#000',
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
});

