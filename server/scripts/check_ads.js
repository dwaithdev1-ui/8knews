const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();

    const ads = await db.collection('news').find({ type: 'ad' }).toArray();
    console.log(`Found ${ads.length} ads in database:`);
    ads.forEach(ad => {
        console.log(`\nID: ${ad._id}`);
        console.log(`Title: ${ad.title}`);
        console.log(`Type: ${ad.type}`);
        console.log(`Redirect URL: ${ad.redirect_url}`);
        console.log(`Placement: ${ad.placement}`);
        console.log(`Status: ${ad.status}`);
    });

    await client.close();
}

run().catch(console.error);
