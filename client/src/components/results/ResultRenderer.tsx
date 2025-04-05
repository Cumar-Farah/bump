import React from 'react';
import ChartRenderer from '@/components/shared/ChartRenderer';
import StatsBlock from '@/components/shared/StatsBlock';
import DataTable from '@/components/shared/DataTable';
import ExplanationBlock from '@/components/shared/ExplanationBlock';
import { OutputType } from '@/components/insights/InsightsPortfolio';
import { BarChart3, FileText, Table, Activity } from 'lucide-react';

interface ResultRendererProps {
  result: any;
  techniqueName?: string;
  techniqueCode?: string;
  activeOutput?: OutputType | null;
}

const ResultRenderer: React.FC<ResultRendererProps> = ({ 
  result, 
  techniqueName = 'Analysis', 
  techniqueCode = '',
  activeOutput = null
}) => {
  if (!result) {
    return (
      <div className="bg-zinc-900 p-6 rounded-md flex items-center justify-center">
        <p className="text-zinc-400">No results available</p>
      </div>
    );
  }

  // Determine the type of result we're dealing with
  const hasCharts = result.charts || result.chart_data || (result.data && Array.isArray(result.data));
  const hasStats = result.stats || result.metrics || result.performance;
  const hasTables = result.tables || result.table_data || (result.data && Array.isArray(result.data));
  const hasExplanation = result.explanation || result.interpretation;
  
  // Determine chart type based on technique code or result content
  let chartType = 'bar';
  if (techniqueCode) {
    if (['kmeans', 'hierarchical_clustering', 'dbscan'].includes(techniqueCode)) {
      chartType = 'scatter';
    } else if (['linear_regression', 'random_forest_regressor', 'ridge_regression', 'lasso_regression', 'svr', 'gradient_boosting_regressor'].includes(techniqueCode)) {
      chartType = 'regression';
    }
  } else if (result.labels || (result.clusters && result.centroids)) {
    chartType = 'scatter';
  } else if (result.actual && result.predicted) {
    chartType = 'regression';
  }

  // If activeOutput is set, only show the corresponding section
  const showChart = !activeOutput || activeOutput === 'chart';
  const showStats = !activeOutput || activeOutput === 'stats';
  const showTable = !activeOutput || activeOutput === 'table';
  const showText = !activeOutput || activeOutput === 'text';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-light">{techniqueName} Results</h2>
        
        <div className="flex gap-2">
          {hasCharts && (
            <div className={`flex items-center gap-1 text-sm p-1 rounded border 
              ${showChart ? 'border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
            >
              <BarChart3 size={14} /> Chart
            </div>
          )}
          {hasStats && (
            <div className={`flex items-center gap-1 text-sm p-1 rounded border 
              ${showStats ? 'border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
            >
              <Activity size={14} /> Stats
            </div>
          )}
          {hasTables && (
            <div className={`flex items-center gap-1 text-sm p-1 rounded border 
              ${showTable ? 'border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
            >
              <Table size={14} /> Table
            </div>
          )}
          {hasExplanation && (
            <div className={`flex items-center gap-1 text-sm p-1 rounded border 
              ${showText ? 'border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500'}`}
            >
              <FileText size={14} /> Text
            </div>
          )}
        </div>
      </div>
      
      {/* Display stats/metrics if available */}
      {showStats && hasStats && (
        <StatsBlock 
          stats={result.stats || result.metrics || result.performance} 
          title="Performance Metrics" 
        />
      )}
      
      {/* Display chart if chart data is available */}
      {showChart && hasCharts && (
        <ChartRenderer 
          data={result.charts || result.chart_data || result.data || result} 
          chartType={chartType}
          labels={result.labels || []}
          title={`${techniqueName} Visualization`}
        />
      )}
      
      {/* Display table data if available */}
      {showTable && hasTables && (
        <DataTable 
          data={result.tables || result.table_data || result.data || []} 
          title="Data Sample" 
          maxRows={10}
        />
      )}
      
      {/* Display explanation if available */}
      {showText && hasExplanation && (
        <ExplanationBlock 
          explanation={result.explanation || result.interpretation || ''} 
          title="Interpretation" 
        />
      )}

      {/* Show message when no data is available for selected output type */}
      {activeOutput && (
        (activeOutput === 'chart' && !hasCharts) ||
        (activeOutput === 'stats' && !hasStats) ||
        (activeOutput === 'table' && !hasTables) ||
        (activeOutput === 'text' && !hasExplanation)
      ) && (
        <div className="p-8 border border-zinc-800 rounded-md">
          <p className="text-zinc-400 text-center">
            No {activeOutput} data available for this analysis
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultRenderer;