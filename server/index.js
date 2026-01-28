require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

let db;

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

    jwt.verify(token, process.env.JWT_SECRET || 'secret8knews', (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

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
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let filter = { status: 'published' };

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret8knews');
                // If it's a valid admin/staff token, show everything
                if (decoded.role) {
                    filter = {};
                }
            } catch (authErr) {
                // Invalid token, stick to published filter
            }
        }

        const news = await db.collection("news").aggregate([
            { $match: filter },
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
            { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$fact_check", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    like_count: { $size: "$likes" },
                    categories: "$category" // Rename or keep as is? Let's keep it and adjust consumer
                }
            },
            { $project: { likes: 0 } }
        ]).toArray();
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

app.post('/api/news', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const {
            title, description, category_id, category_ids, sub_category,
            location_id, is_full_card, is_video, language, status, remarks,
            type, redirect_url, placement
        } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const creatorEmail = req.user.email;
        const creatorRole = req.user.role;

        // ... extraction logic ...
        let catIds = [];
        if (category_ids) {
            try {
                const parsed = typeof category_ids === 'string' ? JSON.parse(category_ids) : category_ids;
                catIds = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                catIds = [category_ids];
            }
        } else if (category_id) {
            catIds = [category_id];
        }

        if (catIds.length === 0) return res.status(400).json({ error: "At least one category is required" });

        const initialStatus = status || 'draft';
        const initialRemarks = remarks || (initialStatus === 'draft' ? 'Initial creation' : 'Submitted for review');

        const newItem = {
            title,
            description,
            category_id: catIds.map(id => new ObjectId(id)),
            sub_category: sub_category || null,
            location_id: location_id ? new ObjectId(location_id) : null,
            image: imageUrl,
            is_full_card: is_full_card === 'true',
            is_video: is_video === 'true',
            language: language || 'te',
            status: initialStatus,
            type: type || 'news', // 'news' or 'ad'
            redirect_url: redirect_url || null,
            placement: placement || 'trending', // Default placement
            share_count: 0, // Track photo shares
            created_by: creatorEmail,
            created_at: new Date(),
            updated_at: new Date(),
            history: [{
                status: initialStatus,
                date: new Date(),
                updated_by: creatorEmail,
                role: creatorRole,
                remarks: initialRemarks
            }]
        };

        const result = await db.collection("news").insertOne(newItem);
        const newsId = result.insertedId;

        if (imageUrl) {
            await db.collection("news_media").insertOne({
                news_id: newsId,
                type: is_video === 'true' ? 'video' : 'image',
                url: `http://localhost:3000${imageUrl}`,
                is_primary: true,
                created_at: new Date()
            });
        }

        res.json({ success: true, id: newsId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/news/:id/status', authenticateToken, async (req, res) => {
    const { status, remarks } = req.body;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    try {
        await db.collection("news").updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: { status, updated_at: new Date() },
                $push: {
                    history: {
                        status,
                        date: new Date(),
                        updated_by: userEmail,
                        role: userRole,
                        remarks: remarks || 'No remarks'
                    }
                }
            }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Increment share count and log share action for a news item
app.post('/api/news/:id/share', async (req, res) => {
    const { user_id, platform } = req.body;
    try {
        // 1. Increment share_count in the news document
        const result = await db.collection("news").findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $inc: { share_count: 1 } },
            { returnDocument: 'after' }
        );

        // 2. Log share action in news_shares (optional user_id/platform)
        if (user_id || platform) {
            await db.collection("news_shares").insertOne({
                news_id: toId(req.params.id),
                user_id: user_id ? toId(user_id) : null,
                platform: platform || 'general',
                created_at: new Date()
            });
        }

        res.json({
            success: true,
            share_count: result.share_count || 0
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.collection("categories").find({}).toArray();
        res.json(categories);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/locations', async (req, res) => {
    try {
        const locations = await db.collection("locations").find({}).toArray();
        res.json(locations);
    } catch (err) { res.status(500).json({ error: err.message }); }
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
            { id: admin._id, email: admin.email, role: admin.role || 'admin' },
            process.env.JWT_SECRET || 'secret8knews',
            { expiresIn: '1d' }
        );

        res.json({ success: true, token, role: admin.role || 'admin', admin: { email: admin.email, role: admin.role || 'admin' } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

