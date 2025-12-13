import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users, Shield, User, Trash2 } from 'lucide-react';
import { authService } from '@/services/authService';
import type { User as UserType } from '@/types';
import { format } from 'date-fns';

export default function Admin() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState(authService.getSession());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getUsers();
    setUsers(allUsers);
  };

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    const result = authService.updateUserRole(userId, newRole);
    if (result.success) {
      toast.success(result.message);
      loadUsers();
      setCurrentUser(authService.getSession());
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const result = authService.deleteUser(userId);
    if (result.success) {
      toast.success(result.message);
      loadUsers();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage users and their roles</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage all registered users. Total users: {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    className="flex flex-col xl:flex-row xl:items-center justify-between p-4 rounded-lg border bg-card gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.username}
                          {user.id === currentUser?.userId && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Role:</span>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'admin')}
                          disabled={user.id === currentUser?.userId}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                User
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {user.id !== currentUser?.userId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete user "{user.username}"? This action cannot be undone and will remove all their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm">Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• You can change user roles between User and Admin</p>
            <p>• You cannot delete your own account</p>
            <p>• Deleting a user will remove all their financial data</p>
            <p>• At least one admin account must exist in the system</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
