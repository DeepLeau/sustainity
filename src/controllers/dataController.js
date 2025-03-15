const Record = require('../models/Record');
const File = require('../models/File');
const logger = require('../config/logger');

const dataController = {
  /**
   * Get all records with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAllRecords: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Record.findAndCountAll({
        limit,
        offset,
        order: [['id', 'ASC']],
        include: [
          {
            model: File,
            as: 'file',
            attributes: ['file_name', 'uploaded_date']
          }
        ]
      });
      
      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        records: rows
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a record by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getRecordById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const record = await Record.findByPk(id, {
        include: [
          {
            model: File,
            as: 'file',
            attributes: ['file_name', 'uploaded_date']
          }
        ]
      });
      
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.json(record);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get records by file ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getRecordsByFileId: async (req, res, next) => {
    try {
      const { fileId } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Record.findAndCountAll({
        where: { file_id: fileId },
        limit,
        offset,
        order: [['id', 'ASC']]
      });
      
      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        records: rows
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dataController;