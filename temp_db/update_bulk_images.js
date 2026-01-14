const { MongoClient } = require('mongodb');
const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("knewsdb");

    // 1. Get all categories to find the IDs of exclusions
    const categories = await db.collection("categories").find({
        slug: { $in: ['wishes', 'cinema', 'whatsapp'] }
    }).toArray();
    const excludedCategoryIds = categories.map(c => c._id);

    console.log("Excluded category IDs:", excludedCategoryIds);

    // 2. Find news items that are NOT in these categories
    // Note: news items are linked to categories via the 'category_id' field in the 'news' collection
    // Or in some cases we might need to check multiple categories if the schema allows it.
    // In our migration, we usually set one category_id.

    const query = {
        category_id: { $nin: excludedCategoryIds }
    };

    const newsItems = await db.collection("news").find(query).toArray();
    console.log(`Found ${newsItems.length} items to update.`);

    let updatedCount = 0;
    for (const item of newsItems) {
        // Update the primary media for this news item
        const result = await db.collection("news_media").updateMany(
            { news_id: item._id, is_primary: true },
            { $set: { url: 'news_hero.png' } }
        );
        updatedCount += result.modifiedCount;
    }

    console.log(`Successfully updated ${updatedCount} media records to news_hero.png.`);

    await client.close();
}
run().catch(console.error);
