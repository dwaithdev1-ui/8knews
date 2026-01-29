const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection("categories");

        const adCat = { name: "Ad / Sponsored", slug: "ads" };
        const exists = await collection.findOne({ slug: adCat.slug });

        if (!exists) {
            await collection.insertOne({
                ...adCat,
                created_at: new Date(),
                updated_at: new Date()
            });
            console.log(`Added category: ${adCat.name} (${adCat.slug})`);
        } else {
            console.log(`Category exists: ${adCat.name} (${adCat.slug})`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
run();
