const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Record = sequelize.define('Record', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  brand: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  size: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  volume: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  classification: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  purchase_price: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  vendor_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  vendor_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  file_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'files',
      key: 'id'
    }
  }
}, {
  tableName: 'records',
  timestamps: false
});

module.exports = Record;