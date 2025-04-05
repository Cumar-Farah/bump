import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import UploadZone from '@/components/upload/upload-zone';
import RecentUploads from '@/components/upload/recent-uploads';
import QuickStart from '@/components/quick-start';
import DataPreview from '@/components/data/DataPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useUploadContext } from '@/contexts/upload-context';

const UploadPage: React.FC = () => {
  const { refreshDatasets, datasets, setSelectedDataset } = useUploadContext();
  const [selectedDatasetLocal, setSelectedDatasetLocal] = useState<number | null>(null);
  const [, navigate] = useLocation();
  
  // Sample data for DataPreview - in a real app, this would come from the API
  const sampleData = [
    { id: 1, variable: "age", type: "continuous", mean: 45.2, median: 42, min: 18, max: 85 },
    { id: 2, variable: "income", type: "continuous", mean: 52150, median: 48000, min: 10000, max: 150000 },
    { id: 3, variable: "gender", type: "categorical", categories: "male,female,other", mostFrequent: "female" },
    { id: 4, variable: "education", type: "ordinal", levels: "high school,bachelor,master,phd", mostFrequent: "bachelor" },
    { id: 5, variable: "region", type: "categorical", categories: "north,south,east,west", mostFrequent: "east" }
  ];
  
  const handleNavigateToInsights = () => {
    if (selectedDatasetLocal && datasets) {
      const dataset = datasets.find(ds => ds.id === selectedDatasetLocal);
      if (dataset) {
        setSelectedDataset(dataset);
        navigate('/insights');
      }
    }
  };
  
  useEffect(() => {
    refreshDatasets();
  }, [refreshDatasets]);
  
  useEffect(() => {
    // When uploads are available, select the first one by default if nothing is selected
    if (datasets && datasets.length > 0 && !selectedDatasetLocal) {
      setSelectedDatasetLocal(datasets[0].id);
    }
    
    // If the previously selected dataset no longer exists, select a new one or clear selection
    if (selectedDatasetLocal && datasets && !datasets.some(dataset => dataset.id === selectedDatasetLocal)) {
      if (datasets.length > 0) {
        setSelectedDatasetLocal(datasets[0].id);
      } else {
        setSelectedDatasetLocal(null);
      }
    }
  }, [datasets, selectedDatasetLocal]);

  return (
    <MainLayout
      title="Upload Dataset"
      description="Upload your data to start exploring insights and modeling"
    >
      <div className="space-y-8">
        <UploadZone />
        <RecentUploads onSelectDataset={setSelectedDatasetLocal} selectedDataset={selectedDatasetLocal} />
        
        {selectedDatasetLocal && (
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <DataPreview data={sampleData} />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleNavigateToInsights}
                className="w-full sm:w-auto"
              >
                Analyze This Dataset
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <QuickStart />
      </div>
    </MainLayout>
  );
};

export default UploadPage;
