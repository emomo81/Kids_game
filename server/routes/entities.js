import express from 'express';
import Entity from '../models/Entity.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to extract user_id from the HttpOnly cookie without rejecting if it doesn't exist explicitly
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    req.user_id = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user_id = decoded.userId;
        } catch (err) {
            // Invalid token, ignore user
        }
    }
    next();
};

router.use(authMiddleware);

// GET /api/entities/:entityName
router.get('/:entityName', async (req, res) => {
    try {
        const { entityName } = req.params;
        const { sortBy, limit } = req.query;

        // Exempt global tables from strict user filtering
        const globalEntities = ["LeaderboardEntry", "DailyChallenge"];
        let query = { entityType: entityName };

        if (req.user_id && !globalEntities.includes(entityName)) {
            query = {
                entityType: entityName,
                $or: [
                    { user_id: req.user_id },
                    { role: 'global' }
                ]
            };
        }

        let dbQuery = Entity.find(query);

        if (sortBy) {
            let field = sortBy.startsWith("-") ? sortBy.slice(1) : sortBy;
            let desc = sortBy.startsWith("-") ? -1 : 1;
            dbQuery = dbQuery.sort({ [field]: desc });
        }

        if (limit) {
            dbQuery = dbQuery.limit(parseInt(limit, 10));
        }

        const data = await dbQuery;
        res.json(data);
    } catch (error) {
        console.error("GET entity error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/entities/:entityName/filter
router.post('/:entityName/filter', async (req, res) => {
    try {
        const { entityName } = req.params;
        const queryObj = req.body || {};
        const data = await Entity.find({ entityType: entityName, ...queryObj });
        res.json(data);
    } catch (error) {
        console.error("FILTER entity error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/entities/:entityName
router.post('/:entityName', async (req, res) => {
    try {
        const { entityName } = req.params;
        const payload = req.body || {};

        const newItem = new Entity({
            entityType: entityName,
            user_id: req.user_id, // automatically securely attach logged-in user
            ...payload
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("POST entity error:", error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/entities/:entityName/:id
router.put('/:entityName/:id', async (req, res) => {
    try {
        const { entityName, id } = req.params;
        const payload = req.body || {};

        const updatedItem = await Entity.findOneAndUpdate(
            { _id: id, entityType: entityName },
            payload,
            { new: true } // Return updated doc
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error("PUT entity error:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/entities/:entityName/:id
router.delete('/:entityName/:id', async (req, res) => {
    try {
        const { entityName, id } = req.params;
        await Entity.findOneAndDelete({ _id: id, entityType: entityName });
        res.json({ success: true });
    } catch (error) {
        console.error("DELETE entity error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
