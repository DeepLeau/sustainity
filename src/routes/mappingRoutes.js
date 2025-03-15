const express = require('express');
const router = express.Router();
const mappingController = require('../controllers/mappingController');

// Get all mappings
router.get('/', mappingController.getAllMappings);

// Get a mapping by ID
router.get('/:id', mappingController.getMappingById);

// Create a new mapping
router.post('/', mappingController.createMapping);

// Create multiple mappings
router.post('/bulk', mappingController.createMappings);

// Get mapping suggestions for a file
router.get('/suggestions/:fileId', mappingController.getSuggestions);

// Get available database fields
router.get('/fields/available', mappingController.getAvailableFields);

module.exports = router;