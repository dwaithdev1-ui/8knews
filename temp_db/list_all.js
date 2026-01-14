const { MongoClient } = require('mongodb');
const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("knewsdb");
    const news = await db.collection("news").find({}).toArray();
    for (const n of news) {
        const media = await db.collection("news_media").find({ news_id: n._id }).toArray();
        console.log(`ID: ${n._id}, Title: ${n.title}, Media: ${media.map(m => m.url).join(', ')}`);
    }
    await client.close();
}
run();
