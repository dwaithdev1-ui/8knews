const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to database...");
        await client.connect();
        const db = client.db("knewsdb");
        const newsCollection = db.collection("news");

        // Check if Raja Saab exists
        const existing = await newsCollection.findOne({ title: 'ది రాజా సాబ్' });

        if (existing) {
            console.log("Raja Saab already exists, updating...");
            await newsCollection.updateOne(
                { _id: existing._id },
                {
                    $set: {
                        description: '',
                        isFullCard: true,
                        tags: ['cinema', 'trending']
                    }
                }
            );
        } else {
            console.log("Creating new Raja Saab item...");
            await newsCollection.insertOne({
                title: 'ది రాజా సాబ్',
                description: '',
                isFullCard: true,
                tags: ['cinema', 'trending'],
                media: [{ type: 'image', url: 'The-Raja-Saab---27x40.jpg', is_primary: true }], // Local mapping fallback relies on title usually, but having media helps
                created_at: new Date(),
                like_count: 500
            });
        }

        console.log("Done.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

run();
