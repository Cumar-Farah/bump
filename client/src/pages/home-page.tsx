import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Upload, Brain, ChartBarStacked } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Modular, Explainable Data Modeling Engine
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Upload datasets, view inferred schema, and select modeling techniques based on data characteristics.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Data
            </Button>
          </Link>
          <Link href="/samples">
            <Button variant="outline" className="gap-2">
              Explore Samples
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-10">
        <h2 className="text-2xl font-bold text-center mb-8">How BumpData Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Upload
              </CardTitle>
              <Upload className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Upload your CSV or Excel files. BumpData automatically infers schema and data characteristics.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Analyze
              </CardTitle>
              <Brain className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Our engine identifies valid techniques based on data constraints and best practices.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Visualize
              </CardTitle>
              <ChartBarStacked className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                View results with interactive charts, statistics, and explainable insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="py-10">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Ready to get started?</h3>
            <p className="mb-6 max-w-lg mx-auto">
              Upload your first dataset and discover insights in minutes.
            </p>
            <Link href="/upload">
              <Button variant="secondary" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;
