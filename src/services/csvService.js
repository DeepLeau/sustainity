const fs = require('fs');
const csvParser = require('csv-parser');
const logger = require('../config/logger');
const Mapping = require('../models/Mapping');
const Record = require('../models/Record');
const File = require('../models/File');
const { sequelize } = require('../config/database');

class CSVService {
  /**
   * Get a preview of the CSV file (first 10 rows)
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} - First 10 rows of the CSV file
   */
  async getPreview(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      let rowCount = 0;
      
      fs.createReadStream(filePath)
        .on('error', (error) => {
          logger.error(`Error reading file: ${error.message}`);
          reject(error);
        })
        .pipe(csvParser())
        .on('data', (data) => {
          if (rowCount < 10) {
            results.push(data);
            rowCount++;
          }
        })
        .on('end', () => {
          resolve(results);
        });
    });
  }

  /**
   * Get the CSV headers
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} - Headers of the CSV file
   */
  async getHeaders(filePath) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .on('error', (error) => {
          logger.error(`Error reading file: ${error.message}`);
          reject(error);
        })
        .pipe(csvParser())
        .on('headers', (headers) => {
          resolve(headers);
        })
        .on('error', (error) => {
          logger.error(`Error parsing CSV: ${error.message}`);
          reject(error);
        })
        .on('end', () => {
          resolve([]);
        });
    });
  }

  /**
   * Process the CSV file and save records to the database
   * @param {Object} fileRecord - File record from the database
   * @param {Array} mappings - Array of column mappings
   * @returns {Promise<Object>} - Processing results
   */
  async processFile(fileRecord, mappings) {
    return new Promise(async (resolve, reject) => {
      try {
        await File.update({ status: 'processing' }, { where: { id: fileRecord.id } });
        
        const filePath = fileRecord.file_path;
        const results = {
          total: 0,
          processed: 0,
          failed: 0,
          errors: []
        };

        const mappingMap = {};
        mappings.forEach(mapping => {
          mappingMap[mapping.csv_column_name] = {
            fieldName: mapping.db_field_name,
            dataType: mapping.data_type
          };
        });

        const processPromise = new Promise((resolveProcess, rejectProcess) => {
          fs.createReadStream(filePath)
            .on('error', (error) => {
              logger.error(`Error reading file: ${error.message}`);
              rejectProcess(error);
            })
            .pipe(csvParser())
            .on('data', async (row) => {
              results.total++;
              
              try {
                const recordData = { file_id: fileRecord.id };
                
                for (const [csvColumn, value] of Object.entries(row)) {
                  const mapping = mappingMap[csvColumn];
                  if (mapping) {
                    const { fieldName, dataType } = mapping;
                    recordData[fieldName] = this.convertDataType(value, dataType);
                  }
                }
                
                await Record.create(recordData);
                results.processed++;
              } catch (error) {
                results.failed++;
                results.errors.push({
                  row: results.total,
                  error: error.message
                });
                logger.error(`Error processing row ${results.total}: ${error.message}`);
              }
            })
            .on('end', () => {
              resolveProcess();
            })
            .on('error', (error) => {
              logger.error(`Error parsing CSV: ${error.message}`);
              rejectProcess(error);
            });
        });

        await processPromise;
        
        await File.update(
          { status: 'completed' }, 
          { where: { id: fileRecord.id } }
        );
        
        resolve(results);
      } catch (error) {
        await File.update(
          { status: 'error' }, 
          { where: { id: fileRecord.id } }
        );
        
        logger.error(`Error processing file: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Convert string values to appropriate data types
   * @param {string} value - Value from CSV
   * @param {string} dataType - Target data type
   * @returns {any} - Converted value
   */
  convertDataType(value, dataType) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (dataType.toLowerCase()) {
      case 'integer':
      case 'int':
        return parseInt(value, 10);
      case 'decimal':
      case 'float':
      case 'number':
        return parseFloat(value);
      case 'boolean':
      case 'bool':
        return value.toLowerCase() === 'true' || value === '1';
      case 'date':
        return new Date(value);
      case 'string':
      case 'text':
      default:
        return value.toString();
    }
  }
}

module.exports = new CSVService();