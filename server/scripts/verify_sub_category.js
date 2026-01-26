const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const API_URL = 'http://localhost:3000/api';
const MONGO_URI = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";

async function verify() {
    let client;
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: 'ingestor@8knews.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Login successful.");

        // 2. Get Categories
        console.log("Fetching categories...");
        const catRes = await axios.get(`${API_URL}/categories`);
        const digitalMag = catRes.data.find(c => c.slug === 'digital_magazines');

        if (!digitalMag) {
            throw new Error("Digital Magazines category not found!");
        }
        console.log("Found Digital Magazines ID:", digitalMag._id);

        // 3. Create News
        console.log("Creating test news item...");
        const newsData = {
            title: "Test Digital Magazine News",
            description: "Testing sub-category saving logic.",
            category_id: digitalMag._id,
            sub_category: "agriculture",
            language: "te"
        };

        const createRes = await axios.post(`${API_URL}/news`, newsData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!createRes.data.success) {
            throw new Error("Failed to create news via API");
        }
        const newsId = createRes.data.id;
        console.log("News created with ID:", newsId);

        // 4. Verify in DB
        console.log("Verifying in Database...");
        client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db("knewsdb");
        const newsItem = await db.collection("news").findOne({ _id: new ObjectId(newsId) });

        if (!newsItem) {
            throw new Error("News item not found in DB");
        }

        console.log("Retrieved Item:");
        console.log("Title:", newsItem.title);
        console.log("Category ID:", newsItem.category_id);
        console.log("Sub Category:", newsItem.sub_category);

        if (newsItem.sub_category === 'agriculture') {
            console.log("SUCCESS: Sub-category saved correctly!");
        } else {
            console.error("FAILURE: Sub-category mismatch. Expected 'agriculture', got:", newsItem.sub_category);
        }

        // 5. Cleanup
        await db.collection("news").deleteOne({ _id: newsItem._id });
        console.log("Test item cleaned up.");

    } catch (err) {
        console.error("Verification Failed:", err.message);
        if (err.response) {
            console.error("API Response:", err.response.data);
        }
    } finally {
        if (client) await client.close();
    }
}

verify();
