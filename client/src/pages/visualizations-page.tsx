import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import ChartView from '@/components/results/chart-view';
import { useUploadContext } from '@/contexts/upload-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

const VisualizationsPage: React.FC = () => {
  const { uploadState } = useUploadContext();
  const { recentUploads } = uploadState;
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  
  // Sample data for our chart - in a real app, this would come from API
  const barChartData = [
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 19 },
    { name: 'Mar', value: 3 },
    { name: 'Apr', value: 5 },
    { name: 'May', value: 2 },
    { name: 'Jun', value: 3 },
  ];
  
  const lineChartData = [
    { name: 'Jan', a: 4000, b: 2400 },
    { name: 'Feb', a: 3000, b: 1398 },
    { name: 'Mar', a: 2000, b: 9800 },
    { name: 'Apr', a: 2780, b: 3908 },
    { name: 'May', a: 1890, b: 4800 },
    { name: 'Jun', a: 2390, b: 3800 },
  ];
  
  // In a real implementation, this would fetch the actual data for the selected dataset
  const handleSelectDataset = (id: number) => {
    setSelectedDataset(id);
  };
  
  return (
    <MainLayout 
      title="Visualizations" 
      description="Create visual representations of your data"
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
              <Tabs defaultValue="bar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                  <TabsTrigger value="line">Line Chart</TabsTrigger>
                </TabsList>
                <TabsContent value="bar">
                  <ChartView 
                    data={barChartData} 
                    xKey="name"
                    yKeys={[
                      { key: 'value', color: '#3B82F6', name: 'Value' }
                    ]}
                    title="Bar Chart"
                  />
                </TabsContent>
                <TabsContent value="line">
                  <ChartView 
                    data={lineChartData} 
                    xKey="name"
                    yKeys={[
                      { key: 'a', color: '#3B82F6', name: 'Series A' },
                      { key: 'b', color: '#F97316', name: 'Series B' }
                    ]}
                    title="Line Chart"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  Select a dataset to visualize its data
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default VisualizationsPage;