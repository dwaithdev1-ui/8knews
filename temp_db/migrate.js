const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const newsData = [
    {
        id: 'main-1',
        title: 'మెయిన్ న్యూస్: ప్రపంచ ఆర్థిక వ్యవస్థలో పెను మార్పులు',
        description: 'అంతర్జాతీయ మార్కెట్లలో చోటు చేసుకుంటున్న మార్పులు భారత ఆర్థిక వ్యవస్థపై ఎలాంటి ప్రభావం చూపుతాయో విశ్లేషించండి.',
        image: '05-Down to up scroll pop up.png',
        tags: ['main', 'trending']
    },
    {
        id: 'main-2',
        title: 'దేశవ్యాప్తంగా నూతన విద్యా విధానం అమలు',
        description: 'ప్రభుత్వం ప్రకటించిన నూతన విద్యా విధానం వల్ల విద్యార్థులకు కలిగే ప్రయోజనాలు మరియు మార్పుల గురించి తెలుసుకోండి.',
        image: '06-8K News.png',
        tags: ['main', 'trending']
    },
    {
        id: 'main-3',
        title: 'భారత అంతరిక్ష పరిశోధనలో మరో మైలురాయి',
        description: 'ఇస్రో ప్రయోగించిన సరికొత్త శాటిలైట్ మరుసటి కక్ష్యలోకి ప్రవేశించి విజయవంతంగా పని చేస్తోంది.',
        image: '07-Up to down scroll.png',
        tags: ['main', 'trending']
    },
    {
        id: 'main-4',
        title: 'జాతీయ హైవే ప్రాజెక్టుల ప్రారంభం',
        description: 'దేశవ్యాప్తంగా రవాణా సౌకర్యాలను మెరుగుపరచడానికి వేల కోట్ల రూపాయలతో నూతన రహదారుల నిర్మాణం.',
        image: '20-Main News.png',
        tags: ['main']
    },
    {
        id: 'cine-1',
        title: 'పుష్ప 2: ది రూల్ - ప్రపంచవ్యాప్త సంచలనం',
        description: 'అల్లు అర్జున్ నటన మరియు సుకుమార్ దర్శకత్వం పుష్ప 2 చిత్రాన్ని బాక్సాఫీస్ వద్ద విజేతగా నిలబెట్టాయి.',
        image: '8K News_Trending page-23.png',
        tags: ['cinema', 'trending']
    },
    {
        id: 'cine-2',
        title: 'టాలీవుడ్ అప్‌కమింగ్ బిగ్ బడ్జెట్ సినిమాలు',
        description: 'త్వరలో విడుదల కాబోతున్న టాప్ హీరోల చిత్రాల టీజర్స్ మరియు ట్రైలర్స్ సోషల్ మీడియాలో వైరల్ అవుతున్నాయి.',
        image: '20-Photos-1.png',
        tags: ['cinema', 'trending']
    },
    {
        id: 'cine-3',
        title: 'గ్లోబల్ సినిమా వేదికపై టాలీవుడ్ సత్తా',
        description: 'మన తెలుగు సినిమాలు అంతర్జాతీయ వేదికలపై అవార్డులు గెలుచుకుంటూ తెలుగు జెండాను ఎగరేస్తున్నాయి.',
        image: '22-Photos-3.png',
        tags: ['cinema']
    },
    {
        id: 'bhakti-1',
        title: 'ఆధ్యాత్మిక శాంతి: ధ్యానం ప్రాముఖ్యత',
        description: 'ధ్యానం చేయడం వల్ల మనస్సు ప్రశాంతంగా ఉండటమే కాకుండా ఆరోగ్యం కూడా మెరుగుపడుతుంది.',
        image: '25-Category complete-2.png',
        tags: ['bhakti', 'trending'],
        isFullCard: true
    },
    {
        id: 'bhakti-2',
        title: 'ప్రసిద్ధ పుణ్యక్షేత్రాల దర్శనం - యాత్రా విశేషాలు',
        description: 'ఈ పండుగ సీజన్ లో తప్పక సందర్శించాల్సిన ముఖ్యమైన దర్శనీయ క్షేత్రాల జాబితా మీ కోసం.',
        image: '25-Category complete-3.png',
        tags: ['bhakti'],
        isFullCard: true
    },
    {
        id: 'bhakti-3',
        title: 'మహా శివరాత్రి వేడుకల కోసం సిద్ధమవుతున్న ఆలయాలు',
        description: 'శైవ క్షేత్రాలలో మహా శివరాత్రి సందర్భంగా విద్యుత్ దీపాలతో అలంకరణ మరియు ప్రత్యేక పూజలు.',
        image: '25-Category complete-4.png',
        tags: ['bhakti', 'trending'],
        isFullCard: true
    },
    {
        id: 'agri-1',
        title: 'వ్యవసాయంలో డ్రోన్ టెక్నాలజీ వినియోగం',
        description: 'రైతులకు సాగులో సహాయం చేయడానికి ప్రభుత్వం ప్రవేశపెట్టిన మల్టీ-పర్పస్ డ్రోన్స్ మంచి ఫలితాలను ఇస్తున్నాయి.',
        image: '24-Andhrapradesh News.png',
        tags: ['agriculture', 'trending']
    },
    {
        id: 'agri-2',
        title: 'సేంద్రీయ సాగుతో అధిక లాభాలు: రైతుల అనుభవం',
        description: 'కెమికల్స్ వాడకుండా సహజ సిద్ధంగా పండించిన పంటలకు మార్కెట్లో మంచి గిరాకీ ఏర్పడింది.',
        image: '26-India News-3.png',
        tags: ['agriculture', 'trending']
    },
    {
        id: 'agri-3',
        title: 'గుంటూరు మిర్చి యార్డ్‌లో రికార్డ్ లావాదేవీలు',
        description: 'ఈ ఏడాది మిర్చి దిగుబడి ఆశాజనకంగా ఉండటంతో రైతులు హర్షం వ్యక్తం చేస్తున్నారు.',
        image: '21-Local News.png',
        tags: ['agriculture', 'guntur', 'local']
    },
    {
        id: 'sports-1',
        title: 'క్రికెట్: భారత్ అద్భుత విజయం',
        description: 'తొలి టెస్టులో ప్రత్యర్థి జట్టును మట్టికరిపించిన భారత జట్టు. రోహిత్ శర్మ వీరోచిత సెంచరీ.',
        image: '06-8K News.png',
        tags: ['sports', 'trending']
    },
    {
        id: 'sports-2',
        title: 'నేషనల్ గేమ్స్: తెలుగు రాష్ట్రాల క్రీడాకారుల జోరు',
        description: 'పలు విభాగాల్లో గోల్డ్ మెడల్స్ గెలుచుకుంటూ మన అథ్లెట్లు సత్తా చాటుతున్నారు.',
        image: '08-8K News.png',
        tags: ['sports', 'trending']
    },
    {
        id: 'wish-1',
        title: 'సంక్రాంతి శుభాకాంక్షలు: పండుగ సందడి',
        description: 'ముంగిట ముగ్గులు, గొబ్బెమ్మలు మరియు కోడి పందేలతో పల్లెల్లో పండుగ వాతావరణం నెలకొంది.',
        image: '26-India News.png',
        tags: ['wishes', 'whatsapp']
    },
    {
        id: 'wish-2',
        title: 'హ్యాపీ బర్త్‌డే: విషెస్ కార్డ్స్',
        description: 'మీ స్నేహితులకు మరియు కుటుంబ సభ్యులకు ఈ ప్రత్యేకమైన విషెస్ మెసేజ్‌లను పంపండి.',
        image: '25-Category complete-5.png',
        tags: ['wishes', 'whatsapp', 'trending'],
        isFullCard: true
    },
    {
        id: 'wa-1',
        title: 'లేటెస్ట్ మొటివేషనల్ స్టేటస్ వీడియోలు',
        description: 'జీవితంలో ఏదైనా సాధించాలనుకునే వారికి స్ఫూర్తినిచ్చే అద్భుతమైన స్టేటస్ కలెక్షన్.',
        image: '25 Telangana News.png',
        tags: ['whatsapp']
    },
    {
        id: 'wa-2',
        title: 'వైరల్ వాట్సాప్ స్టేటస్ అప్‌డేట్స్',
        description: 'సోషల్ మీడియాలో ట్రెండింగ్ లో ఉన్న వీడియోలు మరియు చిత్రాలు ఇక్కడ చూడండి.',
        image: '22-Trending News.png',
        tags: ['whatsapp', 'trending']
    },
    {
        id: 'loc-hyd-1',
        title: 'హైదరాబాద్: ఐటీ కారిడార్ లో ట్రాఫిక్ ఆంక్షలు',
        description: 'విమానశ్రయం మెట్రో పనుల దృష్ట్యా నగరంలో పలు చోట్ల ట్రాఫిక్ మళ్లింపులు చేపట్టారు.',
        image: '19-8K News.png',
        tags: ['hyderabad', 'local', 'trending']
    },
    {
        id: 'andhra-1',
        title: 'ఆంధ్రప్రదేశ్ వార్తలు',
        description: 'ఆంధ్రప్రదేశ్ రాష్ట్రంలో జరుగుతున్న తాజా రాజకీయ, సామాజిక పరిణామాలు మరియు అభివృద్ధి పనుల వివరాలు.',
        image: 'andhra.png',
        tags: ['andhra']
    },
    {
        id: 'telangana-1',
        title: 'తెలంగాణ వార్తలు',
        description: 'తెలంగాణ రాష్ట్రంలో అమలు అవుతున్న ప్రజా సంక్షేమ పథకాలు మరియు హైదరాబాద్ నగర అభివృద్ధి విశేషాలు.',
        image: 'telangana.png',
        tags: ['telangana']
    },
    {
        id: 'national-1',
        title: 'జాతీయ వార్తలు',
        description: 'భారతదేశ వ్యాప్తంగా జరుగుతున్న ముఖ్యమైన వార్తలు, క్రీడలు మరియు ఇతర ప్రధాన విశేషాలు.',
        image: 'national.png',
        tags: ['national']
    },
    {
        id: 'loc-hyd-2',
        title: 'నగరంలో భారీ వర్ష సూచన: హై అలర్ట్',
        description: 'రానున్న 24 గంటల్లో హైదరాబాద్ తో పాటు పలు జిల్లాల్లో భారీ వర్షాలు కురిసే అవకాశం ఉంది.',
        image: '21-Local News.png',
        tags: ['hyderabad', 'local']
    },
    {
        id: 'loc-gun-1',
        title: 'గుంటూరు: అభివృద్ధి పనుల వేగవంతం',
        description: 'నగర అభివృద్ధి కోసం మంజూరైన నిధులతో కొత్త రోడ్లు మరియు డ్రైనేజీ పనులు ప్రారంభం.',
        image: '24-Andhrapradesh News.png',
        tags: ['guntur', 'local', 'trending']
    },
    {
        id: 'life-1',
        title: 'ఆరోగ్యకరమైన ఆహారపు అలవాట్లు: చిట్కాలు',
        description: 'ప్రతిరోజూ తాజా కూరగాయలు మరియు పండ్లను మీ డైట్ లో చేర్చుకోవడం వల్ల ఇమ్యూనిటీ పెరుగుతుంది.',
        image: '23-Photos-4.png',
        tags: ['lifestyle', 'trending']
    },
    {
        id: 'life-2',
        title: 'మోడ్రన్ హోమ్ ఇంటీరియర్ డిజైన్స్ 2024',
        description: 'తక్కువ ఖర్చుతో మీ ఇంటిని అందంగా మార్చుకునే సరికొత్త ఇంటీరియర్ ఐడియాలు.',
        image: '24-Photos-5.png',
        tags: ['lifestyle', 'trending']
    },
    {
        id: 'aff-1',
        title: 'కరెంటు అఫైర్స్: రాష్ట్ర బడ్జెట్ విశ్లేషణ',
        description: 'ప్రభుత్వం ప్రకటించిన రాబోయే ఆర్థిక సంవత్సర బడ్జెట్ పై పూర్తి అవగాహన పొందండి.',
        image: '26-India News-2.png',
        tags: ['affairs', 'trending']
    },
    {
        id: 'aff-2',
        title: 'మెరుగైన పాలన కోసం డిజిటల్ రిఫార్మ్స్',
        description: 'ప్రభుత్వ సేవలను ప్రజలకు మరింత సులభంగా చేరవేసేందుకు టెక్నాలజీ వినియోగం.',
        image: '26-India News-3.png',
        tags: ['affairs', 'main']
    },
    {
        id: 'photo-1',
        title: 'భారతదేశ అద్భుత ప్రకృతి దృశ్యాలు',
        description: 'హిమాలయాల నుండి కన్యాకుమారి వరకు మన దేశ సౌందర్యం ఫొటోలలో.',
        image: '21-Photos-2.png',
        tags: ['photos', 'trending']
    },
    {
        id: 'video-1',
        title: 'సాంకేతిక విప్ลవం: వీడియో రిపోర్ట్',
        description: 'రాబోయే కాలంలో ఏయే గ్యాడ్జెట్స్ మన జీవితాలను శాసించబోతున్నాయో చూడండి.',
        image: '8K News_Top Bar Video-1.png',
        tags: ['videos', 'trending'],
        isVideo: true
    },
    {
        id: 'video-new-2',
        title: 'తాజా వీడియో వార్తలు',
        description: 'రండి చూడండి! ఈ రోజు సోషల్ మీడియాలో వైరల్ అవుతున్న ఆసక్తికరమైన వీడియో.',
        image: 'Picture11.png',
        tags: ['videos', 'trending'],
        isVideo: true
    },
    {
        id: 'wish-new-1',
        title: 'దీపావళి శుభాకాంక్షలు',
        description: 'ఈ దీపావళి మీ ఇంట వెలుగులు నింపాలని, సుఖసంతోషాలతో వర్ధిల్లాలని కోరుకుంటున్నాము.',
        image: 'wishes1.png',
        tags: ['wishes', 'trending'],
        isFullCard: true
    },
    {
        id: 'tech-new-1',
        title: 'కొత్త స్మార్ట్‌ఫోన్ రివ్యూ 2024',
        description: 'మార్కెట్లోకి వచ్చిన లేటెస్ట్ ఫీచర్స్ తో కూడిన స్మార్ట్‌ఫోన్ పనితీరు ఎలా ఉందో చూడండి.',
        image: '8K News_Top Bar Video-2.png',
        tags: ['videos', 'trending'],
        isVideo: true
    },
    {
        id: 'photo-new-1',
        title: 'ప్రకృతి అందాలు: అరకు లోయ',
        description: 'విశాఖ మన్యంలో పర్యాటకులను కట్టిపడేస్తున్న ప్రకృతి రమణీయ దృశ్యాలు. తప్పక చూడాల్సిన ప్రదేశం.',
        image: 'Picture3.png',
        tags: ['photos', 'trending', 'lifestyle'],
        isFullCard: true
    },
    {
        id: 'local-new-1',
        title: 'నగరంలో ట్రాఫిక్ నిబంధనలు కఠినతరం',
        description: 'హెల్మెట్ ధరించని వాహనదారులకు భారీ జరిమానాలు విధించనున్న ట్రాఫిక్ పోలీసులు.',
        image: 'Picture4.png',
        tags: ['local', 'hyderabad'],
        isFullCard: true
    },
    {
        id: 'cine-new-1',
        title: 'ఓటీటీలో ఈ వారం విడుదలయ్యే చిత్రాలు',
        description: 'ఇంట్లోనే కూర్చుని వినోదాన్ని ఆస్వాదించడానికి సిద్ధంగా ఉండండి. ఈ వారం ముచ్చటగొలిపే చిత్రాల జాబితా.',
        image: 'Picture5.png',
        tags: ['cinema', 'trending']
    },
    {
        id: 'full-ad-1',
        title: 'Special Promotion',
        description: 'Exclusive Ad Page',
        image: '23- Ad Page.png',
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-comp-6',
        title: 'Category Complete',
        description: 'You have caught up with all stories.',
        image: '25-Category complete-6.png',
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-comp-7',
        title: 'Category Complete',
        description: 'Stay tuned for more updates.',
        image: '25-Category complete-7.png',
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-comp-8',
        title: 'Category Complete',
        description: 'Fresh news coming soon.',
        image: '25-Category complete-8.png',
        tags: ['main', 'trending'],
        isFullCard: true
    },
    {
        id: 'full-wish-2',
        title: 'Greetings',
        description: 'Best wishes for you.',
        image: 'wishes2.png',
        tags: ['wishes', 'whatsapp', 'trending'],
        isFullCard: true
    }
];

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        console.log("Cleaning old data...");
        await db.collection("news").deleteMany({});

        console.log("Inserting news data...");
        const result = await db.collection("news").insertMany(newsData);
        console.log(`${result.insertedCount} news items inserted.`);

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.close();
    }
}

run();
