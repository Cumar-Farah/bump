import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataPreviewProps {
  data: any[];
  maxRows?: number;
}

interface VariableStats {
  variable: string;
  type: 'continuous' | 'categorical' | 'ordinal' | string;
  [key: string]: any;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, maxRows = 10 }) => {
  if (!data || data.length === 0) return <div>No data to preview.</div>;

  // Process stats for the Summary tab
  const processStatistics = (data: VariableStats[]) => {
    return data.map(variable => {
      // Different display based on variable type
      let statsDisplay = null;
      
      if (variable.type === 'continuous') {
        statsDisplay = (
          <>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="text-xs">
                <span className="font-semibold">Mean:</span> {variable.mean?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs">
                <span className="font-semibold">Median:</span> {variable.median?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs">
                <span className="font-semibold">Min:</span> {variable.min?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs">
                <span className="font-semibold">Max:</span> {variable.max?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </>
        );
      } else if (variable.type === 'categorical') {
        const categories = variable.categories?.split(',') || [];
        statsDisplay = (
          <div className="mt-2">
            <div className="text-xs mb-1">
              <span className="font-semibold">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat: string, i: number) => (
                <Badge key={i} variant={cat === variable.mostFrequent ? "default" : "outline"}>
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        );
      } else if (variable.type === 'ordinal') {
        const levels = variable.levels?.split(',') || [];
        statsDisplay = (
          <div className="mt-2">
            <div className="text-xs mb-1">
              <span className="font-semibold">Levels (ordered):</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {levels.map((level: string, i: number) => (
                <Badge key={i} variant={level === variable.mostFrequent ? "default" : "outline"}>
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        );
      }
      
      return (
        <div key={variable.id} className="border rounded-md p-3 mb-3 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <h3 className="text-md font-medium">{variable.variable}</h3>
            <Badge variant="outline" className="capitalize">
              {variable.type}
            </Badge>
          </div>
          {statsDisplay}
        </div>
      );
    });
  };

  // For raw data view, using the first few records
  const renderRawData = () => {
    const columns = Object.keys(data[0]).filter(col => col !== 'id');
    return (
      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="font-semibold">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, maxRows).map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  return (
    <Tabs defaultValue="summary">
      <TabsList className="mb-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="raw">Raw Data</TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary" className="space-y-4">
        <div className="grid gap-4">
          {processStatistics(data)}
        </div>
      </TabsContent>
      
      <TabsContent value="raw">
        {renderRawData()}
      </TabsContent>
    </Tabs>
  );
};

export default DataPreview;