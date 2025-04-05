import { ColumnProfile } from './schemaAnalyzer';

// Preprocesses a dataset based on column profiles
export function preprocessDataset(data: any[], schema: ColumnProfile[]): any[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (!schema || !Array.isArray(schema) || schema.length === 0) {
    return [...data];
  }

  // Create a shallow copy of the data to avoid mutating the original
  const processed = data.map(row => ({ ...row }));

  // Process each row according to column types
  processed.forEach(row => {
    schema.forEach(column => {
      // Skip missing values
      if (row[column.name] === undefined || row[column.name] === null) {
        return;
      }

      // Process based on data types
      if (column.dataType === 'numeric') {
        cleanupNumeric(row, column.name);
      } else if (column.dataType === 'categorical') {
        cleanupCategorical(row, column.name);
      } else if (column.dataType === 'datetime') {
        cleanupDateTime(row, column.name);
      }
    });
  });

  // Remove rows with critical missing values
  const withoutMissing = processed.filter(row => {
    // Count missing important columns
    const missingCount = schema
      .filter(col => col.importance === 'high')
      .filter(col => row[col.name] === undefined || row[col.name] === null)
      .length;
    
    // If there are any critical missing values, filter out the row
    return missingCount === 0;
  });

  return withoutMissing;
}

// Helper function to clean up numeric values
function cleanupNumeric(row: any, columnName: string): void {
  const value = row[columnName];
  
  // Handle different formats of numeric data
  if (typeof value === 'string') {
    // Try to convert string to number
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    if (!isNaN(parsed)) {
      row[columnName] = parsed;
    } else {
      // If cannot parse as number, set to null
      row[columnName] = null;
    }
  } else if (typeof value !== 'number') {
    // If not a number type, set to null
    row[columnName] = null;
  }
}

// Helper function to clean up categorical values
function cleanupCategorical(row: any, columnName: string): void {
  const value = row[columnName];
  
  // Convert to string and trim
  if (value !== null && value !== undefined) {
    if (typeof value === 'string') {
      row[columnName] = value.trim();
    } else {
      // Convert non-string to string
      row[columnName] = String(value).trim();
    }
  }
}

// Helper function to clean up datetime values
function cleanupDateTime(row: any, columnName: string): void {
  const value = row[columnName];
  
  // Try to convert to valid Date object
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      row[columnName] = date.toISOString();
    } else {
      // Could not parse date
      row[columnName] = null;
    }
  } else if (value instanceof Date) {
    // Already a Date object
    row[columnName] = value.toISOString();
  } else {
    // Not a recognized date format
    row[columnName] = null;
  }
}