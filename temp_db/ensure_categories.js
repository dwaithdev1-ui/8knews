const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const requiredCategories = [
    { name: 'విషెస్', slug: 'wishes' },
    { name: 'మొయిన న్యూస్', slug: 'main' },
    { name: 'ట్రెండింగ్ న్యూస్', slug: 'trending' },
    { name: 'లోకల్ న్యూస్', slug: 'local' },
    { name: 'వాట్సాప్ స్టేటస్', slug: 'whatsapp' },
    { name: 'భక్తి', slug: 'bhakti' },
    { name: 'Current Affairs', slug: 'affairs' },
    { name: 'lifestyle', slug: 'lifestyle' },
    { name: 'వ్యవసాయం', slug: 'agriculture' },
    { name: 'సినిమా', slug: 'cinema' },
    { name: 'క్రీడలు', slug: 'sports' }
];

async function ensureCategories() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        console.log("--- ENSURING ALL REQUIRED CATEGORIES (UPSERT MODE) ---");

        for (const cat of requiredCategories) {
            const existing = await db.collection("categories").findOne({ slug: cat.slug });

            if (!existing) {
                console.log(`Inserting missing category: ${cat.slug} (${cat.name})`);
                await db.collection("categories").insertOne(cat);
            } else {
                console.log(`Updating existing category: ${cat.slug} -> ${cat.name}`);
                await db.collection("categories").updateOne(
                    { slug: cat.slug },
                    { $set: { name: cat.name } }
                );
            }
        }

        console.log("--- CATEGORY SYNC COMPLETE ---");

    } catch (err) {
        console.error("Operation failed:", err);
    } finally {
        await client.close();
    }
}

ensureCategories();
