const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function checkUnmigrated() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const items = await db.collection("news").find({ migrated: { $ne: true } }).toArray();
        console.log("Unmigrated Items:", items.length);
        console.log(JSON.stringify(items, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkUnmigrated();
