const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";

const newCategories = [
    { name: "Andhra Pradesh", slug: "andhra" },
    { name: "Telangana", slug: "telangana" },
    { name: "National", slug: "national" },
    { name: "Fact Check", slug: "fact_check" },
    { name: "Polls", slug: "polls" },
    { name: "Digital Magazines", slug: "digital_magazines" }
];

async function seedCategories() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        const collection = db.collection("categories");

        console.log("Connected to DB...");

        for (const cat of newCategories) {
            const exists = await collection.findOne({ slug: cat.slug });
            if (!exists) {
                await collection.insertOne({
                    name: cat.name,
                    slug: cat.slug,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                console.log(`Added category: ${cat.name} (${cat.slug})`);
            } else {
                console.log(`Category exists: ${cat.name} (${cat.slug})`);
            }
        }

        console.log("Category seeding complete.");

    } catch (err) {
        console.error("Error seeding categories:", err);
    } finally {
        await client.close();
    }
}

seedCategories();
