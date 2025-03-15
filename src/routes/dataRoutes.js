const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Get all records with pagination
router.get('/', dataController.getAllRecords);

// Get a record by ID
router.get('/:id', dataController.getRecordById);

// Get records by file ID
router.get('/file/:fileId', dataController.getRecordsByFileId);

module.exports = router;