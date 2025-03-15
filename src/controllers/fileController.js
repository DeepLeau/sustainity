const path = require('path');
const File = require('../models/File');
const csvService = require('../services/csvService');
const queueService = require('../services/queueService');
const logger = require('../config/logger');

const fileController = {
  /**
   * Upload a CSV file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  uploadFile: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const { filename, originalname, path: filePath } = req.file;
      
      const file = await File.create({
        file_name: originalname,
        file_path: filePath,
        status: 'uploaded'
      });
      
      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: file.id,
          name: file.file_name,
          status: file.status,
          uploadDate: file.uploaded_date
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a preview of a CSV file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  previewFile: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const file = await File.findByPk(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const preview = await csvService.getPreview(file.file_path);
      
      const headers = Object.keys(preview[0] || {});
      
      res.json({
        fileId: file.id,
        fileName: file.file_name,
        headers,
        previewData: preview
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Process a CSV file with specified mappings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  processFile: async (req, res, next) => {
    try {
      const { fileId, mappingIds, useQueue } = req.body;
      
      if (!fileId) {
        return res.status(400).json({ error: 'fileId is required' });
      }
      
      if (!mappingIds || !Array.isArray(mappingIds) || mappingIds.length === 0) {
        return res.status(400).json({ error: 'mappingIds array is required' });
      }
      
      const file = await File.findByPk(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      if (useQueue) {
        const job = await queueService.addFileToQueue(fileId, mappingIds);
        
        return res.status(202).json({
          message: 'File processing has been queued',
          jobId: job.id,
          file: {
            id: file.id,
            name: file.file_name,
            status: 'processing'
          }
        });
      } else {
        await File.update({ status: 'processing' }, { where: { id: fileId } });
        
        const Mapping = require('../models/Mapping');
        const mappings = await Mapping.findAll({
          where: {
            id: mappingIds
          }
        });
        
        if (mappings.length === 0) {
          return res.status(404).json({ error: 'No mappings found with the provided IDs' });
        }
        
        const results = await csvService.processFile(file, mappings);
        
        res.json({
          message: 'File processed successfully',
          file: {
            id: file.id,
            name: file.file_name,
            status: 'completed'
          },
          results
        });
      }
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get the status of a file processing job
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getJobStatus: async (req, res, next) => {
    try {
      const { jobId } = req.params;
      
      const status = await queueService.getJobStatus(jobId);
      if (!status) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(status);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get all files
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAllFiles: async (req, res, next) => {
    try {
      const files = await File.findAll({
        order: [['uploaded_date', 'DESC']]
      });
      
      res.json(files);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a file by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getFileById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const file = await File.findByPk(id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      res.json(file);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = fileController;