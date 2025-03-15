const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

// Upload a CSV file
router.post('/upload', upload.single('file'), handleUploadErrors, fileController.uploadFile);

// Preview a CSV file
router.get('/preview/:id', fileController.previewFile);

// Process a CSV file
router.post('/process', fileController.processFile);

// Get the status of a file processing job
router.get('/job/:jobId', fileController.getJobStatus);

// Get all files
router.get('/', fileController.getAllFiles);

// Get a file by ID
router.get('/:id', fileController.getFileById);

module.exports = router;