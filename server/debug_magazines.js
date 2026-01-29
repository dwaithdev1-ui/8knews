require('dotenv').config({ path: './.env' });
const { MongoClient, ObjectId } = require('mongodb');

async function debug() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('knewsdb');

        console.log('Finding digital_magazines category...');
        const magCat = await db.collection('categories').findOne({ slug: 'digital_magazines' });
        console.log('Category Found:', JSON.stringify(magCat, null, 2));

        if (magCat) {
            console.log('Finding news with this category ID...');
            const newsItems = await db.collection('news').find({
                category_id: { $in: [magCat._id] }
            }).toArray();

            console.log('Found', newsItems.length, 'news items in this category.');
            newsItems.forEach(item => {
                console.log(`- Title: ${item.title}, ID: ${item._id}, catIds: ${item.category_id}`);
            });
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

debug();
