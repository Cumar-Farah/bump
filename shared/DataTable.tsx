import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps {
  data: any[];
  title?: string;
  maxRows?: number;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  title = 'Data', 
  maxRows = 10 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-muted p-6 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No data available for display</p>
      </div>
    );
  }

  // Get column headers from the first object's keys
  const headers = Object.keys(data[0]);
  const displayData = data.slice(0, maxRows);
  const hasMoreRows = data.length > maxRows;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>
                  {header.replace(/_/g, ' ').replace(/feature_(\d+)/, 'Feature $1')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`}>
                    {row[header] === null || row[header] === undefined
                      ? <span className="text-muted-foreground">NULL</span>
                      : typeof row[header] === 'number' 
                        ? Number.isInteger(row[header]) 
                          ? row[header] 
                          : row[header].toFixed(4)
                        : String(row[header])
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasMoreRows && (
        <div className="text-sm text-muted-foreground text-center mt-2">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
};

export default DataTable;