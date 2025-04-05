import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface InsightItem {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'positive' | 'negative';
}

interface InsightsPanelProps {
  insights?: InsightItem[];
  title?: string;
  isLoading?: boolean;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights = [],
  title = 'Data Insights',
  isLoading = false
}) => {
  // Function to determine badge styling and icon based on insight type
  const getInsightBadge = (type: InsightItem['type']) => {
    switch (type) {
      case 'info':
        return {
          variant: 'secondary' as const,
          icon: <Activity className="h-4 w-4 mr-1" />
        };
      case 'warning':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        };
      case 'positive':
        return {
          variant: 'outline' as const,
          icon: <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
        };
      case 'negative':
        return {
          variant: 'outline' as const,
          icon: <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: <Activity className="h-4 w-4 mr-1" />
        };
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Automated insights derived from your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-4">Analyzing data...</div>
        ) : insights.length === 0 ? (
          <div className="text-center p-4">No insights available for this dataset</div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const { variant, icon } = getInsightBadge(insight.type);
              return (
                <Card key={insight.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <Badge variant={variant} className="flex items-center">
                        {icon}
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{insight.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;