import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-provider';
import { useOutputMap, OutputType } from '@/contexts/outputMapContext';

type ColumnSchema = {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'datetime' | 'boolean';
  nullPercentage: number;
  cardinality: number;
  min?: number;
  max?: number;
  mean?: number;
};

type DatasetMeta = {
  id: number;
  filename: string;
  filesize: number;
  rows: number | null;
  columns: number | null;
  uploadedAt: string;
};

type TechniqueInfo = {
  name: string;
  code: string;
  tags: string[];
  output_types: string[];
};

type UploadContextType = {
  schema: ColumnSchema[] | null;
  datasets: DatasetMeta[] | null;
  selectedDataset: DatasetMeta | null;
  target: string;
  techniques: TechniqueInfo[];
  result: any | null;
  isLoading: boolean;
  uploadFile: (file: File) => Promise<void>;
  fetchTechniques: (datasetId: number, targetOverride?: string) => Promise<void>;
  runTechnique: (technique: string, datasetId: number) => Promise<any>;
  setTarget: React.Dispatch<React.SetStateAction<string>>;
  setResult: React.Dispatch<React.SetStateAction<any | null>>;
  setSelectedDataset: React.Dispatch<React.SetStateAction<DatasetMeta | null>>;
  refreshDatasets: () => Promise<void>;
  deleteDataset: (datasetId: number) => Promise<void>;
  resultsMap: Record<string, any>;
  runningTechniques: Record<string, boolean>;
};

const UploadContext = createContext<UploadContextType | null>(null);

// For backward compatibility
export const UploadContextProvider = ({ children }: { children: ReactNode }) => {
  return <UploadProvider>{children}</UploadProvider>;
};

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addOutput, clearOutputs } = useOutputMap();
  const [schema, setSchema] = useState<ColumnSchema[] | null>(null);
  const [datasets, setDatasets] = useState<DatasetMeta[] | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetMeta | null>(null);
  const [techniques, setTechniques] = useState<TechniqueInfo[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [target, setTarget] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Track results per technique
  const [resultsMap, setResultsMap] = useState<Record<string, any>>({});
  // Track which techniques are currently running
  const [runningTechniques, setRunningTechniques] = useState<Record<string, boolean>>({});

  // Load datasets when user changes or on initial load
  useEffect(() => {
    if (user) {
      refreshDatasets();
    }
  }, [user]);

  // Reset results when dataset or target changes
  useEffect(() => {
    setResultsMap({});
    setResult(null);
  }, [selectedDataset, target]);

  const refreshDatasets = async (): Promise<void> => {
    try {
      const res = await fetch('/api/datasets');
      if (!res.ok) throw new Error('Failed to fetch datasets');
      const data = await res.json();
      setDatasets(data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your datasets',
        variant: 'destructive',
      });
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await res.json();
      
      // Refresh datasets list
      await refreshDatasets();
      
      // Set the newly uploaded dataset as selected
      setSelectedDataset(data);
      
      // Reset target and results
      setTarget("");
      setResultsMap({});
      setResult(null);
      
      toast({
        title: 'Success!',
        description: `${file.name} uploaded successfully`,
      });
      
      // Load schema for the newly uploaded dataset
      await fetchSchema(data.id);
      
      // Fetch unsupervised techniques by default
      await fetchTechniques(data.id, "");
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Could not upload file',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchema = async (datasetId: number): Promise<void> => {
    try {
      const res = await fetch(`/api/schema/${datasetId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch schema');
      }
      
      const data = await res.json();
      setSchema(data.columns || []);
    } catch (error) {
      console.error('Error fetching schema:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dataset schema',
        variant: 'destructive',
      });
      setSchema(null);
    }
  };

  const fetchTechniques = async (datasetId: number, targetOverride?: string): Promise<void> => {
    try {
      const query = targetOverride !== undefined ? targetOverride : target;
      const res = await fetch(`/api/constraints/${datasetId}?target=${query}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch techniques');
      }
      
      const data = await res.json();
      setTechniques(data.valid_techniques || []);
    } catch (error) {
      console.error('Error fetching techniques:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available techniques',
        variant: 'destructive',
      });
      setTechniques([]);
    }
  };

  const runTechnique = async (technique: string, datasetId: number): Promise<any> => {
    // Set the specific technique as loading
    setRunningTechniques(prev => ({ ...prev, [technique]: true }));
    
    try {
      const res = await fetch(`/api/run/${technique}/${datasetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_column: target })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to run ${technique}`);
      }

      const data = await res.json();
      
      // Store result in the resultsMap
      setResultsMap(prev => ({ ...prev, [technique]: data }));
      
      // Also set as the current result for backward compatibility
      setResult(data);
      
      // Find the technique info to get its name and output types
      const techniqueInfo = techniques.find(t => t.code === technique);
      
      if (techniqueInfo) {
        // Process and add outputs to the OutputMap for each output type
        if (data.charts && Array.isArray(data.charts) && data.charts.length > 0) {
          addOutput({
            technique: techniqueInfo.name,
            target: target || undefined,
            outputType: 'chart',
            data: {
              chartData: data.charts,
              chartType: data.chartType || 'bar',
              xKey: data.xKey || 'x',
              yKey: data.yKey || 'y'
            },
            chart: {
              title: data.title || `${techniqueInfo.name} Chart`,
              description: data.description
            }
          });
        }
        
        if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
          addOutput({
            technique: techniqueInfo.name,
            target: target || undefined,
            outputType: 'table',
            data: data.tables
          });
        }
        
        if (data.text && typeof data.text === 'string' && data.text.length > 0) {
          addOutput({
            technique: techniqueInfo.name,
            target: target || undefined,
            outputType: 'text',
            data: data.text
          });
        }
        
        if (data.stats && typeof data.stats === 'object' && Object.keys(data.stats).length > 0) {
          addOutput({
            technique: techniqueInfo.name,
            target: target || undefined,
            outputType: 'stats',
            data: data.stats
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Error running ${technique}:`, error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : `Could not run ${technique}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Remove loading state for this technique
      setRunningTechniques(prev => ({ ...prev, [technique]: false }));
    }
  };

  const deleteDataset = async (datasetId: number): Promise<void> => {
    try {
      const res = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete dataset');
      }

      // If the deleted dataset is the currently selected one, reset selection
      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
        setSchema(null);
        setResultsMap({});
        setResult(null);
      }

      // Refresh datasets list
      await refreshDatasets();
      
      toast({
        title: 'Dataset Deleted',
        description: 'The dataset has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not delete dataset',
        variant: 'destructive',
      });
    }
  };

  return (
    <UploadContext.Provider
      value={{
        schema,
        datasets,
        selectedDataset,
        target,
        techniques,
        result,
        isLoading,
        uploadFile,
        fetchTechniques,
        runTechnique,
        setTarget,
        setResult,
        setSelectedDataset,
        refreshDatasets,
        deleteDataset,
        resultsMap,
        runningTechniques
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

// For backward compatibility with components using useUploadContext
export const useUploadContext = useUpload;
