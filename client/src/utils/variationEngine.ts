// variationEngine.ts
// Provides utilities for generating different chart variations from the same dataset

import { ColumnProfile } from './schemaAnalyzer';

export interface VariationConfig {
  title: string;
  description?: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar';
  x?: string;
  y?: string;
  groupBy?: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  colorBy?: string;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
    value: any;
  }>;
}

/**
 * Given a dataset schema, generate a series of chart variation configurations
 * that would make sense for the data
 */
export function generateChartVariations(
  schema: ColumnProfile[],
  limit: number = 5
): VariationConfig[] {
  const variations: VariationConfig[] = [];
  
  // Find numeric columns
  const numericColumns = schema.filter(col => col.type === 'numeric');
  
  // Find categorical columns (usually good for x-axis)
  const categoricalColumns = schema.filter(col => 
    col.type === 'categorical' || (col.type === 'text' && col.cardinality < 20)
  );
  
  // Find datetime columns
  const dateColumns = schema.filter(col => col.type === 'datetime');
  
  // Bar charts for categorical vs numeric
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    for (let i = 0; i < Math.min(categoricalColumns.length, limit); i++) {
      const catColumn = categoricalColumns[i];
      const numColumn = numericColumns[0]; // Just use the first numeric column
      
      variations.push({
        title: `${catColumn.name} vs ${numColumn.name}`,
        description: `Bar chart showing ${numColumn.name} by ${catColumn.name}`,
        type: 'bar',
        x: catColumn.name,
        y: numColumn.name,
        aggregate: 'sum',
        limit: 10,
        sortDirection: 'desc'
      });
    }
  }
  
  // Line charts for time series
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    for (let i = 0; i < Math.min(numericColumns.length, limit); i++) {
      const dateColumn = dateColumns[0]; // Just use the first date column
      const numColumn = numericColumns[i];
      
      variations.push({
        title: `${numColumn.name} Over Time`,
        description: `Line chart showing ${numColumn.name} trends over time`,
        type: 'line',
        x: dateColumn.name,
        y: numColumn.name,
        aggregate: 'avg',
        sortBy: dateColumn.name,
        sortDirection: 'asc'
      });
    }
  }
  
  // Scatter plots for numeric vs numeric
  if (numericColumns.length >= 2) {
    for (let i = 0; i < numericColumns.length - 1 && variations.length < limit * 3; i++) {
      for (let j = i + 1; j < numericColumns.length && variations.length < limit * 3; j++) {
        variations.push({
          title: `${numericColumns[i].name} vs ${numericColumns[j].name}`,
          description: `Scatter plot comparing ${numericColumns[i].name} and ${numericColumns[j].name}`,
          type: 'scatter',
          x: numericColumns[i].name,
          y: numericColumns[j].name
        });
      }
    }
  }
  
  // If we have categorical columns with low cardinality, add a pie chart
  const lowCardinalityCats = categoricalColumns.filter(col => col.cardinality <= 10);
  if (lowCardinalityCats.length > 0 && numericColumns.length > 0) {
    lowCardinalityCats.slice(0, limit).forEach(catColumn => {
      variations.push({
        title: `Distribution of ${catColumn.name}`,
        description: `Pie chart showing the distribution of ${catColumn.name}`,
        type: 'pie',
        x: catColumn.name,
        y: numericColumns[0].name,
        aggregate: 'count'
      });
    });
  }
  
  // For multi-grouping, if we have multiple categorical columns, create a grouped bar chart
  if (categoricalColumns.length >= 2 && numericColumns.length > 0) {
    variations.push({
      title: `${numericColumns[0].name} by ${categoricalColumns[0].name} and ${categoricalColumns[1].name}`,
      description: `Grouped bar chart showing ${numericColumns[0].name} by ${categoricalColumns[0].name} and ${categoricalColumns[1].name}`,
      type: 'bar',
      x: categoricalColumns[0].name,
      y: numericColumns[0].name,
      groupBy: categoricalColumns[1].name,
      aggregate: 'avg',
      limit: 10
    });
  }
  
  // Return unique variations up to the limit
  return variations.slice(0, limit);
}

/**
 * Apply a chart variation configuration to a dataset
 */
export function applyVariation(data: any[], config: VariationConfig): any[] {
  let result = [...data];
  
  // Apply filters
  if (config.filters && config.filters.length > 0) {
    result = result.filter(item => {
      return config.filters!.every(filter => {
        const value = item[filter.column];
        
        switch (filter.operator) {
          case 'eq': return value === filter.value;
          case 'neq': return value !== filter.value;
          case 'gt': return value > filter.value;
          case 'gte': return value >= filter.value;
          case 'lt': return value < filter.value;
          case 'lte': return value <= filter.value;
          case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
          case 'contains': return String(value).includes(String(filter.value));
          default: return true;
        }
      });
    });
  }
  
  // Group and aggregate data if needed
  if (config.x && config.y && config.aggregate) {
    const grouped: Record<string, any[]> = {};
    
    // Group by x column
    result.forEach(item => {
      const key = item[config.x!];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    // Apply aggregation
    result = Object.keys(grouped).map(key => {
      const group = grouped[key];
      const newItem: Record<string, any> = { [config.x!]: key };
      
      if (config.aggregate === 'sum') {
        newItem[config.y!] = group.reduce((sum, item) => sum + (Number(item[config.y!]) || 0), 0);
      } else if (config.aggregate === 'avg') {
        newItem[config.y!] = group.reduce((sum, item) => sum + (Number(item[config.y!]) || 0), 0) / group.length;
      } else if (config.aggregate === 'count') {
        newItem[config.y!] = group.length;
      } else if (config.aggregate === 'min') {
        newItem[config.y!] = Math.min(...group.map(item => Number(item[config.y!]) || 0));
      } else if (config.aggregate === 'max') {
        newItem[config.y!] = Math.max(...group.map(item => Number(item[config.y!]) || 0));
      }
      
      return newItem;
    });
  }
  
  // Sort if needed
  if (config.sortBy) {
    result.sort((a, b) => {
      const aVal = a[config.sortBy!];
      const bVal = b[config.sortBy!];
      
      if (config.sortDirection === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
  }
  
  // Apply limit
  if (config.limit && config.limit > 0) {
    result = result.slice(0, config.limit);
  }
  
  return result;
}