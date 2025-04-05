import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import DataBrowser from '@/components/data/data-browser';
import { useUploadContext } from '@/contexts/upload-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Sample data - this would normally come from API
const sampleData = [
  { id: 1, name: 'Variable 1', type: 'Numeric', observations: 150, missing: 0 },
  { id: 2, name: 'Variable 2', type: 'String', observations: 145, missing: 5 },
  { id: 3, name: 'Variable 3', type: 'Numeric', observations: 150, missing: 0 },
  { id: 4, name: 'Variable 4', type: 'Categorical', observations: 148, missing: 2 },
];

const DataBrowserPage: React.FC = () => {
  const { uploadState } = useUploadContext();
  const { recentUploads } = uploadState;
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  
  // Columns for our data browser
  const columns = ['id', 'name', 'type', 'observations', 'missing'];
  
  // In a real implementation, this would fetch the actual data for the selected dataset
  const handleSelectDataset = (id: number) => {
    setSelectedDataset(id);
  };
  
  return (
    <MainLayout 
      title="Data Browser" 
      description="View and explore your uploaded datasets"
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
              <DataBrowser 
                data={sampleData} 
                columns={columns}
              />
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  Select a dataset to view its contents
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default DataBrowserPage;