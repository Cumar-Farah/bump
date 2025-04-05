import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Book, Beaker, Video } from 'lucide-react';

const QuickStartItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  href: string;
}> = ({ icon, title, description, linkText, href }) => {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-lg p-3">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
            <Link href={href}>
              <a className="mt-3 text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center">
                {linkText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 ml-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickStart: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <QuickStartItem
        icon={<Book className="h-6 w-6 text-primary" />}
        title="Documentation"
        description="Learn about available techniques and constraints"
        linkText="View Docs"
        href="/documentation"
      />
      <QuickStartItem
        icon={<Beaker className="h-6 w-6 text-primary" />}
        title="Sample Datasets"
        description="Try BumpData with pre-loaded examples"
        linkText="Browse Samples"
        href="/samples"
      />
      <QuickStartItem
        icon={<Video className="h-6 w-6 text-primary" />}
        title="Tutorials"
        description="Watch step-by-step guides for BumpData"
        linkText="Watch Tutorials"
        href="/tutorials"
      />
    </div>
  );
};

export default QuickStart;
