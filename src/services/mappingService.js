const Mapping = require('../models/Mapping');
const logger = require('../config/logger');

class MappingService {
  /**
   * Get available database fields
   * @returns {Array} - Array of available database fields
   */
  getAvailableFields() {
    return [
      { name: 'brand', type: 'string' },
      { name: 'description', type: 'text' },
      { name: 'price', type: 'decimal' },
      { name: 'size', type: 'string' },
      { name: 'volume', type: 'decimal' },
      { name: 'classification', type: 'string' },
      { name: 'purchase_price', type: 'decimal' },
      { name: 'vendor_number', type: 'integer' },
      { name: 'vendor_name', type: 'string' }
    ];
  }

  /**
   * Create mappings from CSV columns to database fields
   * @param {Array} mappings - Array of mapping objects (csv_column_name, db_field_name, data_type)
   * @returns {Promise<Array>} - Created mappings
   */
  async createMappings(mappings) {
    try {
      const availableFields = this.getAvailableFields();
      const availableFieldNames = availableFields.map(field => field.name);
      
      for (const mapping of mappings) {
        if (!availableFieldNames.includes(mapping.db_field_name)) {
          throw new Error(`Invalid database field: ${mapping.db_field_name}`);
        }
      }
      
      const createdMappings = await Mapping.bulkCreate(mappings);
      return createdMappings;
    } catch (error) {
      logger.error(`Error creating mappings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all mappings
   * @returns {Promise<Array>} - Array of all mappings
   */
  async getAllMappings() {
    try {
      return await Mapping.findAll();
    } catch (error) {
      logger.error(`Error getting mappings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get mapping by ID
   * @param {number} id - Mapping ID
   * @returns {Promise<Object|null>} - Mapping object or null if not found
   */
  async getMappingById(id) {
    try {
      return await Mapping.findByPk(id);
    } catch (error) {
      logger.error(`Error getting mapping by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate mapping suggestions based on CSV headers
   * @param {Array} headers - CSV headers
   * @returns {Array} - Suggested mappings
   */
  generateSuggestions(headers) {
    const availableFields = this.getAvailableFields();
    const suggestions = [];
    
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const matchedField = availableFields.find(field => {
        const normalizedField = field.name.toLowerCase();
        return normalizedHeader.includes(normalizedField) || 
               normalizedField.includes(normalizedHeader);
      });
      
      if (matchedField) {
        suggestions.push({
          csv_column_name: header,
          db_field_name: matchedField.name,
          data_type: matchedField.type
        });
      } else {
        suggestions.push({
          csv_column_name: header,
          db_field_name: null,
          data_type: null
        });
      }
    }
    
    return suggestions;
  }
}

module.exports = new MappingService();