const express = require('express');
const path = require('path');
const fs = require('fs');
const { sessionData } = require('./upload');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const userId = req.user?.id || 'guest';

    const session = sessionData[userId];
    if (!session || !session.schema) {
      return res.status(400).json({ error: 'No data uploaded yet' });
    }

    const schema = session.schema;
    const targetColumn = req.query.target; // frontend should send ?target=your_column

    const numericCount = schema.num_features || 0;
    const missingPercent = schema.missing_percent || 0;
    const isTimeSeries = schema.has_time_column || false;

    const constraintsPath = path.join(__dirname, '../../shared/rules/constraints.json');
    const constraints = JSON.parse(fs.readFileSync(constraintsPath, 'utf8'));

    const validTechniques = constraints.filter(rule => {
      if (numericCount < rule.min_numeric_features) return false;
      if (missingPercent > rule.max_missing) return false;
      if (rule.time_series_required && !isTimeSeries) return false;

      // New: if model requires a target and one wasn't selected
      if (rule.requires_target && !targetColumn) return false;

      return true;
    }).map(rule => ({
      name: rule.technique,
      code: rule.internal_code,
      tags: [rule.category],
      output_types: rule.output_types
    }));

    res.json({ valid_techniques: validTechniques });
  } catch (error) {
    console.error('Error in constraints.js:', error);
    res.status(500).json({ error: 'Failed to evaluate constraints' });
  }
});

module.exports = { router };
