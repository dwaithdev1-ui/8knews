const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function addMissingCollections() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        console.log("--- ADDING MISSING COLLECTIONS (NO DELETE) ---");

        // 1. admins
        const adminsCount = await db.collection("admins").countDocuments();
        if (adminsCount === 0) {
            console.log("Adding sample admin...");
            await db.collection("admins").insertOne({
                name: "Admin User",
                email: "admin@8knews.com",
                role: "super_admin",
                created_at: new Date()
            });
        }

        // 2. user_app_state
        const stateCount = await db.collection("user_app_state").countDocuments();
        if (stateCount === 0) {
            console.log("Adding sample user_app_state...");
            const testUser = await db.collection("users").findOne({});
            if (testUser) {
                await db.collection("user_app_state").insertOne({
                    user_id: testUser._id,
                    theme: "dark",
                    notifications_enabled: true,
                    language: "telugu",
                    onboarding_complete: true,
                    last_active: new Date()
                });
            }
        }

        // 3. user_locations
        const userLocCount = await db.collection("user_locations").countDocuments();
        if (userLocCount === 0) {
            console.log("Adding sample user_locations...");
            const testUser = await db.collection("users").findOne({});
            const testLoc = await db.collection("locations").findOne({});
            if (testUser && testLoc) {
                await db.collection("user_locations").insertOne({
                    user_id: testUser._id,
                    location_id: testLoc._id,
                    is_primary: true
                });
            }
        }

        // 4. news_reports
        const reportCount = await db.collection("news_reports").countDocuments();
        if (reportCount === 0) {
            console.log("Adding sample news_report...");
            const testNews = await db.collection("news").findOne({});
            const testUser = await db.collection("users").findOne({});
            if (testNews && testUser) {
                await db.collection("news_reports").insertOne({
                    news_id: testNews._id,
                    user_id: testUser._id,
                    reason: "Inaccurate information",
                    status: "pending",
                    created_at: new Date()
                });
            }
        }

        // 5. fact_checks
        const factCount = await db.collection("fact_checks").countDocuments();
        if (factCount === 0) {
            console.log("Adding sample fact_check...");
            const testNewsArr = await db.collection("news").find({}).limit(5).toArray();
            for (const n of testNewsArr) {
                await db.collection("fact_checks").insertOne({
                    news_id: n._id,
                    is_verified: true,
                    source: "8K Verify",
                    summary: "This news has been cross-referenced with local reports.",
                    updated_at: new Date()
                });
            }
        }

        console.log("--- ADDITION COMPLETE ---");

    } catch (err) {
        console.error("Operation failed:", err);
    } finally {
        await client.close();
    }
}

addMissingCollections();
