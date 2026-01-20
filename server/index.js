require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;

const toId = (id) => new ObjectId(id);

// Start Server Function
const startServer = async () => {
    try {
        db = await connectDB();

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();


// --- NEWS ENDPOINTS (JOINED) ---

app.get('/api/news', async (req, res) => {
    try {
        const news = await db.collection("news").aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "location_id",
                    foreignField: "_id",
                    as: "location"
                }
            },
            {
                $lookup: {
                    from: "news_media",
                    localField: "_id",
                    foreignField: "news_id",
                    as: "media"
                }
            },
            {
                $lookup: {
                    from: "fact_checks",
                    localField: "_id",
                    foreignField: "news_id",
                    as: "fact_check"
                }
            },
            {
                $lookup: {
                    from: "news_likes",
                    localField: "_id",
                    foreignField: "news_id",
                    as: "likes"
                }
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$fact_check", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    like_count: { $size: "$likes" }
                }
            },
            { $project: { likes: 0 } }
        ]).toArray();
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// --- INTERACTIONS ---

app.post('/api/news/:id/like', async (req, res) => {
    const { user_id } = req.body;
    try {
        await db.collection("news_likes").updateOne(
            { news_id: toId(req.params.id), user_id: toId(user_id) },
            { $set: { created_at: new Date() } },
            { upsert: true }
        );
        res.json({ success: true, message: "News liked" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/news/:id/share', async (req, res) => {
    const { user_id, platform } = req.body;
    try {
        await db.collection("news_shares").insertOne({
            news_id: toId(req.params.id),
            user_id: toId(user_id),
            platform,
            created_at: new Date()
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/news/:id/report', async (req, res) => {
    const { user_id, reason } = req.body;
    try {
        await db.collection("news_reports").insertOne({
            news_id: toId(req.params.id),
            user_id: toId(user_id),
            reason,
            status: "pending",
            created_at: new Date()
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/news/:id/bookmark', async (req, res) => {
    const { user_id } = req.body;
    try {
        await db.collection("bookmarks").updateOne(
            { news_id: toId(req.params.id), user_id: toId(user_id) },
            { $set: { created_at: new Date() } },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- COMMENTS & REPLIES ---

app.get('/api/news/:id/comments', async (req, res) => {
    try {
        const comments = await db.collection("comments").aggregate([
            { $match: { news_id: toId(req.params.id) } },
            {
                $lookup: {
                    from: "replies",
                    localField: "_id",
                    foreignField: "comment_id",
                    as: "replies"
                }
            },
            {
                $lookup: {
                    from: "comment_likes",
                    localField: "_id",
                    foreignField: "comment_id",
                    as: "likes"
                }
            },
            {
                $addFields: { like_count: { $size: "$likes" } }
            },
            { $project: { likes: 0 } }
        ]).toArray();
        res.json(comments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- USER STATE & LOCATIONS ---

app.get('/api/users/:id/state', async (req, res) => {
    try {
        const state = await db.collection("user_app_state").findOne({ user_id: toId(req.params.id) });
        res.json(state);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id/locations', async (req, res) => {
    try {
        const locations = await db.collection("user_locations").aggregate([
            { $match: { user_id: toId(req.params.id) } },
            {
                $lookup: {
                    from: "locations",
                    localField: "location_id",
                    foreignField: "_id",
                    as: "details"
                }
            },
            { $unwind: "$details" }
        ]).toArray();
        res.json(locations);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- POLLS, ADS, MAGAZINES ---

app.get('/api/polls', async (req, res) => {
    try {
        const polls = await db.collection("polls").aggregate([
            {
                $lookup: {
                    from: "poll_options",
                    localField: "_id",
                    foreignField: "poll_id",
                    as: "options"
                }
            }
        ]).toArray();
        res.json(polls);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/magazines', async (req, res) => {
    try {
        const magazines = await db.collection("magazines").aggregate([
            {
                $lookup: {
                    from: "magazine_pages",
                    localField: "_id",
                    foreignField: "magazine_id",
                    as: "pages"
                }
            }
        ]).toArray();
        res.json(magazines);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ads', async (req, res) => {
    try {
        const ads = await db.collection("advertisements").find({ active: true }).toArray();
        res.json(ads);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMINS ---

app.get('/api/admins', async (req, res) => {
    try {
        const admins = await db.collection("admins").find({}).toArray();
        res.json(admins);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await db.collection("admins").findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            // Check if it's a plain text password (for initial setup/migration)
            if (password === admin.password) {
                // Good, but we should hash it eventually
            } else {
                return res.status(401).json({ error: "Invalid credentials" });
            }
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET || 'secret8knews',
            { expiresIn: '1d' }
        );

        res.json({ success: true, token, admin: { email: admin.email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

