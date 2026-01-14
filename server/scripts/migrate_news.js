const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const util = require('util');

const logFile = fs.createWriteStream(path.join(__dirname, 'migration.log'), { flags: 'w' });
const log = (d) => {
    process.stdout.write(util.format(d) + '\n');
    logFile.write(util.format(d) + '\n');
};

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const NEWSFEED_PATH = path.join(__dirname, '../../app/newsfeed.tsx');

const TAG_MAPPING = {
    'national': 'main',
    'trending': 'trending',
    'main': 'main',
    'cinema': 'cinema',
    'bhakti': 'bhakti',
    'agriculture': 'agriculture',
    'sports': 'sports',
    'wishes': 'whatsapp',
    'whatsapp': 'whatsapp',
    'local': 'local',
    'guntur': 'local',
    'vijayawada': 'local',
    'hyderabad': 'local',
    'andhra': 'local',
    'telangana': 'local',
    'affairs': 'affairs',
    'lifestyle': 'lifestyle',
    'photos': 'lifestyle',
    'videos': 'main',
};

async function migrate() {
    log("Starting Migration...");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        log("Connected to DB");

        const categories = await db.collection("categories").find({}).toArray();
        const slugToId = {};
        categories.forEach(c => slugToId[c.slug] = c._id);
        log("Loaded Categories: " + Object.keys(slugToId).join(', '));

        log("Reading file: " + NEWSFEED_PATH);
        let content = fs.readFileSync(NEWSFEED_PATH, 'utf8');

        const startMarker = 'const DEFAULT_NEWS_DATA = [';
        const startMarkerIndex = content.indexOf(startMarker);
        if (startMarkerIndex === -1) throw new Error("Could not find start marker");

        // We want the content STARTING from the '['
        const arrayStartIndex = startMarkerIndex + startMarker.length - 1;

        // Find balanced end
        let openBrackets = 0;
        let arrayContent = '';
        let foundEnd = false;

        for (let i = arrayStartIndex; i < content.length; i++) {
            const char = content[i];
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;

            arrayContent += char;

            if (openBrackets === 0) {
                foundEnd = true;
                break;
            }
        }

        if (!foundEnd) throw new Error("Could not find end of array");

        log("Array extracted.");

        // Sanitize
        // 1. Replace require(...) with string
        let sanitized = arrayContent.replace(/require\(\s*['"](.*?)['"]\s*\)/g, '"$1"');

        // 3. Eval
        log("Evaluating...");

        let newsData;
        try {
            newsData = eval("(" + sanitized + ")");
        } catch (e) {
            log("Eval failed: " + e.message);
            throw e;
        }

        log(`Parsed ${newsData.length} news items.`);

        let updatedCount = 0;
        let insertedCount = 0;

        for (const item of newsData) {
            let categoryId = null;

            for (const tag of item.tags) {
                const mapped = TAG_MAPPING[tag.toLowerCase()] || tag.toLowerCase();
                if (slugToId[mapped]) {
                    categoryId = slugToId[mapped];
                    break;
                }
            }

            if (!categoryId) {
                if (slugToId['main']) {
                    categoryId = slugToId['main'];
                }
            }

            const newsDoc = {
                title: item.title,
                description: item.description,
                category_id: categoryId,
                tags: item.tags,
                is_full_card: item.isFullCard || false,
                is_video: item.isVideo || false,
                migrated: true,
                updated_at: new Date()
            };

            const existing = await db.collection("news").findOne({ title: item.title });
            let newsId;

            if (existing) {
                await db.collection("news").updateOne(
                    { _id: existing._id },
                    { $set: newsDoc }
                );
                newsId = existing._id;
                updatedCount++;
            } else {
                newsDoc.created_at = new Date();
                const result = await db.collection("news").insertOne(newsDoc);
                newsId = result.insertedId;
                insertedCount++;
            }

            // Media insertion logic
            if (item.image) {
                await db.collection("news_media").deleteMany({ news_id: newsId });
                await db.collection("news_media").insertOne({
                    news_id: newsId,
                    url: item.image,
                    type: item.isVideo ? 'video' : 'image',
                    is_primary: true,
                    created_at: new Date()
                });
            }
            if (item.video) {
                await db.collection("news_media").insertOne({
                    news_id: newsId,
                    url: item.video,
                    type: 'video',
                    is_primary: false,
                    created_at: new Date()
                });
            }
        }

        log(`Migration Complete: ${insertedCount} inserted, ${updatedCount} updated.`);

    } catch (err) {
        log("Migration Error: " + err.message);
        log(err.stack);
    } finally {
        await client.close();
        log("Done.");
        process.exit(0);
    }
}

migrate();
