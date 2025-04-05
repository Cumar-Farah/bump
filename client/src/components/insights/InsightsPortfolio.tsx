// InsightsPortfolio.tsx (strict mode)
import React from 'react';
import { BarChart3, FileText, Table2, Activity } from 'lucide-react';
import { useUpload } from '@/contexts/upload-context';
import { useOutputMap } from '@/contexts/outputMapContext';
import { useToast } from '@/hooks/use-toast';

export type OutputType = 'chart' | 'stats' | 'table' | 'text';

export interface Technique {
  name: string;
  code: string;
  tags: string[];
  output_types: string[];
}

interface TechniqueCardProps {
  technique: Technique;
  onRun: (techniqueCode: string, datasetId: number) => Promise<void>;
  isLoading: boolean;
  datasetId: number;
  activeOutputFilter: OutputType | null;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ 
  technique, 
  onRun, 
  isLoading, 
  datasetId,
  activeOutputFilter 
}) => {
  const { name, tags, code } = technique;

  const handleRunTechnique = async () => {
    try {
      await onRun(code, datasetId);
    } catch (error) {
      console.error('Failed to run technique:', error);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card text-foreground shadow-sm">
      <h3 className="text-base font-semibold mb-1">{name}</h3>
      <div className="text-xs text-muted mb-2">{tags.join(', ')}</div>

      <div className="flex items-center gap-2 text-xs text-muted mb-4">
        <span>Available outputs:</span>
        {technique.output_types.includes('chart') && <BarChart3 size={14} />}
        {technique.output_types.includes('stats') && <Activity size={14} />}
        {technique.output_types.includes('table') && <Table2 size={14} />}
        {technique.output_types.includes('text') && <FileText size={14} />}
      </div>

      <button
        disabled={isLoading}
        onClick={handleRunTechnique}
        className="w-full py-2 mt-2 border border-border rounded text-xs hover:bg-muted/10 transition"
      >
        {isLoading ? 'Generating...' : 'Generate Insight'}
      </button>
    </div>
  );
};

interface InsightsPortfolioProps {
  techniques: Technique[];
  datasetId: number;
  onSelectTechnique?: (technique: Technique, result: any) => void;
  activeOutput: OutputType | null;
  setActiveOutput?: React.Dispatch<React.SetStateAction<OutputType | null>>;
}

export default function InsightsPortfolio({ 
  techniques: externalTechniques, 
  datasetId, 
  onSelectTechnique,
  activeOutput,
  setActiveOutput
}: InsightsPortfolioProps) {
  const { runTechnique, runningTechniques, resultsMap } = useUpload();
  const { toast } = useToast();
  const { outputMap } = useOutputMap();
  
  // Determine which techniques to use (from props or context)
  const techniques = externalTechniques;
  
  // Run a technique and notify parent component if callback provided
  const handleRunTechnique = async (techniqueCode: string, datasetId: number) => {
    try {
      const result = await runTechnique(techniqueCode, datasetId);
      
      // If callback provided, notify parent with result
      if (onSelectTechnique) {
        const techniqueInfo = techniques.find(t => t.code === techniqueCode);
        if (techniqueInfo) {
          onSelectTechnique(techniqueInfo, result);
        }
      }
      
      return result;
    } catch (error) {
      toast({
        title: 'Error Running Technique',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  // Filter techniques based on activeOutput if specified
  const filtered = activeOutput 
    ? techniques.filter((tech) => {
        // Filter based on available results
        if (resultsMap && tech.code in resultsMap) {
          const result = resultsMap[tech.code];
          if (!result) return false;

          const output = result[activeOutput];
          if (activeOutput === 'chart') return Array.isArray(output) && output.length > 0;
          if (activeOutput === 'table') return Array.isArray(output) && output.length > 0;
          if (activeOutput === 'text') return typeof output === 'string' && output.length > 0;
          if (activeOutput === 'stats') return typeof output === 'object' && Object.keys(output).length > 0;
        }
        
        // If no active filter or no results yet, show all techniques
        return !activeOutput;
      })
    : techniques;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((tech) => (
        <TechniqueCard
          key={tech.code}
          technique={tech}
          onRun={handleRunTechnique}
          isLoading={!!runningTechniques[tech.code]}
          datasetId={datasetId}
          activeOutputFilter={activeOutput}
        />
      ))}
      {filtered.length === 0 && (
        <div className="col-span-3 p-6 text-center border border-dashed rounded-lg">
          <p className="text-muted">No techniques available for this filter</p>
        </div>
      )}
    </div>
  );
}