'use client';

import { useState } from 'react';
import { analyzeSchema } from '../../utils/schemaAnalyzer';
import { suggestTargets } from '../../utils/targetPlanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TargetSuggestionsProps {
  data: any[];
  onSelectTarget: (column: string, taskType: string) => void;
}

const TaskTypeBadge = ({ type }: { type: string }) => {
  const colorMap: Record<string, string> = {
    regression: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    classification: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    forecasting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  );
};

export default function TargetSuggestions({ data, onSelectTarget }: TargetSuggestionsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();
  
  const analyzeSuggestions = async () => {
    if (!data || data.length === 0) {
      toast({
        title: "No data available",
        description: "Please upload a dataset first",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setProgress(10);
    
    try {
      // Perform schema analysis
      setProgress(30);
      const schema = analyzeSchema(data);
      
      // Generate target suggestions
      setProgress(70);
      const targets = suggestTargets(schema);
      
      setSuggestions(targets);
      setProgress(100);
      
      if (targets.length === 0) {
        toast({
          title: "No suggestions found",
          description: "Could not identify suitable target columns in your dataset",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error analyzing dataset:", error);
      toast({
        title: "Analysis error",
        description: "An error occurred while analyzing your dataset",
        variant: "destructive"
      });
    } finally {
      // Small delay to show the completed progress
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
      }, 500);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Target Column Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered target column detection for your analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Analyzing dataset structure...</p>
            <Progress value={progress} className="h-2" />
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              We've analyzed your dataset and found these potential target columns:
            </p>
            
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{suggestion.column}</div>
                    <div className="text-xs text-gray-500">{suggestion.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <TaskTypeBadge type={suggestion.taskType} />
                      <span className="text-xs text-gray-500">
                        {suggestion.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSelectTarget(suggestion.column, suggestion.taskType)}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <p className="text-sm text-center text-gray-500">
              Let our AI analyze your dataset and suggest the best columns to use as targets for your analysis.
            </p>
            <Button onClick={analyzeSuggestions} className="w-full">
              Analyze Dataset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}