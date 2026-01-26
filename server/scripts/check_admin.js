const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        const admin = await db.collection("admins").findOne({ email: "ingestor@8knews.com" });
        console.log("Admin User:", admin);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
check();
