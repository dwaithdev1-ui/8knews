const { MongoClient } = require('mongodb');
require('dotenv').config();

const ALL_LOCATIONS_DATA = [
    // TELANGANA
    { name: 'Hyderabad', telugu: 'హైదరాబాద్', state: 'TS' },
    { name: 'Secunderabad', telugu: 'సికింద్రాబాద్', state: 'TS' },
    { name: 'Kukatpally', telugu: 'కూకట్‌పల్లి', state: 'TS' },
    { name: 'Warangal', telugu: 'వరంగల్', state: 'TS' },
    { name: 'Khammam', telugu: 'ఖమ్మం', state: 'TS' },
    { name: 'Karimnagar', telugu: 'కరీంనగర్', state: 'TS' },
    { name: 'Nizamabad', telugu: 'నిజామాబాద్', state: 'TS' },
    { name: 'Mahabubnagar', telugu: 'మహబూబ్‌నగర్', state: 'TS' },
    { name: 'Nalgonda', telugu: 'నల్గొండ', state: 'TS' },
    { name: 'Adilabad', telugu: 'ఆదిలాబాద్', state: 'TS' },
    { name: 'Suryapet', telugu: 'సూర్యాపేట', state: 'TS' },
    { name: 'Siddipet', telugu: 'సిద్దిపేట', state: 'TS' },
    { name: 'Miryalaguda', telugu: 'మిర్యాలగూడ', state: 'TS' },
    { name: 'Jagtial', telugu: 'జగిత్యాల', state: 'TS' },
    { name: 'Mancherial', telugu: 'మంచిర్యాల', state: 'TS' },
    { name: 'Kothagudem', telugu: 'కోతగూడెం', state: 'TS' },
    { name: 'Bhadrachalam', telugu: 'భద్రాచలం', state: 'TS' },
    { name: 'Hanamkonda', telugu: 'హనుమకొండ', state: 'TS' },
    { name: 'Medak', telugu: 'మేడక్', state: 'TS' },
    { name: 'Sangareddy', telugu: 'సంగారెడ్డి', state: 'TS' },
    { name: 'Vikarabad', telugu: 'వికారాబాద్', state: 'TS' },

    // ANDHRA PRADESH
    { name: 'Vijayawada', telugu: 'విజయవాడ', state: 'AP' },
    { name: 'Visakhapatnam', telugu: 'విశాఖపట్నం', state: 'AP' },
    { name: 'Guntur', telugu: 'గుంటూరు', state: 'AP' },
    { name: 'Nellore', telugu: 'నెల్లూరు', state: 'AP' },
    { name: 'Kurnool', telugu: 'కర్నూలు', state: 'AP' },
    { name: 'Rajahmundry', telugu: 'రాజమండ్రి', state: 'AP' },
    { name: 'Tirupati', telugu: 'తిరుపతి', state: 'AP' },
    { name: 'Kadapa', telugu: 'కడప', state: 'AP' },
    { name: 'Kakinada', telugu: 'కాకినాడ', state: 'AP' },
    { name: 'Anantapur', telugu: 'అనంతపురం', state: 'AP' },
    { name: 'Vizianagaram', telugu: 'విజయనగరం', state: 'AP' },
    { name: 'Eluru', telugu: 'ఏలూరు', state: 'AP' },
    { name: 'Ongole', telugu: 'ఒంగోలు', state: 'AP' },
    { name: 'Srikakulam', telugu: 'శ్రీకాకుళం', state: 'AP' },
    { name: 'Machilipatnam', telugu: 'మచిలీపట్నం', state: 'AP' },
    { name: 'Chittoor', telugu: 'చిత్తూరు', state: 'AP' },
    { name: 'Bhimavaram', telugu: 'భీమవరం', state: 'AP' },
    { name: 'Proddatur', telugu: 'ప్రొద్దుటూరు', state: 'AP' },
    { name: 'Nandyal', telugu: 'నంద్యాల', state: 'AP' },
    { name: 'Hindupur', telugu: 'హిందూపురం', state: 'AP' },
    { name: 'Tenali', telugu: 'తెనాలి', state: 'AP' },
    { name: 'Amaravati', telugu: 'అమరావతి', state: 'AP' },
    { name: 'Gudivada', telugu: 'గుడివాడ', state: 'AP' },
];

async function seed() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('knewsdb');
        const collection = db.collection('locations');

        console.log(`Feeding ${ALL_LOCATIONS_DATA.length} locations...`);

        for (const loc of ALL_LOCATIONS_DATA) {
            // Upsert based on name
            await collection.updateOne(
                { name: loc.name },
                { $set: loc },
                { upsert: true }
            );
        }

        console.log('Done seeding locations.');
    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await client.close();
    }
}

seed();
