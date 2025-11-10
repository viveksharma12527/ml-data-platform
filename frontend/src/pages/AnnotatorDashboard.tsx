import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, PlayCircle } from 'lucide-react';

// todo: remove mock functionality
const mockProjects = [
  { id: 1, name: 'Dog Breed', progress: 85, imagesTotal: 100, imagesCompleted: 85 },
  { id: 2, name: 'Car Brand', progress: 0, imagesTotal: 150, imagesCompleted: 0 },
  { id: 3, name: 'Rackets', progress: 10, imagesTotal: 80, imagesCompleted: 8 },
  { id: 4, name: 'Birds', progress: 35, imagesTotal: 120, imagesCompleted: 42 },
];

export default function AnnotatorDashboard() {
  const [, setLocation] = useLocation();

  const handleStartAnnotation = (projectId: number) => {
    console.log('Starting annotation for project:', projectId);
    setLocation(`/annotator/annotate/${projectId}`);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setLocation('/login');
  };

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
              <span className="text-sm font-medium">LeaBorderCollie</span>
              <Avatar className="w-8 h-8" data-testid="avatar-user">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">LC</AvatarFallback>
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

          {/* Projects Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Assigned projects For Annotation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.map((project) => (
                <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>Progress {project.progress}%</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={project.progress} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {project.imagesCompleted} of {project.imagesTotal} images annotated
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
              ))}
            </div>
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
