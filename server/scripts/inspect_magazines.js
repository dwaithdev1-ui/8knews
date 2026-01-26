const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://dwaithdev1_db_user:wQCiM93vQKeMdHGl@cluster0.uwxui60.mongodb.net/knewsdb?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");
        // Check magazines
        const mags = await db.collection("magazines").find({}).toArray();
        console.log("Magazines Count:", mags.length);
        console.log("Sample Magazine:", JSON.stringify(mags[0], null, 2));

        // Check pages
        if (mags.length > 0) {
            const pages = await db.collection("magazine_pages").find({ magazine_id: mags[0]._id }).toArray();
            console.log("Pages for Magazine 0:", pages.length);
            console.log("Sample Page:", JSON.stringify(pages[0], null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
check();
