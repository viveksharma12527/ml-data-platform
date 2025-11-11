import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, PlayCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'annotator' | 'data_specialist';
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
}

export default function AnnotatorDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch current user
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          setLocation('/login');
          return;
        }

        const userData = await userResponse.json();

        if (userData.role !== 'annotator') {
          setLocation('/specialist/dashboard');
          return;
        }

        setUser(userData);

        // Fetch projects
        const projectsResponse = await fetch('/api/projects', {
          credentials: 'include',
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleStartAnnotation = (projectId: string) => {
    setLocation(`/annotator/annotate/${projectId}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setLocation('/login');
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
  };

  if (isLoading) {
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
                <span className="text-sm font-medium">{user?.name}</span>
                <Avatar className="w-8 h-8" data-testid="avatar-user">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user ? getUserInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">My profile</h1>
              <div className="flex items-center gap-4 mt-6">
                <Button variant="default" data-testid="button-dashboard">Dashboard</Button>
                <Button variant="secondary" data-testid="button-my-projects">My projects</Button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Projects Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Assigned projects For Annotation</h2>
              {projects.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CardContent>
                      <p className="text-muted-foreground">No projects assigned yet.</p>
                    </CardContent>
                  </Card>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                      // Calculate progress (mock for now - we'll implement later)
                      const progress = project.status === 'completed' ? 100
                          : project.status === 'in_progress' ? 50
                              : 0;

                      return (
                          <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-xl">{project.name}</CardTitle>
                              <CardDescription>Progress {progress}%</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Progress value={progress} className="h-2" />
                              <div className="text-sm text-muted-foreground">
                                {project.description || 'No description'}
                              </div>
                              <Button
                                  className="w-full gap-2"
                                  onClick={() => handleStartAnnotation(project.id)}
                                  data-testid={`button-start-annotation-${project.id}`}
                              >
                                <PlayCircle className="w-4 h-4" />
                                Start Annotation
                              </Button>
                            </CardContent>
                          </Card>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>
        </main>

        {/* Sign out at bottom */}
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid="link-sign-out"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
  );
}