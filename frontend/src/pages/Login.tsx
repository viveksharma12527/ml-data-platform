import { useState } from 'react';
import { useLocation } from 'wouter';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login } from '@/services/auth';

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login(formData);

      // Login riuscito - reindirizza in base al ruolo
      if (data.role === 'annotator') {
        setLocation('/annotator/dashboard');
      } else if (data.role === 'data_specialist') {
        setLocation('/specialist/dashboard');
      } else {
        throw new Error('Invalid user role');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <AuthLayout
          title="LOGIN"
          subtitle="Sign in to your account"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mostra errori */}
          {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  data-testid="input-email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
              />
            </div>
            <div className="text-right">
              <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                  data-testid="link-forgot-password"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
              data-testid="button-login"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
                type="button"
                onClick={() => setLocation('/register')}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
                data-testid="link-signup"
            >
              Sign up
            </button>
          </div>
        </form>
      </AuthLayout>
  );
}