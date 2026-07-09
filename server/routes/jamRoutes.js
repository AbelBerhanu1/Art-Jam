const express = require('express');
const jamController = require('../controllers/jamController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Routes
router.post('/', requireAuth, jamController.createJam);
router.get('/', jamController.listJams);
router.get('/:id', jamController.getJam);
router.put('/:id', requireAuth, jamController.updateJam);
router.delete('/:id', requireAuth, jamController.deleteJam);

module.exports = router;