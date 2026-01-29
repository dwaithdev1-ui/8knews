const { MongoClient } = require('mongodb');
require('dotenv').config();
async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const news = await db.collection('news').find({}).sort({ created_at: -1 }).limit(5).toArray();
    console.log(JSON.stringify(news, null, 2));
    await client.close();
}
run();
