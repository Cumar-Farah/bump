'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Table2 } from 'lucide-react';
import { useOutputMap } from '@/contexts/outputMapContext';
import DataTable from '../../components/shared/DataTable';
import ChartRenderer from '../../components/shared/ChartRenderer';

export default function OutputRenderer() {
  const { outputMap } = useOutputMap();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<Record<string, boolean>>({
    chart: false,
    table: false,
    text: false,
    stats: false
  });

  // Calculate output type counts
  const counts = {
    chart: outputMap.chart.length,
    table: outputMap.table.length,
    text: outputMap.text.length,
    stats: outputMap.stats.length,
    all: outputMap.chart.length + outputMap.table.length + outputMap.text.length + outputMap.stats.length
  };

  // Log outputMap changes for debugging
  useEffect(() => {
    console.log("OutputMap updated:", { 
      chart: outputMap.chart.length,
      table: outputMap.table.length,
      text: outputMap.text.length,
      stats: outputMap.stats.length
    });
  }, [outputMap]);

  // Set loading state for each output type
  const updateLoadingState = (type: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [type]: isLoading }));
  };

  // Render appropriate content based on output type
  const renderOutputItem = (item: any, index: number) => {
    if (!item) return null;
    
    try {
      switch(item.outputType) {
        case 'chart':
          return (
            <Card key={`chart-${index}`} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  {item.technique} {item.target ? `for ${item.target}` : ''}
                </CardTitle>
                {item.chart?.title && <CardDescription>{item.chart.title}</CardDescription>}
              </CardHeader>
              <CardContent>
                <ChartRenderer 
                  type={item.data.chartType || 'bar'}
                  data={item.data.chartData || []} 
                  xKey={item.data.xKey || 'x'}
                  yKey={item.data.yKey || 'y'}
                />
              </CardContent>
            </Card>
          );
        
        case 'table':
          return (
            <Card key={`table-${index}`} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Table2 className="mr-2 h-5 w-5" />
                  {item.technique} {item.target ? `for ${item.target}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={item.data} />
              </CardContent>
            </Card>
          );
        
        case 'text':
          return (
            <Card key={`text-${index}`} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <FileText className="mr-2 h-5 w-5" />
                  {item.technique} {item.target ? `for ${item.target}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {typeof item.data === 'string' ? (
                    <p>{item.data}</p>
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(item.data, null, 2)}</pre>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        
        case 'stats':
          return (
            <Card key={`stats-${index}`} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <FileText className="mr-2 h-5 w-5" />
                  {item.technique} Statistics {item.target ? `for ${item.target}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(item.data).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                      <dd className="text-lg font-semibold">
                        {typeof value === 'number' ? 
                          value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : 
                          String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          );
        
        default:
          return (
            <Card key={`unknown-${index}`} className="shadow-sm">
              <CardHeader>
                <CardTitle>Unknown output type</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
              </CardContent>
            </Card>
          );
      }
    } catch (error) {
      console.error("Error rendering output item:", error, item);
      return (
        <Card key={`error-${index}`} className="shadow-sm border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error Rendering Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-500">There was an error rendering this result.</p>
          </CardContent>
        </Card>
      );
    }
  };

  const getItemsToRender = () => {
    if (activeTab === 'all') {
      const results = [
        ...outputMap.chart,
        ...outputMap.table,
        ...outputMap.text,
        ...outputMap.stats
      ];
      return results;
    }
    return outputMap[activeTab as keyof typeof outputMap] || [];
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="chart">
            Charts ({counts.chart})
          </TabsTrigger>
          <TabsTrigger value="table">
            Tables ({counts.table})
          </TabsTrigger>
          <TabsTrigger value="stats">
            Statistics ({counts.stats})
          </TabsTrigger>
          <TabsTrigger value="text">
            Text ({counts.text})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getItemsToRender().map((item, index) => renderOutputItem(item, index))}
            {getItemsToRender().length === 0 && (
              <div className="col-span-2 p-8 text-center border rounded-md">
                <p className="text-gray-500">No results available. Try running some analyses.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {['chart', 'table', 'text', 'stats'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outputMap[tab as keyof typeof outputMap].map((item, index) => renderOutputItem(item, index))}
              {outputMap[tab as keyof typeof outputMap].length === 0 && (
                <div className="col-span-2 p-8 text-center border rounded-md">
                  <p className="text-gray-500">No {tab} results available.</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}