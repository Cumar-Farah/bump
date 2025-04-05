import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import StatisticsSummary from '@/components/insights/statistics-summary';
import { useUploadContext } from '@/contexts/upload-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

const StatisticsPage: React.FC = () => {
  const { uploadState } = useUploadContext();
  const { recentUploads } = uploadState;
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  
  // Sample statistics data - in a real app, this would be calculated from the dataset
  const descriptiveStats = [
    { name: 'Mean', value: '42.1', description: 'Average value' },
    { name: 'Median', value: '39.5', description: 'Middle value' },
    { name: 'Min', value: '12.3', description: 'Minimum value' },
    { name: 'Max', value: '92.7', description: 'Maximum value' },
    { name: 'Std. Dev', value: '15.2', description: 'Standard deviation' },
  ];
  
  const distributionStats = [
    { name: 'Skewness', value: '0.42', description: 'Measure of asymmetry' },
    { name: 'Kurtosis', value: '2.1', description: 'Measure of "tailedness"' },
    { name: 'P(25)', value: '28.4', description: '25th percentile' },
    { name: 'P(50)', value: '39.5', description: '50th percentile (median)' },
    { name: 'P(75)', value: '55.3', description: '75th percentile' },
  ];
  
  // In a real implementation, this would fetch the actual statistics for the selected dataset
  const handleSelectDataset = (id: number) => {
    setSelectedDataset(id);
  };
  
  return (
    <MainLayout 
      title="Statistics" 
      description="View summary statistics for your datasets"
    >
      <div className="container mx-auto p-4 space-y-6">
        {recentUploads.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No datasets available</AlertTitle>
            <AlertDescription>
              You haven't uploaded any datasets yet. 
              <Link href="/upload">
                <a className="ml-2 underline text-primary">
                  Upload a dataset now
                </a>
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Your Datasets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {recentUploads.map((dataset) => (
                    <Button
                      key={dataset.id}
                      variant={selectedDataset === dataset.id ? "default" : "outline"}
                      onClick={() => handleSelectDataset(dataset.id)}
                    >
                      {dataset.filename}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {selectedDataset ? (
              <Tabs defaultValue="descriptive" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="descriptive">Descriptive Statistics</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution Statistics</TabsTrigger>
                </TabsList>
                <TabsContent value="descriptive">
                  <StatisticsSummary 
                    statistics={descriptiveStats} 
                    title="Descriptive Statistics"
                  />
                </TabsContent>
                <TabsContent value="distribution">
                  <StatisticsSummary 
                    statistics={distributionStats} 
                    title="Distribution Statistics"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  Select a dataset to view its statistics
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default StatisticsPage;