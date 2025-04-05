const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Session data storage
const sessionData = {};

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use a timestamp to avoid filename collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const router = express.Router();

// Helper function to determine if a value is numeric
function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// Upload endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let fileData;

    // Read file content based on file type
    if (req.file.originalname.endsWith('.json')) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      fileData = JSON.parse(fileContent);
    } else {
      // For non-JSON files, we'd need to parse CSV or other formats
      // This is a simplified version assuming JSON only
      return res.status(400).json({ error: 'Only JSON files are supported' });
    }

    // Basic schema detection
    if (!Array.isArray(fileData) || fileData.length === 0) {
      return res.status(400).json({ error: 'Invalid data format, expected array of objects' });
    }

    // Get sample row and determine column types
    const sampleRow = fileData[0];
    const columns = Object.keys(sampleRow);
    const types = {};
    const missingPercent = {};
    let numFeatures = 0;

    columns.forEach(col => {
      // Sample values to determine type (up to 100 rows)
      const samples = fileData.slice(0, 100).map(row => row[col]);
      const numericSamples = samples.filter(val => isNumeric(val));
      
      if (numericSamples.length > samples.length * 0.5) {
        types[col] = 'number';
        numFeatures++;
      } else {
        types[col] = 'string';
      }

      // Calculate missing percent
      const missing = samples.filter(val => val === null || val === undefined || val === '').length;
      missingPercent[col] = (missing / samples.length).toFixed(2);
    });

    // Store data in session
    const userId = req.user?.id || 'guest';
    if (!sessionData[userId]) {
      sessionData[userId] = {};
    }
    
    sessionData[userId].data = fileData;
    sessionData[userId].schema = {
      columns,
      types,
      missingPercent,
      numFeatures
    };

    // Return schema information
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.originalname,
      filesize: req.file.size,
      rows: fileData.length,
      columns: columns.length,
      schema: {
        columns,
        types,
        missingPercent,
        numFeatures
      }
    });
  } catch (error) {
    console.error('Error processing file upload:', error);
    res.status(500).json({ error: 'Error processing file upload' });
  }
});

module.exports = { router, sessionData };