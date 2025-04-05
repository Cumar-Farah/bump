import React, { useState } from 'react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = "BumpData", 
  description 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleMobileMenu={() => setMobileMenuOpen(true)} />
      
      <div className="flex flex-1 h-[calc(100vh-60px)]">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 max-w-[250px]">
            <div className="h-full">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto stata-scrollbar bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto p-6 max-w-5xl">
            {(title || description) && (
              <div className="mb-8">
                {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>}
                {description && <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
