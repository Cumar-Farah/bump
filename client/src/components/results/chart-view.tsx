import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartViewProps {
  data?: any[];
  xKey?: string;
  yKeys?: {
    key: string;
    color: string;
    name: string;
  }[];
  title?: string;
  height?: number;
  isLoading?: boolean;
}

const ChartView: React.FC<ChartViewProps> = ({ 
  data = [],
  xKey = 'name',
  yKeys = [],
  title = 'Chart',
  height = 350,
  isLoading = false
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-4">Loading chart data...</div>
        ) : data.length === 0 ? (
          <div className="text-center p-4">No data available for visualization</div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yKeys.map((yKey, index) => (
                <Bar
                  key={index}
                  dataKey={yKey.key}
                  name={yKey.name}
                  fill={yKey.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartView;