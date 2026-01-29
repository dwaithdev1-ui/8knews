const { MongoClient } = require('mongodb');
async function run() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('8knews');
        const cats = await db.collection('categories').find({}).toArray();
        console.log('CATEGORIES_START');
        cats.forEach(c => console.log(`${c.name}|${c.slug}`));
        console.log('CATEGORIES_END');
    } finally {
        await client.close();
    }
}
run();
