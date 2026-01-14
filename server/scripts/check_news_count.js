const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        const count = await db.collection("news").countDocuments({});
        console.log("Total News Count:", count);

        const migrated = await db.collection("news").countDocuments({ migrated: true });
        console.log("Migrated News Count:", migrated);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

check();
