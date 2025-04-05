import React from 'react';

interface ExplanationBlockProps {
  explanation: string;
  title?: string;
}

const ExplanationBlock: React.FC<ExplanationBlockProps> = ({ 
  explanation, 
  title = 'Explanation' 
}) => {
  if (!explanation || explanation.trim() === '') {
    return (
      <div className="bg-muted p-6 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No explanation available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <div className="bg-muted p-4 rounded-md">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {explanation}
        </p>
      </div>
    </div>
  );
};

export default ExplanationBlock;