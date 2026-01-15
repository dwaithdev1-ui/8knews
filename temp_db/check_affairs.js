const { MongoClient } = require('mongodb');
const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const cat = await db.collection("categories").findOne({ slug: "affairs" });
        console.log("CATEGORY_CHECK:", cat ? "FOUND" : "NOT_FOUND", JSON.stringify(cat));

        const count = await db.collection("news").countDocuments({ tags: "affairs" });
        console.log("NEWS_COUNT_WITH_TAG:", count);

        if (cat) {
            const linkedCount = await db.collection("news").countDocuments({ category_id: cat._id });
            console.log("NEWS_COUNT_LINKED:", linkedCount);
        }
    } finally {
        await client.close();
    }
}
run();
