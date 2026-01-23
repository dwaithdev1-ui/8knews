const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/8knews";

async function checkAdmin() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const admins = db.collection('admins');

        const email = "ingestor@8knews.com";
        const user = await admins.findOne({ email });

        if (!user) {
            console.log(`User ${email} NOT FOUND. Creating...`);
            // Create default ingestor
            await admins.insertOne({
                email,
                password: "password123", // Plain text for now to match logic, or hash it
                role: "content_inputter",
                name: "Content Ingestor",
                created_at: new Date()
            });
            console.log("User created with password: password123");
        } else {
            console.log(`User ${email} FOUND.`);
            console.log("Role:", user.role);
            console.log("Password (hashed/plain):", user.password);

            // Optional: Reset password to known value if needed
            // await admins.updateOne({ email }, { $set: { password: "password123" } });
            // console.log("Password reset to 'password123'");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

checkAdmin();
