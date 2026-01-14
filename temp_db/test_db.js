const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to database...");
        await client.connect();
        console.log("Connected successfully!");

        const db = client.db("knewsdb");
        // List collections to verify access
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        await client.close();
    }
}

run();
