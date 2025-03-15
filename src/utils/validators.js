/**
 * Validates that a value is a non-empty string
 * @param {any} value 
 * @returns {boolean} 
 */
const isValidString = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
  };
  
  /**
   * Validates that a value is a valid number
   * @param {any} value 
   * @returns {boolean} 
   */
  const isValidNumber = (value) => {
    if (typeof value === 'number') {
      return !isNaN(value);
    }
    
    if (typeof value === 'string') {
      return !isNaN(parseFloat(value)) && isFinite(value);
    }
    
    return false;
  };
  
  /**
   * Validates that a value is a valid date
   * @param {any} value 
   * @returns {boolean} 
   */
  const isValidDate = (value) => {
    if (value instanceof Date) {
      return !isNaN(value);
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return !isNaN(date);
    }
    
    return false;
  };
  
  /**
   * Validates that a value is a valid email
   * @param {string} value 
   * @returns {boolean} 
   */
  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === 'string' && emailRegex.test(value);
  };
  
  /**
   * Validates a data value against a specified type
   * @param {any} value
   * @param {string} type 
   * @returns {object} 
   */
  const validateValue = (value, type) => {
    if (value === null || value === undefined || value === '') {
      return { valid: true, value: null };
    }
    
    switch (type.toLowerCase()) {
      case 'string':
      case 'text':
        return { 
          valid: true, 
          value: String(value) 
        };
        
      case 'integer':
      case 'int':
        const intValue = parseInt(value, 10);
        return { 
          valid: !isNaN(intValue), 
          value: !isNaN(intValue) ? intValue : null 
        };
        
      case 'decimal':
      case 'float':
      case 'number':
        const floatValue = parseFloat(value);
        return { 
          valid: !isNaN(floatValue), 
          value: !isNaN(floatValue) ? floatValue : null 
        };
        
      case 'boolean':
      case 'bool':
        if (typeof value === 'boolean') {
          return { valid: true, value };
        }
        
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (['true', 'yes', '1', 'y'].includes(lowerValue)) {
            return { valid: true, value: true };
          }
          if (['false', 'no', '0', 'n'].includes(lowerValue)) {
            return { valid: true, value: false };
          }
        }
        
        if (typeof value === 'number') {
          return { valid: true, value: value !== 0 };
        }
        
        return { valid: false, value: null };
        
      case 'date':
        const dateValue = new Date(value);
        return { 
          valid: !isNaN(dateValue), 
          value: !isNaN(dateValue) ? dateValue : null 
        };
        
      default:
        return { valid: true, value: String(value) };
    }
  };
  
  module.exports = {
    isValidString,
    isValidNumber,
    isValidDate,
    isValidEmail,
    validateValue
  };