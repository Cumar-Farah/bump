import React from 'react';

interface StatsBlockProps {
  stats: Record<string, any>;
  title?: string;
}

const StatsBlock: React.FC<StatsBlockProps> = ({ stats, title = 'Statistics' }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="bg-muted p-6 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-muted p-4 rounded-md">
            <div className="text-sm text-muted-foreground capitalize">
              {key.replace(/_/g, ' ')}
            </div>
            <div className="font-medium">
              {typeof value === 'number' 
                ? (Number.isInteger(value) ? value : value.toFixed(4)) 
                : String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBlock;