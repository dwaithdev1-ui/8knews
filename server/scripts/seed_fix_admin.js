const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";

async function fixAdmin() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const admins = db.collection('admins');

        const email = "ingestor@8knews.com";
        const password = "password123";
        // const hashedPassword = await bcrypt.hash(password, 10); // Optional if you want hashing

        const result = await admins.updateOne(
            { email },
            {
                $set: {
                    password: password, // Plain text as per server logic
                    role: "content_inputter",
                    name: "Content Ingestor",
                    updated_at: new Date()
                },
                $setOnInsert: {
                    created_at: new Date()
                }
            },
            { upsert: true }
        );

        console.log("Admin fixed/created:", result.upsertedId || result.modifiedCount);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
        process.exit(0);
    }
}

fixAdmin();
