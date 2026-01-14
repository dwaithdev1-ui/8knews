const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        // Get all categories to map name/slug
        const categories = await db.collection("categories").find({}).toArray();
        const catMap = {};
        categories.forEach(c => catMap[c._id.toString()] = c.slug);

        const distribution = await db.collection("news").aggregate([
            {
                $group: {
                    _id: "$category_id",
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        console.log("News Distribution by Category:");
        distribution.forEach(d => {
            const catId = d._id ? d._id.toString() : "null";
            const slug = catMap[catId] || "UNKNOWN";
            console.log(`- ${slug}: ${d.count}`);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

check();
