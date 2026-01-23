const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

// Simplified data from frontend instructions
const NEWS_ITEMS = [
    {
        title: 'ప్రధాని మోదీ - జర్మన్ ఛాన్సలర్ భేటీ',
        description: 'జర్మన్ ఛాన్సలర్ ఫ్రెడరిక్ మెర్జ్‌తో ప్రధాని మోదీ సమావేశం. ఇరు దేశాల మధ్య వ్యూహాత్మక భాగస్వామ్యం, వాణిజ్యం మరియు టెక్నాలజీ రంగాలలో సహకారంపై కీలక చర్చలు.',
        tags: ['national', 'trending'],
        catSlug: 'national'
    },
    {
        title: 'సంక్రాంతి సంబరాలు: తెలుగు లోగిళ్ళలో పండుగ శోభ',
        description: 'భోగి మంటలు, రంగవల్లులు, గాలిపటాలతో తెలుగు రాష్ట్రాల్లో సంక్రాంతి వేడుకలు ఘనంగా జరుగుతున్నాయి. ఇంటి ముందు ముగ్గులు, గొబ్బెమ్మలు, హరిదాసుల కీర్తనలు, బసవన్నల దీవెనలతో పల్లెలు కళకళలాడుతున్నాయి. పిండివంటల ఘుమఘుమలు, కుటుంబ సభ్యుల కలయికలతో ఆనందం వెల్లివిరుస్తోంది. ఈ పండుగ ప్రతింటా సిరులు కురిపించాలని కోరుకుందాం.',
        tags: ['main', 'trending'],
        catSlug: 'main'
    },
    {
        title: 'జీఎస్‌ఎల్‌వీ-ఎఫ్15: నావిగేషన్ ఉపగ్రహ ప్రయోగం',
        description: 'శ్రీహరికోట నుండి జనవరి 29న సాయంత్రం 6:23 గంటలకు ఎన్‌వీఎస్-02 ఉపగ్రహాన్ని మోసుకెళ్లే జీఎస్‌ఎల్‌వీ-ఎఫ్15 రాకెట్ ప్రయోగం జరగనుంది. ఇది భారత నావిగేషన్ వ్యవస్థలో కీలకం.',
        tags: ['main', 'trending'],
        catSlug: 'main'
    },
    {
        title: 'జాతీయ యువజన దినోత్సవం: స్వామి వివేకానంద స్ఫూర్తి',
        description: 'స్వామి వివేకానంద జయంతి సందర్భంగా దేశవ్యాప్తంగా జాతీయ యువజన దినోత్సవ వేడుకలు. యువత దేశాభివృద్ధిలో కీలక పాత్ర పోషించాలని, ఆయన ఆశయాలను స్ఫూర్తిగా తీసుకోవాలని ప్రముఖుల పిలుపు. పాఠశాలలు, కళాశాలల్లో ప్రత్యేక కార్యక్రమాలు.',
        tags: ['main', 'trending'],
        catSlug: 'main'
    },
    {
        title: 'జాతీయ హైవే ప్రాజెక్టుల ప్రారంభం',
        description: 'దేశవ్యాప్తంగా రవాణా సౌకర్యాలను మెరుగుపరచడానికి వేల కోట్ల రూపాయలతో నూతన రహదారుల నిర్మాణం.',
        tags: ['main'],
        catSlug: 'main'
    },
    {
        title: 'తీవ్ర జ్వరంతో బాధపడుతున్న పవన్ కళ్యాణ్ ను పరామర్శించిన చంద్రబాబు... పవన్ ఆరోగ్యంపై',
        description: 'ఆంధ్రప్రదేశ్ ఉప ముఖ్యమంత్రి పవన్ కళ్యాణ్ ను ముఖ్యమంత్రి చంద్రబాబు నాయుడు పరామర్శించారు. గత కొద్ది రోజులుగా వైరల్ ఫీవర్ తో బాధపడుతున్న పవన్ ఆరోగ్యం కుదుటపడుతోంది.',
        tags: ['cinema', 'trending', 'politics'],
        catSlug: 'cinema'
    },
    {
        title: 'ది రాజా సాబ్',
        description: 'The Raja Saab',
        tags: ['cinema', 'trending'],
        is_full_card: true,
        catSlug: 'cinema'
    },
    {
        title: 'టాలీవుడ్ అప్‌కమింగ్ బిగ్ బడ్జెట్ సినిమాలు',
        description: 'త్వరలో విడుదల కాబోతున్న టాప్ హీరోల చిత్రాల టీజర్స్ మరియు ట్రైలర్స్ సోషల్ మీడియాలో వైరల్ అవుతున్నాయి.',
        tags: ['cinema', 'trending'],
        is_full_card: true,
        catSlug: 'cinema'
    },
    {
        title: 'గ్లోబల్ సినిమా వేదికపై టాలీవుడ్ సత్తా',
        description: 'మన తెలుగు సినిమాలు అంతర్జాతీయ వేదికలపై అవార్డులు గెలుచుకుంటూ తెలుగు జెండాను ఎగరేస్తున్నాయి.',
        tags: ['cinema'],
        is_full_card: true,
        catSlug: 'cinema'
    },
    {
        title: 'ఆధ్యాత్మిక శాంతి: ధ్యానం ప్రాముఖ్యత',
        description: 'ధ్యానం చేయడం వల్ల మనస్సు ప్రశాంతంగా ఉండటమే కాకుండా ఆరోగ్యం కూడా మెరుగుపడుతుంది.',
        tags: ['bhakti', 'trending'],
        is_full_card: true,
        catSlug: 'bhakti'
    },
    {
        title: 'ప్రసిద్ధ పుణ్యక్షేత్రాల దర్శనం - యాత్రా విశేషాలు',
        description: 'ఈ పండుగ సీజన్ లో తప్పక సందర్శించాల్సిన ముఖ్యమైన దర్శనీయ క్షేత్రాల జాబితా మీ కోసం.',
        tags: ['bhakti'],
        is_full_card: true,
        catSlug: 'bhakti'
    },
    {
        title: 'మహా శివరాత్రి వేడుకల కోసం సిద్ధమవుతున్న ఆలయాలు',
        description: 'శైవ క్షేత్రాలలో మహా శివరాత్రి సందర్భంగా విద్యుత్ దీపాలతో అలంకరణ మరియు ప్రత్యేక పూజలు.',
        tags: ['bhakti', 'trending'],
        is_full_card: true,
        catSlug: 'bhakti'
    },
    {
        title: 'వ్యవసాయంలో డ్రోన్ టెక్నాలజీ వినియోగం',
        description: 'రైతులకు సాగులో సహాయం చేయడానికి ప్రభుత్వం ప్రవేశపెట్టిన మల్టీ-పర్పస్ డ్రోన్స్ మంచి ఫలితాలను ఇస్తున్నాయి.',
        tags: ['agriculture', 'trending'],
        is_full_card: true,
        catSlug: 'agriculture'
    },
    {
        title: 'సేంద్రీయ సాగుతో అధిక లాభాలు: రైతుల అనుభవం',
        description: 'కెమికల్స్ వాడకుండా సహజ సిద్ధంగా పండించిన పంటలకు మార్కెట్లో మంచి గిరాకీ ఏర్పడింది.',
        tags: ['agriculture', 'trending'],
        is_full_card: true,
        catSlug: 'agriculture'
    },
    {
        title: 'గుంటూరు మిర్చి యార్డ్‌లో రికార్డ్ లావాదేవీలు',
        description: 'ఈ ఏడాది మిర్చి దిగుబడి ఆశాజనకంగా ఉండటంతో రైతులు హర్షం వ్యక్తం చేస్తున్నారు.',
        tags: ['agriculture', 'guntur', 'local'],
        is_full_card: true,
        catSlug: 'agriculture'
    },
    {
        title: 'క్రికెట్: భారత్ అద్భుత విజయం',
        description: 'తొలి టెస్టులో ప్రత్యర్థి జట్టును మట్టికరిపించిన భారత జట్టు. రోహిత్ శర్మ వీరోచిత సెంచరీ.',
        tags: ['sports', 'trending'],
        is_full_card: true,
        catSlug: 'sports'
    },
    {
        title: 'నేషనల్ గేమ్స్: తెలుగు రాష్ట్రాల క్రీడాకారుల జోరు',
        description: 'పలు విభాగాల్లో గోల్డ్ మెడల్స్ గెలుచుకుంటూ మన అథ్లెట్లు సత్తా చాటుతున్నారు.',
        tags: ['sports', 'trending'],
        is_full_card: true,
        catSlug: 'sports'
    },
    {
        title: 'సంక్రాంతి శుభాకాంక్షలు: పండుగ సందడి',
        description: 'ముంగిట ముగ్గులు, గొబ్బెమ్మలు మరియు కోడి పందేలతో పల్లెల్లో పండుగ వాతావరణం నెలకొంది.',
        tags: ['wishes', 'whatsapp'],
        is_full_card: true,
        catSlug: 'wishes'
    },
    {
        title: 'హ్యాపీ బర్త్‌డే: విషెస్ కార్డ్స్',
        description: 'మీ స్నేహితులకు మరియు కుటుంబ సభ్యులకు ఈ ప్రత్యేకమైన విషెస్ మెసేజ్‌లను పంపండి.',
        tags: ['wishes', 'whatsapp', 'trending'],
        is_full_card: true,
        catSlug: 'wishes'
    },
    {
        title: 'లేటెస్ట్ మొటివేషనల్ స్టేటస్ వీడియోలు',
        description: 'జీవితంలో ఏదైనా సాధించాలనుకునే వారికి స్ఫూర్తినిచ్చే అద్భుతమైన స్టేటస్ కలెక్షన్.',
        tags: ['whatsapp'],
        is_full_card: true,
        catSlug: 'whatsapp'
    },
    {
        title: 'వైరల్ వాట్సాప్ స్టేటస్ అప్‌డేట్స్',
        description: 'సోషల్ మీడియాలో ట్రెండింగ్ లో ఉన్న వీడియోలు మరియు చిత్రాలు ఇక్కడ చూడండి.',
        tags: ['whatsapp', 'trending'],
        is_full_card: true,
        catSlug: 'whatsapp'
    },
    {
        title: 'సంక్రాంతి రద్దీ: విజయవాడ బస్టాండ్ కిటకిట',
        description: 'పండుగకు సొంతూళ్లకు వెళ్లే ప్రయాణికులతో విజయవాడ పండిట్ నెహ్రూ బస్ స్టేషన్ కిక్కిరిసిపోయింది. బస్సులు ప్రయాణికులతో నిండిపోవడంతో అధికారులు ప్రత్యేక సర్వీసులు ఏర్పాటు చేస్తున్నారు.',
        tags: ['vijayawada', 'local', 'trending'],
        catSlug: 'local'
    },
    {
        title: 'హైదరాబాద్‌ ట్రాఫిక్ జామ్: పండుగ పయనం',
        description: 'సంక్రాంతి పండుగకు సొంతూళ్లకు వెళ్లే వారితో హైదరాబాద్ రహదారులు కిక్కిరిసిపోయాయి. విజయవాడ హైవేపై భారీగా ట్రాఫిక్ నిలిచిపోయింది.',
        tags: ['hyderabad', 'local', 'trending'],
        catSlug: 'local'
    },
    {
        title: 'ఆంధ్రప్రదేశ్ వార్తలు',
        description: 'ఆంధ్రప్రదేశ్ రాష్ట్రంలో జరుగుతున్న తాజా రాజకీయ, సామాజిక పరిణామాలు మరియు అభివృద్ధి పనుల వివరాలు.',
        tags: ['andhra'],
        catSlug: 'andhra'
    },
    {
        title: 'తెలంగాణ వార్తలు',
        description: 'తెలంగాణ రాష్ట్రంలో అమలు అవుతున్న ప్రజా సంక్షేమ పథకాలు మరియు హైదరాబాద్ నగర అభివృద్ధి విశేషాలు.',
        tags: ['telangana'],
        catSlug: 'telangana'
    },
    {
        title: 'ఉత్తర భారతంలో గజగజ వణికిస్తున్న చలి',
        description: 'ఢిల్లీతో సహా ఉత్తర భారత రాష్ట్రాల్లో ఉష్ణోగ్రతలు కనిష్ట స్థాయికి పడిపోయాయి. పొగమంచు కారణంగా జనజీవనం స్తంభించింది. ప్రజలు అప్రమత్తంగా ఉండాలని వాతావరణ శాఖ హెచ్చరిక.',
        tags: ['national', 'trending'],
        catSlug: 'national'
    },
    {
        title: 'గుంటూరు: అభివృద్ధి పనుల వేగవంతం',
        description: 'నగర అభివృద్ధి కోసం మంజూరైన నిధులతో కొత్త రోడ్లు మరియు డ్రైనేజీ పనులు ప్రారంభం.',
        tags: ['guntur', 'local', 'trending'],
        catSlug: 'local'
    },
    {
        title: 'ఆరోగ్యకరమైన ఆహారపు అలవాట్లు: చిట్కాలు',
        description: 'ప్రతిరోజూ తాజా కూరగాయలు మరియు పండ్లను మీ డైట్ లో చేర్చుకోవడం వల్ల ఇమ్యూనిటీ పెరుగుతుంది.',
        tags: ['lifestyle', 'trending'],
        is_full_card: true,
        catSlug: 'lifestyle'
    },
    {
        title: 'మోడ్రన్ హోమ్ ఇంటీరియర్ డిజైన్స్ 2024',
        description: 'తక్కువ ఖర్చుతో మీ ఇంటిని అందంగా మార్చుకునే సరికొత్త ఇంటీరియర్ ఐడియాలు.',
        tags: ['lifestyle', 'trending'],
        is_full_card: true,
        catSlug: 'lifestyle'
    },
    {
        title: 'కరెంటు అఫైర్స్: రాష్ట్ర బడ్జెట్ విశ్లేషణ',
        description: 'ప్రభుత్వం ప్రకటించిన రాబోయే ఆర్థిక సంవత్సర బడ్జెట్ పై పూర్తి అవగాహన పొందండి.',
        tags: ['affairs', 'trending'],
        is_full_card: true,
        catSlug: 'affairs'
    },
    {
        title: 'మెరుగైన పాలన కోసం డిజిటల్ రిఫార్మ్స్',
        description: 'ప్రభుత్వ సేవలను ప్రజలకు మరింత సులభంగా చేరవేసేందుకు టెక్నాలజీ వినియోగం.',
        tags: ['affairs', 'main'],
        is_full_card: true,
        catSlug: 'affairs'
    },
    {
        title: 'భారతదేశ అద్భుత ప్రకృతి దృశ్యాలు',
        description: 'హిమాలయాల నుండి కన్యాకుమారి వరకు మన దేశ సౌందర్యం ఫొటోలలో.',
        tags: ['photos', 'trending'],
        is_full_card: true,
        catSlug: 'photos'
    },
    {
        title: 'సాంకేతిక విప్లవం: వీడియో రిపోర్ట్',
        description: 'రాబోయే కాలంలో ఏయే గ్యాడ్జెట్స్ మన జీవితాలను శాసించబోతున్నాయో చూడండి.',
        tags: ['videos', 'trending'],
        is_video: true,
        catSlug: 'videos'
    },
    {
        title: 'తాజా వీడియో వార్తలు',
        description: 'రండి చూడండి! ఈ రోజు సోషల్ మీడియాలో వైరల్ అవుతున్న ఆసక్తికరమైన వీడియో.',
        tags: ['videos', 'trending'],
        is_video: true,
        catSlug: 'videos'
    },
    {
        title: 'దీపావళి శుభాకాంక్షలు',
        description: 'ఈ దీపావళి మీ ఇంట వెలుగులు నింపాలని, సుఖసంతోషాలతో వర్ధిల్లాలని కోరుకుంటున్నాము.',
        tags: ['wishes', 'trending'],
        is_full_card: true,
        catSlug: 'wishes'
    },
    {
        title: 'కొత్త స్మార్ట్‌ఫోన్ రివ్యూ 2024',
        description: 'మార్కెట్లోకి వచ్చిన లేటెస్ట్ ఫీచర్స్ తో కూడిన స్మార్ట్‌ఫోన్ పనితీరు ఎలా ఉందో చూడండి.',
        tags: ['videos', 'trending'],
        is_video: true,
        catSlug: 'videos'
    },
    {
        title: 'ప్రకృతి అందాలు: అరకు లోయ',
        description: 'విశాఖ మన్యంలో పర్యాటకులను కట్టిపడేస్తున్న ప్రకృతి రమణీయ దృశ్యాలు. తప్పక చూడాల్సిన ప్రదేశం.',
        tags: ['photos', 'trending', 'lifestyle'],
        is_full_card: true,
        catSlug: 'photos'
    },
    {
        title: 'నగరంలో ట్రాఫిక్ నిబంధనలు కఠినతరం',
        description: 'హెల్మెట్ ధరించని వాహనదారులకు భారీ జరిమానాలు విధించనున్న ట్రాఫిక్ పోలీసులు.',
        tags: ['local', 'hyderabad'],
        is_full_card: true,
        catSlug: 'local'
    },
    {
        title: 'ఓటీటీలో ఈ వారం విడుదలయ్యే చిత్రాలు',
        description: 'ఇంట్లోనే కూర్చుని వినోదాన్ని ఆస్వాదించడానికి సిద్ధంగా ఉండండి. ఈ వారం ముచ్చటగొలిపే చిత్రాల జాబితా.',
        tags: ['cinema', 'trending'],
        catSlug: 'cinema'
    }
];

async function migrate() {
    try {
        await client.connect();
        const db = client.db();
        console.log(`Connected to DB: ${db.databaseName}`);

        const categories = await db.collection('categories').find().toArray();
        const catMap = {};
        categories.forEach(c => catMap[c.slug] = c._id);

        // Ensure default category exists if needed
        let defaultCatId = catMap['main'];
        if (!defaultCatId && categories.length > 0) defaultCatId = categories[0]._id;

        const newsCollection = db.collection('news');

        for (const item of NEWS_ITEMS) {
            const catId = catMap[item.catSlug] || defaultCatId;

            const existing = await newsCollection.findOne({ title: item.title });

            if (existing) {
                console.log(`Updating: ${item.title}`);
                await newsCollection.updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            status: 'published',
                            tags: item.tags || [],
                            is_full_card: !!item.is_full_card,
                            is_video: !!item.is_video,
                            updated_at: new Date()
                        }
                    }
                );
            } else {
                console.log(`Inserting: ${item.title}`);
                await newsCollection.insertOne({
                    title: item.title,
                    description: item.description,
                    category_id: catId,
                    status: 'published',
                    tags: item.tags || [],
                    is_full_card: !!item.is_full_card,
                    is_video: !!item.is_video,
                    image: null, // Let frontend fallback to local default
                    media: [],
                    created_at: new Date(),
                    updated_at: new Date(),
                    language: 'te',
                    like_count: 0
                });
            }
        }

        console.log('Migration complete.');

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

migrate();
