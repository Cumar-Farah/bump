import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatisticsSummaryProps {
  statistics?: {
    name: string;
    value: string | number;
    description?: string;
  }[];
  title?: string;
  isLoading?: boolean;
}

const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({ 
  statistics = [],
  title = 'Summary Statistics',
  isLoading = false
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-4">Loading statistics...</div>
        ) : statistics.length === 0 ? (
          <div className="text-center p-4">No statistics available</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statistic</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>{stat.value}</TableCell>
                  <TableCell>{stat.description || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticsSummary;