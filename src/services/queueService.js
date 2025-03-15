const Bull = require('bull');
const logger = require('../config/logger');
const csvService = require('./csvService');
const File = require('../models/File');
const Mapping = require('../models/Mapping');

const fileProcessingQueue = new Bull('file-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

fileProcessingQueue.process(async (job) => {
  const { fileId, mappingIds } = job.data;
  logger.info(`Processing file ID: ${fileId}`);
  
  try {
    const fileRecord = await File.findByPk(fileId);
    if (!fileRecord) {
      throw new Error(`File not found with ID: ${fileId}`);
    }
    
    const mappings = await Mapping.findAll({
      where: {
        id: mappingIds
      }
    });
    
    if (mappings.length === 0) {
      throw new Error('No mappings found');
    }
    
    const results = await csvService.processFile(fileRecord, mappings);
    
    return results;
  } catch (error) {
    logger.error(`Error in queue processing: ${error.message}`);
    
    await File.update(
      { status: 'error' }, 
      { where: { id: fileId } }
    );
    
    throw error;
  }
});

fileProcessingQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed with result:`, result);
});

fileProcessingQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed with error:`, error);
});

module.exports = {
  addFileToQueue: async (fileId, mappingIds) => {
    logger.info(`Adding file ID: ${fileId} to processing queue`);
    return fileProcessingQueue.add({ fileId, mappingIds });
  },
  getJobStatus: async (jobId) => {
    const job = await fileProcessingQueue.getJob(jobId);
    if (!job) {
      return null;
    }
    
    const state = await job.getState();
    return {
      id: job.id,
      state,
      data: job.data,
      ...(job.returnvalue && { result: job.returnvalue }),
      ...(job.failedReason && { error: job.failedReason })
    };
  }
};