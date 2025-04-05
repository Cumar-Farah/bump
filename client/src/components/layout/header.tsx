import React from 'react';
import { useAuth } from '@/lib/auth-provider';
import { useTheme } from '@/lib/theme-provider';
import AuthToggler from '@/components/ui/auth-toggler';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
  const { user, logoutMutation } = useAuth();
  const { theme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <svg
              className="h-10 w-10 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span className="text-primary font-bold text-2xl ml-2">BumpData</span>
          </Link>
        </div>
        
        {/* Navigation for larger screens */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" className="px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Home
          </Link>
          <Link href="/documentation" className="px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Documentation
          </Link>
          <Link href="/examples" className="px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Examples
          </Link>
          <Link href="/pricing" className="px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Pricing
          </Link>
        </nav>
        
        {/* Right side controls */}
        <div className="flex items-center">
          {!user ? (
            <AuthToggler className="mr-4" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 mr-4">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => logoutMutation.mutate()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-2"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
