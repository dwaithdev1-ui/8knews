const { MongoClient } = require('mongodb');

async function checkNews() {
    const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('knewsdb');
        const news = await db.collection('news').find({}).toArray();
        console.log(`Found ${news.length} total news items.`);
        news.forEach(n => {
            console.log(`- ID: ${n._id}, Title: ${n.title}, Status: ${n.status}, CreatedAt: ${n.created_at}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkNews();
