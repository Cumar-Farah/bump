import React, { useState, useEffect, useMemo } from 'react';
import { useUpload } from '@/contexts/upload-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TargetColumnSelectorProps {
  datasetId: number;
  techniqueCategory?: string;
}

const TargetColumnSelector: React.FC<TargetColumnSelectorProps> = ({
  datasetId,
  techniqueCategory
}) => {
  const { 
    target, 
    setTarget,
    schema,
    fetchTechniques
  } = useUpload();
  
  // Determine eligible numeric columns for targets
  const eligibleColumns = useMemo(() => {
    if (!schema) return [];
    
    // Only numeric columns with low null percentages and reasonable cardinality
    return schema.filter(column => {
      return column.type === 'numeric' && 
             column.nullPercentage < 20 &&
             column.cardinality > 5;  // Has enough variety to be interesting
    });
  }, [schema]);
  
  // Determine if we should show the selector based on technique category
  const showSelector = techniqueCategory === 'regression' || 
                        techniqueCategory === 'classification';
  
  // Reset target column when dataset changes
  useEffect(() => {
    setTarget("");
  }, [datasetId, setTarget]);
  
  // When target changes, fetch techniques that can use this target
  useEffect(() => {
    if (datasetId && target) {
      fetchTechniques(datasetId, target);
    }
  }, [target, datasetId, fetchTechniques]);
  
  if (!showSelector || eligibleColumns.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <CardTitle className="text-lg">Select Target Variable</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  The target variable is the outcome you're trying to predict or analyze. 
                  Only numeric columns with minimal missing values are available.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Choose which variable should be predicted or analyzed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="target-column">Target Column</Label>
            <Select
              value={target || ''}
              onValueChange={(value) => setTarget(value)}
            >
              <SelectTrigger id="target-column">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {eligibleColumns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    <div className="flex items-center">
                      <span>{column.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {column.nullPercentage > 0 
                          ? `${column.nullPercentage.toFixed(1)}% null` 
                          : 'complete'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {target && schema && (
              <div className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Selected:</span> {target}
                {schema.find((c) => c.name === target)?.min !== undefined && (
                  <span className="ml-2">
                    [Min: {schema.find((c) => c.name === target)?.min?.toFixed(2)}, 
                    Max: {schema.find((c) => c.name === target)?.max?.toFixed(2)}]
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetColumnSelector;