import React from 'react';
import { VariationConfig } from '@/engine/variationEngine';
import ChartRenderer from './ChartRenderer';

interface VariationRendererProps {
  variations: VariationConfig[];
  data: any[];
}

const VariationRenderer: React.FC<VariationRendererProps> = ({ variations, data }) => {
  if (!variations.length) return <div className="text-sm text-muted">No chart variations available.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {variations.map((variation, idx) => (
        <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
          <h4 className="text-sm font-medium mb-2">
            {variation.chartType.toUpperCase()} - X: {variation.x} | Y: {variation.y}
          </h4>
          <ChartRenderer
            type={variation.chartType as 'line' | 'bar' | 'scatter'}
            data={data}
            xKey={variation.x}
            yKey={variation.y}
          />
        </div>
      ))}
    </div>
  );
};

export default VariationRenderer;