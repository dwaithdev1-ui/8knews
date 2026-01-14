const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

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

async function checkMapping() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const categories = await db.collection("categories").find({}).toArray();
        const slugToId = {};
        categories.forEach(c => slugToId[c.slug] = c._id.toString());

        console.log("--- slugToId Map ---");
        Object.keys(slugToId).forEach(slug => {
            console.log(`${slug}: ${slugToId[slug]}`);
        });

        console.log("\n--- Category ID Check ---");
        const affairsId = slugToId['affairs'];
        const bhaktiId = slugToId['bhakti'];
        console.log(`Affairs ID: ${affairsId}`);
        console.log(`Bhakti ID:  ${bhaktiId}`);

        console.log("\n--- Mapping Check ---");
        const tagsToCheck = ['affairs', 'lifestyle', 'bhakti'];
        for (const tag of tagsToCheck) {
            const mapped = TAG_MAPPING[tag] || tag;
            const id = slugToId[mapped];
            console.log(`Tag '${tag}' maps to slug '${mapped}' -> ID: ${id}`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkMapping();
