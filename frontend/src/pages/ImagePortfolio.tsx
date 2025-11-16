import { useState, useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, ArrowLeft, Image as ImageIcon, Folder, TrendingUp, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PortfolioImageCard } from '@/components/PortfolioImageCard';
import { usePortfolio } from '@/hooks/usePortfolio';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
}

export default function ImagePortfolio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const {
    data,
    isLoading: isPortfolioLoading,
    error: portfolioError,
    filters,
    updateFilters,
    deleteImage,
    loadMore,
  } = usePortfolio();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsUserLoading(true);
      setUserError(null);

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

      // Fetch projects for filter dropdown
      const projectsResponse = await fetch('/api/projects', {
        credentials: 'include',
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }
    } catch (err: any) {
      setUserError(err.message || 'Failed to load data');
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setLocation('/login');
  };

  const handleNavigateToProject = (projectId: string) => {
    setLocation(`/specialist/projects/${projectId}`);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteImage(imageId);
    } catch (error) {
      // Error is handled by the hook
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

  const isLoading = isUserLoading || isPortfolioLoading;
  const error = userError || portfolioError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading portfolio...</p>
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
          {/* Back Button & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/specialist/dashboard')}
                className="gap-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Portfolio Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Image Portfolio</h1>
            <p className="text-muted-foreground">Browse and manage all your images across all projects</p>
          </div>

          {/* Stats Cards */}
          {data?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Total Images</CardDescription>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.stats.totalImages}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Projects</CardDescription>
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.stats.totalProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Annotated Images</CardDescription>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.stats.annotatedImages}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.stats.totalImages > 0
                      ? `${Math.round((data.stats.annotatedImages / data.stats.totalImages) * 100)}%`
                      : '0%'} complete
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={filters.projectId || 'all'}
                onValueChange={(value) => updateFilters({ projectId: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-[200px]" data-testid="select-project-filter">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-') as ['uploadedAt' | 'projectName', 'asc' | 'desc'];
                  updateFilters({ sortBy, sortOrder });
                }}
              >
                <SelectTrigger className="w-[180px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadedAt-desc">Newest First</SelectItem>
                  <SelectItem value="uploadedAt-asc">Oldest First</SelectItem>
                  <SelectItem value="projectName-asc">By Project Name</SelectItem>
                  <SelectItem value="projectName-desc">By Project Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="text-sm">
              {data?.total || 0} total images
            </Badge>
          </div>

          {/* Gallery Section */}
          <div className="space-y-4">
            {data?.images.length === 0 ? (
              <Card className="p-12 text-center">
                <CardContent>
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No images found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filters.projectId
                      ? 'No images in the selected project'
                      : 'Upload some images to your projects to see them here'}
                  </p>
                  <Button onClick={() => setLocation('/specialist/dashboard')}>
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.images.map((image) => (
                    <PortfolioImageCard
                      key={image.id}
                      id={image.id}
                      filename={image.filename}
                      url={image.url}
                      uploadedAt={image.uploadedAt}
                      projectName={image.projectName}
                      projectId={image.projectId}
                      isAnnotated={image.isAnnotated}
                      onDelete={handleDeleteImage}
                      onNavigateToProject={handleNavigateToProject}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {data && data.images.length < data.total && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isPortfolioLoading}
                      data-testid="button-load-more"
                    >
                      {isPortfolioLoading ? 'Loading...' : `Load More (${data.total - data.images.length} remaining)`}
                    </Button>
                  </div>
                )}
              </>
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