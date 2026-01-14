const { MongoClient } = require('mongodb');

const uri = "mongodb://news8kdbuser:QzKg09S1EiKy-VWmPBOxm7q0gbxP9ds3WwTp6fWrszzmk_KL@be9a526b-891c-4295-bdfb-a64a74b98b8d.nam5.firestore.goog:443/knewsdb?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

async function run() {
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to database...");
        await client.connect();
        const db = client.db("knewsdb");
        const newsCollection = db.collection("news");

        const agricultureNewItems = [
            {
                title: 'వ్యవసాయంలో డ్రోన్ టెక్నాలజీ వినియోగం',
                description: 'రైతులకు సాగులో సహాయం చేయడానికి ప్రభుత్వం ప్రవేశపెట్టిన మల్టీ-పర్పస్ డ్రోన్స్ మంచి ఫలితాలను ఇస్తున్నాయి.',
                tags: ['agriculture', 'trending'],
                isFullCard: true,
                media: [{ type: 'image', url: 'pad_screenshot_P4V5D7Z8J6.webp', is_primary: true }]
            },
            {
                title: 'సేంద్రీయ సాగుతో అధిక లాభాలు: రైతుల అనుభవం',
                description: 'కెమికల్స్ వాడకుండా సహజ సిద్ధంగా పండించిన పంటలకు మార్కెట్లో మంచి గిరాకీ ఏర్పడింది.',
                tags: ['agriculture', 'trending'],
                isFullCard: true,
                media: [{ type: 'image', url: 'premium_photo-1682092016074-b136e1acb26e.jpg', is_primary: true }]
            },
            {
                title: 'గుంటూరు మిర్చి యార్డ్‌లో రికార్డ్ లావాదేవీలు',
                description: 'ఈ ఏడాది మిర్చి దిగుబడి ఆశాజనకంగా ఉండటంతో రైతులు హర్షం వ్యక్తం చేస్తున్నారు.',
                tags: ['agriculture', 'guntur', 'local'],
                isFullCard: true,
                media: [{ type: 'image', url: 'Picture5.png', is_primary: true }]
            }
        ];

        for (const item of agricultureNewItems) {
            const existing = await newsCollection.findOne({ title: item.title });
            if (existing) {
                console.log(`Updating existing item: ${item.title}`);
                await newsCollection.updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            description: item.description,
                            tags: item.tags,
                            isFullCard: item.isFullCard,
                            media: item.media
                        }
                    }
                );
            } else {
                console.log(`Inserting new item: ${item.title}`);
                await newsCollection.insertOne({
                    ...item,
                    created_at: new Date(),
                    like_count: 50
                });
            }
        }

        console.log("Done updating agriculture items.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

run();
