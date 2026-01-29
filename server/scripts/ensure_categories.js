const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const categoriesToAdd = [
    { name: "Photos", slug: "photos" },
    { name: "Videos", slug: "videos" },
    { name: "Bhakti", slug: "bhakthi" } // Ensure Bhakti has the right slug
];

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection("categories");

        for (const cat of categoriesToAdd) {
            const exists = await collection.findOne({ slug: cat.slug });
            if (!exists) {
                await collection.insertOne({
                    ...cat,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                console.log(`Added: ${cat.name} (${cat.slug})`);
            } else {
                console.log(`Exists: ${cat.name} (${cat.slug})`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
run();
