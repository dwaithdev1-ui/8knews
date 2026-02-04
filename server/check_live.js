const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('knewsdb');
        const news = await db.collection('news').find({ status: 'published' }).toArray();
        const categories = await db.collection('categories').find({}).toArray();
        const catMap = {};
        categories.forEach(c => {
            catMap[c._id.toString()] = c.slug;
        });

        console.log(`Found ${news.length} published news items.`);
        news.forEach(n => {
            const catIds = Array.isArray(n.category_id) ? n.category_id : [n.category_id];
            const slugs = catIds.map(id => catMap[id.toString()] || 'unknown');
            console.log(`- Title: ${n.title}\n  Slugs: ${slugs.join(',')}\n  Placement: ${n.placement}\n  Tags: ${JSON.stringify(n.tags)}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
check();
