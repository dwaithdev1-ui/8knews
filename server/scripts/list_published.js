const { MongoClient } = require('mongodb');
require('dotenv').config();
async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const news = await db.collection('news').find({ status: 'published' }).toArray();
    console.log(`Found ${news.length} published items`);
    news.forEach(n => console.log(`- ${n.title} (ID: ${n._id})`));
    await client.close();
}
run();
