const { User, Submission, Vote } = require('../models');
const { sequelize } = require('../config/database');

// ============================================
// GET TOP CREATORS
// ============================================
exports.getTopCreators = async (req, res) => {
    try {
        const users = await User.findAll({
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
                [sequelize.fn('COUNT', sequelize.col('Submissions.id')), 'submission_count'],
                [sequelize.fn('AVG', sequelize.col('Submissions->Votes.value')), 'avg_rating']
            ],
            include: [{
                model: Submission,
                attributes: [],
                include: [{
                    model: Vote,
                    attributes: []
                }]
            }],
            group: [
                'User.id',
                'User.username',
                'User.display_name',
                'User.bio',
                'User.avatar_url',
                'User.instagram',
                'User.tiktok',
                'User.twitter',
                'User.website'
            ],  // ← list every non-aggregated column
            order: [[sequelize.literal('submission_count'), 'DESC']],
            limit: 10,
            subQuery: false
        });

        res.json({ users });
    } catch (err) {
        console.error('Error in getTopCreators:', err);
        res.status(500).json({ error: err.message });
    }
};

// ============================================
// GET USER PROFILE
// ============================================
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: [
                'id', 'username', 'display_name', 'bio',
                'avatar_url', 'instagram', 'tiktok',
                'twitter', 'website', 'created_at'
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // count submissions
        const submissionCount = await Submission.count({
            where: { user_id: user.id }
        });

        // get avg rating using raw SQL — avoids the GROUP BY issue entirely
        const [ratingResult] = await sequelize.query(`
            SELECT AVG(v.value) as avg_rating
            FROM votes v
            INNER JOIN submissions s ON v.submission_id = s.id
            WHERE s.user_id = :userId
        `, {
            replacements: { userId: user.id },
            type: sequelize.QueryTypes.SELECT
        });

        const avgRating = ratingResult?.avg_rating
            ? Math.round(parseFloat(ratingResult.avg_rating) * 10) / 10
            : 0;

        res.json({
            user: {
                ...user.toJSON(),
                submission_count: submissionCount,
                avg_rating: avgRating
            }
        });

    } catch (err) {
        console.error('Error in getUserProfile:', err);
        res.status(500).json({ error: err.message });
    }
};
// ============================================
// UPDATE AVATAR
// ============================================
exports.updateAvatar = async (req, res) => {
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
};
// ============================================
// UPDATE USER PROFILE
// ============================================
exports.updateProfile = async (req, res) => {
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
};