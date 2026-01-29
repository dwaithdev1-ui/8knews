const { MongoClient } = require('mongodb');
require('dotenv').config();
async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const collection = db.collection('categories');
    // Ensure both exist or rename if needed
    const bhakthi = await collection.findOne({ slug: 'bhakthi' });
    if (bhakthi) {
        await collection.updateOne({ slug: 'bhakthi' }, { $set: { slug: 'bhakti' } });
        console.log('Renamed bhakthi to bhakti');
    }
    const bhakti = await collection.findOne({ slug: 'bhakti' });
    if (!bhakti) {
        await collection.insertOne({ name: 'Bhakti', slug: 'bhakti', created_at: new Date(), updated_at: new Date() });
        console.log('Inserted bhakti');
    }
    await client.close();
}
run();
