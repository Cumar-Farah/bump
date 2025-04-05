import React, { useState, useEffect } from 'react';
import InsightsPortfolio, { OutputType, Technique } from '@/components/insights/InsightsPortfolio';
import TargetColumnSelector from '@/components/insights/target-column-selector';
import TargetSuggestions from '@/components/insights/target-suggestions';
import { useUpload } from '@/contexts/upload-context';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database } from 'lucide-react';

const InsightsPage = () => {
  const { selectedDataset, techniques, setResult, setTarget } = useUpload();
  const [_, navigate] = useLocation();
  const [activeOutput, setActiveOutput] = useState<OutputType | null>(null);
  const [datasetSample, setDatasetSample] = useState<any[]>([]);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  
  // Load dataset sample for target suggestions
  useEffect(() => {
    if (selectedDataset) {
      fetchDatasetSample(selectedDataset.id);
    }
  }, [selectedDataset]);
  
  const fetchDatasetSample = async (datasetId: number) => {
    setIsLoadingSample(true);
    try {
      const response = await fetch(`/api/data/${datasetId}?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setDatasetSample(data.rows || []);
      }
    } catch (error) {
      console.error('Error fetching dataset sample:', error);
    } finally {
      setIsLoadingSample(false);
    }
  };
  
  // Add technique and output type to result when a technique is selected
  const handleSelectTechnique = (technique: Technique, result: any) => {
    // Store the result in context and navigate to results page
    setResult({
      ...result,
      technique_name: technique.name,
      technique_code: technique.code,
      output_types: technique.output_types
    });
    navigate('/results');
  };
  
  // Handle target column selection from suggestions
  const handleTargetSelection = (column: string) => {
    setTarget(column);
    // Refresh techniques based on new target
    if (selectedDataset) {
      fetchDatasetSample(selectedDataset.id);
    }
  };
  
  if (!selectedDataset) {
    return (
      <div className="p-8 space-y-4">
        <Card className="border-zinc-800 bg-black">
          <CardHeader>
            <CardTitle className="text-xl font-light">No Dataset Selected</CardTitle>
            <CardDescription className="text-zinc-400">
              Please upload or select a dataset first to see available analysis techniques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 border-zinc-800 hover:bg-zinc-900 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Upload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Target column selector */}
          <TargetColumnSelector 
            datasetId={selectedDataset.id} 
            techniqueCategory="classification" 
          />
          
          {/* Target column suggestions */}
          {datasetSample.length > 0 ? (
            <TargetSuggestions 
              data={datasetSample} 
              onSelectTarget={handleTargetSelection} 
            />
          ) : isLoadingSample ? (
            <Card className="border-zinc-800 bg-black">
              <CardContent className="p-4 flex items-center justify-center space-x-2">
                <Database size={16} className="animate-pulse text-zinc-400" />
                <p className="text-zinc-400 text-sm">Loading dataset sample...</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
        
        <div className="lg:col-span-2">
          {/* Insights portfolio with output type filtering */}
          <InsightsPortfolio 
            techniques={techniques} 
            datasetId={selectedDataset.id}
            onSelectTechnique={handleSelectTechnique}
            activeOutput={activeOutput}
            setActiveOutput={setActiveOutput}
          />
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
