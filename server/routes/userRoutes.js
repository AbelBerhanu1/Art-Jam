const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { User, Submission, Vote } = require('../models');
const { sequelize } = require('../config/database');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// ============================================
// MULTER CONFIGURATION FOR AVATAR UPLOADS
// ============================================
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'server/uploads/avatars';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
        }
    }
});

// ============================================
// GET TOP CREATORS
// ============================================
// ============================================
// GET TOP CREATORS
// ============================================
router.get('/top-creators', async (req, res) => {
    try {
        const users = await sequelize.query(`
            SELECT 
                u.id, u.username, u.display_name, u.bio,
                u.avatar_url, u.instagram, u.tiktok, u.twitter, u.website,
                COUNT(DISTINCT s.id) as submission_count,
                AVG(v.value) as avg_rating
            FROM users u
            LEFT JOIN submissions s ON u.id = s.user_id
            LEFT JOIN votes v ON s.id = v.submission_id
            GROUP BY u.id, u.username, u.display_name, u.bio,
                     u.avatar_url, u.instagram, u.tiktok, u.twitter, u.website
            ORDER BY submission_count DESC
            LIMIT 10
        `, { type: sequelize.QueryTypes.SELECT })

        res.json({ users })
    } catch (err) {
        console.error('Error in /top-creators:', err)
        res.status(500).json({ error: err.message })
    }
})

// ============================================
// GET USER PROFILE (by ID)
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: [
                'id', 'username', 'display_name', 'bio',
                'avatar_url', 'instagram', 'tiktok',
                'twitter', 'website', 'created_at'
            ]
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const submissionCount = await Submission.count({
            where: { user_id: req.params.id }
        })

        // raw query — plain object, no .dataValues
        const [ratingResult] = await sequelize.query(`
            SELECT AVG(v.value) as avg_rating
            FROM votes v
            INNER JOIN submissions s ON v.submission_id = s.id
            WHERE s.user_id = :userId
        `, {
            replacements: { userId: req.params.id },
            type: sequelize.QueryTypes.SELECT
        })

        // ✅ access directly, no .dataValues
        const avgRating = ratingResult?.avg_rating
            ? Math.round(parseFloat(ratingResult.avg_rating) * 10) / 10
            : 0

        res.json({
            user: {
                ...user.toJSON(),
                submission_count: submissionCount,
                avg_rating: avgRating
            }
        })

    } catch (err) {
        console.error('Error in /users/:id:', err)
        res.status(500).json({ error: err.message })
    }
})

// ============================================
// GET USER PROFILE (by ID)
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: [
                'id',
                'username',
                'display_name',
                'bio',
                'avatar_url',
                'instagram',
                'tiktok',
                'twitter',
                'website',
                'created_at'
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get submission count
        const submissionCount = await Submission.count({
            where: { user_id: user.id }
        });

        // Get average rating
        // in userRoutes.js, find the GET /:id route and replace the rating query with:
        const [ratingResult] = await sequelize.query(`
            SELECT AVG(v.value) as avg_rating
            FROM votes v
            INNER JOIN submissions s ON v.submission_id = s.id
            WHERE s.user_id = :userId
        `, {
            replacements: { userId: req.params.id },
            type: sequelize.QueryTypes.SELECT
        })

        const avgRating = ratingResult ? parseFloat(ratingResult.dataValues.avg_rating) || 0 : 0;

        res.json({
            user: {
                ...user.toJSON(),
                submission_count: submissionCount,
                avg_rating: Math.round(avgRating * 10) / 10
            }
        });

    } catch (err) {
        console.error('Error in /users/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// UPDATE PROFILE (Authenticated)
// ============================================
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { display_name, bio, instagram, tiktok, twitter, website } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update only fields that are provided
        await user.update({
            display_name: display_name !== undefined ? display_name : user.display_name,
            bio: bio !== undefined ? bio : user.bio,
            instagram: instagram !== undefined ? instagram : user.instagram,
            tiktok: tiktok !== undefined ? tiktok : user.tiktok,
            twitter: twitter !== undefined ? twitter : user.twitter,
            website: website !== undefined ? website : user.website
        });

        // Fetch updated user
        const updatedUser = await User.findByPk(userId, {
            attributes: [
                'id',
                'username',
                'email',
                'display_name',
                'role',
                'avatar_url',
                'bio',
                'instagram',
                'tiktok',
                'twitter',
                'website',
                'created_at'
            ]
        });

        res.json({
            user: updatedUser
        });

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// UPDATE AVATAR (Authenticated)
// ============================================
router.post('/avatar', requireAuth, avatarUpload.single('avatar'), async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete old avatar if exists
        if (user.avatar_url) {
            const oldPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar_url));
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new avatar URL
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await user.update({ avatar_url: avatarUrl });

        res.json({
            message: 'Avatar updated successfully',
            avatar_url: avatarUrl
        });

    } catch (err) {
        console.error('Error updating avatar:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;