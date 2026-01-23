const { MongoClient } = require('mongodb');

// URI from your server/index.js or environment
const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function inspect() {
    try {
        await client.connect();
        const db = client.db(); // Use default DB from URI
        const collection = db.collection('news');

        const items = await collection.find({}).limit(20).toArray();

        console.log(`Found ${items.length} items.`);
        items.forEach(item => {
            console.log(`ID: ${item._id}`);
            console.log(`   Title: ${item.title.substring(0, 30)}...`);
            console.log(`   Status: ${item.status}`);
            console.log(`   Tags: ${item.tags}`);
            console.log(`   Image: ${item.image}`);
            console.log(`   Media: ${JSON.stringify(item.media)}`);
            console.log('-------------------------------------------');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

inspect();
