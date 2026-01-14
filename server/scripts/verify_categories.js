const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function verify() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const categories = await db.collection("categories").find({}).toArray();
        const catMap = {};
        categories.forEach(c => catMap[c._id.toString()] = { slug: c.slug, name: c.name });

        const news = await db.collection("news").find({}).toArray();

        const output = news.map(n => ({
            title: n.title,
            tags: n.tags,
            category_slug: n.category_id ? (catMap[n.category_id.toString()]?.slug || 'MISSING') : 'NULL'
        }));

        const flagged = output.filter(o => o.category_slug === 'affairs' || o.category_slug === 'lifestyle');
        console.log("Flagged Items Count:", flagged.length);
        console.log(JSON.stringify(flagged, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

verify();
