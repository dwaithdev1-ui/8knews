const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function inspect() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        // Find one affairs news
        const news = await db.collection("news").findOne({ tags: "affairs" });
        console.log("--- News Item (Affairs) ---");
        // Print safely
        console.log("Title:", news.title);
        console.log("Category ID:", news.category_id);

        if (news && news.category_id) {
            const cat = await db.collection("categories").findOne({ _id: news.category_id });
            console.log("Found Category:", cat ? cat.name : "NOT FOUND");
        }

        console.log("\n--- Category: Affairs ---");
        const affCat = await db.collection("categories").findOne({ slug: "affairs" });
        console.log("Affairs Cat:", affCat);

        console.log("\n--- Category: Lifestyle ---");
        const lifeCat = await db.collection("categories").findOne({ slug: "lifestyle" });
        console.log("Lifestyle Cat:", lifeCat);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

inspect();
