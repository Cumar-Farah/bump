export type ChartType = 'scatter' | 'line' | 'bar' | 'box' | 'heatmap';

export interface VariationConfig {
  x: string;
  y: string;
  chartType: ChartType;
}

export interface ColumnSchema {
  name: string;
  type: 'numeric' | 'categorical';
}

/**
 * Maps pairs of column types to potential chart types
 */
function getChartTypes(xType: string, yType: string): ChartType[] {
  if (xType === 'numeric' && yType === 'numeric') return ['scatter', 'line'];
  if (xType === 'categorical' && yType === 'numeric') return ['bar', 'box'];
  if (xType === 'categorical' && yType === 'categorical') return ['heatmap'];
  return [];
}

/**
 * Given a schema of columns and their types, return valid chart variations
 */
export function generateChartVariations(schema: ColumnSchema[]): VariationConfig[] {
  const variations: VariationConfig[] = [];

  for (let i = 0; i < schema.length; i++) {
    for (let j = 0; j < schema.length; j++) {
      if (i === j) continue;
      const x = schema[i];
      const y = schema[j];
      const chartTypes = getChartTypes(x.type, y.type);

      for (const chartType of chartTypes) {
        variations.push({
          x: x.name,
          y: y.name,
          chartType
        });
      }
    }
  }

  return variations;
}