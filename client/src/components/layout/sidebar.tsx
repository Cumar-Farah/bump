import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-provider';
import {
  CloudUpload,
  Table,
  ChartBarStacked,
  Brain,
  TrendingUp,
  Code,
  ChartPie,
  FileUp,
  User,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, active }) => {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        active 
          ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground" 
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 mr-2" })}
      {label}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:block">
      <div className="h-full flex flex-col">
        <nav className="flex-1 py-4 px-3 stata-scrollbar overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Data
            </p>
            <NavItem 
              href="/upload" 
              icon={<CloudUpload />} 
              label="Upload Data" 
              active={location === "/upload"}
            />
            <NavItem 
              href="/data" 
              icon={<Table />} 
              label="Data Browser" 
              active={location === "/data"}
            />
            <NavItem 
              href="/statistics" 
              icon={<ChartBarStacked />} 
              label="Summary Statistics" 
              active={location === "/statistics"}
            />
          </div>
          
          <div className="mt-6 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Analysis
            </p>
            <NavItem 
              href="/insights" 
              icon={<Brain />} 
              label="Insights" 
              active={location === "/insights"}
            />
            <NavItem 
              href="/modeling" 
              icon={<TrendingUp />} 
              label="Modeling" 
              active={location === "/modeling"}
            />
            <NavItem 
              href="/commands" 
              icon={<Code />} 
              label="Commands" 
              active={location === "/commands"}
            />
          </div>
          
          <div className="mt-6 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Results
            </p>
            <NavItem 
              href="/results" 
              icon={<BarChart3 />} 
              label="Analysis Results" 
              active={location === "/results"}
            />
            <NavItem 
              href="/visualizations" 
              icon={<ChartPie />} 
              label="Visualizations" 
              active={location === "/visualizations"}
            />
            <NavItem 
              href="/export" 
              icon={<FileUp />} 
              label="Export" 
              active={location === "/export"}
            />
          </div>
          
          {/* Admin section - only show for user with ID 1 (testuser) */}
          {user && user.id === 1 && (
            <div className="mt-6 space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-text-red-500 dark:text-red-400 uppercase tracking-wider">
                Admin
              </p>
              <NavItem 
                href="/admin" 
                icon={<User />} 
                label="User Management" 
                active={location === "/admin"}
              />
            </div>
          )}
        </nav>
        
        {user ? (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => logoutMutation.mutate()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/auth" className="block w-full">
              <Button variant="default" size="sm" className="w-full">Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
