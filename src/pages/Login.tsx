import { useAuth } from '@/context/AuthContext';
import { usersApi, User } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const handleSelect = (user: User) => {
    login(user);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select a User to Log In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div>Loading users...</div>}
          {isError && (
            <div className="text-sm text-red-600">Failed to load users. Ensure /api/users endpoint exists.</div>
          )}
          <div className="space-y-2">
            {users.map((u) => (
              <Button key={u.id} variant="outline" className="w-full justify-start" onClick={() => handleSelect(u)}>
                <span className="font-medium">{u.email}</span>
                {u.name && <span className="ml-2 text-muted-foreground">({u.name})</span>}
              </Button>
            ))}
            {users.length === 0 && !isLoading && !isError && (
              <div className="text-sm text-muted-foreground">No users found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
