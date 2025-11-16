import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Plus, Upload, X, FolderPlus, AlertCircle, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
}

interface Label {
  id: string;
  name: string;
}

export default function SpecialistDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch current user
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!userResponse.ok) {
        setLocation('/login');
        return;
      }

      const userData = await userResponse.json();

      if (userData.role !== 'data_specialist') {
        setLocation('/annotator/dashboard');
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
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setLocation('/login');
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    if (labels.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one label',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // 1. Create project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription || null,
          status: 'not_started',
        }),
      });

      if (!projectResponse.ok) {
        const data = await projectResponse.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const project = await projectResponse.json();

      // 2. Create labels
      for (const labelName of labels) {
        await fetch(`/api/projects/${project.id}/labels`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: labelName,
          }),
        });
      }

      toast({
        title: 'Success',
        description: `Project "${projectName}" created successfully!`,
      });

      // Reset form
      setIsCreateDialogOpen(false);
      setProjectName('');
      setProjectDescription('');
      setLabels([]);

      // Reload projects
      await loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
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
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user ? getUserInitials(user.name) : 'DS'}
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome {user?.name}</h1>
                <p className="text-muted-foreground">Manage your annotation projects and datasets</p>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-create-project">
                    <FolderPlus className="w-4 h-4" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Set up a new annotation project with labels
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                          id="project-name"
                          placeholder="e.g., Dog Breed Classification"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          disabled={isCreating}
                          data-testid="input-project-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-description">Description (optional)</Label>
                      <Input
                          id="project-description"
                          placeholder="e.g., Dataset for identifying dog breeds"
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          disabled={isCreating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Labels</Label>
                      <div className="flex gap-2">
                        <Input
                            placeholder="Add a label"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                            disabled={isCreating}
                            data-testid="input-new-label"
                        />
                        <Button
                            type="button"
                            onClick={handleAddLabel}
                            disabled={isCreating}
                            data-testid="button-add-label"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {labels.map((label) => (
                            <Badge
                                key={label}
                                variant="secondary"
                                className="gap-1"
                                data-testid={`badge-label-${label.toLowerCase()}`}
                            >
                              {label}
                              <button
                                  onClick={() => handleRemoveLabel(label)}
                                  className="hover:text-destructive"
                                  disabled={isCreating}
                                  data-testid={`button-remove-label-${label.toLowerCase()}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isCreating}
                        data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                        onClick={handleCreateProject}
                        disabled={isCreating}
                        data-testid="button-create"
                    >
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Projects List */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Projects</h2>
              {projects.length === 0 ? (
                  <Card className="p-12 text-center">
                    <CardContent>
                      <FolderPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first project to get started
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create Project
                      </Button>
                    </CardContent>
                  </Card>
              ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                        <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>
                                  {project.description || 'No description'}
                                </CardDescription>
                              </div>
                              <Badge
                                  variant={getStatusBadgeVariant(project.status) as any}
                                  data-testid={`badge-status-${project.id}`}
                              >
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2 pt-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLocation(`/specialist/projects/${project.id}`)}
                                  data-testid={`button-view-${project.id}`}
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </main>

        {/* Sign out */}
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