import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'annotator' | 'data_specialist' | 'admin';
}

export default function AssignRole() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(userId, role);
    setPendingChanges(newPendingChanges);
  };

  const handleConfirm = async (userId: string) => {
    const newRole = pendingChanges.get(userId);
    if (!newRole) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully!',
      });

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole as any } : user
      ));

      // Clear pending change
      const newPendingChanges = new Map(pendingChanges);
      newPendingChanges.delete(userId);
      setPendingChanges(newPendingChanges);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const isRoleSelected = (userId: string, role: string) => {
    const pendingRole = pendingChanges.get(userId);
    if (pendingRole) {
      return pendingRole === role;
    }
    const user = users.find(u => u.id === userId);
    return user?.role === role;
  };

  const hasChanges = (userId: string) => {
    return pendingChanges.has(userId);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <h2 className="text-3xl font-bold mb-2">Assign Roles for Users</h2>
        <p className="text-muted-foreground mb-8">
          Assign the roles of existed users
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">User Name</th>
                <th className="text-center p-4 font-semibold">Data specialist</th>
                <th className="text-center p-4 font-semibold">Annotator</th>
                <th className="text-center p-4 font-semibold">ML Engineer</th>
                <th className="text-center p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={isRoleSelected(user.id, 'data_specialist')}
                        onCheckedChange={() => handleRoleChange(user.id, 'data_specialist')}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={isRoleSelected(user.id, 'annotator')}
                        onCheckedChange={() => handleRoleChange(user.id, 'annotator')}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={isRoleSelected(user.id, 'admin')}
                        onCheckedChange={() => handleRoleChange(user.id, 'admin')}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {hasChanges(user.id) ? (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(user.id)}
                        className="text-primary hover:underline"
                        variant="ghost" // <-- CORRECTED: Changed from "link" to "ghost"
                      >
                        Confirm
                      </Button>
                    ) : (
                      <span className="text-sm text-primary">Confirmed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}