const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./config/logger');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();