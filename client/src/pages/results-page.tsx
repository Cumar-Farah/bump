import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useUpload } from '@/contexts/upload-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Download, BarChart3, FileText, Table, Activity } from 'lucide-react';
import ResultRenderer from '@/components/results/ResultRenderer';
import { OutputType } from '@/components/insights/InsightsPortfolio';

const ResultsPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const { selectedDataset, result } = useUpload();
  const [activeOutput, setActiveOutput] = useState<OutputType | null>(null);
  
  // If no result is available yet, create a simple placeholder
  const displayResult = result || {
    explanation: "No analysis result available yet. Please run an analysis technique first."
  };
  
  // Create a default technique object if none is provided
  const technique = {
    name: "Analysis Results",
    code: "unknown",
    tags: [],
    output_types: ["text"]
  };
  
  const handleBackToInsights = () => {
    navigate('/insights');
  };
  
  const handleDownloadResults = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `analysis_results_${selectedDataset?.id}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  const toggleOutput = (output: OutputType) => {
    setActiveOutput(activeOutput === output ? null : output);
  };
  
  if (!selectedDataset || !result) {
    return (
      <div className="container mx-auto p-8">
        <Alert className="mb-6 bg-zinc-900 border-zinc-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No analysis results available</AlertTitle>
          <AlertDescription>
            Please select a dataset and run an analysis technique to view results.
            <Button 
              variant="link" 
              onClick={() => navigate('/insights')}
              className="p-0 h-auto ml-2"
            >
              Go to Insights
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackToInsights}
          className="border-zinc-800 hover:bg-zinc-900 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Insights
        </Button>
        
        <div className="flex gap-2 items-center">
          {/* Output Filter Buttons */}
          <div className="flex border-r border-zinc-800 pr-4 mr-4">
            <button
              onClick={() => toggleOutput('chart')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                activeOutput === 'chart' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <BarChart3 size={14} />
              Charts
            </button>
            <button
              onClick={() => toggleOutput('table')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                activeOutput === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <Table size={14} />
              Tables
            </button>
            <button
              onClick={() => toggleOutput('stats')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                activeOutput === 'stats' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <Activity size={14} />
              Stats
            </button>
            <button
              onClick={() => toggleOutput('text')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                activeOutput === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <FileText size={14} />
              Text
            </button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadResults}
            className="border-zinc-800 hover:bg-zinc-900 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <Card className="border-zinc-800 bg-black">
        <CardHeader>
          <CardTitle className="text-xl font-light">Analysis Results</CardTitle>
          <CardDescription className="text-zinc-400">
            Analysis results for {selectedDataset.filename}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResultRenderer 
            result={result} 
            techniqueName={result.technique_name || "Analysis Results"}
            techniqueCode={result.technique_code || "unknown"}
            activeOutput={activeOutput}
          />
          
          {/* Display raw JSON for debugging */}
          <div className="mt-8 border-t border-zinc-800 pt-4">
            <details>
              <summary className="cursor-pointer text-sm font-light text-zinc-400 hover:text-white">
                View Raw Result Data
              </summary>
              <pre className="mt-2 p-4 bg-zinc-900 rounded-md overflow-auto text-xs text-zinc-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-zinc-800 bg-black">
        <CardHeader>
          <CardTitle className="text-xl font-light">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
              <h3 className="font-light mb-2">Apply Another Technique</h3>
              <p className="text-xs text-zinc-400 mb-4">Try a different analysis technique on this dataset.</p>
              <Button 
                onClick={handleBackToInsights}
                variant="outline"
                className="text-xs border-zinc-800 hover:bg-zinc-900 hover:text-white"
              >
                View Techniques
              </Button>
            </div>
            
            <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
              <h3 className="font-light mb-2">Upload a New Dataset</h3>
              <p className="text-xs text-zinc-400 mb-4">Upload a different dataset for analysis.</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/upload')}
                className="text-xs border-zinc-800 hover:bg-zinc-900 hover:text-white"
              >
                Upload Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;