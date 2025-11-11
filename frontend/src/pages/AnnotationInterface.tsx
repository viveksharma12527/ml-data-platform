import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, LogOut, AlertCircle } from 'lucide-react';
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
}

interface Label {
  id: string;
  projectId: string;
  name: string;
}

interface Image {
  id: string;
  projectId: string;
  filename: string;
  url: string;
}

interface Annotation {
  id: string;
  imageId: string;
  labelId: string;
}

export default function AnnotationInterface() {
  const params = useParams();
  const projectId = params.id || '';
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!userResponse.ok) {
        setLocation('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch project
      const projectResponse = await fetch(`/api/projects/${projectId}`, {
        credentials: 'include',
      });

      if (!projectResponse.ok) {
        throw new Error('Failed to load project');
      }

      const projectData = await projectResponse.json();
      setProject(projectData);

      // Fetch labels
      const labelsResponse = await fetch(`/api/projects/${projectId}/labels`, {
        credentials: 'include',
      });

      if (labelsResponse.ok) {
        const labelsData = await labelsResponse.json();
        setLabels(labelsData);
      }

      // Fetch images
      const imagesResponse = await fetch(`/api/projects/${projectId}/images`, {
        credentials: 'include',
      });

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setImages(imagesData);

        // Load annotations for current image if there are images
        if (imagesData.length > 0) {
          await loadAnnotations(imagesData[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnnotations = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}/annotations`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAnnotations(data);

        // If there's an existing annotation, pre-select it
        if (data.length > 0) {
          setSelectedLabelId(data[0].labelId);
        }
      }
    } catch (err) {
      console.error('Failed to load annotations:', err);
    }
  };

  const handleBack = () => {
    setLocation('/annotator/dashboard');
  };

  const handleLabelSelect = (labelId: string) => {
    setSelectedLabelId(labelId);
  };

  const handleSaveAndNext = async () => {
    if (!selectedLabelId || !user) return;

    const currentImage = images[currentImageIndex];
    if (!currentImage) return;

    setIsSaving(true);
    setError(null);

    try {
      // Create annotation
      const response = await fetch('/api/annotations', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: currentImage.id,
          labelId: selectedLabelId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save annotation');
      }

      // Move to next image
      if (currentImageIndex < images.length - 1) {
        const nextIndex = currentImageIndex + 1;
        setCurrentImageIndex(nextIndex);
        setSelectedLabelId(null);
        await loadAnnotations(images[nextIndex].id);
      } else {
        alert('Annotation complete!');
        setLocation('/annotator/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save annotation');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = async () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedLabelId(null);
      await loadAnnotations(images[prevIndex].id);
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Unsaved progress will be lost.')) {
      setLocation('/annotator/dashboard');
    }
  };

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

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading project...</p>
          </div>
        </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
      <div className="min-h-screen bg-background flex flex-col">
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

        {/* Sidebar & Main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">My profile</h2>
              <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={handleBack}
                  data-testid="button-dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                  variant="secondary"
                  className="w-full justify-start mt-2"
                  data-testid="button-my-projects"
              >
                My projects
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Title & Progress */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{project?.name || 'Project'}</h1>
                  <div className="text-sm text-muted-foreground" data-testid="text-progress">
                    Image {currentImageIndex + 1} of {images.length}
                  </div>
                </div>

                {/* No Images Message */}
                {images.length === 0 ? (
                    <Card className="p-12 text-center">
                      <p className="text-muted-foreground">No images available in this project.</p>
                      <Button className="mt-4" onClick={handleBack}>
                        Back to Dashboard
                      </Button>
                    </Card>
                ) : (
                    <>
                      {/* Image Display */}
                      <Card className="p-8">
                        <div className="flex items-center justify-center bg-muted rounded-lg" style={{ minHeight: '400px' }}>
                          {currentImage && (
                              <img
                                  src={currentImage.url}
                                  alt={currentImage.filename}
                                  className="max-h-[500px] max-w-full object-contain rounded-lg"
                                  data-testid="img-annotation"
                              />
                          )}
                        </div>
                      </Card>

                      {/* Label Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Select Label</h3>
                        {labels.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No labels available for this project.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                              {labels.map((label) => (
                                  <Button
                                      key={label.id}
                                      variant={selectedLabelId === label.id ? 'default' : 'outline'}
                                      className="h-auto py-4 text-base"
                                      onClick={() => handleLabelSelect(label.id)}
                                      disabled={isSaving}
                                      data-testid={`button-label-${label.name.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    {label.name}
                                  </Button>
                              ))}
                            </div>
                        )}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentImageIndex === 0 || isSaving}
                            data-testid="button-back"
                        >
                          Back
                        </Button>

                        <div className="flex gap-4">
                          <Button
                              variant="outline"
                              onClick={handleSaveAndNext}
                              disabled={!selectedLabelId || isSaving}
                              data-testid="button-save-next"
                          >
                            {isSaving ? 'Saving...' : 'Save and Next'}
                          </Button>
                          <Button
                              variant="destructive"
                              onClick={handleExit}
                              disabled={isSaving}
                              data-testid="button-exit"
                          >
                            Exit
                          </Button>
                        </div>
                      </div>
                    </>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Sign out */}
        <div className="border-t p-4">
          <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="link-sign-out"
          >
            Sign out
          </button>
        </div>
      </div>
  );
}