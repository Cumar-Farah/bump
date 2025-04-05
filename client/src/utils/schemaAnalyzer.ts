// Defines column profile structure
export interface ColumnProfile {
  name: string;
  dataType: 'numeric' | 'categorical' | 'datetime' | 'text' | 'unknown';
  importance: 'high' | 'medium' | 'low';
  uniqueValues: number;
  missingValues: number;
  stats?: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    mode?: any;
    stdDev?: number;
  };
}

// Analyzes a dataset to create column profiles
export function analyzeSchema(data: any[]): ColumnProfile[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const sampleRow = data[0];
  const columnNames = Object.keys(sampleRow);
  
  return columnNames.map(name => {
    // Extract column values
    const columnValues = data.map(row => row[name]);
    
    // Count missing values
    const missingCount = columnValues.filter(v => v === null || v === undefined || v === '').length;
    
    // Get unique values
    const uniqueValuesSet = new Set(columnValues.filter(v => v !== null && v !== undefined && v !== ''));
    const uniqueCount = uniqueValuesSet.size;
    
    // Determine data type
    const dataType = inferDataType(columnValues);
    
    // Calculate importance based on heuristics
    const importance = calculateImportance(name, missingCount, data.length, uniqueCount);
    
    // Calculate statistics for numeric columns
    const stats = dataType === 'numeric' ? calculateNumericStats(columnValues) : undefined;
    
    return {
      name,
      dataType,
      importance,
      uniqueValues: uniqueCount,
      missingValues: missingCount,
      stats
    };
  });
}

// Infer the data type of a column
function inferDataType(values: any[]): 'numeric' | 'categorical' | 'datetime' | 'text' | 'unknown' {
  // Filter out null/undefined values
  const nonEmpty = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonEmpty.length === 0) {
    return 'unknown';
  }
  
  // Check if all values are numbers
  const allNumbers = nonEmpty.every(v => {
    if (typeof v === 'number') return true;
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^0-9.-]/g, '');
      return !isNaN(parseFloat(cleaned));
    }
    return false;
  });
  
  if (allNumbers) {
    return 'numeric';
  }
  
  // Check if all values are dates
  const allDates = nonEmpty.every(v => {
    const date = new Date(v);
    return !isNaN(date.getTime());
  });
  
  if (allDates) {
    return 'datetime';
  }
  
  // Check if it's likely categorical
  const uniqueValuesSet = new Set(nonEmpty);
  const uniqueRatio = uniqueValuesSet.size / nonEmpty.length;
  
  // If there are few unique values relative to the total count, it's likely categorical
  if (uniqueRatio < 0.1 || uniqueValuesSet.size < 15) {
    return 'categorical';
  }
  
  // Check for long text
  const avgLength = nonEmpty.reduce((sum, v) => sum + String(v).length, 0) / nonEmpty.length;
  if (avgLength > 50) {
    return 'text';
  }
  
  // Default to categorical for other cases
  return 'categorical';
}

// Calculate importance score based on column name, missing values, etc.
function calculateImportance(
  name: string, 
  missingCount: number, 
  totalCount: number,
  uniqueCount: number
): 'high' | 'medium' | 'low' {
  // Important column names
  const highImportanceNames = ['id', 'name', 'title', 'category', 'label', 'target', 'class'];
  const nameLower = name.toLowerCase();
  
  // Check for typical ID or target columns
  if (highImportanceNames.some(imp => nameLower.includes(imp))) {
    return 'high';
  }
  
  // If column has many missing values, it's less important
  const missingRatio = missingCount / totalCount;
  if (missingRatio > 0.5) {
    return 'low';
  }
  
  // If column has unique value for each row, likely an ID or less useful
  if (uniqueCount === totalCount) {
    return nameLower.includes('id') ? 'high' : 'low';
  }
  
  // Default to medium importance
  return 'medium';
}

// Calculate statistics for numeric columns
function calculateNumericStats(values: any[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode?: any;
  stdDev: number;
} {
  // Convert to numbers and filter out non-numeric
  const numericValues = values
    .map(v => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const cleaned = v.replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned);
      }
      return NaN;
    })
    .filter(v => !isNaN(v));
  
  // Handle empty array
  if (numericValues.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      stdDev: 0
    };
  }
  
  // Sort values for percentile calculations
  const sorted = [...numericValues].sort((a, b) => a - b);
  
  // Calculate statistics
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  
  // Calculate median
  const midIndex = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[midIndex - 1] + sorted[midIndex]) / 2
    : sorted[midIndex];
  
  // Calculate standard deviation
  const squaredDiffs = sorted.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / sorted.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate mode (most frequent value)
  const frequency: Record<number, number> = {};
  sorted.forEach(v => {
    frequency[v] = (frequency[v] || 0) + 1;
  });
  
  let mode: number | undefined;
  let maxFreq = 0;
  
  Object.entries(frequency).forEach(([valueStr, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = parseFloat(valueStr);
    }
  });
  
  return {
    min,
    max,
    mean,
    median,
    mode,
    stdDev
  };
}