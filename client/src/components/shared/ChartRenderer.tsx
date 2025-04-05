import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface ChartRendererProps {
  type: 'line' | 'bar' | 'scatter';
  data: any[];
  xKey: string;
  yKey: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ type, data, xKey, yKey }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-zinc-400">No data available for chart.</div>;
  }

  const baseChartProps = {
    data,
    margin: { top: 10, right: 20, bottom: 30, left: 10 },
  };

  // Render the appropriate chart type based on the 'type' prop
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart {...baseChartProps}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey={yKey} stroke="#805ad5" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...baseChartProps}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey={yKey} fill="#805ad5" />
          </BarChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...baseChartProps}>
            <XAxis dataKey={xKey} name={xKey} />
            <YAxis dataKey={yKey} name={yKey} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <CartesianGrid strokeDasharray="3 3" />
            <Scatter name="Data" data={data} fill="#805ad5" />
          </ScatterChart>
        );
      default:
        return <div className="text-sm text-zinc-400">Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;