const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function fixForced() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const categories = await db.collection("categories").find({}).toArray();
        const slugToId = {};
        categories.forEach(c => slugToId[c.slug] = c._id);

        const affairsId = slugToId['affairs'];
        const lifestyleId = slugToId['lifestyle'];

        console.log(`Affairs ID: ${affairsId}`);
        console.log(`Lifestyle ID: ${lifestyleId}`);

        if (!affairsId || !lifestyleId) {
            console.error("Missing category IDs!");
            return;
        }

        // Fix Affairs
        const affairsCursor = db.collection("news").find({ tags: "affairs" });
        for await (const doc of affairsCursor) {
            if (!doc.category_id || doc.category_id.toString() !== affairsId.toString()) {
                console.log(`Fixing Affairs: ${doc.title} (Was: ${doc.category_id})`);
                await db.collection("news").updateOne({ _id: doc._id }, { $set: { category_id: affairsId } });
            } else {
                console.log(`Affairs OK: ${doc.title}`);
            }
        }

        // Fix Lifestyle
        const lifeCursor = db.collection("news").find({ tags: "lifestyle" });
        for await (const doc of lifeCursor) {
            if (!doc.category_id || doc.category_id.toString() !== lifestyleId.toString()) {
                console.log(`Fixing Lifestyle: ${doc.title} (Was: ${doc.category_id})`);
                await db.collection("news").updateOne({ _id: doc._id }, { $set: { category_id: lifestyleId } });
            } else {
                console.log(`Lifestyle OK: ${doc.title}`);
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

fixForced();
