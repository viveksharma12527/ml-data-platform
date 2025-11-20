import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          setLocation('/login');
          return;
        }

        const userData = await response.json();

        if (userData.role !== 'admin') {
          // Redirect non-admin users
          if (userData.role === 'annotator') {
            setLocation('/annotator/dashboard');
          } else if (userData.role === 'data_specialist') {
            setLocation('/specialist/dashboard');
          }
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
        setLocation('/login');
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setLocation('/login');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-primary-foreground" />
                <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
              </svg>
            </div>
            <span className="text-lg font-semibold">VT-Annotator</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Hello</span>
              <span className="text-sm font-medium">{user.name}</span>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-muted/30 border-r p-6">
          <h1 className="text-2xl font-bold mb-8">My profile</h1>
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setLocation('/admin/create-account')}
              className={`text-left px-4 py-3 rounded-md transition-colors ${
                location === '/admin/create-account'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => setLocation('/admin/assign-role')}
              className={`text-left px-4 py-3 rounded-md transition-colors ${
                location === '/admin/assign-role'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-muted'
              }`}
            >
              Assign Role
            </button>
          </nav>
          
          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}