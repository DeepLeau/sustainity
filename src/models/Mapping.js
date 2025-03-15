const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mapping = sequelize.define('Mapping', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  csv_column_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  db_field_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  data_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'mappings',
  timestamps: false
});

module.exports = Mapping;