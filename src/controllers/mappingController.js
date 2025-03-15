const mappingService = require('../services/mappingService');
const csvService = require('../services/csvService');
const File = require('../models/File');
const Mapping = require('../models/Mapping');
const logger = require('../config/logger');

const mappingController = {
  /**
   * Get all mappings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAllMappings: async (req, res, next) => {
    try {
      const mappings = await mappingService.getAllMappings();
      res.json(mappings);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a mapping by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getMappingById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const mapping = await mappingService.getMappingById(id);
      
      if (!mapping) {
        return res.status(404).json({ error: 'Mapping not found' });
      }
      
      res.json(mapping);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create a new mapping
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createMapping: async (req, res, next) => {
    try {
      const { csv_column_name, db_field_name, data_type } = req.body;
      
      if (!csv_column_name || !db_field_name || !data_type) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['csv_column_name', 'db_field_name', 'data_type']
        });
      }
      
      const mapping = await Mapping.create({
        csv_column_name,
        db_field_name,
        data_type
      });
      
      res.status(201).json(mapping);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create multiple mappings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createMappings: async (req, res, next) => {
    try {
      const { mappings } = req.body;
      
      if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
        return res.status(400).json({
          error: 'Mappings array is required',
          format: {
            mappings: [
              {
                csv_column_name: 'string',
                db_field_name: 'string',
                data_type: 'string'
              }
            ]
          }
        });
      }
      
      const createdMappings = await mappingService.createMappings(mappings);
      
      res.status(201).json(createdMappings);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get mapping suggestions for a file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getSuggestions: async (req, res, next) => {
    try {
      const { fileId } = req.params;
      
      const file = await File.findByPk(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const headers = await csvService.getHeaders(file.file_path);
      
      const suggestions = mappingService.generateSuggestions(headers);
      
      res.json({
        fileId: file.id,
        fileName: file.file_name,
        suggestions
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get available database fields
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAvailableFields: (req, res) => {
    const fields = mappingService.getAvailableFields();
    res.json(fields);
  }
};

module.exports = mappingController;