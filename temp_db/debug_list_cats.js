const { MongoClient } = require('mongodb');
const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        const cats = await db.collection("categories").find().toArray();
        console.log("CATEGORIES_START");
        console.log(JSON.stringify(cats, null, 2));
        console.log("CATEGORIES_END");
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
