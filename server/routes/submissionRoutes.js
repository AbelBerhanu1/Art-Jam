const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const submissionController = require('../controllers/submissionController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'server/uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
router.get('/', submissionController.listSubmissions);
router.get('/:id', submissionController.getSubmission);
router.post('/', requireAuth, upload.single('image'), submissionController.createSubmission);
router.put('/:id', requireAuth, submissionController.updateSubmission);
router.delete('/:id', requireAuth, submissionController.deleteSubmission);

module.exports = router;