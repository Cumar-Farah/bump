import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-provider';
import { Redirect } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

type UserData = {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  
  // Only user with ID 1 (testuser) can access this admin page
  if (!user || user.id !== 1) {
    return <Redirect to="/" />;
  }
  
  // Fetch all users
  const { data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ['/api/admin/users'],
  });
  
  return (
    <MainLayout title="Admin Panel" description="User management">
      <div className="container mx-auto p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-red-500 p-4">Error loading users</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.fullName || 'N/A'}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}