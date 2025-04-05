import React from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingBarProps {
  progress: number;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress }) => {
  return (
    <div className="mt-6 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Processing your data</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground text-center mt-2">
        We're analyzing your dataset to determine available techniques...
      </p>
    </div>
  );
};

export default LoadingBar;
