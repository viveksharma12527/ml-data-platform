import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Plus, Upload, X, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// todo: remove mock functionality
const mockProjects = [
  { id: 1, name: 'Dog Breed Classification', labels: ['Border Collie', 'Labrador', 'Golden Retriever'], images: 100, annotators: 3, status: 'In Progress' },
  { id: 2, name: 'Car Brand Recognition', labels: ['Toyota', 'Honda', 'Ford'], images: 150, annotators: 2, status: 'Not Started' },
];

export default function SpecialistDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [labels, setLabels] = useState<string[]>(['Dog', 'Cat', 'Bird']);
  const [newLabel, setNewLabel] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleLogout = () => {
    console.log('Logout clicked');
    setLocation('/login');
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
      console.log('Label added:', newLabel);
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
    console.log('Label removed:', label);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    console.log('Files selected:', files.length);
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Creating project:', {
      name: projectName,
      labels,
      files: selectedFiles.length
    });
    
    toast({
      title: 'Success',
      description: `Project "${projectName}" created successfully!`,
    });
    
    setIsCreateDialogOpen(false);
    setProjectName('');
    setSelectedFiles([]);
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
              <span className="text-sm font-medium">Data Specialist</span>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">DS</AvatarFallback>
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
              <h1 className="text-3xl font-bold mb-2">Welcome Data Specialist</h1>
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
                    Set up a new annotation project with labels and images
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
                      data-testid="input-project-name"
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
                        data-testid="input-new-label"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddLabel}
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
                            data-testid={`button-remove-label-${label.toLowerCase()}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Upload Images</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Label 
                        htmlFor="images" 
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                      >
                        Click to upload or drag and drop
                      </Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        data-testid="input-upload-images"
                      />
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="text-sm text-muted-foreground" data-testid="text-files-selected">
                        {selectedFiles.length} file(s) selected
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    data-testid="button-create"
                  >
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {project.images} images • {project.annotators} annotators
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={project.status === 'In Progress' ? 'default' : 'secondary'}
                        data-testid={`badge-status-${project.id}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Labels:</div>
                        <div className="flex flex-wrap gap-2">
                          {project.labels.map((label) => (
                            <Badge key={label} variant="outline">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" data-testid={`button-view-${project.id}`}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-${project.id}`}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
