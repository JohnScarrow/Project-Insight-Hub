import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      login(data.user);
      navigate('/');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleGuestLogin = async () => {
    try {
      setError('');
      // Auto-login guest without password for demo purposes
      const result = await authApi.login('guest@projecthub.com', 'GuestView123!');
      login(result.user);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Guest login failed');
    }
  };

  const handleAdminLogin = () => {
    setEmail('admin@projecthub.com');
    setPassword('AdminPass123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Project Insight Hub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAdminLogin}
            >
              Login as Admin (Full Access)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGuestLogin}
              disabled={loginMutation.isPending}
            >
              Login as Guest (View Only - No Password)
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p><strong>Admin:</strong> admin@projecthub.com / AdminPass123!</p>
            <p><strong>Guest:</strong> One-click login (no password needed)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
