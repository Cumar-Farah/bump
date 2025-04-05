// autoRunner.ts

import { ColumnProfile } from './schemaAnalyzer';
import { TargetSuggestion } from './targetPlanner';
import { VariationConfig } from './variationEngine';
import { preprocessDataset } from './preprocessor';

export interface ModelRunRequest {
  technique: string;
  target?: string;
  chart?: VariationConfig;
}

export interface ModelResult {
  technique: string;
  target?: string;
  outputType: 'chart' | 'table' | 'text' | 'stats';
  data: any;
}

export async function autoRunModels(
  rawData: any[],
  schema: ColumnProfile[],
  targets: TargetSuggestion[],
  variations: VariationConfig[],
  runModel: (req: ModelRunRequest, data: any[]) => Promise<ModelResult[]>,
  addResult?: (result: ModelResult) => void
): Promise<ModelResult[]> {
  console.log("AutoRunner starting with:", {
    dataLength: rawData.length,
    schemaLength: schema.length,
    targetsLength: targets.length,
    variationsLength: variations.length
  });
  
  const cleaned = preprocessDataset(rawData, schema);
  console.log("Preprocessed data length:", cleaned.length);
  
  const results: ModelResult[] = [];

  for (const target of targets) {
    console.log(`Processing target: ${target.column} (${target.taskType})`);
    for (const tech of getTechniquesForTask(target.taskType)) {
      console.log(`Running technique: ${tech} on target: ${target.column}`);
      try {
        const modelResults = await runModel({ technique: tech, target: target.column }, cleaned);
        console.log(`Got ${modelResults.length} results for ${tech}`);
        
        // Add the outputType if missing
        modelResults.forEach(result => {
          // Ensure result has outputType
          if (!result.outputType) {
            if (result.data && result.data.type === 'chart') {
              result.outputType = 'chart';
            } else if (Array.isArray(result.data)) {
              result.outputType = 'table';
            } else if (typeof result.data === 'object' && Object.keys(result.data).length > 0) {
              result.outputType = 'stats';
            } else {
              result.outputType = 'text';
            }
          }
          
          // Add to context if provided
          if (addResult) {
            addResult(result);
          }
          
          results.push(result);
        });
      } catch (error) {
        console.error(`Error running ${tech} on ${target.column}:`, error);
      }
    }
  }

  if (variations.length > 0) {
    console.log(`Processing ${variations.length} chart variations`);
    for (const variation of variations) {
      try {
        const modelResults = await runModel({ technique: 'chart', chart: variation }, cleaned);
        
        // Ensure outputType is set to 'chart'
        modelResults.forEach(result => {
          result.outputType = 'chart';
          
          // Add to context if provided
          if (addResult) {
            addResult(result);
          }
          
          results.push(result);
        });
      } catch (error) {
        console.error(`Error creating chart variation ${variation.title || 'untitled'}:`, error);
      }
    }
  }

  console.log(`AutoRunner completed with ${results.length} total results`);
  return results;
}

function getTechniquesForTask(taskType: string): string[] {
  const mapping: Record<string, string[]> = {
    regression: ['linear_regression', 'ridge_regression', 'lasso_regression', 'svr', 'gradient_boosting_regressor'],
    classification: ['logistic_regression', 'random_forest_classifier', 'svc', 'decision_tree_classifier', 'naive_bayes'],
    forecasting: ['prophet_forecasting', 'auto_arima']
  };
  return mapping[taskType] || [];
}