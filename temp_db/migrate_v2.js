const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const rawNewsData = [
    { id: 'main-1', title: 'మెయిన్ న్యూస్: ప్రపంచ ఆర్థిక వ్యవస్థలో పెను మార్పులు', description: 'అంతర్జాతీయ మార్కెట్లలో చోటు చేసుకుంటున్న మార్పులు భారత ఆర్థిక వ్యవస్థపై ఎలాంటి ప్రభావం చూపుతాయో విశ్లేషించండి.', image: '05-Down to up scroll pop up.png', tags: ['main', 'trending'] },
    { id: 'main-2', title: 'దేశవ్యాప్తంగా నూతన విద్యా విధానం అమలు', description: 'ప్రభుత్వం ప్రకటించిన నూతన విద్యా విధానం వల్ల విద్యార్థులకు కలిగే ప్రయోజనాలు మరియు మార్పుల గురించి తెలుసుకోండి.', image: '06-8K News.png', tags: ['main', 'trending'] },
    { id: 'main-3', title: 'భారత అంతరిక్ష పరిశోధనలో మరో మైలురాయి', description: 'ఇస్రో ప్రయోగించిన సరికొత్త శాటిలైట్ మరుసటి కక్ష్యలోకి ప్రవేశించి విజయవంతంగా పని చేస్తోంది.', image: '07-Up to down scroll.png', tags: ['main', 'trending'] },
    { id: 'cine-1', title: 'పుష్ప 2: ది రూల్ - ప్రపంచవ్యాప్త సంచలనం', description: 'అల్లు అర్జున్ నటన మరియు సుకుమార్ దర్శకత్వం పుష్ప 2 చిత్రాన్ని బాక్సాఫీస్ వద్ద విజేతగా నిలబెట్టాయి.', image: '8K News_Trending page-23.png', tags: ['cinema', 'trending'] },
    { id: 'loc-hyd-1', title: 'హైదరాబాద్: ఐటీ కారిడార్ లో ట్రాఫిక్ ఆంక్షలు', description: 'విమానశ్రయం మెట్రో పనుల దృష్ట్యా నగరంలో పలు చోట్ల ట్రాఫిక్ మళ్లింపులు చేపట్టారు.', image: '19-8K News.png', tags: ['hyderabad', 'local', 'trending'] },
    { id: 'agri-1', title: 'వ్యవసాయంలో డ్రోన్ టెక్నాలజీ వినియోగం', description: 'రైతులకు సాగులో సహాయం చేయడానికి ప్రభుత్వం ప్రవేశపెట్టిన మల్టీ-పర్పస్ డ్రోన్స్ మంచి ఫలితాలను ఇస్తున్నాయి.', image: '24-Andhrapradesh News.png', tags: ['agriculture', 'trending'] }
];

const categoryList = [
    { name: 'మెయిన్ న్యూస్', slug: 'main' },
    { name: 'సినిమా', slug: 'cinema' },
    { name: 'వ్యవసాయం', slug: 'agriculture' },
    { name: 'ట్రెండింగ్ న్యూస్', slug: 'trending' }
];

const locationList = [
    { name: 'హైదరాబాద్', slug: 'hyderabad' },
    { name: 'గుంటూరు', slug: 'guntur' },
    { name: 'ఆంధ్రప్రదేశ్', slug: 'andhra' },
    { name: 'తెలంగాణ', slug: 'telangana' }
];

async function runSchemaMigration() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        console.log("--- STARTING SCHEMA-BASED MIGRATION ---");

        // 1. Clean Collections
        const collections = ['categories', 'locations', 'news', 'news_media', 'comments', 'replies', 'polls', 'advertisements', 'magazines'];
        for (const col of collections) {
            console.log(`Cleaning collection: ${col}...`);
            await db.collection(col).deleteMany({});
        }

        // 2. Seed Categories
        console.log("Seeding Categories...");
        const catRes = await db.collection("categories").insertMany(categoryList);
        const categoriesMap = Object.fromEntries(categoryList.map((c, i) => [c.slug, catRes.insertedIds[i]]));

        // 3. Seed Locations
        console.log("Seeding Locations...");
        const locRes = await db.collection("locations").insertMany(locationList);
        const locationsMap = Object.fromEntries(locationList.map((l, i) => [l.slug, locRes.insertedIds[i]]));

        // 4. Seed News & Media
        console.log("Seeding News & Media...");
        for (const item of rawNewsData) {
            // Find primary category and location
            const catId = categoriesMap[item.tags.find(t => categoriesMap[t])] || null;
            const locId = locationsMap[item.tags.find(t => locationsMap[t])] || null;

            const newsItem = {
                title: item.title,
                description: item.description,
                category_id: catId,
                location_id: locId,
                tags: item.tags,
                created_at: new Date(),
                status: 'published'
            };

            const nRes = await db.collection("news").insertOne(newsItem);
            const newsId = nRes.insertedId;

            // Media
            await db.collection("news_media").insertOne({
                news_id: newsId,
                url: item.image,
                type: item.image.endsWith('.mp4') ? 'video' : 'image',
                is_primary: true
            });

            // Seed a sample comment for each news
            const cRes = await db.collection("comments").insertOne({
                news_id: newsId,
                user_id: "sample_user_1",
                text: "Great update!",
                timestamp: new Date()
            });

            // Sample reply
            await db.collection("replies").insertOne({
                comment_id: cRes.insertedId,
                user_id: "sample_user_2",
                text: "I agree!",
                timestamp: new Date()
            });
        }

        // 5. Seed Polls
        console.log("Seeding Polls...");
        await db.collection("polls").insertOne({
            question: "మీరు ఏ వార్తలను ఎక్కువగా ఇష్టపడతారు?",
            options: [
                { id: "1", text: "మెయిన్ న్యూస్", votes: 120 },
                { id: "2", text: "సినిమా", votes: 85 }
            ],
            created_at: new Date()
        });

        // 6. Seed Advertisements
        console.log("Seeding Advertisements...");
        await db.collection("advertisements").insertOne({
            title: "Special Promotion",
            image_url: "23- Ad Page.png",
            target_link: "https://8knews.com",
            active: true
        });

        // 7. Seed Magazines
        console.log("Seeding Magazines...");
        await db.collection("magazines").insertOne({
            title: "8K Weekly",
            pages: [
                { page_no: 1, image_url: "Picture3.png" },
                { page_no: 2, image_url: "Picture4.png" }
            ]
        });

        console.log("--- MIGRATION COMPLETE ---");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.close();
    }
}

runSchemaMigration();
