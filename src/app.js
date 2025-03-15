const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const fileRoutes = require('./routes/fileRoutes');
const dataRoutes = require('./routes/dataRoutes');
const mappingRoutes = require('./routes/mappingRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const File = require('./models/File');
const Record = require('./models/Record');

File.hasMany(Record, { foreignKey: 'file_id', as: 'records' });
Record.belongsTo(File, { foreignKey: 'file_id', as: 'file' });

app.use('/api/files', fileRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/mappings', mappingRoutes);

app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'OK', message: 'Service is healthy' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Sustainity API',
    documentation: '/api-docs',
    healthCheck: '/health'
  });
});

app.use(errorHandler);

module.exports = app;