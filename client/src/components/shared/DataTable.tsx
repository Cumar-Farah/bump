import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps {
  data: any[];
  title?: string;
  maxRows?: number;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data = [], 
  title = 'Data', 
  maxRows = 10 
}) => {
  // Handle null, undefined, or empty data arrays
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-zinc-900 p-6 rounded-md flex items-center justify-center">
        <p className="text-zinc-500">No table data available</p>
      </div>
    );
  }

  // Handle first item not being an object
  if (!data[0] || typeof data[0] !== 'object') {
    return (
      <div className="bg-zinc-900 p-6 rounded-md flex items-center justify-center">
        <p className="text-zinc-500">Invalid table data format</p>
      </div>
    );
  }

  // Get column headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Handle empty object case
  if (headers.length === 0) {
    return (
      <div className="bg-zinc-900 p-6 rounded-md flex items-center justify-center">
        <p className="text-zinc-500">Table data contains empty objects</p>
      </div>
    );
  }

  const displayData = data.slice(0, maxRows);
  const hasMoreRows = data.length > maxRows;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-light mb-3">{title}</h3>}
      <div className="border border-zinc-800 rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-zinc-900">
              {headers.map((header) => (
                <TableHead key={header} className="text-zinc-400">
                  {header.replace(/_/g, ' ').replace(/feature_(\d+)/, 'Feature $1')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-zinc-900 border-zinc-800">
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`} className="text-sm">
                    {typeof row[header] === 'number' 
                      ? Number.isInteger(row[header]) 
                        ? row[header] 
                        : row[header].toFixed(4)
                      : String(row[header] ?? '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasMoreRows && (
        <div className="text-xs text-zinc-500 text-center mt-2">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
};

export default DataTable;