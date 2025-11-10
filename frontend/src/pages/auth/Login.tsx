import { useState } from 'react';
import { useLocation } from 'wouter';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // todo: remove mock functionality - simulate role-based routing
    // For demo, route based on email
    if (formData.email.includes('annotator')) {
      setLocation('/annotator/dashboard');
    } else {
      setLocation('/specialist/dashboard');
    }
  };

  return (
    <AuthLayout 
      title="LOGIN" 
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Username</Label>
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
              data-testid="input-password"
            />
          </div>
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="link-forgot-password"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold"
          data-testid="button-login"
        >
          Login
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <button
            type="button"
            onClick={() => setLocation('/register')}
            className="text-primary hover:underline font-medium"
            data-testid="link-signup"
          >
            Sign up
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
