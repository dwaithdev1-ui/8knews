const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function checkSpecific() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("knewsdb");

        const categories = await db.collection("categories").find({}).toArray();
        const catMap = {};
        categories.forEach(c => catMap[c._id.toString()] = c.slug);

        const titles = [
            'కరెంటు అఫైర్స్: రాష్ట్ర బడ్జెట్ విశ్లేషణ',
            'మెరుగైన పాలన కోసం డిజిటల్ రిఫార్మ్స్',
            'ఆరోగ్యకరమైన ఆహారపు అలవాట్లు: చిట్కాలు',
            'మోడ్రన్ హోమ్ ఇంటీరియర్ డిజైన్స్ 2024'
        ];

        for (const title of titles) {
            const news = await db.collection("news").findOne({ title: title });
            if (news) {
                const cId = news.category_id ? news.category_id.toString() : 'null';
                // Only print essential info cleanly
                console.log(`TITLE: ${title.substring(0, 15)}...`);
                console.log(`SLUG: ${catMap[cId] || 'UNKNOWN'}`);
                console.log(`TAGS: ${news.tags}`);
                console.log('-----');
            } else {
                console.log(`NOT FOUND: ${title}`);
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

checkSpecific();
