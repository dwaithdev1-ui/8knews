const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function checkCategories() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        const categories = await db.collection("categories").find({}, { projection: { name: 1, slug: 1 } }).toArray();
        fs.writeFileSync(path.join(__dirname, 'categories_out.json'), JSON.stringify(categories, null, 2));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkCategories();
