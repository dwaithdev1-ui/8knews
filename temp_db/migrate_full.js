const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const rawNewsData = [
    { id: 'main-1', title: 'మెయిన్ న్యూస్: ప్రపంచ ఆర్థిక వ్యవస్థలో పెను మార్పులు', description: 'అంతర్జాతీయ మార్కెట్లలో చోటు చేసుకుంటున్న మార్పులు భారత ఆర్థిక వ్యవస్థపై ఎలాంటి ప్రభావం చూపుతాయో విశ్లేషించండి.', image: '05-Down to up scroll pop up.png', tags: ['main', 'trending'] },
    { id: 'main-2', title: 'దేశవ్యాప్తంగా నూతన విద్యా విధానం అమలు', description: 'ప్రభుత్వం ప్రకటించిన నూతన విద్యా విధానం వల్ల విద్యార్థులకు కలిగే ప్రయోజనాలు మరియు మార్పుల గురించి తెలుసుకోండి.', image: '06-8K News.png', tags: ['main', 'trending'] },
    { id: 'main-3', title: 'భారత అంతరిక్ష పరిశోధనలో మరో మైలురాయి', description: 'ఇస్రో ప్రయోగించిన సరికొత్త శాటిలైట్ మరుసటి కక్ష్యలోకి ప్రవేశించి విజయవంతంగా పని చేస్తోంది.', image: '07-Up to down scroll.png', tags: ['main', 'trending'] }
];

const categoryList = [
    { name: 'మెయిన్ న్యూస్', slug: 'main' },
    { name: 'సినిమా', slug: 'cinema' },
    { name: 'వ్యవసాయం', slug: 'agriculture' },
    { name: 'ట్రెండింగ్ న్యూస్', slug: 'trending' }
];

const locationList = [
    { name: 'హైదరాబాద్', slug: 'hyderabad' },
    { name: 'గుంటూరు', slug: 'guntur' }
];

async function runFullMigration() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        console.log("--- STARTING FULL ER-STRUCTURE MIGRATION ---");

        // 1. Clean ALL Collections from ER Diagram
        const allCollections = [
            'users', 'categories', 'locations', 'news', 'news_media',
            'comments', 'replies', 'comment_likes',
            'news_likes', 'news_shares', 'news_reports', 'bookmarks',
            'polls', 'poll_options', 'poll_votes',
            'advertisements', 'magazines', 'magazine_pages'
        ];

        for (const col of allCollections) {
            console.log(`Cleaning collection: ${col}...`);
            await db.collection(col).deleteMany({});
        }

        // 2. Seed Users
        console.log("Seeding Users...");
        const userRes = await db.collection("users").insertOne({
            name: "Test User",
            email: "test@8knews.com",
            location: "Hyderabad",
            created_at: new Date()
        });
        const userId = userRes.insertedId;

        // 3. Seed Metadata (Categories & Locations)
        console.log("Seeding Metadata...");
        const catRes = await db.collection("categories").insertMany(categoryList);
        const categoriesMap = Object.fromEntries(categoryList.map((c, i) => [c.slug, catRes.insertedIds[i]]));

        const locRes = await db.collection("locations").insertMany(locationList);
        const locationsMap = Object.fromEntries(locationList.map((l, i) => [l.slug, locRes.insertedIds[i]]));

        // 4. Seed News and its related interactions
        console.log("Seeding News and Interactions...");
        for (const item of rawNewsData) {
            const catId = categoriesMap[item.tags.find(t => categoriesMap[t])] || null;
            const locId = locationsMap[item.tags.find(t => locationsMap[t])] || null;

            const nRes = await db.collection("news").insertOne({
                title: item.title,
                description: item.description,
                category_id: catId,
                location_id: locId,
                tags: item.tags,
                created_at: new Date(),
                status: 'published'
            });
            const newsId = nRes.insertedId;

            // Media
            await db.collection("news_media").insertOne({
                news_id: newsId,
                url: item.image,
                type: 'image',
                is_primary: true
            });

            // USER -> NEWS interactions
            await db.collection("news_likes").insertOne({ news_id: newsId, user_id: userId, created_at: new Date() });
            await db.collection("news_shares").insertOne({ news_id: newsId, user_id: userId, platform: 'whatsapp', created_at: new Date() });
            await db.collection("bookmarks").insertOne({ news_id: newsId, user_id: userId, created_at: new Date() });

            // Comment tree
            const cRes = await db.collection("comments").insertOne({
                news_id: newsId,
                user_id: userId,
                text: "Insightful news!",
                created_at: new Date()
            });
            const commentId = cRes.insertedId;

            await db.collection("comment_likes").insertOne({ comment_id: commentId, user_id: userId });

            await db.collection("replies").insertOne({
                comment_id: commentId,
                user_id: userId,
                text: "Thanks for sharing.",
                created_at: new Date()
            });
        }

        // 5. Seed Polls with Options and Votes
        console.log("Seeding Polls...");
        const pRes = await db.collection("polls").insertOne({
            question: "Which feature do you like most?",
            created_at: new Date()
        });
        const pollId = pRes.insertedId;

        const poRes = await db.collection("poll_options").insertMany([
            { poll_id: pollId, text: "Live News", order: 1 },
            { poll_id: pollId, text: "Polls", order: 2 }
        ]);

        await db.collection("poll_votes").insertOne({
            poll_id: pollId,
            option_id: poRes.insertedIds[0],
            user_id: userId,
            created_at: new Date()
        });

        // 6. Seed Magazines and Advertisement
        console.log("Seeding Magazines & Ads...");
        const mRes = await db.collection("magazines").insertOne({ title: "Summer Edition 2024", icon: "book.png" });
        await db.collection("magazine_pages").insertMany([
            { magazine_id: mRes.insertedId, page_no: 1, image_url: "page1.png" },
            { magazine_id: mRes.insertedId, page_no: 2, image_url: "page2.png" }
        ]);

        await db.collection("advertisements").insertOne({
            title: "8K Premium Launch",
            image_url: "ad_banner.png",
            active: true,
            created_at: new Date()
        });

        console.log("--- FULL ER MIGRATION COMPLETE ---");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.close();
    }
}

runFullMigration();
