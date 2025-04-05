import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataBrowserProps {
  data?: any[];
  columns?: string[];
  isLoading?: boolean;
}

const DataBrowser: React.FC<DataBrowserProps> = ({ 
  data = [],
  columns = [],
  isLoading = false
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data Browser</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-4">Loading data...</div>
        ) : data.length === 0 ? (
          <div className="text-center p-4">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {row[column] !== undefined ? String(row[column]) : 'N/A'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataBrowser;