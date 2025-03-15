const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const logger = require('../config/logger');

const uploadDir = path.join(process.cwd(), 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB limit
  }
});

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    logger.error('Multer error:', err);
    return res.status(400).json({ error: err.message });
  } else if (err) {
    logger.error('Upload error:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleUploadErrors };