require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkNews() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('knewsdb');
        const news = await db.collection('news').find({ status: 'published' }).toArray();
        console.log(`Found ${news.length} published news items.`);
        news.forEach(n => {
            console.log(`- ID: ${n._id}, Title: ${n.title}, CreatedAt: ${n.created_at}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkNews();
