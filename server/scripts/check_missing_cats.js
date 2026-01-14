const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function checkMissing() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const count = await db.collection("news").countDocuments({
            $or: [
                { category_id: { $exists: false } },
                { category_id: null }
            ]
        });

        console.log(`News with missing/null category_id: ${count}`);

        if (count > 0) {
            const items = await db.collection("news").find({
                $or: [
                    { category_id: { $exists: false } },
                    { category_id: null }
                ]
            }).project({ title: 1, tags: 1 }).toArray();
            console.log(JSON.stringify(items, null, 2));
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkMissing();
