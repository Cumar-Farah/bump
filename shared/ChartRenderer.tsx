import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

interface ChartRendererProps {
  data: any;
  chartType?: string;
  labels?: string[];
  title?: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  data, 
  chartType = 'bar',
  labels = [], 
  title 
}) => {
  // If no data or empty array, show placeholder
  if (!data || (Array.isArray(data) && data.length === 0) || 
      (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <div className="bg-muted p-6 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No data available for visualization</p>
      </div>
    );
  }
  
  // Handle errors gracefully
  try {

  // For scatter plots with clusters
  if (chartType === 'scatter' && 'centroids' in data && 'labels' in data) {
    // Extract the first two features for visualization (if more than 2D)
    const formattedData = Array.isArray(data.data) ? data.data.map((point: any, i: number) => {
      const keys = Object.keys(point).filter(k => k.startsWith('feature_'));
      return {
        x: point[keys[0]] || 0,
        y: point[keys[1]] || 0, 
        cluster: data.labels[i]
      };
    }) : [];

    // Prepare data for each cluster
    const clusterData: {[key: string]: any[]} = {};
    formattedData.forEach((point: any) => {
      const cluster = `cluster_${point.cluster}`;
      if (!clusterData[cluster]) {
        clusterData[cluster] = [];
      }
      clusterData[cluster].push(point);
    });

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

    return (
      <div className="w-full">
        {title && <h3 className="text-center text-lg font-medium mb-2">{title}</h3>}
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <XAxis type="number" dataKey="x" name="Feature 1" />
            <YAxis type="number" dataKey="y" name="Feature 2" />
            <ZAxis range={[100]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            
            {Object.entries(clusterData).map(([cluster, points], i) => (
              <Scatter
                key={cluster}
                name={`Cluster ${cluster.split('_')[1]}`}
                data={points}
                fill={colors[i % colors.length]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // For regression results
  if (chartType === 'regression' && 'actual' in data && 'predicted' in data) {
    const regressionData = data.actual.map((actual: number, i: number) => ({
      index: i,
      actual,
      predicted: data.predicted[i]
    }));

    return (
      <div className="w-full">
        {title && <h3 className="text-center text-lg font-medium mb-2">{title}</h3>}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={regressionData}>
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#8884d8" name="Actual" />
            <Bar dataKey="predicted" fill="#82ca9d" name="Predicted" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // For time series / forecasting
  if (chartType === 'line' || chartType === 'timeseries') {
    return (
      <div className="w-full">
        {title && <h3 className="text-center text-lg font-medium mb-2">{title}</h3>}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={Array.isArray(data) ? data : [data]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {labels.length > 0 ? (
              labels.map((label, i) => (
                <Line 
                  key={label} 
                  type="monotone" 
                  dataKey={label} 
                  stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} 
                  activeDot={{ r: 8 }}
                />
              ))
            ) : (
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Pie chart for category distributions
  if (chartType === 'pie' && Array.isArray(data)) {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
    
    return (
      <div className="w-full">
        {title && <h3 className="text-center text-lg font-medium mb-2">{title}</h3>}
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Default bar chart for other data
  return (
    <div className="w-full">
      {title && <h3 className="text-center text-lg font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={Array.isArray(data) ? data : [data]}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {labels.length > 0 ? (
            labels.map((label, i) => (
              <Bar key={label} dataKey={label} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
            ))
          ) : (
            <Bar dataKey="value" fill="#8884d8" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <div className="bg-muted p-6 rounded-md flex flex-col items-center justify-center">
        <p className="text-red-500 mb-2">Chart rendering failed</p>
        <p className="text-muted-foreground text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

export default ChartRenderer;