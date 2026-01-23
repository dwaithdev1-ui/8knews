const { MongoClient } = require('mongodb');

async function checkNews() {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db('8knews');
        const news = await db.collection('news').find({}).toArray();
        console.log(JSON.stringify(news, null, 2));
    } finally {
        await client.close();
    }
}

checkNews();
