const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const fs = require('fs-extra');
const path = require('path');

// Clear test uploads directory before tests
const testUploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(testUploadsDir);

// Mock CSV data for testing
const createTestCSV = async () => {
  const csvPath = path.join(testUploadsDir, 'test.csv');
  const csvContent = 
    'brand,description,price,size,volume\n' +
    'Eco Brand,Sustainable Product 1,19.99,Medium,1.5\n' +
    'Green Co,Eco-friendly Item,24.50,Large,2.0\n' +
    'Earth Friendly,Recycled Materials,15.75,Small,0.75';
  
  await fs.writeFile(csvPath, csvContent);
  return csvPath;
};

describe('API Endpoints', () => {
  let testFilePath;
  let uploadedFileId;
  let mappingIds = [];

  beforeAll(async () => {
    testFilePath = await createTestCSV();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('File Upload', () => {
    it('should upload a CSV file successfully', async () => {
      const res = await request(app)
        .post('/api/files/upload')
        .attach('file', testFilePath);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'File uploaded successfully');
      expect(res.body).toHaveProperty('file');
      expect(res.body.file).toHaveProperty('id');
      
      uploadedFileId = res.body.file.id;
    });
  });

  describe('File Preview', () => {
    it('should preview a file successfully', async () => {
      const res = await request(app)
        .get(`/api/files/preview/${uploadedFileId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('fileId', uploadedFileId);
      expect(res.body).toHaveProperty('headers');
      expect(res.body).toHaveProperty('previewData');
      expect(res.body.previewData).toHaveLength(3);
    });
  });

  describe('Mapping Management', () => {
    it('should suggest mappings for a file', async () => {
      const res = await request(app)
        .get(`/api/mappings/suggestions/${uploadedFileId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('suggestions');
      expect(Array.isArray(res.body.suggestions)).toBe(true);
    });

    it('should create mappings', async () => {
      const mappings = [
        { csv_column_name: 'brand', db_field_name: 'brand', data_type: 'string' },
        { csv_column_name: 'description', db_field_name: 'description', data_type: 'text' },
        { csv_column_name: 'price', db_field_name: 'price', data_type: 'decimal' },
        { csv_column_name: 'size', db_field_name: 'size', data_type: 'string' },
        { csv_column_name: 'volume', db_field_name: 'volume', data_type: 'decimal' }
      ];

      const res = await request(app)
        .post('/api/mappings/bulk')
        .send({ mappings });
      
      expect(res.statusCode).toEqual(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(5);
      
      mappingIds = res.body.map(mapping => mapping.id);
    });
  });

  describe('File Processing', () => {
    it('should process a file successfully', async () => {
      const res = await request(app)
        .post('/api/files/process')
        .send({
          fileId: uploadedFileId,
          mappingIds,
          useQueue: false
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'File processed successfully');
      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toHaveProperty('processed', 3);
    });
  });
});