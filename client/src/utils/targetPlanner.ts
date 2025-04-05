import { ColumnProfile } from './schemaAnalyzer';

// Define structure of a target suggestion
export interface TargetSuggestion {
  column: string;
  taskType: 'regression' | 'classification' | 'forecasting' | 'clustering';
  confidence: number;  // 0-100
  description: string;
}

// Suggest appropriate targets and tasks based on column profiles
export function suggestTargets(schema: ColumnProfile[]): TargetSuggestion[] {
  if (!schema || !Array.isArray(schema) || schema.length === 0) {
    return [];
  }

  const suggestions: TargetSuggestion[] = [];
  
  // First pass - identify potential target columns
  const targetCandidates = schema.filter(column => {
    return column.importance !== 'low' && 
           column.missingValues / column.uniqueValues < 0.2;  // Not too many missing values
  });
  
  // Suggest regression for numeric columns
  const numericTargets = targetCandidates.filter(column => column.dataType === 'numeric');
  numericTargets.forEach(column => {
    suggestions.push({
      column: column.name,
      taskType: 'regression',
      confidence: calculateConfidence(column, 'regression'),
      description: `Predict the value of ${column.name}`
    });
  });
  
  // Suggest classification for categorical columns with few unique values
  const categoryTargets = targetCandidates.filter(column => 
    column.dataType === 'categorical' && column.uniqueValues > 1 && column.uniqueValues <= 15
  );
  categoryTargets.forEach(column => {
    suggestions.push({
      column: column.name,
      taskType: 'classification',
      confidence: calculateConfidence(column, 'classification'),
      description: `Classify data into ${column.uniqueValues} categories of ${column.name}`
    });
  });
  
  // Suggest time series forecasting for datetime columns
  const timeTargets = targetCandidates.filter(column => column.dataType === 'datetime');
  if (timeTargets.length > 0) {
    // Find potential numeric columns to forecast
    const forecastMetrics = numericTargets.filter(
      column => !column.name.toLowerCase().includes('id')
    );
    
    forecastMetrics.forEach(metricColumn => {
      timeTargets.forEach(timeColumn => {
        suggestions.push({
          column: metricColumn.name,
          taskType: 'forecasting',
          confidence: calculateConfidence(metricColumn, 'forecasting', timeColumn),
          description: `Forecast ${metricColumn.name} over time (${timeColumn.name})`
        });
      });
    });
  }
  
  // Identify clustering potentials
  if (numericTargets.length >= 2) {
    suggestions.push({
      column: '',  // Clustering doesn't need a specific target
      taskType: 'clustering',
      confidence: 70,  // Generic confidence
      description: `Cluster data based on ${numericTargets.length} numeric features`
    });
  }
  
  // Sort by confidence and return
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// Calculate confidence score for a target+task combination
function calculateConfidence(
  column: ColumnProfile, 
  taskType: string,
  secondaryColumn?: ColumnProfile
): number {
  let score = 70;  // Base score
  
  // Adjust for missing values
  const missingRatio = column.missingValues / column.uniqueValues;
  score -= missingRatio * 20;
  
  // Adjust for column importance
  if (column.importance === 'high') {
    score += 15;
  } else if (column.importance === 'medium') {
    score += 5;
  }
  
  // Task-specific adjustments
  if (taskType === 'regression') {
    // Better score for columns with wider ranges
    if (column.stats && column.stats.max !== undefined && column.stats.min !== undefined && (column.stats.max - column.stats.min > 100)) {
      score += 10;
    }
    
    // Penalize for potential ID columns
    if (column.name.toLowerCase().includes('id')) {
      score -= 30;
    }
  } 
  else if (taskType === 'classification') {
    // Better score for balanced classes
    if (column.uniqueValues >= 2 && column.uniqueValues <= 10) {
      score += 10;
    } else {
      score -= 5 * Math.max(0, column.uniqueValues - 10);
    }
    
    // Boost for recognizable category columns
    const categoryKeywords = ['category', 'type', 'class', 'group', 'label', 'status', 'result'];
    if (categoryKeywords.some(keyword => column.name.toLowerCase().includes(keyword))) {
      score += 15;
    }
  }
  else if (taskType === 'forecasting') {
    // Forecast needs both a time column and a metric
    if (!secondaryColumn || secondaryColumn.dataType !== 'datetime') {
      score -= 20;
    } else {
      // Boost for time-series recognizable names
      const timeSeriesKeywords = ['sales', 'revenue', 'count', 'price', 'volume', 'rate'];
      if (timeSeriesKeywords.some(keyword => column.name.toLowerCase().includes(keyword))) {
        score += 15;
      }
    }
  }
  
  // Cap score between 0-100
  return Math.max(0, Math.min(100, score));
}